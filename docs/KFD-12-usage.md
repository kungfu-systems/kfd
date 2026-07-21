# KFD-12 Implementation Notes

[Authoritative decision](../decisions/KFD-12.md) ·
[Formal reference](KFD-12-formal.md) ·
[Documentation map](MAP.md)

KFD-12 is a numbered draft for software-project settlement. Project Cut is the
founding name for its binding object; it is not a universal cross-domain
primitive or another fact engine.

## Domain boundary

The founding implementation binds Git source, Xinfa Atlas, and Kungfu Episode
coordinates. A conforming software implementation may use different
authorities. A non-software Domain Profile may define another macro commitment
or adopt no equivalent at all.

## Implementation sequence

1. Resolve predecessor and source, Atlas, Episode, policy, and protocol roots.
2. Verify each root under its own authority.
3. Declare included projections, omissions, conflicts, unknowns, and residual
   risk.
4. Canonically encode the binding and compute its root.
5. Publish it at an outer project coordinate that is not part of its own hash
   input.
6. Issue a receipt that an independent verifier can recompute.
7. Preserve immutable lineage across later cuts, supersession, or rejection.

## Qualification

Test deterministic rebuild, independent verification, missing or conflicting
authority roots, stale Atlas, inadmissible Episode increments, circular
publication coordinates, and the distinction between valid binding, accepted
work, and release fitness.

Do not implement Project Cut as a merged authority. Its value is the verifiable
relationship among authorities that retain their own semantics.
