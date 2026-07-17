---
status: draft
period: 2026-07-17
theme: proof-carrying-work-object
doc_type: live-case
source_level: maintainer-consensus
confidence: medium
sensitivity: public
evidence_grade: C
review_state: self-reviewed
last_reviewed: 2026-07-17
---

# Proof-Carrying Work Object

`Proof-Carrying Work Object` is a working title for a provisional KFD-5
Primitive candidate. Naming remains open.

## Candidate

A proof-carrying work object is a bounded unit of completed or proposed work
that carries enough facts, evidence, responsibility, residual risk, and
continuation conditions for a downstream participant to judge what may safely
happen next without reconstructing the whole basis from scratch.

The candidate is both epistemic and operational:

```text
why a bounded claim may be relied upon
  -> what a downstream participant may do next
```

Possible domain profiles include a Buildchain Release Passport, a replayable
Kungfu Episode, a qualified Primitive Candidate, a source- and
loss-declared Perspective Replay, and a revocable transaction mandate. These
examples motivate the candidate; they do not prove that one common Primitive
exists.

## Current status

```text
status: provisional
genesis: captured
minimum closure: inconclusive
deletion test: inconclusive
fuse test: inconclusive
dogfood: not run as a common cross-domain contract
```

The current machine record is the immutable cut referenced by
[`cases/registry.json`](../../registry.json). A later assessment creates a new
numbered cut; it does not rewrite the genesis cut.

## Why this is a reflexive KFD case

This candidate appeared while KFD was applied to its own propagation problem:

1. KFD-3 reframed propagation as earning cooperation through trusted value
   rather than persuading or pressuring participants.
2. KFD-4 changed the observer from a human organization adopting a standard to
   an agent executing and handing off work.
3. The new view exposed a propagation loop based on discoverable tools,
   verifiable outputs, downstream acceptance, and future routing.
4. KFD-5 separated the loop from the object repeatedly bearing its
   cross-boundary burden.

The resulting hypothesis is that KFD may spread operationally through useful
work objects before participants explicitly study or adopt KFD as a
philosophy. This is a hypothesis, not self-proof.

## Claim boundary

This case does not claim:

- that the working title is final;
- that the candidate is historically novel or universally applicable;
- that the listed examples already implement one shared contract;
- that schema validity or KFD origin proves Primitive status;
- that agents will prefer producers of these objects;
- that operational use will necessarily reproduce KFD behavior;
- that a producer may certify its own work or transfer unlimited authority.

In this case, `proof` means an inspectable, purpose-bound basis for independent
judgment. It does not mean absolute truth or mathematical proof.

## Case surfaces

- [Genesis](genesis.md)
- [KFD method trace](kfd-method-trace.md)
- [Propagation hypothesis](propagation-hypothesis.md)
- [Current KFD-5 cut](cuts/0001-genesis.json)
- [Qualification reviews](reviews/README.md)
- [Live case registry](../../registry.json)

## Qualification direction

The candidate becomes stronger only if reality shows reusable cross-domain
operations, measurable reduction in downstream reinvestigation, safe
purpose-bound reassessment, attenuable and revocable continuation authority,
and transfer beyond first-party examples. Evidence against any of those
properties must remain visible and may result in rejection, subsumption, or a
`no-new-primitive` outcome.
