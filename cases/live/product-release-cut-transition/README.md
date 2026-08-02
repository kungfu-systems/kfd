---
status: active
period: 2026-08-03
theme: product-release-cut-transition
doc_type: live-case
source_level: public-repository-evidence
confidence: medium
sensitivity: public
evidence_grade: B
review_state: unreviewed
last_reviewed: 2026-08-03
---

# Product Release Cut and Cut Transition

This live case tracks two provisional objects exposed by Kungfu's release and
updater work:

> Does exact product-world identity require a Product Release Cut, and does
> authorized movement between two such worlds require a distinct Cut
> Transition?

The implementation separates exact identity from movement. KFD-5 must still
determine whether either responsibility is independently necessary or whether
existing Project Cut, Warrant, Decision, Admission, release-passport, manifest,
and SemVer semantics already close the problem.

## Current result

```text
candidate: Product Release Cut
status: provisional
minimum closure: inconclusive
dogfood: implementation witness exists; qualification not run

candidate: Cut Transition
status: provisional
minimum closure: inconclusive
dogfood: implementation witness exists; qualification not run
```

The source evidence is Kungfu commit
[`a2967f22d0d23766eb887168e8fffc41251bad54`](https://github.com/kungfu-systems/kungfu/commit/a2967f22d0d23766eb887168e8fffc41251bad54),
especially `framework/upgrade/kungfu-product-release-cut.contract.json` and
`docs/evolution/stages/10-product-release-cut-updater.md`.

## Case surfaces

- [Genesis](genesis.md)
- [Ontology alternatives](ontology-split.md)
- [Conditional distinguishability](distinguishability.md)
- [KFD method trace](kfd-method-trace.md)
- [Propagation boundary](propagation-hypothesis.md)
- [Product Release Cut KFD-5 cut](cuts/0001-product-release-cut.json)
- [Cut Transition KFD-5 cut](cuts/0001-cut-transition.json)
- [Qualification reviews](reviews/README.md)
- [Live case registry](../../registry.json)

## Claim boundary

This case allocates no KFD number and accepts neither candidate. It does not
activate KFD-13, make Kungfu product terminology universal, prove historical
novelty, certify a release, or establish independent adoption. A
`no-new-primitive` outcome remains first-class for both tracks.
