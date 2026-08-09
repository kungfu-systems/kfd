---
status: incubating
period: 2026-08-09
theme: durable-result-identity-availability
doc_type: kfd-candidate
source_level: public-repository-evidence-and-maintainer-judgment
confidence: medium
sensitivity: public
evidence_grade: B
review_state: unreviewed
last_reviewed: 2026-08-09
---

# KFD Candidate: Durable Result Identity and Availability Separation

- Candidate status: incubating
- Kind candidate: principle
- Slot binding: non-binding
- Number allocated: no

[Live case](../cases/live/durable-result-identity-availability/README.md)

## One sentence

When a durable result may be reused across time or location, its immutable
identity, retention commitment, observed availability, transport coordinates,
and qualification must remain independently addressable.

## Candidate rule

A content digest answers what bytes or canonical facts a result binds. It does
not prove that those bytes remain available, that anyone promised to retain
them, that a transport currently reaches them, or that the result remains
qualified for a receiver's purpose.

An adopting system should therefore preserve separately:

- **result identity**: the exact inputs, transformation, environment boundary,
  outputs, and qualification roots that define the result;
- **retention commitment**: who or what promises to retain it, under which
  class and until which declared boundary;
- **availability observation**: whether the result is currently available,
  missing, partial, corrupt, quarantined, expired, or unverifiable at an
  explicit observation cut;
- **transport coordinate**: how a caller may attempt retrieval without
  confusing a mutable locator with result identity or storage authority;
- **reuse assessment**: an explicit-time, exact-root, fail-closed decision
  that may reject reuse without changing the historical result.

These responsibilities may share one physical record. They remain distinct
when one can change, expire, fail, move, or be revoked without silently
changing another.

## Founding pressure field

Buildchain v4 Stage Capsule is the founding product witness. At exact merge
commit `7499b8dc988af2f9f1cb1796230adf3bee33bac1`, it separates identity,
retention promise, availability, transport observations, qualification, and
reuse; restores content from a content-addressed store; and plans deterministic
resume after late-stage failure. Its protected qualification ran Buildchain
self-dogfood and a Kungfu shadow consumer on Linux x64, macOS arm64, and
Windows x64 with fail-closed fault campaigns.

That evidence is strong product genesis, not cross-domain qualification. The
implementation remains shadow-only: TypeScript v3 is the sole writer, Rust is
validation-only, production reuse is disabled, and Buildchain and Kungfu are
inside the same founding ecosystem.

## Why this may deserve a portable principle

Existing build systems already combine action keys, result metadata, and
content-addressed storage. Provenance formats bind artifacts to how they were
produced. The potentially irreducible burden exposed by Stage Capsule is
narrower: systems repeatedly treat a stable identity, a retention policy, a
current observation, a locator, and a trust decision as if any one proved the
others.

If the distinction changes safe reuse and recovery decisions across unrelated
domains, it may be a portable principle. If KFD-1, KFD-2, KFD-7, ordinary
content-addressed storage, and adopter-specific Profiles reproduce every
decision-relevant observation, no new KFD is justified.

## Competing hypotheses

1. **New portable principle**: cross-time reuse requires identity, retention,
   availability, transport, and qualification separation in any domain.
2. **KFD-1/KFD-2/KFD-7 composition**: non-drifting facts, fact-bound trust, and
   visible degraded coordinates already imply the complete responsibility.
3. **Buildchain Domain Profile**: the separation is valuable but specific to
   staged build recovery and should remain adopter-owned.
4. **Existing infrastructure composition**: action cache, CAS, provenance, and
   explicit storage policy provide equivalent closure without KFD expansion.

## Qualification gate

Promotion requires at least:

1. exact-root KFD-5 genesis and a retained Buildchain founding cut;
2. deletion and fuse comparison against KFD-1, KFD-2, KFD-7, and KFD-13;
3. prior-art comparison against Remote Execution/CAS, provenance, reproducible
   build records, artifact registries, and ordinary lease or retention policy;
4. one structurally non-build transfer, such as agent checkpoint continuation,
   scientific workflow recovery, dataset/model custody, or backup restoration;
5. an implementation that does not reuse Buildchain writer code and can vary
   identity, retention, availability, transport, and qualification independently;
6. bounded production dogfood with explicit rollback, zero false reuse, and
   measured false rebuild and reconstruction cost;
7. independent exact-cut review and an authority-separated terminal
   disposition of promotion, subsumption, rejection, or `no-new-kfd`;
8. explicit maintainer promotion if and only if the responsibility remains
   irreducible after those tests.

## Falsifiers

The candidate should be subsumed, rejected, or closed with no new KFD if:

- existing KFD decisions and an adopter Profile reproduce every bounded reuse
  and recovery decision without hidden reconstruction;
- the distinction is only a clearer schema for build-cache metadata;
- independent domains do not need retention commitment or transport to remain
  separately addressable;
- a digest plus ordinary storage and trust policy provides equivalent closure
  at lower total cost;
- production use requires provider identity, ambient state, or a second
  authority that contradicts the proposed separation;
- measured users or agents receive no safer decision or lower reconstruction
  burden from the additional model.

## Interest and claim boundary

Kungfu-systems stewards KFD and owns the founding Buildchain implementation,
so the first-party product interest is material and explicit. Independent
review and a non-Buildchain implementation are required before promotion.

The genesis evidence is limited to the public sources named above. Private
discussions, credentials, hidden model state, and unretained hosted-runner
payloads are outside the evidence cut.

This Candidate has no number, slot hint, active status, certification,
production-reuse authority, or cross-domain qualification. It does not make
Stage Capsule normative, require one schema or store, certify Buildchain v4,
or prevent a terminal `no-new-kfd` disposition.
