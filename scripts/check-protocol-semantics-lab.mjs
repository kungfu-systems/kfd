#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
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
import {
  adaptProtocolTrace,
  adapterInventory,
  inspectProtocolTraceFixture,
} from "./protocol-observation-adapters.mjs";
import {
  FIXED_ROUTE_IDS,
  ROUTE_RESULT_STATES,
  analyzeCrossProtocolRouteSuite,
  buildFixedCrossProtocolRouteSuite,
} from "./cross-protocol-route-analyzer.mjs";
import {
  buildProtocolSemanticsReport,
  buildRouteSemanticsReport,
  deriveCapabilityManifest,
  listProtocolSemantics,
  verifyProtocolSemanticsReport,
} from "./protocol-semantics-report.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const profileRoot = path.join(root, "profiles", "protocol-semantics-lab");
const manifest = readJson(path.join(profileRoot, "manifest.json"));
const registry = readJson(path.join(profileRoot, "registry.json"));
const cases = readJson(path.join(profileRoot, "fixtures", "cases.json"));
const packageJson = readJson(path.join(root, "package.json"));
const adapterCases = readJson(path.join(profileRoot, "fixtures", "adapters", "cases.json"));

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

const inventory = adapterInventory();
assert.equal(inventory.length, 4);
assert.deepEqual(inventory.map(({ protocolId }) => protocolId).sort(), ["a2a-task", "ag-ui", "mcp-tasks", "zed-acp"]);
assert.equal(manifest.observationAdapters.protocolCount, inventory.length);
assert.equal(manifest.observationAdapters.networkRequired, false);
const adapterSource = fs.readFileSync(path.join(root, manifest.observationAdapters.module), "utf8");
for (const forbidden of ["node:http", "node:https", "node:net", "node:tls", "fetch(", "WebSocket"]) {
  assert.equal(adapterSource.includes(forbidden), false, `offline adapter must not contain network primitive: ${forbidden}`);
}

const observedScenarios = new Set();
const preservationStates = new Set();
for (const relativePath of adapterCases.valid) {
  const fixture = readJson(path.join(profileRoot, "fixtures", "adapters", relativePath));
  assert.equal(inspectProtocolTraceFixture(fixture).valid, true, relativePath);
  const first = adaptProtocolTrace(fixture);
  const second = adaptProtocolTrace(JSON.parse(JSON.stringify(fixture)));
  assert.deepEqual(first, second, `${relativePath}: adapter output and roots must be deterministic`);
  assert.equal(verifyProtocolSemanticsDocument(first.observation).valid, true, relativePath);
  assert.equal(first.outputRoot, semanticRoot(first.observation));
  assert.equal(first.transcriptRoot, first.observation.transcriptRoot);
  assert.equal(first.observation.facts.every((fact) => fact.source.status === "native" ? fact.evidenceRoots.length === 1 : fact.source.status === "absent" && fact.evidenceRoots.length === 0), true);
  assert.equal(first.observation.facts.some((fact) => fact.id === "work-id" && fact.source.status === "absent"), true, "adapter must not invent canonical Work identity");
  assert.equal(first.observation.facts.some((fact) => fact.id === "accepted-completion" && fact.source.status === "absent"), true, "adapter must not invent accepted completion");
  observedScenarios.add(first.observation.scenario.kind);
  preservationStates.add(first.observation.scenario.identityPreservation);
}
assert.deepEqual([...observedScenarios].sort(), ["executor-replacement", "resume", "retry"]);
assert.deepEqual([...preservationStates].sort(), ["ambiguous", "preserved"]);

for (const testCase of adapterCases.negative) {
  const fixture = readJson(path.join(profileRoot, "fixtures", "adapters", testCase.path));
  const inspection = inspectProtocolTraceFixture(fixture);
  assert.equal(inspection.valid, false, `${testCase.path} must fail closed`);
  assert.equal(inspection.issues.some(({ code }) => code === testCase.issueCode), true, `${testCase.path} must report ${testCase.issueCode}`);
  assert.throws(() => adaptProtocolTrace(fixture), /failed closed/u);
}

const routeSuite = buildFixedCrossProtocolRouteSuite();
const routeReport = analyzeCrossProtocolRouteSuite(routeSuite);
assert.equal(routeReport.valid, true, JSON.stringify(routeReport.issues));
assert.deepEqual(routeSuite.routes.map(({ id }) => id), [...FIXED_ROUTE_IDS]);
assert.deepEqual(ROUTE_RESULT_STATES, ["preserved", "extension-required", "out-of-scope", "collapsed"]);
assert.equal(routeSuite.routes.some((route) => route.result.state === "preserved" && route.hops.every((hop) => hop.mappings.every((mapping) => mapping.state === "preserved"))), true);
assert.equal(routeSuite.routes.some((route) => route.result.state === "collapsed" && route.result.pairedWorldCollapse), true);
assert.equal(routeSuite.routes.find(({ id }) => id === "commerce-authorization-to-accepted-completion").hops.length, 2);
for (const route of routeSuite.routes) {
  assert.equal(route.hops.every((hop) => ["input", "output", "mappings", "losses", "inference", "authorityTransition"].every((field) => Object.hasOwn(hop, field))), true, `${route.id}: every hop must declare the exact semantic surfaces`);
}

