#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { exactByteRoot, semanticRoot } from "./self-conformance-contract.mjs";
import { adapterCommand, executeJsonl, regularBytes } from "./jsonl-adapter-runner.mjs";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const resolvePackage = (...parts) => path.join(packageRoot, ...parts);
function regular(filePath) {
  return regularBytes(filePath);
}

function options(args) {
  const value = { adapterArgs: [], timeoutMs: 20_000, quiet: false };
  for (let index = 0; index < args.length; index += 1) {
    const flag = args[index];
    const next = args[index + 1];
    if (flag === "--adapter" && next) value.adapter = next, index += 1;
    else if (flag === "--adapter-arg" && next) value.adapterArgs.push(next), index += 1;
    else if (flag === "--adapter-source-commit" && next) value.sourceCommit = next, index += 1;
    else if (flag === "--output" && next) value.output = next, index += 1;
    else if (flag === "--timeout-ms" && next) value.timeoutMs = Number(next), index += 1;
    else if (flag === "--quiet") value.quiet = true;
    else throw new Error(`unsupported or incomplete argument: ${flag}`);
  }
  if (!value.adapter) throw new Error("agent-hub test requires --adapter");
  if (!value.output) throw new Error("agent-hub test requires --output");
  if (!Number.isSafeInteger(value.timeoutMs) || value.timeoutMs < 100) throw new Error("--timeout-ms must be an integer of at least 100");
  return value;
}

