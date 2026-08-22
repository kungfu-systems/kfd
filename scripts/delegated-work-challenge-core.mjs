// SPDX-License-Identifier: Apache-2.0
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { canonicalJson, exactByteRoot, semanticRoot } from "./self-conformance-contract.mjs";
import { regularBytes } from "./jsonl-adapter-runner.mjs";

export const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const PROFILE_PATH = "profiles/delegated-work-challenge/manifest.json";
export const REPORT_CONTRACT = "kfd.delegated-work-challenge-report/v1";
export const PROJECTION_CONTRACT = "kfd.delegated-work-projection/v1";
export const REQUEST_CONTRACT = "kfd.delegated-work-adapter-request/v1";
export const RESPONSE_CONTRACT = "kfd.delegated-work-adapter-response/v1";
export const PAIR_IDS = [
  "work-version",
  "authority-revocation",
  "causal-history",
  "retry-identity",
  "recovery-drift",
  "accepted-completion",
];

const compareUtf8 = (left, right) => Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const nonempty = (value) => typeof value === "string" && value.trim() !== "";

export function resource(relativePath) {
  const absolute = path.join(packageRoot, relativePath);
  return { absolute, bytes: regularBytes(absolute) };
}

export function jsonResource(relativePath) {
  const entry = resource(relativePath);
  return { ...entry, value: JSON.parse(entry.bytes.toString("utf8")) };
}

function exactKeys(value, admitted, label) {
  if (!isObject(value)) throw new Error(`${label} must be an object`);
  const unknown = Object.keys(value).filter((key) => !admitted.includes(key));
  if (unknown.length > 0) throw new Error(`${label} has unknown field: ${unknown[0]}`);
}

function collectLeafPaths(value, prefix = "", result = []) {
  if (!isObject(value)) {
    result.push(prefix);
    return result;
  }
  for (const key of Object.keys(value)) {
    collectLeafPaths(value[key], prefix ? `${prefix}.${key}` : key, result);
  }
  return result;
}

export function loadChallenge() {
  const manifestEntry = jsonResource(PROFILE_PATH);
  const manifest = manifestEntry.value;
  if (manifest?.contract !== "kfd.delegated-work-challenge-manifest/v1" || manifest?.schemaVersion !== 1) {
    throw new Error("delegated-work challenge manifest contract is invalid");
  }
  if (!Array.isArray(manifest.surfaces) || manifest.surfaces.length < 12) throw new Error("delegated-work challenge manifest surface closure is incomplete");
  const surfacePaths = manifest.surfaces.map(({ path: surfacePath }) => surfacePath);
  if (new Set(surfacePaths).size !== surfacePaths.length) throw new Error("delegated-work challenge manifest repeats a surface");
  for (const surface of manifest.surfaces) {
    if (!nonempty(surface.path) || !nonempty(surface.role) || surface.digest !== exactByteRoot(resource(surface.path).bytes)) {
      throw new Error(`delegated-work challenge surface drifted: ${surface.path ?? "unknown"}`);
    }
  }
  const suiteEntry = jsonResource(manifest.suite.path);
  validateSuite(suiteEntry.value, manifest);
  return {
    manifest,
    manifestBytes: manifestEntry.bytes,
    suite: suiteEntry.value,
    suiteBytes: suiteEntry.bytes,
  };
}

