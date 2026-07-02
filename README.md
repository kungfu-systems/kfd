# KFD — Kung Fu Decisions

KFD is the organization-wide decision registry of kungfu-systems: the small
set of standing, cross-repository norms that products and their consumers
weld to. Each decision has an immutable number (`KFD-N`), a status, and a
single authoritative text in this repository.

Rendered index: `https://kfd.libkungfu.dev` (stable machine path per entry,
e.g. `https://kfd.libkungfu.dev/1`). This repository publishes
`@kungfu-tech/kfd` — the decision texts plus a machine-readable
`registry.json` — which the site consumes as its single fact source.

## Current decisions

| ID | Title | Status |
|---|---|---|
| [KFD-1](decisions/kfd-0001-release-versioning.md) | Release versioning: welded-surface registers decide patch, minor, and major | active |

## How to cite

Cite by number: `KFD-1`. Numbers never change meaning; a superseded decision
keeps its number and points to its successor. Repository-local engineering
decisions stay in each repository's own ADRs and reference KFDs; KFDs never
depend on repository internals.

## Layout

```text
decisions/     one markdown file per decision (kfd-NNNN-<slug>.md)
registry.json  machine-readable index (schemaVersion 1, contract kfd-registry)
scripts/       conformance check: registry and documents must agree
```

`node scripts/check.mjs` (also `pnpm run check`) verifies numbering
uniqueness, registry/document agreement, and status validity. Releases are
governed by Buildchain; this package versions itself under KFD-1's own rules.

## License

[Apache License 2.0](LICENSE).
