#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
import readline from "node:readline";

const ADAPTER = { id: "replace-with-your-system", version: "0.1.0" };
const KNOWN_PAIRS = new Set([
  "work-version",
  "authority-revocation",
  "causal-history",
  "retry-identity",
  "recovery-drift",
  "accepted-completion",
]);

function response(request) {
  const envelope = {
    schemaVersion: 1,
    contract: "kfd.delegated-work-adapter-response/v1",
    requestId: typeof request?.requestId === "string" ? request.requestId : "invalid-request",
    adapter: ADAPTER,
  };
  if (request?.operation === "handshake") {
    return { ...envelope, status: "accepted", code: "adapter-ready" };
  }
  const pairId = request?.input?.pairId;
  const known = request?.operation === "evaluate" && KNOWN_PAIRS.has(pairId);
  return {
    ...envelope,
    status: "completed",
    code: known ? "scenario-not-implemented" : "unknown-operation-or-pair",
    decision: { mayAdvance: false, disposition: "reject" },
    authoritativeSources: [{ object: "replace-with-product-authority", identity: "unasserted", revision: "unasserted" }],
    enforcementPoint: "not-implemented",
    survivesExecutorReplacement: false,
    replacementContinuityMechanism: "not-implemented",
    humanReconstructionRequired: true
  };
}

const lines = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
for await (const line of lines) {
  if (!line.trim()) continue;
  process.stdout.write(`${JSON.stringify(response(JSON.parse(line)))}\n`);
}
