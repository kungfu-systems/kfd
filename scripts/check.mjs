// Registry conformance check: the registry, decision documents, and release
// impact ledger must agree, so a release cannot ship evidence that lies about
// its contents or versioning surface.
import { readFileSync, existsSync } from "node:fs";

const fail = (msg) => { console.error(`check: ${msg}`); process.exitCode = 1; };
const requireFields = (value, required, label) => {
  for (const field of required ?? []) {
    if (value?.[field] === undefined) fail(`${label} missing required field ${field}`);
  }
};
const registry = JSON.parse(readFileSync("registry.json", "utf8"));
const standardsMetadata = JSON.parse(readFileSync("standards.json", "utf8"));
const standardsSchema = JSON.parse(readFileSync("schemas/kfd-standards.schema.json", "utf8"));
const releaseImpact = JSON.parse(readFileSync("release-impact.json", "utf8"));
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const siteBundle = JSON.parse(readFileSync("site/kfd-site.json", "utf8"));

if (registry.schemaVersion !== 1) fail(`unsupported schemaVersion ${registry.schemaVersion}`);
if (registry.contract !== "kfd-registry") fail(`unexpected contract ${registry.contract}`);
if (standardsMetadata.schemaVersion !== 1) fail(`unsupported standards schemaVersion ${standardsMetadata.schemaVersion}`);
if (standardsMetadata.contract !== "kfd-standards-metadata") fail(`unexpected standards contract ${standardsMetadata.contract}`);
if (standardsMetadata.metadataSchema?.id !== "https://kfd.libkungfu.dev/schemas/kfd-standards.schema.json") {
  fail("standards metadataSchema.id must be the canonical KFD standards schema URI");
}
if (standardsMetadata.metadataSchema?.path !== "schemas/kfd-standards.schema.json") {
  fail("standards metadataSchema.path must be schemas/kfd-standards.schema.json");
}
if (standardsSchema.$id !== standardsMetadata.metadataSchema?.id) {
  fail("standards schema $id must match standards metadataSchema.id");
}
if (standardsSchema.properties?.contract?.const !== "kfd-standards-metadata") {
  fail("standards schema must describe the kfd-standards-metadata contract");
}
requireFields(standardsMetadata, standardsSchema.required, "standards metadata");
requireFields(standardsMetadata.metadataSchema, standardsSchema.properties?.metadataSchema?.required, "standards metadataSchema");
requireFields(standardsMetadata.source, standardsSchema.properties?.source?.required, "standards source");
if (siteBundle.schemaVersion !== 1) fail(`unsupported site bundle schemaVersion ${siteBundle.schemaVersion}`);
if (siteBundle.contract !== "kfd-site-bundle") fail(`unexpected site bundle contract ${siteBundle.contract}`);
if (siteBundle.source?.homepageTextSource !== "README.md") fail("site bundle homepageTextSource must be README.md");
if (siteBundle.source?.registry !== "registry.json") fail("site bundle registry source must be registry.json");
if (siteBundle.source?.decisionsDir !== "decisions") fail("site bundle decisionsDir must be decisions");
if (siteBundle.homepage?.title !== "KFD — Kung Fu Decisions") fail("site bundle homepage title must match README H1 text");
if (siteBundle.homepage?.currentDecisions?.source !== "registry.json") fail("site bundle currentDecisions source must be registry.json");
if (siteBundle.decisionPages?.source !== "registry.json") fail("site bundle decisionPages source must be registry.json");
if (siteBundle.decisionPages?.bodySource !== "registry.entries[].path") fail("site bundle decision page body source must be registry.entries[].path");
for (const requiredFile of ["README.md", "decisions", "registry.json", "standards.json", "schemas", "site", "docs"]) {
  if (!Array.isArray(packageJson.files) || !packageJson.files.includes(requiredFile)) {
    fail(`package.json files[] must include ${requiredFile}`);
  }
}
for (const requiredExport of ["./registry.json", "./standards.json", "./site/kfd-site.json", "./schemas/*.json", "./schemas/*/*.json"]) {
  if (!packageJson.exports || !packageJson.exports[requiredExport]) {
    fail(`package.json exports must include ${requiredExport}`);
  }
}

