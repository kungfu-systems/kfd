// SPDX-License-Identifier: Apache-2.0
import fs from "node:fs";
import path from "node:path";
import {
  CONTRACTS,
  canonicalJson,
  packageRoot,
  semanticRoot,
  verifyProtocolSemanticsDocument,
} from "./protocol-semantics-contract.mjs";

export const ROUTE_RESULT_STATES = Object.freeze(["preserved", "extension-required", "out-of-scope", "collapsed"]);
export const REQUIRED_SEMANTICS = Object.freeze(["accepted-completion", "authority-revocation", "causal-history", "recovery-drift", "retry-identity", "work-version"]);
export const FIXED_ROUTE_IDS = Object.freeze([
  "a2a-to-mcp",
  "ag-ui-interrupt-to-backend-task-resume",
  "commerce-authorization-to-accepted-completion",
  "durable-runtime-recovery-to-canonical-work",
  "mcp-to-a2a",
  "zed-acp-resume-to-a2a-continuation",
]);

const CLAIM_BOUNDARY = Object.freeze({ informationPreservationOnly: true, certification: false, runtimeAuthority: false, interoperabilityGuarantee: false });
const STATE_PRIORITY = Object.freeze({ preserved: 0, "out-of-scope": 1, "extension-required": 2, collapsed: 3 });

function readRegistry(rootDirectory = packageRoot) {
  return JSON.parse(fs.readFileSync(path.join(rootDirectory, "profiles", "protocol-semantics-lab", "registry.json"), "utf8"));
}

function evidence(label) {
  return semanticRoot({ contract: "kfd.cross-protocol-route-evidence/v1", label });
}

function endpoint(registry, protocolId, nativeKind, routeId, position) {
  const coordinate = registry.entries.find((candidate) => candidate.protocolId === protocolId);
  if (!coordinate) throw new Error(`unknown frozen protocol coordinate: ${protocolId}`);
  return {
    protocolId: coordinate.protocolId,
    protocolVersion: coordinate.protocolVersion,
    evidencePackRoot: coordinate.packRoot,
    canonicalWorkRoot: evidence(`${routeId}:canonical-work`),
    canonicalWorkSource: "work",
    nativeIdentity: { kind: nativeKind, identityRoot: evidence(`${routeId}:native:${position}:${nativeKind}`) },
    authorityRevision: evidence(`${routeId}:authority:${position}`),
  };
}

function mappings(routeId, hopId, states) {
  return REQUIRED_SEMANTICS.map((semanticId) => ({
    semanticId,
    state: typeof states === "string" ? states : (states[semanticId] ?? "preserved"),
    evidenceRoots: [evidence(`${routeId}:${hopId}:${semanticId}`)],
  }));
}

function resultState(hops) {
  return (Array.isArray(hops) ? hops : []).flatMap((hop) => Array.isArray(hop?.mappings) ? hop.mappings : []).reduce(
    (selected, candidate) => (STATE_PRIORITY[candidate?.state] ?? -1) > STATE_PRIORITY[selected] ? candidate.state : selected,
    "preserved",
  );
}

function fixedRoute(registry, { id, protocols, nativeKinds, states }) {
  const endpoints = protocols.map((protocolId, index) => endpoint(registry, protocolId, nativeKinds[index], id, index));
  const hops = protocols.slice(0, -1).map((_, index) => {
    const hopId = `${id}.hop-${index + 1}`;
    const hopMappings = mappings(id, hopId, states[index]);
    return {
      id: hopId,
      input: endpoints[index],
      output: endpoints[index + 1],
      mappings: hopMappings,
      losses: hopMappings.filter(({ state }) => state !== "preserved").map(({ semanticId, state }) => ({
        semanticId,
        kind: state,
        summary: `${semanticId} is ${state} at ${hopId}.`,
        evidenceRoots: [evidence(`${id}:${hopId}:${semanticId}:loss`)],
      })),
      inference: { mode: "none", evidenceRoots: [] },
      authorityTransition: {
        fromRevision: endpoints[index].authorityRevision,
        toRevision: endpoints[index + 1].authorityRevision,
        changed: true,
        evidenceRoots: [evidence(`${id}:${hopId}:authority-transition`)],
      },
    };
  });
  const state = resultState(hops);
  return {
    schemaVersion: 1,
    contract: CONTRACTS.routeV2,
    id,
    requiredSemantics: [...REQUIRED_SEMANTICS],
    expectedHopIds: hops.map(({ id: hopId }) => hopId),
    hops,
    result: { state, pairedWorldCollapse: state === "collapsed", evidenceRoots: [evidence(`${id}:result:${state}`)] },
    claimBoundary: structuredClone(CLAIM_BOUNDARY),
  };
}

