// Registry conformance check: the registry, decision documents, and release
// impact ledger must agree, so a release cannot ship evidence that lies about
// its contents or versioning surface.
import { readFileSync, existsSync } from "node:fs";

const fail = (msg) => { console.error(`check: ${msg}`); process.exitCode = 1; };
const registry = JSON.parse(readFileSync("registry.json", "utf8"));
const releaseImpact = JSON.parse(readFileSync("release-impact.json", "utf8"));

if (registry.schemaVersion !== 1) fail(`unsupported schemaVersion ${registry.schemaVersion}`);
if (registry.contract !== "kfd-registry") fail(`unexpected contract ${registry.contract}`);

const seen = new Set();
const statuses = new Set(["draft", "active", "superseded"]);
const kinds = new Set(["principle", "procedure"]);
const superseded = new Map();
for (const e of registry.entries) {
  if (!Number.isInteger(e.number) || e.number < 1) fail(`bad number ${e.number}`);
  if (seen.has(e.number)) fail(`duplicate number ${e.number}`);
  seen.add(e.number);
  if (e.id !== `KFD-${e.number}`) fail(`id ${e.id} does not match number ${e.number}`);
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
}
for (const [id, successors] of superseded) {
  for (const successor of successors) {
    if (!registry.entries.some((e) => e.id === successor)) fail(`${id} cites missing successor ${successor}`);
  }
}
const impactLevels = new Set(["patch", "minor", "major"]);
const requiredSurfaces = new Set(["kfd-content", "kfd-registry-schema", "kfd-package-structure"]);

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
