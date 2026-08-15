---
status: draft
period: 2026-08-12--2026-08-13
theme: kfd-conceptual-compression
doc_type: explanation
source_level: public-records
confidence: high
sensitivity: public
evidence_grade: B
review_state: self-reviewed
last_reviewed: 2026-08-15
---

# KFD Conceptual Compression

Most agent systems today are described from the agent outward: what context it
sees, what task it has, what tools it may use, what it did, and what it
produced. KFD begins from a different question: **what must remain continuous
when the agent, session, repository, authority, or execution path changes—but
the work continues?**

If the agent is treated as the center of truth, difficult cases collapse into
false equivalences: a running agent appears to remain authorized; a retry
appears to be the same task again; the same output appears to be the same
result; and a successful run appears to have established accepted state. Real
systems can break every one of those equivalences.

This guide follows one delivery in which they all failed. A healthy run lost
its authority while it was still executing. A repair produced the same
reviewed tree through a history that could not be admitted. Only a new
successor, acting from current facts and authority, completed settlement.

The case reveals why KFD separates Fact, Episode, Atlas, Pursuit, and
Warrant—and why an agent is a participant in the work, not the container that
gives the work its identity, authority, history, or truth.

Here, **work** is an ordinary reader label for the continuing thing being
explained; it does not assert that Work is a qualified KFD Primitive or add it
to the `2 + 3` core. Software is the example because its evidence is unusually
inspectable; it is not the boundary of KFD. This page is a non-normative
reader's guide: the numbered texts under `decisions/` and the
[terminology contract](terminology.md) remain authoritative. KFD terms are not
one-to-one aliases for a familiar engineering stack.

## The model in one view

```text
Fact@cut0
  + Atlas       From which admitted facts and perspective is action judged?
  + Pursuit     What continuing change is being sought?
  + Warrant     What bounded transition may be performed now, by whom?
      |
      v
  bounded action encounters reality
      |
      v
  Episode       What actually happened, with which consequence and loss?
      |
      v
  Claim -> Assessment -> Decision -> Admission
      |
      v
Fact@cut1
```

The model begins with five primary names, but they are not five peers:

```text
Fact + Episode
  -> Fact-Episode Ontology

Atlas + Pursuit + Warrant
  -> Action Responsibility Geometry
```

These five explain what action is grounded in and what it produces. **Claim,
Assessment, Decision, and Admission** are four later settlement
responsibilities: they explain how an Episode may, or may not, become successor
Fact.

| Term | Independent responsibility | Reader question | Numbered authority |
| --- | --- | --- | --- |
| **Fact** | Admitted state at a declared evidence boundary | What is admitted? | [KFD-7](../decisions/KFD-7.md) |
| **Episode** | Replayable causal record between Fact cuts | What happened? | [KFD-7](../decisions/KFD-7.md) |
| **Atlas** | Declared perspective over admitted facts | From where is it judged? | [KFD-8](../decisions/KFD-8.md) draft |
| **Pursuit** | Continuing direction and progress relation | What change is sought? | [KFD-9](../decisions/KFD-9.md) draft |
| **Warrant** | Bounded authority for admissible transitions | What action is allowed? | [KFD-10](../decisions/KFD-10.md) draft |

Fact and Episode describe admitted state and realized occurrence in KFD's
contract world. Atlas, Pursuit, and Warrant constrain consequential action over
that world. None may silently manufacture another: intention does not grant
authority, available context is not complete reality, permission does not
prove occurrence, and occurrence does not prove success or admission.
Atlas is not whatever data happens to be available; it is the declared frame
from which this action is judged.

## One real software-delivery Work

### The Warrant disappeared while work was still running

