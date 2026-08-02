---
status: draft
period: 2026-08-03
theme: product-release-cut-transition-genesis
doc_type: analysis
source_level: public-repository-evidence
confidence: medium
sensitivity: public
evidence_grade: B
review_state: unreviewed
last_reviewed: 2026-08-03
---

# Genesis: Exact Product Worlds and Authorized Movement

## Initial observer

The initial observer was implementing release selection and upgrade behavior.
The natural objects were versions, manifests, platform artifacts, signatures,
channels, installers, and rollback records.

That ontology made SemVer appear to be product identity and made updater
selection appear to authorize movement.

## Pressure and perspective change

Equal-SemVer successors, local dogfood artifacts, signed public supersession,
rollback, conflict, and offline installation changed the consequence-bearing
question:

```text
Which exact qualified product world is this?
What exact evidence authorizes movement to or from it?
```

Kungfu's implementation answered with two roots: `releaseCutRoot` for one
product world and `cutTransitionRoot` for movement between worlds.

## Why implementation is not qualification

The split may reflect two durable responsibilities. It may also be a local
contract decomposition of existing KFD objects:

- Product Release Cut may be a KFD-13 Project Cut specialization;
- Cut Transition may be Warrant-bound Decision plus Admission;
- release passports and manifests may already carry the evidence;
- SemVer plus artifact digests may be sufficient in less demanding systems;
- neither candidate may justify a new Primitive.

This case freezes those alternatives before successful release dogfood can
turn one implementation into an inevitability narrative.
