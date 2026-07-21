# KFD-11 Formal Reference

[Authoritative decision](../decisions/KFD-11.md) ·
[Usage](KFD-11-usage.md) ·
[KFD-7 formal reference](KFD-7-formal.md)

- Status: experimental
- Normative: no
- Formal model version: 2
- Authority: `decisions/KFD-11.md`
- Decision status: draft

## Roles

For a software work history `H`:

```text
I = Initiative
X = Assignment
E = Episode
C = claim
A = purpose-bound assessment
D = authorized decision
N = continuation or settlement
```

Representative bindings are:

```text
I = (initiative_id, root, declared_intent, scope, pursuit_roots, participants,
     assignment_relations, lineage, settlement_state)
X = (assignment_id, root, actor, objective, atlas_root, warrant_root,
     acceptance_boundary, expected_evidence, parent_refs, state)
E -> realized causal occurrence
C -> assertion about progress, completion, artifact, or consequence
A -> Assess(C, purpose, evidence_cut, trust_policy)
D -> Decide(A, Warrant)
N -> settle | pause | reopen | request-evidence | successor(X)
```

## Invariants

```text
S1 Occurred(E) does not imply Valid(C).
S2 Asserted(C) does not imply Passed(A).
S3 Passed(A, purpose_1) does not imply Passed(A, purpose_2).
S4 Assessment does not imply authority to decide.
S5 Decision does not erase claim, evidence, assessment purpose, or Episode.
S6 Continuation preserves parent and decision lineage.
S7 Domain labels do not redefine KFD coordinate semantics.
S8 Proposed(X) does not imply Accepted(X).
S9 Accepted(X) does not imply Authorized(X), Occurred(E), Valid(C), or Settled(X).
S10 Identity(I) outlives any one X or E.
S11 A material change to declared_intent(I) requires a revision, fork, or
    successor relation rather than silent reinterpretation.
```

## Software profile bindings

```text
Initiative -> continuing coordinated work context
Assignment -> bounded responsibility proposed to, accepted by, or held by a participant
```

Neither binding is a cross-domain alias. `Initiative != Pursuit`: the former
organizes coordinated work around one or more continuing directions.
`Assignment != Warrant != Episode`: responsibility, authority, and occurrence
remain independently inspectable. A self-assigned Assignment remains valid
only when holder, acceptance, and Warrant are explicit.

## Applicability predicate

```text
Applies_11(profile) =
  SoftwareDevelopment(profile)
  and DeclaresAdoption(profile, KFD-11)
```

No inference from KFD-7, KFD-8, KFD-9, or KFD-10 alone makes KFD-11 mandatory
for another domain.

## Falsifiers

The draft weakens if the role separation does not change software work
decisions, if simpler existing workflow objects preserve equivalent trust and
continuity at lower total cost, or if its model cannot retain a low-friction
session projection.
