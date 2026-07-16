# KFD-5: Primitive discovery must join perspective-grounded judgment with scalable reasoning — discovery and qualification are different acts

- Status: active
- Number: 5
- Kind: procedure
- Applies to: every kungfu-systems product, repository, agent workflow, and governance surface that proposes or promotes a new load-bearing primitive

## One sentence

Primitive discovery must join perspective-grounded judgment with scalable
reasoning.

A missing object may first become visible when a participant changes
perspective. Facts and scalable reasoning do not have to generate that moment;
they make the candidate inspectable, falsifiable, shareable, and eligible to
carry responsibility.

## Decision type

This KFD is a procedure derived from KFD-1/2/3 and enabled by KFD-4. It defines
how humans and agents may discover and qualify a load-bearing object without
reducing either participant to a tool.

The procedure separates two acts:

- **Genesis**: a situated participant changes or reconstructs perspective and
  notices a natural object, burden, or boundary that the current ontology does
  not express.
- **Qualification**: participants use scalable reasoning, facts, alternatives,
  counterexamples, tests, and real work to decide whether the candidate should
  become load-bearing.

Confusing these acts makes discovery look like induction inside an existing
ontology. Repeated analysis of database-shaped evidence naturally tends to
produce a better database. It does not guarantee that Episode, Atlas, Release
Passport, or another object outside that horizon will become visible.

## Participant functions

The current executable form is human-agent coupling:

- perspective-grounded judgment contributes situated contact with reality,
  consequence, value, and the ability to notice that the current view lacks a
  natural object;
- scalable reasoning contributes search, comparison, reconstruction,
  formalization, prior art, counterexamples, verification, and compression;
- committed artifacts keep both genesis and qualification inspectable.

These are functions, not permanent species boundaries. A human, agent,
collective, or future participant may perform either function when it can
provide the required evidence. Perspective-grounded judgment must not be silently
synthesized and attributed to another participant; scalable reasoning must not
be reduced to an opaque answer.

## Primitive genesis

Primitive genesis begins by declaring the current perspective and a participant
perspective closer to the consequences under investigation. The transformation
may be lived directly, intentionally adopted, reconstructed from causal
experience, or proposed for testing.

The discovery record should preserve:

- the origin perspective and the objects it made natural;
- the transformed perspective and who bears its consequences;
- what changed between the perspectives;
- the situated observation or unmet need that became visible;
- the candidate object that could carry that burden;
- the boundary between local epistemic priority and any wider claim.

The candidate can precede repeated failure data. A participant does not have to
first misuse a database, RAG system, journal, or session model in order to know
that those objects are not natural from the participant's view. Reality
pressure, recurrent failure, and boundary friction remain valuable signals,
but they are not the only permitted source of genesis.

## Replay and the local-optimization trap

Perspective-grounded judgment may come from direct experience. When multiple
views have already been captured, contrastive replay is the preferred
engineering path because it lowers the cost of moving between them while
preserving their differences.

Consider two timelines over the same Journal release:

- a development agent records mmap design, Journal APIs, tests, and
  qualification friction; abstraction within that view tends toward a better
  Journal API;
- a user agent records CLI mistakes, query scripts, missing action context, and
  reconstruction cost; abstraction within that view tends toward a better
  query script.

Both local conclusions may be rational and still miss the same object. When
the timelines are replayed in one declared comparison context, the mismatch
becomes visible: the developer's natural object is a storage mechanism while
the user's natural object is the bounded action that happened. That mismatch
is a primitive signal, not primitive proof.

KFD-5 uses replay to escape local optimization, then uses facts and scalable
reasoning to qualify what the contrast revealed. It does not infer that every
cross-perspective disagreement requires a new primitive.

## Qualification procedure

After genesis, a primitive-discovery record should preserve this chain:

1. **Bind the genesis.** Record whether it came from direct situated
   experience, reconstructed replay, or contrastive replay; then bind the
   origin view, transformed view, situated observation, newly visible need,
   candidate, and claim boundary.
2. **Bind the facts.** Record source coordinates, evidence cuts, observers,
   consequences, and known gaps so the candidate cannot drift into a
   retrospective story.
3. **Search alternatives.** Compare prior art, narrower abstractions, existing
   primitives, different perspective explanations, and the option to do
   nothing.
