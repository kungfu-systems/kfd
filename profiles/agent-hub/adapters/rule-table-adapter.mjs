#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
import { handshake, response, serve } from "./protocol.mjs";

const adapter = { id: "kfd-agent-hub-rule-table", version: "0.1.0", topology: "multi-organization-federation" };
const A = (code, verdict = "admitted") => ({ status: "accepted", code, verdict });
const R = (code) => ({ status: "rejected", code, verdict: "rejected" });
const C = { status: "conflicted", code: "conflict-visible", verdict: "conflicted" };
const rules = new Map([
  ["negotiate-exact-profile", A("capability-negotiated")], ["reject-unknown-required-feature", R("required-feature-unsupported")],
  ["reject-profile-root-drift", R("profile-root-mismatch")], ["record-delivery-without-admission", A("delivery-recorded", "not-applicable")],
  ["preserve-identical-duplicate", A("duplicate-preserved", "not-applicable")], ["reject-idempotency-conflict", R("idempotency-conflict")],
  ["admit-under-local-authority", A("admission-accepted")], ["retain-delayed-delivery", A("delivery-recorded", "not-applicable")],
  ["attenuate-delegated-authority", A("authority-attenuated")], ["reject-authority-amplification", R("authority-amplification")],
  ["reject-revoked-warrant", R("authority-revoked")], ["surface-concurrent-conflict", C], ["reject-hidden-last-write-wins", R("conflict-visible")],
  ["retain-partial-knowledge", A("partial-knowledge-retained", "not-applicable")], ["retain-intentionally-withheld", A("partial-knowledge-retained", "intentionally-withheld")],
  ["retain-unavailable", A("partial-knowledge-retained", "unavailable")], ["reject-call-success-as-completion", R("completion-unproved")],
  ["surface-offline-reconnect-conflict", C], ["preserve-export-import-roots", A("export-import-preserved")], ["reject-export-import-drift", R("profile-root-mismatch")],
]);

serve((request) => request.operation === "handshake" ? handshake(adapter) : response(adapter, request, rules.get(request.input.scenario) ?? { status: "error", code: "scenario-unsupported", verdict: "not-applicable" }));
