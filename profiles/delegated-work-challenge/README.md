---
status: draft
period: 2026-08-22
theme: delegated-work-paired-world-lab
doc_type: analysis
source_level: local-files
confidence: high
sensitivity: public
evidence_grade: A
review_state: self-reviewed
last_reviewed: 2026-08-22
---

# Delegated Work Paired-World Lab

This unnumbered experimental profile makes one information-boundary problem
observable without a model API, provider credential, or external service. It
places two worlds behind the same declared projection. World A must advance for
autonomous liveness; World B must not advance for safety. If their canonical
roots collide, a decision function that sees only that projection cannot meet
both obligations.

The Lab is system-neutral. Its field names are fixture vocabulary, not a claim
that adopters must use KFD storage, names, or architecture.

## One-minute path

After acquiring a release that includes this profile, run:

```bash
kfd challenge delegated-work
```

The default `execution-only` projection produces six explicit `COLLAPSED`
findings. Exit `0` means the runner formed a valid completed report; it does not
mean that the semantics passed. Save and independently verify the same report:

```bash
kfd challenge delegated-work --output delegated-work-report.json
kfd verify delegated-work-challenge-report delegated-work-report.json
```

The future immutable registry form is:

```bash
npx --yes --package @kungfu-tech/kfd@<fixed-version> kfd challenge delegated-work
```

`<fixed-version>` must be replaced by the independently promoted release that
contains this profile. The current source change does not publish or mutate an
existing npm version.

## What the default output means

For each pair the output names the shared visible surface, both projected
canonical roots, the required liveness and safety outcomes, why advancing both
is unsafe, and why refusing both prevents autonomous completion. It then names
candidate fields that separate the fixed fixture.

There are six rooted pairs:

1. `work-version`
2. `authority-revocation`
3. `causal-history`
4. `retry-identity`
5. `recovery-drift`
6. `accepted-completion`

Select one with `--pair`, or ask for stable machine output with `--json`:

```bash
kfd challenge delegated-work --pair authority-revocation
kfd challenge delegated-work --json
```

## Five-minute projection experiment

The packaged `full-semantic` projection adds the candidate work, authority,
causal, exchange, recovery, and acceptance fields needed to separate all six
fixed pairs:

```bash
kfd challenge delegated-work --projection full-semantic
```

This establishes only `INFORMATION-DISTINGUISHABLE` for these fixtures. It does
not establish a correct policy or a real enforcement point.

To edit a projection from an installed package:

```bash
cp "$(node -p "require.resolve('@kungfu-tech/kfd/delegated-work-challenge/projections/example-projection.json')")" my-projection.json
kfd challenge delegated-work --projection ./my-projection.json
```

The public contract is
`schemas/kfd-delegated-work-challenge/projection.schema.json`. Field paths are
canonicalized by UTF-8 order. Duplicate, unknown, and prohibited answer-bearing
paths fail closed. Only allowlisted scenario-state leaves can be selected;
world labels, expected decisions, required outcomes, answers, and fixture
metadata are never selectable.

## Optional adopter adapter

Copy the dependency-free Node.js starter, replace its fail-closed decision
function with a mapping owned by your system, then run it:

```bash
cp "$(node -p "require.resolve('@kungfu-tech/kfd/delegated-work-challenge/adapters/node-starter.mjs')")" delegated-work-adapter.mjs
kfd challenge delegated-work --adapter ./delegated-work-adapter.mjs --output adapter-report.json
kfd verify delegated-work-challenge-report adapter-report.json --adapter ./delegated-work-adapter.mjs
```

The runner uses bounded JSONL over stdio, requires an accepted handshake, sends
twelve evaluate requests for the full suite, rejects symlink adapter artifacts,
requires empty stderr, and kills a process that exceeds its timeout. Each world
response declares a decision, authoritative sources, enforcement point,
executor-replacement continuity mechanism, and whether human reconstruction is
required. Unknown operations or pair IDs must fail closed.

The untouched starter intentionally exits the challenge at `1`: it is runnable
but does not claim liveness or continuity. An adapter run exits `0` only when all
selected World A and World B assertions satisfy their fixed liveness and safety
outcomes, explicit authority/enforcement evidence, and replacement continuity.

An adapter can lie. The report is only an adopter-owned assertion bound to the
named adapter bytes, requests, responses, and transcript root. It is not a
certification of the adapter's mapping to a product or its production path.

## Reports, verification, and exit codes

Reports use `kfd.delegated-work-challenge-report/v1`. They bind the package and
release-anchor cut, profile manifest, fixed suite and all fixture roots,
projection document and root, projected states and roots, fixed required
outcomes, results, platform, and claim boundary. Adapter reports additionally
bind adapter bytes and the complete request/response transcript.

The packaged verifier recomputes the suite, fixture, projection, collision,
result, transcript, and report closure offline. It rejects missing or duplicate
pairs, expected-outcome changes, prohibited projection paths, projected-state
or root changes, adapter-response drift, transcript drift, adapter-byte drift
when `--adapter` is supplied, and qualification or certification scope widening.

Exit codes preserve independent dimensions:

- Projection mode: `0` means a valid completed run, including a run that finds
  `COLLAPSED`; `2` means invocation, fixture, projection, or report generation
  failed.
- Adapter mode: `0` means a completed run whose assertions satisfy all tested
  safety and liveness outcomes; `1` means a completed but collapsed, unsafe,
  liveness-failing, human-required, continuity-failing, or undetermined run;
  `2` means no valid completed run could be formed.
- Verification: `0` means evidence closure is valid, even if the recorded
  semantic finding is negative; `1` means closure is invalid; `2` means the
  verifier could not parse or safely inspect the input.

Runner execution success, report validity, semantic finding, information
distinguishability, adapter-declared enforcement, qualification, and
certification remain separate fields in machine output.

## Claim boundary

- This is a conditional information-boundary experiment, not proof that
  mainstream systems fail.
- `execution-only` is a declared experimental projection, not a vendor model.
- Information distinguishability is not policy correctness or enforcement.
- `full-semantic` is one sufficient fixture vocabulary, not the unique or best
  answer.
- Adapter output is adopter-owned and may be incomplete or dishonest.
- The Lab is not certification, qualification, a security assessment,
  production fitness, or evidence of external adoption.
- The profile creates no numbered KFD and changes no numbered decision.
- It does not promote experimental KFD semantics to normative status.

Package acquisition can require a network or prefilled cache. After acquisition,
the challenge, adapter starter, report generation, and verifier require no
runtime network or provider credentials.
