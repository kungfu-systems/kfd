# KFD-6 Implementation Notes

[Authoritative decision](../decisions/KFD-6.md) ·
[Formal reference](KFD-6-formal.md) ·
[Documentation map](MAP.md)

KFD-6 defines a proposed autonomous discovery loop that is grounded in causal
experience and compares plural generation methods rather than canonizing one. The
authoritative text is `decisions/KFD-6.md`; its registry status is `draft`.

## Package Surface

- `decisions/KFD-6.md`: authoritative proposed procedure.
- `schemas/kfd-6/autonomous-discovery-loop.schema.json`: version 4 experiment
  contract.
- `standards.json#/standards/kfd-6`: schema identity, interface, and concepts.
- `scripts/check.mjs`: package wiring and anti-self-certification checks.

## Version 4 Interface

Version 4 requires `generationExperiments`. Each experiment records its
observation perspective, current ontology, generation methods, causal basis,
procedure, evidence cut, resource budget, outcome, and disconfirming test.

Perspective methods additionally declare transformed views and replay details.
Other methods remain first class rather than being translated into a fictional
perspective origin story. This prevents an autonomous loop from flattening
Episodes into an anonymous corpus while keeping method comparison open.

`methodComparison` binds candidate output to `kfd-5-primitive-discovery` at
`candidateSchemaVersion: 3`. It requires at least two generation methods,
fixed-ontology and no-new-primitive baselines, a shared evidence cut, a
declared resource budget, qualification metrics, limitations, and held-out
evidence.

`boundaryHypothesis` remains conditional. Boundary pressure is useful when
present, but it is not a prerequisite for every genesis method. Replacing the
version 3 perspective-only experiment contract requires version 4 rather than
silently changing its meaning.

## Experimental Use Only

The schema records a bounded experiment. It does not certify that the corpus is
reality-complete, a generated perspective is faithful, an agent discovered a
primitive, or a candidate may be promoted.

An experiment must declare its corpus cut, observer, capture boundary, missing
evidence, generation experiments, method comparison, autonomy boundary,
fixed-ontology and no-new-primitive baselines, held-out evaluation, and
promotion authority. The generator cannot be its sole verifier, and generated
evidence cannot be the only evidence.

## Early Case and Reproduction Boundary

The
[Consequential Settlement case](../cases/live/decision-admission-settlement/README.md)
is an early feasibility case for KFD-6. It records Agent-generated ontology
during real product work, later cross-lineage replay, provisional KFD-5
qualification, and separated human/repository admission. Read its
[development lineage](../cases/live/decision-admission-settlement/development-lineage.md#6-kfd-6-early-feasibility-case)
for the exact mapping and missing gates.

Do not encode that history as a passing version 4 autonomous-loop record. Its
generation methods, evidence cut, budgets, and baselines were not declared
before execution. A future adopter may use the immutable public history as a
seed corpus or retrospective fixture, but must freeze a new experiment cut,
declare plural methods and baselines, separate held-out evaluation, and retain
negative results before making a KFD-6 claim.

## Activation Evidence

KFD-6 remains draft until a real adopter compares multiple generation methods
under bounded conditions; rejects attractive false candidates; distinguishes
objects from perspective, anomaly, model-class, causal, and compression
artifacts; preserves causal and responsibility boundaries; and leaves a
reviewable path from experience through method comparison to promotion.
