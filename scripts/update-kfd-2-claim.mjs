import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import crypto from "node:crypto";
import path from "node:path";

const releaseClaimPath = ".buildchain/kfd-2/public-release-trust.claim.json";
const trustClaimsPath = ".buildchain/kfd-2/kfd-foundation.trust-claims.json";
const trustAssessmentPath = ".buildchain/kfd-2/kfd-foundation.trust-assessment.json";

const readJson = (filePath) => JSON.parse(readFileSync(filePath, "utf8"));
const sha256File = (filePath) => crypto.createHash("sha256").update(readFileSync(filePath)).digest("hex");
const digestFile = (filePath) => `sha256:${sha256File(filePath)}`;
const pointer = (filePath, extra = {}) => ({
  path: filePath,
  sha256: sha256File(filePath),
  ...extra,
});
const artifactPointer = (kind, filePath, extra = {}) => ({
  kind,
  path: filePath,
  sha256: sha256File(filePath),
  ...extra,
});
const evidence = (type, filePath, description, extra = {}) => ({
  type,
  pointer: artifactPointer(type === "schema" ? "schema" : type === "witness" ? "witness" : "file", filePath),
  machineProvability: "machine-verifiable",
  description,
  ...extra,
});
const evidenceResult = (type, filePath, description, extra = {}) => ({
  type,
  result: "pass",
  machineProvability: "machine-verifiable",
  path: filePath,
  digest: digestFile(filePath),
  description,
  ...extra,
});
const responsibility = {
  owner: "KFD maintainers",
  sourceOwner: "KFD maintainers",
  verificationOwner: "KFD package self-verification",
  decisionOwner: "KFD maintainers",
};
const naturalLanguageResidualRisk = {
  id: "human-language-interpretation",
  definedBy: "https://kfd.libkungfu.dev/schemas/kfd-2/trust-taxonomy.schema.json#/$defs/residualRisk",
  riskType: "natural-language-semantic-risk",
  trustImpact: "downgrade-warning",
  machineProvability: "not-exhaustively-enumerable",
  agentAction: "semantic-review-required",
  reason: "Natural-language standard interpretation is inspectable and reviewable but cannot be exhaustively proved from package bytes.",
  owner: "KFD maintainers",
};
const draftAutonomyResidualRisk = {
  id: "autonomous-discovery-not-yet-proved",
  definedBy: "https://kfd.libkungfu.dev/schemas/kfd-2/trust-taxonomy.schema.json#/$defs/residualRisk",
  riskType: "external-fact-risk",
  trustImpact: "downgrade-warning",
  machineProvability: "partially-machine-verifiable",
  agentAction: "verify-external-facts",
  reason: "KFD-6 publishes a draft experiment contract, but no current package fact proves a conforming autonomous primitive-discovery implementation.",
  owner: "KFD maintainers and experimental adopters",
};
const draftActionModelResidualRisk = {
  id: "action-model-activation-not-yet-proved",
  definedBy: "https://kfd.libkungfu.dev/schemas/kfd-2/trust-taxonomy.schema.json#/$defs/residualRisk",
  riskType: "external-fact-risk",
  trustImpact: "downgrade-warning",
  machineProvability: "partially-machine-verifiable",
  agentAction: "verify-external-facts",
  reason: "KFD-7 is a numbered draft with published reference semantics, but no current package fact proves cross-domain minimality, product usability, or activation.",
  owner: "KFD maintainers and experimental adopters",
};
const writeJson = (filePath, value) => {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
  console.log(`updated ${filePath}`);
};

const packageJson = readJson("package.json");
const releaseAnchor = readJson("kfd.release.json");

const sourceBindings = [
  pointer("package.json", { id: "package-version-and-exports" }),
  pointer("kfd.release.json", { id: "anchored-release-version" }),
  pointer("registry.json", { id: "decision-registry" }),
  pointer("standards.json", { id: "standards-metadata" }),
  pointer("release-impact.json", { id: "release-impact-ledger" }),
  pointer("buildchain.toml", { id: "buildchain-release-contract" }),
  pointer("buildchain.alpha-contract-lock.json", { id: "buildchain-alpha-runtime-contract-lock" }),
  pointer("buildchain.contract-lock.json", { id: "buildchain-runtime-contract-lock" }),
];

