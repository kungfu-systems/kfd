---
status: draft
period: 2026-07
theme: kfd-independent-verifier
doc_type: analysis
source_level: public-specifications
confidence: high
sensitivity: public
evidence_grade: B
review_state: self-reviewed
last_reviewed: 2026-07-17
---

# Verifier semantic inventory and specification gaps

This inventory separates existing product verification behavior from the
portable semantics that an independent verifier can reproduce. Source code was
used to audit current behavior, but an implementation check enters `kfd` only
when a published schema or specification states the same rule.

## Source coordinates

| Owner | Public specification | Current implementation witness |
|---|---|---|
| Xinfa | Kungfu ADR-0093, ADR-0094, ADR-0095; `xinfa/schema/*.schema.json` | `xinfa/src/pack.rs`, `xinfa/src/atlas.rs` |
| Kungfu Episode | ADR-0099, ADR-0100; Episode manifest trust-boundary document | `framework/episode-provider/src/git-workspace-episode-provider.mjs` and native typed-fold fsck |
| Buildchain | `docs/release-passport.md` | `packages/core/release-passport.js` |
| KFD | `schemas/**/*.json`, `standards.json`, KFD usage documents | `scripts/check.mjs` |

The first verifier release must pin exact source commits and SHA-256 digests in
`verifier/specs/sources.json` before publication.

## Semantic differences

| Surface | Identity and root | Canonical bytes | Binding and chain checks | Signature checks | Authority and non-claims |
|---|---|---|---|---|---|
| KFD record | Schema ID and interface version; optional fact digests inside each record | JSON Schema validates shape; the record format does not assign one universal root | Schema references resolve only to packaged KFD schemas; closed vocabularies fail unknown values | Profile-specific only; no generic signature is implied | Schema validity proves structural closure, not claim truth or product fitness |
| Buildchain release passport | `schemaVersion: 1`, `kungfu-buildchain-release-passport`; artifact and release coordinates | JSON object bytes are evidence artifacts, but passport verification primarily compares declared digests | Passport, artifact evidence, impact, agent index, product mechanism, optional publish transaction, package set, KFD sections | Trusted Publishing is evidence state, not a detached signature check | Proves release-evidence completeness; does not authorize installation or prove artifact behavior |
| Xinfa Context Pack | SHA-256 roots for source, policy, cut, authority, coverage, and Pack | Deterministic JSON plus LF for semantic roots; exact bytes for artifact roots | Inventory bytes, route parity/status, manifest, and compile receipt | None in v1 | Proves portable cut integrity and dual-first parity; not qualification or real-world fitness |
| Xinfa Atlas | `atlas_root` over the Atlas body plus linked component and Context Pack roots | Same semantic-root framing; exact bytes for views, Pack compatibility artifacts, and manifest | Declared scope, complete embedded Pack, exact Human/Agent views, manifest, receipt | None in v1 | Immutable compiled context primitive; views are projections, not separate authority |
| Git Workspace Episode | Preserved journal-native `semanticRoot`; independently computed `providerRoot` | UTF-8-key-sorted canonical manifest; canonical JSONL with terminal LF | Qualification root, claims digest/count/order, known schemas, provider-root preimage, safe export capability | None in the portable shadow | Never recomputes or replaces the C++ typed-fold Episode root |
| Native Episode fsck | Journal-native root over typed POD claims and append order | POD layout/version and typed fold, not JSON authority | Lifecycle, causal closure, frame/payload integrity, seal, content root | Product/runtime responsibility | Remains the Episode authority; outside the independent portable profile |

## Specification gaps and disposition

| ID | Owner | Gap | Why an independent implementation cannot guess | Disposition |
|---|---|---|---|---|
| GAP-XF-1 | Xinfa | The eight-schema Atlas schema-root set is described by implementation but not enumerated as one published manifest with pinned digests | A verifier cannot know whether an added schema participates in `roots.schema` | Package the current set under `verifier/specs/xinfa/` with source commit and digests; request an owner-side schema-set manifest |
| GAP-XF-2 | Xinfa | Route-root field removal and selected-node authority preimage are specified across ADR prose and schemas, not one algorithm document | Equivalent-looking implementations can hash different projections | Freeze the current v1 algorithm in the verifier profile and open an owner-side documentation issue |
| GAP-EP-1 | Kungfu Episode | Native POD Episode-root preimage is intentionally not reproducible from the Git shadow | Recomputing from JSON would create a second Episode authority | Preserve and qualify `semanticRoot`; never claim native-root recomputation |
| GAP-EP-2 | Kungfu Episode | The portable provider has no published JSON Schema for manifest, qualification, and segment rows | Structural drift otherwise depends on implementation code | Implement the rules stated by ADR-0099/0100 and request owner-published schemas before expanding the profile |
| GAP-BC-1 | Buildchain | Release Passport v1 has no standalone published JSON Schema or exhaustive check table | Optional sections and cross-file requirements can drift inside verifier code | Implement only documented v1 closure checks and request a Buildchain-owned schema/check manifest |
| GAP-BC-2 | Buildchain | KFD-1/2/3 passport subsections evolve through imported metadata and product registries | KFD must not silently duplicate Buildchain's complete release gate | Validate KFD subsections as KFD records when schema IDs are present; leave Buildchain-specific aggregation to its owner |
| GAP-KFD-1 | KFD | KFD schemas use a documented JSON-Schema subset but there was no independent executable validator | The existing repository check mixes schema conformance with repository-specific generation checks | Ship the independent `kfd-record` profile and keep repository generation checks in `scripts/check.mjs` |
| GAP-KFD-7-1 | KFD-7 | Closed on 2026-07-18: the package retains two qualified product Profile cuts, product reviews, release-gate evidence, and a separate KFD-level activation review | Structural validity still cannot qualify a future adopter by inheritance | Preserve `evidence/kfd-7/activation-record.json`; require every future Profile to bind its own evidence and review |
| GAP-SIG-1 | Multiple | No stable common signature envelope exists across the four surfaces | Inventing one would move format ownership and overstate trust | Do not add signature verification until an owner publishes a stable signature contract |
| GAP-WORK-1 | KFD live case | Pursuit, Warrant, and Envelope remain provisional names and cuts | Pre-minting verbs would weld candidate semantics prematurely | Defer these commands while the live case status is `provisional` |

## S1 decision

The independent v1 verifier can implement KFD-record schema validation, the
documented Release Passport closure subset, Xinfa Pack and Atlas roots, and the
qualified Git Episode shadow. Native Episode POD-root recomputation, generic
signatures, and provisional work-object verbs stay outside v1.

The verifier must surface profile coverage in every report. When a public
specification is incomplete, the correct result is an explicit unsupported or
degraded profile—not an implementation copied from private or product-internal
behavior.
