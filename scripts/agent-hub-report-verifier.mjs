#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rootPattern = /^sha256:[a-f0-9]{64}$/u;
const placeholderPattern = /^sha256:0{64}$/u;
const sha256 = (bytes) => `sha256:${crypto.createHash("sha256").update(bytes).digest("hex")}`;
function canonical(value) {
  if (value === null || typeof value === "boolean" || typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number") {
    assert.equal(Number.isSafeInteger(value) && value >= 0, true, "canonical numbers must be non-negative safe integers");
    return String(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  assert.equal(typeof value, "object", "canonical JSON value");
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
}
const semanticRoot = (value) => sha256(Buffer.from(`${canonical(value)}\n`));
function regular(filePath) {
  const stat = fs.lstatSync(filePath);
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`${filePath} must be a regular file, not a symlink`);
  return fs.readFileSync(filePath);
}
const packaged = (...parts) => regular(path.join(packageRoot, ...parts));

function verifyCapability(document, hubId, protocol) {
  return document?.schemaVersion === 1 && document?.contract === "kfd-agent-hub-capabilities" &&
    document?.identity?.hubId === hubId && document?.profileVersions?.includes(protocol.version) &&
    Array.isArray(document.operations) && document.operations.length >= 1 &&
    Array.isArray(document.topologies) && document.topologies.length >= 1 &&
    Array.isArray(document.disclosureModes) && new Set(document.disclosureModes).size >= 5 &&
    Array.isArray(document.failureCodes) && document.failureCodes.length >= 17 &&
    Array.isArray(document.bindings) && document.bindings.every(({ transportReceipts }) => transportReceipts === true) &&
    Array.isArray(document.authorityRoots) && document.authorityRoots.length >= 1 && document.authorityRoots.every((entry) => rootPattern.test(entry));
}

export function verifyAgentHubReport(report, { adapterPath } = {}) {
  const manifestBytes = packaged("profiles", "agent-hub", "manifest.json");
  const protocolBytes = packaged("protocols", "agent-hub", "manifest.json");
  const vectorBytes = packaged("profiles", "agent-hub", "vectors", "hub-20.json");
  const inventoryBytes = packaged("profiles", "agent-hub", "failure-codes.json");
  const packageBytes = packaged("package.json");
  const releaseBytes = packaged("kfd.release.json");
  const verifierBytes = packaged("scripts", "agent-hub-report-verifier.mjs");
  const manifest = JSON.parse(manifestBytes);
  const registry = JSON.parse(vectorBytes);
  const packageJson = JSON.parse(packageBytes);
  const checks = [];
  const issues = [];
  const check = (id, passed, code, detail) => {
    checks.push({ id, passed, code: passed ? "ok" : code });
    if (!passed) issues.push({ code, detail });
  };
  check("report-contract", report?.schemaVersion === 1 && report?.contract === "kfd.agent-hub-report/v1", "report-contract-invalid", "report must use the exact v1 contract");
  check("source-cut", report?.sourceCut?.repository === "kungfu-systems/kfd" && report?.sourceCut?.package === packageJson.name && report?.sourceCut?.packageVersion === packageJson.version && report?.sourceCut?.packageManifestDigest === sha256(packageBytes) && report?.sourceCut?.releaseAnchorDigest === sha256(releaseBytes), "report-contract-invalid", "sourceCut must bind the installed package and release anchor");
  check("profile-root", report?.profile?.id === manifest.profile.id && report?.profile?.version === manifest.profile.version && report?.profile?.manifestDigest === sha256(manifestBytes), "profile-manifest-digest-mismatch", "profile coordinate or manifest digest drifted");
  check("protocol-root", report?.protocol?.id === manifest.protocol.id && report?.protocol?.version === manifest.protocol.version && report?.protocol?.manifestDigest === sha256(protocolBytes) && manifest.protocol.manifestDigest === sha256(protocolBytes), "protocol-manifest-digest-mismatch", "protocol manifest digest drifted");
  check("suite-root", report?.suite?.id === manifest.suite.id && report?.suite?.version === manifest.suite.version && report?.suite?.vectorCount === 20 && report?.suite?.vectorRoot === sha256(vectorBytes) && manifest.suite.vectorRoot === sha256(vectorBytes), "suite-vector-root-mismatch", "fixed vector registry drifted");
  check("inventory-root", report?.suite?.inventoryRoot === sha256(inventoryBytes) && report?.verifier?.failureInventoryRoot === sha256(inventoryBytes) && manifest.failureInventory.root === sha256(inventoryBytes), "failure-inventory-root-mismatch", "failure inventory root drifted");
  check("verifier-artifact", report?.verifier?.contract === "kfd.agent-hub-report-verifier/v1" && report?.verifier?.artifactDigest === sha256(verifierBytes), "report-contract-invalid", "verifier artifact coordinate drifted");
  const noPlaceholder = !JSON.stringify(manifest).includes(`sha256:${"0".repeat(64)}`) && manifest.surfaces.length >= 12 && manifest.surfaces.every(({ digest }) => rootPattern.test(digest) && !placeholderPattern.test(digest));
  check("manifest-closure", noPlaceholder, "profile-manifest-digest-mismatch", "manifest closure contains a placeholder or too few rooted surfaces");
  const handshake = report?.adapter?.handshake;
  check("adapter-handshake", handshake?.schemaVersion === 1 && handshake?.contract === "kfd.agent-hub-adapter-response/v1" && handshake?.requestId === "handshake" && handshake?.status === "accepted" && handshake?.code === "adapter-ready" && handshake?.verdict === "not-applicable" && handshake?.adapter?.id === report?.adapter?.id && handshake?.adapter?.version === report?.adapter?.version && handshake?.adapter?.topology === report?.adapter?.topology && report?.adapter?.handshakeRoot === semanticRoot(handshake), "adapter-handshake-invalid", "adapter handshake or root is invalid");
  const capabilities = Array.isArray(report?.capabilities) ? report.capabilities : [];
  const capabilityIds = capabilities.map(({ hubId }) => hubId);
  check("dual-hub-capabilities", capabilities.length >= 2 && new Set(capabilityIds).size === capabilityIds.length && capabilities.every(({ hubId, root, document }) => root === semanticRoot(document) && verifyCapability(document, hubId, report.protocol)), "capability-document-invalid", "at least two unique rooted capability documents are required");
  const handshakeHubs = Array.isArray(handshake?.hubs) ? handshake.hubs : [];
  check("capability-handshake-roots", handshakeHubs.length === capabilities.length && handshakeHubs.every((hub) => capabilities.some((entry) => entry.hubId === hub.hubId && entry.root === hub.capabilityRoot && canonical(entry.document) === canonical(hub.capabilities))), "capability-root-mismatch", "report capabilities must match handshake documents and roots");
  const results = Array.isArray(report?.results) ? report.results : [];
  const ids = results.map(({ id }) => id);
  check("result-closure", results.length === 20 && new Set(ids).size === 20 && registry.vectors.every(({ id }) => ids.includes(id)), "suite-result-closure", "report must contain each fixed vector exactly once");
  for (const entry of registry.vectors) {
    const result = results.find(({ id }) => id === entry.id);
    if (!result) continue;
    check(`expectation:${entry.id}`, canonical(result.expected) === canonical(entry.expect), "suite-expectation-drift", `${entry.id} expected outcome drifted`);
    const response = result.response;
    check(`response-envelope:${entry.id}`, response?.schemaVersion === 1 && response?.contract === "kfd.agent-hub-adapter-response/v1" && response?.requestId === entry.id && response?.adapter?.id === report?.adapter?.id && response?.adapter?.version === report?.adapter?.version && response?.adapter?.topology === report?.adapter?.topology, "report-contract-invalid", `${entry.id} adapter response envelope drifted`);
    check(`response-root:${entry.id}`, result.responseRoot === semanticRoot(response), "adapter-response-root-mismatch", `${entry.id} response root drifted`);
    const actual = { status: response?.status, code: response?.code, verdict: response?.verdict };
    check(`actual:${entry.id}`, canonical(result.actual) === canonical(actual), "suite-outcome-mismatch", `${entry.id} actual outcome does not match its response`);
    const passed = canonical(actual) === canonical(entry.expect);
    check(`outcome:${entry.id}`, result.status === (passed ? "pass" : "fail"), "suite-outcome-mismatch", `${entry.id} pass/fail status drifted`);
  }
  const expectedHandshakeRequest = { schemaVersion: 1, contract: "kfd.agent-hub-adapter-request/v1", requestId: "handshake", operation: "handshake", input: { profile: `${manifest.protocol.id}@${manifest.protocol.version}`, profileManifestDigest: manifest.protocol.manifestDigest, suiteRoot: manifest.suite.vectorRoot, minimumHubCount: 2 } };
  const expectedRequests = registry.vectors.map((entry) => ({ schemaVersion: 1, contract: "kfd.agent-hub-adapter-request/v1", requestId: entry.id, operation: "evaluate", input: { category: entry.category, scenario: entry.request.scenario, input: entry.request.input } }));
  const byId = new Map(results.map((entry) => [entry.id, entry.response]));
  const transcript = [{ request: expectedHandshakeRequest, response: handshake }, ...expectedRequests.map((request) => ({ request, response: byId.get(request.requestId) ?? null }))];
  check("result-root", report?.execution?.resultRoot === semanticRoot(results), "suite-result-root-mismatch", "result root drifted");
  check("transcript-root", report?.execution?.transcriptRoot === semanticRoot(transcript), "suite-transcript-root-mismatch", "transcript root drifted");
  const passedCount = results.filter(({ status }) => status === "pass").length;
  const categories = Object.fromEntries([...new Set(registry.vectors.map(({ category }) => category))].sort().map((category) => {
    const rows = results.filter((entry) => entry.category === category); const passed = rows.filter((entry) => entry.status === "pass").length;
    return [category, { total: rows.length, passed, failed: rows.length - passed }];
  }));
  check("coverage", report?.coverage?.total === 20 && report?.coverage?.passed === passedCount && report?.coverage?.failed === 20 - passedCount && canonical(report?.coverage?.categories) === canonical(categories), "suite-result-closure", "coverage summary drifted");
  check("scope", report?.execution?.offline === true && report?.execution?.requestCount === 21 && report?.qualifying === false && report?.certification === false, "scope-widening", "report widened its experimental non-certification boundary");
  check("declared-validity", report?.valid === (passedCount === 20), "report-validity-mismatch", "declared validity does not match fixed outcomes");
  if (adapterPath) check("adapter-artifact", report?.adapter?.artifactDigest === sha256(regular(path.resolve(adapterPath))), "adapter-artifact-digest-mismatch", "adapter bytes do not match the report artifact digest");
  const valid = issues.length === 0;
  return { schemaVersion: 1, contract: "kfd.agent-hub-report-verifier/v1", valid, reportDigest: semanticRoot(report), checks, issues, adapterArtifactChecked: Boolean(adapterPath) };
}

export function runAgentHubReportVerifier(args) {
  let reportPath;
  let adapterPath;
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === "--json") continue;
    if (args[index] === "--adapter" && args[index + 1]) adapterPath = args[++index];
    else if (!reportPath) reportPath = args[index];
    else throw new Error(`unsupported argument: ${args[index]}`);
  }
  if (!reportPath) throw new Error("agent-hub-report verification requires a report path");
  const report = JSON.parse(regular(path.resolve(reportPath)).toString("utf8"));
  const result = verifyAgentHubReport(report, { adapterPath });
  console.log(JSON.stringify(result));
  return result.valid ? 0 : 1;
}

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  try { process.exitCode = runAgentHubReportVerifier(process.argv.slice(2)); }
  catch (error) { console.error(`kfd agent-hub report verifier: ${error.message}`); process.exitCode = 2; }
}
