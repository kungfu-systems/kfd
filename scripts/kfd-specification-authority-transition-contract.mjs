// SPDX-License-Identifier: Apache-2.0
import { canonicalJson, semanticRoot } from "./self-conformance-contract.mjs";

export const KFD_SPECIFICATION_AUTHORITY_TRANSITION =
  "kfd.specification-authority-transition/v1";

const ROOT_PATTERN = /^sha256:[0-9a-f]{64}$/;
const ALPHA_PATTERN = /^(\d+)\.(\d+)\.(\d+)-alpha\.(\d+)$/;
const MODES = new Set(["bootstrap", "prior-cut"]);
const SURFACES = new Set([
  "candidate-generation",
  "profile",
  "schema",
  "verifier",
]);
const CLAIM_BOUNDARY = Object.freeze({
  semanticTruth: false,
  selfCertification: false,
  releaseAuthorization: false,
  authorityTransfer: false,
});

function same(left, right) {
  try {
    return canonicalJson(left) === canonicalJson(right);
  } catch {
    return false;
  }
}

function exactObject(value, keys) {
  return value && typeof value === "object" && !Array.isArray(value)
    && same(Object.keys(value).sort(), [...keys].sort());
}

function alphaVersion(value) {
  const match = ALPHA_PATTERN.exec(value ?? "");
  return match?.slice(1).map(Number) ?? null;
}

function compareAlpha(left, right) {
  const a = alphaVersion(left);
  const b = alphaVersion(right);
  if (!a || !b || !same(a.slice(0, 3), b.slice(0, 3))) return null;
  return Math.sign(a[3] - b[3]);
}

function reportTemplate() {
  return {
    schemaVersion: 1,
    contract: "kfd.specification-authority-transition-report/v1",
    valid: true,
    bootstrap: false,
    priorCutVerified: false,
    circular: false,
    qualifying: false,
    selfCertified: false,
    releaseAuthorized: false,
    transitionRoot: null,
    issues: [],
  };
}

function issue(report, code, path, message) {
  report.issues.push({ code, path, message });
}

function finish(report) {
  report.issues.sort((left, right) => Buffer.compare(
    Buffer.from(`${left.code}\0${left.path}`, "utf8"),
    Buffer.from(`${right.code}\0${right.path}`, "utf8"),
  ));
  report.valid = report.issues.length === 0;
  report.reportRoot = semanticRoot({ ...report });
  return report;
}

