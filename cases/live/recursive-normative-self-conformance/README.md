---
status: resolved
period: 2026-08-08
theme: recursive-normative-self-conformance
doc_type: qualification-case
source_level: local-files
confidence: high
sensitivity: public
evidence_grade: A
review_state: independently-reviewed
last_reviewed: 2026-08-08
---

# Recursive normative self-conformance live case

This case asks KFD's published Self-Conformance Profile to process the next
pre-number Candidate about recursive normative self-application. It is a
qualification case, not proof that a new Primitive exists.

## Fixed inputs

- Candidate: [`drafts/recursive-normative-self-conformance.md`](../../../drafts/recursive-normative-self-conformance.md)
- Genesis: [`genesis.md`](genesis.md)
- KFD-5 cut: [`cuts/0001-recursive-normative-self-conformance.json`](cuts/0001-recursive-normative-self-conformance.json)
- Terminal KFD-5 cut: [`cuts/0002-no-new-kfd.json`](cuts/0002-no-new-kfd.json)
- Method trace: [`kfd-method-trace.md`](kfd-method-trace.md)
- Ontology split: [`ontology-split.md`](ontology-split.md)
- Distinguishability: [`distinguishability.md`](distinguishability.md)
- Historical replay: [`evidence/self-conformance/qualification/recursive-normative-self-conformance.replay.json`](../../../evidence/self-conformance/qualification/recursive-normative-self-conformance.replay.json)
- Review boundary: [`reviews/README.md`](reviews/README.md)

## Current state

The terminal KFD-5 cut is `no-new-primitive`, and the Candidate lifecycle
records `no-new-kfd` as a non-promotion outcome after exact-cut independent
review. Candidate registration allocates no number, and the structural verifier
did not select or apply the disposition.

## Qualification question

Does recursive normative self-conformance carry a responsibility not already
recoverable from KFD-1, KFD-2, KFD-5, KFD-11, and the fixed
`kfd-self-conformance@1.0.0-alpha.1` Profile?

The reviewed result is that the procedure is valuable but derivable. It remains
public as an explicit composition and reopening target rather than a numbered
KFD.

## Claim boundary

This case records one first-party recursive dogfood exercise and its reviewed
non-promotion result. It does not prove universal necessity, historical
conformance before the Profile existed, an independent implementation, a KFD
number, activation, certification, merge, or release authority.
