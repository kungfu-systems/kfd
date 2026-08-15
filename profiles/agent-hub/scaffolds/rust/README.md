# KFD Agent Hub Rust starter

This dependency-free starter compiles offline and has a valid `jsonl-stdio/v1` envelope plus two rooted capability documents. It deliberately implements none of the product-owned Hub outcomes. Its starting state is smoke exit `0`, Hub behavior exit `1` at `0/20`, evidence verification exit `0` with `valid`, and no qualification or certification.

Run Hub 20 only against the compiled executable:

```sh
cargo test
cargo build --release
kfd test agent-hub --adapter ./target/release/kfd-agent-hub-rust-starter --output ./agent-hub-report.json
# Expected above: exit 1 and 0/20.
kfd verify agent-hub-report ./agent-hub-report.json --adapter ./target/release/kfd-agent-hub-rust-starter
# Expected above: exit 0 and Evidence: valid.
```

Then replace the fail-closed evaluator with product-owned semantics for negotiation, delivery, authority, conflict, knowledge, completion, recovery, and portability, and replace the fixture-scoped JSON reader with a production JSON implementation. The smoke does not run Hub 20.
