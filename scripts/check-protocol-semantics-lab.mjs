#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  CONTRACTS,
  buildContractReference,
  semanticRoot,
  verifyProtocolSemanticsDocument,
} from "./protocol-semantics-contract.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const profileRoot = path.join(root, "profiles", "protocol-semantics-lab");
const manifest = readJson(path.join(profileRoot, "manifest.json"));
const registry = readJson(path.join(profileRoot, "registry.json"));
const cases = readJson(path.join(profileRoot, "fixtures", "cases.json"));
const packageJson = readJson(path.join(root, "package.json"));

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function run(command, args, expected = 0) {
  const result = spawnSync(command, args, { cwd: root, encoding: "utf8", env: process.env });
  assert.equal(result.status, expected, `${command} ${args.join(" ")}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
  return result;
}

function cliJson(args) {
  return JSON.parse(run(process.execPath, [path.join(root, "bin", "kfd.mjs"), ...args, "--json"]).stdout);
}

assert.equal(manifest.schemaVersion, 1);
assert.equal(manifest.contract, "kfd.protocol-semantics-lab-manifest/v1");
assert.equal(manifest.profile.numberedDecision, false);
assert.equal(manifest.kernel.relationship, "projection-and-declarative-input-only");
assert.deepEqual(manifest.claimBoundary, {
  informationRepresentationExperiment: true,
  numberedKfdAuthority: false,
  vendorCertification: false,
  runtimeEnforcement: false,
  commercialDemand: false,
});

const delegatedManifest = readJson(path.join(root, manifest.kernel.manifestPath));
const delegatedSuite = readJson(path.join(root, delegatedManifest.suite.path));
assert.equal(delegatedManifest.profile.id, manifest.kernel.profileId);
assert.equal(delegatedManifest.suite.id, manifest.kernel.suiteId);
assert.equal(delegatedManifest.suite.fixedPairCount, manifest.kernel.fixedPairCount);
assert.equal(delegatedSuite.id, "delegated-work-paired-worlds");
assert.equal(delegatedSuite.pairs.length, 6);
assert.equal(delegatedManifest.projections.default, "execution-only");
assert.equal(delegatedManifest.projections["full-semantic"].endsWith("/full-semantic.json"), true);
assert.equal(delegatedManifest.report.contract, manifest.kernel.reportContract);

const defaultReport = cliJson(["challenge", "delegated-work"]);
const fullReport = cliJson(["challenge", "delegated-work", "--projection", "full-semantic"]);
assert.equal(defaultReport.contract, "kfd.delegated-work-challenge-report/v1");
assert.equal(defaultReport.summary.total, 6);
assert.equal(defaultReport.summary.collapsed, 6);
assert.equal(fullReport.summary.total, 6);
assert.equal(fullReport.summary.informationDistinguishable, 6);

assert.equal(verifyProtocolSemanticsDocument(registry, { rootDirectory: root }).valid, true);
assert.deepEqual(registry.entries, [], "architecture registry must remain empty until protocol packs are reviewed");

for (const relativePath of cases.valid) {
  const document = readJson(path.join(profileRoot, "fixtures", relativePath));
  const first = verifyProtocolSemanticsDocument(document);
  const second = verifyProtocolSemanticsDocument(document);
  assert.equal(first.valid, true, `${relativePath}: ${JSON.stringify(first.issues)}`);
  assert.deepEqual(first, second, `${relativePath}: validation must be deterministic`);
  assert.match(first.documentRoot, /^sha256:[0-9a-f]{64}$/u);
  assert.match(first.reportRoot, /^sha256:[0-9a-f]{64}$/u);
}

for (const testCase of cases.negative) {
  const document = readJson(path.join(profileRoot, "fixtures", testCase.path));
  const report = verifyProtocolSemanticsDocument(document);
  assert.equal(report.valid, false, `${testCase.path} must fail closed`);
  assert.deepEqual(
    [...new Set(report.issues.map(({ code }) => code))],
    testCase.issueCodes,
    `${testCase.path}: stable issue-code set drifted\n${JSON.stringify(report, null, 2)}`,
  );
  assert.deepEqual(
    report.issues,
    [...report.issues].sort((left, right) => Buffer.compare(
      Buffer.from(`${left.code}\0${left.path}\0${left.message}`, "utf8"),
      Buffer.from(`${right.code}\0${right.path}\0${right.message}`, "utf8"),
    )),
    `${testCase.path}: diagnostics must remain UTF-8 sorted`,
  );
}

const schemaContracts = new Map(manifest.contracts.map((entry) => [entry.id, entry]));
assert.deepEqual([...schemaContracts.keys()].sort(), Object.values(CONTRACTS).filter((id) => id !== CONTRACTS.reference).sort());
for (const entry of manifest.contracts) {
  const schema = readJson(path.join(root, entry.schema));
  assert.equal(schema.properties?.schemaVersion?.const, 1, `${entry.schema} must freeze schema version 1`);
  assert.equal(schema.properties?.contract?.const, entry.id, `${entry.schema} contract drifted`);
  assert.equal(schema.additionalProperties, false, `${entry.schema} must reject unknown top-level fields`);
  assert.equal(packageJson.exports?.[entry.export], `./${entry.schema}`, `${entry.export} must publish its exact schema`);
}

const generatedPath = path.join(profileRoot, "generated", "contract-reference.json");
const expectedReference = buildContractReference();
const expectedBytes = `${JSON.stringify(expectedReference, null, 2)}\n`;
assert.equal(fs.readFileSync(generatedPath, "utf8"), expectedBytes, "generated contract reference is stale or nondeterministic");
const storedReference = readJson(generatedPath);
const storedRoot = storedReference.referenceRoot;
delete storedReference.referenceRoot;
assert.equal(storedRoot, semanticRoot(storedReference));

const exactExports = {
  "./protocol-semantics-lab/manifest.json": "./profiles/protocol-semantics-lab/manifest.json",
  "./protocol-semantics-lab/registry.json": "./profiles/protocol-semantics-lab/registry.json",
  "./protocol-semantics-lab/contract-reference.json": "./profiles/protocol-semantics-lab/generated/contract-reference.json",
  "./protocol-semantics-lab/verifier": "./scripts/protocol-semantics-contract.mjs",
};
for (const [exportName, target] of Object.entries(exactExports)) assert.equal(packageJson.exports?.[exportName], target);
for (const directory of ["profiles", "schemas", "scripts"]) assert.equal(packageJson.files?.includes(directory), true, `npm files must include ${directory}`);
assert.equal(packageJson.version, "1.0.0-alpha.68", "architecture work must not rewrite the immutable alpha.68 coordinate");
assert.equal(packageJson.scripts?.["check:protocol-semantics-lab"], "node scripts/check-protocol-semantics-lab.mjs");
assert.equal(packageJson.scripts?.["generate:protocol-semantics-reference"], "node scripts/generate-protocol-semantics-reference.mjs --write");
assert.equal(packageJson.scripts?.check?.includes("npm run check:protocol-semantics-lab"), true);

console.log(`protocol semantics lab: ${cases.valid.length} valid and ${cases.negative.length} negative fixtures, six-pair compatibility, roots, exports, and generated reference ok`);
