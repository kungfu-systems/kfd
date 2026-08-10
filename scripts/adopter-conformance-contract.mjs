// SPDX-License-Identifier: Apache-2.0
import { canonicalJson, exactByteRoot, semanticRoot } from "./self-conformance-contract.mjs";

export const ADOPTER_CONFORMANCE_PROFILE = "kfd.adopter-conformance-manifest/v1";

const ROOT_PATTERN = /^sha256:[0-9a-f]{64}$/;
const DECISION_ID_PATTERN = /^KFD-[1-9][0-9]*$/;

function compareUtf8(left, right) {
  return Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
}

function sortedUnique(values) {
  return [...new Set(values)].sort(compareUtf8);
}

function asBytes(value) {
  if (typeof value === "string") return Buffer.from(value, "utf8");
  if (value instanceof Uint8Array) return Buffer.from(value);
  throw new TypeError("cut files must be UTF-8 strings or byte arrays");
}

function surfaceMembers(definitions, files, extraField) {
  if (!Array.isArray(definitions)) throw new TypeError("surface definitions must be arrays");
  const paths = new Set();
  return definitions.map((entry) => {
    if (!entry
      || typeof entry.path !== "string"
      || entry.path.startsWith("/")
      || entry.path.split("/").includes("..")
      || typeof entry[extraField] !== "string"
      || entry[extraField].length === 0
      || !(entry.path in files)) {
      throw new TypeError(`missing published cut bytes for ${entry?.path ?? "unknown path"}`);
    }
    if (paths.has(entry.path)) throw new TypeError(`duplicate published cut path ${entry.path}`);
    paths.add(entry.path);
    return {
      path: entry.path,
      byteRoot: exactByteRoot(asBytes(files[entry.path])),
      [extraField]: entry[extraField],
    };
  }).sort((left, right) => compareUtf8(left.path, right.path));
}

export function deriveAdopterCut(context) {
  const { registry, standards, files = {}, surfaces = {} } = context ?? {};
  if (!registry || !standards) throw new TypeError("registry and standards values are required");
  const schemaSet = surfaceMembers(surfaces.schemas, files, "schemaId");
  const vectorSet = surfaceMembers(surfaces.vectors ?? [], files, "contract");
  const verifierSet = surfaceMembers(surfaces.verifiers, files, "kind");
  const decisionProjection = (registry.entries ?? []).map(({ id, number, status, path }) => ({
    id,
    number,
    status,
    path,
  }));
  const decisionIds = decisionProjection.map(({ id }) => id);
  const decisionNumbers = decisionProjection.map(({ number }) => number);
  if (decisionProjection.length === 0
    || decisionIds.some((id) => !DECISION_ID_PATTERN.test(id))
    || new Set(decisionIds).size !== decisionIds.length
    || new Set(decisionNumbers).size !== decisionNumbers.length) {
    throw new TypeError("registry decision projection must be non-empty and unique by ID and number");
  }
  return {
    registry: {
      path: context.registryPath ?? "registry.json",
      schemaVersion: registry.schemaVersion,
      contract: registry.contract,
      root: semanticRoot(registry),
    },
    standards: {
      path: context.standardsPath ?? "standards.json",
      schemaVersion: standards.schemaVersion,
      contract: standards.contract,
      root: semanticRoot(standards),
    },
    schemaSet,
    schemaSetRoot: semanticRoot(schemaSet),
    vectorSet,
    vectorSetRoot: semanticRoot(vectorSet),
    verifierSet,
    verifierSetRoot: semanticRoot(verifierSet),
    decisionSetRoot: semanticRoot(decisionProjection),
    decisionProjection,
  };
}

function verificationReport() {
  return {
    schemaVersion: 1,
    contract: "kfd.verification-report/v1",
    profile: ADOPTER_CONFORMANCE_PROFILE,
    valid: true,
    qualifying: false,
    selfCertified: false,
    offline: true,
    checks: [],
    issues: [],
  };
}

function issue(report, code, path, message) {
  report.issues.push({ code, path, message });
}

function finish(report, checks) {
  for (const id of sortedUnique(checks)) {
    report.checks.push({
      id,
      status: report.issues.some((entry) => entry.path === id || entry.path.startsWith(`${id}/`))
        ? "fail"
        : "pass",
    });
  }
  report.issues.sort((left, right) => {
    const leftKey = `${left.code}\0${left.path}\0${left.message}`;
    const rightKey = `${right.code}\0${right.path}\0${right.message}`;
    return compareUtf8(leftKey, rightKey);
  });
  report.valid = report.issues.length === 0;
  return report;
}

