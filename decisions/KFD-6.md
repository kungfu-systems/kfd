# KFD-6: Autonomous discovery must remain grounded in causal experience — discovery loops must not certify themselves

- Status: draft
- Number: 6
- Kind: procedure
- Applies to: every kungfu-systems autonomous or agent-operated system that proposes primitives, models, policies, or contracts from episode, event, trace, or experience corpora

## One sentence

Autonomous discovery must remain grounded in causal experience.

An agent may discover a candidate without a human translating every reality
pressure, but it must not replace reality with its own generated narrative or
promote a candidate using only evidence produced by the same loop.

## Decision type and status

This KFD is a proposed procedure derived from KFD-1/2/3 and extended through
KFD-4/5. Its registry status is `draft` because the autonomous loop described
here has not yet been demonstrated as a load-bearing organizational capability.
The draft defines an experiment and a gate; it does not claim that current
agents can already satisfy it.

## Reality-correction role

KFD-6 asks whether an autonomous system can revise not only a model's answers
but also the primitives from which its model world is built. The loop remains
correctable only when causal experience can contradict its narrative,
discovery evidence is separated from independent evaluation, and the system
cannot promote its own reconstruction merely because it generated it.

## Gate boundary

KFD-6 applies when an agent system mines accumulated experience to propose a
new load-bearing primitive or equivalent authority-bearing model with less
direct human interpretation than KFD-5 assumes.

It does not apply to ordinary retrieval, summarization, clustering, anomaly
detection, or candidate generation that remains explicitly advisory. It
becomes load-bearing when the system claims discovery, changes authority, or
asks others to trust and act on the candidate.

## Causal experience

Causal experience is an inspectable projection of contact with reality. It may
include observations, choices, actions, tool calls, external dependencies,
outcomes, costs, failures, retries, overrides, and receipts connected by causal
links.

An Episode is a useful carrier because it can preserve a bounded causal chain,
but an Episode corpus is not reality itself. Every autonomous loop must declare:

- the corpus and immutable evidence cut;
- the observer and capture boundary;
- accepted and excluded sources;
- missing, redacted, degraded, or unverifiable evidence;
- selection, survivorship, instrumentation, and policy bias;
- which external consequences are represented only by proxies.

## Boundary hypothesis

Repeated structure alone does not explain why a pattern should become a
primitive. Before proposing one, the loop must test whether the experience
contains recurrent pressure at a contact surface between participants,
systems, authority domains, representations, or stages of work.

The boundary hypothesis must declare:

- the sides that meet at the contact surface;
- how the contact was previously handled through implicit coordination;
- what changed, including any new participant, scale, frequency, authority,
  heterogeneity, latency, or consequence;
- which translation, handoff, attribution, authority, or responsibility
  failures recur there;
- how the candidate would mediate the contact as a stable object;
- the narrower alternative that the evidence reflects only an internal model,
  policy, label, or local abstraction.

This is a discovery heuristic, not a universal ontology. A valid experiment
may reject the boundary hypothesis and continue only if another grounded
explanation justifies the candidate. The loop must not promote a boundary
narrative merely because it is coherent.

## Procedure

An autonomous primitive-discovery loop should:

1. detect recurrent causal structures, repeated reconstruction, persistent
   failure modes, coordination costs, or cross-boundary translation and
   responsibility failures across experience;
2. construct and test a boundary hypothesis, including the no-boundary and
   narrower internal-object alternatives;
3. propose a candidate identity, boundary, authority, lifecycle, and operation
   set, including the no-new-primitive alternative;
4. separate discovery evidence from held-out evaluation evidence;
5. replay historical cases and test whether the candidate compresses them
   without deleting responsibility or contradictory facts;
6. construct counterfactuals and search for disconfirming episodes, including
   cases where the same internal pattern exists without the proposed boundary;
7. run a shadow evaluation before the candidate can influence real work;
8. perform bounded interventions only within declared authority and safety
   limits;
9. collect new causal experience and measure compression, prediction,
   intervention, transfer, and falsifiability;
10. reject, revise, retain as provisional, or submit the candidate to a separate
   promotion authority.

## No self-certification

The candidate generator must not be the sole verifier. Generated examples alone
cannot satisfy the evidence gate. Evaluation must include an independent
evidence cut, evaluator, verifier, policy, or accountable participant whose
failure is not identical to the generator's failure.

Discovery authority and promotion authority must remain separate. An agent may
discover a candidate and assemble evidence; that does not grant it authority to
change product, organizational, safety, or value boundaries. Promotion remains
explicit and proportionate to consequence.

## Human responsibility

KFD-6 does not remove humans from the wider system. Humans may still own value,
safety, legal, allocation, or irreversible promotion decisions. The narrower
claim is that sufficiently rich causal experience may let an agent perform the
primitive-discovery step without a human serving as translator for every
reality pressure.

## Relation to KFD-1 through KFD-5

KFD-1 keeps the experience cut and candidate contract from drifting. KFD-2
keeps trust bound to facts, evidence, residual risk, and responsibility. KFD-3
keeps autonomous output inside transparent value and participant choice.
KFD-4 requires the corpus observer and projection to be declared. KFD-5
provides the discovery structure that KFD-6 attempts to internalize.

The long loop is:

```text
Atlas_n
  -> guides action
  -> Episodes
  -> recurrent boundary pressure
  -> boundary hypothesis
  -> autonomous discovery
  -> candidate Atlas_n+1
```

Atlas represents a provisional semantic closure that guides action. Episodes
return causal pressure from action. KFD-6 asks whether an agent can use many
such Episodes to propose a better closure. A Buildchain Release Passport or an
equivalent proof surface may establish what was actually promoted, but it does
not decide whether the candidate is valuable.

## Falsification and activation

KFD-6 should remain draft until a real implementation demonstrates, across
held-out and newly generated experience, that it can:

- discover candidates that reduce repeated reconstruction beyond retrieval or
  summarization baselines;
- distinguish a load-bearing contact surface from an internal pattern, policy,
  label, or local abstraction using held-out and prospective evidence;
- surface disconfirming evidence and reject attractive false candidates;
- preserve observer, provenance, causal, responsibility, and degraded-state
  boundaries;
- avoid self-certification;
- transfer at least one candidate across contexts without hiding local facts;
- leave an auditable path from experience cut to candidate and promotion
  decision.

Failure to meet these conditions is evidence against activation, not a reason
to weaken the gate.

## Implementation case: the KFD package

The `@kungfu-tech/kfd` package publishes the proposed autonomous-loop schema at
`schemas/kfd-6/autonomous-discovery-loop.schema.json`. The schema lets products
record experiments consistently. Its presence is not proof that an autonomous
discovery implementation exists or conforms.

## Adopters

Experimental adopters may cite KFD-6 while keeping the claim explicitly draft.
They must own their corpus, evaluation, intervention, safety, and promotion
evidence. No adopter may claim KFD-6 conformance solely because its record
validates against the package schema.
