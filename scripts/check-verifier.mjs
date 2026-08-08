// SPDX-License-Identifier: Apache-2.0
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { applyOperations, semanticRoot } from "./self-conformance-contract.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const verifier = path.join(root, "verifier");
const nativeArgs = [
  "run",
  "--locked",
  "--quiet",
  "--manifest-path",
  path.join(verifier, "Cargo.toml"),
  "-p",
  "kfd-verifier-cli",
  "--",
];

function run(command, args, expected = 0) {
  const result = spawnSync(command, args, { cwd: root, encoding: "utf8" });
  assert.equal(
    result.status,
    expected,
    `${command} ${args.join(" ")}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
  );
  return result.stdout.trim();
}

const cases = [
  [
    "kfd-record",
    "standards.json",
  ],
  [
    "kfd-record",
    "terminology.json",
  ],
  [
    "kfd-record",
    ".buildchain/kfd-3/collaboration-interface.artifact.json",
  ],
  [
    "kfd-record",
    "verifier/fixtures/kfd-7/valid-domain-profile.json",
  ],
  [
    "kfd-record",
    "activation-contracts.json",
  ],
  [
    "kfd-record",
    "verifier/fixtures/kfd-11/valid-adopter-witness.json",
  ],
  [
    "kfd-record",
    "verifier/fixtures/kfd-12/valid-adopter-witness.json",
  ],
  [
    "kfd-record",
    "verifier/fixtures/kfd-13/valid-adopter-witness.json",
  ],
  [
    "kfd-record",
    "verifier/fixtures/kfd-activation/valid-qualification-report.json",
  ],
  [
    "kfd-record",
    "verifier/fixtures/kfd-activation/valid-revise-activation-record.json",
  ],
  [
    "passport",
    "verifier/fixtures/passport",
  ],
  [
    "pack",
    "verifier/fixtures/xinfa/repository-small-atlas/compatibility/context-pack-v1",
  ],
  [
    "atlas",
    "verifier/fixtures/xinfa/repository-small-atlas",
  ],
  [
    "episode",
    "verifier/fixtures/episode/sealed/sha256/aa/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  ],
];

for (const [kind, fixture] of cases) {
  const native = run("cargo", [...nativeArgs, "verify", kind, fixture, "--json"]);
  const wasm = run("node", ["bin/kfd-verify-current.mjs", "verify", kind, fixture, "--json"]);
  assert.equal(wasm, native, `${kind} native and WASM reports differ`);
  const report = JSON.parse(native);
  assert.equal(report.valid, true, `${kind} fixture must pass`);
  assert.equal(report.offline, true, `${kind} fixture must remain offline`);
  assert.equal(report.qualifying, false, `${kind} verifier must not self-qualify`);
  assert.equal(report.selfCertified, false, `${kind} verifier must not self-certify`);
}

const rejectedKfdRecords = [
  "verifier/fixtures/kfd-7/invalid-missing-warrant.json",
  "verifier/fixtures/kfd-7/invalid-premature-activation.json",
  "verifier/fixtures/kfd-11/invalid-write-receipt-as-admission.json",
  "verifier/fixtures/kfd-12/invalid-fused-proposal-acceptance.json",
  "verifier/fixtures/kfd-13/invalid-absorbed-authority.json",
  "verifier/fixtures/kfd-activation/invalid-missing-evidence.json",
  "verifier/fixtures/kfd-activation/invalid-lower-level-escalation.json",
];
for (const fixture of rejectedKfdRecords) {
  const native = run("cargo", [...nativeArgs, "verify", "kfd-record", fixture, "--json"], 1);
  const wasm = run("node", ["bin/kfd-verify-current.mjs", "verify", "kfd-record", fixture, "--json"], 1);
  assert.equal(wasm, native, `${fixture} native and WASM rejections differ`);
  const report = JSON.parse(native);
  assert.equal(report.valid, false, `${fixture} must fail closed`);
  assert.equal(report.qualifying, false, `${fixture} rejection must not qualify the profile`);
  assert.equal(report.selfCertified, false, `${fixture} rejection must not self-certify`);
  const issueKeys = new Set(report.issues.map((issue) => `${issue.code}:${issue.path}`));
  if (fixture.endsWith("invalid-missing-warrant.json")) {
    assert.equal(issueKeys.has("schema-contains:/actionCoordinates"), true, "missing Warrant must fail the required-coordinate closure");
  }
  if (fixture.endsWith("invalid-premature-activation.json")) {
    assert.equal(issueKeys.has("schema-const:/domainProfile/qualificationStatus"), true, "activation must require a qualified Domain Profile");
    assert.equal(issueKeys.has("schema-min-items:/activation/productWitnesses"), true, "activation must retain product witnesses");
  }
  if (fixture.endsWith("invalid-write-receipt-as-admission.json")) {
    assert.equal(issueKeys.has("schema-const:/admissionIndependence/receiptClass"), true, "a lower-level write receipt must not masquerade as effect Admission");
  }
  if (fixture.endsWith("invalid-fused-proposal-acceptance.json")) {
    assert.equal(issueKeys.has("schema-const:/responsibilitySeparation/proposalIsNotAcceptance"), true, "Assignment proposal and acceptance must remain distinct");
  }
  if (fixture.endsWith("invalid-absorbed-authority.json")) {
    assert.equal(issueKeys.has("schema-const:/authorityBindings/0/absorbedByProjectCut"), true, "Project Cut must not absorb a bound authority");
  }
  if (fixture.endsWith("invalid-missing-evidence.json")) {
    assert.equal(issueKeys.has("schema-min-items:/exactEvidenceRoots"), true, "activation without exact evidence must fail closed");
  }
  if (fixture.endsWith("invalid-lower-level-escalation.json")) {
    assert.equal(issueKeys.has("schema-const:/gates/kfd12/operationalEvidence"), true, "structural conformance must not auto-escalate to activation pass");
  }
}

const selfConformanceMatrix = JSON.parse(
  fs.readFileSync(path.join(verifier, "specs", "self-conformance-matrix.json"), "utf8"),
);
const selfConformanceVectors = JSON.parse(
  fs.readFileSync(
    path.join(root, "profiles", "self-conformance", "vectors", "contract-vectors.json"),
    "utf8",
  ),
);
const selfConformanceIssues = new Set(
  JSON.parse(
    fs.readFileSync(path.join(root, "profiles", "self-conformance", "issue-codes.json"), "utf8"),
  ).codes,
);
const reportPredecessorFixture = JSON.parse(
  fs.readFileSync(
    path.join(verifier, "fixtures", "self-conformance", "valid-report-predecessor.json"),
    "utf8",
  ),
);
assert.equal(selfConformanceMatrix.contract, "kfd.self-conformance-verifier-matrix/v1");
assert.equal(selfConformanceMatrix.profile, "kfd-self-conformance@1.0.0-alpha.1");
const matrixCases = new Map(selfConformanceMatrix.cases.map((testCase) => [testCase.id, testCase]));
assert.equal(matrixCases.size, selfConformanceMatrix.cases.length, "matrix case IDs must be unique");
for (const invariant of selfConformanceMatrix.invariants) {
  assert.ok(invariant.positiveCases.length > 0, `${invariant.id} needs a positive case`);
  assert.ok(invariant.failureCases.length > 0, `${invariant.id} needs a failure case`);
  assert.ok(invariant.issueCodes.length > 0, `${invariant.id} needs a stable issue code`);
  for (const id of [...invariant.positiveCases, ...invariant.failureCases]) {
    assert.ok(matrixCases.has(id), `${invariant.id} references unknown case ${id}`);
  }
  for (const code of invariant.issueCodes) {
    assert.ok(selfConformanceIssues.has(code), `${invariant.id} references unpublished issue ${code}`);
  }
}
for (const category of [
  "missing",
  "malformed",
  "stale",
  "conflicting",
  "reordered",
  "substituted",
  "circular",
  "self-containing",
  "wrong-predecessor",
  "wrong-authority",
  "review-gap",
  "claim-overreach",
]) {
  assert.ok(
    selfConformanceMatrix.cases.some((testCase) => testCase.category === category),
    `matrix is missing ${category} coverage`,
  );
}
const historyCases = selfConformanceMatrix.cases.filter(({ history }) => history);
assert.ok(historyCases.length >= 4, "failure history must remain first-class");
assert.doesNotMatch(
  JSON.stringify(historyCases),
  /kungfu|buildchain|kfx|agent[- ]hub|adopter[- ]specific/iu,
  "failure history must not promote adopter-specific behavior",
);

const selfConformanceTemporary = fs.mkdtempSync(
  path.join(os.tmpdir(), "kfd-self-conformance-verifier-"),
);
let retainedCandidateParityCases = 0;
try {
  for (const testCase of selfConformanceMatrix.cases) {
    let source;
    if (testCase.fixture === "raw") {
      source = testCase.raw;
    } else {
      const base = testCase.fixture === "valid-report-predecessor"
        ? reportPredecessorFixture
        : selfConformanceVectors.base.bundle;
      source = `${JSON.stringify(applyOperations(base, testCase.operations), null, 2)}\n`;
    }
    const fixturePath = path.join(selfConformanceTemporary, `${testCase.id}.json`);
    fs.writeFileSync(fixturePath, source);
    const expectedExit = testCase.expected.valid ? 0 : 1;
    const native = run(
      "cargo",
      [...nativeArgs, "verify", "self-conformance-transition", fixturePath, "--json"],
      expectedExit,
    );
    const wasm = run(
      "node",
      ["bin/kfd.mjs", "verify", "self-conformance-transition", fixturePath, "--json"],
      expectedExit,
    );
    assert.equal(wasm, native, `${testCase.id}: native and WASM reports differ`);
    const report = JSON.parse(native);
    assert.equal(report.valid, testCase.expected.valid, `${testCase.id}: validity drifted`);
    assert.equal(report.qualifying, false, `${testCase.id}: verifier must not qualify`);
    assert.equal(report.selfCertified, false, `${testCase.id}: verifier must not self-certify`);
    assert.equal(report.offline, true, `${testCase.id}: verifier must remain offline`);
    assert.deepEqual(
      report.checks.map(({ id }) => id),
      [...report.checks.map(({ id }) => id)].sort(),
      `${testCase.id}: checks must be sorted by ID`,
    );
    assert.deepEqual(
      report.issues,
      [...report.issues].sort((left, right) =>
        [left.code, left.path, left.message].join("\0")
          .localeCompare([right.code, right.path, right.message].join("\0"), "en")),
      `${testCase.id}: issues must be sorted by code, path, and message`,
    );
    const reportRoot = semanticRoot(report);
    assert.equal(reportRoot, semanticRoot(JSON.parse(wasm)), `${testCase.id}: report roots differ`);
    if (testCase.expected.code) {
      assert.ok(
        report.issues.some(({ code }) => code === testCase.expected.code),
        `${testCase.id}: expected issue ${testCase.expected.code}, got ${JSON.stringify(report.issues)}`,
      );
      assert.ok(
        report.issues.every(({ code }) => selfConformanceIssues.has(code)),
        `${testCase.id}: report used an unpublished issue code`,
      );
    } else {
      assert.deepEqual(report.issues, [], `${testCase.id}: positive fixture emitted issues`);
    }
  }

  const retainedCandidateRequestPaths = [
    "evidence/self-conformance/transitions/recursive-normative-self-conformance-genesis.request.json",
    "evidence/self-conformance/transitions/recursive-normative-self-conformance-terminal.request.json",
  ];
  const retainedCandidateEntries = new Map();
  for (const relative of retainedCandidateRequestPaths) {
    const requestPath = path.join(root, relative);
    if (!fs.existsSync(requestPath)) continue;
    const retainedCandidateRequest = JSON.parse(fs.readFileSync(requestPath, "utf8"));
    for (const entry of retainedCandidateRequest.chain) {
      retainedCandidateEntries.set(semanticRoot(entry.bundle), entry);
    }
  }
  for (const [bundleRoot, entry] of retainedCandidateEntries) {
    const index = retainedCandidateParityCases;
    const fixturePath = path.join(selfConformanceTemporary, `retained-candidate-${index}.json`);
    fs.writeFileSync(fixturePath, `${JSON.stringify(entry.bundle, null, 2)}\n`);
    const native = run(
      "cargo",
      [...nativeArgs, "verify", "self-conformance-transition", fixturePath, "--json"],
    );
    const wasm = run(
      "node",
      ["bin/kfd.mjs", "verify", "self-conformance-transition", fixturePath, "--json"],
    );
    assert.equal(wasm, native, `retained Candidate ${bundleRoot}: native and WASM reports differ`);
    const report = JSON.parse(native);
    assert.equal(report.valid, true);
    assert.equal(report.qualifying, false);
    assert.equal(report.selfCertified, false);
    assert.equal(report.offline, true);
    assert.equal(semanticRoot(report), entry.expectedReportRoot);
    retainedCandidateParityCases += 1;

    for (const mutation of [
      {
        id: "predecessor-root",
        code: "scp-predecessor-root-mismatch",
        apply(bundle) {
          bundle.previousStateRoot = "sha256:0000000000000000000000000000000000000000000000000000000000000000";
        },
      },
      {
        id: "claim-overreach",
        code: "scp-claim-overreach",
        apply(bundle) {
          bundle.claimBoundary = "This certifies semantic truth.";
        },
      },
    ]) {
      const mutated = structuredClone(entry.bundle);
      mutation.apply(mutated);
      const mutationPath = path.join(selfConformanceTemporary, `retained-candidate-${index}-${mutation.id}.json`);
      fs.writeFileSync(mutationPath, `${JSON.stringify(mutated, null, 2)}\n`);
      const nativeRejected = run(
        "cargo",
        [...nativeArgs, "verify", "self-conformance-transition", mutationPath, "--json"],
        1,
      );
      const wasmRejected = run(
        "node",
        ["bin/kfd.mjs", "verify", "self-conformance-transition", mutationPath, "--json"],
        1,
      );
      assert.equal(wasmRejected, nativeRejected, `retained Candidate ${bundleRoot} ${mutation.id}: native and WASM rejections differ`);
      assert.equal(JSON.parse(nativeRejected).issues.some(({ code }) => code === mutation.code), true);
      retainedCandidateParityCases += 1;
    }
  }
} finally {
  fs.rmSync(selfConformanceTemporary, { recursive: true, force: true });
}

const generatedPack = JSON.parse(
  fs.readFileSync(
    path.join(verifier, "fixtures", "xinfa", "repository-small-atlas", "compatibility", "context-pack-v1", "pack.json"),
    "utf8",
  ),
);
const publishedPackGolden = JSON.parse(
  fs.readFileSync(path.join(verifier, "fixtures", "xinfa", "repository-small-pack-v1.json"), "utf8"),
);
assert.equal(generatedPack.roots.pack, publishedPackGolden.packRoot);
assert.equal(generatedPack.roots.source, publishedPackGolden.sourceRoot);
assert.equal(generatedPack.roots.policy, publishedPackGolden.policyRoot);
assert.equal(generatedPack.roots.authority, publishedPackGolden.authorityRoot);
assert.equal(generatedPack.roots.coverage, publishedPackGolden.coverageRoot);
const generatedAtlas = JSON.parse(
  fs.readFileSync(path.join(verifier, "fixtures", "xinfa", "repository-small-atlas", "atlas.json"), "utf8"),
);
const publishedAtlasGolden = JSON.parse(
  fs.readFileSync(path.join(verifier, "fixtures", "xinfa", "repository-small-atlas-v1.json"), "utf8"),
);
assert.equal(generatedAtlas.atlas_root, publishedAtlasGolden.atlas_root);
assert.equal(generatedAtlas.roots.schema, publishedAtlasGolden.schema_root);
assert.equal(generatedAtlas.roots.context_pack, publishedAtlasGolden.context_pack_root);
const buildchainSelfCheck = JSON.parse(
  fs.readFileSync(path.join(verifier, "fixtures", "passport", "check-report.json"), "utf8"),
);
assert.equal(buildchainSelfCheck.contract, "kungfu-buildchain-release-check-report");
assert.equal(buildchainSelfCheck.ok, true);
assert.deepEqual(buildchainSelfCheck.issues, []);

const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "kfd-verifier-"));
try {
  const missingQualificationBasisPath = path.join(temporary, "missing-qualification-basis.json");
  const missingQualificationBasis = JSON.parse(
    fs.readFileSync(path.join(root, "verifier/fixtures/kfd-7/valid-domain-profile.json"), "utf8"),
  );
  delete missingQualificationBasis.qualificationBasis;
  fs.writeFileSync(missingQualificationBasisPath, `${JSON.stringify(missingQualificationBasis)}\n`);
  const nativeMissingQualificationBasis = run(
    "cargo",
    [...nativeArgs, "verify", "kfd-record", missingQualificationBasisPath, "--json"],
    1,
  );
  const wasmMissingQualificationBasis = run(
    "node",
    ["bin/kfd-verify-current.mjs", "verify", "kfd-record", missingQualificationBasisPath, "--json"],
    1,
  );
  assert.equal(
    wasmMissingQualificationBasis,
    nativeMissingQualificationBasis,
    "missing qualification basis rejection must match byte for byte",
  );
  assert.equal(
    JSON.parse(nativeMissingQualificationBasis).issues.some(
      (issue) => issue.code === "schema-required" && issue.path === "/qualificationBasis",
    ),
    true,
    "KFD-7 Profiles must cite the standard qualification basis",
  );

  const activationWithPlannedEvidencePath = path.join(temporary, "activation-with-planned-evidence.json");
  const activationWithPlannedEvidence = JSON.parse(
    fs.readFileSync(path.join(root, "verifier/fixtures/kfd-7/valid-domain-profile.json"), "utf8"),
  );
  activationWithPlannedEvidence.domainProfile.qualificationStatus = "qualified";
  activationWithPlannedEvidence.activation.decision = "activate";
  activationWithPlannedEvidence.activation.independentReview = "review:retained";
  activationWithPlannedEvidence.activation.productWitnesses = ["witness:retained"];
  fs.writeFileSync(activationWithPlannedEvidencePath, `${JSON.stringify(activationWithPlannedEvidence)}\n`);
  const nativeActivationWithPlannedEvidence = run(
    "cargo",
    [...nativeArgs, "verify", "kfd-record", activationWithPlannedEvidencePath, "--json"],
    1,
  );
  const wasmActivationWithPlannedEvidence = run(
    "node",
    ["bin/kfd-verify-current.mjs", "verify", "kfd-record", activationWithPlannedEvidencePath, "--json"],
    1,
  );
  assert.equal(
    wasmActivationWithPlannedEvidence,
    nativeActivationWithPlannedEvidence,
    "activation with planned evidence rejection must match byte for byte",
  );
  assert.equal(
    JSON.parse(nativeActivationWithPlannedEvidence).issues.some(
      (issue) => issue.code === "schema-enum" && issue.path.endsWith("/status"),
    ),
    true,
    "activation must reject planned evidence obligations",
  );

  const activationWithoutSessionProofPath = path.join(temporary, "activation-without-session-proof.json");
  const activationWithoutSessionProof = JSON.parse(
    fs.readFileSync(path.join(root, "verifier/fixtures/kfd-7/valid-domain-profile.json"), "utf8"),
  );
  activationWithoutSessionProof.domainProfile.qualificationStatus = "qualified";
  activationWithoutSessionProof.activation.decision = "activate";
  activationWithoutSessionProof.activation.independentReview = "review:retained";
  activationWithoutSessionProof.activation.productWitnesses = ["witness:retained"];
  for (const obligation of activationWithoutSessionProof.evidenceObligations) {
    obligation.status = "passed";
    obligation.artifactRefs = [`witness:${obligation.category}`];
  }
  for (const obligation of activationWithoutSessionProof.evidenceObligations) {
    if ([
      "session-round-trip-refinement",
      "session-complexity-breakpoint",
      "context-insufficiency-counterexample",
    ].includes(obligation.category)) {
      obligation.status = "not-applicable";
      obligation.artifactRefs = [];
      obligation.reason = "invalid activation fixture";
    }
  }
  fs.writeFileSync(
    activationWithoutSessionProofPath,
    `${JSON.stringify(activationWithoutSessionProof)}\n`,
  );
  const nativeActivationWithoutSessionProof = run(
    "cargo",
    [...nativeArgs, "verify", "kfd-record", activationWithoutSessionProofPath, "--json"],
    1,
  );
  const wasmActivationWithoutSessionProof = run(
    "node",
    ["bin/kfd-verify-current.mjs", "verify", "kfd-record", activationWithoutSessionProofPath, "--json"],
    1,
  );
  assert.equal(
    wasmActivationWithoutSessionProof,
    nativeActivationWithoutSessionProof,
    "activation without session proof rejection must match byte for byte",
  );
  assert.equal(
    JSON.parse(nativeActivationWithoutSessionProof).issues.some(
      (issue) => issue.code === "schema-contains" && issue.path === "/evidenceObligations",
    ),
    true,
    "activation must require passed round-trip, breakpoint, and context-insufficiency evidence",
  );

  fs.cpSync(
    path.join(verifier, "fixtures", "episode", "sealed", "sha256", "aa",
      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"),
    temporary,
    { recursive: true },
  );
  fs.appendFileSync(path.join(temporary, "claims.jsonl"), " ");
  const native = run(
    "cargo",
    [...nativeArgs, "verify", "episode", temporary, "--json"],
    1,
  );
  const wasm = run(
    "node",
    ["bin/kfd-verify-current.mjs", "verify", "episode", temporary, "--json"],
    1,
  );
  assert.equal(wasm, native, "mutated Episode rejection must match byte for byte");
  assert.equal(JSON.parse(native).valid, false);

  const packDirectory = path.join(temporary, "pack");
  fs.cpSync(
    path.join(verifier, "fixtures", "xinfa", "repository-small-atlas", "compatibility", "context-pack-v1"),
    packDirectory,
    { recursive: true },
  );
  const packPath = path.join(packDirectory, "pack.json");
  const pack = JSON.parse(fs.readFileSync(packPath, "utf8"));
  pack.roots.pack = "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
  fs.writeFileSync(packPath, `${JSON.stringify(pack)}\n`);
  const nativePack = run("cargo", [...nativeArgs, "verify", "pack", packDirectory, "--json"], 1);
  const wasmPack = run("node", ["bin/kfd-verify-current.mjs", "verify", "pack", packDirectory, "--json"], 1);
  assert.equal(wasmPack, nativePack, "mutated Pack rejection must match byte for byte");

  const atlasDirectory = path.join(temporary, "atlas");
  fs.cpSync(
    path.join(verifier, "fixtures", "xinfa", "repository-small-atlas"),
    atlasDirectory,
    { recursive: true },
  );
  const humanPath = path.join(atlasDirectory, "views", "human.json");
  const human = JSON.parse(fs.readFileSync(humanPath, "utf8"));
  human.derived = false;
  fs.writeFileSync(humanPath, `${JSON.stringify(human)}\n`);
  const nativeAtlas = run("cargo", [...nativeArgs, "verify", "atlas", atlasDirectory, "--json"], 1);
  const wasmAtlas = run("node", ["bin/kfd-verify-current.mjs", "verify", "atlas", atlasDirectory, "--json"], 1);
  assert.equal(wasmAtlas, nativeAtlas, "mutated Atlas rejection must match byte for byte");

  const passportDirectory = path.join(temporary, "passport");
  fs.cpSync(path.join(verifier, "fixtures", "passport"), passportDirectory, { recursive: true });
  const passportPath = path.join(passportDirectory, "buildchain.release.json");
  const passport = JSON.parse(fs.readFileSync(passportPath, "utf8"));
  passport.artifacts[0].digest =
    "sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc";
  fs.writeFileSync(passportPath, `${JSON.stringify(passport)}\n`);
  const nativePassport = run("cargo", [...nativeArgs, "verify", "passport", passportDirectory, "--json"], 1);
  const wasmPassport = run("node", ["bin/kfd-verify-current.mjs", "verify", "passport", passportDirectory, "--json"], 1);
  assert.equal(wasmPassport, nativePassport, "mutated Passport rejection must match byte for byte");

  const recordPath = path.join(temporary, "record.json");
  const schemaPath = path.join(temporary, "unsupported-schema.json");
  fs.writeFileSync(recordPath, "{\"value\":\"closed\"}\n");
  fs.writeFileSync(
    schemaPath,
    "{\"$id\":\"https://example.invalid/schema\",\"type\":\"object\",\"unevaluatedProperties\":false}\n",
  );
  const nativeSchema = run(
    "cargo",
    [...nativeArgs, "verify", "kfd-record", recordPath, "--schema", schemaPath, "--json"],
    1,
  );
  const wasmSchema = run(
    "node",
    ["bin/kfd-verify-current.mjs", "verify", "kfd-record", recordPath, "--schema", schemaPath, "--json"],
    1,
  );
  assert.equal(wasmSchema, nativeSchema, "unsupported schema keyword rejection must match byte for byte");
  const symlinkPath = path.join(temporary, "passport-link");
  fs.symlinkSync(passportDirectory, symlinkPath, "dir");
  run("cargo", [...nativeArgs, "verify", "passport", symlinkPath, "--json"], 2);
  run("node", ["bin/kfd-verify-current.mjs", "verify", "passport", symlinkPath, "--json"], 2);
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}

const rustManifests = [
  "verifier/Cargo.toml",
  "verifier/crates/core/Cargo.toml",
  "verifier/crates/cli/Cargo.toml",
  "verifier/crates/wasm/Cargo.toml",
].map((file) => fs.readFileSync(path.join(root, file), "utf8"));
for (const manifest of rustManifests) {
  assert.doesNotMatch(manifest, /\b(git|registry|path)\s*=\s*["'][^"']*(kungfu|xinfa|buildchain|shifu)/iu);
}
assert.doesNotMatch(
  fs.readFileSync(path.join(root, "bin", "kfd.mjs"), "utf8"),
  /\b(fetch|https?\.request)\s*\(/u,
);
console.log(
  `check-verifier: ${cases.length} legacy parity fixtures, ${9 + rejectedKfdRecords.length} legacy adversarial rejections, ${selfConformanceMatrix.cases.length} Self-Conformance matrix cases, and ${retainedCandidateParityCases} retained Candidate native/WASM cases ok`,
);
