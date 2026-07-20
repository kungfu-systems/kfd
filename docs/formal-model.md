# KFD Formal Model

This document defines the shared notation and authority boundary for the
non-normative formal references published with KFD-1 through KFD-7.

- Status: experimental
- Normative: no
- Formal model version: 1
- Authority: `decisions/KFD-N.md`

[Foundation explanation](foundation-model.md) ·
[Documentation map](MAP.md)

## Purpose

The formal layer makes KFD concepts precise enough to compare, implement, and
test without pretending that every semantic responsibility can be reduced to
an algorithm. It defines domain objects, relations, invariants, state
transitions, invalid states, and proof obligations.

The numbered decision remains authoritative:

```text
Decision -> Formal -> Schema -> Usage -> Witness
```

- **Decision** states what must remain true.
- **Formal** gives a precise, non-normative reference semantics.
- **Schema** makes a bounded machine profile checkable.
- **Usage** explains how a product or repository applies the profile.
- **Witness** records evidence for a concrete claim.

If any later surface conflicts with its decision, the later surface is wrong.
A valid schema may implement only part of a formal model. A valid witness may
prove only the claim and audit boundary it declares.

## Shared notation

For a KFD number `n`:

```text
D_n       authoritative decision
F_n^v     formal reference at formal model version v
S_n^i     machine schema profile at interface version i
U_n       implementation guidance
W_n       evidence witness
```

`Models(x, y)` means that `x` is a declared projection of `y`. It does not mean
that `x` exhausts the meaning of `y`.

```text
Models(F_n^v, D_n)
Models(S_n^i, F_n^v)
Models(U_n, D_n and selected F_n^v/S_n^i)
Models(W_n, a bounded adopter claim)
```

The required authority invariant is:

```text
not Contradicts(F_n^v, D_n)
not Contradicts(S_n^i, D_n)
not Contradicts(U_n, D_n)
```

Machine validation can prove structural closure, registered identities,
digests, enumerated values, and some transition rules. It cannot by itself
prove that natural-language meaning, captured reality, causal interpretation,
participant value, or a Primitive claim is correct.

## Shared objects

The formal references reuse these object classes:

| Object | Meaning |
|---|---|
| `FactSource` | A declared reference from which a contract world obtains load-bearing facts. |
| `FactCut` | An independently addressable state admitted at a declared authority and evidence boundary. |
| `Claim` | A bounded statement about a subject. |
| `EvidenceCut` | The declared boundary of evidence available to a claim or decision. |
| `ResponsibilityState` | The named owners of source facts, verification, and decision authority. |
| `Participant` | A human, agent, operator, system, or other reasoning party in cooperation. |
| `Perspective` | A declared position from which facts become relevant and consequences are borne. |
| `PrimitiveCandidate` | A proposed object with independent identity, boundary, authority, lifecycle, and operations. |
| `CausalExperience` | A bounded causal path or partial order between fact cuts, preserving action, consequence, and evidence rather than only endpoint difference. |

The same concrete artifact may play more than one role. Role identity must be
declared rather than inferred from file type or product vocabulary.

## Cross-KFD composition

The seven references compose as follows:

```text
KFD-1 maintains a non-drifting fact base.
KFD-2 bounds trust claims to that fact base.
KFD-3 makes trusted value available for cooperation.
KFD-4 preserves and transforms declared perspectives.
KFD-5 separates candidate genesis from qualification.
KFD-6 repeats bounded discovery over causal experience without self-certification.
KFD-7 keeps direction, perspective, authority, and occurrence independently
      addressable in real-world action.
```

This composition does not make every later KFD a theorem of the earlier ones.
It states dependency: a later procedure cannot claim KFD conformance while
bypassing the earlier fact, trust, cooperation, or perspective boundaries it
uses.

## Action extension

KFD-7 extends the shared model by treating fact cuts as object-like admitted
states and Episodes as morphism-like causal paths. Atlas, Pursuit, and Warrant
are reference action responsibilities or Primitives for observation,
direction, and admissible action. They are not Domain Profiles.

This active decision remains intentionally falsifiable. Activation does not
prove that the proposed roles are universally minimal or establish a literal
physical geometry. Its source-candidate lineage remains at
[`drafts/action-state-separation.md`](../drafts/action-state-separation.md).

## Formal reference contract

Every per-KFD formal page must expose:

1. authority and status;
2. imported vocabulary;
3. domain objects;
4. relations and predicates;
5. invariants;
6. state transitions where applicable;
7. proof obligations;
8. invalid states and counterexamples;
9. machine mappings;
10. non-claims and extension points.

Each formal statement must remain traceable:

| Formal statement | Decision source | Schema or check | Verification |
|---|---|---|---|
| A named invariant or transition | Exact decision section | Implementing profile, or `none` | Machine, manual, mixed, or not yet implemented |

An absent schema mapping is allowed and must be explicit. Inventing a machine
proof where only semantic review exists is not allowed.

## Versioning

`formal model version` is independent of package semver and schema interface
versions. Compatible clarification may retain the current formal version.
A change that alters object identity, invariant meaning, transition validity,
proof responsibility, or the relation to the authoritative decision requires a
new formal model version.

Because the formal layer is non-normative, changing it does not change a KFD by
itself. If the required correction changes the decision's meaning, the decision
governance rules in `CONTRIBUTING.md` apply.

## Limits

This model is itself a KFD-4 view: it is a declared engineering projection of
the KFD decisions, not reality and not a complete formal ontology of
intelligence or life. Its value is falsifiable precision. A definition that
cannot survive product evidence, counterexamples, or later causal experience
must be corrected rather than defended as final reality.
