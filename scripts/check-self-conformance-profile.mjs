// SPDX-License-Identifier: Apache-2.0
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  PROFILE,
  ROOT_PATTERN,
  applyOperations,
  exactByteRoot,
  inspectTransitionBundle,
  semanticRoot,
} from "./self-conformance-contract.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const extracted = process.argv.includes("--extracted");
const readJson = (relative, base = root) => JSON.parse(fs.readFileSync(path.join(base, relative), "utf8"));
const bytes = (relative, base = root) => fs.readFileSync(path.join(base, relative));
const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? root,
    encoding: "utf8",
    env: { ...process.env, npm_config_offline: "true" },
  });
  assert.equal(result.status, options.expected ?? 0, `${command} ${args.join(" ")}\n${result.stdout}\n${result.stderr}`);
  return result.stdout.trim();
};

const manifest = readJson("profiles/self-conformance/manifest.json");
const evidence = readJson("profiles/self-conformance/bootstrap-evidence.json");
const anchor = readJson("profiles/self-conformance/bootstrap-anchor.json");
const issues = readJson("profiles/self-conformance/issue-codes.json");
const vectors = readJson("profiles/self-conformance/vectors/contract-vectors.json");
const extraction = readJson("profiles/self-conformance/extraction-manifest.json");

assert.equal(manifest.contract, "kfd.self-conformance-package-manifest/v1");
assert.equal(`${manifest.profile.id}@${manifest.profile.version}`, PROFILE);
assert.equal(manifest.rootAlgorithm, "sha256-kfd-canonical-json-v1");
assert.deepEqual(manifest.runtimeDependencies, []);
assert.equal(manifest.verifierRequirement.native, true);
assert.equal(manifest.verifierRequirement.wasm, true);
assert.equal(manifest.verifierRequirement.byteParity, true);
assert.equal(manifest.verifierRequirement.independent, true);
assert.equal(issues.codes.length, 42);
assert.deepEqual(issues.codes, [...issues.codes].sort());
assert.equal(new Set(issues.codes).size, issues.codes.length);
for (const value of [manifest.schemaSetRoot, manifest.vectorSetRoot, manifest.issueSetRoot, manifest.bootstrapAnchorRoot]) {
  assert.match(value, ROOT_PATTERN);
}

const schemaPaths = fs.readdirSync(path.join(root, "schemas/kfd-self-conformance"))
  .filter((name) => name.endsWith(".schema.json"))
  .sort()
  .map((name) => `schemas/kfd-self-conformance/${name}`);
assert.equal(schemaPaths.length, 8);
const schemaSetRoot = semanticRoot(schemaPaths.map((relative) => ({
  path: relative,
  contentRoot: exactByteRoot(bytes(relative)),
  size: bytes(relative).length,
})));
assert.equal(manifest.schemaSetRoot, schemaSetRoot);
assert.equal(manifest.vectorSetRoot, semanticRoot(vectors));
assert.equal(manifest.issueSetRoot, semanticRoot(issues));
assert.equal(manifest.bootstrapAnchorRoot, semanticRoot(anchor));
assert.equal(anchor.stateRoot, semanticRoot(evidence.state));
assert.equal(anchor.authorityReceiptRoot, semanticRoot(evidence.authorityReceipt));
assert.equal(anchor.reviewReceiptRoot, semanticRoot(evidence.reviewReceipt));
assert.equal(anchor.packageRoot, evidence.authorityReceipt.packageRoot);
assert.equal(evidence.reviewReceipt.approvals.length, 2);
assert.deepEqual(evidence.reviewReceipt.approvals.map(({ state }) => state), ["APPROVED", "APPROVED"]);

for (const surface of manifest.surfaces) {
  const absolute = path.resolve(root, surface.path);
  assert.equal(path.relative(root, absolute).startsWith(".."), false, `${surface.path} escaped root`);
  assert.equal(fs.lstatSync(absolute).isSymbolicLink(), false, `${surface.path} must not be a symlink`);
  assert.equal(surface.digest, exactByteRoot(fs.readFileSync(absolute)), `${surface.path} digest drifted`);
}

assert.equal(vectors.contract, "kfd.self-conformance-vector-registry/v1");
assert.equal(vectors.vectors.length, 17);
assert.equal(new Set(vectors.vectors.map(({ id }) => id)).size, vectors.vectors.length);
assert.equal(vectors.vectors.filter(({ polarity }) => polarity === "positive").length, 1);
assert.equal(vectors.vectors.filter(({ polarity }) => polarity === "negative").length, 16);
assert.equal(vectors.base.report.bundleRoot, semanticRoot(vectors.base.bundle));
assert.equal(vectors.base.report.qualifying, false);
assert.equal(vectors.base.report.selfCertified, false);
for (const vector of vectors.vectors) {
  const bundle = applyOperations(vectors.base.bundle, vector.operations);
  const result = inspectTransitionBundle(bundle, { bootstrapAnchor: anchor, schemaSetRoot });
  assert.equal(result.valid, vector.expected.valid, `${vector.id}: ${JSON.stringify(result.issues)}`);
  assert.equal(result.code, vector.expected.code, vector.id);
  if (result.code) assert.equal(issues.codes.includes(result.code), true, `${vector.id}: unknown issue code`);
}

