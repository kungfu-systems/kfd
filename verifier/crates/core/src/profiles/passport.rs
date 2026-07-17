// SPDX-License-Identifier: Apache-2.0

use crate::{parse_strict_json, VerificationBundle, VerificationReport};
use serde_json::Value;
use std::collections::BTreeMap;

const PASSPORT: &str = "kungfu-buildchain-release-passport";
const ARTIFACT_EVIDENCE: &str = "kungfu-buildchain-artifact-evidence";
const IMPACT: &str = "kungfu-buildchain-impact";
const AGENT_INDEX: &str = "kungfu-buildchain-agent-index";
const PRODUCT_MECHANISM: &str = "kungfu-buildchain-product-mechanism";

fn parse_sibling(
    bundle: &VerificationBundle,
    path: &str,
    expected_contract: &str,
    report: &mut VerificationReport,
) -> Option<Value> {
    let Some(source) = bundle.artifacts.get(path) else {
        report.issue(
            "passport-sibling-missing",
            format!("/artifacts/{path}"),
            format!("required local passport sibling {path} is missing"),
        );
        return None;
    };
    match parse_strict_json(source) {
        Ok(value)
            if value.get("schemaVersion").and_then(Value::as_u64) == Some(1)
                && value.get("contract").and_then(Value::as_str) == Some(expected_contract) =>
        {
            Some(value)
        }
        Ok(_) => {
            report.issue(
                "passport-sibling-contract",
                format!("/artifacts/{path}"),
                format!("{path} does not use {expected_contract} v1"),
            );
            None
        }
        Err(error) => {
            report.issue("json-invalid", format!("/artifacts/{path}"), error);
            None
        }
    }
}

fn digest(entry: &Value) -> Option<String> {
    if let Some(value) = entry.get("digest").and_then(Value::as_str) {
        return Some(value.to_owned());
    }
    entry
        .get("sha256")
        .and_then(Value::as_str)
        .map(|value| format!("sha256:{value}"))
}

fn impact_rank(value: &str) -> u8 {
    match value {
        "patch" => 1,
        "minor" => 2,
        "major" => 3,
        _ => 0,
    }
}

