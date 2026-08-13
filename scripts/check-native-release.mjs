// SPDX-License-Identifier: Apache-2.0
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const packageJson = JSON.parse(read("package.json"));
const packageLock = JSON.parse(read("package-lock.json"));
const release = JSON.parse(read("kfd.release.json"));
const cargo = read("verifier/Cargo.toml");
const cargoLock = read("verifier/Cargo.lock");
const workflow = read(".github/workflows/build.yml");
const promotion = read(".github/workflows/buildchain-ref-promotion.yml");
const nativeGuide = read("docs/native-cli.md");
const cargoVersion = cargo.match(/\[workspace\.package\][\s\S]*?\nversion\s*=\s*"([^"]+)"/u)?.[1];

assert.equal(release.npmVersion, packageJson.version, "release anchor must match package version");
assert.equal(packageLock.version, packageJson.version, "package lock root version must match");
assert.equal(packageLock.packages[""].version, packageJson.version, "package lock package version must match");
assert.equal(cargoVersion, packageJson.version, "Rust workspace version must match package version");
for (const crate of ["kfd-verifier-cli", "kfd-verifier-core", "kfd-verifier-wasm"]) {
  assert.match(
    cargoLock,
    new RegExp(`name = "${crate}"\\nversion = "${packageJson.version.replaceAll(".", "\\.")}"`, "u"),
    `${crate} lock version must match KFD`,
  );
}
assert.match(cargo, /members\s*=\s*\[[\s\S]*"crates\/cli"/u);
assert.match(read("verifier/crates/cli/Cargo.toml"), /\[\[bin\]\][\s\S]*name\s*=\s*"kfd"/u);
assert.match(read("verifier/crates/cli/src/main.rs"), /CARGO_PKG_VERSION/u);

for (const target of [
  "x86_64-unknown-linux-gnu",
  "aarch64-unknown-linux-gnu",
  "x86_64-apple-darwin",
  "aarch64-apple-darwin",
  "x86_64-pc-windows-msvc",
]) assert.match(workflow, new RegExp(target, "u"), `build matrix is missing ${target}`);
for (const runner of ["ubuntu-24.04", "ubuntu-24.04-arm", "macos-15-intel", "macos-15", "windows-2022"]) {
  assert.match(workflow, new RegExp(runner, "u"), `build matrix is missing ${runner}`);
}
assert.match(workflow, /setup-rust:\s*true/u);
assert.match(workflow, /rust-toolchain:\s*"1\.95\.0"/u);
assert.match(workflow, /build-command:\s*npm run build:native-release/u);
assert.match(workflow, /require-build:\s*true/u);
assert.match(workflow, /dist\/native/u);
for (const pattern of ["kfd-*.tar.gz", "kfd-*.zip", "kfd-*.sha256", "kfd-*.provenance.json"]) {
  assert.equal(promotion.includes(pattern), true, `promotion is missing ${pattern}`);
}
assert.match(nativeGuide, /executable named `kfd`/u);
assert.match(nativeGuide, /not claimed as native capabilities/u);

const manifestPath = path.join(root, "dist/native/manifest.json");
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  assert.equal(manifest.schema, "kfd.native-release-build/v1");
  assert.equal(manifest.name, "kfd");
  assert.equal(manifest.version, packageJson.version);
  assert.equal(manifest.files.length, 3);
  const names = new Set(manifest.files.map(({ name }) => name));
  assert.equal([...names].some((name) => name.endsWith(".tar.gz") || name.endsWith(".zip")), true);
  assert.equal([...names].some((name) => name.endsWith(".provenance.json")), true);
  assert.equal([...names].some((name) => name.endsWith(".sha256")), true);
  for (const entry of manifest.files) {
    const file = path.join(root, "dist/native", entry.name);
    assert.equal(fs.existsSync(file), true, `${entry.name} is missing`);
    const digest = crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
    assert.equal(digest, entry.sha256, `${entry.name} digest drifted`);
  }
}

console.log(`Native KFD release contract passed: kfd ${packageJson.version}`);
