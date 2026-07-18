# KFD-7 Formal Reference

[Authoritative decision](../decisions/KFD-7.md) ·
[Formal model](formal-model.md) ·
[Usage](KFD-7-usage.md) ·
[Documentation map](MAP.md)

- Status: experimental
- Normative: no
- Formal model version: 1
- Authority: `decisions/KFD-7.md`
- Decision status: draft

## Imported vocabulary

`Fact`, `Episode`, `Pursuit`, `Atlas`, `Warrant`, `Profile`, `Transition`,
`Receipt`, `EvidenceCut`, `Denial`, `ResidualRisk`, `Qualification`.

## Role domains

For a Profile `P`:

```text
F_P  addressable Fact identities and cuts
E_P  addressable bounded causal Episodes
U_P  continuing Pursuit identities
A_P  declared Atlas perspectives and fact cuts
W_P  bounded Warrants and derivation chains
```

The sets may share a physical substrate. Their semantic identity functions
remain distinguishable:

```text
id_F(x), id_E(x), id_U(x), id_A(x), id_W(x)
```

## Action declaration

A consequential transition is represented abstractly as:

```text
T = (subject, role, prior, operation, preconditions,
     warrant?, atlas?, pursuit?, effect, receipt, evidence, denial?, risk)
```

`warrant?`, `atlas?`, and `pursuit?` may be absent only under a declared Profile
rule. Absence is not permission to infer the missing role from another field.

## Core predicates

```text
Holds(f, authority, cut)        Fact f is asserted under authority and cut
Occurred(e, boundary)           Episode e records a bounded occurrence
Continues(u, e)                 Episode e contributes to Pursuit u
JudgedFrom(t, a)                transition t is judged from Atlas a
PermittedBy(t, w)               transition t is permitted by Warrant w
Derives(w_child, w_parent)      child Warrant passes checked attenuation
Succeeds(x_new, x_old)          identity has a declared successor relation
Binds(r, t)                     receipt r binds the exact transition claim
Denies(d, t)                    denial d explains why t was rejected
```

## Separation invariants

```text
I1  Continues(u, e) does not imply PermittedBy(e, w)
I2  JudgedFrom(t, a) does not imply CompleteReality(a)
I3  PermittedBy(t, w) does not imply Occurred(e)
I4  Occurred(e) does not imply Authorized(e) or Completed(u)
I5  Holds(f, authority, cut) does not imply Occurred(e)
I6  Derives(w_child, w_parent) requires explicit attenuation and preconditions
I7  Completed(u) requires the Pursuit consequence/settlement predicate
I8  SameEndpoint(e1, e2) does not imply SameCausalExperience(e1, e2)
I9  UnknownRole or UnknownTransition fails closed
I10 Profile state names do not become universal KFD enums by adoption
```

## Abstract lifecycle obligations

KFD-7 constrains questions, not one universal state vocabulary:

```text
Fact:    assert -> inspect -> supersede/degrade/invalidate
Episode: open -> act -> seal/reconcile -> replay/export or declared contraction
Pursuit: create -> advance/revise/pause -> settle/abandon/terminate/succeed
Atlas:   compile/declare -> consume -> stale/conflict -> successor or reject
Warrant: issue -> derive/attenuate -> exercise -> expire/revoke/refuse/renew
```

A Profile maps each arrow to a versioned operation with preconditions, effect,
receipt, evidence, denial reasons, and residual risk. It may add states and
operations without weakening the invariants.

## Transition validity

```text
Valid_P(T) :=
  KnownRole_P(T.role)
  and KnownOperation_P(T.operation)
  and IdentityBound_P(T.subject, T.prior)
  and PreconditionsHold_P(T)
  and AuthoritySatisfied_P(T)
  and PerspectiveSatisfied_P(T)
  and EffectDeclared_P(T)
  and ReceiptAndEvidenceBound_P(T)
```

If any term is false or unknown, the result is a structured denial or explicit
unsupported result, never compatible success.

## Evidence closure

For Profile claim `C` at evidence cut `K`:

```text
Qualified(C, K) :=
  schema_conformance
  and positive_transition_evidence
  and negative_transition_evidence
  and deletion_or_fusion_evidence
  and migration_and_rebuild_evidence
  and concurrency_or_compensation_evidence
  and retained_residual_risk
  and independent_review
```

An evidence category may be `not-applicable` only with a bounded reason.
Qualification is relative to the declared Profile and cut; it is not universal
necessity.

## Activation transition

```text
pending --sufficient retained evidence + independent review--> activate
pending --contract/profile defect-----------------------------> revise
pending --separation/profile falsified------------------------> reject
```

Only the `activate` transition may publish a stable Profile claim. Draft KFD-7
currently remains before this transition.

## Invalid states

- Pursuit identity is treated as an authorization token.
- Retrieved context is treated as complete reality or current Atlas authority.
- Authentication or capability is treated as a Warrant.
- A plan or Warrant is treated as evidence that action occurred.
- An Episode or successful command is treated as Pursuit completion.
- Child authority is inherited without a checked derivation.
- A Profile silently changes state names, denial meaning, or evidence meaning.
- A conforming JSON record is presented as product qualification.
- Missing evidence is projected as pass.

## Machine mapping

| Formal statement | Decision source | Machine surface | Verification |
|---|---|---|---|
| role responsibilities | Reference roles | `roles[]` | closed structure and required roles |
| `I1-I10` | Independence rule | `prohibitedInferences[]` | closed vocabulary |
| `Valid_P(T)` | Profile contract | `transitions[]` | required precondition/effect/receipt/denial/evidence shape |
| evidence closure | Evidence contract | `evidenceObligations[]` | category/status/artifact/risk closure |
| activation transition | Activation decision | `activation` | decision/evidence/review binding |

## Non-claims and extensions

The model does not fix storage, APIs, command names, GUI states, domain terms,
or a universal lifecycle enum. Profiles extend lifecycle vocabulary and domain
relations through versioned declarations. A later formal revision may refine
the predicates without weakening independence, fail-visible denial, or retained
evidence obligations.