const seen = new Set();
const statuses = new Set(["draft", "active", "superseded"]);
const kinds = new Set(["principle", "procedure"]);
const superseded = new Map();
for (const e of registry.entries) {
  if (!Number.isInteger(e.number) || e.number < 1) fail(`bad number ${e.number}`);
  if (seen.has(e.number)) fail(`duplicate number ${e.number}`);
  seen.add(e.number);
  if (e.id !== `KFD-${e.number}`) fail(`id ${e.id} does not match number ${e.number}`);
  if (e.slug !== `kfd-${e.number}`) fail(`${e.id} slug must be kfd-${e.number}, not ${e.slug}`);
  if (e.path !== `decisions/kfd-${e.number}.md`) {
    fail(`${e.id} path must be decisions/kfd-${e.number}.md, not ${e.path}`);
  }
  if (!kinds.has(e.kind)) fail(`bad kind ${e.kind} on ${e.id}`);
  if (!statuses.has(e.status)) fail(`bad status ${e.status} on ${e.id}`);
  if (e.status === "superseded") {
    if (!Array.isArray(e.supersededBy) || e.supersededBy.length === 0) {
      fail(`${e.id} is superseded but does not declare supersededBy`);
    } else {
      superseded.set(e.id, e.supersededBy);
    }
  }
  if (!existsSync(e.path)) fail(`missing document ${e.path} for ${e.id}`);
  else {
    const doc = readFileSync(e.path, "utf8");
    if (!doc.startsWith(`# ${e.id}:`)) fail(`${e.path} heading does not open with "# ${e.id}:"`);
    if (!doc.includes(`Status: ${e.status}`)) fail(`${e.path} status line does not say ${e.status}`);
    if (!doc.includes(`Kind: ${e.kind}`)) fail(`${e.path} kind line does not say ${e.kind}`);
    if (e.status === "superseded") {
      for (const successor of superseded.get(e.id) ?? []) {
        if (!doc.includes(successor)) fail(`${e.path} does not cite successor ${successor}`);
      }
    }
  }
  const standard = standardsMetadata.standards?.[e.slug];
  if (!standard) fail(`standards metadata missing ${e.slug}`);
  else {
    requireFields(standard, standardsSchema.$defs?.standard?.required, `${e.id} standards metadata`);
    if (standard.key !== e.slug) fail(`${e.id} standard key must be ${e.slug}`);
    if (standard.id !== e.id) fail(`${e.id} standard id mismatch in standards metadata`);
    if (standard.number !== e.number) fail(`${e.id} standard number mismatch in standards metadata`);
    if (standard.label !== e.id) fail(`${e.id} standard label must be ${e.id}`);
    if (standard.title !== e.title) fail(`${e.id} standard title must match registry title`);
    if (standard.kind !== e.kind) fail(`${e.id} standard kind must match registry kind`);
    if (standard.status !== e.status) fail(`${e.id} standard status must match registry status`);
    if (standard.document?.path !== e.path) fail(`${e.id} standard document path must match registry path`);
    if (standard.document?.url !== e.url) fail(`${e.id} standard document url must match registry url`);
    if (standard.metadataSchemaVersion !== standardsMetadata.metadataSchema?.version) {
      fail(`${e.id} standard metadataSchemaVersion must match metadata schema version`);
    }
    if (standard.schemaIds?.metadata !== standardsMetadata.metadataSchema?.id) {
      fail(`${e.id} standard schemaIds.metadata must match metadata schema id`);
    }
    if (standard.schemaPaths?.metadata !== standardsMetadata.metadataSchema?.path) {
      fail(`${e.id} standard schemaPaths.metadata must match metadata schema path`);
    }
    for (const [name, schemaPath] of Object.entries(standard.schemaPaths ?? {})) {
      if (!existsSync(schemaPath)) fail(`${e.id} schemaPaths.${name} points to missing ${schemaPath}`);
      else if (name !== "metadata") {
        const schemaDoc = JSON.parse(readFileSync(schemaPath, "utf8"));
        if (standard.schemaIds?.[name] && schemaDoc.$id !== standard.schemaIds[name]) {
          fail(`${e.id} schemaPaths.${name} $id must match schemaIds.${name}`);
        }
      }
    }
  }
}
for (const key of Object.keys(standardsMetadata.standards ?? {})) {
  if (!registry.entries.some((e) => e.slug === key)) fail(`standards metadata contains unknown ${key}`);
}
const kfd1 = standardsMetadata.standards?.["kfd-1"];
if (kfd1?.schemaIds?.contractWorld !== "https://kfd.libkungfu.dev/schemas/kfd-1/contract-world.schema.json") {
  fail("KFD-1 standards metadata must expose the canonical contractWorld schema URI");
}
if (kfd1?.schemaIds?.witness !== "https://kfd.libkungfu.dev/schemas/kfd-1/witness.schema.json") {
  fail("KFD-1 standards metadata must expose the canonical witness schema URI");
}
const kfd3 = standardsMetadata.standards?.["kfd-3"];
if (kfd3?.schemaIds?.collaborationInterface !== "https://kfd.libkungfu.dev/schemas/kfd-3/collaboration-interface.schema.json") {
  fail("KFD-3 standards metadata must expose the canonical collaborationInterface schema URI");
}
if (kfd3?.schemaIds?.witness !== "https://kfd.libkungfu.dev/schemas/kfd-3/witness.schema.json") {
  fail("KFD-3 standards metadata must expose the canonical witness schema URI");
}
if (kfd3?.schemaPaths?.collaborationInterface !== "schemas/kfd-3/collaboration-interface.schema.json") {
  fail("KFD-3 standards metadata must expose the collaborationInterface schema path");
}
if (kfd3?.schemaPaths?.witness !== "schemas/kfd-3/witness.schema.json") {
  fail("KFD-3 standards metadata must expose the witness schema path");
}
const kfd3CollaborationSchema = JSON.parse(readFileSync("schemas/kfd-3/collaboration-interface.schema.json", "utf8"));
const kfd3WitnessSchema = JSON.parse(readFileSync("schemas/kfd-3/witness.schema.json", "utf8"));
if (kfd3CollaborationSchema.properties?.contract?.const !== "kfd-3-collaboration-interface") {
  fail("KFD-3 collaborationInterface schema must describe the kfd-3-collaboration-interface contract");
}
if (kfd3WitnessSchema.properties?.contract?.const !== "kfd-3-witness") {
  fail("KFD-3 witness schema must describe the kfd-3-witness contract");
}
for (const concept of ["participant", "collaborationInterface", "minimalEntrypoint", "closure", "choicePath"]) {
  if (!kfd3?.concepts?.[concept]) fail(`KFD-3 standards metadata missing concept ${concept}`);
}
for (const [id, successors] of superseded) {
  for (const successor of successors) {
    if (!registry.entries.some((e) => e.id === successor)) fail(`${id} cites missing successor ${successor}`);
  }
}
const siteCommitments = new Map((siteBundle.homepage?.foundationTriad?.commitments ?? []).map((item) => [item.id, item]));
for (const e of registry.entries) {
  if (!siteCommitments.has(e.id)) fail(`site bundle foundationTriad missing ${e.id}`);
}
const siteLayers = new Map((siteBundle.homepage?.foundationModel?.layers ?? []).map((item) => [item.decision, item]));
for (const e of registry.entries) {
  if (!siteLayers.has(e.id)) fail(`site bundle foundationModel missing ${e.id}`);
}
const boundary = siteBundle.renderingBoundary ?? {};
if (!Array.isArray(boundary.ownedByKfd) || !boundary.ownedByKfd.includes("homepage title and text")) {
  fail("site bundle renderingBoundary.ownedByKfd must include homepage title and text");
}
if (!Array.isArray(boundary.ownedBySite) || !boundary.ownedBySite.includes("CSS")) {
  fail("site bundle renderingBoundary.ownedBySite must include CSS");
}
const impactLevels = new Set(["patch", "minor", "major"]);
const requiredSurfaces = new Set(["kfd-content", "kfd-registry-schema", "kfd-standards-metadata", "kfd-package-structure"]);

