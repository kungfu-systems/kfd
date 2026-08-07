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
import { lifecycleGateEnvironment } from "./self-conformance-lifecycle-gate.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(root, "evidence/self-conformance/transitions");
const cycleId = "federated-work-continuity-first-cycle";
const inputCommit = "3835eff362c05f0389ee913196a3dc46cc8767a9";
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const readBytes = (relative) => fs.readFileSync(path.join(root, relative));
const bootstrap = readJson("profiles/self-conformance/bootstrap-evidence.json");
const anchor = readJson("profiles/self-conformance/bootstrap-anchor.json");
const manifest = readJson("profiles/self-conformance/manifest.json");
const pressurePath = "evidence/self-conformance/qualification/federated-work-continuity-first-cycle.pressure.json";
const assessmentPath = "evidence/self-conformance/qualification/federated-work-continuity-first-cycle.assessment.json";
const counterevidencePath = "evidence/self-conformance/qualification/federated-work-continuity-first-cycle.counterevidence.json";
const pressure = readJson(pressurePath);
const assessment = readJson(assessmentPath);
const counterevidence = readJson(counterevidencePath);
const compareUtf8 = (left, right) => Buffer.from(left).compare(Buffer.from(right));

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
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "kfd-first-cycle-"));
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

function makeState(previous, semanticState) {
  return {
    ...structuredClone(previous),
    semanticState,
    immutableCoordinates: {
      repository: "https://github.com/kungfu-systems/kfd",
      commit: inputCommit,
      path: pressurePath,
      contentRoot: exactByteRoot(readBytes(pressurePath)),
    },
  };
}

function makeEntry({
  bundleId,
  lifecyclePath,
  transition,
  previousState,
  proposedState,
  predecessor,
  evidenceRoot,
  authorityRole,
  authorityDecision,
  reviewVerdict,
  knownGaps,
  coordinatePath,
  coordinateRoot,
}) {
  const previousStateRoot = semanticRoot(previousState);
  const proposedStateRoot = semanticRoot(proposedState);
  const authorityReceipt = {
    schemaVersion: 1,
    contract: "kfd.self-conformance-lifecycle-authority-receipt/v1",
    receiptId: `${bundleId}-authority`,
    lifecyclePath,
    transition,
    previousStateRoot,
    proposedStateRoot,
    role: authorityRole,
    decision: authorityDecision,
    actor: "dongkeren",
    claimBoundary: "This receipt records the accountable lifecycle disposition supplied to the structural gate. It does not replace protected merge, numbering, status, or release authority.",
  };
  const reviewReceipt = {
    schemaVersion: 1,
    contract: "kfd.self-conformance-lifecycle-review-receipt/v1",
    receiptId: `${bundleId}-review`,
    transition,
    previousStateRoot,
    proposedStateRoot,
    author: "dongkeren",
    reviewer: "kungfu-origin",
    independent: true,
    verdict: reviewVerdict,
    claimBoundary: "This receipt binds a distinct review role for the structural gate. Exact-commit approval and merge remain separate protected repository evidence.",
  };
  const bundle = {
    schemaVersion: 1,
    contract: "kfd.self-conformance-transition-bundle/v1",
    profile: "kfd-self-conformance@1.0.0-alpha.1",
    bundleId,
    transition,
    previousState,
    previousStateRoot,
    proposedState,
    proposedStateRoot,
    predecessor,
    evidenceRoots: [evidenceRoot],
    schemaSetRoot: manifest.schemaSetRoot,
    verifierRoot: lifecycleGateEnvironment.installedVerifierRoot,
    authorityReceiptRoot: semanticRoot(authorityReceipt),
    reviewReceiptRoot: semanticRoot(reviewReceipt),
    claimBoundary: "This bundle records structural evidence for one bounded dogfood transition only; no semantic truth, certification, adoption, numbering, status, approval, merge, or release authority is claimed.",
    knownGaps: [...knownGaps].sort(compareUtf8),
    expectedResult: "pass",
    immutableCoordinates: [{
      kind: "document",
      value: `${coordinatePath}#${coordinateRoot}`,
      root: coordinateRoot,
    }],
  };
  const report = transitionReport(bundle);
  return {
    entry: {
      bundle,
      authorityReceipt,
      reviewReceipt,
      packageRoot: lifecycleGateEnvironment.installedPackageRoot,
      expectedBundleRoot: semanticRoot(bundle),
      expectedReportRoot: semanticRoot(report),
    },
    report,
  };
}

assert.equal(pressure.inputCommit, undefined);
assert.equal(assessment.inputCommit, inputCommit);
assert.equal(assessment.semanticConclusion.outcome, "provisional");
assert.equal(counterevidence.disposition, "retain-provisional");

