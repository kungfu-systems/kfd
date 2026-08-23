// SPDX-License-Identifier: Apache-2.0
import fs from "node:fs";
import path from "node:path";
import { CONTRACTS, packageRoot, semanticRoot } from "./protocol-semantics-contract.mjs";

const PROFILE_ROOT = path.join(packageRoot, "profiles", "protocol-semantics-lab");
const CATALOG_SOURCE_PATH = path.join(PROFILE_ROOT, "catalog-source.json");
const CLAIM_BOUNDARY = Object.freeze({
  evaluationInputOnly: true,
  certification: false,
  runtimeAuthority: false,
  commercialDemand: false,
});

function compareUtf8(left, right) {
  return Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
}

function sorted(values) {
  return [...values].sort(compareUtf8);
}

function readSource() {
  return JSON.parse(fs.readFileSync(CATALOG_SOURCE_PATH, "utf8"));
}

function semanticSummary(protocolTitle, questionId, state) {
  const question = questionId.replaceAll("-", " ");
  return {
    represented: `${protocolTitle}'s frozen bounded input explicitly represents ${question}.`,
    "extension-required": `${protocolTitle}'s frozen protocol-owned surface requires a separately versioned extension to carry ${question}.`,
    "out-of-scope": `${question} is outside ${protocolTitle}'s frozen protocol responsibility; this is not a protocol failure.`,
    unresolved: `${protocolTitle}'s frozen bounded input does not determine ${question}.`,
  }[state];
}

function sourceSnapshot(catalog, source) {
  return {
    id: source.id,
    kind: source.kind,
    frozenAt: catalog.frozenAt,
    frozenSemantics: sorted(source.frozenSemantics),
    locators: sorted(source.locators),
    sourcePolicy: catalog.sourcePolicy,
  };
}

function buildPack(catalog, sourceById, definition) {
  const source = sourceById.get(definition.sourceId);
  if (!source) throw new Error(`Unknown catalog source ${definition.sourceId}`);
  const contentRoot = semanticRoot(sourceSnapshot(catalog, source));
  const states = Object.keys(definition.states);
  if (states.length !== catalog.pairedWorldQuestionIds.length || sorted(states).join("\0") !== sorted(catalog.pairedWorldQuestionIds).join("\0")) {
    throw new Error(`${definition.id} must explicitly map the exact paired-world question set`);
  }
  return {
    schemaVersion: 1,
    contract: CONTRACTS.evidencePackV2,
    protocol: { id: definition.id, title: definition.title, version: definition.version, kind: definition.kind },
    source: {
      coordinate: source.coordinate ?? `${source.id}@${contentRoot}`,
      revision: source.gitHead ?? contentRoot,
      contentRoot,
      locators: sorted(source.locators),
    },
    semantics: sorted(catalog.pairedWorldQuestionIds).map((id) => ({
      id,
      state: definition.states[id],
      summary: semanticSummary(definition.title, id, definition.states[id]),
      evidenceRoots: definition.states[id] === "represented" ? [contentRoot] : [],
    })),
    catalogSourceId: definition.sourceId,
    maturity: { status: definition.maturity.status, authority: definition.maturity.authority, asOf: catalog.frozenAt },
    responsibility: {
      protocolOwns: sorted(definition.protocolOwns),
      kfdWorkOwns: sorted(definition.kfdWorkOwns),
      outOfScopeIsFailure: false,
    },
    nativeSurface: { objects: sorted(definition.nativeObjects), states: sorted(definition.nativeStates) },
    extensionPoints: sorted(definition.extensionPoints),
    nonClaims: sorted(definition.nonClaims),
    evidenceGrade: definition.evidenceGrade,
    drift: { frozenAt: catalog.frozenAt, policy: "new-pack-version-required", sourceStatus: definition.maturity.status },
    sourceBoundary: { mode: "bounded-paraphrase", fullSpecificationVendored: false, excerptWords: 0 },
    claimBoundary: CLAIM_BOUNDARY,
  };
}

