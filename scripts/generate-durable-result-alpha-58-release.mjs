// SPDX-License-Identifier: Apache-2.0
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { exactByteRoot, semanticRoot } from "./self-conformance-contract.mjs";
import { lifecycleGateEnvironment } from "./self-conformance-lifecycle-gate.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cycleId = "durable-result-identity-availability-alpha-58-release";
const releaseCommit = "55130ca1f62e233ac75c674f43d84cd277951671";
const releaseReview = "https://github.com/kungfu-systems/kfd/pull/338#pullrequestreview-4891438155";
const releasePath = "kfd.release.json";
const transitionDirectory = "evidence/self-conformance/transitions";
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const releaseAnchor = readJson(releasePath);
const genesisRequest = readJson(`${transitionDirectory}/durable-result-identity-availability-genesis.request.json`);

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
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "kfd-durable-result-release-"));
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

assert.equal(releaseAnchor.npmVersion, "1.0.0-alpha.58");
assert.equal(genesisRequest.lifecyclePath, "candidate");
assert.equal(genesisRequest.chain.length, 1);
const genesis = genesisRequest.chain[0];
assert.equal(genesis.packageRoot, lifecycleGateEnvironment.installedPackageRoot);
assert.equal(genesis.bundle.proposedState.publicationState, "unpublished");

const releaseContentRoot = exactByteRoot(fs.readFileSync(path.join(root, releasePath)));
const previousState = genesis.bundle.proposedState;
const proposedState = {
  ...structuredClone(previousState),
  publicationState: "packaged",
  immutableCoordinates: {
    repository: "https://github.com/kungfu-systems/kfd",
    commit: releaseCommit,
    path: releasePath,
    contentRoot: releaseContentRoot,
    packageVersion: releaseAnchor.npmVersion,
    packageRoot: lifecycleGateEnvironment.installedPackageRoot,
  },
};
const previousStateRoot = semanticRoot(previousState);
const proposedStateRoot = semanticRoot(proposedState);
const authorityReceipt = {
  schemaVersion: 1,
  contract: "kfd.self-conformance-lifecycle-authority-receipt/v1",
  receiptId: `${cycleId}-authority`,
  lifecyclePath: "release",
  transition: "release-packaging",
  previousStateRoot,
  proposedStateRoot,
  role: "release-authority",
  decision: "package",
  actor: "dongkeren",
  claimBoundary: "This receipt requests the KFD alpha.58 package cut containing the incubating Durable Result Candidate. It does not number, qualify, promote, activate, or make the Candidate normative; protected merge, publication, registry integrity, tag, Passport, and public readback remain separate gates.",
};
const reviewReceipt = {
  schemaVersion: 1,
  contract: "kfd.self-conformance-lifecycle-review-receipt/v1",
  receiptId: `${cycleId}-review`,
  transition: "release-packaging",
  previousStateRoot,
  proposedStateRoot,
  author: "dongkeren",
  reviewer: "kungfu-origin",
  independent: true,
  verdict: "approve",
  claimBoundary: `This receipt projects ${releaseReview} approval of exact release-preparation commit ${releaseCommit}. It is not release authority and does not replace final-head review, protected channel promotion, package publication, or public integrity evidence.`,
};
const bundle = {
  schemaVersion: 1,
  contract: "kfd.self-conformance-transition-bundle/v1",
  profile: "kfd-self-conformance@1.0.0-alpha.1",
  bundleId: cycleId,
  transition: "release-packaging",
  previousState,
  previousStateRoot,
  proposedState,
  proposedStateRoot,
  predecessor: {
    kind: "report",
    bootstrapAnchorRoot: null,
    reportRoot: genesis.expectedReportRoot,
    packageRoot: genesis.packageRoot,
  },
  evidenceRoots: [releaseContentRoot],
  schemaSetRoot: genesis.bundle.schemaSetRoot,
  verifierRoot: lifecycleGateEnvironment.installedVerifierRoot,
  authorityReceiptRoot: semanticRoot(authorityReceipt),
  reviewReceiptRoot: semanticRoot(reviewReceipt),
  claimBoundary: "This structural transition binds one reviewed KFD alpha.58 packaging candidate. It does not prove the Candidate outside its founding pressure field, allocate a KFD number, or supply merge, publisher, registry, tag, Passport, or downstream authority.",
  knownGaps: [
    "The Candidate remains incubating and unqualified outside its founding pressure field; packaging supplies no promotion or cross-domain-transfer proof.",
    "The final pull-request head containing this create-only lifecycle evidence still requires independent exact-head approval.",
    "The immutable npm integrity and gitHead, alpha tag target, GitHub prerelease, public Passport, and public package readback do not exist until protected promotion succeeds.",
  ],
  expectedResult: "pass",
  immutableCoordinates: [{
    kind: "git",
    value: `https://github.com/kungfu-systems/kfd/commit/${releaseCommit}`,
    root: releaseContentRoot,
  }],
};
const report = transitionReport(bundle);
const entry = {
  bundle,
  authorityReceipt,
  reviewReceipt,
  packageRoot: lifecycleGateEnvironment.installedPackageRoot,
  expectedBundleRoot: semanticRoot(bundle),
  expectedReportRoot: semanticRoot(report),
};
const request = {
  schemaVersion: 1,
  contract: "kfd.self-conformance-lifecycle-gate-request/v1",
  profile: "kfd-self-conformance@1.0.0-alpha.1",
  gateId: cycleId,
  lifecyclePath: "release",
  fixedPackageRoot: lifecycleGateEnvironment.installedPackageRoot,
  expectedTerminalBundleRoot: entry.expectedBundleRoot,
  chain: [genesis, entry],
  counterevidenceRoots: genesisRequest.counterevidenceRoots,
};
const lifecycleReport = await (async () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "kfd-durable-result-release-gate-"));
  try {
    const input = path.join(temporary, "request.json");
    fs.writeFileSync(input, `${JSON.stringify(request, null, 2)}\n`, { flag: "wx" });
    const result = spawnSync(
      process.execPath,
      [path.join(root, "bin/kfd.mjs"), "gate", "self-conformance-lifecycle", input, "--json"],
      { cwd: root, encoding: "utf8", env: { ...process.env, npm_config_offline: "true" } },
    );
    assert.equal(result.status, 0, result.stderr || result.stdout);
    return JSON.parse(result.stdout);
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
})();

assert.equal(lifecycleReport.valid, true, JSON.stringify(lifecycleReport.issues));
assert.equal(lifecycleReport.outcome, "proceed");
assert.equal(lifecycleReport.transitionAdmissible, true);
assert.equal(lifecycleReport.releaseAuthorized, false);
assert.equal(lifecycleReport.numberAllocated, false);
assert.equal(lifecycleReport.statusChanged, false);
writeJson(`${transitionDirectory}/${cycleId}.request.json`, request);
writeJson(`${transitionDirectory}/${cycleId}.report.json`, lifecycleReport);

process.stdout.write(`${JSON.stringify({
  cycleId,
  requestRoot: semanticRoot(request),
  lifecycleReportRoot: semanticRoot(lifecycleReport),
  packageRoot: lifecycleGateEnvironment.installedPackageRoot,
  outcome: lifecycleReport.outcome,
}, null, 2)}\n`);
