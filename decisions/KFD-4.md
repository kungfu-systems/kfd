# KFD-4: Views must remain bound to declared perspectives

- Status: active
- Number: 4
- Kind: principle
- Applies to: every kungfu-systems product, repository, release surface, extension surface, hosted surface, and participant-facing interface that presents a perspective-bearing view or uses one to guide action

## One sentence

Views must remain bound to declared perspectives.

There is no useful view from nowhere. A view preserves enough of its observer,
accepted facts, position, and transformation history for another participant
to understand, reproduce where possible, and challenge it.

## Decision

A perspective is the position from which facts become relevant, objects become
visible, and consequences are borne. It may belong to a user, developer, agent,
runtime, product surface, organization, or later auditor.

Different perspectives may accept the same causal facts while exposing
different natural objects and boundaries. Consensus, authority, aggregate
statistics, and model output remain perspectives; scale does not turn them
into final reality. Perspective is therefore not error, and facts are not
arbitrary.

KFD-4 requires perspective-bearing views to remain declared and intentionally
transformable. A transformation changes observer, role, consequence,
proximity, accepted evidence, or action boundary to test what the current view
hides.

Perspective transformation is one discovery method, not a ranking theorem.
Direct judgment, anomaly, repeated reconstruction, causal-variable discovery,
structural compression, and hybrid methods may also generate primitive
candidates. KFD-4 governs their prior boundary: every observation remains
situated and auditable.

Once KFD-1 through KFD-3 already preserve fact cuts, make reconstruction trust
assessable, and enable trusted exchange among participants, perspective
transformation is the smallest new general operator: change a declared
position, replay existing evidence with declared loss, and contrast the natural
objects that appear. Under that installed foundation, it is the
lowest-marginal-cost default probe for moving the observation horizon.

This is a bounded engineering hypothesis, not a universal ranking theorem.
Unavailable source perspectives, privacy constraints, capture or
reconstruction cost, replay loss, or a cheap domain-specific anomaly, causal,
or compression method may reverse the comparison. KFD-5 still qualifies every
candidate against facts and consequences.

## Engineering objects

Reliable perspective transformation depends on three connected objects:

- A **perspective-bound timeline** preserves an observer, accepted facts,
  natural objects, consequences, causal order, evidence boundary, and degraded
  state.
- A **perspective-preserving replay** reconstructs a source view for another
  participant without claiming to become the source observer or filling gaps
  with generated certainty.
- A **contrastive replay** compares two or more preserved views in one declared
  context while keeping their observers and fact cuts distinct.

The goal is low marginal transformation cost, not fictional zero cost.
Capture, privacy, redaction, reconstruction, and interpretation remain real
costs. Missing context remains visible as degradation.

Without perspective-bound timelines, replay loses the view that made facts
meaningful. Without replay, a durable view remains locally trapped. Without
source-preserving contrast, comparison creates another undeclared synthetic
perspective.

## Gate

KFD-4 applies when observer position can materially change interpretation,
ordering, relevance, object boundaries, consequences, or action. The
declaration may be natural language, structured metadata, or a domain-specific
contract. Reproducible projection, transformation, or comparison claims should
use a machine gate.

A conforming claim:

- identifies the observer and useful position;
- exposes accepted facts, the evidence cut defining what evidence was
  available at that point, gaps, and degraded states;
- states what changed in a transformation and what became visible;
- identifies replay sources, reconstruction policy, preserved elements, loss,
  and verification state;
- preserves source perspectives and declares the shared context in contrastive
  replay;
- obeys known causality and does not invent evidence;
- does not silently promote a default, consensus, developer, or model view into
  final reality;
- represents the affected participant when consequences are asymmetric.

A purely local operation that makes no perspective-bearing claim does not need
a KFD-4 gate.

## Authority boundary

A participant has local epistemic priority over consequences it directly
bears. Its report can be preserved as a fact; its wider interpretation remains
a claim. Perspective does not make first-person experience infallible, require
agreement, imply a global observer, or certify a primitive. KFD-5 qualifies
primitive candidates.

KFD-4 does not claim that all interpretations are equally supported, that
causal facts are relative, or that perspective transformation is the unique or
superior genesis method. Calling a claim "only a perspective" does not remove
responsibility for its use or consequences.

## Relation to KFD-1 through KFD-3

```text
KFD-1 makes timelines evidentiary.
KFD-2 makes replay trustworthy.
KFD-3 makes contrastive replay cooperative.
KFD-4 makes perspective transformation operational.
```

KFD-4 is the first operating application of the foundation triad. KFD-5 begins
at its declared-perspective boundary and separately qualifies any candidate
produced by perspective or another declared method.

## Verification

The `@kungfu-tech/kfd` package publishes observer-timeline and
perspective-replay profiles under `schemas/kfd-4/`. Package wiring, the Kungfu
perspective-infrastructure case, and adopter responsibilities are documented in
`docs/KFD-4-usage.md` and `docs/foundation-model.md`. Historical and product
cases remain explanatory, not normative.

## Adopters

Adopters cite KFD-4 when a view or action depends materially on observer
position. They own evidence that a concrete capture, replay, or transformation
is faithful.
