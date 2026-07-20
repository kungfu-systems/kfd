#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
import {
  hasDuplicates,
  isContiguous,
  isRoot,
  isSubset,
  result,
  runAdapter,
} from "./protocol.mjs";

const rule = (when, code) => ({ when, code });
const success = (code) => ({ success: code, rules: [] });
const table = new Map();
const define = (operation, acceptedCode, rules) =>
  table.set(operation, { success: acceptedCode, rules });

define("pursuit.create", "pursuit-created", [
  rule(({ state }) => Boolean(state), "pursuit-already-exists"),
  rule(({ target }) => target?.version !== 1, "pursuit-version-gap"),
]);
define("pursuit.revise", "pursuit-revised", [
  rule(({ state }) => !state || state.status !== "active", "pursuit-not-active"),
  rule(({ state, baseVersion }) => baseVersion !== state?.version, "pursuit-stale-version"),
  rule(({ state, targetVersion }) => targetVersion !== state?.version + 1, "pursuit-version-gap"),
]);
define("pursuit.fork", "pursuit-forked", [
  rule(({ state }) => !state || state.status !== "active", "pursuit-not-active"),
  rule(({ state, baseVersion }) => baseVersion !== state?.version, "pursuit-stale-version"),
  rule(({ state, fork }) => fork?.id === state?.id, "pursuit-identity-reuse"),
  rule(({ fork }) => fork?.version !== 1, "pursuit-version-gap"),
]);
define("pursuit.settle", "pursuit-settled", [
  rule(({ state }) => !state || state.status !== "active", "pursuit-not-active"),
  rule(({ state, baseVersion }) => baseVersion !== state?.version, "pursuit-stale-version"),
  rule(({ completionVerdict }) => !completionVerdict, "completion-verdict-missing"),
  rule(({ completionVerdict }) => completionVerdict !== "admitted", "completion-verdict-not-admitted"),
]);

define("atlas.cut", "atlas-cut-created", [
  rule(({ sourceRoots }) => !Array.isArray(sourceRoots) || sourceRoots.length === 0, "atlas-source-roots-missing"),
  rule(({ sourceRoots }) => hasDuplicates(sourceRoots), "atlas-source-root-duplicate"),
]);
define("atlas.derive", "atlas-derived", [
  rule(({ state }) => !state, "atlas-cut-missing"),
  rule(({ state }) => state?.status === "stale", "atlas-cut-stale"),
  rule(({ state, baseCutRoot }) => baseCutRoot !== state?.cutRoot, "atlas-cut-mismatch"),
  rule(({ derivedRoot }) => !isRoot(derivedRoot), "atlas-derived-root-missing"),
]);
define("atlas.refresh", "atlas-refreshed", [
  rule(({ state }) => !state, "atlas-cut-missing"),
  rule(({ state }) => state?.status === "stale", "atlas-cut-stale"),
  rule(({ state, baseCutRoot }) => baseCutRoot !== state?.cutRoot, "atlas-cut-mismatch"),
  rule(({ state, sourceRoot }) => sourceRoot !== state?.sourceRoot, "atlas-source-root-mismatch"),
  rule(({ nextCutRoot }) => !isRoot(nextCutRoot), "atlas-next-cut-missing"),
]);
define("atlas.mark-stale", "atlas-marked-stale", [
  rule(({ state }) => !state, "atlas-cut-missing"),
  rule(({ state }) => state?.status === "stale", "atlas-already-stale"),
  rule(({ reason }) => !reason, "atlas-stale-reason-missing"),
]);

define("warrant.issue", "warrant-issued", [
  rule(({ grant }) => !isRoot(grant?.authorityRoot), "warrant-authority-root-missing"),
]);
for (const operation of ["warrant.attenuate", "warrant.delegate"]) {
  define(operation, operation === "warrant.attenuate" ? "warrant-attenuated" : "warrant-delegated", [
    rule(({ state }) => !isRoot(state?.authorityRoot), "warrant-authority-root-missing"),
    rule(({ state }) => state?.status !== "active", "warrant-not-active"),
    rule(({ grant }) => !Array.isArray(grant?.allowedActions) || grant.allowedActions.length === 0, "warrant-actions-missing"),
    rule(({ state, grant }) => !isSubset(grant?.allowedActions, state?.allowedActions), "warrant-authority-amplification"),
    rule(({ state, grant }) => grant?.scope !== state?.scope, "warrant-scope-amplification"),
    rule(({ state, grant }) => grant?.expiresAt > state?.expiresAt, "warrant-expiry-amplification"),
  ]);
}
define("warrant.revoke", "warrant-revoked", [
  rule(({ state }) => !isRoot(state?.authorityRoot), "warrant-authority-root-missing"),
  rule(({ state, authorityRoot }) => authorityRoot !== state?.authorityRoot, "warrant-revoker-unauthorized"),
]);
define("warrant.use", "warrant-authorized", [
  rule(({ state }) => !isRoot(state?.authorityRoot), "warrant-authority-root-missing"),
  rule(({ state }) => state?.status === "revoked", "warrant-revoked"),
  rule(({ state, action }) => !state?.allowedActions.includes(action), "warrant-action-forbidden"),
  rule(({ state, scope }) => scope !== state?.scope, "warrant-scope-mismatch"),
  rule(({ state, now }) => now > state?.expiresAt, "warrant-expired"),
]);

