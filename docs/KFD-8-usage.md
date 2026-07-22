# KFD-8 Implementation Notes

[Authoritative decision](../decisions/KFD-8.md) ·
[Formal reference](KFD-8-formal.md) ·
[Documentation map](MAP.md)

KFD-8 is a numbered draft. It promotes Atlas from an elaboration candidate to
the canonical perspective coordinate while preserving the candidate as source
lineage.

## Adoption shape

An adopter should expose an immutable Atlas version or equivalent root that
binds observer, accepted sources, Fact cut, scope, freshness, omissions,
conflicts, and declared loss. A mutable current reference may select a later
version but must not rewrite the view used by an earlier action.

The Domain Profile owns concrete fields, lifecycle names, storage, refresh
policy, retrieval, and presentation. Conformance depends on inspectable
perspective responsibility, not on an object count or the use of one database.

## Qualification

Retain positive and negative evidence for:

- equal visible payload with different cuts or freshness and different safe
  decisions;
- perspective transformation and replay with declared provenance and loss;
- stale, degraded, conflicted, and superseded views;
- failure to infer intent, authority, or completeness from an Atlas;
- the low-complexity session limit and the breakpoint at which Atlas must
  become independently addressable.

## Migration from the candidate

The numbered decision and this formal reference are now authoritative for the
draft rule. The candidate page remains a historical genesis and qualification
record; its former non-allocation language is superseded by KFD-8.
