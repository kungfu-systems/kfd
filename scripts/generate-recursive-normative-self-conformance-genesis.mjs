// SPDX-License-Identifier: Apache-2.0
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  exactByteRoot,
  semanticRoot,
} from "./self-conformance-contract.mjs";
import {
  lifecycleGateEnvironment,
  verifyLifecycleGate,
} from "./self-conformance-lifecycle-gate.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cycleId = "recursive-normative-self-conformance-genesis";
const reviewedCommit = "7fb4c67718807856bd001dd7bf3c64bd32189827";
const genesisPath = "evidence/self-conformance/qualification/recursive-normative-self-conformance.genesis.json";
const redundancyPath = "evidence/self-conformance/qualification/recursive-normative-self-conformance.redundancy.json";
const reviewPath = "evidence/self-conformance/reviews/recursive-normative-self-conformance.genesis.json";
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const compareUtf8 = (left, right) => Buffer.from(left).compare(Buffer.from(right));

function gitFile(commit, relative) {
  const result = spawnSync("git", ["show", `${commit}:${relative}`], {
    cwd: root,
    encoding: null,
  });
  assert.equal(result.status, 0, result.stderr?.toString("utf8") || `cannot read ${relative} at ${commit}`);
  return result.stdout;
}

function writeJson(relative, value) {
  const target = path.join(root, relative);
  const serialized = `${JSON.stringify(value, null, 2)}\n`;
  fs.mkdirSync(path.dirname(target), { recursive: true });
  if (fs.existsSync(target)) {
    assert.equal(fs.readFileSync(target, "utf8"), serialized, `${relative} has drifted`);
    return;
  }
  fs.writeFileSync(target, serialized, { flag: "wx" });
}

function transitionReport(bundle) {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "kfd-recursive-genesis-"));
  try {
    const input = path.join(temporary, "bundle.json");
    fs.writeFileSync(input, `${JSON.stringify(bundle, null, 2)}\n`, { flag: "wx" });
    const result = spawnSync(
      process.execPath,
      [path.join(root, "bin/kfd.mjs"), "verify", "self-conformance-transition", input, "--json"],
      { cwd: root, encoding: "utf8", env: { ...process.env, npm_config_offline: "true" } },
    );
    assert.ok([0, 1].includes(result.status), result.stderr);
    const report = JSON.parse(result.stdout);
    assert.equal(report.valid, true, JSON.stringify(report.issues));
    return report;
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}

const bootstrap = readJson("profiles/self-conformance/bootstrap-evidence.json");
const anchor = readJson("profiles/self-conformance/bootstrap-anchor.json");
const manifest = readJson("profiles/self-conformance/manifest.json");
const reviewEvidence = readJson(reviewPath);
const genesisBytes = gitFile(reviewedCommit, genesisPath);
const redundancyBytes = gitFile(reviewedCommit, redundancyPath);
const genesis = JSON.parse(genesisBytes.toString("utf8"));
const redundancy = JSON.parse(redundancyBytes.toString("utf8"));

assert.equal(reviewEvidence.reviewer, "kungfu-origin");
assert.equal(reviewEvidence.state, "APPROVED");
assert.equal(reviewEvidence.reviewedCommit, reviewedCommit);
assert.equal(genesis.candidateNumber, null);
assert.equal(genesis.candidateStatus, "qualifying");
assert.equal(genesis.authoritySeparation.independentReviewer, "pending-exact-commit-review");
assert.equal(redundancy.preliminaryConclusion.outcome, "no-new-kfd-candidate");
assert.equal(redundancy.preliminaryConclusion.authority, "proposal-only-pending-independent-review-and-disposition");

