# Agent Guide

This repository is the kungfu-systems decision registry (KFD). It contains
numbered organization decisions, a machine-readable
`registry.json`, non-normative pre-number candidates under `drafts/`, and a
conformance check that keeps these surfaces in agreement.
Each decision has a `kind`: a `principle` states what must remain true across
kungfu-systems, while a `procedure` states how a class of work enforces or
protects a principle.

- To consult a decision: read `registry.json` for the index, then the
  document under `decisions/`. Cite decisions by number (`KFD-1`).
- To inspect future rules: read `drafts/registry.json`, then the candidate
  document under `drafts/`. Cite a candidate by ID and commit or package
  coordinate. Never treat `slotHint` as an allocated KFD number.
- To understand what a document guarantees: every decision text is the single
  authoritative version; adopting repositories keep only adoption records and
  pointers.
- To propose or land changes: see `CONTRIBUTING.md`. Every published artifact
  is immutable. Before stable, a fully evidenced Foundation Revision may
  correct the latest numbered structure while preserving prior coordinates
  and publishing lineage. The first stable release freezes number-to-meaning
  mappings; later substantive changes mint a new number that supersedes the
  old one.
- Do not treat later numbers as implicit overrides. Supersession or override
  must be explicit in the later decision and in `registry.json`; otherwise a
  conflict between active KFDs is a registry defect.
- Documentation map: `docs/MAP.md`.

Before committing: run `node scripts/check.mjs` and keep `registry.json` and
`decisions/` in agreement; the verify gate rejects a registry that lies about
its contents.
