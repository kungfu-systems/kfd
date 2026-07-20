import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

const errors = [];
const fail = (message) => errors.push(message);
const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const sha256 = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");
const sameSet = (left, right) => {
  const actual = new Set(left);
  const expected = new Set(right);
  return actual.size === expected.size && [...actual].every((value) => expected.has(value));
};
const isRoot = (value) => /^sha256:[a-f0-9]{64}$/.test(value || "");
const requireFields = (value, fields, label) => {
  for (const field of fields) {
    if (value?.[field] === undefined) fail(`${label} missing ${field}`);
  }
};

const profileRoot = "protocols/agent-hub";
const manifestPath = `${profileRoot}/manifest.json`;
const manifestSchemaPath = "schemas/kfd-agent-hub/manifest.schema.json";
const capabilitiesSchemaPath = "schemas/kfd-agent-hub/capabilities.schema.json";
const exchangeSchemaPath = "schemas/kfd-agent-hub/exchange.schema.json";
const capabilityFixturePath = `${profileRoot}/fixtures/valid-capabilities.json`;
const exchangeFixturePath = `${profileRoot}/fixtures/valid-admission.json`;
const stateMachinePath = `${profileRoot}/reference-state-machine.json`;

for (const path of [
  manifestPath,
  manifestSchemaPath,
  capabilitiesSchemaPath,
  exchangeSchemaPath,
  capabilityFixturePath,
  exchangeFixturePath,
  stateMachinePath,
  `${profileRoot}/README.md`,
  `${profileRoot}/gap-matrix.md`,
  `${profileRoot}/state-machine.md`,
  `${profileRoot}/implementer-guide.md`,
]) {
  if (!existsSync(path)) fail(`missing Agent Hub profile surface ${path}`);
}

const manifest = readJson(manifestPath);
const manifestSchema = readJson(manifestSchemaPath);
const capabilitiesSchema = readJson(capabilitiesSchemaPath);
const exchangeSchema = readJson(exchangeSchemaPath);
const capability = readJson(capabilityFixturePath);
const exchange = readJson(exchangeFixturePath);
const stateMachine = readJson(stateMachinePath);
const packageJson = readJson("package.json");
const releaseImpact = readJson("release-impact.json");
const standards = readJson("standards.json");

if (manifest.$schema !== manifestSchema.$id) fail("manifest $schema must match manifest schema $id");
if (manifest.schemaVersion !== 1 || manifest.contract !== "kfd-agent-hub-profile-manifest") {
  fail("manifest identity must remain version 1 kfd-agent-hub-profile-manifest");
}
if (
  manifest.profile?.id !== "kfd-agent-hub" ||
  manifest.profile?.version !== "0.1.0-alpha.1" ||
  manifest.profile?.status !== "alpha" ||
  manifest.profile?.authorityPath !== `${profileRoot}/README.md`
) {
  fail("manifest profile coordinate drifted");
}
if (!sameSet(manifest.imports ?? [], ["KFD-1", "KFD-2", "KFD-3", "KFD-7"])) {
  fail("manifest must import exactly KFD-1, KFD-2, KFD-3, and KFD-7");
}
if (
  !sameSet(manifest.topologies ?? [], [
    "local-peer",
    "single-vendor-cloud",
    "multi-organization-federation",
    "offline-device",
  ])
) {
  fail("manifest topology set must preserve all four alpha topologies");
}

const surfaceIds = new Set();
const surfacePaths = new Set();
for (const [index, surface] of (manifest.surfaces ?? []).entries()) {
  requireFields(surface, ["id", "path", "role", "sha256"], `manifest surfaces[${index}]`);
  if (surfaceIds.has(surface.id)) fail(`duplicate manifest surface id ${surface.id}`);
  if (surfacePaths.has(surface.path)) fail(`duplicate manifest surface path ${surface.path}`);
  surfaceIds.add(surface.id);
  surfacePaths.add(surface.path);
  if (!existsSync(surface.path)) {
    fail(`manifest surface missing ${surface.path}`);
  } else if (sha256(surface.path) !== surface.sha256) {
    fail(`manifest digest mismatch ${surface.path}`);
  }
}
for (const id of [
  "profile-authority",
  "gap-matrix",
  "state-machine-guide",
  "implementer-guide",
  "reference-state-machine",
  "capabilities-schema",
  "exchange-schema",
  "manifest-schema",
]) {
  if (!surfaceIds.has(id)) fail(`manifest missing required surface ${id}`);
}

