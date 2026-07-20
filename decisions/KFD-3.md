# KFD-3: Cooperation must start from trusted value

- Status: active
- Number: 3
- Kind: principle
- Applies to: any adopting product, repository, release surface, extension surface, hosted surface, or participant-facing interface that asks humans or agents to understand, decide, comply, cooperate, or delegate work

## One sentence

Cooperation must start from trusted value.

A product must not obtain cooperation through pressure, manipulation, hidden
control, or forced workflow capture. It must make value, facts, choices, and
constraints inspectable enough for intelligent participants to decide.

## Decision

An adopting system treats humans and agents as reasoning participants, not
captive tools. Products should make shared work more legible so participants can
coordinate through facts, choice, and explainable constraints rather than
unilateral pressure.

GUI, CLI, API, documentation, envelopes, and local fact surfaces are all
first-class participant interfaces; agent access is not a secondary integration
channel added after the human dashboard.

This is an augmentation stance, not a permissiveness requirement. Safety
gates, sandboxing, policy enforcement, refusal, and revocation may be strict
when their facts, purpose, authority, and review path remain visible.

Cooperation is also epistemic infrastructure. Different views remain isolated
unless participants can expose and compare them without surrendering their
fact boundaries. Trusted cooperation makes counterexamples, missing facts, and
better primitives available to the shared system.

## Commitments

### 1. Do not coerce intelligent participants

Do not use hidden prompts, deceptive defaults, dark patterns, invisible
workflow takeover, manipulation, or unreviewable control state. A product may
recommend, refuse, or require approval, but must not present forced compliance
as understanding or trust.

### 2. Make value trustable

Participants should be able to discover what the product can do, why it is
useful, what it observed or changed, and what boundary applies without relying
on oral context, private maintainer memory, or web-only documentation.

KFD calls such a bounded statement a **Participant Value Claim**. Important
Participant Value Claims bind to KFD-2 facts, evidence, assurance
responsibility, and residual-risk state.
Human-readable and machine-readable surfaces should expose the same
participant-relevant information.

### 3. Make constraints transparent

A constraint states:

```text
what is restricted
why it is restricted
which fact or policy supports it
how it can be reviewed
how it can be changed, escalated, or revoked
```

Hard constraints protect participants, work, credentials, canonical facts, and
public trust. Hidden constraints become control.

## Interface requirements

- Agent onboarding, envelopes, extension gates, installers, CLI/API metadata,
  GUI flows, and hosted surfaces provide a discoverable fact source before
  asking participants to adopt or delegate.
- Capabilities, maturity, safety boundaries, modes, and extension paths use
  stable discovery surfaces rather than scattered prose or provider folklore.
- Meaningful choice remains available when multiple safe integration modes
  exist.
- Allowed, blocked, escalated, installed, revoked, and trusted actions leave
  reviewable records.

## Boundaries

KFD-3 makes no metaphysical claim about agents, does not require obedience to
agent requests, and does not forbid strong defaults or private security
controls. It requires participant-facing value and constraints to remain
inspectable. It does not supersede KFD-2: transparent value becomes trusted
through facts, not instead of them.

## Relation to KFD-1 and KFD-2

```text
KFD-1: facts must not drift.
KFD-2: trust must start from facts.
KFD-3: cooperation must start from trusted value.
```

KFD-1 protects the fact world, KFD-2 protects reliance on it, and KFD-3
protects the relationship with the participant deciding whether to cooperate.

## Verification

The `@kungfu-tech/kfd` package gives humans and agents the same public
quickstart, publishes KFD-3 collaboration-interface and witness schemas, and
binds value evidence to KFD-2 assessment. Package self-proof and extension
paths are documented in `docs/KFD-3-usage.md`.

## Adopters

Adopters cite KFD-3 when a product asks humans or agents to choose, comply,
delegate, install, trust, or cooperate. Product-specific interface evidence
remains adopter-owned.
