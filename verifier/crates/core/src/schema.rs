// SPDX-License-Identifier: Apache-2.0

use crate::Issue;
use regex::Regex;
use serde_json::Value;
use std::collections::{BTreeMap, BTreeSet};

const SCHEMAS: &[(&str, &str)] = &[
    (
        "schemas/kfd-verification-bundle.schema.json",
        include_str!("../../../../schemas/kfd-verification-bundle.schema.json"),
    ),
    (
        "schemas/kfd-verification-report.schema.json",
        include_str!("../../../../schemas/kfd-verification-report.schema.json"),
    ),
    (
        "schemas/kfd-agent-runtime/manifest.schema.json",
        include_str!("../../../../schemas/kfd-agent-runtime/manifest.schema.json"),
    ),
    (
        "schemas/kfd-agent-runtime/adapter-request.schema.json",
        include_str!("../../../../schemas/kfd-agent-runtime/adapter-request.schema.json"),
    ),
    (
        "schemas/kfd-agent-runtime/adapter-response.schema.json",
        include_str!("../../../../schemas/kfd-agent-runtime/adapter-response.schema.json"),
    ),
    (
        "schemas/kfd-agent-runtime/suite.schema.json",
        include_str!("../../../../schemas/kfd-agent-runtime/suite.schema.json"),
    ),
    (
        "schemas/kfd-agent-runtime/report.schema.json",
        include_str!("../../../../schemas/kfd-agent-runtime/report.schema.json"),
    ),
    (
        "schemas/kfd-standards.schema.json",
        include_str!("../../../../schemas/kfd-standards.schema.json"),
    ),
    (
        "schemas/kfd-terminology.schema.json",
        include_str!("../../../../schemas/kfd-terminology.schema.json"),
    ),
    (
        "schemas/kfd-live-case-registry.schema.json",
        include_str!("../../../../schemas/kfd-live-case-registry.schema.json"),
    ),
    (
        "schemas/kfd-1/contract-world.schema.json",
        include_str!("../../../../schemas/kfd-1/contract-world.schema.json"),
    ),
    (
        "schemas/kfd-1/witness.schema.json",
        include_str!("../../../../schemas/kfd-1/witness.schema.json"),
    ),
    (
        "schemas/kfd-1/publication-url-semantics.schema.json",
        include_str!("../../../../schemas/kfd-1/publication-url-semantics.schema.json"),
    ),
    (
        "schemas/kfd-2/trust-taxonomy.schema.json",
        include_str!("../../../../schemas/kfd-2/trust-taxonomy.schema.json"),
    ),
    (
        "schemas/kfd-2/release-claims.schema.json",
        include_str!("../../../../schemas/kfd-2/release-claims.schema.json"),
    ),
    (
        "schemas/kfd-2/release-trust-passport.schema.json",
        include_str!("../../../../schemas/kfd-2/release-trust-passport.schema.json"),
    ),
    (
        "schemas/kfd-2/trust-claims.schema.json",
        include_str!("../../../../schemas/kfd-2/trust-claims.schema.json"),
    ),
    (
        "schemas/kfd-2/trust-assessment.schema.json",
        include_str!("../../../../schemas/kfd-2/trust-assessment.schema.json"),
    ),
    (
        "schemas/kfd-3/collaboration-interface.schema.json",
        include_str!("../../../../schemas/kfd-3/collaboration-interface.schema.json"),
    ),
    (
        "schemas/kfd-3/witness.schema.json",
        include_str!("../../../../schemas/kfd-3/witness.schema.json"),
    ),
    (
        "schemas/kfd-4/observer-perspective.schema.json",
        include_str!("../../../../schemas/kfd-4/observer-perspective.schema.json"),
    ),
    (
        "schemas/kfd-4/perspective-replay.schema.json",
        include_str!("../../../../schemas/kfd-4/perspective-replay.schema.json"),
    ),
    (
        "schemas/kfd-4/conformance-witness.schema.json",
        include_str!("../../../../schemas/kfd-4/conformance-witness.schema.json"),
    ),
    (
        "schemas/kfd-5/primitive-discovery.schema.json",
        include_str!("../../../../schemas/kfd-5/primitive-discovery.schema.json"),
    ),
    (
        "schemas/kfd-6/autonomous-discovery-loop.schema.json",
        include_str!("../../../../schemas/kfd-6/autonomous-discovery-loop.schema.json"),
    ),
    (
        "schemas/kfd-7/domain-profile.schema.json",
        include_str!("../../../../schemas/kfd-7/domain-profile.schema.json"),
    ),
    (
        "schemas/kfd-8/atlas-coordinate.schema.json",
        include_str!("../../../../schemas/kfd-8/atlas-coordinate.schema.json"),
    ),
    (
        "schemas/kfd-11/decision-admission.schema.json",
        include_str!("../../../../schemas/kfd-11/decision-admission.schema.json"),
    ),
    (
        "schemas/kfd-11/adopter-witness.schema.json",
        include_str!("../../../../schemas/kfd-11/adopter-witness.schema.json"),
    ),
    (
        "schemas/kfd-12/adopter-witness.schema.json",
        include_str!("../../../../schemas/kfd-12/adopter-witness.schema.json"),
    ),
    (
        "schemas/kfd-13/adopter-witness.schema.json",
        include_str!("../../../../schemas/kfd-13/adopter-witness.schema.json"),
    ),
    (
        "schemas/kfd-activation/contracts-manifest.schema.json",
        include_str!("../../../../schemas/kfd-activation/contracts-manifest.schema.json"),
    ),
    (
        "schemas/kfd-activation/qualification-report.schema.json",
        include_str!("../../../../schemas/kfd-activation/qualification-report.schema.json"),
    ),
    (
        "schemas/kfd-activation/activation-record.schema.json",
        include_str!("../../../../schemas/kfd-activation/activation-record.schema.json"),
    ),
];

