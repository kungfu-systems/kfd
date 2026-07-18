# Pursuit Intent Continuity Formal Candidate

[Candidate](../pursuit-intent-continuity.md) ·
[KFD-7 formal reference](../../docs/KFD-7-formal.md) ·
[Candidate registry](../registry.json)

- Status: experimental
- Normative: no
- Formal candidate version: 1
- Authority: `drafts/pursuit-intent-continuity.md`
- Slot binding: non-binding

## Purpose

This page makes the Pursuit candidate precise enough to compare with goal,
task, project, case, workflow, Mission, and session alternatives. It does not
allocate KFD-9 or prescribe one universal work hierarchy.

## Object model

At a declared Fact cut `f`, a Pursuit version is:

```text
P^v = (
  pursuit_id,
  version_root,
  continuing_direction,
  progress_relation,
  success_conditions,
  decomposition_relations,
  dependencies,
  settlement_policy,
  lineage
)
```

`pursuit_id` preserves continuity across Episodes, participants, tools, plans,
and sessions. `version_root` freezes one declaration of direction and
consequence semantics. A change to implementation plan need not create a new
Pursuit; a material change to direction or success meaning must remain visible
as revision, fork, or successor rather than silent prose replacement.

## Direction and progress

For candidate action `u`:

```text
Advances_P(f, u) =
  u is prospectively relevant to the direction declared by P^v
```

After an Episode `E`, actual progress requires a declared consequence view:

```text
Progressed(P^v, E, A_after) =
  Consequences(E) interpreted through A_after
  satisfy ProgressRelation(P^v)
```

Prospective relevance, technical success, progress, completion, and settlement
are distinct:

```text
Advances_P does not imply Progressed
Progressed does not imply Completed
Completed does not imply Settled
```

Settlement may require review, responsibility acceptance, or another bounded
action under a Warrant.

## Typed relation graph

Pursuit structure is a typed graph rather than one universal tree:

```text
decomposes-to
depends-on
contributes-to
revises
supersedes
```

An adopting Profile may require `decomposes-to` or `supersedes` to be acyclic.
It must not collapse all relation types into parent-child inheritance.
Decomposition does not transfer authority, perspective, completion, or trust.

## Equivalence

For a bounded decision domain `D`:

```text
PursuitEquivalent_D(P1, P2) iff
  for all f, u in D:
    Advances_P1(f, u) = Advances_P2(f, u)
  and their progress, success, settlement, and lineage consequences are
      interchangeable for D
```

Equivalent wording or identifiers do not establish this relation. Behavioral
equivalence for one domain does not merge object identity or erase lineage.

## Transitions

```text
Declare(direction, success_conditions) -> P^1
Revise(P^v, compatible_change)          -> P^(v+1)
Decompose(P^v, children)                -> typed relation additions
Fork(P^v, divergent_direction)          -> distinct Pursuit identities
Pause(P^v, reason)                      -> inspectable non-terminal state
Settle(P^v, evidence, review)           -> bounded settlement claim
Abandon(P^v, reason)                    -> inspectable terminal decision
Supersede(P^v, successor)               -> lineage-preserving ref movement
```

Concrete lifecycle enums remain Profile-owned. The candidate requires that
continuation, revision, pause, settlement, abandonment, and supersession remain
distinguishable when they change future action.

## Invariants

```text
P1  Pursuit identity outlives any one session, plan, task body, or Episode.
P2  Pursuit does not imply Atlas or Warrant.
P3  Technical success or Episode sealing does not imply completion.
P4  Child progress or completion does not silently settle a parent.
P5  Decomposition does not grant descendant authority.
P6  Material direction or success-condition change preserves revision lineage.
P7  Settlement remains bound to declared consequence evidence and review.
```

## Session projection

Inside the KFD-7 low-complexity boundary:

```text
Pursuit -> one local goal or work item
```

Compression is valid only while one durable direction, one bounded success
meaning, and one local continuation fit the session. It must stop when work
branches, survives handoff, spans several Episodes, changes success meaning, or
requires independent settlement.

## Derived action binding

A proposed action may reference one exact Pursuit version:

```text
ActionBinding.pursuit_root = root(P^v)
```

The binding states which continuing direction the action claims to advance. It
does not grant authority or prove progress. The later Episode and declared
consequence Atlas provide the evidence for review.

## Proof obligations

- Preserve intent continuity across non-isomorphic sessions, tools, plans, and
  participants.
- Demonstrate histories where a stable Pursuit survives several Episodes.
- Distinguish plan revision from direction revision, fork, and supersession.
- Demonstrate that technical success, progress, completion, and settlement can
  vary independently.
- Compare typed graph relations with task trees, workflow DAGs, project IDs,
  cases, and provider goals.
- Show a session round trip and the breakpoint where Pursuit identity must
  become explicit.

## Invalid states

- A mutable task body is the only identity of continuing intent.
- Reusing an identifier is treated as continuity.
- A command exit or artifact is treated as real-world completion.
- Child completion silently completes a parent.
- Changing success conditions rewrites prior judgments.
- A Pursuit assignment is treated as authority.

## Non-claims

This model does not prove universal necessity, require the name Pursuit, require
one hierarchy, make every task durable, define domain-specific value, or
allocate a KFD number. Concrete lifecycle vocabulary and success policy remain
Profile-owned.
