---
status: draft
period: ongoing
theme: kfd-candidate-incubation
doc_type: candidate-index
source_level: maintainer-consensus
confidence: high
sensitivity: public
evidence_grade: B
review_state: self-reviewed
last_reviewed: 2026-07-21
---

# KFD Candidates

KFD Candidates preserve potentially load-bearing portable engineering rules
before a KFD number is allocated. They are pre-number drafts, not numbered
decisions.

The machine source is [`registry.json`](registry.json). A candidate may carry
a non-binding `slotHint` to preserve the current ordering hypothesis. The hint
does not reserve, allocate, or promise that number. Only an explicit promotion
creates a numbered KFD under `decisions/` and `registry.json`.

```text
candidate
  -> qualification
  -> explicit promotion
  -> numbered draft
  -> activation evidence
  -> active KFD
```

Candidates may be revised, reordered, merged, split, withdrawn, rejected, or
promoted while their published coordinates remain immutable. Their current
status and claim boundary must remain machine-readable.

Any participant may propose a candidate, counterexample, adopter Profile, or
qualification evidence through the public process in
[`CONTRIBUTING.md`](../CONTRIBUTING.md). Maintainers remain responsible for
official numbering and status decisions.

Promoted lineage:

- [Cross-domain action primitives](action-state-separation.md) was explicitly
  promoted into active [KFD-7](../decisions/KFD-7.md).
- [Atlas action perspective](atlas-action-perspective.md) was explicitly
  promoted into numbered draft [KFD-8](../decisions/KFD-8.md).
- [Pursuit intent continuity](pursuit-intent-continuity.md) was explicitly
  promoted into numbered draft [KFD-9](../decisions/KFD-9.md).
- [Warrant bounded authority](warrant-bounded-authority.md) was explicitly
  promoted into numbered draft [KFD-10](../decisions/KFD-10.md).
- [Claim, Assessment, Decision, and Admission](claim-assessment-decision-admission.md)
  was allocated to numbered draft [KFD-11](../decisions/KFD-11.md) by the
  [2026-07-21 pre-stable Foundation Revision](../docs/foundation-revision-2026-07-21-decision-admission.md).

There are no incubating candidates in the current registry cut. The promoted
pages remain public lineage and do not replace their numbered decisions.

See [Contributing](../CONTRIBUTING.md) and
[Governance](../GOVERNANCE.md) for open proposal, candidate promotion,
pre-stable Foundation Revision, stewardship, and Foundation Freeze rules.
