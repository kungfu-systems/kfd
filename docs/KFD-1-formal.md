# KFD-1 Formal Reference

[Authoritative decision](../decisions/KFD-1.md) ·
[Formal model](formal-model.md) ·
[Usage](KFD-1-usage.md) ·
[Documentation map](MAP.md)

- Status: experimental
- Normative: no
- Formal model version: 1
- Authority: `decisions/KFD-1.md`

## Imported vocabulary

`FactSource`, `ContractWorld`, `WeldedSurface`, `SurfaceRegister`,
`CompatibilityImpact`, `ImpactProjection`, `Witness`.

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
```

## Invariants

```text
I1  LoadBearing(C) -> Declared(Source(C))
I2  Welded(s) and BelongsTo(s, C) -> Registered(s, C)
I3  Projects(a, Source(C)) -> not Drifts(a, C, k)
I4  Gate(delta, C) -> Classified(delta, R(C))
I5  Impact(delta, R(C)) = unclassifiable -> Gate(delta, C) = blocked
I6  PublishedAtImmutableCoordinate(a, k) -> Immutable(a, k)
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

## Invalid states

- Two sources silently claim authority for the same contract world.
- A consumer-welded surface is missing from the register.
- Development and delivered config consume different undeclared sources.
- The same published coordinate resolves to incompatible bytes or semantics.
- An unclassifiable change is treated as permission to guess.

## Machine mappings

| Formal statement | Decision source | Schema or check | Verification |
|---|---|---|---|
| `I1-I5` | Welded-surface register, Compatibility impact, Constraints | `schemas/kfd-1/contract-world.schema.json` | Mixed |
| `I3`, `I6` | Decision, KFD self-application | `schemas/kfd-1/witness.schema.json` | Machine for declared hashes |
| Publication immutability | Compatibility impact, Constraints | `schemas/kfd-1/publication-url-semantics.schema.json` | Mixed |
| KFD package register closure | KFD self-application | `standards.json`, `scripts/check.mjs` | Machine |

## Non-claims and extension points

KFD-1 does not assert that a fact source is complete, infallible, or identical
to reality. It protects a declared contract world from invisible drift so that
reality can contradict it against a stable reference. New domain projections
may be added without changing this reference when they preserve the impact
classes and blocked unclassifiable state.
