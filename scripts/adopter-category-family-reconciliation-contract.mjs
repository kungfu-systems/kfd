// SPDX-License-Identifier: Apache-2.0
import { canonicalJson, semanticRoot } from "./self-conformance-contract.mjs";

export const ADOPTER_CATEGORY_FAMILY_RECONCILIATION = "kfd.adopter-category-family-reconciliation/v1";

const ROOT_PATTERN = /^sha256:[0-9a-f]{64}$/;
const SHA_PATTERN = /^[0-9a-f]{40}$/;
const ID_PATTERN = /^[a-z0-9][a-z0-9._:/-]*$/;
const DELIVERY_ROLES = new Set([
  "protected-merge", "release", "package", "warrant", "passport", "installed-readback", "independent-review",
]);
const DELIVERY_STATUSES = new Set(["verified", "pending", "invalid"]);
const FAILURE_STAGES = new Set(["schema", "composition", "project", "delivery", "runtime", "readback"]);
const FAILURE_STATUSES = new Set(["open", "fixed", "retained"]);
const AUTHORITY_BOUNDARY = {
  normativeSemantics: "kfd-package",
  assignmentClosure: "work-control-owned",
  protectedDelivery: "repository-governance-owned",
  releasePermission: "release-system-owned",
  runtimePermission: "adopter-runtime-owned",
  independentCertification: "separate-certifier-required",
  buildchainRole: "optional-protocol-neutral-carrier",
};

function compareUtf8(left, right) {
  return Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
}

function identityToken(value) {
  return typeof value === "string" ? value : "";
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
    issue(report, "acp-family-invalid", path, "Expected a JSON object.");
    return false;
  }
  const admitted = new Set([...required, ...optional]);
  for (const key of Object.keys(value)) {
    if (!admitted.has(key)) issue(report, "acp-family-invalid", `${path}/${key}`, "Unknown fields fail closed.");
  }
  for (const key of required) {
    if (!Object.hasOwn(value, key)) issue(report, "acp-family-invalid", `${path}/${key}`, "Required field is missing.");
  }
  return true;
}

function id(report, value, path) {
  if (typeof value !== "string" || !ID_PATTERN.test(value)) {
    issue(report, "acp-family-invalid", path, "Expected a stable lowercase identity.");
  }
}

function nonEmpty(report, value, path) {
  if (typeof value !== "string" || value.length === 0) {
    issue(report, "acp-family-invalid", path, "Expected a non-empty string.");
  }
}

function root(report, value, path) {
  if (typeof value !== "string" || !ROOT_PATTERN.test(value)) {
    issue(report, "acp-family-invalid", path, "Expected sha256: plus 64 lowercase hexadecimal characters.");
  }
}

function sha(report, value, path) {
  if (typeof value !== "string" || !SHA_PATTERN.test(value)) {
    issue(report, "acp-family-invalid", path, "Expected a 40-character lowercase Git object ID.");
  }
}

function deliveryRoot(delivery) {
  const rooted = { ...delivery };
  delete rooted.root;
  return semanticRoot(rooted);
}

function failureRoot(failure) {
  const rooted = { ...failure };
  delete rooted.evidenceRoot;
  return semanticRoot(rooted);
}

function sortedUnique(report, values, path) {
  if (!Array.isArray(values)) {
    issue(report, "acp-family-invalid", path, "Expected an array.");
    return false;
  }
  const tokens = values.map(identityToken);
  if (new Set(tokens).size !== tokens.length) {
    issue(report, "acp-family-duplicate", path, "Duplicate identities fail closed.");
  }
  if (!same(tokens, [...tokens].sort(compareUtf8))) {
    issue(report, "acp-family-invalid", path, "Identities must use UTF-8 byte order.");
  }
  return true;
}

function reportTemplate() {
  return {
    schemaVersion: 1,
    contract: "kfd.adopter-category-family-reconciliation-report/v1",
    valid: true,
    complete: false,
    qualifying: false,
    releaseAuthorized: false,
    runtimeAuthorized: false,
    independentlyCertified: false,
    familyRoot: null,
    pendingAssignmentIds: [],
    openGapIds: [],
    issues: [],
  };
}

