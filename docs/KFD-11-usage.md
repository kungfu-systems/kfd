# KFD-11 Implementation Notes

[Authoritative decision](../decisions/KFD-11.md) ·
[Formal reference](KFD-11-formal.md) ·
[Documentation map](MAP.md)

KFD-11 is a numbered draft for a software-development Domain Profile. It is an
application of KFD-7 through KFD-10, not a cross-domain mandate.

## Domain boundary

KFD-11 names its software-domain work context `Initiative` and its bounded
responsibility `Assignment`. An Initiative turns declared intent into durable,
coordinated work by preserving scope, participants, Pursuits, Assignment
relations, lineage, and settlement state. An Assignment proposes or binds one
responsible participant to a bounded objective under an exact Atlas, Warrant,
acceptance boundary, and evidence expectation.

Intent is content of an Initiative, not a substitute for its identity. An
Initiative is not identical to a Pursuit, project, or repository. An Assignment
is not identical to a task, Warrant, Episode, or claim. Products may project a
simple session onto these roles without exposing every role as a separate UI
object.

Another domain may use different objects, omit this exact lifecycle, or define
a different settlement sequence. It conforms only to the KFDs it explicitly
adopts and qualifies.

## Implementation sequence

1. Admit the relevant Fact cut and resolve an Atlas.
2. Create or continue an Initiative and bind its relevant Pursuits.
3. Propose an Assignment with one actor, bounded objective, exact Warrant,
   acceptance boundary, expected evidence, and parent lineage.
4. Record whether that participant accepts, refuses, or requests revision.
5. Record realized work as one or more Episodes.
6. Publish a claim without treating it as self-certified.
7. Assess that claim for a declared purpose.
8. Apply an authorized decision.
9. Settle the Assignment or create explicit continuation responsibility while
   preserving the Initiative.

One physical record or command may carry several roles when source, cut,
authority, state, and derivation remain independently inspectable.

## Qualification

Test negative cases where an Assignment is treated as accepted merely because
it was proposed, occurrence lacks a claim, a claim lacks evidence, an
assessment passes for one purpose but not another, a decision lacks authority,
or continuation is required after technical success. Also test that a simple
session remains low-friction and that complex work exposes the responsibility
whose independence has become material.
