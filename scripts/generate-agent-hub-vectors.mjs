// SPDX-License-Identifier: Apache-2.0
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "profiles", "agent-hub", "vectors", "hub-20.json");
const outcome = (status, code, verdict) => ({ status, code, verdict });
const accepted = (code, verdict = "admitted") => outcome("accepted", code, verdict);
const rejected = (code, verdict = "rejected") => outcome("rejected", code, verdict);
const conflicted = () => outcome("conflicted", "conflict-visible", "conflicted");

function vector(number, slug, category, claim, input, expect) {
  return {
    id: `hub-${String(number).padStart(3, "0")}-${slug}`,
    category,
    polarity: expect.status === "accepted" ? "positive" : "negative",
    claim,
    request: { scenario: slug, input },
    expect,
  };
}

const roots = Object.fromEntries("abcdef".split("").map((key) => [key, `sha256:${key.repeat(64)}`]));
const vectors = [
  vector(1, "negotiate-exact-profile", "negotiation", "Two Hubs negotiate the exact alpha profile and required capability set.", { profile: "0.1.0-alpha.1", profileRoot: roots.a, requiredFeatures: ["transport-receipts"] }, accepted("capability-negotiated")),
  vector(2, "reject-unknown-required-feature", "negotiation", "An unknown required feature fails closed.", { requiredFeatures: ["future-normative-feature"] }, rejected("required-feature-unsupported")),
  vector(3, "reject-profile-root-drift", "negotiation", "A peer cannot silently substitute another profile root.", { localProfileRoot: roots.a, remoteProfileRoot: roots.b }, rejected("profile-root-mismatch")),
  vector(4, "record-delivery-without-admission", "delivery", "Transport delivery remains distinct from semantic admission.", { delivered: true, admitted: false, receiptRoot: roots.c }, accepted("delivery-recorded", "not-applicable")),
  vector(5, "preserve-identical-duplicate", "delivery", "At-least-once duplicate delivery preserves one semantic payload root.", { firstPayloadRoot: roots.d, duplicatePayloadRoot: roots.d, idempotencyKey: "delivery-5" }, accepted("duplicate-preserved", "not-applicable")),
  vector(6, "reject-idempotency-conflict", "delivery", "An idempotency key cannot name two payload roots.", { firstPayloadRoot: roots.d, duplicatePayloadRoot: roots.e, idempotencyKey: "delivery-6" }, rejected("idempotency-conflict")),
  vector(7, "admit-under-local-authority", "delivery", "Receipt plus local decision authority can produce admission.", { delivered: true, decisionAuthorityRoots: [roots.a], localPolicy: "allow" }, accepted("admission-accepted")),
  vector(8, "retain-delayed-delivery", "delivery", "A delayed transport record does not fabricate admission.", { delivered: false, delayed: true }, accepted("delivery-recorded", "not-applicable")),
  vector(9, "attenuate-delegated-authority", "authority", "Cross-Hub delegation may narrow action and time scope.", { parentActions: ["read", "append"], childActions: ["read"], parentExpiresAt: 200, childExpiresAt: 150 }, accepted("authority-attenuated")),
  vector(10, "reject-authority-amplification", "authority", "Cross-Hub delegation cannot add an action.", { parentActions: ["read"], childActions: ["read", "delete"], parentExpiresAt: 200, childExpiresAt: 150 }, rejected("authority-amplification")),
  vector(11, "reject-revoked-warrant", "authority", "Revocation remains effective after transport and reconnect.", { warrantStatus: "revoked", requestedAction: "read" }, rejected("authority-revoked")),
  vector(12, "surface-concurrent-conflict", "conflict", "Concurrent non-dominating facts remain explicitly conflicted.", { leftClock: { alpha: 2 }, rightClock: { beta: 2 }, policy: "retain-conflict" }, conflicted()),
  vector(13, "reject-hidden-last-write-wins", "conflict", "A last-write-wins collapse cannot hide unresolved concurrent facts.", { concurrent: true, policy: "last-write-wins", conflictRoots: [roots.a, roots.b] }, rejected("conflict-visible")),
  vector(14, "retain-partial-knowledge", "knowledge", "Partial knowledge is typed and remains distinguishable from absence.", { disclosure: "partial", knownFields: ["status"], omittedFields: ["evidence"] }, accepted("partial-knowledge-retained", "not-applicable")),
  vector(15, "retain-intentionally-withheld", "knowledge", "Intentionally withheld information is not reported as unavailable.", { disclosure: "intentionally-withheld", reason: "local-policy" }, accepted("partial-knowledge-retained", "intentionally-withheld")),
  vector(16, "retain-unavailable", "knowledge", "Unavailable information remains distinct from withheld information.", { disclosure: "unavailable", reason: "offline-source" }, accepted("partial-knowledge-retained", "unavailable")),
  vector(17, "reject-call-success-as-completion", "completion", "A successful call is not evidence that the Pursuit completed.", { callSucceeded: true, completionVerdict: "unproved" }, rejected("completion-unproved")),
  vector(18, "surface-offline-reconnect-conflict", "recovery", "Offline edits that diverge remain conflicted after reconnect.", { offline: true, reconnect: true, divergentRoots: [roots.e, roots.f] }, conflicted()),
  vector(19, "preserve-export-import-roots", "portability", "Export and import preserve exact profile, payload, and capability roots.", { exportedProfileRoot: roots.a, importedProfileRoot: roots.a, exportedPayloadRoot: roots.b, importedPayloadRoot: roots.b }, accepted("export-import-preserved")),
  vector(20, "reject-export-import-drift", "portability", "Import fails closed when the profile root changes.", { exportedProfileRoot: roots.a, importedProfileRoot: roots.c }, rejected("profile-root-mismatch")),
];

assert.equal(vectors.length, 20);
assert.equal(new Set(vectors.map(({ id }) => id)).size, 20);
const registry = {
  schemaVersion: 1,
  contract: "kfd.agent-hub-vector-registry/v1",
  suite: { id: "kfd-agent-hub-20", version: "0.1.0-alpha.1", profile: "kfd-agent-hub@0.1.0-alpha.1", qualifying: false },
  vectors,
};
const rendered = `${JSON.stringify(registry, null, 2)}\n`;
if (process.argv.includes("--write")) {
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, rendered);
} else {
  assert.equal(fs.readFileSync(output, "utf8"), rendered, "Agent Hub vector registry drifted; run npm run generate:agent-hub-vectors");
}
