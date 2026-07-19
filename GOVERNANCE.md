# Governance

## Purpose

KFD is an open, evidence-governed engineering standard under development for
reliable action and continuity under uncertainty. Fact-bound human-agent
systems are its founding pressure field, not its applicability limit.
Kungfu-systems is the founding steward and Kungfu is the founding
implementation, but neither defines the limit of KFD adoption, evidence,
criticism, or future contribution.

This governance model separates two responsibilities:

```text
open participation       who may propose, test, challenge, adopt, and review
canonical stewardship    who may change official KFD numbers, status, and releases
```

Both are necessary. Participation without stewardship produces ambiguous
authority. Stewardship without open evidence turns a proposed standard into an
internal rulebook.

## Roles

### Participant

Any person, agent, project, company, or research group may open a discussion,
ask a question, provide a counterexample, or review public evidence.

### Contributor

A contributor supplies a proposal, text, schema, implementation, adopter
Profile, verifier, test, case, or review. Contributions use the DCO process in
`CONTRIBUTING.md`.

### Adopter

An adopter declares where and how it applies one or more KFDs. It owns its
Profile mapping, implementation behavior, qualification evidence, legal and
product authority, residual risk, and user-facing claims. Adoption does not
imply certification or endorsement.

### Reviewer

A reviewer evaluates the declared claim boundary, alternatives, evidence,
falsifiers, compatibility impact, implementation witness, and non-claims.
Independent review means the reviewer did not author the change and is not
silently evaluating its own implementation.

### Maintainer

Maintainers steward the canonical repository, KFD namespace, numbered status,
release surfaces, and decision process. They may accept, revise, reject,
activate, or supersede proposals only through reviewable repository history.
Maintainer authority does not make unsupported claims true.

## Decision model

KFD does not use popularity as a qualification test. Broad support may be
adoption evidence, but normative decisions are made against:

- the declared problem and applicability boundary;
- alternatives and prior art;
- supporting and disconfirming evidence;
- falsifiers and unresolved risks;
- implementation and interoperability witnesses;
- compatibility, migration, and supersession consequences;
- independent review.

Maintainers decide the official result and record the reason. When evidence is
insufficient, the correct result may be revision, continued incubation,
rejection, or `no new KFD is justified`.

No private discussion, company affiliation, model output, or maintainer
reputation overrides the public fact source. Security reports may remain
private while remediation is coordinated under `SECURITY.md`.

## Canonical authority

The official KFD fact source is the commit-addressed
`kungfu-systems/kfd` repository. Official numbers, statuses, schemas, and
release coordinates are created only through that source and its declared
release process.

Apache-2.0 permits forks and derivative work. Forks may experiment with
alternative decisions and governance, but they must not claim official KFD
status without explicit authorization. See `TRADEMARKS.md`.

Canonical stewardship is intentionally narrower than intellectual ownership:
participants may disagree, fork, publish alternatives, or decline adoption.
Disagreement is a valid cooperation state.

## Maintainer admission and succession

Maintainer access is based on demonstrated stewardship rather than employment
or company membership alone. A candidate should show sustained ability to:

- reason from facts and preserve claim boundaries;
- engage seriously with counterevidence and external perspectives;
- review decision, schema, compatibility, and implementation consequences;
- disclose conflicts and avoid self-certification;
- preserve public rationale, lineage, and non-claims;
- carry release and security responsibilities appropriate to the role.

An existing maintainer proposes admission or removal through a public pull
request or governance record. Admission requires review by at least one other
maintainer. As the independent adopter base grows, maintainership should also
grow beyond the founding organization when qualified stewards are available.

Emergency suspension may protect releases or security boundaries, but its
scope and reason must be recorded publicly when disclosure is safe.

## Conflicts of interest

Participants disclose interests that could materially affect a proposal or
review. A conflicted maintainer may contribute facts and analysis but should
not be the sole decision owner. A product implementation cannot be its own
only activation evidence.

## Founding adoption

Kungfu-systems adopts active KFDs across the scopes declared by its products
and repositories. This is a founding commitment, not a restriction on the
standard's applicability.

Other adopters choose their own scope and remain responsible for accurate
claims. KFD conformance does not transfer legal authority, product approval, or
responsibility from an adopter to the KFD maintainers.

## Pre-stable scope revision

Earlier prerelease texts described KFD primarily as the organization-wide
decision registry of kungfu-systems and scoped decisions directly to
kungfu-systems surfaces. That wording correctly recorded founding adoption but
incorrectly implied that the standard itself ended at the founding
organization.

The open-standard revision separates those responsibilities:

```text
before: KFD applicability = kungfu-systems organizational scope
after:  KFD applicability = declared adopter scope
        kungfu-systems commitment = founding mandatory adoption
```

The revision does not weaken existing kungfu-systems obligations. It makes the
portable boundary explicit, opens proposal and counterevidence paths, and
requires independently reviewed, evidence-governed canonical decisions. It is
a pre-stable Foundation Revision and must retain breaking impact, immutable
published coordinates, review, and migration lineage.
