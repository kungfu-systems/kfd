---
status: draft
period: 2026-08
theme: kfd-historical-self-conformance
doc_type: specification
source_level: public-specifications
confidence: high
sensitivity: public
evidence_grade: B
review_state: self-reviewed
last_reviewed: 2026-08-10
---

# KFD historical Self-Conformance

This additive history profile replays immutable KFD events without changing the
live `kfd-self-conformance@1.0.0-alpha.1` contract. The live contract, its
alpha.55 bootstrap, retained reports, issue inventory, manifest, and verifier
bytes remain unchanged.

## Bootstrap boundary

The retrospective Foundation Cut is commit
`04f839e8e7834c9eda3d46424de2f59f53623e8f`, tag
`v1.0.0-alpha.28`, package `@kungfu-tech/kfd@1.0.0-alpha.28`, and tarball root
`sha256:279cf2adcfe0c5cd9d31ecf0e6317d5a5f2ff854c49c39f7e135ad4e2cc43ce1`.
At that cut KFD-1 through KFD-5 were active, KFD-6 was draft, and KFD-7 was
absent. PR #146 and its exact-head `kungfu-origin` approval are separate source
payloads.

Every history report and episode declares `retrospective: true` and
`profileAvailableAtEvent: false`. This is a later reconstruction, not a claim
that historical actors ran a Profile that did not exist.

## KFD-7 walkthrough

KFD-7 moves through PR #159 Candidate genesis, PR #176 Candidate refinement,
PR #180 numbered draft, PR #186 qualification, PR #190 activation with the
Buildchain and Kungfu product-profile evidence, and alpha.36 packaging. Each
step retains its actual terminal state; later activation is never projected
backward.

## Coverage

KFD-8 through KFD-10 stop at numbered draft. The Foundation Revision retains
old KFD-11 as present KFD-12 and old KFD-12 as present KFD-13, while allocating
the present KFD-11; all remain draft. The recursive `no-new-kfd` result remains
a valid non-promotion outcome.

## Convergence and limits

The history report converges additively with `kfd-alpha-55-pre-profile`; it does
not replace that anchor. A pass proves only structural closure of the embedded
immutable source payloads, time boundary, generic transition recipes,
authority/review separation, and declared terminal outcomes. It does not prove
semantic truth, activation, adoption, certification, fitness, or release
authority.