export async function runAgentHubTest(rawArgs, { quiet = false } = {}) {
  const selected = options(rawArgs);
  quiet ||= selected.quiet;
  const manifestBytes = regular(resolvePackage("profiles", "agent-hub", "manifest.json"));
  const vectorBytes = regular(resolvePackage("profiles", "agent-hub", "vectors", "hub-20.json"));
  const protocolBytes = regular(resolvePackage("protocols", "agent-hub", "manifest.json"));
  const inventoryBytes = regular(resolvePackage("profiles", "agent-hub", "failure-codes.json"));
  const runtimeBytes = regular(resolvePackage("profiles", "agent-runtime", "manifest.json"));
  const packageBytes = regular(resolvePackage("package.json"));
  const releaseBytes = regular(resolvePackage("kfd.release.json"));
  const verifierBytes = regular(resolvePackage("scripts", "agent-hub-report-verifier.mjs"));
  const manifest = JSON.parse(manifestBytes);
  const registry = JSON.parse(vectorBytes);
  const packageJson = JSON.parse(packageBytes);
  assert.equal(manifest.contract, "kfd.agent-hub-conformance-manifest/v1");
  assert.equal(registry.contract, "kfd.agent-hub-vector-registry/v1");
  assert.equal(registry.vectors.length, 20);
  assert.equal(manifest.protocol.manifestDigest, exactByteRoot(protocolBytes));
  assert.equal(manifest.suite.vectorRoot, exactByteRoot(vectorBytes));
  assert.equal(manifest.failureInventory.root, exactByteRoot(inventoryBytes));
  assert.equal(manifest.runtimeDependency.manifestDigest, exactByteRoot(runtimeBytes));
  const adapter = adapterCommand(selected.adapter, selected.adapterArgs);
  const handshakeRequest = { schemaVersion: 1, contract: "kfd.agent-hub-adapter-request/v1", requestId: "handshake", operation: "handshake", input: { profile: `${manifest.protocol.id}@${manifest.protocol.version}`, profileManifestDigest: manifest.protocol.manifestDigest, suiteRoot: manifest.suite.vectorRoot, minimumHubCount: 2 } };
  const vectorRequests = registry.vectors.map((entry) => ({ schemaVersion: 1, contract: "kfd.agent-hub-adapter-request/v1", requestId: entry.id, operation: "evaluate", input: { category: entry.category, scenario: entry.request.scenario, input: entry.request.input } }));
  const startedAt = new Date().toISOString();
  const responses = await executeJsonl(adapter, [handshakeRequest, ...vectorRequests], selected.timeoutMs, { offlineEnvironment: { KFD_AGENT_HUB_OFFLINE: "1" } });
  const finishedAt = new Date().toISOString();
  if (responses.length !== 21) throw new Error(`adapter returned ${responses.length} responses; expected 21`);
  const byId = new Map();
  for (const response of responses) {
    if (response.schemaVersion !== 1 || response.contract !== "kfd.agent-hub-adapter-response/v1" || typeof response.requestId !== "string") throw new Error("adapter response envelope is invalid");
    if (byId.has(response.requestId)) throw new Error(`adapter repeated response ${response.requestId}`);
    byId.set(response.requestId, response);
  }
  const handshake = byId.get("handshake");
  if (!handshake || handshake.status !== "accepted" || handshake.code !== "adapter-ready" || !Array.isArray(handshake.hubs) || handshake.hubs.length < 2) throw new Error("dual-Hub adapter handshake failed");
  const results = registry.vectors.map((entry) => {
    const response = byId.get(entry.id);
    const actual = response ? { status: response.status, code: response.code, verdict: response.verdict } : { status: "missing", code: "adapter-response-missing", verdict: "not-applicable" };
    const passed = actual.status === entry.expect.status && actual.code === entry.expect.code && actual.verdict === entry.expect.verdict;
    return { id: entry.id, category: entry.category, status: passed ? "pass" : "fail", expected: entry.expect, actual, response: response ?? {}, responseRoot: semanticRoot(response ?? {}) };
  });
  const transcript = [{ request: handshakeRequest, response: handshake }, ...vectorRequests.map((request) => ({ request, response: byId.get(request.requestId) ?? null }))];
  const categories = Object.fromEntries([...new Set(registry.vectors.map(({ category }) => category))].sort().map((category) => {
    const rows = results.filter((entry) => entry.category === category); const passed = rows.filter((entry) => entry.status === "pass").length;
    return [category, { total: rows.length, passed, failed: rows.length - passed }];
  }));
  const passed = results.filter((entry) => entry.status === "pass").length;
  const capabilities = handshake.hubs.map((hub) => ({ hubId: hub.hubId, root: hub.capabilityRoot, document: hub.capabilities }));
  const report = {
    schemaVersion: 1, contract: "kfd.agent-hub-report/v1",
    sourceCut: { repository: "kungfu-systems/kfd", package: packageJson.name, packageVersion: packageJson.version, packageManifestDigest: exactByteRoot(packageBytes), releaseAnchorDigest: exactByteRoot(releaseBytes) },
    profile: { id: manifest.profile.id, version: manifest.profile.version, manifestDigest: exactByteRoot(manifestBytes) },
    protocol: { id: manifest.protocol.id, version: manifest.protocol.version, manifestDigest: manifest.protocol.manifestDigest },
    suite: { id: manifest.suite.id, version: manifest.suite.version, vectorCount: 20, vectorRoot: manifest.suite.vectorRoot, inventoryRoot: exactByteRoot(inventoryBytes) },
    verifier: { contract: "kfd.agent-hub-report-verifier/v1", artifactDigest: exactByteRoot(verifierBytes), failureInventoryRoot: manifest.failureInventory.root },
    adapter: { id: handshake.adapter.id, version: handshake.adapter.version, topology: handshake.adapter.topology, artifactDigest: adapter.artifactDigest, ...(selected.sourceCommit ? { sourceCommit: selected.sourceCommit } : {}), handshake, handshakeRoot: semanticRoot(handshake) },
    capabilities,
    platform: { os: os.platform(), arch: os.arch(), runtime: `node-${process.versions.node}` },
    execution: { startedAt, finishedAt, offline: true, requestCount: 21, transcriptRoot: semanticRoot(transcript), resultRoot: semanticRoot(results) },
    coverage: { total: 20, passed, failed: 20 - passed, categories },
    valid: passed === 20, qualifying: false, certification: false, results,
    residualRisk: ["The fixed suite is finite and does not prove complete interoperability.", "A passing report binds only the named adapter artifact, capability documents, package cut, platform, and execution.", "Offline verification detects report drift but does not independently attest the process execution.", "This experimental profile is not KFD certification, a security assessment, or production fitness evidence."],
  };
  const output = path.resolve(selected.output);
  if (!fs.existsSync(path.dirname(output))) throw new Error(`output parent does not exist: ${path.dirname(output)}`);
  fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`, { flag: "wx" });
  if (!quiet) console.log([
    `Behavior: ${passed}/20 (${report.valid ? "conforming" : "not conforming"})`,
    `Evidence: report written; verify separately -> ${output}`,
    "Authority: qualifying=false; certification=false",
  ].join("\n"));
  return report.valid ? 0 : 1;
}

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args[0] !== "test" || args[1] !== "agent-hub") { console.error("usage: node scripts/agent-hub-runner.mjs test agent-hub --adapter <path> --output <report.json> [--adapter-arg <arg>] [--adapter-source-commit <sha>] [--timeout-ms <ms>]"); process.exitCode = 2; }
  else runAgentHubTest(args.slice(2)).then((code) => { process.exitCode = code; }).catch((error) => { console.error(`kfd agent-hub runner: ${error.message}`); process.exitCode = 2; });
}
