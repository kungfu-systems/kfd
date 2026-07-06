# Documentation Map

| Your question | Document |
|---|---|
| What is KFD, and what decisions exist? | [`../README.md`](../README.md) |
| What is the KFD-1/2/3 foundation triad? | [`../README.md`](../README.md#foundation-triad) |
| What worldview structure does the foundation triad express? | [`../README.md`](../README.md#foundation-model) |
| What should a site renderer consume to render `kfd.libkungfu.dev`? | [`../site/kfd-site.json`](../site/kfd-site.json) |
| What is the top-level product accountability principle? | [KFD-2](../decisions/kfd-2.md) |
| What stance should products take toward humans and agents as reasoning participants? | [KFD-3](../decisions/kfd-3.md) |
| What schema should products use for KFD-3 participant-facing collaboration interfaces? | [`kfd-3-collaboration-interface.md`](kfd-3-collaboration-interface.md) |
| What does a specific decision say? | [`../decisions/`](../decisions) (index: [`../registry.json`](../registry.json)) |
| What machine metadata should Buildchain or another consumer import for KFD standard identity and schema IDs? | [`../standards.json`](../standards.json) |
| What schema validates the standards metadata surface? | [`../schemas/kfd-standards.schema.json`](../schemas/kfd-standards.schema.json) |
| What schema should release systems use for KFD-2 release claims and trust passports? | [`kfd-2-release-trust.md`](kfd-2-release-trust.md) |
| How do I cite a decision? | [`../README.md`](../README.md) — cite by number, e.g. `KFD-1` |
| How do decisions change over time? | [`../CONTRIBUTING.md`](../CONTRIBUTING.md) — append-only; explicit supersession mints a new number |
| How is this package versioned and released? | [KFD-1](../decisions/kfd-1.md) applied to itself; Buildchain governs releases |
| What release impact ledger should Buildchain consume for production passports? | [`../release-impact.json`](../release-impact.json) |
| How do I verify registry/document agreement? | `node scripts/check.mjs` |
| How do I report a vulnerability? | [`../SECURITY.md`](../SECURITY.md) |
