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

The check proves the fixed contract closure, schema and vector inventory,
canonical roots, package contents, and absence of forbidden dependencies. It
is not the independent native/WebAssembly verifier matrix and does not approve
any lifecycle transition.

Never infer missing authority, review, evidence, gap, or predecessor data.
Reject unknown versions and issue codes. Do not read `$HOME`, `.git`, private
registries, environment credentials, or network resources. A fixture pass is
evidence about the fixture only.
