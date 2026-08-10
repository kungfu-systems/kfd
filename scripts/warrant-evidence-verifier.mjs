// SPDX-License-Identifier: Apache-2.0
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rootPattern = /^sha256:[a-f0-9]{64}$/u;
const shaPattern = /^[a-f0-9]{40}$/u;
const statuses = new Set(["proved", "partial", "missing", "invalidated"]);
const evidenceClasses = new Set(["generic-candidate", "profile-specific", "counterexample", "no-new-primitive", "unresolved"]);
const reviewStates = new Set(["self-reviewed", "independent-reviewed", "revision-required"]);
const evidenceProfile = "kfd-warrant-evidence@0.2.0-alpha.1";
const warrantProfile = "kfd-10-warrant@0.2.0-alpha.1";

function issue(code, pathValue, message) {
  return { code, path: pathValue, message };
}

function report(profile, issues) {
  return {
    schemaVersion: 1,
    contract: "kfd.warrant-evidence-verification/v1",
    profile,
    valid: issues.length === 0,
    qualifying: false,
    selfCertified: false,
    offline: true,
    code: issues[0]?.code ?? "valid",
    issues,
  };
}

function readRegistry() {
  return JSON.parse(
    fs.readFileSync(
      path.join(packageRoot, "evidence", "primitive-evidence", "registry.json"),
      "utf8",
    ),
  );
}

function exactSource(left, right) {
  return ["repository", "commit", "tree", "path", "contentRoot", "public", "retained"]
    .every((field) => left?.[field] === right?.[field]);
}

function validSource(source) {
  return typeof source?.repository === "string" &&
    /^https:\/\/github\.com\/[^/]+\/[^/]+$/u.test(source.repository) &&
    shaPattern.test(source.commit ?? "") &&
    shaPattern.test(source.tree ?? "") &&
    typeof source.path === "string" &&
    source.path.length > 0 &&
    !source.path.startsWith("/") &&
    !source.path.split("/").includes("..") &&
    rootPattern.test(source.contentRoot ?? "") &&
    source.public === true &&
    source.retained === true;
}

function validClaims(claims) {
  return Array.isArray(claims) && claims.length > 0 && claims.every((claim) =>
    typeof claim?.id === "string" && claim.id.length > 0 &&
    statuses.has(claim.status) &&
    typeof claim.basis === "string" && claim.basis.length > 0);
}

export function verifyPrimitiveEvidenceBundle(bundle, options = {}) {
  const issues = [];
  const registry = options.registry ?? readRegistry();
  if (bundle?.$schema !== "https://kfd.libkungfu.dev/schemas/kfd-evidence/primitive-evidence-bundle.schema.json" ||
      bundle?.schemaVersion !== 1 ||
      bundle?.contract !== "kfd.primitive-evidence-bundle/v1" ||
      bundle?.primitive !== "Warrant") {
    issues.push(issue("bundle-contract-invalid", "", "unsupported Primitive Evidence Bundle contract"));
    return report(evidenceProfile, issues);
  }
  const entry = registry.entries?.find(({ id }) => id === bundle.bundleId);
  if (!entry || entry.primitive !== bundle.primitive || entry.upstreamContract !== bundle.observation?.upstreamContract) {
    issues.push(issue("bundle-source-unregistered", "/bundleId", "bundle is not bound to a registered primitive source"));
  } else if (!exactSource(bundle.source, entry.source)) {
    issues.push(issue("bundle-source-coordinate-invalid", "/source", "bundle source does not match the retained registry coordinate"));
  }
  if (!validSource(bundle.source)) {
    issues.push(issue("bundle-source-coordinate-invalid", "/source", "source must be one retained public exact Git coordinate"));
  }
  if (typeof bundle.pressureField !== "string" || bundle.pressureField.length === 0 ||
      bundle.mapping?.decision !== "KFD-10" || bundle.mapping?.primitive !== "Warrant" ||
      !nonEmptyStrings(bundle.mapping?.kfdClauses) ||
      !evidenceClasses.has(bundle.evidenceClass) ||
      !nonEmptyStrings(bundle.candidateInvariants) ||
      !nonEmptyStrings(bundle.reusableTestRoots) ||
      !bundle.reusableTestRoots.every((root) => rootPattern.test(root)) ||
      typeof bundle.failureOrCounterexample !== "string" || bundle.failureOrCounterexample.length === 0 ||
      !reviewStates.has(bundle.review?.state) ||
      !["same-steward", "independent"].includes(bundle.review?.reviewerClass) ||
      !nonEmptyStrings(bundle.review?.evidenceRoots) ||
      !bundle.review.evidenceRoots.every((root) => rootPattern.test(root)) ||
      bundle.lineage?.sourceEntryId !== bundle.bundleId ||
      !Array.isArray(bundle.lineage?.predecessorBundleIds)) {
    issues.push(issue("bundle-claim-boundary-invalid", "", "pressure field, KFD mapping, evidence class, invariants, review, reusable roots, and lineage are required"));
  }
  if (!statuses.has(bundle.assessment?.verdict) ||
      !validClaims(bundle.assessment?.genericClaims) ||
      !validClaims(bundle.assessment?.profileSpecificClaims)) {
    issues.push(issue("bundle-claim-boundary-invalid", "/assessment", "generic and profile-specific claims must remain explicit and evidence-graded"));
  }
  if (bundle.assessment?.promotion?.allowed !== false ||
      typeof bundle.assessment?.promotion?.reason !== "string" ||
      bundle.assessment.promotion.reason.length === 0 ||
      bundle.qualifying !== false ||
      bundle.selfCertified !== false) {
    issues.push(issue("bundle-self-promotion", "/assessment/promotion", "evidence cannot promote, qualify, or self-certify a primitive"));
  }
  return report(evidenceProfile, issues);
}

