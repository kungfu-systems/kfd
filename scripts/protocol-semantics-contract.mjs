// SPDX-License-Identifier: Apache-2.0
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { canonicalJson, exactByteRoot, semanticRoot } from "./self-conformance-contract.mjs";

export const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const CONTRACTS = Object.freeze({
  registry: "kfd.protocol-evidence-pack-registry/v1",
  evidencePack: "kfd.protocol-evidence-pack/v1",
  evidencePackV2: "kfd.protocol-evidence-pack/v2",
  observation: "kfd.protocol-observation/v1",
  route: "kfd.cross-protocol-route/v1",
  capabilityManifest: "kfd.derived-capability-manifest/v1",
  reference: "kfd.protocol-semantics-contract-reference/v1",
});

const ROOT_PATTERN = /^sha256:[0-9a-f]{64}$/u;
const REVISION_PATTERN = /^(?:[0-9a-f]{40}|sha256:[0-9a-f]{64})$/u;
const ID_PATTERN = /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/u;
const VERSION_PATTERN = /^[0-9]+\.[0-9]+\.[0-9]+(?:-[0-9A-Za-z.-]+)?$/u;
const FIXED_COORDINATE_PATTERN = /^\S+@(?:[0-9]+\.[0-9]+\.[0-9]+(?:-[0-9A-Za-z.-]+)?|[0-9a-f]{40}|sha256:[0-9a-f]{64})$/u;
const REPRESENTATION_STATES = new Set(["represented", "extension-required", "out-of-scope", "unresolved"]);
const ROUTE_STATES = new Set(["preserved", "loss-declared", "extension-required", "out-of-scope", "unresolved"]);
const CAPABILITY_STATES = new Set(["declared", "observed", "verified"]);
const MATURITY_STATES = new Set(["stable", "draft", "incubating", "experimental", "implementation", "domain-family"]);
const EVIDENCE_GRADES = new Set(["A", "B", "C"]);
const PAIRED_WORLD_QUESTIONS = Object.freeze(["accepted-completion", "authority-revocation", "causal-history", "recovery-drift", "retry-identity", "work-version"]);
const CLAIM_BOUNDARIES = Object.freeze({
  evidencePack: { evaluationInputOnly: true, certification: false, runtimeAuthority: false, commercialDemand: false },
  observation: { normalizedObservationOnly: true, certification: false, runtimeAuthority: false, policyCorrectness: false },
  route: { informationPreservationOnly: true, certification: false, runtimeAuthority: false, interoperabilityGuarantee: false },
  capabilityManifest: { derivedEvidenceStateOnly: true, certification: false, runtimeAuthority: false, productionFitness: false },
});

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

function issue(report, code, pointer, message) {
  report.issues.push({ code, path: pointer, message });
}

function exactObject(report, value, pointer, required, allowed = required) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    issue(report, "psl-document-invalid", pointer, "Expected a JSON object.");
    return false;
  }
  const allowedFields = new Set(allowed);
  for (const key of Object.keys(value)) {
    if (!allowedFields.has(key)) {
      issue(
        report,
        key === "inferred" ? "psl-inferred-field" : "psl-document-invalid",
        `${pointer}/${key}`,
        key === "inferred" ? "Hidden inferred fields are prohibited." : "Unknown fields fail closed.",
      );
    }
  }
  for (const key of required) {
    if (!Object.hasOwn(value, key)) issue(report, "psl-document-invalid", `${pointer}/${key}`, "Required field is missing.");
  }
  return true;
}

function exactClaimBoundary(report, value, pointer, expected) {
  exactObject(report, value, pointer, Object.keys(expected));
  if (!same(value, expected)) issue(report, "psl-claim-widening", pointer, "The experimental claim boundary cannot be widened.");
}

function root(report, value, pointer) {
  if (!ROOT_PATTERN.test(value ?? "")) issue(report, "psl-root-missing", pointer, "An exact sha256 evidence root is required.");
}

function roots(report, value, pointer, { minimum = 0 } = {}) {
  if (!Array.isArray(value)) {
    issue(report, "psl-root-missing", pointer, "Evidence roots must be an array.");
    return;
  }
  if (value.length < minimum || value.some((entry) => !ROOT_PATTERN.test(entry ?? ""))) {
    issue(report, "psl-root-missing", pointer, `At least ${minimum} exact sha256 evidence root(s) are required.`);
  }
  if (new Set(value).size !== value.length) issue(report, "psl-document-invalid", pointer, "Evidence roots must be unique.");
  const sorted = [...value].sort(compareUtf8);
  if (!same(value, sorted)) issue(report, "psl-order-nondeterministic", pointer, "Evidence roots must use UTF-8 byte order.");
}

