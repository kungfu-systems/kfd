# KFD-5 Implementation Notes

KFD-5 separates primitive genesis from primitive qualification. A perspective
transformation may reveal a missing object; facts and scalable reasoning make
that candidate inspectable, falsifiable, and eligible to carry responsibility.
The authoritative text is `decisions/KFD-5.md`.

## Package Surface

- `decisions/KFD-5.md`: authoritative procedure.
- `schemas/kfd-5/primitive-discovery.schema.json`: version 2 candidate record.
- `standards.json#/standards/kfd-5`: schema identity, interface, and concepts.
- `scripts/check.mjs`: package wiring and contract verification.

## Version 2 Interface

Version 2 requires `perspectiveGenesis` in addition to grounding,
qualification tests, and the final decision. The genesis record distinguishes:

- the origin perspective;
- the transformed perspective and consequence-bearing participant;
- the transformation performed;
- the situated observation and newly visible need;
- the candidate object;
- the boundary between local priority and a wider primitive claim.

`genesisMethod` distinguishes direct situated experience,
perspective-preserving replay, and contrastive replay. Replay methods require a
`replayBasis` pointing to KFD-4 evidence. Contrastive replay requires at least
two source views in one declared shared context.

This is a semantic and required-field change from version 1. Consumers must not
silently treat a version 1 pressure-first record as a complete version 2
discovery record.

Participant functions use `perspective-grounded-judgment` rather than the
version 1 `grounded-judgment` value. This keeps the machine declaration aligned
with the decision's claim that judgment is situated rather than viewless.

## When To Use The Gate

Use KFD-5 before promoting a concept into a durable object with independent
identity, authority, lifecycle, or operations. Do not apply it mechanically to
ordinary local abstractions.

Schema validity proves declaration closure. It does not prove that the
perspective was reconstructed faithfully, the evidence is sufficient, or the
candidate is a real primitive. Stronger claims need adopter-owned KFD-2 facts
and residual-risk assessment.

## Qualification Sequence

1. Preserve perspective genesis and its direct-experience or replay method.
2. Bind facts, evidence boundaries, consequences, and known gaps.
3. Compare prior art, narrower objects, other perspective explanations, and no
   action.
4. Record identity, boundary, authority, lifecycle, and operations.
5. Run minimum-closure, deletion, fuse, falsifier, and dogfood tests.
6. Accept, keep provisional, reject, subsume, or choose no new primitive.

Two locally rational views can optimize the wrong objects indefinitely. Use
contrastive replay when available to expose mismatches between natural objects,
burdens, action costs, or authority boundaries before qualification begins.

## Boundary Pressure Diagnostic

`boundaryPressure` remains optional. Use it when the candidate mediates a
contact surface previously handled through implicit coordination. It can
corroborate genesis or generate a candidate, but it is not a universal source
or proof of primitives.

## Current Cases

Kungfu Episode, Xinfa Atlas, and Buildchain Release Passport can be studied as
KFD-5 cases. They are evidence for the procedure's development, not automatic
proof of historical importance or universal applicability.
