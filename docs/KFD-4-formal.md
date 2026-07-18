# KFD-4 Formal Reference

[Authoritative decision](../decisions/KFD-4.md) ·
[Formal model](formal-model.md) ·
[Usage](KFD-4-usage.md) ·
[Documentation map](MAP.md)

- Status: experimental
- Normative: no
- Formal model version: 2
- Authority: `decisions/KFD-4.md`

## Imported vocabulary

`Perspective`, `Observer`, `FactCut`, `CausalRecord`, `EvidenceCut`,
`SituatedView`, `ReferenceFrame`, `ProjectionPolicy`,
`PerspectiveTransformation`, `FrameInvariant`, `Replay`, `ContrastiveReplay`,
`DeclaredLoss`.

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

Let `F` be a state space of admitted fact cuts. A perspective defines an
observation map into the objects visible from that frame:

```text
pi_P: F -> O_P
V_P(f) = pi_P(f)
```

For a causal record or path `gamma`, the frame observes `pi_P(gamma)`. A
perspective transformation is:

```text
T_PQ: (P, V_P, gamma_P) -> (Q, V_Q, gamma_Q)
J(T_PQ) = declared invariants preserved across the transformation
```

`J(T_PQ)` may include source and object identity, content roots, evidence cuts,
known causal relations, receipts, and applicable authority boundaries. The
projection may change while these declared invariants remain stable.

## Relations and predicates

```text
Bound(V, P)           view V retains its perspective declaration
Preserves(R, x)       replay R declares element x as preserved
Loses(R, x)           replay R declares element x as lost or degraded
Invents(R, e)         replay R presents generated material as source evidence
Contrasts(R)          R retains at least two source views and one shared context
Material(P1, P2)      perspective change can alter relevance, ordering, object
                      boundary, consequence, or action
InvariantUnder(x, T)  transformation T preserves the declared identity or
                      relation x
Covariant(V1, V2, T)  V2 declares how V1 changes under T without pretending
                      either view is observer-independent
CausalBefore(x, y)    preserved evidence establishes that x causally precedes y
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
I8  PerspectiveBearing(V) -> not AbsoluteContext(V)
I9  PerspectiveTransformation(T) -> Declared(J(T))
I10 x in J(T) -> InvariantUnder(x, T)
I11 CausalBefore(x, y) -> no transformed view may present y as a possible
    cause of x without declaring a contradiction or revised evidence
I12 Covariant(V1, V2, T) permits changed coordinates, relevance, ordering, and
    object boundaries, but not silent mutation of J(T)
```

`I8-I12` are an engineering reference-frame model. They are analogous to
coordinate changes with preserved invariants, but they do not claim physical
relativity, a differentiable manifold, or one complete transformation group
for reality.

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

For a causal path, replay preserves a view-specific projection rather than
collapsing the path into endpoint state:

```text
gamma: f_c0 -> ... -> f_cn
Replay_P(gamma) = pi_P(gamma) + declared loss
```

Two frames may expose different natural objects over the same causal path.
Their comparison is valid only when source identity, boundaries, causal
constraints, and transformation loss remain inspectable.

## Proof obligations

- Identify observer, position, accepted fact cut, and known gaps.
- State the projection or reconstruction policy.
- Preserve source identity and causal constraints.
- Declare the frame invariants that a transformation promises to preserve.
- Show how perspective-dependent projections changed without silently changing
  the fact cuts or causal record beneath them.
- Expose degradation, redaction, generated interpolation, and loss.
- Keep source perspectives distinct in contrastive replay.
- Represent consequence-bearing participants when effects are asymmetric.
- Separate a preserved report from a wider interpretation.

## Invalid states

- A consensus, aggregate, default, developer, or model view is presented as a
  view from nowhere.
- A transformed view silently changes source identity, evidence cut, causal
  relation, receipt, or applicable authority boundary.
- A replay substitutes endpoint state for the causal path it claims to expose.
- Replay fills missing evidence with generated certainty.
- Contrastive replay erases source observers into one synthetic history.
- A transformation guides action without declaring what changed.
- A perspective claim is used to deny causal facts or responsibility.

## Machine mappings

| Formal statement | Decision source | Schema or check | Verification |
|---|---|---|---|
| Perspective-bound timeline | Engineering objects, Gate | `schemas/kfd-4/observer-perspective.schema.json` | Mixed |
| `I2-I5` replay declaration | Engineering objects, Gate | `schemas/kfd-4/perspective-replay.schema.json` | Mixed |
| `I8-I12` reference-frame invariants | Reference-frame rule | None; current schemas preserve selected frame fields only | Manual or mixed |
| Primitive signal handoff | Authority boundary | KFD-4 replay profile to KFD-5 candidate record | Machine for declared linkage |
| KFD package profile wiring | Verification | `standards.json`, `scripts/check.mjs` | Machine |

## Non-normative marginal-cost hypothesis

Let `B123` denote an installed KFD-1 through KFD-3 foundation and let
`Cq(m | B123, E)` be the total cost of producing a KFD-5-qualified Primitive
from evidence `E` with genesis method `m`:

```text
Cq = Cgenesis + Cqualification + Cfalse-candidates + Creality-validation
```

For perspective transformation, the marginal genesis cost after `B123` is
installed is approximately:

```text
Delta Cperspective =
    Cmissing-capture + Creplay + Ccontrast
```

`H4` is the bounded hypothesis that, where trusted multi-perspective evidence
already exists and object boundaries materially depend on position,
perspective transformation is the smallest new general operator and therefore
the lowest-marginal-cost default probe for moving the observation horizon.
`H4` does not claim the lowest total `Cq` in every domain or superiority over
specialized methods.

Evidence against `H4` includes:

- capture, privacy, reconstruction, or replay loss dominating the search cost;
- anomaly, causal, compression, reconstruction, or hybrid methods producing
  equally qualified candidates at lower total cost under comparable evidence
  and budgets;
- perspective transformation producing enough false candidates that
  qualification cost dominates; or
- the same candidate becoming visible without a material change in observation
  horizon.

This hypothesis is not enforced by the current schemas. KFD-5 and KFD-6 provide
the qualification and comparative-learning boundaries needed to test it.

## Non-claims and extension points

KFD-4 does not claim that all interpretations are equally supported, that
causal facts are relative, or that perspective transformation dominates other
genesis methods. The current schemas are timeline and replay profiles, not a
universal perspective ontology. Other profiles may be added if they preserve
observer, evidence, transformation, loss, causality, and responsibility.

Numbered draft KFD-7 uses this frame model to distinguish perspective,
direction, authority, and realized causal experience. KFD-4 does not by itself
prove KFD-7's proposed names, minimality, activation, or universal transfer.
