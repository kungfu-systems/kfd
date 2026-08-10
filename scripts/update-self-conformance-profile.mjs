// SPDX-License-Identifier: Apache-2.0
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { exactByteRoot, semanticRoot, applyOperations } from "./self-conformance-contract.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const writeJson = (relative, value) => fs.writeFileSync(path.join(root, relative), `${JSON.stringify(value, null, 2)}\n`);
const bytes = (relative) => fs.readFileSync(path.join(root, relative));

const schemaPaths = fs.readdirSync(path.join(root, "schemas/kfd-self-conformance"))
  .filter((name) => name.endsWith(".schema.json"))
  .sort()
  .map((name) => `schemas/kfd-self-conformance/${name}`);
const schemaSetRoot = semanticRoot(schemaPaths.map((relative) => ({
  path: relative,
  contentRoot: exactByteRoot(bytes(relative)),
  size: bytes(relative).length,
})));

const evidencePath = "profiles/self-conformance/bootstrap-evidence.json";
const anchorPath = "profiles/self-conformance/bootstrap-anchor.json";
const vectorPath = "profiles/self-conformance/vectors/contract-vectors.json";
const issuePath = "profiles/self-conformance/issue-codes.json";
const evidence = readJson(evidencePath);
const anchor = readJson(anchorPath);
anchor.stateRoot = semanticRoot(evidence.state);
anchor.authorityReceiptRoot = semanticRoot(evidence.authorityReceipt);
anchor.reviewReceiptRoot = semanticRoot(evidence.reviewReceipt);
writeJson(anchorPath, anchor);

const vectors = readJson(vectorPath);
vectors.base.bootstrapAnchor = anchor;
vectors.base.bundle.previousState = evidence.state;
vectors.base.bundle.previousStateRoot = anchor.stateRoot;
vectors.base.bundle.proposedStateRoot = semanticRoot(vectors.base.bundle.proposedState);
vectors.base.bundle.predecessor.bootstrapAnchorRoot = semanticRoot(anchor);
vectors.base.bundle.predecessor.packageRoot = anchor.packageRoot;
vectors.base.bundle.evidenceRoots = [semanticRoot(vectors.base.exampleEvidence.evidenceArtifact)];
vectors.base.bundle.schemaSetRoot = schemaSetRoot;
vectors.base.bundle.verifierRoot = semanticRoot(vectors.base.exampleEvidence.verifierDescriptor);
vectors.base.bundle.authorityReceiptRoot = semanticRoot(vectors.base.exampleEvidence.authorityReceipt);
vectors.base.bundle.reviewReceiptRoot = semanticRoot(vectors.base.exampleEvidence.reviewReceipt);
vectors.base.report.bundleRoot = semanticRoot(vectors.base.bundle);
for (const vector of vectors.vectors) {
  if (vector.id !== "scp-v017") continue;
  const altered = applyOperations(vectors.base.bundle, vector.operations.slice(0, 1));
  vector.operations[1].value = semanticRoot(altered.proposedState);
}
writeJson(vectorPath, vectors);

const surfacePaths = [
  "profiles/self-conformance/README.md",
  "profiles/self-conformance/implementer-guide.md",
  "profiles/self-conformance/lifecycle-gates.json",
  "profiles/self-conformance/lifecycle-gate-matrix.json",
  anchorPath,
  evidencePath,
  issuePath,
  vectorPath,
  "profiles/self-conformance/extraction-manifest.json",
  ...schemaPaths,
  "scripts/self-conformance-contract.mjs",
  "scripts/self-conformance-lifecycle-gate.mjs",
  "scripts/check-self-conformance-profile.mjs",
  "scripts/check-self-conformance-lifecycle.mjs",
  "scripts/check-self-conformance-changes.mjs",
  "bin/kfd.mjs",
  "verifier/dist/kfd_verifier.wasm",
];
const roleFor = (relative) => {
  if (relative.endsWith("README.md")) return "authority";
  if (relative.endsWith("implementer-guide.md")) return "guide";
  if (relative.includes("/schemas/") || relative.startsWith("schemas/")) return "schema";
  if (relative.includes("vectors/")) return "vectors";
  if (relative.endsWith("extraction-manifest.json")) return "extraction";
  if (relative.endsWith("lifecycle-gates.json")) return "policy";
  if (relative.endsWith("lifecycle-gate-matrix.json")) return "vectors";
  if (relative.endsWith(".wasm")) return "verifier";
  if (relative.startsWith("bin/")) return "cli";
  if (relative.startsWith("scripts/")) return "check";
  return "reference";
};
const manifest = readJson("profiles/self-conformance/manifest.json");
manifest.schemaSetRoot = schemaSetRoot;
manifest.vectorSetRoot = semanticRoot(readJson(vectorPath));
manifest.issueSetRoot = semanticRoot(readJson(issuePath));
manifest.bootstrapAnchorRoot = semanticRoot(anchor);
manifest.surfaces = surfacePaths.sort().map((relative) => ({
  path: relative,
  role: roleFor(relative),
  digest: exactByteRoot(bytes(relative)),
}));
writeJson("profiles/self-conformance/manifest.json", manifest);

