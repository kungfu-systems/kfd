# KFD — Kung Fu Decisions

KFD is the organization-wide decision registry of kungfu-systems: the small
set of standing, cross-repository norms that products and their consumers
weld to. Each decision has an immutable number (`KFD-N`), a kind, a status,
and a single authoritative text in this repository.

Stable rendered site: `https://kfd.libkungfu.dev`.

KFDs can be **principles** or **procedures**. Principles state what must remain
true across kungfu-systems; procedures state how a class of work enforces or
protects a principle.

## Foundation triad

The first three KFDs form the public foundation for kungfu-systems:

```text
KFD-1: facts must not drift.
KFD-2: trust must start from facts.
KFD-3: cooperation must start from trusted value.
```

Together they define the load-bearing path for Kungfu products: make facts
non-drifting, make trust inspectable from those facts, and let humans and
agents cooperate through trusted value rather than hidden pressure.

## Foundation model

The triad is intentionally ordered. It is a compact model for surviving and
evolving in complex systems, especially in a world where agents can observe,
act, delegate, and remember across many surfaces.

| Layer | Decision | Reader question | Commitment |
|---|---|---|---|
| Fact-source ontology | KFD-1 | What can count as a fact? | Facts must not drift: a load-bearing contract world comes from one declared fact source. |
| Participant-to-object trust | KFD-2 | When can a user or agent trust a claim, product, artifact, or control surface? | Trust starts from inspectable facts and responsibility state. |
| Participant-to-participant cooperation | KFD-3 | How should peer intelligent participants cooperate? | Cooperation starts from trusted value: value becomes trustable through transparent facts, stable choice, and explainable constraints. |

In short:

```text
non-drifting facts -> inspectable trust -> trusted value -> voluntary cooperation
```

This is why KFDs are not only internal governance text. KFD-1 gives the
foundation model its first layer by making fact sources operational: a
fact-bearing contract world must be declared, inspectable, and unable to drift
invisibly. KFD-2 then defines how trust can stand on those facts. KFD-3
defines how humans and agents can cooperate once facts and trust are visible.

Real-world agent work turns ordinary work into a dense system of products,
files, repositories, traces, policies, humans, and agents. In that world,
complexity cannot be made safe by hidden state or forced compliance. It has to
be compressed through non-drifting facts, inspectable trust, and voluntary
cooperation. The goal is not to force increasingly capable participants into
compliance through stronger pressure. It is to give humans and agents a shared
worldview for adapting to a more complex world.

This also changes what a product interface means. Agent-facing CLI, API,
documentation, envelopes, and local fact surfaces are not secondary integration
channels after the human GUI. They are first-class interfaces for intelligent
participants that may use the system more frequently than humans do. A control
plane in this model is a shared work environment for humans and agents, not
only a human dashboard over agent activity.

This model used to be expensive to practice. Stable facts require engineering,
iteration, and disciplined evidence paths, so older systems often survived by
leaning on cheaper substitutes such as authority, habit, reputation, or
intuition. Agents change both sides of that equation: they make the world more
complex, and they also provide more intelligence for building fact-bearing
systems. KFD is part of that bootstrap: the worldview is forged through the same
transparent and inspectable mechanisms it asks products to provide.

This README states the architecture; KFD-1, KFD-2, and KFD-3 provide the
foundation rules.

## Practice guidelines

KFDs after the foundation triad may define practice guidelines: procedures
that apply the foundation to a specific class of real-world product behavior.
They do not expand the foundation triad; they show how the foundation behaves
when a product must make a concrete kind of reality legible.

| Layer | Decision | Reader question | Commitment |
|---|---|---|---|
| Perspective-bearing views | KFD-4 | How should a product show time, history, replay, sync, or mixed-source work state? | Timelines must declare their observer: a useful view states who is observing, which facts were accepted, and how concurrent facts were projected. |
| Primitive discovery | KFD-5 | How can humans and agents discover a new load-bearing object from real work? | Primitive discovery must join grounded judgment with scalable reasoning: reality pressure, alternatives, falsifiers, and responsibility stay inspectable. |
| Autonomous discovery | KFD-6 | How may an agent discover primitives from accumulated experience without replacing reality with its own narrative? | Autonomous discovery must remain grounded in causal experience, preserve corpus boundaries, and never certify itself. |