if (
  capabilitiesSchema.$id !==
    "https://kfd.libkungfu.dev/schemas/kfd-agent-hub/capabilities.schema.json" ||
  exchangeSchema.$id !==
    "https://kfd.libkungfu.dev/schemas/kfd-agent-hub/exchange.schema.json" ||
  manifestSchema.$id !==
    "https://kfd.libkungfu.dev/schemas/kfd-agent-hub/manifest.schema.json"
) {
  fail("Agent Hub schema IDs must remain canonical KFD URLs");
}
if (capability.$schema !== capabilitiesSchema.$id) fail("capability fixture schema drifted");
if (
  capability.schemaVersion !== 1 ||
  capability.contract !== "kfd-agent-hub-capabilities"
) {
  fail("capability fixture identity drifted");
}
if (!sameSet(capability.profileVersions ?? [], [manifest.profile.version])) {
  fail("capability fixture must advertise only the exact alpha profile version");
}
for (const [field, expected] of [
  ["operations", manifest.operations],
  ["topologies", manifest.topologies],
  ["failureCodes", manifest.failureCodes],
]) {
  if (!sameSet(capability[field] ?? [], expected ?? [])) {
    fail(`capability ${field} must match manifest`);
  }
}
if (!(capability.authorityRoots ?? []).every(isRoot)) {
  fail("capability authority roots must be SHA-256 roots");
}
if (!(capability.bindings ?? []).every((binding) => binding.transportReceipts === true)) {
  fail("every alpha binding must produce transport receipts");
}

const manifestDigest = `sha256:${sha256(manifestPath)}`;
if (exchange.$schema !== exchangeSchema.$id) fail("exchange fixture schema drifted");
requireFields(
  exchange,
  [
    "schemaVersion",
    "contract",
    "profile",
    "exchange",
    "source",
    "target",
    "subjects",
    "causal",
    "warrant",
    "disclosure",
    "payload",
    "transport",
    "receiverVerdict",
  ],
  "valid admission",
);
if (
  exchange.schemaVersion !== 1 ||
  exchange.contract !== "kfd-agent-hub-exchange" ||
  exchange.profile?.id !== manifest.profile.id ||
  exchange.profile?.version !== manifest.profile.version ||
  exchange.profile?.manifestDigest !== manifestDigest
) {
  fail("valid admission must bind the exact manifest coordinate");
}
const repositoryCommit = exchange.profile?.repositoryCommit ?? "";
if (
  !/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(repositoryCommit) ||
  /^([a-f0-9])\1+$/.test(repositoryCommit)
) {
  fail("valid admission must bind a non-placeholder repository commit");
}
for (const [label, endpoint] of [
  ["source", exchange.source],
  ["target", exchange.target],
]) {
  requireFields(endpoint, ["hubId", "nodeId", "actorId", "authorityRoots"], label);
  if (!(endpoint?.authorityRoots ?? []).every(isRoot)) fail(`${label} authority roots invalid`);
}
for (const field of [
  "pursuitRoot",
  "atlasRoot",
  "warrantRoot",
  "actionBindingRoot",
]) {
  if (!isRoot(exchange.subjects?.[field])) fail(`subjects.${field} must be a SHA-256 root`);
}
if (exchange.subjects?.warrantRoot !== exchange.warrant?.root) {
  fail("subject Warrant root must equal the declared Warrant root");
}
if (!sameSet(exchange.subjects?.episodeRoots ?? [], exchange.causal?.episodeRoots ?? [])) {
  fail("subject and causal Episode roots must agree");
}
const allowedActions = new Set(exchange.warrant?.allowedActions ?? []);
if ((exchange.warrant?.forbiddenActions ?? []).some((action) => allowedActions.has(action))) {
  fail("Warrant allowed and forbidden actions must be disjoint");
}
if (exchange.transport?.state === "delivered") {
  if (!isRoot(exchange.transport.receiptDigest) || !exchange.transport.deliveredAt) {
    fail("delivered transport must carry a rooted receipt and time");
  }
}
if (exchange.receiverVerdict?.status === "admitted") {
  if ((exchange.receiverVerdict.decisionAuthorityRoots ?? []).length === 0) {
    fail("admission requires receiver decision authority");
  }
  if (!(exchange.receiverVerdict.reasonCodes ?? []).includes("admission-accepted")) {
    fail("admission requires the admission-accepted reason");
  }
  if ((exchange.receiverVerdict.conflictRoots ?? []).length !== 0) {
    fail("admission cannot hide unresolved conflict roots");
  }
}
if (exchange.causal?.knowledgeState === "conflicted") {
  if (
    exchange.receiverVerdict?.status !== "conflicted" ||
    (exchange.receiverVerdict?.conflictRoots ?? []).length < 2
  ) {
    fail("conflicted knowledge must remain visible in the receiver verdict");
  }
}
if (
  exchange.warrant?.parentRoot &&
  exchange.warrant?.attenuation?.scopeRelation !== "narrower-or-equal"
) {
  fail("delegated Warrant must prove narrower-or-equal attenuation");
}
if (
  exchange.exchange?.operation === "completion-assessment" &&
  !exchange.receiverVerdict?.completionAssessment
) {
  fail("completion-assessment operation requires a completion assessment");
}

