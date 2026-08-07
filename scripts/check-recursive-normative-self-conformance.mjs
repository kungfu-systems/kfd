// SPDX-License-Identifier: Apache-2.0
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  canonicalJson,
  exactByteRoot,
  inspectTransitionBundle,
  semanticRoot,
} from "./self-conformance-contract.mjs";
import {
  lifecycleGateEnvironment,
  verifyLifecycleGate,
} from "./self-conformance-lifecycle-gate.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const extracted = process.argv.includes("--extracted");
const write = process.argv.includes("--write");
const readJson = (relative, base = root) => JSON.parse(fs.readFileSync(path.join(base, relative), "utf8"));
const bytes = (relative, base = root) => fs.readFileSync(path.join(base, relative));
const assessmentPath = "evidence/self-conformance/qualification/recursive-normative-self-conformance.assessment.json";
const counterevidencePath = "evidence/self-conformance/qualification/recursive-normative-self-conformance.counterevidence.json";
const genesisPath = "evidence/self-conformance/qualification/recursive-normative-self-conformance.genesis.json";
const redundancyPath = "evidence/self-conformance/qualification/recursive-normative-self-conformance.redundancy.json";
const replayPath = "evidence/self-conformance/qualification/recursive-normative-self-conformance.replay.json";
const requestPath = "evidence/self-conformance/transitions/recursive-normative-self-conformance-genesis.request.json";
const reportPath = "evidence/self-conformance/transitions/recursive-normative-self-conformance-genesis.report.json";
const verificationPath = "evidence/self-conformance/qualification/recursive-normative-self-conformance.verification.json";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? root,
    encoding: "utf8",
    env: { ...process.env, npm_config_offline: "true" },
  });
  assert.equal(
    result.status,
    options.expected ?? 0,
    `${command} ${args.join(" ")}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
  );
  return result.stdout.trim();
}

function exactHex(relative) {
  return exactByteRoot(bytes(relative)).slice("sha256:".length);
}

function countBy(values, key) {
  const result = {};
  for (const value of values) result[value[key]] = (result[value[key]] ?? 0) + 1;
  return result;
}

function issueCodes(request) {
  return new Set(verifyLifecycleGate(request).issues.map(({ code }) => code));
}

const assessment = readJson(assessmentPath);
const counterevidence = readJson(counterevidencePath);
const genesis = readJson(genesisPath);
const redundancy = readJson(redundancyPath);
const replay = readJson(replayPath);
const request = readJson(requestPath);
const retainedReport = readJson(reportPath);
const draftRegistry = readJson("drafts/registry.json");
const caseRegistry = readJson("cases/registry.json");
const anchor = readJson("profiles/self-conformance/bootstrap-anchor.json");
const manifest = readJson("profiles/self-conformance/manifest.json");

const candidate = draftRegistry.candidates.find(({ id }) => id === assessment.candidateId);
assert.ok(candidate, "Candidate is missing from the draft registry");
assert.equal(candidate.status, "qualifying");
assert.equal(candidate.slotBinding, "non-binding");
assert.equal(Object.hasOwn(candidate, "slotHint"), false, "Candidate must not preallocate a slot hint");
assert.equal(genesis.candidateNumber, null);
assert.equal(genesis.candidateStatus, "qualifying");
const liveCase = caseRegistry.cases.find(({ id }) => id === assessment.candidateId);
assert.ok(liveCase, "KFD-5 live case is missing");
assert.equal(liveCase.status, "active");
assert.equal(liveCase.candidateTracks[0].status, "provisional");

for (const input of genesis.exactInputs) {
  assert.equal(exactHex(input.path), input.sha256, `${input.id} exact input root drifted`);
}
for (const input of redundancy.fixedInputs) {
  assert.equal(exactHex(input.path), input.sha256, `${input.id} redundancy input root drifted`);
}
for (const input of assessment.fixedEvidence) {
  const value = input.rootKind === "exact-bytes"
    ? exactByteRoot(bytes(input.path))
    : semanticRoot(readJson(input.path));
  assert.equal(value, input.root, `${input.id} assessment evidence root drifted`);
}

assert.deepEqual(
  replay.cases.map(({ id }) => id).sort(),
  assessment.replayAssessment.requiredCases.slice().sort(),
);
assert.deepEqual(countBy(replay.cases, "classification"), assessment.replayAssessment.classificationCounts);
assert.equal(replay.cases.find(({ id }) => id === "kfd-1-through-kfd-3-bootstrap").classification, "retrospective-reconstruction");
assert.equal(replay.cases.find(({ id }) => id === "kfd-7-positive-activation").classification, "historical-fact");
assert.equal(replay.cases.find(({ id }) => id === "kfd-11-through-kfd-13-foundation-revision").classification, "historical-fact");
assert.equal(replay.cases.find(({ id }) => id === "kfd-6-partial-autonomous-discovery").gap, "KFD-6 remains draft and non-activated.");
assert.equal(replay.cases.find(({ id }) => id === "profile-counterfactual-over-history").classification, "counterfactual-replay");
assert.equal(assessment.replayAssessment.nonRetroactivity, "pass");

assert.equal(redundancy.tests.deletion.result, "derivable");
assert.equal(redundancy.tests.fuse.result, "derivable");
assert.equal(redundancy.tests.crossDomain.result, "gap");
assert.equal(redundancy.tests.profileOnly.result, "insufficient");
assert.equal(redundancy.preliminaryConclusion.outcome, "no-new-kfd-candidate");
assert.equal(assessment.redundancyAssessment.minimumClosure, "derivable");
assert.equal(assessment.redundancyAssessment.deletion, "derivable");
assert.equal(assessment.redundancyAssessment.fuse, "derivable");
assert.equal(assessment.semanticConclusion.outcome, "no-new-kfd");
assert.equal(assessment.semanticConclusion.state, "proposal-pending-independent-review-and-disposition");
assert.equal(assessment.semanticConclusion.normativeEffect, "none-before-terminal-receipt-and-repository-admission");
assert.equal(
  new Set(Object.values(assessment.authoritySeparation)).size,
  Object.values(assessment.authoritySeparation).length,
  "assessment authority roles must remain distinct",
);
assert.equal(counterevidence.dispositionUnderTest, "no-new-kfd");
assert.ok(counterevidence.retainedAgainstPromotion.length >= 5);
assert.ok(counterevidence.conditionsThatWouldReopen.length >= 4);

const reproducedReport = verifyLifecycleGate(request);
assert.equal(reproducedReport.valid, true, JSON.stringify(reproducedReport.issues));
assert.equal(reproducedReport.outcome, "proceed");
assert.equal(reproducedReport.lifecyclePath, "candidate");
assert.equal(reproducedReport.humanApproved, false);
assert.equal(reproducedReport.numberAllocated, false);
assert.equal(reproducedReport.statusChanged, false);
assert.equal(reproducedReport.releaseAuthorized, false);
assert.equal(canonicalJson(retainedReport), canonicalJson(reproducedReport), "retained candidate lifecycle report drifted");

const candidateBundle = request.chain[0].bundle;
assert.equal(candidateBundle.transition, "candidate-genesis");
assert.equal(candidateBundle.predecessor.bootstrapAnchorRoot, semanticRoot(anchor));
assert.equal(candidateBundle.schemaSetRoot, manifest.schemaSetRoot);
assert.equal(candidateBundle.verifierRoot, lifecycleGateEnvironment.installedVerifierRoot);
assert.equal(semanticRoot(candidateBundle), request.expectedTerminalBundleRoot);

const packageSubstitution = structuredClone(request);
packageSubstitution.fixedPackageRoot = "sha256:0000000000000000000000000000000000000000000000000000000000000000";
assert.equal(issueCodes(packageSubstitution).has("scg-verifier-package-substitution"), true);
const missingReview = structuredClone(request);
missingReview.chain[0].reviewReceipt = null;
assert.equal(issueCodes(missingReview).has("scg-review-receipt-missing"), true);
const wrongAuthority = structuredClone(request);
wrongAuthority.chain[0].authorityReceipt.role = "release-authority";
assert.equal(issueCodes(wrongAuthority).has("scg-authority-role-invalid"), true);
const overclaimingBundle = structuredClone(candidateBundle);
overclaimingBundle.claimBoundary = "This certifies semantic truth.";
assert.equal(
  inspectTransitionBundle(overclaimingBundle, { bootstrapAnchor: anchor, schemaSetRoot: manifest.schemaSetRoot }).code,
  "scp-claim-overreach",
);

const verification = {
  schemaVersion: 1,
  contract: "kfd.recursive-normative-self-conformance-verification/v1",
  candidateId: assessment.candidateId,
  profile: request.profile,
  assessmentRoot: semanticRoot(assessment),
  counterevidenceRoot: semanticRoot(counterevidence),
  candidateRequestRoot: semanticRoot(request),
  candidateReportRoot: semanticRoot(retainedReport),
  replayClassifications: assessment.replayAssessment.classificationCounts,
  redundancyOutcome: assessment.semanticConclusion.outcome,
  checks: [
    "candidate-pre-number",
    "exact-genesis-inputs",
    "exact-redundancy-inputs",
    "historical-replay-coverage",
    "historical-non-retroactivity",
    "minimum-closure-deletion-fuse",
    "cross-domain-gap-retained",
    "candidate-lifecycle-reproduced",
    "authority-and-review-separated",
    "package-review-authority-claim-substitution-fail-closed",
  ].map((id) => ({ id, status: "pass" })),
  cleanRoom: {
    input: "npm-package-files-only",
    offline: true,
    networkDependencies: [],
    ambientHomeDependencies: [],
    productCheckoutDependencies: [],
  },
  authority: {
    verifierNecessary: true,
    verifierSufficient: false,
    recommendationOnly: true,
    terminalDispositionRetained: false,
  },
};

if (write) {
  assert.equal(extracted, false, "--write is not allowed in an extracted package");
  fs.writeFileSync(path.join(root, verificationPath), `${JSON.stringify(verification, null, 2)}\n`, { flag: "wx" });
  console.log("Recursive normative Self-Conformance verification report generated");
  process.exit(0);
} else {
  assert.equal(
    canonicalJson(readJson(verificationPath)),
    canonicalJson(verification),
    "retained recursive verification report drifted",
  );
}

if (!extracted && !write) {
  const cleanRoomFiles = [
    "LICENSE",
    "bin/kfd.mjs",
    "cases/registry.json",
    "drafts/registry.json",
    "drafts/recursive-normative-self-conformance.md",
    assessmentPath,
    counterevidencePath,
    genesisPath,
    redundancyPath,
    replayPath,
    verificationPath,
    "evidence/self-conformance/reviews/recursive-normative-self-conformance.genesis.json",
    requestPath,
    reportPath,
    "profiles/self-conformance/bootstrap-anchor.json",
    "profiles/self-conformance/bootstrap-evidence.json",
    "profiles/self-conformance/issue-codes.json",
    "profiles/self-conformance/lifecycle-gates.json",
    "profiles/self-conformance/manifest.json",
    "scripts/check-recursive-normative-self-conformance.mjs",
    "scripts/self-conformance-contract.mjs",
    "scripts/self-conformance-lifecycle-gate.mjs",
    "verifier/dist/kfd_verifier.wasm",
    ...genesis.exactInputs.map(({ path: relative }) => relative),
    ...redundancy.fixedInputs.map(({ path: relative }) => relative),
  ];
  const uniqueFiles = [...new Set(cleanRoomFiles)].sort();
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "kfd-recursive-clean-room-"));
  try {
    const dryRun = JSON.parse(run("npm", ["pack", "--json", "--dry-run", "--ignore-scripts"]));
    const packaged = new Set(dryRun[0].files.map(({ path: relative }) => relative));
    for (const relative of uniqueFiles) assert.equal(packaged.has(relative), true, `package missing ${relative}`);
    const packed = JSON.parse(run("npm", ["pack", "--json", "--ignore-scripts", "--pack-destination", temporary]));
    run("tar", ["-xzf", path.join(temporary, packed[0].filename), "-C", temporary]);
    const packageRoot = path.join(temporary, "package");
    const cleanRoot = path.join(temporary, "clean-room");
    for (const relative of uniqueFiles) {
      const destination = path.join(cleanRoot, relative);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.copyFileSync(path.join(packageRoot, relative), destination);
    }
    const output = run("node", ["scripts/check-recursive-normative-self-conformance.mjs", "--extracted"], {
      cwd: cleanRoot,
    });
    assert.equal(output.includes("Recursive normative Self-Conformance check passed"), true);
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}

console.log(
  `Recursive normative Self-Conformance check passed: ${genesis.exactInputs.length} genesis roots, ${replay.cases.length} replay cases, no-new-kfd proposal, fail-closed substitutions, offline package-only clean room${extracted ? " (extracted)" : ""}`,
);
