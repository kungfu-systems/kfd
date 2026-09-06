# KFD — Kung Fu Decisions

KFD asks: **How can a bounded, goal-directed system act and change in an
unpredictable world without losing continuity with itself?**

KFD is an open engineering standard for work that outlives the person, agent,
session, repository, or tool carrying it. It keeps facts, boundaries, and
responsibility inspectable as those carriers change.

KFD does not claim to be the final answer or a complete theory of complex
systems. Kungfu is its founding implementation, not its adoption boundary.

## Start here: the agent is not the center of truth

Two runs can produce the same output. One continues the right work under valid
authority; the other does not. They look alike, but require different
decisions.

What must remain continuous when the carrier changes but the work continues?
KFD uses four short reminders for this break:

```text
running != authorized
retry != same attempt
same output != same result
success != admitted Fact
```

An agent participates in the work; it does not define its identity, authority,
history, or truth. One real delivery broke all four equivalences.

[See the real failure that forces this model](docs/conceptual-compression.md) ·
[Run the one-minute paired-world experiment](profiles/delegated-work-challenge/README.md)

## Choose a path

- **Understand the idea:** read the
  [ten-minute conceptual guide](docs/conceptual-compression.md).
- **Test the distinction:** run the
  [paired-world challenge](profiles/delegated-work-challenge/README.md).
- **Use or assess KFD:** open the [documentation map](docs/MAP.md),
  [implementation guide](docs/independent-verifier.md), or
  [current decision registry](registry.json).

## Foundation triad

The first three decisions form a simple progression:

```text
KFD-1: facts must not drift.
KFD-2: trust must start from facts.
KFD-3: cooperation must start from trusted value.
```

First preserve what is true. Then make trust inspectable from those facts.
Only then coordinate participants through trusted value. No principle is
load-bearing until it has an inspectable product witness.

[Read the foundation](docs/foundation.md) ·
[See KFD under load](docs/load-bearing-dogfood.md) ·
[Inspect the formal model](docs/formal-model.md) ·
[See primitives in history](docs/primitive-discovery-cases.md)

## About this repository

This repository is KFD's canonical open decision registry. Numbered decisions
live in [`decisions/`](decisions/), pre-number candidates in
[`drafts/`](drafts/), and machine-readable metadata in [`registry.json`](registry.json).
Primitive discovery is one frontier through which KFD tests that harder
problem. It is not the whole continuity path.

For deeper material, use the [repository guide](docs/repository-guide.md) and
[documentation map](docs/MAP.md). To propose or challenge a decision, read
[`CONTRIBUTING.md`](CONTRIBUTING.md). Before contributing, run:

```bash
node scripts/check.mjs
```

KFD is pre-stable and evidence-governed. Verifier output is evidence, not
certification, adoption proof, or release authority. See
[`GOVERNANCE.md`](GOVERNANCE.md) and [`LICENSE`](LICENSE) for stewardship and
license boundaries.
