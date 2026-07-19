# KFD-7: Real-world action must keep its responsibilities distinct

- Status: active
- Number: 7
- Kind: principle
- Applies to: any adopting product, repository, agent workflow, or participant-facing interface that represents consequential real-world action

## One sentence

Real-world action must keep direction, perspective, authority, and occurrence
independently addressable.

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
Buildchain and Kungfu Profiles show that this separation transfers between
release transactions and durable agent work while preserving a low-complexity
session projection. Future Profiles still qualify their own mapping, runtime
behavior, product fitness, and residual risks.

## Substrate boundary

KFD-7 distinguishes two complementary operational substrates:

```text
Fact cut       what holds at a declared authority and evidence boundary
Causal record  what occurred between declared boundaries
```

A causal record may be carried by an Episode. It preserves action,
consequence, cost, failure, retry, authority use, and causal order rather than
only before-and-after state. Equal endpoints do not imply equal experience.

Fact cuts and causal records remain independently addressable. A causal record
does not silently admit its endpoint as current fact, and a state transition
does not erase the path that produced it.

## Action responsibilities

Consequential action requires three independently addressable responsibilities:

```text
direction             Pursuit
perspective and cut   Atlas
authority boundary    Warrant
realized occurrence   Episode or another bounded causal record
```

The names Atlas, Pursuit, Warrant, and Episode identify the first
kungfu-systems action profiles. The principle is the separation of semantic
responsibility:

- direction states which continuing change and consequences matter;
- perspective states from where, from which accepted facts, and at which cut
  action is judged;
- authority states which transition may be performed, by whom, and under which
  constraints;
- occurrence preserves what actually happened.

None may be silently derived from another. Intention does not grant authority.
Available perspective is not complete reality. Permission or planning does not
prove occurrence. Occurrence does not prove progress, completion, or
authorization.

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
expanding a session-compressible session into the five responsibilities and
projecting it back must preserve those five decision observations. A product
does not re-prove the abstract theorem; it proves that its concrete expansion,
projection, and compressibility boundary refine it.

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

## Reference Profile contract

KFD publishes `schemas/kfd-7/action-contract.schema.json` as a version 2 draft
Profile declaration. It does not prescribe a universal product object model.
It gives products and release systems one machine-readable place to declare:

- the Fact, Episode, Pursuit, Atlas, and Warrant responsibility mappings;
- Profile-owned lifecycle vocabulary and implementation coordinates;
- supported transitions with preconditions, effects, receipts, evidence,
  denial reasons, and residual risks;
- prohibited cross-role inferences and retained evidence obligations;
- extension ownership, non-claims, qualification state, and activation verdict;
- the standard session round-trip and context-insufficiency references, plus
  the evidence categories used to qualify a concrete implementation.

All five responsibility declarations remain required even when a product uses
one physical record or a low-complexity session projection. The declaration
explains the mapping or inspectable default; it does not require five stores,
forms, or commands. Schema conformance proves declaration closure only. It does
not prove role necessity, runtime behavior, product fitness, or activation.

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

The `activate` verdict binds two qualified product Profiles, exact
implementation and availability cuts, independent product and KFD-level
reviews, retained runtime witnesses, and no planned or failed evidence
obligation. Missing evidence remains visible; it is never projected as pass.

Failure is evidence for revision, simplification, or rejection of the proposed
profiles. It is not permission to infer one responsibility from another.

## Relation to KFD-1 through KFD-6

KFD-1 keeps fact cuts and causal records from drifting. KFD-2 makes claims about
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
`docs/KFD-7-formal.md`. The Profile contract is published at
`schemas/kfd-7/action-contract.schema.json` and is implemented independently by
the native and WebAssembly verifier projections. Current package verification
proves document, metadata, route, digest, declaration, and negative-fixture
closure. The activation evidence additionally binds product-owned runtime and
release qualification without claiming universal minimality.

## Adopters

Adopters cite KFD-7 when they expose the action model. They own the evidence
for role independence, fact-cut admission, causal fidelity, authority
correctness, progressive disclosure, and domain transfer.
