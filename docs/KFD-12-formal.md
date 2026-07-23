# KFD-12 Formal Reference

[Authoritative decision](../decisions/KFD-12.md) ·
[Usage](KFD-12-usage.md) ·
[KFD-7 formal reference](KFD-7-formal.md)

- Status: experimental
- Normative: no
- Formal model version: 3
- Authority: `decisions/KFD-12.md`
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
M = independently recorded admission result
N = continuation or settlement
```

Representative bindings are:

```text
I = (initiative_id, root, coordination_purpose, scope, pursuit_roots,
     participants, assignment_relations, settlement_policy, lineage,
     profile_state)
X = (assignment_id, root, holder, accepted_responsibility, initiative_roots,
     pursuit_roots, atlas_root, warrant_root, acceptance_boundary,
     evidence_obligations, settlement_policy, typed_relations, profile_state)
E -> realized causal occurrence
C -> assertion about progress, completion, artifact, or consequence
A -> Assess(C, purpose, evidence_cut, trust_policy)
D -> Decide(A, Warrant)
M -> Admit(D, basis_cut) | reject | stale | conflict | fail
N -> settle | pause | reopen | request-evidence | successor(X, M)
```

## Invariants

```text
S1 Occurred(E) does not imply Valid(C).
S2 Asserted(C) does not imply Passed(A).
S3 Passed(A, purpose_1) does not imply Passed(A, purpose_2).
S4 Assessment does not imply authority to decide.
S5 Decision does not imply Admission or erase Claim, evidence, assessment purpose, or Episode.
S6 Admission publishes a successor Fact cut only on success.
S7 Continuation preserves parent, Decision, and Admission lineage.
S8 Domain labels do not redefine KFD coordinate semantics.
S9 Proposed(X) does not imply Accepted(X).
S10 Accepted(X) does not imply Authorized(X), Occurred(E), Valid(C), or Settled(X).
S11 Identity(I) outlives any one X or E.
S12 A material change to coordination_purpose(I), scope(I), or Pursuit bindings
    requires a revision, fork, or successor relation rather than silent
    reinterpretation.
S13 accepted_responsibility(X) does not redefine direction or settlement
    semantics of any bound Pursuit.
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

## Machine witness predicate

```text
Witness_12 =
  Separate(Initiative, Pursuit)
  and Separate(Assignment, Warrant, Episode)
  and Separate(Proposal, Acceptance)
  and ExactBindings(Assignment, Initiative, Pursuit, Atlas, Warrant)
  and Preserved(SettlementEvidence, ContinuationLineage)
  and RoundTrip(SimpleSession,
      Initiative, Assignment, Episode, Claim,
      Assessment, Decision, Admission, Continuation)
```

The version 1 adopter witness records these obligations without prescribing a
storage layout, API, command, or visible object count.

## Applicability predicate

```text
Applies_12(profile) =
  SoftwareDevelopment(profile)
  and DeclaresAdoption(profile, KFD-12)
```

No inference from KFD-7 through KFD-11 alone makes KFD-12 mandatory for another
domain.

## Falsifiers

The draft weakens if the role separation does not change software work
decisions, if simpler existing workflow objects preserve equivalent trust and
continuity at lower total cost, or if its model cannot retain a low-friction
session projection.
