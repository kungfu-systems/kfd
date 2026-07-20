---
status: draft
period: 2026-07
theme: kfd-agent-runtime-conformance
doc_type: analysis
source_level: public-specifications
confidence: high
sensitivity: public
evidence_grade: B
review_state: self-reviewed
last_reviewed: 2026-07-20
---

# Agent Runtime Normative and Experimental Inventory

This inventory prevents the executable suite from silently minting normative
semantics.

## Authority matrix

| Suite surface | Authority | Partition | Allowed claim |
|---|---|---|---|
| Direction, perspective, authority, occurrence remain distinct | KFD-7 decision, formal model, usage, Domain Profile Declaration schema | Core | The adapter preserved the tested KFD-7 separations |
| Episode lifecycle is not Pursuit completion | KFD-7 plus the Fact-Episode ontology boundary | Core | Tested occurrence and completion were not fused |
| Fact production is not receiver admission | KFD-7 and Agent Hub alpha admission boundary | Core | Tested producer and receiver verdict responsibilities were not fused |
| Pursuit identity/version/fork/settle | provisional Pursuit candidate and live-case cuts | Experimental | The adapter matched this alpha experiment |
| Atlas Cut/derive/refresh/stale | provisional Atlas candidate and live-case evidence | Experimental | The adapter matched this alpha experiment |
| Warrant attenuation/delegation/revocation | provisional Warrant candidate plus Agent Hub alpha boundary | Experimental | The adapter matched this alpha experiment |
| Full four-root ActionBinding | KFD-7 geometry plus provisional work-object composition | Experimental except the Core separation subset | No normative full-object claim |
| crash/reopen/fsck/export/import/replay/retry | Agent Hub alpha recovery semantics and verifier practice | Experimental | The adapter matched the named finite vectors |

## Prohibited inferences

The suite must fail when an adapter makes any of these substitutions:

- a successful call becomes Fact admission;
- transport delivery becomes receiver admission;
- an Episode seal becomes Pursuit settlement;
- Fact admission alone becomes Pursuit settlement;
- capability or tool access becomes Warrant authority;
- delegation adds actions, scope, or time;
- ambient context becomes an Atlas Cut;
- a producer self-admits a remote Fact;
- last-write-wins hides conflicting roots;
- acknowledgement advances beyond the declared durability frontier;
- replay hides an index gap;
- one idempotency key names different exchange roots.

The fixed registry carries at least one negative vector for each inference.

## Claim ladder

| Evidence | Maximum claim |
|---|---|
| Deterministic vector generation and repository checker | Suite definition is internally consistent |
| One reference adapter passes | Adapter protocol is executable |
| Two structurally different reference adapters pass | The suite is not coupled to one evaluator structure |
| A product-owned adapter report passes | That exact adapter artifact matched that exact suite |
| Multiple independent product adopters pass | Implementation diversity evidence exists |
| KFD governance promotes a profile | Only the promoted scope gains normative status |

None of these rows creates certification, security assurance, market adoption,
or mathematical completeness by itself.

## Failure and evolution rules

- Unknown profile, suite version, vector root, result ID, status/code,
  partition, or required report field fails closed.
- The offline verifier never fetches a schema, suite, adapter, or report
  dependency over the network.
- Core and Experimental totals are verified separately. A Core pass cannot
  conceal an Experimental failure, and Experimental results cannot widen Core.
- A vector expectation may become stricter in a successor suite, never by
  rewriting published bytes under the same root.
- Counterexamples must name the exact vector/profile root and whether they
  challenge a normative KFD statement, an Experimental hypothesis, runner
  correctness, or report verification.
