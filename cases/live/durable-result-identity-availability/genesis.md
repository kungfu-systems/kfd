---
status: draft
period: 2026-08-09
theme: durable-result-identity-availability-genesis
doc_type: analysis
source_level: public-repository-evidence-and-maintainer-judgment
confidence: medium
sensitivity: public
evidence_grade: B
review_state: unreviewed
last_reviewed: 2026-08-09
---

# Genesis: From Cache Hit to Defensible Reuse

## Initial observer

The initial observer was evaluating Buildchain v4 recovery after a late build
stage failed. The familiar objects were an action key, cached bytes, an
artifact locator, a retention policy, and a build result.

From that position, the problem looked like reliable cross-run caching.

## Perspective transformation

The observer changed to the successor process that must decide whether it may
safely reuse a retained result after time, process, platform, policy, and
provider state have changed.

From that position, one apparent cache fact separated into several questions:

```text
What exact result is this?
Was anyone committed to retain it?
Is it available and intact now?
Where can it be retrieved?
Is it still qualified for this exact purpose?
```

Buildchain Stage Capsule made those questions independently variable and
computed reuse only from explicit roots and an explicit evaluation clock.

## Why genesis is not qualification

Action cache and content-addressed storage already separate action metadata
from output bytes. Provenance already binds outputs to production inputs and
processes. KFD-1, KFD-2, and KFD-7 already require non-drifting facts,
fact-bound trust, and visible degraded coordinates.

The new observation may therefore be a portable principle, a direct
composition of existing KFDs, a Buildchain-specific Domain Profile, or only a
particularly careful cache protocol. This cut preserves all four outcomes.

This reconstruction is limited to public repository evidence; private
discussion and unretained hosted-runner payloads are outside the cut.
