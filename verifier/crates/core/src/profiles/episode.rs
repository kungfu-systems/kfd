// SPDX-License-Identifier: Apache-2.0

use crate::{
    canonical_json, parse_strict_json, sha256_bytes, VerificationBundle, VerificationReport,
};
use serde_json::Value;
use std::collections::BTreeSet;

const MANIFEST_SCHEMA: &str = "kungfu.episode.git-workspace-manifest/v1";
const SEGMENT_SCHEMA: &str = "kungfu.episode.git-workspace-segment/v1";
const QUALIFICATION_SCHEMA: &str = "kungfu.episode.qualification/v1";
const PROVIDER: &str = "git-workspace-jsonl/v1";
const PROVIDER_ROOT_ALGORITHM: &str = "sha256-kungfu-git-episode-canonical-json-v1";

fn episode_root(value: &Value) -> Option<String> {
    canonical_json(value)
        .ok()
        .map(|canonical| sha256_bytes(canonical.as_bytes()))
}

fn artifact<'a>(
    bundle: &'a VerificationBundle,
    name: &str,
    report: &mut VerificationReport,
) -> Option<&'a str> {
    match bundle.artifacts.get(name) {
        Some(value) => Some(value),
        None => {
            report.issue(
                "artifact-missing",
                format!("/artifacts/{name}"),
                format!("required artifact {name} is missing"),
            );
            None
        }
    }
}

fn is_root(value: &str) -> bool {
    value.len() == 71
        && value.starts_with("sha256:")
        && value[7..]
            .bytes()
            .all(|byte| byte.is_ascii_digit() || (b'a'..=b'f').contains(&byte))
}

