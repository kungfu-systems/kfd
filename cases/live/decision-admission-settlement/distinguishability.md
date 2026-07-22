---
status: active
period: 2026-07-21
theme: decision-admission-distinguishability
doc_type: live-case-analysis
source_level: repository-evidence
confidence: high
sensitivity: public
evidence_grade: B
review_state: self-reviewed
last_reviewed: 2026-07-21
---

# Distinguishability and Qualification

The candidate is one procedure with four independently variable
responsibilities, not a claim that all four are newly discovered nouns.

## Deletion witnesses

| Deleted distinction | Histories held equal | Decision that changes |
|---|---|---|
| Claim | Same evidence and occurrence, different proposition or claimant | What exactly is being relied on and who owns the assertion? |
| Assessment | Same Claim and evidence, different purpose, checked boundary, or residual risk | May this Claim be trusted for this purpose? |
| Decision | Same Assessment, different Warrant, policy, conditions, or disposition | Which consequential effect is authorized? |
| Admission | Same authorized Decision, one effect admitted and one stale, conflicted, denied, or failed | Which successor Fact is authoritative? |

If Admission is removed, two histories can contain the same Claim, Assessment,
Decision, and requested effect while only one has a valid successor Fact. The
procedure therefore cannot stop at Decision.

## Fuse tests

- Fusing Claim with evidence makes evidence state its own proposition.
- Fusing Assessment with Claim makes a statement certify itself.
- Fusing Assessment with Decision turns trust judgment into authority.
- Fusing Decision with Admission makes authorization self-executing and hides
  stale basis, conflicts, denial, write failure, and partial application.

Equivalent implementations may use one transaction, object, API, or screen if
the distinctions remain independently inspectable and retry-safe.

## Alternatives

KFD-2 already owns generic Claim and Assessment, so separate numbered KFDs for
those nouns would duplicate authority. Leaving Decision and Admission inside
software work would make the boundary appear domain-specific. Treating a
database transaction, approval, merge, release, or mandate as sufficient is
retained as an implementation possibility only when it preserves equivalent
responsibility, evidence, and failure semantics.

## Qualification result

The deletion and fuse tests pass at the contract level. The KFD repository
publishes a schema and verifier checks, and PR #230 received independent
review. First-party settlement and release workflows provide pressure but do
not yet establish independent cross-domain adoption. The KFD-5 result therefore
remains provisional.

## Falsifiers

- Claim or Assessment cannot vary independently in a relevant adopter domain.
- Decision authority and Admission outcome can always be fused without losing
  stale, conflict, denial, failure, retry, or successor-state information.
- Existing portable transaction or authorization standards preserve the same
  responsibilities with lower total burden.
- Implementations cannot expose the distinctions without unacceptable cost or
  user friction.
- Cross-domain examples require incompatible meanings rather than one portable
  procedure.
