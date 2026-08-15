#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
import readline from "node:readline";

const adapter = { id: "replace-with-node-adapter-id", version: "0.0.0", topology: "replace-with-topology" };
const failureCodes = [
  "profile-version-unsupported", "profile-root-mismatch", "required-feature-unsupported",
  "identity-unresolved", "authority-unresolved", "authority-expired", "authority-revoked",
  "authority-amplification", "fact-cut-unavailable", "causal-gap", "payload-digest-mismatch",
  "idempotency-conflict", "conflict-visible", "disclosure-insufficient", "required-field-withheld",
  "completion-unproved", "local-policy-rejected",
];
const roots = [
  "sha256:d8c212284e53d8e7dacbca8acdb0d7d8d8ee300e1f55233629a7dd006b6e3bc6",
  "sha256:dcea56f3624a752070c3a06f7636a0605996d2cd5ea1b6581f935367e07c268c",
];

function capabilities(hubId, authorityLetter) {
  return {
    $schema: "https://kfd.libkungfu.dev/schemas/kfd-agent-hub/capabilities.schema.json",
    schemaVersion: 1,
    contract: "kfd-agent-hub-capabilities",
    identity: { hubId, nodeId: `${hubId}-node`, actorId: `${hubId}-actor` },
    profileVersions: ["0.1.0-alpha.1"],
    requiredFeatures: ["transport-receipts"],
    optionalFeatures: [],
    operations: ["capability-advertisement", "responsibility-proposal", "fact-admission", "supersession", "completion-assessment", "warrant-revocation"],
    topologies: ["local-peer"],
    disclosureModes: ["full", "partial", "redacted", "reference-only", "intentionally-withheld"],
    failureCodes,
    bindings: [{ id: "jsonl-stdio", mediaTypes: ["application/json"], authentication: "local-process", transportReceipts: true, duplicateDelivery: "at-least-once" }],
    limits: { maxInlineBytes: 65_536, maxEnvelopeBytes: 1_048_576 },
    authorityRoots: [`sha256:${authorityLetter.repeat(64)}`],
    issuedAt: "2026-08-15T00:00:00.000Z",
  };
}

function handshake(requestId) {
  return {
    schemaVersion: 1,
    contract: "kfd.agent-hub-adapter-response/v1",
    requestId,
    adapter,
    status: "accepted",
    code: "adapter-ready",
    verdict: "not-applicable",
    hubs: ["starter-hub-a", "starter-hub-b"].map((hubId, index) => ({
      hubId,
      capabilities: capabilities(hubId, index === 0 ? "a" : "b"),
      capabilityRoot: roots[index],
    })),
    observations: { binding: "jsonl-stdio/v1", scope: "evidence-valid-negative-starter" },
  };
}

function evaluate(request) {
  // Replace this fail-closed placeholder with product-owned Hub behavior.
  return {
    schemaVersion: 1,
    contract: "kfd.agent-hub-adapter-response/v1",
    requestId: request.requestId,
    adapter,
    status: "error",
    code: "scenario-not-implemented",
    verdict: "not-applicable",
    observations: { scenario: request.input?.scenario ?? "unknown", scope: "hub-semantics-not-implemented" },
  };
}

const lines = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
lines.on("line", (line) => {
  const request = JSON.parse(line);
  const response = request.operation === "handshake" ? handshake(request.requestId) : evaluate(request);
  process.stdout.write(`${JSON.stringify(response)}\n`);
});
