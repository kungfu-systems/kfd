# KFD perspective conformance profile

This additive alpha profile makes the bounded machine-checkable portions of
active KFD-4 and draft KFD-8 replayable offline. It does not change either
decision's status or claim that structural conformance proves semantic truth.

The fixed vectors exercise KFD-4 invariants I8-I12 and KFD-8 identity, source
authority, Fact cut, freshness, omission and loss, state, lineage, moving
current-reference, and semantic non-inference boundaries. The independent Rust
core produces the same sorted report bytes through the native and WASM entrypoints.
