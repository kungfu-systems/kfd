---
status: active
period: ongoing
theme: kfd-native-cli
doc_type: user-guide
source_level: public-specifications
confidence: high
sensitivity: public
evidence_grade: A
review_state: self-reviewed
last_reviewed: 2026-08-13
---

# Native `kfd` CLI

KFD publishes a Rust-native executable named `kfd` for every supported desktop
target. The name is stable across upgrades: POSIX archives contain `kfd`, and
Windows archives contain `kfd.exe`.

## Download and verify

Choose the archive for your operating system and architecture from the matching
[KFD GitHub Release](https://github.com/kungfu-systems/kfd/releases). Asset
names have this permanent shape:

```text
kfd-<version>-x86_64-unknown-linux-gnu.tar.gz
kfd-<version>-aarch64-unknown-linux-gnu.tar.gz
kfd-<version>-x86_64-apple-darwin.tar.gz
kfd-<version>-aarch64-apple-darwin.tar.gz
kfd-<version>-x86_64-pc-windows-msvc.zip
```

Each target also has `kfd-<version>-<target>.sha256` and
`kfd-<version>-<target>.provenance.json`. Download all three files for your
target, then verify the archive and provenance bytes against the checksum file:

```bash
shasum -a 256 -c kfd-<version>-<target>.sha256
```

After extraction, put `kfd` somewhere on your `PATH` and confirm the exact
release identity:

```bash
kfd --version
```

The output is `kfd <version>`, where `<version>` exactly matches the GitHub
Release tag without its leading `v`.

## Native capability boundary

The native binary is the offline Rust verifier. It supports:

```text
kfd verify <kind> <path> [--schema <path>] [--json]
kfd bundle <kind> <path> --output <bundle.json>
```

The npm-hosted `kfd` command has a broader orchestration surface, including
commands such as `gate`, `scaffold`, and `test`. Those commands are not hidden
inside the native binary and are not claimed as native capabilities. Use the
npm package when you need host orchestration; use the native binary when you
need the directly compiled offline verifier.

Native and WebAssembly verification share the same verification bundles,
reports, positive fixtures, negative fixtures, and issue ordering. A passing
report remains structural, offline, non-qualifying, and non-self-certified.

## Provenance

The per-target provenance document binds the KFD version, source commit and
tree, Rust toolchain, executable digest, archive digest, target triple, and
smoke-test boundary. Release promotion uploads the exact pull-request-built
bytes and fails if a required payload is missing or if two payloads would use
the same public asset name.
