---
status: draft
period: 2026-08-08
theme: recursive-normative-self-conformance
doc_type: kfd-candidate
source_level: local-files
confidence: medium
sensitivity: public
evidence_grade: A
review_state: unreviewed
last_reviewed: 2026-08-08
---

# Recursive normative self-conformance

- Candidate ID: `recursive-normative-self-conformance`
- Status: qualifying
- Kind candidate: procedure
- Number: none
- Slot binding: non-binding

## One sentence

A normative system should route load-bearing changes to its own rules through
the same fixed-root, authority-separated conformance path it requires of
adopters.

## Candidate claim

The proposed procedure makes recursive application explicit:

```text
declared normative cut
  -> pre-number genesis
  -> fact-bound qualification
  -> independent review
  -> authority-separated disposition
  -> admitted successor cut or retained non-promotion
```

The fixed cut, verifier, review, and disposition authorities remain distinct.
A generator cannot certify its own candidate. A structural verifier cannot
choose the semantic outcome. A passing report cannot allocate a number,
activate a decision, merge a change, or publish a release.

## Why this is only a Candidate

KFD already contains most or all of this responsibility:

- KFD-1 preserves exact normative coordinates and compatibility boundaries;
- KFD-2 makes conformance claims fact-bound and risk-bounded;
- KFD-5 separates genesis from qualification and permits `no new primitive`;
- KFD-11 separates claim, assessment, authorized decision, and admission;
- the Self-Conformance Profile supplies a fixed package, transition verifier,
  lifecycle chain, review receipt, and explicit non-authority boundary.

The open question is therefore not whether recursive self-application is
useful. It is whether that composition needs an additional numbered KFD or is
already the minimum closure of existing decisions and the Profile.

## Qualification burden

The Candidate must survive all of the following without relying on its own
text as proof:

1. exact-root KFD-5 genesis;
2. deletion and fuse comparison against KFD-1, KFD-2, KFD-5, and KFD-11;
3. replay of KFD-1 through KFD-3 bootstrap, KFD-7 activation, the KFD-11
   through KFD-13 Foundation Revision, and at least one retained gap;
4. package-only clean-room verification and native/WASM parity;
5. adversarial failure when roots, predecessor, review, authority, package, or
   claim boundary are substituted;
6. independent review of the exact evidence cut;
7. a terminal `qualified`, `provisional`, `rejected`, or `no-new-kfd`
   disposition issued by an authority other than the generator or verifier.

## No-new-KFD condition

No new KFD is justified if deletion of this Candidate leaves the combined
KFD-1/KFD-2/KFD-5/KFD-11 obligations and the fixed Self-Conformance Profile
able to reproduce every decision-relevant observation, while adding the
Candidate only names their composition rather than a new identity, boundary,
authority, lifecycle, or operation.

## Terminal disposition

The exact assessment cut at
`5791476b226b0ce26f98538704e71f7e29e04956` satisfied that condition.
Independent review `PRR_kwDOTLH7GM8AAAABIy0qZA` accepted `no-new-kfd`: the
procedure remains useful as an explicit composition, but it adds no irreducible
identity, boundary, authority, lifecycle, or operation. The retained terminal
Profile report is a non-promotion outcome and does not allocate a number.

The Candidate registry records `merged` to preserve this lineage. Here,
`merged` means merged into the existing normative closure, not merged Git state,
activation, publication, or release. Reopening requires a new exact evidence
cut satisfying one of the retained counterconditions.

## Claim boundary

This Candidate has no number and no active status. Its `no-new-kfd` disposition
does not amend existing
KFD text, reinterpret historical releases, certify the Self-Conformance
Profile, approve its own evidence, or authorize promotion, merge, or release.
