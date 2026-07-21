import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import crypto from "node:crypto";
import path from "node:path";

const interfacePath = ".buildchain/kfd-3/collaboration-interface.json";
const prebuildPath = ".buildchain/kfd-3/collaboration-interface.prebuild.json";
const artifactPath = ".buildchain/kfd-3/collaboration-interface.artifact.json";

const readJson = (filePath) => JSON.parse(readFileSync(filePath, "utf8"));
const sha256File = (filePath) => crypto.createHash("sha256").update(readFileSync(filePath)).digest("hex");
const hashablePath = (filePath) => filePath.split("#", 1)[0];
const pointer = (filePath, description = undefined) => ({
  path: filePath,
  sha256: sha256File(hashablePath(filePath)),
  ...(description ? { description } : {}),
});

const writeJson = (filePath, value) => {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
};

const packageJson = readJson("package.json");
const registry = readJson("registry.json");
const standards = readJson("standards.json");
const liveCaseRegistry = readJson("cases/registry.json");
const candidateRegistry = readJson("drafts/registry.json");
const collaborationInterface = readJson(interfacePath);
const interfaceSha = sha256File(interfacePath);
const interfaceDigest = `sha256:${interfaceSha}`;

const decisionDocs = registry.entries.map((entry) => ({
  id: `decision:${entry.slug}`,
  sourcePath: entry.path,
  sha256: sha256File(entry.path),
}));
const formalDocs = registry.entries.map((entry) => ({
  id: `doc:${entry.slug}-formal`,
  sourcePath: standards.standards[entry.slug].formalModel.path,
  sha256: sha256File(standards.standards[entry.slug].formalModel.path),
}));
const usageDocs = registry.entries.map((entry) => ({
  id: `doc:${entry.slug}-usage`,
  sourcePath: `docs/KFD-${entry.number}-usage.md`,
  sha256: sha256File(`docs/KFD-${entry.number}-usage.md`),
}));
const liveCaseSurfaces = liveCaseRegistry.cases.flatMap((entry) => [
  { id: `case:${entry.id}:entry`, sourcePath: entry.humanEntry, sha256: sha256File(entry.humanEntry) },
  { id: `case:${entry.id}:genesis`, sourcePath: entry.genesis, sha256: sha256File(entry.genesis) },
  ...(entry.developmentLineage ? [{
    id: `case:${entry.id}:development-lineage`,
    sourcePath: entry.developmentLineage,
    sha256: sha256File(entry.developmentLineage),
  }] : []),
  { id: `case:${entry.id}:method-trace`, sourcePath: entry.methodTrace, sha256: sha256File(entry.methodTrace) },
  { id: `case:${entry.id}:propagation-hypothesis`, sourcePath: entry.propagationHypothesis, sha256: sha256File(entry.propagationHypothesis) },
  { id: `case:${entry.id}:review-index`, sourcePath: entry.reviewIndex, sha256: sha256File(entry.reviewIndex) },
  { id: `case:${entry.id}:ontology-split`, sourcePath: entry.ontologySplit, sha256: sha256File(entry.ontologySplit) },
  {
    id: `case:${entry.id}:distinguishability-argument`,
    sourcePath: entry.distinguishabilityArgument,
    sha256: sha256File(entry.distinguishabilityArgument),
  },
  ...entry.candidateTracks.map((track) => ({
    id: `case:${entry.id}:candidate:${track.id}:current-cut`,
    sourcePath: track.currentCut.path,
    sha256: sha256File(track.currentCut.path),
  })),
]);
const candidateSurfaces = [
  { id: "candidate:index", sourcePath: "drafts/README.md", sha256: sha256File("drafts/README.md") },
  { id: "candidate:registry", sourcePath: "drafts/registry.json", sha256: sha256File("drafts/registry.json") },
  ...candidateRegistry.candidates.map((entry) => ({
    id: `candidate:${entry.id}`,
    sourcePath: entry.path,
    sha256: sha256File(entry.path),
  })),
  ...candidateRegistry.candidates
    .filter((entry) => entry.formalReference)
    .map((entry) => ({
      id: `candidate:${entry.id}:formal`,
      sourcePath: entry.formalReference.path,
      sha256: sha256File(entry.formalReference.path),
    })),
];
const schemaSurfaces = [...new Set(Object.values(standards.standards).flatMap(
  (standard) => Object.values(standard.schemaPaths ?? {}),
))].map((filePath) => ({
  id: `schema:${filePath.replace(/^schemas\//, "").replace(/\.schema\.json$/, "").replace(/\//g, ":")}`,
  sourcePath: filePath,
  sha256: sha256File(filePath),
}));

