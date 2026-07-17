# KFD-5: Primitive discovery must separate genesis from qualification

- Status: active
- Number: 5
- Kind: procedure
- Applies to: every kungfu-systems product, repository, agent workflow, and governance surface that proposes or promotes a new load-bearing primitive

## One sentence

Primitive discovery must separate genesis from qualification.

Genesis remains perspective-declared and method-plural. Qualification uses
facts, alternatives, falsifiers, and real work to decide whether a candidate
may carry responsibility.

## Decision

Primitive discovery contains two acts:

- **Genesis** proposes an object, burden, variable, or boundary that the current
  ontology does not express.
- **Qualification** determines whether that candidate is load-bearing rather
  than intuition, local abstraction, or method artifact.

Successful qualification does not prove that the generator was uniquely
correct. Every genesis declares the perspective, ontology, evidence cut, and
method under which the candidate became meaningful. No method receives causal
priority by declaration.

## Genesis

Supported method families include:

- direct situated judgment;
- perspective transformation, perspective-preserving replay, and contrastive
  replay;
- anomaly-driven search;
- reconstruction or boundary-pressure analysis;
- causal-variable discovery;
- structural compression;
- declared hybrids and other inspectable methods.

This vocabulary is extensible, not complete. A method must preserve enough of
its procedure, model class, and evidence for independent qualification.

A candidate may precede repeated failure data. Direct situated judgment is
valid genesis when its perspective and claim boundary remain explicit; failure
accumulation is evidence, not an admission ticket.

A genesis record preserves:

- observation perspective and current ontology;
- method set, method evidence, and evidence cut;
- any transformed view, replay basis, anomaly, reconstruction burden,
  candidate variable, or compression claim;
- motivating observation and candidate object;
- the boundary between local epistemic priority and wider claims.

Humans, agents, collectives, and future participants may perform any function
when they provide the required evidence. Perspective must not be silently
synthesized for another participant, and scalable reasoning must not collapse
into an opaque answer.

Contrastive replay is useful when existing views optimize different natural
objects, but it is not the default generator for every problem. Anomaly,
reconstruction, causal, compression, and direct judgment remain first-class
methods.

## Qualification

After genesis:

1. **Bind genesis.** Record perspective, ontology, method, evidence, candidate,
   and claim boundary.
2. **Bind facts.** Record source coordinates, evidence cuts, consequences,
   gaps, and degradation.
3. **Search alternatives.** Compare prior art, narrower objects, existing
   primitives, other methods, and no action.
4. **Demand minimum closure.** State the smallest identity, boundary,
   authority, lifecycle, and operation set that makes the candidate useful.
5. **Run deletion and fuse tests.** Ask what must be repeatedly reconstructed
   without the candidate and what becomes one explainable system with it.
6. **Declare falsifiers.** Test for perspective, anomaly, model-class, causal,
   and compression artifacts.
7. **Dogfood under load.** Measure reconstruction, coordination, explanation
   cost, and hidden responsibility in real work.
8. **Record the outcome.** Accept, keep provisional, reject, subsume, or record
   `no new primitive is justified`.

The procedure is reproducible; the outcome is not deterministic.

## Optional boundary-pressure diagnostic

Boundary pressure is a strong but non-exclusive signal when a candidate
mediates contact previously handled through memory, convention, interpretation,
or implicit coordination, and a new participant, scale, frequency, authority,
heterogeneity, latency, or consequence makes that boundary load-bearing.

It may corroborate genesis or generate a candidate. It is neither necessary
nor sufficient proof.

## Gate

KFD-5 applies when a concept is proposed as a durable first-class object with
its own identity, boundary, authority, lifecycle, or operations, or when many
workflows repeatedly reconstruct the same missing object. It does not apply to
every class, field, label, helper, or local abstraction.

A candidate record includes genesis, grounding, participants, alternatives,
contract model, qualification tests, decision owner, residual risks, and
outcome. A false primitive exports complexity; a real primitive compresses it.

## Relation to KFD-1 through KFD-4

```text
declared perspective + current ontology + declared methods
  -> candidate
  -> alternatives and falsifiers
  -> fact-bound qualification
  -> provisional or load-bearing primitive
```

KFD-1 protects the record, KFD-2 bounds trust, KFD-3 protects participant
choice, and KFD-4 keeps observations perspective-declared. KFD-5 keeps
generation open while making promotion answerable to facts.

## Verification and cases

The `@kungfu-tech/kfd` package publishes the version 3 candidate-record schema
at `schemas/kfd-5/primitive-discovery.schema.json`. Validation proves record
closure, not candidate truth or method superiority. Interface details and
current product cases live in `docs/KFD-5-usage.md`; historical cases live in
`docs/primitive-discovery-cases.md`.

## Adopters

Adopters cite KFD-5 when promoting a concept into a durable primitive. They own
the genesis, evidence, qualification, and conclusion.
