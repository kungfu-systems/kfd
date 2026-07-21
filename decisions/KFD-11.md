# KFD-11: Software work must keep responsibility transitions distinct

- Status: draft
- Number: 11
- Kind: principle
- Applies to: any adopting software-development Domain Profile that organizes durable human and agent work across execution, review, and continuation

## One sentence

Software work must keep long-horizon intent, bounded delegation, occurrence,
claim, assessment, decision, and continuation independently inspectable.

## Scope

KFD-11 is the first numbered **software-development application** of the
Fact-Episode Ontology and Action Responsibility Geometry. It is not a universal
workflow for every domain. Finance, healthcare, research, household work, or
other domains may define different Domain Profiles, vocabulary, lifecycle,
evidence, and settlement rules while preserving the KFD responsibilities they
claim to adopt.

## Responsibility lifecycle

The software work model separates:

```text
long-horizon intent context
  -> bounded delegated responsibility
  -> Episode of realized work
  -> completion or progress claim
  -> purpose-bound assessment
  -> authorized decision
  -> continuation, settlement, or successor responsibility
```

These are decision roles, not a mandated count of files, records, APIs,
commands, screens, or services.

| Role | Responsibility |
| --- | --- |
| Long-horizon intent context | Preserves the continuing project direction and its relevant Pursuits. |
| Bounded delegated responsibility | Binds an actor, objective, Atlas, Warrant, acceptance boundary, and expected evidence for a bounded attempt. |
| Episode | Preserves what actually occurred. |
| Claim | States progress, completion, artifact, or consequence without self-certifying it. |
| Assessment | Evaluates a claim for a declared purpose under KFD-2 trust semantics. |
| Decision | Accepts, rejects, requests evidence, pauses, reopens, or otherwise disposes of responsibility under a Warrant. |
| Continuation | Creates or updates the next bounded responsibility while preserving lineage. |

Occurrence does not imply a valid claim. A claim does not imply a passing
assessment. Assessment does not grant authority. A decision does not erase the
Episode or the evidence boundary on which it relied.

## Founding implementation vocabulary

The founding Atlas/Kungfu implementation currently projects the first two
roles as **Mission** and **Go**:

```text
Mission  -> primarily a long-horizon Pursuit context
Go       -> a bounded delegated responsibility combining objective, actor,
            Atlas, Warrant, acceptance boundary, and evidence expectation
```

These names are provisional software-profile vocabulary, preserved to make the
originating implementation auditable. They are not canonical cross-domain KFD
terms, are not one-to-one aliases for Pursuit or Warrant, and may be renamed or
refined before KFD-11 becomes active.

## Gate

A conforming software Domain Profile:

- declares its mapping to Fact, Episode, Atlas, Pursuit, and Warrant;
- makes every accepted claim traceable to occurrence and admitted evidence;
- distinguishes assessment purpose from authorization to decide;
- preserves parent, child, dependency, revision, and continuation lineage;
- keeps denial, missing evidence, residual risk, and unresolved responsibility
  visible;
- provides a low-friction projection for simple work without fabricating or
  fusing decision roles;
- states explicitly that its workflow is domain-owned rather than universal.

## Relationship

KFD-7 defines Domain Profiles. KFD-8 through KFD-10 define the three action
coordinates used here. KFD-11 translates them into one software-development
work model; it does not modify their cross-domain semantics.

## Non-claims

KFD-11 does not require every task to expose seven user-visible objects, require
the names Mission or Go, prescribe Git, define one software methodology, or
claim that other domains should copy this lifecycle.