function identifier(report, value, pointer) {
  if (!ID_PATTERN.test(value ?? "")) issue(report, "psl-document-invalid", pointer, "Identifier is invalid.");
}

function version(report, value, pointer) {
  if (!VERSION_PATTERN.test(value ?? "")) issue(report, "psl-document-invalid", pointer, "An exact semantic version is required.");
}

function nonEmptyStrings(report, value, pointer, { minimum = 0 } = {}) {
  if (!Array.isArray(value) || value.length < minimum || value.some((entry) => typeof entry !== "string" || !entry.trim())) {
    issue(report, "psl-document-invalid", pointer, `Expected at least ${minimum} non-empty string value(s).`);
    return;
  }
  if (new Set(value).size !== value.length) issue(report, "psl-document-invalid", pointer, "Values must be unique.");
  if (!same(value, [...value].sort(compareUtf8))) issue(report, "psl-order-nondeterministic", pointer, "Values must use UTF-8 byte order.");
}

function protocolReference(report, value, pointer, rootField) {
  exactObject(report, value, pointer, ["protocolId", "protocolVersion", rootField]);
  identifier(report, value?.protocolId, `${pointer}/protocolId`);
  version(report, value?.protocolVersion, `${pointer}/protocolVersion`);
  root(report, value?.[rootField], `${pointer}/${rootField}`);
}

function verifyRegistry(report, document) {
  if (!exactObject(report, document, "/", ["schemaVersion", "contract", "rootAlgorithm", "entries"])) return;
  if (document.rootAlgorithm !== "sha256-kfd-canonical-json-v1") issue(report, "psl-contract-unsupported", "/rootAlgorithm", "Registry root algorithm is unsupported.");
  if (!Array.isArray(document.entries)) {
    issue(report, "psl-document-invalid", "/entries", "Registry entries must be an array.");
    return;
  }
  const ids = new Set();
  for (const [index, entry] of document.entries.entries()) {
    const pointer = `/entries/${index}`;
    if (!exactObject(report, entry, pointer, ["protocolId", "protocolVersion", "packPath", "packRoot"])) continue;
    identifier(report, entry.protocolId, `${pointer}/protocolId`);
    version(report, entry.protocolVersion, `${pointer}/protocolVersion`);
    if (ids.has(entry.protocolId)) issue(report, "psl-protocol-duplicate", `${pointer}/protocolId`, "A registry version may bind each protocol identity exactly once.");
    ids.add(entry.protocolId);
    if (typeof entry.packPath !== "string" || !/^profiles\/protocol-semantics-lab\/packs\/[a-z0-9.-]+\.json$/u.test(entry.packPath) || entry.packPath.includes("latest")) {
      issue(report, "psl-coordinate-mutable", `${pointer}/packPath`, "Pack paths must be fixed repository-relative JSON coordinates without latest aliases.");
    }
    root(report, entry.packRoot, `${pointer}/packRoot`);
  }
  const coordinates = document.entries.map(({ protocolId = "", protocolVersion = "" }) => `${protocolId}\0${protocolVersion}`);
  if (!same(coordinates, [...coordinates].sort(compareUtf8))) issue(report, "psl-order-nondeterministic", "/entries", "Registry entries must use protocol ID and version UTF-8 order.");
}

function verifyRegistryBindings(report, document, rootDirectory) {
  const resolvedRoot = path.resolve(rootDirectory);
  for (const [index, entry] of (document.entries ?? []).entries()) {
    if (typeof entry?.packPath !== "string") continue;
    const pointer = `/entries/${index}`;
    const resolved = path.resolve(resolvedRoot, entry.packPath);
    if (!resolved.startsWith(`${resolvedRoot}${path.sep}`)) {
      issue(report, "psl-pack-unresolved", `${pointer}/packPath`, "Pack path escapes the selected package root.");
      continue;
    }
    let pack;
    try {
      const stat = fs.lstatSync(resolved);
      if (!stat.isFile() || stat.isSymbolicLink()) throw new Error("not a regular non-symlink file");
      pack = JSON.parse(fs.readFileSync(resolved, "utf8"));
    } catch (error) {
      issue(report, "psl-pack-unresolved", `${pointer}/packPath`, `Pack cannot be read as fixed JSON: ${error.message}`);
      continue;
    }
    const verification = verifyProtocolSemanticsDocument(pack);
    if (!verification.valid) {
      issue(report, "psl-pack-binding-mismatch", `${pointer}/packPath`, "Registered pack does not satisfy the Protocol Evidence Pack contract.");
      continue;
    }
    if (pack.protocol?.id !== entry.protocolId || pack.protocol?.version !== entry.protocolVersion || semanticRoot(pack) !== entry.packRoot) {
      issue(report, "psl-pack-binding-mismatch", pointer, "Registry identity, version, and semantic root must match the exact pack bytes.");
    }
  }
}

