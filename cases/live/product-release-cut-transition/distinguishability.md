---
status: draft
period: 2026-08-03
theme: product-release-cut-transition-distinguishability
doc_type: analysis
source_level: public-repository-evidence
confidence: medium
sensitivity: public
evidence_grade: B
review_state: unreviewed
last_reviewed: 2026-08-03
---

# Conditional Distinguishability

## Product Release Cut deletion test

Hold source, artifacts, platform manifests, signatures, qualification, SemVer,
channel, and trust domain fixed. Remove only Product Release Cut identity.

Deletion matters only if a participant can no longer answer which exact
qualified product world is current, distinguish equal-SemVer successors, or
bind rollback to the exact prior world without reconstructing the same object
ad hoc. A convenient aggregate hash is not enough.

## Cut Transition deletion test

Hold the two product worlds, Warrant, Decision, Admission, compatibility,
migration, rollback, and evidence fixed. Remove only Cut Transition.

Deletion matters only if authorized movement, conflict, recovery, or rollback
becomes ambiguous or requires repeated reconstruction not already owned by the
fixed authority objects.

## Fuse tests

Product Release Cut is not separate if a generic Cut or Project Cut profile
preserves identical decisions at lower ontology cost. Cut Transition is not
separate if Warrant-bound Decision plus Admission preserves identical movement
and rollback consequences without hidden reconstruction.

Conversely, separation gains evidence if one exact product world participates
in several valid transitions, one transition can be assessed independently of
either endpoint's identity, and endpoint identity remains unchanged when
movement authorization is denied, replaced, or rolled back.

## Required negative cases

- same SemVer, identical Cut;
- same SemVer, verified successor;
- same SemVer, unsigned conflicting public Cut;
- local dogfood Cut that is publication-ineligible;
- diverged or unknown relation;
- rollback to an exact prior Cut;
- valid endpoint Cuts with an invalid or revoked transition;
- valid transition evidence with a missing or mismatched endpoint.

## Current verdict

Both candidates are analytically distinguishable enough to incubate but remain
provisional. Minimum closure, deletion, fuse, independent adoption, and
cross-domain transfer are inconclusive.
