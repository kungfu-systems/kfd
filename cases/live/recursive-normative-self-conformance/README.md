---
status: draft
period: 2026-08-08
theme: recursive-normative-self-conformance
doc_type: qualification-case
source_level: local-files
confidence: medium
sensitivity: public
evidence_grade: A
review_state: unreviewed
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
- Method trace: [`kfd-method-trace.md`](kfd-method-trace.md)
- Ontology split: [`ontology-split.md`](ontology-split.md)
- Distinguishability: [`distinguishability.md`](distinguishability.md)
- Historical replay: [`evidence/self-conformance/qualification/recursive-normative-self-conformance.replay.json`](../../../evidence/self-conformance/qualification/recursive-normative-self-conformance.replay.json)
- Review boundary: [`reviews/README.md`](reviews/README.md)

## Current state

The initial KFD-5 cut is `provisional`. The evidence deliberately leaves the
terminal disposition to a later independently reviewed exact cut. Candidate
registration does not allocate a number, and the structural verifier cannot
change this state.

## Qualification question

Does recursive normative self-conformance carry a responsibility not already
recoverable from KFD-1, KFD-2, KFD-5, KFD-11, and the fixed
`kfd-self-conformance@1.0.0-alpha.1` Profile?

The live hypothesis is that the procedure is valuable but derivable. The
required terminal options remain open: qualify, retain provisional, reject,
or record `no-new-kfd`.

## Claim boundary

This case records one first-party recursive dogfood exercise. It does not
prove universal necessity, historical conformance before the Profile existed,
an independent implementation, a KFD number, activation, certification,
approval, merge, or release authority.