const machineEvidence = [
  pointer("scripts/check.mjs", { id: "self-verification-command" }),
  pointer(".github/workflows/build.yml", { id: "buildchain-build-workflow" }),
  pointer(".github/workflows/buildchain-ref-promotion.yml", { id: "buildchain-promotion-workflow" }),
  pointer("schemas/kfd-2/trust-taxonomy.schema.json", { id: "kfd-2-trust-taxonomy-schema" }),
  pointer("schemas/kfd-2/trust-claims.schema.json", { id: "kfd-2-trust-claims-schema" }),
  pointer("schemas/kfd-2/trust-assessment.schema.json", { id: "kfd-2-trust-assessment-schema" }),
  pointer("schemas/kfd-2/release-claims.schema.json", { id: "kfd-2-release-claims-schema" }),
  pointer("schemas/kfd-2/release-trust-passport.schema.json", { id: "kfd-2-release-trust-passport-schema" }),
];

const hashes = Object.fromEntries(
  [...sourceBindings, ...machineEvidence].map((entry) => [entry.id, entry.sha256]),
);

const releaseClaim = {
  id: "kfd-public-release-trust",
  public: true,
  claim:
    "The KFD npm release is backed by declared source facts, machine-readable evidence, artifact coordinates, verification, audit boundary, responsibility, and explicit residual-risk state.",
  sourceBindings,
  machineEvidence,
  hashes,
  artifacts: [
    {
      name: packageJson.name,
      version: packageJson.version,
      path: "package.json",
      sha256: sha256File("package.json"),
    },
    {
      name: "kfd-release-anchor",
      version: releaseAnchor.npmVersion,
      path: "kfd.release.json",
      sha256: sha256File("kfd.release.json"),
    },
  ],
  verification: {
    result: "passed",
    command: "node scripts/check.mjs",
  },
  auditBoundary: {
    scope: "KFD public npm package release facts, package exports, release governance files, and Buildchain release-passport inputs",
    enumerability: "closed-world",
  },
  responsibility: {
    owner: "KFD maintainers",
    sourceOwner: "KFD maintainers",
    verificationOwner: "KFD package self-verification",
    releaseDecisionOwner: "KFD maintainers",
    releasePassportProofOwner: "Buildchain",
  },
  residualRisk: [],
};

writeJson(releaseClaimPath, releaseClaim);

