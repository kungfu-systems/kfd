---
status: draft
period: 2026-07-20
theme: kfd-agent-hub-profile
doc_type: protocol-profile
source_level: maintainer-consensus + local-files
confidence: medium
sensitivity: public
evidence_grade: C
review_state: self-reviewed
last_reviewed: 2026-07-20
---

# KFD Agent Hub Profile

- Profile ID: `kfd-agent-hub`
- Profile version: `0.1.0-alpha.1`
- Profile status: `alpha`
- Authority path: `protocols/agent-hub/README.md`
- Machine manifest: `protocols/agent-hub/manifest.json`

## Status and authority

This profile is KFD's transport-neutral alpha contract for exchanging and
continuing responsibility objects between independently owned Agent Hubs. It
applies KFD-1, KFD-2, KFD-3, and KFD-7; it is not a numbered KFD decision and
does not allocate or reserve a KFD number.

The requirement words **MUST**, **MUST NOT**, **SHOULD**, and **MAY** are
normative within this exact alpha profile. The profile remains prerelease: an
implementation must bind claims to the exact profile version and manifest
digest and must not describe alpha compatibility as stable certification,
external adoption, or an industry standard.

The repository commit is the public fact source. A profile coordinate is:

```text
profile id + profile version + SHA-256(manifest.json) + repository commit
```

`manifest.json` binds every normative and explanatory surface by path and
digest. A digest mismatch, unknown required feature, or unsupported profile
version fails closed.

## Problem and boundary

An Agent Hub is a participant-owned control plane for execution, identity,
policy, accounts, models, user experience, and customer relationships. A Hub
may be a local process, a device service, a vendor cloud, an organizational
system, or a federation member.

KFD owns only the interoperability responsibility boundary. It does not own:

- a vendor's UI, models, accounts, billing, cloud, storage, or internal
  workflow;
- one global identity provider, Hub registry, database, transport, or clock;
- Kungfu implementation details or a requirement to run Kungfu;
- raw prompts, secrets, private files, or complete Episode bodies;
- a universal workflow DSL or all-domain ontology.

The same semantics MUST work for local peers, one vendor's cloud, federation
across organizations, and an offline device that later reconnects.

## Imported foundations

| Source | Imported responsibility | Not imported |
| --- | --- | --- |
| KFD-1 | Exact fact sources, Fact cuts, causal records, compatibility boundaries, immutable coordinates. | One storage engine or publication system. |
| KFD-2 | Claims bind facts, evidence, responsibility state, residual risk, and decision owners. | Reputation as proof. |
| KFD-3 | Participant-facing value, constraints, choices, revocation, and records remain inspectable. | Forced workflow capture or hidden control. |
| KFD-7 | Fact/Episode separation and independently addressable Pursuit, Atlas, and Warrant responsibilities. | One Domain Profile, physical object count, or vendor lifecycle vocabulary. |

Atlas, Pursuit, and Warrant remain candidate elaborations where their own KFD
qualification is open. This profile uses their KFD-7 responsibility meanings
without promoting those candidates or treating one product vocabulary as a
universal Hub ontology.

## Identities and authorities

Every exchange identifies:

- `hubId`: the product or control plane responsible for the exchange;
- `nodeId`: the process, device, or service endpoint;
- `actorId`: the human, agent, service, or mixed actor represented;
- optional `workspaceId` and `organizationId`;
- `authorityRoots`: immutable roots that let the receiver evaluate the
  identity and claim under local policy.

Identifiers are opaque, issuer-scoped strings. They are not globally trusted
names. Authentication proves control of an identifier under a binding; it
does not prove authority, fact admission, completion, or truth. Each receiver
owns its local identity mapping and acceptance policy.

## Capability discovery and negotiation

A Hub advertises a
[`kfd-agent-hub-capabilities`](../../schemas/kfd-agent-hub/capabilities.schema.json)
document. Negotiation MUST:

1. select one exact mutually supported profile version;
2. select only operations, disclosure modes, failure codes, and binding
   features supported by both participants;
3. reject unknown required features;
4. retain both capability document digests in the exchange record;
5. return `profile-version-unsupported` or `required-feature-unsupported`
   when no safe intersection exists.

