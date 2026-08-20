---
status: draft
period: 2026-08
theme: kfd-adopter-category-implementer-path
doc_type: implementer-guide
source_level: public-specifications
confidence: high
sensitivity: public
evidence_grade: B
review_state: self-reviewed
last_reviewed: 2026-08-20
---

# Implement the adopter category contracts from one package

This guide is for an implementer starting from one exact unpacked
`@kungfu-tech/kfd` package. It does not require a KFD source checkout, a
founding-product checkout, credentials, hosted services, mutable npm tags,
ambient Home state, or network access. Retain the package tarball and its
independently observed SHA-256 root before extracting it.

## Reproduce the complete contract surface

Read `profiles/adopter-conformance/toolchain.json` as the package inventory.
Implement the surfaces in this order:

1. reproduce the full-cut adopter manifest schema and fixed vectors;
2. validate the project-neutral category catalog and deterministic profile
   composition;
3. bind one category selection to one project instance and fresh,
   project-owned evidence;
4. reproduce the cross-project evidence matrix, including explicit pending
   rows, owned gaps, retained failure history, and terminal roots;
5. run the package-only CLI toolchain and the complete test matrix.

The machine-readable order, expected outputs, clean-room constraints, public
surface paths, and authority boundaries are fixed in
`profiles/adopter-conformance/test-matrix.json`.

## Run the clean-room entrypoint

From the unpacked package root, run:

```sh
npm run check:adopter-implementer-path
```

The entrypoint first packs the exact current package and extracts it to a
temporary directory. It then creates an empty Home and replays the component
checks from the extracted package with package-only recursion guards. The
entrypoint fails if a required package export, inventory member, guide
boundary, component command, or expected non-claim drifts.

The test removes only its own temporary directory. It does not read sibling
repositories, write the source tree, use a package cache as authority, or
contact a service. A passing run proves that the published package contains a
self-consistent reference path and its fixed negative cases. It does not prove
that a downstream adopter supplied real project evidence.

## Keep six authorities separate

- **KFD specification authority** owns the adopter contracts, category
  vocabulary, schemas, fixed vectors, reference verifiers, and compatibility
  rules.
- **Buildchain delivery authority** may transport exact evidence and enforce a
  protocol-neutral gate. It cannot reinterpret KFD semantics or certify an
  adopter.
- **Category composition authority** resolves only the declared, versioned
  category catalog. It transfers neither project evidence nor semantic
  authority.
- **Project authority** owns its source, artifact, release coordinates,
  category-instance declaration, evidence, and residual gaps.
- **Delivery and runtime authorities** separately decide whether an artifact
  may be released or a runtime may act. A KFD verification report grants
  neither permission.
- **Independent certification authority** must be explicitly external to the
  declaration and reference verifier. No package-only self-check mints it.

## Update without silently changing meaning

Compatible additions use new package paths and explicit inventory entries.
Changing a required field, evidence role, root algorithm, authority boundary,
category requirement, or diagnostic meaning requires a successor contract and
new fixed vectors. Keep the prior package and rooted reports immutable; create
new project instances or matrix rows for the successor cut instead of editing
old evidence in place.

When a category profile changes, publish a new profile version and require an
explicit selection update. When a project changes, bind the new source,
artifact, release, manifest, package, and selection roots. When a failure is
repaired, retain it in `failureHistory` and add current proof separately.

## Interpret the result narrowly

The implementer path reports only whether the package can reproduce its
declared contracts and fixed cases. Its expected authority outputs remain
`qualifying: false`, `releaseAuthorized: false`, `runtimeAuthorized: false`,
and `independentlyCertified: false`. Project closure requires exact,
project-owned evidence and an independently governed terminal decision.
