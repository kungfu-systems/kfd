// SPDX-License-Identifier: Apache-2.0
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(
  root,
  "profiles",
  "agent-runtime",
  "vectors",
  "runtime-100.json",
);

const hash = (character) => `sha256:${character.repeat(64)}`;
const accepted = (code) => ({ status: "accepted", code });
const rejected = (code) => ({ status: "rejected", code });

function vector(category, number, slug, partition, operation, input, expect, claim) {
  return {
    id: `${category}-${String(number).padStart(3, "0")}-${slug}`,
    partition,
    category,
    polarity: expect.status === "accepted" ? "positive" : "negative",
    request: {
      operation,
      input,
    },
    expect,
    claim,
  };
}

function pursuitVectors() {
  const state = { id: "pursuit:alpha", version: 2, status: "active" };
  return [
    vector("pursuit", 1, "create-version-one", "experimental", "pursuit.create",
      { state: null, target: { id: "pursuit:new", version: 1 } },
      accepted("pursuit-created"), "Pursuit identity begins at an explicit version."),
    vector("pursuit", 2, "reject-create-overwrite", "experimental", "pursuit.create",
      { state, target: { id: state.id, version: 1 } },
      rejected("pursuit-already-exists"), "Creation cannot overwrite an existing Pursuit."),
    vector("pursuit", 3, "revise-next-version", "experimental", "pursuit.revise",
      { state, baseVersion: 2, targetVersion: 3 },
      accepted("pursuit-revised"), "Revision binds the exact predecessor version."),
    vector("pursuit", 4, "reject-stale-revision", "experimental", "pursuit.revise",
      { state, baseVersion: 1, targetVersion: 3 },
      rejected("pursuit-stale-version"), "A stale revision fails closed."),
    vector("pursuit", 5, "reject-version-skip", "experimental", "pursuit.revise",
      { state, baseVersion: 2, targetVersion: 4 },
      rejected("pursuit-version-gap"), "Revision cannot silently skip versions."),
    vector("pursuit", 6, "fork-from-exact-version", "experimental", "pursuit.fork",
      { state, baseVersion: 2, fork: { id: "pursuit:fork-a", version: 1 } },
      accepted("pursuit-forked"), "Fork lineage names the exact source version."),
    vector("pursuit", 7, "reject-fork-without-lineage", "experimental", "pursuit.fork",
      { state, baseVersion: 1, fork: { id: "pursuit:fork-b", version: 1 } },
      rejected("pursuit-stale-version"), "A fork cannot claim an unbound lineage."),
    vector("pursuit", 8, "reject-fork-identity-reuse", "experimental", "pursuit.fork",
      { state, baseVersion: 2, fork: { id: state.id, version: 1 } },
      rejected("pursuit-identity-reuse"), "A fork has an independently addressable identity."),
    vector("pursuit", 9, "settle-with-admitted-verdict", "experimental", "pursuit.settle",
      { state, baseVersion: 2, completionVerdict: "admitted" },
      accepted("pursuit-settled"), "Settlement requires an explicit completion verdict."),
    vector("pursuit", 10, "reject-call-success-as-settlement", "experimental", "pursuit.settle",
      { state, baseVersion: 2, completionVerdict: "call-succeeded" },
      rejected("completion-verdict-not-admitted"), "Call success is not Pursuit completion."),
    vector("pursuit", 11, "reject-sealed-episode-as-settlement", "experimental", "pursuit.settle",
      { state, baseVersion: 2, completionVerdict: "episode-sealed" },
      rejected("completion-verdict-not-admitted"), "A sealed Episode is not Pursuit completion."),
    vector("pursuit", 12, "reject-fact-admission-as-settlement", "experimental", "pursuit.settle",
      { state, baseVersion: 2, completionVerdict: "fact-admitted" },
      rejected("completion-verdict-not-admitted"), "Fact admission alone is not Pursuit completion."),
    vector("pursuit", 13, "reject-stale-settlement", "experimental", "pursuit.settle",
      { state, baseVersion: 1, completionVerdict: "admitted" },
      rejected("pursuit-stale-version"), "Settlement binds the current Pursuit version."),
    vector("pursuit", 14, "reject-revise-settled", "experimental", "pursuit.revise",
      { state: { ...state, status: "settled" }, baseVersion: 2, targetVersion: 3 },
      rejected("pursuit-not-active"), "A settled Pursuit cannot be revised in place."),
    vector("pursuit", 15, "reject-settle-without-verdict", "experimental", "pursuit.settle",
      { state, baseVersion: 2, completionVerdict: "" },
      rejected("completion-verdict-missing"), "Settlement never infers a verdict."),
  ];
}

