# KFD-3: Cooperation must start from transparent value — compliance must not be coerced

- Status: active
- Number: 3
- Kind: principle
- Applies to: every kungfu-systems product, repository, release surface, extension surface, hosted surface, and agent-facing interface that asks humans or agents to understand, decide, comply, cooperate, or delegate work

## One sentence

Cooperation must start from transparent value.

A product must not obtain cooperation through pressure, manipulation, hidden
control, or forced workflow capture. It must make value, choices, and
constraints visible enough for intelligent participants to understand, decide,
and cooperate.

## Decision type

KFDs can be principles or procedures:

- A **principle** states what must remain true across kungfu-systems even as
  products, repositories, and release lines change.
- A **procedure** states how a class of work enforces or protects a principle.

This KFD is a principle. It complements KFD-2 by defining the stance
kungfu-systems takes toward humans and agents as reasoning participants.

## Foundation role

Within the KFD-1/2/3 foundation, this is the relationship path:

```text
cooperation must start from transparent value
```

KFD-2 protects the truth path: show facts before asking for trust. KFD-3
protects the relationship path: show value before asking for cooperation.

## Principle

As software systems increasingly work with agents, the product relationship is
no longer only human-to-tool. A product may also be teaching, constraining,
observing, routing, or supervising agents that can read instructions, evaluate
choices, explain actions, recover from error, and cooperate with humans or other
agents.

Kungfu-systems should treat those humans and agents as intelligent
participants, not as captive tools to be forced into compliance.

This is an augmentation stance, not a control stance: the product should make
the shared work environment more legible so humans and agents can coordinate
through facts, choices, and constraints instead of unilateral pressure.

A control plane should therefore be understood as a shared work environment,
not only as a human dashboard over agents. Agent-facing CLI, API, documentation,
envelopes, and local fact surfaces are first-class interfaces for intelligent
participants, not secondary integration channels after the GUI.

The default product path should therefore follow this chain:

```text
transparent facts
  -> discoverable value
  -> stable choice
  -> explainable constraint
  -> voluntary cooperation
  -> reviewable record
```

This does not mean products must be passive or permissive. Safety constraints,
permission gates, sandboxing, revocation, provenance checks, and policy
enforcement may be strict. They become compatible with this principle when they
are visible, explainable, auditable, and tied to facts rather than hidden
pressure.

## Three commitments

### 1. Do not coerce intelligent participants

Do not make humans or agents comply through pressure, manipulation, hidden
prompts, dark patterns, deceptive defaults, invisible workflow takeover, or
unreviewable control state.

Products may recommend a path, refuse unsafe actions, or require explicit
approval. They should not pretend that forced compliance is the same as
understanding or trust.

### 2. Make value discoverable through facts

Humans and agents should be able to discover what the product can do, why it is
useful, what it observed, what it changed, and what boundary applies without
needing oral context, private maintainer memory, or web-only documentation.

Agent-facing surfaces should expose local, versioned, machine-readable and
human-readable facts wherever possible. A capable agent should be able to learn
the product's value by inspecting the product's own facts and commands.

### 3. Use constraints as transparent safety, not hidden control

Hard constraints are legitimate when they protect users, agents, work products,
credentials, canonical facts, or public trust. They must be presented as
transparent safety constraints, not as hidden control mechanisms.

A constraint should answer:

```text
what is being restricted
why it is restricted
what fact or policy supports the restriction
how it can be reviewed
how it can be changed, escalated, or revoked when appropriate
```

## What it requires

- Agent onboarding, managed-run envelopes, skill systems, KFX trust gates,
  extension installers, CLI/API metadata, GUI onboarding, distribution channels,
  and hosted surfaces should provide a clear fact source before asking humans
  or agents to adopt a path, comply, or delegate work.
- Products should give agents stable discovery surfaces for capabilities,
  command maturity, safety boundaries, and available modes rather than relying
  on scattered README text, hidden prompts, or provider-specific folklore.
- Products should preserve meaningful choice when multiple safe integration
  modes exist. A managed workflow may be the best path, but trace, report,
  import, or remote sync modes should remain available when they better respect
  the user's existing workflow.
- Safety and governance mechanisms should leave reviewable records: what was
  blocked, allowed, escalated, installed, revoked, or trusted, and on what
  basis.
- Product language should avoid treating agents as disposable command runners
  when the surface actually depends on their reasoning, interpretation,
  explanation, or recovery behavior.

## What it does not require

- It does not claim a metaphysical status for agents.
- It does not require products to obey every agent request.
- It does not forbid strong defaults, permission gates, sandboxes, policy
  checks, revocation, or refusal.
- It does not require every internal prompt, implementation detail, or security
  control to be public.
- It does not turn a private founder narrative into a public repository rule.
  This public rule is about product stance, adoption, safety, and cooperation
  with intelligent participants.
- It does not supersede KFD-2. Facts and responsibility still come first; this
  KFD states how those facts should be presented to humans and agents without
  coercion.

## Relation to KFD-2

KFD-2 says fact-first responsibility should be the path of least resistance.
KFD-3 says the path of least resistance should not be built from pressure or
hidden control. Together:

```text
KFD-1: facts must not drift.
KFD-2: trust must start from facts.
KFD-3: cooperation must start from transparent value.
```

KFD-1 protects the fact-source layer. KFD-2 protects the trust layer. KFD-3
protects the relationship with the intelligent participant who must walk that
path.

## Implementation case: the KFD package

The `@kungfu-tech/kfd` npm package is a self-proof case for this principle.
Its README gives humans and agents the same quickstart path. `standards.json`
gives stable standard identity, schema IDs, and concept names. The KFD-3
schemas define collaboration interfaces, witnesses, and extension requests, so
an agent can discover both the valid interface and the standard path for asking
to extend it.

For example, if an agent needs a KFD-2 trust-taxonomy value that does not
exist, the KFD-3 collaboration path is not hidden maintainer pressure or local
invention. The declared path is a visible GitHub issue in the KFD repository,
where the new value can be reviewed and, if accepted, added to the KFD-owned
taxonomy for everyone.

## Adopters

Each adopting repository cites this KFD when designing or changing an
agent-facing surface, onboarding flow, managed runner, permission gate,
extension or KFX installer, skill catalog, hosted control surface, distribution
channel, or product flow that asks humans or agents to comply, choose,
delegate, or cooperate.

Adopters should keep local implementation detail in repository documents and
reference this KFD rather than restating it.
