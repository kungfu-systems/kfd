# KFD-1 Implementation Notes

KFD-1 defines the fact-source rule: facts must not drift. This page is the
package implementation note for machine consumers and release systems. The
authoritative decision text remains `decisions/KFD-1.md`.

## Package Surfaces

The KFD package implements KFD-1 through a declared contract world:

- `standards.json#/standards/kfd-1/surfaceRegister` is the package-owned
  surface register.
- `schemas/kfd-1/contract-world.schema.json` defines the contract-world schema.
- `schemas/kfd-1/witness.schema.json` defines the witness schema.
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

## Dogfood Role

This package uses KFD-1 on itself. New public package surfaces should be added
to `standards.json#/standards/kfd-1/surfaceRegister`, then projected into the
KFD-1 witness by `node scripts/update-kfd-1-witness.mjs`.
