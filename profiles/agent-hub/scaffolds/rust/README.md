# KFD Agent Hub Rust starter

This dependency-free starter compiles offline and demonstrates only the `jsonl-stdio/v1` envelope. Run `cargo test` and `cargo build --release`, then replace the fail-closed evaluator and the fixture-scoped JSON field reader with a production JSON implementation.

Run Hub 20 only against the compiled executable:

```sh
kfd test agent-hub --adapter ./target/release/kfd-agent-hub-rust-starter --output ./agent-hub-report.json
```

The included smoke does not run Hub 20 and is neither qualification nor certification.
