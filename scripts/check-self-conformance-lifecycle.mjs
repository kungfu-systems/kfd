// SPDX-License-Identifier: Apache-2.0
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { semanticRoot } from "./self-conformance-contract.mjs";
import {
  lifecycleGateEnvironment,
  verifyLifecycleGate,
} from "./self-conformance-lifecycle-gate.mjs";
import { classifyChangedPaths } from "./check-self-conformance-changes.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const anchor = readJson("profiles/self-conformance/bootstrap-anchor.json");
const evidence = readJson("profiles/self-conformance/bootstrap-evidence.json");
const matrix = readJson("profiles/self-conformance/lifecycle-gate-matrix.json");
const manifest = readJson("profiles/self-conformance/manifest.json");
const publishedIssueCodes = new Set(readJson("profiles/self-conformance/issue-codes.json").codes);
const ZERO_ROOT = `sha256:${"0".repeat(64)}`;

const transitions = {
  candidate: { transition: "candidate-genesis", semanticState: "candidate", role: "provenance-owner", decision: "record-candidate" },
  qualification: { transition: "candidate-qualification", semanticState: "qualified", role: "evidence-review-authority", decision: "qualify" },
  "draft-promotion": { transition: "numbered-draft-promotion", semanticState: "numbered-draft", role: "maintainer-numbering", decision: "promote" },
  activation: { transition: "activation", semanticState: "active", role: "maintainer-status", decision: "activate" },
  supersession: { transition: "supersession", semanticState: "superseded", role: "maintainer-status", decision: "supersede" },
  "foundation-revision": { transition: "foundation-revision", semanticState: "foundation-revised", role: "maintainer-foundation-revision", decision: "revise-foundation" },
  release: { transition: "release-packaging", semanticState: null, role: "release-authority", decision: "package" },
};

const sequences = {
  candidate: ["candidate"],
  qualification: ["candidate", "qualification"],
  "draft-promotion": ["candidate", "qualification", "draft-promotion"],
  activation: ["candidate", "qualification", "draft-promotion", "activation"],
  supersession: ["candidate", "qualification", "draft-promotion", "activation", "supersession"],
  "foundation-revision": ["candidate", "qualification", "draft-promotion", "activation", "foundation-revision"],
  release: ["candidate", "release"],
};

function transitionReport(bundle) {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "kfd-lifecycle-fixture-"));
  try {
    const input = path.join(temporary, "bundle.json");
    fs.writeFileSync(input, `${JSON.stringify(bundle, null, 2)}\n`);
    const result = spawnSync(
      process.execPath,
      [path.join(root, "bin/kfd.mjs"), "verify", "self-conformance-transition", input, "--json"],
      { cwd: root, encoding: "utf8", env: { ...process.env, npm_config_offline: "true" } },
    );
    assert.ok([0, 1].includes(result.status), result.stderr);
    return JSON.parse(result.stdout);
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}

function state(previous, semanticState, publicationState, index) {
  const next = structuredClone(previous);
  next.semanticState = semanticState;
  next.publicationState = publicationState;
  next.immutableCoordinates = {
    repository: "https://example.invalid/kfd-clean-room",
    commit: String(index + 1).repeat(40).slice(0, 40),
    path: `evidence/self-conformance/transitions/fixture-${index}.json`,
    contentRoot: `sha256:${String(index + 1).repeat(64).slice(0, 64)}`,
  };
  if (publicationState === "packaged") {
    next.immutableCoordinates.packageVersion = "1.0.0-fixture.1";
    next.immutableCoordinates.packageRoot = lifecycleGateEnvironment.installedPackageRoot;
  }
  return next;
}

