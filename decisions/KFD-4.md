# KFD-4: Views must remain bound to declared perspectives — timelines make perspective durable and replay makes it transferable

- Status: active
- Number: 4
- Kind: principle
- Applies to: every kungfu-systems product, repository, release surface, extension surface, hosted surface, and participant-facing interface that presents a perspective-bearing view or uses one to guide action

## One sentence

Views must remain bound to declared perspectives.

There is no useful view from nowhere. A view must preserve enough of its
observer, accepted facts, position, and transformation history for another
participant to understand what it can reveal, reproduce it where possible, and
challenge what it cannot support.

## Decision type

This KFD is a principle derived from the KFD-1/2/3 foundation triad. It does not
add a fourth foundation principle. It states what must remain true whenever a
product turns facts into a view for a human, agent, runtime, organization, or
other participant.

KFD-1/2/3 make shared reality correctable through non-drifting facts,
inspectable trust, and trusted cooperation. KFD-4 adds a necessary operating
rule: every interpretation remains situated, and a participant may
intentionally change perspective rather than mistake one situated model for
final reality.

## Perspective is not error

A perspective is the position from which facts become relevant, objects become
visible, and consequences are borne. It may belong to a user, developer,
reader, agent, runtime location, product surface, organization, or other
participant.

Different perspectives may accept the same causal facts while exposing
different natural boundaries. A developer may see journals and sessions while
a user sees the bounded thing that happened. An author may see an argument as
continuous while a reader encounters a missing step. Neither difference makes
facts arbitrary. It shows that facts do not select one complete view by
themselves.

Consensus, convention, aggregate statistics, model output, and expert judgment
are also perspectives. Their scale or authority does not turn them into a view
from nowhere.

## Perspective transformation

A participant should be able to declare, compare, and intentionally transform
perspective. A transformation asks what becomes visible when the observer,
role, consequence, proximity, accepted evidence, or action boundary changes.

Useful transformations include:

- author to reader;
- implementer to user;
- operator to affected participant;
- local runtime to remote observer;
- individual to organization;
- present actor to later auditor;
- one agent or human participant to another.

The purpose is not empathy theater or arbitrary narrative. It is to expose
objects, burdens, and boundaries hidden by the current view. A primitive may
already be real as a causal or coordination burden while remaining invisible
inside the prevailing ontology.

## Engineering conditions for perspective transformation

Perspective transformation remains expensive when another participant must
repeat the original work, reconstruct missing context by hand, or depend on the
original observer's memory. High reconstruction cost is a practical barrier to
changing perspective even when participants agree that another view matters.

KFD-4 therefore identifies three connected engineering objects:

- A **perspective-bound timeline** makes one situated observation durable. It
  preserves the observer, accepted facts, natural objects, consequences,
  causal order, evidence boundary, and degraded state instead of flattening
  them into an anonymous event stream.
- A **perspective-preserving replay** makes that observation transferable. It
  lets another participant reconstruct the source view without claiming to
  become the source observer or silently replacing missing experience.
- A **contrastive replay** places two or more preserved views into one declared
  comparison context while keeping their observers and fact cuts distinct. It
  exposes where the same reality is organized through incompatible natural
  objects, burdens, authority boundaries, or action costs.

The target is low marginal transformation cost, not fictional zero cost.
Capture, storage, privacy, redaction, reconstruction, and interpretation still
consume resources. Missing context must remain visible as degradation rather
than being filled with generated certainty.

If timeline records are not perspective-bound, replay reproduces an event log
without the view that made it meaningful. If replay is unavailable, a durable
perspective remains locally trapped. If contrast erases source boundaries, the
result becomes another undeclared synthetic perspective. All three failures
block reliable perspective transformation.

## Local priority, not universal authority

A participant has special epistemic proximity to consequences it directly
bears. A statement such as "this workflow imposes a missing cognitive object
on me" is a situated observation. The report and its consequences can be
preserved as facts; their wider interpretation remains a claim. They are not
yet proof that the proposed object is universal, correctly bounded, or worthy
of promotion.

Perspective therefore grants local priority, not universal authority. Stronger
claims still require KFD-1 facts, KFD-2 trust assessment, KFD-3 cooperation, and
the KFD-5 qualification procedure.

## Gate boundary

KFD-4 applies whenever a product or decision presents a view whose observer or
position can materially change interpretation, ordering, relevance, object
boundaries, or action. The surface should declare enough perspective metadata
for the claim it makes.

The declaration may be natural language, structured metadata, or a
domain-specific machine contract. KFD-4 does not require one universal schema
for every kind of perspective. A machine gate is appropriate when a product
claims reproducible projection, transformation, or comparison.

A purely local operation that makes no perspective-bearing claim does not need
a KFD-4 gate. It remains subject to any other applicable KFD.

## What it requires

- A perspective-bearing claim identifies who or what is observing and the
  position from which the view is useful.
- Accepted facts, evidence cuts, known gaps, and degraded states remain
  inspectable.
