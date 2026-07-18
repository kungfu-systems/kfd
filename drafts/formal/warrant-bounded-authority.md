# Warrant Bounded Authority Formal Candidate

[Candidate](../warrant-bounded-authority.md) ·
[KFD-7 formal reference](../../docs/KFD-7-formal.md) ·
[Candidate registry](../registry.json)

- Status: experimental
- Normative: no
- Formal candidate version: 1
- Authority: `drafts/warrant-bounded-authority.md`
- Slot binding: non-binding

## Purpose

This page makes the Warrant candidate precise enough to compare with approval,
consent, mandate, access control, capability token, delegated plan, and
provider permission alternatives. It does not allocate KFD-10 or replace a
domain's legal or authorization system.

## Object model

At a declared Fact cut `f`, a Warrant version is:

```text
W^v = (
  warrant_id,
  version_root,
  issuer,
  holder,
  action_scope,
  subject_and_resource_scope,
  target_roots,
  preconditions,
  consequence_ceiling,
  validity_window,
  delegation_chain,
  revocation_channel,
  residual_responsibility
)
```

`warrant_id` preserves the authority object's identity. `version_root` binds
one exact grant or attenuation. `target_roots` prevents authority granted
against one state from silently surviving a material state change.

Authentication establishes participant identity. Capability establishes
technical possibility. Neither establishes authority.

## Validity and permission cone

For candidate action `u` at time or logical cut `t`:

```text
Valid_W(f, u, t) =
  AuthenticGrant(W^v)
  and not Revoked(W^v, t)
  and WithinValidityWindow(W^v, t)
  and TargetRootsMatch(W^v, f)
  and PreconditionsHold(W^v, f)
  and u in C_W^v(f)
```

`C_W^v(f)` is the bounded permission cone. Authorization is:

```text
Authorized_W(f, u) = Valid_W(f, u, now)
```

The Warrant does not claim that the action advances a Pursuit, is supported by
an Atlas, occurred, or succeeded.

## Delegation and attenuation

A derived Warrant cannot amplify authority without a new independent source:

```text
Derives(W_child, W_parent) ->
  C_W_child(f) subseteq C_W_parent(f)
  and Time_child subseteq Time_parent
  and Scope_child subseteq Scope_parent
  and Consequence_child <= Consequence_parent
```

Delegation may preserve residual responsibility with the issuer, holder, or
both. Responsibility transfer must be explicit; it is not implied by technical
delegation.

## Equivalence

For a bounded decision domain `D`:

```text
WarrantEquivalent_D(W1, W2) iff
  for all f, u, t in D:
    Valid_W1(f, u, t) = Valid_W2(f, u, t)
  and their issuer, derivation, revocation, and residual-responsibility
      consequences are interchangeable for D
```

Equal action scopes do not establish equivalence when issuer, target root,
expiry, revocation, or responsibility differs.

## Transitions

```text
Grant(issuer, holder, scope, roots, constraints) -> W^1
Attenuate(W^v, narrower_boundary)                -> W_child
Delegate(W^v, new_holder, narrower_boundary)     -> W_child
Renew(W^v, new_cut_or_window)                    -> successor Warrant version
Revoke(W^v, reason)                              -> revocation receipt
Expire(W^v, boundary)                            -> invalid after boundary
Consume(W^v, action)                             -> optional Profile-owned use state
Refuse(W^v, reason)                              -> no action authorization
```

Consumption is optional because some Warrants are single-use and others are
standing grants. Revocation, expiry, target mismatch, and attenuation remain
semantically distinct even when a Profile presents fewer lifecycle labels.

## Invariants

```text
W1  Warrant identity is independent of authentication, capability, task, and session.
W2  Warrant does not imply Atlas, Pursuit, Episode, success, or completion.
W3  Revoked, expired, stale-target, or out-of-scope authority is not current authority.
W4  Derived authority cannot amplify its parent without a new source.
W5  Parent authority does not silently authorize a descendant action.
W6  Delegation does not silently transfer residual responsibility.
W7  Historical authority use remains inspectable after revocation or expiry.
```

## Session projection

Inside the KFD-7 low-complexity boundary:

```text
Warrant -> one stable, inspectable, low-risk permission boundary
```

Compression is valid only while the grant remains stable and adequate for the
session. It must stop when authority is delegated, attenuated, renewed,
expired, revoked, target-sensitive, externally consequential, or disputed.

## Derived action binding

A proposed action binds one exact Warrant root:

```text
ActionBinding.warrant_root = root(W^v)
```

Validation occurs against the candidate action and current Fact cut. An
Episode may later record use of that binding but cannot retroactively make an
invalid Warrant valid.

## Proof obligations

- Preserve exact grant, issuer, holder, scope, target roots, and constraints.
- Demonstrate expiry, revocation, target mismatch, delegation, and attenuation
  as independently testable cases.
- Prove non-amplification for derived authority.
- Demonstrate actions that are possible but unauthorized and authorized but
  never occur.
- Compare total lifecycle cost with approval records, RBAC, capabilities,
  consent, mandates, and provider prompts.
- Show a session round trip and the breakpoint where the Warrant must become
  explicit.

## Invalid states

- Authentication or capability is treated as permission.
- Pursuit ownership or task assignment is treated as authority.
- A child action inherits parent scope without checked derivation.
- A revoked, expired, or stale-target grant remains actionable.
- Successful consequence retroactively authorizes an action.
- Delegation silently erases residual responsibility.

## Non-claims

This model does not provide legal advice, replace domain authorization systems,
prove universal necessity, require one token format, make every local action
ask for permission, or allocate a KFD number. Conflict policy, consumption,
multi-party approval, and concrete lifecycle vocabulary remain Profile-owned.