function makeEntry(pathId, previousState, predecessor, index) {
  const definition = transitions[pathId];
  const proposedState = state(
    previousState,
    definition.semanticState ?? previousState.semanticState,
    pathId === "release" ? "packaged" : previousState.publicationState,
    index,
  );
  const previousStateRoot = semanticRoot(previousState);
  const proposedStateRoot = semanticRoot(proposedState);
  const authorityReceipt = {
    schemaVersion: 1,
    contract: "kfd.self-conformance-lifecycle-authority-receipt/v1",
    receiptId: `fixture-authority-${index}`,
    lifecyclePath: pathId,
    transition: definition.transition,
    previousStateRoot,
    proposedStateRoot,
    role: definition.role,
    decision: definition.decision,
    actor: "fixture-maintainer",
    claimBoundary: "Fixture governance receipt only; no real KFD lifecycle authority is claimed.",
  };
  const reviewReceipt = {
    schemaVersion: 1,
    contract: "kfd.self-conformance-lifecycle-review-receipt/v1",
    receiptId: `fixture-review-${index}`,
    transition: definition.transition,
    previousStateRoot,
    proposedStateRoot,
    author: "fixture-author",
    reviewer: "fixture-independent-reviewer",
    independent: true,
    verdict: "approve",
    claimBoundary: "Fixture review receipt only; no real approval is claimed.",
  };
  const bundle = {
    schemaVersion: 1,
    contract: "kfd.self-conformance-transition-bundle/v1",
    profile: "kfd-self-conformance@1.0.0-alpha.1",
    bundleId: `fixture-${pathId}-${index}`,
    transition: definition.transition,
    previousState,
    previousStateRoot,
    proposedState,
    proposedStateRoot,
    predecessor,
    evidenceRoots: [`sha256:${"a".repeat(63)}${index % 10}`],
    schemaSetRoot: manifest.schemaSetRoot,
    verifierRoot: lifecycleGateEnvironment.installedVerifierRoot,
    authorityReceiptRoot: semanticRoot(authorityReceipt),
    reviewReceiptRoot: semanticRoot(reviewReceipt),
    claimBoundary: "Fixture-only structural transition; no semantic truth, certification, adoption, numbering, status, approval, or release authority is claimed.",
    knownGaps: ["Fixture receipts carry no real governance authority."],
    expectedResult: "pass",
    immutableCoordinates: [{
      kind: "document",
      value: `fixture-${pathId}-${index}.json@${String(index + 1).repeat(40).slice(0, 40)}`,
      root: proposedState.immutableCoordinates.contentRoot,
    }],
  };
  const report = transitionReport(bundle);
  return {
    bundle,
    authorityReceipt,
    reviewReceipt,
    packageRoot: lifecycleGateEnvironment.installedPackageRoot,
    expectedBundleRoot: semanticRoot(bundle),
    expectedReportRoot: semanticRoot(report),
  };
}

function makeRequest(pathId) {
  const chain = [];
  let previousState = structuredClone(evidence.state);
  let predecessor = {
    kind: "bootstrap",
    bootstrapAnchorRoot: semanticRoot(anchor),
    reportRoot: null,
    packageRoot: anchor.packageRoot,
  };
  for (const [index, step] of sequences[pathId].entries()) {
    const entry = makeEntry(step, previousState, predecessor, index);
    chain.push(entry);
    previousState = structuredClone(entry.bundle.proposedState);
    predecessor = {
      kind: "report",
      bootstrapAnchorRoot: null,
      reportRoot: entry.expectedReportRoot,
      packageRoot: entry.packageRoot,
    };
  }
  return {
    schemaVersion: 1,
    contract: "kfd.self-conformance-lifecycle-gate-request/v1",
    profile: "kfd-self-conformance@1.0.0-alpha.1",
    gateId: `fixture-${pathId}`,
    lifecyclePath: pathId,
    fixedPackageRoot: lifecycleGateEnvironment.installedPackageRoot,
    expectedTerminalBundleRoot: chain.at(-1).expectedBundleRoot,
    chain,
    counterevidenceRoots: [`sha256:${"f".repeat(64)}`],
  };
}

function refreshEntry(request, index, { receipts = true } = {}) {
  const entry = request.chain[index];
  if (receipts && entry.authorityReceipt) entry.bundle.authorityReceiptRoot = semanticRoot(entry.authorityReceipt);
  if (receipts && entry.reviewReceipt) entry.bundle.reviewReceiptRoot = semanticRoot(entry.reviewReceipt);
  entry.expectedBundleRoot = semanticRoot(entry.bundle);
  entry.expectedReportRoot = semanticRoot(transitionReport(entry.bundle));
  if (index === request.chain.length - 1) request.expectedTerminalBundleRoot = entry.expectedBundleRoot;
}

function mutate(request, mutation) {
  const terminalIndex = request.chain.length - 1;
  if (mutation === "remove-chain") {
    request.chain = [];
  } else if (mutation === "stale-predecessor-report") {
    request.chain[terminalIndex].bundle.predecessor.reportRoot = ZERO_ROOT;
    refreshEntry(request, terminalIndex);
  } else if (mutation === "wrong-terminal-root") {
    request.expectedTerminalBundleRoot = ZERO_ROOT;
  } else if (mutation === "wrong-predecessor-state") {
    request.chain[terminalIndex].bundle.previousState = structuredClone(evidence.state);
    request.chain[terminalIndex].bundle.previousStateRoot = semanticRoot(evidence.state);
    request.chain[terminalIndex].authorityReceipt.previousStateRoot = semanticRoot(evidence.state);
    request.chain[terminalIndex].reviewReceipt.previousStateRoot = semanticRoot(evidence.state);
    refreshEntry(request, terminalIndex);
  } else if (mutation === "wrong-authority-role") {
    request.chain[terminalIndex].authorityReceipt.role = "release-authority";
    refreshEntry(request, terminalIndex);
  } else if (mutation === "remove-review") {
    request.chain[terminalIndex].reviewReceipt = null;
  } else if (mutation === "claim-overreach") {
    request.chain[terminalIndex].bundle.claimBoundary = "This certifies semantic truth and proves adoption.";
    refreshEntry(request, terminalIndex, { receipts: false });
  } else if (mutation === "substitute-package") {
    request.fixedPackageRoot = ZERO_ROOT;
  } else {
    throw new Error(`unknown lifecycle fixture mutation: ${mutation}`);
  }
}