function same(left, right) {
  try {
    return canonicalJson(left) === canonicalJson(right);
  } catch {
    return false;
  }
}

function validRoot(value) {
  return typeof value === "string" && ROOT_PATTERN.test(value);
}

function evidenceRows(row) {
  return [
    ...(row.implementationEvidence ?? []),
    ...(row.verificationEvidence ?? []),
    ...(row.negativeEvidence ?? []),
    ...(row.reviews ?? []),
  ];
}

function verifyEvidence(report, row, index, context, packageRoot) {
  const policy = context.evidencePolicy ?? {};
  const verifiedAt = Date.parse(policy.verifiedAt ?? "");
  const maxAgeSeconds = policy.maxAgeSeconds;
  const freshnessReady = Number.isFinite(verifiedAt)
    && Number.isSafeInteger(maxAgeSeconds)
    && maxAgeSeconds >= 0;
  if (!freshnessReady) {
    issue(
      report,
      "acm-verification-context-invalid",
      "/verificationContext/evidencePolicy",
      "Evidence verification requires an explicit verifiedAt cut and non-negative maxAgeSeconds.",
    );
    return;
  }
  for (const [evidenceIndex, evidence] of evidenceRows(row).entries()) {
    const evidencePath = `/decisions/${index}/evidence/${evidenceIndex}`;
    if (evidence?.kfdPackageRoot !== packageRoot) {
      issue(report, "acm-root-substitution", evidencePath, "Evidence is bound to another KFD package root.");
    }
    const observedAt = Date.parse(evidence?.observedAt ?? "");
    if (!Number.isFinite(observedAt)
      || observedAt > verifiedAt
      || verifiedAt - observedAt > maxAgeSeconds * 1000) {
      issue(report, "acm-evidence-stale", evidencePath, "Evidence falls outside the declared verification-time freshness cut.");
    }
  }
}

