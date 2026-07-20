# KFD-7: Real-world action must keep its responsibilities distinct

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
[cross-domain action-Primitive candidate](../drafts/action-state-separation.md).
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
Fact cut  admitted state at a declared authority and evidence boundary
Episode   realized causal occurrence between declared boundaries
```

Facts define admitted state. Episodes preserve realized causal occurrence.
Together they form the ontology over which Action Geometry operates. This is
an ontology of KFD's contract world, not a claim to enumerate all of reality.

An Episode preserves action, consequence, cost, failure, retry, authority use,
and causal order rather than only before-and-after state. Equal endpoints do
not imply equal experience. Fact cuts and Episodes remain independently
addressable. An Episode does not silently admit its endpoint as current fact,
and a state transition does not erase the path that produced it.

## Action responsibilities

Consequential action requires three independently addressable responsibilities:

```text
direction             Pursuit
perspective and cut   Atlas
authority boundary    Warrant
```

The names Pursuit, Atlas, and Warrant identify the reference action Primitives
used by this decision. The principle is the separation of semantic
responsibility over the Fact-Episode Ontology:

- direction states which continuing change and consequences matter;
- perspective states from where, from which accepted facts, and at which cut
  action is judged;
- authority states which transition may be performed, by whom, and under which
  constraints.

None may be silently derived from another. Intention does not grant authority.
Available perspective is not complete reality. Permission or planning does not
prove an Episode occurred. An Episode does not prove progress, completion, or
authorization.

## Action Geometry and Domain Profiles

KFD-7 calls the cross-domain responsibility structure the **Action Geometry**,
the cross-domain responsibility model for real-world action:

```text
Fact-Episode Ontology
  -> independently addressable direction, perspective, and authority
  -> cross-role invariants and conservative session projection
```

The subtitle "cross-domain responsibility model" explains Action Geometry in
plain language; it does not name another layer or interface. Action Geometry
defines three coordinates and their constraints over the Fact-Episode
Ontology. It does not define one business domain's fields, workflow labels,
success policy, presentation, or storage layout. Pursuit, Atlas, and Warrant
are reference action Primitives in this geometry. Fact and Episode are its
ontology bindings. None is itself a Profile.

A **Domain Profile** is a versioned adopter declaration that explains how one
domain inhabits the Action Geometry. It maps domain objects and fields to the
two ontology bindings and three action-Primitive mappings, and owns domain
lifecycle vocabulary, validation, defaults, success policy, presentation, and
qualification evidence. A Domain Profile may refine or progressively disclose
the geometry, but it must not semantically fuse the mappings, redefine their
meaning, or establish a second Fact or Episode authority.

This distinction is normative terminology, not a requirement for separate
physical stores, records, APIs, processes, or user-facing configuration steps:

```text
Action Geometry  defines the cross-domain coordinates
Domain Profile   defines how a domain inhabits them
```

Several responsibilities may share one physical record or interface. They
remain independently addressable when their source, cut or version, applicable
authority, and derivation remain inspectable; when one can change, expire,
revoke, or become stale without silently changing another; and when prohibited
cross-role inferences fail visibly. "Must not fuse" refers to this semantic
distinguishability and traceability, not to a required count of data
structures, endpoints, screens, or services.

### Terminology authority and compatibility

New decisions, adoption guides, and product documentation use one canonical
language:

| Term | Status and meaning |
| --- | --- |
| **Fact-Episode Ontology** | Canonical contract-world distinction between admitted state and realized causal occurrence. |
| **Action Geometry** | Canonical cross-domain responsibility model for real-world action. |
| **Domain Profile** | Canonical versioned declaration of how one domain inhabits Action Geometry. |
| **Action Geometry Contract** | Canonical machine artifact that identifies the geometry and its invariants. |
| **Domain Profile Declaration** | Canonical machine artifact that maps one adopter to the geometry. |
| **Action Profile** | Compatibility-only term for previously published combined Profile metadata; it is not used for new authoring. |
| **Action Contract** | Compatibility-only when it appears in an existing schema path, contract id, or retained product identifier; new prose must use the qualified canonical artifact name. |

The published `schemas/kfd-7/action-contract.schema.json`,
`kfd-7-action-contract`, and `actionContract` metadata key retain their version
2 identity. They currently describe a Domain Profile declaration against
Action Geometry; they do not identify the future Action Geometry Contract.
Their compatibility readers and published coordinates remain valid. A future
canonical schema path or contract id requires a successor interface, explicit
mapping, and differential evidence; it must not reinterpret the version 2
bytes or roots. No removal version is declared. Compatibility names are
deprecated for new authoring now and remain readable until an explicit,
qualified successor policy says otherwise.

### Foundation Revision 6 migration

Before the first stable release, revision 6 corrects an earlier flattening of
Fact, Episode, Pursuit, Atlas, and Warrant into one five-responsibility list.
The current structure is:

```text
Fact + Episode               two ontology bindings
Pursuit + Atlas + Warrant    three action-Primitive mappings
```

This is a breaking decision-surface correction under the pre-stable Foundation
Revision rule. It preserves every published package, document, schema, contract
id, and version 2 field coordinate. Existing `roles[]` readers continue to see
the same five values; new readers interpret `fact` and `episode` as ontology
bindings and `pursuit`, `atlas`, and `warrant` as action-Primitive mappings.
No prior bytes, roots, activation cut, or product evidence are rewritten.

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
action-Primitive mappings, then projecting it back, must preserve five decision
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
  responsibilities visible;
- does not infer completion, success, permission, or reality completeness from
  the wrong object.

## Domain Profile adoption contract

KFD publishes `schemas/kfd-7/action-contract.schema.json` as a version 2 draft
Domain Profile declaration against the Action Geometry. It does not prescribe
a universal product object model. It gives products and release systems one
machine-readable place to declare:

- the Fact and Episode ontology bindings;
- the Pursuit, Atlas, and Warrant action-Primitive mappings;
- Domain Profile-owned lifecycle vocabulary and implementation coordinates;
- supported transitions with preconditions, effects, receipts, evidence,
  denial reasons, and residual risks;
- prohibited cross-role inferences and retained evidence obligations;
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
does not prove role necessity, runtime behavior, product fitness, or
activation.

## Activation

KFD-7 activation is grounded in retained product evidence that:

- demonstrates counterfactual independence by holding two action
  responsibilities fixed while varying the third;
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
transformations. KFD-5 separates the genesis of action Primitives from their
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
`docs/KFD-7-formal.md`. The Domain Profile contract is published at
`schemas/kfd-7/action-contract.schema.json` and is implemented independently by
the native and WebAssembly verifier projections. Current package verification
proves document, metadata, route, digest, declaration, and negative-fixture
closure. The activation evidence additionally binds product-owned runtime and
release qualification without claiming universal minimality.

## Adopters

Adopters cite KFD-7 when they expose the Action Geometry through a Domain
Profile. They own the evidence for role independence, fact-cut admission,
causal fidelity, authority correctness, progressive disclosure, and domain
transfer.
