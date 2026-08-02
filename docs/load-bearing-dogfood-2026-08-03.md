---
status: active
period: 2026-08-03
theme: kfd-load-bearing-dogfood-successor
doc_type: evidence-synthesis
source_level: public-repository-evidence-and-maintainer-consensus
confidence: high
sensitivity: public
evidence_grade: B
review_state: unreviewed
last_reviewed: 2026-08-03
---

# KFD Under Load: 2026-08-03 Successor Cut

This document is an immutable successor to the
[2026-07-28 baseline](load-bearing-dogfood.md). It does not revise that cut,
change a numbered KFD, activate KFD-6, qualify a Primitive, or update a frozen
paper evidence slice.

## Source boundary

The implementation facts below are bound to Kungfu commit
[`a2967f22d0d23766eb887168e8fffc41251bad54`](https://github.com/kungfu-systems/kungfu/commit/a2967f22d0d23766eb887168e8fffc41251bad54).
KFD lifecycle and decision status remain those of this repository cut. Public
repository files are evidence inputs; they are not independent adoption or
normative authority.

Three categories are kept separate:

- **verified fact**: a public, exact-cut implementation or contract exists;
- **bounded inference**: the fact increases confidence in a KFD mechanism but
  does not satisfy its complete gate;
- **missing evidence**: a condition still required before qualification or
  activation.

## 1. KFD-5 is now materially more explicit

### Verified facts

Kungfu now has a Primitive Management Plane with a mechanically closed intake
and projection path:

```text
incubation passport registry (sole intake)
  -> declared authority and evidence references
  -> generated three-plane Primitive Catalog
  -> native and installed read-only query surfaces
```

The relevant exact-cut surfaces are:

- `docs/architecture/primitive-management-plane.md`;
- `framework/incubation/incubation-passport.registry.json`;
- `framework/primitive/kungfu-primitive-catalog.contract.json`.

The catalog contains nine entries: Action Geometry, Assignment, Cut, Domain
Profile, Episode, Fact, Initiative, Receipt, and Work. Admission state remains
explicitly experimental or candidate, and the catalog declares that it is a
derived view rather than a second authority.

### Bounded inference

This is stronger KFD-5 evidence than isolated Primitive prose or one accepted
case. Genesis, intake, evidence references, admission state, non-claims, and
query projection now participate in one fail-closed product mechanism. The
mechanism makes it harder to smuggle a new object into product vocabulary
without an explicit passport and evidence boundary.

It does not prove that every catalog entry is correctly qualified. It also
does not make a founding-adopter catalog a universal KFD registry.

### Missing evidence

- independent adopter replay of the same genesis/qualification separation;
- retained qualification and dogfood receipts for each promoted entry;
- four-language proof where Kungfu's admission policy requires it;
- evidence that attractive false candidates are rejected rather than merely
  omitted;
- an explicit release decision before any support or shipment claim widens.

## 2. Work has crossed from analytic hypothesis to implementation pressure

### Verified facts

Kungfu's current Work Control Profile exposes Initiative, Assignment, WorkRef,
Portfolio, independent review, continuation, and Project Cut settlement as
separate responsibilities. The Primitive Catalog also contains a `work` entry
with experimental admission and explicit non-claims.

### Bounded inference

The Work live case can no longer be described only as a pre-implementation
thought experiment. There is now an operational product ontology that uses the
name and carries real coordination pressure. This justifies a successor KFD-5
cut and stronger deletion/fuse experiments.

It still does not decide whether KFD-level Work is:

- an independent Primitive;
- a perspective-bound derived view over Initiative, Assignment, WorkRef, and
  Project Cut;
- ordinary Work Control Profile vocabulary;
- or no new Primitive.

The implementation may be evidence for any of those outcomes.

## 3. Product Release Cut and Cut Transition deserve live KFD-5 discovery

### Verified facts

Kungfu's `framework/upgrade/kungfu-product-release-cut.contract.json` declares
two separately rooted responsibilities:

- **Product Release Cut** identifies one exact qualified product world;
- **Cut Transition** authorizes movement between exact Release Cuts.

The contract keeps SemVer as display and compatibility metadata, rejects
ordering unequal roots by version or recency alone, separates public and local
trust domains, and retains rollback and transition evidence independently of a
source cache.

### Bounded inference

The split may expose two reusable Primitives: exact released-world identity and
authorized movement between such worlds. It may also be only a product-domain
specialization of KFD-13 Project Cut plus existing Warrant, Decision, Admission,
and release-passport semantics. Two provisional KFD-5 tracks now preserve that
question before successful delivery makes the design appear inevitable.

### Missing evidence

- deletion and fuse tests over completed public and local campaigns;
- comparison with generic Cut, Project Cut, release passport, manifest, and
  SemVer-only alternatives under fixed evidence;
- independent review and adopter evidence;
- cross-product or cross-domain transfer;
- proof that Cut Transition owns a responsibility not already carried by
  Warrant-bound Decision and Admission.

## 4. KFD-6 has precursor evidence, not conformance

### Verified facts

Kungfu now retains three bounded Work Design mechanisms:

- a read-only Work History Selector over rooted, temporally available history;
- an advisory-only Work Design Advisor with human final work-definition
  authority;
- offline policy replay with explicit cohorts, outcomes, regression checks,
  rollback, and a minimum of 30 qualified samples before default-policy
  promotion eligibility.

The exact-cut contracts are
`framework/work-design-advisor/work-design-advisor.contract.json`,
`framework/work-design-policy-replay/work-design-policy-replay.contract.json`,
and the selector boundary documented in `framework/project-cut/README.md`.

### Bounded inference

These mechanisms make part of KFD-6 visible in executable form: immutable
history cuts, declared evidence gaps, outcome comparison, advisory-only
authority, shadow thresholds, and separation between advice and activation.
They increase confidence that Episodes and settled Work can become raw material
for reproducible reasoning about future work design.

### Missing evidence and explicit non-claim

Kungfu does not yet implement a conforming KFD-6 autonomous discovery loop. It
does not compare plural genesis methods under shared budgets, run fixed-ontology
and no-new-Primitive baselines, measure and reject false candidates
systematically, separate discovery from held-out promotion evidence for a new
Primitive, or demonstrate cross-context transfer. KFD-6 therefore remains
draft and Kungfu support remains explicitly unsupported.

## 5. Bounded confidence update

The new evidence supports a narrower but stronger conclusion than “KFD-4/5/6
are becoming active”:

```text
KFD-4: perspective transformation is already operationally useful
KFD-5: product-level genesis and qualification machinery is now explicit
KFD-6: history-grounded advisory precursors exist, while the discovery gate remains open
```

The practical implication is that Episodes and other settled causal records
are increasingly valuable as historical assets. Their value comes from keeping
future questions answerable, including questions the current ontology cannot
yet formulate. That value does not justify unlimited retention, privacy
erosion, narrative-only archives, or autonomous promotion authority.

## 6. Next evidence gates

1. Run the Work successor cut against completed, rooted Work Control and
   Portfolio cases with fixed Initiative alternatives.
2. Exercise Product Release Cut and Cut Transition across public release,
   local dogfood, equal-SemVer successor, conflict, recovery, and rollback
   cases.
3. Preserve negative outcomes and `no-new-primitive` results in the same live
   registry as successful candidates.
4. Admit a separate KFD-6 experiment only when plural methods, baselines,
   budgets, false-candidate rejection, held-out evaluation, and transfer are
   executable and independently reviewable.

This successor increases the visibility of KFD-5 and the plausibility of a
future KFD-6 program. It does not change the standard's lifecycle facts.