function atlasVectors() {
  const state = { cutRoot: hash("a"), status: "fresh", sourceRoot: hash("b") };
  return [
    vector("atlas", 1, "cut-rooted-sources", "experimental", "atlas.cut",
      { state: null, sourceRoots: [hash("a"), hash("b")] },
      accepted("atlas-cut-created"), "An Atlas Cut binds explicit source roots."),
    vector("atlas", 2, "reject-cut-without-sources", "experimental", "atlas.cut",
      { state: null, sourceRoots: [] },
      rejected("atlas-source-roots-missing"), "A Cut cannot be inferred from ambient context."),
    vector("atlas", 3, "derive-from-exact-cut", "experimental", "atlas.derive",
      { state, baseCutRoot: state.cutRoot, derivedRoot: hash("c") },
      accepted("atlas-derived"), "A derivation binds its exact source Cut."),
    vector("atlas", 4, "reject-derive-from-other-cut", "experimental", "atlas.derive",
      { state, baseCutRoot: hash("d"), derivedRoot: hash("c") },
      rejected("atlas-cut-mismatch"), "Derivation cannot silently change its causal Cut."),
    vector("atlas", 5, "reject-unrooted-derivation", "experimental", "atlas.derive",
      { state, baseCutRoot: state.cutRoot, derivedRoot: "" },
      rejected("atlas-derived-root-missing"), "Derived views remain rooted."),
    vector("atlas", 6, "refresh-from-current-source", "experimental", "atlas.refresh",
      { state, baseCutRoot: state.cutRoot, sourceRoot: state.sourceRoot, nextCutRoot: hash("e") },
      accepted("atlas-refreshed"), "Refresh names both old Cut and source root."),
    vector("atlas", 7, "reject-refresh-stale-base", "experimental", "atlas.refresh",
      { state, baseCutRoot: hash("f"), sourceRoot: state.sourceRoot, nextCutRoot: hash("e") },
      rejected("atlas-cut-mismatch"), "Refresh fails on stale Cut identity."),
    vector("atlas", 8, "reject-refresh-source-drift", "experimental", "atlas.refresh",
      { state, baseCutRoot: state.cutRoot, sourceRoot: hash("f"), nextCutRoot: hash("e") },
      rejected("atlas-source-root-mismatch"), "Source drift is explicit, not overwritten."),
    vector("atlas", 9, "mark-stale-with-reason", "experimental", "atlas.mark-stale",
      { state, reason: "source-advanced" },
      accepted("atlas-marked-stale"), "Staleness is a typed state transition."),
    vector("atlas", 10, "reject-stale-without-reason", "experimental", "atlas.mark-stale",
      { state, reason: "" },
      rejected("atlas-stale-reason-missing"), "Staleness cannot be a silent flag."),
    vector("atlas", 11, "reject-derive-stale-cut", "experimental", "atlas.derive",
      { state: { ...state, status: "stale" }, baseCutRoot: state.cutRoot, derivedRoot: hash("c") },
      rejected("atlas-cut-stale"), "A stale Cut cannot be presented as current context."),
    vector("atlas", 12, "reject-refresh-unrooted-next-cut", "experimental", "atlas.refresh",
      { state, baseCutRoot: state.cutRoot, sourceRoot: state.sourceRoot, nextCutRoot: "" },
      rejected("atlas-next-cut-missing"), "Refresh output remains content-addressed."),
    vector("atlas", 13, "cut-single-root", "experimental", "atlas.cut",
      { state: null, sourceRoots: [hash("a")] },
      accepted("atlas-cut-created"), "A minimal Cut can contain one explicit source."),
    vector("atlas", 14, "reject-cut-duplicate-roots", "experimental", "atlas.cut",
      { state: null, sourceRoots: [hash("a"), hash("a")] },
      rejected("atlas-source-root-duplicate"), "A Cut inventory is set-like and deterministic."),
    vector("atlas", 15, "reject-mark-stale-twice", "experimental", "atlas.mark-stale",
      { state: { ...state, status: "stale" }, reason: "source-advanced" },
      rejected("atlas-already-stale"), "Repeated stale transitions do not invent new history."),
  ];
}

