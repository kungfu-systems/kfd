---
status: draft
period: historical-cases
theme: primitive-discovery
doc_type: analysis
source_level: public-primary-and-authoritative-sources
confidence: medium
sensitivity: public
evidence_grade: B
review_state: unreviewed
last_reviewed: 2026-07-17
---

# Primitive Discovery in History

This document gives readers external anchors for the KFD foundation model. It
is explanatory, not normative. The numbered texts in `decisions/KFD-N.md`
remain authoritative.

Each case has two layers:

- **Historical record** states what the cited sources support.
- **KFD replay** asks what becomes visible when that record is examined through
  declared perspective, reality pressure, candidate genesis, and qualification.

The replay is an interpretation, not a claim that KFD caused the history or
that a successful product proves every KFD proposition.

## What a primitive changes

Most work improves an answer within an existing vocabulary. A primitive changes
the vocabulary itself.

| Primitive | What became directly manageable |
|---|---|
| Spreadsheet cell | A value, its dependencies, and its recalculation |
| Git commit | A distributed change with content, parents, authorship, and identity |
| Log | An ordered record of what happened that many projections can replay |

The code implementing these objects matters. The deeper change is that people
and machines can now point to the same object, assign responsibility to it,
compose it with other objects, and ask questions that were previously expensive
or unnatural.

## Case 1: Git after years of kernel pressure

### The scene

The Linux kernel project exchanged changes as patches and archived files from
1991 to 2002. It then used the proprietary distributed version-control system
BitKeeper. In 2005, the relationship with BitKeeper's developer broke down and
free use was withdrawn. The kernel community needed another system.

Torvalds later described an unusually short construction interval. Git became
self-hosting after roughly one day, and after roughly ten days he used it for
his first kernel commit. He emphasized that the hard part was not the amount of
code. It was deciding how to organize the data. He had already been thinking
about the problem, studying failures in other systems, and working inside a
kernel workflow that could require tens of merges per day.

Sources:

