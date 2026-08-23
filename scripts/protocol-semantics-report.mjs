#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import {
  canonicalJson,
  exactByteRoot,
  packageRoot,
  semanticRoot,
  verifyProtocolSemanticsDocument,
} from "./protocol-semantics-contract.mjs";
import {
  analyzeCrossProtocolRouteSuite,
  buildFixedCrossProtocolRouteSuite,
} from "./cross-protocol-route-analyzer.mjs";
import { adaptProtocolTrace } from "./protocol-observation-adapters.mjs";

export const REPORT_CONTRACT = "kfd.protocol-semantics-report/v1";
export const VERIFIER_CONTRACT = "kfd.protocol-semantics-report-verifier/v1";

const PROFILE_ROOT = path.join(packageRoot, "profiles", "protocol-semantics-lab");
const FIXTURE_ROOT = path.join(PROFILE_ROOT, "fixtures", "adapters");
const CLAIM_BOUNDARY_VALUE = Object.freeze({
  claim: "evidence-closure-only",
  informationRepresentationExperiment: true,
  runtimeAuthority: false,
  numberedKfdAuthority: false,
  externalRealityObserved: false,
});

function claimBoundaryClosure() {
  return { ...structuredClone(CLAIM_BOUNDARY_VALUE), root: semanticRoot(CLAIM_BOUNDARY_VALUE) };
}

function readBytes(relativePath) {
  const absolute = path.join(packageRoot, relativePath);
  const stat = fs.lstatSync(absolute);
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`${relativePath} must be a regular packaged file`);
  return fs.readFileSync(absolute);
}

function readJson(relativePath) {
  return JSON.parse(readBytes(relativePath).toString("utf8"));
}

function compareUtf8(left, right) {
  return Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
}

function same(left, right) {
  return canonicalJson(left) === canonicalJson(right);
}

function sourceClosure() {
  const packageBytes = readBytes("package.json");
  const releaseBytes = readBytes("kfd.release.json");
  const profileBytes = readBytes("profiles/protocol-semantics-lab/manifest.json");
  const packageJson = JSON.parse(packageBytes.toString("utf8"));
  const profile = JSON.parse(profileBytes.toString("utf8"));
  return {
    repository: "kungfu-systems/kfd",
    package: packageJson.name,
    packageVersion: packageJson.version,
    gitHead: profile.sourceCut.baselineGitHead,
    packageManifestRoot: exactByteRoot(packageBytes),
    releaseAnchorRoot: exactByteRoot(releaseBytes),
    profileManifestRoot: exactByteRoot(profileBytes),
  };
}

function registryClosure() {
  const registry = readJson("profiles/protocol-semantics-lab/registry.json");
  const verification = verifyProtocolSemanticsDocument(registry, { rootDirectory: packageRoot });
  if (!verification.valid) throw new Error("packaged protocol registry failed closure verification");
  return { registry, root: semanticRoot(registry) };
}

function delegatedSuiteClosure() {
  const manifest = readJson("profiles/delegated-work-challenge/manifest.json");
  const suite = readJson(manifest.suite.path);
  return { id: suite.id, version: suite.version, root: semanticRoot(suite) };
}

function residualRiskClosure() {
  const delegated = readJson("profiles/delegated-work-challenge/manifest.json");
  const risks = delegated.residualRisks.map((summary) => ({ summary, root: semanticRoot({ summary }) }));
  return { risks, root: semanticRoot(risks) };
}

function findPack(protocolId) {
  const { registry, root: registryRoot } = registryClosure();
  const entry = registry.entries.find((candidate) => candidate.protocolId === protocolId);
  if (!entry) throw new Error(`unknown packaged protocol: ${protocolId}`);
  const pack = readJson(entry.packPath);
  const verification = verifyProtocolSemanticsDocument(pack);
  if (!verification.valid || semanticRoot(pack) !== entry.packRoot) throw new Error(`packaged protocol pack failed closure verification: ${protocolId}`);
  return { entry, pack, registryRoot };
}

