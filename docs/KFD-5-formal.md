# KFD-5 Formal Reference

[Authoritative decision](../decisions/KFD-5.md) ·
[Formal model](formal-model.md) ·
[Usage](KFD-5-usage.md) ·
[Documentation map](MAP.md)

- Status: experimental
- Normative: no
- Formal model version: 1
- Authority: `decisions/KFD-5.md`

## Imported vocabulary

`Genesis`, `GenesisMethod`, `PrimitiveCandidate`, `Qualification`,
`Falsifier`, `DogfoodEvidence`, `PromotionOutcome`.

## Domain objects

For candidate `x`:

```text
Genesis(x) =
  (observationPerspective, currentOntology, methods, observation,
   methodEvidence, candidateObject, claimBoundary)

PrimitiveShape(x) =
  (identity, boundary, authority, lifecycle, operations)

Qualification(x) =
  (facts, alternatives, tests, falsifiers, dogfoodEvidence, outcome)
```

Generation and qualification are different functions:

```text
Generate(context, methods) -> candidate | no-candidate
Qualify(candidate, facts, tests) -> accept | provisional | reject | subsume | no-new-primitive
```

The same participant may perform both functions only when the functions,
evidence, and decision responsibility remain separately inspectable.

## Relations and predicates

```text
GeneratedBy(x, m)     method m contributed to candidate x
Grounded(x, f)        candidate x binds to fact f
Alternative(a, x)     a explains the need without promoting x
Falsifies(t, x)       test t states a result that would reject x
Closes(x)              x has the minimum Primitive shape
Promoted(x)            x receives durable identity and authority
```

## Invariants

```text
I1  Candidate(x) -> Declared(Genesis(x))
I2  Candidate(x) -> Declared(PrimitiveShape(x))
I3  Promoted(x) -> Completed(Qualification(x))
I4  Qualification(x) -> Facts(x) is not empty and Falsifiers(x) is not empty
I5  Qualification(x) -> Alternatives(x) includes no-new-primitive
I6  GeneratedBy(x, m) does not imply Qualified(x)
I7  SchemaValid(x) does not imply Primitive(x)
I8  MethodSet may contain perspective, anomaly, reconstruction, causal,
    compression, direct judgment, other declared methods, or hybrids
```

## Discovery transition

```text
pressure or observation
  -> declared genesis
  -> candidate or no candidate
  -> fact binding and Primitive shape
  -> alternative comparison
  -> minimum-closure, deletion, fuse, falsifier, and dogfood tests
  -> accept, provisional, reject, subsume, or no-new-primitive
  -> accountable promotion when accepted
```

## Proof obligations

- Declare the observation perspective and current ontology.
- Name every genesis method and its evidence.
- Separate local priority from the wider Primitive claim.
- Define identity, boundary, authority, lifecycle, and operations.
- Compare narrower objects, prior art, other methods, and no new Primitive.
- State falsifiers before promotion.
- Record real dogfood consequences and the final outcome.

## Invalid states

- A compelling name or design is promoted without qualification.
- A schema-valid candidate is treated as proof of a Primitive.
- Perspective transformation is assumed to be the only valid genesis method.
- The candidate generator silently acts as sole promotion authority.
- Alternatives or falsifiers are written only after the preferred result.

## Machine mappings

| Formal statement | Decision source | Schema or check | Verification |
|---|---|---|---|
| Genesis and Primitive shape | Separation, Candidate record | `schemas/kfd-5/primitive-discovery.schema.json` v3 | Machine for structure |
| Method plurality | Method plurality | genesis method enum plus declared `other` path | Machine for declared values |
| Qualification sequence | Qualification | candidate record tests and decision | Mixed |
| Primitive truth | Boundaries | no package schema | Reality and accountable judgment |

## Non-claims and extension points

KFD-5 does not provide a deterministic invention algorithm or rank one genesis
method above all others. It makes candidate production and promotion
inspectable and falsifiable. Future method taxonomies, qualification tests, and
domain profiles may extend the procedure without collapsing genesis into
qualification.
