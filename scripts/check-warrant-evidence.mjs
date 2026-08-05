// SPDX-License-Identifier: Apache-2.0
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  applyVectorPatch,
  verifyPrimitiveEvidenceBundle,
  verifyWarrantConformanceWitness,
} from "./warrant-evidence-verifier.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "profiles/warrant-evidence/manifest.json"), "utf8"));
const registry = JSON.parse(fs.readFileSync(path.join(root, "evidence/primitive-evidence/registry.json"), "utf8"));
const vectors = JSON.parse(fs.readFileSync(path.join(root, "profiles/warrant-evidence/vectors/kfd-10.json"), "utf8"));
const negativeBundles = JSON.parse(fs.readFileSync(path.join(root, "profiles/warrant-evidence/fixtures/negative-cases.json"), "utf8"));
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const decisionRegistry = JSON.parse(fs.readFileSync(path.join(root, "registry.json"), "utf8"));
const coverageMatrix = JSON.parse(fs.readFileSync(path.join(root, "evidence/semantic-self-sufficiency/kfd-1-13.json"), "utf8"));

function sha256(bytes) {
  return `sha256:${crypto.createHash("sha256").update(bytes).digest("hex")}`;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? root,
    encoding: "utf8",
    env: { ...process.env, npm_config_offline: "true", ...options.env },
  });
  assert.equal(
    result.status,
    options.expected ?? 0,
    `${command} ${args.join(" ")}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
  );
  return result.stdout.trim();
}

assert.equal(manifest.contract, "kfd.warrant-evidence-profile-manifest/v1");
assert.equal(manifest.profile.status, "experimental");
assert.equal(manifest.warrantConformance.decisionStatus, "draft");
assert.equal(manifest.runtimeDependencies.length, 0);
assert.equal(manifest.primitiveEvidence.fixedBundleCount, 2);
assert.equal(manifest.warrantConformance.fixedVectorCount, 14);
assert.equal(registry.entries.length, 2);
assert.equal(vectors.vectors.length, 14);
assert.equal(decisionRegistry.entries.find(({ id }) => id === "KFD-10")?.status, "draft");

assert.equal(coverageMatrix.contract, "kfd.semantic-self-sufficiency-matrix/v1");
assert.equal(coverageMatrix.entries.length, 13);
assert.deepEqual(
  coverageMatrix.entries.map(({ id }) => id),
  Array.from({ length: 13 }, (_, index) => `KFD-${index + 1}`),
);
for (const entry of coverageMatrix.entries) {
  const decision = decisionRegistry.entries.find(({ id }) => id === entry.id);
  assert.equal(entry.lifecycleStatus, decision?.status, `${entry.id} lifecycle status drifted`);
  assert.equal(entry.normativeSources.includes(decision.path), true, `${entry.id} normative source drifted`);
  for (const field of ["normativeSources", "schemas", "fixtures", "failureTests", "verifiers"]) {
    assert.equal(Array.isArray(entry[field]), true, `${entry.id}.${field} must be an array`);
    for (const filePath of entry[field]) {
      assert.equal(fs.existsSync(path.join(root, filePath)), true, `${entry.id}.${field} is missing ${filePath}`);
    }
  }
  if (entry.coverage !== "complete") {
    assert.equal(entry.gaps.length > 0, true, `${entry.id} incomplete coverage must name a gap`);
  }
  if (entry.lifecycleStatus === "draft") {
    assert.notEqual(entry.coverage, "complete", `${entry.id} draft must not be reported complete`);
  }
}
assert.equal(coverageMatrix.entries.find(({ id }) => id === "KFD-10")?.coverage, "partial");

for (const surface of manifest.surfaces) {
  const absolute = path.resolve(root, surface.path);
  assert.equal(path.relative(root, absolute).startsWith(".."), false, `${surface.path} escaped package root`);
  assert.equal(fs.lstatSync(absolute).isSymbolicLink(), false, `${surface.path} must not be a symlink`);
  assert.equal(surface.digest, sha256(fs.readFileSync(absolute)), `${surface.path} digest drifted`);
}

const fixturePaths = [
  "profiles/warrant-evidence/fixtures/buildchain-dev-delivery-warrant.json",
  "profiles/warrant-evidence/fixtures/kungfu-kfx-recovery-warrant.json",
];
for (const fixturePath of fixturePaths) {
  const bundle = JSON.parse(fs.readFileSync(path.join(root, fixturePath), "utf8"));
  const result = verifyPrimitiveEvidenceBundle(bundle, { registry });
  assert.equal(result.valid, true, `${fixturePath}: ${JSON.stringify(result.issues)}`);
  assert.equal(result.qualifying, false);
  assert.equal(result.selfCertified, false);
}

assert.equal(negativeBundles.contract, "kfd.primitive-evidence-negative-fixtures/v1");
assert.equal(negativeBundles.cases.length, 2);
const negativeBase = JSON.parse(fs.readFileSync(path.join(root, negativeBundles.base), "utf8"));
for (const fixture of negativeBundles.cases) {
  const result = verifyPrimitiveEvidenceBundle(
    applyVectorPatch(negativeBase, fixture.patch),
    { registry },
  );
  assert.equal(result.valid, fixture.expected.valid, fixture.id);
  assert.equal(result.code, fixture.expected.code, fixture.id);
}

for (const vector of vectors.vectors) {
  const witness = applyVectorPatch(vectors.baseWitness, vector.patch);
  const result = verifyWarrantConformanceWitness(witness);
  assert.equal(result.valid, vector.expected.valid, `${vector.id}: ${JSON.stringify(result.issues)}`);
  assert.equal(result.code, vector.expected.code, vector.id);
  assert.equal(result.qualifying, false, vector.id);
  assert.equal(result.selfCertified, false, vector.id);
}

const verifierSource = fs.readFileSync(path.join(root, "scripts/warrant-evidence-verifier.mjs"), "utf8");
for (const prohibited of [
  "node:child_process",
  "http://",
  "https.request",
  "fetch(",
  "kungfu-systems/kungfu/",
  "kungfu-systems/buildchain/",
  ".private/",
]) {
  assert.equal(verifierSource.includes(prohibited), false, `verifier has forbidden runtime dependency ${prohibited}`);
}

for (const [alias, target] of Object.entries({
  "./warrant-evidence/manifest.json": "./profiles/warrant-evidence/manifest.json",
  "./warrant-evidence/registry.json": "./evidence/primitive-evidence/registry.json",
  "./warrant-evidence/primitive-evidence-bundle.schema.json": "./schemas/kfd-evidence/primitive-evidence-bundle.schema.json",
  "./warrant-evidence/kfd-10-conformance-witness.schema.json": "./schemas/kfd-10/conformance-witness.schema.json",
  "./semantic-self-sufficiency/matrix.json": "./evidence/semantic-self-sufficiency/kfd-1-13.json",
  "./semantic-self-sufficiency/matrix.schema.json": "./schemas/kfd-semantic-self-sufficiency-matrix.schema.json",
})) {
  assert.equal(packageJson.exports?.[alias], target, `missing package export ${alias}`);
}

const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "kfd-warrant-evidence-"));
try {
  const dryRun = JSON.parse(run("npm", ["pack", "--json", "--dry-run", "--ignore-scripts"]));
  const packaged = new Set(dryRun[0].files.map(({ path: filePath }) => filePath));
  for (const required of [
    "bin/kfd.mjs",
    "profiles/warrant-evidence/manifest.json",
    "profiles/warrant-evidence/vectors/kfd-10.json",
    "profiles/warrant-evidence/fixtures/negative-cases.json",
    ...fixturePaths,
    "scripts/warrant-evidence-verifier.mjs",
    "schemas/kfd-evidence/primitive-evidence-bundle.schema.json",
    "schemas/kfd-10/conformance-witness.schema.json",
    "evidence/primitive-evidence/registry.json",
    "evidence/semantic-self-sufficiency/kfd-1-13.json",
    "schemas/kfd-semantic-self-sufficiency-matrix.schema.json",
  ]) {
    assert.equal(packaged.has(required), true, `npm package is missing ${required}`);
  }
  for (const filePath of packaged) {
    assert.equal(filePath.startsWith("node_modules/"), false, `package leaked ${filePath}`);
    assert.equal(filePath.includes(".private"), false, `package leaked ${filePath}`);
    assert.equal(filePath.includes(".git/"), false, `package leaked ${filePath}`);
  }

  const packed = JSON.parse(run("npm", ["pack", "--json", "--ignore-scripts", "--pack-destination", temporary]));
  const tarball = path.join(temporary, packed[0].filename);
  run("tar", ["-xzf", tarball, "-C", temporary]);
  const packageDir = path.join(temporary, "package");
  for (const fixturePath of fixturePaths) {
    const output = JSON.parse(run("node", [
      path.join(packageDir, "bin/kfd.mjs"),
      "verify",
      "warrant-evidence",
      path.join(packageDir, fixturePath),
      "--json",
    ], { cwd: packageDir }));
    assert.equal(output.valid, true, `${fixturePath} failed in packed clean-room`);
    assert.equal(output.offline, true);
  }
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}

console.log("Warrant evidence check passed: 2 exact-source bundles, 14 KFD-10 vectors, 2 adversarial bundle mutations, offline packed clean-room");
