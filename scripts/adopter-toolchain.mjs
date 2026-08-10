// SPDX-License-Identifier: Apache-2.0
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  ADOPTER_CONFORMANCE_PROFILE,
  deriveAdopterCut,
  inspectAdopterManifestShape,
  verifyAdopterManifest,
} from "./adopter-conformance-contract.mjs";
import { canonicalJson, exactByteRoot, semanticRoot } from "./self-conformance-contract.mjs";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROOT_PATTERN = /^sha256:[0-9a-f]{64}$/;
const INVENTORY_PATH = "profiles/adopter-conformance/toolchain.json";

function compareUtf8(left, right) {
  return Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
}

function packagePath(root, relative) {
  if (typeof relative !== "string" || relative.startsWith("/") || relative.split("/").includes("..")) {
    throw new Error(`unsafe package path: ${relative ?? "missing"}`);
  }
  const absolute = path.resolve(root, relative);
  if (path.relative(root, absolute).startsWith("..")) throw new Error(`package path escaped root: ${relative}`);
  return absolute;
}

function regularBytes(root, relative) {
  const absolute = packagePath(root, relative);
  const stat = fs.lstatSync(absolute);
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`${relative} must be a regular package file`);
  return fs.readFileSync(absolute);
}

function packageJson(root, relative) {
  return JSON.parse(regularBytes(root, relative).toString("utf8"));
}

function requireRoot(value, label) {
  if (!ROOT_PATTERN.test(value ?? "")) throw new Error(`${label} must be sha256: plus 64 lowercase hexadecimal characters`);
  return value;
}

function requireText(value, label) {
  if (typeof value !== "string" || value.trim() === "") throw new Error(`${label} must be non-empty`);
  return value;
}

function requireTime(value, label) {
  if (typeof value !== "string" || !Number.isFinite(Date.parse(value))) throw new Error(`${label} must be an RFC 3339 date-time`);
  return value;
}

function requireAge(value) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0) throw new Error("maxAgeSeconds must be a non-negative safe integer");
  return parsed;
}

export function loadAdopterPackageContext(options) {
  const root = options?.packageRoot ?? packageRoot;
  const packageArtifactRoot = requireRoot(options?.packageArtifactRoot, "packageArtifactRoot");
  const inventory = packageJson(root, INVENTORY_PATH);
  if (inventory.schemaVersion !== 1 || inventory.contract !== "kfd.adopter-toolchain-inventory/v1") {
    throw new Error("unsupported adopter toolchain inventory");
  }
  const files = {};
  const paths = new Set([inventory.registryPath, inventory.standardsPath]);
  for (const definitions of Object.values(inventory.surfaces ?? {})) {
    if (!Array.isArray(definitions)) throw new Error("toolchain surface definitions must be arrays");
    for (const entry of definitions) paths.add(entry.path);
  }
  for (const profile of inventory.witnessProfiles ?? []) paths.add(profile.manifestPath);
  for (const relative of [...paths].sort(compareUtf8)) {
    files[relative] = regularBytes(root, relative).toString("utf8");
  }
  const registry = JSON.parse(files[inventory.registryPath]);
  const standards = JSON.parse(files[inventory.standardsPath]);
  const packageManifest = packageJson(root, "package.json");
  if (packageManifest.name !== "@kungfu-tech/kfd" || packageManifest.version !== packageManifest.version?.trim()) {
    throw new Error("installed package identity is not @kungfu-tech/kfd with an exact version");
  }
  const context = {
    registry,
    registryPath: inventory.registryPath,
    standards,
    standardsPath: inventory.standardsPath,
    files,
    surfaces: inventory.surfaces,
    expectedPackageRoot: packageArtifactRoot,
    evidencePolicy: {
      verifiedAt: requireTime(options?.verifiedAt, "verifiedAt"),
      maxAgeSeconds: requireAge(options?.maxAgeSeconds),
    },
  };
  return { context, inventory, packageManifest, packageRoot: root };
}

function declarationRow(entry) {
  return {
    id: entry.id,
    number: entry.number,
    registryStatus: entry.status,
    state: "not-used",
    usage: "unused",
    implementationEvidence: [],
    verificationEvidence: [],
    negativeEvidence: [],
    reviews: [],
    witnessBindings: [],
    releaseBindingIds: [],
    claims: [],
    gaps: ["No adopter evidence has been declared for this decision."],
  };
}