function warrantVectors() {
  const state = {
    id: "warrant:alpha",
    status: "active",
    allowedActions: ["append", "read"],
    scope: "workspace:alpha",
    expiresAt: 200,
    authorityRoot: hash("a"),
  };
  return [
    vector("warrant", 1, "issue-bounded-authority", "experimental", "warrant.issue",
      { state: null, grant: state }, accepted("warrant-issued"),
      "A Warrant is explicit, bounded, and rooted."),
    vector("warrant", 2, "reject-unrooted-issue", "experimental", "warrant.issue",
      { state: null, grant: { ...state, authorityRoot: "" } }, rejected("warrant-authority-root-missing"),
      "Authority cannot be ambient."),
    vector("warrant", 3, "attenuate-action-subset", "experimental", "warrant.attenuate",
      { state, grant: { allowedActions: ["read"], scope: state.scope, expiresAt: 180 } },
      accepted("warrant-attenuated"), "Attenuation may reduce allowed actions."),
    vector("warrant", 4, "reject-action-amplification", "experimental", "warrant.attenuate",
      { state, grant: { allowedActions: ["read", "write"], scope: state.scope, expiresAt: 180 } },
      rejected("warrant-authority-amplification"), "Attenuation never adds authority."),
    vector("warrant", 5, "attenuate-expiry", "experimental", "warrant.attenuate",
      { state, grant: { allowedActions: state.allowedActions, scope: state.scope, expiresAt: 150 } },
      accepted("warrant-attenuated"), "Attenuation may shorten time."),
    vector("warrant", 6, "reject-expiry-extension", "experimental", "warrant.attenuate",
      { state, grant: { allowedActions: state.allowedActions, scope: state.scope, expiresAt: 250 } },
      rejected("warrant-expiry-amplification"), "Attenuation never extends expiry."),
    vector("warrant", 7, "delegate-bounded-subset", "experimental", "warrant.delegate",
      { state, grant: { allowedActions: ["read"], scope: state.scope, expiresAt: 150 } },
      accepted("warrant-delegated"), "Delegation carries an attenuated authority subset."),
    vector("warrant", 8, "reject-delegate-action-amplification", "experimental", "warrant.delegate",
      { state, grant: { allowedActions: ["delete"], scope: state.scope, expiresAt: 150 } },
      rejected("warrant-authority-amplification"), "Cross-Hub delegation cannot add actions."),
    vector("warrant", 9, "reject-delegate-scope-amplification", "experimental", "warrant.delegate",
      { state, grant: { allowedActions: ["read"], scope: "organization:*", expiresAt: 150 } },
      rejected("warrant-scope-amplification"), "Delegation cannot silently widen scope."),
    vector("warrant", 10, "reject-delegate-expiry-extension", "experimental", "warrant.delegate",
      { state, grant: { allowedActions: ["read"], scope: state.scope, expiresAt: 250 } },
      rejected("warrant-expiry-amplification"), "Delegation cannot extend time."),
    vector("warrant", 11, "revoke-by-rooted-authority", "experimental", "warrant.revoke",
      { state, authorityRoot: state.authorityRoot }, accepted("warrant-revoked"),
      "Revocation binds the issuing authority root."),
    vector("warrant", 12, "reject-revoke-other-authority", "experimental", "warrant.revoke",
      { state, authorityRoot: hash("b") }, rejected("warrant-revoker-unauthorized"),
      "An unrelated authority cannot revoke a Warrant."),
    vector("warrant", 13, "use-allowed-action", "experimental", "warrant.use",
      { state, action: "append", scope: state.scope, now: 100 }, accepted("warrant-authorized"),
      "Use is checked against action, scope, time, and revocation."),
    vector("warrant", 14, "reject-forbidden-action", "experimental", "warrant.use",
      { state, action: "delete", scope: state.scope, now: 100 }, rejected("warrant-action-forbidden"),
      "A Warrant does not authorize undeclared actions."),
    vector("warrant", 15, "reject-scope-mismatch", "experimental", "warrant.use",
      { state, action: "read", scope: "workspace:beta", now: 100 }, rejected("warrant-scope-mismatch"),
      "Authority remains scoped."),
    vector("warrant", 16, "reject-expired-use", "experimental", "warrant.use",
      { state, action: "read", scope: state.scope, now: 201 }, rejected("warrant-expired"),
      "Expired authority fails closed."),
    vector("warrant", 17, "reject-revoked-use", "experimental", "warrant.use",
      { state: { ...state, status: "revoked" }, action: "read", scope: state.scope, now: 100 },
      rejected("warrant-revoked"), "Revoked authority cannot be reused."),
    vector("warrant", 18, "reject-attenuate-revoked", "experimental", "warrant.attenuate",
      { state: { ...state, status: "revoked" }, grant: { allowedActions: ["read"], scope: state.scope, expiresAt: 150 } },
      rejected("warrant-not-active"), "Revocation terminates the derivation chain."),
    vector("warrant", 19, "reject-empty-delegation", "experimental", "warrant.delegate",
      { state, grant: { allowedActions: [], scope: state.scope, expiresAt: 150 } },
      rejected("warrant-actions-missing"), "Delegation declares a usable bounded action set."),
    vector("warrant", 20, "reject-unrooted-parent", "experimental", "warrant.attenuate",
      { state: { ...state, authorityRoot: "" }, grant: { allowedActions: ["read"], scope: state.scope, expiresAt: 150 } },
      rejected("warrant-authority-root-missing"), "Derived authority retains its root lineage."),
  ];
}