assert.equal(matrix.contract, "kfd.self-conformance-lifecycle-gate-matrix/v1");
assert.deepEqual(matrix.positivePaths, lifecycleGateEnvironment.policy.paths.map(({ id }) => id));
for (const pathId of matrix.positivePaths) {
  const report = verifyLifecycleGate(makeRequest(pathId));
  assert.equal(report.valid, true, `${pathId}: ${JSON.stringify(report.issues)}`);
  assert.equal(report.outcome, "proceed", pathId);
  assert.equal(report.transitionAdmissible, true, pathId);
  assert.equal(report.verifierNecessary, true);
  assert.equal(report.verifierSufficient, false);
  assert.equal(report.automaticTransition, false);
  assert.equal(report.humanApproved, false);
  assert.equal(report.releaseAuthorized, false);
}

const cliTemporary = fs.mkdtempSync(path.join(os.tmpdir(), "kfd-lifecycle-cli-"));
try {
  const requestPath = path.join(cliTemporary, "candidate.request.json");
  const reportPath = path.join(cliTemporary, "candidate.report.json");
  fs.writeFileSync(requestPath, `${JSON.stringify(makeRequest("candidate"), null, 2)}\n`);
  const first = spawnSync(
    process.execPath,
    [path.join(root, "bin/kfd.mjs"), "gate", "self-conformance-lifecycle", requestPath, "--output", reportPath, "--json"],
    { cwd: root, encoding: "utf8", env: { ...process.env, npm_config_offline: "true" } },
  );
  assert.equal(first.status, 0, first.stderr);
  assert.equal(JSON.parse(fs.readFileSync(reportPath, "utf8")).valid, true);
  const overwrite = spawnSync(
    process.execPath,
    [path.join(root, "bin/kfd.mjs"), "gate", "self-conformance-lifecycle", requestPath, "--output", reportPath],
    { cwd: root, encoding: "utf8", env: { ...process.env, npm_config_offline: "true" } },
  );
  assert.equal(overwrite.status, 2, "retained reports must be create-only");
} finally {
  fs.rmSync(cliTemporary, { recursive: true, force: true });
}

for (const testCase of matrix.failureCases) {
  const request = makeRequest(testCase.category === "package-substitution" ? "release" : "qualification");
  mutate(request, testCase.mutation);
  const report = verifyLifecycleGate(request);
  assert.equal(report.valid, false, testCase.id);
  assert.equal(report.outcome, "blocked", testCase.id);
  assert.ok(report.issues.some(({ code }) => code === testCase.code), `${testCase.id}: ${JSON.stringify(report.issues)}`);
  assert.ok(report.issues.every(({ code }) => publishedIssueCodes.has(code)), `${testCase.id}: unpublished issue code`);
}

const nonPromotion = makeRequest("qualification");
const terminal = nonPromotion.chain.at(-1);
terminal.bundle.transition = "rejection";
terminal.bundle.proposedState.semanticState = "rejected";
terminal.bundle.proposedStateRoot = semanticRoot(terminal.bundle.proposedState);
terminal.authorityReceipt.transition = "rejection";
terminal.authorityReceipt.proposedStateRoot = terminal.bundle.proposedStateRoot;
terminal.authorityReceipt.role = "review-disposition";
terminal.authorityReceipt.decision = "reject";
terminal.reviewReceipt.transition = "rejection";
terminal.reviewReceipt.proposedStateRoot = terminal.bundle.proposedStateRoot;
terminal.reviewReceipt.verdict = "reject";
refreshEntry(nonPromotion, nonPromotion.chain.length - 1);
const nonPromotionReport = verifyLifecycleGate(nonPromotion);
assert.equal(nonPromotionReport.valid, true, JSON.stringify(nonPromotionReport.issues));
assert.equal(nonPromotionReport.outcome, "non-promotion");
assert.equal(nonPromotionReport.transitionAdmissible, false);
assert.deepEqual(nonPromotionReport.counterevidenceRoots, nonPromotion.counterevidenceRoots);

assert.deepEqual(classifyChangedPaths(["drafts/new-candidate.md"]), ["candidate"]);
assert.deepEqual(classifyChangedPaths(["evidence/self-conformance/qualification/example.json"]), ["qualification"]);
assert.deepEqual(classifyChangedPaths(["docs/foundation-revision-example.md"]), ["foundation-revision"]);
assert.deepEqual(classifyChangedPaths(["kfd.release.json"]), ["release"]);
assert.deepEqual(classifyChangedPaths(["registry.json"], {
  beforeRegistry: { entries: [{ id: "KFD-99", status: "draft" }] },
  afterRegistry: { entries: [{ id: "KFD-99", status: "active" }] },
}), ["activation"]);

console.log("Self-Conformance lifecycle gates passed: 7 official paths, complete bootstrap chains, 8 fail-closed diagnostics, retained non-promotion counterevidence");
