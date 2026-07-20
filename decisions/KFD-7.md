# KFD-7: Real-world action must keep state, occurrence, and action coordinates distinct

- Status: active
- Number: 7
- Kind: principle
- Applies to: any adopting product, repository, agent workflow, or participant-facing interface that represents consequential real-world action

## One sentence

Real-world action must preserve admitted state and realized occurrence while
keeping direction, perspective, and authority independently addressable.

Action begins from fact-bound direction, perspective, and authority, encounters
reality, and returns as independently replayable causal experience.

## Status and gate

KFD-7 is an active numbered decision promoted from the
[cross-domain action candidate](../drafts/action-state-separation.md).
Its activation binds the exact cross-product evidence cut in
[`evidence/kfd-7/activation-record.json`](../evidence/kfd-7/activation-record.json)
and the independent KFD-level review recorded there.

The current model has enough theoretical closure to become an active standard
decision: state and occurrence are not interchangeable, and direction,
perspective, and authority can change safe action independently. The retained
Buildchain and Kungfu Domain Profiles show that this separation transfers
between release transactions and durable agent work while preserving a
low-complexity session projection. Future Domain Profiles still qualify their
own mapping, runtime behavior, product fitness, and residual risks.

## Fact-Episode Ontology

KFD-7 distinguishes two complementary categories in the **Fact-Episode
Ontology**:

```text
Fact      Admitted state at a declared evidence boundary
Episode   Replayable causal record between Fact cuts
```

These are canonical explanatory subtitles, not aliases or additional formal
types. A **Fact Cut** is the independently addressable formal carrier of Fact:
an instance of admitted state at a declared source, authority, evidence, and
time or version boundary. A Fact is therefore not absolute truth, and a Fact
Cut is not a third ontology binding.

Facts define admitted state. Episodes preserve replayable evidence of realized
causal occurrence. Together they form the ontology over which Action
Responsibility Geometry operates. This is an ontology of KFD's contract world,
not a claim to enumerate all of reality.

An Episode preserves action, consequence, cost, failure, retry, authority use,
and causal order rather than only before-and-after state. Equal endpoints do
not imply equal experience. Fact cuts and Episodes remain independently
addressable. An Episode does not silently admit its endpoint as current fact,
and a state transition does not erase the path that produced it.

## Action coordinates

Consequential action requires three independently addressable coordinates:

```text
Atlas     Declared perspective over admitted facts
Pursuit   Continuing direction and progress relation
Warrant   Bounded authority for admissible transitions
```

The names Atlas, Pursuit, and Warrant identify the reference action coordinates
used by this decision. KFD-7 standardizes their coordinate roles and
independence, not their complete object specifications. Separate candidate
decisions may later qualify one of these names as a KFD Primitive. Their
semantics over the Fact-Episode Ontology are:

- perspective states from where, from which accepted facts, and at which cut
  action is judged;
- direction states which continuing change and consequences matter;
- authority states which transition may be performed, by whom, and under which
  constraints.

None may be silently derived from another. Intention does not grant authority.
Available perspective is not complete reality. Permission or planning does not
prove an Episode occurred. An Episode does not prove progress, completion, or
authorization.

## Action Responsibility Geometry and Domain Profiles

KFD-7 calls the cross-domain responsibility structure the **Action Responsibility Geometry**,
the cross-domain responsibility model for real-world action:

```text
Fact-Episode Ontology
  -> independently addressable direction, perspective, and authority
  -> cross-component invariants and conservative session projection
```

The subtitle "cross-domain responsibility model" explains Action Responsibility Geometry in
plain language; it does not name another layer or interface. Action Responsibility Geometry
defines three coordinates and their constraints over the Fact-Episode
Ontology. It does not define one business domain's fields, workflow labels,
success policy, presentation, or storage layout. Atlas, Pursuit, and Warrant
are reference action coordinates in this geometry. Fact and Episode are its
ontology bindings. None is itself a Profile.

A **Domain Profile** is a versioned adopter declaration that explains how one
domain inhabits the Action Responsibility Geometry. It maps domain objects and fields to the
two ontology bindings and three action-coordinate mappings, and owns domain
lifecycle vocabulary, validation, defaults, success policy, presentation, and
qualification evidence. A Domain Profile may refine or progressively disclose
the geometry, but it must not semantically fuse the mappings, redefine their
meaning, or establish a second Fact or Episode authority.

