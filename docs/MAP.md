---
status: active
period: ongoing
theme: kfd-documentation-map
doc_type: analysis
source_level: local-files
confidence: high
sensitivity: public
evidence_grade: A
review_state: self-reviewed
last_reviewed: 2026-08-22
---

# Documentation Map

## Start here

| Your question | Document |
|---|---|
| What deepest problem does KFD address, and what decisions exist? | [`../README.md`](../README.md) |
| Can I understand the complete model in ten minutes through one real software-delivery Work? | [`conceptual-compression.md`](conceptual-compression.md) |
| How do context, task, permission, logs, workflow, and judgment relate to Fact, Episode, Atlas, Pursuit, and Warrant without becoming one-to-one aliases? | [`conceptual-compression.md`](conceptual-compression.md#the-model-in-one-view), then [`terminology.md`](terminology.md#the-core-2--3-structure) |
| How can a bounded, goal-directed system remain continuous while acting and changing under uncertainty? | [`../README.md`](../README.md), then [`foundation.md`](foundation.md) |
| Is KFD an internal kungfu-systems rulebook or an open engineering standard? | [`../README.md`](../README.md#what-kfd-is) and [`../GOVERNANCE.md`](../GOVERNANCE.md) |
| Who may propose, challenge, implement, adopt, or review a KFD? | [`../CONTRIBUTING.md`](../CONTRIBUTING.md) |
| Who controls official KFD numbering, status, and releases? | [`../GOVERNANCE.md`](../GOVERNANCE.md#canonical-authority) |
| What is the KFD-1/2/3 foundation triad? | [`../README.md`](../README.md#foundation-triad) |
| What worldview structure does the foundation triad express? | [`foundation.md`](foundation.md) |
| What is the KFD primitive system already carrying inside Kungfu under pre-release dogfood pressure? | Current continuity cut: [`load-bearing-dogfood-2026-08-03-f08ade5b.md`](load-bearing-dogfood-2026-08-03-f08ade5b.md); preserved successor: [`load-bearing-dogfood-2026-08-03.md`](load-bearing-dogfood-2026-08-03.md); preserved baseline: [`load-bearing-dogfood.md`](load-bearing-dogfood.md) |
| Which application families are qualified, implemented, partial, active frontiers, or provisional horizons? | [`load-bearing-dogfood.md`](load-bearing-dogfood.md#7-the-current-application-map) |
| What confidence may responsibly be updated from founding-adopter load, and what remains unproved? | [`load-bearing-dogfood.md`](load-bearing-dogfood.md#9-the-bounded-confidence-update), then its [explicit non-claims](load-bearing-dogfood.md#10-what-this-does-not-prove) |
| What is the shared formal notation and authority boundary? | [`formal-model.md`](formal-model.md) |
| What do Fact, Episode, Atlas, Pursuit, and Warrant mean, and why are they a 2 + 3 structure rather than five peers? | [`terminology.md`](terminology.md#the-core-2--3-structure) |
| How do Decision, Formal, Schema, Usage, and Witness relate? | [`formal-model.md`](formal-model.md#purpose) |
| Why does the foundation begin with a procedure rather than a principle? | [`foundation.md`](foundation.md#why-the-foundation-begins-with-procedure) |
| How do capability loops, discovery loops, and product witnesses fit together? | [`foundation.md`](foundation.md) |
| What is a primitive, why is primitive discovery difficult, and how does KFD address the missing process? | [`foundation.md`](foundation.md) |
| How can I test the KFD primitive-discovery lens against Git, VisiCalc, the log, and an ordinary trace view? | [`primitive-discovery-cases.md`](primitive-discovery-cases.md) |
| Where are provisional Primitive candidates tracked as live KFD dogfood? | [`../cases/registry.json`](../cases/registry.json) |
| Where are pre-number KFD Candidates tracked? | [`../drafts/registry.json`](../drafts/registry.json) |
| Is Work a higher-layer Primitive, a derived federated view, or existing Initiative semantics? | [`../drafts/federated-work-continuity.md`](../drafts/federated-work-continuity.md) and its [`live case`](../cases/live/federated-work-continuity/README.md) |
| How can independently owned Agent Hubs exchange responsibility without sharing one vendor runtime or cloud? | [`../protocols/agent-hub/README.md`](../protocols/agent-hub/README.md) |
| How can I install the Protocol Semantics Lab, inspect exact packs, compare preserved and collapsed routes, use rooted examples or review templates, and verify reports offline? | [`../profiles/protocol-semantics-lab/README.md`](../profiles/protocol-semantics-lab/README.md) |
| How can an adopter execute and independently verify the fixed dual-Hub Agent Hub 20 suite? | [`../profiles/agent-hub/README.md`](../profiles/agent-hub/README.md) and its [`implementer guide`](../profiles/agent-hub/implementer-guide.md) |
| How can an Agent runtime produce an implementation-independent KFD Runtime 100 report? | [`../profiles/agent-runtime/README.md`](../profiles/agent-runtime/README.md) and its [`implementer guide`](../profiles/agent-runtime/implementer-guide.md) |
| How can retained product evidence feed Warrant discovery without promoting product fields into KFD semantics? | [`../profiles/warrant-evidence/README.md`](../profiles/warrant-evidence/README.md), its [`evidence registry`](../evidence/primitive-evidence/registry.json), and the [`first-wave report`](../evidence/primitive-evidence/first-wave-report.md) |
| How does KFD describe and root its own Candidate, lifecycle, Foundation Revision, and release transitions without circular self-certification? | [`../profiles/self-conformance/README.md`](../profiles/self-conformance/README.md) and its [`clean-room guide`](../profiles/self-conformance/implementer-guide.md) |
| Which KFD-1 through KFD-13 decisions are self-sufficient, partial, or still missing public conformance surfaces? | [`semantic-self-sufficiency-matrix.md`](semantic-self-sufficiency-matrix.md) and its [machine matrix](../evidence/semantic-self-sufficiency/kfd-1-13.json) |

## Decisions, candidates, and Domain Profiles

| Your question | Document |
|---|---|
| How was the action-system candidate promoted into KFD-7? | [KFD-7](../decisions/KFD-7.md) and its [source-candidate lineage](../drafts/action-state-separation.md) |
| What is the formal and geometric model behind KFD-7? | [`KFD-7-formal.md`](KFD-7-formal.md) |
| Why can a simple session round-trip through KFD-7 without losing decision semantics? | [`KFD-7-formal.md`](KFD-7-formal.md#session-round-trip-preservation-theorem) |
| Why is session context alone insufficient for consequential action? | [`KFD-7-formal.md`](KFD-7-formal.md#context-insufficiency-corollary) |
| How does a product reuse the KFD-7 theorem in its qualification gate? | [`KFD-7-usage.md`](KFD-7-usage.md#qualification-by-theorem-reuse) |
| What retained product evidence qualifies the KFD-7 activation cut? | [`KFD-7-activation.md`](KFD-7-activation.md) and [`../evidence/kfd-7/activation-record.json`](../evidence/kfd-7/activation-record.json) |
| How do fact cuts differ from causal records even when their endpoints are equal? | [`KFD-1-formal.md`](KFD-1-formal.md#domain-objects) |
| How does KFD-4 replace absolute context with declared reference frames and preserved invariants? | [`KFD-4-formal.md`](KFD-4-formal.md#domain-objects) |
| How must an Atlas bind perspective to admitted facts, source, cut, and declared loss? | [KFD-8](../decisions/KFD-8.md) and its [source-candidate lineage](../drafts/atlas-action-perspective.md) |
| How must a Pursuit preserve continuing direction beyond the actions that advance it? | [KFD-9](../decisions/KFD-9.md) and its [source-candidate lineage](../drafts/pursuit-intent-continuity.md) |
| How must a Warrant preserve bounded, derivable, and revocable authority? | [KFD-10](../decisions/KFD-10.md) and its [source-candidate lineage](../drafts/warrant-bounded-authority.md) |
| How must Claim, Assessment, authorized Decision, and Admission remain distinct? | [KFD-11](../decisions/KFD-11.md), [`KFD-11-usage.md`](KFD-11-usage.md), and its [source-candidate lineage](../drafts/claim-assessment-decision-admission.md) |
| How did agents generate Claim, Assessment, and Decision during Kungfu development, then recognize their settlement relation with Admission as KFD-11? | [`../cases/live/decision-admission-settlement/README.md`](../cases/live/decision-admission-settlement/README.md), then its [`development-lineage.md`](../cases/live/decision-admission-settlement/development-lineage.md), [`genesis.md`](../cases/live/decision-admission-settlement/genesis.md), and [`kfd-method-trace.md`](../cases/live/decision-admission-settlement/kfd-method-trace.md) |
| Which fields belong to the cross-domain core, a Domain Profile, or participant projection? | [`field-responsibility-matrix.md`](field-responsibility-matrix.md) |
| How does one software-development Domain Profile organize Initiative, Assignment, Episode, Claim, Assessment, Decision, Admission, and Continuation without making those names universal? | [KFD-12](../decisions/KFD-12.md) and [`KFD-12-usage.md`](KFD-12-usage.md) |
| How can a software Project Cut bind source, Atlas, Episode, and policy authorities without becoming another fact engine? | [KFD-13](../decisions/KFD-13.md) and [`KFD-13-usage.md`](KFD-13-usage.md) |
| Where do adopters and agents discover the KFD-11–13 witness, qualification, and activation interfaces? | [`../activation-contracts.json`](../activation-contracts.json) |
| What schema proves KFD-11 exact Warrant and independent Admission boundaries? | [`../schemas/kfd-11/adopter-witness.schema.json`](../schemas/kfd-11/adopter-witness.schema.json) |
| What schema proves KFD-12 Initiative/Assignment, proposal/acceptance, coordinate, and simple-session boundaries? | [`../schemas/kfd-12/adopter-witness.schema.json`](../schemas/kfd-12/adopter-witness.schema.json) |
| What schema proves KFD-13 authority preservation, residual risk, export verification, and lineage? | [`../schemas/kfd-13/adopter-witness.schema.json`](../schemas/kfd-13/adopter-witness.schema.json) |
| How are structural, implementation, operational, independent-review, and activation levels kept separate? | [`../schemas/kfd-activation/qualification-report.schema.json`](../schemas/kfd-activation/qualification-report.schema.json) |
| What fail-closed record carries pass/revise/reject over exact evidence and residual risk? | [`../schemas/kfd-activation/activation-record.schema.json`](../schemas/kfd-activation/activation-record.schema.json) |
| Must other domains adopt the KFD-12 software lifecycle or KFD-13 Project Cut? | [KFD-12 scope](../decisions/KFD-12.md#scope) and [KFD-13 scope](../decisions/KFD-13.md#scope) |
| Why were the pre-stable KFD-11 and KFD-12 coordinates revised? | [`foundation-revision-2026-07-21-decision-admission.md`](foundation-revision-2026-07-21-decision-admission.md) and its [machine map](foundation-revision-2026-07-21-decision-admission.json) |
| How does a candidate become a numbered draft? | [`../CONTRIBUTING.md`](../CONTRIBUTING.md#candidates-and-numbered-drafts) |
| When may the pre-stable foundation be revised, and what freezes at stable? | [`../CONTRIBUTING.md`](../CONTRIBUTING.md#pre-stable-foundation-revision) |
| How did the first live case split a fused work-object hypothesis into Pursuit and Warrant candidate tracks? | [`../cases/live/proof-carrying-work-object/README.md`](../cases/live/proof-carrying-work-object/README.md) |
| What four-object agent work state connects Pursuit, Atlas, Warrant, and Episode? | [`../cases/live/proof-carrying-work-object/ontology-split.md`](../cases/live/proof-carrying-work-object/ontology-split.md) |
| Are Pursuit, Atlas, Warrant, and Episode conditionally distinguishable, and what remains unproved? | [`../cases/live/proof-carrying-work-object/distinguishability.md`](../cases/live/proof-carrying-work-object/distinguishability.md) |
| What are the current immutable KFD-5 cuts for Pursuit and Warrant? | [`../cases/live/proof-carrying-work-object/cuts/0002-pursuit.json`](../cases/live/proof-carrying-work-object/cuts/0002-pursuit.json) and [`../cases/live/proof-carrying-work-object/cuts/0002-warrant.json`](../cases/live/proof-carrying-work-object/cuts/0002-warrant.json) |
| How is the Work candidate distinguished from Initiative, a derived Work view, and no new Primitive? | [`../cases/live/federated-work-continuity/distinguishability.md`](../cases/live/federated-work-continuity/distinguishability.md), its [`current successor cut`](../cases/live/federated-work-continuity/cuts/0002-work.json), and the preserved [`first cut`](../cases/live/federated-work-continuity/cuts/0001-work.json) |
| Are Product Release Cut and Cut Transition new Primitives, a KFD-13 specialization, a release passport, or ordinary manifest metadata? | [`../cases/live/product-release-cut-transition/README.md`](../cases/live/product-release-cut-transition/README.md) and its two provisional KFD-5 cuts |
| How did perspective transformation expose Initiative, Assignment, and Project Cut, and how were they qualified? | [`../cases/live/software-work-perspective-settlement/README.md`](../cases/live/software-work-perspective-settlement/README.md) |
| What separates the Agent-origin testimony for Project Cut from public implementation evidence? | [`../cases/live/software-work-perspective-settlement/genesis.md`](../cases/live/software-work-perspective-settlement/genesis.md#agent-origin-testimony-and-public-evidence) |
| What is the current KFD-5 outcome for the Consequential Settlement procedure? | [`../cases/live/decision-admission-settlement/cuts/0002-consequential-settlement.json`](../cases/live/decision-admission-settlement/cuts/0002-consequential-settlement.json) |
| What practice guidelines are derived from the foundation triad? | [`foundation.md`](foundation.md#practice-guidelines) |
| How should a product show timeline order from a declared perspective? | [KFD-4](../decisions/KFD-4.md) |
| What schema should products use for KFD-4 observer-relative timeline views? | [`../schemas/kfd-4/observer-perspective.schema.json`](../schemas/kfd-4/observer-perspective.schema.json) |
| How should humans and agents discover a load-bearing primitive? | [KFD-5](../decisions/KFD-5.md) |
| What schema records a KFD-5 primitive candidate? | [`../schemas/kfd-5/primitive-discovery.schema.json`](../schemas/kfd-5/primitive-discovery.schema.json) |
| How should an autonomous discovery loop remain grounded in causal experience? | [KFD-6](../decisions/KFD-6.md) |
| Why should well-formed Episodes be treated as durable historical assets rather than disposable traces? | [KFD-6: Episodes as historical assets](../decisions/KFD-6.md#episodes-as-historical-assets) and [`KFD-6-usage.md`](KFD-6-usage.md#episode-asset-stewardship) |
| What schema records a KFD-6 autonomous discovery experiment? | [`../schemas/kfd-6/autonomous-discovery-loop.schema.json`](../schemas/kfd-6/autonomous-discovery-loop.schema.json) |
| Is there early real-world evidence that part of KFD-6 is feasible without claiming activation? | [Consequential Settlement early feasibility mapping](../cases/live/decision-admission-settlement/development-lineage.md#6-kfd-6-early-feasibility-case), then [KFD-6](../decisions/KFD-6.md#early-feasibility-evidence) |
| How must real-world action keep direction, perspective, authority, and occurrence distinct? | [KFD-7](../decisions/KFD-7.md) |
| What is the difference between the Fact-Episode Ontology, Action Responsibility Geometry, and a Domain Profile? | [KFD-7](../decisions/KFD-7.md#action-responsibility-geometry-and-domain-profiles) and [`KFD-7-usage.md`](KFD-7-usage.md#fact-episode-ontology-action-responsibility-geometry-and-domain-profiles) |
| Why are Fact and Episode ontology bindings rather than action coordinates? | [KFD-7](../decisions/KFD-7.md#fact-episode-ontology) and [`KFD-7-formal.md`](KFD-7-formal.md#fact-episode-ontology) |
| What schema declares a KFD-7 Domain Profile and activation evidence boundary? | [`../schemas/kfd-7/domain-profile.schema.json`](../schemas/kfd-7/domain-profile.schema.json) |

## Decision references and implementation

| Your question | Document |
|---|---|
| What are the package implementation notes for KFD-1? | [`KFD-1-usage.md`](KFD-1-usage.md) |
| What is the formal reference for KFD-1? | [`KFD-1-formal.md`](KFD-1-formal.md) |
| What schema should papers, specifications, or sites use for canonical/latest/immutable publication URL semantics? | [`../schemas/kfd-1/publication-url-semantics.schema.json`](../schemas/kfd-1/publication-url-semantics.schema.json) and [`KFD-1-usage.md`](KFD-1-usage.md#publication-url-semantics) |
| What are the package implementation notes for KFD-2? | [`KFD-2-usage.md`](KFD-2-usage.md) |
| What is the formal reference for KFD-2? | [`KFD-2-formal.md`](KFD-2-formal.md) |
| What are the package implementation notes for KFD-3? | [`KFD-3-usage.md`](KFD-3-usage.md) |
| What is the formal reference for KFD-3? | [`KFD-3-formal.md`](KFD-3-formal.md) |
| What are the package implementation notes for KFD-4? | [`KFD-4-usage.md`](KFD-4-usage.md) |
| What is the formal reference for KFD-4? | [`KFD-4-formal.md`](KFD-4-formal.md) |
| What are the package implementation notes for KFD-5? | [`KFD-5-usage.md`](KFD-5-usage.md) |
| What is the formal reference for KFD-5? | [`KFD-5-formal.md`](KFD-5-formal.md) |
| What are the package implementation notes for KFD-6? | [`KFD-6-usage.md`](KFD-6-usage.md) |
| What is the formal reference for KFD-6? | [`KFD-6-formal.md`](KFD-6-formal.md) |
| What are the package implementation notes for KFD-7? | [`KFD-7-usage.md`](KFD-7-usage.md) |
| What is the formal reference for KFD-7? | [`KFD-7-formal.md`](KFD-7-formal.md) |
| What are the package implementation notes for KFD-8? | [`KFD-8-usage.md`](KFD-8-usage.md) |
| What is the formal reference for KFD-8? | [`KFD-8-formal.md`](KFD-8-formal.md) |
| What are the package implementation notes for KFD-9? | [`KFD-9-usage.md`](KFD-9-usage.md) |
| What is the formal reference for KFD-9? | [`KFD-9-formal.md`](KFD-9-formal.md) |
| What are the package implementation notes for KFD-10? | [`KFD-10-usage.md`](KFD-10-usage.md) |
| What is the formal reference for KFD-10? | [`KFD-10-formal.md`](KFD-10-formal.md) |
| What are the package implementation notes for KFD-11? | [`KFD-11-usage.md`](KFD-11-usage.md) |
| What is the formal reference for KFD-11? | [`KFD-11-formal.md`](KFD-11-formal.md) |
| What are the package implementation notes for KFD-12? | [`KFD-12-usage.md`](KFD-12-usage.md) |
| What is the formal reference for KFD-12? | [`KFD-12-formal.md`](KFD-12-formal.md) |
| What are the package implementation notes for KFD-13? | [`KFD-13-usage.md`](KFD-13-usage.md) |
| What is the formal reference for KFD-13? | [`KFD-13-formal.md`](KFD-13-formal.md) |

## Adoption, verification, and release

| Your question | Document |
|---|---|
| How should an agent quickly understand this package? | [`../README.md`](../README.md#agent-quickstart), then [`foundation.md`](foundation.md), [`formal-model.md`](formal-model.md), and [`primitive-discovery-cases.md`](primitive-discovery-cases.md) |
| What is the experimental transport-neutral Agent Hub interoperability profile? | [`../protocols/agent-hub/README.md`](../protocols/agent-hub/README.md), then its [`implementer guide`](../protocols/agent-hub/implementer-guide.md) and [`state machine`](../protocols/agent-hub/state-machine.md) |
| What is the experimental dual-Hub black-box conformance profile and fixed Agent Hub 20 suite? | [`../profiles/agent-hub/README.md`](../profiles/agent-hub/README.md) and its [`implementer guide`](../profiles/agent-hub/implementer-guide.md) |
| How can I observe delegated-work semantic collisions, change the visible projection, map an adopter system, and verify the resulting offline report? | [`../profiles/delegated-work-challenge/README.md`](../profiles/delegated-work-challenge/README.md), its [fixed suite](../profiles/delegated-work-challenge/fixtures/suite.json), and [projection schema](../schemas/kfd-delegated-work-challenge/projection.schema.json) |
| How can a human or Agent ask the installed Kungfu product to run, explain, retain, and independently recheck that exact Hub 20 evidence? | `kungfu agent hub qualify --output-dir <new-directory> [--json]`, then [`../profiles/agent-hub/README.md`](../profiles/agent-hub/README.md#verify-the-first-party-kungfu-product) for the ownership and claim boundary |
| What is the experimental black-box Agent runtime conformance profile and fixed KFD Runtime 100 suite? | [`../profiles/agent-runtime/README.md`](../profiles/agent-runtime/README.md), its [`normative inventory`](../profiles/agent-runtime/normative-inventory.md), and [`implementer guide`](../profiles/agent-runtime/implementer-guide.md) |
| What is the concrete self-proof path for KFD-1 through KFD-13? | [`../README.md`](../README.md#product-proof-path), the KFD formal and usage pages, and the package witnesses under [`../.buildchain/`](../.buildchain/) |
| What dated evidence synthesis connects the founding product witnesses without creating new normative authority? | Current continuity cut: [`load-bearing-dogfood-2026-08-03-f08ade5b.md`](load-bearing-dogfood-2026-08-03-f08ade5b.md); preserved successor: [`load-bearing-dogfood-2026-08-03.md`](load-bearing-dogfood-2026-08-03.md); the 2026-07-28 [`load-bearing-dogfood.md`](load-bearing-dogfood.md) baseline remains rendered at `/under-load` |
| How do I independently verify KFD records, release passports, Xinfa Pack/Atlas objects, or qualified Git Episodes? | [`verifier.md`](verifier.md) |
| How do I verify Primitive Evidence Bundles and the experimental KFD-10 Warrant vectors from the KFD package alone? | [`independent-verifier.md`](independent-verifier.md) and [`../profiles/warrant-evidence/README.md`](../profiles/warrant-evidence/README.md) |
| What is the finite KFD Self-Conformance Profile, bootstrap anchor, transition bundle, and non-authority report contract? | [`../profiles/self-conformance/README.md`](../profiles/self-conformance/README.md), its [`manifest`](../profiles/self-conformance/manifest.json), and [`fixed vectors`](../profiles/self-conformance/vectors/contract-vectors.json) |
| How does an adopter declare and verify every decision against one exact package cut without turning evidence into runtime, release, or certification authority? | [`../profiles/adopter-conformance/README.md`](../profiles/adopter-conformance/README.md), its [`manifest schema`](../schemas/kfd-adopter-conformance/manifest.schema.json), and its [`fixed vectors`](../profiles/adopter-conformance/vectors.json) |
| Where are the verifier semantic differences and public-specification gaps recorded? | [`verifier-inventory.md`](verifier-inventory.md) |
| Where is the public KFD fact source? | [`../README.md`](../README.md#decision-metadata) and [`../site/kfd-site.json`](../site/kfd-site.json) decision metadata |
| What does Apache-2.0 cover, and what remains official/trademark-bound? | [`../TRADEMARKS.md`](../TRADEMARKS.md) |
| What should a site renderer consume to render `kfd.libkungfu.dev`? | [`../site/kfd-site.json`](../site/kfd-site.json) |
| How should a site render the ten-minute KFD reader model? | [`../site/kfd-site.json`](../site/kfd-site.json) — `conceptualCompressionPage` owns `/concepts`, projects canonical terms from `terminology.json`, and carries the complete non-normative Markdown body |
| How should a site render the executable Agent Hub onboarding path? | [`../site/kfd-site.json`](../site/kfd-site.json) — `agentHubPage` owns `/agent-hub` and is generated from the packaged profile, implementer guide, capabilities, and manifest |
| How should a site render the load-bearing dogfood baseline? | [`../site/kfd-site.json`](../site/kfd-site.json) — `loadBearingPage` owns `/under-load`, declares its non-normative authority boundary, and carries the complete Markdown body |
| How should a site render provisional live cases? | [`../site/kfd-site.json`](../site/kfd-site.json) — `liveCases` maps the registry to `/cases/live/{id}` |
| How should a site render pre-number candidates? | [`../site/kfd-site.json`](../site/kfd-site.json) — `candidatePages` owns `/drafts/` and `/drafts/{id}/`; `kfdCandidates` preserves candidate-domain metadata |
| How should a site map decision pages to usage subpages? | [`../site/kfd-site.json`](../site/kfd-site.json) — `decisionPages.usagePages` maps `/N` to `/N/usage` |
| How should a site map formal references? | [`../site/kfd-site.json`](../site/kfd-site.json) — `formalPage` maps `/formal`, and `decisionPages.formalPages` maps `/N` to `/N/formal` |
| What is the top-level product accountability principle? | [KFD-2](../decisions/KFD-2.md) |
| What stance should products take toward humans and agents as reasoning participants? | [KFD-3](../decisions/KFD-3.md) |
| What schema should products use for KFD-3 participant-facing collaboration interfaces? | [`KFD-3-usage.md`](KFD-3-usage.md) |
| What schema should a product or agent use for generic KFD-2 trust assessment? | [`KFD-2-usage.md`](KFD-2-usage.md#generic-trust-claims) |
| What should an agent do when a needed KFD-2 trust taxonomy value is missing? | [`KFD-2-usage.md`](KFD-2-usage.md#trust-taxonomy) — open a KFD GitHub issue |
| What does a specific decision say? | [`../decisions/`](../decisions) (index: [`../registry.json`](../registry.json)) |
| What machine metadata should Buildchain or another consumer import for KFD standard identity and schema IDs? | [`../standards.json`](../standards.json) |
| What schema validates the standards metadata surface? | [`../schemas/kfd-standards.schema.json`](../schemas/kfd-standards.schema.json) |
| What schema should release systems use for KFD-2 release claims and trust passports? | [`KFD-2-usage.md`](KFD-2-usage.md) — release passports are a KFD-2 projection |
| How do I cite a decision? | [`../README.md`](../README.md) — cite by number, e.g. `KFD-1` |
| How do decisions change over time? | [`../CONTRIBUTING.md`](../CONTRIBUTING.md) — prerelease refinement preserves immutable artifacts; after stable, explicit supersession mints a new number |
| How is this package versioned and released? | [KFD-1](../decisions/KFD-1.md) applied to itself; Buildchain governs releases |
| What release impact ledger should Buildchain consume for production passports? | [`../release-impact.json`](../release-impact.json) |
| What release provenance path must alpha promotion use? | [`release-governance.md`](release-governance.md) |
| How do I verify registry/document agreement? | `node scripts/check.mjs` |
| How do I report a vulnerability? | [`../SECURITY.md`](../SECURITY.md) |
