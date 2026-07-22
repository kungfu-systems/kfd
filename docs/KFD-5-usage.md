# KFD-5 Implementation Notes

[Authoritative decision](../decisions/KFD-5.md) ·
[Formal reference](KFD-5-formal.md) ·
[Documentation map](MAP.md)

KFD-5 separates primitive genesis from primitive qualification. Genesis may use
perspective transformation, anomaly, reconstruction pressure, causal-variable
discovery, structural compression, direct judgment, or a hybrid; facts and
scalable reasoning make the candidate inspectable, falsifiable, and eligible
to carry responsibility.
The authoritative text is `decisions/KFD-5.md`.

## Package Surface

- `decisions/KFD-5.md`: authoritative procedure.
- `schemas/kfd-5/primitive-discovery.schema.json`: version 3 candidate record.
- `cases/registry.json`: discoverable index of provisional live cases and their
  independently qualified candidate tracks, immutable current cuts, and
  optional qualification arguments.
- `schemas/kfd-live-case-registry.schema.json`: version 2 live-case registry
  contract; stable cases may preserve one genesis while tracking multiple
  candidate lines.
- `standards.json#/standards/kfd-5`: schema identity, interface, and concepts.
- `scripts/check.mjs`: package wiring and contract verification.

## Version 3 Interface

Version 3 requires `genesis` in addition to grounding, qualification tests, and
the final decision. The genesis record distinguishes:

- the observation perspective and current ontology;
- one or more declared genesis methods;
- the observation, method evidence, and candidate object;
- the boundary between local priority and a wider primitive claim.

`methods` supports direct situated judgment, perspective transformation,
perspective-preserving replay, contrastive replay, anomaly-driven search,
reconstruction pressure, causal-variable discovery, structural compression,
and other declared methods. Multiple entries form an explicit hybrid. Replay
methods require a `replayBasis` pointing to KFD-4 evidence; contrastive replay
requires at least two source views in one declared shared context.

This is a semantic and required-field change from version 2. Consumers must not
silently treat mandatory perspective genesis as the version 3 method-plural
contract.

Participant functions distinguish `perspective-declaration` from
`candidate-generation`. This keeps observation position mandatory without
claiming that perspective transformation generated every candidate.

## When To Use The Gate

Use KFD-5 before promoting a concept into a durable object with independent
identity, authority, lifecycle, or operations. Do not apply it mechanically to
ordinary local abstractions.

Schema validity proves declaration closure. It does not prove that a replay was
faithful, the evidence is sufficient, a method is superior, or the candidate is
a real primitive. Stronger claims need adopter-owned KFD-2 facts and
residual-risk assessment.

## Qualification Sequence

1. Preserve the observation perspective, current ontology, methods, and method
   evidence.
2. Bind facts, evidence boundaries, consequences, and known gaps.
3. Compare prior art, narrower objects, other perspective explanations, other
   generation methods, and no action.
4. Record identity, boundary, authority, lifecycle, and operations.
5. Run minimum-closure, deletion, fuse, falsifier, and dogfood tests.
6. Accept, keep provisional, reject, subsume, or choose no new primitive.

Two locally rational views can optimize the wrong objects indefinitely. Use
contrastive replay when available to expose mismatches between natural objects,
burdens, action costs, or authority boundaries. Use anomaly, reconstruction,
causal, and compression methods when they fit the evidence. No method bypasses
qualification.

## Boundary Pressure Diagnostic

`boundaryPressure` remains optional. Use it when the candidate mediates a
contact surface previously handled through implicit coordination. It can
corroborate genesis or generate a candidate, but it is not a universal source
or proof of primitives.

## Current Cases

Kungfu Episode, Xinfa Atlas, and Buildchain Release Passport can be studied as
KFD-5 cases. They are evidence for the procedure's development, not automatic
proof of Primitive status, historical importance, or universal applicability.

The registered [software work perspective settlement case](../cases/live/software-work-perspective-settlement/README.md)
records a complete two-stage example. KFD-4 first changes from lower-object
developer views to the real software participant, exposing Initiative and
Assignment; it then changes from the work coordinator to the successor Agent,
exposing Project Cut. Separate KFD-5 cuts accept those three responsibilities
within their bounded software-domain layers while leaving KFD-12 and KFD-13
draft activation, cross-domain universality, and historical novelty unclaimed.

The package also publishes a live case registry at `cases/registry.json`. One
record preserves the fused
`Proof-Carrying Work Object` genesis and the later ontology split into
independently qualified `Pursuit` and `Warrant` candidate tracks. Each track
binds its own status, claim boundary, and immutable version 3 candidate cut
without rewriting the shared genesis or the other track. The case dogfoods
KFD-5 record evolution; neither schema validity nor KFD self-application
promotes either candidate. Its optional `distinguishabilityArgument` surface
records conditional deletion witnesses without upgrading analytic reasoning
into observed evidence or Primitive acceptance.