function nonEmptyStrings(value) {
  return Array.isArray(value) && value.length > 0 && value.every((entry) => typeof entry === "string" && entry.length > 0);
}

function sameSet(left, right) {
  return Array.isArray(left) && Array.isArray(right) &&
    left.length === right.length &&
    left.every((entry) => right.includes(entry));
}

function witnessFailure(code, pathValue, message) {
  return report(warrantProfile, [issue(code, pathValue, message)]);
}

export function verifyWarrantConformanceWitness(value) {
  if (value?.$schema !== "https://kfd.libkungfu.dev/schemas/kfd-10/conformance-witness.schema.json" ||
      value?.schemaVersion !== 2 ||
      value?.contract !== "kfd.warrant-conformance-witness/v2" ||
      value?.profile !== warrantProfile ||
      value?.qualifying !== false || value?.selfCertified !== false ||
      !rootPattern.test(value?.warrant?.root ?? "")) {
    return witnessFailure("warrant-contract-invalid", "", "unsupported or scope-widened Warrant witness");
  }
  const warrant = value.warrant;
  const observation = value.observation ?? {};
  const purpose = warrant.purpose ?? {};
  const authority = warrant.authority ?? {};
  const lease = warrant.lease ?? {};
  if (typeof purpose.statement !== "string" || purpose.statement.length === 0 ||
      purpose.action !== observation.action || purpose.subject !== observation.subject ||
      purpose.resource !== observation.resource || typeof purpose.targetState !== "string" ||
      purpose.targetState.length === 0 || !nonEmptyStrings(purpose.nonClaims)) {
    return witnessFailure("warrant-purpose-mismatch", "/warrant/purpose", "purpose must bind the observed action boundary without importing product privilege");
  }
  if (typeof authority.issuer !== "string" || authority.issuer.length === 0) {
    return witnessFailure("warrant-missing-issuer", "/warrant/authority/issuer", "issuer is independently required");
  }
  if (typeof authority.holder !== "string" || authority.holder.length === 0) {
    return witnessFailure("warrant-missing-holder", "/warrant/authority/holder", "holder is independently required");
  }
  if (observation.holder !== authority.holder) {
    return witnessFailure("warrant-stale-holder", "/observation/holder", "the presenting holder must match the exact current authority holder");
  }
  if (!nonEmptyStrings(authority.scope?.actions) ||
      !nonEmptyStrings(authority.scope?.subjects) ||
      !nonEmptyStrings(authority.scope?.resources) ||
      !authority.scope.actions.includes(observation.action) ||
      !authority.scope.subjects.includes(observation.subject) ||
      !authority.scope.resources.includes(observation.resource)) {
    return witnessFailure("warrant-scope-mismatch", "/observation", "observed action, subject, and resource must remain inside the Warrant scope");
  }
  if (!nonEmptyStrings(authority.targetRoots) || !authority.targetRoots.every((root) => rootPattern.test(root))) {
    return witnessFailure("warrant-target-roots-missing", "/warrant/authority/targetRoots", "one or more exact target roots are required");
  }
  const observedAt = Date.parse(observation.at ?? "");
  const notBefore = Date.parse(lease.notBefore ?? "");
  const expiresAt = Date.parse(lease.expiresAt ?? "");
  if (!Number.isFinite(observedAt) || !Number.isFinite(notBefore) || !Number.isFinite(expiresAt) || observedAt < notBefore || observedAt >= expiresAt) {
    return witnessFailure("warrant-expired", "/warrant/lease", "Warrant use must be inside its explicit lease window");
  }
  if (warrant.revocation?.state === "revoked" || warrant.revocation?.revokedAt) {
    return witnessFailure("warrant-revoked", "/warrant/revocation", "revoked authority fails closed");
  }
  if (warrant.authorization?.reuseAttempted === true) {
    return witnessFailure("warrant-consumed", "/warrant/authorization/reuseAttempted", "settled authority cannot authorize another occurrence");
  }
  if (lease.nonPreemptive !== true) {
    return witnessFailure("warrant-preemption-allowed", "/warrant/lease/nonPreemptive", "one current lease generation must not be silently preempted");
  }
  if (!sameSet(authority.targetRoots, observation.targetRoots)) {
    return witnessFailure("warrant-root-substitution", "/observation/targetRoots", "observed target roots do not match the authorized cut");
  }
  if (observation.generation !== lease.generation) {
    return witnessFailure("warrant-stale-generation", "/observation/generation", "the presenting lease generation is stale");
  }
  if (observation.fencingToken !== lease.fencingToken) {
    return witnessFailure("warrant-stale-fence", "/observation/fencingToken", "the presenting fencing token is stale");
  }
  const continuationAt = Date.parse(warrant.continuation?.heartbeatAt ?? "");
  if (warrant.continuation?.state !== "continued" ||
      warrant.continuation?.expectedGeneration !== lease.generation ||
      warrant.continuation?.expectedFencingToken !== lease.fencingToken ||
      !rootPattern.test(warrant.continuation?.receiptRoot ?? "") ||
      !Number.isFinite(continuationAt) || continuationAt < notBefore || continuationAt > observedAt) {
    return witnessFailure("warrant-continuation-stale", "/warrant/continuation", "continuation must bind the same live generation and fence before use");
  }
  if (warrant.recovery?.performed !== true ||
      !Number.isInteger(warrant.recovery?.expiredGeneration) ||
      warrant.recovery.expiredGeneration >= lease.generation ||
      warrant.recovery?.successorGeneration !== lease.generation ||
      warrant.recovery?.successorFencingToken !== lease.fencingToken ||
      warrant.recovery?.rejectedFencingToken === lease.fencingToken ||
      !rootPattern.test(warrant.recovery?.expectedOldRoot ?? "") ||
      !rootPattern.test(warrant.recovery?.receiptRoot ?? "")) {
    return witnessFailure("warrant-recovery-stale", "/warrant/recovery", "recovery must reject the expired holder and mint the exact successor generation and fence");
  }
  const parentCeiling = authority.derivation?.parentConsequenceCeiling;
  const childCeiling = authority.scope?.consequenceCeiling;
  if (authority.derivation?.parentRoot &&
      (!authority.derivation.attenuated ||
       !Number.isInteger(parentCeiling) || !Number.isInteger(childCeiling) ||
       childCeiling > parentCeiling) &&
      !rootPattern.test(authority.derivation?.independentAuthorityRoot ?? "")) {
    return witnessFailure("warrant-authority-amplification", "/warrant/authority/derivation", "derived authority must attenuate its parent or bind a new independent source");
  }
  if (authority.delegation?.delegated === true &&
      (typeof authority.delegation.from !== "string" || authority.delegation.from.length === 0 ||
       !Array.isArray(authority.delegation.chainRoots) || authority.delegation.chainRoots.length === 0 ||
       !authority.delegation.chainRoots.every((root) => rootPattern.test(root)))) {
    return witnessFailure("warrant-delegation-chain-missing", "/warrant/authority/delegation", "delegation must preserve its source holder and rooted chain");
  }
  if (!nonEmptyStrings(authority.residualResponsibility)) {
    return witnessFailure("warrant-residual-responsibility-missing", "/warrant/authority/residualResponsibility", "delegation cannot silently erase residual responsibility");
  }
  if (warrant.authorization?.occurrenceUsedAsAuthority !== false ||
      typeof warrant.authorization?.authorized !== "boolean" ||
      typeof warrant.authorization?.occurred !== "boolean" ||
      warrant.authorization.authorized !== true || warrant.authorization.occurred !== true) {
    return witnessFailure("warrant-authorization-occurrence-conflated", "/warrant/authorization", "authorization and occurrence must remain independent facts");
  }
  const settlementAt = Date.parse(warrant.settlement?.at ?? "");
  if (warrant.settlement?.duplicate === true) {
    return witnessFailure("warrant-duplicate-settlement", "/warrant/settlement/duplicate", "duplicate settlement is a rooted no-op, not authority to apply another transition");
  }
  if (warrant.settlement?.state !== "applied" ||
      !Number.isFinite(settlementAt) || settlementAt < observedAt ||
      !rootPattern.test(warrant.settlement?.evidenceRoot ?? "") ||
      !rootPattern.test(warrant.settlement?.expectedOldRoot ?? "") ||
      !rootPattern.test(warrant.settlement?.nextStateRoot ?? "") ||
      !rootPattern.test(warrant.settlement?.receiptRoot ?? "") ||
      warrant.settlement.expectedOldRoot === warrant.settlement.nextStateRoot) {
    return witnessFailure("warrant-settlement-root-drift", "/warrant/settlement", "an applied settlement must bind evidence and a distinct exact old and successor state root");
  }
  if (warrant.history?.rewritten === true) {
    return witnessFailure("warrant-history-rewritten", "/warrant/history/rewritten", "later lifecycle evidence cannot rewrite retained Warrant history");
  }
  const events = warrant.history?.events;
  if (!rootPattern.test(warrant.history?.priorRoot ?? "") ||
      !rootPattern.test(warrant.history?.currentRoot ?? "") ||
      warrant.history.priorRoot === warrant.history.currentRoot ||
      !Array.isArray(events) || events.length < 6 ||
      !events.every((event) => typeof event?.event === "string" && rootPattern.test(event?.root ?? "") &&
        Number.isInteger(event?.generation) && Number.isFinite(Date.parse(event?.at ?? ""))) ||
      !["issued", "expired", "recovered", "continued", "occurred", "settled"].every((kind) =>
        events.some(({ event }) => event === kind))) {
    return witnessFailure("warrant-history-missing", "/warrant/history", "authority history must retain issuance, expiry, recovery, continuation, occurrence, and settlement");
  }
  return {
    ...report(warrantProfile, []),
    code: "warrant-valid",
  };
}

