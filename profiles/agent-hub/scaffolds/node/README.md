# KFD Agent Hub Node.js starter

This dependency-free starter has a valid `jsonl-stdio/v1` envelope and two rooted capability documents, but deliberately implements none of the product-owned Hub outcomes. Its starting state is:

```text
Smoke              exit 0
Hub behavior       exit 1, 0/20
Evidence verify    exit 0, valid
Authority          qualifying=false, certification=false
```

Run the smoke, retain the expected failing report, and prove that failure evidence is intact:

```sh
npm test
kfd test agent-hub --adapter ./adapter.mjs --output ./agent-hub-report.json
# Expected above: exit 1 and 0/20.
kfd verify agent-hub-report ./agent-hub-report.json --adapter ./adapter.mjs
# Expected above: exit 0 and Evidence: valid.
```

Then replace `evaluate()` with product-owned semantics for negotiation, delivery, authority, conflict, knowledge, completion, recovery, and portability. The smoke does not run Hub 20. The adapter must remain quiet on stderr during a conformance run.
