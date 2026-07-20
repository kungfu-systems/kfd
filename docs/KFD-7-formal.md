# KFD-7 Formal Reference

[Authoritative decision](../decisions/KFD-7.md) ·
[Formal model](formal-model.md) ·
[Usage](KFD-7-usage.md) ·
[Documentation map](MAP.md)

- Status: experimental
- Normative: no
- Formal model version: 3
- Authority: `decisions/KFD-7.md`
- Decision status: active

## Imported vocabulary

`FactCut`, `CausalRecord`, `Episode`, `Atlas`, `Pursuit`, `Warrant`,
`ActionSpace`, `ObservationProjection`, `TargetRelation`,
`AdmissibleTransition`, `RealizedPath`.

## Fact-Episode Ontology

Let `F` be a state space admitted by declared fact sources. A fact cut is an
independently addressable state:

```text
f_c in F
```

A causal record connects declared cuts:

```text
E: f_c0 -> f_c1
Before(E) = f_c0
After(E)  = f_c1
```

For sequential work:

```text
f_c0 --(u1, r1)--> f_c1 --(u2, r2)--> ... --(un, rn)--> f_cn
```

Concurrent work may require a causal DAG or partial order rather than one
universal clock. `E` is not the endpoint difference:

```text
Before(E) = After(E) does not imply Empty(E)
```

Facts define admitted state. Episodes preserve realized causal occurrence.
Together they form the ontology over which Action Geometry operates. The
object-and-path interpretation is:

```text
Fact cuts  -> object-like admitted states
Episodes   -> morphism-like realized causal transitions
compose(E1, E2) only when After(E1) = Before(E2)
```

This is a contract-world ontology, not a claim that every domain is literally
a mathematical category or that KFD enumerates all of reality.

## Action Geometry

Action Geometry is the cross-domain responsibility model for real-world
action. The subtitle is explanatory; `Action Geometry` remains the canonical
formal term.

The three action Primitives constrain different structures over `F`:

```text
Atlas:    pi_A: F -> O_A
Pursuit:  target set G_P within F, or ordering/value V_P over reachable states
Warrant:  admissible transition set C_W(f) from fact cut f
```

`pi_A` is the observation projection: it determines which facts and relations
are visible from an addressable perspective. `G_P` or `V_P` supplies
direction: which consequences count as progress. `C_W(f)` is the permission
cone: which next transitions are authorized. A realized Episode preserves the
path `gamma_E` that actually happened through the ontology; it is not a fourth
Action Geometry coordinate.

The term `cone` means a local set of admissible directions. It does not require
a differentiable manifold. Each responsibility may itself be internally
high-dimensional.

## Relations and predicates

For candidate action `u`:

```text
Supported_A(f, u)    action u is supported by Atlas A at cut f
Advances_P(f, u)     action u can advance Pursuit P
Authorized_W(f, u)   action u is permitted by Warrant W
Realizes(E, u)       causal record E preserves the realized action
Admits(f', C)        successor cut f' becomes visible in contract world C
```

The valid action set is:

```text
U_valid(f) = {u |
  Supported_A(f, u)
  and Advances_P(f, u)
  and Authorized_W(f, u)}
```

A policy may choose:

```text
u* in Select_P(U_valid(f))
E = Execute(f, u*) = (f, u*, observed consequences, f')
```

`Select_P` need not be scalar optimization. It may be a partial order,
multi-objective judgment, policy, deliberation, or accountable human choice.

## Invariants

```text
I1  Consequential(u) -> BoundToFactCut(u) and BoundToPerspective(u)
I2  Valid(u) -> Supported_A(f, u) and Advances_P(f, u)
                and Authorized_W(f, u)
I3  Atlas does not imply Pursuit or Warrant
I4  Pursuit does not imply Atlas or Warrant
I5  Warrant does not imply Atlas or Pursuit
I6  Planned(u) or Authorized(u) does not imply Occurred(u)
I7  Occurred(u) does not imply Authorized(u), Advanced(u), or Completed(u)
I8  SameEndpoints(E1, E2) does not imply Equivalent(E1, E2)
I9  Compose(E1, E2) -> After(E1) = Before(E2)
I10 Sealed(E) does not silently imply Admitted(After(E), C)
I11 SimplifiedInterface(u) may hide ceremony but not fuse responsibility
I12 Missing or derived responsibility remains inspectable when consequence is
    material
I13 For every session-compressible session s,
    Project(Expand(s)) is decision-observationally equivalent to s
I14 not SessionCompressible(h) -> the independently relevant roles become
    addressable
I15 Context payload alone is not a sufficient statistic for valid action
    whenever two states with the same payload have different valid action sets
I16 Semantic independence is invariant under physical co-location: one record,
    type, API, process, or interface may carry several responsibilities when
    each mapping remains traceable and counterfactually distinguishable
```

