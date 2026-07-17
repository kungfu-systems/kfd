// SPDX-License-Identifier: Apache-2.0

use crate::schema;
use crate::{parse_strict_json, VerificationBundle, VerificationReport};

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
    report.finish()
}