4. **Demand minimum closure.** State the smallest identity, boundary,
   authority, lifecycle, and operation set that makes the candidate useful.
5. **Run deletion and fuse tests.** Ask what work becomes repeatedly
   reconstructed if the object is removed, and whether previously separate
   mechanisms become one explainable system when it exists.
6. **Declare falsifiers.** State evidence that would reject, subsume, narrow,
   or reopen the candidate, including evidence that the apparent object was
   only an artifact of the transformed view.
7. **Dogfood under load.** Use the candidate in real work and measure whether
   it reduces reconstruction, coordination, or explanation cost without hiding
   responsibility.
8. **Record the outcome.** Accept, keep provisional, reject, subsume, or record
   `no new primitive is justified`.

The procedure is reproducible; the discovery outcome is not deterministic.
Two honest investigations may reach different candidates because their facts,
perspectives, values, or operating boundaries differ.

## Boundary-pressure diagnostic

A strong but non-exclusive signal appears when a candidate mediates a contact
surface previously handled through memory, convention, interpretation, or
implicit coordination, and a new participant, scale, frequency, authority,
heterogeneity, latency, or consequence makes that boundary load-bearing.

When present, the investigation should ask which sides meet, how contact was
handled implicitly, what pressure changed, which failures recur, how the
candidate mediates the contact, and whether a narrower internal object explains
the evidence.

Boundary pressure can corroborate genesis or generate a candidate of its own.
It is neither necessary nor sufficient proof. A real primitive may first
become visible through perspective transformation before repeated boundary
failures accumulate.

## Required declaration

A KFD-5 candidate should declare:

- candidate identity and scope;
- origin and transformed perspectives, the transformation, situated
  observation, newly visible need, and claim boundary;
- the genesis method and, when replay was used, its KFD-4 replay record,
  preserved source views, shared context, and degraded state;
- grounded pressure, fact sources, evidence boundary, and known gaps;
- participants and the functions they performed;
- alternatives and prior art;
- proposed identity, boundary, authority, lifecycle, and operations;
- minimum-closure, deletion, fuse, falsifier, and dogfood results;
- decision owner, residual risks, and outcome.

## Gate boundary

KFD-5 applies when a change claims that a concept should become a durable,
first-class object with its own identity, boundary, authority, lifecycle, or
operations. It also applies when authority is moved into a new object or many
workflows repeatedly reconstruct the same missing object.

It is not required for every class, field, label, helper, or local abstraction.
Most abstractions should remain local. A false primitive exports complexity; a
real primitive compresses it.

## Relation to KFD-1 through KFD-4

KFD-1 keeps genesis and qualification facts from drifting. KFD-2 keeps
confidence bound to those facts and exposes residual risk. KFD-3 lets
participants contribute value without coercion. KFD-4 makes perspectives
declarable and transformable.

```text
declared perspective
  -> perspective transformation
  -> a missing object becomes visible
  -> primitive candidate
  -> fact-bound scalable qualification
  -> provisional or load-bearing primitive
```

KFD-4 explains how the horizon can move. KFD-5 explains how an object revealed
outside the old horizon becomes testable and shareable.

## Implementation cases

Kungfu Episode, Xinfa Atlas, and Buildchain Release Passport are current cases.
Episode was not inferred only after journal or session machinery failed; it
became natural from the view of a participant reasoning about the bounded thing
that happened. Atlas became natural from the view of a reader and actor who
needed a navigable semantic closure rather than another context container.
Release Passport made release responsibility inspectable at the boundary
between code and delivered product.

Their existence motivates and dogfoods this procedure. It does not prove that
they are historically important or universally applicable. That judgment
remains open to facts, alternatives, deletion tests, adoption, and time.

## Implementation case: the KFD package

The `@kungfu-tech/kfd` package publishes the KFD-5 version 2 candidate-record
schema at `schemas/kfd-5/primitive-discovery.schema.json`. Version 2 makes
perspective genesis a required input distinct from qualification evidence.
Schema validity proves record closure, not that a candidate is a real
primitive.

## Adopters

Adopters cite KFD-5 when promoting a concept into a durable primitive. Local
genesis, evidence, and candidate records remain adopter-owned. KFD owns the
procedure and machine vocabulary, not the adopter's conclusion.
