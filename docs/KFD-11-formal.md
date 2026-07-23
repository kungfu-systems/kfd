# KFD-11 Formal Reference

[Authoritative decision](../decisions/KFD-11.md) ·
[Usage](KFD-11-usage.md) ·
[KFD-2 formal reference](KFD-2-formal.md) ·
[KFD-10 formal reference](KFD-10-formal.md)

- Status: experimental
- Normative: no
- Formal model version: 1
- Authority: `decisions/KFD-11.md`
- Decision status: draft

## Objects

At Fact cut `f`, define:

```text
C = (claim_id, claimant, subject, proposition, basis_cut,
     evidence_refs, audit_boundary, declared_limits)

A = (assessment_id, claim_root, purpose, evidence_cut, trust_policy,
     assessor, result, residual_risk, responsibility)

D = (decision_id, assessment_roots, decision_maker, warrant_root,
     disposition, accepted_scope, conditions, requested_effects,
     reason, residual_risk)

M = (admission_id, decision_root, basis_cut, requested_effects,
     outcome, successor_cut, receipt)
```

`C` and `A` refine KFD-2 Claim and TrustAssessment. `D` introduces the
authority-bound disposition. `M` records the owning admission authority's
result; it does not repeat the Decision.

## Predicates

```text
ExactClaim(C)        subject, proposition, basis, and boundary are exact
PurposeBound(A, p)   A is valid only for declared purpose p
Supports(A, D)       D cites A without inheriting broader trust
Authorized(D, W, f)  W is valid for D's requested effects at cut f
Admitted(M)          requested effects entered a successor Fact cut
```

```text
ValidDecision(D, f) =
  all cited Assessments are exact and purpose-compatible
  and Authorized(D, Warrant(D), f)
  and disposition, accepted scope, conditions, and effects are explicit
```

```text
SuccessfulAdmission(M, D, f) =
  ValidDecision(D, f)
  and M binds D and f
  and M.outcome = admitted
  and M.successor_cut exists
  and M.receipt independently verifies
```

Therefore:

```text
ValidDecision(D, f) does not imply SuccessfulAdmission(M, D, f)
SuccessfulAdmission(M, D, f) does not widen Claim(C) or Warrant(D)
```

## Machine witness predicate

The version 1 adopter witness makes the following closure mechanically
checkable:

```text
Witness_11 =
  DecisionAdmissionEnvelope
  and Exact(Warrant, basis Fact cut, effect scope)
  and IndependentlyVerified(Warrant)
  and SeparatelyRecorded(Admission)
  and ReceiptClass = effect-admission
  and Decision != Admission
  and WriteReceipt != Admission
  and RetryPreservesDecisionIdentity
```

The schema cannot prove that two opaque roots denote different real objects;
the explicit separation assertions are therefore evidence obligations subject
to independent qualification, not self-certification.

## Invariants

```text
D1 Occurred(E) does not imply Claimed(C).
D2 Claimed(C) does not imply Passed(A).
D3 Passed(A, purpose_1) does not imply Passed(A, purpose_2).
D4 Assessment does not grant authority to decide.
D5 Decision authority is bounded by an exact Warrant and basis cut.
D6 A Decision may accept only a declared subset of one Claim.
D7 A valid Decision does not imply successful Admission.
D8 Failed, stale, conflicted, or denied Admission does not create a successor cut.
D9 Admission does not rewrite Claim, Assessment, Decision, Warrant, or Episode.
D10 Retry preserves the original Decision identity and records a new Admission result.
```

## State relation

```text
claim declared
  -> assessment issued | reassessment issued
  -> decision accepted | conditional | rejected | deferred | evidence-requested
  -> admission not-attempted | admitted | rejected | stale | conflicted | failed
```

The labels above are semantic classes. Domain Profiles own their concrete
disposition vocabulary, state machines, admission technology, and effects.

## Deletion tests

- Without Claim, Assessment must reconstruct the proposition from evidence.
- Without Assessment, Decision must silently combine evidence interpretation
  with authority.
- Without Decision, a trust result must directly cause a real-world effect.
- Without Admission, a requested effect is indistinguishable from an accepted
  successor state.

Each deletion removes information that can vary independently while the other
objects remain fixed.

## Falsifiers

The draft weakens if ordinary cross-domain settlement does not need these
separations, if a simpler existing object preserves equivalent decisions at
lower total cost, if Decision and Admission cannot vary independently in real
systems, or if the procedure adds ceremony without reducing unsafe inference
or repeated investigation.
