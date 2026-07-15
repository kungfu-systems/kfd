# KFD-5: Primitive discovery must join grounded judgment with scalable reasoning — new load-bearing objects need reality pressure

- Status: active
- Number: 5
- Kind: procedure
- Applies to: every kungfu-systems product, repository, agent workflow, and governance surface that proposes or promotes a new load-bearing primitive

## One sentence

Primitive discovery must join grounded judgment with scalable reasoning.

A primitive is not justified because a name is elegant or a model is coherent.
It becomes a candidate only when repeated reality pressure is preserved as
facts, scalable reasoning compresses that evidence into a falsifiable object,
and grounded judgment remains responsible for what matters.

## Decision type

This KFD is a procedure derived from KFD-1/2/3. It does not add a fourth
foundation principle. It defines how humans and agents can discover a
load-bearing object without reducing either participant to a tool.

The current executable form is human-agent coupling:

- humans contribute contact with reality, value judgment, consequence, and
  the ability to notice that a recurring burden matters;
- agents contribute scalable search, comparison, reconstruction, formalization,
  counterexample generation, and verification;
- committed artifacts keep the reasoning inspectable by both.

These are functions, not permanent species boundaries. A participant may
perform either function when it can provide the required evidence.

## Gate boundary

KFD-5 applies when a change claims that a concept should become a durable,
first-class object with its own identity, boundary, authority, lifecycle, or
operations. It also applies when authority is being moved into a new object or
when many workflows repeatedly reconstruct the same missing object.

It is not required for every class, field, label, helper, or local abstraction.
Most abstractions should remain local. The gate exists because a false
primitive exports complexity, while a real primitive compresses it.

## Boundary-pressure diagnostic

A particularly strong, but non-exclusive, primitive signal appears when a
candidate sits at a contact surface that was previously handled through human
memory, convention, interpretation, or other implicit coordination, and that
surface comes under new pressure from participants, scale, frequency,
authority, heterogeneity, latency, or consequence.

The investigation should ask:

- which sides meet at the contact surface;
- how the contact was handled implicitly before the pressure changed;
- what changed and which failures now recur at the boundary;
- whether the candidate turns translation, handoff, attribution, authority, or
  responsibility into a stable and inspectable object;
- whether deleting the candidate forces participants to reconstruct the old
  implicit coordination;
- whether an internal model, policy, label, or local abstraction explains the
  evidence more narrowly.

Boundary pressure is neither necessary nor sufficient proof of a primitive.
It is a candidate-generation and falsification heuristic inside the wider
KFD-5 procedure. The gate must remain open to primitives that do not fit this
pattern and to the conclusion that boundary friction should be solved without
creating a new primitive.

## Procedure

A primitive-discovery record should preserve this chain:

1. **Ground the pressure.** Identify real work, failures, repeated decisions,
   coordination costs, or reconstruction costs that exist before the proposed
   primitive.
2. **Bind the facts.** Record source coordinates, evidence cuts, observers,
   and known gaps so the problem cannot drift into a retrospective story.
3. **Generate candidates.** Let humans and agents propose names, boundaries,
   models, and alternative explanations without treating the first coherent
   answer as authoritative. When boundary pressure is present, declare the
   contact sides, prior implicit handling, pressure change, recurring failures,
   mediation claim, and narrower internal-object alternative.
4. **Search alternatives.** Compare prior art, narrower abstractions, existing
   primitives, and the option to do nothing.
5. **Demand minimum closure.** State the smallest identity, boundary,
   authority, lifecycle, and operation set that makes the candidate useful.
6. **Run deletion and fuse tests.** Ask what work becomes repeatedly
   reconstructed if the object is removed, and whether previously separate
   mechanisms become one explainable system when it exists.
7. **Declare falsifiers.** State evidence that would reject, subsume, narrow,
   or reopen the candidate.
8. **Dogfood under load.** Use the candidate in real work and measure whether
   it reduces reconstruction, coordination, or explanation cost without hiding
   responsibility.
9. **Record the outcome.** Accept, keep provisional, reject, or subsume it.
   `No new primitive is justified` is a successful outcome.

The procedure is reproducible; the discovery outcome is not deterministic.
Two honest investigations may reach different candidates because their facts,
observers, values, or operating boundaries differ. KFD-4 requires those
perspectives to remain visible.

## Required declaration

A KFD-5 candidate should declare:

- the candidate identity and scope;
- the grounded pressure and its fact sources;
- the participants and which grounded-judgment or scalable-reasoning functions
  they performed;
- alternatives and prior art considered;
- the proposed identity, boundary, authority, lifecycle, and operations;
- minimum-closure, deletion, fuse, falsification, and dogfood results;
- the decision owner, evidence boundary, residual risks, and outcome.

Grounded judgment must not be silently synthesized by an agent and attributed
to a human. Scalable reasoning must not be reduced to an opaque answer that
other participants cannot inspect or challenge.

## Relation to KFD-1, KFD-2, KFD-3, and KFD-4

KFD-1 requires the discovery record to stand on non-drifting facts. KFD-2
requires confidence in the candidate to start from those facts and expose its
responsibility boundary. KFD-3 requires participants to cooperate through
trusted value rather than pressure. KFD-4 requires the evidence cut and the
view from which the pressure is judged to be declared.

```text
non-drifting facts
  -> inspectable trust
  -> trusted cooperation
  -> declared perspective
  -> grounded judgment + scalable reasoning
  -> primitive candidate
```

## Implementation cases

Xinfa Atlas, Kungfu Episode, and Buildchain Release Passport are current
discovery cases. They name different recurring burdens: human-agent action
guidance, agent-runtime causal closure, and release responsibility proof.
Their existence motivates and dogfoods this procedure; it does not prove that
they are historically important or that every named concept is a primitive.
That judgment remains open to reality, adoption, deletion tests, and time.

In the current KFD-5 form, Atlas is a useful shared cognitive object: it keeps
the mission, candidate, evidence, choices, falsifiers, and next actions visible
while humans and agents iterate against real work.

## Implementation case: the KFD package

The `@kungfu-tech/kfd` package publishes the KFD-5 candidate-record schema at
`schemas/kfd-5/primitive-discovery.schema.json`. The schema makes the procedure
available to humans and agents; it does not certify a candidate merely because
the record validates.

## Adopters

Adopters cite KFD-5 when promoting a concept into a durable primitive. Local
evidence and candidate records remain adopter-owned. KFD owns the procedure and
machine vocabulary, not the adopter's conclusion.
