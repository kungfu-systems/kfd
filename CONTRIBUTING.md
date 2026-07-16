# Contributing

KFD entries are maintainer decisions: they record norms the organization has
already committed to, so they land by pull request from a maintainer rather
than by open proposal rounds.

## Ground rules

- Every published package, tag, and commit is immutable. Before the first
  stable KFD release, a maintainer may explicitly authorize substantive
  refinement of an existing numbered decision in place. Such a change must be
  identified as a breaking decision-surface impact in `release-impact.json`,
  preserve prior prerelease artifacts, and never rewrite a published tag.
  After the first stable release, decision texts are **append-only**:
  substantive semantic change mints a new KFD that supersedes the old number.
  Numbers are never reused or renumbered.
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
