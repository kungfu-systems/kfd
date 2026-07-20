// SPDX-License-Identifier: Apache-2.0

use crate::schema;
use crate::{
    parse_strict_json, semantic_root, sha256_bytes, VerificationBundle, VerificationReport,
};
use serde_json::{json, Value};
use std::collections::{BTreeMap, BTreeSet};

const PROFILE_MANIFEST: &str = include_str!("../../../../../profiles/agent-runtime/manifest.json");
const VECTOR_REGISTRY: &str =
    include_str!("../../../../../profiles/agent-runtime/vectors/runtime-100.json");
const REPORT_SCHEMA: &str =
    include_str!("../../../../../schemas/kfd-agent-runtime/report.schema.json");

fn parse_packaged(source: &str, label: &str) -> Value {
    parse_strict_json(source).unwrap_or_else(|error| panic!("packaged {label} must parse: {error}"))
}

fn text<'a>(value: &'a Value, pointer: &str) -> &'a str {
    value.pointer(pointer).and_then(Value::as_str).unwrap_or("")
}

fn number(value: &Value, pointer: &str) -> u64 {
    value.pointer(pointer).and_then(Value::as_u64).unwrap_or(0)
}

fn response_identity_matches(response: &Value, report: &Value) -> bool {
    for field in ["id", "version", "topology"] {
        if response.pointer(&format!("/adapter/{field}"))
            != report.pointer(&format!("/adapter/{field}"))
        {
            return false;
        }
    }
    true
}

