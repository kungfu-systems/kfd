---
status: draft
period: 2026-08-23
theme: protocol-semantics-lab
doc_type: architecture
source_level: local-files
confidence: high
sensitivity: public
evidence_grade: A
review_state: unreviewed
last_reviewed: 2026-08-23
---

# Protocol Semantics Lab

The Protocol Semantics Lab is an unnumbered experimental Profile for asking a
bounded question: what information survives when one protocol vocabulary is
normalized or routed into another? It does not add a KFD, replace a protocol,
certify a vendor, prove runtime enforcement, rank adoption, or establish
commercial demand.

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

The registry intentionally starts empty. The architecture fixtures under
`fixtures/` exercise the contracts but are not registered protocol evidence.
Protocol-specific packs are a separate reviewed delivery.

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
empty registry root, schema byte digests, package export names, and claim
boundary. Re-running the generator must reproduce it byte for byte.

## Validation

Run the architecture contract and the unchanged paired-world regression:

```bash
npm run check:protocol-semantics-lab
npm run check:delegated-work-challenge
```

The fixtures include explicit failures for duplicate protocol identities,
hidden inference, missing verification evidence, mutable `latest` coordinates,
and unsupported schema versions. Offline validation proves document closure
only; it does not observe a production implementation.
