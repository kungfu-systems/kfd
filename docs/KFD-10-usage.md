# KFD-10 Implementation Notes

[Authoritative decision](../decisions/KFD-10.md) ·
[Formal reference](KFD-10-formal.md) ·
[Documentation map](MAP.md)

KFD-10 is a numbered draft. It promotes Warrant from an elaboration candidate
to the canonical bounded-authority coordinate.

## Adoption shape

An adopter should bind issuer, holder, action and resource scope, target roots,
preconditions, consequence ceiling, validity window, derivation, revocation,
and residual responsibility. Derived Warrants fail closed and cannot amplify a
parent without an independent authority source.

The Domain Profile owns token format, approval ceremony, multi-party policy,
consumption rules, storage, and interface. Low-risk stable permission may be
projected into a familiar session surface while its derivation remains
inspectable.

## Qualification

Retain evidence for expiry, revocation, target mismatch, attenuation,
delegation, renewal, and refusal. Include actions that are technically possible
but unauthorized, authorized but never occur, and successful but were not
authorized. Demonstrate that delegation does not silently transfer residual
responsibility.

The experimental
[`Warrant Evidence profile`](../profiles/warrant-evidence/README.md) supplies a
package-only lifecycle witness schema, fixed positive and negative vectors, explicit
failure codes, and an offline verifier for those boundaries. Its first harness
is maintained by the same stewarding organization and therefore demonstrates
mechanical clean-room self-sufficiency, not independent organizational
adoption, certification, or activation readiness.

The second evidence wave adds exact Buildchain v3 and Kungfu KFX source cuts,
competing authorization models, falsifiers, and an explicit evidence-grade
matrix. It keeps lease/fencing and named-Cut/CAS mechanisms profile-specific
while testing their common purpose, bounded-authority, recovery, settlement,
history, and residual-responsibility observations.

## Migration from the candidate

The numbered decision and formal reference now own the draft rule. The
candidate remains public genesis and qualification lineage.
