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
last_reviewed: 2026-07-17
---

# KFD Candidates

KFD Candidates preserve potentially load-bearing organization rules before a
KFD number is allocated. They are pre-number drafts, not numbered decisions.

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

Current candidate:

- [Independent action state](action-state-separation.md), currently carrying
  the non-binding slot hint `7`.

See [Contributing](../CONTRIBUTING.md) for candidate promotion, pre-stable
Foundation Revision, and Foundation Freeze rules.