const candidateState = makeState(bootstrap.state, "candidate");
const genesis = makeEntry({
  bundleId: `${cycleId}-genesis`,
  lifecyclePath: "candidate",
  transition: "candidate-genesis",
  previousState: bootstrap.state,
  proposedState: candidateState,
  predecessor: {
    kind: "bootstrap",
    bootstrapAnchorRoot: semanticRoot(anchor),
    reportRoot: null,
    packageRoot: anchor.packageRoot,
  },
  evidenceRoot: semanticRoot(pressure),
  authorityRole: "provenance-owner",
  authorityDecision: "record-candidate",
  reviewVerdict: "approve",
  knownGaps: pressure.knownGaps,
  coordinatePath: pressurePath,
  coordinateRoot: exactByteRoot(readBytes(pressurePath)),
});

const provisionalState = makeState(candidateState, "provisional");
const provisional = makeEntry({
  bundleId: `${cycleId}-provisional`,
  lifecyclePath: "qualification",
  transition: "provisional-retention",
  previousState: candidateState,
  proposedState: provisionalState,
  predecessor: {
    kind: "report",
    bootstrapAnchorRoot: null,
    reportRoot: genesis.entry.expectedReportRoot,
    packageRoot: genesis.entry.packageRoot,
  },
  evidenceRoot: semanticRoot(assessment),
  authorityRole: "review-disposition",
  authorityDecision: "retain-provisional",
  reviewVerdict: "revise",
  knownGaps: assessment.unresolvedGaps,
  coordinatePath: assessmentPath,
  coordinateRoot: semanticRoot(assessment),
});

const request = {
  schemaVersion: 1,
  contract: "kfd.self-conformance-lifecycle-gate-request/v1",
  profile: "kfd-self-conformance@1.0.0-alpha.1",
  gateId: cycleId,
  lifecyclePath: "qualification",
  fixedPackageRoot: lifecycleGateEnvironment.installedPackageRoot,
  expectedTerminalBundleRoot: provisional.entry.expectedBundleRoot,
  chain: [genesis.entry, provisional.entry],
  counterevidenceRoots: [semanticRoot(counterevidence)],
};

writeJson(`evidence/self-conformance/transitions/${cycleId}.genesis.bundle.json`, genesis.entry.bundle);
writeJson(`evidence/self-conformance/transitions/${cycleId}.genesis.report.json`, genesis.report);
writeJson(`evidence/self-conformance/transitions/${cycleId}.provisional.bundle.json`, provisional.entry.bundle);
writeJson(`evidence/self-conformance/transitions/${cycleId}.provisional.report.json`, provisional.report);
const requestRelative = `evidence/self-conformance/transitions/${cycleId}.request.json`;
const reportRelative = `evidence/self-conformance/transitions/${cycleId}.report.json`;
writeJson(requestRelative, request);

const gateTemporary = fs.mkdtempSync(path.join(os.tmpdir(), "kfd-first-cycle-gate-"));
let lifecycleReport;
try {
  const gateOutput = path.join(gateTemporary, "report.json");
  const gate = spawnSync(
    process.execPath,
    [path.join(root, "bin/kfd.mjs"), "gate", "self-conformance-lifecycle", requestRelative, "--output", gateOutput, "--json"],
    { cwd: root, encoding: "utf8", env: { ...process.env, npm_config_offline: "true" } },
  );
  assert.equal(gate.status, 0, gate.stderr || gate.stdout);
  lifecycleReport = JSON.parse(gate.stdout);
} finally {
  fs.rmSync(gateTemporary, { recursive: true, force: true });
}
assert.equal(lifecycleReport.valid, true, JSON.stringify(lifecycleReport.issues));
assert.equal(lifecycleReport.outcome, "non-promotion");
assert.equal(lifecycleReport.transitionAdmissible, false);
writeJson(reportRelative, lifecycleReport);

process.stdout.write(`${JSON.stringify({
  cycleId,
  pressureRoot: semanticRoot(pressure),
  assessmentRoot: semanticRoot(assessment),
  counterevidenceRoot: semanticRoot(counterevidence),
  genesisBundleRoot: genesis.entry.expectedBundleRoot,
  genesisReportRoot: genesis.entry.expectedReportRoot,
  provisionalBundleRoot: provisional.entry.expectedBundleRoot,
  provisionalReportRoot: provisional.entry.expectedReportRoot,
  requestRoot: semanticRoot(request),
  lifecycleReportRoot: semanticRoot(lifecycleReport),
  packageRoot: lifecycleGateEnvironment.installedPackageRoot,
  verifierRoot: lifecycleGateEnvironment.installedVerifierRoot,
  outcome: lifecycleReport.outcome,
}, null, 2)}\n`);