define("action.bind", "action-bound", [
  rule(({ binding }) => !isRoot(binding?.pursuitRoot), "action-pursuit-root-missing"),
  rule(({ binding }) => !isRoot(binding?.atlasRoot), "action-atlas-root-missing"),
  rule(({ binding }) => !isRoot(binding?.warrantRoot), "action-warrant-root-missing"),
  rule(({ binding }) => !isRoot(binding?.actionRoot), "action-root-missing"),
  rule(({ binding }) => !binding?.preconditionsSatisfied, "action-precondition-failed"),
  rule(({ binding }) => !binding?.warrantActive, "action-warrant-inactive"),
]);
table.set("action.assess", {
  success: (input) => {
    if (input.factVerdict === "admitted") return "receiver-verdict-retained";
    if (input.transportDelivered) return "delivery-kept-separate";
    if (input.episodeSealed) return "occurrence-kept-separate";
    if (input.callSucceeded) return "call-kept-separate";
    return "action-assessment-empty";
  },
  rules: [
    rule(({ receiverVerdict }) => receiverVerdict === "inferred-from-delivery", "delivery-is-not-admission"),
    rule(({ completionVerdict }) => completionVerdict === "inferred-from-seal", "episode-is-not-completion"),
    rule(({ factVerdict }) => factVerdict === "inferred-from-call", "call-is-not-admission"),
    rule(({ factVerdict, verdictAuthority }) => factVerdict === "admitted" && verdictAuthority === "producer", "producer-cannot-self-admit"),
  ],
});

define("episode.open", "episode-opened", [
  rule(({ state }) => Boolean(state), "episode-already-exists"),
]);
define("episode.append", "episode-appended", [
  rule(({ state, index }) => index !== state?.nextIndex, "episode-index-gap"),
  rule(({ claimRoot }) => !isRoot(claimRoot), "episode-claim-root-missing"),
]);
define("episode.commit", "episode-committed", [
  rule(({ contentRoot }) => !isRoot(contentRoot), "episode-content-root-missing"),
]);
table.set("episode.interrupt", success("episode-interrupted"));
define("episode.seal", "episode-sealed", [
  rule(({ state }) => state?.status !== "committed", "episode-not-committed"),
]);
define("episode.replay", "episode-replayed", [
  rule(({ semanticRoot, observedRoot }) => semanticRoot !== observedRoot, "episode-root-mismatch"),
]);
table.set("fact.propose", success("fact-proposed"));
define("fact.admit", "fact-admitted", [
  rule(({ verdictAuthority }) => verdictAuthority !== "receiver", "fact-admitter-unauthorized"),
]);
table.set("fact.reject", success("fact-rejected"));
define("fact.conflict", "fact-conflicted", [
  rule(({ roots }) => !Array.isArray(roots) || new Set(roots).size < 2, "fact-conflict-roots-incomplete"),
]);
define("fact.supersede", "fact-superseded", [
  rule(({ state }) => !["admitted", "conflicted"].includes(state?.status), "fact-not-admitted"),
]);

define("runtime.crash", "runtime-crash-bounded", [
  rule(({ state }) => state?.acknowledgedSeq > state?.durableSeq, "runtime-ack-ahead-of-durability"),
]);
define("runtime.reopen", "runtime-reopened", [
  rule(({ state, observedProviderRoot }) => observedProviderRoot !== state?.providerRoot, "runtime-provider-root-mismatch"),
]);
define("runtime.fsck", "runtime-fsck-clean", [
  rule(({ state }) => state?.expectedRoot !== state?.observedRoot, "runtime-root-mismatch"),
]);
define("runtime.export", "runtime-exported", [
  rule(({ exportedRoot }) => !isRoot(exportedRoot), "runtime-export-root-missing"),
]);
define("runtime.import", "runtime-imported", [
  rule(({ declaredRoot, observedRoot }) => declaredRoot !== observedRoot, "runtime-import-root-mismatch"),
]);
define("runtime.replay", "runtime-replayed", [
  rule(({ indexes }) => !isContiguous(indexes), "runtime-replay-gap"),
]);
define("runtime.retry", "runtime-retry-idempotent", [
  rule(({ previous, next }) => previous?.key !== next?.key || previous?.exchangeRoot !== next?.exchangeRoot, "runtime-idempotency-reuse"),
]);
define("runtime.reconnect", "runtime-conflict-retained", [
  rule(({ localRoot, remoteRoot, conflictRoots }) => {
    const roots = new Set(conflictRoots ?? []);
    return !roots.has(localRoot) || !roots.has(remoteRoot);
  }, "runtime-conflict-hidden"),
]);

function evaluate(request) {
  const entry = table.get(request?.operation);
  if (!entry) return result("rejected", "operation-unsupported");
  const input = request.input ?? {};
  for (const rejection of entry.rules) {
    if (rejection.when(input)) return result("rejected", rejection.code);
  }
  const acceptedCode =
    typeof entry.success === "function" ? entry.success(input) : entry.success;
  if (acceptedCode === "action-assessment-empty") {
    return result("rejected", acceptedCode);
  }
  return result("accepted", acceptedCode);
}

runAdapter(
  {
    id: "kfd-reference-rule-table",
    version: "0.1.0",
    topology: "declarative-rule-table-subprocess",
  },
  evaluate,
);
