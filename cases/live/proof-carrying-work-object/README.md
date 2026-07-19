---
status: draft
period: 2026-07-17
theme: pursuit-warrant-live-case
doc_type: live-case
source_level: maintainer-consensus
confidence: medium
sensitivity: public
evidence_grade: C
review_state: self-reviewed
last_reviewed: 2026-07-19
---

# Pursuit and Warrant

This live case began with the fused working title `Proof-Carrying Work Object`.
The immutable genesis remains preserved under that name. A later ontology split
now tracks two provisional Primitive candidates:

- `Pursuit`: the durable identity of an intended reality change across
  revisions, actors, actions, and evidence;
- `Warrant`: a purpose-bound, fact-addressed authorization for bounded
  continuation.

Both names, contracts, and Primitive claims remain open.

## Why the case split

```text
Pursuit persists and may receive a successor intent_root.
Warrant may be issued, exercised, attenuated, revoked, expired, or superseded.
```

A Pursuit can remain active without a valid Warrant. A Warrant can expire
without deleting the Pursuit. Fusing them would let mutable work scope alter
authority or make authority lifecycle events overwrite work identity.

The split also made two adjacent independent objects explicit:

| Object | Responsibility |
|---|---|
| `Pursuit` | What intended change continues across time and execution surfaces |
| `Atlas` | What declared perspective and fact cut contextualize the work |
| `Warrant` | What bounded continuation is authorized, for whom, and why |
| `Episode` | What action and consequence actually occurred |

See [Ontology split](ontology-split.md) for definitions, typed relations,
invalid compressions, confidence boundaries, and qualification requirements.
See the
[conditional distinguishability argument](distinguishability.md) for the
current deletion proof obligations and their explicit non-claims.

## Current status

```text
case status: active
genesis: preserved as Proof-Carrying Work Object

Pursuit:
  minimum closure: inconclusive
  deletion test: conditional analytic witness; reality evidence pending
  fuse test: inconclusive
  dogfood: not run as a common contract

Warrant:
  minimum closure: inconclusive
  deletion test: conditional analytic witness; reality evidence pending
  fuse test: inconclusive
  dogfood: not run as a common contract
```

The machine registry preserves one stable discovery-case identity and exposes
separate current KFD-5 cuts for both candidate tracks. Later assessments create
new numbered cuts for the affected track; they do not rewrite the genesis or
the other candidate.

KFD-7 has separately reached active status with exact Buildchain and Kungfu
Profile evidence for action-role independence, session round-trip,
complexity-breakpoint behavior, and cross-domain transfer. That evidence
supports the active action principle but does not complete the KFD-5
qualification of Pursuit or Warrant. Their candidate-specific deletion,
minimum-closure, fuse, and comparative-value evidence remains pending.

## Why this is a reflexive KFD case

This candidate appeared while KFD was applied to its own propagation problem:

1. KFD-3 reframed propagation as earning cooperation through trusted value
   rather than persuading or pressuring participants.
2. KFD-4 changed the observer from a human organization adopting a standard to
   an agent executing and handing off work.
3. The new view exposed a propagation loop based on discoverable tools,
   verifiable outputs, downstream acceptance, and future routing.
4. KFD-5 first separated the loop from the object repeatedly bearing its
   cross-boundary burden.
5. Continued deletion and responsibility analysis then showed that the proposed
   carrier had fused intended-change continuity with continuation authority.

The revised hypothesis is that KFD may spread operationally when agents work
through stable Pursuits and fact-addressed Warrants whose value can be inspected
by downstream participants. This is a hypothesis, not self-proof.

## Claim boundary

This case does not claim:

- that either name or minimum closure is final;
- that either candidate is historically novel or universally applicable;
- that every agent interaction requires all four objects;
- that Atlas Go proves a universal Pursuit contract;
- that transient approval, capability, credential, mandate, or policy systems
  cannot already implement Warrant behavior;
- that the four-object model is a complete settlement model;
- that schema validity or KFD origin proves Primitive status;
- that agents will prefer producers of these objects;
- that operational use will necessarily reproduce KFD behavior;
- that a producer may certify its own work or transfer unlimited authority.

`Pursuit` names an intention-continuity hypothesis, not all performed work.
`Warrant` names an authorization hypothesis, not enforcement, absolute truth,
or universal local permission.

## Case surfaces

- [Genesis](genesis.md)
- [Ontology split](ontology-split.md)
- [Conditional distinguishability argument](distinguishability.md)
- [KFD method trace](kfd-method-trace.md)
- [Propagation hypothesis](propagation-hypothesis.md)
- [Genesis KFD-5 cut](cuts/0001-genesis.json)
- [Current Pursuit cut](cuts/0002-pursuit.json)
- [Current Warrant cut](cuts/0002-warrant.json)
- [Qualification reviews](reviews/README.md)
- [Live case registry](../../registry.json)

## Qualification direction

Pursuit becomes stronger only if stable identity and successor intent roots
survive non-isomorphic work profiles and reduce recovery or scope drift.
Warrant becomes stronger only if exact subject, purpose, basis, authority, and
lifecycle reduce repeated authorization reconstruction without creating
ambient authority or approval bureaucracy.

Evidence against either track remains visible and may independently result in
rename, rejection, subsumption, or `no-new-primitive`.