const groupedSurfaces = {
  docs: [
    { id: "doc:readme", sourcePath: "README.md", sha256: sha256File("README.md") },
    { id: "doc:contributing", sourcePath: "CONTRIBUTING.md", sha256: sha256File("CONTRIBUTING.md") },
    { id: "doc:governance", sourcePath: "GOVERNANCE.md", sha256: sha256File("GOVERNANCE.md") },
    { id: "doc:kfd-proposal-form", sourcePath: ".github/ISSUE_TEMPLATE/kfd-proposal.yml", sha256: sha256File(".github/ISSUE_TEMPLATE/kfd-proposal.yml") },
    { id: "doc:kfd-counterevidence-form", sourcePath: ".github/ISSUE_TEMPLATE/kfd-counterevidence.yml", sha256: sha256File(".github/ISSUE_TEMPLATE/kfd-counterevidence.yml") },
    { id: "doc:kfd-adopter-profile-form", sourcePath: ".github/ISSUE_TEMPLATE/adopter-profile.yml", sha256: sha256File(".github/ISSUE_TEMPLATE/adopter-profile.yml") },
    { id: "doc:kfd-pull-request-template", sourcePath: ".github/pull_request_template.md", sha256: sha256File(".github/pull_request_template.md") },
    { id: "doc:foundation", sourcePath: "docs/foundation.md", sha256: sha256File("docs/foundation.md") },
    { id: "doc:terminology", sourcePath: "docs/terminology.md", sha256: sha256File("docs/terminology.md") },
    { id: "doc:formal-model", sourcePath: "docs/formal-model.md", sha256: sha256File("docs/formal-model.md") },
    { id: "doc:field-responsibility-matrix", sourcePath: "docs/field-responsibility-matrix.md", sha256: sha256File("docs/field-responsibility-matrix.md") },
    { id: "doc:decision-admission-foundation-revision", sourcePath: "docs/foundation-revision-2026-07-21-decision-admission.md", sha256: sha256File("docs/foundation-revision-2026-07-21-decision-admission.md") },
    { id: "doc:decision-admission-foundation-revision-map", sourcePath: "docs/foundation-revision-2026-07-21-decision-admission.json", sha256: sha256File("docs/foundation-revision-2026-07-21-decision-admission.json") },
    { id: "doc:primitive-discovery-cases", sourcePath: "docs/primitive-discovery-cases.md", sha256: sha256File("docs/primitive-discovery-cases.md") },
    { id: "doc:trademarks", sourcePath: "TRADEMARKS.md", sha256: sha256File("TRADEMARKS.md") },
    { id: "doc:docs-map", sourcePath: "docs/MAP.md", sha256: sha256File("docs/MAP.md") },
    ...usageDocs,
    { id: "doc:kfd-7-activation", sourcePath: "docs/KFD-7-activation.md", sha256: sha256File("docs/KFD-7-activation.md") },
    ...liveCaseSurfaces,
    ...candidateSurfaces,
    ...formalDocs,
    ...decisionDocs,
  ],
  schemas: schemaSurfaces,
  standardsMetadata: [
    { id: "metadata:registry", sourcePath: "registry.json", sha256: sha256File("registry.json") },
    { id: "metadata:standards", sourcePath: "standards.json", sha256: sha256File("standards.json") },
    { id: "metadata:terminology", sourcePath: "terminology.json", sha256: sha256File("terminology.json") },
    { id: "metadata:live-case-registry", sourcePath: "cases/registry.json", sha256: sha256File("cases/registry.json") },
    { id: "metadata:candidate-registry", sourcePath: "drafts/registry.json", sha256: sha256File("drafts/registry.json") },
    { id: "metadata:release-impact", sourcePath: "release-impact.json", sha256: sha256File("release-impact.json") },
    { id: "metadata:release-anchor", sourcePath: "kfd.release.json", sha256: sha256File("kfd.release.json") },
    { id: "metadata:kfd-7-activation-evidence", sourcePath: "evidence/kfd-7/activation-record.json", sha256: sha256File("evidence/kfd-7/activation-record.json") },
    { id: "metadata:buildchain-alpha-contract-lock", sourcePath: "buildchain.alpha-contract-lock.json", sha256: sha256File("buildchain.alpha-contract-lock.json") },
    { id: "metadata:buildchain-contract-lock", sourcePath: "buildchain.contract-lock.json", sha256: sha256File("buildchain.contract-lock.json") },
    { id: "metadata:kfd-2-public-release-trust-claim", sourcePath: ".buildchain/kfd-2/public-release-trust.claim.json", sha256: sha256File(".buildchain/kfd-2/public-release-trust.claim.json") },
    { id: "metadata:kfd-2-foundation-trust-claims", sourcePath: ".buildchain/kfd-2/kfd-foundation.trust-claims.json", sha256: sha256File(".buildchain/kfd-2/kfd-foundation.trust-claims.json") },
    { id: "metadata:kfd-2-foundation-trust-assessment", sourcePath: ".buildchain/kfd-2/kfd-foundation.trust-assessment.json", sha256: sha256File(".buildchain/kfd-2/kfd-foundation.trust-assessment.json") },
  ],
  packageExports: [
    { id: "export:package-json", sourcePath: "package.json#exports", sha256: sha256File("package.json") },
    { id: "export:npm-files", sourcePath: "package.json#files", sha256: sha256File("package.json") },
  ],
  siteConsumptionContracts: [
    { id: "site:kfd-site-bundle", sourcePath: "site/kfd-site.json", sha256: sha256File("site/kfd-site.json") },
    { id: "site:release-propagation", sourcePath: "buildchain.release-propagation.json", sha256: sha256File("buildchain.release-propagation.json") },
  ],
};

