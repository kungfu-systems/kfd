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

# Implement and verify KFD independently

KFD is published as an implementable protocol package, not only as rendered
prose. A consumer can start from one immutable `@kungfu-tech/kfd` release and
inspect the numbered decisions, schemas, fixtures, failing cases, fixed vectors,
and offline verifiers without installing Kungfu, checking out Buildchain,
opening an Atlas workspace, reaching a private registry, or using the network.

## Start from a fixed package cut

Pin one immutable package version and retain its npm integrity and source
coordinate. The consuming site publishes those exact release coordinates in
its `/manifest.json`; inside the package, `kfd.release.json` declares the
anchored package cut, while the public Buildchain release Passport binds the
published artifact. Do not infer conformance from the mutable `latest` alias or
from a rendered page alone.

The machine-readable
[`KFD-1 through KFD-13 semantic self-sufficiency matrix`](../evidence/semantic-self-sufficiency/kfd-1-13.json)
is the implementation map. For every numbered decision it names the normative
source, available schemas, fixtures, failure tests, offline verifiers, current
coverage, and explicit gaps. Empty fields and `partial` or `gap` coverage are
work still owed; they are not silently filled by Kungfu product behavior.

An independent implementation can therefore proceed decision by decision:

1. read the numbered decision as authority;
2. implement the declared schemas and invariants without importing product
   internals;
3. run the packaged positive, negative, and fixed-vector evidence where it
   exists;
4. preserve the matrix's stated gaps and lifecycle status in its own claim;
5. publish an adopter witness without asking the KFD package to self-certify it.

## Run the package-only verifier

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

The packaged
[`Warrant Evidence manifest`](../profiles/warrant-evidence/manifest.json)
fixes 14 positive and negative vectors, declares zero runtime dependencies, and
forbids product checkouts, private sources, and network access. The
[`first-wave report`](../evidence/primitive-evidence/first-wave-report.json)
separates proved, partial, missing, and invalidated outcomes so an implementer
can reproduce the current evidence without inheriting its conclusions.

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

KFD-10 remains `draft`. The current Warrant report remains `partial`, with
`qualifying: false` and `selfCertified: false`. The package demonstrates a
bounded independent verification method; only separately accountable adopter
evidence can demonstrate an independent implementation.

The Rust/WASM verifier remains authoritative for its registered kinds. The
Warrant evidence verifier is a separate public JavaScript profile surface and
does not silently widen the Rust/WASM inventory.