KFD-4 is the first such guideline. It applies KFD-1/2/3 to the problem of
perspective and timeline order. In a multi-machine or multi-agent world, a
product should not pretend to own a universal global clock. It should preserve
non-drifting facts, make trust start from those facts, and let participants
cooperate by exposing the observer, accepted ranges, causal constraints, and
projection policy behind the view. KFD-4 gates perspective-bearing views; it
does not claim that importing the KFD-4 schema proves an adopter's concrete
timeline implementation is complete or correct.

KFD-5 applies the same foundation to primitive discovery. Its current form
joins human contact with reality and value judgment to agent-scale search,
formalization, and falsification. KFD-6 is the draft next step: an agent may
eventually derive primitive candidates from a large causal Episode corpus, but
the loop must expose its observer and evidence cut, use independent evaluation,
and keep discovery separate from promotion authority.

## Adoption boundary

KFD is an engineering discipline, not a belief test.
KFD governs systems before it judges people.
No one should be pressured to adopt KFD in the name of KFD.
Disagreement is a valid cooperation state.

A constraint can be strict and still KFD-compatible when it is fact-bound,
explainable, auditable, and proportionate.

## Homepage content contract

This README is also the homepage text source for `https://kfd.libkungfu.dev`.
When `site-libkungfu-dev` consumes the `@kungfu-tech/kfd` npm package to render
the KFD site, it should treat this file as the canonical homepage copy, not as
an implementation note to paraphrase in the site repository.

The first screen should be derived from this README:

- Page identity: the top-level heading.
- Lead: the opening paragraph that defines KFD as the organization-wide
  decision registry.
- Foundation signal: the `Foundation triad` section, especially the three
  one-line commitments.
- First-screen explanation: the beginning of `Foundation model`, ending at the
  `non-drifting facts -> inspectable trust -> trusted value -> voluntary
  cooperation` chain.
- Practice signal: the `Practice guidelines` section, starting with KFD-4 and
  extending sequentially through later practice procedures.

Decision cards, detail links, and machine paths should come from
`registry.json`. The machine-readable site bundle lives at `site/kfd-site.json`
and gives renderers stable fields for the homepage, foundation model, product
proof path, decision routes, and rendering boundary. A site renderer may adapt
layout, navigation, typography, and visual assets, but it should not maintain
separate homepage wording that can drift from this package.

`site/kfd-site.json` is generated from this README by
`scripts/update-site-bundle.mjs`. The generated bundle exposes both compatible
top-level homepage fields and ordered `homepage.sections` entries. The
`homepage.displayPlan` tells renderers which sections belong in the first
screen, primary narrative, and support area. Site repositories should consume
that bundle instead of parsing this README themselves. The renderer contract is
exposed as machine/implementation metadata, not as ordinary homepage content.

## Product proof path

KFDs are not a detached manifesto, but they are not a demand that readers adopt
a Kungfu product before understanding the decisions. A philosophy becomes
load-bearing only when it can be seen in a concrete case. The first concrete
case is this package itself: `standards.json`, `schemas/`, `docs/`,
`site/kfd-site.json`, and `scripts/check.mjs` show how KFD-1, KFD-2, KFD-3,
KFD-4, KFD-5, and KFD-6 are expressed as consumable interfaces for both humans
and agents.
For the broader product case, use the main Kungfu product entrypoint
(`https://kungfu.tech`) for product philosophy, and Buildchain
(`https://buildchain.libkungfu.dev`) for release and provenance
accountability. This registry states the commitments; this package and those
entrypoints show how the commitments are meant to be borne in practice.

Rendered index: `https://kfd.libkungfu.dev` (stable machine path per entry,
e.g. `https://kfd.libkungfu.dev/1`). This repository publishes
`@kungfu-tech/kfd` — the decision texts plus a machine-readable
`registry.json` — which the site consumes as its single fact source.

Machine consumers that need KFD-owned standard identity should read
`standards.json`. It is the versioned metadata surface for stable standard
keys, document routes and SHA-256 digests, schema IDs, KFD-owned concept names,
and machine-interface contract versions. In Node or TypeScript projects, import
it as:

```js
import standards from "@kungfu-tech/kfd/standards.json" with { type: "json" };
```

## Agent Quickstart

Agents consuming this package should start from the same sources as humans:

1. Read this README for the foundation model and package map.
2. Read `standards.json` for canonical KFD numbers, schema IDs, concept names,
   and interface contracts.
3. Use `site/kfd-site.json` decision metadata or the KFD-3 collaboration
   interface fact-source metadata to identify the public KFD fact source.
4. Use `schemas/kfd-2/trust-taxonomy.schema.json` for KFD-2 residual-risk and
   trust-downgrade values. Unknown taxonomy values are invalid.
5. Use `schemas/kfd-2/trust-claims.schema.json` and
   `schemas/kfd-2/trust-assessment.schema.json` when a claim needs generic
   KFD-2 assessment instead of a release-specific passport.
6. Use `schemas/kfd-3/collaboration-interface.schema.json` and
   `schemas/kfd-3/witness.schema.json` to inspect collaboration interfaces.
7. Use `schemas/kfd-1/publication-url-semantics.schema.json` when a package,
   paper, specification, or site bundle must distinguish stable reader URLs,
   latest aliases, and immutable versioned artifacts.
8. If a needed KFD-2 taxonomy value is missing, open a KFD GitHub issue rather
   than inventing a local value:
   `https://github.com/kungfu-systems/kfd/issues/new?title=KFD-2%20trust%20taxonomy%20extension%20request`.
9. Use `schemas/kfd-5/primitive-discovery.schema.json` to record a grounded
   primitive candidate, including the optional boundary-pressure diagnostic
   when implicit coordination is under new pressure. Use
   `schemas/kfd-6/autonomous-discovery-loop.schema.json` only for explicitly
   draft or experimental autonomous-discovery work; its version 2 interface
   requires a boundary hypothesis.

KFD package semver is only the distribution version. KFD-owned machine
interfaces carry their own `schemaVersion` and `contract` fields. Compatible
additions may keep the same interface version; semantic changes, required-field
changes, verification meaning changes, or responsibility-boundary changes must
use a new interface version or contract.

KFD-2 publishes trust-taxonomy, trust-claims, trust-assessment,
release-claims, and release-trust-passport schemas under `schemas/kfd-2/`.
The generic schemas let humans, agents, Buildchain, and other systems assess
whether claims about KFD-1, KFD-3, KFD-4, future KFDs, or product surfaces are
bound to source facts, evidence, hashes, audit boundaries, residual risk, and
responsibility state. The release schemas are a release-specific projection of
that model. See [`docs/KFD-2-usage.md`](docs/KFD-2-usage.md).

KFD-3 also publishes a general collaboration-interface schema and witness
schema under `schemas/kfd-3/`. These schemas are for participant-facing product
interfaces, not only agent APIs. A product such as Kungfu may implement an
agent-first profile, but that profile remains a product-specific realization of
KFD-3. The KFD-owned boundary is the standard vocabulary, schema IDs, and
closed-world evidence shape. See
[`docs/KFD-3-usage.md`](docs/KFD-3-usage.md).

KFD-4 publishes an observer-perspective schema under `schemas/kfd-4/`. It gives
humans and agents a standard vocabulary for observer, accepted facts,
projection policy, causal constraints, degraded evidence, and verification
state when a product shows a perspective-bearing timeline. The package-level
claim proves the KFD-owned interface surface; adopter runtime correctness
requires adopter-owned KFD-2 evidence.

KFD-5 publishes a primitive-discovery record schema under `schemas/kfd-5/`.
It binds candidate identity, grounded pressure, participant functions,
alternatives, contract boundaries, falsifiers, dogfood evidence, and outcome.
Its optional boundary-pressure diagnostic records contact sides, prior implicit
handling, pressure changes, recurring failures, the mediation claim, and a
narrower internal-object alternative. Validation proves record closure, not
that the candidate is a real primitive.

KFD-6 publishes a draft autonomous-discovery-loop schema under
`schemas/kfd-6/`. Its version 2 experiment interface requires
causal-experience boundaries, a tested boundary hypothesis, held-out and
independent evaluation, bounded autonomy, and explicit separation between
discovery and promotion. Its package presence is an experimental interface,
not a claim that autonomous primitive discovery has been achieved.

