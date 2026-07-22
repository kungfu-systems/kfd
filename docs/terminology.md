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
6. A canonical explanatory subtitle clarifies one term. It is not an alias,
   a second formal type, or permission to rename the term on machine surfaces.

## The core 2 + 3 structure

The five core KFD-7 names are not five peers. They form two ontology bindings
and three action coordinates:

```text
Fact + Episode
  -> Fact-Episode Ontology

Atlas + Pursuit + Warrant
  -> Action Responsibility Geometry
```

The canonical explanatory subtitles and questions are:

| Term | Canonical explanatory subtitle | Compact subtitle | Question |
| --- | --- | --- | --- |
| **Fact** | Admitted state at a declared evidence boundary | Admitted state | What is admitted? |
| **Episode** | Replayable causal record between Fact cuts | Replayable causal record | What happened? |
| **Atlas** | Declared perspective over admitted facts | Declared perspective | From where is it judged? |
| **Pursuit** | Continuing direction and progress relation | Continuing direction | What change is sought? |
| **Warrant** | Bounded authority for admissible transitions | Bounded authority | What action is allowed? |

`Fact` names admitted state, not absolute truth. `Fact Cut` names an
independently addressable instance of that state at a declared source,
authority, evidence, and time or version boundary. The formal model uses
`FactCut` as the carrier so two cuts can differ even when they contain similar
claims.

The subtitles above are the full first-use forms. Compact interfaces may use
the machine-declared `compactSubtitle` values, but must keep the canonical term
visible or discoverable.

The same contract closes common false equivalences:

| Term | It is not |
| --- | --- |
| **Fact** | absolute truth; every observation; a Causal Record |
| **Episode** | a session by definition; a transcript by definition; an intended or authorized action; proof of success, progress, completion, or authorization |
| **Atlas** | complete reality; generic context without source, cut, freshness, omissions, and loss; a Pursuit or Warrant |
| **Pursuit** | a one-shot task; a plan; authority to act |
| **Warrant** | authentication; a capability alone; intention or assignment; proof that an action occurred |

## Canonical vocabulary

| Term | Layer | Meaning and first use |
| --- | --- | --- |
| **KFD Foundation** | explanatory | The non-numbered explanation of how the decisions compose. |
| **primitive** | generic | Any basic object in an external field. |
| **KFD Primitive** | standard | A qualified load-bearing object with independent identity, boundary, authority, lifecycle, and operations. |
| **KFD Primitive Candidate** | discovery | A proposed KFD Primitive that has not completed qualification and promotion. |
| **Fact-Episode Ontology** | KFD-7 ontology | The contract-world model whose object-like elements are admitted Fact cuts and whose path-like elements are Episodes. It is not a complete ontology of reality. |
| **Fact** | KFD-7 ontology binding | State admitted into a contract world under declared source, authority, evidence, and cut boundaries. It is not absolute truth or every observation. |
| **Fact Cut** | KFD-7 formal carrier | An independently addressable instance of admitted Fact state at a declared boundary. It is not a second ontology binding. |
| **Causal Occurrence** | reality boundary | A bounded event sequence or partial order that actually occurs. |
| **Causal Record** | evidence | An evidence-bearing representation of a Causal Occurrence, including declared omissions and loss. |
| **Episode** | KFD-7 ontology binding | An independently addressable, replayable object that binds a Causal Record to declared cuts, perspective, and loss. It is not merely a session, run, transcript, or reinforcement-learning trajectory. |
| **Causal Experience** | evidence corpus | One or more Episodes used as evidence or learning material. It is not reality itself. |
| **Action Responsibility Geometry** | KFD-7 action model | The cross-domain responsibility model whose coordinates are direction, perspective, and bounded authority. Geometry does not imply Euclidean space, physical motion, a metric, or a differentiable manifold. |
| **Action Coordinate** | KFD-7 role | One independently addressable coordinate in the Action Responsibility Geometry. |
| **Atlas** | KFD-8 perspective coordinate | The independently addressable perspective coordinate: accepted facts, observation boundary, cut, freshness, omissions, conflict, and loss. |
| **Pursuit** | KFD-9 direction coordinate | The independently addressable direction coordinate: continuing intended change, progress relation, lineage, and settlement. |
| **Warrant** | KFD-10 authority coordinate | The independently addressable bounded-authority coordinate: which transition may be performed, by whom, under which constraints, and until when. It is not legal authority by definition. |
| **Domain Profile** | adopter model | A versioned declaration of how one domain binds its representations to the Fact-Episode Ontology and Action Responsibility Geometry. |
| **Domain Profile Declaration** | machine artifact | A document conforming to `schemas/kfd-7/domain-profile.schema.json`. |
| **Claim** | KFD-11 consequential settlement | An exact, bounded proposition made by a declared participant against inspectable Fact and evidence cuts. Evidence and occurrence do not state their own Claim. |
| **Assessment** | KFD-11 consequential settlement | A purpose-bound trust judgment over a Claim and checked evidence boundary. It is revisable and does not grant authority to decide. |
| **Decision** | KFD-11 consequential settlement | An authorized disposition of assessed Claims under an exact Warrant and policy. It requests effects but does not prove they were admitted. |
| **Admission** | KFD-11 consequential settlement | The independently recorded result of presenting a requested transition to the owning state authority. Only successful Admission may publish the corresponding successor Fact cut. |
| **Software Work Responsibility Lifecycle** | KFD-12 domain application | The software-development sequence that keeps Initiative, Assignment, Episode, Claim, Assessment, Decision, Admission, and continuation independently inspectable. It is not a universal cross-domain workflow. |
| **Initiative** | KFD-12 software-domain work context | An independently addressable context for continuing coordinated work that preserves coordination purpose, scope, participants, relevant Pursuits, Assignment relations, lineage, and settlement state without redefining Pursuit direction. |
| **Assignment** | KFD-12 software-domain bounded responsibility | An independently addressable responsibility proposed to, accepted by, or held by a participant, binding accepted responsibility, Initiative, Pursuit, Atlas, Warrant, evidence obligations, settlement policy, and lineage. It does not duplicate Pursuit direction or authority. |
| **Project Cut** | KFD-13 software-project settlement | A verifiable project-level binding among independently authoritative source, Atlas, Episode, policy, omission, and risk coordinates. It is not another fact engine or a mandatory object in other domains. |
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

software-development Domain Profile
  -> Initiative + Assignment + Episode
  -> Claim + Assessment + Decision + Continuation
  -> Software Work Responsibility Lifecycle
  -> optional Project Cut settlement
```

The relationships are directional. A Fact is not reality itself; a Fact Cut
is not a second ontology binding; a record is not the occurrence itself; an
Episode is not every possible record; a corpus of Episodes is not a complete
account of reality. Atlas, Pursuit, and Warrant constrain action at a cut.
Episode preserves what occurred between cuts.

## Usage discipline

Public prose may use a shorter name after the first qualified use within the
same document. Machine surfaces do not shorten canonical IDs or field names.
When an external field already uses the same word differently, KFD text states
the KFD meaning before making comparisons.

Terminology changes are contract changes. Before stable, they replace the
current vocabulary atomically across all active surfaces. After stable, they
follow the KFD-1 compatibility boundary declared by the affected interface.
