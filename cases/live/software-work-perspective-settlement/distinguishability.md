---
status: active
period: 2026-07-21
theme: software-work-primitive-distinguishability
doc_type: live-case-analysis
source_level: repository-evidence
confidence: high
sensitivity: public
evidence_grade: B
review_state: self-reviewed
last_reviewed: 2026-07-21
---

# Distinguishability and Qualification

This note asks whether Initiative, Assignment, and Project Cut preserve
information that changes a required software-work decision when lower-layer
facts are held fixed. It does not require separate physical records.

## Decision semantics

For object family `X`, let `remove_X(h)` erase that semantic distinction from a
valid history `h` while preserving every other observable fact. `X` is
non-redundant for decision `Q` when two valid histories exist such that:

```text
remove_X(h1) = remove_X(h2)
and
D_Q(h1) != D_Q(h2)
```

Any rival representation may qualify if it preserves equivalent information
with lower total burden. The names and file shapes are not assumed by the test.

## Initiative witness

Hold the same Pursuits, Atlas roots, Warrants, Episodes, and source state fixed.
In `h1`, two Pursuits belong to one continuing coordinated migration with one
participant set and one settlement horizon. In `h2`, they belong to independent
work contexts whose resources, decisions, and settlement must not be coupled.

After deleting Initiative, the retained lower objects are equal. The answers to
"which responsibilities should be coordinated, paused, superseded, or settled
together?" differ. Equivalent Initiative information is therefore necessary
for that software-work decision.

## Assignment witness

Hold objective, Pursuit, Atlas, Warrant, and possible execution capability
fixed. In `h1`, participant A accepted responsibility under the declared
boundary. In `h2`, the same work was only proposed, refused, or left unowned.

Deleting Assignment acceptance makes the histories equal, but the answer to
"who is responsible to act, report, hand off, or explicitly decline now?"
differs. Warrant states what may be done; it does not establish that a
participant accepted responsibility. Episode states what occurred; occurrence
does not retroactively assign responsibility.

## Project Cut witness

Hold the same available source projection, Atlas, Episode, policy, omission,
risk, Initiative, and Assignment records fixed. In `h1`, one exact combination
was verified and admitted as the project's successor settlement. In `h2`, it
was only a candidate combination or a different predecessor/selection was
accepted.

Deleting Project Cut makes the available components equal, but the answer to
"which exact project state may the successor verify and continue from without
re-adjudicating prior work?" differs. Equivalent settlement-selection
information is therefore necessary.

## Alternative comparison

| Alternative | Qualification result |
|---|---|
| Refine Pursuit, Atlas, and Warrant only | Retained as lower infrastructure; insufficient to express coordination grouping, accepted responsibility, or project settlement without adding equivalent relations. |
| Task, issue, workflow, or project record | May implement Initiative or Assignment semantics; does not invalidate the Primitive when equivalent identity and lifecycle are preserved. |
| Git commit or release tag | Publishes bytes or a label but does not bind causal, perspective, omission, policy, and risk authorities. |
| Latest Fact Cut or database row | States admitted state inside one authority but does not publish the cross-authority project settlement relation. |
| Context snapshot | Helps reconstruction but does not by itself establish responsibility, acceptance, or official settlement. |
| No new Primitive | Rejected within this software profile because deletion changes required coordination, responsibility, and continuation decisions. |

## Qualification evidence

Initiative and Assignment reuse the first-party Mission/Go pressure field and
public Kungfu Mission Control implementation. The evidence includes stable
identity, append-only lifecycle, fact admission, queries, assessment,
portability, GUI/CLI parity, and completion paths. It supports the bounded
software-profile responsibilities, not universal terminology.

Project Cut has stronger retained implementation evidence: canonical roots,
agent-first settlement, stage-0 recovery, Git-history bindings, clean-clone
continuation, independent review, three-agent dogfood, and concurrent
composition. The evidence supports a software-project settlement Primitive,
not a fourth fact engine or proof of completed work.

## Falsifiers

The accepted outcomes must be narrowed or reversed if:

- Initiative grouping is always derivable from Pursuit and typed relations
  without reconstruction or changed decisions;
- Assignment acceptance never varies independently from Warrant, Episode, or
  an existing task object;
- successors can identify the admitted project state from existing authorities
  with lower cost and no hidden policy;
- Project Cut becomes a second source, Atlas, Episode, or completion authority;
- progressive disclosure cannot preserve simple-session usability;
- first-party terminology fails to map to independent software workflows;
- retained implementation evidence cannot be reproduced from its exact public
  coordinates;
- the accepted objects export more coordination complexity than they compress.

## Outcome boundary

All three tracks are accepted only as software-domain Primitives. This outcome
does not activate current KFD-12 or KFD-13, freeze their pre-stable fields,
prove broad minimality, or require other domains to adopt the same objects.
Those are separate decisions with separate evidence obligations.
