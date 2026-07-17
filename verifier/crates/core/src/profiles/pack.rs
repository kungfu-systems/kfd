// SPDX-License-Identifier: Apache-2.0

use crate::schema;
use crate::{
    parse_strict_json, semantic_root, sha256_bytes, VerificationBundle, VerificationReport,
};
use serde_json::{json, Value};
use std::collections::{BTreeMap, BTreeSet};

const PACK_SCHEMA: &str = include_str!("../../../../specs/xinfa/context-pack-v1.schema.json");

fn root(value: &Value) -> Result<String, String> {
    semantic_root(value)
}

fn exact_artifact<'a>(
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

fn parse_artifact(
    bundle: &VerificationBundle,
    name: &str,
    report: &mut VerificationReport,
) -> Option<Value> {
    let source = exact_artifact(bundle, name, report)?;
    match parse_strict_json(source) {
        Ok(value) => Some(value),
        Err(error) => {
            report.issue("json-invalid", format!("/artifacts/{name}"), error);
            None
        }
    }
}

fn coverage_index(pack: &Value) -> Option<Value> {
    let nodes = pack.get("nodes")?.as_array()?;
    let edges = pack.get("edges")?.as_array()?;
    let routes = pack.get("routes")?.as_array()?;
    let kinds: BTreeMap<&str, &str> = nodes
        .iter()
        .filter_map(|node| Some((node.get("id")?.as_str()?, node.get("kind")?.as_str()?)))
        .collect();
    let mut claims = Vec::new();
    for claim in nodes.iter().filter(|node| {
        matches!(
            node.get("kind").and_then(Value::as_str),
            Some("claim" | "invariant")
        )
    }) {
        let id = claim.get("id")?.as_str()?;
        let mut documents = BTreeSet::new();
        let mut implementations = BTreeSet::new();
        let mut probes = BTreeSet::new();
        let mut evidence = BTreeSet::new();
        for edge in edges {
            let from = edge.get("from")?.as_str()?;
            let to = edge.get("to")?.as_str()?;
            let relation = edge.get("relation")?.as_str()?;
            if to == id
                && matches!(relation, "explains" | "defines")
                && kinds.get(from) == Some(&"document")
            {
                documents.insert(from.to_owned());
            }
            if from == id && relation == "implements" && kinds.get(to) == Some(&"implementation") {
                implementations.insert(to.to_owned());
            }
            if to == id && relation == "proves" {
                match kinds.get(from).copied() {
                    Some("probe") => {
                        probes.insert(from.to_owned());
                    }
                    Some("evidence") => {
                        evidence.insert(from.to_owned());
                    }
                    _ => {}
                }
            }
        }
        for dependency in claim.pointer("/verification/dependencies")?.as_array()? {
            let dependency_id = dependency.get("node")?.as_str()?;
            match kinds.get(dependency_id).copied() {
                Some("implementation") => {
                    implementations.insert(dependency_id.to_owned());
                }
                Some("probe") => {
                    probes.insert(dependency_id.to_owned());
                }
                Some("evidence") => {
                    evidence.insert(dependency_id.to_owned());
                }
                _ => {}
            }
        }
        let route_ids: BTreeSet<String> = routes
            .iter()
            .filter(|route| {
                route
                    .get("nodes")
                    .and_then(Value::as_array)
                    .is_some_and(|ids| ids.iter().any(|node| node == id))
            })
            .filter_map(|route| route.get("id")?.as_str().map(str::to_owned))
            .collect();
        claims.push(json!({
            "claim": id,
            "status": claim.pointer("/verification/status")?,
            "documents": documents,
            "implementations": implementations,
            "probes": probes,
            "evidence": evidence,
            "routes": route_ids,
        }));
    }
    let mut implementations = Vec::new();
    for node in nodes
        .iter()
        .filter(|node| node.get("kind").and_then(Value::as_str) == Some("implementation"))
    {
        let id = node.get("id")?.as_str()?;
        let covered_claims: BTreeSet<String> = claims
            .iter()
            .filter(|claim| {
                claim["implementations"]
                    .as_array()
                    .is_some_and(|items| items.iter().any(|item| item == id))
            })
            .filter_map(|claim| claim.get("claim")?.as_str().map(str::to_owned))
            .collect();
        let covered_documents: BTreeSet<String> = claims
            .iter()
            .filter(|claim| {
                claim["claim"]
                    .as_str()
                    .is_some_and(|id| covered_claims.contains(id))
            })
            .flat_map(|claim| claim["documents"].as_array().into_iter().flatten())
            .filter_map(Value::as_str)
            .map(str::to_owned)
            .collect();
        let covered_routes: BTreeSet<String> = claims
            .iter()
            .filter(|claim| {
                claim["claim"]
                    .as_str()
                    .is_some_and(|id| covered_claims.contains(id))
            })
            .flat_map(|claim| claim["routes"].as_array().into_iter().flatten())
            .filter_map(Value::as_str)
            .map(str::to_owned)
            .collect();
        implementations.push(json!({
            "implementation": id,
            "claims": covered_claims,
            "documents": covered_documents,
            "routes": covered_routes,
        }));
    }
    let routed: BTreeSet<&str> = routes
        .iter()
        .flat_map(|route| route["nodes"].as_array().into_iter().flatten())
        .filter_map(Value::as_str)
        .collect();
    let orphans: Vec<&str> = nodes
        .iter()
        .filter_map(|node| node.get("id")?.as_str())
        .filter(|id| !routed.contains(id))
        .collect();
    Some(json!({
        "claims": claims,
        "implementations": implementations,
        "orphans": orphans,
    }))
}