This distinction is normative terminology, not a requirement for separate
physical stores, records, APIs, processes, or user-facing configuration steps:

```text
Action Responsibility Geometry  defines the cross-domain coordinates
Domain Profile   defines how a domain inhabits them
```

Several semantic components may share one physical record or interface. They
remain independently addressable when their source, cut or version, applicable
authority, and derivation remain inspectable; when one can change, expire,
revoke, or become stale without silently changing another; and when prohibited
cross-component inferences fail visibly. "Must not fuse" refers to this semantic
distinguishability and traceability, not to a required count of data
structures, endpoints, screens, or services.

### Terminology authority

New decisions, adoption guides, and product documentation use one canonical
language:

| Term | Status and meaning |
| --- | --- |
| **Fact** | Canonical ontology binding for admitted state; its independently addressable formal carrier is a Fact Cut. |
| **Episode** | Canonical ontology binding for a replayable causal record between Fact cuts. |
| **Atlas** | Canonical perspective coordinate over admitted facts. |
| **Pursuit** | Canonical direction coordinate and progress relation. |
| **Warrant** | Canonical bounded-authority coordinate for admissible transitions. |
| **Fact-Episode Ontology** | Canonical contract-world distinction between admitted state and replayable causal occurrence. |
| **Action Responsibility Geometry** | Canonical cross-domain responsibility model for real-world action. |
| **Domain Profile** | Canonical versioned declaration of how one domain inhabits Action Responsibility Geometry. |
| **Domain Profile Declaration** | Canonical machine artifact that maps one adopter to the geometry. |

The machine declaration is
`schemas/kfd-7/domain-profile.schema.json`, with contract
`kfd-7-domain-profile` and schema version 1. It expresses the current structure
directly:

```text
ontologyBindings[]    Fact + Episode
actionCoordinates[]   Atlas + Pursuit + Warrant
```

The repository-wide [terminology contract](../docs/terminology.md) is the
authority for canonical
names, qualified first use, and prohibited ambiguous names.

## Action closure

The normative closure is:

```text
declared Fact cut
  -> independently addressable direction, perspective, and authority
  -> bounded action encounters reality
  -> independently replayable causal record
  -> claims, review, correction, and explicit admission
  -> successor Fact cut
```

The order is semantic, not a mandatory interface sequence. Low-consequence
work may use inspectable defaults and progressive disclosure. Simplification
may reduce ceremony but must not fuse responsibility or fabricate a missing
role from another one.

## Conservative session limit

KFD-7 is a conservative extension of ordinary agent sessions. When work has
one local direction, one adequate bounded context, one stable authority grant,
one contiguous execution, and sparse Fact change, an implementation must be
able to project:

```text
Pursuit  -> goal
Atlas    -> context
Warrant  -> tool permissions
Episode  -> session, run, or transcript
Fact     -> input state and result
```

The participant need not manage five explicit objects in this limit. The
session-compatible surface is conforming when it preserves the relevant
direction, perspective boundary, effective authority, realized occurrence,
and admitted result, and keeps its defaults inspectable.

The formal reference defines this as a conditional round-trip theorem:
expanding a session-compressible session into two ontology bindings and three
action-coordinate mappings, then projecting it back, must preserve five decision
observations. A product does not re-prove the abstract theorem; it proves that
its concrete expansion, projection, and compressibility boundary refine it.

This compression is conditional. The independent responsibilities must become
addressable when work crosses directions, perspectives or freshness cuts,
authority states, causal Episodes, or material Fact branches. A session
therefore remains a valid local interaction and runtime object; it is not the
sole model of consequential real-world work.

Context is likewise not sufficient by itself. The same visible context can
support different valid action sets when the Pursuit, Warrant, or Atlas cut and
freshness differ. One physical session record may still conform, but only when
it preserves those responsibilities rather than treating context as their
substitute.

## Gate

KFD-7 applies when an action has durable, cross-participant, cross-tool,
authority-bearing, safety-relevant, or materially costly consequences. A
purely local reversible operation may rely on defaults when the defaults and
their consequence boundary remain inspectable.

