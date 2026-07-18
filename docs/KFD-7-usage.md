# KFD-7 Implementation Notes

[Authoritative decision](../decisions/KFD-7.md) ·
[Formal reference](KFD-7-formal.md) ·
[Documentation map](MAP.md)

KFD-7 publishes a draft reference contract for products that represent
consequential action. The decision owns responsibility separation and evidence
obligations. A product Profile owns its physical implementation and versioned
lifecycle vocabulary.

## Package surface

- `decisions/KFD-7.md`: authoritative draft principle and activation gate.
- `docs/KFD-7-formal.md`: non-normative formal reference.
- `schemas/kfd-7/action-contract.schema.json`: version 1 Profile declaration.
- `verifier/fixtures/kfd-7/`: one valid declaration and fail-visible negative
  declarations.
- `standards.json#/standards/kfd-7`: identities, concepts, and interface metadata.

## What a Profile declares

A Profile starts with an implementation coordinate and qualification state:

```json
{
  "$schema": "https://kfd.libkungfu.dev/schemas/kfd-7/action-contract.schema.json",
  "schemaVersion": 1,
  "contract": "kfd-7-action-contract",
  "standard": "kfd-7",
  "profile": {
    "id": "example-action-profile",
    "version": "0.1.0",
    "product": "example",
    "implementation": "git+https://example.invalid/repo@0123456",
    "qualificationStatus": "provisional"
  }
}
```

It then declares the five reference roles, Profile-owned lifecycle terms,
supported transitions, prohibited inferences, evidence obligations, non-claims,
extensions, and activation state. The complete positive fixture is
`verifier/fixtures/kfd-7/valid-action-contract.json`.

## Responsibility mapping

Products may use domain language, but every role declaration answers:

- which identity and source authority carry the role;
- which responsibility the role owns;
- which lifecycle terms the Profile uses;
- which evidence is required;
- what the role explicitly does not imply.

One physical record may project several roles when the mapping remains
inspectable and deletion/fusion evidence shows that decisions are preserved.
Do not create duplicate stores merely to match the schema.

## Transition records

Each supported transition declares:

```text
subject role + Profile operation + from/to terms
preconditions + effect + receipt + evidence
denial reasons + residual risks
```

`from` and `to` are Profile vocabulary. Their strings do not become KFD enums.
Unknown operations, missing authority, stale Atlas bindings, invalid Warrant
derivation, or absent evidence must return a structured denial or unsupported
result.

## Evidence statuses

The version 1 schema recognizes:

```text
planned | passed | failed | not-applicable
```

`passed` binds at least one retained artifact. `failed` retains the failure and
residual risk. `not-applicable` requires a bounded reason. `planned` cannot
support activation.

The activation section uses:

```text
pending | activate | revise | reject
```

Only `activate` may pair with a `qualified` Profile, and it requires an exact
evidence cut, independent review, product witnesses, and no planned or failed
obligations. Repository validation proves declaration closure only; the parent
qualification process owns the real verdict.

## Extension boundary

Use `extensions[]` for Profile-owned roles, state terms, relations, or evidence
categories. Every extension declares its owner, version, mapping to KFD-7, and
compatibility rule. Do not add a KFD-owned enum merely because one product needs
it.

## Independent verification

The native and WebAssembly verifier projections package the same KFD-7 schema:

```bash
npx @kungfu-tech/kfd verify kfd-record \
  verifier/fixtures/kfd-7/valid-action-contract.json
```

The verifier rejects missing roles, unknown closed-vocabulary values, incomplete
transition evidence, activation without qualification, and undeclared fields.
It remains offline, non-qualifying, and non-self-certified.

## Activation remains external to schema validity

A conforming draft declaration may still be wrong, burdensome, incomplete, or
specific to one product. Activation additionally requires retained runtime
evidence, migration and deletion experiments, independent review, release
evidence, and an explicit `activate`, `revise`, or `reject` verdict.