function buildComparisonMarkdown(catalog, packs, catalogRoot) {
  const rows = packs.map((pack) => {
    const states = Object.fromEntries(pack.semantics.map((entry) => [entry.id, entry.state]));
    return `| ${pack.protocol.id}@${pack.protocol.version} | ${pack.maturity.status} | ${states["work-version"]} | ${states["authority-revocation"]} | ${states["causal-history"]} | ${states["retry-identity"]} | ${states["recovery-drift"]} | ${states["accepted-completion"]} |`;
  });
  return `---
status: draft
period: ${catalog.frozenAt}
theme: protocol-semantics-lab
doc_type: generated-analysis
source_level: local-files
confidence: high
sensitivity: public
evidence_grade: B
review_state: unreviewed
last_reviewed: ${catalog.frozenAt}
---

# Frozen Protocol Evidence Catalog

This deterministic comparison is generated from \`catalog-source.json\`. The
catalog root is \`${catalogRoot}\`. Source URLs are citation locators only;
generation and verification are offline. \`out-of-scope\` records a protocol
responsibility boundary and is never a failure score.

| Exact pack | Maturity | Work version | Authority revocation | Causal history | Retry identity | Recovery drift | Accepted completion |
| --- | --- | --- | --- | --- | --- | --- | --- |
${rows.join("\n")}

The two ACP meanings are deliberately distinct: \`zed-acp\` is the Agent
Client Protocol session surface, while \`commerce-acp\` is the agentic-commerce
family. IETF draft-03 remains \`draft\`; WebMCP remains \`incubating\`.
Passing validates this frozen representation only and grants no vendor,
runtime, certification, adoption, policy-correctness, or commercial authority.
`;
}

export function buildProtocolEvidenceCatalog() {
  const source = readSource();
  const sourceById = new Map(source.sourceCatalog.map((entry) => [entry.id, entry]));
  const packs = source.packs.map((definition) => buildPack(source, sourceById, definition))
    .sort((left, right) => compareUtf8(`${left.protocol.id}\0${left.protocol.version}`, `${right.protocol.id}\0${right.protocol.version}`));
  const coveredSources = new Set(packs.map((pack) => pack.catalogSourceId));
  for (const entry of source.sourceCatalog) {
    if (!coveredSources.has(entry.id)) throw new Error(`Frozen source ${entry.id} has no generated pack`);
  }
  const registry = {
    schemaVersion: 1,
    contract: CONTRACTS.registry,
    rootAlgorithm: "sha256-kfd-canonical-json-v1",
    entries: packs.map((pack) => ({
      protocolId: pack.protocol.id,
      protocolVersion: pack.protocol.version,
      packPath: `profiles/protocol-semantics-lab/packs/${pack.protocol.id}-${pack.protocol.version}.json`,
      packRoot: semanticRoot(pack),
    })),
  };
  const referenceWithoutRoot = {
    schemaVersion: 1,
    contract: "kfd.protocol-evidence-catalog-reference/v1",
    frozenAt: source.frozenAt,
    sourcePolicy: source.sourcePolicy,
    sourceCatalogIds: sorted(source.sourceCatalog.map((entry) => entry.id)),
    questionIds: sorted(source.pairedWorldQuestionIds),
    registryRoot: semanticRoot(registry),
    packs: registry.entries,
    claimBoundary: CLAIM_BOUNDARY,
  };
  const reference = { ...referenceWithoutRoot, catalogRoot: semanticRoot(referenceWithoutRoot) };
  const files = new Map();
  packs.forEach((pack, index) => files.set(registry.entries[index].packPath, `${JSON.stringify(pack, null, 2)}\n`));
  files.set("profiles/protocol-semantics-lab/registry.json", `${JSON.stringify(registry, null, 2)}\n`);
  files.set("profiles/protocol-semantics-lab/generated/catalog-reference.json", `${JSON.stringify(reference, null, 2)}\n`);
  files.set("profiles/protocol-semantics-lab/generated/catalog-comparison.md", buildComparisonMarkdown(source, packs, reference.catalogRoot));
  return { source, packs, registry, reference, files };
}

export { CATALOG_SOURCE_PATH };
