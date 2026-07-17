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
const schemaSurfaces = [
  "schemas/kfd-standards.schema.json",
  "schemas/kfd-1/contract-world.schema.json",
  "schemas/kfd-1/witness.schema.json",
  "schemas/kfd-2/trust-taxonomy.schema.json",
  "schemas/kfd-2/trust-claims.schema.json",
  "schemas/kfd-2/trust-assessment.schema.json",
  "schemas/kfd-2/release-claims.schema.json",
  "schemas/kfd-2/release-trust-passport.schema.json",
  "schemas/kfd-3/collaboration-interface.schema.json",
  "schemas/kfd-3/witness.schema.json",
  "schemas/kfd-4/observer-perspective.schema.json",
  "schemas/kfd-4/perspective-replay.schema.json",
  "schemas/kfd-5/primitive-discovery.schema.json",
  "schemas/kfd-6/autonomous-discovery-loop.schema.json",
].map((filePath) => ({
  id: `schema:${filePath.replace(/^schemas\//, "").replace(/\.schema\.json$/, "").replace(/\//g, ":")}`,
  sourcePath: filePath,
  sha256: sha256File(filePath),
}));

const groupedSurfaces = {
  docs: [
    { id: "doc:readme", sourcePath: "README.md", sha256: sha256File("README.md") },
    { id: "doc:foundation-model", sourcePath: "docs/foundation-model.md", sha256: sha256File("docs/foundation-model.md") },
    { id: "doc:formal-model", sourcePath: "docs/formal-model.md", sha256: sha256File("docs/formal-model.md") },
    { id: "doc:primitive-discovery-cases", sourcePath: "docs/primitive-discovery-cases.md", sha256: sha256File("docs/primitive-discovery-cases.md") },
    { id: "doc:trademarks", sourcePath: "TRADEMARKS.md", sha256: sha256File("TRADEMARKS.md") },
    { id: "doc:docs-map", sourcePath: "docs/MAP.md", sha256: sha256File("docs/MAP.md") },
    { id: "doc:kfd-1-usage", sourcePath: "docs/KFD-1-usage.md", sha256: sha256File("docs/KFD-1-usage.md") },
    { id: "doc:kfd-2-usage", sourcePath: "docs/KFD-2-usage.md", sha256: sha256File("docs/KFD-2-usage.md") },
    { id: "doc:kfd-3-usage", sourcePath: "docs/KFD-3-usage.md", sha256: sha256File("docs/KFD-3-usage.md") },
    { id: "doc:kfd-4-usage", sourcePath: "docs/KFD-4-usage.md", sha256: sha256File("docs/KFD-4-usage.md") },
    { id: "doc:kfd-5-usage", sourcePath: "docs/KFD-5-usage.md", sha256: sha256File("docs/KFD-5-usage.md") },
    { id: "doc:kfd-6-usage", sourcePath: "docs/KFD-6-usage.md", sha256: sha256File("docs/KFD-6-usage.md") },
    ...formalDocs,
    ...decisionDocs,
  ],
  schemas: schemaSurfaces,
  standardsMetadata: [
    { id: "metadata:registry", sourcePath: "registry.json", sha256: sha256File("registry.json") },
    { id: "metadata:standards", sourcePath: "standards.json", sha256: sha256File("standards.json") },
    { id: "metadata:release-impact", sourcePath: "release-impact.json", sha256: sha256File("release-impact.json") },
    { id: "metadata:release-anchor", sourcePath: "kfd.release.json", sha256: sha256File("kfd.release.json") },
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
      pointer("docs/foundation-model.md", "Complete non-numbered foundation explanation"),
      pointer("docs/formal-model.md", "Shared formal notation and authority boundary"),
      pointer("docs/primitive-discovery-cases.md", "Source-bound historical anchors for primitive discovery"),
      pointer("TRADEMARKS.md", "Official status, trademark, and authority boundary"),
      pointer("docs/MAP.md", "Documentation routing entrypoint"),
      pointer("registry.json", "Machine-readable decision index"),
      pointer("standards.json", "Machine-readable standards metadata"),
      pointer(".buildchain/kfd-2/public-release-trust.claim.json", "KFD-2 public release trust claim"),
      pointer(".buildchain/kfd-2/kfd-foundation.trust-claims.json", "KFD-2 generic trust claims for KFD self-dogfood"),
      pointer(".buildchain/kfd-2/kfd-foundation.trust-assessment.json", "KFD-2 generic trust assessment for KFD self-dogfood"),
      pointer("package.json", "Package export map"),
      pointer("site/kfd-site.json", "Site content projection"),
    ],
    valueEvidence: valueEvidencePointers,
    transparentConstraints: [
      pointer("CONTRIBUTING.md", "Append-only decision and contribution constraints"),
      pointer("TRADEMARKS.md", "Trademark and official-status constraints"),
      pointer("scripts/check.mjs", "Repository self-verification gate"),
      pointer("site/kfd-site.json", "Site rendering boundary"),
    ],
    choicePaths: [
      pointer("README.md", "Human reading path"),
      pointer("docs/foundation-model.md", "Human and agent foundation reading path"),
      pointer("docs/formal-model.md", "Human and agent formal reference entrypoint"),
      pointer("docs/primitive-discovery-cases.md", "Human and agent historical case path"),
      pointer("registry.json", "Agent registry path"),
      pointer("standards.json", "Agent standards metadata path"),
      pointer(".buildchain/kfd-2/public-release-trust.claim.json", "Agent release trust claim path"),
      pointer(".buildchain/kfd-2/kfd-foundation.trust-claims.json", "Agent generic trust claims path"),
      pointer(".buildchain/kfd-2/kfd-foundation.trust-assessment.json", "Agent generic trust assessment path"),
      pointer("package.json", "Package consumption path"),
    ],
    manuals: [
      pointer("docs/MAP.md"),
      pointer("docs/foundation-model.md"),
      pointer("docs/formal-model.md"),
      pointer("docs/primitive-discovery-cases.md"),
      pointer("TRADEMARKS.md"),
      pointer("docs/KFD-1-usage.md"),
      pointer("docs/KFD-2-usage.md"),
      pointer("docs/KFD-3-usage.md"),
      pointer("docs/KFD-4-usage.md"),
      pointer("docs/KFD-5-usage.md"),
      pointer("docs/KFD-6-usage.md"),
      ...formalDocs.map((entry) => pointer(entry.sourcePath)),
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
