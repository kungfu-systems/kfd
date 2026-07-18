# KFD-7 Formal Reference

[Authoritative decision](../decisions/KFD-7.md) ·
[Formal model](formal-model.md) ·
[Usage](KFD-7-usage.md) ·
[Documentation map](MAP.md)

- Status: experimental
- Normative: no
- Formal model version: 1
- Authority: `decisions/KFD-7.md`
- Decision status: draft

## Imported vocabulary

`FactCut`, `CausalRecord`, `Episode`, `Atlas`, `Pursuit`, `Warrant`,
`ActionSpace`, `ObservationProjection`, `TargetRelation`,
`AdmissibleTransition`, `RealizedPath`.

## Domain objects

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

The object-and-path interpretation is:

```text
Fact cuts  -> object-like admitted states
Episodes   -> morphism-like realized causal transitions
compose(E1, E2) only when After(E1) = Before(E2)
```

This is a responsibility model, not a claim that every domain is literally a
mathematical category.

## Action geometry

The three action responsibilities constrain different structures over `F`:

```text
Atlas:    pi_A: F -> O_A
Pursuit:  target set G_P within F, or ordering/value V_P over reachable states
Warrant:  admissible transition set C_W(f) from fact cut f
Episode:  realized causal path gamma_E through F
```

`pi_A` is the observation projection: it determines which facts and relations
are visible from an addressable perspective. `G_P` or `V_P` supplies
direction: which consequences count as progress. `C_W(f)` is the permission
cone: which next transitions are authorized. `gamma_E` preserves what actually
happened.

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
I13 SessionCompressible(h) -> RoundTrip(Sigma(h)) preserves the bounded
    decision semantics of h
I14 not SessionCompressible(h) -> the independently relevant roles become
    addressable
```

## Conservative session projection

Let a bounded history `h` be session-compressible when:

```text
SessionCompressible(h) =
  OneLocalPursuit(h)
  and OneAdequateAtlas(h)
  and OneStableWarrant(h)
  and OneContiguousEpisode(h)
  and SparseFactChange(h)
```

Define a session projection:

```text
Sigma(h) = (
  goal        := Pursuit(h),
  context     := Atlas(h),
  permissions := Warrant(h),
  run         := Episode(h),
  input       := Before(Episode(h)),
  result      := After(Episode(h))
)
```

For the decisions inside the declared bounded history, expansion followed by
projection must be conservative:

```text
SessionCompressible(h)
  -> Equivalent_D(Sigma(Expand(Sigma(h))), Sigma(h))
```

`Equivalent_D` means that the goal, context boundary, effective permissions,
realized execution, and result needed for those decisions are preserved. It
does not mean the underlying responsibilities become identical.

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
  bounded decision semantics or requiring manual object management.
- Expose the independently relevant roles when a session-compressibility
  assumption fails.
- Test counterfactual independence and fused alternatives.
- Demonstrate cross-domain transfer and progressive disclosure before
  activation.

## Profile declaration and evidence closure

The draft machine contract records a Profile declaration rather than one
physical state machine:

```text
Profile = (
  implementation coordinate,
  qualification status,
  five responsibility declarations,
  Profile-owned lifecycle vocabulary,
  transitions,
  prohibited inferences,
  evidence obligations,
  non-claims and extensions,
  activation verdict
)
```

Each transition declaration binds:

```text
subject role + prior Profile state + operation + preconditions
  -> effect + receipt + evidence + denial reasons + residual risks
```

For Profile claim `C` at evidence cut `K`:

```text
Qualified(C, K) :=
  schema conformance
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
qualified Profile, an exact evidence cut, independent review, retained product
witnesses, and no planned or failed obligation. Qualification remains relative
to that Profile and cut; it does not establish universal minimality.

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
| Fact-cut and causal-record separation | Substrate boundary | KFD-1 formal reference and KFD-7 Profile role declarations | Structural plus product evidence |
| Atlas/Pursuit/Warrant separation | Action responsibilities | `schemas/kfd-7/action-contract.schema.json` required role closure | Structural plus product and semantic review |
| `I3-I8` conditional independence | Gate and Activation | Counterfactual product fixtures | Not yet implemented |
| `I13-I14` conservative session limit | Conservative session limit | Session round-trip and complexity-breakpoint fixtures | Not yet implemented |
| `I9-I10` path composition and admission | Action closure | Domain Episode/Fact profiles | Mixed |
| transition and denial declaration | Reference Profile contract | `transitions[]` | Independent schema verification |
| evidence and non-claim closure | Activation | `evidenceObligations[]`, `nonClaims[]`, `activation` | Independent schema verification; runtime proof remains external |
| Decision/formal/package identity | Verification | `registry.json`, `standards.json`, `scripts/check.mjs` | Machine |
| KFD-7 activation | Activation | qualified Profile, exact evidence cut, independent review, product witnesses | Not yet proved |

## Confidence and non-claims

The state/path distinction has high confidence as a model of admitted facts and
causal experience. The minimality and cross-domain transfer of Atlas, Pursuit,
and Warrant have medium-high architectural confidence and remain subject to
the activation gate.

KFD-7 does not claim literal physical spacetime, three Euclidean dimensions, a
global clock, a total causal order, one storage engine, one serialization, one
mandatory interface sequence, or a complete ontology of action.
