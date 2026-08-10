---
status: draft
period: 2026-08
theme: kfd-historical-self-conformance-clean-room
doc_type: implementation-guide
source_level: public-specifications
confidence: high
sensitivity: public
evidence_grade: B
review_state: self-reviewed
last_reviewed: 2026-08-10
---

# Historical Self-Conformance clean-room guide

From the extracted package, run:

```bash
node bin/kfd-history.mjs verify \
  profiles/self-conformance/history/historical-lineage.report.json --json
```

The CLI uses the package's current WebAssembly build of the same Rust verifier
core as the native CLI. Verification is offline and recomputes every embedded
source payload root.

Apply the generic recipes literally: Candidate genesis is `absent ->
candidate`; refinement is `candidate -> candidate`; numbered draft is
`candidate -> numbered-draft` or an explicitly bounded historical observation;
qualification is `numbered-draft -> qualified-numbered-draft`; activation is
`qualified-numbered-draft -> active`; packaging is `active ->
active-packaged`; Foundation allocation/revision requires explicit numbering
maps; and non-promotion may end at `no-new-kfd`.

Choose the next action from the actual terminal state. Preserve missing
evidence, draft, revision, rejection, provisional, or non-promotion outcomes;
never select a stronger transition merely to complete a chain. A passing replay
does not mutate `registry.json` or authorize a current lifecycle action.