function verifyEvidencePack(report, document, extended = false) {
  const extendedFields = ["catalogSourceId", "maturity", "responsibility", "nativeSurface", "extensionPoints", "nonClaims", "evidenceGrade", "drift", "sourceBoundary"];
  const required = ["schemaVersion", "contract", "protocol", "source", "semantics", "claimBoundary", ...(extended ? extendedFields : [])];
  if (!exactObject(report, document, "/", required)) return;
  exactObject(report, document.protocol, "/protocol", ["id", "title", "version", "kind"]);
  identifier(report, document.protocol?.id, "/protocol/id");
  version(report, document.protocol?.version, "/protocol/version");
  if (typeof document.protocol?.title !== "string" || !document.protocol.title.trim() || typeof document.protocol?.kind !== "string" || !document.protocol.kind.trim()) {
    issue(report, "psl-document-invalid", "/protocol", "Protocol title and kind must be non-empty strings.");
  }
  exactObject(report, document.source, "/source", ["coordinate", "revision", "contentRoot", "locators"]);
  if (!FIXED_COORDINATE_PATTERN.test(document.source?.coordinate ?? "") || /@latest(?:$|\b)/u.test(document.source?.coordinate ?? "")) {
    issue(report, "psl-coordinate-mutable", "/source/coordinate", "Source coordinates must bind an immutable version, revision, or semantic root.");
  }
  if (!REVISION_PATTERN.test(document.source?.revision ?? "")) issue(report, "psl-coordinate-mutable", "/source/revision", "Source revision must be an exact commit or semantic root.");
  root(report, document.source?.contentRoot, "/source/contentRoot");
  if (!Array.isArray(document.source?.locators) || document.source.locators.length === 0 || document.source.locators.some((entry) => typeof entry !== "string" || !entry.trim())) {
    issue(report, "psl-document-invalid", "/source/locators", "At least one bounded source locator is required.");
  }
  if (!Array.isArray(document.semantics) || document.semantics.length === 0) {
    issue(report, "psl-document-invalid", "/semantics", "At least one semantic declaration is required.");
  } else {
    const ids = new Set();
    for (const [index, semantic] of document.semantics.entries()) {
      const pointer = `/semantics/${index}`;
      if (!exactObject(report, semantic, pointer, ["id", "state", "summary", "evidenceRoots"])) continue;
      identifier(report, semantic.id, `${pointer}/id`);
      if (ids.has(semantic.id)) issue(report, "psl-document-invalid", `${pointer}/id`, "Semantic identities must be unique.");
      ids.add(semantic.id);
      if (!REPRESENTATION_STATES.has(semantic.state)) issue(report, "psl-state-contradictory", `${pointer}/state`, "Representation state is unknown.");
      if (typeof semantic.summary !== "string" || !semantic.summary.trim()) issue(report, "psl-document-invalid", `${pointer}/summary`, "Semantic summary is required.");
      roots(report, semantic.evidenceRoots, `${pointer}/evidenceRoots`, { minimum: semantic.state === "represented" ? 1 : 0 });
    }
  }
  if (extended) {
    const semanticIds = (document.semantics ?? []).map((entry) => entry?.id);
    if (!same(semanticIds, PAIRED_WORLD_QUESTIONS)) issue(report, "psl-semantic-coverage-incomplete", "/semantics", "Evidence Pack v2 must explicitly map the exact six paired-world questions in UTF-8 order.");
    identifier(report, document.catalogSourceId, "/catalogSourceId");
    exactObject(report, document.maturity, "/maturity", ["status", "authority", "asOf"]);
    if (!MATURITY_STATES.has(document.maturity?.status)) issue(report, "psl-maturity-invalid", "/maturity/status", "Protocol maturity status is unsupported.");
    if (typeof document.maturity?.authority !== "string" || !document.maturity.authority.trim()) issue(report, "psl-document-invalid", "/maturity/authority", "Maturity authority is required.");
    if (!/^\d{4}-\d{2}-\d{2}$/u.test(document.maturity?.asOf ?? "")) issue(report, "psl-document-invalid", "/maturity/asOf", "Maturity date must be exact YYYY-MM-DD.");
    exactObject(report, document.responsibility, "/responsibility", ["protocolOwns", "kfdWorkOwns", "outOfScopeIsFailure"]);
    nonEmptyStrings(report, document.responsibility?.protocolOwns, "/responsibility/protocolOwns", { minimum: 1 });
    nonEmptyStrings(report, document.responsibility?.kfdWorkOwns, "/responsibility/kfdWorkOwns", { minimum: 1 });
    if (document.responsibility?.outOfScopeIsFailure !== false) issue(report, "psl-responsibility-collapsed", "/responsibility/outOfScopeIsFailure", "Out-of-scope representation is not protocol failure.");
    exactObject(report, document.nativeSurface, "/nativeSurface", ["objects", "states"]);
    nonEmptyStrings(report, document.nativeSurface?.objects, "/nativeSurface/objects");
    nonEmptyStrings(report, document.nativeSurface?.states, "/nativeSurface/states");
    nonEmptyStrings(report, document.extensionPoints, "/extensionPoints");
    nonEmptyStrings(report, document.nonClaims, "/nonClaims", { minimum: 1 });
    if (!EVIDENCE_GRADES.has(document.evidenceGrade)) issue(report, "psl-document-invalid", "/evidenceGrade", "Evidence grade must be A, B, or C.");
    exactObject(report, document.drift, "/drift", ["frozenAt", "policy", "sourceStatus"]);
    if (!/^\d{4}-\d{2}-\d{2}$/u.test(document.drift?.frozenAt ?? "")) issue(report, "psl-document-invalid", "/drift/frozenAt", "Frozen date must be exact YYYY-MM-DD.");
    if (document.drift?.policy !== "new-pack-version-required") issue(report, "psl-coordinate-mutable", "/drift/policy", "Source drift must require a new pack version.");
    if (document.drift?.sourceStatus !== document.maturity?.status) issue(report, "psl-maturity-invalid", "/drift/sourceStatus", "Drift status must preserve the frozen maturity state.");
    exactObject(report, document.sourceBoundary, "/sourceBoundary", ["mode", "fullSpecificationVendored", "excerptWords"]);
    if (document.sourceBoundary?.mode !== "bounded-paraphrase" || document.sourceBoundary?.fullSpecificationVendored !== false || document.sourceBoundary?.excerptWords !== 0) {
      issue(report, "psl-source-boundary-invalid", "/sourceBoundary", "Catalog packs must use bounded paraphrases without vendored specification text or excerpts.");
    }
  }
  exactClaimBoundary(report, document.claimBoundary, "/claimBoundary", CLAIM_BOUNDARIES.evidencePack);
}

