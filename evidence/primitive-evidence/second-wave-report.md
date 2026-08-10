---
status: draft
period: 2026-08-11
theme: warrant-evidence-second-wave
doc_type: analysis
source_level: public-source
confidence: high
sensitivity: public
evidence_grade: B
review_state: self-reviewed
last_reviewed: 2026-08-11
---

# Warrant evidence second wave

This cut retains two new exact public source coordinates without replacing the
first-wave lineage:

- Buildchain v3 at commit `56aee4f72e3b6beb9eead71c8d596640313f6e7d`,
  tree `0a32ddd21adc87310b83cb216349dfecc145fa49`, and primary content root
  `sha256:084b586e798779c324b5fb68b6d2e9a9e2cc397daba1bd9f78a34d584c51f445`;
- Kungfu KFX at commit `0b6e1491e92c950c1a8c71b3bb9373526f7d1571`,
  tree `cf9c3c7dd96f776403290c88969205f39f8b0a5c`, and primary content root
  `sha256:98881b2110239f54706b05da88d8a847442b82782a32805aaa6d65faa9b21808`.

Buildchain proves a renewable, non-preemptive generation and fence, exact
heartbeat continuation, visible expiry recovery, expected-old mutation, and
rooted idempotent terminal settlement. It does not supply a portable generic
issuer-holder-delegation-responsibility object, and its Warrant does not own
protected merge authority.

KFX proves that a purpose- and root-bound Warrant Fact is issued into the
current named Cut before materialization, that apply requires the exact
Warrant/Cut/revision, and that Work, consumed Warrant, Episode and Settlement
enter one successor Cut. It uses Cut/revision CAS rather than a portable
renewable lease and does not supply generic delegation or residual-
responsibility transfer.

## Result matrix

| Property | Buildchain | KFX | Combined |
| --- | --- | --- | --- |
| purpose | proved | proved | proved |
| exact target roots | proved | proved | proved |
| issuer-holder | missing | partial | partial |
| lease/generation/fencing | proved | partial | partial |
| continuation | proved | missing | partial |
| recovery | proved | partial | partial |
| revocation | partial | partial | partial |
| settlement | proved | proved | proved |
| delegation | missing | missing | missing |
| residual responsibility | missing | missing | missing |
| immutable history | proved | proved | proved |
| product privilege boundary | proved | proved | proved |

The machine-readable report retains a falsifier for every row. In particular,
stale holders, expired generations, stale fences, duplicate settlement, root
substitution, authority amplification and history rewriting must fail closed.

## Competing models

Capability or approval tokens, Assignment/task leases, expected-old
transactions, and event-log reconstruction remain live comparisons. Any of
them weakens the need for a distinct Warrant if it reproduces the same purpose,
authority, lifecycle, negative-vector and residual-responsibility observations
at lower total cost without hidden inference. Current evidence does not prove
that result.

## Status boundary

KFD-10 remains `draft`. This second wave is same-steward product pressure
evidence, not independent adoption, certification, activation, runtime
permission, release authority, legal authority, or product-system identity.
