# KFD Agent Hub C++ starter

This C++17, dependency-free starter has a valid `jsonl-stdio/v1` envelope plus two rooted capability documents. It deliberately implements none of the product-owned Hub outcomes. Its starting state is smoke exit `0`, Hub behavior exit `1` at `0/20`, evidence verification exit `0` with `valid`, and no qualification or certification.

```sh
node smoke.mjs
cmake -S . -B build
cmake --build build
kfd test agent-hub --adapter ./build/kfd-agent-hub-cpp-starter --output ./agent-hub-report.json
# Expected above: exit 1 and 0/20.
kfd verify agent-hub-report ./agent-hub-report.json --adapter ./build/kfd-agent-hub-cpp-starter
# Expected above: exit 0 and Evidence: valid.
```

Then replace the fail-closed evaluator with product-owned semantics for negotiation, delivery, authority, conflict, knowledge, completion, recovery, and portability, and replace the fixture-scoped JSON reader with your production JSON boundary. The smoke does not run Hub 20.
