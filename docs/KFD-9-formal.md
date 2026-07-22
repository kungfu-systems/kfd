# KFD-9 Formal Reference

[Authoritative decision](../decisions/KFD-9.md) ·
[Usage](KFD-9-usage.md) ·
[KFD-7 formal reference](KFD-7-formal.md)

- Status: experimental
- Normative: no
- Formal model version: 1
- Authority: `decisions/KFD-9.md`
- Decision status: draft

## Object

At Fact cut `f`, a Pursuit version is:

```text
P^v = (id, root, direction, progress_relation, settlement_semantics,
       typed_relations, dependencies, lineage)
```

For action `u` and later Episode `E`:

```text
Advances_P(f, u) = u is prospectively relevant to P^v
Progressed(P^v, E, A_after) = Consequences(E), interpreted through A_after,
                              satisfy ProgressRelation(P^v)
```

```text
Advances_P does not imply Progressed
Progressed does not imply Completed
Completed does not imply Settled
```

## Relations and invariants

Representative relations are `decomposes-to`, `depends-on`, `contributes-to`,
`revises`, and `supersedes`.

```text
P1 Pursuit identity outlives any one session, plan, task body, or Episode.
P2 Pursuit does not imply Atlas or Warrant.
P3 Episode sealing or technical success does not imply completion.
P4 Child progress does not silently settle a parent.
P5 Decomposition does not grant descendant authority.
P6 Material direction change preserves visible revision or successor lineage.
```

## Transitions

```text
Declare -> Revise | Decompose | Fork | Pause | Settle | Abandon | Supersede
```

Concrete enums and success meaning remain Domain Profile-owned.

Terminal `success_conditions` are therefore a Domain Profile field rather than
a universal Pursuit field. Maintenance, prevention, care, and open-ended
practice may preserve progress and settlement semantics without one terminal
success state.

## Falsifiers

The draft weakens if existing goal, task, case, or project identity preserves
equivalent continuity at lower total cost, if the coordinate cannot remain
distinct from Atlas, Warrant, or Episode, or if its relation and settlement
semantics do not transfer across domains.