## Current decisions

| ID | Kind | Axiom | Status |
|---|---|---|---|
| [KFD-1](decisions/KFD-1.md) | procedure | Facts must not drift. | active |
| [KFD-2](decisions/KFD-2.md) | principle | Trust must start from facts. | active |
| [KFD-3](decisions/KFD-3.md) | principle | Cooperation must start from trusted value. | active |
| [KFD-4](decisions/KFD-4.md) | procedure | Timelines must declare their observer. | active |
| [KFD-5](decisions/KFD-5.md) | procedure | Primitive discovery must join grounded judgment with scalable reasoning. | active |
| [KFD-6](decisions/KFD-6.md) | procedure | Autonomous discovery must remain grounded in causal experience. | draft |

## Decision metadata

Every rendered decision page should make the KFD fact source explicit. The
public KFD fact source is the GitHub-hosted `kungfu-systems/kfd` git
repository. GitHub is the current canonical coordination and hosting surface;
the load-bearing facts are the commit-addressed repository contents.

Decision metadata should expose:

- Public fact source: `https://github.com/kungfu-systems/kfd`
- Load-bearing coordinate: commit-addressed repository contents.
- Canonical paths: `decisions/KFD-N.md`, `registry.json`, `standards.json`.
- Stable rendered index: `https://kfd.libkungfu.dev`.
- Rendered URL: `https://kfd.libkungfu.dev/N`.

Rendered pages, npm package contents, Buildchain release passports, and
`kfd.libkungfu.dev` are projections or evidence surfaces. A GitHub issue is an
extension request path, not a KFD fact by itself; it becomes part of the KFD
fact source only after the resulting change is committed to the repository.

## How to cite

Cite by number: `KFD-1`. Numbers never change meaning; a superseded decision
keeps its number and points to its successor. Newer KFD numbers do not
automatically override older KFDs: supersession or override must be stated
explicitly in the later decision and recorded in `registry.json`. Two active
KFDs that conflict without such a relationship are a registry defect.

Repository-local engineering decisions stay in each repository's own ADRs and
reference KFDs; KFDs never depend on repository internals.

## Layout

```text
decisions/     one markdown file per decision (kfd-N.md)
registry.json  machine-readable index (schemaVersion 1, contract kfd-registry)
standards.json machine-readable KFD standard metadata (schemaVersion 1,
               contract kfd-standards-metadata)
schemas/       JSON schemas for package metadata and KFD-owned schema IDs
site/          machine-readable site bundle for kfd.libkungfu.dev renderers
buildchain.release-propagation.json
               Buildchain release propagation graph for KFD -> site consumers
release-impact.json
               Buildchain surface-aware impact ledger for production release passports
scripts/       conformance check: registry and documents must agree
```

`node scripts/check.mjs` (also `pnpm run check`) verifies numbering
uniqueness, registry/document agreement, standards metadata/schema agreement,
status validity, decision document SHA-256 bindings, interface contract
version bindings, and the release impact ledger required by Buildchain
production release passports. Releases are governed by Buildchain; this package
versions itself under KFD-1's own rules: the outer package line remains `v1.0`,
while patch and prerelease numbers are advanced by Buildchain release
promotion.

## Release impact ledger

`release-impact.json` is the surface-aware impact ledger passed to Buildchain
when generating a production release passport:

```yaml
release-passport-impact-json: release-impact.json
```

For ordinary KFD content changes, keep `kfd-content` at `patch`. Move
`kfd-registry-schema` or `kfd-package-structure` to `minor` or `major` only
when those machine-consumed surfaces add or break fields, meanings, package
paths, or published structure under KFD-1. These values are Buildchain release
passport impact classifications; they do not by themselves open a new
`@kungfu-tech/kfd` package major or minor line.

## License and official status

Repository contents are licensed under the [Apache License 2.0](LICENSE).
Apache-2.0 grants broad reuse rights for the licensed contents, but it does
not grant KFD/Kungfu trademarks, official status, certification status, or
endorsement. The official source, name-use, fork, derivative, and agent-facing
authority boundaries are defined in [`TRADEMARKS.md`](TRADEMARKS.md).
