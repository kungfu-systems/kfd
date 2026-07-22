# KFD Agent Hub Conformance Profile

This experimental adopter profile packages a fixed dual-Hub black-box suite, JSONL adapter contract, execution report, and offline report verifier. It lets an npm consumer run and verify the profile without a KFD repository checkout.

## Run the fixed suite

An adapter is an executable or JavaScript entry point that reads one JSON request per line from stdin and writes exactly one JSON response per line to stdout. It must answer one handshake plus the fixed 20 evaluation requests.

```sh
npx --package @kungfu-tech/kfd kfd test agent-hub \
  --adapter ./my-agent-hub-adapter.mjs \
  --output ./agent-hub-report.json

npx --package @kungfu-tech/kfd kfd verify agent-hub-report \
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
