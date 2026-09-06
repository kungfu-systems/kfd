---
status: active
period: 2026-07-28
theme: kfd-load-bearing-dogfood
doc_type: evidence-synthesis
source_level: public-repository-evidence-and-maintainer-consensus
confidence: high
sensitivity: public
evidence_grade: B
review_state: self-reviewed
last_reviewed: 2026-07-28
---

# KFD Under Load

## A pre-release dogfood evidence baseline

KFD began with a small claim: facts must not drift, trust must start from
facts, and cooperation must start from trusted value. That claim is coherent
on paper. Coherence is necessary, but it is not enough.

A foundation becomes more credible when the same responsibilities survive
implementation, failure, handoff, product recursion, and correction without
requiring a new authority each time pressure changes. This document records
the current founding-adopter evidence for that stronger question:

> What is the KFD primitive system already carrying inside Kungfu before a
> stable public product release, and what confidence may responsibly be
> updated from that load?

This is a dated, non-normative evidence synthesis. It does not change any
numbered KFD, activate a draft decision, qualify a new Primitive, or turn one
founding implementation into universal proof. The authoritative rules remain
the texts under `decisions/`. The accepted software-domain Primitive cuts
remain the cuts in the
[Initiative, Assignment, and Project Cut live case](../cases/live/software-work-perspective-settlement/README.md).

The reasoning path is intentionally progressive:

```text
coherent principles
  -> inspectable objects
  -> a closed action and correction loop
  -> repeated load across different responsibilities
  -> recursive self-hosting
  -> pressure-produced correction
  -> bounded confidence update
  -> explicit next evidence gates
```

The conclusion appears only after that path, because a list of features cannot
by itself establish that an underlying structure is carrying them.

## 1. What load-bearing means here

Four thresholds must remain distinct:

| Threshold | Question | What it establishes |
|---|---|---|
| Conceptual coherence | Do the objects and rules fit together without contradiction? | A design worth implementing |
| Executability | Can one implementation perform the declared operations? | A functioning witness |
| Load-bearing use | Does real work continue to depend on the objects through change, failure, review, and recovery? | Evidence that the structure carries responsibility |
| General qualification | Do independent adopters and non-isomorphic domains reproduce the benefit and survive falsifiers? | Evidence beyond the founding pressure field |

Kungfu has crossed the first two thresholds on several paths and is carrying
substantial internal product and engineering load on a smaller set. It has not
crossed the fourth threshold for KFD as a whole.

"Under load" therefore does not mean internet-scale traffic, large external
adoption, or stable certification. It means that consequential internal work
would become harder to continue, review, recover, or govern if these objects
were removed. The pressure is semantic and operational before it is
population-scale: long-running work, multiple agents, source and evidence
drift, process loss, product packaging, protected delivery, and the need to
continue without private conversational state.

## 2. The foundation becomes a loop

The Foundation triad is often read as three standing principles:

```text
KFD-1: facts must not drift
KFD-2: trust must start from facts
KFD-3: cooperation must start from trusted value
```

Under work pressure, the triad becomes a loop rather than a slogan:

```text
declared Fact cut
  -> purpose-bound Claim and Assessment
  -> authorized Decision and Admission
  -> bounded Action under declared direction, perspective, and authority
  -> Episode of what occurred and what followed
  -> correction, continuation, or settlement
  -> successor Fact cut
```

The distinctions matter.

- A **Fact** is admitted state at a declared cut; it is not every event that
  crossed a process boundary.
- An **Episode** is a bounded causal record; it is not a terminal transcript
  or an automatic completion claim.
- An **Assessment** evaluates a claim for a purpose; it does not authorize the
  world to change.
- A **Decision** may authorize Admission or continuation; technical success
  does not manufacture that authority after the fact.
- A **Pursuit**, **Atlas**, and **Warrant** keep direction, perspective, and
  authority independently addressable; an action cannot safely infer one from
  another.
- An **Initiative** and **Assignment** organize continuing and bounded
  responsibility in the software-development Domain Profile.
- A **Project Cut** binds source, Atlas, Episode, policy, omission, and risk
  authorities at a settlement boundary without absorbing them into a second
  fact engine.

The first confidence gain comes from closure: the system can move from facts
to action and back to facts while preserving who claimed what, which evidence
was assessed, who was authorized to decide, what actually occurred, and what
may safely continue.

## 3. The first load layer: execution survives its surface

An agent session is the narrowest place where continuity can fail visibly.
The GUI may restart. A coordinator may restart. A process may exit. Output may
be truncated. Control may move between observers. None of those events proves
that work completed, and none should erase the identity of the work being
attempted.

