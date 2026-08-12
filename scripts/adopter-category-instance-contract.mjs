// SPDX-License-Identifier: Apache-2.0
import { canonicalJson, semanticRoot } from "./self-conformance-contract.mjs";
import { resolveAdopterCategoryProfiles } from "./adopter-category-profile-contract.mjs";

export const ADOPTER_CATEGORY_INSTANCE_MANIFEST = "kfd.adopter-category-instance-manifest/v1";

const ROOT_PATTERN = /^sha256:[0-9a-f]{64}$/;
const CLAIM_BOUNDARY = {
  categoryConformanceIsDeclarationOnly: true,
  evidenceTransfer: false,
  runtimePermission: false,
  releaseAuthorization: false,
  independentCertification: false,
  semanticAuthorityTransfer: false,
};
const ARTIFACT_KINDS = new Set(["archive", "container", "git-commit", "other", "package", "release"]);
const EVIDENCE_KINDS = new Set(["declaration", "implementation", "negative", "review", "verification"]);

function compareUtf8(left, right) {
  return Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
}

function same(left, right) {
  try {
    return canonicalJson(left) === canonicalJson(right);
  } catch {
    return false;
  }
}

function issue(report, code, path, message) {
  report.issues.push({ code, path, message });
}

function exactObject(report, value, path, required, optional = []) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    issue(report, "acp-instance-invalid", path, "Expected a JSON object.");
    return false;
  }
  const admitted = new Set([...required, ...optional]);
  for (const key of Object.keys(value)) {
    if (!admitted.has(key)) issue(report, "acp-instance-invalid", `${path}/${key}`, "Unknown fields fail closed.");
  }
  for (const key of required) {
    if (!Object.hasOwn(value, key)) issue(report, "acp-instance-invalid", `${path}/${key}`, "Required field is missing.");
  }
  return true;
}

function nonEmpty(report, value, path) {
  if (typeof value !== "string" || value.length === 0) {
    issue(report, "acp-instance-invalid", path, "Expected a non-empty string.");
  }
}

function root(report, value, path) {
  if (typeof value !== "string" || !ROOT_PATTERN.test(value)) {
    issue(report, "acp-instance-invalid", path, "Expected sha256: plus 64 lowercase hexadecimal characters.");
  }
}

function coordinateShape(report, value, path) {
  if (!exactObject(report, value, path, ["kind", "coordinate", "root"])) return;
  if (!ARTIFACT_KINDS.has(value.kind)) issue(report, "acp-instance-invalid", `${path}/kind`, "Unsupported coordinate kind.");
  nonEmpty(report, value.coordinate, `${path}/coordinate`);
  root(report, value.root, `${path}/root`);
}

function referenceShape(report, value, path) {
  if (!exactObject(report, value, path, ["contract", "manifestId", "root"])) return;
  if (value.contract !== "kfd.adopter-conformance-manifest/v1") {
    issue(report, "acp-instance-invalid", `${path}/contract`, "The category instance must reference one full-cut adopter manifest v1.");
  }
  nonEmpty(report, value.manifestId, `${path}/manifestId`);
  root(report, value.root, `${path}/root`);
}

