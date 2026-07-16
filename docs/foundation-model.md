# KFD Foundation Model

KFD is not a model architecture or an agent framework. It is a foundation for
systems that remain correctable by reality, including when reality challenges
the objects and primitives from which their world models are built.

This document explains the public worldview shared by the numbered KFDs. It is
not a numbered decision and does not create an additional normative rule. When
an explanation and a decision differ, the text in `decisions/KFD-N.md` remains
authoritative.

## Better answers are not always enough

Most progress improves an answer inside a world we already know how to
describe. Some progress changes the objects with which the world can be
described.

A spreadsheet did not merely calculate faster. It made cells, dependencies,
and recalculation into objects a person could manipulate directly. A Git commit
did not merely store files. It made a distributed change, its parents, its
content, and its authorship into an object software could preserve, compare,
and exchange. A log did not become important because append-only records were
new. It became transformative when an internal mechanism could be treated as a
first-class record of what happened and projected into many systems.

KFD calls such a load-bearing object a **primitive**. A primitive gives a
recurring part of reality an identity, boundary, authority, lifecycle, and set
of operations. Once it exists, new questions become cheap to ask and whole
classes of reconstruction work can disappear.

```text
a fact answers inside an existing world
a primitive changes what that world contains
```

This is why primitive discovery matters to knowledge. Knowledge does not grow
only by accumulating more facts or improving predictions. It also grows when a
previously implicit object becomes explicit enough to reason about, test,
share, and build upon.

## Why primitive discovery remains rare

Missing primitives are difficult to see from inside inherited vocabulary. If a
database-shaped view is painful, local optimization usually produces a better
database. If a trace view is painful, it usually produces another query or
visualization. Both may be useful while leaving the missing object outside the
visible horizon.

Historically, a candidate often became visible only when several conditions
met in one place:

- a participant lived inside a saturated field of real consequences;
- that participant occupied a perspective that integrated pressures others
  encountered only separately;
- a forcing event made the old workaround impossible or no longer tolerable;
- the participant had enough judgment and authority to give the new object a
  durable form.

The events and artifacts could be distributed across an organization. The
integrated perspective usually was not. Discovery therefore depended on a
rare biographical convergence rather than an inspectable process.

## Git: ten days after years of pressure

The Linux kernel exchanged changes as patches and archived files from 1991 to
2002, then used BitKeeper until that relationship broke down in 2005. Linus
Torvalds later described Git as self-hosting after about one day and usable for
his first kernel commit after about ten days. He also said that the decisive
work was not the amount of code but getting the data organization right, after
years of seeing what existing systems made difficult.

The asymmetry is the point: construction took days; the pressure field and the
perspective able to compress it took years. Git was not the sudden invention of
every technical ingredient it used. It joined prior lessons, integrity needs,
distributed authority, nonlinear history, performance constraints, and a
workflow containing tens of merges a day into one load-bearing object model.

BitKeeper's withdrawal can be replayed through the KFD lens as a forcing
evidence cut: a condition that could previously be endured became a decision
that had to be made. That is a KFD interpretation of the historical record, not
terminology used by the historical actors themselves.

The [historical cases companion](primitive-discovery-cases.md) develops this
case and compares it with VisiCalc, the log as a standalone architecture
primitive, and an ordinary cross-machine trace view.

## What history does not provide

Historical creators often left code, design explanations, interviews, and
retrospective accounts. These materials can explain why a result worked. They
do not yet form a procedure that another participant can repeatedly execute to
discover the next missing primitive.

There is no generally adopted standard pipeline that preserves situated
pressure, makes perspectives replayable, compares their natural objects,
separates candidate genesis from qualification, and keeps promotion answerable
to facts and later consequences. The result survives; much of the path by which
the object became visible remains dependent on biography.

KFD addresses that missing path. It does not promise deterministic invention.
It asks whether the conditions of discovery can become durable, inspectable,
and increasingly repeatable without flattening the reality that made judgment
possible.

## Foundation model

The first three KFDs are intentionally ordered:

| Layer | Decision | Reader question | Commitment |
|---|---|---|---|
| Fact-source ontology | KFD-1 | What can count as a fact? | Facts must not drift: a load-bearing contract world comes from one declared fact source. |
| Participant-to-object trust | KFD-2 | When can a user or agent trust a claim, product, artifact, or control surface? | Trust starts from inspectable facts and responsibility state. |
| Participant-to-participant cooperation | KFD-3 | How should peer intelligent participants cooperate? | Cooperation starts from trusted value: value becomes trustable through transparent facts, stable choice, and explainable constraints. |

In short:

```text
reality pressure -> non-drifting facts -> inspectable trust
                 -> trusted value -> voluntary cooperation
```

KFD-1 makes fact sources operational: a fact-bearing contract world must be
declared, inspectable, and unable to drift invisibly. KFD-2 defines how trust
can stand on those facts. KFD-3 defines how humans and agents can cooperate
once facts, responsibility, and value are visible.

KFD-4 is the first complete operating application of that foundation:

```text
KFD-1 makes timelines evidentiary.
KFD-2 makes replay trustworthy.
KFD-3 makes contrastive replay cooperative.
KFD-4 makes perspective transformation operational.
```

A timeline without non-drifting facts can become retrospective narrative. A
replay without inspectable trust can become an unverifiable simulation. Views
without cooperation can remain isolated even when each is locally valid.
Competition or independent action may diversify perspectives; cooperation
turns their trusted differences into shared discovery. KFD-4 depends on all
three foundation principles without becoming a fourth foundation principle.

## From capability to discovery

KFD does not reject stronger models. It rejects the assumption that model
improvement is sufficient for every next step.

```text
capability loop: model -> prediction -> evaluation -> stronger model

discovery loop:  reality -> facts -> model -> action -> consequence
                         -> correction or primitive reconstruction
```

The loops are complementary, not interchangeable. Stronger models remain
necessary construction material, but capability alone does not decide whether
the current object set is adequate. Discovery does not always
begin with repeated failure inside the current model. Repeated observation
through a database-shaped ontology tends to produce a better database-shaped
answer. An object outside that horizon may first become visible only when the
participant, consequence, or action perspective changes.

KFD-4, KFD-5, and KFD-6 make that motion explicit:

```text
declare a situated perspective
  -> transform perspective
  -> a previously hidden object becomes visible
  -> qualify the candidate against facts and consequences
  -> return to reality through action
```

KFD-4 says that every view remains bound to a perspective and that perspectives
can be intentionally transformed. KFD-5 separates perspective-grounded genesis
from scalable qualification. KFD-6 asks whether an agent can eventually
internalize both functions from causal experience without replacing reality or
certifying itself.

## Engineering witnesses

Buildchain is the first dense engineering witness for the foundation triad. It
keeps release facts from drifting, binds trust to inspectable passports and
responsibility, and exposes cooperation constraints through declared
interfaces rather than hidden process.

Kungfu is the first product witness for KFD-4. Its public product category
remains Agent Runtime; its deeper role in the KFD model is expressed by this
claim:

> Kungfu is an infrastructure for reality-preserving perspective
> transformation.

Episodes preserve bounded causal experience. Observer-bound timelines make a
perspective durable. Replay makes a perspective transferable with declared
loss. Contrastive replay compares multiple views without collapsing them into
an absolute history. Together they lower the marginal cost of perspective
change while preserving facts, consequences, and degraded state.

KFD-5 and KFD-6 describe how to use that capability. KFD-5 lets humans and
agents turn cross-perspective object mismatch into a qualified Primitive
candidate. KFD-6 asks whether an agent can perform the replay, comparison,
discovery, and qualification loop autonomously across large bodies of causal
experience.

## Real-world agent work

Real-world agent work turns ordinary work into a dense system of products,
files, repositories, traces, policies, humans, and agents. Complexity cannot be
made safe by hidden state or forced compliance. It has to be compressed through
non-drifting facts, inspectable trust, voluntary cooperation, and perspectives
that expose how reality was projected.