This is a reconstruction of one public Kungfu delivery history from 12–13
August 2026. It begins with
[PR #3054](https://github.com/kungfu-systems/kungfu/pull/3054), passes through
the repair and replay attempts in
[PR #3055](https://github.com/kungfu-systems/kungfu/pull/3055) and
[PR #3059](https://github.com/kungfu-systems/kungfu/pull/3059), and settles with
[PR #3064](https://github.com/kungfu-systems/kungfu/pull/3064).

The pressure can be stated in one sentence:

> A healthy native run lost its Warrant while work was still running; the
> repair then reached the same reviewed tree through a history that the
> software Profile's project-level [Project Cut](../decisions/KFD-13.md) could
> not admit; only a new linear successor completed protected settlement.

This delivery is one pressure field for KFD, not the boundary of the model.
Software provides unusually inspectable evidence, but another domain may carry
the same responsibilities through different objects and records.

### The five beats

| Beat | What happened | What becomes impossible to confuse |
| --- | --- | --- |
| **1. Start** | #3054 began a bounded attempt to ship two-phase Delivery Warrant behavior. Its exact source and evidence were bound to an initial Warrant; the native run was healthy and partly complete. | A Pursuit and an executing attempt exist, but neither is admitted successor Fact. |
| **2. Authority loss** | The old patrol closed the Warrant before the run finished. Another candidate acquired the next generation, and the running attempt stopped when it detected fence loss. | Healthy execution is not current authority. A stale attempt must stop even when its code appears sound. |
| **3. Repair and rejection** | #3059 preserved the intended result and added full-lifetime heartbeat and fencing. It reached the reviewed result tree, but Project Cut rejected the non-linear history that produced it. | Same result tree does not mean same causal history, and a valid endpoint cannot erase an inadmissible path. |
| **4. Successor** | #3064 was prepared from the current protected base as one signed linear successor. It carried the reviewed #3059 tree through new source and history coordinates, then passed the native gates under a successor Warrant. | Recovery can preserve the sought consequence while replacing the perspective, responsibility boundary, and authority for the next attempt. |
| **5. Settlement** | Queue admission passed, protected merge updated the owning ref, and Buildchain closed the exact fenced attempt. | Checks support a Claim; accountable assessment, decision, and Admission are still required before successor Fact becomes current. |

The continuing **Pursuit** can be said without any issue number: *ship the
reviewed two-phase Warrant behavior safely onto the protected development
line*. The PR, Assignment, candidate, Warrant, run, and merge are bounded
objects used to pursue that direction; none is the Pursuit itself.

### Watch the coordinates move independently

```text
same continuing delivery direction
  |
  +-- PR #3054 / initial Warrant
  |     -> healthy work loses fence
  |     -> failed attempt retained
  |
  +-- PR #3059 / same reviewed result tree
  |     -> non-linear history rejected by Project Cut
  |     -> rejected attempt retained
  |
  +-- PR #3064 / linear successor / successor Warrant
        -> qualified execution
        -> protected merge
        -> exact terminal settlement
```

Read the case once across all five coordinates:

- **Fact** stays at the protected pre-admission state through both failures.
- **Pursuit** survives the PRs, candidates, and attempts.
- **Atlas** changes when #3064 binds a new protected base and linear history,
  even though the reviewed result tree stays equal.
- **Warrant** from the failed attempt cannot authorize its successor. No old generation authorizes the new attempt.
- **Episode** keeps the cancelled run, replay rejection, and successful run as
  three distinct causal records.

The first Atlas, Warrant, and Episode remain historical coordinates; they are
not edited into the successful successor.

This is the break from the agent-centered model promised at the beginning: the
run, PR, Assignment, Atlas, and Warrant changed, while the Pursuit and retained
causal history made the continuing work recognizable.

## Failure does not collapse the model

After failure, the prior Fact remains current, the Pursuit may continue, and
the original Atlas and Episode remain replayable. The expired, revoked, or
fence-lost Warrant cannot authorize recovery. A retry is therefore a new causal
attempt under current facts, perspective, direction, and authority—not “the
same task again” under ambient permission.

## Settlement returns to Fact

Execution and settlement are distinct:

```text
execution
  Pursuit + Atlas + Warrant
    -> bounded action
    -> Episode

settlement
  Claim + Assessment + authorized Decision
    -> Admission
    -> successor Fact cut only on success
```

The agent cannot make its own output Fact. It can produce an Episode and
support a Claim; the owning authorities still assess, decide, and admit the
successor.

In this history, exact checks support the **Claim**; review and queue policy
supply **Assessment**; the authorized merge disposition records the
**Decision**; and the protected-ref update records **Admission**. The exact
fenced close then settles the attempt. This is a KFD reader projection over
native records, not a claim that GitHub or Buildchain emitted same-named KFD
objects.

Buildchain does not own the protected ref, so its qualified Warrant cannot
merge a PR. Only successful Admission publishes the successor Fact cut. A
passing test can support a Claim, but cannot assess itself, grant decision
authority, or prove Admission. [KFD-11](../decisions/KFD-11.md) owns these
boundaries.

Executable expiry, fencing, recovery, and settlement probes remain in the
[Buildchain v3 evidence bundle](../profiles/warrant-evidence/fixtures/buildchain-v3-delivery-warrant.json)
and [second-wave report](../evidence/primitive-evidence/second-wave-report.md).

## Software work composes the core

KFD-12 and KFD-13 give software development a Domain Profile above the
cross-domain core:

```text
Initiative
  continuing coordinated software work
    |
    +-- Assignment
          accepted bounded responsibility
          + Pursuit
          + Atlas
          + Warrant
          + evidence and settlement obligations
          |
          +-- Episode(s)
          +-- Claim -> Assessment -> Decision -> Admission

Project Cut
  optional project-level settlement of selected authoritative roots
```

An [Initiative](../decisions/KFD-12.md) groups continuing coordinated work. An
Assignment records who proposed, accepted, or holds bounded responsibility; it
is neither the Pursuit nor the Warrant. A
[Project Cut](../decisions/KFD-13.md) publishes one verifiable project
settlement without absorbing its source authorities.

These are software-domain objects. Another domain may use different vocabulary,
lifecycle, storage, and settlement objects while preserving the Fact-Episode
Ontology and Action Responsibility Geometry through its own Domain Profile.

## Common misreadings

Once the agent is no longer the center of truth, context, task, permission,
logs, and success can no longer stand in for these independent
responsibilities:

| Familiar compression | What KFD preserves instead |
| --- | --- |
| context = everything the agent can see | Atlas declares source, Fact cut, scope, freshness, omissions, conflict, and loss. |
| task = durable intent and responsibility | Pursuit preserves direction; Assignment separately records accepted software-work responsibility. |
| permission = capability or credential | Warrant binds exact subject, purpose, holder, constraints, validity, and authority lineage. |
| logs = what happened | Episode binds a causal record to declared cuts, perspective, omissions, and loss; a log may be only one input. |
| execution success = completion | Episode supports a Claim; settlement still requires Assessment, authorized Decision, and Admission. |
| approval = admitted state | Decision requests an effect; Admission records whether the owning authority accepted it. |
| latest state validates earlier work | Earlier Atlas, Warrant, Episode, Claim, and Assessment roots remain bound to their original cuts. |
| five names require five forms or services | One simple session may project the distinctions when later inspection can recover every decision-relevant responsibility. |

The conservative session limit remains important. In one local, reversible,
single-direction interaction, a product may present goal, context, tool
permission, run, and result instead of exposing five objects. Complexity must
become explicit only when direction, perspective, authority, Episodes, Fact
branches, participants, or settlement boundaries vary independently.

## Ten-minute reading check

After this page, a reader should be able to answer:

1. Why are Fact and Episode not interchangeable?
2. Why are Atlas, Pursuit, and Warrant three coordinates rather than generic
   context plus a task?
3. Why can a Pursuit continue after its current Warrant expires, is revoked,
   or loses its fence?
4. Why does a failed Episode remain valuable after successful recovery?
5. Why can neither a passing test nor an Episode publish successor Fact?
6. Which responsibilities belong to the cross-domain core, and which belong to
   the software-development Domain Profile?
7. Which numbered decision, terminology entry, schema, or public evidence path
   should be inspected when a compact statement is not precise enough?

If those answers are not recoverable, the explanation has compressed away a
decision-relevant distinction and should fail review.

## Continue to authority and evidence

### Optional audit trail — skip on first read

The five beats are the reader model. These exact public coordinates preserve
the audit path without making identifiers part of the conceptual vocabulary.

| UTC | Retained coordinate |
| --- | --- |
| 12 Aug 18:17 | #3054 opened with Initiative, Assignment, exact source, identity, dependency, toolchain, plan, and closure roots. |
| 12 Aug 18:24 | Buildchain marked exact head `52373d46...` source-qualified. |
| 12 Aug 23:21 | Exact-source run `31626882279`, attempt 3, was executing under provisional Warrant generation `376`; one native shard was still running. |
| 12 Aug 23:31 | The old patrol closed generation `376`; a later candidate acquired `377`; the running attempt detected fence loss and cancelled. |
| 13 Aug 00:18 | #3059 combined #3054's two-phase behavior with #3055's full-lifetime heartbeat and fencing repair; the failed run remained linked as evidence. |
| 13 Aug 02:50–03:07 | #3059 reached the reviewed final tree, failed non-linear Project Cut replay, and closed in favor of a successor. |
| 13 Aug 03:06 | #3064 was prepared from the current protected base with one signed linear commit and the same candidate tree reviewed in #3059. |
| 13 Aug 04:33–05:32 | The successor passed KFD, Shifu, both native shards, and the aggregate native gate under generation `389`. |
| 13 Aug 05:33–05:39 | Queue admission passed, protected merge completed at 05:38, and exact fenced terminal close completed at 05:39. |

- Read [KFD-7](../decisions/KFD-7.md) for the active cross-domain action
  principle and conservative session limit.
- Read [KFD-8](../decisions/KFD-8.md), [KFD-9](../decisions/KFD-9.md), and
  [KFD-10](../decisions/KFD-10.md) for the separately allocated draft
  responsibilities of Atlas, Pursuit, and Warrant.
- Read [KFD-11](../decisions/KFD-11.md) for consequential settlement and
  [KFD-12](../decisions/KFD-12.md) plus [KFD-13](../decisions/KFD-13.md) for the
  software-development Domain Profile.
- Use the [terminology contract](terminology.md) before interpreting overloaded
  names, the [formal model](formal-model.md) for precise invariants, and
  [KFD Under Load](load-bearing-dogfood.md) for the bounded founding-adopter
  evidence cut.
