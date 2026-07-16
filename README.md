# KFD — Kung Fu Decisions

Most progress gives us better answers inside a world we already know how to
describe. Some progress changes what that world contains. A spreadsheet cell
made dependencies and recalculation directly manipulable. A Git commit made
distributed history something software could preserve, compare, and exchange.
Once such a primitive exists, it feels obvious; before it exists, whole fields
may work around its absence.

We know how to use primitives after they exist. We do not yet have a generally
adopted, reliable process for discovering the ones reality is already
demanding. KFD asks how humans and agents can make that process inspectable.
Kungfu opens the path from agents that answer questions to a civilization that
can discover when it has named reality incorrectly.

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

No principle is load-bearing until it has an inspectable product witness.

[Read the foundation model](docs/foundation-model.md) ·
[See primitives in history](docs/primitive-discovery-cases.md) ·
[Explore current decisions](#current-decisions) ·
[Inspect the product proof path](#product-proof-path)

## What KFD is

KFD is the organization-wide decision registry of kungfu-systems: the small
set of standing, cross-repository norms that products and their consumers weld
to. Each decision has an immutable number (`KFD-N`), a kind, a status, and a
single authoritative text in this repository.

KFDs can be **principles** or **procedures**. Principles state what must remain
true across kungfu-systems; procedures state how a class of work enforces or
protects a principle. During the pre-stable line, maintainer-authorized
semantic refinement remains possible and every published prerelease stays
immutable. After the first stable release, substantive change mints a new KFD
that explicitly supersedes the old number. The numbered decisions remain
authoritative; the
[foundation model](docs/foundation-model.md) explains how they fit together.

Stable rendered site: `https://kfd.libkungfu.dev`.

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
- Future picture: the opening two paragraphs must first make primitive discovery
  concrete, then preserve the shift from machines answering inside a human-named
  world to humans and agents discovering when that world was named incorrectly.
- Foundation signal: the `Foundation triad` section, especially the three
  one-line commitments and the product-witness rule immediately below them.
- Depth choice: the foundation link must route to the non-numbered explanatory
  page at `/foundation`, and the historical cases link must route to `/cases`;
  registry, renderer, and implementation detail stay outside the first screen.

Decision cards, detail links, and machine paths should come from
`registry.json`. The machine-readable site bundle lives at `site/kfd-site.json`
and gives renderers stable fields for the homepage, the foundation explanation
page, product proof path, decision routes, and rendering boundary. A site
renderer may adapt layout, navigation, typography, and visual assets, but it
should not maintain separate wording that can drift from this package.

`site/kfd-site.json` is generated from this README and
`docs/foundation-model.md` and `docs/primitive-discovery-cases.md` by
`scripts/update-site-bundle.mjs`. The README owns the concise homepage; the
foundation document owns the complete explanation; the cases document owns
the non-normative historical anchors. The generated bundle exposes ordered
homepage sections, the `/foundation` and `/cases` pages, and a display plan that
separates first-screen, primary, detail, and support content. Site repositories
should consume that bundle instead of parsing the Markdown files. The renderer
contract remains machine metadata, not ordinary homepage content.

## Product proof path

KFDs are not a detached manifesto, but they are not a demand that readers adopt
a Kungfu product before understanding the decisions. The product-witness rule
starts with this package itself: `standards.json`, `schemas/`, `docs/`,
`site/kfd-site.json`, and `scripts/check.mjs` show how KFD-1, KFD-2, KFD-3,
KFD-4, KFD-5, and KFD-6 are expressed as consumable interfaces for both humans
and agents. These surfaces do not prove every adopter or product correct; they
make the KFD package's own claims inspectable and falsifiable.

The complete explanatory path is published at
[`docs/foundation-model.md`](docs/foundation-model.md) and projected to the
stable site route `/foundation`. It explains the decisions without replacing
their numbered authoritative texts.

For the broader witness set, use the main Kungfu product entrypoint
(`https://kungfu.tech`) for product philosophy, and Buildchain
(`https://buildchain.libkungfu.dev`) for release and provenance
accountability. This registry states the commitments; the open products expose
where those commitments are carried, where evidence can be inspected, and
where remaining risk still belongs.

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

1. Read this README for the future picture, foundation triad, and package map.
2. Read `docs/foundation-model.md` for the complete non-numbered explanation.
3. Read `docs/primitive-discovery-cases.md` to test the KFD lens against familiar
   historical cases and an ordinary cross-machine trace vignette.
4. Read `standards.json` for canonical KFD numbers, schema IDs, concept names,
   and interface contracts.
5. Use `site/kfd-site.json` decision metadata or the KFD-3 collaboration
   interface fact-source metadata to identify the public KFD fact source.
6. Use `schemas/kfd-2/trust-taxonomy.schema.json` for KFD-2 residual-risk and
   trust-downgrade values. Unknown taxonomy values are invalid.
7. Use `schemas/kfd-2/trust-claims.schema.json` and
   `schemas/kfd-2/trust-assessment.schema.json` when a claim needs generic
   KFD-2 assessment instead of a release-specific passport.
8. Use `schemas/kfd-3/collaboration-interface.schema.json` and
   `schemas/kfd-3/witness.schema.json` to inspect collaboration interfaces.
9. Use `schemas/kfd-1/publication-url-semantics.schema.json` when a package,
   paper, specification, or site bundle must distinguish stable reader URLs,
   latest aliases, and immutable versioned artifacts.
10. If a needed KFD-2 taxonomy value is missing, open a KFD GitHub issue rather
   than inventing a local value:
   `https://github.com/kungfu-systems/kfd/issues/new?title=KFD-2%20trust%20taxonomy%20extension%20request`.
11. Use `schemas/kfd-4/observer-perspective.schema.json` to bind timelines to
   their observers and `schemas/kfd-4/perspective-replay.schema.json` to record
   perspective-preserving or contrastive replay. Use
   `schemas/kfd-5/primitive-discovery.schema.json` version 2 to record the
   perspective genesis and scalable qualification of a primitive candidate,
   including the optional boundary-pressure diagnostic when implicit
   coordination is under new pressure. Use
   `schemas/kfd-6/autonomous-discovery-loop.schema.json` only for explicitly
   draft or experimental autonomous-discovery work; its version 3 interface
   requires grounded perspective experiments and treats boundary hypothesis as
   conditional.

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

KFD-4 says that views remain bound to declared perspectives and that a
perspective transformation must stay inspectable when it is used to reveal a
different object or guide action. Its two schemas under `schemas/kfd-4/` define
the first concrete path: observer-bound timelines make a perspective durable;
perspective-preserving and contrastive replay make perspectives transferable
and comparable without flattening their fact boundaries. They are not a
universal schema for every perspective.

KFD-5 publishes a version 2 primitive-discovery record schema under
`schemas/kfd-5/`. It separates perspective-grounded genesis from scalable
qualification and records whether genesis came from direct experience,
perspective replay, or contrastive replay. It then binds facts, alternatives,
contract boundaries, falsifiers, dogfood evidence, and outcome. Validation
proves record closure, not that the candidate is a real primitive.

KFD-6 publishes a draft autonomous-discovery-loop schema under
`schemas/kfd-6/`. Its version 3 experiment interface requires causal-experience
boundaries, grounded perspective experiments, a fixed-ontology baseline,
held-out and independent evaluation, bounded autonomy, and separation between
discovery and promotion. Its package presence is an experimental interface,
not a claim that autonomous primitive discovery has been achieved.

## Current decisions

| ID | Kind | Axiom | Status |
|---|---|---|---|
| [KFD-1](decisions/KFD-1.md) | procedure | Facts must not drift. | active |
| [KFD-2](decisions/KFD-2.md) | principle | Trust must start from facts. | active |
| [KFD-3](decisions/KFD-3.md) | principle | Cooperation must start from trusted value. | active |
| [KFD-4](decisions/KFD-4.md) | principle | Views must remain bound to declared perspectives. | active |
| [KFD-5](decisions/KFD-5.md) | procedure | Primitive discovery must join perspective-grounded judgment with scalable reasoning. | active |
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

Cite by number and released coordinate: `KFD-1` plus the package version or git
commit when prerelease precision matters. Every published package and commit is
immutable. Before the first stable release, explicit maintainer-authorized
semantic refinement may update a numbered draft line and must be declared as a
breaking decision-surface impact. After stable, numbers never change meaning: a
superseded decision keeps its number and points to its successor. Newer KFD
numbers do not automatically override older KFDs; supersession or override must
be explicit in the later decision and `registry.json`.

Repository-local engineering decisions stay in each repository's own ADRs and
reference KFDs; KFDs never depend on repository internals.

## Layout

```text
decisions/     one authoritative markdown file per decision (KFD-N.md)
docs/          non-numbered explanations, usage guides, and documentation map
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