fn schema_documents() -> BTreeMap<String, Value> {
    let mut documents = BTreeMap::new();
    for (path, text) in SCHEMAS {
        let value: Value = serde_json::from_str(text).expect("packaged KFD schema must parse");
        documents.insert((*path).to_owned(), value.clone());
        if let Some(id) = value.get("$id").and_then(Value::as_str) {
            documents.insert(id.to_owned(), value);
        }
    }
    documents
}

pub fn schema_for_record(record: &Value) -> Option<(String, Value)> {
    let documents = schema_documents();
    if let Some(id) = record.get("$schema").and_then(Value::as_str) {
        if let Some(schema) = documents.get(id) {
            return Some((id.to_owned(), schema.clone()));
        }
    }
    let contract = record.get("contract").and_then(Value::as_str)?;
    let path = match contract {
        "kfd.verification-bundle/v1" => "schemas/kfd-verification-bundle.schema.json",
        "kfd.verification-report/v1" => "schemas/kfd-verification-report.schema.json",
        "kfd.agent-runtime-suite-manifest/v1" => "schemas/kfd-agent-runtime/manifest.schema.json",
        "kfd.agent-runtime-vector-registry/v1" => "schemas/kfd-agent-runtime/suite.schema.json",
        "kfd.agent-runtime-adapter-request/v1" => {
            "schemas/kfd-agent-runtime/adapter-request.schema.json"
        }
        "kfd.agent-runtime-adapter-response/v1" => {
            "schemas/kfd-agent-runtime/adapter-response.schema.json"
        }
        "kfd.agent-runtime-report/v1" => "schemas/kfd-agent-runtime/report.schema.json",
        "kfd-standards-metadata" => "schemas/kfd-standards.schema.json",
        "kfd-terminology" => "schemas/kfd-terminology.schema.json",
        "kfd-live-case-registry" => "schemas/kfd-live-case-registry.schema.json",
        "kfd-1-contract-world" => "schemas/kfd-1/contract-world.schema.json",
        "kfd-1-witness" => "schemas/kfd-1/witness.schema.json",
        "kfd-1-publication-url-semantics" => "schemas/kfd-1/publication-url-semantics.schema.json",
        "kfd-2-trust-claims" => "schemas/kfd-2/trust-claims.schema.json",
        "kfd-2-trust-assessment" => "schemas/kfd-2/trust-assessment.schema.json",
        "kfd-2-release-claims" => "schemas/kfd-2/release-claims.schema.json",
        "kfd-2-release-trust-passport" => "schemas/kfd-2/release-trust-passport.schema.json",
        "kfd-3-collaboration-interface" => "schemas/kfd-3/collaboration-interface.schema.json",
        "kfd-3-witness" => "schemas/kfd-3/witness.schema.json",
        "kfd-4-observer-perspective" => "schemas/kfd-4/observer-perspective.schema.json",
        "kfd-4-perspective-replay" => "schemas/kfd-4/perspective-replay.schema.json",
        "kfd-4-conformance-witness" => "schemas/kfd-4/conformance-witness.schema.json",
        "kfd-5-primitive-discovery" => "schemas/kfd-5/primitive-discovery.schema.json",
        "kfd-6-autonomous-discovery-loop" => "schemas/kfd-6/autonomous-discovery-loop.schema.json",
        "kfd-7-domain-profile" => "schemas/kfd-7/domain-profile.schema.json",
        "kfd-8-atlas-coordinate" => "schemas/kfd-8/atlas-coordinate.schema.json",
        "kfd-11-decision-admission" => "schemas/kfd-11/decision-admission.schema.json",
        "kfd-11-adopter-witness" => "schemas/kfd-11/adopter-witness.schema.json",
        "kfd-12-adopter-witness" => "schemas/kfd-12/adopter-witness.schema.json",
        "kfd-13-adopter-witness" => "schemas/kfd-13/adopter-witness.schema.json",
        "kfd-11-13-activation-contracts" => "schemas/kfd-activation/contracts-manifest.schema.json",
        "kfd-11-13-qualification-report" => {
            "schemas/kfd-activation/qualification-report.schema.json"
        }
        "kfd-11-13-activation-record" => "schemas/kfd-activation/activation-record.schema.json",
        _ => return None,
    };
    documents.get(path).cloned().map(|schema| {
        let id = schema
            .get("$id")
            .and_then(Value::as_str)
            .unwrap_or(path)
            .to_owned();
        (id, schema)
    })
}

