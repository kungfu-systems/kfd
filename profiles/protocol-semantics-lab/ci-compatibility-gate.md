---
status: active
period: ongoing
theme: protocol-semantics-lab-ci-compatibility
doc_type: implementation-guide
source_level: local-files
confidence: high
sensitivity: public
evidence_grade: A
review_state: self-reviewed
last_reviewed: 2026-08-24
---

# CI compatibility gate

Pin one immutable KFD package version, generate the report from packaged
fixtures, and verify the saved bytes in a separate step. The gate remains
offline after package acquisition and treats a valid negative semantic result
as valid evidence, not as compatibility success.

```yaml
name: protocol-semantics
on: [pull_request]
jobs:
  evidence-closure:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "24"
      - run: npm install --ignore-scripts --no-save @kungfu-tech/kfd@1.0.0-alpha.69
      - run: npx --no-install kfd challenge delegated-work protocol analyze --fixture mcp-executor-replacement-preserved --output protocol-report.json
      - run: npx --no-install kfd verify delegated-work-protocol-report protocol-report.json
      - uses: actions/upload-artifact@v4
        with:
          name: protocol-semantics-report
          path: protocol-report.json
```

For a route policy, read `result.state` separately from verifier validity. A
preserved route may satisfy a repository's declared compatibility rule; a
`collapsed` or `extension-required` route normally fails that policy even when
the report is structurally valid:

```bash
state="$(node -p "require('./protocol-report.json').result.state")"
test "$state" = preserved
```

The repository owns that policy. KFD does not convert evidence closure into
certification, production fitness, protocol conformance, or release authority.
Retain the immutable package version, report bytes, `reportRoot`, `resultRoot`,
and CI source revision together. Re-run from the same bytes to distinguish
input drift from a changed policy.
