# KFD-13: Project settlement must bind authorities without absorbing them

- Status: draft
- Number: 13
- Kind: procedure
- Applies to: any adopting software-development Domain Profile that publishes a project-level settlement or release boundary across independently authoritative systems

## One sentence

Project settlement must publish a verifiable binding without absorbing the
authorities it binds.

## Scope

KFD-13 defines a **software-project settlement application** above KFD-12. It
does not define a universal object for every domain. Other domains may publish
different macro commitments, use different authority systems, or have no
Project Cut at all. Adoption of KFD-7 through KFD-11 does not require adoption
of KFD-12 or KFD-13.

## Project Cut

A **Project Cut** states what a software project officially becomes after a
bounded set of accepted actions. It binds, without replacing:

- one or more predecessor Project Cuts;
- an accepted source projection;
- the Atlas used to interpret the project state;
- the admitted Episode increment and its declared boundary;
- policies, protocols, and qualification rules used for interpretation;
- known omissions, conflicts, unknowns, and residual risk;
- a verifiable root and a non-self-certifying receipt.

The source repository, Atlas authority, and Episode authority remain
independent. A Project Cut is not another fact engine, a large merged state
object, or proof that every Pursuit is complete.

## Procedure

```text
select declared predecessor and authority roots
  -> verify each root under its own authority
  -> declare included projections, policies, omissions, and unknowns
  -> compute a deterministic Project Cut root
  -> publish the cut at an outer project coordinate
  -> issue an independently checkable receipt
  -> permit later cuts to cite, supersede, or reject it without rewriting it
```

The binding must avoid self-reference. For example, a Project Cut intended for
publication inside a Git commit cannot require that same containing commit ID
as an input to its own root. The commit may serve as the outer publication
coordinate after the cut is computed.

## Gate

A conforming procedure:

- names every bound authority and exact root or cut;
- verifies those inputs without reinterpreting their semantics;
- preserves source, Atlas, Episode, policy, omission, and risk boundaries;
- distinguishes structural validity from work completion and release fitness;
- computes the same root for the same canonical input under the declared
  protocol;
- rejects missing, conflicting, stale, unverifiable, or circular bindings
  visibly;
- supports independent export, verification, and successor lineage;
- declares that Project Cut is software-domain vocabulary, not a mandatory
  cross-domain primitive.

## Adopter witness and activation boundary

A conforming adopter publishes a versioned witness that names and verifies
source, Atlas, Episode, policy, and protocol bindings under their own
authorities; commits omissions, conflicts, unknowns, and residual risk; and
supports deterministic export, independent verification, and successor
lineage. Every bound authority retains its own semantics and must explicitly
report that it was not absorbed by Project Cut.

The machine interface is
[`schemas/kfd-13/adopter-witness.schema.json`](../schemas/kfd-13/adopter-witness.schema.json).
Qualification and activation use the shared interfaces discovered through
[`activation-contracts.json`](../activation-contracts.json). A valid binding
does not prove work completion, release fitness, or activation.

## Founding implementation boundary

The founding Kungfu implementation binds Git source, Xinfa Atlas, and Kungfu
Episode coordinates. Those products are evidence for the procedure, not
normative dependencies. Another software Domain Profile may bind different
source, perspective, and causal-record authorities if it preserves the same
settlement responsibility.

## Relationship

KFD-11 defines Claim, Assessment, Decision, and Admission separation. KFD-12
organizes software work through Initiative, Assignment, and continuation.
KFD-13 publishes a project-level commitment after those decisions. It
preserves the Fact-Episode Ontology and the Atlas, Pursuit, and Warrant
responsibilities rather than flattening them into one state authority.

The founding discovery changed perspective again: from the coordinator who
maintains Initiative and Assignment state to the successor Agent that must
continue from one exact project boundary. From that acting view, the work
model was informative but not a single answer to what the project had
officially become. KFD-4 exposed Project Cut; KFD-5 then qualified the
settlement responsibility independently of its founding implementation. The
[live qualification case](../cases/live/software-work-perspective-settlement/README.md)
preserves both the maintainer-reported Agent-origin genesis and the separately
verifiable public implementation evidence. Project Cut is accepted at this
software-settlement layer, not as a fourth fact engine or a peer action
coordinate, and that acceptance does not activate this draft KFD.

This decision previously occupied the pre-stable KFD-12 coordinate. The
[Foundation Revision](../docs/foundation-revision-2026-07-21-decision-admission.md)
maps that immutable prerelease lineage to KFD-13.

## Non-claims

KFD-13 does not require Git, Xinfa, Kungfu, one JSON shape, one release process,
or one user interface. A valid Project Cut does not by itself prove that work
is complete, correct, safe, valuable, or ready for release.