function fixtureInventory() {
  const cases = readJson("profiles/protocol-semantics-lab/fixtures/adapters/cases.json");
  return cases.valid.map((relativePath) => {
    const source = `profiles/protocol-semantics-lab/fixtures/adapters/${relativePath}`;
    const document = readJson(source);
    return { id: document.id, protocolId: document.protocol.protocolId, source };
  }).sort((left, right) => compareUtf8(left.id, right.id));
}

function findFixture(fixtureId) {
  const selected = fixtureInventory().find(({ id }) => id === fixtureId);
  if (!selected) throw new Error(`unknown packaged protocol fixture: ${fixtureId}`);
  const bytes = readBytes(selected.source);
  const document = JSON.parse(bytes.toString("utf8"));
  return { ...selected, bytesRoot: exactByteRoot(bytes), document, documentRoot: semanticRoot(document) };
}

function routeClosure(routeId) {
  const suite = buildFixedCrossProtocolRouteSuite();
  const verification = analyzeCrossProtocolRouteSuite(suite);
  if (!verification.valid) throw new Error("fixed cross-protocol route suite failed closure verification");
  const route = routeId ? suite.routes.find(({ id }) => id === routeId) : null;
  if (routeId && !route) throw new Error(`unknown fixed route: ${routeId}`);
  return {
    suite,
    suiteRoot: semanticRoot(suite),
    verificationRoot: verification.reportRoot,
    ...(route ? { route, routeRoot: semanticRoot(route) } : {}),
  };
}

function rootReport(report) {
  const copy = structuredClone(report);
  delete copy.reportRoot;
  return semanticRoot(copy);
}

export function listProtocolSemantics() {
  const { registry, root } = registryClosure();
  return {
    schemaVersion: 1,
    contract: "kfd.protocol-semantics-catalog/v1",
    registryRoot: root,
    protocols: registry.entries.map(({ protocolId, protocolVersion, packRoot }) => ({ protocolId, protocolVersion, packRoot })),
    fixtures: fixtureInventory(),
    routes: routeClosure().suite.routes.map(({ id, result }) => ({ id, state: result.state })),
    claim: "evidence-closure-only",
  };
}

export function inspectProtocolSemantics(protocolId) {
  const { entry, pack, registryRoot } = findPack(protocolId);
  return {
    schemaVersion: 1,
    contract: "kfd.protocol-semantics-inspection/v1",
    registryRoot,
    protocol: { protocolId: entry.protocolId, protocolVersion: entry.protocolVersion, packRoot: entry.packRoot },
    semantics: structuredClone(pack.semantics),
    responsibility: structuredClone(pack.responsibility),
    claim: "evidence-closure-only",
    inspectionRoot: semanticRoot({ entry, semantics: pack.semantics, responsibility: pack.responsibility }),
  };
}

export function buildProtocolSemanticsReport({ fixtureId }) {
  const fixture = findFixture(fixtureId);
  const { entry, pack, registryRoot } = findPack(fixture.protocolId);
  const adapted = adaptProtocolTrace(fixture.document);
  const observationVerification = verifyProtocolSemanticsDocument(adapted.observation);
  if (!observationVerification.valid) throw new Error(`fixture adaptation failed closure verification: ${fixtureId}`);
  const routes = routeClosure();
  const result = {
    state: adapted.observation.scenario.identityPreservation,
    observationRoot: adapted.outputRoot,
    resultRoot: semanticRoot({ observation: adapted.observation, transcriptRoot: adapted.transcriptRoot }),
  };
  const report = {
    schemaVersion: 1,
    contract: REPORT_CONTRACT,
    mode: "protocol",
    sourceCut: sourceClosure(),
    suite: delegatedSuiteClosure(),
    registry: { root: registryRoot },
    pack: { protocolId: entry.protocolId, protocolVersion: entry.protocolVersion, root: entry.packRoot },
    mapping: { root: semanticRoot(pack.semantics) },
    route: { suiteRoot: routes.suiteRoot, verificationRoot: routes.verificationRoot },
    fixture: { id: fixture.id, source: fixture.source, byteRoot: fixture.bytesRoot, documentRoot: fixture.documentRoot },
    adapter: {
      id: adapted.observation.adapter.id,
      version: adapted.observation.adapter.version,
      artifactRoot: adapted.observation.adapter.artifactRoot,
    },
    transcript: { root: adapted.transcriptRoot },
    result,
    observation: adapted.observation,
    claimBoundary: claimBoundaryClosure(),
    residualRisks: residualRiskClosure(),
  };
  report.reportRoot = rootReport(report);
  return report;
}

