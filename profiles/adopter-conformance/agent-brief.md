---
status: draft
period: 2026-08
theme: kfd-full-cut-adopter-conformance
doc_type: implementer-guide
source_level: public-specifications
confidence: high
sensitivity: public
evidence_grade: B
review_state: self-reviewed
last_reviewed: 2026-08-11
---

# Agent brief: package-only adopter toolchain

Use only one unpacked, exact `@kungfu-tech/kfd` package and an independently
retained SHA-256 root for that package artifact. Do not derive the artifact
root from the unpacked directory, a mutable npm tag, a source checkout, or a
local cache. The CLI reads its registry, standards, schemas, vectors,
verifiers, and admitted witness profiles relative to its own installed package;
it does not search sibling repositories or Home and does not use the network.

The safe sequence is:

```sh
kfd adopter init \
  --manifest-id example-cut \
  --adopter-id example-third-party \
  --artifact-kind git-commit \
  --artifact-coordinate example/repository@0123456789abcdef \
  --artifact-root sha256:<64-lowercase-hex> \
  --scope example-scope \
  --package-root sha256:<64-lowercase-hex> \
  --verified-at 2026-08-11T00:00:00Z \
  --max-age-seconds 86400 \
  --output adopter.json --json

kfd adopter witness adopter.json \
  --decision KFD-10 \
  --profile kfd-warrant-evidence \
  --coordinate example/repository@0123456789abcdef#warrant \
  --witness-root sha256:<64-lowercase-hex> \
  --package-root sha256:<same-package-root> \
  --verified-at 2026-08-11T00:00:00Z \
  --max-age-seconds 86400 \
  --output witnessed.json --json

kfd adopter verify witnessed.json \
  --package-root sha256:<same-package-root> \
  --verified-at 2026-08-11T00:00:00Z \
  --max-age-seconds 86400 --json

kfd adopter diff adopter.json witnessed.json --json

kfd adopter bundle witnessed.json \
  --package-root sha256:<same-package-root> \
  --verified-at 2026-08-11T00:00:00Z \
  --max-age-seconds 86400 \
  --output adopter.bundle.json --json
```

`init`, `witness`, and `bundle` create a new file exclusively and never
overwrite an existing path. `verify` exits `0` for a valid declaration, `1`
for a reproduced fail-closed report, and `2` for invalid invocation or input
shape. `diff` reports decision IDs as `added`, `removed`, or `changed`, plus
before/after roots and changed field names; it never rewrites either input.
Machine output is JSON with stable contract names and rooted closure fields.

An initialized manifest declares every pinned registry row as `not-used`. A
witness operation changes only the selected declaration in a newly written
manifest. The current inventory admits `kfd-warrant-evidence` only for
`KFD-10`; unknown decision IDs, witness profiles, fields, roots, and package
substitutions fail closed. KFD-10 remains draft, so adding its witness retains
`draft-evidence`, empty claims, and no adoption, activation, release, runtime,
or certification authority.

Recovery is local and explicit: correct the command input and choose a new
output path. Never edit rooted `kfdCut` members to make a report pass. If the
package version or bytes change, start a successor manifest with the new exact
artifact root and compare it with `diff`; do not silently rewrite the old cut.
