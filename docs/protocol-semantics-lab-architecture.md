---
status: draft
period: 2026-08-23
theme: protocol-semantics-lab
doc_type: decision-record
source_level: local-files
confidence: high
sensitivity: public
evidence_grade: A
review_state: unreviewed
last_reviewed: 2026-08-23
---

# ADR: additive Protocol Semantics Lab contracts

## Status

Proposed for the unnumbered experimental Profile. This record does not allocate
a KFD number or change a numbered KFD.

## Context

The alpha.68 Delegated Work challenge already provides a fixed, falsifiable
six-pair kernel. Cross-protocol experiments need reproducible source inputs,
normalized observations, explicit loss accounting, and capability provenance.
Putting protocol-specific fields directly into the paired worlds would create a
second semantic kernel and make prior reports ambiguous.

## Decision

Keep the alpha.68 paired worlds unchanged. Add five strict version 1 contracts:

1. Protocol Evidence Pack and its exact registry;
2. normalized Protocol Observation;
3. Cross-Protocol Route with explicit loss declarations;
4. Derived Capability Manifest with `declared`, `observed`, and `verified`
   evidence states;
5. a generated contract reference binding schema bytes, registry root, package
   exports, kernel coordinates, and the experimental claim boundary.

The contracts use `sha256-kfd-canonical-json-v1` semantic roots where a JSON
document is bound and `sha256-bytes-v1` digests for schema artifacts. Validators
reject unknown fields and sort diagnostics by UTF-8 bytes. Source coordinates
must be immutable; later drift creates a successor pack or contract version.

## Invariants and falsifiers

The change is invalid if any of these observations is true:

- the delegated-work suite ID or six-pair count changes;
- default projection behavior stops collapsing six pairs;
- full-semantic behavior stops distinguishing six pairs;
- an old command, suite ID, projection ID, report contract, or package path is
  removed or reinterpreted;
- a represented value lacks evidence, or another representation state silently
  carries a value;
- a verified capability lacks declaration, observation, or verification roots;
- a duplicate protocol ID, hidden `inferred` field, `latest` coordinate,
  unsupported schema version, unknown field, or claim widening validates;
- regenerating the contract reference changes bytes without a source change.

## Consequences

Protocol-specific packs, live adapters, cross-protocol execution, report CLI,
and public release remain separate deliveries. This architecture adds no
service, database, external runtime dependency, vendor leaderboard,
certification authority, or second site. The empty production registry makes
that sequencing explicit while fixed fixtures keep the contracts independently
testable offline.

## Evidence boundary

Repository schemas, validators, fixtures, generated roots, and regressions are
direct evidence for structural closure and alpha.68 compatibility. Statements
about vendor behavior, enforcement, adoption, policy correctness, or commercial
demand remain outside the evidence supplied by this decision.
