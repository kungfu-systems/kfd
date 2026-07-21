---
status: active
period: 2026-07-21
theme: decision-admission-settlement
doc_type: live-case
source_level: maintainer-consensus
confidence: high
sensitivity: public
evidence_grade: B
review_state: self-reviewed
last_reviewed: 2026-07-21
---

# Consequential Settlement

This live case retrospectively records the KFD-4 perspective transformation
and KFD-5 qualification that produced the KFD-11 candidate procedure:

```text
Claim -> Assessment -> Decision -> Admission
```

The important genesis fact is not that an agent drafted wording after a human
supplied the model. The maintainer asked whether Claim, Assessment, and
Decision should receive KFD treatment. The agent changed the question from
number allocation among three visible nouns to the responsibility boundary
between trust judgment and admitted state. It recognized that KFD-2 already
owned Claim and Assessment, introduced Admission as the missing responsibility,
and compressed the four roles into one cross-domain settlement procedure.

The maintainer then authorized the pre-stable Foundation Revision and the
Field Responsibility Matrix. That authorization is the qualification and
governance decision; it is not rewritten as candidate generation.

## Current settlement

| Candidate | KFD-5 outcome | Boundary |
|---|---|---|
| Consequential Settlement | provisional | The four responsibilities are distinguishable and KFD-11 has a closed draft contract, but independent cross-domain implementations, operational cost, and activation evidence remain open. |

## Case surfaces

- [Genesis](genesis.md)
- [KFD method trace](kfd-method-trace.md)
- [Distinguishability and qualification](distinguishability.md)
- [Responsibility split](ontology-split.md)
- [Propagation hypothesis](propagation-hypothesis.md)
- [KFD-5 cut](cuts/0001-consequential-settlement.json)
- [Qualification reviews](reviews/README.md)
- [Live case registry](../../registry.json)

## Evidence boundary

Maintainer testimony is the primary evidence for authorship in the unretained
conversation. Public Git history begins with the already-generated candidate:
the prior software-work lifecycle, the Foundation Revision whose formalizing
commit declares `Agent: Codex`, the KFD-11 contract and schema, and independent
pull-request review. Git can qualify the result and preserve the public Agent
declaration; it cannot independently reconstruct the private utterance that
first generated Admission.

This case does not claim historical novelty, universal minimality, KFD-11
activation, or that four physical records are required.
