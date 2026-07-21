# KFD-11 Implementation Notes

[Authoritative decision](../decisions/KFD-11.md) ·
[Formal reference](KFD-11-formal.md) ·
[Documentation map](MAP.md)

KFD-11 is a numbered draft for a software-development Domain Profile. It is an
application of KFD-7 through KFD-10, not a cross-domain mandate.

## Domain boundary

Software products may use familiar workflow names while mapping them to the
abstract roles. The founding implementation currently uses `Mission` for a
long-horizon intent context and `Go` for bounded delegated responsibility.
These labels remain provisional before activation and must not appear as
universal KFD vocabulary in schemas intended for other domains.

Another domain may use different objects, omit this exact lifecycle, or define
a different settlement sequence. It conforms only to the KFDs it explicitly
adopts and qualifies.

## Implementation sequence

1. Admit the relevant Fact cut and resolve an Atlas.
2. Select or create the relevant Pursuit context.
3. Bind one actor and objective under an exact Warrant and acceptance boundary.
4. Record realized work as one or more Episodes.
5. Publish a claim without treating it as self-certified.
6. Assess that claim for a declared purpose.
7. Apply an authorized decision.
8. Preserve settlement or create explicit continuation responsibility.

One physical record or command may carry several roles when source, cut,
authority, state, and derivation remain independently inspectable.

## Qualification

Test negative cases where occurrence lacks a claim, a claim lacks evidence, an
assessment passes for one purpose but not another, a decision lacks authority,
or continuation is required after technical success. Also test that a simple
session remains low-friction and that complex work exposes the responsibility
whose independence has become material.
