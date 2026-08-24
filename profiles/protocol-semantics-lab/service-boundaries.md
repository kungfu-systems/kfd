---
status: active
period: ongoing
theme: protocol-semantics-lab-service-boundaries
doc_type: product-boundary
source_level: local-files
confidence: high
sensitivity: public
evidence_grade: A
review_state: self-reviewed
last_reviewed: 2026-08-24
---

# Public evidence and professional service boundaries

The Protocol Semantics Lab is a public, offline evidence surface. Its protocol
packs, fixtures, report generator, routes, verifier, examples, schemas, and
Discussion 427 entry remain available without a commercial engagement.

## Public and free

- install the published npm package and inspect every packaged Protocol
  Evidence Pack;
- generate the fixed MCP, A2A, Zed ACP, AG-UI, and cross-protocol reports;
- verify a report and derive its capability manifest offline;
- use the design-review schemas and templates;
- reproduce the checked-in examples from packaged inputs; and
- discuss reports or counterexamples in [Discussion 427](https://github.com/kungfu-systems/kfd/discussions/427).

These surfaces test bounded information preservation. They do not certify a
product, observe a deployment, grant authority, promise interoperability, or
establish commercial demand.

## Future professional work

A separately agreed professional engagement may cover protocol design review,
a customer-owned private adapter, or a CI compatibility assessment. Such work
may interpret customer-provided evidence and produce the same public report and
deliverable contracts, but it does not change the Lab's semantics or create a
private standard.

| Service shape | Possible input | Required output boundary |
| --- | --- | --- |
| Protocol design review | Completed intake plus exact, customer-authorized artifacts | Rooted deliverable using the packaged review schema, with losses and residual risks explicit |
| Private adapter work | Customer-owned mapping code and fixed traces | Customer-owned adapter plus reproducible local reports; no adapter code is published by default |
| CI compatibility assessment | Existing CI definition and immutable package/report coordinates | A bounded pass/fail evidence-closure gate and an explicit statement of what was not observed |

No hosted analysis service, continuous monitoring, SLA, pricing, certification,
or production-enforcement promise is made here. Any future engagement requires
its own scope, authority, security handling, data-retention terms, and commercial
agreement. The public verifier remains the shared evidence boundary.

## Private adapter data boundary

A private adapter runs in the customer's environment, over customer-selected
fixed inputs. It should use local files or bounded stdio, retain exact artifact
roots, emit no secrets in reports, and require no KFD-hosted endpoint. The
customer owns the mapping and must decide whether its assertions correspond to
production reality. KFD verification can prove report closure; it cannot prove
that a private adapter is honest or complete.
