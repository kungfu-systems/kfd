---
status: draft
period: 2026-08
theme: kfd-self-conformance-profile
doc_type: specification
source_level: public-specifications
confidence: high
sensitivity: public
evidence_grade: B
review_state: self-reviewed
last_reviewed: 2026-08-12
---

# KFD Self-Conformance Profile v1

`kfd-self-conformance@1.0.0-alpha.1` defines how KFD records evidence about
its own Candidate, decision, lifecycle, and package transitions. It is a
portable structural proof contract. It is not an authority to allocate a KFD
number, change a decision status, approve a Foundation Revision, publish a
release, certify an adopter, or declare a claim true.

The normative closure is the fixed package rooted by
`profiles/self-conformance/manifest.json`. The profile uses only KFD-owned
public files and `sha256-kfd-canonical-json-v1`; no product checkout, hosted
service, private repository, network, credential, or ambient Home state is
part of the contract.

## Reader model: prospective gate and retrospective replay

Read KFD Self-Conformance as two connected lanes, not as one timeless claim:

1. **Prospective governance** applies the live Profile to official Candidate
   genesis, qualification, numbering, status, Foundation Revision, and
   release-packaging transitions. Ordinary edits remain edits unless an
   official lifecycle path is invoked.
2. **Retrospective structural conformance** replays immutable public evidence
   from the alpha.28 Foundation Cut to its additive convergence with the
   alpha.55 pre-Profile live anchor. It always declares
   `retrospective: true` and `profileAvailableAtEvent: false`.

The retrospective lane does not assert that historical actors possessed or
ran the later Profile, and it cannot retroactively approve, authorize,
activate, certify, or change any historical event. Across both lanes, the
verifier supplies necessary structural evidence but is never sufficient for
semantic truth, human approval, numbering, status change, adoption,
publication, release authority, or production fitness.

[Inspect the historical guide](history/README.md) ·
[Inspect the historical report](history/historical-lineage.report.json) ·
[Inspect the live manifest](manifest.json)

## Conformance objects

The profile has five load-bearing object kinds:

1. a **state** records the semantic and publication state of one immutable KFD
   subject coordinate;
2. a **bootstrap anchor** names the reviewed predecessor from which the first
   profile-governed chain begins;
3. a **transition bundle** binds the previous and proposed state roots,
   evidence, schema set, verifier, authority, review, claim boundary, gaps,
   immutable coordinates, and expected result;
4. a **report** records only enumerated structural checks over one exact bundle;
5. a **package manifest** closes the profile, schemas, vectors, bundle, report,
   predecessor, and verifier coordinates without including its own digest.

Every object uses `schemaVersion: 1` and an exact `contract` string. Unknown
versions, fields, transitions, issue codes, or root algorithms fail closed.

The independent Rust/WebAssembly projection is selected with
`self-conformance-transition`. It implements the published contract directly;
it does not call the JavaScript contract check or any product runtime. Its
machine-readable invariant map and adversarial cases are fixed in
`verifier/specs/self-conformance-matrix.json`.

## Canonical roots and the recursion boundary

All semantic roots use `sha256-kfd-canonical-json-v1`:

- input is JSON with no duplicate keys;
- object keys are ordered by UTF-8 byte order;
- strings and keys are NFC-normalized before admission;
- integers are non-negative and at most `2^53 - 1`;
- floating point and exponent forms are forbidden;
- canonical JSON has no insignificant whitespace and ends in one LF;
- SHA-256 is encoded as `sha256:` plus 64 lowercase hexadecimal digits.

The state root is computed from the complete state object. The transition
bundle root is computed from the complete bundle. The report root is computed
from the complete report, which binds `bundleRoot` but has no `reportRoot`
field. The package root is computed from the complete package manifest, which
has no `packageRoot` field.

Recursion is therefore finite:

```text
reviewed bootstrap anchor
  -> transition bundle root
  -> report root
  -> package root
  -> next transition predecessor roots
```

A transition may bind only predecessor report and package roots. A current
report or package digest must never occur in its own digest preimage. A
current-version-only pass is not evidence about its predecessor.

## State model

A state separates `semanticState` from `publicationState`. Packaging must not
silently change semantic status.

Semantic states are:

- `absent`: no Candidate or numbered decision has been created;
- `candidate`: a non-normative pressure-field proposal exists;
- `qualified`: the Candidate has the evidence required to request promotion;
- `numbered-draft`: maintainers allocated a number and retained draft status;
- `active`: maintainers activated a numbered decision;
- `superseded`: an active decision was explicitly superseded;
- `foundation-revised`: a pre-stable Foundation Revision was authorized;
- `revised`: the proposal returned for substantive revision;
- `rejected`: the proposal was rejected with retained rationale;
- `provisional`: incubation continues without promotion;
- `no-new-kfd`: the pressure field was resolved without a new KFD.

Publication state is `unpublished` or `packaged`. `release-packaging` changes
only publication state and preserves semantic state and subject identity.

## Transition table

