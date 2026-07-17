# KFD-2: Trust must start from facts

- Status: active
- Number: 2
- Kind: principle
- Applies to: every kungfu-systems product, repository, release surface, extension surface, and hosted surface that represents work, evidence, control, provenance, or trust

## One sentence

Trust must start from facts.

A product must not ask users or agents to trust an important claim before the
relevant facts and responsibility state are inspectable.

## Decision

KFD-2 is the generic trust principle for product, artifact, runtime, contract,
collaboration, and release claims. Capability, accuracy, calibration, scale,
reputation, and persuasive explanation may support a claim; none can replace
its fact boundary, residual risk, or responsibility state.

The default path is:

```text
captured work
  -> inspectable facts
  -> responsibility state
  -> proof-backed decision
  -> reviewable and exportable record
```

This path keeps trust bounded and revisable. Contradictory evidence can lower,
withdraw, or redirect trust without first defeating the authority of the
system that made the claim. The easiest reliable path should also be the path
that naturally leaves enough evidence for later review.

## Requirements

- Load-bearing claims bind to local, inspectable, and exportable facts wherever
  the product can reasonably capture them.
- UI, CLI, API, and agent surfaces lead participants to the fact source before
  asking them to rely on summaries or invisible state.
- Control actions such as continue, stop, retry, approve, hand off, archive,
  publish, or revoke derive from responsibility state plus proof.
- Extensions, skills, adapters, and plugins do not bypass the fact source or
  silently mutate canonical records.
- Release and provenance evidence make artifact trust reviewable rather than
  dependent on maintainer reputation alone.
- Cloud services may add convenience, but must not become the only place where
  operational truth exists.

## Trust assessment

A trust assessment starts from a claim and states:

- the subject and exact claim;
- bound facts and checked evidence;
- machine-verifiable and non-verifiable portions;
- residual risk and known gaps;
- source, verification, and decision owners;
- a result of pass, warning, fail, or unverifiable.

Release passports are one projection of this model. The same model assesses
contract worlds, APIs, ABIs, configs, collaboration interfaces, observer
perspectives, runtime facts, documentation, and other surfaces.

## Boundaries

KFD-2 does not require perfect capture, a journal engine, a runtime ledger, or
the rejection of cloud services. It does not declare every opaque system
wrong. It requires kungfu-systems products to make important reliance claims
inspectable and to expose what remains unproved.

## Relation to other KFDs

KFD-1 prevents the fact source beneath a claim from drifting. KFD-2 determines
how much trust those facts support. KFD-3 governs how trusted value is offered
to intelligent participants. Later KFDs may supply claims for KFD-2 assessment
but do not silently supersede it; explicit supersession must appear in both the
decision and registry.

## Verification

The `@kungfu-tech/kfd` package publishes KFD-2 trust-taxonomy, claim,
assessment, release-claim, and release-passport schemas. Unknown taxonomy
values fail validation rather than becoming private local extensions. Package
self-proof and the standard extension path are documented in
`docs/KFD-2-usage.md`.

## Adopters

Adopters cite KFD-2 whenever a surface asks a human or agent to rely on a claim,
decision, artifact, control state, or provenance record. Implementation
evidence remains adopter-owned.