const negativeChecks = [
  [
    `${profileRoot}/fixtures/invalid-authority-amplification.json`,
    (fixture) =>
      fixture.record?.warrant?.attenuation?.scopeRelation === "narrower-or-equal"
        ? ""
        : "authority-amplification",
  ],
  [
    `${profileRoot}/fixtures/invalid-delivery-as-admission.json`,
    (fixture) =>
      fixture.record?.receiverVerdict?.status === "admitted" &&
      (fixture.record.receiverVerdict.decisionAuthorityRoots ?? []).length === 0
        ? "authority-unresolved"
        : "",
  ],
  [
    `${profileRoot}/fixtures/invalid-hidden-conflict.json`,
    (fixture) =>
      fixture.record?.causal?.knowledgeState === "conflicted" &&
      (fixture.record?.receiverVerdict?.status !== "conflicted" ||
        (fixture.record?.receiverVerdict?.conflictRoots ?? []).length < 2)
        ? "conflict-visible"
        : "",
  ],
  [
    `${profileRoot}/fixtures/invalid-idempotency-reuse.json`,
    (fixture) =>
      fixture.first?.sourceHubId === fixture.retry?.sourceHubId &&
      fixture.first?.idempotencyKey === fixture.retry?.idempotencyKey &&
      fixture.first?.exchangeRoot !== fixture.retry?.exchangeRoot
        ? "idempotency-conflict"
        : "",
  ],
];
for (const [path, detect] of negativeChecks) {
  const fixture = readJson(path);
  const detected = detect(fixture);
  if (!detected || detected !== fixture.expectedFailureCode) {
    fail(`${path} expected ${fixture.expectedFailureCode}, detected ${detected || "pass"}`);
  }
}