export function initAdopterManifest(options) {
  const loaded = loadAdopterPackageContext(options);
  const derived = deriveAdopterCut(loaded.context);
  const manifest = {
    $schema: "https://kfd.libkungfu.dev/schemas/kfd-adopter-conformance/manifest.schema.json",
    schemaVersion: 1,
    contract: ADOPTER_CONFORMANCE_PROFILE,
    manifestId: requireText(options?.manifestId, "manifestId"),
    rootAlgorithm: "sha256-kfd-canonical-json-v1",
    byteDigestAlgorithm: "sha256-bytes-v1",
    adopter: {
      id: requireText(options?.adopterId, "adopterId"),
      artifact: {
        kind: requireText(options?.artifactKind, "artifactKind"),
        coordinate: requireText(options?.artifactCoordinate, "artifactCoordinate"),
        root: requireRoot(options?.artifactRoot, "artifactRoot"),
      },
      scope: requireText(options?.scope, "scope"),
    },
    kfdCut: {
      package: {
        name: loaded.packageManifest.name,
        version: loaded.packageManifest.version,
        artifactRoot: loaded.context.expectedPackageRoot,
      },
      registry: derived.registry,
      standards: derived.standards,
      schemaSet: derived.schemaSet,
      schemaSetRoot: derived.schemaSetRoot,
      vectorSet: derived.vectorSet,
      vectorSetRoot: derived.vectorSetRoot,
      verifierSet: derived.verifierSet,
      verifierSetRoot: derived.verifierSetRoot,
      decisionSetRoot: derived.decisionSetRoot,
    },
    decisions: derived.decisionProjection.map(declarationRow),
    releaseBindings: [],
    claimBoundary: {
      declarationOnly: true,
      runtimePermission: false,
      releaseAuthorization: false,
      independentlyCertified: false,
      semanticTruth: false,
    },
    gaps: ["Generated declaration contains no adoption, release, runtime, or certification claim."],
  };
  const report = verifyAdopterManifest(manifest, loaded.context);
  if (!report.valid) throw new Error(`generated manifest did not verify: ${JSON.stringify(report.issues)}`);
  return manifest;
}

function assertShape(manifest) {
  const report = inspectAdopterManifestShape(manifest);
  if (!report.valid) throw new Error(`manifest structure is invalid: ${JSON.stringify(report.issues)}`);
}

export function addAdopterWitness(manifest, options) {
  assertShape(manifest);
  const loaded = loadAdopterPackageContext(options);
  const baseline = verifyAdopterManifest(manifest, loaded.context);
  if (!baseline.valid) throw new Error(`input manifest does not verify: ${JSON.stringify(baseline.issues)}`);
  const decisionId = requireText(options?.decisionId, "decisionId");
  const profileId = requireText(options?.profileId, "profileId");
  const profile = (loaded.inventory.witnessProfiles ?? []).find((entry) => entry.id === profileId);
  if (!profile || !profile.decisionIds.includes(decisionId)) {
    throw new Error(`witness profile ${profileId} is not admitted for ${decisionId}`);
  }
  const result = structuredClone(manifest);
  const row = result.decisions.find((entry) => entry.id === decisionId);
  if (!row) throw new Error(`unknown decision ${decisionId}`);
  if (row.witnessBindings.some((entry) => entry.profileId === profileId)) {
    throw new Error(`witness profile ${profileId} is already bound to ${decisionId}`);
  }
  const derived = deriveAdopterCut(loaded.context);
  const verifier = derived.verifierSet.find((entry) => entry.path === profile.verifierPath);
  if (!verifier) throw new Error(`witness verifier is absent from the pinned verifier set: ${profile.verifierPath}`);
  row.state = row.registryStatus === "draft" ? "draft-evidence" : "candidate";
  row.usage = "evaluating";
  row.witnessBindings.push({
    decisionId,
    profileId,
    profileManifestPath: profile.manifestPath,
    profileManifestRoot: exactByteRoot(loaded.context.files[profile.manifestPath]),
    witnessCoordinate: requireText(options?.witnessCoordinate, "witnessCoordinate"),
    witnessRoot: requireRoot(options?.witnessRoot, "witnessRoot"),
    verifierRoot: verifier.byteRoot,
    kfdPackageRoot: loaded.context.expectedPackageRoot,
  });
  row.gaps = [...new Set([
    ...row.gaps.filter((gap) => gap !== "No adopter evidence has been declared for this decision."),
    "A rooted witness is a declaration input; independent assessment and authority remain external.",
  ])].sort(compareUtf8);
  const report = verifyAdopterManifest(result, loaded.context);
  if (!report.valid) throw new Error(`witnessed manifest did not verify: ${JSON.stringify(report.issues)}`);
  return result;
}

