---
status: draft
period: 2026-08-09
theme: durable-result-identity-availability-distinguishability
doc_type: analysis
source_level: public-repository-evidence-and-maintainer-judgment
confidence: medium
sensitivity: public
evidence_grade: B
review_state: unreviewed
last_reviewed: 2026-08-09
---

# Conditional Distinguishability

## Deletion experiment

Hold fixed the result content, action or transformation, qualification, store,
provider, and receiver purpose. Remove the explicit separation between
identity, retention, current availability, transport, and reuse assessment.

Deletion matters only if a participant then makes a different unsafe decision
or must materially reconstruct one of these facts from mutable provider state,
logs, convention, or operator memory. Cleaner schema design is not sufficient.

Buildchain demonstrates likely deletion pressure through missing, expired,
partial, corrupt, quarantined, root-mismatch, cross-platform, cross-stage, and
drift campaigns. A non-build fixed-root deletion witness remains absent.

## Fuse experiment

The responsibilities are operationally distinguishable when, with the same
result identity:

- a retention commitment expires without changing historical bytes;
- availability changes from present to missing or corrupt;
- a transport locator moves without changing result identity;
- qualification becomes insufficient for a new purpose;
- a receiver rejects reuse while preserving the historical result;
- two stores report different availability without creating two results.

Buildchain's shadow contract supports these variations. Qualification must
show that at least one unrelated adopter also needs them and cannot obtain the
same decisions from ordinary content-addressed storage plus policy.

## Current verdict

The candidate is sufficiently distinguishable to incubate, not to number.
Product evidence is strong; cross-domain irreducibility and redundancy against
existing KFDs remain unresolved.
