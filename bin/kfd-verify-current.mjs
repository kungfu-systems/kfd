#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function regularText(filePath) {
  const stat = fs.lstatSync(filePath);
  if (!stat.isFile() || stat.isSymbolicLink()) {
    throw new Error(`${filePath} must be a regular file, not a symlink`);
  }
  return fs.readFileSync(filePath, "utf8");
}

function collect(root, directory, artifacts) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    const stat = fs.lstatSync(absolute);
    if (stat.isSymbolicLink()) throw new Error(`symlink is not admitted: ${absolute}`);
    if (stat.isDirectory()) collect(root, absolute, artifacts);
    else if (stat.isFile()) {
      const relative = path.relative(root, absolute);
      if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
        throw new Error(`path escaped object root: ${absolute}`);
      }
      artifacts[relative.split(path.sep).join("/")] = regularText(absolute);
    }
  }
}

function primaryName(kind) {
  return {
    passport: "buildchain.release.json",
    pack: "pack.json",
    atlas: "atlas.json",
    episode: "manifest.json",
  }[kind];
}

function bundleObject(kind, inputPath, schemaPath) {
  const artifacts = {};
  let primary;
  if (fs.lstatSync(inputPath).isDirectory()) {
    collect(inputPath, inputPath, artifacts);
    const name = primaryName(kind);
    if (!name) throw new Error(`${kind} expects a JSON file`);
    primary = artifacts[name];
    delete artifacts[name];
    if (primary === undefined) throw new Error(`object directory is missing ${name}`);
  } else {
    primary = regularText(inputPath);
  }
  if (schemaPath) artifacts["schema.json"] = regularText(schemaPath);
  if (kind === "episode") {
    const manifest = JSON.parse(primary);
    if (manifest.semanticRoot) artifacts["semantic-root.txt"] = `${manifest.semanticRoot}\n`;
  }
  return {
    schemaVersion: 1,
    contract: "kfd.verification-bundle/v1",
    kind,
    primary,
    artifacts,
  };
}

async function verifyWasm(bundleText) {
  const wasmPath = path.join(
    packageRoot,
    "verifier",
    "dist",
    "kfd_verifier_current.wasm",
  );
  const module = await WebAssembly.instantiate(fs.readFileSync(wasmPath), {});
  const { memory, kfd_alloc: alloc, kfd_free: free, kfd_verify: verify } =
    module.instance.exports;
  const input = new TextEncoder().encode(bundleText);
  const inputPointer = alloc(input.length);
  new Uint8Array(memory.buffer, inputPointer, input.length).set(input);
  let packed;
  try {
    packed = verify(inputPointer, input.length);
  } finally {
    free(inputPointer, input.length);
  }
  const outputPointer = Number(packed >> 32n);
  const outputLength = Number(packed & 0xffffffffn);
  const output = new Uint8Array(memory.buffer, outputPointer, outputLength).slice();
  free(outputPointer, outputLength);
  return new TextDecoder().decode(output);
}

async function main(args) {
  if (args[0] !== "verify" || !args[1] || !args[2]) {
    throw new Error("usage: kfd-verify-current verify <kind> <path> [--schema <path>] [--json]");
  }
  const kind = args[1];
  const inputPath = path.resolve(args[2]);
  let schemaPath;
  for (let index = 3; index < args.length; index += 1) {
    if (args[index] === "--json") continue;
    if (args[index] === "--schema" && args[index + 1]) schemaPath = path.resolve(args[++index]);
    else throw new Error(`unsupported or incomplete argument: ${args[index]}`);
  }
  const report = await verifyWasm(JSON.stringify(bundleObject(kind, inputPath, schemaPath)));
  process.stdout.write(`${report}\n`);
  process.exitCode = JSON.parse(report).valid ? 0 : 1;
}

main(process.argv.slice(2)).catch((error) => {
  console.error(error.message);
  process.exitCode = 2;
});