const explicitSurfaces = collaborationInterface.surfaces.map((surface) => ({
  id: surface.id,
  name: surface.id,
  kind: surface.kind,
  participantProfile: Array.isArray(surface.participants) ? surface.participants.join(",") : "",
  availability: surface.maturity || "shipped",
  visibility: "public",
  participantFacing: true,
  public: true,
  sourcePath: surface.discoverability?.path || "",
}));

const declaredSurfaceIds = new Set(explicitSurfaces.map((surface) => surface.id));
for (const entrypoint of collaborationInterface.minimalEntrypoints) {
  if (declaredSurfaceIds.has(entrypoint.id)) continue;
  explicitSurfaces.push({
    id: entrypoint.id,
    name: entrypoint.id,
    kind: "entrypoint",
    participantProfile: Array.isArray(entrypoint.participants) ? entrypoint.participants.join(",") : "",
    availability: "shipped",
    visibility: "public",
    participantFacing: true,
    public: true,
    sourcePath: entrypoint.surface,
  });
  declaredSurfaceIds.add(entrypoint.id);
}

const valueEvidencePointers = (() => {
  const entriesByPath = new Map();
  for (const valueClaim of collaborationInterface.valueEvidence ?? []) {
    for (const entry of [
      ...(valueClaim.facts ?? []),
      ...(valueClaim.evidence ?? []),
      ...(valueClaim.trustAssessment ? [valueClaim.trustAssessment] : []),
    ]) {
      if (!entry?.path || entriesByPath.has(entry.path)) continue;
      entriesByPath.set(
        entry.path,
        pointer(entry.path, `KFD-3 value evidence for ${valueClaim.id}: ${valueClaim.claim}`)
      );
    }
  }
  return [...entriesByPath.values()];
})();

