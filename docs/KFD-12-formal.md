# KFD-12 Formal Reference

[Authoritative decision](../decisions/KFD-12.md) ·
[Usage](KFD-12-usage.md) ·
[KFD-11 formal reference](KFD-11-formal.md)

- Status: experimental
- Normative: no
- Formal model version: 1
- Authority: `decisions/KFD-12.md`
- Decision status: draft

## Object

For software project domain `S`, a Project Cut is:

```text
PC^v = (
  protocol_version,
  predecessor_roots,
  source_projection_root,
  atlas_root,
  admitted_episode_delta_root,
  policy_and_protocol_roots,
  omissions,
  conflicts,
  unknowns,
  residual_risk
)

project_cut_root = Hash(CanonicalEncode(PC^v))
```

The root commits to bindings. It does not absorb the semantics or authority of
the bound systems.

## Validity

```text
ValidProjectCut(PC) =
  Canonical(PC)
  and AllInputsNamed(PC)
  and AllInputsVerifiedUnderOwnAuthority(PC)
  and NoCircularRootDependency(PC)
  and OmissionsConflictsUnknownsDeclared(PC)
  and RecomputableRoot(PC)
  and IndependentlyCheckableReceipt(PC)
```

```text
ValidProjectCut does not imply WorkComplete
ValidProjectCut does not imply ReleaseFit
ValidProjectCut does not imply PursuitSettled
```

## Invariants

```text
C1 Source, Atlas, Episode, and policy authorities remain distinct.
C2 Equal canonical inputs produce the same Project Cut root.
C3 The containing publication coordinate is not an input to its own root.
C4 Successor cuts preserve predecessor lineage.
C5 Missing, stale, conflicting, or unverifiable bindings fail visibly.
C6 A receipt reports verification; it does not self-certify semantic fitness.
C7 Project Cut remains software-domain vocabulary unless separately qualified.
```

## Applicability predicate

```text
Applies_12(profile) =
  SoftwareDevelopment(profile)
  and PublishesProjectSettlement(profile)
  and DeclaresAdoption(profile, KFD-12)
```

KFD-12 is not implied by adopting KFD-7 through KFD-11.

## Falsifiers

The draft weakens if a single existing authority can preserve equivalent
project decisions without hidden reconstruction, if independent roots cannot
be bound deterministically without semantic fusion, or if Project Cut adds no
decision value over ordinary release or source coordinates.
