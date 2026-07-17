# KFD-2 Trust Assessment Metadata

[Authoritative decision](../decisions/KFD-2.md) ·
[Documentation map](MAP.md)

KFD-2 says that trust must start from inspectable facts and responsibility
state. A product must not ask users or agents to trust load-bearing claims only
because they appear in prose, changelogs, repository history, generated UI, or
maintainer reputation.

This package defines KFD-owned machine interfaces for the generic trust model:

- `schemas/kfd-2/trust-taxonomy.schema.json`: the KFD-owned taxonomy for
  residual-risk types, trust impact, machine provability, agent actions, and
  downgrade reasons.
- `schemas/kfd-2/trust-claims.schema.json`: the generic claim input shape for
  KFD-2 assessment. Claims may target KFD standards, contract worlds,
  collaboration interfaces, observer perspectives, releases, config, APIs,
  ABIs, runtime facts, documentation, or other product surfaces.
- `schemas/kfd-2/trust-assessment.schema.json`: the generic assessment output
  shape that records result, checked facts, evidence, audit boundary,
  responsibility, residual risk, and downgrade reasons.
- `schemas/kfd-2/release-claims.schema.json`: the product's declared public
  release claims, as a release-specific projection.
- `schemas/kfd-2/release-trust-passport.schema.json`: the verifier's result
  after auditing release claims against evidence.

The generic flow is:

```text
trust claims -> evidence audit -> trust assessment -> product or release gate
```

The intended Buildchain flow is:

```text
release claims -> evidence audit -> release trust passport -> release passport
```

Release trust passports are one projection of KFD-2, not the whole KFD-2 model.
Each claim should declare the statement being made, the subject of the claim,
the facts it binds to, machine-readable evidence, the audit boundary, residual
risk, and responsibility state. A trust assessment or release trust passport
then records whether each claim is bound to evidence, which evidence was
checked, what the result was, and who owns the decision.

## Generic Trust Claims

The generic claim model exists so KFD-2 can assess KFD-1, KFD-3, KFD-4, and
future KFDs through one structure instead of inventing a new evaluator for each
standard.

A generic claim identifies:

- `subject`: what the claim is about, such as `contract-world`,
  `collaboration-interface`, `observer-perspective`, `release`, `config`,
  `api`, `abi`, `gui-surface`, or `runtime-fact`;
- `facts`: the inspectable fact sources the claim binds to;
- `evidence`: the files, schemas, witnesses, commands, artifacts, URLs, or
  manual-review records used to evaluate the claim;
- `auditBoundary`: what the assessment covers and whether the surface is
  closed-world, declared-open, sampled, or manual;
- `responsibility`: who owns source facts, verification, and the decision;
- `residualRisk`: KFD-2 taxonomy values for what remains unproved.

The KFD package dogfoods this through:

```text
.buildchain/kfd-2/kfd-foundation.trust-claims.json
.buildchain/kfd-2/kfd-foundation.trust-assessment.json
```

Those files assess KFD-1's contract-world claim, KFD-3's
collaboration-interface claim, and KFD-4's observer-perspective claim. KFD-3
currently receives a warning result because its machine-checkable interface
still carries natural-language semantic residual risk.

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
