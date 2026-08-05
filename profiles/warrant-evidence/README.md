# Warrant Evidence Profile

This experimental profile turns retained implementation evidence into a
versioned, offline-checkable input for KFD primitive work. It has two distinct
layers:

1. a **Primitive Evidence Bundle** records an exact public source coordinate
   and separates generic candidate claims from product-profile claims; and
2. a **KFD-10 Warrant witness** tests the current numbered draft against fixed
   positive and negative vectors.

Neither layer can activate a draft, certify an adopter, or promote its own
claims. `qualifying` and `selfCertified` are fixed to `false`.

## Evidence review lifecycle

Every contribution enters with an immutable public source coordinate,
pressure field, evidence class, KFD clause mapping, candidate invariants,
reusable test roots, explicit failure or counterexample, review state, and
lineage. Review may leave it `self-reviewed`, advance it to
`independent-reviewed`, or mark it `revision-required`. None of those states
changes normative KFD text. Promotion requires a separate KFD governance
change with its own compatibility and review evidence.

## Public interfaces

- `schemas/kfd-evidence/primitive-evidence-bundle.schema.json`
- `schemas/kfd-10/conformance-witness.schema.json`
- `evidence/primitive-evidence/registry.json`
- `profiles/warrant-evidence/vectors/kfd-10.json`
- `profiles/warrant-evidence/failure-codes.json`
- `scripts/warrant-evidence-verifier.mjs`

The verifier uses only Node.js built-ins and files in the KFD package. It does
not clone, import, execute, or query Buildchain, Kungfu, KFX, Atlas, a private
registry, or the network. Upstream repositories remain evidence sources, not
runtime dependencies.

## Clause-to-test map

| KFD-10 draft clause | Fixed vector | Expected outcome |
| --- | --- | --- |
| issuer is explicit | `warrant-002` | `warrant-missing-issuer` |
| holder is explicit | `warrant-003` | `warrant-missing-holder` |
| action, subject, and resource scope are bounded | `warrant-004` | `warrant-scope-mismatch` |
| exact target roots are required | `warrant-005`, `warrant-009` | missing or stale target rejection |
| expiry fails closed | `warrant-006` | `warrant-expired` |
| revocation fails closed | `warrant-007` | `warrant-revoked` |
| consumption prevents reuse | `warrant-008` | `warrant-consumed` |
| derived authority cannot amplify | `warrant-010` | `warrant-authority-amplification` |
| delegation preserves its chain | `warrant-011` | `warrant-delegation-chain-missing` |
| responsibility does not silently transfer | `warrant-012` | `warrant-residual-responsibility-missing` |
| occurrence is not authorization | `warrant-013` | `warrant-authorization-occurrence-conflated` |
| invalidation does not erase history | `warrant-014` | `warrant-history-missing` |
| bounded active authority is admissible | `warrant-001` | `warrant-valid` |

Vector prefixes above abbreviate the full IDs in
`profiles/warrant-evidence/vectors/kfd-10.json`.

## First retained sources

The first registry cut retains:

- Buildchain `kungfu.buildchain.dev-delivery-warrant/v1`; and
- Kungfu `kungfu.kfx-recovery-warrant/v1`.

The exact repository, commit, tree, path, and content root are part of each
bundle. Their product-specific scheduling, merge, package, and removal
semantics remain profile-specific. Missing issuer, holder, revocation,
consumption, responsibility, or history fields remain visible gaps rather than
being inferred from surrounding code.

## Clean-room claim boundary

A clean checkout or npm package is sufficient to run the verifier and all
fixed vectors offline. This proves that the published KFD cut is mechanically
self-sufficient for the named profile. It does not prove that the model is a
complete theory of authority, that independent implementations agree beyond
the fixed vectors, or that KFD-10 is ready for activation.

The packaged reference harness is maintained in the same repository and by
the same stewarding organization as this profile. It is deliberately not
reported as independent organizational adoption or external certification.
