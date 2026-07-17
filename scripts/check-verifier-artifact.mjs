// SPDX-License-Identifier: Apache-2.0
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const wasmPath = path.join(root, "verifier", "dist", "kfd_verifier.wasm");
const checksumPath = `${wasmPath}.sha256`;
const bytes = fs.readFileSync(wasmPath);
const expected = fs.readFileSync(checksumPath, "utf8").trim().split(/\s+/u)[0];
const actual = crypto.createHash("sha256").update(bytes).digest("hex");
assert.equal(actual, expected, "packaged verifier WASM digest drifted");
const compiled = new WebAssembly.Module(bytes);
assert.deepEqual(
  WebAssembly.Module.imports(compiled),
  [],
  "packaged verifier WASM must not depend on host imports",
);
const module = await WebAssembly.instantiate(bytes, {});
for (const name of ["memory", "kfd_alloc", "kfd_free", "kfd_verify"]) {
  assert.ok(module.instance.exports[name], `packaged verifier WASM is missing ${name}`);
}
console.log(`check-verifier-artifact: sha256:${actual} exports ok`);
