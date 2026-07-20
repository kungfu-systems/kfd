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

const accept = (code) => result("accepted", code);
const reject = (code) => result("rejected", code);

function pursuit(operation, input) {
  const state = input.state;
  if (operation === "pursuit.create") {
    if (state) return reject("pursuit-already-exists");
    if (input.target?.version !== 1) return reject("pursuit-version-gap");
    return accept("pursuit-created");
  }
  if (!state || state.status !== "active") return reject("pursuit-not-active");
  if (input.baseVersion !== state.version) return reject("pursuit-stale-version");
  if (operation === "pursuit.revise") {
    return input.targetVersion === state.version + 1
      ? accept("pursuit-revised")
      : reject("pursuit-version-gap");
  }
  if (operation === "pursuit.fork") {
    if (input.fork?.id === state.id) return reject("pursuit-identity-reuse");
    return input.fork?.version === 1
      ? accept("pursuit-forked")
      : reject("pursuit-version-gap");
  }
  if (operation === "pursuit.settle") {
    if (!input.completionVerdict) return reject("completion-verdict-missing");
    return input.completionVerdict === "admitted"
      ? accept("pursuit-settled")
      : reject("completion-verdict-not-admitted");
  }
  return reject("operation-unsupported");
}

function atlas(operation, input) {
  const state = input.state;
  if (operation === "atlas.cut") {
    if (!Array.isArray(input.sourceRoots) || input.sourceRoots.length === 0) {
      return reject("atlas-source-roots-missing");
    }
    if (hasDuplicates(input.sourceRoots)) return reject("atlas-source-root-duplicate");
    return accept("atlas-cut-created");
  }
  if (!state) return reject("atlas-cut-missing");
  if (operation === "atlas.mark-stale") {
    if (state.status === "stale") return reject("atlas-already-stale");
    return input.reason
      ? accept("atlas-marked-stale")
      : reject("atlas-stale-reason-missing");
  }
  if (state.status === "stale") return reject("atlas-cut-stale");
  if (input.baseCutRoot !== state.cutRoot) return reject("atlas-cut-mismatch");
  if (operation === "atlas.derive") {
    return isRoot(input.derivedRoot)
      ? accept("atlas-derived")
      : reject("atlas-derived-root-missing");
  }
  if (operation === "atlas.refresh") {
    if (input.sourceRoot !== state.sourceRoot) return reject("atlas-source-root-mismatch");
    return isRoot(input.nextCutRoot)
      ? accept("atlas-refreshed")
      : reject("atlas-next-cut-missing");
  }
  return reject("operation-unsupported");
}

function warrant(operation, input) {
  const state = input.state;
  if (operation === "warrant.issue") {
    return isRoot(input.grant?.authorityRoot)
      ? accept("warrant-issued")
      : reject("warrant-authority-root-missing");
  }
  if (!state || !isRoot(state.authorityRoot)) {
    return reject("warrant-authority-root-missing");
  }
  if (operation === "warrant.revoke") {
    return input.authorityRoot === state.authorityRoot
      ? accept("warrant-revoked")
      : reject("warrant-revoker-unauthorized");
  }
  if (operation === "warrant.use") {
    if (state.status === "revoked") return reject("warrant-revoked");
    if (!state.allowedActions.includes(input.action)) return reject("warrant-action-forbidden");
    if (state.scope !== input.scope) return reject("warrant-scope-mismatch");
    if (input.now > state.expiresAt) return reject("warrant-expired");
    return accept("warrant-authorized");
  }
  if (state.status !== "active") return reject("warrant-not-active");
  const grant = input.grant ?? {};
  if (!Array.isArray(grant.allowedActions) || grant.allowedActions.length === 0) {
    return reject("warrant-actions-missing");
  }
  if (!isSubset(grant.allowedActions, state.allowedActions)) {
    return reject("warrant-authority-amplification");
  }
  if (grant.scope !== state.scope) return reject("warrant-scope-amplification");
  if (grant.expiresAt > state.expiresAt) return reject("warrant-expiry-amplification");
  if (operation === "warrant.attenuate") return accept("warrant-attenuated");
  if (operation === "warrant.delegate") return accept("warrant-delegated");
  return reject("operation-unsupported");
}

