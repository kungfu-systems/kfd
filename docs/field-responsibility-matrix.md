# Field Responsibility Matrix

This matrix is a non-normative design aid for KFD adopters. It prevents a
cross-domain responsibility, one Domain Profile's vocabulary, storage metadata,
and participant-facing presentation from being fused into one apparently
universal object schema.

## Four field layers

Every proposed field should have exactly one primary owner:

| Layer | Owns | Must not own |
| --- | --- | --- |
| Kernel envelope | stable identity, immutable version, schema root, Fact cut, typed relations, admission and receipt coordinates | domain meaning or user copy |
| Cross-domain semantic core | the minimum information required to preserve one KFD responsibility independently | one industry's lifecycle, workflow, or presentation |
| Domain Profile | domain vocabulary, body schemas, state machines, relation types, validation, defaults, evidence policy, and settlement rules | a redefinition of Fact, Episode, Atlas, Pursuit, Warrant, or KFD-11 separation |
| Participant projection | title, summary, labels, health explanation, recommended next actions, and progressive disclosure | hidden authority, identity, or stronger proof than the underlying records |

The same product response may compose all four layers. They remain distinct in
authority even when one JSON document or screen presents them together.

## Shared envelope

First-class semantic objects normally need the following kernel-owned
coordinates, but semantic bodies should reference rather than redefine them:

```text
logical identity
immutable version or content root
body schema root
basis Fact cut
typed relation and lineage roots
declaration and admission roots
operation receipt roots
Domain Profile and mapping roots where applicable
```

Wall-clock time, filesystem path, database key, process id, chat id, UI route,
title, and display status are not semantic identity.

## Fact

**User question:** What state is admitted at this declared boundary?

**Cross-domain core:** source and authority boundary, admitted object versions,
active typed relations, declarations, admissions, Episode frontier, omissions,
conflicts, and immutable predecessor lineage.

**Domain Profile:** object body fields, observation vocabulary, validity policy,
conflict and correction policy, materiality, and presentation.

**Projection:** what changed, what is current, why it is admitted, health,
known gaps, and how to inspect the evidence.

Fact does not imply occurrence, complete reality, trust for every purpose,
authority, progress, or completion.

## Episode

**User question:** What actually happened, in which causal boundary, and with
which retained evidence?

**Cross-domain core:** Episode identity; opening and closing boundaries;
participant references; declared inputs and dependencies; ordered occurrence
records; causal edges; consequences or output references; integrity state; and
successor, compensation, or repair lineage.

**Domain Profile:** event and consequence vocabulary, evidence providers,
capture level, retention, privacy, replay capability, and lifecycle labels.

**Projection:** plain-language account, participants, duration when known,
important effects, cost, failures, retries, evidence health, and replay actions.

Timestamp adjacency is not causality. Process success is not authorization,
progress, completion, or Fact admission.

## Atlas

**User question:** From whose or which situated view, for what decision, and
from which admitted facts is action being judged?

**Cross-domain core:** perspective-holder reference; declared vantage or
decision purpose; decision scope; exact Fact cut; typed source bindings and
source authority; projection policy; freshness conditions; omissions,
conflicts, unknowns, and declared transformation loss; and perspective lineage.

**Domain Profile:** source classes, relevance and ranking policy, freshness
rules, context compilation, redaction, retrieval implementation, and lifecycle.

**Projection:** what this view is for, what it includes, what is stale or
missing, which conflicts matter, and which actions it can currently support.

An Atlas is not complete reality, a generic context payload, direction, or
authority.

## Pursuit

**User question:** What intended change or maintained condition continues, and
what consequences count as progress?

**Cross-domain core:** durable identity; direction; progress relation;
settlement semantics; typed decomposition, dependency, contribution, revision,
and successor relations; and lineage.

**Domain Profile:** success conditions, metrics, milestones, planning fields,
priority, horizon, lifecycle labels, and domain settlement policy.

**Projection:** what matters, why the current action is relevant, observed
progress, unresolved conditions, and available continuation or settlement.

Pursuit does not imply an owner, Assignment, Warrant, Atlas, occurrence, or
completion. `successConditions` should not become a universal field because
maintenance, prevention, care, and open-ended practice may have progress and
settlement without one terminal success state.

## Warrant

**User question:** Who may perform which bounded transition, against what
state, under which constraints, and who retains residual responsibility?

**Cross-domain core:** grantor and holder references; authentic grant and
derivation; permitted action; subject, resource, and consequence scope; exact
basis and target roots; validity conditions; typed limits; delegation and
attenuation policy; revocation path; and residual responsibility.

**Domain Profile:** capability vocabulary, legal or organizational authority,
time and budget limits, approval policy, authentication mechanism, consumption,
renewal, and enforcement adapter.

**Projection:** what may be done, to what, until which condition, who granted
it, why it is currently valid or invalid, and what requires renewed approval.

Authentication, technical capability, pressure, intention, and Assignment do
not imply Warrant.

## Claim

**User question:** What exact proposition is a participant asking others to
rely on?

**Cross-domain core:** claimant; exact subject and proposition; basis Fact cut;
supporting or contradicting evidence references; audit boundary; and declared
limitations.

