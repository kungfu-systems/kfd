---
status: draft
period: 2026-08
theme: kfd-self-conformance-clean-room
doc_type: implementation-guide
source_level: public-specifications
confidence: high
sensitivity: public
evidence_grade: B
review_state: self-reviewed
last_reviewed: 2026-08-07
---

# Self-Conformance clean-room guide

Start from an extracted `@kungfu-tech/kfd` package, not a repository sibling or
product checkout. Read these files in order:

1. `profiles/self-conformance/README.md`;
2. `profiles/self-conformance/manifest.json`;
3. `schemas/kfd-self-conformance/*.schema.json`;
4. `profiles/self-conformance/issue-codes.json`;
5. `profiles/self-conformance/vectors/contract-vectors.json`.

Implement `sha256-kfd-canonical-json-v1` exactly, recompute every state and
bundle root, validate the predecessor or bootstrap chain, then emit a report
that conforms to `transition-report.schema.json`. Sort checks by `id` and
issues by `code`, `path`, and `message` before serialization.

Run the package-owned contract check offline:

```bash
npm run check:self-conformance-profile
```

Run the independent packaged WebAssembly verifier over one transition bundle:

```bash
node bin/kfd.mjs verify self-conformance-transition transition-bundle.json --json
```

The native CLI accepts the same kind and input. Both projections share one
Rust core and the fixed verifier matrix requires byte-identical reports,
semantic report roots, issue ordering, and exit classification.

The contract check proves the fixed contract closure, schema and vector
inventory, canonical roots, package contents, and absence of forbidden
dependencies. The independent verifier matrix is a separate executable check;
neither check approves a lifecycle transition.

For an official lifecycle transition, create a request conforming to
`lifecycle-gate-request.schema.json`. Its `chain` begins at the packaged
bootstrap anchor and contains every intervening bundle, independently computed
report root, package root, authority receipt, and review receipt. Then run:

```bash
node bin/kfd.mjs gate self-conformance-lifecycle request.json \
  --output report.json --json
```

The command invokes the package's independent WebAssembly verifier for every
chain entry and separately checks governance-receipt roots and roles. Preserve
the request and report together. An output path is create-only, so an earlier
report cannot be silently overwritten; regenerate to a new path and review the
root change instead.

Never infer missing authority, review, evidence, gap, or predecessor data.
Reject unknown versions and issue codes. Do not read `$HOME`, `.git`, private
registries, environment credentials, or network resources. A fixture pass is
evidence about the fixture only.
