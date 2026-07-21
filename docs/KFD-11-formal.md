# KFD-11 Formal Reference

[Authoritative decision](../decisions/KFD-11.md) ·
[Usage](KFD-11-usage.md) ·
[KFD-7 formal reference](KFD-7-formal.md)

- Status: experimental
- Normative: no
- Formal model version: 1
- Authority: `decisions/KFD-11.md`
- Decision status: draft

## Roles

For a software work history `H`:

```text
L = long-horizon intent context
B = bounded delegated responsibility
E = Episode
C = claim
A = purpose-bound assessment
D = authorized decision
N = continuation or settlement
```

Representative bindings are:

```text
L -> one or more Pursuit roots plus project scope
B -> actor, objective, Atlas root, Warrant root, acceptance boundary,
     expected evidence, parent responsibility
E -> realized causal occurrence
C -> assertion about progress, completion, artifact, or consequence
A -> Assess(C, purpose, evidence_cut, trust_policy)
D -> Decide(A, Warrant)
N -> settle | pause | reopen | request-evidence | successor(B)
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
```

## Founding projection

```text
Mission ~= L, primarily a Pursuit context
Go      ~= B, a composite bounded responsibility
```

`~=` means a provisional Domain Profile projection, not identity or a
cross-domain alias.

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