| Transition | Allowed previous semantic state | Proposed semantic state | Authority boundary |
| --- | --- | --- | --- |
| `candidate-genesis` | `absent` | `candidate` | provenance owner records a Candidate; no number |
| `candidate-qualification` | `candidate`, `revised`, `provisional` | `qualified` | evidence review only; no promotion |
| `numbered-draft-promotion` | `qualified` | `numbered-draft` | maintainer numbering decision plus independent review |
| `activation` | `numbered-draft` | `active` | maintainer activation plus independent review |
| `supersession` | `active` | `superseded` | maintainer supersession plus successor lineage |
| `foundation-revision` | `numbered-draft`, `active` | `foundation-revised` | explicit pre-stable authorization, mapping, and review |
| `release-packaging` | any retained semantic state | unchanged | release authority; structural pass is insufficient |
| `revision-required` | `candidate`, `qualified` | `revised` | reviewer rationale retained |
| `rejection` | `candidate`, `qualified`, `revised`, `provisional` | `rejected` | accountable disposition retained |
| `provisional-retention` | `candidate`, `qualified`, `revised`, `provisional` | `provisional` | gap and next-review boundary retained |
| `no-new-kfd` | `absent`, `candidate`, `qualified`, `revised`, `provisional` | `no-new-kfd` | pressure-field rationale retained |

Except for `release-packaging`, official semantic transitions preserve
`publicationState`. A later package may contain any retained terminal outcome;
packaging does not turn that outcome into success.

## Required bundle bindings

A transition bundle must bind:

- the complete previous and proposed states and their independently recomputed
  roots;
- the predecessor kind, bootstrap-anchor root, and predecessor report and
  package roots where applicable;
- one or more evidence roots;
- the exact schema-set root and verifier root;
- separate authority and independent-review receipt roots;
- an explicit claim boundary and known-gap array, including an empty array
  when no gap is known;
- immutable repository/package coordinates;
- the expected structural result.

Substitution, omission, reordering of set-like material, stale predecessor
roots, circular roots, missing authority, missing review, and claim widening
are invalid. Array ordering is significant unless the relevant schema calls
the array a set; producers must sort root sets lexically and reject duplicates.

## Report and claim boundary

A passing report means only that the checks listed in `checks` passed for the
exact bundle under the exact profile, schema set, and verifier roots. Reports
fix `qualifying`, `selfCertified`, `semanticTruth`, `humanApproved`,
`releaseAuthorized`, `adoptionProven`, and `certified` to `false`.

Human governance remains external and explicit. The bundle retains authority
and review receipts so a lifecycle gate can require them, but the verifier does
not mint or interpret that authority beyond the enumerated structural checks.

## Bootstrap trust anchor

The bootstrap anchor is an explicit reviewed exception to predecessor-report
recursion. It binds the last pre-profile state and package roots, the exact KFD
coordinate, authority and review receipts, rationale, and claim boundary. Only
`candidate-genesis` may begin from a bootstrap predecessor. Replacing the
anchor starts a different chain and requires an explicit compatibility action.

## Stable diagnostics

The stable issue namespace is published in
`profiles/self-conformance/issue-codes.json`. A verifier may report multiple
issues, but canonical reports order issues by `code`, then `path`, then
`message`. Unknown failures use `scp-contract-invalid`; they must never be
treated as success or silently ignored.

Set-like arrays are strictly UTF-8 sorted and unique. Roots assigned to
evidence, verifier, authority, review, predecessor report, and predecessor
package roles may not collapse into one another. These checks expose
`scp-set-order-invalid`, `scp-root-substitution`, and `scp-root-conflict`
without interpreting the semantic content of an authority or review receipt.

## Fixed package and versioning

The extraction manifest is an allowlist. A clean-room implementation may use
only the listed files. The profile contract, schemas, issue inventory, vectors,
and package rules are KFD-1 welded surfaces with additive/minor impact for this
first publication. Incompatible changes to required fields, canonical roots,
transition meaning, claim boundaries, or issue meaning require a successor
profile or explicit compatibility action.

The profile does not change any entry in `drafts/registry.json` or
`registry.json`. Profile publication is not a Candidate promotion or KFD status
transition.

## Official lifecycle gate

Every official Candidate, qualification, numbered-draft promotion, activation,
supersession, Foundation Revision, and release-packaging path consumes
`profiles/self-conformance/lifecycle-gates.json`. The gate request retains the
complete chain from the reviewed bootstrap anchor, each transition bundle, its
independently reproduced report root, the package root, the actual authority
receipt, the independent-review receipt, and counterevidence roots. The
terminal path, transition, role, and decision must match the published policy.

Run the package-owned gate with no network or product checkout:

```bash
kfd gate self-conformance-lifecycle transition.request.json \
  --output transition.report.json --json
```

Both files are retained under `evidence/self-conformance/transitions/` for an
official repository transition. The report is reproduced during
repository-native checks; a missing pair, stale report, wrong root, incomplete
predecessor chain, wrong authority role, non-independent review, claim
overreach, or verifier-package substitution fails closed with a stable `scg-*`
or underlying `scp-*` diagnostic.

The gate never applies a transition. A `proceed` report says that the supplied
structural proof and separately supplied governance receipts are mutually
consistent. It does not allocate a number, change status, approve, merge, or
release. `revision-required`, `rejection`, `provisional-retention`, and
`no-new-kfd` remain valid retained `non-promotion` outcomes; counterevidence is
not discarded to manufacture a passing promotion.
