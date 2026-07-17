---
status: draft
period: 2026-07-17
theme: independent-action-state
doc_type: kfd-candidate
source_level: maintainer-consensus
confidence: medium
sensitivity: public
evidence_grade: C
review_state: self-reviewed
last_reviewed: 2026-07-17
---

# KFD Candidate: Independent Action State

- Candidate status: incubating
- Kind candidate: principle
- Current slot hint: 7
- Slot binding: non-binding

## One sentence

Real-world work must preserve intent, perspective, authority, and consequence
as independently addressable facts.

## Candidate rule

A system that coordinates consequential work must not silently collapse:

- the intended reality change that persists across actions;
- the declared perspective and fact cut used to judge the situation;
- the authority that permits a bounded continuation;
- the action and consequence that actually occurred.

The current working objects are:

```text
intent continuity    -> Pursuit
perspective and cut  -> Atlas
authority boundary   -> Warrant
causal experience    -> Episode
```

These names and storage boundaries are not part of the candidate rule. An
equivalent implementation may combine physical storage if every dimension
remains independently addressable, revisable, auditable, and incapable of
silently implying another dimension's state.

## Why the candidate exists

The Pursuit and Warrant live case exposed four decisions that can diverge:

```text
what change continues
what view of reality supports judgment
what continuation is permitted
what action and consequence occurred
```

The
[conditional distinguishability argument](../cases/live/proof-carrying-work-object/distinguishability.md)
provides analytic deletion witnesses for those dimensions. It establishes a
conditional information-separation result, not universal necessity.

A Pursuit may decompose into child Pursuits. The primary decomposition can be
rendered as a tree, while typed dependency, successor, and contribution
relations form a wider graph. Parent context may be referenced, but authority
does not automatically flow to descendants and child completion does not
settle the parent.

## Invalid compressions

The candidate rejects systems that infer:

- authorization from an active goal;
- reality completeness from available context;
- occurrence from a plan or authorization;
- success or completion from occurrence;
- descendant authority from a parent Warrant without an explicit derivation;
- durable intent identity from a provider session or mutable task body.

## Qualification gate

Promotion requires:

1. observed histories where deleting each dimension changes a real action or
   audit conclusion;
2. transfer across non-isomorphic work domains;
3. comparison with task, session, case, log, approval, capability, and fused
   alternatives;
4. counterexamples where one or more dimensions are legitimately absent;
5. a product witness that demonstrates lower reconstruction or authority risk
   without imposing greater lifecycle burden;
6. independent review of whether the rule belongs at organization level.

## Falsifiers

The candidate weakens or fails if:

- one dimension is consistently derivable from the others without loss;
- deleting a dimension does not change safe action or audit;
- valid work cannot vary the dimensions independently;
- a rival representation preserves equivalent decisions at lower cost;
- the proposed rule forces irrelevant state into ordinary low-consequence
  interactions;
- product evidence cannot distinguish ontology value from implementation
  preference.

## Numbering boundary

The slot hint `7` records the current ordering hypothesis only. This document
is not `KFD-7`, does not reserve that number, and may later be promoted under a
different number, merged into another candidate, withdrawn, or rejected.

Promotion requires an explicit maintainer decision that creates
`decisions/KFD-N.md`, updates the numbered `registry.json`, and records the
candidate lineage. Until then this document is non-normative.
