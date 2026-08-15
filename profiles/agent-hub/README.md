# KFD Agent Hub Conformance Profile

This experimental adopter profile packages a fixed dual-Hub black-box suite, JSONL adapter contract, execution report, and offline report verifier. It lets an npm consumer run and verify the profile without a KFD repository checkout.

The profile keeps three questions separate. A Hub implementation may be unfinished while the evidence describing that failure is still complete and trustworthy; neither a passing implementation nor valid evidence grants authority by itself.

## Three independent dimensions

| Dimension | Question | Starter result | Reference result |
| --- | --- | --- | --- |
| Behavior | Does the adapter implement the fixed Hub semantics? | `0/20`, not conforming | `20/20`, conforming |
| Evidence | Can the report, package roots, capability roots, outcomes, and adapter bytes be recomputed offline? | `valid` | `valid` |
| Authority | Does the result grant qualification or certification? | both `false` | both `false` |

This is the central teaching case: **the implementation is incomplete, but that failure fact is independently verifiable.**

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

Expected result: command exit `0`, behavior `20/20`, evidence `valid`, `qualifying=false`, and `certification=false`. The demo is an executable reference path, not adopter evidence. Its packaged adapter is non-product code.

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

Languages are `cpp`, `node`, `python`, and `rust`. KFD refuses an existing output path and never overwrites adopter files. Each starter has deterministic fixtures, two structurally complete rooted capability documents, and a local envelope smoke.

Before you implement Hub semantics, the expected result is deliberately:

```text
Scaffold            exit 0
Smoke               exit 0
Hub behavior        exit 1, 0/20, report.valid=false
Evidence verify     exit 0, verification.valid=true, adapter bytes checked
Authority           qualifying=false, certification=false
```

The smoke proves only that the process and JSONL envelope work. Hub 20 then produces a trustworthy negative baseline rather than pretending that the starter is a working Hub.

## Implement Hub semantics

“Hub semantics” means the product decisions made inside `evaluate()`: whether each request is admitted, rejected, conflicted, or retained as unavailable, and which stable code and verdict explain that result. The fixed 20 scenarios protect eight user-visible boundaries:

- negotiation: exact profile and capability agreement;
- delivery: receipts, admission, duplicates, and idempotency;
- authority: attenuation, amplification rejection, and revocation;
- conflict: conflicts remain visible instead of being silently erased;
- knowledge: causal gaps, disclosure limits, and unavailable facts stay distinct;
- completion: settlement requires sufficient proof;
- recovery: reconnect does not revive invalid authority;
- portability: the same semantic outcomes survive implementation and topology changes.

Start in the generated adapter file (`adapter.py`, `adapter.mjs`, `src/main.rs`, or `adapter.cpp`). Preserve the request/response envelope and rooted capability documents, replace the fail-closed `scenario-not-implemented` branch, and use the per-category report counts to advance from `0/20` to `20/20`.

## Run the fixed suite against an adopter

An adapter is an executable or JavaScript entry point that reads one JSON request per line from stdin and writes exactly one JSON response per line to stdout. It must answer one handshake plus the fixed 20 evaluation requests.

```sh
npx --yes --package @kungfu-tech/kfd@alpha kfd test agent-hub \
  --adapter ./my-agent-hub-adapter.mjs \
  --output ./agent-hub-report.json

npx --yes --package @kungfu-tech/kfd@alpha kfd verify agent-hub-report \
  ./agent-hub-report.json \
  --adapter ./my-agent-hub-adapter.mjs
```

On an untouched starter, `test` is expected to exit `1` with `0/20`; after all fixed semantics are implemented it exits `0` with `20/20`. In both cases it writes a report. The verifier answers a different question: it exits `0` when that report's evidence closure is valid, even if behavior is `0/20`. Add `--json` only when a machine needs the complete structured result.

Omitting `--adapter` during verification still verifies the installed package cut, profile, protocol, suite, failure inventory, verifier, capability documents, responses, result closure, transcript root, and claim boundary. Supplying it additionally re-hashes the adapter bytes.

## Fixed boundaries

- Profile: `kfd-agent-hub-conformance@0.1.0-alpha.1`
- Protocol: `kfd-agent-hub@0.1.0-alpha.1`
- Suite: `kfd-agent-hub-20@0.1.0-alpha.1`, exactly 20 vectors
- Report: `kfd.agent-hub-report/v1`
- Offline verifier result: `kfd.agent-hub-report-verifier/v1`
- Scaffold and smoke exit `0` when generation and the local envelope succeed.
- Test exits `0` only at `20/20`; a completed run below that threshold exits `1` and still writes its report.
- Verify exits `0` when report evidence is internally valid; this does not mean behavior passed.
- Exit `2` means invalid invocation, unsafe path, malformed JSON, adapter process failure, or envelope failure.

The suite distinguishes transport delivery from semantic admission, preserves visible conflict, rejects authority amplification and root drift, and retains unavailable and intentionally withheld knowledge as different states.

## Claim boundary

A `20/20` report is exact-scope behavior evidence for the named adapter artifact, two declared Hub capability documents, fixed suite, installed KFD package cut, platform, and retained residual risks. A verifier result of `valid` means those recorded facts and roots close; it does not change `0/20` into a pass. Neither result is KFD certification, a security assessment, production fitness, independent vendor adoption, or evidence that provisional semantics became normative.

`KFD Runtime 100` remains a separate single-runtime evidence profile. Its 35 Core vectors cover a KFD-7 responsibility-separation subset; its 65 Experimental vectors are provisional and non-qualifying. Agent Hub 20 tests cross-Hub exchange behavior and does not replace Runtime 100.

See [implementer-guide.md](./implementer-guide.md) for the adapter and report workflow.