**Domain Profile:** proposition kinds, allowed subjects, evidence expectations,
materiality, and claim lifecycle.

**Projection:** concise statement, claimant, evidence summary, known limits,
and available assessment routes.

Evidence or Episode does not state its own Claim. A Claim does not certify
itself.

## Assessment

**User question:** For what purpose and within what evidence boundary may this
Claim be trusted?

**Cross-domain core:** Claim root; assessment purpose; evidence cut; checked
evidence; trust policy; assessor; result; residual risk; gaps; and source,
verification, and decision responsibility.

**Domain Profile:** methods, thresholds, taxonomy extensions admitted by the
standard, reviewer requirements, and reassessment triggers.

**Projection:** result, purpose, checked and unchecked evidence, downgrade
reason, residual risk, and who remains responsible.

Assessment is purpose-bound, revisable, and not authority to decide.

## Decision

**User question:** Who decided what disposition, under which authority, and
with what requested effects and conditions?

**Cross-domain core:** decision-maker reference; cited Assessment roots;
Warrant root; purpose; disposition class and domain disposition; accepted Claim
scope; conditions; requested effects; reason; and residual risk.

**Domain Profile:** disposition vocabulary, quorum, policy, escalation,
approval workflow, effect types, and decision lifecycle.

**Projection:** what was accepted, rejected, deferred, or conditioned; why;
which effects were requested; and whether Admission succeeded.

A valid Decision is not occurrence or successful Admission. The same
Assessment may support different Decisions under different Warrants or policy.

## Admission

**User question:** Did the authorized requested effect actually enter the
owning state authority?

**Cross-domain core:** Decision root; admission authority; exact basis cut;
requested transition; outcome; successor cut when admitted; receipt; and
failure or denial evidence.

**Domain Profile:** transaction technology, conflict policy, retry,
compensation, durability, distributed-consensus boundary, and result taxonomy.

**Projection:** admitted or not, current successor coordinate, receipt,
failure class, retry safety, and next valid action.

Decision and Admission remain distinct. Stale, conflicted, denied, or failed
Admission does not fabricate a successor Fact.

## Initiative

Initiative is software-domain vocabulary, not a cross-domain coordinate.

**User question:** Which continuing body of coordinated software work gives
these bounded responsibilities a shared context?

**Semantic body:** coordination purpose summary; scope; Pursuit roots;
participant references; Assignment relations; settlement policy; lineage; and
Domain Profile state.

The authoritative intended-change semantics remain in Pursuit. A title,
summary, repository, owner label, milestone, or priority may be useful product
fields but must not replace Initiative identity or silently redefine Pursuit.

## Assignment

Assignment is software-domain vocabulary, not Warrant or Episode.

**User question:** Who accepted which bounded software-work responsibility,
against which perspective and authority, and what evidence will settle it?

**Semantic body:** holder reference; accepted responsibility; Initiative and
Pursuit roots; exact Atlas and Warrant roots; acceptance boundary and receipt;
evidence obligations; settlement policy; typed relations; Claim, Assessment,
Decision, Episode, and candidate-settlement references; and Domain Profile
state.

`objective` should not duplicate Pursuit direction. `successConditions` should
not redefine Pursuit settlement. Assignment owns responsibility acceptance and
its settlement conditions.

## Project Cut

Project Cut is software-project settlement vocabulary.

**User question:** What has this project officially become at this settlement
boundary?

**Semantic body:** project identity; predecessor cuts; accepted source
projection; Atlas; admitted Episode delta; accepted Assignment and Decision
bindings where applicable; interpretation policies and protocols; omissions,
conflicts, unknowns, and residual risk; deterministic root; and independently
checkable receipt.

Provider names, filesystem paths, compatibility migration fields, and a fixed
visibility enum belong to a Kungfu or source-provider Profile unless the
software-domain contract independently qualifies them. Issue references should
use typed subjects; a filesystem `path` is one possible projection.

Project Cut binds authority roots without absorbing them. It does not prove
work complete, release fit, Pursuit settlement, or universal truth.

## Field admission test

A field enters a cross-domain semantic core only when all answers are yes:

1. Does deleting it remove a decision-relevant distinction?
2. Can it vary independently while the other responsibilities remain fixed?
3. Does it retain the same meaning in at least three structurally different
   domains?
4. Is no existing KFD object already authoritative for it?
5. Can its source, version, invalidation, and loss remain inspectable?
6. Can simple work project it away without losing decision semantics?

Otherwise the field belongs to a Domain Profile or participant projection.

Useful qualification domains should not be superficial renamings. Software
development, clinical or care work, legal or regulatory work, and household or
personal work exercise materially different evidence, authority, progress,
privacy, and settlement structures.

## Machine-contract consequence

An untyped `details: object` is acceptable during exploration but is not a
final interoperable field contract. A qualified Domain Profile should bind at
least:

```text
semantic body schema root
state-machine root
relation-vocabulary root
validation and defaulting policy roots
evidence and settlement policy roots
presentation-profile root
migration policy and field-mapping roots
```

These roots make extension explicit without moving domain fields into KFD's
cross-domain core.
