---
status: draft
period: 2026-07
theme: kfd-agent-runtime-conformance
doc_type: specification
source_level: public-specifications
confidence: high
sensitivity: public
evidence_grade: B
review_state: self-reviewed
last_reviewed: 2026-07-20
---

# KFD Agent Runtime Conformance Profile

`kfd-agent-runtime@0.1.0-alpha.1` is an experimental, implementation-independent
black-box profile for testing an Agent runtime through a versioned adapter
boundary. Its fixed initial suite is `kfd-runtime-100@0.1.0-alpha.1`, informally
called **KFD Runtime 100**.

This profile is not a numbered KFD, a certification program, a security audit,
an adoption claim, or proof that 100 examples are complete. It does not reserve
the phrase “KFD conformant” without a profile version, suite root, adapter
artifact, report root, and named result partition.

## Authority boundary

The profile applies two different authority levels and keeps them visible in
every report:

- **Core** contains the KFD-7 responsibility-separation subset: direction,
  perspective, authority, occurrence, Episode lifecycle, Fact proposal and
  receiver-owned admission remain independently addressable. Core has 35 fixed
  vectors.
- **Experimental** exercises provisional Pursuit, Atlas Cut, Warrant,
  fuller ActionBinding, reconnect, export/import, and crash-recovery semantics.
  Experimental has 65 fixed vectors. Passing it does not promote those concepts
  into normative KFD authority.

The cross-Hub dependency is the exact
`kfd-agent-hub@0.1.0-alpha.1` manifest digest. The runtime suite consumes that
profile’s delivery/admission, authority-attenuation, idempotency, conflict, and
partial-knowledge boundaries. It does not redefine them.

The [normative inventory](normative-inventory.md) lists every authority source,
provisional input, prohibited inference, and claim ceiling.

## Fixed suite

The committed vector registry contains exactly 100 entries:

| Category | Count | Partition |
|---|---:|---|
| Pursuit create/revise/fork/settle | 15 | Experimental |
| Atlas cut/derive/refresh/stale | 15 | Experimental |
| Warrant issue/attenuate/delegate/revoke/use | 20 | Experimental |
| ActionBinding and prohibited inferences | 15 | Core |
| Episode lifecycle and Fact admission | 20 | Core |
| crash/reopen/fsck/export/import/replay/retry | 15 | Experimental |

Every entry has a stable ID, polarity, request, expected status/code, and
plain-language claim. `scripts/generate-agent-runtime-vectors.mjs` is the
deterministic source projection and must reproduce the committed bytes. Adding,
removing, reclassifying, weakening, or renaming a fixed vector changes the
vector root and requires a successor suite version.

Property tests, fuzz corpora, platform stress, real process-kill schedules, and
additional crash seeds may extend evidence, but they never count toward the
fixed 100.

## Black-box adapter protocol

The runner starts one caller-owned executable with no network requirement and
uses newline-delimited JSON over stdin/stdout. JavaScript adapter files are
started with the current Node executable; other regular files are executed
directly. Symlinked adapter artifacts are rejected.

Each request is:

```json
{
  "schemaVersion": 1,
  "contract": "kfd.agent-runtime-adapter-request/v1",
  "requestId": "action-009-reject-delivery-as-admission",
  "operation": "evaluate",
  "input": {
    "category": "action",
    "operation": "action.assess",
    "input": {}
  }
}
```

Each response is:

```json
{
  "schemaVersion": 1,
  "contract": "kfd.agent-runtime-adapter-response/v1",
  "requestId": "action-009-reject-delivery-as-admission",
  "adapter": {
    "id": "vendor-runtime",
    "version": "1.2.3",
    "topology": "local-subprocess"
  },
  "status": "rejected",
  "code": "delivery-is-not-admission",
  "observations": {
    "failClosed": true
  }
}
```

The first exchange is a `handshake`; the next 100 exchanges evaluate the fixed
vectors. The process must emit exactly one response per request, no duplicate
request IDs, no stderr output, and no extra lines. Unknown operations fail
closed.

This alpha protocol evaluates bounded transitions supplied by the suite. It
does not yet claim to inject an operating-system kill into an arbitrary
runtime. Recovery vectors instead require the adapter to expose its
acknowledgement/durability frontier, persisted roots, replay order,
idempotency behavior, and reconnect conflict treatment. Real kill schedules
remain additive evidence outside the fixed suite until a successor protocol
defines portable process control.

## Two-stage command surface

Run a suite and create a report:

```text
kfd test agent-runtime \
  --adapter ./path/to/adapter \
  --adapter-source-commit <40-or-64-hex-commit> \
  --output ./agent-runtime-report.json
```

Verify the report offline with the packaged Rust/WASM verifier:

```text
kfd verify agent-runtime-report ./agent-runtime-report.json --json
```

The test runner binds the exact profile manifest bytes, fixed vector bytes,
adapter artifact digest, optional source commit, platform, handshake,
transcript, each response, partition totals, and result root. The verifier
recomputes those bindings from its packaged profile and vector registry. It
rejects unknown suite roots, missing/duplicate vectors, expected-result drift,
response-root drift, result-root drift, transcript-root drift, incomplete
partitions, failing results, scope widening, or qualifying/self-certification
claims.

## Report meaning

A verified passing report supports only this statement:

> The named adapter artifact produced the expected outcomes for the exact
> fixed suite root, and the retained report is internally consistent under the
> packaged offline verifier.

It does not prove that the adapter represents every product path, that the
execution really occurred on a trusted machine, that hidden state is safe, that
all crashes converge, that the product is fit for use, or that KFD certified
the implementation. Reports therefore fix `qualifying: false` and
`selfCertified: false`.

## Reference adapters

Two non-product reference adapters demonstrate that one suite can drive
structurally different black-box evaluators:

- `state-machine-adapter.mjs` uses explicit category state machines and ordered
  transition branches.
- `rule-table-adapter.mjs` uses a declarative operation/rule table and
  first-failure evaluation.

They are examples and checker witnesses, not independent adopters. Their
passing reports prove protocol implementability and runner determinism only.

## Versioning and evolution

The profile ID, manifest digest, suite ID/version, vector root, adapter message
contract, report contract, and verifier profile form one welded interface.
Compatible documentation clarifications may keep the version. Any weaker
expectation, changed vector identity/outcome, changed canonical root framing,
changed Core/Experimental classification, changed required report binding, or
changed adapter responsibility requires a successor version.

Proposals and counterexamples follow the public paths in
[`CONTRIBUTING.md`](../../CONTRIBUTING.md). Promotion of provisional semantics
follows KFD governance; a green Experimental result cannot perform promotion.
