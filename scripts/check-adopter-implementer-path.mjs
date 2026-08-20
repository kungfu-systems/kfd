// SPDX-License-Identifier: Apache-2.0
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const matrixPath = "profiles/adopter-conformance/test-matrix.json";
const guidePath = "profiles/adopter-conformance/implementer-guide.md";
const inventoryPath = "profiles/adopter-conformance/toolchain.json";

function readJson(relative) {
  return JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
}

function sortedPaths(entries) {
  return entries.map(({ path: relative }) => relative).sort();
}

const matrix = readJson(matrixPath);
const inventory = readJson(inventoryPath);
const packageJson = readJson("package.json");
const guide = fs.readFileSync(path.join(root, guidePath), "utf8");

assert.equal(matrix.contract, "kfd.adopter-category-implementer-test-matrix/v1");
assert.equal(matrix.packageOnly, true);
assert.deepEqual(matrix.cleanRoom, {
  source: "one exact @kungfu-tech/kfd npm tarball",
  emptyHome: true,
  networkRequired: false,
  sourceCheckoutRequired: false,
  siblingRepositoryRequired: false,
  ambientCacheAuthority: false,
});
assert.deepEqual(matrix.componentChecks.map(({ id }) => id), [
  "full-cut-manifest",
  "category-profiles",
  "category-instances",
  "evidence-matrix",
  "adopter-toolchain",
]);
assert.deepEqual(matrix.componentChecks.map(({ command }) => command), [
  "node scripts/check-adopter-conformance.mjs",
  "node scripts/check-adopter-category-profiles.mjs",
  "node scripts/check-adopter-category-instances.mjs",
  "node scripts/check-adopter-category-evidence-matrix.mjs",
  "node scripts/check-adopter-toolchain.mjs",
]);
assert.deepEqual(matrix.expectedAuthorityOutputs, {
  qualifying: false,
  releaseAuthorized: false,
  runtimeAuthorized: false,
  independentlyCertified: false,
});
assert.deepEqual(Object.keys(matrix.authorityBoundaries), [
  "kfdSpecification",
  "buildchainDelivery",
  "categoryComposition",
  "project",
  "delivery",
  "runtime",
  "independentCertification",
]);
for (const heading of [
  "Reproduce the complete contract surface",
  "Run the clean-room entrypoint",
  "Keep six authorities separate",
  "Update without silently changing meaning",
  "Interpret the result narrowly",
]) {
  assert.match(guide, new RegExp(`^## ${heading}$`, "m"));
}
for (const boundary of ["qualifying: false", "releaseAuthorized: false", "runtimeAuthorized: false", "independentlyCertified: false"]) {
  assert.match(guide, new RegExp(boundary));
}

assert.deepEqual(sortedPaths(inventory.surfaces.schemas), [
  "schemas/kfd-adopter-conformance/category-instance-manifest.schema.json",
  "schemas/kfd-adopter-conformance/category-profile-catalog.schema.json",
  "schemas/kfd-adopter-conformance/evidence-matrix.schema.json",
  "schemas/kfd-adopter-conformance/manifest.schema.json",
]);
assert.deepEqual(sortedPaths(inventory.surfaces.vectors), [
  "profiles/adopter-conformance/category-instance-vectors.json",
  "profiles/adopter-conformance/category-profile-vectors.json",
  "profiles/adopter-conformance/evidence-matrix-vectors.json",
  "profiles/adopter-conformance/vectors.json",
]);
assert.deepEqual(sortedPaths(inventory.surfaces.verifiers), [
  "scripts/adopter-category-evidence-matrix-contract.mjs",
  "scripts/adopter-category-instance-contract.mjs",
  "scripts/adopter-category-profile-contract.mjs",
  "scripts/adopter-conformance-contract.mjs",
  "scripts/warrant-evidence-verifier.mjs",
]);
assert.deepEqual(sortedPaths(inventory.surfaces.guides), [guidePath]);
assert.deepEqual(sortedPaths(inventory.surfaces.testMatrices), [matrixPath]);

for (const [exportName, target] of Object.entries({
  "./adopter-conformance/implementer-guide.md": `./${guidePath}`,
  "./adopter-conformance/test-matrix.json": `./${matrixPath}`,
  "./adopter-conformance/implementer-path-check": "./scripts/check-adopter-implementer-path.mjs",
})) {
  assert.equal(packageJson.exports?.[exportName], target, `missing exact package export ${exportName}`);
}

function exercise(cwd, home) {
  for (const { command } of matrix.componentChecks) {
    const [, script] = command.split(" ");
    const result = spawnSync(process.execPath, [script], {
      cwd,
      encoding: "utf8",
      env: {
        PATH: process.env.PATH,
        HOME: home,
        KFD_ADOPTER_OFFLINE: "1",
        KFD_ADOPTER_SKIP_EXTRACTION: "1",
        KFD_EVIDENCE_MATRIX_CLEAN_ROOM: "1",
        KFD_ADOPTER_TOOLCHAIN_SKIP_EXTRACTION: "1",
      },
    });
    assert.equal(result.status, 0, `${command} failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
  }
}

if (process.env.KFD_ADOPTER_IMPLEMENTER_CLEAN_ROOM === "1") {
  exercise(root, process.env.HOME);
} else {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "kfd-adopter-implementer-"));
  try {
    const packed = spawnSync(npmCommand, ["pack", "--json", "--ignore-scripts", "--pack-destination", temporaryRoot], {
      cwd: root,
      encoding: "utf8",
      env: { ...process.env, npm_config_cache: path.join(temporaryRoot, "npm-cache") },
      shell: process.platform === "win32",
    });
    assert.equal(packed.status, 0, packed.stderr || packed.stdout);
    const [{ filename }] = JSON.parse(packed.stdout);
    const unpacked = spawnSync("tar", ["-xzf", path.join(temporaryRoot, filename), "-C", temporaryRoot], { encoding: "utf8" });
    assert.equal(unpacked.status, 0, unpacked.stderr || unpacked.stdout);
    const cleanHome = path.join(temporaryRoot, "home");
    fs.mkdirSync(cleanHome);
    const replay = spawnSync(process.execPath, ["scripts/check-adopter-implementer-path.mjs"], {
      cwd: path.join(temporaryRoot, "package"),
      encoding: "utf8",
      env: {
        PATH: process.env.PATH,
        HOME: cleanHome,
        KFD_ADOPTER_OFFLINE: "1",
        KFD_ADOPTER_IMPLEMENTER_CLEAN_ROOM: "1",
      },
    });
    assert.equal(replay.status, 0, `clean extracted package replay failed\nstdout:\n${replay.stdout}\nstderr:\n${replay.stderr}`);
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
}

console.log("check-adopter-implementer-path: package-only clean-room matrix passed");