function verifyShape(report, manifest) {
  if (!exactObject(report, manifest, "/", [
    "schemaVersion", "contract", "instanceId", "rootAlgorithm", "project", "adopterManifest",
    "kfdCut", "selection", "selectionRoot", "requirements", "claimBoundary",
  ], ["$schema"])) return;
  if (manifest.$schema !== undefined
    && manifest.$schema !== "https://kfd.libkungfu.dev/schemas/kfd-adopter-conformance/category-instance-manifest.schema.json") {
    issue(report, "acp-instance-invalid", "/$schema", "Unsupported category-instance schema identifier.");
  }
  if (manifest.schemaVersion !== 1
    || manifest.contract !== ADOPTER_CATEGORY_INSTANCE_MANIFEST
    || manifest.rootAlgorithm !== "sha256-kfd-canonical-json-v1") {
    issue(report, "acp-instance-invalid", "/contract", "Category-instance contract or root algorithm is unsupported.");
  }
  nonEmpty(report, manifest.instanceId, "/instanceId");
  if (exactObject(report, manifest.project, "/project", ["adopterId", "source", "artifact", "release"])) {
    nonEmpty(report, manifest.project.adopterId, "/project/adopterId");
    coordinateShape(report, manifest.project.source, "/project/source");
    coordinateShape(report, manifest.project.artifact, "/project/artifact");
    coordinateShape(report, manifest.project.release, "/project/release");
  }
  referenceShape(report, manifest.adopterManifest, "/adopterManifest");
  if (exactObject(report, manifest.kfdCut, "/kfdCut", ["packageVersion", "packageRoot", "categoryCatalogRoot"])) {
    nonEmpty(report, manifest.kfdCut.packageVersion, "/kfdCut/packageVersion");
    root(report, manifest.kfdCut.packageRoot, "/kfdCut/packageRoot");
    root(report, manifest.kfdCut.categoryCatalogRoot, "/kfdCut/categoryCatalogRoot");
  }
  root(report, manifest.selectionRoot, "/selectionRoot");
  if (!Array.isArray(manifest.requirements)) {
    issue(report, "acp-instance-invalid", "/requirements", "Requirements must be an array.");
  } else {
    for (const [requirementIndex, requirement] of manifest.requirements.entries()) {
      const requirementPath = `/requirements/${requirementIndex}`;
      if (!exactObject(report, requirement, requirementPath, ["id", "evidence"])) continue;
      nonEmpty(report, requirement.id, `${requirementPath}/id`);
      if (!Array.isArray(requirement.evidence)) {
        issue(report, "acp-instance-invalid", `${requirementPath}/evidence`, "Requirement evidence must be an array.");
        continue;
      }
      for (const [evidenceIndex, evidence] of requirement.evidence.entries()) {
        const evidencePath = `${requirementPath}/evidence/${evidenceIndex}`;
        if (!exactObject(report, evidence, evidencePath, [
          "kind", "coordinate", "root", "observedAt", "projectInstanceId", "projectRoot",
          "adopterManifestRoot", "kfdPackageRoot", "categorySelectionRoot",
        ])) continue;
        if (!EVIDENCE_KINDS.has(evidence.kind)) issue(report, "acp-instance-invalid", `${evidencePath}/kind`, "Unsupported evidence kind.");
        nonEmpty(report, evidence.coordinate, `${evidencePath}/coordinate`);
        nonEmpty(report, evidence.projectInstanceId, `${evidencePath}/projectInstanceId`);
        for (const key of ["root", "projectRoot", "adopterManifestRoot", "kfdPackageRoot", "categorySelectionRoot"]) {
          root(report, evidence[key], `${evidencePath}/${key}`);
        }
        if (typeof evidence.observedAt !== "string" || !Number.isFinite(Date.parse(evidence.observedAt))) {
          issue(report, "acp-instance-invalid", `${evidencePath}/observedAt`, "Evidence time must be a valid date-time.");
        }
      }
    }
  }
}

function reportTemplate() {
  return {
    schemaVersion: 1,
    contract: "kfd.adopter-category-instance-report/v1",
    valid: true,
    conforming: false,
    qualifying: false,
    independentlyCertified: false,
    evidenceInherited: false,
    instanceRoot: null,
    projectRoot: null,
    adopterManifestRoot: null,
    catalogRoot: null,
    selectionRoot: null,
    resolutionRoot: null,
    issues: [],
  };
}

function finish(report) {
  report.issues.sort((left, right) => compareUtf8(
    `${left.code}\0${left.path}\0${left.message}`,
    `${right.code}\0${right.path}\0${right.message}`,
  ));
  report.valid = report.issues.length === 0;
  report.conforming = report.valid;
  report.reportRoot = semanticRoot({ ...report });
  return report;
}