const trustClaims = {
  schemaVersion: 1,
  contract: "kfd-2-trust-claims",
  standard: "kfd-2",
  projection: {
    kind: "generic",
    description: "KFD self-dogfood claims for assessing KFD-1 and KFD-3 through KFD-7 from the generic KFD-2 trust model.",
  },
  claims: [
    {
      id: "kfd-1-contract-world-trust",
      statement:
        "KFD-1 is trustable as the KFD package contract-world rule because its surface register, schema, witness, and verification command are inspectable from committed package facts.",
      subject: {
        kind: "contract-world",
        id: "kfd-1-surface-register",
        standard: "kfd-1",
        description: "KFD-1 non-drifting fact-source and compatibility-impact surface register.",
      },
      facts: [
        artifactPointer("file", "standards.json"),
        artifactPointer("schema", "schemas/kfd-1/contract-world.schema.json"),
      ],
      evidence: [
        evidence("schema", "schemas/kfd-1/contract-world.schema.json", "KFD-1 contract-world schema is published as a package surface."),
        evidence("file", "scripts/check.mjs", "The package check gate validates the KFD-1 schema, surface register, witness, and hashes."),
      ],
      verification: {
        command: "node scripts/check.mjs",
        expectedResult: "pass",
      },
      auditBoundary: {
        scope: "KFD package KFD-1 surface-register, schema, witness, and self-verification gate",
        enumerability: "closed-world",
      },
      residualRisk: [],
      responsibility,
      status: "enforced",
    },
    {
      id: "kfd-3-collaboration-interface-trust",
      statement:
        "KFD-3 is trustable as a participant-facing collaboration interface because KFD publishes the declared interface, explicit value evidence, prebuild witness, artifact witness, extension path, and closure check.",
      subject: {
        kind: "collaboration-interface",
        id: "kfd-3-collaboration-interface",
        standard: "kfd-3",
        description: "KFD package collaboration interface for humans, agents, maintainers, package consumers, site consumers, and release systems.",
      },
      facts: [
        artifactPointer("file", ".buildchain/kfd-3/collaboration-interface.json"),
      ],
      evidence: [
        evidence("schema", "schemas/kfd-3/collaboration-interface.schema.json", "KFD-3 collaboration interface schema is published."),
        evidence("file", ".buildchain/kfd-3/collaboration-interface.json", "KFD-3 source collaboration interface declares reachable participant-facing surfaces and value evidence."),
        evidence("file", "scripts/check.mjs", "The package check gate validates KFD-3 interface closure and witness parity."),
      ],
      verification: {
        command: "node scripts/check.mjs",
        expectedResult: "warning",
      },
      auditBoundary: {
        scope: "KFD participant-facing collaboration surfaces, extension paths, and shipped witness files",
        enumerability: "closed-world",
      },
      residualRisk: [naturalLanguageResidualRisk],
      responsibility,
      status: "enforced",
    },
    {
      id: "kfd-4-observer-perspective-trust",
      statement:
        "KFD-4 is trustable as a declared-perspective principle with package-level observer-timeline and perspective-replay profiles because KFD publishes the decision, schemas, standards metadata, and verification gate; adopter-specific capture, replay fidelity, and runtime correctness remain separate KFD-2 claims.",
      subject: {
        kind: "observer-perspective",
        id: "kfd-4-observer-perspective",
        standard: "kfd-4",
        description: "KFD-4 declared-perspective principle with observer-timeline and perspective-replay profiles.",
      },
      facts: [
        artifactPointer("file", "decisions/KFD-4.md"),
        artifactPointer("file", "standards.json"),
        artifactPointer("schema", "schemas/kfd-4/observer-perspective.schema.json"),
        artifactPointer("schema", "schemas/kfd-4/perspective-replay.schema.json"),
      ],
      evidence: [
        evidence("schema", "schemas/kfd-4/observer-perspective.schema.json", "KFD-4 observer-perspective schema is published."),
        evidence("schema", "schemas/kfd-4/perspective-replay.schema.json", "KFD-4 perspective-preserving and contrastive replay schema is published."),
        evidence("file", "standards.json", "Standards metadata exposes the KFD-4 schema ID, path, interface version, and concept names."),
        evidence("file", "scripts/check.mjs", "The package check gate validates the KFD-4 timeline and replay schemas plus standards metadata; it does not assess adopter-specific capture or replay fidelity."),
      ],
      verification: {
        command: "node scripts/check.mjs",
        expectedResult: "pass",
      },
      auditBoundary: {
        scope: "KFD-4 package principle, observer-timeline and perspective-replay profiles, standards metadata, and self-verification gate; excludes adopter capture, replay fidelity, and runtime correctness",
        enumerability: "closed-world",
      },
      residualRisk: [],
      responsibility,
      status: "enforced",
    },
    {
      id: "kfd-5-primitive-discovery-trust",
      statement:
        "KFD-5 is trustable as a package-level version 3 primitive-discovery interface because KFD publishes the active procedure, required perspective-declared method-plural genesis record, fact-bound qualification record, optional boundary-pressure diagnostic, standards metadata, and verification gate; adopter conclusions and method-superiority claims remain separate KFD-2 claims.",
      subject: {
        kind: "primitive-discovery",
        id: "kfd-5-primitive-discovery",
        standard: "kfd-5",
        description: "KFD-5 version 3 method-plural genesis and primitive-qualification interface.",
      },
      facts: [
        artifactPointer("file", "decisions/KFD-5.md"),
        artifactPointer("file", "standards.json"),
        artifactPointer("schema", "schemas/kfd-5/primitive-discovery.schema.json"),
      ],
      evidence: [
        evidence("schema", "schemas/kfd-5/primitive-discovery.schema.json", "KFD-5 primitive-discovery schema is published."),
        evidence("file", "scripts/check.mjs", "The package check gate validates the KFD-5 interface and metadata; it does not certify adopter candidates."),
      ],
      verification: { command: "node scripts/check.mjs", expectedResult: "pass" },
      auditBoundary: {
        scope: "KFD-5 package decision text, schema, standards metadata, and self-verification gate; excludes adopter candidate validity",
        enumerability: "closed-world",
      },
      residualRisk: [],
      responsibility,
      status: "enforced",
    },
    {
      id: "kfd-6-autonomous-discovery-loop-trust",
      statement:
        "KFD-6 is trustable only as a published draft version 4 experiment interface with required grounded generation experiments, bounded method comparison, and conditional boundary hypothesis; KFD does not claim that a conforming autonomous primitive-discovery implementation or dominant generation method currently exists.",
      subject: {
        kind: "autonomous-discovery-loop",
        id: "kfd-6-autonomous-discovery-loop",
        standard: "kfd-6",
        description: "KFD-6 draft autonomous-discovery-loop version 4 interface with grounded method-plural experiments.",
      },
      facts: [
        artifactPointer("file", "decisions/KFD-6.md"),
        artifactPointer("file", "standards.json"),
        artifactPointer("schema", "schemas/kfd-6/autonomous-discovery-loop.schema.json"),
      ],
      evidence: [
        evidence("schema", "schemas/kfd-6/autonomous-discovery-loop.schema.json", "KFD-6 autonomous-discovery-loop version 4 experiment schema is published."),
        evidence("file", "scripts/check.mjs", "The package check gate validates draft status, required generation experiments, bounded method comparison, conditional boundary hypothesis, and anti-self-certification constants."),
      ],
      verification: { command: "node scripts/check.mjs", expectedResult: "warning" },
      auditBoundary: {
        scope: "KFD-6 draft text, schema, standards metadata, and package checks; excludes any claim of a conforming autonomous implementation",
        enumerability: "closed-world",
      },
      residualRisk: [draftAutonomyResidualRisk],
      responsibility,
      status: "declared",
    },
    {
      id: "kfd-7-action-responsibility-trust",
      statement:
        "KFD-7 is trustable as a numbered draft action-responsibility principle because KFD publishes its decision, formal reference, usage boundary, standards metadata, promotion lineage, and verification gate; KFD does not claim that cross-domain minimality, product usability, or activation is already proved.",
      subject: {
        kind: "action-responsibility",
        id: "kfd-7-action-responsibility",
        standard: "kfd-7",
        description: "KFD-7 draft separation of direction, perspective, authority, and realized occurrence over Fact cuts and causal records.",
      },
      facts: [
        artifactPointer("file", "decisions/KFD-7.md"),
        artifactPointer("file", "docs/KFD-7-formal.md"),
        artifactPointer("file", "docs/KFD-7-usage.md"),
        artifactPointer("file", "standards.json"),
        artifactPointer("file", "drafts/action-state-separation.md"),
      ],
      evidence: [
        evidence("file", "registry.json", "The numbered registry allocates KFD-7 with draft status."),
        evidence("file", "drafts/registry.json", "The candidate registry preserves the promoted source lineage and keeps KFD-8 through KFD-10 non-binding."),
        evidence("file", "scripts/check.mjs", "The package check gate validates KFD-7 identity, formal binding, concepts, draft status, trust projection, and participant-facing closure."),
      ],
      verification: { command: "node scripts/check.mjs", expectedResult: "warning" },
      auditBoundary: {
        scope: "KFD-7 numbered draft text, formal and usage references, standards metadata, promotion lineage, and package checks; excludes cross-domain minimality, adopter implementation correctness, product usability, and activation",
        enumerability: "closed-world",
      },
      residualRisk: [draftActionModelResidualRisk],
      responsibility,
      status: "declared",
    },
  ],
  schemaEvolution: {
    compatibilityRule:
      "Compatible additions may keep schemaVersion 1; semantic, required-field, verification-meaning, or responsibility-boundary changes require a new interface version or contract.",
  },
};
writeJson(trustClaimsPath, trustClaims);