function routeMutation(mutator) {
  const mutated = structuredClone(routeSuite);
  mutator(mutated);
  return analyzeCrossProtocolRouteSuite(mutated);
}

const permutation = routeMutation((suite) => suite.routes[2].hops.reverse());
assert.equal(permutation.valid, false);
assert.equal(permutation.issues.some(({ code }) => code === "psl-route-permutation-invalid"), true);
const omittedHop = routeMutation((suite) => suite.routes[2].hops.pop());
assert.equal(omittedHop.valid, false);
assert.equal(omittedHop.issues.some(({ code }) => code === "psl-route-hop-omitted"), true);
const stalePack = routeMutation((suite) => { suite.routes[0].hops[0].input.evidencePackRoot = `sha256:${"0".repeat(64)}`; });
assert.equal(stalePack.valid, false);
assert.equal(stalePack.issues.some(({ code }) => code === "psl-route-stale-pack"), true);
const authorityRevision = routeMutation((suite) => { suite.routes[0].hops[0].authorityTransition.toRevision = `sha256:${"1".repeat(64)}`; });
assert.equal(authorityRevision.valid, false);
assert.equal(authorityRevision.issues.some(({ code }) => code === "psl-authority-revision-mismatch"), true);
const unknownRouteState = routeMutation((suite) => { suite.routes[0].hops[0].mappings[0].state = "represented"; });
assert.equal(unknownRouteState.valid, false);
assert.equal(unknownRouteState.issues.some(({ code }) => code === "psl-state-contradictory"), true);
const hiddenLoss = routeMutation((suite) => { suite.routes[0].hops[0].losses = []; });
assert.equal(hiddenLoss.valid, false);
assert.equal(hiddenLoss.issues.some(({ code }) => code === "psl-route-loss-hidden"), true);
const replacedWork = routeMutation((suite) => { suite.routes[0].hops[0].output.canonicalWorkRoot = `sha256:${"2".repeat(64)}`; });
assert.equal(replacedWork.valid, false);
assert.equal(replacedWork.issues.some(({ code }) => code === "psl-work-identity-synthetic"), true);
for (const syntheticKind of ["session", "task", "invocation", "payment", "message"]) {
  const syntheticIdentity = routeMutation((suite) => {
    suite.routes[0].hops[0].input.canonicalWorkRoot = `${syntheticKind}-123`;
    suite.routes[0].hops[0].input.canonicalWorkSource = syntheticKind;
  });
  assert.equal(syntheticIdentity.valid, false, `${syntheticKind} identity cannot substitute for canonical Work`);
  assert.equal(syntheticIdentity.issues.some(({ code }) => code === "psl-work-identity-synthetic"), true);
  assert.equal(syntheticIdentity.issues.some(({ code }) => code === "psl-root-missing"), true);
}
const analyzerSource = fs.readFileSync(path.join(root, "scripts", "cross-protocol-route-analyzer.mjs"), "utf8");
for (const forbidden of ["node:http", "node:https", "node:net", "node:tls", "fetch(", "WebSocket"]) {
  assert.equal(analyzerSource.includes(forbidden), false, `offline route analyzer must not contain network primitive: ${forbidden}`);
}

assert.deepEqual(manifest.sourceCut, {
  repository: "kungfu-systems/kfd",
  baselineGitHead: "d0542ea9bb8bfb3ed9004c28bc6629edf0ca21d4",
});
assert.deepEqual(manifest.reportCli, {
  module: "scripts/protocol-semantics-report.mjs",
  reportContract: "kfd.protocol-semantics-report/v1",
  verifierContract: "kfd.protocol-semantics-report-verifier/v1",
  networkRequired: false,
  claim: "evidence-closure-only",
});
const protocolCatalog = listProtocolSemantics();
assert.equal(protocolCatalog.protocols.length, 12);
assert.equal(protocolCatalog.fixtures.length, adapterCases.valid.length);
assert.equal(protocolCatalog.routes.length, FIXED_ROUTE_IDS.length);

const protocolReport = buildProtocolSemanticsReport({ fixtureId: "mcp-executor-replacement-preserved" });
const protocolVerification = verifyProtocolSemanticsReport(protocolReport);
assert.equal(protocolVerification.valid, true, JSON.stringify(protocolVerification.issues));
assert.equal(protocolReport.sourceCut.package, "@kungfu-tech/kfd");
assert.equal(protocolReport.sourceCut.gitHead, manifest.sourceCut.baselineGitHead);
for (const binding of [
  protocolReport.suite.root,
  protocolReport.pack.root,
  protocolReport.mapping.root,
  protocolReport.route.suiteRoot,
  protocolReport.fixture.documentRoot,
  protocolReport.adapter.artifactRoot,
  protocolReport.transcript.root,
  protocolReport.result.resultRoot,
  protocolReport.claimBoundary.root,
  protocolReport.residualRisks.root,
  protocolReport.reportRoot,
]) assert.match(binding, /^sha256:[0-9a-f]{64}$/u);