export function buildRouteSemanticsReport({ routeId }) {
  const routes = routeClosure(routeId);
  const report = {
    schemaVersion: 1,
    contract: REPORT_CONTRACT,
    mode: "route",
    sourceCut: sourceClosure(),
    suite: delegatedSuiteClosure(),
    registry: { root: registryClosure().root },
    route: { id: routeId, suiteRoot: routes.suiteRoot, root: routes.routeRoot, verificationRoot: routes.verificationRoot },
    result: { state: routes.route.result.state, resultRoot: semanticRoot(routes.route.result) },
    claimBoundary: claimBoundaryClosure(),
    residualRisks: residualRiskClosure(),
  };
  report.reportRoot = rootReport(report);
  return report;
}

function addIssue(issues, code, detail) {
  issues.push({ code, detail });
}

export function verifyProtocolSemanticsReport(report) {
  const issues = [];
  if (report?.schemaVersion !== 1 || report?.contract !== REPORT_CONTRACT) addIssue(issues, "report-contract-invalid", "report contract is unsupported");
  try {
    if (!same(report.sourceCut, sourceClosure())) addIssue(issues, "source-byte-drift", "package, gitHead, or source bytes do not match the installed package");
    if (!same(report.suite, delegatedSuiteClosure())) addIssue(issues, "suite-drift", "paired-world suite closure changed");
    if (!same(report.claimBoundary, claimBoundaryClosure())) addIssue(issues, "claim-boundary-drift", "the closure-only claim boundary or root changed");
    if (!same(report.residualRisks, residualRiskClosure())) addIssue(issues, "residual-risk-drift", "residual-risk order or roots changed");
    if (report.mode === "protocol") {
      const fixture = findFixture(report.fixture?.id);
      const { entry, pack, registryRoot } = findPack(fixture.protocolId);
      const adapted = adaptProtocolTrace(fixture.document);
      const routes = routeClosure();
      const expected = {
        registry: { root: registryRoot },
        pack: { protocolId: entry.protocolId, protocolVersion: entry.protocolVersion, root: entry.packRoot },
        mapping: { root: semanticRoot(pack.semantics) },
        route: { suiteRoot: routes.suiteRoot, verificationRoot: routes.verificationRoot },
        fixture: { id: fixture.id, source: fixture.source, byteRoot: fixture.bytesRoot, documentRoot: fixture.documentRoot },
        adapter: { id: adapted.observation.adapter.id, version: adapted.observation.adapter.version, artifactRoot: adapted.observation.adapter.artifactRoot },
        transcript: { root: adapted.transcriptRoot },
        observation: adapted.observation,
        result: {
          state: adapted.observation.scenario.identityPreservation,
          observationRoot: adapted.outputRoot,
          resultRoot: semanticRoot({ observation: adapted.observation, transcriptRoot: adapted.transcriptRoot }),
        },
      };
      for (const key of Object.keys(expected)) if (!same(report[key], expected[key])) addIssue(issues, `${key}-drift`, `${key} closure changed`);
    } else if (report.mode === "route") {
      const routes = routeClosure(report.route?.id);
      const expected = {
        registry: { root: registryClosure().root },
        route: { id: report.route.id, suiteRoot: routes.suiteRoot, root: routes.routeRoot, verificationRoot: routes.verificationRoot },
        result: { state: routes.route.result.state, resultRoot: semanticRoot(routes.route.result) },
      };
      for (const key of Object.keys(expected)) if (!same(report[key], expected[key])) addIssue(issues, `${key}-drift`, `${key} closure changed`);
    } else addIssue(issues, "report-mode-invalid", "report mode must be protocol or route");
    if (report.reportRoot !== rootReport(report)) addIssue(issues, "report-root-drift", "report root does not recompute");
  } catch (error) {
    addIssue(issues, "report-unverifiable", error.message);
  }
  issues.sort((left, right) => compareUtf8(`${left.code}\0${left.detail}`, `${right.code}\0${right.detail}`));
  const result = {
    schemaVersion: 1,
    contract: VERIFIER_CONTRACT,
    valid: issues.length === 0,
    claim: "evidence-closure-only",
    resultRoot: report?.result?.resultRoot ?? null,
    reportRoot: report?.reportRoot ?? null,
    issues,
  };
  return { ...result, verificationRoot: semanticRoot(result) };
}