pub fn verify(bundle: &VerificationBundle) -> VerificationReport {
    let mut report = VerificationReport::new(MANIFEST_SCHEMA);
    let manifest = match parse_strict_json(&bundle.primary) {
        Ok(value) => value,
        Err(error) => {
            report.issue("json-invalid", "/", error);
            return report.finish();
        }
    };
    if manifest.get("schema").and_then(Value::as_str) != Some(MANIFEST_SCHEMA)
        || manifest.get("provider").and_then(Value::as_str) != Some(PROVIDER)
        || manifest
            .get("providerRootAlgorithm")
            .and_then(Value::as_str)
            != Some(PROVIDER_ROOT_ALGORITHM)
        || manifest.get("authority").and_then(Value::as_str) != Some("shadow-of-yijinjing-journal")
        || manifest.get("semanticRootContract").and_then(Value::as_str)
            != Some("kungfu.episode-root/v1")
        || manifest.get("integerEncoding").and_then(Value::as_str)
            != Some("uint64-decimal-string-above-safe-range/v1")
    {
        report.issue(
            "episode-manifest-contract",
            "/",
            "manifest does not declare the supported Git Workspace Episode contract",
        );
    }
    let semantic_root_value = manifest
        .get("semanticRoot")
        .and_then(Value::as_str)
        .unwrap_or("");
    if !is_root(semantic_root_value) {
        report.issue(
            "semantic-root-invalid",
            "/semanticRoot",
            "semanticRoot must be a lowercase sha256 root",
        );
    }
    if let Some(expected) = bundle.artifacts.get("semantic-root.txt") {
        if expected.trim() != semantic_root_value {
            report.issue(
                "semantic-root-mismatch",
                "/semanticRoot",
                "manifest semantic root does not match the requested coordinate",
            );
        }
    }
    let mut preimage = manifest.clone();
    let provider_root = preimage
        .as_object_mut()
        .and_then(|object| object.remove("providerRoot"));
    if provider_root.as_ref().and_then(Value::as_str) != episode_root(&preimage).as_deref() {
        report.issue(
            "provider-root-mismatch",
            "/providerRoot",
            "provider root does not match canonical manifest preimage",
        );
    }

    let qualification_text = artifact(bundle, "qualification.json", &mut report);
    if let Some(text) = qualification_text {
        match parse_strict_json(text) {
            Ok(qualification) => {
                if canonical_json(&qualification)
                    .map(|canonical| format!("{canonical}\n"))
                    .ok()
                    .as_deref()
                    != Some(text)
                {
                    report.issue(
                        "qualification-non-canonical",
                        "/artifacts/qualification.json",
                        "qualification must be canonical JSON with one terminal LF",
                    );
                }
                if episode_root(&qualification).as_deref()
                    != manifest.get("qualificationRoot").and_then(Value::as_str)
                {
                    report.issue(
                        "qualification-root-mismatch",
                        "/qualificationRoot",
                        "qualification root does not match exact qualification content",
                    );
                }
                let episode_id = manifest.get("episodeId");
                let export_safe = qualification
                    .get("capabilities")
                    .and_then(Value::as_array)
                    .into_iter()
                    .flatten()
                    .any(|capability| {
                        capability.get("name").and_then(Value::as_str) == Some("export_evidence")
                            && capability.get("safe").and_then(Value::as_bool) == Some(true)
                    });
                if qualification.get("schema").and_then(Value::as_str) != Some(QUALIFICATION_SCHEMA)
                    || qualification.get("policy_source").and_then(Value::as_str)
                        != Some("cpp-typed-fold-fsck")
                    || qualification.get("lifecycle").and_then(Value::as_str) != Some("ended")
                    || qualification.get("status").and_then(Value::as_str) != Some("ok")
                    || qualification.get("episode_id") != episode_id
                    || !export_safe
                {
                    report.issue(
                        "qualification-not-admissible",
                        "/artifacts/qualification.json",
                        "qualification does not admit this sealed Episode",
                    );
                }
            }
            Err(error) => report.issue(
                "qualification-invalid",
                "/artifacts/qualification.json",
                error,
            ),
        }
    }

    let claims_text = artifact(bundle, "claims.jsonl", &mut report);
    if let Some(text) = claims_text {
        if !text.ends_with('\n') {
            report.issue(
                "torn-tail",
                "/artifacts/claims.jsonl",
                "claims JSONL must end in LF",
            );
        }
        if manifest.pointer("/claims/path").and_then(Value::as_str) != Some("claims.jsonl")
            || manifest.pointer("/claims/framing").and_then(Value::as_str)
                != Some("canonical-json-lines-lf/v1")
            || manifest.pointer("/claims/digest").and_then(Value::as_str)
                != Some(sha256_bytes(text.as_bytes()).as_str())
        {
            report.issue(
                "claims-hash-mismatch",
                "/claims",
                "claims descriptor does not bind exact canonical JSONL bytes",
            );
        }
        let rows: Vec<&str> = text.split('\n').filter(|line| !line.is_empty()).collect();
        if manifest.pointer("/claims/count").and_then(Value::as_u64) != Some(rows.len() as u64) {
            report.issue(
                "record-count-mismatch",
                "/claims/count",
                "claims count does not match JSONL rows",
            );
        }
        let mut seen = BTreeSet::new();
        for (position, row_text) in rows.iter().enumerate() {
            match parse_strict_json(row_text) {
                Ok(row) => {
                    if row.get("schema").and_then(Value::as_str) != Some(SEGMENT_SCHEMA) {
                        report.issue(
                            "unknown-schema",
                            format!("/claims/{position}/schema"),
                            "unsupported Episode segment row",
                        );
                    }
                    let index = row.get("index").and_then(Value::as_u64);
                    if index != Some(position as u64) {
                        report.issue(
                            "out-of-order",
                            format!("/claims/{position}/index"),
                            "row index must equal its zero-based position",
                        );
                    }
                    if !seen.insert(index) {
                        report.issue(
                            "duplicate-record",
                            format!("/claims/{position}/index"),
                            "row index is duplicated",
                        );
                    }
                    if canonical_json(&row).ok().as_deref() != Some(*row_text) {
                        report.issue(
                            "non-canonical-jsonl",
                            format!("/claims/{position}"),
                            "row is not canonical JSON",
                        );
                    }
                }
                Err(error) => report.issue("malformed-jsonl", format!("/claims/{position}"), error),
            }
        }
    }
    report.check(
        "authority-boundary-preserved-not-recomputed",
        is_root(semantic_root_value),
    );
    report.check("offline", true);
    report.finish()
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::BTreeMap;

    #[test]
    fn fixture_passes_and_mutation_fails() {
        let directory = concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/../../fixtures/episode/sealed/sha256/aa/",
            "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
        );
        let primary = std::fs::read_to_string(format!("{directory}/manifest.json")).unwrap();
        let mut artifacts = BTreeMap::new();
        artifacts.insert(
            "claims.jsonl".to_owned(),
            std::fs::read_to_string(format!("{directory}/claims.jsonl")).unwrap(),
        );
        artifacts.insert(
            "qualification.json".to_owned(),
            std::fs::read_to_string(format!("{directory}/qualification.json")).unwrap(),
        );
        artifacts.insert(
            "semantic-root.txt".to_owned(),
            "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\n".to_owned(),
        );
        let bundle = VerificationBundle {
            schema_version: 1,
            contract: "kfd.verification-bundle/v1".to_owned(),
            kind: "episode".to_owned(),
            primary,
            artifacts,
        };
        assert!(verify(&bundle).valid);
        let mut mutated = bundle.clone();
        mutated.artifacts.get_mut("claims.jsonl").unwrap().push(' ');
        assert!(!verify(&mutated).valid);
    }
}
