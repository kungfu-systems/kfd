# Agent Guide

This repository is the kungfu-systems decision registry (KFD). It contains
numbered, append-only organization decisions, a machine-readable
`registry.json`, and a conformance check that keeps the two in agreement.

- To consult a decision: read `registry.json` for the index, then the
  document under `decisions/`. Cite decisions by number (`KFD-1`).
- To understand what a document guarantees: every decision text is the single
  authoritative version; adopting repositories keep only adoption records and
  pointers.
- To propose or land changes: see `CONTRIBUTING.md`. Decision texts are
  append-only — substantive semantic changes mint a new number that
  supersedes the old one, they never rewrite an existing text.
- Documentation map: `docs/MAP.md`.

Before committing: run `node scripts/check.mjs` and keep `registry.json` and
`decisions/` in agreement; the verify gate rejects a registry that lies about
its contents.
