# KFD-11: Consequential settlement must separate claim, assessment, decision, and admission

- Status: draft
- Number: 11
- Kind: procedure
- Applies to: any adopting product, repository, agent workflow, or participant-facing interface that changes admitted state or responsibility through a consequential settlement

## One sentence

Claims may be assessed; only authorized decisions may change admitted state or
responsibility.

## Problem

Evidence does not state its own meaning. A statement does not judge itself. A
trust assessment does not grant authority. An authorized decision does not
prove that its requested transition was admitted.

Systems that collapse these responsibilities make one of four unsafe
substitutions:

- occurrence or evidence is treated as a claim;
- a claim is treated as already assessed;
- an assessment is treated as authority to act; or
- a decision is treated as a successful state transition.

KFD-11 requires a consequential settlement to keep those boundaries
inspectable.

## Responsibilities

```text
Claim       an exact, bounded proposition made by a declared participant
Assessment  a purpose-bound trust judgment over a Claim and checked evidence
Decision    an authorized disposition of assessed claims under a Warrant
Admission   the independently recorded result of applying requested effects
```

Claim and Assessment use the generic trust model defined by KFD-2. Decision
binds that model to the bounded authority defined by KFD-10. Admission binds
the result back to the Fact-Episode Ontology without making a decision
self-executing.

The responsibilities are independently addressable. One Claim may receive
several Assessments for different purposes. One Assessment may support
different Decisions under different Warrants or policies. One Decision may be
partially admitted, rejected, become stale, or fail without rewriting its
Claim, Assessment, or authority basis.

## Procedure

```text
exact Claim declared against a Fact cut
  -> evidence checked under one stated assessment purpose and boundary
  -> residual risk and assurance responsibility exposed
  -> Decision issued under an exact Warrant and policy
  -> requested effects presented to the owning admission authority
  -> admission result and receipt recorded
  -> successor Fact cut published only when admission succeeds
```

The order is semantic, not a demand for separate screens, network calls, or
physical records. A low-consequence interface may present one compact action
when the Claim, Assessment, Decision, Warrant, and admission result remain
recoverable and independently inspectable.

## Gate

A conforming settlement:

- identifies the exact subject and proposition being claimed;
- binds the Claim and Assessment to declared Fact and evidence cuts;
- states the Assessment purpose, checked boundary, result, and residual risk;
- keeps Assessment separate from authority to decide;
- binds every consequential Decision to a valid Warrant and decision policy;
- preserves partial acceptance, conditions, refusal, deferral, and requests
  for further evidence without rewriting the original Claim;
- distinguishes a valid Decision from successful Admission;
- records stale basis, conflict, denial, or write failure without fabricating a
  successor Fact cut;
- preserves Decision, Admission, receipt, and successor lineage for review and
  retry; and
- prevents an Episode, process exit, persuasive explanation, or passing
  Assessment from silently settling responsibility.

## Foundation Revision lineage

KFD-2 already defines generic Claim and Assessment semantics. The prior
pre-stable KFD-11 software-work draft also exposed Decision and Continuation,
but placed the cross-domain trust-to-action boundary inside its first software
application. That ordering left no portable procedure between Warrant and
domain settlement.

The pre-stable Foundation Revision recorded in
[`docs/foundation-revision-2026-07-21-decision-admission.md`](../docs/foundation-revision-2026-07-21-decision-admission.md)
extracts this procedure into KFD-11, renumbers the prior software-work KFD-11
to KFD-12, and renumbers the prior Project Cut KFD-12 to KFD-13. Published
prerelease coordinates remain immutable and are mapped rather than rewritten.

## Relationship

KFD-1 protects the contracts and records used by the procedure. KFD-2 defines
fact-bound Claim and Assessment. KFD-7 separates admitted state from realized
occurrence. KFD-8 and KFD-9 supply perspective and continuing direction when
they are relevant. KFD-10 supplies bounded authority. Later Domain Profiles
may define their own claims, dispositions, admission authorities, lifecycle,
and user surfaces without collapsing these responsibilities.

KFD-12 applies this procedure to software Initiative and Assignment. KFD-13
applies it to software-project settlement through Project Cut.

The founding model was Agent-generated rather than a maintainer-supplied model
later checked by an agent. Agents first generated Claim and purpose-bound
Assessment while designing KFD-2 execution, then composed Claim, Assessment,
and Decision with Mission/Go during product implementation. Project Cut,
independent review, and recoverable Action Loop settlement later exposed the
independent state-admission boundary. When the maintainer subsequently asked
whether Claim, Assessment, and Decision should receive KFD treatment, the agent
recognized these distributed development results as one cross-domain
procedure. The maintainer then authorized the Foundation Revision. The
[live qualification case](../cases/live/decision-admission-settlement/README.md)
keeps the dated development lineage, KFD-4 recognition, KFD-5 qualification,
and evidence boundary separate.

## Status boundary

KFD-11 is a numbered draft. Its responsibility separation is explicit, but
cross-domain qualification, independent implementations, operational cost,
and activation evidence remain open.

## Non-claims

KFD-11 does not require one universal approval workflow, one verdict taxonomy,
one database transaction, one human approver, or one physical object per
responsibility. It does not make a passing Assessment true for every purpose,
make a valid Decision self-executing, or require every reversible local action
to expose the full procedure.