function verifyObservation(report, document) {
  if (!exactObject(report, document, "/", ["schemaVersion", "contract", "id", "protocol", "adapter", "facts", "claimBoundary"])) return;
  identifier(report, document.id, "/id");
  protocolReference(report, document.protocol, "/protocol", "evidencePackRoot");
  exactObject(report, document.adapter, "/adapter", ["id", "version", "artifactRoot"]);
  identifier(report, document.adapter?.id, "/adapter/id");
  version(report, document.adapter?.version, "/adapter/version");
  root(report, document.adapter?.artifactRoot, "/adapter/artifactRoot");
  if (!Array.isArray(document.facts) || document.facts.length === 0) {
    issue(report, "psl-document-invalid", "/facts", "At least one normalized fact is required.");
  } else {
    const ids = new Set();
    for (const [index, fact] of document.facts.entries()) {
      const pointer = `/facts/${index}`;
      if (!exactObject(report, fact, pointer, ["id", "state", "evidenceRoots"], ["id", "state", "evidenceRoots", "value"])) continue;
      identifier(report, fact.id, `${pointer}/id`);
      if (ids.has(fact.id)) issue(report, "psl-document-invalid", `${pointer}/id`, "Fact identities must be unique.");
      ids.add(fact.id);
      if (!REPRESENTATION_STATES.has(fact.state)) issue(report, "psl-state-contradictory", `${pointer}/state`, "Observation state is unknown.");
      const represented = fact.state === "represented";
      if (represented !== Object.hasOwn(fact, "value")) issue(report, "psl-state-contradictory", pointer, "Only represented facts may carry a value, and every represented fact must carry one.");
      roots(report, fact.evidenceRoots, `${pointer}/evidenceRoots`, { minimum: represented ? 1 : 0 });
    }
  }
  exactClaimBoundary(report, document.claimBoundary, "/claimBoundary", CLAIM_BOUNDARIES.observation);
}

