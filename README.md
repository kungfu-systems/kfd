# KFD — Kung Fu Decisions

KFD is the organization-wide decision registry of kungfu-systems: the small
set of standing, cross-repository norms that products and their consumers
weld to. Each decision has an immutable number (`KFD-N`), a kind, a status,
and a single authoritative text in this repository.

KFDs can be **principles** or **procedures**. Principles state what must remain
true across kungfu-systems; procedures state how a class of work enforces or
protects a principle.

## Foundation triad

The first three KFDs form the public foundation for kungfu-systems:

```text
KFD-1: contracts must not drift.
KFD-2: trust must start from facts.
KFD-3: cooperation must start from transparent value, not coercion.
```

Together they define the load-bearing path for Kungfu products: make contract
worlds explicit, make important claims inspectable, and let humans and agents
cooperate through visible value rather than hidden pressure.

## Foundation model

The triad is intentionally ordered. It is a compact model for surviving and
evolving in complex systems, especially in a world where agents can observe,
act, delegate, and remember across many surfaces.

| Layer | Decision | Reader question | Commitment |
|---|---|---|---|
| Fact-source ontology | KFD-1 | What can count as a fact? | A load-bearing fact must not drift: its contract world comes from one declared fact source. |
| Participant-to-object trust | KFD-2 | When can a user or agent trust a claim, product, artifact, or control surface? | Trust starts from inspectable facts and responsibility state. |
| Participant-to-participant cooperation | KFD-3 | How should peer intelligent participants cooperate? | Cooperation starts from transparent value, stable choice, and explainable constraints, not pressure. |

In short:

```text
stable facts -> trustworthy objects -> non-coercive cooperation
```

This is why KFDs are not only internal governance text. KFD-1 is a procedure,
but it gives the foundation model its first layer by making fact sources
operational: a fact-bearing contract world must be declared, inspectable, and
unable to drift invisibly. KFD-2 then defines how trust can stand on those
facts. KFD-3 defines how humans and agents can cooperate once facts and trust
are visible.

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
detailed rules.

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
  `stable facts -> trustworthy objects -> non-coercive cooperation` chain.

Decision cards, detail links, and machine paths should come from
`registry.json`. The machine-readable site bundle lives at `site/kfd-site.json`
and gives renderers stable fields for the homepage, foundation model, product
proof path, decision routes, and rendering boundary. A site renderer may adapt
layout, navigation, typography, and visual assets, but it should not maintain
separate homepage wording that can drift from this package.

## Product proof path

KFDs are not a detached manifesto, but they are not a demand that readers adopt
a Kungfu product before understanding the decisions. A philosophy becomes
load-bearing only when it can be seen in a concrete case. For that reference
case, use the main Kungfu product entrypoint (`https://kungfu.tech`) for product
philosophy, and Buildchain (`https://buildchain.libkungfu.dev`) for release and
provenance accountability. This registry states the commitments; those
entrypoints show how the commitments are meant to be borne in practice.

Rendered index: `https://kfd.libkungfu.dev` (stable machine path per entry,
e.g. `https://kfd.libkungfu.dev/1`). This repository publishes
`@kungfu-tech/kfd` — the decision texts plus a machine-readable
`registry.json` — which the site consumes as its single fact source.

Machine consumers that need KFD-owned standard identity should read
`standards.json`. It is the versioned metadata surface for stable standard
keys, document routes, schema IDs, and KFD-owned concept names. In Node or
TypeScript projects, import it as:

```js
import standards from "@kungfu-tech/kfd/standards.json" with { type: "json" };
```

## Current decisions

| ID | Kind | Title | Status |
|---|---|---|---|
| [KFD-1](decisions/kfd-1.md) | procedure | Contracts must not drift: contract worlds need one fact source | active |
| [KFD-2](decisions/kfd-2.md) | principle | Trust must start from facts: responsibility must be inspectable | active |
| [KFD-3](decisions/kfd-3.md) | principle | Cooperation must start from transparent value: compliance must not be coerced | active |

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
release-impact.json
               Buildchain surface-aware impact ledger for production release passports
scripts/       conformance check: registry and documents must agree
```

`node scripts/check.mjs` (also `pnpm run check`) verifies numbering
uniqueness, registry/document agreement, standards metadata/schema agreement,
status validity, and the release impact ledger required by Buildchain
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

## License

[Apache License 2.0](LICENSE).
