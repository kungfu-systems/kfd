---
status: active
period: 2026-07-23
theme: federated-work-continuity
doc_type: live-case
source_level: maintainer-consensus
confidence: medium
sensitivity: public
evidence_grade: C
review_state: unreviewed
last_reviewed: 2026-08-03
---

# Federated Work Continuity

This live case tracks a provisional question exposed by multi-workspace agent
coordination:

> Is Work an independently necessary higher-layer object, a perspective-bound
> view over existing objects, or only ordinary product vocabulary?

The candidate appeared when the observer changed from the developer managing
repositories and Assignment records to the person responsible for one real
outcome. From that position, execution location became secondary. The primary
question became whether the whole body of work is advancing, where judgment is
pending, and what may happen next.

## Current result

```text
candidate: Work
status: provisional
minimum closure: inconclusive
deletion test: analytic hypothesis only
fuse test: inconclusive
dogfood: founding Work Control implementation exists; comparative KFD-5 dogfood remains inconclusive
```

Since the first cut, Kungfu has implemented Initiative, Assignment, WorkRef,
Portfolio, independent review, continuation, and Project Cut settlement, and
its derived Primitive Catalog exposes Work with experimental admission. That
is new implementation pressure, not qualification. The strongest
counterevidence remains present in KFD: Initiative is an
accepted software-domain Primitive for one continuing coordinated body of
work. Work must therefore demonstrate a decision-relevant responsibility that
cannot be represented by one Initiative, several related Initiatives, or an
ordinary cut-bound query.

## Candidate shape

The initial engineering hypothesis is:

```text
workspace-qualified WorkRef
  + typed Assignment Graph
  + component cuts and proofs
  + declared observer and traversal policy
  + current action frontier
  = perspective-bound Work view
```

This shape preserves autonomous fact worlds. It does not create a central Work
database, global clock, or global atomic Cut.

## Case surfaces

- [Genesis](genesis.md)
- [Ontology alternatives](ontology-split.md)
- [Conditional distinguishability](distinguishability.md)
- [KFD method trace](kfd-method-trace.md)
- [Propagation boundary](propagation-hypothesis.md)
- [Current KFD-5 successor cut](cuts/0002-work.json)
- [Preserved first cut](cuts/0001-work.json)
- [Qualification reviews](reviews/README.md)
- [Live case registry](../../registry.json)

## Claim boundary

This case does not establish Work as a Primitive, allocate a KFD number,
qualify the founding implementation, prove cross-domain transfer, or show that
an independent Work entity is preferable to Initiative plus a derived graph
view. Those are explicit open tests.
