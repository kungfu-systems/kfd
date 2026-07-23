# KFD-11 Implementation Notes

[Authoritative decision](../decisions/KFD-11.md) ·
[Formal reference](KFD-11-formal.md) ·
[Documentation map](MAP.md)

- Status: draft guidance
- Normative: no

## Adoption shape

An adopter should reuse KFD-2 Claim and TrustAssessment artifacts where they
fit, bind every consequential Decision to an exact Warrant or equivalent
KFD-10 mapping, and let the owning Fact authority report Admission separately.

The minimum machine path is:

```text
KFD-2 Claim root
  -> KFD-2 Assessment root and purpose
  -> Decision record with Warrant and requested effects
  -> Admission result with basis cut, successor cut, and receipt when admitted
```

The package publishes
[`schemas/kfd-11/decision-admission.schema.json`](../schemas/kfd-11/decision-admission.schema.json)
as a version 1 reference envelope. It binds artifacts by schema and root rather
than copying their payloads. Schema validity proves structural closure only;
it does not prove the Claim, Assessment, Warrant, Decision, or Admission valid.

Adopters preparing independent qualification should wrap that envelope with
[`schemas/kfd-11/adopter-witness.schema.json`](../schemas/kfd-11/adopter-witness.schema.json).
The wrapper requires an exact and independently verified Warrant boundary, a
separately recorded effect Admission, explicit rejection of Decision or a
lower-level write receipt as Admission, and retained failure/retry lineage.

## Product surface

Human and agent surfaces should answer, in this order:

1. What exact proposition is being relied on?
2. For what purpose and against which evidence was it assessed?
3. Who is authorized to decide, under which Warrant and conditions?
4. What effect was requested?
5. Was it actually admitted, and what successor coordinate and receipt prove
   that result?

One compact confirmation surface may answer all five. Progressive disclosure
may hide routine detail, but every default and derivation remains inspectable.

## Qualification

Qualification should include:

- same Claim, different assessment purposes and results;
- same Assessment, different Warrants or decision policies;
- partial acceptance and conditional acceptance;
- valid Decision followed by stale, conflicting, denied, or failed Admission;
- idempotent retry that preserves Decision identity;
- a negative case where process success or Episode sealing cannot settle work;
- export and independent verification of the complete chain; and
- a simple-session projection that does not force four visible objects when
  the full boundary remains recoverable.

Record those results in the shared
[`qualification-report.schema.json`](../schemas/kfd-activation/qualification-report.schema.json).
Only a later independent
[`activation-record.schema.json`](../schemas/kfd-activation/activation-record.schema.json)
may issue `pass`, `revise`, or `reject` over exact retained evidence and
residual risk. Missing evidence fails closed.

## Domain Profile boundary

Domain Profiles own proposition kinds, assessment methods, disposition codes,
approval policy, admission authority, lifecycle, effects, UI vocabulary, and
evidence obligations. They may not redefine Assessment as authority, Decision
as occurrence, or requested effect as admitted state.

Use the [Field Responsibility Matrix](field-responsibility-matrix.md) to decide
whether a proposed field belongs to the shared procedure, a Domain Profile, or
a participant-facing projection.

## Foundation Revision

The old prerelease `/11` software-work coordinate and `/12` Project Cut
coordinate remain valid at their exact package and commit versions. The latest
pre-stable foundation maps them to `/12` and `/13`; see the
[Foundation Revision record](foundation-revision-2026-07-21-decision-admission.md).