export function verifyKfdSpecificationAuthorityTransition(manifest, context = {}) {
  const report = reportTemplate();
  try {
    report.transitionRoot = semanticRoot(manifest);
  } catch {
    issue(report, "ksat-manifest-invalid", "/", "Transition manifest must be canonical JSON.");
    return finish(report);
  }
  if (!exactObject(manifest, [
    "$schema", "schemaVersion", "contract", "transitionId", "mode", "authority",
    "candidate", "changedSurfaces", "bootstrapAnchor", "evidence", "claimBoundary",
  ])) {
    issue(report, "ksat-manifest-invalid", "/", "Transition manifest field set is invalid.");
    return finish(report);
  }
  if (manifest.$schema !== "https://kfd.libkungfu.dev/schemas/kfd-adopter-conformance/specification-authority-transition.schema.json"
    || manifest.schemaVersion !== 1
    || manifest.contract !== KFD_SPECIFICATION_AUTHORITY_TRANSITION
    || typeof manifest.transitionId !== "string"
    || manifest.transitionId.length === 0
    || !MODES.has(manifest.mode)) {
    issue(report, "ksat-manifest-invalid", "/contract", "Transition identity, mode, or contract is unsupported.");
  }
  for (const [path, value] of [["/authority", manifest.authority], ["/candidate", manifest.candidate]]) {
    if (!exactObject(value, ["packageVersion", "packageRoot", "verifierRoot"])
      || !alphaVersion(value?.packageVersion)
      || !ROOT_PATTERN.test(value?.packageRoot ?? "")
      || !ROOT_PATTERN.test(value?.verifierRoot ?? "")) {
      issue(report, "ksat-cut-invalid", path, "KFD cut identity must bind one alpha version, package root, and verifier root.");
    }
  }
  if (manifest.authority?.packageVersion === manifest.candidate?.packageVersion
    || manifest.authority?.packageRoot === manifest.candidate?.packageRoot) {
    report.circular = true;
    issue(report, "ksat-circular-authority", "/candidate", "A candidate cut cannot supply its own package authority.");
  }
  if (compareAlpha(manifest.candidate?.packageVersion, manifest.authority?.packageVersion) !== 1) {
    issue(report, "ksat-cut-not-forward", "/candidate/packageVersion", "Candidate alpha must advance the exact authority release line.");
  }
  if (manifest.authority?.packageVersion !== context.authorityPackageVersion
    || manifest.authority?.packageRoot !== context.authorityPackageRoot
    || manifest.authority?.verifierRoot !== context.authorityVerifierRoot) {
    issue(report, "ksat-authority-mismatch", "/authority", "Transition authority does not match the independently supplied released KFD cut.");
  }

  if (!Array.isArray(manifest.changedSurfaces) || manifest.changedSurfaces.length === 0) {
    issue(report, "ksat-surface-missing", "/changedSurfaces", "At least one changed specification surface is required.");
  } else {
    const ids = [];
    for (const [index, surface] of manifest.changedSurfaces.entries()) {
      if (!exactObject(surface, ["id", "beforeRoot", "afterRoot"])
        || !SURFACES.has(surface?.id)
        || !ROOT_PATTERN.test(surface?.beforeRoot ?? "")
        || !ROOT_PATTERN.test(surface?.afterRoot ?? "")) {
        issue(report, "ksat-surface-invalid", `/changedSurfaces/${index}`, "Changed surface is invalid.");
        continue;
      }
      ids.push(surface.id);
      if (surface.beforeRoot === surface.afterRoot) {
        issue(report, "ksat-surface-unchanged", `/changedSurfaces/${index}`, "Declared changed surfaces must change root.");
      }
      if (surface.id === "verifier"
        && (surface.beforeRoot !== manifest.authority?.verifierRoot
          || surface.afterRoot !== manifest.candidate?.verifierRoot)) {
        issue(report, "ksat-verifier-surface-mismatch", `/changedSurfaces/${index}`, "Verifier transitions must bind the authority and candidate verifier roots.");
      }
    }
    if (!same(ids, [...ids].sort()) || new Set(ids).size !== ids.length) {
      issue(report, "ksat-surface-invalid", "/changedSurfaces", "Changed surfaces must be unique and UTF-8 ordered.");
    }
    if (manifest.authority?.verifierRoot !== manifest.candidate?.verifierRoot
      && !ids.includes("verifier")) {
      issue(report, "ksat-verifier-surface-missing", "/changedSurfaces", "A changed verifier root must be declared as a verifier surface transition.");
    }
  }

  if (!exactObject(manifest.evidence, ["declarationRoot", "reviewRoot", "verificationRoot"])
    || !Object.values(manifest.evidence ?? {}).every((value) => ROOT_PATTERN.test(value))) {
    issue(report, "ksat-evidence-missing", "/evidence", "Declaration, independent review, and verification roots are required.");
  }
  if (!same(manifest.claimBoundary, CLAIM_BOUNDARY)) {
    issue(report, "ksat-claim-widening", "/claimBoundary", "Transition evidence cannot grant semantic, certification, release, or transfer authority.");
  }

  if (manifest.mode === "bootstrap") {
    if (!exactObject(manifest.bootstrapAnchor, ["packageVersion", "packageRoot", "reviewRoot"])
      || !same(manifest.bootstrapAnchor, context.bootstrapAnchor)
      || manifest.bootstrapAnchor?.packageVersion !== manifest.authority?.packageVersion
      || manifest.bootstrapAnchor?.packageRoot !== manifest.authority?.packageRoot) {
      issue(report, "ksat-bootstrap-anchor-mismatch", "/bootstrapAnchor", "Initial transition bootstrap must bind the reviewed prior public KFD anchor.");
    } else {
      report.bootstrap = true;
    }
  } else {
    if (manifest.bootstrapAnchor !== null) {
      issue(report, "ksat-bootstrap-anchor-unexpected", "/bootstrapAnchor", "Prior-cut transitions cannot reuse bootstrap authority.");
    }
    if (context.transitionVerifierPackageVersion !== manifest.authority?.packageVersion
      || context.transitionVerifierPackageRoot !== manifest.authority?.packageRoot
      || context.transitionVerifierRoot !== manifest.authority?.verifierRoot) {
      report.circular = context.transitionVerifierPackageVersion === manifest.candidate?.packageVersion
        || context.transitionVerifierPackageRoot === manifest.candidate?.packageRoot
        || context.transitionVerifierRoot === manifest.candidate?.verifierRoot;
      issue(report, "ksat-prior-verifier-mismatch", "/authority/verifierRoot", "A prior released KFD cut must supply the transition verifier.");
    } else {
      report.priorCutVerified = true;
    }
  }
  return finish(report);
}
