// SPDX-License-Identifier: Apache-2.0
import { canonicalJson, semanticRoot } from "./self-conformance-contract.mjs";

export const ADOPTER_CATEGORY_PROFILE_CATALOG = "kfd.adopter-category-profile-catalog/v1";
export const ADOPTER_CATEGORY_PROFILE_SELECTION = "kfd.adopter-category-profile-selection/v1";
export const ADOPTER_CATEGORY_PROFILE_RESOLUTION = "kfd.adopter-category-profile-resolution/v1";

const PROFILE_ID_PATTERN = /^kfd\.adopter-category\/[a-z][a-z0-9-]*$/;
const PROFILE_VERSION_PATTERN = /^[1-9][0-9]*\.[0-9]+\.[0-9]+$/;
const REQUIREMENT_ID_PATTERN = /^[a-z][a-z0-9-]*$/;
const EVIDENCE_KINDS = new Set(["declaration", "implementation", "negative", "review", "verification"]);
const CLAIM_BOUNDARY = {
  categoryConformanceIsDeclarationOnly: true,
  evidenceTransfer: false,
  runtimePermission: false,
  releaseAuthorization: false,
  independentCertification: false,
  semanticAuthorityTransfer: false,
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

function exactObject(report, value, path, required, code = "acp-catalog-invalid") {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    issue(report, code, path, "Expected a JSON object.");
    return false;
  }
  const admitted = new Set(required);
  for (const key of Object.keys(value)) {
    if (!admitted.has(key)) {
      issue(report, code, `${path}/${key}`, "Unknown fields fail closed.");
    }
  }
  for (const key of required) {
    if (!Object.hasOwn(value, key)) {
      issue(report, code, `${path}/${key}`, "Required field is missing.");
    }
  }
  return true;
}

function exactStringSet(report, value, path, admitted) {
  if (!Array.isArray(value) || value.length === 0) {
    issue(report, "acp-catalog-invalid", path, "Expected a non-empty string set.");
    return;
  }
  if (value.some((entry) => typeof entry !== "string" || !admitted.has(entry))
    || new Set(value).size !== value.length
    || !same(value, [...value].sort(compareUtf8))) {
    issue(report, "acp-catalog-invalid", path, "String sets must contain unique admitted values in UTF-8 order.");
  }
}

function referenceShape(report, reference, path, code = "acp-catalog-invalid") {
  if (!exactObject(report, reference, path, ["id", "version"], code)) return;
  if (!PROFILE_ID_PATTERN.test(reference.id ?? "")) {
    issue(report, code, `${path}/id`, "Profile identity is invalid.");
  }
  if (!PROFILE_VERSION_PATTERN.test(reference.version ?? "")) {
    issue(report, code, `${path}/version`, "Profile version is invalid.");
  }
}

function catalogReport() {
  return {
    schemaVersion: 1,
    contract: "kfd.adopter-category-profile-catalog-report/v1",
    valid: true,
    qualifying: false,
    issues: [],
  };
}

function finish(report) {
  report.issues.sort((left, right) => compareUtf8(
    `${left.code}\0${left.path}\0${left.message}`,
    `${right.code}\0${right.path}\0${right.message}`,
  ));
  report.valid = report.issues.length === 0;
  return report;
}

