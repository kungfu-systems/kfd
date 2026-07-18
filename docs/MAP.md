# Documentation Map

| Your question | Document |
|---|---|
| What future does KFD describe, and what decisions exist? | [`../README.md`](../README.md) |
| What is the KFD-1/2/3 foundation triad? | [`../README.md`](../README.md#foundation-triad) |
| What worldview structure does the foundation triad express? | [`foundation-model.md`](foundation-model.md) |
| What is the shared formal notation and authority boundary? | [`formal-model.md`](formal-model.md) |
| How do Decision, Formal, Schema, Usage, and Witness relate? | [`formal-model.md`](formal-model.md#purpose) |
| Why does the foundation begin with a procedure rather than a principle? | [`foundation-model.md`](foundation-model.md#why-the-foundation-begins-with-procedure) |
| How do capability loops, discovery loops, and product witnesses fit together? | [`foundation-model.md`](foundation-model.md) |
| What is a primitive, why is primitive discovery difficult, and how does KFD address the missing process? | [`foundation-model.md`](foundation-model.md) |
| How can I test the KFD primitive-discovery lens against Git, VisiCalc, the log, and an ordinary trace view? | [`primitive-discovery-cases.md`](primitive-discovery-cases.md) |
| Where are provisional Primitive candidates tracked as live KFD dogfood? | [`../cases/registry.json`](../cases/registry.json) |
| Where are pre-number KFD Candidates tracked? | [`../drafts/registry.json`](../drafts/registry.json) |
| How does the current action-system candidate relate Fact, Episode, Atlas, Pursuit, and Warrant without allocating KFD-7? | [`../drafts/action-state-separation.md`](../drafts/action-state-separation.md) |
| Why might consequential action require an independently addressable perspective and fact cut? | [`../drafts/atlas-action-perspective.md`](../drafts/atlas-action-perspective.md) |
| Why might intent continuity require an identity independent of the actions that advance it? | [`../drafts/pursuit-intent-continuity.md`](../drafts/pursuit-intent-continuity.md) |
| Why might bounded authority require an explicit, derivable, and revocable Warrant? | [`../drafts/warrant-bounded-authority.md`](../drafts/warrant-bounded-authority.md) |
| How does a candidate become a numbered draft? | [`../CONTRIBUTING.md`](../CONTRIBUTING.md#candidates-and-numbered-drafts) |
| When may the pre-stable foundation be revised, and what freezes at stable? | [`../CONTRIBUTING.md`](../CONTRIBUTING.md#pre-stable-foundation-revision) |
| How did the first live case split a fused work-object hypothesis into Pursuit and Warrant candidate tracks? | [`../cases/live/proof-carrying-work-object/README.md`](../cases/live/proof-carrying-work-object/README.md) |
| What four-object agent work state connects Pursuit, Atlas, Warrant, and Episode? | [`../cases/live/proof-carrying-work-object/ontology-split.md`](../cases/live/proof-carrying-work-object/ontology-split.md) |
| Are Pursuit, Atlas, Warrant, and Episode conditionally distinguishable, and what remains unproved? | [`../cases/live/proof-carrying-work-object/distinguishability.md`](../cases/live/proof-carrying-work-object/distinguishability.md) |
| What are the current immutable KFD-5 cuts for Pursuit and Warrant? | [`../cases/live/proof-carrying-work-object/cuts/0002-pursuit.json`](../cases/live/proof-carrying-work-object/cuts/0002-pursuit.json) and [`../cases/live/proof-carrying-work-object/cuts/0002-warrant.json`](../cases/live/proof-carrying-work-object/cuts/0002-warrant.json) |
| What practice guidelines are derived from the foundation triad? | [`foundation-model.md`](foundation-model.md#practice-guidelines) |
| How should a product show timeline order from a declared perspective? | [KFD-4](../decisions/KFD-4.md) |
| What schema should products use for KFD-4 observer-relative timeline views? | [`../schemas/kfd-4/observer-perspective.schema.json`](../schemas/kfd-4/observer-perspective.schema.json) |
| How should humans and agents discover a load-bearing primitive? | [KFD-5](../decisions/KFD-5.md) |
| What schema records a KFD-5 primitive candidate? | [`../schemas/kfd-5/primitive-discovery.schema.json`](../schemas/kfd-5/primitive-discovery.schema.json) |
| How should an autonomous discovery loop remain grounded in causal experience? | [KFD-6](../decisions/KFD-6.md) |
| What schema records a KFD-6 autonomous discovery experiment? | [`../schemas/kfd-6/autonomous-discovery-loop.schema.json`](../schemas/kfd-6/autonomous-discovery-loop.schema.json) |
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
| How should an agent quickly understand this package? | [`../README.md`](../README.md#agent-quickstart), then [`foundation-model.md`](foundation-model.md), [`formal-model.md`](formal-model.md), and [`primitive-discovery-cases.md`](primitive-discovery-cases.md) |
| What is the concrete self-proof path for KFD-1 through KFD-6? | [`../README.md`](../README.md#product-proof-path), the KFD formal and usage pages, and the package witnesses under [`../.buildchain/`](../.buildchain/) |
| How do I independently verify KFD records, release passports, Xinfa Pack/Atlas objects, or qualified Git Episodes? | [`verifier.md`](verifier.md) |
| Where are the verifier semantic differences and public-specification gaps recorded? | [`verifier-inventory.md`](verifier-inventory.md) |
| Where is the public KFD fact source? | [`../README.md`](../README.md#decision-metadata) and [`../site/kfd-site.json`](../site/kfd-site.json) decision metadata |
| What does Apache-2.0 cover, and what remains official/trademark-bound? | [`../TRADEMARKS.md`](../TRADEMARKS.md) |
| What should a site renderer consume to render `kfd.libkungfu.dev`? | [`../site/kfd-site.json`](../site/kfd-site.json) |
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
