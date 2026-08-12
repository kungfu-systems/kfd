# KFD — Kung Fu Decisions

KFD's deepest question may not be **"How does an agent execute a task?"** It
may be: **How can a bounded, goal-directed system act and change in an
unpredictable world without losing continuity with itself?**

KFD is an open, evidence-governed engineering standard for preserving facts,
boundaries, perspective, and responsibility when the path is not known in
advance. It develops a small set of portable principles, procedures, schemas,
and verification contracts through which humans, agents, organizations, and
software systems can act, learn, and change without silent drift. It therefore
treats a well-formed Episode as more than a trace: it is a durable historical
asset that future humans and agents can replay when today's ontology no longer
explains reality.

KFD does not claim to be the final answer or a complete theory of complex
systems. It publishes a small, testable foundation for adoption,
implementation, challenge, counterevidence, and revision. The breadth covered
by its current decisions is evidence that a general action structure may
exist, not proof that KFD has finished discovering it. Kungfu is its founding
implementation, not its adoption boundary. Accumulating Episodes alone does
not discover or prove a Primitive; KFD-5 and KFD-6 keep generation,
qualification, and promotion separate.

## How KFD governs its own change

KFD Self-Conformance has two connected lanes with different time boundaries:

- **Prospective governance** gates official Candidate genesis, qualification,
  numbering, status, Foundation Revision, and release-packaging transitions
  under the live Profile. Ordinary repository edits do not silently become
  lifecycle transitions.
- **Retrospective structural conformance** replays immutable public evidence
  from the alpha.28 Foundation Cut and converges additively on the alpha.55
  pre-Profile live anchor. Every replay declares `retrospective: true` and
  `profileAvailableAtEvent: false`; it never projects the later Profile into
  the historical event.

In both lanes, structural verification is necessary but not sufficient.
Passing evidence cannot approve, number, activate, certify, publish, or
authorize a release, and it cannot establish semantic truth, adoption, or
production fitness. Accountable human authority remains separate and explicit.

[Read the Self-Conformance Profile](profiles/self-conformance/README.md) ·
[Replay the historical lineage](profiles/self-conformance/history/README.md) ·
[Inspect the historical report](profiles/self-conformance/history/historical-lineage.report.json) ·
[Inspect the live manifest](profiles/self-conformance/manifest.json)

## Implement and verify KFD independently

**Implement KFD without Kungfu — scaffold an adapter in Python, Rust, Node.js,
or C++, then verify it offline.**

Use the immutable `@kungfu-tech/kfd@1.0.0-alpha.60` package cut and follow the
package-owned [Agent Hub workflow](profiles/agent-hub/README.md) or inspect the
complete [independent verification boundary](docs/independent-verifier.md):

```bash
npx --yes --package @kungfu-tech/kfd@1.0.0-alpha.60 kfd scaffold agent-hub --language python --output my-agent-hub-adapter
npx --yes --package @kungfu-tech/kfd@1.0.0-alpha.60 kfd test agent-hub --adapter ./my-agent-hub-adapter/adapter.py --output agent-hub-report.json
npx --yes --package @kungfu-tech/kfd@1.0.0-alpha.60 kfd verify agent-hub-report agent-hub-report.json --adapter ./my-agent-hub-adapter/adapter.py --json
```

The scaffold is a deterministic, fail-closed starter: its smoke path checks
only the JSONL envelope, and implementers must replace the missing product
semantics before the fixed Hub 20 suite can pass.

Package acquisition is separate from offline verification. Network or a local
package cache may be needed to obtain the immutable package bytes; after the
package, report, and optional adapter bytes are present, the report verifier
performs no network access.

These results do not certify an implementation or prove security, production
fitness, complete semantic coverage, KFD-10 activation, or adoption by an
independent organization. [Open the complete Agent Hub guide](/agent-hub/) ·
[Inspect the verifier and coverage matrix](/verify/)

## Foundation triad

The first three KFDs form the public foundation for KFD adopters and the
binding foundation for kungfu-systems:

```text
KFD-1: facts must not drift.
KFD-2: trust must start from facts.
KFD-3: cooperation must start from trusted value.
```

Together they define a load-bearing path for systems acting under uncertainty:
keep facts non-drifting, make trust inspectable from those facts, and let
participants cooperate through trusted value rather than hidden pressure where
multiple reasoning participants are involved. Kungfu carries this foundation
as its founding implementation.

No principle is load-bearing until it has an inspectable product witness.

