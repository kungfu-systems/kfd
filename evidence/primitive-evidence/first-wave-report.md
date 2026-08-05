---
status: draft
period: 2026-08-05
theme: warrant-evidence-first-wave
doc_type: evidence-report
source_level: public-source-cuts
confidence: high
sensitivity: public
evidence_grade: A
review_state: self-reviewed
last_reviewed: 2026-08-05
---

# Warrant evidence first-wave report

The first wave retained two exact public source cuts: Buildchain Delivery
Warrant and Kungfu KFX Recovery Warrant. Their repository, commit, tree, path,
and content hashes are in `registry.json` beside this report.

## Proved

- Both sources bind consequential operations to exact targets or source roots.
- Both expose bounded operation scope and an explicit expiry boundary.
- Buildchain adds fencing generation and expected-old-state rejection.
- KFX recovery binds package root, expected cut root, revision, approval roots,
  issuer class, operation, and nonce.

## Partial

- Buildchain retains queue history and terminal settlement, but does not expose
  a portable Warrant consumption event chain.
- KFX recovery is explicit before mutation, but its portable Warrant object
  does not carry the full later lifecycle.
- Product fields supply strong examples but are not a generic Warrant schema.

## Missing

- neither source provides the complete KFD-10 issuer, holder, delegation,
  residual-responsibility, revocation, consumption, and history matrix on one
  portable object;
- no independent adopter implemented this KFD profile from the package alone;
- no competing model comparison establishes that Warrant has lower total cost.

## Invalidated in this cut

- successful occurrence is not proof that authority existed;
- a product implementation cannot activate KFD-10 or certify itself;
- Buildchain scheduling and merge semantics are not universal Warrant fields;
- KFX package disable/remove semantics are not universal Warrant fields.

The machine-readable report fixes these outcomes and keeps KFD-10 `draft`.
