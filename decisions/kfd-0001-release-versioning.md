# KFD-1: Release versioning — welded-surface registers decide patch, minor, and major

- Status: active
- Number: 1
- Kind: procedure
- Applies to: every kungfu-systems repository (including this one)

## One sentence

A version number is not a summary of the changelog; it is the coordinate of
**which contract world an artifact speaks**. A line may only open because that
world changed, and the world may only change by opening a line — never by
drifting inside one.

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

## How KFDs themselves are versioned

KFD documents are append-only. A KFD's number is immutable and is the
content-layer coordinate; substantive semantic change is made by minting a new
KFD that supersedes the old number (namespace welding applied to decisions).
Consequently, in the `@kungfu-tech/kfd` package, content operations — new
KFDs, status flips, editorial clarifications — are patches; only the machine
surfaces of the package itself (the registry schema, the package structure)
can move minor or major.

## Adopters

Each adopting repository keeps an adoption record, its welded-surface
register, and its decision log in its own versioning document, and does not
restate this rule. This document is the single authoritative text.