export function verifyAdopterManifestFromPackage(manifest, options) {
  assertShape(manifest);
  const loaded = loadAdopterPackageContext(options);
  return verifyAdopterManifest(manifest, loaded.context);
}

function decisionMap(manifest) {
  return new Map(manifest.decisions.map((row) => [row.id, row]));
}

export function diffAdopterManifests(before, after) {
  assertShape(before);
  assertShape(after);
  const beforeRows = decisionMap(before);
  const afterRows = decisionMap(after);
  const ids = [...new Set([...beforeRows.keys(), ...afterRows.keys()])].sort(compareUtf8);
  const added = [];
  const removed = [];
  const changed = [];
  for (const id of ids) {
    const left = beforeRows.get(id);
    const right = afterRows.get(id);
    if (!left) added.push({ id, root: semanticRoot(right) });
    else if (!right) removed.push({ id, root: semanticRoot(left) });
    else if (canonicalJson(left) !== canonicalJson(right)) {
      const fields = [...new Set([...Object.keys(left), ...Object.keys(right)])]
        .filter((key) => canonicalJson(left[key]) !== canonicalJson(right[key]))
        .sort(compareUtf8);
      changed.push({ id, fields, beforeRoot: semanticRoot(left), afterRoot: semanticRoot(right) });
    }
  }
  const report = {
    schemaVersion: 1,
    contract: "kfd.adopter-conformance-diff/v1",
    beforeRoot: semanticRoot(before),
    afterRoot: semanticRoot(after),
    kfdCutChanged: canonicalJson(before.kfdCut) !== canonicalJson(after.kfdCut),
    adopterChanged: canonicalJson(before.adopter) !== canonicalJson(after.adopter),
    added,
    removed,
    changed,
  };
  return { ...report, reportRoot: semanticRoot(report) };
}

export function bundleAdopterManifest(manifest, options) {
  const loaded = loadAdopterPackageContext(options);
  assertShape(manifest);
  const report = verifyAdopterManifest(manifest, loaded.context);
  if (!report.valid) throw new Error(`manifest does not verify: ${JSON.stringify(report.issues)}`);
  const closure = {
    schemaVersion: 1,
    contract: "kfd.adopter-conformance-bundle/v1",
    manifest,
    verificationContext: {
      package: {
        name: loaded.packageManifest.name,
        version: loaded.packageManifest.version,
        artifactRoot: loaded.context.expectedPackageRoot,
      },
      inventoryPath: INVENTORY_PATH,
      inventoryRoot: semanticRoot(loaded.inventory),
      verifiedAt: loaded.context.evidencePolicy.verifiedAt,
      maxAgeSeconds: loaded.context.evidencePolicy.maxAgeSeconds,
    },
    verificationReport: report,
    roots: {
      manifestRoot: semanticRoot(manifest),
      verificationReportRoot: semanticRoot(report),
    },
    qualifying: false,
    selfCertified: false,
    offline: true,
    claimBoundary: loaded.inventory.claimBoundary,
  };
  return { ...closure, bundleRoot: semanticRoot(closure) };
}

export function readAdopterJson(filePath) {
  const stat = fs.lstatSync(filePath);
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`${filePath} must be a regular JSON file, not a symlink`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function writeAdopterJson(filePath, value) {
  const parent = path.dirname(path.resolve(filePath));
  if (!fs.existsSync(parent)) throw new Error(`output parent does not exist: ${parent}`);
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, { flag: "wx" });
}
