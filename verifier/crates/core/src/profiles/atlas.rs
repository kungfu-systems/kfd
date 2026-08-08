// SPDX-License-Identifier: Apache-2.0

use crate::profiles::pack;
use crate::schema;
use crate::{
    parse_strict_json, semantic_root, sha256_bytes, VerificationBundle, VerificationReport,
};
use serde_json::{json, Value};
use std::collections::BTreeMap;

const ATLAS_SCHEMA: &str = include_str!("../../../../specs/xinfa/atlas-v1.schema.json");
const PROJECT_SCHEMA: &str = include_str!("../../../../specs/xinfa/project-v1.schema.json");
const PACK_SCHEMA: &str = include_str!("../../../../specs/xinfa/context-pack-v1.schema.json");
const PACK_MANIFEST_SCHEMA: &str =
    include_str!("../../../../specs/xinfa/context-pack-manifest-v1.schema.json");
const PACK_RECEIPT_SCHEMA: &str =
    include_str!("../../../../specs/xinfa/context-pack-receipt-v1.schema.json");
const ATLAS_VIEW_SCHEMA: &str = include_str!("../../../../specs/xinfa/atlas-view-v1.schema.json");
const ATLAS_MANIFEST_SCHEMA: &str =
    include_str!("../../../../specs/xinfa/atlas-manifest-v1.schema.json");
const ATLAS_RECEIPT_SCHEMA: &str =
    include_str!("../../../../specs/xinfa/atlas-receipt-v1.schema.json");
const COMPATIBILITY: &str = "compatibility/context-pack-v1";

fn root(value: &Value) -> Option<String> {
    semantic_root(value).ok()
}

fn parse_artifact(
    bundle: &VerificationBundle,
    name: &str,
    report: &mut VerificationReport,
) -> Option<Value> {
    let Some(source) = bundle.artifacts.get(name) else {
        report.issue(
            "artifact-missing",
            format!("/artifacts/{name}"),
            format!("required Atlas artifact {name} is missing"),
        );
        return None;
    };
    match parse_strict_json(source) {
        Ok(value) => Some(value),
        Err(error) => {
            report.issue("json-invalid", format!("/artifacts/{name}"), error);
            None
        }
    }
}

fn schema_root() -> String {
    let parse = |source: &str| serde_json::from_str::<Value>(source).expect("packaged schema");
    semantic_root(&json!({
        "project": parse(PROJECT_SCHEMA),
        "context_pack": parse(PACK_SCHEMA),
        "context_pack_manifest": parse(PACK_MANIFEST_SCHEMA),
        "context_pack_receipt": parse(PACK_RECEIPT_SCHEMA),
        "atlas": parse(ATLAS_SCHEMA),
        "atlas_view": parse(ATLAS_VIEW_SCHEMA),
        "atlas_manifest": parse(ATLAS_MANIFEST_SCHEMA),
        "atlas_receipt": parse(ATLAS_RECEIPT_SCHEMA),
    }))
    .expect("schema set is canonical")
}

fn shared_view(atlas_root: &str, pack: &Value) -> Value {
    let status: Vec<Value> = pack["routes"]
        .as_array()
        .into_iter()
        .flatten()
        .map(|route| {
            json!({
                "id": route["id"],
                "parityGroup": route["parityGroup"],
                "authorityRoot": route["authorityRoot"],
                "status": route["status"],
            })
        })
        .collect();
    let expansion_handles: Vec<Value> = pack["routes"]
        .as_array()
        .into_iter()
        .flatten()
        .map(|route| {
            json!({
                "route": route["id"],
                "routeRoot": route["routeRoot"],
                "nodes": route["nodes"],
            })
        })
        .collect();
    json!({
        "atlas_root": atlas_root,
        "project_id": pack.pointer("/project/id"),
        "cut": pack["cut"],
        "cut_root": pack.pointer("/roots/cut"),
        "visibility": pack["visibility"],
        "status": status,
        "evidence": pack.pointer("/coverage/claims").cloned().unwrap_or_else(|| json!([])),
        "omissions": pack.pointer("/coverage/orphans").cloned().unwrap_or_else(|| json!([])),
        "expansion_handles": expansion_handles,
    })
}