export function deriveCapabilityManifest(report) {
  const verification = verifyProtocolSemanticsReport(report);
  if (!verification.valid || report.mode !== "protocol") throw new Error("capability derivation requires a verified protocol report root");
  const capabilities = report.observation.facts.map((fact) => {
    const represented = fact.state === "represented";
    return {
      id: fact.id,
      state: represented ? "verified" : "declared",
      declarationRoots: [report.pack.root],
      observationRoots: represented ? [report.result.observationRoot] : [],
      verificationRoots: represented ? [report.reportRoot] : [],
    };
  }).sort((left, right) => compareUtf8(left.id, right.id));
  const manifest = {
    schemaVersion: 1,
    contract: "kfd.derived-capability-manifest/v1",
    id: `${report.pack.protocolId}-${report.fixture.id}-capabilities`,
    subject: {
      protocolId: report.pack.protocolId,
      protocolVersion: report.pack.protocolVersion,
      evidencePackRoot: report.pack.root,
      observationRoot: report.result.observationRoot,
    },
    capabilities,
    claimBoundary: { derivedEvidenceStateOnly: true, certification: false, runtimeAuthority: false, productionFitness: false },
  };
  const manifestVerification = verifyProtocolSemanticsDocument(manifest);
  if (!manifestVerification.valid) throw new Error(`derived capability manifest failed closure verification: ${JSON.stringify(manifestVerification.issues)}`);
  return { manifest, manifestRoot: semanticRoot(manifest), sourceReportRoot: report.reportRoot, verificationRoot: verification.verificationRoot };
}

function parseFlags(args, admitted) {
  const flags = { json: false };
  for (let index = 0; index < args.length; index += 1) {
    const flag = args[index];
    if (flag === "--json") flags.json = true;
    else if (admitted.includes(flag) && args[index + 1] && !args[index + 1].startsWith("--")) flags[flag.slice(2)] = args[++index];
    else throw new Error(`unsupported or incomplete argument: ${flag}`);
  }
  return flags;
}

function writeJson(output, value) {
  const absolute = path.resolve(output);
  if (!fs.existsSync(path.dirname(absolute))) throw new Error(`output parent does not exist: ${path.dirname(absolute)}`);
  fs.writeFileSync(absolute, `${JSON.stringify(value, null, 2)}\n`, { flag: "wx" });
}

