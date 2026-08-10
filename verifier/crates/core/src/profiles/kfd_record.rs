// SPDX-License-Identifier: Apache-2.0

use crate::schema;
use crate::{parse_strict_json, VerificationBundle, VerificationReport};
use serde_json::Value;
use std::collections::BTreeSet;

fn string_set(value: Option<&Value>) -> BTreeSet<String> {
    value
        .and_then(Value::as_array)
        .into_iter()
        .flat_map(|items| items.iter())
        .filter_map(Value::as_str)
        .map(str::to_owned)
        .collect()
}

fn verify_kfd4(value: &Value, report: &mut VerificationReport) {
    if value.pointer("/absoluteContext").and_then(Value::as_bool) != Some(false) {
        report.issue(
            "kfd4-absolute-context",
            "/absoluteContext",
            "a perspective-bearing view must not claim absolute context",
        );
    }

    let expected = ["I8", "I9", "I10", "I11", "I12"]
        .into_iter()
        .map(str::to_owned)
        .collect::<BTreeSet<_>>();
    if string_set(value.pointer("/invariants")) != expected {
        report.issue(
            "kfd4-invariants-undeclared",
            "/invariants",
            "the witness must declare the complete I8-I12 invariant set",
        );
    }

    let preserved = string_set(value.pointer("/transformation/preserved"));
    let changed = string_set(value.pointer("/transformation/changed"));
    for field in [
        "observer",
        "factCutRoot",
        "sourceRoot",
        "authorityRoot",
        "causalOrder",
    ] {
        let source_path = format!("/sourceFrame/{field}");
        let target_path = format!("/targetFrame/{field}");
        let differs = value.pointer(&source_path) != value.pointer(&target_path);
        if preserved.contains(field) && differs {
            report.issue(
                "kfd4-invariant-mismatch",
                &target_path,
                format!("declared invariant {field} changed across the transformation"),
            );
        }
        if differs && !changed.contains(field) {
            report.issue(
                "kfd4-silent-frame-mutation",
                &target_path,
                format!("changed frame field {field} is not declared by the transformation"),
            );
        }
        if preserved.contains(field) && changed.contains(field) {
            report.issue(
                "kfd4-silent-frame-mutation",
                "/transformation",
                format!("frame field {field} cannot be both preserved and changed"),
            );
        }
    }

    let contradiction = value
        .pointer("/transformation/contradictionDeclared")
        .and_then(Value::as_bool)
        .unwrap_or(false);
    if !contradiction {
        let source_edges = value
            .pointer("/sourceFrame/causalOrder")
            .and_then(Value::as_array)
            .into_iter()
            .flat_map(|items| items.iter());
        let target_edges = value
            .pointer("/targetFrame/causalOrder")
            .and_then(Value::as_array)
            .into_iter()
            .flat_map(|items| items.iter())
            .collect::<Vec<_>>();
        for edge in source_edges {
            let before = edge.get("before");
            let after = edge.get("after");
            if target_edges.iter().any(|candidate| {
                candidate.get("before") == after && candidate.get("after") == before
            }) {
                report.issue(
                    "kfd4-causal-reversal",
                    "/targetFrame/causalOrder",
                    "a preserved causal edge was reversed without a declared contradiction",
                );
            }
        }
    }
}

