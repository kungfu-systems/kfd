# KFD-8 Formal Reference

[Authoritative decision](../decisions/KFD-8.md) ·
[Usage](KFD-8-usage.md) ·
[KFD-7 formal reference](KFD-7-formal.md)

- Status: experimental
- Normative: no
- Formal model version: 1
- Authority: `decisions/KFD-8.md`
- Decision status: draft

## Object

At Fact cut `f`, an Atlas version is:

```text
A^v = (id, root, perspective_holder, vantage, decision_scope,
       source_bindings, fact_cut, projection_policy, freshness_conditions,
       omissions, conflicts, unknowns, declared_loss, lineage)
```

Its observation projection is `pi_A^v: F_f -> O_A`. For candidate action `u`:

```text
Supported_A(f, u) =
  RequiredFacts(u) visible under pi_A^v
  and SourceBoundary(A^v) satisfied
  and FreshEnough(A^v, u)
  and not MateriallyContradicted(A^v, u)
```

Support does not imply direction or authority.

## Invariants

```text
A1 Atlas identity is independent of session, query, path, and UI route.
A2 Equal payload does not erase source, cut, freshness, omission, or loss.
A3 Atlas does not imply Pursuit or Warrant.
A4 Transformation preserves source lineage and declares loss.
A5 Stale or degraded Atlas state cannot silently present current support.
A6 Moving a current ref does not rewrite an earlier Atlas root.
```

For bounded decision domain `D`, two Atlases are decision-equivalent only when
they produce the same support decisions and interchangeable provenance,
freshness, omission, conflict, and loss boundaries throughout `D`.

## Transitions

```text
Declare -> Refresh -> Transform | Degrade | Compare -> Supersede
```

Every consequential transition preserves prior roots. Concrete lifecycle
labels remain Domain Profile-owned.

## Machine mapping

`schemas/kfd-8/atlas-coordinate.schema.json` and the fixed
`profiles/perspective-conformance/vectors.json` inventory make identity, source
authority, exact Fact cut, freshness, omission and loss, stale/degraded/conflict
visibility, lineage, moving-reference non-rewrite, and semantic non-inference
machine-checkable through the shared native/WASM verifier core. A pass remains
offline, non-qualifying, and non-self-certified; it does not activate KFD-8.

## Falsifiers

The draft weakens if ordinary context or snapshot objects preserve equivalent
decisions at lower total cost, if Atlas cannot remain distinct from Pursuit or
Warrant, or if the responsibility does not transfer beyond its founding
software implementation.
