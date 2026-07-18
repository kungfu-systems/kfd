---
status: active
period: 2026-07-18
theme: kfd-7-activation
doc_type: qualification-record
source_level: public-repositories
confidence: high
sensitivity: public
evidence_grade: A
review_state: independently-reviewed
last_reviewed: 2026-07-18
---

# KFD-7 Activation Evidence

[Decision](../decisions/KFD-7.md) ·
[Formal reference](KFD-7-formal.md) ·
[Usage](KFD-7-usage.md) ·
[Machine record](../evidence/kfd-7/activation-record.json)

## Qualification cut

The activation candidate binds two independently implemented product Profiles
to `@kungfu-tech/kfd@1.0.0-alpha.35`:

| Product Profile | Domain | Exact availability cut | Product review |
|---|---|---|---|
| Buildchain release transaction | release intent, passport, publication authority, transaction, and admission | `kungfu-systems/buildchain@f5a591fc79b84ba1b5809f2523060bcc4fd4739e` | [qualification review](https://github.com/kungfu-systems/buildchain/pull/1383#pullrequestreview-4728683864) and [activation review](https://github.com/kungfu-systems/buildchain/pull/1383#pullrequestreview-4728690266) |
| Kungfu agent work state | durable direction, declared perspective, bounded authority, causal continuation, and admitted Fact cuts | `kungfu-systems/kungfu@218e253573bf38ffde745c5b192c1d18e319f43e` | [qualification review](https://github.com/kungfu-systems/kungfu/pull/1091#pullrequestreview-4728705815) and [activation review](https://github.com/kungfu-systems/kungfu/pull/1096#pullrequestreview-4728790299) |

Both Profiles retain all thirteen version 2 evidence categories. They reuse the
same session round-trip theorem and context-insufficiency corollary while
mapping the responsibilities to non-isomorphic runtime domains. Their product
contracts are `qualified`, their activation verdicts are `activate`, and their
required evidence contains no `planned` or `failed` obligation.

## What the evidence establishes

The retained cuts demonstrate, within the declared Profiles:

- counterfactual role independence and prohibited cross-role inference;
- simple-session expansion and projection across all five decision
  observations;
- fail-visible complexity breakpoints and same-payload valid-action
  counterexamples;
- authority decay, perspective staleness, intent continuity, causal replay,
  retry, compensation, migration, rebuild, and cold-start continuation;
- release-gate reconstruction from an independently packaged KFD schema;
- independent product review and green source, native, and cross-platform
  qualification gates.

Buildchain and Kungfu do not share one storage model or lifecycle vocabulary.
Their commonality is the responsibility and evidence contract, not an imposed
implementation shape.

## Decision boundary

The exact qualified cut was independently approved in
[review 4728837515](https://github.com/kungfu-systems/kfd/pull/190#pullrequestreview-4728837515)
at commit `bb6f651480efb165fd15798bd9d0c029821a8f06`. The separate activation
verdict cites that immutable review and changes `registry.json` and
`standards.json` to `active`. Later Profile qualification does not rewrite this
cut or inherit its verdict.

## Non-claims

The evidence does not prove universal minimality, require five stores or five
forms, replace legal or product authorization, prove every provider correct,
or turn technical occurrence into success or completion. Future Profiles own
their concrete mapping, qualification, residual risk, and release boundary.