fn derived_view(audience: &str, atlas_root: &str, pack: &Value, shared: &Value) -> Value {
    let routes: Vec<Value> = pack["routes"]
        .as_array()
        .into_iter()
        .flatten()
        .filter(|route| route.get("audience").and_then(Value::as_str) == Some(audience))
        .cloned()
        .collect();
    json!({
        "schema": "xinfa.atlas-view/v1",
        "kind": "xinfa.atlas-view/v1",
        "audience": audience,
        "atlas_root": atlas_root,
        "shared": shared,
        "routes": routes,
        "derived": true,
    })
}

fn artifact_descriptor(path: &str, contents: &str) -> Value {
    json!({
        "path": path,
        "content_root": sha256_bytes(contents.as_bytes()),
        "size": contents.len(),
    })
}

pub fn verify(bundle: &VerificationBundle) -> VerificationReport {
    let mut report = VerificationReport::new("xinfa.atlas/v1");
    let atlas = match parse_strict_json(&bundle.primary) {
        Ok(value) => value,
        Err(error) => {
            report.issue("json-invalid", "/", error);
            return report.finish();
        }
    };
    let schema: Value = serde_json::from_str(ATLAS_SCHEMA).expect("packaged Atlas schema");
    let schema_issues = schema::validate(&atlas, &schema);
    report.check("json-schema", schema_issues.is_empty());
    report.issues.extend(schema_issues);
    if atlas.get("schema").and_then(Value::as_str) != Some("xinfa.atlas/v1")
        || atlas.get("kind").and_then(Value::as_str) != Some("xinfa.atlas/v1")
        || atlas.get("concept_namespace").and_then(Value::as_str) != Some("xinfa")
        || atlas.get("primitive").and_then(Value::as_str) != Some("atlas")
        || atlas.get("lifecycle").and_then(Value::as_str) != Some("immutable")
    {
        report.issue(
            "atlas-identity",
            "/",
            "Atlas must declare the immutable xinfa.atlas/v1 identity",
        );
    }
    let mut core = atlas.clone();
    let expected = core
        .as_object_mut()
        .and_then(|object| object.remove("atlas_root"));
    if expected.as_ref().and_then(Value::as_str) != root(&core).as_deref() {
        report.issue(
            "atlas-root",
            "/atlas_root",
            "Atlas root does not match canonical Atlas content",
        );
    }
    let schemas = schema_root();
    for (pointer, value) in [
        ("/roots/source", root(&atlas["provenance"]["inventory"])),
        ("/roots/provenance", root(&atlas["provenance"]["inventory"])),
        ("/roots/policy", root(&atlas["policy"])),
        ("/roots/schema", Some(schemas.clone())),
        ("/roots/cut", root(&atlas["cut"])),
        (
            "/roots/semantic",
            root(&json!({
                "cut": atlas["cut"],
                "nodes": atlas["semantic"]["nodes"],
                "edges": atlas["semantic"]["edges"],
            })),
        ),
        (
            "/roots/verification",
            root(&atlas["verification"]["coverage"]),
        ),
    ] {
        if value.as_deref() != atlas.pointer(pointer).and_then(Value::as_str) {
            report.issue(
                "component-root",
                pointer,
                "component root does not match canonical Atlas content",
            );
        }
    }
    if atlas.pointer("/project_id") != atlas.pointer("/project/id")
        || atlas.pointer("/declared_scope/visibility") != atlas.pointer("/visibility")
        || atlas.pointer("/declared_scope/source_root") != atlas.pointer("/roots/source")
        || atlas.pointer("/declared_scope/policy_root") != atlas.pointer("/roots/policy")
        || atlas
            .pointer("/declared_scope/schema_root")
            .and_then(Value::as_str)
            != Some(schemas.as_str())
        || atlas.pointer("/declared_scope/cut_root") != atlas.pointer("/roots/cut")
    {
        report.issue(
            "declared-scope",
            "/declared_scope",
            "declared scope does not bind Atlas identity, visibility, and roots",
        );
    }
    if atlas
        .pointer("/compatibility/schema")
        .and_then(Value::as_str)
        != Some("xinfa.context-pack/v1")
        || atlas
            .pointer("/compatibility/relationship")
            .and_then(Value::as_str)
            != Some("immutable-input")
        || atlas
            .pointer("/compatibility/reinterpretation")
            .and_then(Value::as_bool)
            != Some(false)
        || atlas
            .pointer("/compatibility/embedded_path")
            .and_then(Value::as_str)
            != Some(COMPATIBILITY)
        || atlas.pointer("/compatibility/root") != atlas.pointer("/roots/context_pack")
    {
        report.issue(
            "compatibility-contract",
            "/compatibility",
            "embedded Context Pack must be immutable and non-reinterpreted",
        );
    }

    let pack_name = format!("{COMPATIBILITY}/pack.json");
    let pack_value = parse_artifact(bundle, &pack_name, &mut report);
    if let Some(pack_value) = pack_value {
        let pack_bundle = VerificationBundle {
            schema_version: 1,
            contract: "kfd.verification-bundle/v1".to_owned(),
            kind: "pack".to_owned(),
            primary: bundle.artifacts[&pack_name].clone(),
            artifacts: BTreeMap::from([
                (
                    "manifest.json".to_owned(),
                    bundle
                        .artifacts
                        .get(&format!("{COMPATIBILITY}/manifest.json"))
                        .cloned()
                        .unwrap_or_default(),
                ),
                (
                    "receipt.json".to_owned(),
                    bundle
                        .artifacts
                        .get(&format!("{COMPATIBILITY}/receipt.json"))
                        .cloned()
                        .unwrap_or_default(),
                ),
            ]),
        };
        let full_pack_report = pack::verify(&pack_bundle);
        for issue in full_pack_report.issues {
            report.issue(
                format!("context-pack-{}", issue.code),
                format!("/compatibility{}", issue.path),
                issue.message,
            );
        }
        let linked = [
            ("/roots/source", "/roots/source"),
            ("/roots/policy", "/roots/policy"),
            ("/roots/cut", "/roots/cut"),
            ("/roots/semantic", "/roots/authority"),
            ("/roots/provenance", "/roots/source"),
            ("/roots/verification", "/roots/coverage"),
            ("/roots/context_pack", "/roots/pack"),
        ];
        for (atlas_pointer, pack_pointer) in linked {
            if atlas.pointer(atlas_pointer) != pack_value.pointer(pack_pointer) {
                report.issue(
                    "compatibility-root",
                    atlas_pointer,
                    "Atlas root link does not match embedded Context Pack",
                );
            }
        }
        if atlas.pointer("/semantic/nodes") != pack_value.pointer("/nodes")
            || atlas.pointer("/semantic/edges") != pack_value.pointer("/edges")
            || atlas.pointer("/provenance/inventory") != pack_value.pointer("/inventory")
            || atlas.pointer("/policy/policies") != pack_value.pointer("/policies")
            || atlas.pointer("/policy/visibility") != pack_value.pointer("/visibility")
            || atlas.pointer("/policy/routes") != pack_value.pointer("/routes")
            || atlas.pointer("/verification/coverage") != pack_value.pointer("/coverage")
            || atlas.pointer("/verification/diagnostics") != pack_value.pointer("/diagnostics")
            || atlas.pointer("/routes") != pack_value.pointer("/routes")
            || atlas.pointer("/cut") != pack_value.pointer("/cut")
        {
            report.issue(
                "compatibility-content",
                "/compatibility",
                "Atlas projections diverge from embedded Context Pack",
            );
        }
        let human = parse_artifact(bundle, "views/human.json", &mut report);
        let agent = parse_artifact(bundle, "views/agent.json", &mut report);
        if let (Some(human), Some(agent)) = (human, agent) {
            let atlas_root = atlas
                .get("atlas_root")
                .and_then(Value::as_str)
                .unwrap_or("");
            let shared = shared_view(atlas_root, &pack_value);
            if human != derived_view("human", atlas_root, &pack_value, &shared)
                || agent != derived_view("agent", atlas_root, &pack_value, &shared)
                || human.get("shared") != agent.get("shared")
            {
                report.issue(
                    "view-parity",
                    "/views",
                    "Human and Agent views must be exact projections of one Atlas",
                );
            }
        }

        let manifest = parse_artifact(bundle, "manifest.json", &mut report);
        let receipt = parse_artifact(bundle, "receipt.json", &mut report);
        if let Some(manifest) = manifest {
            let artifact_paths = [
                "atlas.json".to_owned(),
                "views/human.json".to_owned(),
                "views/agent.json".to_owned(),
                format!("{COMPATIBILITY}/pack.json"),
                format!("{COMPATIBILITY}/manifest.json"),
                format!("{COMPATIBILITY}/receipt.json"),
            ];
            let expected_artifacts: Option<Vec<Value>> = artifact_paths
                .iter()
                .map(|path| {
                    let contents = if path == "atlas.json" {
                        Some(bundle.primary.as_str())
                    } else {
                        bundle.artifacts.get(path).map(String::as_str)
                    }?;
                    Some(artifact_descriptor(path, contents))
                })
                .collect();
            let mut manifest_core = manifest.clone();
            let manifest_root = manifest_core
                .as_object_mut()
                .and_then(|object| object.remove("manifest_root"));
            if manifest.get("schema").and_then(Value::as_str) != Some("xinfa.atlas-manifest/v1")
                || manifest.get("atlas_root") != atlas.get("atlas_root")
                || manifest.get("context_pack_root") != pack_value.pointer("/roots/pack")
                || expected_artifacts.as_ref().is_none_or(|expected| {
                    manifest.get("artifacts") != Some(&Value::Array(expected.clone()))
                })
                || manifest_root.as_ref().and_then(Value::as_str) != root(&manifest_core).as_deref()
            {
                report.issue(
                    "manifest-binding",
                    "/artifacts/manifest.json",
                    "Atlas manifest does not bind exact Atlas, views, and Pack artifacts",
                );
            }
            if let Some(receipt) = receipt {
                let mut receipt_core = receipt.clone();
                let receipt_root = receipt_core
                    .as_object_mut()
                    .and_then(|object| object.remove("receipt_root"));
                if receipt.get("schema").and_then(Value::as_str)
                    != Some("xinfa.atlas-compile-receipt/v1")
                    || receipt.get("verdict").and_then(Value::as_str) != Some("pass")
                    || receipt.get("atlas_root") != atlas.get("atlas_root")
                    || receipt.get("context_pack_root") != pack_value.pointer("/roots/pack")
                    || receipt.get("manifest_root") != manifest.get("manifest_root")
                    || receipt.get("qualifying").and_then(Value::as_bool) != Some(false)
                    || receipt.get("selfCertified").and_then(Value::as_bool) != Some(false)
                    || receipt_root.as_ref().and_then(Value::as_str)
                        != root(&receipt_core).as_deref()
                {
                    report.issue(
                        "receipt-binding",
                        "/artifacts/receipt.json",
                        "Atlas receipt does not bind the verified artifacts",
                    );
                }
            }
        }
    }
    report.check(
        "schema-root",
        atlas.pointer("/roots/schema").and_then(Value::as_str) == Some(schemas.as_str()),
    );
    report.check("offline", true);
    report.finish()
}
