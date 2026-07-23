---
status: incubating
period: 2026-07-23
theme: federated-work-continuity
doc_type: kfd-candidate
source_level: maintainer-consensus
confidence: medium
sensitivity: public
evidence_grade: C
review_state: unreviewed
last_reviewed: 2026-07-23
---

# KFD Candidate: Federated Work Continuity

- Candidate status: incubating
- Kind candidate: principle
- Slot binding: non-binding
- Number allocated: no

[Formal candidate](formal/federated-work-continuity.md) ·
[Live case](../cases/live/federated-work-continuity/README.md)

## One sentence

Work must remain identifiable independently of the assignments, workspaces,
and cuts through which it advances.

## Candidate rule

From the position of a person responsible for a real outcome, the primary
object is often not one task, repository, session, or execution location. It is
the coherent body of work whose responsibilities may be decomposed across many
participants and fact worlds.

This candidate uses **Work** for that possible higher-layer boundary. A Work
view should make independently inspectable:

- the declared whole being advanced from one stated perspective;
- the typed Initiative and Assignment relations currently included;
- the owning fact world of every authoritative object;
- the component cuts, proof state, unresolved references, and degradation;
- the current action frontier: what may proceed, what awaits judgment, and what
  remains unsettled.

Work does not create a global clock, merge autonomous fact authorities, or
infer completion from child progress. A federated view may bind many component
cuts while preserving that no single atomic global cut exists.

## Why this may be a Primitive

Task systems usually expose the places where work is executed. Repository
views expose source boundaries. Initiative and Assignment views expose
continuing coordination and bounded responsibility. A user coordinating work
across those boundaries still has to reconstruct a different question:

```text
What is the one thing I am advancing, where are its live responsibilities,
what has been accepted, and what can happen next?
```

If removing a Work-level identity or view forces that reconstruction while all
component facts remain valid, Work carries an independent burden. If an
Initiative or an ordinary typed query answers the same question without loss,
no new Primitive is justified.

## Current competing hypotheses

The candidate deliberately keeps three outcomes open:

1. **Independent Work object**: a stable identity survives decomposition,
   workspace movement, several Initiatives, and successive settlements.
2. **Perspective-bound Work view**: one root reference, relation policy, and
   set of component cuts derive the useful whole without new fact authority.
3. **No new Primitive**: Initiative plus Assignment Graph and existing query
   contracts provide equivalent continuity at lower cost.

The current evidence does not select among them. Product terminology may use
Work before ontology qualification, but it must not present a derived view as
an independently authoritative entity.

## Distinction from adjacent objects

| Object | Responsibility not owned by Work |
|---|---|
| Pursuit | Continuing direction and consequence meaning |
| Atlas | Perspective, admitted sources, cut, freshness, and declared loss |
| Warrant | Bounded and revocable authority |
| Episode | Realized causal occurrence |
| Initiative | One continuing coordinated software-work context |
| Assignment | One bounded accepted responsibility |
| Project Cut | What one project officially became at a settled boundary |

Work may bind and present these objects. It cannot absorb their authority or
make their independently variable states co-vary.

## Engineering hypothesis

A first implementation may use:

```text
workspace-qualified WorkRef
  + typed Assignment Graph
  + component workspace cuts and proofs
  + declared traversal policy and observer
  + current action frontier
  = perspective-bound Work view
```

Paths remain locators. Every semantic mutation routes to the owning fact world.
Unavailable workspaces and unresolved references remain visible. The view is
portable only to the extent that its component identities, cuts, relation
policy, and declared loss are portable.

## Qualification gate

Promotion requires at least:

1. a completed federated implementation in which one real body of work spans
   several independently authoritative workspaces;
2. a deletion witness showing that removing Work changes continuation or
   settlement decisions while Initiative and Assignment facts remain fixed;
3. a fuse witness showing why Work cannot safely be identical to Initiative,
   Assignment, Pursuit, repository, workspace, Portfolio, or Project Cut;
4. comparison of stable-entity and derived-view implementations;
5. path movement, unavailable workspace, stale cut, relation-cycle, and partial
   handshake qualification without hidden global authority;
6. evidence that the user-facing view lowers reconstruction cost while exact
   authority and residual risk remain available to agents;
7. at least one non-software or structurally non-isomorphic adopter comparison;
8. independent review and an explicit KFD-5 promotion decision.

## Falsifiers

The candidate weakens, is subsumed, or should be rejected if:

- one Initiative plus typed Assignment relations answers every Work question
  without changed decisions or material reconstruction;
- Work membership is only an unstable query preference with no durable
  identity, consequence, or continuation semantics;
- a Work view requires centralizing or duplicating component authority;
- progress aggregation hides pending review, settlement, unavailable evidence,
  or conflicting cuts;
- the model transfers poorly beyond one multi-repository software workflow;
- users gain no measurable reduction in context reconstruction or decision
  effort.

## Numbering boundary

This candidate has no allocated KFD number and makes no slot reservation. Its
live case is provisional. Only an explicit, independently reviewed promotion
after KFD-5 qualification may create a numbered decision.
