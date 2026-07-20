---
status: draft
period: 2026-07-20
theme: kfd-agent-hub-state-machine
doc_type: protocol-reference
source_level: local-files
confidence: medium
sensitivity: public
evidence_grade: C
review_state: self-reviewed
last_reviewed: 2026-07-20
---

# Agent Hub Reference State Machine

The machine-readable transition table is
[`reference-state-machine.json`](reference-state-machine.json). It is a
reference algorithm for the alpha profile, not a requirement for one process,
queue, database, or API.

## Orthogonal state

An exchange keeps transport and semantic state separate:

```text
transport: created -> offered -> delivered
semantic:  unassessed -> assessing -> decided
verdict:   pending | admitted | rejected | conflicted
           | unavailable | intentionally-withheld
```

A transport may fail and retry without changing semantic state. A receiver may
assess already delivered bytes more than once, but the same immutable exchange
root and policy cut must return the same verdict root.

## Transition responsibilities

| From | Event | To | Required checks | Receipt |
| --- | --- | --- | --- | --- |
| `created/unassessed` | `seal-offer` | `offered/unassessed` | Profile root, payload digest, subject roots, Warrant closure. | Exchange root |
| `offered/unassessed` | `transport-deliver` | `delivered/unassessed` | Binding integrity only. | Transport receipt |
| `delivered/unassessed` | `begin-assessment` | `delivered/assessing` | Exact profile negotiation, identity mapping, causal inventory. | Assessment cut |
| `delivered/assessing` | `admit` | `delivered/decided` | Local authority, Warrant, facts, disclosure, conflicts, policy. | Admitted verdict root |
| `delivered/assessing` | `reject` | `delivered/decided` | At least one failure code and decision authority root. | Rejected verdict root |
| `delivered/assessing` | `retain-conflict` | `delivered/decided` | Competing roots preserved and visible. | Conflicted verdict root |
| `delivered/assessing` | `mark-unavailable` | `delivered/decided` | Missing material distinguished from false or empty. | Unavailable verdict root |
| `delivered/assessing` | `mark-withheld` | `delivered/decided` | Policy basis or commitment identifies deliberate withholding. | Withheld verdict root |

## Retry and idempotency

The receiver indexes:

```text
(source hub, idempotency key) -> canonical exchange root
```

- Same key and same root returns the prior receipt/verdict without reapplying
  side effects.
- Same key and different root returns `idempotency-conflict`.
- Same payload under a new key is a new proposal and may receive a different
  verdict only when the decision authority or policy cut differs and remains
  explicit.

## Conflict and supersession

Conflict is a first-class verdict. It retains all competing roots and the
authority/policy cut that found them. Resolution creates a new `supersession`
exchange that references the conflict and every root it resolves. It does not
delete or rewrite the original exchanges.

## Warrant transition

A child Warrant may be admitted only when:

```text
child subject subset      of parent subject
child actions subset      of parent allowed actions
child forbidden actions   superset of parent forbidden actions
child consequence limit   no broader than parent
child validity interval   within parent interval
child disclosure scope    no broader than parent
child delegation depth    below parent limit
```

If the receiver cannot prove every applicable relation, it rejects with
`authority-amplification`. Expiry or revocation changes future assessment; it
does not rewrite an Episode that already occurred.

## Completion assessment

A completion claim is assessed independently from delivery, Episode sealing,
Fact admission, and technical success. A conforming assessment records:

- the exact Pursuit and acceptance revision;
- evidence and Episode roots;
- the Atlas/fact cut used for judgment;
- the decision Warrant or other recognized completion authority;
- one result: `unassessed`, `incomplete`, `complete`, `rejected`, or
  `conflicted`;
- known gaps and residual risk.

Only the receiving completion authority may produce the receiver's completion
verdict.

## Recovery algorithm

After restart or reconnect:

1. verify the local append-only exchange/root index;
2. reload prior receipts and verdicts;
3. renegotiate the exact profile and required features;
4. compare root inventories and request only missing records;
5. resume `assessing` records from their last durable assessment cut;
6. re-evaluate current revocation knowledge without rewriting historical
   action-time evidence;
7. emit successor conflict, rejection, or supersession records when knowledge
   changed.

Recovery is complete when every received exchange is either still explicitly
pending or has one durable receiver verdict root.
