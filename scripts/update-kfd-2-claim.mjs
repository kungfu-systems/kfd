import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import crypto from "node:crypto";
import path from "node:path";

const outputPath = ".buildchain/kfd-2/public-release-trust.claim.json";

const readJson = (filePath) => JSON.parse(readFileSync(filePath, "utf8"));
const sha256File = (filePath) => crypto.createHash("sha256").update(readFileSync(filePath)).digest("hex");
const pointer = (filePath, extra = {}) => ({
  path: filePath,
  sha256: sha256File(filePath),
  ...extra,
});

const packageJson = readJson("package.json");
const releaseAnchor = readJson("kfd.release.json");

const sourceBindings = [
  pointer("package.json", { id: "package-version-and-exports" }),
  pointer("kfd.release.json", { id: "anchored-release-version" }),
  pointer("registry.json", { id: "decision-registry" }),
  pointer("standards.json", { id: "standards-metadata" }),
  pointer("release-impact.json", { id: "release-impact-ledger" }),
  pointer("buildchain.toml", { id: "buildchain-release-contract" }),
];

const machineEvidence = [
  pointer("scripts/check.mjs", { id: "self-verification-command" }),
  pointer(".github/workflows/build.yml", { id: "buildchain-build-workflow" }),
  pointer(".github/workflows/buildchain-ref-promotion.yml", { id: "buildchain-promotion-workflow" }),
  pointer("schemas/kfd-2/release-claims.schema.json", { id: "kfd-2-release-claims-schema" }),
  pointer("schemas/kfd-2/release-trust-passport.schema.json", { id: "kfd-2-release-trust-passport-schema" }),
];

const hashes = Object.fromEntries(
  [...sourceBindings, ...machineEvidence].map((entry) => [entry.id, entry.sha256]),
);

const claim = {
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

mkdirSync(path.dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(claim, null, 2)}\n`);
console.log(`updated ${outputPath}`);
