// SPDX-License-Identifier: Apache-2.0

mod canonical;
mod profiles;
mod schema;

use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

pub use canonical::{canonical_json, parse_strict_json, semantic_root, sha256_bytes};

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VerificationBundle {
    pub schema_version: u32,
    pub contract: String,
    pub kind: String,
    pub primary: String,
    #[serde(default)]
    pub artifacts: BTreeMap<String, String>,
}

#[derive(Clone, Debug, Eq, PartialEq, Serialize)]
pub struct Check {
    pub id: String,
    pub status: String,
}

#[derive(Clone, Debug, Eq, PartialEq, Serialize)]
pub struct Issue {
    pub code: String,
    pub path: String,
    pub message: String,
}

impl Issue {
    pub fn new(
        code: impl Into<String>,
        path: impl Into<String>,
        message: impl Into<String>,
    ) -> Self {
        Self {
            code: code.into(),
            path: path.into(),
            message: message.into(),
        }
    }
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VerificationReport {
    pub schema_version: u32,
    pub contract: String,
    pub profile: String,
    pub valid: bool,
    pub qualifying: bool,
    pub self_certified: bool,
    pub offline: bool,
    pub checks: Vec<Check>,
    pub issues: Vec<Issue>,
}

impl VerificationReport {
    pub fn new(profile: impl Into<String>) -> Self {
        Self {
            schema_version: 1,
            contract: "kfd.verification-report/v1".to_owned(),
            profile: profile.into(),
            valid: true,
            qualifying: false,
            self_certified: false,
            offline: true,
            checks: Vec::new(),
            issues: Vec::new(),
        }
    }

    pub fn check(&mut self, id: impl Into<String>, passed: bool) {
        self.checks.push(Check {
            id: id.into(),
            status: if passed { "pass" } else { "fail" }.to_owned(),
        });
    }

    pub fn issue(
        &mut self,
        code: impl Into<String>,
        path: impl Into<String>,
        message: impl Into<String>,
    ) {
        self.issues.push(Issue::new(code, path, message));
    }

    pub fn finish(mut self) -> Self {
        self.issues.sort_by(|left, right| {
            (&left.path, &left.code, &left.message).cmp(&(&right.path, &right.code, &right.message))
        });
        self.issues.dedup();
        self.checks.sort_by(|left, right| left.id.cmp(&right.id));
        self.checks.dedup_by(|left, right| left.id == right.id);
        self.valid = self.issues.is_empty()
            && self
                .checks
                .iter()
                .all(|check| check.status.as_str() == "pass");
        self
    }
}

fn invalid_bundle_report(message: impl Into<String>) -> VerificationReport {
    let mut report = VerificationReport::new("kfd.verification-bundle/v1");
    report.issue("bundle-invalid", "/", message);
    report.finish()
}

pub fn verify_bundle(bundle: &VerificationBundle) -> VerificationReport {
    if bundle.schema_version != 1 || bundle.contract.as_str() != "kfd.verification-bundle/v1" {
        return invalid_bundle_report(
            "bundle must use schemaVersion 1 and contract kfd.verification-bundle/v1",
        );
    }
    match bundle.kind.as_str() {
        "kfd-record" => profiles::kfd_record::verify(bundle),
        "passport" => profiles::passport::verify(bundle),
        "pack" => profiles::pack::verify(bundle),
        "atlas" => profiles::atlas::verify(bundle),
        "episode" => profiles::episode::verify(bundle),
        other => invalid_bundle_report(format!("unsupported verification kind: {other}")),
    }
}

pub fn verify_bundle_json(input: &str) -> String {
    let bundle = match parse_strict_json(input).and_then(|value| {
        serde_json::from_value::<VerificationBundle>(value).map_err(|error| error.to_string())
    }) {
        Ok(bundle) => bundle,
        Err(error) => return report_json(&invalid_bundle_report(error)),
    };
    report_json(&verify_bundle(&bundle))
}

pub fn report_json(report: &VerificationReport) -> String {
    serde_json::to_string(report).expect("verification report must serialize")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn unsupported_bundle_fails_closed() {
        let report = verify_bundle(&VerificationBundle {
            schema_version: 1,
            contract: "kfd.verification-bundle/v1".to_owned(),
            kind: "unknown".to_owned(),
            primary: "{}".to_owned(),
            artifacts: BTreeMap::new(),
        });
        assert!(!report.valid);
        assert_eq!(report.issues[0].code, "bundle-invalid");
    }

    #[test]
    fn report_bytes_are_stable() {
        let mut report = VerificationReport::new("test/v1");
        report.issue("z", "/z", "z");
        report.issue("a", "/a", "a");
        let first = report_json(&report.finish());
        let second = report_json(&verify_bundle(&VerificationBundle {
            schema_version: 1,
            contract: "invalid".to_owned(),
            kind: "unknown".to_owned(),
            primary: "{}".to_owned(),
            artifacts: BTreeMap::new(),
        }));
        assert!(first.starts_with("{\"schemaVersion\":1"));
        assert!(second.contains("\"valid\":false"));
    }
}
