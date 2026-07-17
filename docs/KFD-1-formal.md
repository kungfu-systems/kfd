# KFD-1 Formal Reference

[Authoritative decision](../decisions/KFD-1.md) ·
[Formal model](formal-model.md) ·
[Usage](KFD-1-usage.md) ·
[Documentation map](MAP.md)

- Status: experimental
- Normative: no
- Formal model version: 2
- Authority: `decisions/KFD-1.md`

## Imported vocabulary

`FactSource`, `ContractWorld`, `WeldedSurface`, `SurfaceRegister`,
`CompatibilityImpact`, `ImpactProjection`, `Witness`, `Candidate`,
`SlotHint`, `FoundationRevision`, `FoundationFreeze`.

## Domain objects

Let:

- `C` be a contract world;
- `Source(C)` be its one declared fact source;
- `R(C)` be its welded-surface register;
- `Artifact(s, k)` be the artifact observed for surface `s` at coordinate `k`;
- `Impact(delta, R)` be the classification of a final change against `R`.

A composite source is allowed only when the composition rule is itself the one
declared source. Undeclared fallback sources do not form a valid contract
world.

## Relations and predicates

```text
Registered(s, C)       s is present in R(C)
Welded(s)              a consumer binds at integration time or across time
Projects(a, Source(C)) a is a declared projection of the fact source
Drifts(a, C, k)        a conflicts with Source(C) at coordinate k without a
                       declared compatibility boundary
Classified(delta, R)   Impact(delta, R) is breaking, additive, none, or
                       unclassifiable
Allocated(c, n)        candidate c has been promoted to KFD number n
Frozen(n)              the number and meaning at n passed Foundation Freeze
```

## Invariants

```text
I1  LoadBearing(C) -> Declared(Source(C))
I2  Welded(s) and BelongsTo(s, C) -> Registered(s, C)
I3  Projects(a, Source(C)) -> not Drifts(a, C, k)
I4  Gate(delta, C) -> Classified(delta, R(C))
I5  Impact(delta, R(C)) = unclassifiable -> Gate(delta, C) = blocked
I6  PublishedAtImmutableCoordinate(a, k) -> Immutable(a, k)
I7  Candidate(c) and not Promoted(c) -> not exists n: Allocated(c, n)
I8  SlotHint(c, n) -> not Allocated(c, n)
I9  FoundationRevision(delta) -> PreStable(delta)
     and BreakingImpact(delta)
     and PreservesPublishedCoordinates(delta)
     and PublishesLineage(delta)
I10 Frozen(n) -> MeaningAt(n) changes only through explicit supersession
```

`I3` does not require every projection to be byte-identical. It requires the
transformation and compatibility boundary to be declared. A byte-for-byte
witness is one strong profile.

## State transition

```text
unregistered
  -> registered
  -> final-diff-classified
  -> domain-impact-projected
  -> gated
  -> published
```

KFD candidate and foundation states use a separate transition:

```text
candidate
  -> qualified
  -> explicitly-promoted
  -> numbered-draft
  -> active
  -> foundation-freeze
  -> superseded-by-new-number
```

A pre-stable Foundation Revision may return the latest numbered structure to a
reviewed candidate or draft state, but it cannot mutate a published coordinate.

Allowed classification results:

```text
breaking       -> explicit breaking action
additive       -> explicit additive action and register update when needed
none           -> no registered-surface action
unclassifiable -> block and repair the register
```

## Proof obligations

- Identify `Source(C)` and its stable coordinate.
- Enumerate every known welded surface.
- Show that each projection points to the declared source.
- Classify the final diff, not only the planned change.
- Show the domain action corresponding to the classification.
- Preserve declared immutable publication coordinates and witnesses.
- Keep candidate slot hints non-binding until explicit promotion.
- For a Foundation Revision, prove pre-stable status, breaking impact,
  authorization, preserved coordinates, lineage, migration, and projection
  closure.
- At Foundation Freeze, record the final number-to-meaning mapping.

## Invalid states

- Two sources silently claim authority for the same contract world.
- A consumer-welded surface is missing from the register.
- Development and delivered config consume different undeclared sources.
- The same published coordinate resolves to incompatible bytes or semantics.
- An unclassifiable change is treated as permission to guess.
- A candidate slot hint is presented as an allocated KFD number.
- A Foundation Revision rewrites a prior commit, tag, package, digest, or
  immutable rendered coordinate.
- A stable number changes meaning without explicit supersession.

## Machine mappings

| Formal statement | Decision source | Schema or check | Verification |
|---|---|---|---|
| `I1-I5` | Welded-surface register, Compatibility impact, Constraints | `schemas/kfd-1/contract-world.schema.json` | Mixed |
| `I3`, `I6` | Decision, KFD self-application | `schemas/kfd-1/witness.schema.json` | Machine for declared hashes |
| `I7-I10` | KFD self-application, contribution governance | `schemas/kfd-candidate-registry.schema.json`, `drafts/registry.json`, `CONTRIBUTING.md` | Mixed |
| Publication immutability | Compatibility impact, Constraints | `schemas/kfd-1/publication-url-semantics.schema.json` | Mixed |
| KFD package register closure | KFD self-application | `standards.json`, `scripts/check.mjs` | Machine |

## Non-claims and extension points

KFD-1 does not assert that a fact source is complete, infallible, or identical
to reality. It protects a declared contract world from invisible drift so that
reality can contradict it against a stable reference. New domain projections
may be added without changing this reference when they preserve the impact
classes and blocked unclassifiable state.