export function verifyAdopterCategoryProfileCatalog(catalog) {
  const report = catalogReport();
  if (!exactObject(report, catalog, "/", [
    "schemaVersion", "contract", "rootAlgorithm", "baseProfile", "claimBoundary", "profiles",
  ])) return finish(report);
  if (catalog.schemaVersion !== 1
    || catalog.contract !== ADOPTER_CATEGORY_PROFILE_CATALOG
    || catalog.rootAlgorithm !== "sha256-kfd-canonical-json-v1") {
    issue(report, "acp-catalog-invalid", "/contract", "Catalog contract or root algorithm is unsupported.");
  }
  referenceShape(report, catalog.baseProfile, "/baseProfile");
  if (!same(catalog.claimBoundary, CLAIM_BOUNDARY)) {
    issue(report, "acp-claim-widening", "/claimBoundary", "Category profiles cannot transfer evidence or grant semantic, runtime, release, or certification authority.");
  }
  if (!Array.isArray(catalog.profiles) || catalog.profiles.length === 0) {
    issue(report, "acp-catalog-invalid", "/profiles", "Catalog profiles must be a non-empty array.");
    return finish(report);
  }

  const profiles = new Map();
  for (const [profileIndex, profile] of catalog.profiles.entries()) {
    const profilePath = `/profiles/${profileIndex}`;
    if (!exactObject(report, profile, profilePath, ["id", "version", "extends", "requirements"])) continue;
    if (!PROFILE_ID_PATTERN.test(profile.id ?? "") || !PROFILE_VERSION_PATTERN.test(profile.version ?? "")) {
      issue(report, "acp-catalog-invalid", profilePath, "Profile identity or version is invalid.");
    }
    if (profiles.has(profile.id)) {
      issue(report, "acp-catalog-invalid", profilePath, "Profile identities must be unique.");
    }
    profiles.set(profile.id, profile);
    if (!Array.isArray(profile.extends)) {
      issue(report, "acp-catalog-invalid", `${profilePath}/extends`, "Profile inheritance must be an array.");
    } else {
      profile.extends.forEach((reference, index) => referenceShape(report, reference, `${profilePath}/extends/${index}`));
      const references = profile.extends.map((reference) => `${reference?.id ?? ""}@${reference?.version ?? ""}`);
      if (new Set(references).size !== references.length) {
        issue(report, "acp-catalog-invalid", `${profilePath}/extends`, "Inherited profile references must be unique.");
      }
    }
    if (!Array.isArray(profile.requirements)) {
      issue(report, "acp-catalog-invalid", `${profilePath}/requirements`, "Profile requirements must be an array.");
      continue;
    }
    const requirementIds = new Set();
    for (const [requirementIndex, requirement] of profile.requirements.entries()) {
      const requirementPath = `${profilePath}/requirements/${requirementIndex}`;
      if (!exactObject(report, requirement, requirementPath, [
        "id", "evidenceKinds", "minimumEvidencePerKind", "transferable",
      ])) continue;
      if (!REQUIREMENT_ID_PATTERN.test(requirement.id ?? "")) {
        issue(report, "acp-catalog-invalid", `${requirementPath}/id`, "Requirement identity is invalid.");
      }
      if (requirementIds.has(requirement.id)) {
        issue(report, "acp-catalog-invalid", requirementPath, "Requirement identities must be unique within one profile.");
      }
      requirementIds.add(requirement.id);
      exactStringSet(report, requirement.evidenceKinds, `${requirementPath}/evidenceKinds`, EVIDENCE_KINDS);
      if (!Number.isSafeInteger(requirement.minimumEvidencePerKind) || requirement.minimumEvidencePerKind < 1) {
        issue(report, "acp-catalog-invalid", `${requirementPath}/minimumEvidencePerKind`, "Evidence minimum must be a positive safe integer.");
      }
      if (requirement.transferable !== false) {
        issue(report, "acp-claim-widening", `${requirementPath}/transferable`, "Category evidence is never transferable between adopter identities.");
      }
    }
  }

  const base = profiles.get(catalog.baseProfile?.id);
  if (!base || base.version !== catalog.baseProfile?.version) {
    issue(report, "acp-catalog-invalid", "/baseProfile", "Base profile must resolve to one exact catalog profile.");
  } else if (base.extends.length !== 0) {
    issue(report, "acp-catalog-invalid", "/baseProfile", "The base profile cannot inherit another profile.");
  }
  return finish(report);
}

function resolutionReport() {
  return {
    schemaVersion: 1,
    contract: ADOPTER_CATEGORY_PROFILE_RESOLUTION,
    valid: true,
    qualifying: false,
    evidenceInherited: false,
    authorityTransferred: false,
    catalogRoot: null,
    selectionRoot: null,
    selectedProfiles: [],
    requirements: [],
    claimBoundary: { ...CLAIM_BOUNDARY },
    issues: [],
  };
}

function finishResolution(report) {
  finish(report);
  report.resolutionRoot = semanticRoot({ ...report });
  return report;
}