Define semantic distinguishability without imposing physical multiplicity:

```text
Distinguishable(r_i, r_j, h) iff
  TraceableSource(r_i, h)
  and TraceableSource(r_j, h)
  and ExistsCounterfactualVariation(r_i, r_j, h)
  and ProhibitedCrossInferenceFailsVisible(r_i, r_j, h)
```

`ExistsCounterfactualVariation` means that within the adopter's declared
scope, changing, invalidating, expiring, revoking, or making stale one
responsibility can change a valid-action or audit conclusion while the other
responsibility remains fixed. It does not require separate serialized bodies.

## Conservative session projection

Let `S_c` be the set of ordinary sessions inside the declared low-complexity
boundary, and let `K_c` be the set of histories with two ontology bindings and
three action-Primitive mappings that remain compressible to one session. A
bounded history `h` is session-compressible when:

```text
SessionCompressible(h) =
  OneLocalPursuit(h)
  and OneAdequateAtlas(h)
  and OneStableWarrant(h)
  and OneContiguousEpisode(h)
  and SparseFactChange(h)
```

Define two typed transformations:

```text
Expand:  S_c -> K_c
Project: K_c -> S_c

Project(h) = (
  goal        := Pursuit(h),
  context     := Atlas(h),
  permissions := Warrant(h),
  run         := Episode(h),
  input       := Before(Episode(h)),
  result      := After(Episode(h))
)
```

`Expand` recovers the Fact and Episode bindings plus the three independently
addressable Action Geometry mappings from the session fields and their
inspectable defaults. `Project` presents a session-compatible view.

### Session round-trip preservation theorem

Define decision-observational equivalence componentwise:

```text
s1 equivalent_D s2 iff
  Direction(s1)               = Direction(s2)
  and PerspectiveBoundary(s1) = PerspectiveBoundary(s2)
  and EffectiveAuthority(s1)  = EffectiveAuthority(s2)
  and CausalProcess(s1)        = CausalProcess(s2)
  and AdmittedResult(s1)       = AdmittedResult(s2)
```

Then the conservative round trip is:

```text
for all s in S_c:
  Project(Expand(s)) equivalent_D s
```

The theorem follows from five component obligations: the implementation's
`Expand` and `Project` pair preserves direction, perspective boundary,
effective authority, causal process, and admitted result. It does not assert
byte identity or make the underlying responsibilities identical.

Proof sketch: each component obligation establishes one conjunct in the
definition of `equivalent_D`; conjunction introduction establishes the
round-trip result for every `s` in `S_c`. The proof is conditional on the
declared domain and the implementation refinement. It is not evidence that an
arbitrary product satisfies either.

The reverse direction is intentionally narrower:

```text
for all h in CanonicalSessionImage(Expand):
  Expand(Project(h)) equivalent_K h
```

It does not hold for arbitrary action histories. Several
directions, perspectives, authority states, Episodes, or material Fact
branches contain information that one session cannot preserve.
`equivalent_K` here means preservation of the two ontology bindings and three
action mappings inside the image of `Expand`; it is not a claim of general
causal identity.

Compression must stop when any assumption becomes decision-relevant:

```text
SeveralPursuits
or PerspectiveOrFreshnessChange
or DelegatedExpiredOrRevokedAuthority
or SeveralEpisodes
or MaterialFactBranch
  -> not SessionCompressible(h)
```

At that breakpoint, an implementation exposes the affected independent roles
instead of silently retaining a lossy session projection. This makes KFD-7 a
conservative extension of ordinary session work rather than a requirement for
permanent five-object ceremony.

## Context insufficiency corollary

Let `ContextPayload(h)` denote the visible token, document, or message payload
presented as an agent's context, excluding independently addressable Atlas
provenance, cut, and freshness metadata. Context alone is sufficient for action
only if equal payload always yields the same valid action set:

