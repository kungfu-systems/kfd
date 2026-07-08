# KFD-4: Timelines must declare their observer — useful views need a stated perspective

- Status: active
- Number: 4
- Kind: procedure
- Applies to: every kungfu-systems product, repository, release surface, extension surface, hosted surface, and agent-facing interface that represents time, ordering, history, timelines, sync, replay, or mixed-source work facts

## One sentence

Timelines must declare their observer.

A product must not present a mixed-source ordering as an absolute view from
nowhere. A useful view of reality must state who is observing, which facts were
accepted, and how concurrent facts were projected.

## Decision type

KFDs can be principles or procedures:

- A **principle** states what must remain true across kungfu-systems even as
  products, repositories, and release lines change.
- A **procedure** states how a class of work enforces or protects a principle.

This KFD is a procedure. It is not a fourth foundation principle beside
KFD-1/2/3. It is the first practice guideline derived from the foundation
triad: once facts are non-drifting, trust starts from facts, and cooperation
starts from trusted value, a product still has to say from which perspective a
time-ordered view is being offered.

## Practice role

Within the KFD structure, KFD-1/2/3 form the foundation:

```text
facts must not drift
  -> trust must start from facts
  -> cooperation must start from trusted value
```

KFD-4 applies that foundation to perspective, ordering, and action. It answers
this practice question:

```text
In a complex world, from which declared perspective is this view useful,
stable, and trustworthy?
```

## Gate boundary

KFD-4 is a gate for perspective-bearing views. It applies when a product,
repository, release surface, extension surface, hosted surface, export, API,
CLI, GUI, or agent-facing interface represents time, ordering, history,
timeline state, replay, sync, or mixed-source work facts.

A product surface that does not represent a timeline, history, replay, sync
flow, ordering claim, or mixed-source work state does not need to pass a KFD-4
gate. It may still be assessed by KFD-1, KFD-2, KFD-3, or other applicable
KFDs.

Passing a KFD-4 gate means the surface declares enough observer and projection
metadata for its timeline view to be inspected, reproduced, and challenged. It
does not by itself prove that every payload, source adapter, remote machine,
or adopter-specific timeline implementation is correct. Those product-specific
claims need their own facts, witnesses, verification, and responsibility
boundary.

## Procedure

When a product combines facts from multiple machines, agents, processes,
sessions, sources, repositories, providers, or external systems, it should
treat the visible timeline as an observer-relative projection over accepted
facts, not as a claim that the product has found one absolute global clock.

The authoritative record should be facts and evidence:

- source-local records and their local order;
- provenance for source, participant, location, session, run, or adapter;
- accepted ranges, heads, cursors, watermarks, and capture boundaries;
- causal links between observations, decisions, actions, and results;
- payload hashes, schema bindings, receipts, redaction states, and verification
  results.

The visible timeline is a view over those facts. Its perspective must be
declared enough that another human or agent can reproduce the same view from
the same accepted facts.

## What a declared perspective should include

A perspective-bearing timeline should identify, where applicable:

- the observer or observer location whose view is being presented;
- the accepted fact sources, ranges, watermarks, and freshness boundaries;
- the projection policy version;
- the ordering rule for concurrent or causally unrelated facts;
- the deterministic tie-breaker used when policy and source-local order are not
  enough;
- the degraded state when causality, payloads, schemas, accepted ranges, or
  freshness are incomplete.

Causal facts dominate projection policy. A product may order concurrent facts
by observer policy, source priority, or deterministic tie-breaker, but it must
not invert a known causal dependency. If it cannot produce a valid total order
without hiding missing causality or missing evidence, it should report a
degraded view rather than silently sorting by wall-clock time.

## What it requires

- GUI, CLI, API, export, and agent-facing timeline surfaces should make the
  observer or projection policy inspectable when they mix sources.
- Wall-clock time may be used for display, latency, diagnostics, and
  source-local ordering, but it must not be the only proof of cross-source
  order.
- Exported bundles that claim a timeline order should carry enough perspective
  metadata for another consumer to reproduce that order.
- Storage and sync systems should preserve source provenance, accepted ranges,
  and causal links rather than flattening remote facts into anonymous local
  records.
- Fsck, release gates, or other verification systems should eventually be able
  to check that a projected view does not contradict known facts, invert known
  causality, or hide an incomplete accepted range.

## What it does not require

- It does not say there are no facts. Facts and causality remain load-bearing.
- It does not permit arbitrary narratives, invented evidence, or convenient
  ordering.
- It does not require a universal global clock, a permanent global sequencer,
  or distributed consensus for every timeline.
- It does not forbid a product from having a default observer policy.
- It does not solve conflicts between independently written authority roots.
  Conflict policy must be explicit when it exists.
- It does not supersede KFD-1, KFD-2, or KFD-3. It applies them to
  perspective-bearing views.

## Relation to KFD-1, KFD-2, and KFD-3

KFD-1 says facts must not drift. KFD-4 depends on that: a perspective-bearing
timeline must stand on accepted facts, not on a driftable story.

KFD-2 says trust must start from facts. KFD-4 applies that to ordering: trust
in a timeline comes from reproducibility under declared facts and declared
projection policy, not from an undeclared claim to absolute time.

KFD-3 says cooperation must start from trusted value. KFD-4 applies that to
multi-participant work: humans and agents may carry different perspectives,
but cooperation becomes possible when those perspectives expose their facts,
constraints, and view policies instead of forcing everyone into a hidden
ordering.

Together:

```text
KFD-1: facts must not drift.
KFD-2: trust must start from facts.
KFD-3: cooperation must start from trusted value.
KFD-4: timelines must declare their observer.
```

The first three define the foundation. KFD-4 is a practice guideline for how
that foundation behaves when a product shows time, history, replay, sync, or
mixed-source work state.

## Implementation case: Kungfu observer timelines

Kungfu's observer-relative timeline design is the first concrete product case.
Kungfu stores causal runtime facts, source provenance, accepted ranges,
manifests, payload evidence, and verification results. A mixed-source timeline
is a deterministic projection from an explicit observer policy; it is not a
claim that Kungfu has discovered one universal global clock.

That design lets a local user sync facts from another machine, inspect agent
work that happened elsewhere, and still ask precise questions:

```text
which facts did this observer accept?
which source or location did each fact come from?
which causal links constrain the order?
which concurrent facts were ordered by policy?
can another consumer reproduce the same view?
```

This is the product-level form of the KFD-4 procedure.

## Implementation case: the KFD package

The `@kungfu-tech/kfd` npm package publishes a KFD-4 observer-perspective
schema under `schemas/kfd-4/observer-perspective.schema.json`. The schema is
not a mandatory runtime data model for every adopter. It is the KFD-owned
vocabulary for declaring observer, accepted facts, projection policy, causal
constraints, and degraded evidence state in products that need a
perspective-bearing timeline.

The package proves that the KFD-4 vocabulary, schema, metadata, and
self-verification surface are published from committed KFD facts. It does not
claim that a specific adopter's product timeline is correct merely because the
adopter cites or imports the schema. An adopter that claims KFD-4 conformance
must still provide adopter-owned evidence for its accepted facts, projection
policy, causal constraints, degraded evidence handling, and verification
result.

## Adopters

Each adopting repository cites this KFD when designing or changing a timeline,
history view, replay view, source sync flow, multi-machine view, multi-agent
view, audit bundle, or exported record that orders facts from more than one
source or perspective.

Adopters should keep local implementation detail in repository documents and
reference this KFD rather than restating it.