fn verify_kfd8(value: &Value, report: &mut VerificationReport) {
    let identity_root = value.pointer("/identity/root").and_then(Value::as_str);
    let current_root = value
        .pointer("/currentReference/pointsToRoot")
        .and_then(Value::as_str);
    if identity_root != current_root {
        report.issue(
            "kfd8-current-reference-mismatch",
            "/currentReference/pointsToRoot",
            "the moving current reference must point to the immutable coordinate root",
        );
    }

    let predecessors = string_set(value.pointer("/lineage/predecessorRoots"));
    let preserved = string_set(value.pointer("/lineage/preservedRoots"));
    let prior = string_set(value.pointer("/currentReference/priorRoots"));
    for root in &predecessors {
        if !prior.contains(root) || !preserved.contains(root) {
            report.issue(
                "kfd8-current-reference-rewrite",
                "/currentReference/priorRoots",
                format!("predecessor coordinate {root} must remain retained and inspectable"),
            );
        }
    }

    let fact_cut = value.pointer("/factCut/root").and_then(Value::as_str);
    let sources = value
        .pointer("/sources")
        .and_then(Value::as_array)
        .map(Vec::as_slice)
        .unwrap_or(&[]);
    if fact_cut.is_none()
        || sources.is_empty()
        || sources.iter().any(|source| {
            source.get("factCutRoot").and_then(Value::as_str) != fact_cut
                || source.get("authority").and_then(Value::as_str).is_none()
        })
    {
        report.issue(
            "kfd8-fact-cut-unbound",
            "/sources",
            "every admitted source must retain authority and bind the declared Fact cut",
        );
    }

    for field in ["pursuit", "warrant", "completeness", "currentValidity"] {
        let path = format!("/semanticInferences/{field}");
        if value.pointer(&path).and_then(Value::as_bool) != Some(false) {
            report.issue(
                "kfd8-semantic-inference",
                &path,
                format!("visible Atlas payload must not infer {field}"),
            );
        }
    }

    let stale = value.pointer("/state/stale").and_then(Value::as_bool);
    let freshness = value.pointer("/freshness/state").and_then(Value::as_str);
    let degraded = value.pointer("/state/degraded").and_then(Value::as_bool);
    let conflicted = value.pointer("/state/conflicted").and_then(Value::as_bool);
    let loss_empty = value
        .pointer("/loss")
        .and_then(Value::as_array)
        .map(|items| items.is_empty())
        .unwrap_or(true);
    let unknowns_empty = value
        .pointer("/scope/unknowns")
        .and_then(Value::as_array)
        .map(|items| items.is_empty())
        .unwrap_or(true);
    if (stale == Some(true)) != (freshness == Some("stale"))
        || (degraded == Some(true) && loss_empty)
        || (conflicted == Some(true) && unknowns_empty)
    {
        report.issue(
            "kfd8-declared-state-inconsistent",
            "/state",
            "stale, degraded, and conflicted states must remain visible with matching freshness, loss, and unknowns",
        );
    }
}

fn verify_profile_semantics(value: &Value, report: &mut VerificationReport) -> bool {
    match value.get("contract").and_then(Value::as_str) {
        Some("kfd-4-conformance-witness") => {
            verify_kfd4(value, report);
            true
        }
        Some("kfd-8-atlas-coordinate") => {
            verify_kfd8(value, report);
            true
        }
        _ => false,
    }
}

pub fn verify(bundle: &VerificationBundle) -> VerificationReport {
    let value = match parse_strict_json(&bundle.primary) {
        Ok(value) => value,
        Err(error) => {
            let mut report = VerificationReport::new("kfd-record/unknown");
            report.issue("json-invalid", "/", error);
            return report.finish();
        }
    };
    let selected = if let Some(source) = bundle.artifacts.get("schema.json") {
        match parse_strict_json(source) {
            Ok(schema) => {
                let id = schema
                    .get("$id")
                    .and_then(serde_json::Value::as_str)
                    .unwrap_or("explicit-schema")
                    .to_owned();
                Some((id, schema))
            }
            Err(error) => {
                let mut report = VerificationReport::new("kfd-record/unknown");
                report.issue("schema-invalid", "/schema", error);
                return report.finish();
            }
        }
    } else {
        schema::schema_for_record(&value)
    };
    let Some((profile, selected_schema)) = selected else {
        let mut report = VerificationReport::new("kfd-record/unknown");
        report.issue(
            "schema-unknown",
            "/$schema",
            "record does not select a packaged KFD schema",
        );
        return report.finish();
    };
    let mut report = VerificationReport::new(profile);
    let issues = schema::validate(&value, &selected_schema);
    report.check("json-schema", issues.is_empty());
    report.issues.extend(issues);
    let issue_count = report.issues.len();
    if verify_profile_semantics(&value, &mut report) {
        report.check("profile-semantics", issue_count == report.issues.len());
    }
    report.finish()
}