pub(crate) fn verify_pack_value(pack: &Value, report: &mut VerificationReport) {
    if pack.get("schema").and_then(Value::as_str) != Some("xinfa.context-pack/v1") {
        report.issue("pack-schema", "/schema", "must be xinfa.context-pack/v1");
        return;
    }
    let schema: Value = serde_json::from_str(PACK_SCHEMA).expect("packaged Pack schema");
    let schema_issues = schema::validate(pack, &schema);
    report.check("json-schema", schema_issues.is_empty());
    report.issues.extend(schema_issues);

    let mut core = pack.clone();
    let expected_pack = core
        .pointer_mut("/roots")
        .and_then(Value::as_object_mut)
        .and_then(|roots| roots.remove("pack"));
    match expected_pack.and_then(|value| value.as_str().map(str::to_owned)) {
        Some(expected) => match root(&core) {
            Ok(actual) if actual == expected => report.check("pack-root", true),
            Ok(_) => {
                report.check("pack-root", false);
                report.issue(
                    "pack-root",
                    "/roots/pack",
                    "Pack root does not match canonical Pack content",
                );
            }
            Err(error) => report.issue("canonical-domain", "/roots/pack", error),
        },
        None => report.issue("pack-root", "/roots/pack", "Pack is missing roots.pack"),
    }

    if let Some(inventory) = pack.get("inventory").and_then(Value::as_array) {
        for item in inventory {
            let path = item
                .get("path")
                .and_then(Value::as_str)
                .unwrap_or("unknown");
            match item.get("content").and_then(Value::as_str) {
                Some(content)
                    if item.get("encoding").and_then(Value::as_str) == Some("utf-8")
                        && item.get("contentRoot").and_then(Value::as_str)
                            == Some(sha256_bytes(content.as_bytes()).as_str())
                        && item.get("size").and_then(Value::as_u64)
                            == Some(content.len() as u64) => {}
                _ => report.issue(
                    "source-content-root",
                    format!("/inventory/{path}"),
                    "source payload does not match UTF-8 content root and size",
                ),
            }
        }
    }

    for (field, value) in [
        ("source", &pack["inventory"]),
        ("coverage", &pack["coverage"]),
        ("cut", &pack["cut"]),
    ] {
        match root(value) {
            Ok(actual)
                if pack
                    .pointer(&format!("/roots/{field}"))
                    .and_then(Value::as_str)
                    == Some(actual.as_str()) => {}
            Ok(_) => report.issue(
                "component-root",
                format!("/roots/{field}"),
                format!("{field} root does not match content"),
            ),
            Err(error) => report.issue("canonical-domain", format!("/roots/{field}"), error),
        }
    }
    for (field, value) in [
        (
            "authority",
            json!({"cut": pack["cut"], "nodes": pack["nodes"], "edges": pack["edges"]}),
        ),
        (
            "policy",
            json!({"policies": pack["policies"], "visibility": pack["visibility"], "routes": pack["routes"]}),
        ),
    ] {
        match root(&value) {
            Ok(actual)
                if pack
                    .pointer(&format!("/roots/{field}"))
                    .and_then(Value::as_str)
                    == Some(actual.as_str()) => {}
            Ok(_) => report.issue(
                "component-root",
                format!("/roots/{field}"),
                format!("{field} root does not match content"),
            ),
            Err(error) => report.issue("canonical-domain", format!("/roots/{field}"), error),
        }
    }

    let node_map: BTreeMap<&str, &Value> = pack["nodes"]
        .as_array()
        .into_iter()
        .flatten()
        .filter_map(|node| Some((node.get("id")?.as_str()?, node)))
        .collect();
    let mut groups: BTreeMap<&str, Vec<&Value>> = BTreeMap::new();
    for route in pack["routes"].as_array().into_iter().flatten() {
        let id = route.get("id").and_then(Value::as_str).unwrap_or("unknown");
        let selected: Vec<Value> = route["nodes"]
            .as_array()
            .into_iter()
            .flatten()
            .filter_map(|node_id| {
                let node_id = node_id.as_str()?;
                let node = node_map.get(node_id)?;
                Some(json!({
                    "id": node_id,
                    "revision": node["revision"],
                    "status": node["verification"]["status"],
                }))
            })
            .collect();
        if root(&Value::Array(selected)).ok().as_deref()
            != route.get("authorityRoot").and_then(Value::as_str)
        {
            report.issue(
                "route-authority-root",
                format!("/routes/{id}/authorityRoot"),
                "route authority root does not match selected nodes",
            );
        }
        let mut source = route.clone();
        if let Some(object) = source.as_object_mut() {
            object.remove("authorityRoot");
            object.remove("routeRoot");
            object.remove("status");
        }
        if root(&source).ok().as_deref() != route.get("routeRoot").and_then(Value::as_str) {
            report.issue(
                "route-root",
                format!("/routes/{id}/routeRoot"),
                "route root does not match route declaration",
            );
        }
        let stale = route["nodes"]
            .as_array()
            .into_iter()
            .flatten()
            .filter_map(Value::as_str)
            .filter_map(|node_id| node_map.get(node_id))
            .any(|node| {
                matches!(
                    node.pointer("/verification/status").and_then(Value::as_str),
                    Some("stale" | "invalidated")
                )
            });
        if route.get("status").and_then(Value::as_str)
            != Some(if stale { "stale" } else { "current" })
        {
            report.issue(
                "route-status",
                format!("/routes/{id}/status"),
                "route status does not match selected nodes",
            );
        }
        groups
            .entry(
                route
                    .get("parityGroup")
                    .and_then(Value::as_str)
                    .unwrap_or(""),
            )
            .or_default()
            .push(route);
    }
    for (group, routes) in groups {
        let audiences: BTreeSet<_> = routes
            .iter()
            .filter_map(|route| route.get("audience").and_then(Value::as_str))
            .collect();
        if routes.len() != 2
            || audiences.len() != 2
            || routes[0]["authorityRoot"] != routes[1]["authorityRoot"]
            || routes[0]["status"] != routes[1]["status"]
        {
            report.issue(
                "route-parity",
                "/routes",
                format!("parity group {group} does not preserve dual-first authority"),
            );
        }
    }
    match coverage_index(pack) {
        Some(expected) if expected == pack["coverage"] => report.check("coverage-index", true),
        Some(_) => {
            report.check("coverage-index", false);
            report.issue(
                "coverage-index",
                "/coverage",
                "coverage index does not match the authority graph",
            );
        }
        None => report.issue(
            "coverage-index",
            "/coverage",
            "coverage graph is structurally incomplete",
        ),
    }
}