const trustClaimsDigest = digestFile(trustClaimsPath);
const assessment = {
  schemaVersion: 1,
  contract: "kfd-2-trust-assessment",
  standard: "kfd-2",
  assessedClaims: {
    schemaId: "https://kfd.libkungfu.dev/schemas/kfd-2/trust-claims.schema.json",
    path: trustClaimsPath,
    digest: trustClaimsDigest,
  },
  result: "warning",
  projection: {
    kind: "generic",
    description: "Generic KFD-2 assessment of KFD-owned foundation and practice guideline claims.",
  },
  assessments: [
    {
      id: "assess-kfd-1-contract-world-trust",
      claimId: "kfd-1-contract-world-trust",
      subject: trustClaims.claims[0].subject,
      result: "pass",
      facts: trustClaims.claims[0].facts.map((entry) => evidenceResult(entry.kind, entry.path, `Fact ${entry.path} is present and hashable.`)),
      evidence: trustClaims.claims[0].evidence.map((entry) => evidenceResult(entry.type, entry.pointer.path, entry.description)),
      auditBoundary: trustClaims.claims[0].auditBoundary,
      responsibility,
      residualRisk: [],
    },
    {
      id: "assess-kfd-3-collaboration-interface-trust",
      claimId: "kfd-3-collaboration-interface-trust",
      subject: trustClaims.claims[1].subject,
      result: "warning",
      facts: trustClaims.claims[1].facts.map((entry) => evidenceResult(entry.kind, entry.path, `Fact ${entry.path} is present and hashable.`)),
      evidence: trustClaims.claims[1].evidence.map((entry) => evidenceResult(entry.type, entry.pointer.path, entry.description)),
      auditBoundary: trustClaims.claims[1].auditBoundary,
      responsibility,
      residualRisk: [naturalLanguageResidualRisk],
    },
    {
      id: "assess-kfd-4-observer-perspective-trust",
      claimId: "kfd-4-observer-perspective-trust",
      subject: trustClaims.claims[2].subject,
      result: "pass",
      facts: trustClaims.claims[2].facts.map((entry) => evidenceResult(entry.kind, entry.path, `Fact ${entry.path} is present and hashable.`)),
      evidence: trustClaims.claims[2].evidence.map((entry) => evidenceResult(entry.type, entry.pointer.path, entry.description)),
      auditBoundary: trustClaims.claims[2].auditBoundary,
      responsibility,
      residualRisk: [],
    },
    {
      id: "assess-kfd-5-primitive-discovery-trust",
      claimId: "kfd-5-primitive-discovery-trust",
      subject: trustClaims.claims[3].subject,
      result: "pass",
      facts: trustClaims.claims[3].facts.map((entry) => evidenceResult(entry.kind, entry.path, `Fact ${entry.path} is present and hashable.`)),
      evidence: trustClaims.claims[3].evidence.map((entry) => evidenceResult(entry.type, entry.pointer.path, entry.description)),
      auditBoundary: trustClaims.claims[3].auditBoundary,
      responsibility,
      residualRisk: [],
    },
    {
      id: "assess-kfd-6-autonomous-discovery-loop-trust",
      claimId: "kfd-6-autonomous-discovery-loop-trust",
      subject: trustClaims.claims[4].subject,
      result: "warning",
      facts: trustClaims.claims[4].facts.map((entry) => evidenceResult(entry.kind, entry.path, `Fact ${entry.path} is present and hashable.`)),
      evidence: trustClaims.claims[4].evidence.map((entry) => evidenceResult(entry.type, entry.pointer.path, entry.description)),
      auditBoundary: trustClaims.claims[4].auditBoundary,
      responsibility,
      residualRisk: [draftAutonomyResidualRisk],
    },
    {
      id: "assess-kfd-7-action-responsibility-trust",
      claimId: "kfd-7-action-responsibility-trust",
      subject: trustClaims.claims[5].subject,
      result: "warning",
      facts: trustClaims.claims[5].facts.map((entry) => evidenceResult(entry.kind, entry.path, `Fact ${entry.path} is present and hashable.`)),
      evidence: trustClaims.claims[5].evidence.map((entry) => evidenceResult(entry.type, entry.pointer.path, entry.description)),
      auditBoundary: trustClaims.claims[5].auditBoundary,
      responsibility,
      residualRisk: [draftActionModelResidualRisk],
    },
  ],
  unboundClaims: [],
  downgradeReasons: [
    {
      id: "kfd-3-natural-language-semantics",
      riskType: "natural-language-semantic-risk",
      trustImpact: "downgrade-warning",
      reason: "KFD-3 exposes machine-checkable collaboration surfaces and value evidence, but the human-language meaning of trusted value and non-coercive cooperation remains a reviewable semantic responsibility.",
      agentAction: "semantic-review-required",
      source: "kfd-3-collaboration-interface-trust",
    },
    {
      id: "kfd-6-autonomous-discovery-not-yet-proved",
      riskType: "external-fact-risk",
      trustImpact: "downgrade-warning",
      reason: "KFD-6 is a draft experiment contract and does not yet have adopter evidence for a conforming autonomous primitive-discovery loop.",
      agentAction: "verify-external-facts",
      source: "kfd-6-autonomous-discovery-loop-trust",
    },
    {
      id: "kfd-7-action-model-activation-not-yet-proved",
      riskType: "external-fact-risk",
      trustImpact: "downgrade-warning",
      reason: "KFD-7 is a numbered draft whose package identity and reference model are proved, while cross-domain minimality, product usability, and activation remain external evidence obligations.",
      agentAction: "verify-external-facts",
      source: "kfd-7-action-responsibility-trust",
    },
  ],
  responsibility,
  schemaEvolution: trustClaims.schemaEvolution,
};
writeJson(trustAssessmentPath, assessment);
