---
status: active
period: 2026-07-21
theme: software-work-layered-ontology
doc_type: live-case-analysis
source_level: maintainer-consensus
confidence: high
sensitivity: public
evidence_grade: B
review_state: self-reviewed
last_reviewed: 2026-07-21
---

# Layered Ontology: Coordinates, Work, and Settlement

The discovery did not add Initiative, Assignment, and Project Cut as peers of
Fact, Episode, Pursuit, Atlas, or Warrant. It exposed two higher layers.

## Layer one: contract-world substrate

```text
Fact     admitted state at a declared Cut
Episode  realized causal occurrence with replayable evidence
```

These answer what state has been admitted and what actually happened.

## Layer two: action responsibility

```text
Pursuit  continuing direction
Atlas    declared perspective and fact basis
Warrant  bounded authority
```

These coordinates remain independently addressable. They answer what change is
being pursued, on which view, and under which authority.

## Layer three: software-work organization

```text
Initiative  continuing coordinated work context
Assignment  bounded participant responsibility
```

Initiative and Assignment compose lower coordinates without absorbing them.
One Initiative may coordinate several Pursuits and Assignments. One Assignment
binds an actor and objective to exact Atlas and Warrant roots and may produce
several Episodes, claims, assessments, and continuation decisions.

The lower coordinates cannot derive whether a participant accepted an
Assignment or which set of directions and responsibilities belong to one
continuing Initiative unless an equivalent higher relation is preserved.

## Layer four: software-project settlement

```text
Project Cut  official, verifiable macro commitment at one project boundary
```

Project Cut binds selected source, Atlas, Episode, policy, omission, risk, and
predecessor roots. It does not become their authority. Its independent
responsibility is selection and settlement: which exact combination was
admitted together as the project's successor state.

This resolves an apparent conflict in the founding Kungfu ADR, which says
Project Cut must not become a fourth primitive. At the Fact-Episode and Action
Responsibility layers, that remains correct: Project Cut is not a fourth fact
engine, action coordinate, or universal project identity. At the software
settlement layer, it is an independently addressable Primitive because deleting
its binding changes what a successor may treat as officially settled.

## Invalid flattening

The layered model rejects:

- Initiative is only a larger Pursuit;
- Assignment is only a task, Warrant, or Episode;
- maintaining current Initiative/Assignment state proves project settlement;
- Project Cut is the latest Git commit, Fact Cut, database row, or context
  snapshot;
- Project Cut may reinterpret or absorb source, Atlas, Episode, or policy
  authority;
- acceptance in this software profile makes the same vocabulary mandatory in
  another domain.

## Conservative reduction

Simple work may project the structure into one familiar session:

```text
one Initiative
  + one accepted Assignment
  + one current Atlas and Warrant
  + one Episode
  + one result Fact Cut
  + one implicit local settlement view
```

The product need not expose six forms. Compression is valid when later
inspection can recover the distinctions whose variation would change a
decision. Complexity is revealed only when work crosses participants,
directions, authority states, Episodes, or settlement boundaries.
