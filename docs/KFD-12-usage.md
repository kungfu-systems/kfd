# KFD-12 Implementation Notes

[Authoritative decision](../decisions/KFD-12.md) ·
[Formal reference](KFD-12-formal.md) ·
[Discovery and qualification](../cases/live/software-work-perspective-settlement/README.md) ·
[Documentation map](MAP.md)

KFD-12 is a numbered draft for a software-development Domain Profile. It is an
application of KFD-7 through KFD-11, not a cross-domain mandate.

## Domain boundary

KFD-12 names its software-domain work context `Initiative` and its bounded
responsibility `Assignment`. An Initiative turns declared intent into durable,
coordinated work by preserving scope, participants, Pursuits, Assignment
relations, lineage, and settlement policy. Its purpose summary does not replace
the intended-change semantics of its Pursuits. An Assignment proposes or binds
one holder to accepted responsibility under exact Initiative, Pursuit, Atlas,
Warrant, acceptance, evidence, and settlement boundaries.

Intent is content of an Initiative, not a substitute for its identity. An
Initiative is not identical to a Pursuit, project, or repository. An Assignment
is not identical to a task, Warrant, Episode, or claim. Products may project a
simple session onto these roles without exposing every role as a separate UI
object.

Another domain may use different objects, omit this exact lifecycle, or define
a different settlement sequence. It conforms only to the KFDs it explicitly
adopts and qualifies.

## Discovery lineage

The founding move was not to derive more controls from Pursuit, Atlas, and
Warrant. It was to adopt the real participant's view and ask what object helps
software work continue. That KFD-4 transformation exposed a continuing work
context and a bounded accepted responsibility. KFD-5 deletion, fuse,
alternative, falsifier, and dogfood tests then accepted Initiative and
Assignment as distinct software-domain Primitives. The acceptance is narrower
than activation of KFD-11 and does not claim these names for other domains.

## Implementation sequence

1. Admit the relevant Fact cut and resolve an Atlas.
2. Create or continue an Initiative and bind its relevant Pursuits.
3. Propose an Assignment with one holder, bounded responsibility, exact
   Initiative, Pursuit, Atlas, and Warrant roots, acceptance boundary,
   evidence obligations, settlement policy, and typed lineage.
4. Record whether that participant accepts, refuses, or requests revision.
5. Record realized work as one or more Episodes.
6. Publish a claim without treating it as self-certified.
7. Assess that claim for a declared purpose under KFD-11.
8. Issue an authorized decision and record Admission separately.
9. Settle the Assignment or create explicit continuation responsibility while
   preserving the Initiative.

One physical record or command may carry several roles when source, cut,
authority, state, and derivation remain independently inspectable.

## Machine adoption path

Publish a
[`schemas/kfd-12/adopter-witness.schema.json`](../schemas/kfd-12/adopter-witness.schema.json)
record for the software Domain Profile. It binds Initiative and Assignment
identity, proposal and acceptance, exact Pursuit/Atlas/Warrant coordinates,
the Claim-to-Admission lifecycle, continuation lineage, and a passed
simple-session round-trip that can recover all eight decision roles.

The package-level [`activation-contracts.json`](../activation-contracts.json)
manifest is the stable human and agent discovery surface for this witness and
the shared qualification and activation schemas.

## Qualification

Test negative cases where an Assignment is treated as accepted merely because
it was proposed, occurrence lacks a claim, a claim lacks evidence, an
assessment passes for one purpose but not another, a decision lacks authority,
Admission fails after a valid Decision, or continuation is required after
technical success. Also test that a simple session remains low-friction and
that complex work exposes the responsibility whose independence has become
material.

Use the [Field Responsibility Matrix](field-responsibility-matrix.md) to keep
Pursuit direction separate from Initiative coordination purpose and Assignment
acceptance or settlement fields.

Qualification records structural, implementation, operational, independent
review, and activation readiness separately. Passing the schema or one
implementation level never upgrades a later level automatically.
