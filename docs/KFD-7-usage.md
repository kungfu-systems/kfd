# KFD-7 Implementation Notes

[Authoritative decision](../decisions/KFD-7.md) ·
[Formal reference](KFD-7-formal.md) ·
[Documentation map](MAP.md)

KFD-7 defines an active cross-domain action model that keeps direction,
perspective, authority, and occurrence independently addressable. The
authoritative text is `decisions/KFD-7.md`; its registry status is `active`.

## Package surface

- `decisions/KFD-7.md`: the authoritative active decision.
- `docs/KFD-7-activation.md`: the retained cross-product qualification cut,
  review boundary, and non-claims.
- `evidence/kfd-7/activation-record.json`: the machine activation verdict and
  commit-addressed product witnesses.
- `docs/KFD-7-formal.md`: the non-normative Fact/Episode and action-geometry
  reference.
- `drafts/action-state-separation.md`: preserved source-candidate lineage.
- `drafts/atlas-action-perspective.md`: non-binding Atlas elaboration
  candidate.
- `drafts/pursuit-intent-continuity.md`: non-binding Pursuit elaboration
  candidate.
- `drafts/warrant-bounded-authority.md`: non-binding Warrant elaboration
  candidate.
- `standards.json#/standards/kfd-7`: identity, status, formal reference,
  concepts, and digests.
- `schemas/kfd-7/action-contract.schema.json`: retained version 2
  `actionContract` compatibility interface for a draft Domain Profile
  declaration against the Action Geometry.
- `verifier/fixtures/kfd-7/`: conforming draft and fail-visible negative
  declarations.
- `scripts/check.mjs`: registry, document, metadata, route, and evidence
  closure.

The `action-contract` path and `actionContract` metadata key are published
compatibility identities, not the preferred human name for either semantic
layer. The schema fixes only the Domain Profile declaration and activation
boundary. It does not choose a product store, API, CLI, GUI, Git coordinate,
database key, or universal lifecycle vocabulary. Product dogfood still decides
whether any concrete Domain Profile deserves stable activation.

## Action Geometry and Domain Profiles

**Action Geometry** is the cross-domain responsibility model for real-world
action: Fact cuts, causal records, five independently addressable
responsibilities, cross-role invariants, and the conservative session
projection. "Cross-domain responsibility model" is its explanatory subtitle,
not a second formal term. Atlas, Pursuit, Warrant, Fact, and Episode are
responsibilities or reference action Primitives in this geometry; they are not
Profiles.

A Domain Profile declares its product and implementation coordinate,
qualification state, five responsibility mappings, domain field schemas and
lifecycle terms, supported transitions, prohibited inferences, evidence
obligations, non-claims, extensions, and activation verdict. The complete
draft example is `verifier/fixtures/kfd-7/valid-action-contract.json`.

Products may map several responsibilities to one physical record, type, API,
service, or familiar session surface. They still declare all five mappings so
an independent reader can see which default, projection, source authority,
cut, and version carries each decision. This requirement preserves semantic
distinguishability and traceability without requiring five user-facing or
physical objects.

The canonical terms are:

| Use | Term |
| --- | --- |
| Cross-domain model | **Action Geometry** |
| Adopter specialization | **Domain Profile** |
| Geometry machine artifact | **Action Geometry Contract** |
| Adopter machine artifact | **Domain Profile Declaration** |

`Action Profile`, unqualified `Action Contract`,
`schemas/kfd-7/action-contract.schema.json`, `kfd-7-action-contract`, and
`actionContract` are retained only where published compatibility coordinates
must remain exact. New prose and successor interfaces use the canonical terms.
Existing readers remain supported; no removal version is declared.

Each supported transition declares its subject role, operation, Domain Profile
state terms, preconditions, effect, receipt, evidence, denial reasons, and
residual risk. Unknown mappings and transitions fail closed. Domain Profile
state strings do not become universal KFD enums merely because one adopter
uses them.

