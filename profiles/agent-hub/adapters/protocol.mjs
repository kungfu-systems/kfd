// SPDX-License-Identifier: Apache-2.0
import crypto from "node:crypto";
import readline from "node:readline";

export const profileVersion = "0.1.0-alpha.1";
export const failureCodes = [
  "profile-version-unsupported", "profile-root-mismatch", "required-feature-unsupported",
  "identity-unresolved", "authority-unresolved", "authority-expired", "authority-revoked",
  "authority-amplification", "fact-cut-unavailable", "causal-gap", "payload-digest-mismatch",
  "idempotency-conflict", "conflict-visible", "disclosure-insufficient", "required-field-withheld",
  "completion-unproved", "local-policy-rejected",
];

export function canonical(value) {
  if (value === null || typeof value === "boolean" || typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
}

export function root(value) {
  return `sha256:${crypto.createHash("sha256").update(`${canonical(value)}\n`).digest("hex")}`;
}

export function capability(hubId, topology) {
  return {
    $schema: "https://kfd.libkungfu.dev/schemas/kfd-agent-hub/capabilities.schema.json",
    schemaVersion: 1,
    contract: "kfd-agent-hub-capabilities",
    identity: { hubId, nodeId: `${hubId}-node`, actorId: `${hubId}-actor` },
    profileVersions: [profileVersion],
    requiredFeatures: ["transport-receipts"],
    optionalFeatures: ["offline-reconnect"],
    operations: ["capability-advertisement", "responsibility-proposal", "fact-admission", "supersession", "completion-assessment", "warrant-revocation"],
    topologies: [topology],
    disclosureModes: ["full", "partial", "redacted", "reference-only", "intentionally-withheld"],
    failureCodes,
    bindings: [{ id: "jsonl-stdio", mediaTypes: ["application/json"], authentication: "local-process", transportReceipts: true, duplicateDelivery: "at-least-once" }],
    limits: { maxInlineBytes: 65536, maxEnvelopeBytes: 1048576 },
    authorityRoots: [`sha256:${(hubId === "hub-alpha" ? "a" : "b").repeat(64)}`],
    issuedAt: "2026-07-22T00:00:00.000Z",
  };
}

export function handshake(adapter) {
  const documents = [capability("hub-alpha", adapter.topology), capability("hub-beta", adapter.topology)];
  return {
    schemaVersion: 1,
    contract: "kfd.agent-hub-adapter-response/v1",
    requestId: "handshake",
    adapter,
    status: "accepted",
    code: "adapter-ready",
    verdict: "not-applicable",
    hubs: documents.map((capabilities) => ({ hubId: capabilities.identity.hubId, capabilities, capabilityRoot: root(capabilities) })),
    observations: { binding: "jsonl-stdio/v1", minimumHubCount: 2 },
  };
}

export function response(adapter, request, outcome) {
  return { schemaVersion: 1, contract: "kfd.agent-hub-adapter-response/v1", requestId: request.requestId, adapter, ...outcome, observations: { scenario: request.input.scenario } };
}

export function serve(handler) {
  const lines = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
  lines.on("line", (line) => {
    const request = JSON.parse(line);
    const value = handler(request);
    process.stdout.write(`${JSON.stringify(value)}\n`);
  });
}
