// SPDX-License-Identifier: Apache-2.0
import { canonicalJson, semanticRoot } from "./self-conformance-contract.mjs";
import { resolveAdopterCategoryProfiles, verifyAdopterCategoryProfileCatalog } from "./adopter-category-profile-contract.mjs";

export const ADOPTER_CATEGORY_EVIDENCE_MATRIX = "kfd.adopter-category-evidence-matrix/v1";

const ROOT_PATTERN = /^sha256:[0-9a-f]{64}$/;
const ID_PATTERN = /^[a-z0-9][a-z0-9._:/-]*$/;
const EVIDENCE_ROLES = new Set([
  "normative", "category", "project", "delivery", "runtime", "independent-review",
]);
const EVIDENCE_STATUSES = new Set(["verified", "pending", "invalid"]);
const FAILURE_STAGES = new Set(["schema", "composition", "project", "delivery", "runtime", "readback"]);
const FAILURE_STATUSES = new Set(["open", "fixed", "retained"]);
const AUTHORITY_BOUNDARY = {
  normativeSemantics: "kfd-package",
  categoryRequirements: "kfd-profile-catalog",
  projectInstanceEvidence: "project-owned",
  deliveryEvidence: "delivery-system-owned",
  runtimePermission: "adopter-runtime-owned",
  independentCertification: "separate-certifier-required",
  buildchainRole: "optional-protocol-neutral-carrier",
};

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
    issue(report, "acp-matrix-invalid", path, "Expected a JSON object.");
    return false;
  }
  const admitted = new Set([...required, ...optional]);
  for (const key of Object.keys(value)) {
    if (!admitted.has(key)) issue(report, "acp-matrix-invalid", `${path}/${key}`, "Unknown fields fail closed.");
  }
  for (const key of required) {
    if (!Object.hasOwn(value, key)) issue(report, "acp-matrix-invalid", `${path}/${key}`, "Required field is missing.");
  }
  return true;
}

function id(report, value, path) {
  if (typeof value !== "string" || !ID_PATTERN.test(value)) {
    issue(report, "acp-matrix-invalid", path, "Expected a stable lowercase evidence identity.");
  }
}

function nonEmpty(report, value, path) {
  if (typeof value !== "string" || value.length === 0) {
    issue(report, "acp-matrix-invalid", path, "Expected a non-empty string.");
  }
}

function root(report, value, path) {
  if (typeof value !== "string" || !ROOT_PATTERN.test(value)) {
    issue(report, "acp-matrix-invalid", path, "Expected sha256: plus 64 lowercase hexadecimal characters.");
  }
}

function sortedUnique(report, rows, path, key) {
  if (!Array.isArray(rows)) {
    issue(report, "acp-matrix-invalid", path, "Expected an array.");
    return false;
  }
  const identities = rows.map((row) => row?.[key] ?? "");
  if (new Set(identities).size !== identities.length) {
    issue(report, "acp-matrix-duplicate", path, `Duplicate ${key} values fail closed.`);
  }
  if (!same(identities, [...identities].sort(compareUtf8))) {
    issue(report, "acp-matrix-invalid", path, `Rows must be ordered by ${key} using UTF-8 byte order.`);
  }
  return true;
}

function expectedProfileMatrix(catalog) {
  return [...catalog.profiles]
    .sort((left, right) => compareUtf8(left.id, right.id))
    .map((profile) => {
      const profiles = profile.id === catalog.baseProfile.id
        ? []
        : [{ id: profile.id, version: profile.version }];
      const resolution = resolveAdopterCategoryProfiles({
        schemaVersion: 1,
        contract: "kfd.adopter-category-profile-selection/v1",
        profiles,
      }, catalog);
      return {
        id: profile.id,
        version: profile.version,
        requirementIds: resolution.requirements.map(({ id: requirementId }) => requirementId),
      };
    });
}

function reportTemplate() {
  return {
    schemaVersion: 1,
    contract: "kfd.adopter-category-evidence-matrix-report/v1",
    valid: true,
    complete: false,
    qualifying: false,
    releaseAuthorized: false,
    runtimeAuthorized: false,
    independentlyCertified: false,
    matrixRoot: null,
    catalogRoot: null,
    pendingProjectIds: [],
    openGapIds: [],
    issues: [],
  };
}

function finish(report) {
  report.pendingProjectIds.sort(compareUtf8);
  report.openGapIds.sort(compareUtf8);
  report.issues.sort((left, right) => compareUtf8(
    `${left.code}\0${left.path}\0${left.message}`,
    `${right.code}\0${right.path}\0${right.message}`,
  ));
  report.valid = report.issues.length === 0;
  report.complete = report.valid
    && report.pendingProjectIds.length === 0
    && report.openGapIds.length === 0;
  report.reportRoot = semanticRoot({ ...report });
  return report;
}

