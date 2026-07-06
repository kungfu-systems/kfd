# KFD-1: Contracts must not drift — contract worlds need one fact source

- Status: active
- Number: 1
- Kind: procedure
- Applies to: every kungfu-systems repository (including this one)

## One sentence

A contract world must not change invisibly: any surface that users, agents, or
systems weld to must come from one declared fact source and change only through
an explicit compatibility boundary.

## Foundation role

Within the KFD-1/2/3 foundation, this is the contract procedure:

```text
contracts must not drift
```

KFD-1 makes artifact contract worlds explicit so releases do not drift under
changelog volume, cadence pressure, or marketing pressure. It is the concrete
versioning procedure that lets users and agents know which artifact world they
are integrating with, replaying, auditing, or trusting.

KFD-1 now has two concrete implementation surfaces in the Kungfu ecosystem:
versioning protects release lines from contract drift, and config contracts
protect multi-target configuration from drifting across runtimes, products, and
agent-facing surfaces.

## Premise: the welded-surface register

Every product maintains a **welded-surface register**. A surface is registered
when either holds:

- **(a) Integration-time welding** — consumers bind to it at integration time
  and cannot negotiate or feature-detect at runtime (an ABI, a schema, an
  action or workflow contract, CLI semantics, SDK exports, channel/tag
  ontology).
- **(b) Cross-time dependency** — its outputs remain depended on after the run
  (persisted data, audit evidence, replayable records).

Each entry carries a stable kebab-case ID. Registers live in each repository's
versioning document and are the input to every classification below.

## Concrete case: config contracts

A product's global config contract is a welded surface when multiple targets
depend on it: users, agents, UI, CLI, packaged artifacts, release gates, or
language runtimes. Its schema, defaults, resolution rules, and resolved-output
metadata must not drift target by target. That contract world needs one
declared fact source, and each target should make the exact contract world it
speaks inspectable, for example through a packaged contract copy or content
hash.
The rule applies before packaging as well: development-time code, tests, build
steps, and the final product must consume the same contract mechanism. It is
not enough for the packaged artifact to be internally consistent if the
developer path used a different, driftable config source.

## The decision procedure

Classify the actual diff against the register; the highest match wins:

| # | Condition | Verdict |
|---|---|---|
| 1 | **Breaks** any registered surface (removal, semantic change, layout change, incompatible rename — a semantic change counts as breakage even when shapes are unchanged: changed defaults, changed channel meaning, a newly required field) | **major** |
| 2 | **Additively evolves** a registered surface, or **adds** a surface consumers will weld to | **minor** (register the new surface at the same time) |
| 3 | Touches no registered surface | **patch** — regardless of how large the feature is |
| 4 | **Cannot be classified** | **Do not guess.** The register is deficient: fix the register first (a maintainer decision), then reclassify |

Rule 4 is the safety valve: it forces the irreducible judgment (what counts as
a welded surface) to a maintainer instead of letting a change silently pick
the convenient answer.

## Constraint clauses

- **Reverse prohibition.** A line must not be opened for feature volume,
  milestones, cadence, or marketing. Lines open only because the contract
  world changed.
- **A line is a standing commitment.** Every opened line inherits the
  maintainability-openness obligations: branch isolation, a permissive
  license, a self-consistent contract world, reproducible builds from
  self-archivable inputs, and no hard coupling to a maintainer-operated
  service.
- **Decision time.** The verdict is checked against the final diff before the
  promotion into the alpha channel; planning-time classification is only a
  prediction.
- **Major dignity.** A major release communicates exactly one thing: something
  you welded to broke and you must re-audit. An empty major — one that breaks
  nothing — devalues that signal and teaches consumers to ignore the next real
  one.
- **Two-layer versioning.** A registered surface may carry its own inner
  schema version for cold-path evolution (additive fields, defaults); the
  outer line version pins which set of contract epochs the line speaks.