export function applyVectorPatch(base, patch) {
  const value = structuredClone(base);
  for (const [pointer, replacement] of Object.entries(patch ?? {})) {
    const parts = pointer.split(".");
    let cursor = value;
    for (const part of parts.slice(0, -1)) {
      if (!cursor || typeof cursor !== "object" || !(part in cursor)) {
        throw new Error(`vector patch path is unavailable: ${pointer}`);
      }
      cursor = cursor[part];
    }
    const field = parts.at(-1);
    if (replacement === null) delete cursor[field];
    else cursor[field] = structuredClone(replacement);
  }
  return value;
}

function parseCli(args) {
  let json = false;
  let input;
  for (const argument of args) {
    if (argument === "--json") json = true;
    else if (!input) input = argument;
    else throw new Error(`unsupported argument: ${argument}`);
  }
  if (!input) throw new Error("missing JSON input path");
  return { input, json };
}

export function runPrimitiveEvidenceVerifier(args) {
  const { input } = parseCli(args);
  const result = verifyPrimitiveEvidenceBundle(JSON.parse(fs.readFileSync(input, "utf8")));
  console.log(JSON.stringify(result));
  return result.valid ? 0 : 1;
}

export function runWarrantWitnessVerifier(args) {
  const { input } = parseCli(args);
  const result = verifyWarrantConformanceWitness(JSON.parse(fs.readFileSync(input, "utf8")));
  console.log(JSON.stringify(result));
  return result.valid ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [kind, ...args] = process.argv.slice(2);
  try {
    if (kind === "bundle") process.exitCode = runPrimitiveEvidenceVerifier(args);
    else if (kind === "witness") process.exitCode = runWarrantWitnessVerifier(args);
    else throw new Error("kind must be bundle or witness");
  } catch (error) {
    console.error(`warrant-evidence-verifier: ${error.message}`);
    process.exitCode = 2;
  }
}
