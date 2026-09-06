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

const nativeTargets = {
  "linux-x64": ["x86_64-unknown-linux-gnu", "ubuntu-24.04"],
  "linux-arm64": ["aarch64-unknown-linux-gnu", "ubuntu-24.04-arm"],
  "macos-x64": ["x86_64-apple-darwin", "macos-15-intel"],
  "macos-arm64": ["aarch64-apple-darwin", "macos-15"],
  "windows-x64": ["x86_64-pc-windows-msvc", "windows-2022"],
};
const platforms = JSON.parse(workflow.match(/platforms-json:\s*>-\s*\n\s*(\[[^\n]+\])/u)?.[1] || "null");
assert.ok(Array.isArray(platforms), "build matrix must declare its native platforms");
assert.deepEqual(platforms.map(({ id }) => id).sort(), Object.keys(nativeTargets).sort());
for (const { id, runner } of platforms) {
  assert.match(id, /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u, "Buildchain v4 Stage Capsule platform IDs must be ASCII tokens");
  const [target, expectedRunner] = nativeTargets[id];
  assert.deepEqual(JSON.parse(runner), [expectedRunner], `${id} must retain its native runner`);
  assert.ok(read("scripts/build-native-release.mjs").includes(`"${target}"`), `native builder is missing ${target}`);
  assert.ok(nativeGuide.includes(target), `public native archive target changed: ${target}`);
  assert.ok(promotion.includes(`kfd-${id}-*`), `promotion is missing the ${id} provider artifact`);
}
assert.match(workflow, /setup-rust:\s*true/u);
assert.match(workflow, /rust-toolchain:\s*"1\.95\.0"/u);
assert.match(workflow, /build-command:\s*npm run build:native-release/u);
assert.match(workflow, /require-build:\s*true/u);
assert.match(workflow, /dist\/native/u);
assert.match(promotion, /required-artifact-count:\s*1\b/u, "promotion must require the sealed npm candidate");
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
  const npmCandidates = fs.readdirSync(path.dirname(manifestPath)).filter((name) => name.endsWith(".tgz"));
  assert.equal(
    npmCandidates.length,
    manifest.target === "x86_64-unknown-linux-gnu" ? 1 : 0,
    "only the Linux x64 candidate must carry the single platform-independent npm tarball",
  );
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