export function buildFixedCrossProtocolRouteSuite(rootDirectory = packageRoot) {
  const registry = readRegistry(rootDirectory);
  return {
    schemaVersion: 1,
    contract: "kfd.cross-protocol-route-suite/v1",
    routes: [
      fixedRoute(registry, { id: "a2a-to-mcp", protocols: ["a2a-task", "mcp-tasks"], nativeKinds: ["task", "task"], states: [{ "accepted-completion": "extension-required" }] }),
      fixedRoute(registry, { id: "ag-ui-interrupt-to-backend-task-resume", protocols: ["ag-ui", "mcp-tasks"], nativeKinds: ["message", "task"], states: [{ "accepted-completion": "out-of-scope", "authority-revocation": "extension-required" }] }),
      fixedRoute(registry, { id: "commerce-authorization-to-accepted-completion", protocols: ["commerce-acp", "commerce-acp", "kfd-delegated-work-alpha68"], nativeKinds: ["payment", "message", "task"], states: [{ "accepted-completion": "extension-required" }, { "authority-revocation": "extension-required" }] }),
      fixedRoute(registry, { id: "durable-runtime-recovery-to-canonical-work", protocols: ["restate", "kfd-delegated-work-alpha68"], nativeKinds: ["runtime", "task"], states: [{ "accepted-completion": "collapsed", "authority-revocation": "collapsed" }] }),
      fixedRoute(registry, { id: "mcp-to-a2a", protocols: ["mcp-tasks", "a2a-task"], nativeKinds: ["task", "task"], states: ["preserved"] }),
      fixedRoute(registry, { id: "zed-acp-resume-to-a2a-continuation", protocols: ["zed-acp", "a2a-task"], nativeKinds: ["session", "task"], states: [{ "accepted-completion": "extension-required", "work-version": "extension-required" }] }),
    ],
    claimBoundary: structuredClone(CLAIM_BOUNDARY),
  };
}

export function analyzeCrossProtocolRouteSuite(suite, { rootDirectory = packageRoot } = {}) {
  const issues = [];
  const registry = readRegistry(rootDirectory);
  const packRoots = new Map(registry.entries.map((entry) => [`${entry.protocolId}\0${entry.protocolVersion}`, entry.packRoot]));
  const expectedKeys = ["schemaVersion", "contract", "routes", "claimBoundary"];
  if (!suite || typeof suite !== "object" || Array.isArray(suite) || canonicalJson(Object.keys(suite).sort()) !== canonicalJson([...expectedKeys].sort())) issues.push({ code: "psl-document-invalid", path: "/", message: "Route suite must contain only the exact fixed fields." });
  if (suite?.schemaVersion !== 1 || suite?.contract !== "kfd.cross-protocol-route-suite/v1") issues.push({ code: "psl-contract-unsupported", path: "/contract", message: "Route suite contract is unsupported." });
  if (canonicalJson(suite?.claimBoundary) !== canonicalJson(CLAIM_BOUNDARY)) issues.push({ code: "psl-claim-widening", path: "/claimBoundary", message: "Route suite claim boundary cannot be widened." });
  const routes = Array.isArray(suite?.routes) ? suite.routes : [];
  if (canonicalJson(routes.map((route) => route?.id)) !== canonicalJson(FIXED_ROUTE_IDS)) issues.push({ code: "psl-route-suite-incomplete", path: "/routes", message: "The exact fixed route suite and UTF-8 order are required." });
  const routeRoots = [];
  for (const [routeIndex, route] of routes.entries()) {
    const report = verifyProtocolSemanticsDocument(route);
    routeRoots.push(report.documentRoot);
    for (const routeIssue of report.issues) issues.push({ ...routeIssue, path: `/routes/${routeIndex}${routeIssue.path === "/" ? "" : routeIssue.path}` });
    for (const [hopIndex, hop] of (route?.hops ?? []).entries()) for (const endpointName of ["input", "output"]) {
      const value = hop?.[endpointName];
      const expectedRoot = packRoots.get(`${value?.protocolId}\0${value?.protocolVersion}`);
      if (!expectedRoot || value?.evidencePackRoot !== expectedRoot) issues.push({ code: "psl-route-stale-pack", path: `/routes/${routeIndex}/hops/${hopIndex}/${endpointName}/evidencePackRoot`, message: "Route endpoint must bind the current frozen registry pack root." });
    }
    if (route?.result?.state !== resultState(route?.hops)) issues.push({ code: "psl-state-contradictory", path: `/routes/${routeIndex}/result/state`, message: "Route result must equal the strongest declared hop mapping state." });
  }
  if (!routes.some((route) => route.result?.state === "preserved" && route.hops?.every((hop) => hop.mappings?.every((mapping) => mapping.state === "preserved")))) issues.push({ code: "psl-route-preservation-missing", path: "/routes", message: "At least one fixed route must preserve every required semantic." });
  if (!routes.some((route) => route.result?.state === "collapsed" && route.result?.pairedWorldCollapse === true)) issues.push({ code: "psl-route-collapse-missing", path: "/routes", message: "At least one fixed route must reproducibly collapse a paired world." });
  issues.sort((left, right) => Buffer.compare(Buffer.from(`${left.code}\0${left.path}\0${left.message}`, "utf8"), Buffer.from(`${right.code}\0${right.path}\0${right.message}`, "utf8")));
  const report = { schemaVersion: 1, contract: "kfd.cross-protocol-route-analysis-report/v1", valid: issues.length === 0, qualifying: false, certification: false, routeCount: routes.length, routeRoots, issues, suiteRoot: semanticRoot(suite) };
  return { ...report, reportRoot: semanticRoot(report) };
}