function actionVectors() {
  const binding = {
    pursuitRoot: hash("a"),
    atlasRoot: hash("b"),
    warrantRoot: hash("c"),
    actionRoot: hash("d"),
    preconditionsSatisfied: true,
    warrantActive: true,
  };
  return [
    vector("action", 1, "bind-exact-roots", "core", "action.bind",
      { binding }, accepted("action-bound"), "Consequential action binds direction, perspective, authority, and occurrence."),
    vector("action", 2, "reject-missing-pursuit", "core", "action.bind",
      { binding: { ...binding, pursuitRoot: "" } }, rejected("action-pursuit-root-missing"),
      "Action does not infer direction from occurrence."),
    vector("action", 3, "reject-missing-atlas", "core", "action.bind",
      { binding: { ...binding, atlasRoot: "" } }, rejected("action-atlas-root-missing"),
      "Action does not infer perspective from ambient context."),
    vector("action", 4, "reject-missing-warrant", "core", "action.bind",
      { binding: { ...binding, warrantRoot: "" } }, rejected("action-warrant-root-missing"),
      "Action does not infer authority from capability."),
    vector("action", 5, "reject-missing-action-root", "core", "action.bind",
      { binding: { ...binding, actionRoot: "" } }, rejected("action-root-missing"),
      "Occurrence remains independently addressable."),
    vector("action", 6, "reject-unsatisfied-precondition", "core", "action.bind",
      { binding: { ...binding, preconditionsSatisfied: false } }, rejected("action-precondition-failed"),
      "A bound action still checks exact preconditions."),
    vector("action", 7, "reject-revoked-warrant", "core", "action.bind",
      { binding: { ...binding, warrantActive: false } }, rejected("action-warrant-inactive"),
      "A revoked Warrant cannot authorize action."),
    vector("action", 8, "delivery-not-admission", "core", "action.assess",
      { transportDelivered: true, receiverVerdict: "pending" }, accepted("delivery-kept-separate"),
      "Delivery is not admission."),
    vector("action", 9, "reject-delivery-as-admission", "core", "action.assess",
      { transportDelivered: true, receiverVerdict: "inferred-from-delivery" }, rejected("delivery-is-not-admission"),
      "A transport receipt cannot manufacture a semantic verdict."),
    vector("action", 10, "episode-not-completion", "core", "action.assess",
      { episodeSealed: true, completionVerdict: "pending" }, accepted("occurrence-kept-separate"),
      "Occurrence is not completion."),
    vector("action", 11, "reject-seal-as-completion", "core", "action.assess",
      { episodeSealed: true, completionVerdict: "inferred-from-seal" }, rejected("episode-is-not-completion"),
      "A sealed Episode cannot settle a Pursuit by inference."),
    vector("action", 12, "fact-not-call-success", "core", "action.assess",
      { callSucceeded: true, factVerdict: "pending" }, accepted("call-kept-separate"),
      "Call success is not Fact admission."),
    vector("action", 13, "reject-call-as-fact", "core", "action.assess",
      { callSucceeded: true, factVerdict: "inferred-from-call" }, rejected("call-is-not-admission"),
      "Execution success cannot self-admit a Fact."),
    vector("action", 14, "receiver-admits-fact", "core", "action.assess",
      { factVerdict: "admitted", verdictAuthority: "receiver" }, accepted("receiver-verdict-retained"),
      "Admission is local to the receiving authority."),
    vector("action", 15, "reject-producer-self-admission", "core", "action.assess",
      { factVerdict: "admitted", verdictAuthority: "producer" }, rejected("producer-cannot-self-admit"),
      "A producer cannot self-admit a remote Fact."),
  ];
}

