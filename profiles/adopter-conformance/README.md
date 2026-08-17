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
last_reviewed: 2026-08-17
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

## Project-neutral category profiles

`profiles/adopter-conformance/category-profiles.json` defines a versioned base
profile and the initial `specification-authority`, `delivery-infrastructure`,
`product-runtime`, and `independent-clean-room` profiles. The catalog contains
no adopter or project IDs. Each category adds evidence obligations above the
base full-cut declaration; it does not change the meaning of any non-KFD
specification.

`resolveAdopterCategoryProfiles` in
`scripts/adopter-category-profile-contract.mjs` resolves the base profile and
all transitive parents, then emits UTF-8-sorted profile references and the
deterministic union of requirement identities. Repeated identical obligations
coalesce. The same requirement identity with different bytes, inheritance
cycles, duplicate selections, unknown profiles, stale versions, or attempts to
make evidence transferable fail with stable `acp-*` issue codes.

Category resolution is declaration-only. It never transfers implementation
evidence between adopters and never grants semantic authority, runtime
permission, release authorization, or independent certification. The catalog
schema and fixed cross-profile vectors are exported from the npm package so a
clean-room implementation can reproduce these rules without a source checkout.

## Project category instances and evidence ownership

`kfd.adopter-category-instance-manifest/v1` is the explicit project-instance
layer. It binds one adopter identity and its exact source, artifact, and release
coordinates to one verified full-cut adopter manifest, KFD package root,
category-catalog root, deterministic selection root, and the complete resolved
requirement set. Every evidence item repeats the project root, adopter-manifest
root, KFD package root, and selection root. Evidence copied from another
project, package cut, manifest, or category selection therefore fails closed;
category composition never inherits another adopter's evidence.

The package verifier in
`scripts/adopter-category-instance-contract.mjs` requires a valid report for
the referenced full-cut manifest and an explicit evidence-freshness cut. It
then checks exact requirement conservation and each profile's evidence-kind
minimums. Missing evidence, stale evidence, stale profile versions, invalid
composition, coordinate substitution, root drift, and authority widening use
stable `acp-*` diagnostics. A passing report says only that this declaration
and its evidence conform to the selected category contract. It cannot approve
or publish a release, authorize a runtime, transfer semantic authority, or
independently certify the project.

Existing `kfd.adopter-conformance-manifest/v1` files remain valid unprofiled
full-cut declarations. Absence of a category-instance manifest is never
silently reinterpreted as selection of the base category. Migration is
explicit and additive: retain the immutable full-cut manifest, create a new
category-instance manifest that references its exact root, select zero
additional profiles for base-only conformance or name exact versioned category
profiles, and provide fresh project-bound evidence for every resolved
requirement. Old evidence is reusable only when it already carries every exact
version 1 project binding; otherwise it remains historical input rather than
conformance evidence.

## Cross-project evidence matrix

`kfd.adopter-category-evidence-matrix/v1` is the package-owned aggregation
contract for comparing category coverage across projects without transferring
their evidence or authority. Its schema, fixed vectors, and offline verifier
are published beside the category catalog. A matrix reproduces every catalog
profile and resolved requirement identity, then keeps normative KFD bytes,
category requirements, project-instance evidence, delivery evidence, runtime
evidence, and independent review in distinct roles.

Project rows may remain `pending` with no terminal root. This is a valid and
explicit incomplete state, not conformance closure. A terminal row requires an
exact root and only verified current evidence; category-specific delivery,
runtime, and independent-review roles remain mandatory. Every referenced gap
has one owner, open gaps have no closure root, and closed gaps bind exact
evidence. Failure history is retained separately from current proof rows.

The verifier reports `valid` and `complete` independently. It returns
`complete: true` only when every project is terminal and every gap is closed,
while always returning `qualifying: false`, `releaseAuthorized: false`,
`runtimeAuthorized: false`, and `independentlyCertified: false`. Buildchain may
carry the matrix through a protocol-neutral delivery gate, but it cannot
widen, reinterpret, certify, or privately supplement KFD semantics.

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

## KFD self-declaration

KFD dogfoods the contract at
`profiles/adopter-conformance/adopters/kfd/manifest.json`. Its package root is
the canonical semantic root of the exact package name/version, registry,
standards, schema set, vector set, verifier set, and derived decision set. This
finite cut deliberately excludes the self-manifest from its own preimage.
The npm tarball integrity, source commit, GitHub release, and Release Passport
remain separate publication facts and must be read back independently.

The declaration covers every registry row and preserves uncertainty: active
uses remain `candidate` without independent decision-specific assessment,
draft evidence remains `draft-evidence`, unsupported surfaces remain explicit,
and unused drafts remain `not-used`. `node scripts/check-kfd-self-adopter.mjs`
reproduces all evidence roots, rejects cut and authority substitutions, and
replays from a clean packed-package extraction without Home or network state.

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