function verifyRoute(report, document) {
  if (!exactObject(report, document, "/", ["schemaVersion", "contract", "id", "source", "target", "mappings", "claimBoundary"])) return;
  identifier(report, document.id, "/id");
  protocolReference(report, document.source, "/source", "evidencePackRoot");
  protocolReference(report, document.target, "/target", "evidencePackRoot");
  if (!Array.isArray(document.mappings) || document.mappings.length === 0) {
    issue(report, "psl-document-invalid", "/mappings", "At least one route mapping is required.");
  } else {
    const ids = new Set();
    for (const [index, mapping] of document.mappings.entries()) {
      const pointer = `/mappings/${index}`;
      if (!exactObject(report, mapping, pointer, ["id", "sourceSemanticId", "targetSemanticId", "state", "losses"])) continue;
      identifier(report, mapping.id, `${pointer}/id`);
      identifier(report, mapping.sourceSemanticId, `${pointer}/sourceSemanticId`);
      identifier(report, mapping.targetSemanticId, `${pointer}/targetSemanticId`);
      if (ids.has(mapping.id)) issue(report, "psl-document-invalid", `${pointer}/id`, "Mapping identities must be unique.");
      ids.add(mapping.id);
      if (!ROUTE_STATES.has(mapping.state)) issue(report, "psl-state-contradictory", `${pointer}/state`, "Route state is unknown.");
      if (!Array.isArray(mapping.losses)) {
        issue(report, "psl-document-invalid", `${pointer}/losses`, "Loss declarations must be an array.");
        continue;
      }
      if ((mapping.state === "preserved") !== (mapping.losses.length === 0)) issue(report, "psl-state-contradictory", pointer, "Preserved mappings have no losses; every other state requires an explicit loss declaration.");
      for (const [lossIndex, loss] of mapping.losses.entries()) {
        const lossPointer = `${pointer}/losses/${lossIndex}`;
        if (!exactObject(report, loss, lossPointer, ["id", "kind", "summary", "evidenceRoots"])) continue;
        identifier(report, loss.id, `${lossPointer}/id`);
        identifier(report, loss.kind, `${lossPointer}/kind`);
        if (typeof loss.summary !== "string" || !loss.summary.trim()) issue(report, "psl-document-invalid", `${lossPointer}/summary`, "Loss summary is required.");
        roots(report, loss.evidenceRoots, `${lossPointer}/evidenceRoots`, { minimum: 1 });
      }
    }
  }
  exactClaimBoundary(report, document.claimBoundary, "/claimBoundary", CLAIM_BOUNDARIES.route);
}