const impactPath = "release-impact.json";
const impact = readJson(impactPath);
const impactEntry = {
  id: "kfd-self-conformance-profile-v1",
  impact: "minor",
  class: "additive",
  rationale: "KFD preserves the kfd-self-conformance 1.0.0-alpha.1 semantic contract while additively replaying retained lifecycle evidence against its reviewed package-manifest and verifier-byte cut, and retains the companion historical profile with machine-reproducible alpha.28 lineage, explicit retrospective boundaries, Native/WebAssembly parity, offline clean-room closure, and no Candidate number or decision-status change."
};
impact.surfaceImpacts = impact.surfaceImpacts.filter(({ id }) => id !== impactEntry.id);
impact.surfaceImpacts.push(impactEntry);
writeJson(impactPath, impact);

const packagePath = "package.json";
const packageJson = readJson(packagePath);
packageJson.exports["./self-conformance/manifest.json"] = "./profiles/self-conformance/manifest.json";
packageJson.exports["./self-conformance/bootstrap-anchor.json"] = "./profiles/self-conformance/bootstrap-anchor.json";
packageJson.exports["./self-conformance/issue-codes.json"] = "./profiles/self-conformance/issue-codes.json";
packageJson.exports["./self-conformance/vectors.json"] = "./profiles/self-conformance/vectors/contract-vectors.json";
packageJson.exports["./self-conformance/schemas/*"] = "./schemas/kfd-self-conformance/*";
packageJson.exports["./self-conformance/verifier-matrix.json"] = "./verifier/specs/self-conformance-matrix.json";
packageJson.exports["./self-conformance/lifecycle-gates.json"] = "./profiles/self-conformance/lifecycle-gates.json";
packageJson.exports["./self-conformance/lifecycle-gate-matrix.json"] = "./profiles/self-conformance/lifecycle-gate-matrix.json";
packageJson.exports["./self-conformance/lifecycle-gate-request.schema.json"] = "./schemas/kfd-self-conformance/lifecycle-gate-request.schema.json";
packageJson.exports["./self-conformance/lifecycle-gate-report.schema.json"] = "./schemas/kfd-self-conformance/lifecycle-gate-report.schema.json";
packageJson.scripts["check:self-conformance-profile"] = "node scripts/check-self-conformance-profile.mjs";
packageJson.scripts["check:self-conformance-lifecycle"] = "node scripts/check-self-conformance-lifecycle.mjs && node scripts/check-self-conformance-changes.mjs";
packageJson.scripts.check = "node scripts/check.mjs && npm run check:adopter-conformance && npm run check:warrant-evidence && npm run check:agent-hub && npm run check:agent-hub-conformance && npm run check:agent-runtime && npm run check:self-conformance-profile && npm run check:self-conformance-lifecycle && npm run check:self-conformance-history && npm run check:verifier";
writeJson(packagePath, packageJson);

const agentRuntimeManifestPath = "profiles/agent-runtime/manifest.json";
const agentRuntimeManifest = readJson(agentRuntimeManifestPath);
agentRuntimeManifest.surfaces = agentRuntimeManifest.surfaces.map((surface) => ({
  ...surface,
  digest: exactByteRoot(bytes(surface.path)),
}));
writeJson(agentRuntimeManifestPath, agentRuntimeManifest);

const agentHubManifestPath = "profiles/agent-hub/manifest.json";
const agentHubManifest = readJson(agentHubManifestPath);
agentHubManifest.runtimeDependency.manifestDigest = exactByteRoot(bytes(agentRuntimeManifestPath));
writeJson(agentHubManifestPath, agentHubManifest);

