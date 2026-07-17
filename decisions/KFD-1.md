# KFD-1: Facts must not drift

- Status: active
- Number: 1
- Kind: procedure
- Applies to: every kungfu-systems repository (including this one)

## One sentence

Facts must not drift.

A contract world that users, agents, or systems weld to must come from one
declared fact source and change only through an explicit compatibility
boundary.

## Decision

KFD-1 is the fact-source procedure beneath the KFD foundation. It makes
load-bearing contracts stable enough to integrate with, replay, audit, trust,
and correct. A declared source is not reality itself; it is the reference that
lets reality contradict a model without the evidence changing with the
explanation.

## Welded-surface register

Every product maintains a **welded-surface register**. Register a surface when
either condition holds:

- **Integration-time welding**: consumers bind to it and cannot negotiate or
  feature-detect it at runtime, such as an ABI, schema, CLI, SDK export,
  workflow contract, or channel ontology.
- **Cross-time dependency**: consumers continue to depend on its output after
  the run, such as persisted data, audit evidence, or replayable records.

Each entry has a stable kebab-case ID and is classified as
`integration-time`, `cross-time`, or both. The register is the input to every
KFD-1 classification.

## Compatibility impact

Classify the final diff against the register. The strongest match wins:

| Condition | Verdict |
|---|---|
| A registered surface is removed, renamed incompatibly, changes layout, or changes semantics, defaults, required fields, or channel meaning | **breaking impact** |
| A registered surface evolves additively, or a new surface is added | **additive impact**; register the new surface |
| No registered surface changes | **no registered-surface impact** |
| The diff cannot be classified | **unclassifiable impact**; fix the register before proceeding |

The last verdict is a gate, not permission to guess. It moves the irreducible
judgment about what users weld to back to an accountable maintainer.

These classes are domain-neutral. A product projects them into the control
action its domain requires: a version line, config migration, ABI epoch, API
namespace, compatibility bridge, release gate, or workflow migration.

For release versioning, the projection is:

| Compatibility impact | Release verdict |
|---|---|
| breaking | major |
| additive | minor |
| none | patch |
| unclassifiable | block release and repair the register |

Release versioning is one profile, not the whole procedure. Config contracts,
publication URLs, ABIs, APIs, persisted evidence, and agent-facing workflows
use the same impact core with domain-specific actions. Their concrete package
profiles are documented in `docs/KFD-1-usage.md`.

For config, development code, tests, builds, and delivered artifacts must
consume one contract source; packaged consistency cannot excuse drift from the
development path. For publications, mutable reader routes may move while
versioned artifacts and digests remain immutable.

## Constraints

- **No reverse classification.** Feature volume, milestones, cadence, or
  marketing do not open a line or determine impact.
- **Decision time.** Classify the final diff before the action gate. A
  planning-time verdict is only a prediction.
- **Standing commitment.** An opened release line remains branch-isolated,
  maintainable, permissively licensed, internally self-consistent,
  reproducible from self-archivable inputs, and not hard-coupled to a
  maintainer-operated service.
- **Major dignity.** A major means something consumers welded to broke and
  must be re-audited. An empty major devalues that signal.
- **Inner versions.** A surface may carry its own schema version; the outer
  line identifies the set of contract epochs the line speaks.
- **Namespace welding.** A break may become additive by minting a new
  namespace while freezing the old one, but only where namespaces are cheap
  and both can coexist. Removing the old namespace remains breaking.
- **Deprecation.** Marking a future removal is additive and names its target
  major. Removal is breaking and requires at least one released deprecation
  line first.
- **Migration evidence.** A major-opening decision links migration or
  announcement notes.

## Decision record

Register changes, deprecations, and line openings are recorded in the adopting
repository's contract-world or versioning document. Release patches remain
silent; that silence means no registered surface changed.

```markdown
| Date | Action | Line | Faces | Class | Rationale | PR |
|---|---|---|---|---|---|---|
| 2026-07-15 | open-minor | v2.1 | event-protocol, sdk-logging | additive | Adds welded surfaces without breaking existing ones | #123 |
```

`Action` is `open-minor`, `open-major`, `register`, or `deprecate`; `Faces`
contains register IDs; `Class` is `additive` or `breaking`; rationale is one
sentence and links required migration evidence. Reserved machine vocabulary is
`schemaVersion: 1`, `contract: "versioning-decision"`, and
`date / action / line / faces / class / rationale / pr`.

## Relation to KFD-2 and KFD-3

KFD-1 keeps facts load-bearing. KFD-2 binds trust to those facts. KFD-3 lets
participants choose and cooperate without hidden drift in the world being
offered to them.

## KFD self-application

Published KFD artifacts are immutable. Before the first stable release,
maintainer-authorized refinement may replace a numbered text only in a new
prerelease with explicit breaking decision-surface impact. After stable,
substantive change mints a new KFD that explicitly supersedes the old one.
The outer KFD package line remains `v1.0`; content operations are patches, while
machine-surface impact remains explicit release-passport evidence.

The `@kungfu-tech/kfd` package exposes its own contract world through
`standards.json`, the schemas under `schemas/kfd-1/`, the KFD-1 witness, and
`scripts/check.mjs`. Package implementation and self-proof details live in
`docs/KFD-1-usage.md`.

## Adopters

Adopters keep their register, decision record, and implementation evidence in
their own repository and cite KFD-1 rather than restating it.
