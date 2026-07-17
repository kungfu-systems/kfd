# KFD-4 Formal Reference

[Authoritative decision](../decisions/KFD-4.md) ·
[Formal model](formal-model.md) ·
[Usage](KFD-4-usage.md) ·
[Documentation map](MAP.md)

- Status: experimental
- Normative: no
- Formal model version: 1
- Authority: `decisions/KFD-4.md`

## Imported vocabulary

`Perspective`, `Observer`, `EvidenceCut`, `SituatedView`, `ProjectionPolicy`,
`PerspectiveTransformation`, `Replay`, `ContrastiveReplay`, `DeclaredLoss`.

## Domain objects

Define a perspective:

```text
P = (observer, position, acceptedFactCut, naturalObjects,
     consequences, knownGaps)
```

A view is a declared projection:

```text
V = Project(F, P, policy)
```

A replay is:

```text
R = Replay(sourceViews, replayObserver, sharedContext,
           reconstructionPolicy, preservedElements, declaredLoss)
```

`Project` and `Replay` do not create an observer-independent view. They create
new declared views whose relation to source facts and perspectives remains
inspectable.

## Relations and predicates

```text
Bound(V, P)           view V retains its perspective declaration
Preserves(R, x)       replay R declares element x as preserved
Loses(R, x)           replay R declares element x as lost or degraded
Invents(R, e)         replay R presents generated material as source evidence
Contrasts(R)          R retains at least two source views and one shared context
Material(P1, P2)      perspective change can alter relevance, ordering, object
                      boundary, consequence, or action
```

## Invariants

```text
I1  PerspectiveBearing(V) -> exists P: Bound(V, P)
I2  ReplayOf(R, V) -> SourceIdentified(V) and ReconstructionDeclared(R)
I3  Loses(R, x) -> VisibleLoss(R, x)
I4  Invents(R, e) -> Invalid(R)
I5  Contrasts(R) -> SourcePerspectivesRemainDistinct(R)
I6  Material(P1, P2) and GuidesAction(V) -> TransformationDeclared(P1, P2)
I7  FirstPersonReport(p) may be preserved as fact while Interpretation(p)
    remains a claim
```

## Transformation transition

```text
declare source perspective and evidence cut
  -> preserve a perspective-bound view
  -> select replay or transformation policy
  -> reconstruct with declared preservation and loss
  -> compare in a declared shared context when contrastive
  -> expose newly visible objects, burdens, gaps, or consequences
  -> hand any Primitive candidate to KFD-5
```

## Proof obligations

- Identify observer, position, accepted fact cut, and known gaps.
- State the projection or reconstruction policy.
- Preserve source identity and causal constraints.
- Expose degradation, redaction, generated interpolation, and loss.
- Keep source perspectives distinct in contrastive replay.
- Represent consequence-bearing participants when effects are asymmetric.
- Separate a preserved report from a wider interpretation.

## Invalid states

- A consensus, aggregate, default, developer, or model view is presented as a
  view from nowhere.
- Replay fills missing evidence with generated certainty.
- Contrastive replay erases source observers into one synthetic history.
- A transformation guides action without declaring what changed.
- A perspective claim is used to deny causal facts or responsibility.

## Machine mappings

| Formal statement | Decision source | Schema or check | Verification |
|---|---|---|---|
| Perspective-bound timeline | Engineering objects, Gate | `schemas/kfd-4/observer-perspective.schema.json` | Mixed |
| `I2-I5` replay declaration | Engineering objects, Gate | `schemas/kfd-4/perspective-replay.schema.json` | Mixed |
| Primitive signal handoff | Authority boundary | KFD-4 replay profile to KFD-5 candidate record | Machine for declared linkage |
| KFD package profile wiring | Verification | `standards.json`, `scripts/check.mjs` | Machine |

## Non-claims and extension points

KFD-4 does not claim that all interpretations are equally supported, that
causal facts are relative, or that perspective transformation dominates other
genesis methods. The current schemas are timeline and replay profiles, not a
universal perspective ontology. Other profiles may be added if they preserve
observer, evidence, transformation, loss, causality, and responsibility.
