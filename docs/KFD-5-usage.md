# KFD-5 Implementation Notes

KFD-5 defines a primitive-discovery procedure: grounded judgment and scalable
reasoning must meet on inspectable reality pressure. The authoritative decision
text remains `decisions/KFD-5.md`.

## Package Surface

- `decisions/KFD-5.md`: authoritative procedure text.
- `schemas/kfd-5/primitive-discovery.schema.json`: candidate-record contract.
- `standards.json#/standards/kfd-5`: schema identity, interface, and concepts.
- `scripts/check.mjs`: package wiring and contract verification.

## When To Use The Gate

Use KFD-5 before promoting a concept into a durable object with independent
identity, authority, lifecycle, or operations. Do not apply it mechanically to
ordinary local abstractions.

Schema validity proves that required declarations exist. It does not prove that
the evidence is sufficient or that the candidate is a real primitive. A KFD-2
assessment should bind stronger claims to adopter-owned facts and residual risk.

## Boundary Pressure Diagnostic

`boundaryPressure` is an optional, compatible KFD-5 record section. Use it
when the candidate appears to mediate a contact surface that previously relied
on memory, convention, interpretation, or another implicit mechanism.

The section records:

- at least two contact sides;
- the previous implicit handling mechanism;
- pressure changes such as a new participant, scale, frequency, authority,
  heterogeneity, latency, or consequence;
- observed boundary failures;
- the candidate's mediation claim;
- a narrower internal-object alternative.

The section is intentionally optional. Boundary pressure is a strong discovery
heuristic, not a universal definition of primitives. A record must still run
the normal closure, deletion, fuse, falsifier, and dogfood tests.

## Minimal Adoption

1. Preserve the real burden and immutable evidence cut.
2. Assign grounded-judgment and scalable-reasoning functions explicitly.
3. Record alternatives, closure, deletion, fuse, falsifier, and dogfood tests.
4. When applicable, record the boundary-pressure diagnostic and its narrower
   internal-object alternative.
5. Choose `accepted`, `provisional`, `rejected`, or `subsumed`.
6. Keep `no new primitive is justified` available as a valid result.

## Current Cases

Xinfa Atlas, Kungfu Episode, and Buildchain Release Passport can be studied as
KFD-5 cases. They are evidence for the procedure's development, not automatic
proof of historical importance or universal applicability.
