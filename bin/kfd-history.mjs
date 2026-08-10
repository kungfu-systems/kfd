#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function regularText(filePath) {
  const stat = fs.lstatSync(filePath);
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`${filePath} must be a regular file, not a symlink`);
  return fs.readFileSync(filePath, "utf8");
}

async function verifyWasm(bundleText) {
  const wasmPath = path.join(packageRoot, "verifier", "dist", "kfd_verifier_current.wasm");
  const module = await WebAssembly.instantiate(fs.readFileSync(wasmPath), {});
  const { memory, kfd_alloc: alloc, kfd_free: free, kfd_verify: verify } = module.instance.exports;
  const input = new TextEncoder().encode(bundleText);
  const inputPointer = alloc(input.length);
  new Uint8Array(memory.buffer, inputPointer, input.length).set(input);
  let packed;
  try { packed = verify(inputPointer, input.length); } finally { free(inputPointer, input.length); }
  const outputPointer = Number(packed >> 32n);
  const outputLength = Number(packed & 0xffffffffn);
  const output = new Uint8Array(memory.buffer, outputPointer, outputLength).slice();
  free(outputPointer, outputLength);
  return new TextDecoder().decode(output);
}

async function main(args) {
  if (args.length < 2 || args[0] !== "verify") {
    throw new Error("usage: kfd-history verify <historical-lineage.report.json> [--json]");
  }
  if (args.length > 3 || (args[2] && args[2] !== "--json")) throw new Error(`unsupported argument: ${args[2]}`);
  const bundle = {
    schemaVersion: 1,
    contract: "kfd.verification-bundle/v1",
    kind: "self-conformance-history",
    primary: regularText(args[1]),
    artifacts: {},
  };
  const report = await verifyWasm(JSON.stringify(bundle));
  console.log(report);
  process.exitCode = JSON.parse(report).valid ? 0 : 1;
}

main(process.argv.slice(2)).catch((error) => {
  console.error(`kfd-history: ${error.message}`);
  process.exitCode = 2;
});
