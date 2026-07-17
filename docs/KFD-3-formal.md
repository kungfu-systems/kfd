# KFD-3 Formal Reference

[Authoritative decision](../decisions/KFD-3.md) ·
[Formal model](formal-model.md) ·
[Usage](KFD-3-usage.md) ·
[Documentation map](MAP.md)

- Status: experimental
- Normative: no
- Formal model version: 1
- Authority: `decisions/KFD-3.md`

## Imported vocabulary

`Participant`, `ValueClaim`, `TrustAssessment`, `ChoicePath`, `Constraint`,
`ExtensionPath`, `CooperationEvent`.

## Domain objects

For participant `p` and offered work `o`:

```text
Value(o, p)        participant-relevant value claim
Trust(o, p)        KFD-2 assessment visible to p
Choice(o, p)       safe available modes, including decline where applicable
Constraint(o, p)   restriction, purpose, authority, review, and revocation
Interface(o, p)    discoverable participant-facing surface
```

Define cooperation eligibility:

```text
Eligible(p, o) :=
  Discoverable(Interface(o, p))
  and Inspectable(Value(o, p))
  and Inspectable(Trust(o, p))
  and Visible(Choice(o, p))
  and Transparent(Constraint(o, p))
  and not Coerced(p, o)
```

Eligibility does not force cooperation. It establishes a valid basis from
which the participant may decide.

## Relations and predicates

```text
Discoverable(i)    a participant can find the interface from a minimal entry
Trusted(v)         value claim v is bound to a KFD-2 assessment
Transparent(x)     a constraint exposes purpose, fact or policy, authority,
                   review, and change or revocation path
Coerced(p, o)      cooperation is obtained through hidden pressure,
                   manipulation, deceptive default, or unreviewable control
Closed(I)          reachable participant surfaces are classified
```

## Invariants

```text
I1  RequestsCooperation(o, p) -> Inspectable(Value(o, p))
I2  Trusted(Value(o, p)) -> Visible(Trust(o, p))
I3  Enforced(Constraint(o, p)) -> Transparent(Constraint(o, p))
I4  SafeAlternativeExists(o, p) -> Visible(Choice(o, p))
I5  ParticipantFacing(i) -> Discoverable(i) and Classified(i)
I6  ValidCooperation(p, o) -> Eligible(p, o)
I7  SafetyGate(x) does not imply Coercion when Transparent(x)
```

## Cooperation transition

```text
participant discovers interface
  -> value and facts become inspectable
  -> trust and residual risk become visible
  -> choices and constraints become visible
  -> participant chooses, declines, or escalates
  -> action leaves a reviewable record
```

## Proof obligations

- Identify every participant profile materially affected.
- Provide at least one minimal discovery entrypoint.
- Bind important value claims to KFD-2 facts and assessments.
- Expose safe choices and transparent constraints.
- Classify reachable participant-facing surfaces.
- Record allowed, blocked, escalated, installed, revoked, or trusted actions.
- Expose an extension request path when the declared interface is insufficient.

## Invalid states

- Hidden prompts or control state obtain apparent cooperation.
- Human documentation exposes participant-relevant information unavailable to
  an agent interface, or the reverse, without a declared reason.
- A callable or participant-facing surface exists outside a claimed
  closed-world interface.
- A safety restriction has no visible purpose, authority, or review path.
- A value claim is presented as trusted without a KFD-2 fact boundary.

## Machine mappings

| Formal statement | Decision source | Schema or check | Verification |
|---|---|---|---|
| Participant, entrypoint, value, choice, constraint | Interface requirements | `schemas/kfd-3/collaboration-interface.schema.json` | Machine for structure |
| `I5` interface closure | Commitments, Interface requirements | `schemas/kfd-3/witness.schema.json` | Machine for declared boundary |
| Trusted value binding | Make value trustable | KFD-2 trust assessment links | Mixed |
| KFD package self-interface | Verification | `.buildchain/kfd-3/`, `scripts/check.mjs` | Mixed |

## Non-claims and extension points

KFD-3 makes no claim that every participant has identical capability,
authority, or access. It does not prohibit refusal, sandboxing, policy
enforcement, or revocation. It requires the basis of cooperation and control
to remain inspectable. New participant profiles and interface kinds may be
added without changing this reference.
