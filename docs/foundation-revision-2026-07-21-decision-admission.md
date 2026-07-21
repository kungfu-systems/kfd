# Foundation Revision: Decision Admission Layer

- Date: 2026-07-21
- Status: independently reviewed and merged
- Scope: pre-stable KFD-11 through KFD-13 numbering and responsibility order
- Machine map: `foundation-revision-2026-07-21-decision-admission.json`

## Weakness

The previous pre-stable sequence moved directly from KFD-10 Warrant to a
software-development work model. Claim, Assessment, and Decision appeared in
that software model even though KFD-2 already defines Claim and Assessment and
the distinction between Decision and Admission applies across domains.

Preserving the order would make a cross-domain trust-to-action boundary appear
to be software-specific. Appending the missing procedure after Project Cut
would preserve numbers but make the dependency order harder for humans and
agents to discover.

## Alternatives

1. **No new KFD.** Rejected because Decision and Admission remain unallocated
   and can be silently fused.
2. **Three KFDs for Claim, Assessment, and Decision.** Rejected because KFD-2
   already owns Claim and Assessment and the load-bearing property is their
   procedure-level separation.
3. **Append the procedure after Project Cut.** Mechanically cheaper, but leaves
   the first domain application before its cross-domain dependency.
4. **Pre-stable Foundation Revision.** Selected: allocate KFD-11 to the
   Claim-Assessment-Decision-Admission procedure and move the two draft
   software applications to KFD-12 and KFD-13.

## Mapping

```text
new KFD-11  cross-domain Claim -> Assessment -> Decision -> Admission procedure
old KFD-11  Software Work Responsibility Lifecycle -> new KFD-12
old KFD-12  Project Cut settlement                  -> new KFD-13
```

Old commit, package, digest, and rendered immutable coordinates remain facts of
their releases. This revision changes the latest pre-stable foundation; it
does not rewrite those artifacts or claim that their `/11` and `/12` meanings
were always the new meanings.

## Evidence and boundaries

The separation is supported by KFD-2's existing Claim and Assessment model,
KFD-10's Warrant responsibility, KFD-7's Fact-Episode distinction, and the
software-work live case that already keeps occurrence, claim, assessment,
decision, continuation, and settlement distinct.

The revision does not activate KFD-11, KFD-12, or KFD-13. Cross-domain
qualification, independent implementations, product cost, and each draft's
activation evidence remain open.

## Review and authorization

The maintainer authorized the pre-stable correction in the originating design
review. The pull request for this revision is the public review coordinate and
must receive approval from a reviewer who did not author the change before it
may merge. The final merge commit and PR review preserve completion evidence.

Review coordinate: [kungfu-systems/kfd#230](https://github.com/kungfu-systems/kfd/pull/230)

Review result: approved by `kungfu-origin` against head `8d9d633`; merged as
`903737e` on 2026-07-21.

## Release impact

The decision surface and latest numbered routes change, so the revision is
classified as `major` and `breaking` in `release-impact.json`. Package line
`v1.0` remains fixed under KFD release policy.