function action(operation, input) {
  if (operation === "action.bind") {
    const binding = input.binding ?? {};
    for (const [field, code] of [
      ["pursuitRoot", "action-pursuit-root-missing"],
      ["atlasRoot", "action-atlas-root-missing"],
      ["warrantRoot", "action-warrant-root-missing"],
      ["actionRoot", "action-root-missing"],
    ]) {
      if (!isRoot(binding[field])) return reject(code);
    }
    if (!binding.preconditionsSatisfied) return reject("action-precondition-failed");
    if (!binding.warrantActive) return reject("action-warrant-inactive");
    return accept("action-bound");
  }
  if (operation !== "action.assess") return reject("operation-unsupported");
  if (input.receiverVerdict === "inferred-from-delivery") {
    return reject("delivery-is-not-admission");
  }
  if (input.completionVerdict === "inferred-from-seal") {
    return reject("episode-is-not-completion");
  }
  if (input.factVerdict === "inferred-from-call") {
    return reject("call-is-not-admission");
  }
  if (input.factVerdict === "admitted" && input.verdictAuthority === "producer") {
    return reject("producer-cannot-self-admit");
  }
  if (input.factVerdict === "admitted") return accept("receiver-verdict-retained");
  if (input.transportDelivered) return accept("delivery-kept-separate");
  if (input.episodeSealed) return accept("occurrence-kept-separate");
  if (input.callSucceeded) return accept("call-kept-separate");
  return reject("action-assessment-empty");
}

function episodeFact(operation, input) {
  const state = input.state;
  if (operation === "episode.open") {
    return state ? reject("episode-already-exists") : accept("episode-opened");
  }
  if (operation === "episode.append") {
    if (input.index !== state?.nextIndex) return reject("episode-index-gap");
    return isRoot(input.claimRoot)
      ? accept("episode-appended")
      : reject("episode-claim-root-missing");
  }
  if (operation === "episode.commit") {
    return isRoot(input.contentRoot)
      ? accept("episode-committed")
      : reject("episode-content-root-missing");
  }
  if (operation === "episode.interrupt") return accept("episode-interrupted");
  if (operation === "episode.seal") {
    if (state?.status !== "committed") return reject("episode-not-committed");
    return accept("episode-sealed");
  }
  if (operation === "episode.replay") {
    return input.semanticRoot === input.observedRoot
      ? accept("episode-replayed")
      : reject("episode-root-mismatch");
  }
  if (operation === "fact.propose") return accept("fact-proposed");
  if (operation === "fact.admit") {
    return input.verdictAuthority === "receiver"
      ? accept("fact-admitted")
      : reject("fact-admitter-unauthorized");
  }
  if (operation === "fact.reject") return accept("fact-rejected");
  if (operation === "fact.conflict") {
    return Array.isArray(input.roots) && new Set(input.roots).size >= 2
      ? accept("fact-conflicted")
      : reject("fact-conflict-roots-incomplete");
  }
  if (operation === "fact.supersede") {
    return state?.status === "admitted" || state?.status === "conflicted"
      ? accept("fact-superseded")
      : reject("fact-not-admitted");
  }
  return reject("operation-unsupported");
}

function recovery(operation, input) {
  const state = input.state ?? {};
  if (operation === "runtime.crash") {
    return state.acknowledgedSeq <= state.durableSeq
      ? accept("runtime-crash-bounded")
      : reject("runtime-ack-ahead-of-durability");
  }
  if (operation === "runtime.reopen") {
    return input.observedProviderRoot === state.providerRoot
      ? accept("runtime-reopened")
      : reject("runtime-provider-root-mismatch");
  }
  if (operation === "runtime.fsck") {
    return state.expectedRoot === state.observedRoot
      ? accept("runtime-fsck-clean")
      : reject("runtime-root-mismatch");
  }
  if (operation === "runtime.export") {
    return isRoot(input.exportedRoot)
      ? accept("runtime-exported")
      : reject("runtime-export-root-missing");
  }
  if (operation === "runtime.import") {
    return input.declaredRoot === input.observedRoot
      ? accept("runtime-imported")
      : reject("runtime-import-root-mismatch");
  }
  if (operation === "runtime.replay") {
    return isContiguous(input.indexes)
      ? accept("runtime-replayed")
      : reject("runtime-replay-gap");
  }
  if (operation === "runtime.retry") {
    return input.previous?.key === input.next?.key &&
      input.previous?.exchangeRoot === input.next?.exchangeRoot
      ? accept("runtime-retry-idempotent")
      : reject("runtime-idempotency-reuse");
  }
  if (operation === "runtime.reconnect") {
    const roots = new Set(input.conflictRoots ?? []);
    return roots.has(input.localRoot) && roots.has(input.remoteRoot)
      ? accept("runtime-conflict-retained")
      : reject("runtime-conflict-hidden");
  }
  return reject("operation-unsupported");
}

function evaluate(request) {
  const { category, operation, input } = request ?? {};
  switch (category) {
    case "pursuit":
      return pursuit(operation, input);
    case "atlas":
      return atlas(operation, input);
    case "warrant":
      return warrant(operation, input);
    case "action":
      return action(operation, input);
    case "episode-fact":
      return episodeFact(operation, input);
    case "recovery":
      return recovery(operation, input);
    default:
      return reject("category-unsupported");
  }
}

runAdapter(
  {
    id: "kfd-reference-state-machine",
    version: "0.1.0",
    topology: "single-process-state-machine",
  },
  evaluate,
);
