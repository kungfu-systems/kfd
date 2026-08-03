---
status: active
period: 2026-08-03
theme: kfd-load-bearing-dogfood-continuity
doc_type: evidence-synthesis
source_level: public-repository-evidence
confidence: high
sensitivity: public
evidence_grade: B
review_state: independently-reviewed
last_reviewed: 2026-08-03
---

# KFD Under Load: Kungfu `f08ade5b` Continuity Cut

This document is an immutable successor to the
[2026-08-03 evidence cut](load-bearing-dogfood-2026-08-03.md). It tests whether
later Kungfu development invalidated that cut. It does not revise either prior
document, change a numbered KFD, qualify a Primitive, activate KFD-6, or widen
Kungfu's shipped-support declaration.

Independent review: [KFD pull request 306, review 4841695660](https://github.com/kungfu-systems/kfd/pull/306#pullrequestreview-4841695660).

## Exact coordinates

- prior Kungfu evidence cut:
  [`a2967f22d0d23766eb887168e8fffc41251bad54`](https://github.com/kungfu-systems/kungfu/commit/a2967f22d0d23766eb887168e8fffc41251bad54);
- continuity cut:
  [`f08ade5b49115e6ff00409b8dce86a377d4b3f3d`](https://github.com/kungfu-systems/kungfu/commit/f08ade5b49115e6ff00409b8dce86a377d4b3f3d);
- current KFD package coordinate checked by the adopter:
  `@kungfu-tech/kfd@1.0.0-alpha.47`;
- available successor KFD package coordinate:
  `@kungfu-tech/kfd@1.0.0-alpha.53`;
- KFD normative metadata root:
  `sha256:65899780779a8e933f1f3a298bfdf2311104ccde84b773a0828ee4c23dd19d5b`;
- current adopter KFD Alpha release-anchor root:
  `sha256:c4e0ca30c47b3cfca1b6d2d00c6277d62dd71423fd367e355f0f231c8a0b445d`;
- successor KFD Alpha release-anchor root:
  `sha256:d50e474cf2d158722d765f54188550e30fa126e1728fc9eb748014e220acfc9b`.

The normative metadata root is unchanged from the adopter's previous
`1.0.0-alpha.47` coordinate. Alpha 53 therefore offers a new immutable release
and evidence boundary without changing the meaning, revision, or lifecycle
status of KFD-1 through KFD-13. Kungfu has not yet adopted that package
coordinate.

## Continuity result

The following Kungfu authority families have no source diff between the prior
and continuity cuts:

- `framework/primitive` and `framework/incubation`;
- `framework/project-cut`;
- `framework/work-design-advisor` and
  `framework/work-design-policy-replay`;
- `framework/upgrade`;
- `framework/episode`, `framework/fact`, and `framework/action`;
- `extensions/work-control`;
- the Primitive Management, Fact/Episode/Action, Episode Object Model, and
  evolution documents used by this comparison.

Later changes refresh KFD projections and add product-performance evidence;
they do not replace the semantic owners above. The 2026-08-03 conclusions
therefore remain current at `f08ade5b`:

```text
KFD-4: operationally useful and still bounded to declared perspectives
KFD-5: explicit product genesis and qualification machinery, not shipped support
KFD-6: non-conforming historical/advisory precursors, still unsupported
```

## Adopter-coordinate result

Kungfu's support matrix cannot validly advance its upstream package and
release-anchor coordinates to KFD Alpha 53 in isolation. The
`@kungfu-tech/buildchain@3.0.2-alpha.3` runtime used by this Kungfu cut declares
KFD Alpha 47, and Kungfu's product gate requires the direct KFD coordinate,
Buildchain runtime coordinate, and generated support projection to agree. A
consumer override would erase that published runtime boundary rather than prove
an upgrade.

The valid release order is therefore:

1. Buildchain adopts KFD Alpha 53 and publishes a new Alpha runtime;
2. Kungfu adopts that Buildchain runtime and the matching direct KFD package;
3. Kungfu regenerates and checks its KFD product gate and support projection.

After that coordinate-only upgrade, the expected support rows remain:

- the shipped-support set remains exactly KFD-1, KFD-2, KFD-3, and KFD-7;
- KFD-4 and KFD-5 remain non-shipped candidates;
- KFD-6 remains explicit unsupported non-adoption;
- KFD-8 through KFD-13 remain non-conforming draft adopter evidence only.

The semantic continuity claim is complete at `f08ade5b`; the package-coordinate
refresh is pending the upstream Buildchain release. Neither state is a support
promotion.

## Reproduction

At the two exact repository cuts, a reviewer can reproduce the central claim
with a path-bounded Git diff and independently hash the two KFD package
authorities:

```text
git diff --name-status a2967f22d0d23766eb887168e8fffc41251bad54 \
  f08ade5b49115e6ff00409b8dce86a377d4b3f3d -- \
  framework/primitive framework/incubation framework/project-cut \
  framework/work-design-advisor framework/work-design-policy-replay \
  framework/upgrade framework/episode framework/fact framework/action \
  extensions/work-control docs/architecture/primitive-management-plane.md \
  docs/architecture/fact-episode-action-runtime.md \
  docs/concepts/episode-object-model.md docs/evolution
sha256(KFD standards.json) = 65899780779a8e933f1f3a298bfdf2311104ccde84b773a0828ee4c23dd19d5b
sha256(KFD Alpha 47 kfd.release.json) = c4e0ca30c47b3cfca1b6d2d00c6277d62dd71423fd367e355f0f231c8a0b445d
sha256(KFD Alpha 53 kfd.release.json) = d50e474cf2d158722d765f54188550e30fa126e1728fc9eb748014e220acfc9b
```

The expected Git diff is empty. A non-empty result invalidates this continuity
cut and requires a new successor rather than an in-place edit.

## Explicit non-claims

This cut does not prove independent adoption, universal Primitive minimality,
cross-domain transfer, complete false-candidate rejection, a conforming
autonomous discovery loop, or stable-release fitness. It does not turn a
package upgrade, a green source check, or product performance evidence into a
KFD activation or shipment decision.