const protocolJson = cliJson(["challenge", "delegated-work", "protocol", "analyze", "--fixture", "mcp-executor-replacement-preserved"]);
const protocolHuman = run(process.execPath, [path.join(root, "bin", "kfd.mjs"), "challenge", "delegated-work", "protocol", "analyze", "--fixture", "mcp-executor-replacement-preserved"]).stdout;
assert.equal(protocolJson.result.resultRoot, protocolReport.result.resultRoot);
assert.match(protocolHuman, new RegExp(protocolReport.result.resultRoot.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"), "u"));

for (const [name, mutate, issueCode] of [
  ["fixture bytes", (report) => { report.fixture.byteRoot = `sha256:${"0".repeat(64)}`; }, "fixture-drift"],
  ["residual-risk order", (report) => { report.residualRisks.risks.reverse(); }, "residual-risk-drift"],
  ["source", (report) => { report.sourceCut.gitHead = "0".repeat(40); }, "source-byte-drift"],
  ["adapter", (report) => { report.adapter.artifactRoot = `sha256:${"1".repeat(64)}`; }, "adapter-drift"],
  ["claim boundary", (report) => { report.claimBoundary.claim = "broader-claim"; }, "claim-boundary-drift"],
]) {
  const mutated = structuredClone(protocolReport);
  mutate(mutated);
  const verification = verifyProtocolSemanticsReport(mutated);
  assert.equal(verification.valid, false, `${name} mutation must fail closed`);
  assert.equal(verification.issues.some(({ code }) => code === issueCode), true, `${name} must report ${issueCode}`);
}

const preservedRouteReport = buildRouteSemanticsReport({ routeId: "mcp-to-a2a" });
const collapsedRouteReport = buildRouteSemanticsReport({ routeId: "durable-runtime-recovery-to-canonical-work" });
assert.equal(preservedRouteReport.result.state, "preserved");
assert.equal(collapsedRouteReport.result.state, "collapsed");
assert.equal(verifyProtocolSemanticsReport(preservedRouteReport).valid, true);
assert.equal(verifyProtocolSemanticsReport(collapsedRouteReport).valid, true);

const derived = deriveCapabilityManifest(protocolReport);
assert.equal(derived.sourceReportRoot, protocolReport.reportRoot);
assert.equal(verifyProtocolSemanticsDocument(derived.manifest).valid, true);
assert.equal(derived.manifest.capabilities.some(({ state }) => state === "verified"), true);
assert.equal(derived.manifest.capabilities.every(({ state, verificationRoots }) => state !== "verified" || verificationRoots.includes(protocolReport.reportRoot)), true);

const reportTemporary = fs.mkdtempSync(path.join(os.tmpdir(), "kfd-protocol-report-"));
try {
  const reportPath = path.join(reportTemporary, "report.json");
  fs.writeFileSync(reportPath, `${JSON.stringify(protocolReport, null, 2)}\n`);
  const verifierHuman = run(process.execPath, [path.join(root, "bin", "kfd.mjs"), "verify", "delegated-work-protocol-report", reportPath]).stdout;
  assert.match(verifierHuman, /Evidence closure: valid/u);
  assert.match(verifierHuman, /Claim: evidence-closure-only/u);
  assert.equal(/certif|production[- ]fitness/iu.test(verifierHuman), false, "verifier output must remain closure-only");
} finally {
  fs.rmSync(reportTemporary, { recursive: true, force: true });
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
  "./protocol-semantics-lab/observation-adapters": "./scripts/protocol-observation-adapters.mjs",
  "./protocol-semantics-lab/route-analyzer": "./scripts/cross-protocol-route-analyzer.mjs",
  "./protocol-semantics-lab/report.schema.json": "./schemas/kfd-protocol-semantics/protocol-semantics-report.schema.json",
  "./protocol-semantics-lab/report-cli": "./scripts/protocol-semantics-report.mjs",
  "./protocol-semantics-lab/report-verifier": "./scripts/protocol-semantics-report.mjs",
};
for (const [exportName, target] of Object.entries(exactExports)) assert.equal(packageJson.exports?.[exportName], target);
for (const directory of ["profiles", "schemas", "scripts"]) assert.equal(packageJson.files?.includes(directory), true, `npm files must include ${directory}`);
assert.equal(packageJson.version, "1.0.0-alpha.68", "architecture work must not rewrite the immutable alpha.68 coordinate");
assert.equal(packageJson.scripts?.["check:protocol-semantics-lab"], "node scripts/check-protocol-semantics-lab.mjs");
assert.equal(packageJson.scripts?.["generate:protocol-semantics-reference"], "node scripts/generate-protocol-semantics-reference.mjs --write");
assert.equal(packageJson.scripts?.check?.includes("npm run check:protocol-semantics-lab"), true);

console.log(`protocol semantics lab: ${cases.valid.length} architecture fixtures, ${adapterCases.valid.length} deterministic adapter traces, ${adapterCases.negative.length} adapter negatives, ${routeSuite.routes.length} fixed routes, ${catalog.packs.length} frozen packs, six-pair compatibility, roots, exports, and generated references ok`);