```text
ContextSufficient iff
  for all h1, h2:
    ContextPayload(h1) = ContextPayload(h2)
      -> U_valid(h1) = U_valid(h2)
```

KFD-7 supplies direct counterexamples. Hold context fixed and vary only one
independent responsibility:

```text
same payload + different Pursuit -> different Advances_P predicates
same payload + different Warrant -> different Authorized_W predicates
same payload + different Atlas cut or freshness -> different Supported_A predicates
```

Therefore:

```text
exists h1, h2:
  ContextPayload(h1) = ContextPayload(h2)
  and U_valid(h1) != U_valid(h2)

=> context alone is not a sufficient statistic for valid action
```

This is a limitation of treating session context as the sole ontology, not of
using one physical session record. One record may conform when it explicitly
preserves the two ontology bindings and three action mappings, keeps their
sources and defaults inspectable, and expands them at complexity breakpoints.

## Conditional irreducibility

The current minimality claim is conditional non-derivability:

```text
Atlas does not imply Pursuit
(Atlas, Pursuit) does not imply Warrant
(Atlas, Warrant) does not imply Pursuit
(Pursuit, Warrant) does not imply Atlas
```

Test it counterfactually:

- hold Atlas and Warrant fixed; vary Pursuit;
- hold Pursuit and Warrant fixed; vary Atlas;
- hold Atlas and Pursuit fixed; vary Warrant;
- hold all three fixed; vary the realized Episode.

If a substitution changes safe action, expected value, authority, or audit
conclusions, the varied role carries independent decision-relevant
information. If repeated cross-domain evidence shows that one role is
losslessly derivable, the minimality claim weakens.

## Categorical compression

```text
Fact cuts        -> objects
possible actions -> candidate morphisms
Atlas            -> observation projection over objects and morphisms
Warrant          -> predicate or subspace of admissible morphisms
Pursuit          -> target relation or ordering over reachable objects
Episode          -> realized morphism or composable causal path
```

This compression explains why occurrence is not a fourth state coordinate.
Atlas, Pursuit, and Warrant constrain possible action at a cut; Episode
preserves movement between cuts.

## Action transition

```text
declare current Fact cut
  -> resolve Atlas, Pursuit, and Warrant
  -> compute or deliberate over U_valid
  -> select and perform bounded action
  -> preserve realized Episode
  -> assess claims, consequences, and responsibility
  -> explicitly admit successor Fact cut
```

## Proof obligations

- Identify the fact source and cut used for action.
- Preserve Atlas, Pursuit, and Warrant as independently addressable roles.
- Show the derivation of defaults without fusing responsibility.
- Prove applicable Warrant scope, derivation, expiry, and revocation state.
- Preserve causal ordering, failures, retries, cost, and consequences.
- Distinguish occurrence from success, progress, completion, and admission.
- Round-trip low-complexity work through the session projection without losing
  the five bounded decision observations or requiring manual object
  management.
- Bind the implementation's `Expand`, `Project`, and
  `SessionCompressible` definitions to the standard round-trip theorem.
- Provide same-payload counterexamples showing that context alone cannot
  determine direction, authority, or perspective freshness.
- Expose the independently relevant roles when a session-compressibility
  assumption fails.
- Test counterfactual independence and fused alternatives.
- Show semantic role mappings and their source/cut/version traceability without
  treating physical component count as evidence.
- Demonstrate cross-domain transfer and progressive disclosure before
  activation.

## Action Geometry and Domain Profile closure

Let the Action Geometry be the cross-domain structure:

```text
ActionGeometry = (
  reference to the Fact-Episode Ontology,
  Pursuit, Atlas, and Warrant coordinates,
  cross-role invariants,
  conservative session projection
)
```

Let a Domain Profile be one adopter's versioned refinement:

```text
DomainProfile = (
  implementation coordinate,
  qualification status,
  two ontology-binding declarations,
  three action-Primitive mapping declarations,
  domain-owned field schemas and lifecycle vocabulary,
  transitions,
  prohibited inferences,
  evidence obligations,
  non-claims and extensions,
  activation verdict
)
```

The draft machine contract records a `DomainProfile` declaration rather than
one physical state machine. A conforming Domain Profile binds Fact and Episode,
maps every action Primitive to the Action Geometry, and may refine domain
vocabulary and policy, but it cannot redefine either ontology or geometry
boundaries.

Each transition declaration binds:

