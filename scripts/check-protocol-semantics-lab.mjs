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
import { buildProtocolEvidenceCatalog } from "./protocol-evidence-catalog.mjs";

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
const catalog = buildProtocolEvidenceCatalog();
assert.equal(registry.entries.length, 12, "frozen catalog must bind twelve exact packs from eleven source entries");
assert.deepEqual(registry, catalog.registry, "stored registry must equal deterministic catalog output");

const questionIds = ["accepted-completion", "authority-revocation", "causal-history", "recovery-drift", "retry-identity", "work-version"];
const coveredSources = new Set();
for (const pack of catalog.packs) {
  const report = verifyProtocolSemanticsDocument(pack);
  assert.equal(report.valid, true, `${pack.protocol.id}: ${JSON.stringify(report.issues)}`);
  assert.deepEqual(pack.semantics.map(({ id }) => id), questionIds, `${pack.protocol.id}: exact six-question mapping required`);
  assert.equal(pack.responsibility.outOfScopeIsFailure, false);
  assert.equal(pack.responsibility.protocolOwns.some((value) => pack.responsibility.kfdWorkOwns.includes(value)), false, `${pack.protocol.id}: protocol and KFD Work responsibility must remain separate`);
  assert.deepEqual(pack.sourceBoundary, { mode: "bounded-paraphrase", fullSpecificationVendored: false, excerptWords: 0 });
  coveredSources.add(pack.catalogSourceId);
}
assert.deepEqual([...coveredSources].sort(), catalog.source.sourceCatalog.map(({ id }) => id).sort(), "every frozen source entry must produce at least one pack");
assert.equal(catalog.packs.some((pack) => pack.protocol.id === "acp"), false, "bare ACP identity is ambiguous");
assert.equal(catalog.packs.some((pack) => pack.protocol.id === "zed-acp"), true);
assert.equal(catalog.packs.some((pack) => pack.protocol.id === "commerce-acp"), true);
assert.equal(catalog.packs.find((pack) => pack.protocol.id === "ietf-aiagent-auth-draft-03").maturity.status, "draft");
assert.equal(catalog.packs.find((pack) => pack.protocol.id === "webmcp-cg-draft").maturity.status, "incubating");

function catalogMutationIssues(pack) {
  const issues = verifyProtocolSemanticsDocument(pack).issues.map(({ code }) => code);
  if (pack.protocol?.id === "acp") issues.push("psl-acp-namespace-invalid");
  if (pack.protocol?.id === "ietf-aiagent-auth-draft-03" && pack.maturity?.status !== "draft") issues.push("psl-maturity-invalid");
  if (pack.protocol?.id === "webmcp-cg-draft" && pack.maturity?.status !== "incubating") issues.push("psl-maturity-invalid");
  return [...new Set(issues)].sort();
}

const mutationCases = [
  {
    name: "missing paired-world question",
    source: "mcp-tasks",
    mutate(pack) { pack.semantics.pop(); },
    issue: "psl-semantic-coverage-incomplete",
  },
  {
    name: "out-of-scope scored as failure",
    source: "a2ui",
    mutate(pack) { pack.responsibility.outOfScopeIsFailure = true; },
    issue: "psl-responsibility-collapsed",
  },
  {
    name: "mutable drift policy",
    source: "ag-ui",
    mutate(pack) { pack.drift.policy = "follow-latest"; },
    issue: "psl-coordinate-mutable",
  },
  {
    name: "bare ACP namespace",
    source: "zed-acp",
    mutate(pack) { pack.protocol.id = "acp"; },
    issue: "psl-acp-namespace-invalid",
  },
  {
    name: "IETF draft rendered stable",
    source: "ietf-aiagent-auth-draft-03",
    mutate(pack) { pack.maturity.status = "stable"; pack.drift.sourceStatus = "stable"; },
    issue: "psl-maturity-invalid",
  },
  {
    name: "WebMCP incubation rendered stable",
    source: "webmcp-cg-draft",
    mutate(pack) { pack.maturity.status = "stable"; pack.drift.sourceStatus = "stable"; },
    issue: "psl-maturity-invalid",
  },
  {
    name: "vendored specification boundary",
    source: "a2a-task",
    mutate(pack) { pack.sourceBoundary.fullSpecificationVendored = true; },
    issue: "psl-source-boundary-invalid",
  },
];
for (const testCase of mutationCases) {
  const mutated = structuredClone(catalog.packs.find((pack) => pack.protocol.id === testCase.source));
  testCase.mutate(mutated);
  assert.equal(catalogMutationIssues(mutated).includes(testCase.issue), true, `${testCase.name} must fail with ${testCase.issue}`);
}

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
for (const [relativePath, bytes] of catalog.files) {
  assert.equal(fs.readFileSync(path.join(root, relativePath), "utf8"), bytes, `${relativePath} is stale or nondeterministic`);
}
const expectedPackFiles = registry.entries.map(({ packPath }) => path.basename(packPath)).sort();
assert.deepEqual(fs.readdirSync(path.join(profileRoot, "packs")).filter((name) => name.endsWith(".json")).sort(), expectedPackFiles, "pack directory must contain exactly the registered generated files");

const exactExports = {
  "./protocol-semantics-lab/manifest.json": "./profiles/protocol-semantics-lab/manifest.json",
  "./protocol-semantics-lab/registry.json": "./profiles/protocol-semantics-lab/registry.json",
  "./protocol-semantics-lab/contract-reference.json": "./profiles/protocol-semantics-lab/generated/contract-reference.json",
  "./protocol-semantics-lab/catalog-reference.json": "./profiles/protocol-semantics-lab/generated/catalog-reference.json",
  "./protocol-semantics-lab/catalog-comparison.md": "./profiles/protocol-semantics-lab/generated/catalog-comparison.md",
  "./protocol-semantics-lab/verifier": "./scripts/protocol-semantics-contract.mjs",
};
for (const [exportName, target] of Object.entries(exactExports)) assert.equal(packageJson.exports?.[exportName], target);
for (const directory of ["profiles", "schemas", "scripts"]) assert.equal(packageJson.files?.includes(directory), true, `npm files must include ${directory}`);
assert.equal(packageJson.version, "1.0.0-alpha.68", "architecture work must not rewrite the immutable alpha.68 coordinate");
assert.equal(packageJson.scripts?.["check:protocol-semantics-lab"], "node scripts/check-protocol-semantics-lab.mjs");
assert.equal(packageJson.scripts?.["generate:protocol-semantics-reference"], "node scripts/generate-protocol-semantics-reference.mjs --write");
assert.equal(packageJson.scripts?.check?.includes("npm run check:protocol-semantics-lab"), true);

console.log(`protocol semantics lab: ${cases.valid.length} valid fixtures, ${cases.negative.length} architecture negatives, ${catalog.packs.length} frozen packs, ${mutationCases.length} catalog mutations, six-pair compatibility, roots, exports, and generated references ok`);
