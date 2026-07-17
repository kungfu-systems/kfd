---
status: draft
period: 2026-07-17
theme: pursuit-warrant-ontology-split
doc_type: live-case-ontology
source_level: maintainer-consensus
confidence: medium
sensitivity: public
evidence_grade: C
review_state: self-reviewed
last_reviewed: 2026-07-17
---

# Ontology Split: Pursuit and Warrant

The genesis cut named one fused candidate, `Proof-Carrying Work Object`. Further
analysis found that this boundary combined at least two independently meaningful
objects. This document records the split without rewriting that genesis:

- `Pursuit` is the durable identity of an intended reality change across
  revisions, actors, actions, and evidence.
- `Warrant` is a purpose-bound, fact-addressed authorization for bounded
  continuation.

Both names and both Primitive claims remain provisional.

## Why the fused object was unstable

The genesis candidate carried a proposed or completed work unit, facts,
evidence, responsibility, risk, and continuation conditions. That shape mixed
two lifecycles:

```text
the intended change persists and may be revised
the permission to continue may be issued, exercised, revoked, or expire
```

A Pursuit can remain active while no valid Warrant exists. A Warrant can expire
without deleting the Pursuit. Conversely, a valid Warrant does not define the
Pursuit's purpose or prove that the Pursuit is complete. Fusing these states
would make scope revision silently alter authority or make authority loss erase
the work identity.

## Four-object work state

The split exposed a wider object model:

| Object | Independent responsibility | Agent question |
|---|---|---|
| `Pursuit` | Durable intended-change identity and revision lineage | What change am I continuing to pursue? |
| `Atlas` | Perspective- and cut-bound semantic closure | On what declared view of reality am I acting? |
| `Warrant` | Purpose-bound and authority-bounded continuation | What may I do now, and under whose authority? |
| `Episode` | Preserved action, consequence, and causal experience | What actually happened? |

These objects are independent but intentionally composable. Independence means
that each keeps its own identity, contract, authority, and lifecycle. It does
not mean that useful work leaves them unrelated.

```text
AgentWorkState =
  Pursuit@intent_root
  + Atlas@atlas_root/perspective/cut
  + Warrant@holder/validity/action-boundary
  + Episode@causal-head
```

This tuple is a provisional operational model, not a claim that every agent
interaction requires all four objects.

## Pursuit boundary

A Pursuit is not the task card, chat, session, plan, execution trace, or work
result used to present it. Its proposed minimum closure is:

```text
pursuit_ref
intent_root
purpose
desired change
scope
acceptance or settlement conditions
safety boundaries
typed parent, dependency, and successor relations
```

`pursuit_ref` preserves identity. `intent_root` binds one immutable
specification cut. A material change to purpose, scope, acceptance, or safety
creates a successor intent root; it must not retroactively enlarge an old
Warrant.

The Atlas `Go` is the first observed profile motivating this candidate. A Go
Card, registry row, dashboard entry, or provider-native goal is a projection or
execution binding of that longer-lived object, not the object itself. This
observation does not prove that all domains require the name `Pursuit` or the
full Atlas Go vocabulary.

## Warrant boundary

A Warrant does not define a Pursuit, carry all work history, or certify a
result. Its proposed minimum closure is:

```text
warrant_ref
subject_ref + exact revision root
purpose
issuer and recognized authority
holder
allowed and forbidden actions
fact and evidence basis
constraints, expiry, delegation, and attenuation
residual risk
lineage and lifecycle events
```

The conservative default is one Warrant for one exact Pursuit intent root and
one bounded action set. A root Warrant may authorize derivation of narrower
Warrants. A multi-Pursuit Warrant must bind an immutable subject set or an
explicitly reviewable selector; newly created Pursuits must not silently expand
old authority.

Imported Warrants are claims about remote authority until local policy accepts
them or derives a local Warrant. A producer cannot self-certify trusted
continuation unless a recognized prior authority explicitly permits that
derivation.

## Typed relations

The model is many-to-many at the storage layer, but relation types must not be
collapsed into one generic `covers` edge:

```text
Pursuit --contextualized_by/input/result--> Atlas
Warrant --authorizes--> Pursuit@intent_root or another exact subject
Warrant --based_on--> Atlas and prior Episode/assessment/passport roots
Episode --executed_under--> Warrant
Episode --contributes_to--> one primary and zero or more related Pursuits
Episode --observed_against/produces_context_for--> Atlas cuts
```

An Atlas normally gives a Pursuit its initial and successor context, but a
candidate Pursuit may exist before an Atlas is compiled. An Episode may be
captured before it is attributed to a Pursuit. A Warrant may authorize a
release, transaction, artifact operation, or other exact subject without
requiring a Pursuit.

## Execution and settlement

The four objects clarify execution state but do not let an executing agent
self-declare completion:

```text
execution:
  Pursuit + Atlas + Warrant + Episode

settlement:
  Claim + Assessment + authorized Decision
```

Claims, assessments, decisions, passports, task charts, and project cuts may be
derived procedures, relations, or carried artifacts over the four-object
state. Their exact Primitive status is not decided here.

## Invalid compressions

The model rejects these shortcuts:

- active Pursuit means valid Warrant;
- valid Warrant means an action is wise, successful, or complete;
- sealed Episode means Pursuit acceptance is satisfied;
- fresh Atlas means the participant is authorized to act;
- mutable task text may enlarge authority without a successor intent root;
- a provider session or goal owns the durable Pursuit identity;
- one fused work object may overwrite independent intent, knowledge,
  authorization, and experience lifecycles.

## Current confidence

The strongest current claim is structural:

> Long-running real-world agent work appears to require an addressable
> continuity object even when users call it a task, case, incident, job,
> investigation, plan, or Go.

Confidence is lower that `Pursuit` is the final name, that its proposed fields
are the universal minimum closure, or that Warrant must always bind a Pursuit.
One-shot conversation, stateless tool use, ambient observation, and
open-ended processes remain required counterexamples.

## Qualification plan

The two tracks must be qualified separately and together:

1. Test Pursuit against non-isomorphic work profiles, including software work,
   incidents, exploration, personal matters, and continuing processes.
2. Test whether stable identity plus successor intent roots prevents scope and
   recovery drift across agents and providers.
3. Test Warrant against transient approval, capability, credential, mandate,
   and policy alternatives.
4. Measure whether exact subject and basis references reduce repeated approval
   reconstruction without creating authorization bureaucracy.
5. Test the four-object tuple under pause, resume, multi-agent, remote,
   revocation, stale-context, failure, and settlement conditions.
6. Preserve rejection, subsumption, rename, or `no-new-primitive` outcomes for
   either track independently.
