# Agent Hub Conformance Implementer Guide

## Adapter binding

The binding is `jsonl-stdio/v1`. The runner starts one process with `KFD_AGENT_HUB_OFFLINE=1`, preserves the caller's working directory, sends 21 lines, closes stdin, and requires 21 JSON response lines with no stderr output. Package resources are resolved from the installed KFD package; adopter configuration may remain relative to the consumer project.

The first request has operation `handshake`. A successful response uses code `adapter-ready`, verdict `not-applicable`, and includes at least two Hubs. Every Hub entry contains a capability document and its canonical SHA-256 semantic root. Hub IDs must be unique.

The remaining requests use operation `evaluate`. An adapter must return the exact request ID plus `status`, `code`, `verdict`, and observations. Machine interpretation always uses the three-field outcome, not the code alone. In particular:

- `conflicted / conflict-visible / conflicted` means the adapter correctly retained a visible conflict.
- `rejected / conflict-visible / rejected` means the adapter correctly rejected a policy that would hide a visible conflict.

Both are negative-polarity vectors because neither claims semantic admission.

## Reports and roots

The runner binds:

- the installed npm package manifest and release anchor;
- the conformance and protocol manifests;
- the fixed vector registry and failure inventory;
- the verifier and adapter bytes;
- two or more Hub capability documents;
- every adapter response, the complete result inventory, and the reconstructed transcript.

Roots use SHA-256. File roots hash the exact packaged bytes. Semantic roots hash canonical JSON followed by one newline; object keys are sorted recursively, array order is retained, and numbers are non-negative safe integers.

## Fail-closed verification

The offline verifier independently recomputes public package roots and fixed-suite outcomes. Unknown, missing, duplicate, or mutated results fail. Claim widening (`qualifying: true` or `certification: true`) fails. A report may be valid only when all 20 fixed outcomes pass and the entire root closure agrees.

Use `--adapter` during verification when the original adapter bytes are available. This turns the declared adapter digest into a recomputed check.

## Reference adapters

The package includes two intentionally different examples:

- `profiles/agent-hub/adapters/state-machine-adapter.mjs`
- `profiles/agent-hub/adapters/rule-table-adapter.mjs`

They demonstrate the wire contract, not a production Hub implementation.
