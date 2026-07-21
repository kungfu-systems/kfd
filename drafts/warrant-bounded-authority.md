---
status: promoted
period: 2026-07-18
theme: warrant-bounded-authority
doc_type: kfd-candidate
source_level: maintainer-consensus
confidence: high
sensitivity: public
evidence_grade: C
review_state: self-reviewed
last_reviewed: 2026-07-21
---

# KFD Candidate: Warrant Bounded Authority

- Candidate status: promoted to KFD-10
- Kind candidate: principle
- Allocated decision: 10
- Slot binding: non-binding

[Formal candidate](formal/warrant-bounded-authority.md)

## Promotion

This candidate was promoted on 2026-07-21 to
[KFD-10](../decisions/KFD-10.md). The numbered draft is now the authoritative
rule and its [formal reference](../docs/KFD-10-formal.md) owns the current
non-normative model. This page remains source-candidate lineage.

## One sentence

Permission to act must remain explicit, bounded, derivable, and independently
revocable.

## Candidate rule

A Warrant is the cross-domain action coordinate that makes authority for a
proposed action or continuation independently addressable.

It preserves enough boundary to determine:

- who or what issued and holds the authority;
- which action, subject, state, and consequence class are in scope;
- which constraints and preconditions apply;
- how authority was derived, delegated, or attenuated;
- when it expires, is revoked, or requires renewed judgment;
- who retains responsibility for residual risk.

A Warrant is not intention, context, authentication, capability discovery,
planning, execution, or retrospective success. Those may support an authority
decision without becoming the authority itself.

## Relation to the action system

Within the
[cross-domain action coordinate candidate](action-state-separation.md), Warrant
answers:

```text
Who may perform this bounded transition against this declared state and under
which constraints?
```

A Pursuit does not automatically issue a Warrant. An Atlas may be bound into a
Warrant's state condition without becoming permission. An Episode records what
occurred and cannot retroactively authorize it.

## Generative role

Warrant becomes visible when work crosses a participant, tool, organization, or
consequence boundary and the downstream participant should not have to infer
permission from pressure, hierarchy, task assignment, or successful execution.

The candidate should be tested against approval records, consent, mandates,
capability tokens, role-based access control, delegated plans, standing
authority, and provider permission prompts.

The non-normative formal candidate defines Warrant versions, validity,
permission cones, attenuation, transitions, session projection, and proof
obligations without replacing domain authorization systems.

## Invalid compressions

The candidate rejects systems that infer:

- permission from an active Pursuit or assigned task;
- authority from authentication or technical capability;
- descendant authority from a parent Warrant without checked derivation;
- current authority from an expired, revoked, stale, or out-of-scope grant;
- authorization from successful or beneficial consequence;
- responsibility transfer from delegation alone.

## Qualification gate

Promotion requires:

1. deletion witnesses where removing explicit authority changes whether an
   action may safely proceed;
2. delegation, attenuation, expiry, revocation, and stale-state evidence;
3. comparison with approval, consent, mandate, access-control, capability, and
   provider-prompt alternatives;
4. cross-domain evidence covering both digital and real-world consequences;
5. negative tests proving that intent, perspective, capability, occurrence, and
   success do not synthesize authority;
6. a product witness that reduces repeated authority investigation without
   encouraging over-broad standing permission;
7. independent review of whether Warrant belongs at standard level.

## Falsifiers

The candidate weakens or fails if:

- existing authorization objects preserve equivalent decisions and lifecycle
  boundaries at lower total cost;
- authority rarely survives long enough to require independent identity;
- Warrant cannot remain distinct from Pursuit, Atlas, or Episode;
- derivation and revocation cannot transfer across domains;
- product evidence increases permission ceremony without reducing unsafe
  inference or repeated investigation.

## Numbering boundary

The former slot hint was non-binding until explicit promotion. KFD-10 is now
allocated by `decisions/KFD-10.md` and `registry.json`; this lineage document
does not replace or extend that numbered authority.
