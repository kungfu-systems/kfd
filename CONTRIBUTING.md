# Contributing

KFD entries are maintainer decisions: they record norms the organization has
already committed to, so they land by pull request from a maintainer rather
than by open proposal rounds.

## Ground rules

- Decision texts are **append-only**. Editorial clarification may be applied
  in place; substantive semantic change mints a new KFD that supersedes the
  old number. Numbers are never reused or renumbered.
- Newer numbers do not automatically override older decisions. A later KFD may
  supersede or override an earlier KFD only when the later text states that
  relationship explicitly and `registry.json` records it. Conflicting active
  decisions without an explicit relationship must be fixed before release.
- Every KFD declares a `kind`: `principle` for standing cross-repository
  truths, or `procedure` for a decision process that enforces or protects a
  principle.
- Every change must keep `registry.json` and `decisions/` in agreement:
  `node scripts/check.mjs` must pass (it is the Buildchain verify gate).
- Versioning of this package follows KFD-1 itself: content operations are
  patches; only registry-schema or package-structure changes move minor or
  major.

## Commit conventions

- English, lightweight Conventional Commits (`type(scope): summary`).
- Sign every commit with the Developer Certificate of Origin: `git commit -s`.

## Branches and releases

Day-to-day work lands on `dev/v1/v1.0`; releases are promoted through
Buildchain channel pull requests (`dev -> alpha -> release`). See the
Buildchain documentation for the release governance model.