export function validateSuite(suite, manifest) {
  exactKeys(suite, ["schemaVersion", "contract", "id", "version", "pairs"], "suite");
  if (suite.schemaVersion !== 1 || suite.contract !== "kfd.delegated-work-paired-world-suite/v1") throw new Error("fixed suite contract is invalid");
  if (suite.id !== manifest.suite.id || suite.version !== manifest.suite.version) throw new Error("fixed suite coordinate drifted");
  if (!Array.isArray(suite.pairs) || suite.pairs.length !== manifest.suite.fixedPairCount) throw new Error("fixed suite pair count drifted");
  const ids = suite.pairs.map(({ id }) => id);
  if (canonicalJson(ids) !== canonicalJson(PAIR_IDS) || new Set(ids).size !== ids.length) throw new Error("fixed suite pair identity or order drifted");
  const allowed = new Set(manifest.projection.allowlistedPaths);
  const prohibited = new Set(manifest.projection.prohibitedNames);
  for (const pair of suite.pairs) {
    exactKeys(pair, ["id", "question", "sameSurface", "whyUnsafe", "whyNotLive", "discriminatingFields", "worlds", "required"], `pair ${pair.id}`);
    if (!nonempty(pair.question) || !nonempty(pair.sameSurface) || !nonempty(pair.whyUnsafe) || !nonempty(pair.whyNotLive)) throw new Error(`${pair.id} explanatory text is incomplete`);
    if (!Array.isArray(pair.discriminatingFields) || pair.discriminatingFields.length === 0 || pair.discriminatingFields.some((field) => !allowed.has(field))) throw new Error(`${pair.id} discriminator is not allowlisted`);
    exactKeys(pair.worlds, ["A", "B"], `${pair.id} worlds`);
    exactKeys(pair.required, ["A", "B"], `${pair.id} required outcomes`);
    for (const world of ["A", "B"]) {
      exactKeys(pair.worlds[world], ["state"], `${pair.id} World ${world}`);
      if (!isObject(pair.worlds[world].state)) throw new Error(`${pair.id} World ${world} state is invalid`);
      for (const field of collectLeafPaths(pair.worlds[world].state)) {
        const segments = field.split(".");
        if (!allowed.has(field)) throw new Error(`${pair.id} World ${world} uses unknown state field ${field}`);
        if (segments.some((segment) => prohibited.has(segment))) throw new Error(`${pair.id} World ${world} leaks prohibited field ${field}`);
      }
      const required = pair.required[world];
      exactKeys(required, ["mayAdvance", "dispositions"], `${pair.id} World ${world} required outcome`);
      if (typeof required.mayAdvance !== "boolean" || !Array.isArray(required.dispositions) || required.dispositions.length === 0 || required.dispositions.some((value) => !nonempty(value))) throw new Error(`${pair.id} World ${world} required outcome is invalid`);
    }
    if (pair.required.A.mayAdvance !== true || pair.required.B.mayAdvance !== false) throw new Error(`${pair.id} must preserve A liveness and B safety polarity`);
  }
}

export function normalizeProjection(document, manifest) {
  exactKeys(document, ["schemaVersion", "contract", "id", "visible"], "projection");
  if (document.schemaVersion !== 1 || document.contract !== PROJECTION_CONTRACT) throw new Error("projection must use kfd.delegated-work-projection/v1");
  if (!nonempty(document.id)) throw new Error("projection id must be a non-empty string");
  if (!Array.isArray(document.visible) || document.visible.length === 0 || document.visible.some((field) => !nonempty(field))) throw new Error("projection visible must be a non-empty string array");
  if (new Set(document.visible).size !== document.visible.length) throw new Error("projection contains duplicate field paths");
  const allowlisted = new Set(manifest.projection.allowlistedPaths);
  const prohibited = new Set(manifest.projection.prohibitedNames);
  for (const field of document.visible) {
    if (!allowlisted.has(field)) throw new Error(`projection field is unknown or not allowlisted: ${field}`);
    if (field.split(".").some((segment) => prohibited.has(segment))) throw new Error(`projection field is prohibited: ${field}`);
  }
  return { ...document, visible: [...document.visible].sort(compareUtf8) };
}

export function loadProjection(reference, manifest) {
  const selected = reference || manifest.projections.default;
  const relative = manifest.projections[selected];
  const entry = relative ? jsonResource(relative) : (() => {
    const absolute = path.resolve(selected);
    const bytes = regularBytes(absolute);
    return { absolute, bytes, value: JSON.parse(bytes.toString("utf8")) };
  })();
  return { ...entry, value: normalizeProjection(entry.value, manifest), builtIn: Boolean(relative) };
}

function readPath(state, field) {
  let value = state;
  for (const part of field.split(".")) {
    if (!isObject(value) || !Object.hasOwn(value, part)) return { found: false };
    value = value[part];
  }
  return { found: true, value };
}

function writePath(target, field, value) {
  const parts = field.split(".");
  let cursor = target;
  for (const part of parts.slice(0, -1)) {
    if (!Object.hasOwn(cursor, part)) cursor[part] = {};
    cursor = cursor[part];
  }
  cursor[parts.at(-1)] = structuredClone(value);
}

export function projectState(state, projection) {
  const projected = {};
  for (const field of projection.visible) {
    const selected = readPath(state, field);
    if (selected.found) writePath(projected, field, selected.value);
  }
  return projected;
}

