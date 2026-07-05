# KFD-2: Fact-first product accountability — responsibility should be the path of least resistance

- Status: active
- Number: 2
- Kind: principle
- Applies to: every kungfu-systems product, repository, release surface, extension surface, and hosted surface that represents work, evidence, control, provenance, or trust

## One sentence

Kungfu-systems products should make fact-first responsibility the path of least
resistance: users and agents should move from captured work, to local facts, to
responsibility state, to proof-backed control decisions, to reviewable and
exportable records because that is the simplest reliable path the product
offers.

## Decision type

KFDs can be principles or procedures:

- A **principle** states what must remain true across kungfu-systems even as
  products, repositories, and release lines change.
- A **procedure** states how a class of work enforces or protects a principle.

This KFD is a principle. KFD-1 is a procedure that protects release and
version responsibility under this principle.

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

KFD-1 is a procedure. It makes release and version responsibility legible when
contract worlds change. KFD-2 is the higher-level principle: versioning,
release evidence, fact ledgers, agent control panes, extension gates, and
hosted services should all preserve the path from fact source to responsibility
state to proof-backed decision.

KFD-2 does not supersede KFD-1. KFD-1 remains active and is one concrete
procedure that implements KFD-2 for version and release responsibility.

## Supersession rule

Newer KFD numbers do not automatically override older KFDs. A later KFD only
supersedes or overrides an earlier KFD when it states that relationship
explicitly and the registry records the affected decision. Two active KFDs that
conflict without an explicit supersession relationship are a registry defect,
not an invitation to pick the newer text silently.

## Adopters

Each adopting repository cites this KFD when designing or changing a fact
source, responsibility state, user or agent control surface, extension trust
gate, release provenance mechanism, distribution channel, hosted service, or
other surface that asks users to rely on kungfu-systems. Adopters should keep
local implementation detail in repository documents and reference this KFD
rather than restating it.