pub fn verify(bundle: &VerificationBundle) -> VerificationReport {
    let value = match parse_strict_json(&bundle.primary) {
        Ok(value) => value,
        Err(error) => {
            let mut report = VerificationReport::new("kfd.agent-runtime-report/v1");
            report.issue("json-invalid", "/", error);
            return report.finish();
        }
    };
    let schema_value = parse_packaged(REPORT_SCHEMA, "Agent runtime report schema");
    let manifest = parse_packaged(PROFILE_MANIFEST, "Agent runtime manifest");
    let registry = parse_packaged(VECTOR_REGISTRY, "Agent runtime vector registry");
    let mut report = VerificationReport::new("kfd.agent-runtime-report/v1");

    let schema_issues = schema::validate(&value, &schema_value);
    report.check("report-schema", schema_issues.is_empty());
    report.issues.extend(schema_issues);

    let expected_manifest_digest = sha256_bytes(PROFILE_MANIFEST.as_bytes());
    let expected_vector_root = sha256_bytes(VECTOR_REGISTRY.as_bytes());
    for (pointer, expected, code) in [
        (
            "/profile/id",
            text(&manifest, "/profile/id"),
            "profile-id-mismatch",
        ),
        (
            "/profile/version",
            text(&manifest, "/profile/version"),
            "profile-version-mismatch",
        ),
        (
            "/profile/manifestDigest",
            expected_manifest_digest.as_str(),
            "profile-manifest-digest-mismatch",
        ),
        (
            "/profile/agentHubManifestDigest",
            text(&manifest, "/dependencies/agentHubManifestDigest"),
            "agent-hub-manifest-digest-mismatch",
        ),
        (
            "/suite/id",
            text(&manifest, "/suite/id"),
            "suite-id-mismatch",
        ),
        (
            "/suite/version",
            text(&manifest, "/suite/version"),
            "suite-version-mismatch",
        ),
        (
            "/suite/vectorRoot",
            expected_vector_root.as_str(),
            "suite-vector-root-mismatch",
        ),
    ] {
        if text(&value, pointer) != expected {
            report.issue(code, pointer, format!("expected {expected}"));
        }
    }
    if text(&manifest, "/suite/vectorRoot") != expected_vector_root {
        report.issue(
            "packaged-suite-root-drift",
            "/suite/vectorRoot",
            "packaged manifest does not bind the packaged vector registry",
        );
    }
    if number(&value, "/suite/vectorCount") != 100 {
        report.issue(
            "suite-vector-count",
            "/suite/vectorCount",
            "KFD Runtime 100 requires exactly 100 vectors",
        );
    }
    report.check(
        "profile-and-suite-roots",
        !report.issues.iter().any(|issue| {
            issue.code.contains("mismatch") || issue.code == "packaged-suite-root-drift"
        }),
    );

    let vectors = registry
        .get("vectors")
        .and_then(Value::as_array)
        .cloned()
        .unwrap_or_default();
    let results = value
        .get("results")
        .and_then(Value::as_array)
        .cloned()
        .unwrap_or_default();
    let mut expected_by_id = BTreeMap::new();
    for vector in &vectors {
        if let Some(id) = vector.get("id").and_then(Value::as_str) {
            expected_by_id.insert(id.to_owned(), vector);
        }
    }
    let mut seen = BTreeSet::new();
    let mut responses_by_id = BTreeMap::new();
    let mut passing_by_partition: BTreeMap<&str, u64> = BTreeMap::new();
    let mut totals_by_partition: BTreeMap<&str, u64> = BTreeMap::new();
    for (index, result) in results.iter().enumerate() {
        let path = format!("/results/{index}");
        let id = result.get("id").and_then(Value::as_str).unwrap_or("");
        if !seen.insert(id.to_owned()) {
            report.issue(
                "suite-result-duplicate",
                format!("{path}/id"),
                format!("duplicate result {id}"),
            );
            continue;
        }
        let Some(vector) = expected_by_id.get(id) else {
            report.issue(
                "suite-result-unknown",
                format!("{path}/id"),
                format!("unknown vector {id}"),
            );
            continue;
        };
        if result.get("partition") != vector.get("partition") {
            report.issue(
                "suite-partition-widening",
                format!("{path}/partition"),
                "result partition differs from the fixed vector",
            );
        }
        if result.get("category") != vector.get("category") {
            report.issue(
                "suite-category-mismatch",
                format!("{path}/category"),
                "result category differs from the fixed vector",
            );
        }
        if result.get("expected") != vector.get("expect") {
            report.issue(
                "suite-expectation-drift",
                format!("{path}/expected"),
                "report expectation differs from the fixed vector",
            );
        }
        if result.get("actual") != result.get("expected") {
            report.issue(
                "suite-outcome-mismatch",
                format!("{path}/actual"),
                "adapter outcome differs from the fixed expectation",
            );
        }
        if result.get("status").and_then(Value::as_str) != Some("pass") {
            report.issue(
                "suite-result-failed",
                format!("{path}/status"),
                "fixed vector did not pass",
            );
        }
        let response = result.get("response").cloned().unwrap_or(Value::Null);
        if response.get("requestId").and_then(Value::as_str) != Some(id)
            || response.get("status") != result.pointer("/actual/status")
            || response.get("code") != result.pointer("/actual/code")
        {
            report.issue(
                "adapter-response-mismatch",
                format!("{path}/response"),
                "adapter response does not bind the result identity and outcome",
            );
        }
        if !response_identity_matches(&response, &value) {
            report.issue(
                "adapter-identity-mismatch",
                format!("{path}/response/adapter"),
                "response adapter identity differs from the report adapter",
            );
        }
        match semantic_root(&response) {
            Ok(root) if result.get("responseRoot").and_then(Value::as_str) == Some(&root) => {}
            Ok(_) => report.issue(
                "adapter-response-root-mismatch",
                format!("{path}/responseRoot"),
                "response root does not match canonical response bytes",
            ),
            Err(error) => report.issue(
                "adapter-response-noncanonical",
                format!("{path}/response"),
                error,
            ),
        }
        responses_by_id.insert(id.to_owned(), response);
        let partition = result
            .get("partition")
            .and_then(Value::as_str)
            .unwrap_or("");
        *totals_by_partition.entry(partition).or_default() += 1;
        if result.get("status").and_then(Value::as_str) == Some("pass") {
            *passing_by_partition.entry(partition).or_default() += 1;
        }
    }
    if seen.len() != 100 || expected_by_id.keys().any(|id| !seen.contains(id)) {
        report.issue(
            "suite-result-closure",
            "/results",
            "report must contain each fixed vector exactly once",
        );
    }
    report.check(
        "fixed-vector-closure",
        !report.issues.iter().any(|issue| {
            issue.code.starts_with("suite-")
                || issue.code.starts_with("adapter-response")
                || issue.code == "adapter-identity-mismatch"
        }),
    );

    let handshake = value
        .pointer("/adapter/handshake")
        .cloned()
        .unwrap_or(Value::Null);
    if handshake.get("requestId").and_then(Value::as_str) != Some("handshake")
        || handshake.get("status").and_then(Value::as_str) != Some("accepted")
        || handshake.get("code").and_then(Value::as_str) != Some("adapter-ready")
        || !response_identity_matches(&handshake, &value)
    {
        report.issue(
            "adapter-handshake-invalid",
            "/adapter/handshake",
            "handshake must accept the exact report adapter identity",
        );
    }
    match semantic_root(&handshake) {
        Ok(root) if text(&value, "/adapter/handshakeRoot") == root => {}
        Ok(_) => report.issue(
            "adapter-handshake-root-mismatch",
            "/adapter/handshakeRoot",
            "handshake root does not match canonical handshake bytes",
        ),
        Err(error) => report.issue(
            "adapter-handshake-noncanonical",
            "/adapter/handshake",
            error,
        ),
    }
    if let Some(commit) = value
        .pointer("/adapter/sourceCommit")
        .and_then(Value::as_str)
    {
        let mut characters = commit.chars();
        if let Some(first) = characters.next() {
            if characters.all(|character| character == first) {
                report.issue(
                    "adapter-source-commit-placeholder",
                    "/adapter/sourceCommit",
                    "source commit cannot be a repeated-character placeholder",
                );
            }
        }
    }

    match semantic_root(value.get("results").unwrap_or(&Value::Null)) {
        Ok(root) if text(&value, "/execution/resultRoot") == root => {}
        Ok(_) => report.issue(
            "suite-result-root-mismatch",
            "/execution/resultRoot",
            "result root does not match canonical result entries",
        ),
        Err(error) => report.issue("suite-results-noncanonical", "/results", error),
    }

    let handshake_request = json!({
        "schemaVersion": 1,
        "contract": "kfd.agent-runtime-adapter-request/v1",
        "requestId": "handshake",
        "operation": "handshake",
        "input": {
            "profile": format!("{}@{}", text(&manifest, "/profile/id"), text(&manifest, "/profile/version")),
            "suiteRoot": expected_vector_root,
        }
    });
    let mut transcript = vec![json!({
        "request": handshake_request,
        "response": handshake,
    })];
    for vector in &vectors {
        let id = vector.get("id").and_then(Value::as_str).unwrap_or("");
        transcript.push(json!({
            "request": {
                "schemaVersion": 1,
                "contract": "kfd.agent-runtime-adapter-request/v1",
                "requestId": id,
                "operation": "evaluate",
                "input": {
                    "category": vector.get("category").cloned().unwrap_or(Value::Null),
                    "operation": vector.pointer("/request/operation").cloned().unwrap_or(Value::Null),
                    "input": vector.pointer("/request/input").cloned().unwrap_or(Value::Null),
                }
            },
            "response": responses_by_id.get(id).cloned().unwrap_or(Value::Null),
        }));
    }
    match semantic_root(&Value::Array(transcript)) {
        Ok(root) if text(&value, "/execution/transcriptRoot") == root => {}
        Ok(_) => report.issue(
            "suite-transcript-root-mismatch",
            "/execution/transcriptRoot",
            "transcript root does not match fixed requests and retained responses",
        ),
        Err(error) => report.issue("suite-transcript-noncanonical", "/execution", error),
    }

    for (partition, expected_total) in [("core", 35_u64), ("experimental", 65_u64)] {
        let pointer = format!("/partitions/{partition}");
        let total = *totals_by_partition.get(partition).unwrap_or(&0);
        let passed = *passing_by_partition.get(partition).unwrap_or(&0);
        if total != expected_total
            || number(&value, &format!("{pointer}/total")) != expected_total
            || number(&value, &format!("{pointer}/passed")) != expected_total
            || number(&value, &format!("{pointer}/failed")) != 0
            || text(&value, &format!("{pointer}/status")) != "pass"
            || passed != expected_total
        {
            report.issue(
                "suite-partition-summary-mismatch",
                pointer,
                format!("{partition} must report {expected_total}/{expected_total} passing"),
            );
        }
    }
    if value.get("valid").and_then(Value::as_bool) != Some(true) {
        report.issue(
            "suite-report-not-passing",
            "/valid",
            "a conforming report must retain valid=true",
        );
    }
    if text(&value, "/execution/startedAt") > text(&value, "/execution/finishedAt") {
        report.issue(
            "suite-time-order",
            "/execution",
            "finishedAt precedes startedAt",
        );
    }
    report.check(
        "offline-nonqualifying",
        value.pointer("/execution/offline").and_then(Value::as_bool) == Some(true)
            && value.get("qualifying").and_then(Value::as_bool) == Some(false)
            && value.get("selfCertified").and_then(Value::as_bool) == Some(false),
    );
    report.check(
        "root-and-partition-closure",
        !report.issues.iter().any(|issue| {
            issue.code.contains("root-mismatch")
                || issue.code == "suite-partition-summary-mismatch"
                || issue.code == "suite-report-not-passing"
        }),
    );
    report.finish()
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::BTreeMap;

    const VALID_REPORT: &str =
        include_str!("../../../../fixtures/agent-runtime/valid-state-machine-report.json");

    fn bundle(primary: String) -> VerificationBundle {
        VerificationBundle {
            schema_version: 1,
            contract: "kfd.verification-bundle/v1".to_owned(),
            kind: "agent-runtime-report".to_owned(),
            primary,
            artifacts: BTreeMap::new(),
        }
    }

    #[test]
    fn retained_runtime_report_verifies_and_root_mutation_fails_closed() {
        assert!(verify(&bundle(VALID_REPORT.to_owned())).valid);

        let mut mutated: Value = serde_json::from_str(VALID_REPORT).unwrap();
        mutated["profile"]["manifestDigest"] = Value::String(format!("sha256:{}", "a".repeat(64)));
        let report = verify(&bundle(serde_json::to_string(&mutated).unwrap()));
        assert!(!report.valid);
        assert!(report
            .issues
            .iter()
            .any(|issue| issue.code == "profile-manifest-digest-mismatch"));
    }
}
