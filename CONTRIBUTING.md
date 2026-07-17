# Contributing

KFD entries are maintainer decisions: they record norms the organization has
already committed to, so they land by pull request from a maintainer rather
than by open proposal rounds.

## Candidates and numbered drafts

KFD has two distinct pre-active states:

- A **KFD Candidate** is a non-normative, pre-number draft under `drafts/`.
  It has a stable candidate ID and may carry a non-binding `slotHint`, but it
  does not allocate or reserve a KFD number.
- A **numbered draft** is already a KFD decision under `decisions/KFD-N.md` and
  `registry.json` with `status: draft`. Its number has been allocated even
  though its activation gate remains open.

Candidates may be revised, reordered, split, merged, withdrawn, rejected, or
promoted. Promotion is the explicit act that creates a numbered decision,
updates `registry.json`, and records lineage from the candidate. A slot hint
must never be cited as a KFD number or treated as a promise that the candidate
will receive that number.

## Ground rules

- Every published package, tag, and commit is immutable. Before the first
  stable KFD release, the Foundation Revision procedure below may explicitly
  authorize substantive refinement or structural correction. Every affected
  prerelease coordinate remains immutable. After the first stable release,
  decision texts are **append-only**: substantive semantic change mints a new
  KFD that supersedes the old number. Stable numbers are never reused or
  renumbered.
- Newer numbers do not automatically override older decisions. A later KFD may
  supersede or override an earlier KFD only when the later text states that
  relationship explicitly and `registry.json` records it. Conflicting active
  decisions without an explicit relationship must be fixed before release.
- Every KFD declares a `kind`: `principle` for standing cross-repository
  truths, or `procedure` for a decision process that enforces or protects a
  principle.
- Every change must keep `registry.json` and `decisions/` in agreement:
  `node scripts/check.mjs` must pass (it is the Buildchain verify gate).
- Versioning of this package follows KFD-1 itself: the outer package line is
  fixed at `v1.0`; content operations are patches. Registry-schema or
  package-structure changes may require `minor` or `major` surface-impact
  review in `release-impact.json`, but they do not silently open a new package
  major or minor line.

## Pre-stable Foundation Revision

The first stable KFD release is the first published package version without a
prerelease identifier. Until that release, a fully evidenced Foundation
Revision may revise, reorder, split, merge, withdraw, or renumber a numbered
KFD, regardless of whether its current status is `draft` or `active`.

This is a bounded correction window, not permission to rewrite history. A
Foundation Revision must:

1. identify the concrete weakness that preserving the current structure would
   make load-bearing;
2. compare alternatives, consequences, migration cost, and disconfirming
   evidence;
3. receive explicit maintainer authorization and independent review;
4. classify the final change as breaking decision-surface impact in
   `release-impact.json`;
5. preserve every published commit, tag, package, digest, and rendered
   immutable coordinate;
6. publish an old-to-new lineage and migration map for every changed number;
7. update decisions, registries, standards metadata, site projections,
   package exports, and witnesses in one reviewable change.

The revision fails closed if its evidence, lineage, or migration mapping is
incomplete.

This procedure does not suspend KFD-1. Before stable, the declared contract is
that published coordinates are immutable while the latest foundation remains
revisable only through this procedure. Rewriting history or bypassing the
procedure is drift; a reviewed revision is not.

The first stable release performs the **Foundation Freeze**. Its review
confirms the final numbers, order, kinds, statuses, relationships, product
witnesses, and prerelease lineage. After that freeze, a number and its meaning
cannot be changed in place; later substantive change requires explicit
supersession by a new KFD.

## Commit conventions

- English, lightweight Conventional Commits (`type(scope): summary`).
- Sign every commit with the Developer Certificate of Origin: `git commit -s`.

## Branches and releases

Day-to-day work lands on `dev/v1/v1.0`; releases are promoted through
Buildchain channel pull requests (`dev -> alpha -> release`). See the
Buildchain documentation for the release governance model.

Production release passports must use `release-impact.json` as the
surface-aware impact ledger:

```yaml
release-passport-impact-json: release-impact.json
```

Before opening a production release PR, update that ledger if the release
changes a registered machine surface. KFD content operations are normally
`patch`; additive registry schema or package-structure changes are `minor`
surface impacts; breaking registry schema or package-structure changes are
`major` surface impacts. Those impact labels are release-passport review
signals for the fixed `v1.0` KFD package line.
