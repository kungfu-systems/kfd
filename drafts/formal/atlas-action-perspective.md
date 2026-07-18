# Atlas Action Perspective Formal Candidate

[Candidate](../atlas-action-perspective.md) ·
[KFD-7 formal reference](../../docs/KFD-7-formal.md) ·
[Candidate registry](../registry.json)

- Status: experimental
- Normative: no
- Formal candidate version: 1
- Authority: `drafts/atlas-action-perspective.md`
- Slot binding: non-binding

## Purpose

This page makes the Atlas candidate precise enough to compare with context,
snapshot, retrieval, report, and world-model alternatives. It does not allocate
KFD-8 or turn one product representation into an organization rule.

## Object model

At a declared Fact cut `f`, an Atlas version is:

```text
A^v = (
  atlas_id,
  version_root,
  observer,
  scope,
  accepted_sources,
  fact_cut,
  projection,
  omissions,
  unresolved_conflicts,
  freshness,
  declared_loss
)
```

`atlas_id` preserves continuity across versions. `version_root` identifies one
immutable declaration. Identity and current state are not the same: a ref may
select one version at a later cut without rewriting earlier versions.

`accepted_sources` records epistemic admissibility for this view. It does not
grant action authority. `projection` determines which admitted facts and
relations become visible from the declared observer and scope.

## Observation and support

```text
pi_A^v: F_f -> O_A

Supported_A(f, u) =
  RequiredFacts(u) are visible under pi_A^v
  and SourceBoundary(A^v) is satisfied
  and FreshEnough(A^v, u)
  and not MateriallyContradicted(A^v, u)
```

Support means that the declared view contains an adequate basis for considering
an action. It does not mean that the action advances a Pursuit or is authorized
by a Warrant.

## Equivalence

Two Atlas versions may be payload-equal without being decision-equivalent:

```text
Payload(A1) = Payload(A2)
does not imply
AtlasEquivalent_D(A1, A2)
```

For a bounded decision domain `D`:

```text
AtlasEquivalent_D(A1, A2) iff
  for all f, u in D:
    Supported_A1(f, u) = Supported_A2(f, u)
  and their provenance, freshness, omission, conflict, and loss boundaries
      are interchangeable for D
```

This is behavioral equivalence for one declared domain, not identity equality
or universal substitutability.

## Transitions

```text
Declare(observer, sources, cut, projection) -> A^1
Refresh(A^v, successor_cut)                  -> A^(v+1)
Transform(A^v, target_observer, loss)        -> A'
Degrade(A^v, reason)                         -> degraded view
Supersede(A^v, A^w)                          -> ref movement with lineage
Compare(A1, A2)                              -> contrast with preserved roots
```

Every consequential transition preserves the prior root and records its source
cut, reason, and declared loss. A Profile may own concrete lifecycle labels;
this candidate owns only the semantic distinction among declaration,
successor, transformation, degradation, and supersession.

## Invariants

```text
A1  Atlas identity is independent of session, path, query process, and UI route.
A2  Same visible payload does not erase source, cut, freshness, or loss.
A3  Atlas does not imply Pursuit or Warrant.
A4  A transformed Atlas preserves source lineage and declares transformation loss.
A5  A stale or materially degraded Atlas cannot silently present current support.
A6  Updating a current ref does not rewrite an earlier Atlas version.
A7  Missing perspective or cut identity remains inspectable when consequential.
```

## Session projection

Inside the KFD-7 low-complexity boundary:

```text
Atlas -> bounded context plus inspectable source, cut, freshness, and omission
```

Compression is valid only while one context adequately represents one Atlas.
It must stop when observer, source authority, cut, freshness, conflict, or
declared loss becomes decision-relevant.

## Derived action binding

A product may bind an exact Atlas version into a proposed action:

```text
ActionBinding.atlas_root = root(A^v)
```

The binding is a decision-time receipt or derived view, not a new Primitive
claim. It must not replace Atlas identity or synthesize missing direction or
authority.

## Proof obligations

- Preserve stable identity and immutable version roots.
- Demonstrate same-payload cases where different cuts or freshness change safe
  action.
- Demonstrate perspective transformation with declared provenance and loss.
- Compare reconstruction cost against context, snapshot, report, retrieval,
  query, and world-model alternatives.
- Preserve human and agent access to the same Atlas authority and degradation
  state.
- Show the complexity breakpoint at which a session context must expand into
  an explicit Atlas.

## Invalid states

- Available context is presented as complete reality.
- Retrieval rank is treated as source authority.
- A new query result silently rewrites the view used by an earlier action.
- Two views are merged without preserving observer, cut, omissions, or loss.
- Atlas facts are treated as intent or permission.
- A stale but internally consistent Atlas remains silently actionable.

## Non-claims

This model does not prove that Atlas is universally necessary, require one
serialization or storage engine, define a God's-eye state, make every context
an Atlas, or allocate a KFD number. Product schemas and lifecycle vocabulary
remain adopter-owned until promotion establishes a narrower organization rule.