- [Git, *A Short History of Git*](https://git-scm.com/book/en/v2/Getting-Started-A-Short-History-of-Git)
- [Linux Foundation, *10 Years of Git: An Interview with Git Creator Linus Torvalds*](https://www.linuxfoundation.org/blog/blog/10-years-of-git-an-interview-with-git-creator-linus-torvalds)

### What changed

Git did not merely automate patch copying. Its object model made content,
history, ancestry, integrity, branching, and distributed authority composable.
Many technical ingredients and neighboring systems predated Git. The primitive
was the operational compression that made them fit the Linux workflow and then
travel beyond it.

```text
years of integrated pressure -> about ten days of construction
```

This asymmetry is consistent with a discovery bottleneck. It is not proof by
itself. Prior systems, prior art, implementation ability, and adoption all
remain part of the causal history.

### KFD replay

| KFD question | Replay of the Git case |
|---|---|
| Pressure field | Kernel-scale patch flow, merge frequency, integrity, performance, and governance |
| Integrated perspective | Torvalds occupied the position where those pressures were experienced together in daily work |
| Forcing event | Loss of usable BitKeeper access ended the option to continue tolerating the existing arrangement |
| Candidate move | Treat distributed history and change identity as a coherent object world rather than a central sequence of file revisions |
| Qualification | Immediate kernel use, public source history, later adoption, and continued performance under load |

The historical events were not literally confined to one person's nervous
system. Patches, repositories, discussions, and failures existed elsewhere.
What was scarce was the integrated observer position from which all those
pressures formed one actionable object problem.

## Case 2: VisiCalc and the object hidden inside recalculation

### The scene

In 1978, Harvard Business School student Dan Bricklin watched a professor sketch
a complex business model. Changing one parameter required the later entries to
be recalculated. Bricklin saw that a computer could carry that burden. The idea
became VisiCalc, created with Bob Frankston and released in 1979.

Source:

- [Harvard Gazette, *A vision of computing's future*](https://news.harvard.edu/gazette/story/2012/03/a-vision-of-the-computing-future/)

### What changed

The missing object was not arithmetic. Computers could already calculate. The
change was to make a model visible as a grid of addressable cells whose values
and dependencies could be edited and recalculated interactively.

The spreadsheet therefore changed the unit of knowledge work. A business model
was no longer only a static document plus a person's reconstruction procedure.
It became a manipulable dependency space.

### KFD replay

| KFD question | Replay of the VisiCalc case |
|---|---|
| Pressure field | Repeated manual propagation of changes through a model |
| Perspective | The person responsible for exploring the model, not the machine operator executing isolated calculations |
| Newly visible need | Preserve relationships so changed assumptions can propagate without rebuilding the model by hand |
| Candidate move | The cell and its dependency graph become first-class interactive objects |
| Qualification | The object proved useful in real business work and made the personal computer valuable to a new class of participant |

No dramatic forcing event is required in every case. Here, a perspective shift
made an ordinary burden suddenly legible as an object problem. That variation
matters: KFD-5 permits direct situated judgment as genesis and does not require
failure accumulation before a candidate may be proposed.

## Case 3: The log becomes architecture

### The scene

In 2013, Jay Kreps described lessons from LinkedIn's transition from one
centralized database to many specialized distributed systems. Logs were not
new. Kreps noted that they had existed almost as long as computers and appeared
at least as early as IBM System R. They were commonly hidden inside databases
for recovery and replication.

LinkedIn's data-integration pressure changed the useful boundary. Instead of
treating the log only as an internal implementation mechanism, Kreps presented
it as a standalone service: a persistent, replayable record of history that
could connect many producers, consumers, and projections. He also traced this
experience to the focus that produced Kafka.

Source:

- [Jay Kreps, *The Log: What every software engineer should know about real-time data's unifying abstraction*](https://www.linkedin.com/blog/engineering/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying)

### What changed

This is a case of promotion rather than invention from nothing. The mechanism
already existed, but its previous boundary kept it subordinate to another
object. A new pressure field made it useful to name the mechanism, expose its
authority, and organize systems around it.

```text
database implementation detail -> standalone integration primitive
```

### KFD replay

| KFD question | Replay of the log case |
|---|---|
| Pressure field | Rapid growth of specialized systems and repeated point-to-point data integration |
| Perspective | Organization-wide data flow rather than one database's internal recovery path |
| Newly visible need | One replayable history that many systems can consume at their own rate |
| Candidate move | Promote the log from internal mechanism to explicit architectural authority |
| Qualification | Kafka, integration use, replay semantics, and transfer across system categories |

The case warns against equating primitive discovery with inventing a new data
structure. Sometimes reality is asking for an old mechanism to receive a new
identity, boundary, and responsibility.

## Everyday vignette: the trace with no declared observer

A cross-machine trace screen often looks like one coherent history. The user
sees a single ordered list and naturally reads it as what happened.

But the screen may silently combine process clocks, collection delays, missing
events, retries, sampling, inferred parentage, and projection rules. It is not
necessarily false. It is a view whose observer and evidence boundary have been
hidden by presentation.

From an implementation perspective, the local answer may be a better clock
correction or query. From an operator perspective, the missing object may be a
bounded action whose consequence must be reconstructed across machines. From a
user perspective, the real question may be whether delegated work finished and
who can safely act next.

KFD-4 does not require one of these perspectives to become the universal truth.
It requires each view to remain declared and makes replay or contrast available
when another perspective is needed. KFD-5 begins when any declared genesis
method proposes a candidate object that may deserve its own durable boundary.

## What these cases cannot rank

The cases are compatible with several genesis explanations at once:

| Case | Plausible genesis mechanisms |
|---|---|
| Git | integrated perspective, anomaly in incumbent tools, repeated reconstruction, boundary pressure, structural compression |
| VisiCalc | user perspective, repeated recalculation, causal dependency discovery, structural compression |
| Log | organization-wide perspective, integration anomalies, boundary pressure, causal history, architectural compression |

A retrospective replay cannot identify which mechanism was necessary, which
was sufficient, or which would have found the candidate first under equal
evidence and resource budgets. The same success can often be narrated through
several methods after the primitive is known. KFD therefore treats these cases
as evidence that the methods are plausible, not evidence that perspective
transformation dominates anomaly, reconstruction, causality, or compression.

## The recurring structure

| Case | Existing capability | Situated pressure | Primitive move |
|---|---|---|---|
| Git | Patches, source control, distributed-system lessons | Kernel-scale merging, integrity, performance, and authority | Distributed change history becomes a content-addressed object world |
| VisiCalc | Arithmetic and programmable computers | Manual model recalculation | Cells and dependencies become an interactive model |
| Log | Write-ahead and transaction logs | Organization-wide data integration | Internal history becomes standalone replay infrastructure |

The common structure is not "a brilliant person had an idea." It is:

```text
reality pressure
  -> a declared perspective and current ontology
  -> one or more genesis methods propose a candidate
  -> qualification through use, consequences, and transfer
```

The historical participants still matter. Judgment, taste, implementation,
authority, and timing cannot be removed from the record. The KFD claim is
narrower: more of the path can be preserved and examined than biography alone
normally preserves.

## From historical accident to inspectable process

These cases do not prove that primitive discovery can be industrialized. They
show why the missing method matters.

History usually gives later readers the promoted object and fragments of its
rationale. KFD proposes a stronger path:

1. KFD-1 keeps pressure, evidence, and candidate contracts from drifting.
2. KFD-2 keeps confidence bound to those facts and exposes residual risk.
3. KFD-3 lets participants contribute trusted value without coercion.
4. KFD-4 makes observation perspectives declared and makes transformation
   durable, transferable, and comparable.
5. KFD-5 keeps genesis method-plural and separates it from fact-bound
   qualification.
6. KFD-6 asks whether causal experience can eventually sustain and compare
   that loop with less direct human translation.

This does not turn discovery into a deterministic formula. It changes the
default from an unrepeatable convergence inside one life to an inspectable
process that later participants can replay, challenge, and improve.

## Limits and falsifiers

Famous successes create survivorship bias. A pressure field can produce no new
primitive. A candidate may be only a useful local abstraction. A later system
may subsume it. Adoption can reflect distribution power rather than object
quality.

A KFD replay should therefore remain open to at least these alternatives:

- the existing object set was adequate and only implementation quality was
  missing;
- the candidate reflected one perspective artifact rather than a durable
  object;
- the candidate reflected an anomaly threshold, model class, causal confounder,
  or compression language rather than a durable object;
- a narrower abstraction explains the same compression;
- the object transferred poorly outside its original pressure field;
- historical evidence is too incomplete to support the proposed replay.

The cases are valuable when readers can test the lens against their own
experience and reject an interpretation that does not fit. They are not origin
myths and should not become one.
