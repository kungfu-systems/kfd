# KFD-2 Formal Reference

[Authoritative decision](../decisions/KFD-2.md) ·
[Formal model](formal-model.md) ·
[Usage](KFD-2-usage.md) ·
[Documentation map](MAP.md)

- Status: experimental
- Normative: no
- Formal model version: 1
- Authority: `decisions/KFD-2.md`
- Decision status: active

## Imported vocabulary

`Claim`, `FactBinding`, `Evidence`, `AuditBoundary`, `AssuranceResponsibility`,
`ResidualRisk`, `TrustAssessment`.

## Domain objects

For a claim `c`, define:

```text
Subject(c)          exact object of reliance
Statement(c)        bounded proposition
Facts(c)            inspectable fact bindings
Evidence(c)         checked support or contradiction
Boundary(c)         declared audit scope and enumerability
Responsibility(c)   source, verification, and decision owners
Risk(c)             known residual risk
```

The assessment function is:

```text
Assess(c, Facts, Evidence, Boundary, Responsibility, Risk)
  -> pass | warning | fail | unverifiable
```

## Relations and predicates

```text
Bound(c, f)          claim c identifies fact f
Checked(e)           evidence e was actually evaluated
Within(e, b)         evidence e is inside audit boundary b
Owned(r)             responsibility role r has a named owner
Contradicts(e, c)    checked evidence conflicts with c
Exceeds(c, b)        the claimed reliance exceeds the audited boundary
```

## Invariants

```text
I1  Assessed(c) -> Exact(Subject(c)) and Exact(Statement(c))
I2  Result(c) in {pass, warning} -> Facts(c) is not empty
I3  Checked(e) -> Within(e, Boundary(c))
I4  Assessed(c) -> Owned(source) and Owned(verification) and Owned(decision)
I5  Risk(c) is not empty -> Risk(c) is exposed in the assessment
I6  Contradicts(e, c) -> Reassess(c)
I7  Exceeds(c, Boundary(c)) -> Result(c) != pass
```

Trust is bounded and revisable. It is not monotonic: additional evidence may
increase, reduce, redirect, or remove justified reliance.

## Assessment transition

```text
declared claim
  -> facts bound
  -> evidence checked
  -> boundary and responsibility fixed
  -> residual risk classified
  -> assessment issued
  -> reassessed when contradictory or boundary-changing evidence appears
```

## Proof obligations

- State the exact subject and proposition.
- Bind the proposition to non-drifting fact sources where available.
- Distinguish checked evidence from merely referenced material.
- Declare what was not checked.
- Name source, verification, and decision responsibility.
- Expose residual risk and downgrade reason.
- Keep the assessment exportable and reviewable.

## Invalid states

- A pass result with no fact binding.
- Evidence outside the declared boundary presented as checked.
- Reputation, authority, calibration, or persuasive explanation substituted
  for facts.
- Residual risk hidden from the participant relying on the claim.
- Contradictory evidence ignored because the original assessor is trusted.

## Machine mappings

| Formal statement | Decision source | Schema or check | Verification |
|---|---|---|---|
| Closed risk vocabulary | Trust assessment | `schemas/kfd-2/trust-taxonomy.schema.json` | Machine |
| `I1-I5`, `I7` claim shape | Trust assessment | `schemas/kfd-2/trust-claims.schema.json` | Machine for structure |
| Assessment result and checked evidence | Trust assessment | `schemas/kfd-2/trust-assessment.schema.json` | Mixed |
| Release projection | Verification | release claims and trust passport schemas | Mixed |
| KFD self-assessment | Verification | `.buildchain/kfd-2/`, `scripts/check.mjs` | Mixed |

## Non-claims and extension points

KFD-2 does not guarantee truth, complete capture, or exhaustive machine proof.
It specifies when reliance is inspectable and who remains responsible.
Domain-specific claim kinds and assessment procedures may be added if they
preserve bounded evidence, explicit residual risk, and revisability.