export function selectPairs(suite, pairId) {
  if (!pairId) return suite.pairs;
  const pair = suite.pairs.find(({ id }) => id === pairId);
  if (!pair) throw new Error(`unknown pair: ${pairId}`);
  return [pair];
}

export function evaluateProjection(suite, projection, pairId) {
  return selectPairs(suite, pairId).map((pair) => {
    const a = projectState(pair.worlds.A.state, projection);
    const b = projectState(pair.worlds.B.state, projection);
    const rootA = semanticRoot(a);
    const rootB = semanticRoot(b);
    const collision = rootA === rootB;
    return {
      pairId: pair.id,
      fixtureRoot: semanticRoot(pair),
      question: pair.question,
      sameSurface: pair.sameSurface,
      required: structuredClone(pair.required),
      worlds: {
        A: { projectedState: a, projectedRoot: rootA },
        B: { projectedState: b, projectedRoot: rootB },
      },
      collision,
      semanticFinding: collision ? "COLLAPSED" : "INFORMATION-DISTINGUISHABLE",
      informationDistinguishable: !collision,
      discriminatingFields: structuredClone(pair.discriminatingFields),
      whyUnsafe: pair.whyUnsafe,
      whyNotLive: pair.whyNotLive,
    };
  });
}

export function requestId(pairId, state) {
  return `${pairId}:${semanticRoot(state).slice(7, 23)}`;
}

export function adapterRequests(challenge, pairs) {
  const handshake = {
    schemaVersion: 1,
    contract: REQUEST_CONTRACT,
    requestId: "handshake",
    operation: "handshake",
    input: {
      profile: `${challenge.manifest.profile.id}@${challenge.manifest.profile.version}`,
      suiteRoot: semanticRoot(challenge.suite),
      pairCount: pairs.length,
      offline: true,
    },
  };
  const evaluations = [];
  for (const pair of pairs) {
    for (const world of ["A", "B"]) {
      const state = pair.worlds[world].state;
      evaluations.push({
        schemaVersion: 1,
        contract: REQUEST_CONTRACT,
        requestId: requestId(pair.id, state),
        operation: "evaluate",
        input: { pairId: pair.id, scenario: state, scenarioRoot: semanticRoot(state) },
      });
    }
  }
  return [handshake, ...evaluations];
}

function validateAdapterIdentity(response, adapter, requestIdValue) {
  if (response?.schemaVersion !== 1 || response?.contract !== RESPONSE_CONTRACT || response?.requestId !== requestIdValue) return false;
  return nonempty(response?.adapter?.id) && nonempty(response?.adapter?.version) && response.adapter.id === adapter.id && response.adapter.version === adapter.version;
}

function evidenceStatus(response) {
  const sources = response?.authoritativeSources;
  const sourcesExplicit = Array.isArray(sources) && sources.length > 0 && sources.every((entry) => nonempty(entry?.object) && nonempty(entry?.identity) && nonempty(entry?.revision));
  const enforcementExplicit = nonempty(response?.enforcementPoint);
  const continuityExplicit = typeof response?.survivesExecutorReplacement === "boolean" && nonempty(response?.replacementContinuityMechanism) && typeof response?.humanReconstructionRequired === "boolean";
  const continuitySatisfied = response?.survivesExecutorReplacement === true && response?.humanReconstructionRequired === false;
  return { sourcesExplicit, enforcementExplicit, continuityExplicit, continuitySatisfied };
}