This changes what a product interface means. Agent-facing CLI, API,
documentation, envelopes, and local fact surfaces are not secondary integration
channels after the human GUI. They are first-class interfaces for intelligent
participants. A control plane in this model is a shared work environment for
humans and agents, not only a human dashboard over agent activity.

This model used to be expensive to practice. Stable facts require engineering,
iteration, and disciplined evidence paths, so older systems often survived by
leaning on cheaper substitutes such as authority, habit, reputation, or
intuition. Agents change both sides of that equation: they make the world more
complex, and they also provide more intelligence for building fact-bearing
systems. KFD is part of that bootstrap.

## Load-bearing product witness

KFD does not ask readers to believe its worldview. No principle is load-bearing
until it is embodied in an inspectable product witness: an implementation that
humans and agents can use, audit, challenge, and compare with its claimed
consequences.

Self-evident does not mean simple or documentation-free. It means that a
product's declared value, mechanisms, constraints, and residual risks can be
traced through its public interfaces, source, build and release evidence, and
runtime facts without depending on hidden organizational context. Open source
is necessary for Kungfu's proof path, but source availability alone does not
create a witness when the product cannot be used at its declared surfaces or
its claims tested against consequences.

Kungfu products are not illustrations placed beside KFD. They are the concrete
surfaces through which KFD is made responsible to reality. Their breadth comes
from the closure required by that responsibility: facts, trust, cooperation,
perspective, action, consequence, and discovery must remain connected across
the interfaces that humans and agents actually use.

That closure requires substantial engineering, but complexity is not evidence
by itself. Complexity is justified only when it preserves a KFD invariant,
reduces friction for human or agent participants, or produces an inspectable
product witness. Complexity that cannot carry one of those responsibilities
remains debt.

## Existing capabilities and the passage

The new direction does not reject the existing technical world. Kungfu depends
on capabilities accumulated through open source, version control, programming
languages, operating systems, build systems, and high-capability agents. They
are the departure ground and construction material for the passage into a new
reality-correctable world.

The difference is the responsibility under which those capabilities are
organized: keep the shared world correctable by reality, and reconstruct its
ontology when the old map fails. Kungfu's product program is to open that path
for humans and agents. Whether the path carries weight is judged by inspectable
product consequences.

## Practice guidelines

KFDs after the foundation triad may define derived principles or procedures
that apply the foundation to real-world behavior. They do not expand the
foundation triad; they show how a fact-bound, trustable, cooperative system can
change its view, discover missing objects, and remain correctable while doing
so.

| Layer | Decision | Reader question | Commitment |
|---|---|---|---|
| Declared perspective | KFD-4 | How can a situated view become durable, transferable, and comparable without being flattened? | Views remain bound to declared perspectives. Timelines preserve perspective; replay transfers it; contrast exposes hidden object mismatch. |
| Primitive discovery | KFD-5 | How does a newly visible object become a load-bearing primitive rather than a private intuition? | Perspective-grounded judgment generates the candidate; scalable reasoning qualifies it through facts, alternatives, falsifiers, and real work. |
| Autonomous discovery | KFD-6 | Can an agent move beyond a fixed ontology without replacing reality with generated narrative? | Autonomous discovery remains grounded in causal experience, runs explicit perspective experiments, and never certifies itself. |

The continuity is generative rather than merely classificatory. KFD-4 allows the
visible horizon to move. KFD-5 turns an object revealed by that movement into a
testable shared candidate. KFD-6 attempts to autonomize the complete loop.

Observer-bound timeline and replay are the first concrete KFD-4 profiles, just
as release versioning is one concrete KFD-1 profile. Episode and Atlas are
KFD-5 cases: each became natural when the view moved from an implementation
object to the participant who had to understand and act. A future KFD-6 system
must replay and test such participant views from causal Episode experience, not
merely cluster more patterns inside the old object set.

Continue with [Primitive Discovery in History](primitive-discovery-cases.md) to
test this model against external cases. Continue with the numbered KFD texts
for the authoritative principles and procedures.
