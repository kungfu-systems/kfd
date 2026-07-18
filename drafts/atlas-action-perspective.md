---
status: draft
period: 2026-07-18
theme: atlas-action-perspective
doc_type: kfd-candidate
source_level: maintainer-consensus
confidence: medium
sensitivity: public
evidence_grade: C
review_state: self-reviewed
last_reviewed: 2026-07-18
---

# KFD Candidate: Atlas Action Perspective

- Candidate status: incubating
- Kind candidate: principle
- Current slot hint: 8
- Slot binding: non-binding

[Formal candidate](formal/atlas-action-perspective.md)

## One sentence

Every consequential action must bind to an addressable perspective and fact
cut.

## Candidate rule

An Atlas is the cross-domain action Primitive that makes a situated view of
reality independently addressable. It binds:

- the participant or observer position;
- the fact sources and authority accepted for the view;
- the cut at which those facts are interpreted;
- the projection and relevance boundary;
- known omission, degradation, and unresolved conflict.

An Atlas does not claim an absolute view from nowhere. It makes the view used
for judgment inspectable, transferable, comparable, and replaceable without
silently claiming completeness.

KFD-4 establishes that views remain bound to declared perspectives and that
perspective transformations remain inspectable. This candidate asks whether
that rule requires a first-class action object that can carry perspective and
fact-cut identity into real work.

## Relation to the action system

Within the
[cross-domain action Primitive candidate](action-state-separation.md), Atlas
answers:

```text
From where, from which accepted facts, and at what cut is this action judged?
```

Atlas does not supply direction or permission. One Pursuit may use several
Atlases. One Atlas may inform several Pursuits. A Warrant may bind to an exact
Atlas or require a successor cut, but neither object becomes the other.

## Generative role

Atlas becomes visible when a participant changes position and discovers that
the natural objects, burdens, or action boundaries also change. It turns the
KFD-4 perspective operation into a reusable object for later action and
Primitive discovery.

The candidate should be tested against context windows, retrieval results,
database snapshots, reports, world models, and informal shared understanding.
It is load-bearing only if Atlas preserves decisions those alternatives
repeatedly force participants to reconstruct.

The non-normative formal candidate defines an Atlas version, observation
projection, decision equivalence, transitions, session projection, and proof
obligations without fixing product storage or lifecycle vocabulary.

## Invalid compressions

The candidate rejects systems that infer:

- complete reality from available context;
- source authority from relevance or retrieval rank;
- shared perspective from shared files or vocabulary;
- current validity from an old but internally consistent view;
- permission or intent from the facts visible in an Atlas;
- one universal timeline from several situated views.

## Qualification gate

Promotion requires:

1. deletion witnesses where removing perspective or cut identity changes a
   consequential judgment;
2. cross-domain evidence that participants need to carry and compare situated
   fact views;
3. comparison with context, snapshot, report, query, retrieval, and world-model
   alternatives;
4. perspective transformation and replay evidence with declared loss;
5. counterexamples where a separate Atlas adds no value;
6. a dual-first product witness in which humans and agents resolve the same
   Atlas authority and degradation state;
7. independent review of whether Atlas belongs at organization level.

## Falsifiers

The candidate weakens or fails if:

- perspective and cut identity are consistently irrelevant to safe action;
- existing context or snapshot objects preserve equivalent decisions at lower
  total cost;
- Atlas cannot be transferred or compared without hidden reconstruction;
- its boundary cannot remain distinct from Pursuit or Warrant;
- cross-domain evidence does not survive outside software repositories;
- product evidence depends on one implementation rather than the proposed
  semantic responsibility.

## Numbering boundary

The slot hint `8` is non-binding. This document is not `KFD-8`, does not
reserve that number, and may be revised, reordered, merged, withdrawn, or
rejected.

Only explicit promotion into `decisions/KFD-N.md` and numbered `registry.json`
allocates a KFD number.
