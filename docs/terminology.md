# KFD Terminology Contract

This document defines the public vocabulary used across KFD decisions,
formal references, schemas, packages, and rendered sites. It is not a numbered
decision. It prevents one concept from acquiring several names and prevents
one name from silently carrying several formal types.

The machine projection is [`../terminology.json`](../terminology.json).
`scripts/check.mjs` verifies the projection and rejects ambiguous vocabulary on
active KFD surfaces.

## Naming rules

1. A canonical term has one definition and one formal layer.
2. A generic word remains lowercase. Capitalization identifies a KFD term or
   named object.
3. The first use of a coined or overloaded term includes its plain-language
   meaning.
4. A schema, contract ID, metadata key, fixture, document, and site route use
   the same canonical vocabulary.
5. A candidate name does not imply that its object has been promoted to an
   active KFD Primitive.

## Canonical vocabulary

| Term | Layer | Meaning and first use |
| --- | --- | --- |
| **KFD Foundation** | explanatory | The non-numbered explanation of how the decisions compose. |
| **primitive** | generic | Any basic object in an external field. |
| **KFD Primitive** | standard | A qualified load-bearing object with independent identity, boundary, authority, lifecycle, and operations. |
| **KFD Primitive Candidate** | discovery | A proposed KFD Primitive that has not completed qualification and promotion. |
| **Fact-Episode Ontology** | KFD-7 ontology | The contract-world model whose object-like elements are admitted Fact cuts and whose path-like elements are Episodes. It is not a complete ontology of reality. |
| **Causal Occurrence** | reality boundary | A bounded event sequence or partial order that actually occurs. |
| **Causal Record** | evidence | An evidence-bearing representation of a Causal Occurrence, including declared omissions and loss. |
| **Episode** | KFD object | An independently addressable, replayable object that binds a Causal Record to declared cuts, perspective, and loss. It is not merely a session, run, transcript, or reinforcement-learning trajectory. |
| **Causal Experience** | evidence corpus | One or more Episodes used as evidence or learning material. It is not reality itself. |
| **Action Responsibility Geometry** | KFD-7 action model | The cross-domain responsibility model whose coordinates are direction, perspective, and bounded authority. Geometry does not imply Euclidean space, physical motion, a metric, or a differentiable manifold. |
| **Action Coordinate** | KFD-7 role | One independently addressable coordinate in the Action Responsibility Geometry. |
| **Pursuit** | reference coordinate | The direction coordinate: continuing intended change and its progress relation. KFD-7 standardizes this role, not a complete Pursuit object specification. |
| **Atlas** | reference coordinate | The perspective coordinate: accepted facts, observation boundary, cut, omissions, and loss. KFD-7 standardizes this role, not a complete Atlas object specification. |
| **Warrant** | reference coordinate | The bounded-authority coordinate: which transition may be performed, by whom, and under which constraints. KFD-7 standardizes this role, not legal authority or a complete Warrant object specification. |
| **Domain Profile** | adopter model | A versioned declaration of how one domain binds its representations to the Fact-Episode Ontology and Action Responsibility Geometry. |
| **Domain Profile Declaration** | machine artifact | A document conforming to `schemas/kfd-7/domain-profile.schema.json`. |
| **Assurance Responsibility** | trust model | The named assignment of source-fact, verification, and decision authority. It is distinct from a KFD-7 Action Coordinate. |
| **Participant Value Claim** | cooperation model | A bounded statement of value to a participant, with inspectable fact, trust, constraint, choice, and residual-risk boundaries. |

## Type relationships

```text
Causal Occurrence --represented by--> Causal Record
Causal Record     --bound into-------> Episode
Episode[]         --used as----------> Causal Experience

Fact cut + Episode
  -> Fact-Episode Ontology

Pursuit + Atlas + Warrant
  -> Action Responsibility Geometry

domain representation
  -> Domain Profile Declaration
  -> ontology bindings + action coordinates
```

The relationships are directional. A record is not the occurrence itself; an
Episode is not every possible record; a corpus of Episodes is not a complete
account of reality.

## Usage discipline

Public prose may use a shorter name after the first qualified use within the
same document. Machine surfaces do not shorten canonical IDs or field names.
When an external field already uses the same word differently, KFD text states
the KFD meaning before making comparisons.

Terminology changes are contract changes. Before stable, they replace the
current vocabulary atomically across all active surfaces. After stable, they
follow the KFD-1 compatibility boundary declared by the affected interface.
