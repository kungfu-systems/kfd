# KFD-4 Implementation Notes

KFD-4 defines the observer-perspective rule: timelines must declare their
observer. This page is the package implementation note for machine consumers
and products that show perspective-bearing timelines. The authoritative
decision text remains `decisions/KFD-4.md`.

## Package Surface

The KFD package implements KFD-4 through:

- `decisions/KFD-4.md`: the authoritative procedure text.
- `schemas/kfd-4/observer-perspective.schema.json`: the KFD-owned schema for
  observer-relative timeline views.
- `standards.json#/standards/kfd-4`: metadata that exposes the schema ID, schema
  path, interface contract, and concept names.
- `scripts/check.mjs`: verification that KFD-4 metadata and schema remain
  wired into the package.

## When To Use The Gate

Use KFD-4 when a product surface represents time, history, replay, sync,
ordering, or mixed-source work state. A product that does not present a
perspective-bearing timeline does not need a KFD-4 gate.

## Trust Relation

KFD-4 claims can be assessed by KFD-2. The KFD package does this through
`.buildchain/kfd-2/kfd-foundation.trust-claims.json` and
`.buildchain/kfd-2/kfd-foundation.trust-assessment.json`, where KFD-4 is
assessed as an `observer-perspective` subject.
