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

## Current decisions

| ID | Kind | Title | Status |
|---|---|---|---|
| [KFD-1](decisions/kfd-0001-release-versioning.md) | procedure | Release versioning: welded-surface registers decide patch, minor, and major | active |
| [KFD-2](decisions/kfd-0002-fact-first-product-accountability.md) | principle | Fact-first product accountability: responsibility should be the path of least resistance | active |
| [KFD-3](decisions/kfd-0003-non-coercive-intelligence.md) | principle | Non-coercive intelligence: transparent value should guide intelligent participants | active |

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
decisions/     one markdown file per decision (kfd-NNNN-<slug>.md)
registry.json  machine-readable index (schemaVersion 1, contract kfd-registry)
release-impact.json
               Buildchain surface-aware impact ledger for production release passports
scripts/       conformance check: registry and documents must agree
```

`node scripts/check.mjs` (also `pnpm run check`) verifies numbering
uniqueness, registry/document agreement, status validity, and the release
impact ledger required by Buildchain production release passports. Releases are
governed by Buildchain; this package versions itself under KFD-1's own rules.

## Release impact ledger

`release-impact.json` is the surface-aware impact ledger passed to Buildchain
when generating a production release passport:

```yaml
release-passport-impact-json: release-impact.json
```

For ordinary KFD content changes, keep `kfd-content` at `patch`. Move
`kfd-registry-schema` or `kfd-package-structure` to `minor` or `major` only
when those machine-consumed surfaces add or break fields, meanings, package
paths, or published structure under KFD-1.

## License

[Apache License 2.0](LICENSE).
