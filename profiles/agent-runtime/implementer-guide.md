---
status: draft
period: 2026-07
theme: kfd-agent-runtime-conformance
doc_type: guide
source_level: public-specifications
confidence: high
sensitivity: public
evidence_grade: B
review_state: self-reviewed
last_reviewed: 2026-07-20
---

# Agent Runtime Adapter Implementer Guide

This is the shortest path from a runtime boundary to an offline-verifiable
KFD Runtime 100 report.

## 1. Choose the boundary

Expose the smallest product-owned executable that can answer the fixed
transition requests. The adapter may call a library in-process, connect to a
local daemon, cross a container boundary, or talk to a remote Hub. KFD does not
own that topology.

The adapter identity should describe the tested boundary, not the marketing
product. Keep the adapter artifact immutable for the report; the runner hashes
its exact bytes and can also retain a source commit.

## 2. Implement JSONL stdio

Read one JSON object per line from stdin and write one response per line to
stdout. Do not write logs to stderr during a suite run. Preserve `requestId`
exactly.

Support:

- `handshake`: declare adapter ID, version, topology, profile and protocol;
- `evaluate`: evaluate the nested category/operation/input transition and
  return the observed `accepted` or `rejected` result with a stable code.

Reject unknown envelopes, operations, or required semantics. Do not turn
“unsupported” into an accepted result.

## 3. Map responsibilities, not storage

The request objects contain the roots, lifecycle states, authority bounds,
durability frontiers, and expected relationships needed for a test. Map them
to native product objects internally. Do not expose C++ types, provider paths,
database tables, cloud account IDs, or vendor error codes as portable KFD
authority.

The response code is the portable observation. Product diagnostics may be
retained separately, but a green report depends only on the versioned adapter
contract.

## 4. Run the fixed suite

From an installed package:

```bash
npx kfd test agent-runtime \
  --adapter ./adapter.mjs \
  --adapter-source-commit 0123456789abcdef0123456789abcdef01234567 \
  --output ./agent-runtime-report.json
```

The output path must not already exist. The runner requires a regular,
non-symlink adapter artifact and stays offline. A timeout, stderr output,
process failure, malformed JSONL, duplicate response, missing response, or
unexpected status/code makes the run fail.

Use the two examples under `adapters/` to compare an explicit state-machine
implementation with a declarative rule-table implementation. Do not import
their evaluator logic into a product adapter; mapping the product’s own
responsibility boundary is the evidence.

## 5. Verify independently

```bash
npx kfd verify agent-runtime-report ./agent-runtime-report.json --json
```

The packaged WASM verifier and native Rust verifier share one core. Verification
recomputes the profile, suite, vector, response, result, transcript and
partition bindings without invoking the adapter or using the network.

Retain both the report and the adapter artifact/source cut. A report detached
from the artifact digest remains structurally verifiable but cannot support an
implementation claim about a different build.

## 6. Interpret the result

Report Core and Experimental results separately:

- Core failure means the tested adapter did not preserve at least one named
  KFD-7 responsibility separation.
- Experimental failure means the adapter did not match an alpha hypothesis or
  recovery contract; it does not prove the runtime violates a normative KFD.
- Full pass means all 100 fixed outcomes matched for the exact artifact and
  roots. It is not certification, security assurance, or completeness.

For product qualification, add product-owned crash schedules, platform
matrices, provenance, independent review, and release evidence outside this
finite baseline. Future Buildchain Passport integration may bind those
artifacts, but this profile does not mint that release claim.
