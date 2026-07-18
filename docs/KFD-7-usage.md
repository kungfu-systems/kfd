# KFD-7 Implementation Notes

[Authoritative decision](../decisions/KFD-7.md) ·
[Formal reference](KFD-7-formal.md) ·
[Documentation map](MAP.md)

KFD-7 defines a proposed cross-domain action model that keeps direction,
perspective, authority, and occurrence independently addressable. The
authoritative text is `decisions/KFD-7.md`; its registry status is `draft`.

## Package surface

- `decisions/KFD-7.md`: the authoritative numbered draft.
- `docs/KFD-7-formal.md`: the non-normative Fact/Episode and action-geometry
  reference.
- `drafts/action-state-separation.md`: preserved source-candidate lineage.
- `drafts/atlas-action-perspective.md`: non-binding Atlas elaboration
  candidate.
- `drafts/pursuit-intent-continuity.md`: non-binding Pursuit elaboration
  candidate.
- `drafts/warrant-bounded-authority.md`: non-binding Warrant elaboration
  candidate.
- `standards.json#/standards/kfd-7`: identity, status, formal reference,
  concepts, and digests.
- `scripts/check.mjs`: registry, document, metadata, route, and evidence
  closure.

KFD-7 does not yet publish a universal machine schema. A schema would need to
choose boundaries for Fact cuts, causal records, role references, derivation,
composition, defaults, and responsibility. Those choices require product
dogfood before KFD can weld them as a general interface.

## Adoption profile

An adopter should expose:

1. the Fact cut and declared perspective used for judgment;
2. the continuing direction or intended consequence;
3. the applicable authority boundary and derivation;
4. the causal record of what actually happened;
5. explicit admission of successor facts;
6. distinctions among occurrence, progress, success, completion, and
   settlement;
7. degraded, defaulted, expired, revoked, or missing responsibility.

The concrete store, API, CLI, GUI, and vocabulary remain product-owned.
Implementations may use Atlas, Pursuit, Warrant, and Episode directly or map
domain-native objects to the same responsibilities.

## Progressive disclosure

KFD-7 does not require every user to fill out four forms before ordinary work.
For a simple task with one goal, one adequate context, one stable permission
grant, one execution, and little state change, the expected interface is the
familiar session:

```text
goal              <- Pursuit
context           <- Atlas
tool permissions  <- Warrant
run or transcript <- Episode
input and result  <- Fact cuts
```

The product should construct and retain the underlying responsibilities
without requiring the participant to manage them separately. It may infer
low-risk defaults or collapse interface steps when:

- the default derivation remains inspectable;
- consequence and authority boundaries are bounded;
- escalation reveals the independent roles;
- later audit can recover which role supplied each decision;
- simplification does not synthesize permission, occurrence, or completion.

The interface expands only at a complexity breakpoint: several goals,
perspective or freshness changes, delegated or revoked authority, several
Episodes, or material Fact branching. This preserves the low-cost session
experience while making complex work representable without hidden state.

An adopter should test both directions: simple work round-trips through the
action model without semantic loss or object ceremony, and complex work
reveals the role whose independence has become decision-relevant.

## Draft evidence boundary

The package proves that KFD-7 is numbered, routed, digest-bound, formally
described, and exposed to humans and agents from one source. It does not prove
that the proposed action roles are universally minimal, that one product has
implemented them correctly, or that the activation gate has passed.
