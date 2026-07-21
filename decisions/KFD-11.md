# KFD-11: Software work must keep Initiative and Assignment distinct

- Status: draft
- Number: 11
- Kind: principle
- Applies to: any adopting software-development Domain Profile that organizes durable human and agent work across execution, review, and continuation

## One sentence

Software work must keep Initiative, Assignment, occurrence, claim, assessment,
decision, and continuation independently inspectable.

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
Initiative
  -> Assignment
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
| Initiative | Preserves an independently addressable context for continuing coordinated work: declared intent, scope, participants, relevant Pursuits, Assignment relations, lineage, and settlement state. |
| Assignment | Preserves an independently addressable bounded responsibility proposed to, accepted by, or held by a participant: actor, objective, exact Atlas and Warrant roots, acceptance boundary, expected evidence, and parent Initiative or Assignment. |
| Episode | Preserves what actually occurred. |
| Claim | States progress, completion, artifact, or consequence without self-certifying it. |
| Assessment | Evaluates a claim for a declared purpose under KFD-2 trust semantics. |
| Decision | Accepts, rejects, requests evidence, pauses, reopens, or otherwise disposes of responsibility under a Warrant. |
| Continuation | Creates or updates the next bounded responsibility while preserving lineage. |

Occurrence does not imply a valid claim. A claim does not imply a passing
assessment. Assessment does not grant authority. A decision does not erase the
Episode or the evidence boundary on which it relied.

## Software profile vocabulary

KFD-11 names the first two software-domain roles **Initiative** and
**Assignment**:

```text
Initiative -> continuing coordinated work context
Assignment -> bounded responsibility proposed to, accepted by, or held by a participant
```

An Initiative contains declared intent but is not merely an intention. It may
reference one or more Pursuits, but it is not identical to Pursuit, a repository,
or a project. An Assignment may be proposed, accepted, refused, revised,
continued, or settled, but it is not identical to a task, Warrant, Episode, or
claim. These names are canonical within this software Domain Profile; they do
not bind other domains.

## Gate

A conforming software Domain Profile:

- declares its mapping to Fact, Episode, Atlas, Pursuit, and Warrant;
- gives every Initiative and Assignment stable identity, explicit state, and
  inspectable lineage;
- keeps Assignment acceptance distinct from proposal, authority, occurrence,
  claim, and settlement;
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
other domains to use Initiative or Assignment, prescribe Git, define one
software methodology, or claim that other domains should copy this lifecycle.
