---
status: active
period: 2026-07-11/2026-07-21
theme: software-work-perspective-genesis
doc_type: genesis-record
source_level: maintainer-consensus
confidence: high
sensitivity: public
evidence_grade: B
review_state: self-reviewed
last_reviewed: 2026-07-21
---

# Genesis: Two Perspective Transformations

This record freezes the first public reconstruction of how Initiative,
Assignment, and Project Cut became visible. It separates reported genesis from
later repository evidence and must not be rewritten into a cleaner success
story.

## Starting ontology: the developer and Primitive-research view

The starting ontology was already rich:

```text
Fact      admitted state
Episode   realized causal occurrence
Pursuit   continuing direction
Atlas     declared perspective and fact cut
Warrant   bounded authority
```

From the position of a researcher or product developer, the obvious next work
was to improve those objects: add fields, lifecycle control, storage,
verification, queries, migration, and perhaps discover more peers at the same
layer.

That view was valid for building the substrate. It did not identify the
objects a person naturally uses to organize real software work.

## Transformation one: from developer to real user

The observer changed from the participant implementing action primitives to a
person trying to get real work done with agents. The consequence position also
changed: the user bears continuity loss, unclear responsibility, repeated
explanation, and failed handoff rather than API incompleteness.

| Developer view | Real-user view |
|---|---|
| refine Pursuit, Atlas, and Warrant controls | preserve the continuing work that matters |
| expose more coordinate fields | make one bounded responsibility understandable and assignable |
| optimize primitive APIs | reduce mental reconstruction and handoff cost |
| reason from implementation boundaries | reason from lived purpose and consequence |

Two macro objects became natural:

```text
Initiative
  continuing coordinated work with declared intent, scope, participants,
  Pursuits, Assignment relations, lineage, and settlement state

Assignment
  bounded responsibility with participant, objective, Atlas, Warrant,
  acceptance boundary, expected evidence, lineage, and state
```

The earlier Mission/Go product vocabulary supplied first-party pressure and
implementation evidence. The pre-stable KFD-11 later assigned the canonical
software-profile vocabulary; the 2026-07-21 Foundation Revision maps it to
current KFD-12 without rewriting this genesis. It names Initiative and
Assignment. The candidate claim is not that the labels created the
responsibilities, but that the responsibilities remain useful and independently
addressable after the lower coordinates are held fixed.

## Transformation two: from work coordinator to successor agent

Once Initiative and Assignment existed, the coordinator's natural model was a
continuing graph of work, responsibility, Episodes, claims, assessments, and
decisions. From inside that graph, keeping it current appeared sufficient.

The observer then changed to an agent receiving the project after prior work.
That participant does not primarily need the complete management context. It
needs a bounded answer to:

> What has this project officially become, which authorities establish that
> state, what is missing, and from which exact boundary may I continue?

Reconstructing that answer from every open and closed work object would make
each continuation repeat the settlement investigation. Project Cut became
visible as the object carrying the admitted relationship:

```text
predecessor Project Cut
  + accepted source projection
  + successor Atlas
  + admitted Episode delta
  + interpretation policy
  + omissions, conflicts, unknowns, and residual risk
  -> verifiable project-level commitment
```

## Agent-origin testimony and public evidence

The human maintainer reports that Project Cut was proposed by an agent reasoning
from the successor-agent action perspective, and that its need remained partly
non-obvious to the maintainer through initial implementation. This is a
maintainer testimony about genesis, not a fact recoverable from Git authorship.

Public repository evidence begins with the accepted Project Cut architecture
in Kungfu PR 958 and continues through canonical-root, agent-first settlement,
Git-history, clean-clone continuation, independent review, and concurrent
composition work. That evidence can qualify the object and contradict the
genesis story; it cannot prove who first conceived it in an unretained private
conversation.

## Why this is KFD-4 evidence

Neither transformation merely changed wording. Each changed the natural object
required for action:

```text
developer -> user
coordinates become Initiative and Assignment

coordinator -> successor agent
work history becomes Project Cut
```

The lower objects did not become false. They became insufficient as the direct
interface for a different consequence-bearing participant. This is the KFD-4
pattern: preserve facts and invariants while changing the declared observer so
previously hidden object boundaries can appear.

## Initial alternatives

- keep refining Pursuit, Atlas, and Warrant without new macro objects;
- use task, issue, project, workflow, or context as the only work object;
- treat Initiative as one Pursuit and Assignment as one Warrant;
- use the latest database row, Fact Cut, Git commit, release tag, or context
  snapshot as project settlement;
- require each successor to reconstruct the relevant binding;
- conclude that no new Primitive is justified.

These alternatives remain part of qualification rather than being erased by
the accepted outcome.
