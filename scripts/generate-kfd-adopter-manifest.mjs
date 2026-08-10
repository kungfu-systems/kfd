// SPDX-License-Identifier: Apache-2.0
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  addAdopterWitness,
  initAdopterManifest,
  loadAdopterPackageContext,
} from "./adopter-toolchain.mjs";
import { deriveAdopterCut } from "./adopter-conformance-contract.mjs";
import { canonicalJson, exactByteRoot, semanticRoot } from "./self-conformance-contract.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const KFD_SELF_MANIFEST_PATH = "profiles/adopter-conformance/adopters/kfd/manifest.json";
export const KFD_SELF_VERIFIED_AT = "2026-08-11T00:00:00Z";
export const KFD_SELF_MAX_AGE_SECONDS = 31_536_000;

const declaration = {
  "KFD-1": { state: "candidate", usage: "used", implementation: ".buildchain/kfd-1/contract-world.witness.json", verification: "scripts/check.mjs", claim: "KFD keeps declared facts and generated artifacts in one rooted contract world." },
  "KFD-2": { state: "candidate", usage: "used", implementation: ".buildchain/kfd-2/public-release-trust.claim.json", verification: "scripts/check.mjs", claim: "KFD release trust begins from explicit package, source, review, and publication facts." },
  "KFD-3": { state: "candidate", usage: "used", implementation: ".buildchain/kfd-3/collaboration-interface.artifact.json", verification: "scripts/check.mjs", claim: "KFD publishes a machine-readable collaboration interface with explicit participant boundaries." },
  "KFD-4": { state: "candidate", usage: "used", implementation: "profiles/perspective-conformance/manifest.json", verification: "scripts/check-perspective-conformance.mjs", claim: "KFD records observer perspective in its packaged perspective-conformance profile." },
  "KFD-5": { state: "candidate", usage: "evaluating", implementation: "evidence/primitive-evidence/second-wave-report.json", verification: "scripts/check-warrant-evidence.mjs", claim: "KFD retains cross-product primitive-evidence comparisons without promoting a partial result." },
  "KFD-6": { state: "unsupported", usage: "unused", gap: "KFD has no package-only autonomous-discovery-loop adopter witness for this cut." },
  "KFD-7": { state: "candidate", usage: "used", implementation: "evidence/kfd-7/activation-record.json", verification: "scripts/check.mjs", claim: "KFD retains the reviewed activation record and separate product-profile evidence for KFD-7." },
  "KFD-8": { state: "draft-evidence", usage: "evaluating", implementation: "profiles/perspective-conformance/manifest.json", verification: "scripts/check-perspective-conformance.mjs", gap: "The packaged perspective evidence does not activate draft KFD-8 or qualify KFD as an adopter." },
  "KFD-9": { state: "unsupported", usage: "unused", gap: "KFD has no full-cut durable-result adopter witness and makes no hidden KFD-9 use claim." },
  "KFD-10": { state: "draft-evidence", usage: "evaluating", implementation: "evidence/primitive-evidence/second-wave-report.json", verification: "scripts/check-warrant-evidence.mjs", gap: "The second-wave Warrant evidence is partial, non-qualifying, and cannot activate draft KFD-10." },
  "KFD-11": { state: "not-used", usage: "unused", gap: "KFD publishes the draft but does not use KFD-11 as adopter authority in this cut." },
  "KFD-12": { state: "not-used", usage: "unused", gap: "KFD publishes the draft but does not use KFD-12 as adopter authority in this cut." },
  "KFD-13": { state: "not-used", usage: "unused", gap: "KFD publishes the draft but does not use KFD-13 as adopter authority in this cut." },
};

function bytes(relative) {
  return fs.readFileSync(path.join(root, relative));
}

function evidence(relative, kind, packageRoot) {
  return {
    kind,
    coordinate: `kfd-package-cut:${packageRoot}#${relative}`,
    root: exactByteRoot(bytes(relative)),
    observedAt: KFD_SELF_VERIFIED_AT,
    kfdPackageRoot: packageRoot,
  };
}

