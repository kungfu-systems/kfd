# KFD-2: Trust must start from facts — responsibility must be inspectable

- Status: active
- Number: 2
- Kind: principle
- Applies to: every kungfu-systems product, repository, release surface, extension surface, and hosted surface that represents work, evidence, control, provenance, or trust

## One sentence

Trust must start from facts.

A product must not ask users or agents to trust important claims before the
relevant facts are inspectable, local where possible, and connected to
responsibility state.

## Decision type

KFDs can be principles or procedures:

- A **principle** states what must remain true across kungfu-systems even as
  products, repositories, and release lines change.
- A **procedure** states how a class of work enforces or protects a principle.

This KFD is a principle. KFD-1 is the procedure that keeps the fact sources
under this principle from drifting. KFD-3 is the principle that governs how
humans and agents cooperate once facts and trust are visible. KFD-4 is a
procedure whose observer-perspective claims can also be assessed under this
principle.

## Foundation role

Within the KFD-1/2/3 foundation, this is the truth path:

```text
trust must start from facts
```

KFD-2 says Kungfu products should not ask users or agents to trust a claim
before the product has made the relevant facts inspectable. KFD-1 protects the
non-drifting fact source those claims stand on. KFD-3 protects the relationship
with the human or agent who must understand and act on those facts.

KFD-2 is not a checker for only one other KFD. It is the generic trust
adjudication layer for any KFD claim, product claim, artifact claim, control
surface claim, or release claim that asks a human or agent to rely on it.

## Principle

When a kungfu-systems product represents work or control, its default path
should lead the user and the agent through this chain:

```text
captured work
  -> local facts
  -> responsibility state
  -> proof-backed control decision
  -> reviewable/exportable record
```

The product should not ask users to trust a claim before showing the facts that
make the claim inspectable. It should not hide responsibility behind opaque
automation. The easiest reliable use of the product should also be the use that
leaves enough evidence for later review.

## What it requires

- Load-bearing product claims should be backed by local, inspectable, and
  exportable facts wherever the product can reasonably capture them.
- UI, CLI, API, and agent-facing surfaces should lead users to the fact source
  before relying on trust claims, summaries, or invisible state.
- Control actions such as continue, stop, retry, approve, hand off, archive,
  publish, and revoke should be derived from responsibility state plus proof.
- Extension, skill, adapter, and plugin mechanisms must not bypass the fact
  source or silently mutate canonical records.
- Release, provenance, build, and distribution evidence should turn artifact
  trust into reviewable records rather than maintainer reputation alone.
- Hosted or cloud convenience may add synchronization, storage, compute, and
  collaboration, but it must not become the only place where the truth exists.

## Generic trust assessment model

Every KFD-2 trust assessment starts from a claim. The claim may be about a
release, but it may also be about a contract world, a collaboration interface,
an observer perspective, a config surface, an API, an ABI, a GUI surface, a
runtime fact, documentation, or another product surface.

A claim is trustable only when the assessment can state:

- what the claim is about;
- which facts the claim binds to;
- which evidence was checked;
- what can be machine verified;
- what remains a residual risk;
- who owns source facts, verification, and the trust decision;
- whether the result is pass, warning, fail, or unverifiable.

This model is intentionally general. KFD-1, KFD-3, KFD-4, and future KFDs can
provide claims that KFD-2 assesses. Release trust passports are one projection
of this model, not the model itself.

## What it does not require

- It does not require every product to be a journal engine or runtime ledger.
- It does not claim every fact can be captured perfectly or losslessly.
- It does not reject cloud services; it rejects making cloud opacity the only
  source of operational truth.
- It does not turn a private founder narrative into a public repository rule.
  This public rule is about product accountability, evidence, and adoption.
- It does not say every opaque system is wrong; it says kungfu-systems products
  should compete by making important claims inspectable.

## Relation to KFD-1

KFD-1 is a procedure. It defines what can count as a load-bearing fact source:
facts must not drift from the contract world that declares them. KFD-2 is the
next layer: once facts are non-drifting and inspectable, trust claims must be
bound to those facts and to responsibility state.

KFD-2 does not supersede KFD-1. KFD-1 remains active and is one concrete
procedure that implements KFD-2 wherever trust depends on contract worlds,
release evidence, fact ledgers, agent control panes, extension gates, hosted
surfaces, schemas, configs, or package metadata.

## Supersession rule

Newer KFD numbers do not automatically override older KFDs. A later KFD only
supersedes or overrides an earlier KFD when it states that relationship
explicitly and the registry records the affected decision. Two active KFDs that
conflict without an explicit supersession relationship are a registry defect,
not an invitation to pick the newer text silently.

## Implementation case: the KFD package

The `@kungfu-tech/kfd` npm package is a self-proof case for this principle.
It does not ask humans or agents to trust the KFD registry only because the
README says so. It publishes inspectable facts: decision documents,
`registry.json`, `standards.json`, JSON schemas, document hashes, release-impact
metadata, and conformance checks.

KFD-2 also owns the trust taxonomy used by release claims, release trust
passports, KFD-3 witnesses, and generic trust assessments. Unknown
residual-risk or trust-downgrade values fail validation until KFD records them
in `schemas/kfd-2/trust-taxonomy.schema.json`. When an agent needs a new value,
the declared extension path is to open an issue in
`https://github.com/kungfu-systems/kfd` rather than inventing a private value.

The package dogfoods this model through
`.buildchain/kfd-2/kfd-foundation.trust-claims.json` and
`.buildchain/kfd-2/kfd-foundation.trust-assessment.json`. Those files assess
KFD-1's contract-world claim, KFD-3's collaboration-interface claim, and KFD-4's
observer-perspective claim through the same KFD-2 structure.

## Adopters

Each adopting repository cites this KFD when designing or changing a fact
source, responsibility state, user or agent control surface, extension trust
gate, release provenance mechanism, distribution channel, hosted service, or
other surface that asks users to rely on kungfu-systems. Adopters should keep
local implementation detail in repository documents and reference this KFD
rather than restating it.
