# KFD Foundation Model

KFD is not a model architecture or an agent framework. It is a foundation for
systems that remain correctable by reality, including when reality challenges
the objects and primitives from which their world models are built.

This document explains the public worldview shared by the numbered KFDs. It is
not a numbered decision and does not create an additional normative rule. When
an explanation and a decision differ, the text in `decisions/KFD-N.md` remains
authoritative.

## Civilizational shift

Humans first named the world, then built machines to find better answers within
it. Stronger models improve prediction, reasoning, simulation, and action in
that already named world. Those capabilities remain necessary, but they do not
guarantee that the world was named correctly.

As agents become capable participants in reality, the next frontier is not only
to improve answers. Humans and agents can also use inspectable consequences to
discover when a question, object boundary, evidence cut, or load-bearing
primitive is wrong. A civilization that can repeat this process gains the
ability to reconstruct its ontology rather than only optimize within it.

Kungfu opens the path from agents that answer questions to a civilization that
can discover when it has named reality incorrectly.

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

## Capability and discovery

KFD does not reject stronger models. It rejects the assumption that model
improvement is sufficient for every next step.

```text
capability loop: model -> prediction -> evaluation -> stronger model

discovery loop:  reality -> facts -> model -> action -> consequence
                         -> correction or primitive reconstruction
```

The loops are complementary, not interchangeable. When persistent reality
pressure cannot be resolved inside the current model, the system must be able
to challenge its observer, evidence cut, object boundaries, and load-bearing
primitives rather than merely optimize within them.

KFD-4, KFD-5, and KFD-6 extend the foundation into this discovery path. A
perspective-bearing view declares its observer. Human-agent primitive discovery
joins grounded judgment with scalable reasoning. Autonomous discovery remains
grounded in causal experience and cannot promote its own conclusions.

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

KFDs after the foundation triad may define procedures that apply the foundation
to a specific class of real-world product behavior. They do not expand the
foundation triad; they show how it behaves when a product must make a concrete
kind of reality legible.

| Layer | Decision | Reader question | Commitment |
|---|---|---|---|
| Perspective-bearing views | KFD-4 | How should a product show time, history, replay, sync, or mixed-source work state? | Timelines must declare their observer: a useful view states who is observing, which facts were accepted, and how concurrent facts were projected. |
| Primitive discovery | KFD-5 | How can humans and agents discover a new load-bearing object from real work? | Primitive discovery must join grounded judgment with scalable reasoning: reality pressure, alternatives, falsifiers, and responsibility stay inspectable. |
| Autonomous discovery | KFD-6 | How may an agent discover primitives from accumulated experience without replacing reality with its own narrative? | Autonomous discovery must remain grounded in causal experience, preserve corpus boundaries, and never certify itself. |

KFD-4 applies KFD-1/2/3 to perspective and timeline order. KFD-5 applies the
same foundation to human-agent primitive discovery. KFD-6 is the draft next
step: an agent may eventually derive primitive candidates from a large causal
Episode corpus, but the loop must expose its observer and evidence cut, use
independent evaluation, and keep discovery separate from promotion authority.