const previousState = bootstrap.state;
const proposedState = {
  ...structuredClone(previousState),
  semanticState: "candidate",
  immutableCoordinates: {
    repository: "https://github.com/kungfu-systems/kfd",
    commit: reviewedCommit,
    path: genesisPath,
    contentRoot: exactByteRoot(genesisBytes),
  },
};
const previousStateRoot = semanticRoot(previousState);
const proposedStateRoot = semanticRoot(proposedState);
const authorityReceipt = {
  schemaVersion: 1,
  contract: "kfd.self-conformance-lifecycle-authority-receipt/v1",
  receiptId: `${cycleId}-authority`,
  lifecyclePath: "candidate",
  transition: "candidate-genesis",
  previousStateRoot,
  proposedStateRoot,
  role: "provenance-owner",
  decision: "record-candidate",
  actor: "dongkeren",
  claimBoundary: "This receipt records the reviewed genesis as a pre-number Candidate only. It does not decide qualification, terminal disposition, numbering, activation, merge, publication, or release.",
};
const reviewReceipt = {
  schemaVersion: 1,
  contract: "kfd.self-conformance-lifecycle-review-receipt/v1",
  receiptId: `${cycleId}-review`,
  transition: "candidate-genesis",
  previousStateRoot,
  proposedStateRoot,
  author: "dongkeren",
  reviewer: "kungfu-origin",
  independent: true,
  verdict: "approve",
  claimBoundary: `This receipt projects public review ${reviewEvidence.reviewId} of exact commit ${reviewedCommit} into the structural gate. It covers genesis only and does not approve any later terminal disposition.`,
};
const evidenceRoots = [semanticRoot(genesis), semanticRoot(reviewEvidence)].sort(compareUtf8);
const counterevidenceRoots = [semanticRoot(redundancy)].sort(compareUtf8);
const bundle = {
  schemaVersion: 1,
  contract: "kfd.self-conformance-transition-bundle/v1",
  profile: "kfd-self-conformance@1.0.0-alpha.1",
  bundleId: cycleId,
  transition: "candidate-genesis",
  previousState,
  previousStateRoot,
  proposedState,
  proposedStateRoot,
  predecessor: {
    kind: "bootstrap",
    bootstrapAnchorRoot: semanticRoot(anchor),
    reportRoot: null,
    packageRoot: anchor.packageRoot,
  },
  evidenceRoots,
  schemaSetRoot: manifest.schemaSetRoot,
  verifierRoot: lifecycleGateEnvironment.installedVerifierRoot,
  authorityReceiptRoot: semanticRoot(authorityReceipt),
  reviewReceiptRoot: semanticRoot(reviewReceipt),
  claimBoundary: "This bundle records one reviewed pre-number Candidate genesis. Structural validity is necessary but cannot certify semantic truth or supply terminal disposition, numbering, activation, merge, publication, or release authority.",
  knownGaps: [
    "No authority-separated terminal disposition has been reviewed or retained.",
    "No non-KFD adopter demonstrates an irreducible recursive responsibility.",
    "The reviewed genesis predates this structural lifecycle envelope.",
    "The KFD-1 through KFD-3 bootstrap remains retrospective reconstruction under the later Profile.",
  ].sort(compareUtf8),
  expectedResult: "pass",
  immutableCoordinates: [
    {
      kind: "document",
      value: `${reviewEvidence.pullRequest}/commits/${reviewedCommit}#${exactByteRoot(genesisBytes)}`,
      root: exactByteRoot(genesisBytes),
    },
    {
      kind: "document",
      value: `${reviewEvidence.reviewUrl}#${semanticRoot(reviewEvidence)}`,
      root: semanticRoot(reviewEvidence),
    },
  ],
};
const transition = transitionReport(bundle);
const entry = {
  bundle,
  authorityReceipt,
  reviewReceipt,
  packageRoot: lifecycleGateEnvironment.installedPackageRoot,
  expectedBundleRoot: semanticRoot(bundle),
  expectedReportRoot: semanticRoot(transition),
};
const request = {
  schemaVersion: 1,
  contract: "kfd.self-conformance-lifecycle-gate-request/v1",
  profile: "kfd-self-conformance@1.0.0-alpha.1",
  gateId: cycleId,
  lifecyclePath: "candidate",
  fixedPackageRoot: lifecycleGateEnvironment.installedPackageRoot,
  expectedTerminalBundleRoot: entry.expectedBundleRoot,
  chain: [entry],
  counterevidenceRoots,
};
const report = verifyLifecycleGate(request);
assert.equal(report.valid, true, JSON.stringify(report.issues));
assert.equal(report.outcome, "proceed");
assert.equal(report.transitionAdmissible, true);
assert.equal(report.humanApproved, false);
assert.equal(report.numberAllocated, false);
assert.equal(report.statusChanged, false);
assert.equal(report.releaseAuthorized, false);

writeJson(`evidence/self-conformance/transitions/${cycleId}.request.json`, request);
writeJson(`evidence/self-conformance/transitions/${cycleId}.report.json`, report);

process.stdout.write(`${JSON.stringify({
  cycleId,
  reviewedCommit,
  reviewId: reviewEvidence.reviewId,
  genesisByteRoot: exactByteRoot(genesisBytes),
  redundancyByteRoot: exactByteRoot(redundancyBytes),
  requestRoot: semanticRoot(request),
  reportRoot: semanticRoot(report),
  outcome: report.outcome,
}, null, 2)}\n`);