- A claimed perspective transformation states what changed and which newly
  visible burden, boundary, or object it exposed.
- A replay claim identifies its source views, reconstruction policy, preserved
  elements, new observer, known loss, and verification state.
- A contrastive replay preserves each source perspective while declaring the
  shared comparison context and the mismatch being tested.
- Causal facts constrain every perspective; a transformation may change
  relevance or projection but must not invent evidence or invert known
  causality.
- Products do not silently promote a default, consensus, developer, or model
  perspective into final reality.
- When consequences are borne asymmetrically, the affected participant's view
  is represented rather than inferred away by a more powerful participant.

## What it does not require

- It does not say there are no facts or that all interpretations are equally
  supported.
- It does not make first-person experience infallible or universally binding.
- It does not require agreement between perspectives.
- It does not require a global observer, global clock, or universal ontology.
- It does not certify a newly visible object as a primitive. KFD-5 performs
  that qualification.
- It does not let a participant escape responsibility by calling a claim
  "only a perspective."

## Relation to KFD-1, KFD-2, and KFD-3

KFD-1 keeps the facts under a view from drifting. KFD-2 keeps trust in that
view bound to evidence and responsibility. KFD-3 lets participants expose and
compare perspectives through trusted value rather than pressure.

Each dependency carries a distinct part of perspective transformation:

- Without KFD-1, a timeline can preserve a retrospective story without
  preserving the facts that constrain it.
- Without KFD-2, replay can reconstruct a view without giving another
  participant reason to trust its fidelity, degradation, or responsibility.
- Without KFD-3, preserved views can remain privately valid but unavailable for
  voluntary comparison; contrastive replay cannot become a trusted shared act
  and risks turning into extraction, coercion, or another unilateral synthetic
  view.

KFD-4 makes the next move possible:

```text
KFD-1 makes timelines evidentiary.
KFD-2 makes replay trustworthy.
KFD-3 makes contrastive replay cooperative.
KFD-4 makes perspective transformation operational.
```

Competition or independent action may diversify perspectives. Cooperation
turns their trusted differences into shared discovery. KFD-4 is therefore the
first complete operating application of the foundation triad, not an expansion
of the foundation itself.

KFD-5 begins from that capability. It asks whether a perspective transformation
has revealed a missing load-bearing object and then subjects the candidate to
scalable qualification.

## Implementation case: observer-relative timelines

Timeline ordering is the first concrete KFD-4 profile. When facts arrive from
multiple machines, agents, processes, or sources, a visible timeline is an
observer-relative projection over accepted facts, not proof of one absolute
global clock.

Such a timeline declares the observer, accepted ranges, projection policy,
causal constraints, deterministic tie-breakers, and degraded evidence. Causal
facts dominate projection policy. Concurrent facts may be ordered by declared
policy, but known causal dependency must not be inverted.

The `@kungfu-tech/kfd` package publishes this profile at
`schemas/kfd-4/observer-perspective.schema.json`. The schema proves the
package-owned vocabulary and wiring, not the correctness of an adopter's
runtime timeline. It is one implementation of KFD-4, not the complete ontology
of perspective.

## Implementation case: Kungfu perspective infrastructure

Kungfu is an Agent Runtime at its product surface. Its deeper KFD-4
significance is the infrastructure formed by Episodes, observer-bound
timelines, replay, and contrast:

> Kungfu is an infrastructure for reality-preserving perspective
> transformation.

An Episode preserves a bounded causal experience. A timeline projects Episodes
from a declared observer. Replay reconstructs that view for another participant
with explicit loss and degradation. Contrastive replay lets multiple views of
related work be examined together without collapsing them into one absolute
history.

This does not mean Kungfu can reproduce another participant's consciousness.
`Reality-preserving` means that causal facts, observer identity, evidence cuts,
consequences, natural objects, and known gaps survive the transformation well
enough for the reconstructed view to be inspected and challenged.

The `@kungfu-tech/kfd` package publishes the replay profile at
`schemas/kfd-4/perspective-replay.schema.json`. Together with the observer
timeline profile, it makes the KFD-4 engineering claim available to both human
and agent consumers. Adopters still own evidence that a concrete capture or
replay is faithful.

## Implementation cases: Episode, Atlas, and this KFD

Kungfu Episode became visible when the view changed from runtime implementer to
the participant asking for "the thing that happened." Xinfa Atlas became
visible when the view changed from context packaging to the reader and actor
who needed a navigable semantic closure. The discontinuity between earlier
versions of KFD-4 and KFD-5 became visible when the author changed to the
reader's perspective.

These cases do not prove that perspective switching always produces a
primitive. They demonstrate the KFD-4 function: changing perspective can move
a real burden into view before the prevailing model has a name for it.

## Adopters

Adopters cite KFD-4 when a view, interpretation, ordering, or decision depends
materially on observer position. Domain-specific implementation details remain
in adopter repositories. Claims that a transformation revealed a durable
primitive continue through KFD-5 rather than treating KFD-4 as certification.
