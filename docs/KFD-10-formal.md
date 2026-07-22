# KFD-10 Formal Reference

[Authoritative decision](../decisions/KFD-10.md) ·
[Usage](KFD-10-usage.md) ·
[KFD-7 formal reference](KFD-7-formal.md)

- Status: experimental
- Normative: no
- Formal model version: 1
- Authority: `decisions/KFD-10.md`
- Decision status: draft

## Object

At Fact cut `f`, a Warrant version is:

```text
W^v = (id, root, grantor, holder, action_scope, subject_scope, resource_scope,
       target_roots, preconditions, validity_conditions, limits,
       delegation_policy, derivation_chain, revocation_channel,
       residual_responsibility)
```

For candidate action `u` at cut or time `t`:

```text
Valid_W(f, u, t) = AuthenticGrant(W^v)
  and not Revoked(W^v, t)
  and WithinWindow(W^v, t)
  and TargetRootsMatch(W^v, f)
  and PreconditionsHold(W^v, f)
  and u in PermissionCone(W^v, f)
```

## Derivation and invariants

```text
Derives(W_child, W_parent) ->
  Scope_child subseteq Scope_parent
  and Validity_child implies Validity_parent
  and Limits_child attenuate Limits_parent
```

```text
W1 Authentication or capability does not imply Warrant.
W2 Warrant does not imply Atlas, Pursuit, Episode, success, or completion.
W3 Revoked, expired, stale-target, or out-of-scope authority is invalid.
W4 Derived authority cannot amplify its parent without a new source.
W5 Delegation does not silently transfer residual responsibility.
W6 Historical authority use remains inspectable after invalidation.
```

## Transitions

```text
Grant -> Attenuate | Delegate | Renew | Revoke | Expire | Consume | Refuse
```

Concrete lifecycle and approval policy remain Domain Profile-owned.

## Falsifiers

The draft weakens if existing authorization objects preserve equivalent
decisions and lifecycle at lower total cost, if Warrant cannot remain distinct
from Atlas, Pursuit, or Episode, or if explicit authority adds ceremony without
reducing unsafe inference or repeated investigation.