```text
subject role + prior Domain Profile state + operation + preconditions
  -> effect + receipt + evidence + denial reasons + residual risks
```

For Domain Profile claim `C` at evidence cut `K`:

```text
Qualified(C, K) :=
  schema conformance
  and reference to the KFD-7 round-trip theorem and context-insufficiency
      corollary
  and implementation refinement evidence for Expand and Project
  and session complexity-breakpoint evidence
  and same-payload, different-valid-action-set counterexamples
  and positive and negative transition evidence
  and role deletion or fusion evidence
  and export, rebuild, and migration evidence
  and concurrency, retry, or compensation evidence
  and Warrant decay and revocation evidence
  and Atlas staleness and loss evidence
  and Pursuit continuity and settlement evidence
  and Episode replay or declared contraction evidence
  and cold-start continuation evidence
  and retained residual risk
  and independent review
```

`not-applicable` requires a bounded reason. An `activate` verdict requires a
qualified Domain Profile, an exact evidence cut, independent review, retained
product witnesses, and no planned or failed obligation. Qualification remains
relative to that Domain Profile and cut; it does not establish universal
minimality.

This separation avoids re-proving the generic model for every product. KFD
states the Action Geometry and conditional theorem once. A Domain Profile
proves that its concrete session fields, defaults, and runtime transitions
refine the theorem's five observations, then retains breakpoint and
context-insufficiency witnesses. Empirical usability, runtime correctness, and
cross-domain transfer remain product evidence.

## Invalid states

- Intention or assignment is treated as authorization.
- Available context is presented as complete reality.
- Authentication or capability is treated as a Warrant.
- A plan, expected transition, or permission is presented as occurrence.
- Technical success or Episode sealing is presented as completion.
- Before-and-after state is presented as the complete causal record.
- Equal-endpoint Episodes are treated as equivalent without causal comparison.
- A parent object silently supplies child authority.
- A low-friction interface makes hidden, stale, or missing responsibility
  impossible to inspect.
- Simple work requires permanent explicit management of all action roles.
- Complex work remains compressed after a session assumption becomes
  decision-relevant and false.

## Machine mappings

| Formal statement | Decision source | Schema or check | Verification |
|---|---|---|---|
| Fact-cut and Episode separation | Fact-Episode Ontology | KFD-1 formal reference and KFD-7 Domain Profile ontology-binding declarations | Structural plus product evidence |
| Atlas/Pursuit/Warrant separation | Action responsibilities | `schemas/kfd-7/action-contract.schema.json` required role closure | Structural plus product and semantic review |
| `I3-I8` conditional independence | Gate and Activation | Counterfactual product fixtures | Retained in the Buildchain and Kungfu Domain Profile cuts |
| `I13-I14` conservative session limit | Conservative session limit | theorem reference, Domain Profile refinement, session round-trip, and complexity-breakpoint evidence | Retained in both qualified Domain Profiles |
| `I15` context insufficiency | Context insufficiency corollary | same-payload, different-valid-action-set counterexamples | Retained in both qualified Domain Profiles |
| `I16` semantic independence under physical co-location | Action Geometry and Domain Profile closure | responsibility mappings, traceability, counterfactual and fail-visible negative evidence | Mixed; never inferred from component count |
| `I9-I10` path composition and admission | Action closure | Domain Profile Episode/Fact mappings | Mixed |
| transition and denial declaration | Domain Profile adoption contract | `transitions[]` | Independent schema verification |
| evidence and non-claim closure | Activation | `evidenceObligations[]`, `nonClaims[]`, `activation` | Independent schema and product verification |
| Decision/formal/package identity | Verification | `registry.json`, `standards.json`, `scripts/check.mjs` | Machine |
| KFD-7 activation | Activation | qualified Domain Profile, exact evidence cut, independent review, product witnesses | Activated at `evidence/kfd-7/activation-record.json` |

## Confidence and non-claims

The state/path distinction has high confidence as a model of admitted facts and
causal experience. The minimality and cross-domain transfer of Atlas, Pursuit,
and Warrant have high first-party engineering confidence across the two
qualified Domain Profiles. Universal minimality and future Domain Profile
fitness remain open rather than inherited from activation.

KFD-7 does not claim literal physical spacetime, three Euclidean dimensions, a
global clock, a total causal order, one storage engine, one serialization, one
mandatory interface sequence, or a complete ontology of action.