[Read the KFD Foundation](docs/foundation.md) ·
[See KFD under load](docs/load-bearing-dogfood.md) ·
[Inspect the formal model](docs/formal-model.md) ·
[Use the terminology contract](docs/terminology.md) ·
[See primitives in history](docs/primitive-discovery-cases.md) ·
[Inspect live Primitive cases](cases/registry.json) ·
[Inspect KFD candidates](drafts/registry.json) ·
[Explore current decisions](#current-decisions) ·
[Inspect the product proof path](#product-proof-path)

## Where KFD sits in the Agent Supply Chain

KFD owns the open cooperation and trust contracts in the Agent Supply Chain;
it does not own product builds, runtime storage, vendor identity, or a central
Hub. The relevant path is:

```text
KFD-3 discovery and cooperation
  -> product-owned build evidence
  -> KFD-2 purpose-bound assessment
  -> adopter-owned runtime facts
  -> receiver-owned admission between independent Hubs
```

KFD-3 makes a product's value, constraints, choices, commands, Exit, and
records discoverable without turning discovery into forced adoption. KFD-2
lets a receiver assess claims against exact facts and evidence while retaining
residual risk and decision ownership. The experimental
[Agent Hub profile](protocols/agent-hub/README.md) carries those responsibilities
across independently owned implementations.

What is proved now is the public decision, schema, profile, and verifier
surface in this repository. The protocol enables independent Hubs to implement
the same responsibility boundary; it does **not** prove two independent
production Hubs, external vendor adoption, stable certification, or industry
standard status. Implementers can start with the exact alpha profile and
[open a protocol gap](https://github.com/kungfu-systems/kfd/issues/new).

## Why this question matters

Continuity under uncertainty is not the preservation of a fixed state. A
system remains itself only if it can change its model, direction, and behavior
without silently losing the facts, boundaries, and responsibilities that make
those changes its own. The problem recurs at different scales in people,
organizations, software systems, and civilizations, even though KFD does not
claim that one implementation can describe them all.

When the system's current model is adequate, uncertainty still requires an
inspectable action loop: declare a fact cut, establish bounded trust, cooperate
where participants are involved, declare perspective, direction, and
authority, record what occurred, and admit successor facts through review and
correction. KFD-1 through KFD-4 and KFD-7 make those responsibilities
independently addressable without pretending that every outcome was known in
advance.

The harder case begins when the current model cannot name what reality is
demanding. The system must revise not only its answer, but the objects and
relations through which an answer can be formed. At that boundary, continuity
depends on whether a candidate new structure can emerge, remain connected to
causal experience, and become qualified without generated narrative replacing
fact.

Primitive discovery is one frontier through which KFD tests that harder
problem. A Primitive is not important because it is a clever abstraction. It
is important when naming it lets a system perceive, act, verify, and continue
in ways its previous object world could not support.

Most progress gives us better answers inside a world we already know how to
describe. Some progress changes what that world contains. A spreadsheet cell
made dependencies and recalculation directly manipulable. A Git commit made
distributed history something software could preserve, compare, and exchange.
Once such a Primitive exists, it feels obvious; before it exists, whole fields
may work around its absence.

We know how to use Primitives after they exist. We do not yet have a generally
adopted, reliable process for discovering the ones reality is already
demanding. KFD asks how a system can make that discovery inspectable while
preserving facts, boundaries, and responsibility. Kungfu opens a concrete path
from agents that answer inside a human-named world to humans and agents that
can discover when that world was named incorrectly.

## What KFD is

KFD is an open engineering standard for a small, testable foundation for
reliable action and continuity under uncertainty. Its portable norms can be
adopted by products, organizations, humans, agents, and other bounded systems.
This repository is KFD's canonical open decision registry. Each numbered
decision has a kind, a status, and a single authoritative text here.

Kungfu-systems founded KFD, stewards the official namespace and release
surfaces, and adopts active KFDs across the scopes declared by its products.
Other adopters remain independent: they declare their own adoption scope,
Profile mapping, evidence, qualification, and residual risk.

A **KFD Candidate** is a non-normative, pre-number draft under `drafts/`. It may
carry a non-binding slot hint, but only explicit promotion allocates a KFD
number. A **numbered draft** already appears under `decisions/` and
`registry.json`; its number is allocated even while its activation gate remains
open.

KFDs can be **principles** or **procedures**. Principles state what must remain
true within a declared adoption scope; procedures state how a class of work
enforces or protects a principle. During the pre-stable line,
maintainer-authorized
Foundation Revision remains possible under the evidence, lineage, and review
requirements in `CONTRIBUTING.md`, while every published prerelease coordinate
stays immutable. The first stable release freezes number-to-meaning mappings.
After that freeze, substantive change mints a new KFD that explicitly
supersedes the old number. The numbered decisions remain authoritative; the
[KFD Foundation](docs/foundation.md) explains how they fit together.

Stable rendered site: `https://kfd.libkungfu.dev`.

## Open evolution

KFD is developed in public. Any person, agent, project, company, or research
group may:

- propose a KFD Candidate or a narrower amendment;
- submit counterexamples, disconfirming evidence, or compatibility concerns;
- contribute an adopter Profile, independent implementation, or verifier;
- improve schemas, formal references, terminology, and usage guidance;
- review a proposal or challenge the qualification of an existing decision.

Open contribution does not make every proposal normative and does not turn KFD
into governance by popularity. Official KFD maintainers steward the canonical
namespace and must make acceptance, revision, activation, rejection, and
supersession decisions against public evidence, declared gates, conflicts, and
review records.

[Read the contribution process](CONTRIBUTING.md) ·
[Read the governance model](GOVERNANCE.md)

## Adoption boundary

KFD is an engineering discipline, not a belief test.
KFD governs systems before it judges people.
No one should be pressured to adopt KFD in the name of KFD.
Disagreement is a valid cooperation state.

A constraint can be strict and still KFD-compatible when it is fact-bound,
explainable, auditable, and proportionate.

## Current decisions

| ID | Kind | Axiom | Status |
|---|---|---|---|
| [KFD-1](decisions/KFD-1.md) | procedure | Facts must not drift. | active |
| [KFD-2](decisions/KFD-2.md) | principle | Trust must start from facts. | active |
| [KFD-3](decisions/KFD-3.md) | principle | Cooperation must start from trusted value. | active |
| [KFD-4](decisions/KFD-4.md) | principle | Views must remain bound to declared perspectives. | active |
| [KFD-5](decisions/KFD-5.md) | procedure | Primitive discovery must separate genesis from qualification. | active |
| [KFD-6](decisions/KFD-6.md) | procedure | Autonomous discovery must remain grounded in causal experience. | draft |
| [KFD-7](decisions/KFD-7.md) | principle | Real-world action must keep state, occurrence, and action coordinates distinct. | active |
| [KFD-8](decisions/KFD-8.md) | principle | Perspective must remain bound to admitted facts and declared loss. | draft |
| [KFD-9](decisions/KFD-9.md) | principle | Continuing direction must outlive the actions that advance it. | draft |
| [KFD-10](decisions/KFD-10.md) | principle | Authority must remain explicit, bounded, and revocable. | draft |
| [KFD-11](decisions/KFD-11.md) | procedure | Claims may be assessed; only authorized decisions may change admitted state or responsibility. | draft |
| [KFD-12](decisions/KFD-12.md) | principle | Software work must keep Initiative and Assignment distinct. | draft |
| [KFD-13](decisions/KFD-13.md) | procedure | Project settlement must bind authorities without absorbing them. | draft |

## Candidate lineage

KFD Candidates preserve potentially load-bearing rules before and after
numbering so readers can audit genesis, qualification, promotion, and later
revision. They remain non-normative source lineage after promotion.

- [Cross-domain action primitives](drafts/action-state-separation.md) was
  promoted into active KFD-7.
- [Atlas action perspective](drafts/atlas-action-perspective.md) was promoted
  into numbered draft KFD-8.
- [Pursuit intent continuity](drafts/pursuit-intent-continuity.md) was promoted
  into numbered draft KFD-9.
- [Warrant bounded authority](drafts/warrant-bounded-authority.md) was promoted
  into numbered draft KFD-10.
- [Claim, Assessment, Decision, and Admission](drafts/claim-assessment-decision-admission.md)
  was allocated to numbered draft KFD-11 by the pre-stable
  [Foundation Revision](docs/foundation-revision-2026-07-21-decision-admission.md).
- [Federated Work Continuity](drafts/federated-work-continuity.md) is an
  incubating, unnumbered candidate. It tests whether Work remains independently
  identifiable across Assignments, workspaces, and cuts, while retaining
  Initiative, derived-view, and no-new-Primitive alternatives.

The machine source is [`drafts/registry.json`](drafts/registry.json). A
candidate's lineage does not replace the numbered decision that received its
slot. An incubating candidate allocates no slot.

## Experimental protocol profiles

KFD also publishes an
[Agent Hub alpha profile](protocols/agent-hub/README.md) for exchanging and
continuing responsibility objects between independently owned Agent Hubs. It
applies KFD-1, KFD-2, KFD-3, and KFD-7 through a transport-neutral manifest,
capability contract, exchange envelope, reference state machine, gap matrix,
and implementer guide.

The profile is not a numbered KFD, stable certification, proof of a conforming
implementation, vendor adoption, plural-Hub interoperability, or an industry
standard. Implementations cite its exact alpha version, manifest digest, and
repository commit.

The packaged [Agent Hub conformance profile](profiles/agent-hub/README.md)
turns that protocol into a fixed dual-Hub black-box workflow: Agent Hub 20,
JSONL adapter request and response contracts, artifact- and capability-bound
reports, an independent offline verifier, and two non-product reference
adapters. Its machine outcomes bind `status`, `code`, and `verdict` together so
a visible conflict cannot be mistaken for admission merely by inspecting a
reason code.

A clean npm consumer can pin `@kungfu-tech/kfd@alpha`, run the zero-configuration
`kfd demo agent-hub` path, inspect `kfd capabilities agent-hub --json`, or
generate a fail-closed C++, Node.js, Python, or Rust adapter starter with
`kfd scaffold agent-hub`. Starter smoke tests exercise only the JSONL envelope;
only `kfd test agent-hub --adapter ...` executes Hub 20 against adopter bytes.

The experimental
[Agent Runtime conformance profile](profiles/agent-runtime/README.md) consumes
that exact Hub root and exposes a topology-neutral black-box adapter, the fixed
KFD Runtime 100 vector registry, a rooted execution report, and offline native /
WASM verification. Its 35 Core vectors test the KFD-7 responsibility-separation
subset; 65 Experimental vectors exercise provisional work-object and recovery
semantics without promoting them into normative KFD authority.

The suite ships two structurally different reference adapters to prove the
protocol is executable, not to claim independent product adoption. A passing
report stays non-qualifying and non-self-certified and binds only the exact
adapter artifact, profile manifest, suite root, platform, transcript, and
results.

The experimental
[Warrant Evidence profile](profiles/warrant-evidence/README.md) retains exact
public implementation coordinates as Primitive Evidence Bundles and tests the
KFD-10 numbered draft against 23 fixed lifecycle vectors. It keeps
generic candidate claims separate from Buildchain- or KFX-specific behavior,
runs from the KFD package alone, and cannot activate or self-certify KFD-10.

## Product proof path

KFDs are not a detached manifesto, but they are not a demand that readers adopt
a Kungfu product before understanding the decisions. The product-witness rule
starts with this package itself: `standards.json`, `schemas/`, `docs/`,
`site/kfd-site.json`, and `scripts/check.mjs` show how KFD-1 through KFD-13 are
expressed as consumable interfaces for both humans and agents. These surfaces
do not prove every adopter or product correct; they make the KFD package's own
claims inspectable and falsifiable.

The stable [`/verify`](https://kfd.libkungfu.dev/verify) path explains how to
implement and verify KFD from one immutable package cut. It projects the
KFD-1 through KFD-13 semantic self-sufficiency matrix, the package-only Warrant
verifier and its 23 fixed vectors, the retained evidence-wave outcomes, and the
non-activation boundary. The same page declares stable machine paths so a
reader does not have to trust the rendered explanation.

KFD also publishes pre-number candidates under `drafts/` and provisional live
cases under `cases/`. A candidate registry keeps ordering hypotheses from
silently becoming numbered authority. A live case freezes
candidate genesis, points to immutable KFD-5 qualification cuts, and keeps
supporting and contradicting evidence open. Live cases are dogfood records,
not numbered decisions, accepted Primitive claims, or product capability
announcements.

The non-normative [KFD Under Load](docs/load-bearing-dogfood.md) baseline
connects those individual witnesses into one dated founding-adopter evidence
cut. It explains what the current primitive system is already carrying, how
pressure changed the implementation, which confidence updates are warranted,
and which generalization gates remain open. It does not replace the numbered
decisions or promote incomplete work into qualification.

The complete explanatory path is published at
[`docs/foundation.md`](docs/foundation.md) and projected to the
stable site route `/foundation`. It explains the decisions without replacing
their numbered authoritative texts. The non-normative formal layer begins at
[`docs/formal-model.md`](docs/formal-model.md), with one versioned formal
reference under `docs/KFD-N-formal.md` and the stable route `/N/formal` for
each decision. It makes objects, invariants, transitions, invalid states, and
proof obligations explicit without claiming to replace the decisions or prove
natural-language meaning from package bytes.

For the broader witness set, use the main Kungfu product entrypoint
(`https://kungfu.tech`) for product philosophy, and Buildchain
(`https://buildchain.libkungfu.dev`) for release and provenance
accountability. This registry states the commitments; the open products expose
where those commitments are carried, where evidence can be inspected, and
where remaining risk still belongs.

Rendered index: `https://kfd.libkungfu.dev` (stable machine path per entry,
e.g. `https://kfd.libkungfu.dev/1`). This repository publishes
`@kungfu-tech/kfd` — the decision texts plus a machine-readable
`registry.json` — which the site consumes as its single fact source.

Machine consumers that need KFD-owned standard identity should read
`standards.json`. It is the versioned metadata surface for stable standard
keys, decision and formal-reference routes and SHA-256 digests, schema IDs,
KFD-owned concept names, and machine-interface contract versions. In Node or
TypeScript projects, import it as:

```js
import standards from "@kungfu-tech/kfd/standards.json" with { type: "json" };
```

## Independent verifier

KFD includes an offline verifier implemented from public specifications without
linking Kungfu, Xinfa, Buildchain, or other product code. The same Rust core is
projected as a native CLI, library, and packaged WebAssembly executable:

```bash
npx @kungfu-tech/kfd verify kfd-record standards.json
npx @kungfu-tech/kfd verify passport .buildchain/release-passport
npx @kungfu-tech/kfd verify pack path/to/context-pack
npx @kungfu-tech/kfd verify atlas path/to/atlas
npx @kungfu-tech/kfd verify episode path/to/sealed/episode
npx @kungfu-tech/kfd test agent-runtime --adapter path/to/adapter --output report.json
npx @kungfu-tech/kfd verify agent-runtime-report report.json
npx @kungfu-tech/kfd verify warrant-evidence profiles/warrant-evidence/fixtures/buildchain-dev-delivery-warrant.json --json
npx @kungfu-tech/kfd gate self-conformance-lifecycle transition.request.json --output transition.report.json --json
npx --yes --package @kungfu-tech/kfd@alpha kfd demo agent-hub --output agent-hub-demo-report.json
npx --yes --package @kungfu-tech/kfd@alpha kfd capabilities agent-hub --json
npx --yes --package @kungfu-tech/kfd@alpha kfd scaffold agent-hub --language python --output my-agent-hub-adapter
npx --yes --package @kungfu-tech/kfd@alpha kfd test agent-hub --adapter path/to/adapter --output agent-hub-report.json
npx --yes --package @kungfu-tech/kfd@alpha kfd verify agent-hub-report agent-hub-report.json --adapter path/to/adapter --json
kungfu agent hub qualify --output-dir ./kungfu-agent-hub-check
kungfu agent hub verify --qualification-dir ./kungfu-agent-hub-check
```

The generic verifier and Agent runtime verifier emit
`kfd.verification-report/v1`. The Agent Hub runner writes
`kfd.agent-hub-report/v1`, and its independent verifier emits
`kfd.agent-hub-report-verifier/v1`. All remain non-qualifying and perform no
network access. Verification proves only the named profile checks; it does not
prove source completeness, work quality, human approval, or release
authorization. The lifecycle gate additionally checks a complete predecessor
chain and separate supplied authority/review receipts, but still performs no
numbering, status, approval, merge, or release action. See
[`docs/verifier.md`](docs/verifier.md) for the contracts and
[`docs/verifier-inventory.md`](docs/verifier-inventory.md) for the extraction
boundary and public-spec gaps. The separate JavaScript Warrant verifier and its
package-only boundary are documented in
[`docs/independent-verifier.md`](docs/independent-verifier.md).

The final two commands are the first-party Kungfu product projection. They use
the KFD package bundled with Kungfu, exercise the product-owned Hub semantics in
two isolated local authority homes, preserve rooted JSON evidence, and explain
the result in human language by default. They do not turn a passing report into
KFD certification, security assessment, production fitness, remote-network
interoperability, or external adoption.

## Agent Quickstart

For KFD-11 through KFD-13 adoption or activation work, begin with
[`activation-contracts.json`](activation-contracts.json). It is the stable
machine discovery surface for the three adopter witnesses, the shared
qualification report, and the fail-closed activation record. Schema validity
proves structural conformance only; it never upgrades implementation,
operational evidence, independent review, or activation readiness.

Agents consuming this package should start from the same sources as humans:

1. Read this README for the future picture, foundation triad, and package map.
2. Read `docs/foundation.md` for the complete non-numbered explanation.
3. Read `docs/terminology.md` or `terminology.json` before interpreting
   overloaded core terms. The contract fixes their canonical subtitles,
   `2 + 3` structure, and anti-misreading boundaries for humans and agents.
4. Read `docs/formal-model.md` for the authority boundary, shared notation, and
   the `Decision -> Formal -> Schema -> Usage -> Witness` traceability chain.
5. Read `docs/KFD-N-formal.md` when precise domain objects, invariants,
   transitions, invalid states, and proof obligations are needed for a
   particular decision.
6. Read `docs/primitive-discovery-cases.md` to test the KFD lens against familiar
   historical cases and an ordinary cross-machine trace vignette.
7. Read `cases/registry.json` to discover provisional live Primitive cases,
   their current immutable KFD-5 cuts, claim boundaries, and review paths.
8. Read `drafts/registry.json` to discover non-normative KFD Candidate
   lineage, promotion gates, status, and claim boundaries.
9. Read `standards.json` for canonical KFD numbers, formal reference versions
   and hashes, schema IDs, concept names, and interface contracts.
10. Use `site/kfd-site.json` decision metadata or the KFD-3 collaboration
   interface fact-source metadata to identify the public KFD fact source.
11. Use `schemas/kfd-2/trust-taxonomy.schema.json` for KFD-2 residual-risk and
   trust-downgrade values. Unknown taxonomy values are invalid.
12. Use `schemas/kfd-2/trust-claims.schema.json` and
   `schemas/kfd-2/trust-assessment.schema.json` when a claim needs generic
   KFD-2 assessment instead of a release-specific passport.
13. Use `schemas/kfd-3/collaboration-interface.schema.json` and
   `schemas/kfd-3/witness.schema.json` to inspect collaboration interfaces. If
   the installed Kungfu capability is in question, run
   `kungfu agent hub qualify --output-dir <new-directory> --json`; explain only
   the bounded `meaning` and `nonClaims` fields, then retain or independently
   recheck the evidence with `kungfu agent hub verify`.
14. Use `schemas/kfd-1/publication-url-semantics.schema.json` when a package,
   paper, specification, or site bundle must distinguish stable reader URLs,
   latest aliases, and immutable versioned artifacts.
15. If a needed KFD-2 taxonomy value is missing, open a KFD GitHub issue rather
   than inventing a local value:
   `https://github.com/kungfu-systems/kfd/issues/new?title=KFD-2%20trust%20taxonomy%20extension%20request`.
16. Use `schemas/kfd-4/observer-perspective.schema.json` to bind timelines to
   their observers and `schemas/kfd-4/perspective-replay.schema.json` to record
   perspective-preserving or contrastive replay. Use
   `schemas/kfd-5/primitive-discovery.schema.json` version 3 to record
   perspective-declared, method-plural genesis and fact-bound qualification,
   including the optional boundary-pressure diagnostic when implicit
   coordination is under new pressure. Use
   `schemas/kfd-6/autonomous-discovery-loop.schema.json` only for explicitly
   draft or experimental autonomous-discovery work; its version 4 interface
   requires plural generation experiments, bounded method comparison, and a
   conditional boundary hypothesis. Read `docs/KFD-7-formal.md` for the
   current Fact/Episode and action-responsibility reference model. Use
   `schemas/kfd-7/domain-profile.schema.json` for a product-neutral Domain
   Profile Declaration; schema validity is non-qualifying and does not activate
   a concrete Domain Profile. Read KFD-8 through KFD-10 for the separately
   allocated Atlas, Pursuit, and Warrant draft responsibilities. Read KFD-11
   for the cross-domain Claim-Assessment-Decision-Admission procedure. Read
   KFD-12 and KFD-13 as a software-development Domain Profile and
   project-settlement application, not as a required workflow for other
   domains. Use `docs/field-responsibility-matrix.md` to decide whether a field
   belongs to a cross-domain core, Domain Profile, or participant projection.

KFD package semver is only the distribution version. KFD-owned machine
interfaces carry their own `schemaVersion` and `contract` fields. Compatible
additions may keep the same interface version; semantic changes, required-field
changes, verification meaning changes, or responsibility-boundary changes must
use a new interface version or contract.

KFD-2 publishes trust-taxonomy, trust-claims, trust-assessment,
release-claims, and release-trust-passport schemas under `schemas/kfd-2/`.
The generic schemas let humans, agents, Buildchain, and other systems assess
whether claims about KFD-1, KFD-3, KFD-4, future KFDs, or product surfaces are
bound to source facts, evidence, hashes, audit boundaries, residual risk, and
assurance responsibility. The release schemas are a release-specific projection of
that model. See [`docs/KFD-2-usage.md`](docs/KFD-2-usage.md).

KFD-3 also publishes a general collaboration-interface schema and witness
schema under `schemas/kfd-3/`. These schemas are for participant-facing product
interfaces, not only agent APIs. A product such as Kungfu may implement an
agent-first profile, but that profile remains a product-specific realization of
KFD-3. The KFD-owned boundary is the standard vocabulary, schema IDs, and
closed-world evidence shape. See
[`docs/KFD-3-usage.md`](docs/KFD-3-usage.md).

KFD-4 says that views remain bound to declared perspectives and that a
perspective transformation must stay inspectable when it is used to reveal a
different object or guide action. Its two schemas under `schemas/kfd-4/` define
the first concrete path: observer-bound timelines make a perspective durable;
perspective-preserving and contrastive replay make perspectives transferable
and comparable without flattening their fact boundaries. They are not a
universal schema for every perspective.

KFD-5 publishes a version 3 primitive-discovery record schema under
`schemas/kfd-5/`. It requires every genesis to declare its observation
perspective and current ontology while allowing perspective, anomaly,
reconstruction, causal-variable, compression, and hybrid methods. It then
binds facts, alternatives, contract boundaries, falsifiers, dogfood evidence,
and outcome. Validation proves record closure, not that the candidate is a
real primitive or that one method is superior.

KFD-6 publishes a draft autonomous-discovery-loop schema under
`schemas/kfd-6/`. Its version 4 experiment interface requires causal-experience
boundaries, plural generation methods, fixed-ontology and no-new-primitive
baselines, shared-budget method comparison, held-out and independent
evaluation, bounded autonomy, and separation between discovery and promotion.
Its package presence is an experimental interface, not a claim that autonomous
primitive discovery or method dominance has been achieved.

KFD-7 is an active decision for real-world action. It keeps admitted state,
realized occurrence, direction, perspective, and authority independently
addressable. Its package surface includes the authoritative decision, formal
reference, usage boundary, standards metadata, candidate lineage, and the
version 1 Domain Profile Declaration. The schema separates ontology bindings
from action coordinates and fixes transition, theorem-reference,
qualification-evidence, non-claim, and activation declarations without fixing
product storage or lifecycle vocabulary. The
[activation evidence](docs/KFD-7-activation.md) binds independently reviewed
Buildchain and Kungfu Profiles while preserving product-owned qualification and
the decision's explicit non-claims.

The five names are not five peers. Fact and Episode form the Fact-Episode
Ontology; Atlas, Pursuit, and Warrant form the Action Responsibility Geometry.
Their canonical explanatory subtitles and anti-misreading boundaries come
from `terminology.json`, not from renderer or product-local wording.

KFD-8, KFD-9, and KFD-10 allocate the three action coordinates as numbered
drafts. KFD-11 separates Claim, Assessment, authorized Decision, and Admission
before a domain chooses its workflow. KFD-12 and KFD-13 then show one
software-development application: Initiative and Assignment organize durable
work responsibility, while Project Cut records project settlement. This
vocabulary does not bind other domains, which may define different Domain
Profiles and settlement objects.

## Decision metadata

Every rendered decision page should make the KFD fact source explicit. The
public KFD fact source is the GitHub-hosted `kungfu-systems/kfd` git
repository. GitHub is the current canonical coordination and hosting surface;
the load-bearing facts are the commit-addressed repository contents.

Decision metadata should expose:

- Public fact source: `https://github.com/kungfu-systems/kfd`
- Load-bearing coordinate: commit-addressed repository contents.
- Canonical decision paths: `decisions/KFD-N.md`, `registry.json`,
  `standards.json`.
- Canonical pre-number candidate index: `drafts/registry.json`; slot hints do
  not allocate or reserve KFD numbers.
- Canonical provisional-case index: `cases/registry.json`; listing does not
  promote a case into a numbered decision.
- Stable rendered index: `https://kfd.libkungfu.dev`.
- Rendered URL: `https://kfd.libkungfu.dev/N`.

Rendered pages, npm package contents, Buildchain release passports, and
`kfd.libkungfu.dev` are projections or evidence surfaces. A GitHub issue is an
extension request path, not a KFD fact by itself; it becomes part of the KFD
fact source only after the resulting change is committed to the repository.

## How to cite

Cite a decision by number and released coordinate: `KFD-1` plus the package
version or git commit when prerelease precision matters. Cite a candidate by
its candidate ID and released coordinate; never cite its slot hint as a KFD
number.

Every published package and commit is immutable. Before the first stable
release, a fully evidenced Foundation Revision may correct the latest numbered
structure, but must declare breaking impact, preserve prior coordinates, and
publish lineage and migration. The first stable release freezes each
number-to-meaning mapping. After that freeze, a superseded decision keeps its
number and points to its successor. Newer KFD numbers do not automatically
override older KFDs; supersession or override must be explicit in the later
decision and `registry.json`.

Repository-local engineering decisions stay in each repository's own ADRs and
reference KFDs; KFDs never depend on repository internals.

## Layout

```text
decisions/     one authoritative markdown file per decision (KFD-N.md)
drafts/        non-normative pre-number KFD Candidates and candidate registry
cases/         provisional live Primitive cases and immutable KFD-5 cuts
docs/          non-numbered explanations, formal references, usage guides,
               historical cases, and documentation map
registry.json  machine-readable index (schemaVersion 1, contract kfd-registry)
standards.json machine-readable KFD standard metadata (schemaVersion 2,
               contract kfd-standards-metadata)
schemas/       JSON schemas for package metadata and KFD-owned schema IDs
site/          machine-readable site bundle for kfd.libkungfu.dev renderers
buildchain.release-propagation.json
               Buildchain release propagation graph for KFD -> site consumers
release-impact.json
               Buildchain surface-aware impact ledger for production release passports
scripts/       conformance check: registry and documents must agree
```

`node scripts/check.mjs` (also `pnpm run check`) verifies numbering
uniqueness, registry/document agreement, standards metadata/schema agreement,
status validity, decision document SHA-256 bindings, interface contract
version bindings, and the release impact ledger required by Buildchain
production release passports. Releases are governed by Buildchain; this package
versions itself under KFD-1's own rules: the outer package line remains `v1.0`,
while patch and prerelease numbers are advanced by Buildchain release
promotion.

## Homepage content contract

This README is also the homepage text source for `https://kfd.libkungfu.dev`.
When `site-libkungfu-dev` consumes the `@kungfu-tech/kfd` npm package to render
the KFD site, it should treat this file as the canonical homepage copy, not as
an implementation note to paraphrase in the site repository.

The first screen should be derived from this README:

- Page identity: the top-level heading.
- Core question: the opening paragraph must ask how a bounded, goal-directed
  system can act and change in an unpredictable world without losing continuity
  with itself. KFD must not be reduced to an Agent task-execution protocol.
- Engineering answer: the second paragraph must identify facts, boundaries,
  perspective, and responsibility as the inspectable basis for action when the
  path is not known in advance.
- Claim boundary: the third paragraph must state that KFD is a small, testable
  foundation rather than a final answer or complete theory of complex systems.
- Independent implementation: the exact promise, four supported languages,
  ordered scaffold/test/verify commands, offline boundary, non-certifying
  boundary, and `/agent-hub/` plus `/verify/` links must appear before the
  Foundation triad and before any installed Kungfu product projection.
- Foundation signal: the `Foundation triad` section, especially the three
  one-line commitments and the product-witness rule immediately below them.
- Depth choice: the foundation link must route to the non-numbered explanatory
  page at `/foundation`, and the historical cases link must route to `/cases`;
  registry, renderer, and implementation detail stay outside the first screen.

Decision cards, detail links, and machine paths should come from
`registry.json`. The machine-readable site bundle lives at `site/kfd-site.json`
and gives renderers stable fields for the homepage, the foundation explanation
page, product proof path, decision routes, candidate routes, and rendering
boundary. `candidatePages` owns the `/drafts/` index and stable
`/drafts/{id}/` page declarations; renderers must not infer those routes from
the package directory layout. A site renderer may adapt layout, navigation,
typography, and visual assets, but it should not maintain separate wording that
can drift from this package.

`site/kfd-site.json` is generated from this README and
`docs/foundation.md` and `docs/primitive-discovery-cases.md` by
`scripts/update-site-bundle.mjs`. The README owns the concise homepage; the
foundation document owns the complete explanation; the cases document owns
the non-normative historical anchors. The generated bundle exposes ordered
homepage sections, the `/foundation` and `/cases` pages, and a display plan that
separates first-screen, primary, detail, and support content. Site repositories
should consume that bundle instead of parsing the Markdown files. The renderer
contract remains machine metadata, not ordinary homepage content.

## Release impact ledger

`release-impact.json` is the surface-aware impact ledger passed to Buildchain
when generating a production release passport:

```yaml
release-passport-impact-json: release-impact.json
```

For ordinary KFD content changes, keep `kfd-content` at `patch`. Move
`kfd-registry-schema` or `kfd-package-structure` to `minor` or `major` only
when those machine-consumed surfaces add or break fields, meanings, package
paths, or published structure under KFD-1. These values are Buildchain release
passport impact classifications; they do not by themselves open a new
`@kungfu-tech/kfd` package major or minor line.

## License and official status

Repository contents are licensed under the [Apache License 2.0](LICENSE).
Apache-2.0 grants broad reuse rights for the licensed contents, but it does
not grant KFD/Kungfu trademarks, official status, certification status, or
endorsement. The official source, name-use, fork, derivative, and agent-facing
authority boundaries are defined in [`TRADEMARKS.md`](TRADEMARKS.md).