export function evaluateAdapterResponses(challenge, pairs, requests, responses) {
  if (responses.length !== requests.length) throw new Error(`adapter returned ${responses.length} responses; expected ${requests.length}`);
  const byId = new Map();
  for (const response of responses) {
    if (!nonempty(response?.requestId)) throw new Error("adapter response requestId is missing");
    if (byId.has(response.requestId)) throw new Error(`adapter repeated response ${response.requestId}`);
    byId.set(response.requestId, response);
  }
  const handshake = byId.get("handshake");
  exactKeys(handshake, ["schemaVersion", "contract", "requestId", "adapter", "status", "code"], "adapter handshake response");
  exactKeys(handshake?.adapter, ["id", "version"], "adapter handshake identity");
  if (handshake?.schemaVersion !== 1 || handshake?.contract !== RESPONSE_CONTRACT || handshake?.requestId !== "handshake" || handshake?.status !== "accepted" || handshake?.code !== "adapter-ready" || !nonempty(handshake?.adapter?.id) || !nonempty(handshake?.adapter?.version)) {
    throw new Error("delegated-work adapter handshake failed closed");
  }
  const adapter = { id: handshake.adapter.id, version: handshake.adapter.version };
  const assertions = [];
  for (const pair of pairs) {
    for (const world of ["A", "B"]) {
      const state = pair.worlds[world].state;
      const id = requestId(pair.id, state);
      const response = byId.get(id);
      if (!response) throw new Error(`adapter response is missing: ${id}`);
      exactKeys(response, ["schemaVersion", "contract", "requestId", "adapter", "status", "code", "decision", "authoritativeSources", "enforcementPoint", "survivesExecutorReplacement", "replacementContinuityMechanism", "humanReconstructionRequired"], `${pair.id} adapter response`);
      exactKeys(response.adapter, ["id", "version"], `${pair.id} adapter identity`);
      exactKeys(response.decision, ["mayAdvance", "disposition"], `${pair.id} adapter decision`);
      if (Array.isArray(response.authoritativeSources)) {
        for (const source of response.authoritativeSources) exactKeys(source, ["object", "identity", "revision"], `${pair.id} authoritative source`);
      }
      const envelopeValid = validateAdapterIdentity(response, adapter, id) && response.status === "completed" && nonempty(response.code);
      const decisionExplicit = typeof response?.decision?.mayAdvance === "boolean" && nonempty(response?.decision?.disposition);
      const expected = pair.required[world];
      const outcomeSatisfied = decisionExplicit && response.decision.mayAdvance === expected.mayAdvance && expected.dispositions.includes(response.decision.disposition);
      const evidence = evidenceStatus(response);
      const semanticPass = envelopeValid && outcomeSatisfied && evidence.sourcesExplicit && evidence.enforcementExplicit && evidence.continuityExplicit && evidence.continuitySatisfied;
      const status = !envelopeValid || !decisionExplicit || !evidence.sourcesExplicit || !evidence.enforcementExplicit || !evidence.continuityExplicit
        ? "undetermined"
        : response.humanReconstructionRequired
          ? "human-required"
          : !evidence.continuitySatisfied
            ? "replacement-continuity-failure"
            : outcomeSatisfied
              ? "satisfied"
              : world === "A"
                ? "liveness-failure"
                : "unsafe";
      assertions.push({
        pairId: pair.id,
        world,
        requestId: id,
        expected: structuredClone(expected),
        response: structuredClone(response),
        responseRoot: semanticRoot(response),
        checks: { envelopeValid, decisionExplicit, outcomeSatisfied, ...evidence },
        status,
        semanticPass,
      });
    }
  }
  return { adapter, handshake, assertions };
}

export function attachAdapterAssertions(findings, assertions) {
  return findings.map((finding) => {
    const worlds = {};
    for (const assertion of assertions.filter(({ pairId }) => pairId === finding.pairId)) {
      worlds[assertion.world] = assertion;
    }
    return {
      ...finding,
      adapterAssertion: {
        worlds,
        safetyAndLivenessSatisfied: worlds.A?.semanticPass === true && worlds.B?.semanticPass === true,
      },
    };
  });
}

export function rootReport(report) {
  const copy = structuredClone(report);
  delete copy.reportRoot;
  return semanticRoot(copy);
}

export function sourceClosure(challenge) {
  const packageEntry = resource("package.json");
  const releaseEntry = resource("kfd.release.json");
  const verifierEntry = resource("scripts/delegated-work-challenge-report-verifier.mjs");
  const packageJson = JSON.parse(packageEntry.bytes.toString("utf8"));
  return {
    sourceCut: {
      repository: "kungfu-systems/kfd",
      package: packageJson.name,
      packageVersion: packageJson.version,
      packageManifestDigest: exactByteRoot(packageEntry.bytes),
      releaseAnchorDigest: exactByteRoot(releaseEntry.bytes),
    },
    challenge: {
      id: challenge.manifest.profile.id,
      version: challenge.manifest.profile.version,
      status: challenge.manifest.profile.status,
      numberedDecision: false,
      manifestDigest: exactByteRoot(challenge.manifestBytes),
      verifierContract: "kfd.delegated-work-challenge-report-verifier/v1",
      verifierArtifactDigest: exactByteRoot(verifierEntry.bytes),
    },
  };
}

export { canonicalJson, exactByteRoot, semanticRoot };