pub fn verify(bundle: &VerificationBundle) -> VerificationReport {
    let mut report = VerificationReport::new("buildchain.release-passport/v1-documented-subset");
    let passport = match parse_strict_json(&bundle.primary) {
        Ok(value) => value,
        Err(error) => {
            report.issue("json-invalid", "/", error);
            return report.finish();
        }
    };
    if passport.get("schemaVersion").and_then(Value::as_u64) != Some(1)
        || passport.get("contract").and_then(Value::as_str) != Some(PASSPORT)
    {
        report.issue(
            "passport-contract",
            "/contract",
            "passport must use kungfu-buildchain-release-passport v1",
        );
    }
    if passport
        .pointer("/release/tag")
        .and_then(Value::as_str)
        .unwrap_or("")
        .is_empty()
    {
        report.issue("release-tag", "/release/tag", "release tag is required");
    }

    let artifact_path = passport
        .pointer("/evidence/artifactEvidence")
        .and_then(Value::as_str)
        .unwrap_or("artifact-evidence.json");
    let impact_path = passport
        .pointer("/evidence/impact")
        .and_then(Value::as_str)
        .unwrap_or("impact.json");
    let agent_path = passport
        .pointer("/evidence/agentIndex")
        .and_then(Value::as_str)
        .unwrap_or("agent-index.json");
    let mechanism_path = passport
        .pointer("/product/mechanism")
        .and_then(Value::as_str)
        .unwrap_or("product-mechanism.json");
    for (path, label) in [
        (artifact_path, "artifact evidence"),
        (impact_path, "impact"),
        (agent_path, "agent index"),
        (mechanism_path, "product mechanism"),
    ] {
        if path.starts_with("http://")
            || path.starts_with("https://")
            || path.starts_with('/')
            || path.split('/').any(|segment| segment == "..")
        {
            report.issue(
                "local-closure",
                format!("/artifacts/{path}"),
                format!("{label} must resolve inside the local bundle"),
            );
        }
    }
    let artifact_evidence = parse_sibling(bundle, artifact_path, ARTIFACT_EVIDENCE, &mut report);
    let impact = parse_sibling(bundle, impact_path, IMPACT, &mut report);
    parse_sibling(bundle, agent_path, AGENT_INDEX, &mut report);
    parse_sibling(bundle, mechanism_path, PRODUCT_MECHANISM, &mut report);

    if let Some(evidence) = artifact_evidence {
        let mut by_name = BTreeMap::new();
        for entry in evidence["artifacts"].as_array().into_iter().flatten() {
            if let Some(name) = entry.get("name").and_then(Value::as_str) {
                by_name.insert(name, entry);
            }
        }
        let artifacts = passport["artifacts"].as_array();
        if artifacts.is_none_or(Vec::is_empty) {
            report.issue(
                "artifacts-empty",
                "/artifacts",
                "release passport must list at least one artifact",
            );
        }
        for (index, entry) in artifacts.into_iter().flatten().enumerate() {
            let Some(name) = entry.get("name").and_then(Value::as_str) else {
                report.issue(
                    "artifact-name",
                    format!("/artifacts/{index}/name"),
                    "artifact name is required",
                );
                continue;
            };
            match by_name.get(name) {
                Some(evidence_entry) if digest(entry) == digest(evidence_entry) => {}
                Some(_) => report.issue(
                    "artifact-digest-mismatch",
                    format!("/artifacts/{index}/digest"),
                    format!("artifact {name} digest differs from evidence"),
                ),
                None => report.issue(
                    "artifact-evidence-missing",
                    format!("/artifacts/{index}"),
                    format!("artifact {name} has no structured evidence"),
                ),
            }
        }
    }

    if let Some(impact) = impact {
        if passport.get("surfaceImpacts") != impact.get("surfaceImpacts") {
            report.issue(
                "surface-impact-mismatch",
                "/surfaceImpacts",
                "passport surfaceImpacts must mirror impact.json",
            );
        }
        let surface_impacts = impact["surfaceImpacts"]
            .as_array()
            .cloned()
            .unwrap_or_default();
        let highest = surface_impacts
            .iter()
            .filter_map(|entry| entry.get("impact").and_then(Value::as_str))
            .max_by_key(|value| impact_rank(value))
            .unwrap_or("");
        if !surface_impacts.is_empty()
            && impact
                .pointer("/versionImpact/final")
                .and_then(Value::as_str)
                != Some(highest)
        {
            report.issue(
                "version-impact-mismatch",
                "/versionImpact/final",
                "final impact must equal the highest surface impact",
            );
        }
        if passport.pointer("/versionImpact/final") != impact.pointer("/versionImpact/final") {
            report.issue(
                "passport-impact-mismatch",
                "/versionImpact/final",
                "passport and impact.json final classifications disagree",
            );
        }
    }

    if let Some(package_set) = passport.get("packageSet") {
        for (path, value) in [
            ("/packageSet/main/name", package_set.pointer("/main/name")),
            (
                "/packageSet/main/version",
                package_set.pointer("/main/version"),
            ),
            (
                "/packageSet/main/distTag",
                package_set.pointer("/main/distTag"),
            ),
            (
                "/packageSet/main/digest",
                package_set.pointer("/main/digest"),
            ),
        ] {
            if value.and_then(Value::as_str).unwrap_or("").is_empty() {
                report.issue(
                    "package-set-incomplete",
                    path,
                    "packageSet main entry is incomplete",
                );
            }
        }
    }
    if let Some(trusted) = passport.get("trustedPublishing") {
        if trusted
            .get("provider")
            .and_then(Value::as_str)
            .unwrap_or("")
            .is_empty()
            || trusted.get("auth").and_then(Value::as_str) != Some("trusted-publishing")
            || trusted.get("enabled").and_then(Value::as_bool) != Some(true)
        {
            report.issue(
                "trusted-publishing-incomplete",
                "/trustedPublishing",
                "trusted publishing evidence is incomplete",
            );
        }
    }
    if let Some(transaction) = passport.get("transaction") {
        for field in [
            "state",
            "exactTag",
            "releaseSha",
            "releaseMaterialSha",
            "stateRef",
        ] {
            if transaction
                .get(field)
                .and_then(Value::as_str)
                .unwrap_or("")
                .is_empty()
            {
                report.issue(
                    "transaction-incomplete",
                    format!("/transaction/{field}"),
                    "release transaction field is required",
                );
            }
        }
        if transaction.get("state").and_then(Value::as_str) != Some("complete") {
            report.issue(
                "transaction-incomplete",
                "/transaction/state",
                "release transaction must be complete",
            );
        }
    }
    if let Some(anchor) = passport.get("anchorManifest") {
        if anchor
            .get("sha256")
            .and_then(Value::as_str)
            .unwrap_or("")
            .is_empty()
            || !anchor.get("fields").is_some_and(Value::is_object)
        {
            report.issue(
                "anchor-manifest-incomplete",
                "/anchorManifest",
                "anchor manifest must include sha256 and fields",
            );
        }
    }
    report.check("documented-subset", true);
    report.check("offline", true);
    report.finish()
}