Kungfu's founding implementation separates a stable Work Console, a physical
Session Attempt, a provider-neutral interaction boundary, and durable
lifecycle facts. Raw terminal transport remains bounded and privacy-sensitive;
work progress and trust remain Profile, Episode, and assessment facts. The
[native work console](https://github.com/kungfu-systems/kungfu/pull/790) and
[durable session control](https://github.com/kungfu-systems/kungfu/pull/872)
paths are public implementation witnesses for that separation.

This layer matters because it rejects an attractive compression:

```text
terminal activity = work state = completion
```

Once those three are separated, a process can be restarted without rewriting
the work, a session can be resumed without claiming operating-system
continuity, and a delivered instruction can remain distinct from a trusted
consequence.

## 4. The second load layer: work survives its executor

Long-running work creates a harder problem. A chat may end while the project
continues. The next agent needs more than a summary: it needs the exact work
definition, admitted source and context, realized Episodes, evidence roots,
known gaps, review result, and authorized next responsibility.

The software-development Profile now carries that path through Initiative,
Assignment, Completion Claim, independent Assessment, Decision, continuation,
and Project Cut. The Project Cut program published source, Xinfa Atlas,
qualified Episode history, and settlement roots through public Kungfu changes,
then exercised a three-participant handoff and a clean-clone reconstruction.
The retained KFD live case records the bounded KFD-5 outcome; the public
implementation line includes the
[native authority cutover](https://github.com/kungfu-systems/kungfu/pull/978),
[independent review and continuation](https://github.com/kungfu-systems/kungfu/pull/980),
and the later
[qualification closure](https://github.com/kungfu-systems/kungfu/pull/1002).

The load-bearing test is not that three agents appeared in one transcript. It
is that a successor could continue from retained public and portable roots
without the originating runtime, cache, or private chat acting as hidden
authority. Missing, stale, forged, mismatched, and post-claim-drifted evidence
had to fail visibly rather than degrade into a plausible summary.

This changes the unit of continuity:

```text
before: preserve the conversation
after:  preserve the work, its causal history, its settlement, and its next responsibility
```

## 5. The third load layer: the product uses the same public path

A system can appear general while its own privileged features bypass the
contracts it exposes to others. Recursive dogfood is stronger when the product
cannot exempt itself.

Kungfu's Profile Suite made domain semantics an installed, content-addressed
extension of a domain-neutral Core. Mission Control moved onto that public
Profile path. An independently authored Week/Day/Action Profile was created
outside the Kungfu source tree, qualified through installed interfaces, and
used alongside Mission Control. The GUI Profile Manager consumes the same
lifecycle, plan, decision, receipt, query, and assessment identities as CLI
and Agent surfaces; it is itself delivered as a System KFX rather than as a
second lifecycle authority. The public implementation sequence is retained in
[Profile Suite contract](https://github.com/kungfu-systems/kungfu/pull/709),
[generic composition manager](https://github.com/kungfu-systems/kungfu/pull/713),
[Mission Control migration](https://github.com/kungfu-systems/kungfu/pull/714),
and [independent Profile qualification](https://github.com/kungfu-systems/kungfu/pull/715).

The same recursion now reaches quality feedback. Dogfood friction is captured
as an immutable Finding; a separately owned Issue is admitted only when
responsibility is known. Relevance, transition, starvation, and migration are
handled by the installed Dogfood Domain Profile, while the prior Atlas queue
is retained as historical projection rather than a second writer. The
[native feedback loop](https://github.com/kungfu-systems/kungfu/pull/1391)
is the public implementation witness.

This layer increases confidence in composability. The Core does not need
Mission/Go, Week/Day, Profile Manager, or Dogfood Issue vocabulary in order to
preserve their shared Fact, Episode, action, assessment, and lifecycle
responsibilities.

It does not yet prove that every extension boundary is closed. The
[Core-native KFX architecture](https://github.com/kungfu-systems/kungfu/pull/903)
is deliberately marked partial: authoritative package discovery, trust,
transactional lifecycle, activation, and multi-surface contribution still
have residual work. Recursive use is evidence for the direction, not a license
to call the remaining KFX authority migration complete.

## 6. The fourth load layer: delivery becomes part of the fact loop

Source completion is not delivery completion. Protected pull requests,
Buildchain runs, artifacts, merge queues, release passports, publication, and
clean-clone continuation create another causal chain with different owners.
GitHub executes and transports. Buildchain produces build and release
evidence. Kungfu admits Fact and Episode. Work Control decides completion.
Git publishes selected settlement artifacts. None should silently become a
second authority for another layer.

Buildchain is already a dense witness for KFD-1 through KFD-3: exact source,
dependency, toolchain, artifact, passport, and publication roots make release
claims inspectable. The current Kungfu delivery program is extending that
closure from protected delivery events back into native runtime Episodes and
portable Project Cuts.

That extension is an active pressure frontier, not a completed witness. Queue
single-flight, exact proof reuse, post-merge ingestion, protected ledger
publication, and clean-clone continuation must close before the delivery loop
can be called fully native.

Beyond it is a still more demanding horizon: use sealed historical Episodes
to improve Assignment boundaries, dependencies, budgets, delivery classes,
and acceptance design. A verified history selector and Work Design Advisor may
eventually produce reproducible advice and permit policy replay. That work is
provisional. Advice must not create work authority, and a model must not
promote its own policy from one success or its own evaluation.

The progression is therefore:

```text
record work faithfully
  -> settle and continue it portably
  -> connect delivery evidence to the same fact loop
  -> compare historical outcomes
  -> advise future work design
  -> promote policy only after replay, retained evaluation, and review
```

KFD-6 remains draft precisely because the final steps are not yet proved.

## 7. Current application map

The founding-adopter map currently identifies ten application families. These
are application families, not ten KFDs and not ten independent external
domains. Most remain inside the broad software-and-agent engineering pressure
field.

The evidence-state labels in this table are local to this snapshot:

- **qualified founding witness**: a bounded implementation and product path
  has retained qualification evidence;
- **implemented witness**: the public path exists, but the broader surrounding
  program retains open qualification or scope;
- **partial**: public architecture or slices exist while authority closure
  remains open;
- **active frontier**: current work is applying pressure, but the target loop
  is not closed;
- **provisional horizon**: a bounded design direction exists without an
  implementation claim.

| Application family | Primary responsibility | Evidence state at this cut | Representative public witness |
|---|---|---|---|
| Agent session and process continuity | Keep execution identity, control, transport, lifecycle, and work facts distinct | qualified founding witness | [Kungfu #872](https://github.com/kungfu-systems/kungfu/pull/872) |
| Native long-cycle work control | Preserve continuing direction and bounded responsibility beyond one session | qualified founding witness | [Kungfu #790](https://github.com/kungfu-systems/kungfu/pull/790), [KFD-12](../decisions/KFD-12.md) |
| Independent review, handoff, and settlement | Let a successor verify and continue exact work without private narration | qualified founding witness | [software-work live case](../cases/live/software-work-perspective-settlement/README.md), [Kungfu #1002](https://github.com/kungfu-systems/kungfu/pull/1002) |
| Build, merge, and release feedback | Bind protected delivery evidence back into runtime and portable settlement | active frontier | [Buildchain](https://buildchain.libkungfu.dev), [KFD product proof path](repository-guide.md#product-proof-path) |
| Evidence-informed work design | Select comparable history and advise bounded future decomposition | provisional horizon | [KFD-6](../decisions/KFD-6.md) claim boundary |
| KFX package, trust, and lifecycle authority | Extend the product without creating per-surface trust or lifecycle writers | partial | [Kungfu #903](https://github.com/kungfu-systems/kungfu/pull/903) |
| Profile-defined domains and recursive management | Let new domain semantics reuse the public Fact, Action, Query, Assessment, and lifecycle path | qualified founding witness | [Kungfu #709–716](https://github.com/kungfu-systems/kungfu/pull/709) |
| Native dogfood quality governance | Turn friction into immutable observation and separately owned responsibility | implemented witness | [Kungfu #1391](https://github.com/kungfu-systems/kungfu/pull/1391) |
| Verified context and documentation control | Bind what is known, omitted, current, and safe to use to declared source and cut | implemented witness with open generalization | [Kungfu #910](https://github.com/kungfu-systems/kungfu/pull/910), [KFD-8](../decisions/KFD-8.md) |
| CLI and multi-surface capability governance | Keep Human and Agent discovery on one declared action and capability authority | partial | [Kungfu #1137](https://github.com/kungfu-systems/kungfu/pull/1137), [#1145](https://github.com/kungfu-systems/kungfu/pull/1145) |

The table is intentionally heterogeneous. It spans process supervision,
distributed work state, software delivery, extension supply chains, domain
modeling, quality operations, knowledge projection, and interface governance.
That breadth is evidence of structural portability within the founding field.
It is not proof of cross-domain universality.

## 8. Pressure has changed the structure

Repeated use is weak evidence when failure only produces local workarounds.
The stronger signal is that pressure repeatedly forced explicit responsibility
boundaries:

| Pressure | Unsafe compression | Structural response |
|---|---|---|
| A GUI, coordinator, or process can disappear | process lifetime equals work lifetime | stable Work Console, Session Attempt, lifecycle facts, and recovery receipts |
| A chat ends before the project does | conversation equals durable context | Assignment, sealed Episode, Project Cut, and successor continuation |
| An executor reports success | self-report equals trusted completion | Completion Claim, independent Assessment, authorized Decision, and Admission |
| Source or evidence changes after a claim | latest state silently validates old judgment | exact cuts, roots, freshness, mismatch rejection, and re-assessment |
| Cache or runtime state is lost | local database equals historical authority | tracked settlement, clean-clone readback, lazy local continuation, and explicit evidence contraction |
| Product semantics are hard-coded | first-party feature equals platform rule | Profile Suite, public lifecycle, and independent Week/Day qualification |
| A manager needs privileged control | UI state equals lifecycle authority | Manager as a System KFX projection over Core-owned lifecycle facts |
| Dogfood friction accumulates beside real work | side queue equals product truth | Finding, Issue, relevance, transition, starvation, and native migration |
| Human help and Agent catalogs drift | each surface owns its own command world | one capability registry with Human and Agent projections |
| Delivery reruns consume time without adding evidence | repeated execution equals stronger proof | exact proof predicates, single-flight admission, and evidence reuse gates |

The responses are not all complete, but they share a pattern: hidden coupling
becomes an explicit object, relation, cut, receipt, or authority boundary.
That is the kind of correction KFD claims a fact-bound system should make.

## 9. The bounded confidence update

At this cut, the evidence supports four stronger beliefs.

### 9.1 The primitive system is more than a coherent vocabulary

Facts, Episodes, perspective, direction, authority, assessment, decision,
responsibility, and settlement are participating in real implementation and
recovery paths. Removing their distinctions would reintroduce reconstruction
work or hidden authority on paths that are now exercised.

### 9.2 The objects compose recursively

Kungfu uses the same structures to build, extend, inspect, and correct Kungfu.
Mission Control uses the public Profile path. Profile Manager is a KFX rather
than an alternative manager authority. Dogfood findings use the installed
product path rather than a private side database. This recursion increases
confidence that the public abstractions are not merely wrappers around a
privileged implementation.

### 9.3 The structure transfers across substantially different engineering responsibilities

Process control, multi-agent handoff, package lifecycle, release evidence,
quality feedback, and documentation do not have the same local vocabulary or
failure modes. Their reuse of the same Fact-Episode, trust, action, and
settlement boundaries is meaningful evidence of portability inside the
software-and-agent domain.

### 9.4 Failure is increasingly visible and productive

The system has repeatedly converted drift, mismatch, loss, ambiguity, and
reconstruction cost into contracts, negative fixtures, receipts, review gates,
or narrower claims. This matters more than an uninterrupted success path.
Pressure is improving the model instead of being hidden behind narrative.

Together these points justify a stronger statement than "the architecture is
promising":

> Before stable product release, KFD's core primitive system is already a
> load-bearing internal substrate for consequential Kungfu engineering and
> product work.

The statement remains bounded by the founding adopter, the declared evidence
cut, and the maturity labels above.

## 10. What this baseline does not prove

This snapshot does not establish:

- independent external product adoption;
- two production organizations interoperating without shared implementation
  authority;
- cross-domain necessity outside software-and-agent engineering;
- historical novelty or universal minimality of the object set;
- adversarial security, legal sufficiency, or safety certification;
- internet-scale or long-duration operational reliability;
- complete Linux, Windows, macOS, and heterogeneous-provider qualification for
  every path;
- completion of the Core-native KFX authority migration;
- completion of the native build-and-delivery feedback loop;
- autonomous primitive discovery or KFD-6 activation;
- stable KFD status or an industry standard.

Internal recursive use can reveal deep defects, but a founding implementation
cannot be its own only qualification authority. The next confidence increase
must come from retained counterevidence, independent implementations,
non-isomorphic adopters, and failures that the current object model cannot
explain cheaply.

## 11. How future work should use this baseline

Future snapshots should not merely add successes. They should compare against
this cut and record:

1. which partial or provisional path obtained a new public witness;
2. which existing claim was narrowed, invalidated, or made stale;
3. which failure required a new boundary and which was only an implementation
   defect;
4. whether a new adopter reused the structure without importing Kungfu's
   vocabulary or hidden authority;
5. whether the cost of explicit objects stayed below the reconstruction cost
   they removed;
6. whether historical Episodes improved future work design under held-out
   comparison rather than model self-evaluation;
7. whether a `no-new-primitive` result was preserved when the existing object
   set was sufficient.

The next major evidence gates are therefore:

```text
close the native delivery evidence feedback loop
  -> qualify the remaining KFX authority migration
  -> test history selection and work-design advice without auto-promotion
  -> obtain independent adopter and interoperability evidence
  -> test transfer outside the founding software-and-agent pressure field
```

This document should become obsolete by explicit successor evidence, not by
quietly changing the meaning of this cut. Until then, it is the pre-release
baseline for understanding what KFD is already carrying, why that increases
confidence, and where confidence must still stop.
