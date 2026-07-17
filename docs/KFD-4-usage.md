# KFD-4 Implementation Notes

[Authoritative decision](../decisions/KFD-4.md) ·
[Formal reference](KFD-4-formal.md) ·
[Documentation map](MAP.md)

KFD-4 defines the perspective rule: views must remain bound to declared
perspectives, and perspective transformations must remain inspectable when they
are used to reveal different objects or guide action. The authoritative text is
`decisions/KFD-4.md`.

## Package Surface

The KFD package implements two connected machine-checkable KFD-4 profiles:

- `decisions/KFD-4.md`: the authoritative principle.
- `schemas/kfd-4/observer-perspective.schema.json`: the profile for
  observer-relative timeline views.
- `schemas/kfd-4/perspective-replay.schema.json`: the profile for
  perspective-preserving and contrastive replay.
- `standards.json#/standards/kfd-4`: schema identity, interface contract, and
  concept names.
- `scripts/check.mjs`: package wiring and contract verification.

These profiles implement the first engineering path:

```text
perspective-bound timeline
  -> perspective-preserving replay
  -> contrastive replay
  -> visible cross-perspective object mismatch
```

They are not a universal model for perspective. Other domains may define their
own KFD-4 profiles while preserving the decision's observer, fact,
transformation, causal, degradation, and responsibility boundaries.

## When To Use The Gate

Use KFD-4 when observer position can materially change interpretation,
ordering, relevance, visible object boundaries, or action. Declare the current
perspective and, when a transformation is claimed, what changed and what became
newly visible.

For mixed-source timelines, expose view subject, observer, accepted facts,
projection policy, causal constraints, degraded evidence, and verification.
Schema validity proves that this declaration exists. It does not prove that an
adapter captured every fact or that a runtime timeline is complete.

For replay, expose the source views, replay observer, shared context,
reconstruction policy, preserved elements, declared loss, degraded state, and
verification. Contrastive mode requires at least two source views and an
explicit mismatch record. A `primitiveSignal: candidate` is an input to KFD-5,
not certification.

## Perspective Transformation Record

A domain-specific record should preserve at least:

1. the origin perspective and its natural objects;
2. the transformed perspective and consequence-bearing participant;
3. the transformation performed;
4. the accepted facts and known gaps;
5. the burden, boundary, or object that became visible;
6. the boundary between local epistemic priority and wider claims.

KFD-5 turns that last output into a primitive candidate and qualifies it.

## Foundation Closure And Trust Relation

The two KFD-4 profiles depend on the complete foundation triad. KFD-1 keeps the
facts beneath a timeline from drifting. KFD-2 makes replay fidelity,
degradation, and responsibility assessable. KFD-3 lets participants expose and
compare preserved views through trusted value rather than coercion. Schema
validity without those dependencies does not establish a trustworthy
perspective transformation.

KFD-4 claims can be assessed by KFD-2. The KFD package's assessment proves the
decision text, timeline and replay profile schemas, standards metadata, and
self-check wiring. Adopters own evidence for their runtime view, replay
fidelity, or perspective transformation.