The evidence statuses are `planned`, `passed`, `failed`, and
`not-applicable`. `passed` binds retained artifacts; `not-applicable` requires
a bounded reason. Activation requires a qualified Domain Profile, no planned
or failed obligations, an exact evidence cut, independent review, and retained
product witnesses.

## Adoption profile

An adopter should expose:

1. the Fact cut and declared perspective used for judgment;
2. the continuing direction or intended consequence;
3. the applicable authority boundary and derivation;
4. the causal record of what actually happened;
5. explicit admission of successor facts;
6. distinctions among occurrence, progress, success, completion, and
   settlement;
7. degraded, defaulted, expired, revoked, or missing responsibility.

The concrete store, API, CLI, GUI, and vocabulary remain product-owned through
the Domain Profile. Implementations may use Atlas, Pursuit, Warrant, and
Episode directly or map domain-native objects to the same responsibilities.

## Progressive disclosure

KFD-7 does not require every user to fill out four forms before ordinary work.
For a simple task with one goal, one adequate context, one stable permission
grant, one execution, and little state change, the expected interface is the
familiar session:

```text
goal              <- Pursuit
context           <- Atlas
tool permissions  <- Warrant
run or transcript <- Episode
input and result  <- Fact cuts
```

The product should construct and retain the underlying responsibilities
without requiring the participant to manage them separately. It may infer
low-risk defaults or collapse interface steps when:

- the default derivation remains inspectable;
- consequence and authority boundaries are bounded;
- escalation reveals the independent roles;
- later audit can recover which role supplied each decision;
- simplification does not synthesize permission, occurrence, or completion.

The interface expands only at a complexity breakpoint: several goals,
perspective or freshness changes, delegated or revoked authority, several
Episodes, or material Fact branching. This preserves the low-cost session
experience while making complex work representable without hidden state.

An adopter should test both directions: simple work round-trips through the
action model without semantic loss or object ceremony, and complex work
reveals the role whose independence has become decision-relevant.

## Qualification by theorem reuse

KFD-7 publishes one conditional theorem for all adopters:

```text
Project(Expand(session)) equivalent_D session
```

The equivalence is fixed to five observations: direction, perspective
boundary, effective authority, causal process, and admitted result. An adopter
does not need to rediscover or restate that generic claim. Its qualification
record instead:

1. cites the standard theorem and context-insufficiency corollary;
2. identifies its concrete `Expand`, `Project`, and
   `SessionCompressible` implementations;
3. supplies refinement evidence for all five observations;
4. supplies negative fixtures at declared complexity breakpoints;
5. supplies same-payload fixtures whose valid action sets differ because
   Pursuit, Warrant, or Atlas cut and freshness differ.

This turns repeated open-ended model review into a bounded refinement check.
It does not remove product testing: runtime correctness, interface usability,
cross-domain transfer, and residual risk remain evidence at the adopting
Domain Profile's exact qualification cut.

## Independent verification

The native and WebAssembly verifier projections package the same schema:

```bash
npx @kungfu-tech/kfd verify kfd-record \
  verifier/fixtures/kfd-7/valid-action-contract.json
```

The verifier rejects missing responsibility mappings, missing standard theorem
references, unknown closed-vocabulary values, incomplete transitions, missing
round-trip/context evidence categories, and premature activation. It remains
offline, non-qualifying, and non-self-certified. It checks semantic mapping
closure and retained evidence references; it does not count physical records,
classes, tables, APIs, processes, or interface components. Passing proves only
record structure. Counterfactual distinguishability, independent
invalidation, runtime behavior, and qualification evidence remain product and
release responsibilities.

## Activation evidence boundary

The package proves that KFD-7 is numbered, active, routed, digest-bound,
formally described, machine-declarable, and backed by two independently
reviewed Domain Profiles at exact availability cuts. The activation record
does not prove universal minimality, require one physical product shape, or
qualify a future adopter's implementation.
