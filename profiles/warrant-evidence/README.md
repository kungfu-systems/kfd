# Warrant Evidence Profile

This experimental profile turns retained implementation evidence into a
versioned, offline-checkable input for KFD primitive work. It has two distinct
layers:

1. a **Primitive Evidence Bundle** records an exact public source coordinate
   and separates generic candidate claims from product-profile claims; and
2. a **KFD-10 Warrant lifecycle witness** tests purpose, authority,
   lease/generation/fencing, continuation, recovery, revocation, settlement,
   residual responsibility, and retained history against fixed vectors.

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
| purpose binds the observed transition without product privilege | `warrant-001` | `warrant-valid` |
| issuer is explicit | `warrant-002` | `warrant-missing-issuer` |
| holder is explicit and current | `warrant-003`, `warrant-015` | missing or stale holder rejection |
| action, subject, and resource scope are bounded | `warrant-004` | `warrant-scope-mismatch` |
| exact target roots are required | `warrant-005`, `warrant-009` | missing or substituted root rejection |
| expiry, generation, and fencing fail closed | `warrant-006`, `warrant-016`, `warrant-017` | expired or stale holder rejection |
| continuation binds the current generation and fence | `warrant-018` | `warrant-continuation-stale` |
| recovery rejects the old holder and creates one successor | `warrant-019` | `warrant-recovery-stale` |
| revocation fails closed | `warrant-007` | `warrant-revoked` |
| settlement consumes authority and prevents reuse | `warrant-008`, `warrant-020`, `warrant-021` | reuse, duplicate, or root-drift rejection |
| derived authority cannot amplify | `warrant-010` | `warrant-authority-amplification` |
| delegation preserves its chain | `warrant-011` | `warrant-delegation-chain-missing` |
| responsibility does not silently transfer | `warrant-012` | `warrant-residual-responsibility-missing` |
| occurrence is not authorization | `warrant-013` | `warrant-authorization-occurrence-conflated` |
| invalidation does not erase or rewrite history | `warrant-014`, `warrant-022` | missing or rewritten history rejection |
| a current lease is non-preemptive | `warrant-023` | `warrant-preemption-allowed` |

Vector prefixes above abbreviate the full IDs in
`profiles/warrant-evidence/vectors/kfd-10.json`.

## Retained evidence waves

The first registry cut retains:

- Buildchain `kungfu.buildchain.dev-delivery-warrant/v1`; and
- Kungfu `kungfu.kfx-recovery-warrant/v1`.

The exact repository, commit, tree, path, and content root are part of each
bundle. Their product-specific scheduling, merge, package, and removal
semantics remain profile-specific. Missing issuer, holder, revocation,
consumption, responsibility, or history fields remain visible gaps rather than
being inferred from surrounding code.

The second registry cut retains exact current protected-source coordinates for:

- Buildchain v3 Delivery Warrant continuation, expiry recovery, fencing, and
  idempotent terminal settlement; and
- Kungfu KFX Warrant Fact issuance, exact named-Cut mutation authority,
  consumption, Episode/Settlement closure, and immutable Fact history.

The exact roots and a `proved` / `partial` / `missing` / `invalidated` matrix
are published in `evidence/primitive-evidence/second-wave-report.json`. Its
competing-model rows and falsifiers remain part of the evidence boundary.
Buildchain merge authority, KFX product identity, capability admission, and
the chosen product storage or CAS mechanism do not become generic privilege.

## Clean-room claim boundary

A clean checkout or npm package is sufficient to run the verifier and all
fixed vectors offline. This proves that the published KFD cut is mechanically
self-sufficient for the named profile. It does not prove that the model is a
complete theory of authority, that independent implementations agree beyond
the fixed vectors, or that KFD-10 is ready for activation.

The packaged reference harness and both retained product families are
maintained by the same stewarding organization. They are deliberately not
reported as independent organizational adoption or external certification.
