# KFD-3 Collaboration Interface

KFD-3 is a cooperation standard for intelligent participants. It is not an
agent-only standard. Products can use it for humans, agents, operators,
extension authors, API consumers, hosted-service users, service integrators,
maintainers, and other participants who need to understand value, choices, and
constraints before cooperating.

The KFD-owned schema surface is intentionally general:

- `schemas/kfd-3/collaboration-interface.schema.json` declares a product's
  participant-facing collaboration interface.
- `schemas/kfd-3/witness.schema.json` declares release or build evidence that
  the interface is discoverable, classified, constraint-transparent, and closed
  over reachable participant-facing entrypoints.

KFD owns the standard identity, schema IDs, concept names, and compatibility
rules. Product repositories own their concrete profiles. For example, Kungfu
may expose an agent-first profile because agents are a first-class participant
in the current product, but that profile remains a Kungfu implementation of
KFD-3 rather than the definition of KFD-3 itself.

## Required shape

A product collaboration interface should identify:

- participant profiles, such as `human`, `agent`, `operator`,
  `extension-author`, or `api-consumer`;
- minimal entrypoints that let each participant discover the rest of the
  interface;
- participant-visible surfaces, such as CLI commands, JSON APIs, manuals,
  skills, GUI routes, envelopes, packages, or protocols;
- visible constraints, including what is restricted, why, and where review or
  escalation happens;
- choice paths that let participants choose or decline safe cooperation modes;
- extension requests that tell participants how to ask for a new value,
  capability, or interface when the declared interface is insufficient;
- a closure policy for reachable participant-facing entrypoints.

The KFD-3 witness schema is intentionally stricter about closure: a passing
closed-world proof reports reachable entrypoints, classified entrypoints, and
an empty `unclassifiedEntrypoints` list. This prevents a product from exposing
a participant-facing or callable backdoor API outside the declared interface.

## Product profile boundary

Concrete product profiles may add their own contracts, registry fields, command
metadata, generated manuals, or audit output. Those fields should reference the
KFD-3 schema IDs from `standards.json` instead of copying KFD-owned terms.

Examples:

- A Kungfu agent-first bridge can map local commands, provider skills, command
  metadata, and operating manuals into a KFD-3 collaboration interface.
- A Buildchain release passport can carry a KFD-3 witness once a downstream
  product can freeze and verify the concrete interface artifact.
- A hosted surface can use the same standard to show where policy constraints,
  permission gates, and user choices are visible before cooperation is
  requested.

This keeps KFD-3 general while making real product interfaces testable.

## Extension Requests

KFD-3 treats extension requests as part of the collaboration interface. A
human or agent should not have to infer how to cooperate when a declared
interface is missing a value or capability. The interface should expose a
visible request path, the participants it is for, the trigger, and the expected
outcome.

For KFD itself, the standard request path for missing KFD-2 trust-taxonomy
values is a GitHub issue in `kungfu-systems/kfd`. This is both a KFD-2 trust
rule and a KFD-3 collaboration rule: the taxonomy defines what values are valid,
while the collaboration interface tells agents how to request an extension
without inventing private values or relying on pressure.