function renderHuman(value) {
  if (value.contract === "kfd.protocol-semantics-catalog/v1") return [
    "KFD Delegated Work Protocol Catalog",
    ...value.protocols.map(({ protocolId, protocolVersion, packRoot }) => `${protocolId}@${protocolVersion} ${packRoot}`),
    `Routes: ${value.routes.map(({ id, state }) => `${id}=${state}`).join(", ")}`,
    `Claim: ${value.claim}`,
  ].join("\n");
  if (value.contract === "kfd.protocol-semantics-inspection/v1") return [
    `${value.protocol.protocolId}@${value.protocol.protocolVersion}`,
    `Pack root: ${value.protocol.packRoot}`,
    `Semantics: ${value.semantics.map(({ id, state }) => `${id}=${state}`).join(", ")}`,
    `Result root: ${value.inspectionRoot}`,
    `Claim: ${value.claim}`,
  ].join("\n");
  if (value.contract === REPORT_CONTRACT) return [
    `KFD Delegated Work ${value.mode === "route" ? "Route" : "Protocol"} Report`,
    value.mode === "route" ? `Route: ${value.route.id}` : `Protocol: ${value.pack.protocolId}@${value.pack.protocolVersion}`,
    `Result: ${value.result.state}`,
    `Result root: ${value.result.resultRoot}`,
    `Report root: ${value.reportRoot}`,
    `Claim: ${value.claimBoundary.claim}`,
  ].join("\n");
  return JSON.stringify(value, null, 2);
}

export function runProtocolSemanticsCli(args) {
  const [family, command, ...rest] = args;
  let value;
  let output;
  let json = rest.includes("--json");
  if (family === "protocol" && command === "list") {
    const flags = parseFlags(rest, []);
    json = flags.json;
    value = listProtocolSemantics();
  } else if (family === "protocol" && command === "inspect") {
    const protocolId = rest[0];
    if (!protocolId || protocolId.startsWith("--")) throw new Error("protocol inspect requires a protocol id");
    const flags = parseFlags(rest.slice(1), []);
    json = flags.json;
    value = inspectProtocolSemantics(protocolId);
  } else if (family === "protocol" && command === "analyze") {
    const flags = parseFlags(rest, ["--fixture", "--output"]);
    if (!flags.fixture) throw new Error("protocol analyze requires --fixture <packaged-fixture-id>");
    value = buildProtocolSemanticsReport({ fixtureId: flags.fixture });
    output = flags.output;
    json = flags.json;
  } else if (family === "route" && command === "analyze") {
    const flags = parseFlags(rest, ["--route", "--output"]);
    if (!flags.route) throw new Error("route analyze requires --route <fixed-route-id>");
    value = buildRouteSemanticsReport({ routeId: flags.route });
    output = flags.output;
    json = flags.json;
  } else if (family === "manifest" && command === "derive") {
    const reportPath = rest[0];
    if (!reportPath || reportPath.startsWith("--")) throw new Error("manifest derive requires a protocol report path");
    const flags = parseFlags(rest.slice(1), ["--output"]);
    const derived = deriveCapabilityManifest(JSON.parse(fs.readFileSync(path.resolve(reportPath), "utf8")));
    value = derived.manifest;
    output = flags.output;
    json = flags.json;
  } else throw new Error("expected protocol list|inspect|analyze, route analyze, or manifest derive");
  if (output) writeJson(output, value);
  console.log(json ? JSON.stringify(value) : renderHuman(value));
  return 0;
}

export function runProtocolSemanticsVerifier(args) {
  const reportPath = args[0];
  if (!reportPath || reportPath.startsWith("--")) throw new Error("protocol report verification requires a report path");
  const flags = parseFlags(args.slice(1), []);
  const report = JSON.parse(fs.readFileSync(path.resolve(reportPath), "utf8"));
  const result = verifyProtocolSemanticsReport(report);
  console.log(flags.json ? JSON.stringify(result) : [
    `Evidence closure: ${result.valid ? "valid" : "invalid"}`,
    `Result root: ${result.resultRoot}`,
    `Report root: ${result.reportRoot}`,
    `Claim: ${result.claim}`,
  ].join("\n"));
  return result.valid ? 0 : 1;
}

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv[2] === "verify" && process.argv[3] === "delegated-work-protocol-report") {
      process.exitCode = runProtocolSemanticsVerifier(process.argv.slice(4));
    } else process.exitCode = runProtocolSemanticsCli(process.argv.slice(2));
  } catch (error) {
    console.error(`kfd protocol semantics: ${error.message}`);
    process.exitCode = 2;
  }
}
