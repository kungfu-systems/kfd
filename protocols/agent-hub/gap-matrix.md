---
status: draft
period: 2026-07-20
theme: kfd-agent-hub-gap-matrix
doc_type: protocol-analysis
source_level: local-files
confidence: medium
sensitivity: public
evidence_grade: C
review_state: self-reviewed
last_reviewed: 2026-07-20
---

# Single-Runtime to Cross-Hub Gap Matrix

This matrix explains why KFD-7 responsibility separation is necessary but not
sufficient for independently owned Hubs. It defines the alpha profile's scope;
it does not change KFD-7 or qualify a product.

| Concern | One runtime or session can often assume | Cross-Hub requirement | Alpha mechanism | Failure if omitted |
| --- | --- | --- | --- | --- |
| Identity | Local process/user identifiers are already mapped. | Hub, node, actor, workspace, and organization identifiers are issuer-scoped claims. | Endpoint identities plus authority roots and receiver-local mapping. | `identity-unresolved` |
| Capability | One build knows its own feature set. | Peers may support different profile versions, operations, limits, and disclosure modes. | Signed/rooted capability documents and exact-version negotiation. | `profile-version-unsupported`, `required-feature-unsupported` |
| Fact authority | One store decides which state is current. | Each Hub may admit different cuts and preserve different evidence. | Base/result Fact roots plus a receiver-owned verdict. | `fact-cut-unavailable`, `local-policy-rejected` |
| Causal order | A process log may supply one order. | Offline and federated work creates partial orders and causal gaps. | Episode roots and predecessor exchange roots; no global clock. | `causal-gap` |
| Direction | A local task may imply one goal. | A continuation must bind the exact Pursuit revision it advances. | `pursuitRoot` and optional relation roots. | `required-field-withheld` |
| Perspective | One context window may appear current. | Peers may have different sources, cuts, omissions, and freshness. | `atlasRoot`, base Fact roots, disclosure state, and residual risk. | `disclosure-insufficient` |
| Authority | Local permissions may be ambient. | Delegation crosses products and organizations without inheriting trust. | Warrant roots, derivation, scope digest, expiry, revocation, and attenuation proof. | `authority-unresolved`, `authority-amplification` |
| Action binding | In-process code can carry implicit parameter identity. | The receiver must know which action was proposed against which roots. | Exchange-local `actionBindingRoot` and exact operation. | `required-field-withheld` |
| Occurrence | Return values may be mistaken for execution evidence. | Delivery and API success do not establish a causal Episode. | Separate transport receipt and `episodeRoots`. | `completion-unproved` |
| Admission | One runtime may update its own current state. | Producers cannot self-admit facts into another authority. | Receiver verdict with decision authority and accepted roots. | `authority-unresolved` |
| Completion | A task runner may equate exit zero with done. | Real-world completion belongs to an explicit assessment authority. | `completion-assessment` operation and typed completion state. | `completion-unproved` |
| Retry | A local caller may retry by convention. | Networks duplicate, reorder, reconnect, and replay. | Content-stable idempotency key and exchange root. | `idempotency-conflict` |
| Conflict | One database may hide a race with last-write-wins. | Independent authorities may produce valid competing branches. | Retained `conflictRoots` and explicit conflicted verdict. | `conflict-visible` |
| Partial replication | One process may read every local body. | Privacy, policy, cost, and offline limits require subsets. | Typed disclosure modes, omitted paths, commitments, and verification limits. | `disclosure-insufficient` |
| Redaction | Missing data may be treated as empty. | Deliberate withholding must remain distinct from unavailable data. | `intentionally-withheld` state and redaction commitments. | `required-field-withheld` |
| Retention | One product controls lifecycle. | Peers have different legal and operational retention policies. | Non-binding hints plus receiver-owned policy and export roots. | `local-policy-rejected` |
| Evolution | One deployment can migrate atomically. | Independently upgraded Hubs need fail-closed compatibility and exit. | Exact alpha version, immutable manifest, successor/migration obligations. | `profile-root-mismatch` |
| Governance | Internal maintainers can decide privately. | External implementers need proposal, counterevidence, review, and appeal paths. | Public KFD issues, PRs, interests disclosure, and canonical stewardship. | No interoperability claim may advance |

## Topology tests

The same record and verdict semantics must survive these non-isomorphic
deployments:

| Topology | Required distinguishing test |
| --- | --- |
| Local peer | Two processes exchange without a cloud account or global registry. |
| Single-vendor cloud | Vendor identity and policy remain private while exported records retain KFD roots. |
| Multi-organization federation | A remote Warrant is treated as a claim until local policy admits or derives authority. |
| Offline device | Divergent causal branches reconnect without rewriting roots or last-write-wins erasure. |

Failure in any row narrows the profile claim. One passing implementation cannot
establish topology neutrality.
