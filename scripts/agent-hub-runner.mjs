#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const resolvePackage = (...parts) => path.join(packageRoot, ...parts);
const sha256 = (bytes) => `sha256:${crypto.createHash("sha256").update(bytes).digest("hex")}`;
function canonical(value) {
  if (value === null || typeof value === "boolean" || typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number") {
    assert.equal(Number.isSafeInteger(value) && value >= 0, true, "canonical numbers must be non-negative safe integers");
    return String(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
}
const semanticRoot = (value) => sha256(Buffer.from(`${canonical(value)}\n`));
function regular(filePath) {
  const stat = fs.lstatSync(filePath);
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`${filePath} must be a regular file, not a symlink`);
  return fs.readFileSync(filePath);
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

function adapterCommand(adapter, adapterArgs) {
  const absolute = path.resolve(adapter);
  const bytes = regular(absolute);
  if ([".js", ".mjs", ".cjs"].includes(path.extname(absolute))) {
    return { command: process.execPath, args: [absolute, ...adapterArgs], artifactDigest: sha256(bytes) };
  }
  if (path.extname(absolute) === ".py") {
    return { command: process.env.PYTHON || "python3", args: [absolute, ...adapterArgs], artifactDigest: sha256(bytes) };
  }
  return { command: absolute, args: adapterArgs, artifactDigest: sha256(bytes) };
}

function execute(command, requests, timeoutMs) {
  return new Promise((resolve, reject) => {
    const child = spawn(command.command, command.args, { cwd: process.cwd(), env: { ...process.env, KFD_AGENT_HUB_OFFLINE: "1" }, stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; child.kill("SIGKILL"); }, timeoutMs);
    child.stdout.setEncoding("utf8"); child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => { stdout += chunk; }); child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", (error) => { clearTimeout(timer); reject(error); });
    child.on("close", (code, signal) => {
      clearTimeout(timer);
      if (timedOut) return reject(new Error(`adapter timed out after ${timeoutMs}ms`));
      if (code !== 0) return reject(new Error(`adapter exited with code ${code ?? "null"} signal ${signal ?? "none"}: ${stderr.trim()}`));
      if (stderr.trim()) return reject(new Error(`adapter wrote to stderr: ${stderr.trim()}`));
      try { resolve(stdout.split("\n").filter(Boolean).map((line) => JSON.parse(line))); }
      catch (error) { reject(new Error(`adapter emitted invalid JSONL: ${error.message}`)); }
    });
    for (const request of requests) child.stdin.write(`${JSON.stringify(request)}\n`);
    child.stdin.end();
  });
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
  assert.equal(manifest.protocol.manifestDigest, sha256(protocolBytes));
  assert.equal(manifest.suite.vectorRoot, sha256(vectorBytes));
  assert.equal(manifest.failureInventory.root, sha256(inventoryBytes));
  assert.equal(manifest.runtimeDependency.manifestDigest, sha256(runtimeBytes));
  const adapter = adapterCommand(selected.adapter, selected.adapterArgs);
  const handshakeRequest = { schemaVersion: 1, contract: "kfd.agent-hub-adapter-request/v1", requestId: "handshake", operation: "handshake", input: { profile: `${manifest.protocol.id}@${manifest.protocol.version}`, profileManifestDigest: manifest.protocol.manifestDigest, suiteRoot: manifest.suite.vectorRoot, minimumHubCount: 2 } };
  const vectorRequests = registry.vectors.map((entry) => ({ schemaVersion: 1, contract: "kfd.agent-hub-adapter-request/v1", requestId: entry.id, operation: "evaluate", input: { category: entry.category, scenario: entry.request.scenario, input: entry.request.input } }));
  const startedAt = new Date().toISOString();
  const responses = await execute(adapter, [handshakeRequest, ...vectorRequests], selected.timeoutMs);
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
    sourceCut: { repository: "kungfu-systems/kfd", package: packageJson.name, packageVersion: packageJson.version, packageManifestDigest: sha256(packageBytes), releaseAnchorDigest: sha256(releaseBytes) },
    profile: { id: manifest.profile.id, version: manifest.profile.version, manifestDigest: sha256(manifestBytes) },
    protocol: { id: manifest.protocol.id, version: manifest.protocol.version, manifestDigest: manifest.protocol.manifestDigest },
    suite: { id: manifest.suite.id, version: manifest.suite.version, vectorCount: 20, vectorRoot: manifest.suite.vectorRoot, inventoryRoot: sha256(inventoryBytes) },
    verifier: { contract: "kfd.agent-hub-report-verifier/v1", artifactDigest: sha256(verifierBytes), failureInventoryRoot: manifest.failureInventory.root },
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
  if (!quiet) console.log(`KFD Agent Hub 20: ${report.valid ? "pass" : "fail"} (${passed}/20) -> ${output}`);
  return report.valid ? 0 : 1;
}

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args[0] !== "test" || args[1] !== "agent-hub") { console.error("usage: node scripts/agent-hub-runner.mjs test agent-hub --adapter <path> --output <report.json> [--adapter-arg <arg>] [--adapter-source-commit <sha>] [--timeout-ms <ms>]"); process.exitCode = 2; }
  else runAgentHubTest(args.slice(2)).then((code) => { process.exitCode = code; }).catch((error) => { console.error(`kfd agent-hub runner: ${error.message}`); process.exitCode = 2; });
}
