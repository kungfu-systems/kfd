// SPDX-License-Identifier: Apache-2.0
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const compiler = process.env.CXX || (process.platform === "win32" ? "cl" : "c++");
const executable = path.join(os.tmpdir(), `kfd-agent-hub-cpp-smoke-${process.pid}${process.platform === "win32" ? ".exe" : ""}`);
const compileArgs = process.platform === "win32"
  ? ["/std:c++17", path.join(root, "adapter.cpp"), `/Fe:${executable}`]
  : ["-std=c++17", path.join(root, "adapter.cpp"), "-o", executable];
const compiled = spawnSync(compiler, compileArgs, { encoding: "utf8" });
assert.equal(compiled.status, 0, `${compiled.stdout}\n${compiled.stderr}`);
try {
  const input = fs.readFileSync(path.join(root, "fixtures", "requests.jsonl"), "utf8");
  const result = spawnSync(executable, [], { input, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, "");
  const responses = result.stdout.trim().split("\n").map(JSON.parse);
  assert.deepEqual(responses.map(({ contract, requestId }) => ({ contract, requestId })), [
    { contract: "kfd.agent-hub-adapter-response/v1", requestId: "handshake" },
    { contract: "kfd.agent-hub-adapter-response/v1", requestId: "starter-evaluate" },
  ]);
  assert.equal(responses[0].hubs.length, 2);
  assert.equal(responses[1].code, "scenario-not-implemented");
  console.log("C++ starter smoke passed: jsonl-stdio/v1 envelope only; Hub 20 not executed");
} finally {
  fs.rmSync(executable, { force: true });
}
