# KFD Agent Hub Python starter

This standard-library-only starter has a valid `jsonl-stdio/v1` envelope and two rooted capability documents, but deliberately implements none of the product-owned Hub outcomes. Its starting state is smoke exit `0`, Hub behavior exit `1` at `0/20`, evidence verification exit `0` with `valid`, and no qualification or certification.

```sh
python3 smoke.py
kfd test agent-hub --adapter ./adapter.py --output ./agent-hub-report.json
# Expected above: exit 1 and 0/20.
kfd verify agent-hub-report ./agent-hub-report.json --adapter ./adapter.py
# Expected above: exit 0 and Evidence: valid.
```

Then replace `evaluate()` with product-owned semantics for negotiation, delivery, authority, conflict, knowledge, completion, recovery, and portability. The smoke does not run Hub 20. Keep stdout as JSONL and stderr empty during conformance execution.
