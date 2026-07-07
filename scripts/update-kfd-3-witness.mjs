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
const schemaSurfaces = [
  "schemas/kfd-standards.schema.json",
  "schemas/kfd-1/contract-world.schema.json",
  "schemas/kfd-1/witness.schema.json",
  "schemas/kfd-2/trust-taxonomy.schema.json",
  "schemas/kfd-2/release-claims.schema.json",
  "schemas/kfd-2/release-trust-passport.schema.json",
  "schemas/kfd-3/collaboration-interface.schema.json",
  "schemas/kfd-3/witness.schema.json",
].map((filePath) => ({
  id: `schema:${filePath.replace(/^schemas\//, "").replace(/\.schema\.json$/, "").replace(/\//g, ":")}`,
  sourcePath: filePath,
  sha256: sha256File(filePath),
}));

const groupedSurfaces = {
  docs: [
    { id: "doc:readme", sourcePath: "README.md", sha256: sha256File("README.md") },
    { id: "doc:trademarks", sourcePath: "TRADEMARKS.md", sha256: sha256File("TRADEMARKS.md") },
    { id: "doc:docs-map", sourcePath: "docs/MAP.md", sha256: sha256File("docs/MAP.md") },
    { id: "doc:kfd-2-release-trust", sourcePath: "docs/kfd-2-release-trust.md", sha256: sha256File("docs/kfd-2-release-trust.md") },
    { id: "doc:kfd-3-collaboration-interface", sourcePath: "docs/kfd-3-collaboration-interface.md", sha256: sha256File("docs/kfd-3-collaboration-interface.md") },
    ...decisionDocs,
  ],
  schemas: schemaSurfaces,
  standardsMetadata: [
    { id: "metadata:registry", sourcePath: "registry.json", sha256: sha256File("registry.json") },
    { id: "metadata:standards", sourcePath: "standards.json", sha256: sha256File("standards.json") },
    { id: "metadata:release-impact", sourcePath: "release-impact.json", sha256: sha256File("release-impact.json") },
    { id: "metadata:release-anchor", sourcePath: "kfd.release.json", sha256: sha256File("kfd.release.json") },
    { id: "metadata:buildchain-contract-lock", sourcePath: "buildchain.contract-lock.json", sha256: sha256File("buildchain.contract-lock.json") },
    { id: "metadata:kfd-2-public-release-trust-claim", sourcePath: ".buildchain/kfd-2/public-release-trust.claim.json", sha256: sha256File(".buildchain/kfd-2/public-release-trust.claim.json") },
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
      pointer("TRADEMARKS.md", "Official status, trademark, and authority boundary"),
      pointer("docs/MAP.md", "Documentation routing entrypoint"),
      pointer("registry.json", "Machine-readable decision index"),
      pointer("standards.json", "Machine-readable standards metadata"),
      pointer(".buildchain/kfd-2/public-release-trust.claim.json", "KFD-2 public release trust claim"),
      pointer("package.json", "Package export map"),
      pointer("site/kfd-site.json", "Site content projection"),
    ],
    transparentConstraints: [
      pointer("CONTRIBUTING.md", "Append-only decision and contribution constraints"),
      pointer("TRADEMARKS.md", "Trademark and official-status constraints"),
      pointer("scripts/check.mjs", "Repository self-verification gate"),
      pointer("site/kfd-site.json", "Site rendering boundary"),
    ],
    choicePaths: [
      pointer("README.md", "Human reading path"),
      pointer("registry.json", "Agent registry path"),
      pointer("standards.json", "Agent standards metadata path"),
      pointer(".buildchain/kfd-2/public-release-trust.claim.json", "Agent release trust claim path"),
      pointer("package.json", "Package consumption path"),
    ],
    manuals: [
      pointer("docs/MAP.md"),
      pointer("TRADEMARKS.md"),
      pointer("docs/kfd-3-collaboration-interface.md"),
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