const participantProfiles = collaborationInterface.participants.map((entry) => entry.id);
const responsibility = {
  registryFactsOwner: "KFD maintainers",
  artifactVerificationOwner: "KFD package self-verification",
  releasePassportProofOwner: "Buildchain",
};
const residualRisk = [
  {
    id: "human-language-interpretation",
    definedBy: "https://kfd.libkungfu.dev/schemas/kfd-2/trust-taxonomy.schema.json#/$defs/residualRisk",
    riskType: "natural-language-semantic-risk",
    trustImpact: "downgrade-warning",
    machineProvability: "not-exhaustively-enumerable",
    agentAction: "semantic-review-required",
    reason: "Natural-language standard interpretation is inspectable and reviewable but not exhaustively enumerable from package bytes.",
    owner: "KFD maintainers",
  },
];

const prebuild = {
  schemaVersion: 1,
  contract: "kungfu-buildchain-kfd-3-collaboration-interface-prebuild-witness",
  id: "kfd-repository",
  standard: "kfd-3",
  supportLevel: "release",
  source: {
    repo: "kungfu-systems/kfd",
  },
  sourceRegistry: {
    id: "kfd-collaboration-interface",
    path: interfacePath,
    sha256: interfaceSha,
  },
  collaborationInterfaceDigest: interfaceDigest,
  collaborationInterface,
  participantProfiles,
  surfaces: explicitSurfaces,
  ...groupedSurfaces,
  auditBoundary: {
    mode: "closed-world",
    scope: "KFD participant-facing public collaboration/control surfaces shipped in the repository and npm package",
    reachableSurfaceMode: "declared-boundary",
    unclassifiedPolicy: "fail",
    nonExhaustivelyEnumerableSurfaces: residualRisk,
  },
  residualRisk,
  responsibility,
  expectedArtifactVerification: {
    command: "node scripts/check.mjs",
  },
};