const standardsPath = "standards.json";
const standards = readJson(standardsPath);
const kfd1 = standards.standards["kfd-1"];
const additions = {
  selfConformanceState: "state",
  selfConformanceBootstrapAnchor: "bootstrap-anchor",
  selfConformanceTransitionBundle: "transition-bundle",
  selfConformanceTransitionReport: "transition-report",
  selfConformancePackageManifest: "package-manifest",
  selfConformanceVectorRegistry: "vector-registry",
  selfConformanceLifecycleGateRequest: "lifecycle-gate-request",
  selfConformanceLifecycleGateReport: "lifecycle-gate-report",
};
for (const [key, stem] of Object.entries(additions)) {
  const schemaId = `https://kfd.libkungfu.dev/schemas/kfd-self-conformance/${stem}.schema.json`;
  const schemaPath = `schemas/kfd-self-conformance/${stem}.schema.json`;
  kfd1.schemaIds[key] = schemaId;
  kfd1.schemaPaths[key] = schemaPath;
  kfd1.interfaces[key] = {
    contract: `kfd.self-conformance-${stem}/v1`,
    schemaVersion: 1,
    schemaId,
    schemaPath,
    compatibilityRule: "Changes to required roots, transition meaning, canonicalization, issue meaning, recursion, or responsibility boundaries require a successor profile or explicit compatibility action."
  };
}
kfd1.concepts.selfConformanceProfile = "KFD-owned finite structural proof contract for KFD lifecycle and package transitions";
kfd1.concepts.selfConformanceBootstrapAnchor = "reviewed predecessor package and state root that terminates recursive verification";
kfd1.concepts.selfConformanceTransitionBundle = "root-bound proposed KFD lifecycle transition with separate authority and review receipts";

const projection = {
  breaking: "Incompatible changes require a successor Self-Conformance Profile or explicit compatibility action.",
  additive: "Backward-compatible additions must be declared and retain the exact prior profile closure.",
  none: "Changes outside this surface create no KFD-1 impact for this surface.",
  unclassifiable: "If impact cannot be classified, repair the register before the dependent gate may pass."
};
const registered = [
  ["kfd-self-conformance-authority", "cross-time", "profiles/self-conformance/README.md", "Normative profile, state machine, recursion, and claim boundary."],
  ["kfd-self-conformance-manifest", "integration-time", "profiles/self-conformance/manifest.json", "Digest-bound clean-room profile closure."],
  ["kfd-self-conformance-transition-bundle", "integration-time", "schemas/kfd-self-conformance/transition-bundle.schema.json", "Machine contract for exact proposed transitions."],
  ["kfd-self-conformance-transition-report", "cross-time", "schemas/kfd-self-conformance/transition-report.schema.json", "Persisted non-authoritative verification result."],
  ["kfd-self-conformance-bootstrap-anchor", "cross-time", "profiles/self-conformance/bootstrap-anchor.json", "Reviewed finite predecessor for the first profile chain."],
  ["kfd-self-conformance-contract-vectors", "integration-time", "profiles/self-conformance/vectors/contract-vectors.json", "Fixed positive and fail-closed contract vectors."],
  ["kfd-self-conformance-verifier", "integration-time", "verifier/crates/core/src/profiles/self_conformance_transition.rs", "Independent fail-closed Rust verifier shared by native and WebAssembly projections."],
  ["kfd-self-conformance-verifier-matrix", "integration-time", "verifier/specs/self-conformance-matrix.json", "Invariant-to-case map, adversarial mutations, and protocol failure history."]
  ,["kfd-self-conformance-lifecycle-policy", "cross-time", "profiles/self-conformance/lifecycle-gates.json", "Official lifecycle path, transition, governance receipt, and retention policy."]
  ,["kfd-self-conformance-lifecycle-gate", "integration-time", "scripts/self-conformance-lifecycle-gate.mjs", "Package-only complete-chain gate over independent verifier reports and separate governance receipts."]
  ,["kfd-self-conformance-lifecycle-matrix", "integration-time", "profiles/self-conformance/lifecycle-gate-matrix.json", "Seven official paths and stable fail-closed lifecycle diagnostics."]
].map(([id, klass, sourcePath, description]) => ({
  id,
  class: klass,
  classes: klass === "integration-time" ? ["integration-time", "cross-time"] : ["cross-time"],
  description,
  sourcePath,
  weldRationale: "Implementers, reports, lifecycle gates, and clean-room checks bind this exact versioned surface.",
  impactProjection: projection,
}));
const ids = new Set(registered.map(({ id }) => id));
kfd1.surfaceRegister.surfaces = kfd1.surfaceRegister.surfaces.filter(({ id }) => !ids.has(id));
kfd1.surfaceRegister.surfaces.push(...registered);
writeJson(standardsPath, standards);

console.log(`Updated Self-Conformance contract: ${schemaPaths.length} schemas, ${vectors.vectors.length} vectors, ${manifest.surfaces.length} rooted surfaces`);