- **Namespace welding (a legal reroute).** A breaking change may be rerouted
  into an additive one by minting the contract major into the artifact's name
  (`node24-pnpm` → `node26-pnpm`; Go's `/v2` import paths). The old name's
  semantics freeze forever; the new name is a new surface → minor. Removing
  the old name is the major. This applies only where the namespace is cheap
  (image names, paths, tags) — an ABI or layout with no name to mint cannot
  use it.
- **Welding-strength gradient (rationale, not procedure).** The closer a weld
  is to content addressing (a digest pin is the strongest weld and protects
  itself), the more a version line serves as a coordinate for floating
  consumers rather than as protection. Coordinates still forbid in-line drift;
  the procedure is unchanged.
- **Deprecation protocol.** Planned breakage is a process, not an event.
  Deprecating a surface is an additive act (a "this will go away" marking) →
  minor, logged with the target removal major. Removal is the breakage →
  major, and the surface must already carry its deprecation marking on at
  least one **released** minor line before it may be removed.
- **Major migration guide.** A decision-log entry that opens a major must link
  migration or announcement notes; "explicitly announced" has minimum content.

## The decision log

Line openings (minor/major), register changes, and deprecations must be
recorded in the repository's versioning document; patches stay silent —
silence is itself the signal that no registered surface was touched.

One markdown table row per event, newest first:

```markdown
| Date | Action | Line | Faces | Class | Rationale | PR |
|---|---|---|---|---|---|---|
| 2026-07-15 | open-minor | v2.1 | event-protocol, sdk-logging | additive | Toolkit adds new welded surfaces; nothing existing breaks | #123 |
```

- `Action`: `open-minor | open-major | register | deprecate`.
- `Faces`: register IDs, not prose.
- `Class`: `additive | breaking`.
- `Rationale`: one sentence; `open-major` must link migration notes;
  `deprecate` must name the target removal major.

Reserved machine vocabulary (for future automated evidence, so the human
table and the machine record never diverge): `schemaVersion: 1`,
`contract: "versioning-decision"`, camelCase fields
`date / action / line / faces / class / rationale / pr`.

## Relation to KFD-2 and KFD-3

KFD-2 establishes fact-first product accountability: important claims should
be inspectable before users or agents are asked to trust them. KFD-1 is the
contract-layer expression of the same single-fact-source discipline: it
preserves accountability across artifact contract worlds before those artifacts
are used to produce runtime facts, responsibility state, or proof-backed
decisions.

KFD-3 establishes non-coercive cooperation with intelligent participants. That
cooperation depends on the same contract clarity: users and agents can choose,
delegate, replay, or refuse more honestly when the artifact world is legible
and does not drift invisibly.

## How KFDs themselves are versioned

KFD documents are append-only. A KFD's number is immutable and is the
content-layer coordinate; substantive semantic change is made by minting a new
KFD that supersedes the old number (namespace welding applied to decisions).
Consequently, in the `@kungfu-tech/kfd` package, the outer package line stays
fixed at `v1.0`. Content operations — new KFDs, status flips, editorial
clarifications — are patches. Machine surfaces of the package itself (the
registry schema, the package structure) can still require `minor` or `major`
surface-impact review in the Buildchain release passport, but that review
classification is not a silent package-line upgrade.

## Implementation case: the KFD package

The `@kungfu-tech/kfd` npm package is a self-proof case for this procedure.
Its decision texts, `registry.json`, `standards.json`, schemas, site bundle,
and release propagation graph are published as stable surfaces. Their contract
world is not inferred from README prose or package version alone: it is exposed
through `standards.json`, checked by `scripts/check.mjs`, and bound into the
KFD-1 witness under `.buildchain/kfd-1/contract-world.witness.json`.

This lets humans and agents inspect how the KFD package prevents its own
contract surfaces from drifting while it evolves.

## Adopters

Each adopting repository keeps an adoption record, its welded-surface
register, and its decision log in its own versioning document, and does not
restate this rule. This document is the single authoritative text.
