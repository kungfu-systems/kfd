---
status: draft
period: 2026-08
theme: kfd-full-cut-adopter-conformance
doc_type: specification
source_level: public-specifications
confidence: high
sensitivity: public
evidence_grade: B
review_state: self-reviewed
last_reviewed: 2026-08-10
---

# KFD Full-Cut Adopter Conformance Manifest v1

`kfd.adopter-conformance-manifest/v1` is the KFD-owned declaration contract
for an adopter that binds its work to one exact packaged KFD cut. It is
package-only: a clean-room adopter can implement it from `@kungfu-tech/kfd`
without a KFD source checkout, a founding-product checkout, hosted services,
credentials, private repositories, or ambient Home state.

The canonical schema is
`schemas/kfd-adopter-conformance/manifest.schema.json`. Its required decision
rows are derived from the `entries` array of the manifest's pinned
`registry.json`, never from a first-party allowlist or a verifier's built-in
decision list.

## Exact cut and canonical roots

The manifest binds the exact package artifact, `registry.json`,
`standards.json`, schema set, vector set, verifier set, and derived decision
set. JSON semantic and set roots use `sha256-kfd-canonical-json-v1`:

- input JSON has no duplicate keys;
- object keys are ordered by UTF-8 byte order;
- strings and keys are NFC-normalized before admission;
- integers are non-negative and no greater than `2^53 - 1`;
- floats and exponent forms are forbidden;
- canonical JSON contains no insignificant whitespace and ends in one LF;
- SHA-256 is encoded as `sha256:` plus 64 lowercase hexadecimal digits.

`sha256-bytes-v1` applies SHA-256 directly to immutable package or file bytes.
Each schema, vector, and verifier member carries its package-relative path and
byte root. The corresponding set root is the semantic root of the complete
UTF-8 path-sorted member array. Omission, duplication, path traversal, member
substitution, or a member byte-root mismatch therefore changes or invalidates
the set root. Empty vector sets are explicit; schema and verifier sets are not.

The manifest root is computed over the complete manifest object. The object
does not contain its own root, so the recursion is finite. Set-like arrays are
UTF-8 sorted and duplicate-free. Order-sensitive registry arrays retain their
published order.

`decisionSetRoot` is the semantic root of the ordered projection
`[{id,number,status,path}]` from every pinned registry entry. A conforming
verifier requires exact equality between that projection and `decisions`:
missing rows, duplicate rows, additional rows, changed numbers, substituted
IDs, or stale registry status fail closed.

## Decision declarations

Every registry entry has exactly one declaration row with one state:

- `adopted`: the adopter declares use and binds implementation, verification,
  decision-specific witness, and release evidence;
- `candidate`: the adopter is evaluating or using an implementation without
  claiming completed adoption;
- `draft-evidence`: evidence is retained for a registry entry that is still
  draft; it cannot widen the decision's status or authority;
- `unsupported`: the adopter names the unresolved gap and makes no implicit
  support claim;
- `not-used`: the adopter declares no use and supplies no implementation,
  verification, witness, release binding, or claim.

Evidence references bind their observation time and the same KFD package root.
Witness bindings additionally bind the decision ID, profile manifest, witness,
verifier, and package cut. Release bindings join an exact adopter artifact and
Release Passport to the same KFD package root. Reusing evidence from another
decision, profile, package cut, or release is substitution, not conformance.

The schema expresses structural state constraints. The package verifier owns
the cross-object checks for set conservation, root reproduction, reference
resolution, stale evidence, undeclared use, and claim widening.

## Package-only verification seam

The version 1 reference seam is published as
`scripts/adopter-conformance-contract.mjs`. It accepts the manifest together
with strictly admitted JSON values for the pinned registry and standards plus
explicit bytes for schema, vector, verifier, and referenced profile-manifest
surfaces. The caller also supplies the expected package artifact root and an
evidence policy containing one `verifiedAt` cut and `maxAgeSeconds`. Neither
wall-clock time nor a local cache is read implicitly, so the same inputs
reproduce the same result offline.

`deriveAdopterCut` constructs the rooted cut from those bytes.
`verifyAdopterManifest` returns `kfd.verification-report/v1` with stable issue
codes from `profiles/adopter-conformance/issue-codes.json`. The fixed suite in
`profiles/adopter-conformance/vectors.json` retains one positive full-cut case
and fail-closed cases for missing, duplicate, and reordered rows, registry
mismatch, draft widening, witness and release mismatch, root substitution,
stale evidence, undeclared use, and claims on a `not-used` row.

The package CLI exposes the same seam through `kfd adopter init`, `witness`,
`verify`, `diff`, and `bundle`. Its fixed inventory is
`profiles/adopter-conformance/toolchain.json`; the Agent-readable invocation,
machine-output, and recovery contract is
`profiles/adopter-conformance/agent-brief.md`. The Node projection is complete
for these five package-only operations. Native and WebAssembly parity is a
separate required delivery surface and is not inferred from this JavaScript
implementation. No passing report makes an adoption, release, runtime, or
certification decision.

## Five separate authorities

The following layers must not be collapsed:

1. **declaration** says what the adopter claims to use;
2. **evidence** supplies rooted observations about that declaration;
3. **release binding** joins evidence to an exact artifact and Passport;
4. **runtime permission** remains with the adopter's runtime authority;
5. **independent certification** requires a separately identified certifier
   and is never minted by this manifest or its verifier.

A structurally valid or verifier-passing manifest does not activate a draft,
establish semantic truth, authorize runtime action, authorize release, certify
the adopter, or grant the right to use KFD trademarks. `claimBoundary` fixes
those non-claims in every manifest.

## Compatibility

This version is selected by the exact contract string, schema ID, package cut,
and rooted verifier/vector surfaces. Compatible optional additions require a
new schema that explicitly preserves version 1 meaning. Changes to required
rows, states, root semantics, evidence roles, witness/release bindings, or
authority boundaries require a successor contract.
