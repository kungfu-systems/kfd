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
const cycleId = "recursive-normative-self-conformance-terminal";
const reviewedCommit = "5791476b226b0ce26f98538704e71f7e29e04956";
const assessmentPath = "evidence/self-conformance/qualification/recursive-normative-self-conformance.assessment.json";
const counterevidencePath = "evidence/self-conformance/qualification/recursive-normative-self-conformance.counterevidence.json";
const redundancyPath = "evidence/self-conformance/qualification/recursive-normative-self-conformance.redundancy.json";
const verificationPath = "evidence/self-conformance/qualification/recursive-normative-self-conformance.verification.json";
const reviewPath = "evidence/self-conformance/reviews/recursive-normative-self-conformance.assessment.json";
const genesisRequestPath = "evidence/self-conformance/transitions/recursive-normative-self-conformance-genesis.request.json";
const genesisCutPath = "cases/live/recursive-normative-self-conformance/cuts/0001-recursive-normative-self-conformance.json";
const terminalCutPath = "cases/live/recursive-normative-self-conformance/cuts/0002-no-new-kfd.json";
const compareUtf8 = (left, right) => Buffer.from(left).compare(Buffer.from(right));
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));

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
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "kfd-recursive-terminal-"));
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

const genesisRequest = readJson(genesisRequestPath);
const genesisEntry = genesisRequest.chain[0];
const genesisCut = readJson(genesisCutPath);
const reviewEvidence = readJson(reviewPath);
const assessmentBytes = gitFile(reviewedCommit, assessmentPath);
const counterevidenceBytes = gitFile(reviewedCommit, counterevidencePath);
const verificationBytes = gitFile(reviewedCommit, verificationPath);
const assessment = JSON.parse(assessmentBytes.toString("utf8"));
const counterevidence = JSON.parse(counterevidenceBytes.toString("utf8"));
const verification = JSON.parse(verificationBytes.toString("utf8"));

assert.equal(reviewEvidence.reviewer, "kungfu-origin");
assert.equal(reviewEvidence.state, "APPROVED");
assert.equal(reviewEvidence.reviewedCommit, reviewedCommit);
assert.equal(assessment.semanticConclusion.outcome, "no-new-kfd");
assert.equal(assessment.semanticConclusion.state, "proposal-pending-independent-review-and-disposition");
assert.equal(counterevidence.dispositionUnderTest, "no-new-kfd");
assert.equal(verification.authority.recommendationOnly, true);
assert.equal(verification.authority.terminalDispositionRetained, false);

const previousState = genesisEntry.bundle.proposedState;
const proposedState = {
  ...structuredClone(previousState),
  semanticState: "no-new-kfd",
  immutableCoordinates: {
    repository: "https://github.com/kungfu-systems/kfd",
    commit: reviewedCommit,
    path: assessmentPath,
    contentRoot: exactByteRoot(assessmentBytes),
  },
};
const previousStateRoot = semanticRoot(previousState);
const proposedStateRoot = semanticRoot(proposedState);
const authorityReceipt = {
  schemaVersion: 1,
  contract: "kfd.self-conformance-lifecycle-authority-receipt/v1",
  receiptId: `${cycleId}-authority`,
  lifecyclePath: "qualification",
  transition: "no-new-kfd",
  previousStateRoot,
  proposedStateRoot,
  role: "review-disposition",
  decision: "no-new-kfd",
  actor: "dongkeren",
  claimBoundary: `This disposition records no-new-kfd after independent semantic review ${reviewEvidence.reviewId}. It allocates no number, changes no numbered KFD, and does not authorize merge, publication, or release.`,
};
const reviewReceipt = {
  schemaVersion: 1,
  contract: "kfd.self-conformance-lifecycle-review-receipt/v1",
  receiptId: `${cycleId}-review`,
  transition: "no-new-kfd",
  previousStateRoot,
  proposedStateRoot,
  author: "qualification-author",
  reviewer: "kungfu-origin",
  independent: true,
  verdict: "approve",
  claimBoundary: `This receipt projects public review ${reviewEvidence.reviewId} of exact assessment commit ${reviewedCommit}. The review accepts the semantic recommendation but did not pre-review this later envelope.`,
};
const evidenceRoots = [
  semanticRoot(assessment),
  semanticRoot(counterevidence),
  semanticRoot(verification),
  semanticRoot(reviewEvidence),
].sort(compareUtf8);
const bundle = {
  schemaVersion: 1,
  contract: "kfd.self-conformance-transition-bundle/v1",
  profile: "kfd-self-conformance@1.0.0-alpha.1",
  bundleId: cycleId,
  transition: "no-new-kfd",
  previousState,
  previousStateRoot,
  proposedState,
  proposedStateRoot,
  predecessor: {
    kind: "report",
    bootstrapAnchorRoot: null,
    reportRoot: genesisEntry.expectedReportRoot,
    packageRoot: genesisEntry.packageRoot,
  },
  evidenceRoots,
  schemaSetRoot: genesisEntry.bundle.schemaSetRoot,
  verifierRoot: lifecycleGateEnvironment.installedVerifierRoot,
  authorityReceiptRoot: semanticRoot(authorityReceipt),
  reviewReceiptRoot: semanticRoot(reviewReceipt),
  claimBoundary: "This bundle retains the authority-separated no-new-kfd disposition as a non-promotion outcome. Structural validity cannot approve itself, allocate a number, change a numbered KFD, merge, publish, or release.",
  knownGaps: assessment.residualRisks.slice().sort(compareUtf8),
  expectedResult: "pass",
  immutableCoordinates: [
    {
      kind: "document",
      value: `${reviewEvidence.pullRequest}/commits/${reviewedCommit}#${exactByteRoot(assessmentBytes)}`,
      root: exactByteRoot(assessmentBytes),
    },
    {
      kind: "document",
      value: `${reviewEvidence.reviewUrl}#${semanticRoot(reviewEvidence)}`,
      root: semanticRoot(reviewEvidence),
    },
  ],
};
const transition = transitionReport(bundle);
const terminalEntry = {
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
  lifecyclePath: "qualification",
  fixedPackageRoot: lifecycleGateEnvironment.installedPackageRoot,
  expectedTerminalBundleRoot: terminalEntry.expectedBundleRoot,
  chain: [genesisEntry, terminalEntry],
  counterevidenceRoots: [semanticRoot(counterevidence)],
};
const report = verifyLifecycleGate(request);
assert.equal(report.valid, true, JSON.stringify(report.issues));
assert.equal(report.outcome, "non-promotion");
assert.equal(report.transitionAdmissible, false);
assert.equal(report.automaticTransition, false);
assert.equal(report.verifierNecessary, true);
assert.equal(report.verifierSufficient, false);
assert.equal(report.humanApproved, false);
assert.equal(report.numberAllocated, false);
assert.equal(report.statusChanged, false);
assert.equal(report.releaseAuthorized, false);

