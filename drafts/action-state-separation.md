---
status: draft
period: 2026-07-18
theme: cross-domain-action-primitives
doc_type: kfd-candidate
source_level: maintainer-consensus
confidence: medium
sensitivity: public
evidence_grade: C
review_state: self-reviewed
last_reviewed: 2026-07-18
---

# KFD Candidate: Cross-Domain Action Primitives

- Candidate status: incubating
- Kind candidate: principle
- Current slot hint: 7
- Slot binding: non-binding

## One sentence

Real-world action must begin from independently addressable, fact-bound
direction, perspective, and authority, and return as independently replayable
causal experience.

## Candidate rule

KFD-1 through KFD-3 establish a fact-grounded world. KFD-4 through KFD-6 make
perspective transformation, Primitive discovery, and autonomous correction
possible over causal experience. This candidate asks how an intelligent
participant acts inside that world.

The current substrate hypothesis is:

```text
Fact     -> what holds under a declared authority and cut
Episode  -> what happened through a bounded encounter with reality
```

Fact and Episode are not proposed here as ordinary domain Primitives. They are
the minimum operational substrate on which action Primitives can be discovered,
qualified, and used.

Consequential action requires three independently addressable semantic roles:

```text
direction             -> Pursuit
perspective and cut   -> Atlas
authority boundary    -> Warrant
realized experience   -> Episode
```

Pursuit, Atlas, and Warrant are the first cross-domain action-Primitive
candidates. They direct, observe, and permit action. Episode preserves what
actually occurred. None may silently imply another.

This candidate establishes the category, separation rule, and action loop. It
does not fully define the three candidate Primitives. Their current
non-binding elaboration hypotheses are:

- [Atlas action perspective](atlas-action-perspective.md), slot hint `8`;
- [Pursuit intent continuity](pursuit-intent-continuity.md), slot hint `9`;
- [Warrant bounded authority](warrant-bounded-authority.md), slot hint `10`.

## Action loop

The proposed closure is:

```text
Fact cut
  -> Atlas declares what can be seen
  -> Pursuit declares what continues
  -> Warrant declares what is permitted
  -> action encounters reality
  -> Episode preserves what happened
  -> claims, review, correction, and admission
  -> successor Fact cut
```

The order is explanatory, not a mandatory user-interface sequence. Low-
consequence work may derive inspectable defaults. Simplification may reduce
ceremony but must not fuse semantic responsibility.

## Low-complexity session limit

The candidate is more general than a session model only if it conservatively
recovers the familiar session experience when the work is locally simple. A
representative low-complexity limit has:

- one active Pursuit with one local goal;
- one Atlas that is adequately represented by the current bounded context;
- one stable, non-delegated Warrant for the session's effective permissions;
- one contiguous Episode covering the relevant execution attempt;
- sparse Fact change, normally an admitted starting cut and a result cut.

Under those declared conditions, a product may project the action structure as:

```text
Pursuit  -> goal
Atlas    -> context
Warrant  -> tool permissions
Episode  -> session, run, and transcript
Fact     -> input state and result
```

The user should not have to manage five explicit objects to complete such a
task. A conforming product may synthesize inspectable defaults and expose one
session-compatible surface, provided the projection preserves the goal,
context boundary, effective permissions, observed execution, and result.

This compression is conditional rather than ontological. It must expand when
its assumptions fail: several Pursuits share a session, perspective or
freshness matters, authority is delegated or revoked, work crosses several
Episodes, or Fact state branches materially. The session remains a valid
runtime and interaction object; it simply stops being sufficient as the sole
model of real-world work.

## Why the candidate exists

The
[conditional distinguishability argument](../cases/live/proof-carrying-work-object/distinguishability.md)
shows that direction, perspective, authority, and occurrence can change action
or audit conclusions independently. It is a conditional information-separation
result, not proof that the current names or object set are universally final.

Treating all four as one mutable task record creates recurrent invalid
inferences:

- an active intention appears to authorize action;
- available context appears to be complete reality;
- permission or planning appears to prove occurrence;
- occurrence appears to prove success or completion.

The candidate preserves these differences so that higher-domain Primitives can
reuse a stable action basis instead of rebuilding direction, observation, and
authority for every field.

## Generative role

This candidate does not close Primitive discovery. It creates a recursive
ladder:

```text
Fact and Episode substrate
  -> discover cross-domain action Primitives
  -> action Primitives structure richer Episodes
  -> richer Episodes expose domain boundary pressure
  -> KFD-4 through KFD-6 discover higher-domain Primitives
```

A future domain Primitive may declare its relevant Facts, Atlases, Pursuits,
Warrants, and Episode history. It need not display every role in every
interaction, but a consequential decision must not fabricate a missing role
from another one.

## Invalid compressions

The candidate rejects systems that infer:

- authority from intention, context, capability, or occurrence;
- reality completeness from available perspective;
- occurrence from a plan, permission, or expected transition;
- completion from execution or technical success;
- causal experience from before-and-after state alone;
- child authority from parent context without explicit derivation;
- durable direction from a provider session or mutable task body.

## Qualification gate

Promotion requires:

1. deletion witnesses showing that direction, perspective, authority, and
   occurrence independently change real action or audit conclusions;
2. transfer across non-isomorphic work domains;
3. comparison with task, case, workflow, session, goal, approval, capability,
   and fused alternatives;
4. counterexamples where one or more roles are legitimately absent or safely
   defaulted;
5. product evidence that the separation lowers reconstruction, authority, or
   consequence risk without imposing greater total lifecycle burden;
6. a conservative-reduction witness in which a simple task round-trips through
   the action structure and back to a session-compatible view without semantic
   loss or manual object ceremony;
7. complexity-breakpoint evidence showing that the product expands the
   relevant roles when the low-complexity assumptions fail;
8. evidence that equal state endpoints can contain materially different causal
   experience;
9. independent review of whether this is an organization-level action rule.

## Falsifiers

The candidate weakens or fails if:

- one role is consistently derivable from the others without loss;
- deleting a role does not change safe action, trust, or audit;
- valid work cannot vary the roles independently;
- another representation preserves equivalent decisions at lower total cost;
- progressive disclosure cannot prevent the model from burdening ordinary
  low-consequence work;
- a simple session cannot be projected into and out of the action structure
  while preserving goal, context, effective permissions, execution, and
  result;
- the product keeps all roles permanently explicit instead of expanding them
  only when the session compression becomes insufficient;
- the three proposed action Primitives do not transfer beyond their originating
  software-work context;
- product evidence cannot distinguish ontology value from implementation
  preference.

## Numbering boundary

The slot hint `7` records the current ordering hypothesis only. This document
is not `KFD-7`, does not reserve that number, and does not allocate the slot
hints of its elaboration candidates.

Promotion requires an explicit maintainer decision that creates
`decisions/KFD-N.md`, updates the numbered `registry.json`, and records
candidate lineage. This candidate and its elaborations may be revised,
reordered, split, merged, withdrawn, or rejected before promotion.