fn pointer<'a>(document: &'a Value, fragment: &str) -> Option<&'a Value> {
    if fragment.is_empty() || fragment == "#" {
        return Some(document);
    }
    document.pointer(fragment.strip_prefix('#')?)
}

fn resolve_ref<'a>(
    reference: &str,
    root: &'a Value,
    documents: &'a BTreeMap<String, Value>,
) -> Option<(&'a Value, &'a Value)> {
    if reference.starts_with('#') {
        return pointer(root, reference).map(|schema| (schema, root));
    }
    let (base, fragment) = reference
        .split_once('#')
        .map_or((reference, ""), |(base, fragment)| (base, fragment));
    let document = documents.get(base)?;
    let schema = if fragment.is_empty() {
        document
    } else {
        pointer(document, &format!("#{fragment}"))?
    };
    Some((schema, document))
}

fn type_matches(instance: &Value, expected: &str) -> bool {
    match expected {
        "object" => instance.is_object(),
        "array" => instance.is_array(),
        "string" => instance.is_string(),
        "integer" => instance.as_i64().is_some() || instance.as_u64().is_some(),
        "number" => instance.is_number(),
        "boolean" => instance.is_boolean(),
        "null" => instance.is_null(),
        _ => false,
    }
}

fn validate_schema_keywords(schema: &Value, path: &str, issues: &mut Vec<Issue>) {
    let Some(object) = schema.as_object() else {
        return;
    };
    const SUPPORTED: &[&str] = &[
        "$defs",
        "$id",
        "$ref",
        "$schema",
        "additionalProperties",
        "allOf",
        "const",
        "contains",
        "default",
        "description",
        "else",
        "enum",
        "format",
        "if",
        "items",
        "maxItems",
        "minItems",
        "minLength",
        "minProperties",
        "minimum",
        "pattern",
        "patternProperties",
        "properties",
        "required",
        "then",
        "title",
        "type",
        "uniqueItems",
        "x-kfd",
    ];
    for keyword in object.keys() {
        if !SUPPORTED.contains(&keyword.as_str()) {
            issues.push(Issue::new(
                "schema-keyword-unsupported",
                format!("{path}/{keyword}"),
                format!("unsupported JSON Schema keyword {keyword}"),
            ));
        }
    }
    for container in ["$defs", "properties", "patternProperties"] {
        for (name, child) in object
            .get(container)
            .and_then(Value::as_object)
            .into_iter()
            .flat_map(|values| values.iter())
        {
            validate_schema_keywords(child, &format!("{path}/{container}/{name}"), issues);
        }
    }
    for child in [
        "additionalProperties",
        "contains",
        "else",
        "if",
        "items",
        "then",
    ] {
        if let Some(value) = object.get(child).filter(|value| value.is_object()) {
            validate_schema_keywords(value, &format!("{path}/{child}"), issues);
        }
    }
    for (index, child) in object
        .get("allOf")
        .and_then(Value::as_array)
        .into_iter()
        .flatten()
        .enumerate()
    {
        validate_schema_keywords(child, &format!("{path}/allOf/{index}"), issues);
    }
}

