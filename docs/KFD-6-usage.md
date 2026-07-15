# KFD-6 Implementation Notes

KFD-6 defines a proposed autonomous primitive-discovery loop grounded in causal
experience. The authoritative decision text remains `decisions/KFD-6.md`, and
its current registry status is `draft`.

## Package Surface

- `decisions/KFD-6.md`: authoritative proposed procedure.
- `schemas/kfd-6/autonomous-discovery-loop.schema.json`: experiment contract.
- `standards.json#/standards/kfd-6`: schema identity, interface, and concepts.
- `scripts/check.mjs`: package wiring and anti-self-certification checks.

## Experimental Use Only

The schema records a bounded experiment. It does not certify that the corpus is
reality-complete, that an agent discovered a primitive, or that the candidate
may be promoted.

An experiment must declare its corpus cut, observer, capture boundary, missing
evidence, boundary hypothesis, autonomy boundary, independent evaluation,
held-out evidence, and promotion authority. The generator cannot be its sole
verifier, and generated evidence cannot be the only evidence.

## Boundary Hypothesis

The version 2 experiment interface requires a boundary hypothesis between the
experience basis and candidate generation stages. It records:

- at least two contact sides;
- the previous implicit handling mechanism;
- pressure changes, including whether a new participant is involved;
- observed translation, handoff, attribution, authority, or responsibility
  failures;
- the proposed mediation claim;
- a narrower internal-object alternative;
- whether the hypothesis is supported, inconclusive, or rejected.

Supported boundary pressure raises the priority of a primitive candidate but
does not certify it. A rejected hypothesis is valid evidence and must not be
rewritten as support after the candidate has been generated.

## Activation Evidence

KFD-6 remains draft until a real adopter demonstrates falsifiable discovery
beyond retrieval or summarization baselines, including rejection of attractive
false candidates, discrimination between contact surfaces and internal
patterns, held-out and prospective evaluation, bounded intervention, transfer
evidence, and a separate promotion decision.
