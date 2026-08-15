# Agent Hub Conformance Implementer Guide

## Executable onboarding surfaces

- `kungfu agent hub qualify --output-dir <new-directory>` runs the fixed suite
  against the product-owned Kungfu Hub implementation and explains the exact
  result to a human; `--json` exposes the same bounded result to an agent.
- `kungfu agent hub verify --qualification-dir <directory>` independently
  rechecks the retained KFD report, adapter bytes, product binding, and
  qualification closure without rerunning the suite.
- `kfd demo agent-hub --output <report.json>` runs one packaged reference adapter, executes Hub 20, and immediately performs bound offline verification.
- `kfd scaffold agent-hub --language <cpp|node|python|rust> --output <new-directory>` copies a deterministic, fail-closed starter without overwriting an existing path.
- `kfd capabilities agent-hub --json` exposes commands, contracts, exit codes, supported scaffold languages, verification backend, claim boundary, and recovery as packaged JSON.
- `kfd test agent-hub --adapter ...` remains the adopter evidence path. Demo and scaffold smoke results do not substitute for it.

The C++ and Rust starters deliberately use fixture-scoped, dependency-free JSON field readers so clean-pack CI can compile them offline. Adopters must replace those readers with their production JSON boundary. Node.js and Python starters use their standard JSON libraries. All four starters return `scenario-not-implemented` until product-owned semantics are supplied.

An untouched starter is a supported negative state, not a broken product: smoke exits `0`, Hub 20 exits `1` at `0/20`, and bound offline verification exits `0` with `valid: true`. Qualification and certification remain `false` throughout.

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

## Report verification

The offline verifier independently recomputes public package roots, capability roots, fixed-suite outcomes, response roots, result closure, transcript root, and claim boundary. Unknown, missing, duplicate, or mutated results fail. Claim widening (`qualifying: true` or `certification: true`) fails.

Verifier validity is evidence validity, not behavior conformance. A structurally sound `0/20` starter report verifies successfully because it truthfully records all 20 failed outcomes. A `20/20` report also verifies successfully when the same evidence closure agrees. The CLI therefore presents three lines:

```text
Behavior: 0/20 (not conforming)
Evidence: valid (adapter bytes checked)
Authority: qualifying=false; certification=false
```

Use `--json` for the complete machine result. Its `dimensions.behavior`, `dimensions.evidence`, and `dimensions.authority` fields preserve the same separation.

Use `--adapter` during verification when the original adapter bytes are available. This turns the declared adapter digest into a recomputed check.

Agent Hub report verification remains in the single packaged host-side JavaScript verifier. No Agent Hub report checks are duplicated in the Rust/WASM verifier, so there is no partial parity set that could drift. This boundary is machine-readable in `cli-capabilities.json` and checked by the profile test. Process spawning is also host-only. Moving report semantics into the shared core requires a new versioned verification-bundle kind and byte-for-byte native/WASM parity before this host authority can be retired.

## Starter claim and recovery

Every generated `kfd-scaffold.json` lists what its smoke executes, the expected `0/20` negative baseline, evidence-verification result, and authority boundary. A starter must not be described as a conforming Hub until its compiled or interpreted adapter itself passes the retained Hub 20 runner. To recover from generation, remove only the newly generated directory; generation never mutates an existing destination. Reports are created with exclusive-write semantics and are safe to regenerate only at a new path or after the adopter intentionally removes its own prior report.

## Reference adapters

The package includes two intentionally different examples:

- `profiles/agent-hub/adapters/state-machine-adapter.mjs`
- `profiles/agent-hub/adapters/rule-table-adapter.mjs`

They demonstrate the wire contract, not a production Hub implementation.
