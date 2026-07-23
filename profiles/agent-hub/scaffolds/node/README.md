# KFD Agent Hub Node.js starter

This dependency-free starter demonstrates only the `jsonl-stdio/v1` request and response envelopes. Run `npm test`, then replace `evaluate()` with product-owned Hub semantics before using:

```sh
kfd test agent-hub --adapter ./adapter.mjs --output ./agent-hub-report.json
kfd verify agent-hub-report ./agent-hub-report.json --adapter ./adapter.mjs --json
```

The included smoke does not run Hub 20 and is neither qualification nor certification. The adapter must remain quiet on stderr during a conformance run.