function derivePackageCutRoot() {
  const placeholder = "sha256:0000000000000000000000000000000000000000000000000000000000000000";
  const loaded = loadAdopterPackageContext({
    packageRoot: root,
    packageArtifactRoot: placeholder,
    verifiedAt: KFD_SELF_VERIFIED_AT,
    maxAgeSeconds: KFD_SELF_MAX_AGE_SECONDS,
  });
  const cut = deriveAdopterCut(loaded.context);
  return semanticRoot({
    schemaVersion: 1,
    contract: "kfd.adopter-package-cut-root/v1",
    package: { name: loaded.packageManifest.name, version: loaded.packageManifest.version },
    registry: cut.registry,
    standards: cut.standards,
    schemaSet: cut.schemaSet,
    schemaSetRoot: cut.schemaSetRoot,
    vectorSet: cut.vectorSet,
    vectorSetRoot: cut.vectorSetRoot,
    verifierSet: cut.verifierSet,
    verifierSetRoot: cut.verifierSetRoot,
    decisionSetRoot: cut.decisionSetRoot,
  });
}

export function generateKfdAdopterManifest() {
  const packageRoot = derivePackageCutRoot();
  let manifest = initAdopterManifest({
    packageRoot: root,
    packageArtifactRoot: packageRoot,
    verifiedAt: KFD_SELF_VERIFIED_AT,
    maxAgeSeconds: KFD_SELF_MAX_AGE_SECONDS,
    manifestId: "kfd-full-cut-self-declaration",
    adopterId: "kungfu-systems/kfd",
    artifactKind: "other",
    artifactCoordinate: `kfd-adopter-package-cut:${packageRoot}`,
    artifactRoot: packageRoot,
    scope: "KFD package governance, verification profiles, release evidence, and adopter-toolchain dogfood",
  });

  for (const row of manifest.decisions) {
    const selected = declaration[row.id];
    if (!selected) throw new Error(`missing KFD self-declaration for ${row.id}`);
    row.state = selected.state;
    row.usage = selected.usage;
    row.gaps = selected.gap ? [selected.gap] : [
      "This candidate declaration lacks a decision-specific independent adopter assessment and does not claim completed adoption.",
    ];
    if (selected.implementation) row.implementationEvidence = [evidence(selected.implementation, "implementation", packageRoot)];
    if (selected.verification) row.verificationEvidence = [evidence(selected.verification, "verification", packageRoot)];
    if (selected.claim) row.claims = [selected.claim];
  }

  const witnessPath = "evidence/primitive-evidence/second-wave-report.json";
  manifest = addAdopterWitness(manifest, {
    packageRoot: root,
    packageArtifactRoot: packageRoot,
    verifiedAt: KFD_SELF_VERIFIED_AT,
    maxAgeSeconds: KFD_SELF_MAX_AGE_SECONDS,
    decisionId: "KFD-10",
    profileId: "kfd-warrant-evidence",
    witnessCoordinate: `kfd-package-cut:${packageRoot}#${witnessPath}`,
    witnessRoot: exactByteRoot(bytes(witnessPath)),
  });
  manifest.decisions.find(({ id }) => id === "KFD-10").gaps = [declaration["KFD-10"].gap];
  manifest.gaps = [
    "Active rows remain candidates until decision-specific independent assessment and release binding exist.",
    "Draft evidence cannot activate a draft, widen authority, or certify KFD.",
    "Unsupported and not-used rows remain explicit and fail closed instead of being inferred as adoption.",
  ];
  return manifest;
}

export function expectedKfdAdopterManifestText() {
  return `${JSON.stringify(generateKfdAdopterManifest(), null, 2)}\n`;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const expected = expectedKfdAdopterManifestText();
  const destination = path.join(root, KFD_SELF_MANIFEST_PATH);
  if (process.argv.includes("--check")) {
    if (!fs.existsSync(destination) || canonicalJson(JSON.parse(fs.readFileSync(destination, "utf8"))) !== canonicalJson(JSON.parse(expected))) {
      throw new Error(`${KFD_SELF_MANIFEST_PATH} is stale; run node scripts/generate-kfd-adopter-manifest.mjs --write`);
    }
  } else if (process.argv.includes("--write")) {
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, expected);
  } else {
    process.stdout.write(expected);
  }
}
