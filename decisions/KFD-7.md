# KFD-7: Consequential action must keep direction, perspective, authority, and occurrence independently addressable

- Status: draft
- Number: 7
- Kind: principle
- Applies to: every kungfu-systems product or process that represents consequential human or agent action

## One sentence

Consequential action must keep direction, perspective, authority, and
occurrence independently addressable.

## Status and activation boundary

KFD-7 is a numbered draft promoted from the cross-domain action-Primitives
candidate. It allocates the decision number and publishes a reference contract;
it does not yet activate a universal product profile or prove that the current
role names are final across domains.

Activation requires retained product evidence, independent review, negative
tests, migration and deletion experiments, and a release-qualified profile.
Until that gate closes, adopters label KFD-7 support `provisional` and must not
present schema conformance as proof of product fitness.

## Reference roles

KFD-7 separates five semantic responsibilities:

```text
Fact     what is asserted to hold under a declared authority and cut
Episode  what occurred through a bounded causal encounter with reality
Pursuit  what intended change continues across actions
Atlas    from which perspective, accepted facts, cut, and loss action is judged
Warrant  which bounded transition is permitted, by whom, and under which constraints
```

Fact and Episode are the operational substrate. Pursuit, Atlas, and Warrant are
provisional cross-domain action-role names. A conforming Profile may use domain
language, but it must preserve the responsibilities and publish an explicit
mapping rather than silently fusing them.

These roles do not require five physical stores, five user forms, or five
commands. Low-consequence work may derive inspectable defaults. Progressive
disclosure may reduce ceremony; it may not erase responsibility.

## Independence rule

No role silently supplies another:

- a Pursuit does not grant authority;
- an Atlas does not claim complete reality or grant permission;
- a Warrant does not prove that an action occurred or succeeded;
- an Episode does not retroactively authorize action or prove completion;
- a Fact does not imply how it was produced, what should happen next, or who may act;
- parent direction, context, or authority does not silently become child authority;
- technical success does not settle a Pursuit without its declared consequence test;
- equal before-and-after state does not prove equal causal experience.

A system may omit a distinct physical representation only when the Profile's
required role declaration explains why the role is inapplicable or how an
inspectable default preserves the same decision boundary.

## Profile contract

A versioned KFD-7 Profile declares:

1. the product, domain, Profile version, implementation coordinate, and
   qualification status;
2. identity and source authority for each role it implements;
3. Profile-owned lifecycle vocabulary without claiming that its state names are
   universal KFD enums;
4. relations among roles and the checks that prevent invalid inheritance;
5. every supported transition's subject, preconditions, effect, receipt,
   evidence, denial reasons, and residual risk;
6. omitted physical representations, derived defaults, extension fields, and
   unsupported claims while retaining all five responsibility declarations;
7. migration, rebuild, export/import, deletion, concurrency, revocation,
   invalid-transition, and cold-start evidence where applicable;
8. the exact evidence cut and independent review behind any qualification or
   activation claim.

The Profile owns storage, API, CLI, GUI, state-machine, and adapter details.
KFD owns the responsibility separation, declaration shape, evidence categories,
failure visibility, and non-claims.

## Abstract lifecycle obligations

KFD-7 does not freeze one shared state machine. It requires every Profile to
make these lifecycle questions decidable:

- **Fact:** creation authority, cut identity, provenance, successor rules,
  conflict, supersession, degradation, and invalidation;
- **Episode:** start boundary, causal parents, admitted actions, seal, outcome,
  evidence level, replay/export capability, and reconciliation after failure;
- **Pursuit:** creation, revision, dependency, contribution, pause, settlement,
  completion, abandonment, termination, and successor continuity;
- **Atlas:** source admission, observer/perspective, cut, scope, projection,
  omission, conflict, staleness, successor, and declared loss;
- **Warrant:** issue, derivation, attenuation, scope, precondition, expiry,
  revocation, refusal, renewal, and retained responsibility.

Profile-specific transitions must fail visibly when their preconditions or
authority bindings do not hold. Unknown transitions and unknown role mappings
are not treated as compatible success.

## Evidence contract

Every transition claim binds:

```text
subject identity + prior state/cut + operation + preconditions
  -> effect + receipt + evidence + denial or residual risk
```

Qualification evidence is retained, independently inspectable, and able to
contradict the Profile. At minimum the activation review considers:

- role-deletion and role-fusion experiments;
- invalid transition and prohibited-inference fixtures;
- export/import and deterministic rebuild;
- backend or representation migration;
- concurrent action, retry, compensation, and crash recovery;
- Warrant derivation, attenuation, expiry, and revocation;
- Atlas staleness, loss, source removal, and successor cuts;
- Pursuit continuation across participants, tools, and Episodes;
- Episode replay or declared evidence-level contraction;
- cold-start continuation without oral context from the previous actor.

`not-applicable` is evidence only when the Profile gives a bounded reason.
Missing evidence is not converted to pass.

## Activation decision

The activation verdict is one of:

- `activate`: retained evidence supports the declared Profile and the stable
  KFD-7 surface;
- `revise`: the separation remains promising but the contract, role mapping, or
  evidence obligation needs a successor draft;
- `reject`: evidence shows the proposed separation or Profile is not fit;
- `pending`: qualification is incomplete.

Only `activate`, bound to an exact evidence cut and independent review, may
support a stable KFD-7 Profile claim. A product may remain provisional after the
decision itself becomes active.

## Relation to KFD-1 through KFD-6

KFD-1 keeps role identities and Profile contracts from drifting. KFD-2 binds
trust to retained facts, evidence, risk, and responsibility. KFD-3 prevents
authority from being synthesized through pressure or hidden capture. KFD-4
binds Atlas views to declared perspectives. KFD-5 qualifies whether the
proposed roles are load-bearing rather than method artifacts. KFD-6 may later
discover or revise such roles from causal experience without self-certifying.

## Verification

The `@kungfu-tech/kfd` package publishes
`schemas/kfd-7/action-contract.schema.json`. The independent verifier can check
closed record structure and reject unknown or incomplete declarations. Passing
that check proves only conformance to the declared record shape; it does not
prove that an action occurred, was authorized, completed a Pursuit, or qualifies
the Profile for activation.

## Non-claims

KFD-7 does not require Kungfu storage, Git, SQLite, RocksDB, journal records,
specific commands, a GUI workflow, one universal ontology, or the current role
names in every domain. It does not authorize action, settle work, certify
implementation quality, or turn a product witness into universal proof.