if (
  stateMachine.schemaVersion !== 1 ||
  stateMachine.contract !== "kfd-agent-hub-reference-state-machine" ||
  stateMachine.profile?.version !== manifest.profile.version
) {
  fail("reference state machine identity drifted");
}
const transitionEvents = new Set((stateMachine.transitions ?? []).map((entry) => entry.event));
for (const event of [
  "seal-offer",
  "transport-deliver",
  "begin-assessment",
  "admit",
  "reject",
  "retain-conflict",
  "mark-unavailable",
  "mark-withheld",
]) {
  if (!transitionEvents.has(event)) fail(`reference state machine missing ${event}`);
}
if (
  (stateMachine.transitions ?? []).some(
    (entry) =>
      entry.event === "transport-deliver" &&
      ["admitted", "rejected", "conflicted"].includes(entry.to?.verdict),
  )
) {
  fail("transport delivery must not directly produce a semantic verdict");
}
for (const invariant of [
  "transport-receipt-does-not-imply-admission",
  "episode-does-not-imply-completion",
  "delegation-does-not-amplify-authority",
  "same-idempotency-key-requires-same-exchange-root",
  "conflict-roots-remain-visible",
  "withheld-is-not-unavailable",
  "producer-does-not-self-admit-remote-facts",
]) {
  if (!(stateMachine.invariants ?? []).includes(invariant)) {
    fail(`reference state machine missing invariant ${invariant}`);
  }
}

const authorityText = readFileSync(`${profileRoot}/README.md`, "utf8");
for (const phrase of [
  "Delivery is not admission",
  "Occurrence is not completion",
  "Authority does not amplify",
  "Conflict remains visible",
  "Partial knowledge is typed",
  "Admission is local",
  "Unknown required semantics fail closed",
  "does not allocate or reserve a KFD number",
]) {
  if (!authorityText.includes(phrase)) fail(`profile authority missing boundary: ${phrase}`);
}
if (packageJson.scripts?.["check:agent-hub"] !== "node scripts/check-agent-hub-profile.mjs") {
  fail("package.json must expose check:agent-hub");
}
if (!packageJson.files?.includes("protocols")) fail("package files must publish protocols");
if (packageJson.exports?.["./protocols/*"] !== "./protocols/*") {
  fail("package exports must publish protocol surfaces");
}
const kfd1 = standards.standards?.["kfd-1"];
for (const [key, schemaId, schemaPath] of [
  [
    "agentHubManifest",
    "https://kfd.libkungfu.dev/schemas/kfd-agent-hub/manifest.schema.json",
    manifestSchemaPath,
  ],
  [
    "agentHubCapabilities",
    "https://kfd.libkungfu.dev/schemas/kfd-agent-hub/capabilities.schema.json",
    capabilitiesSchemaPath,
  ],
  [
    "agentHubExchange",
    "https://kfd.libkungfu.dev/schemas/kfd-agent-hub/exchange.schema.json",
    exchangeSchemaPath,
  ],
]) {
  if (
    kfd1?.schemaIds?.[key] !== schemaId ||
    kfd1?.schemaPaths?.[key] !== schemaPath ||
    kfd1?.interfaces?.[key]?.schemaId !== schemaId ||
    kfd1?.interfaces?.[key]?.schemaPath !== schemaPath
  ) {
    fail(`standards metadata must register ${key}`);
  }
}
const registeredSurfacePaths = new Set(
  (kfd1?.surfaceRegister?.surfaces ?? []).map((surface) => surface.sourcePath),
);
for (const path of [
  `${profileRoot}/README.md`,
  manifestPath,
  capabilitiesSchemaPath,
  exchangeSchemaPath,
  stateMachinePath,
]) {
  if (!registeredSurfacePaths.has(path)) fail(`KFD-1 surface register missing ${path}`);
}
if (
  !(releaseImpact.surfaceImpacts ?? []).some(
    (surface) =>
      surface.id === "kfd-agent-hub-alpha-profile" &&
      surface.impact === "minor" &&
      surface.class === "additive",
  )
) {
  fail("release impact must register the additive Agent Hub alpha profile");
}

if (errors.length > 0) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  process.exit(1);
}

console.log(
  `Agent Hub profile check passed: ${manifest.profile.id}@${manifest.profile.version}, ` +
    `${manifest.surfaces.length} rooted surfaces, ${negativeChecks.length} negative cases`,
);
