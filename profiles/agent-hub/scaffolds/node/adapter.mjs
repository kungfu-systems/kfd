#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
import readline from "node:readline";

const adapter = { id: "replace-with-node-adapter-id", version: "0.0.0", topology: "replace-with-topology" };
const roots = [`sha256:${"a".repeat(64)}`, `sha256:${"b".repeat(64)}`];

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
      capabilities: { schemaVersion: 1, contract: "kfd-agent-hub-capabilities", identity: { hubId } },
      capabilityRoot: roots[index],
    })),
    observations: { binding: "jsonl-stdio/v1", scope: "starter-envelope-smoke-only" },
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
    observations: { scenario: request.input?.scenario ?? "unknown", scope: "starter-envelope-smoke-only" },
  };
}

const lines = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
lines.on("line", (line) => {
  const request = JSON.parse(line);
  const response = request.operation === "handshake" ? handshake(request.requestId) : evaluate(request);
  process.stdout.write(`${JSON.stringify(response)}\n`);
});