function verifyCapabilityManifest(report, document) {
  if (!exactObject(report, document, "/", ["schemaVersion", "contract", "id", "subject", "capabilities", "claimBoundary"])) return;
  identifier(report, document.id, "/id");
  exactObject(report, document.subject, "/subject", ["protocolId", "protocolVersion", "evidencePackRoot", "observationRoot"]);
  identifier(report, document.subject?.protocolId, "/subject/protocolId");
  version(report, document.subject?.protocolVersion, "/subject/protocolVersion");
  root(report, document.subject?.evidencePackRoot, "/subject/evidencePackRoot");
  root(report, document.subject?.observationRoot, "/subject/observationRoot");
  if (!Array.isArray(document.capabilities) || document.capabilities.length === 0) {
    issue(report, "psl-document-invalid", "/capabilities", "At least one capability is required.");
  } else {
    const ids = new Set();
    for (const [index, capability] of document.capabilities.entries()) {
      const pointer = `/capabilities/${index}`;
      if (!exactObject(report, capability, pointer, ["id", "state", "declarationRoots", "observationRoots", "verificationRoots"])) continue;
      identifier(report, capability.id, `${pointer}/id`);
      if (ids.has(capability.id)) issue(report, "psl-document-invalid", `${pointer}/id`, "Capability identities must be unique.");
      ids.add(capability.id);
      if (!CAPABILITY_STATES.has(capability.state)) issue(report, "psl-state-contradictory", `${pointer}/state`, "Capability provenance state is unknown.");
      roots(report, capability.declarationRoots, `${pointer}/declarationRoots`, { minimum: 1 });
      roots(report, capability.observationRoots, `${pointer}/observationRoots`, { minimum: capability.state === "observed" || capability.state === "verified" ? 1 : 0 });
      roots(report, capability.verificationRoots, `${pointer}/verificationRoots`, { minimum: capability.state === "verified" ? 1 : 0 });
      if (capability.state === "declared" && (capability.observationRoots?.length || capability.verificationRoots?.length)) issue(report, "psl-state-contradictory", pointer, "Declared capabilities cannot carry observed or verified provenance.");
      if (capability.state === "observed" && capability.verificationRoots?.length) issue(report, "psl-state-contradictory", pointer, "Observed capabilities cannot carry verification provenance.");
      if (capability.state === "verified" && (!capability.declarationRoots?.length || !capability.observationRoots?.length || !capability.verificationRoots?.length)) issue(report, "psl-evidence-insufficient", pointer, "Verified capabilities require declared, observed, and independently verified evidence roots.");
    }
  }
  exactClaimBoundary(report, document.claimBoundary, "/claimBoundary", CLAIM_BOUNDARIES.capabilityManifest);
}

function newReport(contract) {
  return { schemaVersion: 1, contract: "kfd.protocol-semantics-validation-report/v1", documentContract: contract ?? null, valid: true, qualifying: false, certification: false, issues: [] };
}

function finish(report, document) {
  report.issues.sort((left, right) => compareUtf8(`${left.code}\0${left.path}\0${left.message}`, `${right.code}\0${right.path}\0${right.message}`));
  report.valid = report.issues.length === 0;
  try {
    report.documentRoot = semanticRoot(document);
  } catch {
    report.documentRoot = null;
  }
  report.reportRoot = semanticRoot({ ...report });
  return report;
}

export function verifyProtocolSemanticsDocument(document, options = {}) {
  const report = newReport(document?.contract);
  if (!document || typeof document !== "object" || Array.isArray(document)) {
    issue(report, "psl-document-invalid", "/", "Expected a JSON object.");
    return finish(report, document);
  }
  if (document.schemaVersion !== 1) issue(report, "psl-contract-unsupported", "/schemaVersion", "Only schema version 1 is supported.");
  const verifier = {
    [CONTRACTS.registry]: verifyRegistry,
    [CONTRACTS.evidencePack]: (targetReport, targetDocument) => verifyEvidencePack(targetReport, targetDocument, false),
    [CONTRACTS.evidencePackV2]: (targetReport, targetDocument) => verifyEvidencePack(targetReport, targetDocument, true),
    [CONTRACTS.observation]: verifyObservation,
    [CONTRACTS.route]: verifyRoute,
    [CONTRACTS.capabilityManifest]: verifyCapabilityManifest,
  }[document.contract];
  if (!verifier) issue(report, "psl-contract-unsupported", "/contract", "Protocol Semantics Lab contract is unsupported.");
  else {
    verifier(report, document);
    if (document.contract === CONTRACTS.registry && options.rootDirectory) verifyRegistryBindings(report, document, options.rootDirectory);
  }
  return finish(report, document);
}

export function buildContractReference(rootDirectory = packageRoot) {
  const manifestPath = path.join(rootDirectory, "profiles", "protocol-semantics-lab", "manifest.json");
  const registryPath = path.join(rootDirectory, "profiles", "protocol-semantics-lab", "registry.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
  const contracts = manifest.contracts.map((entry) => {
    const bytes = fs.readFileSync(path.join(rootDirectory, entry.schema));
    return { id: entry.id, schema: entry.schema, export: entry.export, byteDigest: exactByteRoot(bytes) };
  }).sort((left, right) => compareUtf8(left.id, right.id));
  const reference = {
    schemaVersion: 1,
    contract: CONTRACTS.reference,
    profile: structuredClone(manifest.profile),
    kernel: structuredClone(manifest.kernel),
    registry: { path: "profiles/protocol-semantics-lab/registry.json", root: semanticRoot(registry) },
    contracts,
    claimBoundary: structuredClone(manifest.claimBoundary),
  };
  return { ...reference, referenceRoot: semanticRoot(reference) };
}

export { canonicalJson, exactByteRoot, semanticRoot };
