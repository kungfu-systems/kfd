---
status: draft
period: 2026-07-18
theme: pursuit-intent-continuity
doc_type: kfd-candidate
source_level: maintainer-consensus
confidence: medium
sensitivity: public
evidence_grade: C
review_state: self-reviewed
last_reviewed: 2026-07-18
---

# KFD Candidate: Pursuit Intent Continuity

- Candidate status: incubating
- Kind candidate: principle
- Current slot hint: 9
- Slot binding: non-binding

[Formal candidate](formal/pursuit-intent-continuity.md)

## One sentence

Intent that survives an action must have an identity independent of the action
that advances it.

## Candidate rule

A Pursuit is the cross-domain action coordinate that preserves the continuity of
an intended real-world change across Episodes, participants, tools, plans, and
revisions.

It makes independently addressable:

- the continuing direction or intended change;
- the conditions under which consequence would count as progress or success;
- decomposition, dependency, contribution, and successor relations;
- revision, pause, settlement, abandonment, and unresolved state;
- the distinction between technical execution and real-world completion.

A Pursuit is not a command, session, provider goal, mutable task body, plan, or
Episode. Those objects may advance or project it without defining its durable
identity.

## Relation to the action system

Within the
[cross-domain action coordinate candidate](action-state-separation.md), Pursuit
answers:

```text
What intended change continues across this action, and what consequence would
matter to it?
```

Pursuit does not grant authority and does not define the perspective from which
progress is judged. It may reference Atlases, Warrants, and Episodes without
inheriting their semantics.

## Generative role

Pursuit becomes visible when the observer moves from an executing tool or task
to the participant who must sustain a real change across many actions. At that
position, sessions and tasks appear as temporary projections while continuity,
revision, and settlement remain.

The candidate should be tested against goals, tasks, projects, cases,
workflows, missions, plans, and provider-specific long-running job objects.

The non-normative formal candidate defines Pursuit versions, prospective
direction, consequence review, typed relation graphs, transitions, session
projection, and proof obligations without fixing one product workflow.

## Invalid compressions

The candidate rejects systems that infer:

- durable intent identity from a session or mutable task record;
- success from command exit, Episode sealing, or artifact production;
- parent completion from child completion;
- child authority from Pursuit decomposition;
- stable success criteria from the latest prose alone;
- continuity from accidental identifier reuse.

## Qualification gate

Promotion requires:

1. histories where one intent survives several non-isomorphic actions,
   participants, tools, or revisions;
2. deletion witnesses where removing Pursuit identity changes continuation,
   settlement, or audit;
3. comparison with goal, task, project, workflow, case, mission, and session
   alternatives;
4. cross-domain decomposition and successor evidence;
5. negative evidence separating occurrence, technical success, progress,
   completion, and settlement;
6. a product witness that lowers continuity reconstruction without forcing
   unnecessary ceremony;
7. independent review of whether Pursuit belongs at standard level.

## Falsifiers

The candidate weakens or fails if:

- ordinary existing goal or case identity preserves equivalent continuity at
  lower total cost;
- intent does not survive action boundaries often enough to require a separate
  object;
- Pursuit cannot remain distinct from Atlas, Warrant, or Episode;
- decomposition and settlement rules fail to transfer across domains;
- product evidence measures workflow preference rather than preserved
  real-world continuity.

## Numbering boundary

The slot hint `9` is non-binding. This document is not `KFD-9`, does not
reserve that number, and may be revised, reordered, merged, withdrawn, or
rejected.

Only explicit promotion into `decisions/KFD-N.md` and numbered `registry.json`
allocates a KFD number.
