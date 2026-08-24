---
status: active
period: ongoing
theme: protocol-semantics-lab
doc_type: architecture
source_level: local-files
confidence: high
sensitivity: public
evidence_grade: A
review_state: self-reviewed
last_reviewed: 2026-08-24
---

# Protocol Semantics Lab

The Protocol Semantics Lab is an unnumbered experimental Profile for asking a
bounded question: what information survives when one protocol vocabulary is
normalized or routed into another? It does not add a KFD, replace a protocol,
certify a vendor, prove runtime enforcement, rank adoption, or establish
commercial demand.

## One-minute installed-package baseline

From a clean directory with Node.js and npm, install the exact successor alpha,
list the frozen catalog, and inspect the MCP Tasks pack:

```bash
npm init -y
npm install --ignore-scripts @kungfu-tech/kfd@1.0.0-alpha.69
npx --no-install kfd challenge delegated-work protocol list
npx --no-install kfd challenge delegated-work protocol inspect mcp-tasks
```

The list contains exact versions and pack roots. Inspection shows all six
paired-world questions, each representation state, and the separate protocol
and KFD Work responsibility boundaries.

Run a preserved route, save it, and verify the same bytes offline. Then inspect
the fixed collapsed counterexample:

```bash
npx --no-install kfd challenge delegated-work route analyze --route mcp-to-a2a --output preserved-route.json
npx --no-install kfd verify delegated-work-protocol-report preserved-route.json
npx --no-install kfd challenge delegated-work route analyze --route durable-runtime-recovery-to-canonical-work
```

After npm has acquired the package, these commands read no network service and
require no model API or provider credential. The expected states are
`preserved` and `collapsed`; verifier validity is an independent evidence-
closure result.

## First-stage product interface

- [`examples/manifest.json`](examples/manifest.json) binds four checked-in,
  deterministically generated MCP, A2A, Zed ACP, and commerce reports to their
  exact bytes, result roots, and report roots.
- [`design-review/intake.template.json`](design-review/intake.template.json)
  and [`design-review/deliverable.template.json`](design-review/deliverable.template.json)
  are valid instances of their adjacent strict JSON Schemas and can be used
  without oral setup.
- [`service-boundaries.md`](service-boundaries.md) separates the free public
  evidence surface from possible future design review, private adapter, and CI
  assessment work without promising a hosted service.
- [`ci-compatibility-gate.md`](ci-compatibility-gate.md) shows how to pin the
  package, retain a report, verify it offline, and apply a repository-owned
  route policy.

Reproduce all four examples from the package source with:

```bash
npm run generate:protocol-semantics-commercialization
git diff --exit-code -- profiles/protocol-semantics-lab/examples
```