fn branch_matches(
    instance: &Value,
    schema: &Value,
    root: &Value,
    documents: &BTreeMap<String, Value>,
) -> bool {
    let mut issues = Vec::new();
    validate_node(instance, schema, root, documents, "", &mut issues);
    issues.is_empty()
}

fn validate_node(
    instance: &Value,
    schema: &Value,
    root: &Value,
    documents: &BTreeMap<String, Value>,
    path: &str,
    issues: &mut Vec<Issue>,
) {
    let Some(object) = schema.as_object() else {
        return;
    };

    if let Some(reference) = object.get("$ref").and_then(Value::as_str) {
        match resolve_ref(reference, root, documents) {
            Some((resolved, resolved_root)) => {
                validate_node(instance, resolved, resolved_root, documents, path, issues)
            }
            None => issues.push(Issue::new(
                "schema-ref-unresolved",
                path,
                format!("cannot resolve schema reference {reference}"),
            )),
        }
    }

    if let Some(all_of) = object.get("allOf").and_then(Value::as_array) {
        for branch in all_of {
            validate_node(instance, branch, root, documents, path, issues);
        }
    }
    if let Some(condition) = object.get("if") {
        if branch_matches(instance, condition, root, documents) {
            if let Some(then_schema) = object.get("then") {
                validate_node(instance, then_schema, root, documents, path, issues);
            }
        } else if let Some(else_schema) = object.get("else") {
            validate_node(instance, else_schema, root, documents, path, issues);
        }
    }

    if let Some(expected) = object.get("type").and_then(Value::as_str) {
        if !type_matches(instance, expected) {
            issues.push(Issue::new(
                "schema-type",
                path,
                format!("expected {expected}"),
            ));
            return;
        }
    }
    if let Some(expected) = object.get("const") {
        if instance != expected {
            issues.push(Issue::new(
                "schema-const",
                path,
                "value does not match the schema constant",
            ));
        }
    }
    if let Some(values) = object.get("enum").and_then(Value::as_array) {
        if !values.contains(instance) {
            issues.push(Issue::new(
                "schema-enum",
                path,
                "value is outside the closed schema vocabulary",
            ));
        }
    }

    if let Some(text) = instance.as_str() {
        if let Some(minimum) = object.get("minLength").and_then(Value::as_u64) {
            if text.chars().count() < minimum as usize {
                issues.push(Issue::new(
                    "schema-min-length",
                    path,
                    format!("string must contain at least {minimum} characters"),
                ));
            }
        }
        if let Some(pattern) = object.get("pattern").and_then(Value::as_str) {
            match Regex::new(pattern) {
                Ok(regex) if !regex.is_match(text) => issues.push(Issue::new(
                    "schema-pattern",
                    path,
                    "string does not match the schema pattern",
                )),
                Err(error) => issues.push(Issue::new(
                    "schema-pattern-invalid",
                    path,
                    error.to_string(),
                )),
                _ => {}
            }
        }
        if object.get("format").and_then(Value::as_str) == Some("uri") {
            let uri = Regex::new(r"^[A-Za-z][A-Za-z0-9+.-]*:[^\s]+$").expect("static URI regex");
            if !uri.is_match(text) {
                issues.push(Issue::new(
                    "schema-format-uri",
                    path,
                    "expected an absolute URI",
                ));
            }
        }
    }

    if let Some(number) = instance.as_u64() {
        if let Some(minimum) = object.get("minimum").and_then(Value::as_u64) {
            if number < minimum {
                issues.push(Issue::new(
                    "schema-minimum",
                    path,
                    format!("number must be at least {minimum}"),
                ));
            }
        }
    }

    if let Some(values) = instance.as_array() {
        if let Some(minimum) = object.get("minItems").and_then(Value::as_u64) {
            if values.len() < minimum as usize {
                issues.push(Issue::new(
                    "schema-min-items",
                    path,
                    format!("array must contain at least {minimum} items"),
                ));
            }
        }
        if let Some(maximum) = object.get("maxItems").and_then(Value::as_u64) {
            if values.len() > maximum as usize {
                issues.push(Issue::new(
                    "schema-max-items",
                    path,
                    format!("array must contain at most {maximum} items"),
                ));
            }
        }
        if object.get("uniqueItems").and_then(Value::as_bool) == Some(true) {
            let mut seen = BTreeSet::new();
            for value in values {
                let rendered = serde_json::to_string(value).expect("JSON value");
                if !seen.insert(rendered) {
                    issues.push(Issue::new(
                        "schema-unique-items",
                        path,
                        "array items must be unique",
                    ));
                    break;
                }
            }
        }
        if let Some(contains) = object.get("contains") {
            if !values
                .iter()
                .any(|value| branch_matches(value, contains, root, documents))
            {
                issues.push(Issue::new(
                    "schema-contains",
                    path,
                    "array does not contain a value accepted by the schema",
                ));
            }
        }
        if let Some(item_schema) = object.get("items") {
            for (index, value) in values.iter().enumerate() {
                validate_node(
                    value,
                    item_schema,
                    root,
                    documents,
                    &format!("{path}/{index}"),
                    issues,
                );
            }
        }
    }

    if let Some(values) = instance.as_object() {
        if let Some(minimum) = object.get("minProperties").and_then(Value::as_u64) {
            if values.len() < minimum as usize {
                issues.push(Issue::new(
                    "schema-min-properties",
                    path,
                    format!("object must contain at least {minimum} properties"),
                ));
            }
        }
        if let Some(required) = object.get("required").and_then(Value::as_array) {
            for field in required.iter().filter_map(Value::as_str) {
                if !values.contains_key(field) {
                    issues.push(Issue::new(
                        "schema-required",
                        format!("{path}/{field}"),
                        format!("required field {field} is missing"),
                    ));
                }
            }
        }
        let properties = object
            .get("properties")
            .and_then(Value::as_object)
            .cloned()
            .unwrap_or_default();
        let patterns: Vec<(Regex, &Value)> = object
            .get("patternProperties")
            .and_then(Value::as_object)
            .into_iter()
            .flat_map(|patterns| patterns.iter())
            .filter_map(|(pattern, schema)| Regex::new(pattern).ok().map(|regex| (regex, schema)))
            .collect();
        for (field, value) in values {
            let child_path = format!("{path}/{field}");
            if let Some(property_schema) = properties.get(field) {
                validate_node(value, property_schema, root, documents, &child_path, issues);
                continue;
            }
            let mut matched_pattern = false;
            for (pattern, pattern_schema) in &patterns {
                if pattern.is_match(field) {
                    matched_pattern = true;
                    validate_node(value, pattern_schema, root, documents, &child_path, issues);
                }
            }
            if matched_pattern {
                continue;
            }
            match object.get("additionalProperties") {
                Some(Value::Bool(false)) => issues.push(Issue::new(
                    "schema-additional-property",
                    child_path,
                    "property is not declared by the schema",
                )),
                Some(additional) if additional.is_object() => {
                    validate_node(value, additional, root, documents, &child_path, issues)
                }
                _ => {}
            }
        }
    }
}

pub fn validate(instance: &Value, schema: &Value) -> Vec<Issue> {
    let documents = schema_documents();
    let mut issues = Vec::new();
    validate_schema_keywords(schema, "", &mut issues);
    validate_node(instance, schema, schema, &documents, "", &mut issues);
    issues
}