There is no "closest" semantic version fallback. A transport MAY negotiate
encoding or compression separately, but transport negotiation MUST NOT change
profile meaning.

## Responsibility exchange record

The machine contract is
[`kfd-agent-hub-exchange`](../../schemas/kfd-agent-hub/exchange.schema.json).
Every record binds:

- exact profile identity, version, manifest digest, and capability roots;
- exchange ID, operation, idempotency key, creation time, and predecessor
  exchange roots;
- source and target Hub/node/actor identities and authority roots;
- exact Pursuit, Atlas, Warrant, ActionBinding, Episode, Fact, and completion
  references that are in scope;
- base/result Fact-cut roots, Episode roots, and causal predecessors;
- Warrant issuer, holder, subject root, allowed/forbidden actions, validity,
  revocation roots, and attenuation relation;
- payload media type, digest, byte size, and optional inline representation;
- disclosure mode, omitted-field list, commitments, retention hints, and
  residual disclosure risk;
- transport receipt as delivery evidence;
- receiver verdict, decision authority roots, accepted roots, reason codes,
  residual risk, and optional completion assessment.

An `ActionBinding` is the exchange-local link from a proposed operation to its
Fact cut, Pursuit, Atlas, and Warrant references. It is not declared as a new
KFD Primitive by this profile.

## Operations

| Operation | Sender proposes | Receiver remains responsible for |
| --- | --- | --- |
| `capability-advertisement` | Supported versions, features, bindings, limits, and policy entrypoints. | Whether to negotiate or refuse. |
| `responsibility-proposal` | A bounded continuation against exact responsibility roots. | Authority, fact, disclosure, conflict, and policy assessment. |
| `fact-admission` | Candidate successor Fact roots with evidence and causal provenance. | Local admission or rejection; receipt alone is never admission. |
| `supersession` | An explicit successor relation for a prior object or exchange. | Whether the relation is valid and locally accepted. |
| `completion-assessment` | A completion claim and its evidence roots. | `unassessed`, `incomplete`, `complete`, `rejected`, or `conflicted` judgment. |
| `warrant-revocation` | Revocation or narrowing of a prior authority root. | Local invalidation, dependent-work handling, and continuation policy. |

The receiver verdict is one of `pending`, `admitted`, `rejected`,
`conflicted`, `unavailable`, or `intentionally-withheld`. A terminal semantic
decision MUST carry at least one decision authority root and a reason code.

## Protocol invariants

1. **Delivery is not admission.** A transport receipt proves only the declared
   binding delivered bytes.
2. **Occurrence is not completion.** An Episode or successful call does not
   settle a Pursuit or admit successor Facts.
3. **Authority does not amplify.** A delegated Warrant MUST be
   `narrower-or-equal` to its parent in subject, action, consequence, time,
   disclosure, and delegation scope. A receiver MUST reject an unprovable or
   broader derivation with `authority-amplification`.
4. **Retry is content-stable.** Reusing an idempotency key with different
   profile, operation, payload, causal roots, subject roots, or authority roots
   MUST return `idempotency-conflict`.
5. **Conflict remains visible.** Competing roots MUST be retained in
   `conflictRoots`; arrival time or last-write-wins MUST NOT silently erase a
   branch.
6. **Partial knowledge is typed.** `verified`, `degraded`, `conflicted`,
   `unavailable`, and `intentionally-withheld` are distinct states. Redaction
   MUST NOT be represented as absence or verification.
7. **Admission is local.** A producer may propose facts or completion
   evidence, but the receiving authority owns its verdict.
8. **Causality is not a global clock.** Ordering uses roots and predecessor
   relations; implementations MUST tolerate partial orders and offline work.
9. **Exit remains possible.** Export MUST preserve profile coordinates,
   responsibility roots, verdicts, conflicts, disclosure commitments, and
   binding-independent payload digests.
10. **Unknown required semantics fail closed.** Optional fields may be retained
    opaquely; required semantics cannot be guessed or dropped.

## Partial replication and selective disclosure

The sender declares one disclosure mode:

- `full`: every profile-required field and referenced body needed for the
  stated operation is present;
