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

## Procedure

An autonomous primitive-discovery loop should:

1. detect recurrent causal structures, repeated reconstruction, persistent
   failure modes, or coordination costs across experience;
2. propose a candidate identity, boundary, authority, lifecycle, and operation
   set, including the no-new-primitive alternative;
3. separate discovery evidence from held-out evaluation evidence;
4. replay historical cases and test whether the candidate compresses them
   without deleting responsibility or contradictory facts;
5. construct counterfactuals and search for disconfirming episodes;
6. run a shadow evaluation before the candidate can influence real work;
7. perform bounded interventions only within declared authority and safety
   limits;
8. collect new causal experience and measure compression, prediction,
   intervention, transfer, and falsifiability;
9. reject, revise, retain as provisional, or submit the candidate to a separate
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
Atlas_n -> guides action -> Episodes -> autonomous discovery -> candidate Atlas_n+1
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