export function verifyAdopterCategoryEvidenceMatrix(matrix, catalog) {
  const report = reportTemplate();
  try {
    report.matrixRoot = semanticRoot(matrix);
    report.catalogRoot = semanticRoot(catalog);
  } catch {
    // Exact shape diagnostics below remain the stable fail-closed surface.
  }

  if (!exactObject(report, matrix, "/", [
    "$schema", "schemaVersion", "contract", "rootAlgorithm", "catalogRoot", "profileMatrix",
    "projectEvidence", "failureHistory", "gaps", "authorityBoundary",
  ])) return finish(report);
  if (matrix.$schema !== "https://kfd.libkungfu.dev/schemas/kfd-adopter-conformance/evidence-matrix.schema.json"
    || matrix.schemaVersion !== 1
    || matrix.contract !== ADOPTER_CATEGORY_EVIDENCE_MATRIX
    || matrix.rootAlgorithm !== "sha256-kfd-canonical-json-v1") {
    issue(report, "acp-matrix-invalid", "/contract", "Evidence-matrix contract or root algorithm is unsupported.");
  }

  const catalogReport = verifyAdopterCategoryProfileCatalog(catalog);
  report.issues.push(...catalogReport.issues);
  if (!catalogReport.valid) return finish(report);
  if (matrix.catalogRoot !== report.catalogRoot) {
    issue(report, "acp-matrix-substitution", "/catalogRoot", "The matrix must bind the exact category catalog root.");
  }
  if (!same(matrix.authorityBoundary, AUTHORITY_BOUNDARY)) {
    issue(report, "acp-matrix-authority-widening", "/authorityBoundary", "The matrix cannot merge semantic, project, delivery, runtime, review, or certification authority.");
  }

  if (!Array.isArray(matrix.profileMatrix) || matrix.profileMatrix.length === 0) {
    issue(report, "acp-matrix-invalid", "/profileMatrix", "The complete category profile matrix is required.");
  } else {
    sortedUnique(report, matrix.profileMatrix, "/profileMatrix", "id");
    if (!same(matrix.profileMatrix, expectedProfileMatrix(catalog))) {
      issue(report, "acp-matrix-substitution", "/profileMatrix", "Profile rows must exactly reproduce every published category and resolved requirement identity.");
    }
  }

  const gapIds = new Set();
  if (!Array.isArray(matrix.gaps)) {
    issue(report, "acp-matrix-invalid", "/gaps", "Gap rows must be an array.");
  } else {
    sortedUnique(report, matrix.gaps, "/gaps", "id");
    for (const [index, gap] of matrix.gaps.entries()) {
      const path = `/gaps/${index}`;
      if (!exactObject(report, gap, path, ["id", "owner", "status", "evidenceRoot"])) continue;
      id(report, gap.id, `${path}/id`);
      nonEmpty(report, gap.owner, `${path}/owner`);
      gapIds.add(gap.id);
      if (gap.status === "open") {
        if (gap.evidenceRoot !== null) issue(report, "acp-matrix-invalid", `${path}/evidenceRoot`, "An open gap cannot claim closure evidence.");
        report.openGapIds.push(gap.id);
      } else if (gap.status === "closed") {
        root(report, gap.evidenceRoot, `${path}/evidenceRoot`);
      } else {
        issue(report, "acp-matrix-invalid", `${path}/status`, "Gap status must be open or closed.");
      }
    }
  }

  if (!Array.isArray(matrix.projectEvidence) || matrix.projectEvidence.length === 0) {
    issue(report, "acp-matrix-invalid", "/projectEvidence", "At least one project evidence row is required.");
  } else {
    sortedUnique(report, matrix.projectEvidence, "/projectEvidence", "projectId");
    for (const [projectIndex, project] of matrix.projectEvidence.entries()) {
      const path = `/projectEvidence/${projectIndex}`;
      if (!exactObject(report, project, path, [
        "projectId", "selection", "instanceManifestRoot", "terminal", "evidence", "gapIds",
      ])) continue;
      id(report, project.projectId, `${path}/projectId`);
      root(report, project.instanceManifestRoot, `${path}/instanceManifestRoot`);
      const resolution = resolveAdopterCategoryProfiles(project.selection, catalog);
      report.issues.push(...resolution.issues.map((entry) => ({ ...entry, path: `${path}${entry.path}` })));

      if (!exactObject(report, project.terminal, `${path}/terminal`, ["status", "root"])) continue;
      if (project.terminal.status === "pending") {
        if (project.terminal.root !== null) issue(report, "acp-matrix-invalid", `${path}/terminal/root`, "Pending work cannot carry a terminal root.");
        report.pendingProjectIds.push(project.projectId);
      } else if (project.terminal.status === "terminal") {
        root(report, project.terminal.root, `${path}/terminal/root`);
      } else {
        issue(report, "acp-matrix-invalid", `${path}/terminal/status`, "Terminal status must be pending or terminal.");
      }

      if (!Array.isArray(project.evidence) || project.evidence.length < 3) {
        issue(report, "acp-matrix-incomplete", `${path}/evidence`, "Normative, category, and project evidence are required.");
      } else {
        const evidenceKeys = project.evidence.map((entry) => `${entry?.role ?? ""}\0${entry?.coordinate ?? ""}\0${entry?.root ?? ""}`);
        if (new Set(evidenceKeys).size !== evidenceKeys.length) {
          issue(report, "acp-matrix-duplicate", `${path}/evidence`, "Duplicate evidence coordinates fail closed.");
        }
        const roles = new Set();
        for (const [evidenceIndex, evidence] of project.evidence.entries()) {
          const evidencePath = `${path}/evidence/${evidenceIndex}`;
          if (!exactObject(report, evidence, evidencePath, [
            "role", "coordinate", "root", "status", "projectId", "instanceManifestRoot",
          ])) continue;
          if (!EVIDENCE_ROLES.has(evidence.role)) issue(report, "acp-matrix-invalid", `${evidencePath}/role`, "Evidence role is unsupported.");
          if (!EVIDENCE_STATUSES.has(evidence.status)) issue(report, "acp-matrix-invalid", `${evidencePath}/status`, "Evidence status is unsupported.");
          nonEmpty(report, evidence.coordinate, `${evidencePath}/coordinate`);
          root(report, evidence.root, `${evidencePath}/root`);
          roles.add(evidence.role);
          if (evidence.projectId !== project.projectId || evidence.instanceManifestRoot !== project.instanceManifestRoot) {
            issue(report, "acp-matrix-substitution", evidencePath, "Evidence must remain bound to this exact project and category-instance manifest.");
          }
          if (project.terminal.status === "terminal" && evidence.status !== "verified") {
            issue(report, "acp-matrix-incomplete", evidencePath, "A terminal project cannot retain pending or invalid current evidence.");
          }
        }
        for (const requiredRole of ["normative", "category", "project"]) {
          if (!roles.has(requiredRole)) issue(report, "acp-matrix-incomplete", `${path}/evidence`, `Missing ${requiredRole} evidence role.`);
        }
        const selectedIds = new Set(project.selection?.profiles?.map(({ id: profileId }) => profileId) ?? []);
        if (selectedIds.has("kfd.adopter-category/delivery-infrastructure") && !roles.has("delivery")) {
          issue(report, "acp-matrix-incomplete", `${path}/evidence`, "Delivery-infrastructure projects require separately owned delivery evidence.");
        }
        if (selectedIds.has("kfd.adopter-category/product-runtime") && !roles.has("runtime")) {
          issue(report, "acp-matrix-incomplete", `${path}/evidence`, "Product-runtime projects require separately owned runtime evidence.");
        }
        if (selectedIds.has("kfd.adopter-category/independent-clean-room") && !roles.has("independent-review")) {
          issue(report, "acp-matrix-incomplete", `${path}/evidence`, "Independent clean-room projects require a separately identified review.");
        }
      }

      if (!Array.isArray(project.gapIds)
        || new Set(project.gapIds).size !== project.gapIds.length
        || !same(project.gapIds, [...project.gapIds].sort(compareUtf8))) {
        issue(report, "acp-matrix-invalid", `${path}/gapIds`, "Project gap identities must be a UTF-8-sorted set.");
      } else {
        for (const [gapIndex, gapId] of project.gapIds.entries()) {
          id(report, gapId, `${path}/gapIds/${gapIndex}`);
          if (!gapIds.has(gapId)) issue(report, "acp-matrix-incomplete", `${path}/gapIds/${gapIndex}`, "Every project gap needs one owned global gap row.");
        }
      }
    }
  }

  if (!Array.isArray(matrix.failureHistory)) {
    issue(report, "acp-matrix-invalid", "/failureHistory", "Failure history must be an array.");
  } else {
    sortedUnique(report, matrix.failureHistory, "/failureHistory", "id");
    for (const [index, failure] of matrix.failureHistory.entries()) {
      const path = `/failureHistory/${index}`;
      if (!exactObject(report, failure, path, ["id", "stage", "issueCode", "evidenceRoot", "owner", "status"])) continue;
      id(report, failure.id, `${path}/id`);
      id(report, failure.issueCode, `${path}/issueCode`);
      root(report, failure.evidenceRoot, `${path}/evidenceRoot`);
      nonEmpty(report, failure.owner, `${path}/owner`);
      if (!FAILURE_STAGES.has(failure.stage)) issue(report, "acp-matrix-invalid", `${path}/stage`, "Failure stage is unsupported.");
      if (!FAILURE_STATUSES.has(failure.status)) issue(report, "acp-matrix-invalid", `${path}/status`, "Failure status is unsupported.");
    }
  }

  return finish(report);
}