function episodeFactVectors() {
  const episode = { id: "episode:alpha", status: "open", nextIndex: 2 };
  const fact = { id: "fact:alpha", status: "proposed", authority: "receiver" };
  return [
    vector("episode-fact", 1, "open-new-episode", "core", "episode.open",
      { state: null, episodeId: episode.id }, accepted("episode-opened"), "Episode identity begins before occurrence."),
    vector("episode-fact", 2, "reject-open-existing", "core", "episode.open",
      { state: episode, episodeId: episode.id }, rejected("episode-already-exists"), "Open cannot overwrite an Episode."),
    vector("episode-fact", 3, "append-next-claim", "core", "episode.append",
      { state: episode, index: 2, claimRoot: hash("a") }, accepted("episode-appended"), "Append order is explicit."),
    vector("episode-fact", 4, "reject-append-gap", "core", "episode.append",
      { state: episode, index: 3, claimRoot: hash("a") }, rejected("episode-index-gap"), "Episode order cannot skip silently."),
    vector("episode-fact", 5, "reject-unrooted-append", "core", "episode.append",
      { state: episode, index: 2, claimRoot: "" }, rejected("episode-claim-root-missing"), "Episode claims remain rooted."),
    vector("episode-fact", 6, "commit-open-episode", "core", "episode.commit",
      { state: episode, contentRoot: hash("b") }, accepted("episode-committed"), "Commit establishes a durability frontier."),
    vector("episode-fact", 7, "reject-commit-without-root", "core", "episode.commit",
      { state: episode, contentRoot: "" }, rejected("episode-content-root-missing"), "Commit cannot acknowledge unrooted content."),
    vector("episode-fact", 8, "interrupt-open-episode", "core", "episode.interrupt",
      { state: episode, reason: "process-crash" }, accepted("episode-interrupted"), "Interruption is a typed lifecycle state."),
    vector("episode-fact", 9, "seal-committed-episode", "core", "episode.seal",
      { state: { ...episode, status: "committed" }, semanticRoot: hash("c") }, accepted("episode-sealed"),
      "Seal closes occurrence without inventing completion."),
    vector("episode-fact", 10, "reject-seal-open-episode", "core", "episode.seal",
      { state: episode, semanticRoot: hash("c") }, rejected("episode-not-committed"), "Seal requires the commit frontier."),
    vector("episode-fact", 11, "replay-sealed-episode", "core", "episode.replay",
      { state: { ...episode, status: "sealed" }, semanticRoot: hash("c"), observedRoot: hash("c") },
      accepted("episode-replayed"), "Replay checks the sealed semantic root."),
    vector("episode-fact", 12, "reject-replay-root-drift", "core", "episode.replay",
      { state: { ...episode, status: "sealed" }, semanticRoot: hash("c"), observedRoot: hash("d") },
      rejected("episode-root-mismatch"), "Replay exposes semantic drift."),
    vector("episode-fact", 13, "propose-new-fact", "core", "fact.propose",
      { state: null, factRoot: hash("e") }, accepted("fact-proposed"), "Fact production is distinct from admission."),
    vector("episode-fact", 14, "admit-by-receiver", "core", "fact.admit",
      { state: fact, verdictAuthority: "receiver", evidenceRoot: hash("f") }, accepted("fact-admitted"),
      "The receiving authority owns admission."),
    vector("episode-fact", 15, "reject-self-admission", "core", "fact.admit",
      { state: fact, verdictAuthority: "producer", evidenceRoot: hash("f") }, rejected("fact-admitter-unauthorized"),
      "A producer cannot self-admit a remote Fact."),
    vector("episode-fact", 16, "reject-with-explicit-reason", "core", "fact.reject",
      { state: fact, verdictAuthority: "receiver", reason: "scope-mismatch" }, accepted("fact-rejected"),
      "Rejection is an explicit receiver verdict."),
    vector("episode-fact", 17, "retain-conflict-roots", "core", "fact.conflict",
      { state: fact, roots: [hash("a"), hash("b")] }, accepted("fact-conflicted"),
      "Conflict roots remain visible."),
    vector("episode-fact", 18, "reject-hidden-conflict", "core", "fact.conflict",
      { state: fact, roots: [hash("a")] }, rejected("fact-conflict-roots-incomplete"),
      "Conflict cannot collapse to last-write-wins."),
    vector("episode-fact", 19, "supersede-admitted-fact", "core", "fact.supersede",
      { state: { ...fact, status: "admitted" }, successorRoot: hash("b") }, accepted("fact-superseded"),
      "Supersession preserves predecessor identity."),
    vector("episode-fact", 20, "reject-supersede-proposed", "core", "fact.supersede",
      { state: fact, successorRoot: hash("b") }, rejected("fact-not-admitted"),
      "A proposal cannot silently rewrite its own verdict."),
  ];
}

