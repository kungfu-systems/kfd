---
status: draft
period: 2026-08-05
theme: independent-verification
doc_type: technical-reference
source_level: repository
confidence: high
sensitivity: public
evidence_grade: A
review_state: self-reviewed
last_reviewed: 2026-08-05
---

# Independent verifier

KFD publishes offline verifier surfaces so a consumer can check an exact KFD
package without a Kungfu installation, Buildchain checkout, Atlas workspace,
private registry, or network connection.

For the experimental Warrant evidence profile:

```sh
node bin/kfd.mjs verify warrant-evidence \
  profiles/warrant-evidence/fixtures/buildchain-dev-delivery-warrant.json --json

node scripts/check-warrant-evidence.mjs
```

The first command verifies a Primitive Evidence Bundle against the packaged
registry. The second checks both retained bundles, all fixed KFD-10 vectors,
manifest digests, forbidden dependency boundaries, and a freshly packed npm
artifact in a temporary clean-room directory.

## What a pass proves

- the named JSON contract and exact public source coordinate are structurally
  valid and present in the packaged evidence registry;
- generic and product-profile claims remain separately evidence-graded;
- the bundle cannot set qualification, certification, or promotion authority;
- the fixed experimental KFD-10 vectors produce their registered outcomes;
- the package contains all required inputs and runs the verifier offline.

## What a pass does not prove

A pass does not activate KFD-10, certify a product, authenticate the upstream
repository, execute upstream code, establish legal authority, prove security
or production fitness, or show independent adoption beyond the packaged
clean-room harness.

The Rust/WASM verifier remains authoritative for its registered kinds. The
Warrant evidence verifier is a separate public JavaScript profile surface and
does not silently widen the Rust/WASM inventory.