The sole public discussion entry is [Discussion 427](https://github.com/kungfu-systems/kfd/discussions/427).
No second site, intake portal, or protocol standard is created.

## Authority map

The existing Delegated Work paired-world challenge remains the only semantic
kernel used by this lab:

| Surface | Authority | Permitted role |
| --- | --- | --- |
| `profiles/delegated-work-challenge/fixtures/suite.json` | Fixed six-pair experiment kernel | Supplies the worlds that must remain distinguishable or explicitly collapsed |
| `profiles/delegated-work-challenge/projections/*.json` | Existing projection declarations | Preserves the `execution-only` default and `full-semantic` reference behavior |
| Protocol Evidence Packs | Frozen declarative input | Binds bounded source semantics to exact versions and roots |
| Protocol Observations | Adapter-owned evidence projection | Normalizes explicit observations without gaining Work or protocol authority |
| Cross-Protocol Routes | Derived comparison | Declares preserved meaning and every known loss |
| Derived Capability Manifests | Derived evidence state | Separates declared, observed, and verified provenance |
| Reports and generated references | Reproducible projection | Bind inputs and contract bytes; never certify external reality |

No lab surface may mutate the six paired worlds, their expected outcomes, the
numbered KFD registry, or the meaning of an existing command or report. A new
surface that needs different worlds must declare an extension and remain
outside the fixed regression kernel.

## Contract chain

```text
fixed source coordinate + content root
  -> Protocol Evidence Pack
  -> normalized Protocol Observation
  -> Cross-Protocol Route with explicit loss declarations
  -> Derived Capability Manifest
  -> later report projections
```

Every contract is versioned and rejects unknown fields. The four representation
states are:

- `represented`: the document carries the value and at least one evidence root;
- `extension-required`: the fixed vocabulary cannot carry the semantic without
  a separately versioned extension;
- `out-of-scope`: the semantic is deliberately outside this experiment;
- `unresolved`: available evidence does not determine the semantic.

Capability provenance is monotonic but not automatic. `declared` requires a
declaration root. `observed` additionally requires an observation root.
`verified` additionally requires a verification root. A field named
`inferred`, an unrooted verified claim, or an undeclared state fails closed.

## Registry and immutable coordinates

`registry.json` is the exact current pack set for one registry version. Each
protocol identity may occur once and binds an exact protocol version, repository
path, and semantic pack root. `latest`, branch aliases, missing roots, duplicate
protocol identities, unsupported schema versions, and nondeterministic ordering
are invalid. Later source drift creates a new pack and registry version; it does
not mutate an earlier coordinate.

The registry binds the reviewed frozen catalog generated from
`catalog-source.json`. The source file contains bounded paraphrases copied from
the Assignment's immutable source catalog; locators are citations and are never
fetched by generation or validation. Every registered pack uses Evidence Pack
v2, explicitly maps all six paired-world questions, separates protocol-owned
responsibility from KFD Work responsibility, and records maturity, native
objects and states, extension points, non-claims, evidence grade, drift policy,
and a no-vendored-text source boundary. Architecture fixtures continue to
exercise Evidence Pack v1 unchanged.

`zed-acp` names the Agent Client Protocol session surface. `commerce-acp` names
the AP2/UCP/agentic-commerce family. A bare `acp` identity is not registered.
IETF AI-agent auth draft-03 is machine-marked `draft`, and WebMCP is
machine-marked `incubating`; neither may be rendered as an adopted stable
standard.

## Compatibility and migration contract

This profile is additive to `@kungfu-tech/kfd@1.0.0-alpha.68`:

1. the suite ID remains `delegated-work-paired-worlds` with exactly six pairs;
2. the default projection remains `execution-only` and collapses the six fixed
   pairs;
3. `full-semantic` remains a sufficient reference projection and distinguishes
   the six fixed pairs;
4. `kfd.delegated-work-challenge-report/v1`, existing CLI commands, package
   paths, and numbered KFD meaning remain unchanged;
5. consumers opt into the new `protocol-semantics-lab/*` package exports;
6. future contracts use a new contract version instead of weakening version 1.

The generated `generated/contract-reference.json` binds the kernel coordinates,
registry root, schema byte digests, package export names, and claim boundary.
`generated/catalog-reference.json` binds every pack root and
`generated/catalog-comparison.md` is the deterministic human-readable view.
Re-running the generator must reproduce every generated byte offline.

## Offline protocol observation adapters

The package export `protocol-semantics-lab/observation-adapters` converts fixed
MCP Tasks, A2A Task, Zed ACP, and AG-UI traces into
`kfd.protocol-observation/v2`. The module uses no network primitive and runs
from the packed npm artifact. Each represented fact retains its native event
identifier, exact JSON coordinate, and a coordinate-bound evidence root. Every
field that the trace does not carry is marked `absent` with an explicit
`ambiguous`, `extension-required`, `not-represented`, or `out-of-scope` reason.

The adapters never derive canonical Work identity, Work revision, authority,
or accepted completion from task, session, run, executor, status, or transport
success. The fixed traces cover preserved and ambiguous executor replacement,
retry, and resume cases. Unknown event variants, protocol-version drift,
duplicate event identifiers, unexpected payload fields, and provenance
mismatches fail closed before an observation is emitted. Repeated adaptation
binds the same input, adapter artifact, transcript, and output roots.

## Ordered cross-protocol routes

The package export `protocol-semantics-lab/route-analyzer` builds and verifies
six fixed offline routes: MCP to A2A, A2A to MCP, Zed ACP resume to A2A
continuation, AG-UI interrupt to backend Task resume, commerce authorization
through merchant acceptance to accepted completion, and a durable-runtime
recovery counterexample. Each ordered hop declares its rooted input and output,
all six semantic mappings, losses, inference mode, and authority transition.
The additive `kfd.cross-protocol-route/v2` contract leaves route v1 unchanged.

Route v2 uses exactly `preserved`, `extension-required`, `out-of-scope`, and
`collapsed`. Native session, task, invocation, payment, and message identities
remain separate rooted coordinates and cannot substitute for canonical Work.
One fixed MCP-to-A2A route preserves all six semantics; the durable-runtime
counterexample explicitly collapses a paired world. Hop permutation, omission,
stale pack roots, authority-revision drift, synthetic Work identity, and unknown
states all fail closed. The analyzer reads only the frozen local registry and
does not claim interoperability, vendor correctness, runtime authority, or
certification.

## Delegated-work report commands

The report surface stays under the existing `challenge delegated-work` command
family. It reads only packaged packs, fixtures, mappings, routes, adapters and
release coordinates:

```bash
kfd challenge delegated-work protocol list
kfd challenge delegated-work protocol inspect mcp-tasks
kfd challenge delegated-work protocol analyze \
  --fixture mcp-executor-replacement-preserved \
  --output protocol-report.json
kfd challenge delegated-work route analyze --route mcp-to-a2a
kfd challenge delegated-work route analyze \
  --route durable-runtime-recovery-to-canonical-work
kfd verify delegated-work-protocol-report protocol-report.json
kfd challenge delegated-work manifest derive protocol-report.json \
  --output capabilities.json
```

Human and `--json` output carry the same `resultRoot`. Protocol reports bind the
package and frozen Git baseline cut, paired-world suite, evidence pack, six-question
mapping, fixed route suite, fixture bytes, adapter artifact, transcript,
result, claim boundary and residual-risk roots. The verifier recomputes those
bindings from installed package bytes without a network call and states only
`evidence-closure-only`. Capability manifests are emitted only after that
report verifies; represented facts carry declared, observed and verified roots,
while absent facts remain declared rather than being promoted by inference.

These commands do not observe an external product, grant runtime authority, or
change any numbered KFD meaning. A valid report says only that its bounded local
evidence closure reproduces.

## Validation

Run the architecture contract and the unchanged paired-world regression:

```bash
npm run check:protocol-semantics-lab
npm run check:delegated-work-challenge
```

The fixtures and analyzer mutations include explicit failures for duplicate
protocol identities, hidden inference, missing verification evidence, mutable
`latest` coordinates, unsupported schema versions, hop permutation or omission,
stale packs, authority-revision drift, and synthetic Work identity. Catalog
mutations additionally reject a
missing paired-world row, collapsed responsibility, a mutable drift policy,
bare ACP identity, and stable rendering of draft or incubating sources. Offline
validation proves document closure only; it does not observe a production
implementation.
