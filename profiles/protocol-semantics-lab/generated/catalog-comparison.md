---
status: draft
period: 2026-08-23
theme: protocol-semantics-lab
doc_type: generated-analysis
source_level: local-files
confidence: high
sensitivity: public
evidence_grade: B
review_state: unreviewed
last_reviewed: 2026-08-23
---

# Frozen Protocol Evidence Catalog

This deterministic comparison is generated from `catalog-source.json`. The
catalog root is `sha256:9fb02453236e847be8494a49d095da45bd484d40d914fe8a9f04d36f09b35879`. Source URLs are citation locators only;
generation and verification are offline. `out-of-scope` records a protocol
responsibility boundary and is never a failure score.

| Exact pack | Maturity | Work version | Authority revocation | Causal history | Retry identity | Recovery drift | Accepted completion |
| --- | --- | --- | --- | --- | --- | --- | --- |
| a2a-task@2026.8.23 | experimental | extension-required | unresolved | represented | represented | represented | extension-required |
| a2ui@0.9.0 | experimental | out-of-scope | out-of-scope | out-of-scope | out-of-scope | out-of-scope | out-of-scope |
| ag-ui@2026.8.23 | experimental | out-of-scope | unresolved | represented | unresolved | represented | extension-required |
| agntcy@1.0.0 | experimental | out-of-scope | extension-required | out-of-scope | unresolved | out-of-scope | out-of-scope |
| commerce-acp@2026.1.0 | domain-family | out-of-scope | unresolved | unresolved | out-of-scope | out-of-scope | extension-required |
| dbos@2026.8.23 | implementation | extension-required | out-of-scope | represented | represented | represented | extension-required |
| ietf-aiagent-auth-draft-03@0.0.3 | draft | out-of-scope | unresolved | out-of-scope | out-of-scope | unresolved | out-of-scope |
| kfd-delegated-work-alpha68@1.0.0-alpha.68 | experimental | represented | represented | represented | represented | represented | represented |
| mcp-tasks@2026.7.28 | experimental | extension-required | extension-required | unresolved | represented | represented | extension-required |
| restate@2026.8.23 | implementation | extension-required | out-of-scope | represented | represented | represented | extension-required |
| webmcp-cg-draft@0.0.1-20260823 | incubating | out-of-scope | out-of-scope | out-of-scope | out-of-scope | out-of-scope | out-of-scope |
| zed-acp@1.0.0 | experimental | out-of-scope | unresolved | represented | extension-required | represented | out-of-scope |

The two ACP meanings are deliberately distinct: `zed-acp` is the Agent
Client Protocol session surface, while `commerce-acp` is the agentic-commerce
family. IETF draft-03 remains `draft`; WebMCP remains `incubating`.
Passing validates this frozen representation only and grants no vendor,
runtime, certification, adoption, policy-correctness, or commercial authority.
