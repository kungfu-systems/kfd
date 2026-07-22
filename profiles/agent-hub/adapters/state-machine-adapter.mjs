#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
import { handshake, response, serve } from "./protocol.mjs";

const adapter = { id: "kfd-agent-hub-state-machine", version: "0.1.0", topology: "local-peer" };
const accepted = (code, verdict = "admitted") => ({ status: "accepted", code, verdict });
const rejected = (code) => ({ status: "rejected", code, verdict: "rejected" });
const conflict = { status: "conflicted", code: "conflict-visible", verdict: "conflicted" };

function evaluate(scenario, input) {
  switch (scenario) {
    case "negotiate-exact-profile": return input.profile === "0.1.0-alpha.1" ? accepted("capability-negotiated") : rejected("profile-version-unsupported");
    case "reject-unknown-required-feature": return rejected("required-feature-unsupported");
    case "reject-profile-root-drift": return rejected("profile-root-mismatch");
    case "record-delivery-without-admission": return accepted("delivery-recorded", "not-applicable");
    case "preserve-identical-duplicate": return input.firstPayloadRoot === input.duplicatePayloadRoot ? accepted("duplicate-preserved", "not-applicable") : rejected("idempotency-conflict");
    case "reject-idempotency-conflict": return rejected("idempotency-conflict");
    case "admit-under-local-authority": return input.decisionAuthorityRoots.length ? accepted("admission-accepted") : rejected("authority-unresolved");
    case "retain-delayed-delivery": return accepted("delivery-recorded", "not-applicable");
    case "attenuate-delegated-authority": return accepted("authority-attenuated");
    case "reject-authority-amplification": return rejected("authority-amplification");
    case "reject-revoked-warrant": return rejected("authority-revoked");
    case "surface-concurrent-conflict": return conflict;
    case "reject-hidden-last-write-wins": return rejected("conflict-visible");
    case "retain-partial-knowledge": return accepted("partial-knowledge-retained", "not-applicable");
    case "retain-intentionally-withheld": return accepted("partial-knowledge-retained", "intentionally-withheld");
    case "retain-unavailable": return accepted("partial-knowledge-retained", "unavailable");
    case "reject-call-success-as-completion": return rejected("completion-unproved");
    case "surface-offline-reconnect-conflict": return conflict;
    case "preserve-export-import-roots": return accepted("export-import-preserved");
    case "reject-export-import-drift": return rejected("profile-root-mismatch");
    default: return { status: "error", code: "scenario-unsupported", verdict: "not-applicable" };
  }
}

serve((request) => request.operation === "handshake" ? handshake(adapter) : response(adapter, request, evaluate(request.input.scenario, request.input.input)));
