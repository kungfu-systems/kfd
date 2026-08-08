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
const cycleId = "self-conformance-site-alpha-56-release";
const releaseCommit = "a6e43dfe2adcb435118ad0e2f6bf58d6fc4bbb29";
const releasePath = "kfd.release.json";
const transitionDirectory = "evidence/self-conformance/transitions";
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const releaseAnchor = readJson(releasePath);
const genesisRequest = readJson(`${transitionDirectory}/recursive-normative-self-conformance-genesis.request.json`);

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
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "kfd-site-release-"));
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

assert.equal(releaseAnchor.npmVersion, "1.0.0-alpha.56");
assert.equal(genesisRequest.lifecyclePath, "candidate");
assert.equal(genesisRequest.chain.length, 1);
const genesis = genesisRequest.chain[0];
assert.equal(genesis.packageRoot, lifecycleGateEnvironment.installedPackageRoot);

const previousState = genesis.bundle.proposedState;
const proposedState = {
  ...structuredClone(previousState),
  publicationState: "packaged",
  immutableCoordinates: {
    repository: "https://github.com/kungfu-systems/kfd",
    commit: releaseCommit,
    path: releasePath,
    contentRoot: exactByteRoot(fs.readFileSync(path.join(root, releasePath))),
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
  claimBoundary: "This receipt requests the alpha.56 package cut. Protected merge, publication, integrity, Passport, tag, and downstream propagation remain separately evidenced gates.",
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
  claimBoundary: "This receipt projects approval of exact commit a6e43dfe2adcb435118ad0e2f6bf58d6fc4bbb29 on PR 327. It does not replace protected merge or package publication evidence.",
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
  evidenceRoots: [exactByteRoot(fs.readFileSync(path.join(root, releasePath)))],
  schemaSetRoot: genesis.bundle.schemaSetRoot,
  verifierRoot: lifecycleGateEnvironment.installedVerifierRoot,
  authorityReceiptRoot: semanticRoot(authorityReceipt),
  reviewReceiptRoot: semanticRoot(reviewReceipt),
  claimBoundary: "This structural transition binds an alpha.56 packaging candidate only. It does not certify the site projection or supply merge, publication, tag, Passport, or deployment authority.",
  knownGaps: [
    "The downstream Site preview remains unbuilt and unreviewed at this lifecycle cut.",
    "The immutable npm integrity, gitHead, tag target, public Passport, and downstream propagation lock do not exist until the protected release workflow succeeds.",
  ],
  expectedResult: "pass",
  immutableCoordinates: [{
    kind: "git",
    value: `https://github.com/kungfu-systems/kfd/commit/${releaseCommit}`,
    root: exactByteRoot(fs.readFileSync(path.join(root, releasePath))),
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
  counterevidenceRoots: [],
};
const lifecycleReport = await (async () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "kfd-site-release-gate-"));
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
writeJson(`${transitionDirectory}/${cycleId}.request.json`, request);
writeJson(`${transitionDirectory}/${cycleId}.report.json`, lifecycleReport);

process.stdout.write(`${JSON.stringify({
  cycleId,
  requestRoot: semanticRoot(request),
  lifecycleReportRoot: semanticRoot(lifecycleReport),
  packageRoot: lifecycleGateEnvironment.installedPackageRoot,
  outcome: lifecycleReport.outcome,
}, null, 2)}\n`);
