---
status: draft
period: 2026-08-05
theme: semantic-self-sufficiency
doc_type: analysis
source_level: repository
confidence: high
sensitivity: public
evidence_grade: A
review_state: self-reviewed
last_reviewed: 2026-08-05
---

# KFD semantic self-sufficiency matrix

The machine-readable authority for this coverage cache is
[`evidence/semantic-self-sufficiency/kfd-1-13.json`](../evidence/semantic-self-sufficiency/kfd-1-13.json),
validated against
[`schemas/kfd-semantic-self-sufficiency-matrix.schema.json`](../schemas/kfd-semantic-self-sufficiency-matrix.schema.json).
This human view records whether the KFD repository alone currently supplies a
normative source, machine contract, retained fixtures, failing cases, verifier,
and honest gap statement for each numbered decision. “Partial” is not a softer
form of “complete”; it identifies a concrete missing public interface.

| KFD | Status | Normative source | Machine contract | Fixtures / failing cases | Offline verifier | Coverage | Open gap |
| --- | --- | --- | --- | --- | --- | --- | --- |
| KFD-1 | active | `decisions/KFD-1.md` | `schemas/kfd-1/*` | verifier and Buildchain witness fixtures | Rust/WASM + `scripts/check.mjs` | complete | broader independent adopter corpus |
| KFD-2 | active | `decisions/KFD-2.md` | `schemas/kfd-2/*` | retained release claims and trust assessments | Rust/WASM + repository checks | complete | non-Kungfu adopter evidence |
| KFD-3 | active | `decisions/KFD-3.md` | `schemas/kfd-3/*` | collaboration interface prebuild/artifact witnesses | repository checks | complete | plural external value surfaces |
| KFD-4 | active | `decisions/KFD-4.md` | `schemas/kfd-4/*` | perspective replay fixtures in live cases | Rust/WASM | partial | standalone fixed negative vector inventory |
| KFD-5 | active | `decisions/KFD-5.md` | `schemas/kfd-5/*` | `cases/live/*` genesis and distinguishability records | repository checks | partial | independent primitive qualification corpus |
| KFD-6 | draft | `decisions/KFD-6.md` | `schemas/kfd-6/autonomous-discovery-loop.schema.json` | no fixed suite | none | partial | fixed vectors and verifier |
| KFD-7 | active | `decisions/KFD-7.md` | `schemas/kfd-7/*` | positive and negative verifier fixtures | Rust/WASM | complete | more independent Domain Profiles |
| KFD-8 | draft | `decisions/KFD-8.md` | none | live-case perspective evidence | none | gap | versioned conformance witness and falsifiers |
| KFD-9 | draft | `decisions/KFD-9.md` | Runtime 100 experimental vectors only | fixed provisional runtime vectors | experimental runtime verifier | partial | dedicated Pursuit witness and draft profile |
| KFD-10 | draft | `decisions/KFD-10.md` | `schemas/kfd-10/conformance-witness.schema.json` | Warrant positive/negative vectors and Primitive Evidence Bundles | `scripts/warrant-evidence-verifier.mjs` | partial | independent adopter evidence and activation gates |
| KFD-11 | draft | `decisions/KFD-11.md` | `schemas/kfd-11/*` | adopter witness interface | repository checks | partial | qualified adopter witness set |
| KFD-12 | draft | `decisions/KFD-12.md` | `schemas/kfd-12/*` | adopter witness interface and live software-work cases | repository checks | partial | qualified independent implementation |
| KFD-13 | draft | `decisions/KFD-13.md` | `schemas/kfd-13/*` | adopter witness interface and Project Cut cases | repository checks | partial | qualified independent settlement evidence |

## Coordinate reconciliation

The canonical numbered registry is `registry.json`; there is no
`registry/kfd-registry.yaml`. Fixtures remain co-located with their owning
profiles and verifier kinds rather than in a root `fixtures/` directory. The
public independent-verifier entry is now `docs/independent-verifier.md`.

These differences are declared layout facts, not aliases or inferred evidence.
Consumers must use the checked-in paths in this matrix and the package exports.

## Drift gate

`npm run check:warrant-evidence` verifies the KFD-10 decision remains `draft`,
all source and profile surface digests match the manifest, every vector retains
its exact expected result, and the packed artifact can verify its own retained
bundles without outside source code or network access.