- `partial`: only declared subsets are replicated, with omitted paths and
  verification limits;
- `redacted`: commitments or digests preserve the existence and position of
  withheld material;
- `reference-only`: payload bodies are absent but immutable roots and
  retrieval/policy hints remain;
- `intentionally-withheld`: policy forbids disclosure and the receiver is told
  that the absence is deliberate.

A receiver MUST assess only the disclosed cut. It MUST NOT project
`intentionally-withheld` or `unavailable` material as false, empty, verified,
or conflict-free. Retention hints are non-binding requests; legal and local
policy remain receiver-owned.

## Offline, reconnect, deduplication, and recovery

Offline work creates locally rooted exchanges and causal predecessors. On
reconnect:

1. negotiate the exact profile;
2. exchange missing root inventories without assuming one total order;
3. deduplicate by exchange root and idempotency key;
4. reject key reuse with different content;
5. assess Warrant validity at the relevant action time and current revocation
   knowledge;
6. surface divergent Fact or supersession branches as conflict;
7. preserve receiver verdicts and resume from the last stable semantic state.

Reconnect MUST NOT rewrite prior exchange roots or retroactively turn delivery
into admission. A new verdict or correction is a successor exchange.

## State machine

The normative transition table is
[`reference-state-machine.json`](reference-state-machine.json); the explanatory
walkthrough is [`state-machine.md`](state-machine.md).

Transport and semantic state are separate:

```text
created -> offered -> delivered
                         |
                         v
                    assessing
                 /      |      \
            admitted rejected conflicted
```

`unavailable` and `intentionally-withheld` are explicit assessment outcomes.
Admission may later be superseded only by a new rooted exchange. Completion is
an independently assessed claim, not a transport state.

## Failure codes

The closed alpha vocabulary is:

- `profile-version-unsupported`
- `profile-root-mismatch`
- `required-feature-unsupported`
- `identity-unresolved`
- `authority-unresolved`
- `authority-expired`
- `authority-revoked`
- `authority-amplification`
- `fact-cut-unavailable`
- `causal-gap`
- `payload-digest-mismatch`
- `idempotency-conflict`
- `conflict-visible`
- `disclosure-insufficient`
- `required-field-withheld`
- `completion-unproved`
- `local-policy-rejected`

An admitted verdict uses the non-failure reason code `admission-accepted`.
Bindings MAY expose lower-level transport errors, but they MUST map semantic
failure to this profile without replacing or widening it.

## Version evolution

- `schemaVersion` changes when a machine contract's interpretation or required
  shape changes.
- `profile.version` changes when the cross-surface semantic set changes.
- An additive optional feature may remain within the same schema version only
  when old implementations safely ignore and preserve it and negotiation does
  not select it implicitly.
- New required fields, changed verdict meaning, changed authority/admission
  rules, or changed failure semantics require a new incompatible profile
  version.
- A successor profile publishes migration, downgrade, retained-reader, and
  exit obligations. Existing coordinates remain immutable.

Alpha implementations MUST advertise exact versions rather than version
ranges. Stable range negotiation is deferred until compatible release evidence
exists.

## Implementer and review paths

- [Gap matrix](gap-matrix.md)
- [State machine explanation](state-machine.md)
- [Implementer guide](implementer-guide.md)
- [Capability schema](../../schemas/kfd-agent-hub/capabilities.schema.json)
- [Exchange schema](../../schemas/kfd-agent-hub/exchange.schema.json)
- [KFD proposal issue](https://github.com/kungfu-systems/kfd/issues/new?template=kfd-proposal.yml)
- [Counterexample or evidence issue](https://github.com/kungfu-systems/kfd/issues/new?template=kfd-counterevidence.yml)
- [Contribution and pull-request process](../../CONTRIBUTING.md)

## Non-claims

This alpha profile does not prove that:

- KFD is an industry standard or that independent vendors have adopted it;
- any implementation is conforming without an exact independent report;
- one reference implementation establishes topology or implementation
  neutrality;
- a Hub must use Kungfu, a particular cloud, or a particular business model;
- protocol compatibility transfers legal authority, certification, product
  approval, or responsibility between participants.
