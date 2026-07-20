---
status: draft
period: 2026-07
theme: kfd-independent-verifier
doc_type: specification
source_level: public-specifications
confidence: high
sensitivity: public
evidence_grade: B
review_state: self-reviewed
last_reviewed: 2026-07-17
---

# KFD independent verifier

`kfd` is the independent verification side of KFD conformance. It is a Rust
library with native CLI and WebAssembly projections. It deliberately contains
no Kungfu, Xinfa, Buildchain, Shifu, or other product code dependency.

The verifier is implemented from published schemas and specifications. A
profile is enabled only when those public sources are precise enough for an
independent implementation to fail closed. Product implementations remain the
format authorities; KFD owns the verifier profile, report contract, and the
claim that a passing object satisfies the checks enumerated by that profile.

## Command surface

```text
kfd verify kfd-record <json-file> [--schema <schema-file>] [--json]
kfd verify passport <file-or-directory> [--json]
kfd verify pack <file-or-directory> [--json]
kfd verify atlas <file-or-directory> [--json]
kfd verify episode <directory> [--json]
kfd verify agent-runtime-report <report.json> [--json]
kfd bundle <kind> <file-or-directory> --output <bundle.json>
kfd verify bundle <bundle.json> [--json]
```

`npx @kungfu-tech/kfd` uses the packaged WebAssembly projection. Native and
WebAssembly verification consume the same
`kfd.verification-bundle/v1` input and emit the same
`kfd.verification-report/v1` JSON bytes.

## Report contract

Every invocation returns one report:

```json
{
  "schemaVersion": 1,
  "contract": "kfd.verification-report/v1",
  "profile": "xinfa.context-pack/v1",
  "valid": true,
  "qualifying": false,
  "selfCertified": false,
  "offline": true,
  "checks": [],
  "issues": []
}
```

The verifier proves only the checks named by `profile` and `checks`. It does
not prove work quality, source completeness, product fitness, human approval,
or release authorization. A structurally valid KFD record does not prove that
its claim is true. A verified Git Episode segment preserves a qualified
Episode root; it does not recompute the journal-native POD root.

Issues have stable `code`, `path`, and `message` fields. Unknown contracts,
unknown schema versions, missing sibling evidence, non-canonical bytes, root
drift, and unsupported semantics fail closed.

## Canonical JSON

The common root algorithm is
`sha256-kfd-canonical-json-v1`:

- JSON only; duplicate object keys are rejected by the parser;
- object keys are ordered by UTF-8 byte order;
- strings and object keys must already be NFC-normalized;
- integers must be non-negative and no larger than `2^53 - 1`;
- floating-point and exponent number encodings are rejected;
- no insignificant whitespace is emitted;
- a single LF is appended before SHA-256 hashing;
- roots use `sha256:<64 lowercase hexadecimal digits>`.

Profiles whose owner specifies different byte framing declare it explicitly.
For example, artifact digests hash exact bytes without adding LF, while Git
Episode provider and qualification roots hash canonical JSON without an added
LF. Episode claims hash the complete canonical JSONL byte stream including its
terminal LF.

## Verification profiles

### KFD record

The verifier selects the schema from an explicit `--schema` file or the
record's `$schema`. Built-in KFD schemas resolve only to packaged schema IDs;
the verifier never fetches a schema over the network. The supported
JSON-Schema subset is the subset used by the published KFD schemas:

- `type`, `required`, `properties`, `additionalProperties`;
- `const`, `enum`, `pattern`, `format: uri`;
- `minLength`, `minimum`;
- `items`, `minItems`, `maxItems`, `uniqueItems`;
- `$ref` to local definitions or another packaged KFD schema;
- `allOf`, `contains`, `if`, and `then`;
- `patternProperties`.

An unsupported schema keyword fails closed instead of being ignored.
The packaged KFD-7 action-contract schema is discoverable by either canonical
`$schema` URI or `contract: kfd-7-action-contract`. Its draft Profile fixture
passes structurally, while missing-role and premature-activation fixtures are
required to fail identically in native and WebAssembly verification.

### Buildchain release passport

The v1 profile verifies the documented release-evidence closure:

- v1 contract identity for the passport and its product mechanism,
  artifact-evidence, impact, and agent-index siblings;
- release tag and artifact inventory;
- every passport artifact is matched to sibling evidence by structured
  identity and digest;
- optional package-set, trusted-publishing, transaction, and anchor-manifest
  sections are complete when present;
- the impact ledger and passport expose the same surface-impact inventory.

The verifier never follows HTTP URLs. A remote passport must first be
materialized as a local bundle with all sibling evidence.

### Xinfa Context Pack

The v1 profile verifies:

- the published Context Pack schema;
- Pack, source, policy, cut, authority, and coverage roots;
- exact UTF-8 inventory content roots and sizes;
- route roots, selected-node authority roots, status, and two-audience parity;
- directory manifest binding to the exact `pack.json` bytes;
- non-qualifying, non-self-certified receipt binding.

### Xinfa Atlas

The v1 profile verifies:

- the published Atlas schema and immutable identity;
- Atlas and component roots;
- declared-scope and compatibility bindings;
- the complete embedded Context Pack;
- exact derived Human and Agent views;
- the directory manifest and non-qualifying receipt.

The Xinfa schema root is computed from the packaged, digest-pinned public
schema set rather than imported from a product binary.

### Git Workspace Episode

The v1 profile verifies the public qualified-shadow representation:

- manifest contract and provider-root preimage;
- the requested semantic-root directory coordinate;
- qualification canonical bytes, root, ended/ok status, typed-fold policy,
  Episode identity, and safe `export_evidence` capability;
- canonical JSONL framing, terminal LF, digest, count, zero-based order,
  duplicate indexes, and segment schema;
- the explicit authority boundary: the semantic root is preserved but not
  recomputed by this profile.

### KFD Agent runtime report

The `kfd.agent-runtime-report/v1` profile verifies the packaged
`kfd-agent-runtime@0.1.0-alpha.1` manifest and fixed KFD Runtime 100 registry:

- exact profile manifest, Agent Hub dependency, suite version and vector roots;
- one result for each of the 100 fixed IDs, with no duplicate, missing, unknown
  or reclassified result;
- fixed expected status/code, adapter actual status/code, retained response,
  response root and adapter identity agreement;
- handshake, transcript and aggregate result roots;
- independent 35 Core / 65 Experimental partition summaries;
- adapter artifact/source coordinates, offline execution and fixed
  non-qualifying/non-self-certified scope.

Unknown roots, expectation drift, result mutation, partition widening,
incomplete results, placeholder source commits, or stronger claim flags fail
closed. Verification does not attest that the recorded process execution
occurred; it proves the retained report is closed under the packaged profile
and roots.

## Independence and extraction

`verifier/extraction-manifest.json` is an allowlist for a clean extraction.
The extraction contains verifier source, packaged public schemas, fixtures,
and license files only. It rejects path, Git, private-registry,
monorepo-relative, and product-code dependencies. Tests build the extraction
with `cargo build --locked`, run native fixtures, build WebAssembly, and compare
the native and WebAssembly reports byte for byte.

The verifier performs no network calls. Paths are resolved only inside the
caller-provided object directory. Symlinks and path escape fail closed.

## Versioning

The CLI is a KFD-1 welded surface with its own interface version. Compatible
additions may keep `kfd.verifier/v1`. A command rename, required-input change,
canonicalization change, report-meaning change, weaker check, or responsibility
boundary change requires a new interface version or explicit compatibility
action. The outer `@kungfu-tech/kfd` package remains on its KFD-governed v1.0
line.
