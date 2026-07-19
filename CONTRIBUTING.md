# Contributing

KFD is an open, evidence-governed engineering standard under development.
Anyone may propose, challenge, implement, test, review, or provide evidence
against a KFD. The canonical namespace remains stewarded: open participation
does not make every suggestion normative or replace accountable maintainer
judgment with popularity.

All public contribution paths use GitHub issues and pull requests. Security
vulnerabilities are the exception and follow `SECURITY.md`.

## Ways to contribute

Useful contributions include:

- a new KFD Candidate or a narrower amendment to an existing candidate;
- a counterexample, falsifier, compatibility concern, or contradictory case;
- an adopter Profile from a new product, organization, or runtime domain;
- an independent implementation, verifier, schema, or interoperability test;
- improvements to decision text, formal references, terminology, or usage;
- qualification, activation, supersession, or rejection review;
- evidence that an active KFD should be clarified, narrowed, or superseded.

Use an issue when the claim boundary, alternatives, or evidence are still being
formed. Use a pull request when the proposed text, machine surfaces, impact,
and verification path are concrete enough to review.

GitHub provides structured entry points for a
[KFD proposal](https://github.com/kungfu-systems/kfd/issues/new?template=kfd-proposal.yml),
[counterexample or evidence](https://github.com/kungfu-systems/kfd/issues/new?template=kfd-counterevidence.yml),
and an
[adopter Profile](https://github.com/kungfu-systems/kfd/issues/new?template=adopter-profile.yml).
Blank issues remain available when none of those forms fits.

External proposals are not required to use Kungfu products or terminology.
They must preserve KFD identity, evidence, authority, and compatibility
boundaries where those boundaries are relevant to the proposal.

## Proposal lifecycle

The public lifecycle is:

```text
discussion or issue
  -> proposal
  -> KFD Candidate
  -> qualification evidence
  -> explicit promotion
  -> numbered draft
  -> independent review and activation evidence
  -> active KFD
  -> explicit supersession when necessary
```

A proposal may be accepted, revised, split, merged, kept provisional, rejected,
or closed with `no new KFD is justified`. Material outcomes should preserve a
public rationale and the evidence or missing evidence that determined them.

Maintainers own the official numbering, status, release, and namespace
decisions. They do not own the underlying reality: adopter evidence,
counterexamples, and independent review remain first-class inputs and must not
be discarded merely because they originated outside kungfu-systems.

See `GOVERNANCE.md` for roles, decision authority, conflicts, and maintainer
succession.

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

A contributor may propose a candidate by issue or pull request. A maintainer is
required to allocate a number or change official status, but maintainer
authorship is not required for candidate genesis, evidence, implementation, or
review.

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
- Every normative decision states its adopter-facing applicability. A separate
  founding-adoption statement may bind kungfu-systems more broadly, but it
  cannot narrow the portable standard to one organization.
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

External contributors may initiate and supply evidence for a Foundation
Revision. Explicit maintainer authorization is required because the procedure
changes the canonical pre-stable foundation, not because the proposal must
originate inside kungfu-systems.

This procedure does not suspend KFD-1. Before stable, the declared contract is
that published coordinates are immutable while the latest foundation remains
revisable only through this procedure. Rewriting history or bypassing the
procedure is drift; a reviewed revision is not.

The first stable release performs the **Foundation Freeze**. Its review
confirms the final numbers, order, kinds, statuses, relationships, product
witnesses, and prerelease lineage. After that freeze, a number and its meaning
cannot be changed in place; later substantive change requires explicit
supersession by a new KFD.

## Review and decision record

- A contributor must disclose material organizational, financial, product, or
  implementation interests relevant to a proposal.
- The author of a substantive proposal cannot be its only reviewer.
- Activation and Foundation Revision require an independent reviewer who did
  not author the change.
- Maintainers may reject a proposal, but should state the claim boundary,
  missing evidence, conflict, duplication, or other reason publicly.
- Adoption by a company, project, or product supplies evidence; it does not
  automatically grant official status or maintainer authority.
- Repeated high-quality contribution and review may qualify a participant for
  maintainership under `GOVERNANCE.md`.

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
