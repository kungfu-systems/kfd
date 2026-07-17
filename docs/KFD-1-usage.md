# KFD-1 Implementation Notes

[Authoritative decision](../decisions/KFD-1.md) ·
[Formal reference](KFD-1-formal.md) ·
[Documentation map](MAP.md)

KFD-1 defines the fact-source rule: facts must not drift. This page is the
package implementation note for machine consumers and release systems. The
authoritative decision text remains `decisions/KFD-1.md`.

## Package Surfaces

The KFD package implements KFD-1 through a declared contract world:

- `standards.json#/standards/kfd-1/surfaceRegister` is the package-owned
  surface register.
- `schemas/kfd-1/contract-world.schema.json` defines the contract-world schema.
- `schemas/kfd-1/witness.schema.json` defines the witness schema.
- `schemas/kfd-1/publication-url-semantics.schema.json` defines the
  canonical/latest/immutable publication URL contract for papers,
  specifications, release notes, and other long-lived publication artifacts.
- `.buildchain/kfd-1/contract-world.witness.json` projects registered surfaces,
  source hashes, artifact hashes, surface classes, and impact projections.
- `scripts/check.mjs` verifies the register, schema enums, witness hashes, and
  surface projection.

## Compatibility Impact Core

KFD-1 uses four generic compatibility-impact classes:

- `breaking`
- `additive`
- `none`
- `unclassifiable`

Release versioning is only one projection of those classes. Other domains can
project the same core into config migration, ABI epochs, API namespaces,
runtime compatibility bridges, or workflow gates.

## Publication URL Semantics

Publication artifacts frequently need both mutable and immutable routes. A
canonical reader page may remain stable while its content is updated to point
at the latest recommended version. A versioned PDF, source bundle, release
passport, publication registry entry, or site bundle is different: once
published, the versioned URL and digest are facts that downstream readers,
agents, release passports, citations, and audits may weld to.

The KFD-1 publication URL schema gives Buildchain and site repositories a
shared vocabulary:

- `canonicalUrl`: stable reader entrypoint; it may display the latest
  recommended version.
- `latestUrl`: mutable latest alias or evidence entrypoint; it may move when a
  new version is published.
- `immutableVersionBaseUrl`: version-addressed archive prefix; its published
  artifacts must not change content.
- `immutableArtifacts[]`: digest-bound artifacts such as PDF, source bundle,
  release passport, site bundle, or publication registry entry.
- `sourceCoordinate`: repository commit, tag, source bundle, release passport,
  or equivalent coordinate for the source fact.
- `archivePolicy`: the rule that same-version digest drift fails, destructive
  sync must not cover immutable prefixes, and site builds must preserve
  declared historical versions.

KFD does not choose bucket names, CDN providers, product slugs, or exact route
layout. Concrete packages declare those facts in their own site bundle or
Buildchain release metadata. KFD owns the route semantics so those facts can be
validated consistently.

This connects the foundation triad:

- KFD-1: the immutable artifact URL and digest must not drift.
- KFD-2: trust in the publication starts from version, digest, source
  coordinate, release passport, and archive location.
- KFD-3: site renderers and agents should see the route facts instead of
  reverse-engineering or forking them locally.

## Dogfood Role

This package uses KFD-1 on itself. New public package surfaces should be added
to `standards.json#/standards/kfd-1/surfaceRegister`, then projected into the
KFD-1 witness by `node scripts/update-kfd-1-witness.mjs`.