const terminalCut = structuredClone(genesisCut);
terminalCut.grounding.factSources.push(
  { kind: "file", coordinate: assessmentPath },
  { kind: "file", coordinate: counterevidencePath },
  { kind: "file", coordinate: verificationPath },
  { kind: "receipt", coordinate: reviewEvidence.reviewUrl },
  { kind: "file", coordinate: `evidence/self-conformance/transitions/${cycleId}.request.json` },
);
terminalCut.grounding.evidenceBoundary = `Exact genesis inputs, assessment commit ${reviewedCommit}, public review ${reviewEvidence.reviewId}, and the fixed alpha.1 package; later merge and release state are excluded.`;
terminalCut.grounding.knownGaps = assessment.residualRisks.slice();
terminalCut.participants = [
  {
    id: "qualification-author",
    kind: "agent",
    functions: ["candidate-generation", "perspective-declaration", "scalable-reasoning"],
  },
  {
    id: "kfd-repository",
    kind: "collective",
    functions: ["evidence-custody"],
  },
  {
    id: "kungfu-origin",
    kind: "other",
    functions: ["verification"],
  },
  {
    id: "dongkeren",
    kind: "human",
    functions: ["decision"],
  },
];
terminalCut.alternatives = terminalCut.alternatives.map((alternative) => {
  if (alternative.name === "New numbered KFD procedure") {
    return {
      ...alternative,
      disposition: "rejected",
      reason: "The reviewed cut identifies no responsibility beyond the existing normative closure.",
    };
  }
  if (alternative.name === "KFD-1, KFD-2, KFD-5, and KFD-11 composition") {
    return {
      ...alternative,
      disposition: "retained",
      reason: "The reviewed minimum-closure, deletion, and fuse results preserve every bounded responsibility.",
    };
  }
  return alternative;
});
terminalCut.contractModel.lifecycle = "absent -> candidate -> no-new-kfd non-promotion; reopening requires a new exact evidence cut";
terminalCut.tests.minimumClosure = {
  result: "pass",
  evidence: [
    { kind: "file", coordinate: assessmentPath },
    { kind: "file", coordinate: redundancyPath },
  ],
  notes: "The reviewed minimum closure is fully derivable from the existing normative decisions and fixed non-authoritative Profile.",
};
terminalCut.tests.deletion = {
  result: "pass",
  evidence: [
    { kind: "file", coordinate: assessmentPath },
    { kind: "file", coordinate: counterevidencePath },
  ],
  notes: "Deleting the Candidate name preserves every bounded decision observation.",
};
terminalCut.tests.fuse = {
  result: "pass",
  evidence: [
    { kind: "file", coordinate: assessmentPath },
    { kind: "file", coordinate: verificationPath },
  ],
  notes: "The Candidate fuses into the existing closure without absorbing structural, review, disposition, admission, or release authority.",
};
terminalCut.tests.dogfood = {
  result: "pass",
  evidence: [
    { kind: "receipt", coordinate: reviewEvidence.reviewUrl },
    { kind: "file", coordinate: `evidence/self-conformance/transitions/${cycleId}.report.json` },
  ],
  notes: "The recursive run retains exact genesis, assessment, independent review, terminal non-promotion, and package-only replay evidence.",
};
terminalCut.decision = {
  outcome: "no-new-primitive",
  owner: "dongkeren-after-independent-review",
  reason: "The useful recursive procedure is the reviewed composition of KFD-1, KFD-2, KFD-5, KFD-11, and the fixed Profile, not a new irreducible Primitive.",
  residualRisks: assessment.residualRisks.slice(),
};

writeJson(`evidence/self-conformance/transitions/${cycleId}.request.json`, request);
writeJson(`evidence/self-conformance/transitions/${cycleId}.report.json`, report);
writeJson(terminalCutPath, terminalCut);

process.stdout.write(`${JSON.stringify({
  cycleId,
  reviewedCommit,
  reviewId: reviewEvidence.reviewId,
  assessmentByteRoot: exactByteRoot(assessmentBytes),
  counterevidenceByteRoot: exactByteRoot(counterevidenceBytes),
  verificationByteRoot: exactByteRoot(verificationBytes),
  requestRoot: semanticRoot(request),
  reportRoot: semanticRoot(report),
  outcome: report.outcome,
}, null, 2)}\n`);
