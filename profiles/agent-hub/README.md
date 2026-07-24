# KFD Agent Hub Conformance Profile

This experimental adopter profile packages a fixed dual-Hub black-box suite, JSONL adapter contract, execution report, and offline report verifier. It lets an npm consumer run and verify the profile without a KFD repository checkout.

## Five-minute packaged quickstart

Pin the prerelease channel explicitly because npm `latest` remains the bootstrap package. One command runs the packaged state-machine reference adapter against Hub 20, writes a rooted report, re-hashes the adapter, and verifies the report offline:

```sh
npx --yes --package @kungfu-tech/kfd@alpha kfd demo agent-hub \
  --output ./agent-hub-demo-report.json
```

Inspect the machine-readable command, language, exit-code, verifier-backend, claim, and recovery boundaries without a repository checkout:

```sh
npx --yes --package @kungfu-tech/kfd@alpha kfd capabilities agent-hub --json
```

The demo is an executable reference path, not adopter evidence. Its packaged adapter is non-product code and its passing report remains non-qualifying and non-certifying.

## Verify the first-party Kungfu product

Kungfu ships this exact KFD package and exposes the fixed suite through its
installed executable. A human or agent can run the product-owned semantics
without a KFD repository checkout or a separate Node installation:

```sh
kungfu agent hub qualify --output-dir ./kungfu-agent-hub-check
kungfu agent hub verify --qualification-dir ./kungfu-agent-hub-check
```

The default projection says what passed, which responsibilities were exercised,
what the result means, what it does not mean, whether the real `~/.kungfu`
state stayed unchanged, and where the rooted JSON evidence was written. Add
`--json` for the stable machine projection.

KFD remains the authority for the fixed Hub 20 suite and offline report
verifier. Kungfu remains the authority for its product semantics, two isolated
local Hub domains, installed-artifact binding, and explanatory projection. A
pass is exact-scope first-party product evidence; it is not KFD certification,
a security assessment, production fitness, remote-network interoperability, or
external adoption.

## Scaffold an adopter adapter

Generate exactly one new starter directory:

```sh
npx --yes --package @kungfu-tech/kfd@alpha kfd scaffold agent-hub \
  --language python \
  --output ./my-agent-hub-adapter
```

Languages are `cpp`, `node`, `python`, and `rust`. KFD refuses an existing output path and never overwrites adopter files. Each starter has deterministic fixtures and a local envelope smoke; the smoke explicitly does not execute Hub 20. Implement product-owned semantics, build when required, and then run the fixed suite.

## Run the fixed suite against an adopter

An adapter is an executable or JavaScript entry point that reads one JSON request per line from stdin and writes exactly one JSON response per line to stdout. It must answer one handshake plus the fixed 20 evaluation requests.

```sh
npx --yes --package @kungfu-tech/kfd@alpha kfd test agent-hub \
  --adapter ./my-agent-hub-adapter.mjs \
  --output ./agent-hub-report.json

npx --yes --package @kungfu-tech/kfd@alpha kfd verify agent-hub-report \
  ./agent-hub-report.json \
  --adapter ./my-agent-hub-adapter.mjs \
  --json
```

Omitting `--adapter` during verification still verifies the installed package cut, profile, protocol, suite, failure inventory, verifier, capability documents, responses, result closure, transcript root, and claim boundary. Supplying it additionally re-hashes the adapter bytes.

## Fixed boundaries

- Profile: `kfd-agent-hub-conformance@0.1.0-alpha.1`
- Protocol: `kfd-agent-hub@0.1.0-alpha.1`
- Suite: `kfd-agent-hub-20@0.1.0-alpha.1`, exactly 20 vectors
- Report: `kfd.agent-hub-report/v1`
- Offline verifier result: `kfd.agent-hub-report-verifier/v1`
- Exit `0`: pass or valid report; exit `1`: completed but failed; exit `2`: invalid invocation, JSON, adapter process, or envelope

The suite distinguishes transport delivery from semantic admission, preserves visible conflict, rejects authority amplification and root drift, and retains unavailable and intentionally withheld knowledge as different states.

## Claim boundary

A passing report is exact-scope evidence for the named adapter artifact, two declared Hub capability documents, fixed suite, installed KFD package cut, platform, and retained residual risks. It is not KFD certification, a security assessment, production fitness, independent vendor adoption, or evidence that provisional semantics became normative.

`KFD Runtime 100` remains a separate single-runtime evidence profile. Its 35 Core vectors cover a KFD-7 responsibility-separation subset; its 65 Experimental vectors are provisional and non-qualifying. Agent Hub 20 tests cross-Hub exchange behavior and does not replace Runtime 100.

See [implementer-guide.md](./implementer-guide.md) for the adapter and report workflow.
