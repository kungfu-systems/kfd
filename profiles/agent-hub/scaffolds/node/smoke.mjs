// SPDX-License-Identifier: Apache-2.0
import assert from "node:assert/strict";
import fs from "node:fs";
import { spawnSync } from "node:child_process";

const input = fs.readFileSync(new URL("./fixtures/requests.jsonl", import.meta.url), "utf8");
const result = spawnSync(process.execPath, [new URL("./adapter.mjs", import.meta.url).pathname], { input, encoding: "utf8" });
assert.equal(result.status, 0, result.stderr);
assert.equal(result.stderr, "");
const responses = result.stdout.trim().split("\n").map(JSON.parse);
assert.equal(responses.length, 2);
assert.deepEqual(responses.map(({ contract, requestId }) => ({ contract, requestId })), [
  { contract: "kfd.agent-hub-adapter-response/v1", requestId: "handshake" },
  { contract: "kfd.agent-hub-adapter-response/v1", requestId: "starter-evaluate" },
]);
assert.equal(responses[0].hubs.length, 2);
assert.equal(responses[1].code, "scenario-not-implemented");
console.log("Node.js starter smoke passed: jsonl-stdio/v1 envelope only; Hub 20 not executed");
