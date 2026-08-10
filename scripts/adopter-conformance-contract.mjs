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

function objectShape(report, value, path, required, optional = []) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    issue(report, "acm-structure-invalid", path, "Expected a JSON object.");
    return false;
  }
  const admitted = new Set([...required, ...optional]);
  for (const key of Object.keys(value)) {
    if (!admitted.has(key)) {
      issue(report, "acm-structure-invalid", `${path}/${key}`, "Unknown manifest fields fail closed.");
    }
  }
  for (const key of required) {
    if (!Object.hasOwn(value, key)) {
      issue(report, "acm-structure-invalid", `${path}/${key}`, "Required manifest field is missing.");
    }
  }
  return true;
}

function arrayShape(report, value, path) {
  if (!Array.isArray(value)) {
    issue(report, "acm-structure-invalid", path, "Expected a JSON array.");
    return [];
  }
  return value;
}

function verifyManifestShape(report, manifest) {
  if (!objectShape(report, manifest, "/", [
    "schemaVersion", "contract", "manifestId", "rootAlgorithm", "byteDigestAlgorithm",
    "adopter", "kfdCut", "decisions", "releaseBindings", "claimBoundary", "gaps",
  ], ["$schema"])) return;
  if (objectShape(report, manifest.adopter, "/adopter", ["id", "artifact", "scope"])) {
    objectShape(report, manifest.adopter.artifact, "/adopter/artifact", ["kind", "coordinate", "root"]);
  }
  if (objectShape(report, manifest.kfdCut, "/kfdCut", [
    "package", "registry", "standards", "schemaSet", "schemaSetRoot", "vectorSet",
    "vectorSetRoot", "verifierSet", "verifierSetRoot", "decisionSetRoot",
  ])) {
    objectShape(report, manifest.kfdCut.package, "/kfdCut/package", ["name", "version", "artifactRoot"]);
    for (const key of ["registry", "standards"]) {
      objectShape(report, manifest.kfdCut[key], `/kfdCut/${key}`, ["path", "schemaVersion", "contract", "root"]);
    }
    for (const [key, extra] of [["schemaSet", "schemaId"], ["vectorSet", "contract"], ["verifierSet", "kind"]]) {
      for (const [index, row] of arrayShape(report, manifest.kfdCut[key], `/kfdCut/${key}`).entries()) {
        objectShape(report, row, `/kfdCut/${key}/${index}`, ["path", "byteRoot", extra]);
      }
    }
  }
  for (const [index, row] of arrayShape(report, manifest.decisions, "/decisions").entries()) {
    const rowPath = `/decisions/${index}`;
    if (!objectShape(report, row, rowPath, [
      "id", "number", "registryStatus", "state", "usage", "implementationEvidence",
      "verificationEvidence", "negativeEvidence", "reviews", "witnessBindings",
      "releaseBindingIds", "claims", "gaps",
    ])) continue;
    for (const key of ["implementationEvidence", "verificationEvidence", "negativeEvidence", "reviews"]) {
      for (const [evidenceIndex, evidence] of arrayShape(report, row[key], `${rowPath}/${key}`).entries()) {
        objectShape(report, evidence, `${rowPath}/${key}/${evidenceIndex}`, [
          "kind", "coordinate", "root", "observedAt", "kfdPackageRoot",
        ]);
      }
    }
    for (const [witnessIndex, witness] of arrayShape(report, row.witnessBindings, `${rowPath}/witnessBindings`).entries()) {
      objectShape(report, witness, `${rowPath}/witnessBindings/${witnessIndex}`, [
        "decisionId", "profileId", "profileManifestPath", "profileManifestRoot",
        "witnessCoordinate", "witnessRoot", "verifierRoot", "kfdPackageRoot",
      ]);
    }
    for (const key of ["releaseBindingIds", "claims", "gaps"]) arrayShape(report, row[key], `${rowPath}/${key}`);
  }
  for (const [index, binding] of arrayShape(report, manifest.releaseBindings, "/releaseBindings").entries()) {
    const bindingPath = `/releaseBindings/${index}`;
    if (!objectShape(report, binding, bindingPath, ["id", "artifact", "releasePassport", "kfdPackageRoot"])) continue;
    objectShape(report, binding.artifact, `${bindingPath}/artifact`, ["kind", "coordinate", "root"]);
    objectShape(report, binding.releasePassport, `${bindingPath}/releasePassport`, ["kind", "coordinate", "root"]);
  }
  objectShape(report, manifest.claimBoundary, "/claimBoundary", [
    "declarationOnly", "runtimePermission", "releaseAuthorization", "independentlyCertified", "semanticTruth",
  ]);
  arrayShape(report, manifest.gaps, "/gaps");
}