if (releaseImpact.schemaVersion !== 1) fail(`unsupported release-impact schemaVersion ${releaseImpact.schemaVersion}`);
if (releaseImpact.contract !== "kungfu-buildchain-impact") fail(`unexpected release-impact contract ${releaseImpact.contract}`);
if (!releaseImpact.versionImpact || !impactLevels.has(releaseImpact.versionImpact.final)) {
  fail("release-impact versionImpact.final must be patch, minor, or major");
}
if (!releaseImpact.versionImpact?.rationale) {
  fail("release-impact versionImpact.rationale is required");
}
if (!Array.isArray(releaseImpact.surfaceImpacts) || releaseImpact.surfaceImpacts.length === 0) {
  fail("release-impact surfaceImpacts[] is required");
} else {
  const seenSurfaces = new Set();
  for (const [index, surface] of releaseImpact.surfaceImpacts.entries()) {
    if (!surface.id) fail(`release-impact surfaceImpacts[${index}].id is required`);
    else seenSurfaces.add(surface.id);
    if (!impactLevels.has(surface.impact)) {
      fail(`release-impact surfaceImpacts[${index}].impact must be patch, minor, or major`);
    }
    if (!surface.rationale) fail(`release-impact surfaceImpacts[${index}].rationale is required`);
  }
  for (const surfaceId of requiredSurfaces) {
    if (!seenSurfaces.has(surfaceId)) fail(`release-impact missing surface ${surfaceId}`);
  }
}

if (process.exitCode) process.exit(process.exitCode);
console.log(`check: ${registry.entries.length} entries ok; release impact ok`);