const artifact = {
  schemaVersion: 1,
  contract: "kfd-3-witness",
  id: "kfd-repository",
  standard: "kfd-3",
  collaborationInterface: {
    schemaId: standards.standards["kfd-3"].schemaIds.collaborationInterface,
    digest: interfaceDigest,
  },
  sourceRegistry: {
    id: "kfd-collaboration-interface",
    path: interfacePath,
    sha256: interfaceSha,
  },
  artifact: {
    name: packageJson.name,
    path: "npm:@kungfu-tech/kfd",
    digest: interfaceDigest,
  },
  surfaces: explicitSurfaces,
  ...groupedSurfaces,
  evidence: {
    minimalEntrypoints: collaborationInterface.minimalEntrypoints.map((entry) => pointer(entry.surface, entry.purpose)),
    discoverability: [
      pointer("README.md", "Human and agent entrypoint"),
      pointer("docs/foundation.md", "Complete non-numbered foundation explanation"),
      pointer("docs/terminology.md", "Canonical terminology and layer boundaries"),
      pointer("terminology.json", "Machine-readable terminology contract"),
      pointer("docs/formal-model.md", "Shared formal notation and authority boundary"),
      pointer("docs/primitive-discovery-cases.md", "Source-bound historical anchors for primitive discovery"),
      pointer("cases/registry.json", "Machine-readable provisional Primitive case registry"),
      pointer("drafts/registry.json", "Machine-readable pre-number KFD Candidate registry"),
      pointer("CONTRIBUTING.md", "Public proposal, counterevidence, implementation, and review process"),
      pointer("GOVERNANCE.md", "Open participation and canonical stewardship boundary"),
      pointer("TRADEMARKS.md", "Official status, trademark, and authority boundary"),
      pointer("docs/MAP.md", "Documentation routing entrypoint"),
      pointer("registry.json", "Machine-readable decision index"),
      pointer("standards.json", "Machine-readable standards metadata"),
      pointer("evidence/kfd-7/activation-record.json", "Machine-readable KFD-7 qualification and activation evidence cut"),
      pointer(".buildchain/kfd-2/public-release-trust.claim.json", "KFD-2 public release trust claim"),
      pointer(".buildchain/kfd-2/kfd-foundation.trust-claims.json", "KFD-2 generic trust claims for KFD self-dogfood"),
      pointer(".buildchain/kfd-2/kfd-foundation.trust-assessment.json", "KFD-2 generic trust assessment for KFD self-dogfood"),
      pointer("package.json", "Package export map"),
      pointer("site/kfd-site.json", "Site content projection"),
    ],
    valueEvidence: valueEvidencePointers,
    transparentConstraints: [
      pointer("CONTRIBUTING.md", "Open contribution and append-only decision constraints"),
      pointer("GOVERNANCE.md", "Canonical stewardship and maintainer responsibility constraints"),
      pointer("TRADEMARKS.md", "Trademark and official-status constraints"),
      pointer("scripts/check.mjs", "Repository self-verification gate"),
      pointer("site/kfd-site.json", "Site rendering boundary"),
    ],
    choicePaths: [
      pointer("README.md", "Human reading path"),
      pointer("docs/foundation.md", "Human and agent foundation reading path"),
      pointer("docs/formal-model.md", "Human and agent formal reference entrypoint"),
      pointer("docs/primitive-discovery-cases.md", "Human and agent historical case path"),
      pointer("cases/registry.json", "Human and agent provisional live case path"),
      pointer("drafts/registry.json", "Human and agent pre-number KFD Candidate path"),
      pointer("CONTRIBUTING.md", "Public contribution and challenge path"),
      pointer("GOVERNANCE.md", "Governance and stewardship path"),
      pointer("registry.json", "Agent registry path"),
      pointer("standards.json", "Agent standards metadata path"),
      pointer("evidence/kfd-7/activation-record.json", "Agent KFD-7 activation evidence path"),
      pointer(".buildchain/kfd-2/public-release-trust.claim.json", "Agent release trust claim path"),
      pointer(".buildchain/kfd-2/kfd-foundation.trust-claims.json", "Agent generic trust claims path"),
      pointer(".buildchain/kfd-2/kfd-foundation.trust-assessment.json", "Agent generic trust assessment path"),
      pointer("package.json", "Package consumption path"),
    ],
    manuals: [
      pointer("CONTRIBUTING.md"),
      pointer("GOVERNANCE.md"),
      pointer("docs/MAP.md"),
      pointer("docs/foundation.md"),
      pointer("docs/formal-model.md"),
      pointer("docs/primitive-discovery-cases.md"),
      pointer("cases/registry.json"),
      pointer("drafts/README.md"),
      pointer("drafts/registry.json"),
      pointer("TRADEMARKS.md"),
      pointer("docs/KFD-1-usage.md"),
      pointer("docs/KFD-2-usage.md"),
      pointer("docs/KFD-3-usage.md"),
      pointer("docs/KFD-4-usage.md"),
      pointer("docs/KFD-5-usage.md"),
      pointer("docs/KFD-6-usage.md"),
      pointer("docs/KFD-7-usage.md"),
      pointer("docs/KFD-7-activation.md"),
      ...formalDocs.map((entry) => pointer(entry.sourcePath)),
      ...liveCaseSurfaces.map((entry) => pointer(entry.sourcePath)),
      ...candidateRegistry.candidates.map((entry) => pointer(entry.path)),
      ...candidateRegistry.candidates
        .filter((entry) => entry.formalReference)
        .map((entry) => pointer(entry.formalReference.path)),
    ],
  },
  closure: {
    classificationMode: "closed-world",
    reachableEntrypoints: collaborationInterface.minimalEntrypoints.map((entry) => entry.id),
    classifiedEntrypoints: collaborationInterface.minimalEntrypoints.map((entry) => entry.id),
    unclassifiedEntrypoints: [],
  },
  verifier: {
    name: "kfd self-verification",
    command: "node scripts/check.mjs",
  },
  residualRisk,
  result: "pass",
};

writeJson(prebuildPath, prebuild);
writeJson(artifactPath, artifact);
console.log(`updated ${prebuildPath}`);
console.log(`updated ${artifactPath}`);