function verifyManifestValues(report, manifest) {
  const valueIssue = (path, message) => issue(report, "acm-structure-invalid", path, message);
  const nonEmpty = (value, path) => {
    if (typeof value !== "string" || value.length === 0) valueIssue(path, "Expected a non-empty string.");
  };
  const root = (value, path) => {
    if (!validRoot(value)) valueIssue(path, "Expected sha256: plus 64 lowercase hexadecimal characters.");
  };
  const oneOf = (value, admitted, path) => {
    if (!admitted.includes(value)) valueIssue(path, `Unsupported value: ${String(value)}.`);
  };
  const stringSet = (value, path) => {
    if (!Array.isArray(value)) return;
    value.forEach((entry, index) => nonEmpty(entry, `${path}/${index}`));
    if (new Set(value).size !== value.length) valueIssue(path, "Set-like string arrays must not contain duplicates.");
  };
  if (manifest.$schema !== undefined
    && manifest.$schema !== "https://kfd.libkungfu.dev/schemas/kfd-adopter-conformance/manifest.schema.json") {
    valueIssue("/$schema", "Unsupported manifest schema identifier.");
  }
  nonEmpty(manifest.manifestId, "/manifestId");
  nonEmpty(manifest.adopter.id, "/adopter/id");
  nonEmpty(manifest.adopter.scope, "/adopter/scope");
  oneOf(manifest.adopter.artifact.kind, ["git-commit", "package", "container", "archive", "release", "other"], "/adopter/artifact/kind");
  nonEmpty(manifest.adopter.artifact.coordinate, "/adopter/artifact/coordinate");
  root(manifest.adopter.artifact.root, "/adopter/artifact/root");
  root(manifest.kfdCut.package.artifactRoot, "/kfdCut/package/artifactRoot");
  for (const key of ["schemaSetRoot", "vectorSetRoot", "verifierSetRoot", "decisionSetRoot"]) {
    root(manifest.kfdCut[key], `/kfdCut/${key}`);
  }
  for (const key of ["schemaSet", "vectorSet", "verifierSet"]) {
    manifest.kfdCut[key].forEach((surface, index) => {
      nonEmpty(surface.path, `/kfdCut/${key}/${index}/path`);
      root(surface.byteRoot, `/kfdCut/${key}/${index}/byteRoot`);
    });
  }
  manifest.decisions.forEach((row, index) => {
    const rowPath = `/decisions/${index}`;
    if (!Number.isSafeInteger(row.number) || row.number < 1) valueIssue(`${rowPath}/number`, "Decision number must be a positive safe integer.");
    oneOf(row.registryStatus, ["active", "draft", "superseded"], `${rowPath}/registryStatus`);
    oneOf(row.state, ["adopted", "candidate", "draft-evidence", "unsupported", "not-used"], `${rowPath}/state`);
    oneOf(row.usage, ["used", "evaluating", "unused"], `${rowPath}/usage`);
    for (const key of ["implementationEvidence", "verificationEvidence", "negativeEvidence", "reviews"]) {
      row[key].forEach((evidence, evidenceIndex) => {
        const evidencePath = `${rowPath}/${key}/${evidenceIndex}`;
        oneOf(evidence.kind, ["implementation", "verification", "negative", "review"], `${evidencePath}/kind`);
        nonEmpty(evidence.coordinate, `${evidencePath}/coordinate`);
        root(evidence.root, `${evidencePath}/root`);
        if (typeof evidence.observedAt !== "string" || !Number.isFinite(Date.parse(evidence.observedAt))) {
          valueIssue(`${evidencePath}/observedAt`, "Evidence time must be a valid date-time.");
        }
        root(evidence.kfdPackageRoot, `${evidencePath}/kfdPackageRoot`);
      });
    }
    row.witnessBindings.forEach((witness, witnessIndex) => {
      const witnessPath = `${rowPath}/witnessBindings/${witnessIndex}`;
      for (const key of ["decisionId", "profileId", "profileManifestPath", "witnessCoordinate"]) nonEmpty(witness[key], `${witnessPath}/${key}`);
      for (const key of ["profileManifestRoot", "witnessRoot", "verifierRoot", "kfdPackageRoot"]) root(witness[key], `${witnessPath}/${key}`);
    });
    for (const key of ["releaseBindingIds", "claims", "gaps"]) stringSet(row[key], `${rowPath}/${key}`);
  });
  manifest.releaseBindings.forEach((binding, index) => {
    const bindingPath = `/releaseBindings/${index}`;
    nonEmpty(binding.id, `${bindingPath}/id`);
    root(binding.kfdPackageRoot, `${bindingPath}/kfdPackageRoot`);
    for (const key of ["artifact", "releasePassport"]) {
      oneOf(binding[key].kind, ["git-commit", "package", "container", "archive", "release", "other"], `${bindingPath}/${key}/kind`);
      nonEmpty(binding[key].coordinate, `${bindingPath}/${key}/coordinate`);
      root(binding[key].root, `${bindingPath}/${key}/root`);
    }
  });
  stringSet(manifest.gaps, "/gaps");
}

export function inspectAdopterManifestShape(manifest) {
  const report = verificationReport();
  verifyManifestShape(report, manifest);
  if (report.issues.length === 0) verifyManifestValues(report, manifest);
  return finish(report, ["/structure"]);
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
  verifyManifestShape(report, manifest);
  if (report.issues.length === 0) verifyManifestValues(report, manifest);
  if (report.issues.length > 0) return finish(report, checks);
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
