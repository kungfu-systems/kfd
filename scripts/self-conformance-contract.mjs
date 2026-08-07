// SPDX-License-Identifier: Apache-2.0
import crypto from "node:crypto";

export const PROFILE = "kfd-self-conformance@1.0.0-alpha.1";
export const ROOT_PATTERN = /^sha256:[0-9a-f]{64}$/;

function compareUtf8(left, right) {
  return Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
}

export function canonicalJson(value) {
  if (value === null || typeof value === "boolean") return JSON.stringify(value);
  if (typeof value === "string") {
    if (value !== value.normalize("NFC")) throw new Error("non-NFC string");
    return JSON.stringify(value);
  }
  if (typeof value === "number") {
    if (!Number.isSafeInteger(value) || value < 0) throw new Error("unsupported number");
    return String(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (typeof value === "object") {
    const keys = Object.keys(value).sort(compareUtf8);
    return `{${keys.map((key) => {
      if (key !== key.normalize("NFC")) throw new Error("non-NFC key");
      return `${JSON.stringify(key)}:${canonicalJson(value[key])}`;
    }).join(",")}}`;
  }
  throw new Error(`unsupported JSON value: ${typeof value}`);
}

export function semanticRoot(value) {
  return `sha256:${crypto.createHash("sha256").update(`${canonicalJson(value)}\n`).digest("hex")}`;
}

export function exactByteRoot(bytes) {
  return `sha256:${crypto.createHash("sha256").update(bytes).digest("hex")}`;
}

function decodePointerToken(value) {
  return value.replaceAll("~1", "/").replaceAll("~0", "~");
}

export function applyOperations(input, operations) {
  const result = structuredClone(input);
  for (const operation of operations) {
    const parts = operation.path.split("/").slice(1).map(decodePointerToken);
    if (parts.length === 0) throw new Error("root patch operations are unsupported");
    let parent = result;
    for (const part of parts.slice(0, -1)) {
      if (parent === null || typeof parent !== "object" || !(part in parent)) {
        throw new Error(`patch path is missing: ${operation.path}`);
      }
      parent = parent[part];
    }
    const key = parts.at(-1);
    if (operation.op === "remove") {
      if (!(key in parent)) throw new Error(`patch path is missing: ${operation.path}`);
      delete parent[key];
    } else if (operation.op === "add" || operation.op === "replace") {
      if (operation.op === "replace" && !(key in parent)) {
        throw new Error(`patch path is missing: ${operation.path}`);
      }
      parent[key] = structuredClone(operation.value);
    } else {
      throw new Error(`unsupported patch operation: ${operation.op}`);
    }
  }
  return result;
}

const TRANSITIONS = {
  "candidate-genesis": { from: ["absent"], to: "candidate" },
  "candidate-qualification": { from: ["candidate", "revised", "provisional"], to: "qualified" },
  "numbered-draft-promotion": { from: ["qualified"], to: "numbered-draft" },
  activation: { from: ["numbered-draft"], to: "active" },
  supersession: { from: ["active"], to: "superseded" },
  "foundation-revision": { from: ["numbered-draft", "active"], to: "foundation-revised" },
  "release-packaging": { from: null, to: null },
  "revision-required": { from: ["candidate", "qualified"], to: "revised" },
  rejection: { from: ["candidate", "qualified", "revised", "provisional"], to: "rejected" },
  "provisional-retention": { from: ["candidate", "qualified", "revised", "provisional"], to: "provisional" },
  "no-new-kfd": { from: ["absent", "candidate", "qualified", "revised", "provisional"], to: "no-new-kfd" },
};

function failure(code, path, message) {
  return { valid: false, code, issues: [{ code, path, message }] };
}

export function inspectTransitionBundle(bundle, options) {
  if (Object.hasOwn(bundle, "reportRoot")) {
    return failure("scp-self-containing-report", "/reportRoot", "Current report roots are excluded from the bundle preimage.");
  }
  if (Object.hasOwn(bundle, "packageRoot")) {
    return failure("scp-self-containing-package", "/packageRoot", "Current package roots are excluded from the bundle preimage.");
  }
  if (bundle.contract !== "kfd.self-conformance-transition-bundle/v1") {
    return failure("scp-contract-invalid", "/contract", "Unsupported transition bundle contract.");
  }
  if (bundle.profile !== PROFILE) {
    return failure("scp-profile-version-unsupported", "/profile", "Unsupported Self-Conformance Profile version.");
  }
  const transition = TRANSITIONS[bundle.transition];
  if (!transition) {
    return failure("scp-transition-unsupported", "/transition", "Unknown transition fails closed.");
  }
  if (!Array.isArray(bundle.evidenceRoots) || bundle.evidenceRoots.length === 0) {
    return failure("scp-evidence-roots-missing", "/evidenceRoots", "At least one evidence root is required.");
  }
  if (!bundle.previousState || bundle.previousStateRoot !== semanticRoot(bundle.previousState)) {
    return failure("scp-predecessor-root-mismatch", "/previousStateRoot", "Previous state root does not recompute.");
  }
  if (!bundle.proposedState || bundle.proposedStateRoot !== semanticRoot(bundle.proposedState)) {
    return failure("scp-proposed-root-mismatch", "/proposedStateRoot", "Proposed state root does not recompute.");
  }
  if (bundle.schemaSetRoot !== options.schemaSetRoot) {
    return failure("scp-schema-set-root-mismatch", "/schemaSetRoot", "Schema-set root does not match the selected package.");
  }
  if (!ROOT_PATTERN.test(bundle.verifierRoot ?? "")) {
    return failure("scp-verifier-root-missing", "/verifierRoot", "An exact verifier root is required.");
  }
  if (!ROOT_PATTERN.test(bundle.authorityReceiptRoot ?? "")) {
    return failure("scp-authority-receipt-missing", "/authorityReceiptRoot", "An authority receipt root is required.");
  }
  if (!ROOT_PATTERN.test(bundle.reviewReceiptRoot ?? "")) {
    return failure("scp-review-receipt-missing", "/reviewReceiptRoot", "An independent-review receipt root is required.");
  }
  if (typeof bundle.claimBoundary !== "string" || bundle.claimBoundary.trim() === "") {
    return failure("scp-claim-boundary-missing", "/claimBoundary", "An explicit claim boundary is required.");
  }
  if (/proves? semantic truth|certifies?|is certified|release is authori[sz]ed|human approval is proven|proves? adoption/i.test(bundle.claimBoundary)) {
    return failure("scp-claim-overreach", "/claimBoundary", "Structural verification cannot claim semantic or governance authority.");
  }
  if (!Array.isArray(bundle.knownGaps)) {
    return failure("scp-known-gaps-missing", "/knownGaps", "Known gaps must be explicit, including an empty array.");
  }
  if (!Array.isArray(bundle.immutableCoordinates) || bundle.immutableCoordinates.length === 0) {
    return failure("scp-immutable-coordinate-missing", "/immutableCoordinates", "At least one immutable coordinate is required.");
  }
  if (bundle.predecessor?.kind === "bootstrap") {
    const anchorRoot = semanticRoot(options.bootstrapAnchor);
    if (
      bundle.transition !== "candidate-genesis" ||
      bundle.predecessor.bootstrapAnchorRoot !== anchorRoot ||
      bundle.predecessor.reportRoot !== null ||
      bundle.predecessor.packageRoot !== options.bootstrapAnchor.packageRoot ||
      bundle.previousStateRoot !== options.bootstrapAnchor.stateRoot
    ) {
      return failure("scp-bootstrap-anchor-invalid", "/predecessor", "Bootstrap predecessor does not match the reviewed anchor.");
    }
  } else if (
    bundle.predecessor?.kind !== "report" ||
    !ROOT_PATTERN.test(bundle.predecessor.reportRoot ?? "") ||
    !ROOT_PATTERN.test(bundle.predecessor.packageRoot ?? "") ||
    bundle.predecessor.bootstrapAnchorRoot !== null
  ) {
    return failure("scp-predecessor-root-mismatch", "/predecessor", "Report predecessor roots are incomplete.");
  }

  const previous = bundle.previousState;
  const proposed = bundle.proposedState;
  const sameSubject = canonicalJson(previous.subject) === canonicalJson(proposed.subject);
  let stateValid = sameSubject;
  if (bundle.transition === "release-packaging") {
    stateValid &&= previous.semanticState === proposed.semanticState;
    stateValid &&= previous.publicationState === "unpublished" && proposed.publicationState === "packaged";
  } else {
    stateValid &&= transition.from.includes(previous.semanticState) && proposed.semanticState === transition.to;
    stateValid &&= previous.publicationState === proposed.publicationState;
  }
  if (!stateValid) {
    return failure("scp-transition-state-invalid", "/proposedState", "The proposed state is not allowed for this transition.");
  }
  if (bundle.expectedResult !== "pass") {
    return failure("scp-expected-result-mismatch", "/expectedResult", "A structurally valid fixed bundle must expect pass.");
  }
  return { valid: true, code: null, issues: [] };
}