function normalizedSelectionRoot(selection) {
  if (!selection || typeof selection !== "object" || Array.isArray(selection)
    || !Array.isArray(selection.profiles)
    || selection.profiles.some((reference) => !reference || typeof reference !== "object"
      || Array.isArray(reference)
      || typeof reference.id !== "string"
      || typeof reference.version !== "string")) {
    return null;
  }
  const normalized = structuredClone(selection);
  normalized.profiles.sort((left, right) => compareUtf8(
    `${left.id}\0${left.version}`,
    `${right.id}\0${right.version}`,
  ));
  return semanticRoot(normalized);
}

export function resolveAdopterCategoryProfiles(selection, catalog) {
  const report = resolutionReport();
  try {
    report.catalogRoot = semanticRoot(catalog);
  } catch {
    // Catalog diagnostics below remain the stable fail-closed surface.
  }
  report.selectionRoot = normalizedSelectionRoot(selection);
  const catalogVerification = verifyAdopterCategoryProfileCatalog(catalog);
  report.issues.push(...catalogVerification.issues);
  if (!catalogVerification.valid) return finishResolution(report);
  if (!exactObject(
    report,
    selection,
    "/selection",
    ["schemaVersion", "contract", "profiles"],
    "acp-composition-invalid",
  )) {
    return finishResolution(report);
  }
  if (selection.schemaVersion !== 1 || selection.contract !== ADOPTER_CATEGORY_PROFILE_SELECTION) {
    issue(report, "acp-composition-invalid", "/selection/contract", "Category selection contract is unsupported.");
  }
  if (!Array.isArray(selection.profiles)) {
    issue(report, "acp-composition-invalid", "/selection/profiles", "Category selections must be an array.");
    return finishResolution(report);
  }
  selection.profiles.forEach((reference, index) => referenceShape(
    report,
    reference,
    `/selection/profiles/${index}`,
    "acp-composition-invalid",
  ));
  const selectionIds = selection.profiles.map((reference) => reference?.id);
  if (new Set(selectionIds).size !== selectionIds.length) {
    issue(report, "acp-composition-invalid", "/selection/profiles", "Category selections must not repeat a profile identity.");
  }

  const profiles = new Map(catalog.profiles.map((profile) => [profile.id, profile]));
  const selected = new Map();
  const visiting = new Set();
  const visit = (reference, path, inherited = false) => {
    const profile = profiles.get(reference?.id);
    if (!profile) {
      issue(report, inherited ? "acp-catalog-invalid" : "acp-profile-unknown", path, "Selected profile is not published by this catalog.");
      return;
    }
    if (profile.version !== reference.version) {
      issue(report, inherited ? "acp-catalog-invalid" : "acp-profile-version-stale", path, "Selected profile version does not match the published catalog version.");
      return;
    }
    if (visiting.has(profile.id)) {
      issue(report, "acp-composition-conflict", path, "Profile inheritance contains a cycle.");
      return;
    }
    if (selected.has(profile.id)) return;
    visiting.add(profile.id);
    for (const [index, parent] of profile.extends.entries()) {
      visit(parent, `${path}/extends/${index}`, true);
    }
    visiting.delete(profile.id);
    selected.set(profile.id, profile);
  };

  visit(catalog.baseProfile, "/baseProfile", true);
  for (const [index, reference] of selection.profiles.entries()) {
    visit(reference, `/selection/profiles/${index}`);
  }

  const requirements = new Map();
  for (const profile of [...selected.values()].sort((left, right) => compareUtf8(left.id, right.id))) {
    report.selectedProfiles.push({ id: profile.id, version: profile.version });
    for (const requirement of profile.requirements) {
      const existing = requirements.get(requirement.id);
      if (existing && !same(existing, requirement)) {
        issue(report, "acp-composition-conflict", `/requirements/${requirement.id}`, "Profiles define incompatible obligations under the same requirement identity.");
      } else if (!existing) {
        requirements.set(requirement.id, structuredClone(requirement));
      }
    }
  }
  report.requirements = [...requirements.values()].sort((left, right) => compareUtf8(left.id, right.id));
  return finishResolution(report);
}
