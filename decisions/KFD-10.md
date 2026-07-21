# KFD-10: Authority must remain explicit, bounded, and revocable

- Status: draft
- Number: 10
- Kind: principle
- Applies to: any adopting product, repository, agent workflow, or participant-facing interface that authorizes consequential transitions

## One sentence

Authority must remain explicit, bounded, derivable, attenuable, expirable,
and independently revocable.

## Rule

A **Warrant** is the independently addressable authority coordinate for an
admissible action or continuation. It preserves enough boundary to determine:

- issuer, holder, and any delegation chain;
- action, subject, resource, target state, and consequence scope;
- preconditions, validity window, and exact roots or cuts on which it depends;
- attenuation, renewal, expiry, revocation, refusal, or consumption state;
- retained and transferred responsibility for residual risk.

A Warrant is not authentication, technical capability, intention, assignment,
pressure, planning, occurrence, or retrospective success. Those may support a
decision without becoming authority.

## Independence

Warrant answers:

```text
Who may perform this bounded transition against this declared state, and under
which constraints?
```

A Pursuit does not issue authority merely by existing. An Atlas may be a state
condition of a Warrant without becoming permission. An Episode can record use
of authority but cannot retroactively authorize what occurred.

Derived authority must not amplify its parent without a new independent
source. Revoked, expired, stale-target, or out-of-scope authority fails closed.

## Gate

A conforming claim:

- binds exact issuer, holder, scope, target, constraints, and derivation;
- makes attenuation, expiry, revocation, renewal, and refusal independently
  testable;
- prevents capability, assignment, occurrence, or success from synthesizing
  authority;
- preserves historical authority use after later revocation or expiry;
- keeps delegation distinct from responsibility transfer;
- allows a Domain Profile to choose token format, approval process, lifecycle,
  and interface without changing the coordinate's responsibility.

## Status boundary

KFD-10 is a numbered draft promoted from the
[Warrant bounded authority candidate](../drafts/warrant-bounded-authority.md).
The candidate remains public source lineage. This decision allocates the
number and canonical term, but it does not claim universal empirical
qualification or active status.

## Relationship

KFD-7 establishes the Action Responsibility Geometry. KFD-10 specifies its
authority coordinate. KFD-8 supplies the perspective and Fact cut against
which conditions may be checked; KFD-9 supplies direction; Episode records
realized use and consequence without proving authorization.

## Non-claims

KFD-10 does not provide legal advice, replace domain authorization systems,
require one capability technology, or require an explicit prompt for every
local reversible action.