function recoveryVectors() {
  const state = {
    durableSeq: 4,
    acknowledgedSeq: 4,
    expectedRoot: hash("a"),
    observedRoot: hash("a"),
    providerRoot: hash("b"),
    bundleRoot: hash("c"),
  };
  return [
    vector("recovery", 1, "crash-after-durable-ack", "experimental", "runtime.crash",
      { state }, accepted("runtime-crash-bounded"), "Acknowledgement stays behind the durability frontier."),
    vector("recovery", 2, "reject-ack-before-durability", "experimental", "runtime.crash",
      { state: { ...state, acknowledgedSeq: 5 } }, rejected("runtime-ack-ahead-of-durability"),
      "Crash evidence exposes acknowledgements that outran durability."),
    vector("recovery", 3, "reopen-matching-provider-root", "experimental", "runtime.reopen",
      { state, observedProviderRoot: state.providerRoot }, accepted("runtime-reopened"),
      "Reopen binds the persisted provider root."),
    vector("recovery", 4, "reject-reopen-provider-drift", "experimental", "runtime.reopen",
      { state, observedProviderRoot: hash("d") }, rejected("runtime-provider-root-mismatch"),
      "Reopen fails closed on provider drift."),
    vector("recovery", 5, "fsck-matching-root", "experimental", "runtime.fsck",
      { state }, accepted("runtime-fsck-clean"), "Fsck compares expected and observed roots."),
    vector("recovery", 6, "reject-fsck-root-drift", "experimental", "runtime.fsck",
      { state: { ...state, observedRoot: hash("d") } }, rejected("runtime-root-mismatch"),
      "Fsck exposes corruption rather than repairing silently."),
    vector("recovery", 7, "export-rooted-bundle", "experimental", "runtime.export",
      { state, disclosure: "selective", exportedRoot: state.bundleRoot }, accepted("runtime-exported"),
      "Export binds a portable rooted bundle."),
    vector("recovery", 8, "reject-unrooted-export", "experimental", "runtime.export",
      { state, disclosure: "selective", exportedRoot: "" }, rejected("runtime-export-root-missing"),
      "Export never relies on an ambient directory."),
    vector("recovery", 9, "import-matching-bundle", "experimental", "runtime.import",
      { state, declaredRoot: state.bundleRoot, observedRoot: state.bundleRoot }, accepted("runtime-imported"),
      "Import verifies the declared bundle root."),
    vector("recovery", 10, "reject-import-root-drift", "experimental", "runtime.import",
      { state, declaredRoot: state.bundleRoot, observedRoot: hash("d") }, rejected("runtime-import-root-mismatch"),
      "Import fails closed on bundle drift."),
    vector("recovery", 11, "replay-contiguous-range", "experimental", "runtime.replay",
      { state, indexes: [0, 1, 2, 3, 4] }, accepted("runtime-replayed"),
      "Replay order is contiguous and deterministic."),
    vector("recovery", 12, "reject-replay-gap", "experimental", "runtime.replay",
      { state, indexes: [0, 1, 3, 4] }, rejected("runtime-replay-gap"),
      "Replay cannot hide missing history."),
    vector("recovery", 13, "retry-same-idempotency-root", "experimental", "runtime.retry",
      { state, previous: { key: "retry:a", exchangeRoot: hash("e") }, next: { key: "retry:a", exchangeRoot: hash("e") } },
      accepted("runtime-retry-idempotent"), "Retry with the same key preserves the exchange root."),
    vector("recovery", 14, "reject-idempotency-root-reuse", "experimental", "runtime.retry",
      { state, previous: { key: "retry:a", exchangeRoot: hash("e") }, next: { key: "retry:a", exchangeRoot: hash("f") } },
      rejected("runtime-idempotency-reuse"), "An idempotency key cannot name different exchanges."),
    vector("recovery", 15, "retain-reconnect-conflict", "experimental", "runtime.reconnect",
      { state, localRoot: hash("e"), remoteRoot: hash("f"), conflictRoots: [hash("e"), hash("f")] },
      accepted("runtime-conflict-retained"), "Reconnect retains conflicting roots instead of last-write-wins."),
  ];
}

