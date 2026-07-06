# KFD-2 Release Trust Metadata

KFD-2 says that trust must start from inspectable facts and responsibility
state. For releases, that means a product must not ask users or agents to trust
release claims only because they appear in prose, changelogs, or repository
history.

This package defines two KFD-owned machine interfaces:

- `schemas/kfd-2/release-claims.schema.json`: the product's declared public
  release claims.
- `schemas/kfd-2/release-trust-passport.schema.json`: the verifier's result
  after auditing those claims against evidence.

The intended Buildchain flow is:

```text
release claims -> evidence audit -> release trust passport -> release passport
```

Each claim should declare the statement being made, the source of the claim,
machine-readable evidence, the audit boundary, residual risk, and responsibility
state. The trust passport should then record whether each claim is bound to
evidence, which evidence was checked, what the result was, and who owns the
release decision.

## Interface Versioning

KFD package semver is only the distribution version. It is not the version of a
KFD-owned machine interface.

Every KFD-owned machine interface uses:

- `schemaVersion`: the interface version consumed by tools.
- `contract`: the stable contract name, such as `kfd-2-release-claims`.
- `$id`: the canonical schema URL for the current stable interface.

Compatible additions may keep `schemaVersion: 1`. A change that alters required
fields, field semantics, verification meaning, audit boundary semantics, or
responsibility semantics must not silently reuse the same interface contract.
It must introduce a new interface version or, when the standard itself changes,
a new KFD decision or amendment path.

The same rule applies to KFD-1 and KFD-3 schemas. Their current schemas already
carry `schemaVersion: 1` and a `contract` value; this document makes the
evolution rule explicit across the KFD package.
