# Documentation Map

| Your question | Document |
|---|---|
| What future does KFD describe, and what decisions exist? | [`../README.md`](../README.md) |
| What is the KFD-1/2/3 foundation triad? | [`../README.md`](../README.md#foundation-triad) |
| What worldview structure does the foundation triad express? | [`foundation-model.md`](foundation-model.md) |
| Why does the foundation begin with a procedure rather than a principle? | [`foundation-model.md`](foundation-model.md#why-the-foundation-begins-with-procedure) |
| How do capability loops, discovery loops, and product witnesses fit together? | [`foundation-model.md`](foundation-model.md) |
| What is a primitive, why is primitive discovery difficult, and how does KFD address the missing process? | [`foundation-model.md`](foundation-model.md) |
| How can I test the KFD primitive-discovery lens against Git, VisiCalc, the log, and an ordinary trace view? | [`primitive-discovery-cases.md`](primitive-discovery-cases.md) |
| What practice guidelines are derived from the foundation triad? | [`foundation-model.md`](foundation-model.md#practice-guidelines) |
| How should a product show timeline order from a declared perspective? | [KFD-4](../decisions/KFD-4.md) |
| What schema should products use for KFD-4 observer-relative timeline views? | [`../schemas/kfd-4/observer-perspective.schema.json`](../schemas/kfd-4/observer-perspective.schema.json) |
| How should humans and agents discover a load-bearing primitive? | [KFD-5](../decisions/KFD-5.md) |
| What schema records a KFD-5 primitive candidate? | [`../schemas/kfd-5/primitive-discovery.schema.json`](../schemas/kfd-5/primitive-discovery.schema.json) |
| How should an autonomous discovery loop remain grounded in causal experience? | [KFD-6](../decisions/KFD-6.md) |
| What schema records a KFD-6 autonomous discovery experiment? | [`../schemas/kfd-6/autonomous-discovery-loop.schema.json`](../schemas/kfd-6/autonomous-discovery-loop.schema.json) |
| What are the package implementation notes for KFD-1? | [`KFD-1-usage.md`](KFD-1-usage.md) |
| What schema should papers, specifications, or sites use for canonical/latest/immutable publication URL semantics? | [`../schemas/kfd-1/publication-url-semantics.schema.json`](../schemas/kfd-1/publication-url-semantics.schema.json) and [`KFD-1-usage.md`](KFD-1-usage.md#publication-url-semantics) |
| What are the package implementation notes for KFD-2? | [`KFD-2-usage.md`](KFD-2-usage.md) |
| What are the package implementation notes for KFD-3? | [`KFD-3-usage.md`](KFD-3-usage.md) |
| What are the package implementation notes for KFD-4? | [`KFD-4-usage.md`](KFD-4-usage.md) |
| What are the package implementation notes for KFD-5? | [`KFD-5-usage.md`](KFD-5-usage.md) |
| What are the package implementation notes for KFD-6? | [`KFD-6-usage.md`](KFD-6-usage.md) |
| How should an agent quickly understand this package? | [`../README.md`](../README.md#agent-quickstart), then [`foundation-model.md`](foundation-model.md), then [`primitive-discovery-cases.md`](primitive-discovery-cases.md) |
| What is the concrete self-proof case for KFD-1/2/3/4? | [`../README.md`](../README.md#product-proof-path) and the implementation case in each KFD |
| Where is the public KFD fact source? | [`../README.md`](../README.md#decision-metadata) and [`../site/kfd-site.json`](../site/kfd-site.json) decision metadata |
| What does Apache-2.0 cover, and what remains official/trademark-bound? | [`../TRADEMARKS.md`](../TRADEMARKS.md) |
| What should a site renderer consume to render `kfd.libkungfu.dev`? | [`../site/kfd-site.json`](../site/kfd-site.json) |
| How should a site map decision pages to usage subpages? | [`../site/kfd-site.json`](../site/kfd-site.json) — `decisionPages.usagePages` maps `/N` to `/N/usage` |
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
