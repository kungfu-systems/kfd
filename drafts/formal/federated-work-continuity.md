# Federated Work Continuity Formal Candidate

[Candidate](../federated-work-continuity.md) ·
[Live case](../../cases/live/federated-work-continuity/README.md) ·
[Candidate registry](../registry.json)

- Status: experimental
- Normative: no
- Formal candidate version: 1
- Authority: `drafts/federated-work-continuity.md`
- Slot binding: non-binding

## Purpose

This model separates the useful Work-level interface from the unresolved claim
that Work requires an independent authoritative entity. It supports
qualification of both a stable-entity hypothesis and a derived-view
hypothesis.

## Component world

Let `F_i@c_i` be the admitted Fact cut of workspace `i`. Each workspace owns
its local objects and relations. A federated observation never rewrites them:

```text
C = {(workspace_i, cut_i, proof_i, availability_i)}
```

There is no implied global cut `c*`. `C` is a declared set of component cuts.

## Work view

For observer `o`, root reference `r`, traversal policy `q`, and component cuts
`C`, define:

```text
WV(o, r, q, C) = (
  root_ref,
  included_refs,
  typed_edges,
  component_cuts,
  proof_state,
  unresolved_refs,
  degraded_components,
  action_frontier,
  declared_loss
)
```

`WV` is a perspective-bound projection. Equal visible nodes do not imply equal
views when observer, relation policy, cuts, availability, proof, or loss differ.

## Competing identity models

### H1: independent entity

```text
W^v = (work_id, version_root, declared_whole, membership_policy,
       lineage, settlement_relation)
```

`work_id` survives decomposition and execution location. `version_root`
identifies one declaration. This hypothesis is valid only if changing or
deleting `W` changes a real continuation or settlement decision while all
component objects remain fixed.

### H2: derived view

```text
WorkRef = (owning_workspace, object_kind, subject, version_root, cut_root)
WV = derive(WorkRef, q, C)
```

No separate Work authority exists. The stable root object and typed relations
provide identity; `WV` provides the user-level whole at a declared observation
cut. This is preferred if it preserves equivalent decisions at lower cost.

### H0: no new Primitive

An Initiative and its Assignment graph are sufficient. Work remains ordinary
product vocabulary. Qualification must retain this outcome.

## Invariants

```text
W1  Execution path, repository, branch, session, and worktree are locators, not Work identity.
W2  A federated view preserves every component's owning authority and cut.
W3  Membership or graph edges do not transfer Atlas, Warrant, completion, or trust.
W4  Missing or stale components remain visible as degraded or unresolved.
W5  Child progress does not imply Work completion or settlement.
W6  Equal node payload does not erase observer, relation policy, cut, proof, or loss.
W7  Read federation does not imply distributed write authority or an atomic global snapshot.
W8  A new Work entity is invalid unless it changes decisions beyond Initiative and query semantics.
```

## Distinguishability test

Hold all component Fact roots, Initiative roots, Assignment roots, relations,
and Project Cuts fixed. Vary only the proposed Work declaration or derivation
policy.

```text
DistinctWork(W1, W2) iff
  ContinuationDecision(W1) != ContinuationDecision(W2)
  or SettlementScope(W1) != SettlementScope(W2)
  or RequiredReconstruction(W1) materially differs from RequiredReconstruction(W2)
```

If no bounded case satisfies this relation, H1 fails. If H2 provides no value
over a normal Initiative query, the new-Primitive claim fails.

## Operations under test

```text
locate(root_ref)
traverse(direction, relation_types, depth)
inspect(component_cuts, proof, loss)
derive_frontier(policy)
compare(view_1, view_2)
rebind_locator(workspace_identity, new_path)
degrade(unavailable_or_stale_component)
continue(exact_target_ref, owning_workspace)
```

These are candidate operations, not a required API or proof of independent
object identity.

## Proof obligations

- Compare H0, H1, and H2 on the same evidence cut and user questions.
- Prove path-independent identity and workspace-qualified references.
- Preserve per-relation cycle policy and non-inheritance semantics.
- Demonstrate partial federation without global-clock or dual-write claims.
- Measure reconstruction and decision effort, not only query latency.
- Test whether the model transfers outside multi-repository software work.

## Non-claims

This model does not allocate a KFD number, establish Work as a Primitive,
require one graph database, define a universal completion percentage, create a
global fact world, or make every user manage explicit lower-layer objects.