pub fn verify(bundle: &VerificationBundle) -> VerificationReport {
    let mut report = VerificationReport::new("xinfa.context-pack/v1");
    let pack = match parse_strict_json(&bundle.primary) {
        Ok(value) => value,
        Err(error) => {
            report.issue("json-invalid", "/", error);
            return report.finish();
        }
    };
    verify_pack_value(&pack, &mut report);

    if !bundle.artifacts.is_empty() {
        let manifest = parse_artifact(bundle, "manifest.json", &mut report);
        let receipt = parse_artifact(bundle, "receipt.json", &mut report);
        if let Some(manifest) = manifest {
            let mut core = manifest.clone();
            let declared_root = core
                .as_object_mut()
                .and_then(|object| object.remove("manifestRoot"));
            let exact = manifest.pointer("/artifacts/0");
            let artifact_ok = manifest.get("schema").and_then(Value::as_str)
                == Some("xinfa.context-pack-manifest/v1")
                && manifest.get("packRoot") == pack.pointer("/roots/pack")
                && exact
                    .and_then(|value| value.get("path"))
                    .and_then(Value::as_str)
                    == Some("pack.json")
                && exact
                    .and_then(|value| value.get("contentRoot"))
                    .and_then(Value::as_str)
                    == Some(sha256_bytes(bundle.primary.as_bytes()).as_str())
                && exact
                    .and_then(|value| value.get("size"))
                    .and_then(Value::as_u64)
                    == Some(bundle.primary.len() as u64);
            if !artifact_ok {
                report.issue(
                    "artifact-root",
                    "/artifacts/manifest.json",
                    "manifest does not bind exact pack.json bytes",
                );
            }
            if declared_root.as_ref().and_then(Value::as_str) != root(&core).ok().as_deref() {
                report.issue(
                    "manifest-root",
                    "/artifacts/manifest.json/manifestRoot",
                    "manifest root does not match content",
                );
            }
            if let Some(receipt) = receipt {
                let mut receipt_core = receipt.clone();
                let receipt_root = receipt_core
                    .as_object_mut()
                    .and_then(|object| object.remove("receiptRoot"));
                if receipt.get("schema").and_then(Value::as_str)
                    != Some("xinfa.context-pack-compile-receipt/v1")
                    || receipt.get("verdict").and_then(Value::as_str) != Some("pass")
                    || receipt.get("packRoot") != pack.pointer("/roots/pack")
                    || receipt.get("manifestRoot") != manifest.get("manifestRoot")
                    || receipt.get("qualifying").and_then(Value::as_bool) != Some(false)
                    || receipt.get("selfCertified").and_then(Value::as_bool) != Some(false)
                {
                    report.issue(
                        "receipt-binding",
                        "/artifacts/receipt.json",
                        "receipt does not bind the verified Pack and manifest",
                    );
                }
                if receipt_root.as_ref().and_then(Value::as_str)
                    != root(&receipt_core).ok().as_deref()
                {
                    report.issue(
                        "receipt-root",
                        "/artifacts/receipt.json/receiptRoot",
                        "receipt root does not match content",
                    );
                }
            }
        }
    }
    report.check("offline", true);
    report.finish()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn semantic_mutation_is_rejected() {
        let mut value = json!({
            "schema": "xinfa.context-pack/v1",
            "roots": {"pack": "sha256:0000000000000000000000000000000000000000000000000000000000000000"}
        });
        let mut report = VerificationReport::new("test");
        verify_pack_value(&value, &mut report);
        assert!(!report.finish().valid);
        value["schema"] = json!("unknown");
        let mut report = VerificationReport::new("test");
        verify_pack_value(&value, &mut report);
        assert!(!report.finish().valid);
    }
}
