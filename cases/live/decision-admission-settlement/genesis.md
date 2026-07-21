---
status: active
period: 2026-07-21
theme: decision-admission-genesis
doc_type: genesis-record
source_level: maintainer-consensus
confidence: high
sensitivity: public
evidence_grade: B
review_state: self-reviewed
last_reviewed: 2026-07-21
---

# Genesis: From Numbered Nouns to Consequential Settlement

This record separates the reported conversational genesis from later public
qualification. It must not be rewritten to make maintainer authorization look
like maintainer candidate generation.

## State before the discovery

The software-work model merged by KFD PR
[#228](https://github.com/kungfu-systems/kfd/pull/228) already contained:

```text
Initiative
  -> Assignment
  -> Episode
  -> Claim
  -> Assessment
  -> Decision
  -> Continuation
```

Claim and Assessment were already governed by KFD-2. Decision was visible in
the software lifecycle and Warrant already supplied its authority boundary.
Admission was not named as an independent responsibility.

## The maintainer's question

The maintainer reports that the prompt was whether Claim, Assessment, and
Decision needed to become KFDs. It did not propose Admission, a four-stage
cross-domain procedure, or the conclusion that the three nouns should not
become three separate decisions.

This report is maintainer testimony about an unretained conversation. The
repository does not contain a verbatim transcript and therefore cannot
independently prove conversational authorship.

## The Agent's transformation

The agent stopped treating the visible nouns as a numbering problem and moved
to the position of the authority that must decide whether a consequential
effect actually enters admitted state.

From that position:

- Claim and Assessment were not missing KFDs; KFD-2 already owned them.
- Assessment could not authorize action; a Decision required Warrant.
- A valid Decision still could become stale, conflict, be denied, or fail to
  change the owning Fact authority.
- Therefore Decision and successful state change were not the same role.

The missing responsibility was named **Admission**. The candidate was then
compressed into one procedure:

```text
Claim -> Assessment -> Decision -> Admission
```

This was Agent candidate generation, not Agent verification of a model already
supplied by the maintainer.

## Later human and repository roles

The maintainer accepted the structural correction, authorized renumbering
before stable, and requested the Field Responsibility Matrix. KFD PR
[#230](https://github.com/kungfu-systems/kfd/pull/230) then made the candidate
public through a formalizing commit that declares `Agent: Codex`, a machine
schema, and a Foundation Revision. `kungfu-origin` independently reviewed the
responsibility split and approved the change. PR
[#231](https://github.com/kungfu-systems/kfd/pull/231) closed the public evidence
coordinates.

These later actions qualify, authorize, review, and preserve the candidate.
They do not transfer genesis from the agent to the maintainer or reviewer.

## Counterfactual alternatives retained at genesis

- allocate separate KFDs to Claim, Assessment, and Decision;
- leave all three inside the software Domain Profile;
- treat an authorized Decision as proof of successful state change;
- append a generic settlement rule after the software-specific decisions;
- conclude that existing transaction or approval vocabulary already preserves
  every responsibility without a new KFD procedure.