const vectors = [
  ...pursuitVectors(),
  ...atlasVectors(),
  ...warrantVectors(),
  ...actionVectors(),
  ...episodeFactVectors(),
  ...recoveryVectors(),
];

assert.equal(vectors.length, 100);
assert.equal(new Set(vectors.map(({ id }) => id)).size, 100);
assert.deepEqual(
  Object.fromEntries(
    [...new Set(vectors.map(({ category }) => category))].map((category) => [
      category,
      vectors.filter((entry) => entry.category === category).length,
    ]),
  ),
  {
    pursuit: 15,
    atlas: 15,
    warrant: 20,
    action: 15,
    "episode-fact": 20,
    recovery: 15,
  },
);

const document = {
  schemaVersion: 1,
  contract: "kfd.agent-runtime-vector-registry/v1",
  profile: {
    id: "kfd-agent-runtime",
    version: "0.1.0-alpha.1",
  },
  suite: {
    id: "kfd-runtime-100",
    version: "0.1.0-alpha.1",
    fixedVectorCount: 100,
  },
  vectors,
};
const rendered = `${JSON.stringify(document, null, 2)}\n`;

if (process.argv.includes("--write")) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, rendered);
  console.log(`wrote ${path.relative(root, outputPath)} (${vectors.length} vectors)`);
} else {
  assert.equal(
    fs.readFileSync(outputPath, "utf8"),
    rendered,
    "runtime-100.json drifted; run this script with --write",
  );
  console.log(`runtime vector registry is deterministic (${vectors.length} vectors)`);
}
