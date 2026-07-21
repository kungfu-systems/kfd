---
status: active
period: 2026-07-21
theme: decision-admission-genesis
doc_type: genesis-record
source_level: maintainer-testimony-and-repository-evidence
confidence: high
sensitivity: public
evidence_grade: B
review_state: self-reviewed
last_reviewed: 2026-07-21
---

# Genesis: From Development Pressure to Consequential Settlement

This record separates the distributed development genesis from later KFD
recognition and public qualification. It must not be rewritten to make
maintainer pressure or authorization look like maintainer generation of the
intermediate ontology.

## The discovery began before KFD-11

On 2026-07-11, the maintainer asked how Kungfu should determine whether Agent
work was trustworthy and later asked the agent to connect KFD, Fact Manager,
ADR-0048, and Atlas Mission/Go into one product. Those prompts supplied the
real problem and desired outcome. They did not specify Claim, Assessment, or
Decision as product objects.

The agent first generated a trust decomposition:

```text
Claim + purpose + pinned cut + policy -> Assessment -> TrustReport
```

It then generated the Mission Control chain and identity graph:

```text
Mission -> Go -> Episode -> Fact query -> Assessment -> Decision

mission -> go -> run -> episode -> claim -> query -> assessment -> decision
```

Kungfu PRs [#542](https://github.com/kungfu-systems/kungfu/pull/542),
[#545](https://github.com/kungfu-systems/kungfu/pull/545), and
[#585](https://github.com/kungfu-systems/kungfu/pull/585) preserve the public
architecture and implementation sequence. Claim, Assessment, and Decision
therefore predate the later KFD numbering question.

## The later maintainer question

On 2026-07-21, the maintainer asked whether Claim, Assessment, and Decision
needed to become KFDs. The maintainer reports that this was also the first time
they became aware those named objects already existed. The question did not
propose the three objects, Admission, a four-stage cross-domain procedure, or
the conclusion that the visible nouns should not become three separate
decisions.

A maintainer-held local task transcript retains the earlier exchanges, but it
is not distributed in the public repository. Public Git proves the subsequent
semantic and implementation sequence, not every conversational utterance.

## The Agent's retrospective transformation

By then, Project Cut settlement, independent review, and Action Loop recovery
had made the responsibilities operational. Admission also already existed in
the Fact architecture as the difference between a recorded observation and
admitted state. The agent stopped treating the visible nouns as a numbering
problem and recognized that these separately generated lines shared one
procedure.

The compression was:

- Claim and Assessment were not missing KFDs; KFD-2 already owned them.
- Assessment could not authorize action; a Decision required Warrant.
- A valid Decision still could become stale, conflict, be denied, or fail to
  change the owning Fact authority.
- Therefore existing Fact Admission had to remain distinct from Decision in a
  cross-domain settlement model.

The candidate was compressed into one procedure:

```text
Claim -> Assessment -> Decision -> Admission
```

This was Agent Primitive recognition and structural compression over an
Agent-generated development ontology, not Agent verification of a model
already supplied by the maintainer.

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
They do not transfer generation of Claim, Assessment, Decision, or their
composition from the agents to the maintainer or reviewer.

The full dated evidence chain is preserved in the
[development lineage](development-lineage.md).

## Counterfactual alternatives retained at genesis

- allocate separate KFDs to Claim, Assessment, and Decision;
- leave all three inside the software Domain Profile;
- treat an authorized Decision as proof of successful state change;
- append a generic settlement rule after the software-specific decisions;
- conclude that existing transaction or approval vocabulary already preserves
  every responsibility without a new KFD procedure.
