# Release Governance Notes

KFD releases are governed by Buildchain channel promotion. The package version
line stays fixed at `v1.0`; alpha and production releases move through
protected channel branches.

For alpha promotion, Buildchain treats the provenance path as part of the
release contract:

```text
dev/v1/v1.0 -> alpha/v1/v1.0
```

The alpha branch must be updated by a merged same-repository pull request whose
head is `dev/v1/v1.0` and whose base is `alpha/v1/v1.0`. A temporary promotion
branch may satisfy GitHub freshness rules, but it is not a valid Buildchain
release source for KFD alpha publishing.

The `dev` merge immediately preceding an alpha promotion must be performed by
the promotion PR author after independent approval. This keeps the resulting
`dev` head distinct from the independent reviewer, so the alpha branch's
required last-push approval can be satisfied without bypassing protection or
changing the release source.

The protected branch required status check must also name the status emitted by
the current Verify workflow. As of the alpha.14 line, that required check is:

```text
check / check
```

Keeping the branch protection rule and the workflow-emitted status name aligned
is part of KFD-1's "facts must not drift" requirement: the release gate cannot
depend on a stale status context that no current workflow can produce.
