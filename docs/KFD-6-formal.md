# KFD-6 Formal Reference

[Authoritative decision](../decisions/KFD-6.md) ·
[Formal model](formal-model.md) ·
[Usage](KFD-6-usage.md) ·
[Documentation map](MAP.md)

- Status: experimental
- Normative: no
- Formal model version: 1
- Authority: `decisions/KFD-6.md`
- Decision status: draft

## Imported vocabulary

`CausalExperience`, `ExperienceCut`, `OntologyState`,
`GenerationExperiment`, `MethodComparison`, `HeldOutEvaluation`,
`PromotionAuthority`.

## Domain objects

At loop step `n`:

```text
E_n       immutable cut of causal experience
O_n       declared current ontology
G_n       set of bounded generation experiments
C_n       method comparison under a shared evidence cut and budget
Q_n       KFD-5 qualification result
H_n       held-out or independent evaluation
A_n       promotion authority
```

The proposed loop is:

```text
(E_n, O_n)
  -> G_n
  -> candidates and no-candidate results
  -> C_n
  -> Q_n
  -> H_n
  -> A_n
  -> O_n or candidate O_(n+1)
  -> new action and causal experience E_(n+1)
```

## Relations and predicates

```text
CapturedBy(e, b)       experience e belongs to capture boundary b
Uses(g, E_n)           experiment g declares its experience cut
Comparable(g1, g2)     experiments share declared evidence and budget rules
Independent(H_n, G_n)  evaluation is not solely produced by the generator
Promotes(A_n, x)        authority A_n admits candidate x into the ontology
SelfCertifies(x)        generator output is its only proof or promotion basis
```

## Invariants

```text
I1  Experiment(g) -> Uses(g, E_n) and Declares(g, O_n)
I2  Compare(G_n) -> at least two declared methods or method configurations
I3  Compare(G_n) -> fixed-ontology and no-new-primitive baselines
I4  Candidate(x) -> QualifiedByKFD5(x)
I5  Promoted(x) -> Independent(H_n, G_n) and Separated(A_n, G_n)
I6  SelfCertifies(x) -> InvalidPromotion(x)
I7  GeneratedEvidenceOnly(x) -> InvalidPromotion(x)
I8  Promotion may preserve O_n when no candidate survives qualification
I9  New experience cannot be silently projected backward into E_n
```

## Loop transition

```text
experience cut fixed
  -> ontology and capture boundary declared
  -> plural bounded experiments run
  -> candidates and negative results retained
  -> methods compared against baselines
  -> candidates qualified through KFD-5
  -> held-out or independent evaluation
  -> separated promotion decision
  -> bounded intervention
  -> consequences enter a new experience cut
```

## Proof obligations

- Preserve action, consequence, observer, capture boundary, and missing facts.
- Declare the ontology being tested.
- Compare methods under explicit evidence and resource budgets.
- Retain negative and false-candidate results.
- Use fixed-ontology and no-new-Primitive baselines.
- Keep generator, verifier, and promotion authority separable.
- Evaluate against held-out evidence and later consequences.
- Keep autonomy bounded and revocable.

## Invalid states

- A model-generated corpus is treated as the only reality evidence.
- The generator is its sole verifier or promotion authority.
- Method comparison changes evidence cuts or budgets without declaration.
- New evidence is projected backward into an old experiment.
- Ontology change is rewarded without a no-new-Primitive baseline.
- Schema conformance is presented as proof that autonomous discovery exists.

## Machine mappings

| Formal statement | Decision source | Schema or check | Verification |
|---|---|---|---|
| `E_n`, `O_n`, `G_n`, `C_n` | Experimental contract | `schemas/kfd-6/autonomous-discovery-loop.schema.json` v4 | Machine for structure |
| `I3`, `I5-I7` | Anti-self-certification | schema constants and `scripts/check.mjs` | Machine for declaration |
| KFD-5 handoff | Qualification boundary | candidate contract/version linkage | Machine for linkage |
| Autonomous discovery capability | Status and activation gate | no current package witness | Not yet proved |

## Non-claims and extension points

KFD-6 is a draft experiment contract. It does not claim that causal experience
is complete, that a dominant genesis method exists, or that autonomous
Primitive discovery has been demonstrated. Activation requires real adopter
evidence, false-candidate rejection, independent evaluation, and accountable
promotion. Later formal versions may refine the loop without weakening its
grounding or anti-self-certification boundaries.
