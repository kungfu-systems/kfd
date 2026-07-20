---
status: draft
period: 2026-07-20
theme: kfd-agent-hub-implementer-guide
doc_type: implementation-guide
source_level: local-files
confidence: medium
sensitivity: public
evidence_grade: C
review_state: self-reviewed
last_reviewed: 2026-07-20
---

# Agent Hub Implementer Guide

This guide explains one minimal adoption path. The profile authority remains
[`README.md`](README.md).

## Minimal implementation

An alpha implementation needs:

1. a capability endpoint or file that validates against
   `capabilities.schema.json`;
2. a content-addressed exchange store;
3. an idempotency index scoped by source Hub;
4. local identity, authority, fact-admission, conflict, disclosure, and
   completion policies;
5. a receiver verdict writer;
6. export/import that preserves original bytes, roots, verdicts, and conflicts;
7. one replaceable transport binding.

The store may be memory, files, a database, an event log, or another product
surface. The profile does not require a daemon or network service.

## Receive algorithm

```text
receive(bytes):
  verify payload digest and exchange root
  resolve exact profile manifest
  negotiate required features
  look up (source hub, idempotency key)
  if key maps to another root: reject idempotency-conflict
  store original exchange bytes
  emit transport receipt
  resolve source identity under local policy
  verify causal predecessors or mark causal-gap
  verify Warrant and attenuation without importing remote trust
  assess disclosure and retained uncertainty
  detect competing admitted or proposed roots
  evaluate operation-specific local policy
  write one rooted receiver verdict
  return receipt + verdict
```

Do not combine `emit transport receipt` with `write receiver verdict`.

## Capability negotiation

- Advertise exact alpha versions, not ranges.
- Treat capability documents as claims until their authority roots pass local
  policy.
- Select the intersection of required features; never silently downgrade a
  required feature.
- Persist both capability roots with the exchange.
- Re-negotiate after either capability root changes.

## Authority handling

A remote Warrant is evidence, not local permission. A receiver may:

- recognize it directly under a declared trust policy;
- derive a narrower local Warrant;
- request more evidence;
- reject it;
- mark it unavailable or conflicted.

Never copy the remote issuer's authority label into local policy as proof.
Verify expiry, revocation, exact subject, actions, consequence class,
disclosure scope, and delegation depth.

## Partial replication

Start with the smallest disclosed cut needed for the operation. When material
is omitted:

- list JSON Pointer paths or referenced object classes;
- state whether omission is unavailable, policy-withheld, redacted, or merely
  outside the replicated subset;
- provide commitments when later proof or selective reveal is expected;
- record which checks could not run;
- downgrade the verdict instead of assuming completeness.

Secrets and raw prompts should normally remain outside the exchange. A digest
does not make secret material safe to disclose.

## Binding requirements

A local function call, IPC frame, file bundle, HTTP request, gRPC method,
message-bus event, or removable-media transfer may bind this profile. Every
binding must document:

- byte canonicalization or exact-byte digest behavior;
- maximum message size and external-payload handling;
- authentication and channel security;
- retry and duplicate delivery behavior;
- mapping from transport errors to profile failure codes;
- how transport receipts are rooted;
- how a participant exports records without the binding.

Bindings must not add semantic authority. HTTP `2xx`, queue acknowledgement,
file presence, or RPC success is delivery evidence only.

## Required tests before a compatibility claim

- one local-peer exchange with no cloud account;
- one delayed or duplicate delivery;
- same idempotency key with changed content fails;
- delegated Warrant narrowing passes and amplification fails;
- expired and revoked Warrants fail;
- partial, unavailable, and intentionally withheld material remain distinct;
- competing roots produce a visible conflict;
- offline branches reconnect without last-write-wins;
- Episode presence does not produce completion;
- a completion claim without recognized authority or evidence fails;
- unknown required profile feature fails negotiation;
- export/import preserves exchange and verdict roots.

Passing these tests is implementation evidence, not KFD certification. The
separate conformance suite owns report and verifier claims.

## Version and migration

Persist the profile ID, exact version, manifest digest, and repository
coordinate with every exchange. When adding a successor:

1. keep the prior reader available for retained records;
2. publish field and semantic mappings;
3. state upgrade, downgrade, and no-downgrade cases;
4. define how idempotency keys and roots behave across conversion;
5. retain original bytes and provenance;
6. test exit to a binding-neutral bundle.

## Public participation

Use a
[proposal issue](https://github.com/kungfu-systems/kfd/issues/new?template=kfd-proposal.yml)
for a new operation or semantic change, a
[counterevidence issue](https://github.com/kungfu-systems/kfd/issues/new?template=kfd-counterevidence.yml)
for a failing topology or unsafe inference, and a pull request when the
contract, compatibility impact, evidence, interests, and review boundary are
ready. See [`CONTRIBUTING.md`](../../CONTRIBUTING.md) and
[`GOVERNANCE.md`](../../GOVERNANCE.md).