A conforming claim:

- binds action to a declared fact cut and perspective;
- preserves continuing direction independently of one execution;
- identifies applicable authority and its constraints;
- records realized occurrence independently of planned or expected state;
- preserves causal boundaries and composition across successor cuts;
- keeps missing, defaulted, derived, expired, revoked, or degraded
  coordinates and bindings visible;
- does not infer completion, success, permission, or reality completeness from
  the wrong object.

## Domain Profile adoption contract

KFD publishes `schemas/kfd-7/domain-profile.schema.json` as the version 1
Domain Profile Declaration against the Action Responsibility Geometry. It does not prescribe
a universal product object model. It gives products and release systems one
machine-readable place to declare:

- the Fact and Episode ontology bindings;
- the Pursuit, Atlas, and Warrant action-coordinate mappings;
- Domain Profile-owned lifecycle vocabulary and implementation coordinates;
- supported transitions with preconditions, effects, receipts, evidence,
  denial reasons, and residual risks;
- prohibited cross-component inferences and retained evidence obligations;
- extension ownership, non-claims, qualification state, and activation verdict;
- the standard session round-trip and context-insufficiency references, plus
  the evidence categories used to qualify a concrete implementation.

All five mapping declarations remain required even when a product uses one
physical record or a low-complexity session projection. The declaration
explains the binding, mapping, or inspectable default; it does not require five
stores, objects, types, APIs, forms, commands, or interface components. Structural
verification checks declaration closure, exact mappings, prohibited
inferences, and evidence references. Product qualification checks semantic
distinguishability through traceability, counterfactual variation, invalidation
or revocation, and fail-visible negative evidence. Neither gate may infer
conformance or failure from physical component count. Schema conformance alone
does not prove component necessity, runtime behavior, product fitness, or
activation.

## Activation

KFD-7 activation is grounded in retained product evidence that:

- demonstrates counterfactual independence by holding two action coordinates
  fixed while varying the third;
- transfers the model across non-isomorphic work domains;
- distinguishes equal-endpoint but causally different Episodes;
- represents concurrency, compensation, failure, and retry without hidden
  reconstruction;
- demonstrates a low-complexity session round trip without semantic loss or
  manual object ceremony;
- shows that complexity breakpoints expose the required independent roles;
- proves that the implementation refines the standard round-trip theorem and
  retains same-payload counterexamples where valid action differs;
- compares task, goal, workflow, session, approval, capability, and fused
  alternatives;
- demonstrates lower total lifecycle cost or materially safer action.

The `activate` verdict binds two qualified Domain Profiles, exact
implementation and availability cuts, independent product and KFD-level
reviews, retained runtime witnesses, and no planned or failed evidence
obligation. Missing evidence remains visible; it is never projected as pass.

Failure is evidence for revision, simplification, or rejection of the proposed
Domain Profiles. It is not permission to infer one responsibility from
another.

## Relation to KFD-1 through KFD-6

KFD-1 keeps Fact cuts and Episodes from drifting. KFD-2 makes claims about
them assessable. KFD-3 lets participants exchange trusted value without hidden
pressure. KFD-4 supplies declared reference frames and inspectable
transformations. KFD-5 separates the genesis of KFD Primitive Candidates from their
qualification. KFD-6 asks whether causal experience can sustain autonomous
discovery. KFD-7 turns those foundations back toward action:

```text
non-drifting facts
  -> bounded trust
  -> transparent cooperation
  -> declared perspective
  -> qualified Primitives
  -> grounded discovery
  -> fact-bound real-world action
```

## Verification

The non-normative reference semantics are published in
`docs/KFD-7-formal.md`. The Domain Profile Declaration is published at
`schemas/kfd-7/domain-profile.schema.json` and is implemented independently by
the native and WebAssembly verifier projections. Current package verification
proves document, metadata, route, digest, declaration, and negative-fixture
closure. The activation evidence additionally binds product-owned runtime and
release qualification without claiming universal minimality.

## Adopters

Adopters cite KFD-7 when they expose the Action Responsibility Geometry through a Domain
Profile. They own the evidence for coordinate independence, fact-cut admission,
causal fidelity, authority correctness, progressive disclosure, and domain
transfer.