export function verifyAdopterCategoryInstanceManifest(manifest, context = {}) {
  const report = reportTemplate();
  try {
    report.instanceRoot = semanticRoot(manifest);
  } catch {
    // Stable shape diagnostics below describe non-canonical inputs.
  }
  verifyShape(report, manifest);
  if (report.issues.length > 0) return finish(report);

  if (!same(manifest.claimBoundary, CLAIM_BOUNDARY)) {
    issue(report, "acp-claim-widening", "/claimBoundary", "Category conformance cannot transfer evidence or grant semantic, runtime, release, or certification authority.");
  }

  const resolution = resolveAdopterCategoryProfiles(manifest.selection, context.catalog);
  report.catalogRoot = resolution.catalogRoot;
  report.selectionRoot = resolution.selectionRoot;
  report.resolutionRoot = resolution.resolutionRoot;
  report.issues.push(...resolution.issues);
  if (!resolution.valid) return finish(report);

  let adopterManifestRoot = null;
  let projectRoot = null;
  try {
    adopterManifestRoot = semanticRoot(context.adopterManifest);
    projectRoot = semanticRoot(manifest.project);
  } catch {
    issue(report, "acp-verification-context-invalid", "/verificationContext", "Adopter manifest and project coordinates must be canonical JSON values.");
    return finish(report);
  }
  report.adopterManifestRoot = adopterManifestRoot;
  report.projectRoot = projectRoot;

  const adopterReport = context.adopterReport;
  if (!adopterReport
    || adopterReport.profile !== "kfd.adopter-conformance-manifest/v1"
    || adopterReport.valid !== true) {
    issue(report, "acp-verification-context-invalid", "/verificationContext/adopterReport", "The exact referenced full-cut adopter manifest must have a valid KFD verifier report.");
  }
  if (manifest.adopterManifest.manifestId !== context.adopterManifest?.manifestId
    || manifest.adopterManifest.root !== adopterManifestRoot
    || manifest.project.adopterId !== context.adopterManifest?.adopter?.id
    || !same(manifest.project.artifact, context.adopterManifest?.adopter?.artifact)
    || !(context.adopterManifest?.releaseBindings ?? []).some((binding) =>
      same(binding.artifact, manifest.project.artifact)
      && same(binding.releasePassport, manifest.project.release))) {
    issue(report, "acp-instance-binding-mismatch", "/adopterManifest", "Project identity, artifact, release, manifest identity, and manifest root must bind the same adopter instance.");
  }
  if (manifest.kfdCut.packageVersion !== context.adopterManifest?.kfdCut?.package?.version
    || manifest.kfdCut.packageRoot !== context.adopterManifest?.kfdCut?.package?.artifactRoot
    || manifest.kfdCut.categoryCatalogRoot !== resolution.catalogRoot
    || manifest.selectionRoot !== resolution.selectionRoot) {
    issue(report, "acp-instance-binding-mismatch", "/kfdCut", "KFD package, category catalog, and selection roots must reproduce exactly.");
  }

  const expectedRequirements = resolution.requirements;
  const rows = manifest.requirements;
  const expectedIds = expectedRequirements.map(({ id }) => id);
  const observedIds = rows.map(({ id }) => id);
  if (!same(observedIds, expectedIds)) {
    issue(report, "acp-evidence-missing", "/requirements", "Requirement rows must exactly match the resolved UTF-8-ordered category obligations.");
  }

  const verifiedAt = Date.parse(context.verifiedAt ?? "");
  const maxAgeSeconds = context.maxAgeSeconds;
  const freshnessReady = Number.isFinite(verifiedAt)
    && Number.isSafeInteger(maxAgeSeconds)
    && maxAgeSeconds >= 0;
  if (!freshnessReady) {
    issue(report, "acp-verification-context-invalid", "/verificationContext/evidencePolicy", "Category evidence requires an explicit verifiedAt cut and non-negative maxAgeSeconds.");
  }

  const expectedById = new Map(expectedRequirements.map((requirement) => [requirement.id, requirement]));
  for (const [rowIndex, row] of rows.entries()) {
    const rowPath = `/requirements/${rowIndex}`;
    const expected = expectedById.get(row.id);
    if (!expected) continue;
    const evidence = row.evidence;
    const evidenceKeys = evidence.map((entry) => `${entry.kind}\0${entry.coordinate}\0${entry.root}`);
    if (new Set(evidenceKeys).size !== evidenceKeys.length) {
      issue(report, "acp-instance-invalid", `${rowPath}/evidence`, "Duplicate evidence entries fail closed.");
    }
    for (const kind of expected.evidenceKinds) {
      if (evidence.filter((entry) => entry.kind === kind).length < expected.minimumEvidencePerKind) {
        issue(report, "acp-evidence-missing", `${rowPath}/evidence`, `Requirement ${row.id} needs ${expected.minimumEvidencePerKind} ${kind} evidence item(s).`);
      }
    }
    for (const [evidenceIndex, entry] of evidence.entries()) {
      const evidencePath = `${rowPath}/evidence/${evidenceIndex}`;
      if (!expected.evidenceKinds.includes(entry.kind)) {
        issue(report, "acp-instance-invalid", `${evidencePath}/kind`, "Evidence kind is not admitted by this requirement.");
      }
      if (entry.projectInstanceId !== manifest.instanceId
        || entry.projectRoot !== projectRoot
        || entry.adopterManifestRoot !== adopterManifestRoot
        || entry.kfdPackageRoot !== manifest.kfdCut.packageRoot
        || entry.categorySelectionRoot !== resolution.selectionRoot) {
        issue(report, "acp-evidence-reuse", evidencePath, "Evidence from another project, adopter manifest, KFD cut, or category selection cannot be reused.");
      }
      const observedAt = Date.parse(entry.observedAt);
      if (freshnessReady
        && (!Number.isFinite(observedAt)
          || observedAt > verifiedAt
          || verifiedAt - observedAt > maxAgeSeconds * 1000)) {
        issue(report, "acp-evidence-stale", evidencePath, "Category evidence falls outside the declared verification-time freshness cut.");
      }
    }
  }

  return finish(report);
}