assert.equal(extraction.offline, true);
assert.equal(new Set(extraction.files).size, extraction.files.length);
for (const relative of extraction.files) {
  assert.equal(fs.existsSync(path.join(root, relative)), true, `extraction file missing: ${relative}`);
  assert.equal(relative.includes(".."), false, `unsafe extraction path: ${relative}`);
}
if (!extracted) {
  const packageJson = readJson("package.json");
  const standards = readJson("standards.json");
  const impact = readJson("release-impact.json");
  for (const [alias, target] of Object.entries({
    "./self-conformance/manifest.json": "./profiles/self-conformance/manifest.json",
    "./self-conformance/bootstrap-anchor.json": "./profiles/self-conformance/bootstrap-anchor.json",
    "./self-conformance/issue-codes.json": "./profiles/self-conformance/issue-codes.json",
    "./self-conformance/vectors.json": "./profiles/self-conformance/vectors/contract-vectors.json",
    "./self-conformance/schemas/*": "./schemas/kfd-self-conformance/*",
    "./self-conformance/verifier-matrix.json": "./verifier/specs/self-conformance-matrix.json",
    "./self-conformance/lifecycle-gates.json": "./profiles/self-conformance/lifecycle-gates.json",
    "./self-conformance/lifecycle-gate-matrix.json": "./profiles/self-conformance/lifecycle-gate-matrix.json",
    "./self-conformance/lifecycle-gate-request.schema.json": "./schemas/kfd-self-conformance/lifecycle-gate-request.schema.json",
    "./self-conformance/lifecycle-gate-report.schema.json": "./schemas/kfd-self-conformance/lifecycle-gate-report.schema.json",
  })) assert.equal(packageJson.exports[alias], target, `missing export ${alias}`);

  const registered = new Set(standards.standards["kfd-1"].surfaceRegister.surfaces.map(({ id }) => id));
  for (const id of [
    "kfd-self-conformance-authority",
    "kfd-self-conformance-manifest",
    "kfd-self-conformance-transition-bundle",
    "kfd-self-conformance-transition-report",
    "kfd-self-conformance-bootstrap-anchor",
    "kfd-self-conformance-contract-vectors",
    "kfd-self-conformance-verifier",
    "kfd-self-conformance-verifier-matrix",
    "kfd-self-conformance-lifecycle-policy",
    "kfd-self-conformance-lifecycle-gate",
    "kfd-self-conformance-lifecycle-matrix",
  ]) assert.equal(registered.has(id), true, `missing KFD-1 surface ${id}`);
  const classification = impact.surfaceImpacts.find(({ id }) => id === "kfd-self-conformance-profile-v1");
  assert.equal(classification?.class, "additive");
  assert.equal(classification?.impact, "minor");
}

if (!extracted) {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "kfd-self-conformance-"));
  try {
    const dryRun = JSON.parse(run(npmCommand, ["pack", "--json", "--dry-run", "--ignore-scripts"]));
    const packaged = new Set(dryRun[0].files.map(({ path: relative }) => relative));
    for (const relative of extraction.files) assert.equal(packaged.has(relative), true, `package missing ${relative}`);
    for (const relative of packaged) {
      assert.equal(relative.includes(".private"), false, `package leaked ${relative}`);
      assert.equal(relative.includes(".git/"), false, `package leaked ${relative}`);
      assert.equal(relative.startsWith("node_modules/"), false, `package leaked ${relative}`);
    }
    const packed = JSON.parse(run(npmCommand, ["pack", "--json", "--ignore-scripts", "--pack-destination", temporary]));
    run("tar", ["-xzf", path.join(temporary, packed[0].filename), "-C", temporary]);
    const packageRoot = path.join(temporary, "package");
    const extractionRoot = path.join(temporary, "clean-room");
    for (const relative of extraction.files) {
      const destination = path.join(extractionRoot, relative);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.copyFileSync(path.join(packageRoot, relative), destination);
    }
    const output = run("node", ["scripts/check-self-conformance-profile.mjs", "--extracted"], {
      cwd: extractionRoot,
      expected: 0,
    });
    assert.equal(output.includes("Self-Conformance contract check passed"), true);
    const lifecycleOutput = run("node", ["scripts/check-self-conformance-lifecycle.mjs"], {
      cwd: extractionRoot,
      expected: 0,
    });
    assert.equal(lifecycleOutput.includes("Self-Conformance lifecycle gates passed"), true);
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}

console.log("Self-Conformance contract check passed: 8 schemas, 17 vectors, 7 lifecycle gates, finite alpha.55 bootstrap, additive/minor KFD-1 surface, offline packed clean-room");