function finish(report) {
  report.pendingAssignmentIds.sort(compareUtf8);
  report.openGapIds.sort(compareUtf8);
  report.issues.sort((left, right) => compareUtf8(
    `${left.code}\0${left.path}\0${left.message}`,
    `${right.code}\0${right.path}\0${right.message}`,
  ));
  report.valid = report.issues.length === 0;
  report.complete = report.valid
    && report.pendingAssignmentIds.length === 0
    && report.openGapIds.length === 0;
  report.reportRoot = semanticRoot({ ...report });
  return report;
}

export function verifyAdopterCategoryFamilyReconciliation(family) {
  const report = reportTemplate();
  try {
    report.familyRoot = semanticRoot(family);
  } catch {
    // Stable exact-shape diagnostics below remain the fail-closed surface.
  }

  if (!exactObject(report, family, "/", [
    "$schema", "schemaVersion", "contract", "rootAlgorithm", "initiativeId",
    "expectedChildAssignmentIds", "children", "failureHistory", "gaps", "authorityBoundary",
  ])) return finish(report);
  if (family.$schema !== "https://kfd.libkungfu.dev/schemas/kfd-adopter-conformance/family-reconciliation.schema.json"
    || family.schemaVersion !== 1
    || family.contract !== ADOPTER_CATEGORY_FAMILY_RECONCILIATION
    || family.rootAlgorithm !== "sha256-kfd-canonical-json-v1") {
    issue(report, "acp-family-invalid", "/contract", "Family-reconciliation contract or root algorithm is unsupported.");
  }
  id(report, family.initiativeId, "/initiativeId");
  if (!same(family.authorityBoundary, AUTHORITY_BOUNDARY)) {
    issue(report, "acp-family-authority-widening", "/authorityBoundary", "Reconciliation cannot merge specification, Assignment, delivery, release, runtime, or certification authority.");
  }

  const expectedIds = new Set();
  if (sortedUnique(report, family.expectedChildAssignmentIds, "/expectedChildAssignmentIds")) {
    if (family.expectedChildAssignmentIds.length === 0) {
      issue(report, "acp-family-incomplete", "/expectedChildAssignmentIds", "At least one predecessor child is required.");
    }
    for (const [index, assignmentId] of family.expectedChildAssignmentIds.entries()) {
      id(report, assignmentId, `/expectedChildAssignmentIds/${index}`);
      expectedIds.add(identityToken(assignmentId));
    }
  }

  const gapIds = new Set();
  const referencedGapIds = new Set();
  if (!Array.isArray(family.gaps)) {
    issue(report, "acp-family-invalid", "/gaps", "Gap rows must be an array.");
  } else {
    const identities = family.gaps.map((gap) => gap?.id ?? "");
    sortedUnique(report, identities, "/gaps");
    for (const [index, gap] of family.gaps.entries()) {
      const path = `/gaps/${index}`;
      if (!exactObject(report, gap, path, ["id", "owner", "status", "evidenceRoot"])) continue;
      id(report, gap.id, `${path}/id`);
      nonEmpty(report, gap.owner, `${path}/owner`);
      gapIds.add(gap.id);
      if (gap.status === "open") {
        if (gap.evidenceRoot !== null) issue(report, "acp-family-invalid", `${path}/evidenceRoot`, "An open gap cannot claim closure evidence.");
        report.openGapIds.push(gap.id);
      } else if (gap.status === "closed") {
        root(report, gap.evidenceRoot, `${path}/evidenceRoot`);
      } else {
        issue(report, "acp-family-invalid", `${path}/status`, "Gap status must be open or closed.");
      }
    }
  }

  const actualIds = [];
  const waves = new Set();
  if (!Array.isArray(family.children) || family.children.length === 0) {
    issue(report, "acp-family-incomplete", "/children", "Every expected predecessor child needs one reconciliation row.");
  } else {
    for (const [childIndex, child] of family.children.entries()) {
      const path = `/children/${childIndex}`;
      if (!exactObject(report, child, path, [
        "wave", "assignmentId", "repository", "requestRoot", "workDefinitionRoot", "terminal", "deliveryEvidence", "gapIds",
      ])) continue;
      if (!Number.isInteger(child.wave) || child.wave < 1) issue(report, "acp-family-invalid", `${path}/wave`, "Wave must be a positive integer.");
      if (waves.has(child.wave)) issue(report, "acp-family-duplicate", `${path}/wave`, "Each predecessor wave must appear exactly once.");
      waves.add(child.wave);
      id(report, child.assignmentId, `${path}/assignmentId`);
      id(report, child.repository, `${path}/repository`);
      root(report, child.requestRoot, `${path}/requestRoot`);
      root(report, child.workDefinitionRoot, `${path}/workDefinitionRoot`);
      actualIds.push(identityToken(child.assignmentId));

      if (exactObject(report, child.terminal, `${path}/terminal`, ["status", "root", "queryProofRoot"])) {
        if (child.terminal.status === "pending") {
          if (child.terminal.root !== null || child.terminal.queryProofRoot !== null) {
            issue(report, "acp-family-invalid", `${path}/terminal`, "Pending work cannot claim terminal roots.");
          }
          report.pendingAssignmentIds.push(child.assignmentId);
        } else if (child.terminal.status === "terminal") {
          root(report, child.terminal.root, `${path}/terminal/root`);
          root(report, child.terminal.queryProofRoot, `${path}/terminal/queryProofRoot`);
        } else {
          issue(report, "acp-family-invalid", `${path}/terminal/status`, "Terminal status must be pending or terminal.");
        }
      }

      if (!Array.isArray(child.deliveryEvidence) || child.deliveryEvidence.length === 0) {
        issue(report, "acp-family-incomplete", `${path}/deliveryEvidence`, "At least one protected-delivery coordinate is required.");
      } else {
        const keys = child.deliveryEvidence.map((entry) => `${entry?.role ?? ""}\0${entry?.coordinate ?? ""}`);
        if (new Set(keys).size !== keys.length) issue(report, "acp-family-duplicate", `${path}/deliveryEvidence`, "Duplicate delivery coordinates fail closed.");
        let protectedMergeCount = 0;
        for (const [deliveryIndex, delivery] of child.deliveryEvidence.entries()) {
          const deliveryPath = `${path}/deliveryEvidence/${deliveryIndex}`;
          if (!exactObject(report, delivery, deliveryPath, ["role", "coordinate", "root", "status"], ["sourceHead", "integratedHead"])) continue;
          if (!DELIVERY_ROLES.has(delivery.role)) issue(report, "acp-family-invalid", `${deliveryPath}/role`, "Delivery role is unsupported.");
          if (!DELIVERY_STATUSES.has(delivery.status)) issue(report, "acp-family-invalid", `${deliveryPath}/status`, "Delivery status is unsupported.");
          nonEmpty(report, delivery.coordinate, `${deliveryPath}/coordinate`);
          root(report, delivery.root, `${deliveryPath}/root`);
          if (ROOT_PATTERN.test(delivery.root ?? "") && delivery.root !== deliveryRoot(delivery)) {
            issue(report, "acp-family-substitution", `${deliveryPath}/root`, "Delivery root must bind the exact role, coordinate, status, and admitted Git heads.");
          }
          if (delivery.role === "protected-merge") {
            protectedMergeCount += 1;
            sha(report, delivery.sourceHead, `${deliveryPath}/sourceHead`);
            if (delivery.status === "pending") {
              if (delivery.integratedHead !== null) issue(report, "acp-family-invalid", `${deliveryPath}/integratedHead`, "Pending protected delivery cannot claim an integrated head.");
            } else {
              sha(report, delivery.integratedHead, `${deliveryPath}/integratedHead`);
            }
          } else if (Object.hasOwn(delivery, "sourceHead") || Object.hasOwn(delivery, "integratedHead")) {
            issue(report, "acp-family-invalid", deliveryPath, "Only protected-merge evidence may carry Git source and integrated heads.");
          }
          if (child.terminal?.status === "terminal" && delivery.status !== "verified") {
            issue(report, "acp-family-incomplete", deliveryPath, "A terminal child cannot retain pending or invalid current delivery evidence.");
          }
        }
        if (protectedMergeCount !== 1) {
          issue(report, "acp-family-incomplete", `${path}/deliveryEvidence`, "Each child requires exactly one protected-merge coordinate.");
        }
      }

      if (!Array.isArray(child.gapIds)
        || new Set(child.gapIds).size !== child.gapIds.length
        || !same(child.gapIds.map(identityToken), child.gapIds.map(identityToken).sort(compareUtf8))) {
        issue(report, "acp-family-invalid", `${path}/gapIds`, "Child gap identities must be a UTF-8-sorted set.");
      } else {
        for (const [gapIndex, gapId] of child.gapIds.entries()) {
          id(report, gapId, `${path}/gapIds/${gapIndex}`);
          referencedGapIds.add(gapId);
          if (!gapIds.has(gapId)) issue(report, "acp-family-incomplete", `${path}/gapIds/${gapIndex}`, "Every child gap needs one owned global gap row.");
        }
      }
    }
  }

  if (new Set(actualIds).size !== actualIds.length) {
    issue(report, "acp-family-duplicate", "/children", "Each child Assignment must appear exactly once.");
  }
  const expectedOrder = family.children?.map(({ assignmentId }) => identityToken(assignmentId)) ?? [];
  const sortedByWave = [...(family.children ?? [])].sort((left, right) => left.wave - right.wave).map(({ assignmentId }) => identityToken(assignmentId));
  if (!same(expectedOrder, sortedByWave)) issue(report, "acp-family-invalid", "/children", "Children must be ordered by ascending wave.");
  if (!same([...actualIds].sort(compareUtf8), [...expectedIds].sort(compareUtf8))) {
    issue(report, "acp-family-substitution", "/children", "Children must exactly cover the declared predecessor Assignment set.");
  }
  for (const gapId of gapIds) {
    if (!referencedGapIds.has(gapId)) issue(report, "acp-family-incomplete", "/gaps", `Gap ${gapId} is not owned by a child row.`);
  }

  if (!Array.isArray(family.failureHistory)) {
    issue(report, "acp-family-invalid", "/failureHistory", "Failure history must be an array.");
  } else {
    const identities = family.failureHistory.map((failure) => failure?.id ?? "");
    sortedUnique(report, identities, "/failureHistory");
    for (const [index, failure] of family.failureHistory.entries()) {
      const path = `/failureHistory/${index}`;
      if (!exactObject(report, failure, path, ["id", "assignmentId", "stage", "issueCode", "evidenceRoot", "owner", "status"])) continue;
      id(report, failure.id, `${path}/id`);
      id(report, failure.assignmentId, `${path}/assignmentId`);
      id(report, failure.issueCode, `${path}/issueCode`);
      root(report, failure.evidenceRoot, `${path}/evidenceRoot`);
      if (ROOT_PATTERN.test(failure.evidenceRoot ?? "") && failure.evidenceRoot !== failureRoot(failure)) {
        issue(report, "acp-family-substitution", `${path}/evidenceRoot`, "Failure root must bind the exact retained failure row.");
      }
      nonEmpty(report, failure.owner, `${path}/owner`);
      if (!expectedIds.has(identityToken(failure.assignmentId))) issue(report, "acp-family-substitution", `${path}/assignmentId`, "Failure history must bind an expected predecessor Assignment.");
      if (!FAILURE_STAGES.has(failure.stage)) issue(report, "acp-family-invalid", `${path}/stage`, "Failure stage is unsupported.");
      if (!FAILURE_STATUSES.has(failure.status)) issue(report, "acp-family-invalid", `${path}/status`, "Failure status is unsupported.");
    }
  }

  return finish(report);
}