export function verifyAdopterManifest(manifest, context) {
  const report = verificationReport();
  const checks = [
    "/contract",
    "/claimBoundary",
    "/verificationContext",
    "/kfdCut",
    "/decisions",
    "/releaseBindings",
  ];
  let derived;
  try {
    derived = deriveAdopterCut(context);
  } catch (error) {
    issue(report, "acm-verification-context-invalid", "/verificationContext", error.message);
    return finish(report, checks);
  }

  if (manifest?.schemaVersion !== 1
    || manifest?.contract !== ADOPTER_CONFORMANCE_PROFILE
    || manifest?.rootAlgorithm !== "sha256-kfd-canonical-json-v1"
    || manifest?.byteDigestAlgorithm !== "sha256-bytes-v1") {
    issue(report, "acm-contract-invalid", "/contract", "Manifest contract or root algorithms are unsupported.");
  }
  if (!same(manifest?.claimBoundary, {
    declarationOnly: true,
    runtimePermission: false,
    releaseAuthorization: false,
    independentlyCertified: false,
    semanticTruth: false,
  })) {
    issue(report, "acm-claim-boundary-invalid", "/claimBoundary", "Declaration, runtime, release, certification, and semantic authority must remain separate.");
  }

  const cut = manifest?.kfdCut ?? {};
  const packageRoot = context?.expectedPackageRoot;
  if (!validRoot(packageRoot) || cut.package?.artifactRoot !== packageRoot) {
    issue(report, "acm-root-substitution", "/kfdCut/package/artifactRoot", "Manifest package root does not match the verifier-supplied package artifact root.");
  }
  for (const key of ["registry", "standards"]) {
    if (!same(cut[key], derived[key])) {
      issue(report, "acm-root-substitution", `/kfdCut/${key}`, `Pinned ${key} bytes or identity do not reproduce.`);
    }
  }
  for (const key of ["schemaSet", "vectorSet", "verifierSet"]) {
    if (!same(cut[key], derived[key]) || cut[`${key}Root`] !== derived[`${key}Root`]) {
      issue(report, "acm-root-substitution", `/kfdCut/${key}`, `Pinned ${key} members or set root do not reproduce from published bytes.`);
    }
  }
  if (cut.decisionSetRoot !== derived.decisionSetRoot) {
    issue(report, "acm-registry-mismatch", "/kfdCut/decisionSetRoot", "Decision-set root does not reproduce from the pinned registry.");
  }

  const rows = Array.isArray(manifest?.decisions) ? manifest.decisions : [];
  const expectedById = new Map(derived.decisionProjection.map((entry) => [entry.id, entry]));
  const observedById = new Map();
  for (const [index, row] of rows.entries()) {
    const path = `/decisions/${index}`;
    if (!DECISION_ID_PATTERN.test(row?.id ?? "") || !expectedById.has(row.id)) {
      issue(report, "acm-registry-mismatch", path, "Decision row is not present in the pinned registry cut.");
      continue;
    }
    const indexes = observedById.get(row.id) ?? [];
    indexes.push(index);
    observedById.set(row.id, indexes);
    const expected = expectedById.get(row.id);
    if (row.number !== expected.number || row.registryStatus !== expected.status) {
      issue(report, "acm-registry-mismatch", path, "Decision number or registry status differs from the pinned registry entry.");
    }
    if (expected.status === "draft"
      && (row.state === "adopted" || row.state === "candidate"
        || (row.claims ?? []).length > 0 || (row.releaseBindingIds ?? []).length > 0)) {
      issue(report, "acm-draft-authority-widening", path, "A draft registry entry cannot be widened into adoption, candidacy, claims, or release authority.");
    }
    if (["unsupported", "not-used"].includes(row.state) && row.usage !== "unused") {
      issue(report, "acm-undeclared-use", path, "Unsupported or not-used declarations cannot hide actual use.");
    }
    if (row.state === "not-used") {
      if ((row.claims ?? []).length > 0) {
        issue(report, "acm-not-used-claim", `${path}/claims`, "A not-used row cannot carry claims.");
      }
      if (evidenceRows(row).length > 0
        || (row.witnessBindings ?? []).length > 0
        || (row.releaseBindingIds ?? []).length > 0) {
        issue(report, "acm-undeclared-use", path, "A not-used row cannot carry use evidence, witnesses, or release bindings.");
      }
    }
    verifyEvidence(report, row, index, context, packageRoot);
  }

  for (const expected of derived.decisionProjection) {
    const indexes = observedById.get(expected.id) ?? [];
    if (indexes.length === 0) {
      issue(report, "acm-decision-row-missing", "/decisions", `Pinned registry row ${expected.id} is missing.`);
    } else if (indexes.length > 1) {
      issue(report, "acm-decision-row-duplicate", "/decisions", `Pinned registry row ${expected.id} appears more than once.`);
    }
  }
  if (rows.length === derived.decisionProjection.length
    && observedById.size === expectedById.size
    && [...observedById.values()].every((indexes) => indexes.length === 1)
    && rows.some((row, index) => row.id !== derived.decisionProjection[index].id)) {
    issue(report, "acm-registry-mismatch", "/decisions", "Decision rows do not preserve the pinned registry order.");
  }

  const releaseBindings = Array.isArray(manifest?.releaseBindings) ? manifest.releaseBindings : [];
  const releaseById = new Map();
  for (const [index, binding] of releaseBindings.entries()) {
    const path = `/releaseBindings/${index}`;
    if (releaseById.has(binding?.id)) {
      issue(report, "acm-release-binding-mismatch", path, "Release binding IDs must be unique.");
    }
    releaseById.set(binding?.id, binding);
    if (binding?.kfdPackageRoot !== packageRoot) {
      issue(report, "acm-root-substitution", path, "Release binding is rooted in another KFD package cut.");
    }
    if (!same(binding?.artifact, manifest?.adopter?.artifact)) {
      issue(report, "acm-release-binding-mismatch", path, "Release binding artifact differs from the adopter artifact coordinate.");
    }
  }

  const verifierRoots = new Set(derived.verifierSet.map(({ byteRoot }) => byteRoot));
  for (const [index, row] of rows.entries()) {
    const path = `/decisions/${index}`;
    for (const [witnessIndex, witness] of (row.witnessBindings ?? []).entries()) {
      const witnessPath = `${path}/witnessBindings/${witnessIndex}`;
      let profileRoot = null;
      try {
        profileRoot = exactByteRoot(asBytes(context.files[witness.profileManifestPath]));
      } catch {
        // The stable mismatch below covers absent profile bytes without leaking host paths.
      }
      if (witness.decisionId !== row.id
        || witness.kfdPackageRoot !== packageRoot
        || witness.profileManifestRoot !== profileRoot
        || !verifierRoots.has(witness.verifierRoot)) {
        issue(report, "acm-witness-binding-mismatch", witnessPath, "Witness decision, profile, verifier, or package binding does not reproduce.");
      }
    }
    for (const releaseId of row.releaseBindingIds ?? []) {
      const binding = releaseById.get(releaseId);
      if (!binding || binding.kfdPackageRoot !== packageRoot) {
        issue(report, "acm-release-binding-mismatch", `${path}/releaseBindingIds`, "Decision release reference does not resolve in the same package cut.");
      }
    }
  }

  return finish(report, checks);
}
