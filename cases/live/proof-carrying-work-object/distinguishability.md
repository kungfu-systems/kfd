---
status: draft
period: 2026-07-17
theme: pursuit-warrant-distinguishability
doc_type: live-case-analysis
source_level: maintainer-consensus
confidence: medium
sensitivity: public
evidence_grade: C
review_state: self-reviewed
last_reviewed: 2026-07-17
---

# Conditional Distinguishability Argument

This note asks a narrower question than whether Pursuit, Atlas, Warrant, and
Episode form a universal or uniquely minimal ontology:

> Does each proposed object preserve information that can change a required
> action or audit conclusion when the other three are held fixed?

The current answer is conditionally yes. The argument separates four
information dimensions. It does not prove that every product needs four
database entities, that these names are final, or that no rival representation
can carry the same information more economically.

## Decision semantics

Let a valid work history `h` contain typed objects and relations. For each
object family `X`, let `remove_X(h)` erase objects of that family and their
incident typed relations while preserving all other observable information.

Let `D_Q(h)` be the answer required for a declared decision question `Q`.
Information carried by `X` is non-redundant for `Q` if two valid histories
exist such that:

```text
remove_X(h1) = remove_X(h2)
and
D_Q(h1) != D_Q(h2)
```

Any representation sufficient for `Q` must therefore preserve information
equivalent to the deleted distinction. It need not preserve the proposed
object name, file shape, storage boundary, or implementation.

The four current decision questions are:

| Question | Required distinction |
|---|---|
| `Q_P` continuity | Which intended reality change is being continued? |
| `Q_A` epistemic basis | Against which declared perspective and fact cut should the next judgment be made? |
| `Q_W` admissibility | Is this participant authorized to perform this bounded continuation now? |
| `Q_E` occurrence | Did the relevant action and consequence occur, and what should be retried or compensated? |

## Analytic witness pairs

These pairs are proof obligations expressed as minimal counterfactuals. They
show conditional separability if both histories are valid in the target
domain.

### Pursuit

Hold the Atlas cut fixed and assume no Warrant or Episode. In `h1`, the
continuing intended change is to repair a configuration defect. In `h2`, it is
to redesign the configuration contract. Removing Pursuit makes the histories
observationally equal, but the next plan, acceptance test, and safe scope
differ. Pursuit information is therefore non-redundant for `Q_P`.

### Atlas

Hold the Pursuit fixed and assume no Warrant or Episode. In `h1`, planning uses
a source-code perspective before a production incident. In `h2`, it uses a
user-observed cut after the incident. Removing Atlas makes the histories
observationally equal, but the justified diagnosis and next investigation
differ. Atlas information is therefore non-redundant for `Q_A`.

### Warrant

Hold Pursuit and Atlas fixed and assume no Episode. In `h1`, the participant
has a valid Warrant for the exact action. In `h2`, the Warrant is absent,
expired, or revoked. Removing Warrant makes the histories observationally
equal, but one permits execution while the other requires stopping or seeking
authority. Warrant information is therefore non-redundant for `Q_W`.

### Episode

Hold Pursuit, Atlas, and Warrant fixed. In `h1`, the authorized action occurred
and produced a recorded consequence. In `h2`, it did not occur. Removing
Episode makes the histories observationally equal, but retry, compensation,
and audit conclusions differ. Episode information is therefore non-redundant
for `Q_E`.

## What the argument establishes

If a domain admits the witness histories and requires the declared decisions,
then a system cannot safely erase the corresponding information dimension.
This rules out a fused model only when fusion makes one dimension
independently unaddressable, mutable, or unrecoverable.

It does not establish:

- that all four decision questions arise in every interaction;
- that the proposed objects are jointly sufficient for all work state;
- that four is the globally minimal number of objects;
- that a task, case, session, log, approval, capability, or other object cannot
  embed one or more equivalent dimensions;
- that analytic witnesses measure real-world burden or adoption value;
- that the candidates have passed KFD-5 qualification.

This distinction prevents circular reasoning. The test starts from externally
meaningful decisions, not from an assumption that the four names must exist.

## Conservative reduction does not erase distinction

Conditional distinguishability does not require every interaction to display
four separate objects. Several information dimensions may be coextensive in a
bounded history without becoming universally derivable from one another.

For example, a simple agent session may contain one local goal, one current
context, one stable permission grant, one execution attempt, and only an input
and result state. In that limit, a session-compatible view can project:

```text
goal              <- Pursuit
context           <- Atlas
tool permissions  <- Warrant
run or transcript <- Episode
input and result  <- Fact cuts
```

This is valid compression if the projection preserves the decisions required
for the bounded task and its assumptions remain inspectable. It is not evidence
that the dimensions are identical. The stronger hypothesis is a conservative
extension: preserve the low-cost session experience where the dimensions move
together, then expose the independent roles only when work crosses goals,
perspectives, authority states, Episodes, or material Fact branches.

This gives KFD-7 a two-sided burden. It must show both that separation changes
real decisions in complex histories and that ordinary simple work does not pay
permanent ceremony for distinctions that can be safely projected.

## Evidence ladder

| Stage | Required evidence | Current state |
|---|---|---|
| Conditional separation | Valid witness pairs and explicit decision semantics | Draft argument present |
| Conservative reduction | Simple session round-trip preserves bounded task semantics without manual object ceremony | Pending |
| Complexity breakpoint | Crossing a low-complexity assumption makes one or more independent roles necessary and visible | Pending |
| First-party reality | Preserved histories where deletion changes a real decision or audit | Pending |
| Cross-domain transfer | Non-isomorphic domains reproduce the distinction | Pending |
| Comparative value | Rival or fused models require more reconstruction, error, or authority risk | Pending |
| Minimality or universality | Alternatives fail while the same dimensions remain necessary at broad scale | Not claimed |

## Falsifiers

The four-object hypothesis weakens if:

- one dimension is always derivable from the others without loss;
- deleting a dimension never changes a safe action or audit conclusion;
- the proposed witness histories cannot coexist with the same retained state;
- a fused or rival model preserves the same decisions with less lifecycle,
  reconstruction, and governance burden;
- the proposed structure cannot recover the familiar session experience in its
  low-complexity limit;
- progressive disclosure cannot keep simple work simpler than the expanded
  complex-work representation;
- the dimensions cannot vary independently under real work;
- empirical profiles repeatedly omit a dimension without hidden replacement.

The next qualification step is therefore not another naming exercise. It is to
preserve real witness histories, apply the deletion projection, and compare
the resulting decisions and reconstruction cost.
