# KFD-2 Release Trust Metadata

KFD-2 says that trust must start from inspectable facts and responsibility
state. For releases, that means a product must not ask users or agents to trust
release claims only because they appear in prose, changelogs, or repository
history.

This package defines two KFD-owned machine interfaces:

- `schemas/kfd-2/trust-taxonomy.schema.json`: the KFD-owned taxonomy for
  residual-risk types, trust impact, machine provability, agent actions, and
  downgrade reasons.
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

## Trust Taxonomy

KFD-2 owns the vocabulary for residual risks and trust downgrades. A product,
release tool, or agent must not invent new residual-risk values locally and
still claim KFD-2 conformance. Unknown values fail schema validation.

The current taxonomy is published in
`schemas/kfd-2/trust-taxonomy.schema.json`. It defines:

- `riskType`: what kind of trust gap remains;
- `trustImpact`: whether the gap is informational, downgraded, failing, or
  unverifiable;
- `machineProvability`: whether the gap can be fully proved by machine;
- `agentAction`: what an agent should do next;
- `downgradeReason`: how a verifier maps residual risk into a release trust
  result.

If an agent needs a KFD-2 value that is not present, the standard extension
path is to open an issue in the KFD repository:

```text
https://github.com/kungfu-systems/kfd/issues/new?title=KFD-2%20trust%20taxonomy%20extension%20request
```

The issue should state the missing value, the field it belongs to, the product
or release scenario that needs it, and why existing values cannot express the
case. Until KFD accepts the new value into the taxonomy schema, consumers
should treat the value as invalid rather than as a soft warning.

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
