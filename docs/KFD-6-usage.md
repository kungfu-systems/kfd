# KFD-6 Implementation Notes

KFD-6 defines a proposed autonomous discovery loop that is grounded in causal
experience and can transform perspectives rather than only mine patterns. The
authoritative text is `decisions/KFD-6.md`; its registry status is `draft`.

## Package Surface

- `decisions/KFD-6.md`: authoritative proposed procedure.
- `schemas/kfd-6/autonomous-discovery-loop.schema.json`: version 3 experiment
  contract.
- `standards.json#/standards/kfd-6`: schema identity, interface, and concepts.
- `scripts/check.mjs`: package wiring and anti-self-certification checks.

## Version 3 Interface

Version 3 requires `perspectiveExperiments`. Each experiment records an origin
perspective, transformed perspective, causal basis, transformation, newly
visible need, candidate object, and disconfirming test.

Each experiment also declares replay mode, source-view coordinates, shared
context, preservation claim, and degraded state. Contrastive replay requires at
least two source views. This prevents an autonomous loop from flattening
Episodes into an anonymous corpus while still claiming perspective discovery.

The method binds candidate output to `kfd-5-primitive-discovery` at
`candidateSchemaVersion: 2`, so an autonomous experiment cannot bypass the
perspective-genesis and qualification boundary it claims to internalize.

The former required `boundaryHypothesis` is now conditional. Boundary pressure
is useful when present, but it is not a prerequisite for an object first
revealed by perspective transformation. This semantic change requires version
3 rather than silently changing version 2.

## Experimental Use Only

The schema records a bounded experiment. It does not certify that the corpus is
reality-complete, a generated perspective is faithful, an agent discovered a
primitive, or a candidate may be promoted.

An experiment must declare its corpus cut, observer, capture boundary, missing
evidence, perspective experiments, autonomy boundary, fixed-ontology baseline,
held-out evaluation, and promotion authority. The generator cannot be its sole
verifier, and generated evidence cannot be the only evidence.

## Activation Evidence

KFD-6 remains draft until a real adopter demonstrates discovery beyond
retrieval, pattern-mining, and fixed-ontology baselines; rejects attractive
false candidates; distinguishes objects from perspective artifacts; preserves
causal and responsibility boundaries; and leaves a reviewable path from
experience through perspective transformation to promotion.
