// SPDX-License-Identifier: Apache-2.0

use crate::{
    canonical_json, parse_strict_json, semantic_root, sha256_bytes, VerificationBundle,
    VerificationReport,
};
use serde_json::{json, Map, Value};
use std::collections::BTreeSet;

const PROFILE: &str = "kfd-self-conformance@1.0.0-alpha.1";
const REPORT_PROFILE: &str = "kfd.self-conformance-transition/v1";
const BOOTSTRAP_ANCHOR: &str =
    include_str!("../../../../../profiles/self-conformance/bootstrap-anchor.json");

const SCHEMAS: &[(&str, &[u8])] = &[
    (
        "schemas/kfd-self-conformance/bootstrap-anchor.schema.json",
        include_bytes!("../../../../../schemas/kfd-self-conformance/bootstrap-anchor.schema.json"),
    ),
    (
        "schemas/kfd-self-conformance/package-manifest.schema.json",
        include_bytes!("../../../../../schemas/kfd-self-conformance/package-manifest.schema.json"),
    ),
    (
        "schemas/kfd-self-conformance/state.schema.json",
        include_bytes!("../../../../../schemas/kfd-self-conformance/state.schema.json"),
    ),
    (
        "schemas/kfd-self-conformance/transition-bundle.schema.json",
        include_bytes!("../../../../../schemas/kfd-self-conformance/transition-bundle.schema.json"),
    ),
    (
        "schemas/kfd-self-conformance/transition-report.schema.json",
        include_bytes!("../../../../../schemas/kfd-self-conformance/transition-report.schema.json"),
    ),
    (
        "schemas/kfd-self-conformance/vector-registry.schema.json",
        include_bytes!("../../../../../schemas/kfd-self-conformance/vector-registry.schema.json"),
    ),
];

const BUNDLE_FIELDS: &[&str] = &[
    "schemaVersion",
    "contract",
    "profile",
    "bundleId",
    "transition",
    "previousState",
    "previousStateRoot",
    "proposedState",
    "proposedStateRoot",
    "predecessor",
    "evidenceRoots",
    "schemaSetRoot",
    "verifierRoot",
    "authorityReceiptRoot",
    "reviewReceiptRoot",
    "claimBoundary",
    "knownGaps",
    "expectedResult",
    "immutableCoordinates",
];

const CHECKS: &[&str] = &[
    "authority-review-separation",
    "bundle-contract",
    "canonical-json",
    "claim-boundary",
    "expected-result",
    "predecessor-chain",
    "root-binding",
    "set-ordering",
    "transition-state",
];

fn failure(check: &str, code: &str, path: &str, message: impl Into<String>) -> VerificationReport {
    let mut report = VerificationReport::new(REPORT_PROFILE);
    report.check(check, false);
    report.issue(code, path, message);
    report.finish()
}

fn success() -> VerificationReport {
    let mut report = VerificationReport::new(REPORT_PROFILE);
    for check in CHECKS {
        report.check(*check, true);
    }
    report.finish()
}

fn text<'a>(value: &'a Value, pointer: &str) -> Option<&'a str> {
    value.pointer(pointer).and_then(Value::as_str)
}

fn root(value: &str) -> bool {
    value.len() == 71
        && value.starts_with("sha256:")
        && value[7..]
            .bytes()
            .all(|byte| byte.is_ascii_digit() || (b'a'..=b'f').contains(&byte))
}

fn exact_fields(object: &Map<String, Value>, expected: &[&str]) -> bool {
    object.len() == expected.len()
        && object
            .keys()
            .all(|field| expected.contains(&field.as_str()))
}

fn sorted_unique_strings(values: &[Value]) -> bool {
    let Some(strings) = values.iter().map(Value::as_str).collect::<Option<Vec<_>>>() else {
        return false;
    };
    strings.windows(2).all(|pair| pair[0] < pair[1])
}

fn sorted_unique_values(values: &[Value]) -> bool {
    let Some(rendered) = values
        .iter()
        .map(canonical_json)
        .collect::<Result<Vec<_>, _>>()
        .ok()
    else {
        return false;
    };
    rendered.windows(2).all(|pair| pair[0] < pair[1])
}

fn schema_set_root() -> String {
    let entries = SCHEMAS
        .iter()
        .map(|(path, bytes)| {
            json!({
                "path": path,
                "contentRoot": sha256_bytes(bytes),
                "size": bytes.len(),
            })
        })
        .collect::<Vec<_>>();
    semantic_root(&Value::Array(entries)).expect("packaged schema inventory must be canonical")
}

fn state_error(value: &Value, base: &str) -> Option<(String, String)> {
    let Some(object) = value.as_object() else {
        return Some((base.to_owned(), "state must be an object".to_owned()));
    };
    if !exact_fields(
        object,
        &[
            "schemaVersion",
            "contract",
            "profile",
            "subject",
            "semanticState",
            "publicationState",
            "immutableCoordinates",
        ],
    ) || value.pointer("/schemaVersion").and_then(Value::as_u64) != Some(1)
        || text(value, "/contract") != Some("kfd.self-conformance-state/v1")
        || text(value, "/profile") != Some(PROFILE)
    {
        return Some((
            base.to_owned(),
            "state envelope is outside the closed profile contract".to_owned(),
        ));
    }
    let Some(subject) = value.pointer("/subject").and_then(Value::as_object) else {
        return Some((
            format!("{base}/subject"),
            "state subject is malformed".to_owned(),
        ));
    };
    if subject.len() < 2
        || subject
            .keys()
            .any(|field| !["id", "kind", "number"].contains(&field.as_str()))
        || text(value, "/subject/id").is_none_or(str::is_empty)
        || !matches!(
            text(value, "/subject/kind"),
            Some("pressure-field" | "candidate" | "numbered-decision" | "foundation" | "release")
        )
        || value
            .pointer("/subject/number")
            .is_some_and(|number| !matches!(number, Value::Null | Value::Number(_)))
    {
        return Some((
            format!("{base}/subject"),
            "state subject is malformed".to_owned(),
        ));
    }
    if !matches!(
        text(value, "/semanticState"),
        Some(
            "absent"
                | "candidate"
                | "qualified"
                | "numbered-draft"
                | "active"
                | "superseded"
                | "foundation-revised"
                | "revised"
                | "rejected"
                | "provisional"
                | "no-new-kfd"
        )
    ) || !matches!(
        text(value, "/publicationState"),
        Some("unpublished" | "packaged")
    ) {
        return Some((
            base.to_owned(),
            "state vocabulary is unsupported".to_owned(),
        ));
    }
    let Some(coordinate) = value
        .pointer("/immutableCoordinates")
        .and_then(Value::as_object)
    else {
        return Some((
            format!("{base}/immutableCoordinates"),
            "immutable state coordinate is incomplete or malformed".to_owned(),
        ));
    };
    let allowed = [
        "repository",
        "commit",
        "path",
        "contentRoot",
        "packageVersion",
        "packageRoot",
    ];
    if coordinate.len() < 4
        || coordinate
            .keys()
            .any(|field| !allowed.contains(&field.as_str()))
        || text(value, "/immutableCoordinates/repository").is_none_or(str::is_empty)
        || text(value, "/immutableCoordinates/path").is_none_or(str::is_empty)
        || !text(value, "/immutableCoordinates/commit").is_some_and(|commit| {
            commit.len() == 40
                && commit
                    .bytes()
                    .all(|byte| byte.is_ascii_hexdigit() && !byte.is_ascii_uppercase())
        })
        || !text(value, "/immutableCoordinates/contentRoot").is_some_and(root)
        || text(value, "/immutableCoordinates/packageRoot").is_some_and(|value| !root(value))
    {
        return Some((
            format!("{base}/immutableCoordinates"),
            "immutable state coordinate is incomplete or malformed".to_owned(),
        ));
    }
    None
}

fn transition_rule(transition: &str) -> Option<(&'static [&'static str], Option<&'static str>)> {
    match transition {
        "candidate-genesis" => Some((&["absent"], Some("candidate"))),
        "candidate-qualification" => {
            Some((&["candidate", "revised", "provisional"], Some("qualified")))
        }
        "numbered-draft-promotion" => Some((&["qualified"], Some("numbered-draft"))),
        "activation" => Some((&["numbered-draft"], Some("active"))),
        "supersession" => Some((&["active"], Some("superseded"))),
        "foundation-revision" => Some((&["numbered-draft", "active"], Some("foundation-revised"))),
        "release-packaging" => Some((&[], None)),
        "revision-required" => Some((&["candidate", "qualified"], Some("revised"))),
        "rejection" => Some((
            &["candidate", "qualified", "revised", "provisional"],
            Some("rejected"),
        )),
        "provisional-retention" => Some((
            &["candidate", "qualified", "revised", "provisional"],
            Some("provisional"),
        )),
        "no-new-kfd" => Some((
            &["absent", "candidate", "qualified", "revised", "provisional"],
            Some("no-new-kfd"),
        )),
        _ => None,
    }
}

fn claim_overreaches(value: &str) -> bool {
    let value = value.to_ascii_lowercase();
    [
        "proves semantic truth",
        "prove semantic truth",
        "certifies",
        "is certified",
        "release is authorized",
        "release is authorised",
        "human approval is proven",
        "proves adoption",
        "prove adoption",
    ]
    .iter()
    .any(|phrase| value.contains(phrase))
}

pub fn verify(bundle: &VerificationBundle) -> VerificationReport {
    let value = match parse_strict_json(&bundle.primary) {
        Ok(value) => value,
        Err(error) => return failure("canonical-json", "scp-contract-invalid", "/", error),
    };
    if let Err(error) = canonical_json(&value) {
        return failure(
            "canonical-json",
            "scp-contract-invalid",
            "/",
            format!("input is outside the canonical JSON domain: {error}"),
        );
    }
    let Some(object) = value.as_object() else {
        return failure(
            "bundle-contract",
            "scp-contract-invalid",
            "/",
            "transition bundle must be an object",
        );
    };
    if object.contains_key("reportRoot") {
        return failure(
            "root-binding",
            "scp-self-containing-report",
            "/reportRoot",
            "current report roots are excluded from the bundle preimage",
        );
    }
    if object.contains_key("packageRoot") {
        return failure(
            "root-binding",
            "scp-self-containing-package",
            "/packageRoot",
            "current package roots are excluded from the bundle preimage",
        );
    }
    if object
        .keys()
        .any(|field| !BUNDLE_FIELDS.contains(&field.as_str()))
        || value.pointer("/schemaVersion").and_then(Value::as_u64) != Some(1)
        || text(&value, "/bundleId").is_none_or(str::is_empty)
    {
        return failure(
            "bundle-contract",
            "scp-contract-invalid",
            "/",
            "bundle fields, schemaVersion, and bundleId must match the closed v1 contract",
        );
    }
    if text(&value, "/contract") != Some("kfd.self-conformance-transition-bundle/v1") {
        return failure(
            "bundle-contract",
            "scp-contract-invalid",
            "/contract",
            "unsupported transition bundle contract",
        );
    }
    if text(&value, "/profile") != Some(PROFILE) {
        return failure(
            "bundle-contract",
            "scp-profile-version-unsupported",
            "/profile",
            "unsupported Self-Conformance Profile version",
        );
    }
    let Some(transition) = text(&value, "/transition") else {
        return failure(
            "transition-state",
            "scp-transition-unsupported",
            "/transition",
            "transition is missing",
        );
    };
    let Some((allowed_previous, proposed_semantic)) = transition_rule(transition) else {
        return failure(
            "transition-state",
            "scp-transition-unsupported",
            "/transition",
            "unknown transition fails closed",
        );
    };

    let Some(evidence_roots) = value.pointer("/evidenceRoots").and_then(Value::as_array) else {
        return failure(
            "root-binding",
            "scp-evidence-roots-missing",
            "/evidenceRoots",
            "at least one evidence root is required",
        );
    };
    if evidence_roots.is_empty() {
        return failure(
            "root-binding",
            "scp-evidence-roots-missing",
            "/evidenceRoots",
            "at least one evidence root is required",
        );
    }
    if evidence_roots
        .iter()
        .any(|value| !value.as_str().is_some_and(root))
    {
        return failure(
            "root-binding",
            "scp-contract-invalid",
            "/evidenceRoots",
            "evidence roots must use canonical sha256 coordinates",
        );
    }
    if !sorted_unique_strings(evidence_roots) {
        return failure(
            "set-ordering",
            "scp-set-order-invalid",
            "/evidenceRoots",
            "root sets must be strictly UTF-8 sorted and unique",
        );
    }

    let Some(previous) = value.get("previousState") else {
        return failure(
            "bundle-contract",
            "scp-contract-invalid",
            "/previousState",
            "previous state is required",
        );
    };
    let Some(proposed) = value.get("proposedState") else {
        return failure(
            "bundle-contract",
            "scp-contract-invalid",
            "/proposedState",
            "proposed state is required",
        );
    };
    if let Some((path, message)) = state_error(previous, "/previousState") {
        return failure("bundle-contract", "scp-contract-invalid", &path, message);
    }
    if let Some((path, message)) = state_error(proposed, "/proposedState") {
        return failure("bundle-contract", "scp-contract-invalid", &path, message);
    }
    let previous_root = semantic_root(previous).expect("canonical bundle contains canonical state");
    let proposed_root = semantic_root(proposed).expect("canonical bundle contains canonical state");
    if text(&value, "/previousStateRoot") != Some(previous_root.as_str()) {
        return failure(
            "root-binding",
            "scp-predecessor-root-mismatch",
            "/previousStateRoot",
            "previous state root does not recompute",
        );
    }
    if text(&value, "/proposedStateRoot") != Some(proposed_root.as_str()) {
        return failure(
            "root-binding",
            "scp-proposed-root-mismatch",
            "/proposedStateRoot",
            "proposed state root does not recompute",
        );
    }
    if text(&value, "/schemaSetRoot") != Some(schema_set_root().as_str()) {
        return failure(
            "root-binding",
            "scp-schema-set-root-mismatch",
            "/schemaSetRoot",
            "schema-set root does not match the packaged profile",
        );
    }
    if !text(&value, "/verifierRoot").is_some_and(root) {
        return failure(
            "root-binding",
            "scp-verifier-root-missing",
            "/verifierRoot",
            "an exact verifier root is required",
        );
    }
    if !text(&value, "/authorityReceiptRoot").is_some_and(root) {
        return failure(
            "authority-review-separation",
            "scp-authority-receipt-missing",
            "/authorityReceiptRoot",
            "an authority receipt root is required",
        );
    }
    if !text(&value, "/reviewReceiptRoot").is_some_and(root) {
        return failure(
            "authority-review-separation",
            "scp-review-receipt-missing",
            "/reviewReceiptRoot",
            "an independent-review receipt root is required",
        );
    }
    let authority_root = text(&value, "/authorityReceiptRoot").expect("validated root");
    let review_root = text(&value, "/reviewReceiptRoot").expect("validated root");
    let verifier_root = text(&value, "/verifierRoot").expect("validated root");
    let evidence = evidence_roots
        .iter()
        .filter_map(Value::as_str)
        .collect::<BTreeSet<_>>();
    if authority_root == review_root
        || authority_root == verifier_root
        || review_root == verifier_root
        || evidence.contains(authority_root)
        || evidence.contains(review_root)
        || evidence.contains(verifier_root)
    {
        return failure(
            "authority-review-separation",
            "scp-root-substitution",
            "/authorityReceiptRoot",
            "evidence, verifier, authority, and review roles require distinct roots",
        );
    }

    let Some(claim_boundary) =
        text(&value, "/claimBoundary").filter(|value| !value.trim().is_empty())
    else {
        return failure(
            "claim-boundary",
            "scp-claim-boundary-missing",
            "/claimBoundary",
            "an explicit claim boundary is required",
        );
    };
    if claim_overreaches(claim_boundary) {
        return failure(
            "claim-boundary",
            "scp-claim-overreach",
            "/claimBoundary",
            "structural verification cannot claim semantic or governance authority",
        );
    }
    let Some(known_gaps) = value.pointer("/knownGaps").and_then(Value::as_array) else {
        return failure(
            "bundle-contract",
            "scp-known-gaps-missing",
            "/knownGaps",
            "known gaps must be explicit, including an empty array",
        );
    };
    if known_gaps
        .iter()
        .any(|value| !value.as_str().is_some_and(|text| !text.is_empty()))
    {
        return failure(
            "bundle-contract",
            "scp-contract-invalid",
            "/knownGaps",
            "known gaps must be non-empty strings",
        );
    }
    if known_gaps.len() > 1 && !sorted_unique_strings(known_gaps) {
        return failure(
            "set-ordering",
            "scp-set-order-invalid",
            "/knownGaps",
            "known gaps must be strictly UTF-8 sorted and unique",
        );
    }
    let Some(coordinates) = value
        .pointer("/immutableCoordinates")
        .and_then(Value::as_array)
    else {
        return failure(
            "bundle-contract",
            "scp-immutable-coordinate-missing",
            "/immutableCoordinates",
            "at least one immutable coordinate is required",
        );
    };
    if coordinates.is_empty() {
        return failure(
            "bundle-contract",
            "scp-immutable-coordinate-missing",
            "/immutableCoordinates",
            "at least one immutable coordinate is required",
        );
    }
    for (index, coordinate) in coordinates.iter().enumerate() {
        let Some(object) = coordinate.as_object() else {
            return failure(
                "bundle-contract",
                "scp-contract-invalid",
                &format!("/immutableCoordinates/{index}"),
                "immutable coordinate must be an object",
            );
        };
        if !exact_fields(object, &["kind", "value", "root"])
            || !matches!(
                text(coordinate, "/kind"),
                Some("git" | "package" | "artifact" | "document")
            )
            || text(coordinate, "/value").is_none_or(str::is_empty)
            || !text(coordinate, "/root").is_some_and(root)
        {
            return failure(
                "bundle-contract",
                "scp-contract-invalid",
                &format!("/immutableCoordinates/{index}"),
                "immutable coordinate is malformed",
            );
        }
    }
    if coordinates.len() > 1 && !sorted_unique_values(coordinates) {
        return failure(
            "set-ordering",
            "scp-set-order-invalid",
            "/immutableCoordinates",
            "immutable coordinates must be canonically sorted and unique",
        );
    }

    let Some(predecessor) = value.pointer("/predecessor").and_then(Value::as_object) else {
        return failure(
            "predecessor-chain",
            "scp-predecessor-root-mismatch",
            "/predecessor",
            "predecessor coordinates are required",
        );
    };
    if !exact_fields(
        predecessor,
        &["kind", "bootstrapAnchorRoot", "reportRoot", "packageRoot"],
    ) {
        return failure(
            "predecessor-chain",
            "scp-predecessor-root-mismatch",
            "/predecessor",
            "predecessor coordinates are incomplete",
        );
    }
    match text(&value, "/predecessor/kind") {
        Some("bootstrap") => {
            let anchor =
                parse_strict_json(BOOTSTRAP_ANCHOR).expect("packaged bootstrap anchor must parse");
            let anchor_root =
                semantic_root(&anchor).expect("packaged bootstrap anchor must be canonical");
            if transition != "candidate-genesis"
                || text(&value, "/predecessor/bootstrapAnchorRoot") != Some(anchor_root.as_str())
                || !value
                    .pointer("/predecessor/reportRoot")
                    .is_some_and(Value::is_null)
                || text(&value, "/predecessor/packageRoot") != text(&anchor, "/packageRoot")
                || text(&value, "/previousStateRoot") != text(&anchor, "/stateRoot")
            {
                return failure(
                    "predecessor-chain",
                    "scp-bootstrap-anchor-invalid",
                    "/predecessor",
                    "bootstrap predecessor does not match the reviewed anchor",
                );
            }
        }
        Some("report") => {
            let report_root = text(&value, "/predecessor/reportRoot");
            let package_root = text(&value, "/predecessor/packageRoot");
            if !value
                .pointer("/predecessor/bootstrapAnchorRoot")
                .is_some_and(Value::is_null)
                || !report_root.is_some_and(root)
                || !package_root.is_some_and(root)
            {
                return failure(
                    "predecessor-chain",
                    "scp-predecessor-root-mismatch",
                    "/predecessor",
                    "report predecessor roots are incomplete",
                );
            }
            let report_root = report_root.expect("validated root");
            let package_root = package_root.expect("validated root");
            let component_roots = [
                previous_root.as_str(),
                proposed_root.as_str(),
                authority_root,
                review_root,
                verifier_root,
            ];
            if report_root == package_root
                || component_roots.contains(&report_root)
                || component_roots.contains(&package_root)
                || evidence.contains(report_root)
                || evidence.contains(package_root)
            {
                return failure(
                    "predecessor-chain",
                    "scp-root-conflict",
                    "/predecessor",
                    "predecessor roots are circular, conflicting, or substituted",
                );
            }
        }
        _ => {
            return failure(
                "predecessor-chain",
                "scp-predecessor-root-mismatch",
                "/predecessor/kind",
                "predecessor kind is unsupported",
            )
        }
    }

    let same_subject = previous.get("subject") == proposed.get("subject");
    let previous_semantic = text(previous, "/semanticState").unwrap_or("");
    let proposed_value = text(proposed, "/semanticState").unwrap_or("");
    let previous_publication = text(previous, "/publicationState").unwrap_or("");
    let proposed_publication = text(proposed, "/publicationState").unwrap_or("");
    let transition_valid = if transition == "release-packaging" {
        same_subject
            && previous_semantic == proposed_value
            && previous_publication == "unpublished"
            && proposed_publication == "packaged"
    } else {
        same_subject
            && allowed_previous.contains(&previous_semantic)
            && proposed_semantic == Some(proposed_value)
            && previous_publication == proposed_publication
    };
    if !transition_valid {
        return failure(
            "transition-state",
            "scp-transition-state-invalid",
            "/proposedState",
            "proposed state is not allowed for this transition",
        );
    }
    if text(&value, "/expectedResult") != Some("pass") {
        return failure(
            "expected-result",
            "scp-expected-result-mismatch",
            "/expectedResult",
            "a structurally valid fixed bundle must expect pass",
        );
    }
    success()
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::BTreeMap;

    fn fixed_bundle() -> VerificationBundle {
        let registry = parse_strict_json(include_str!(
            "../../../../../profiles/self-conformance/vectors/contract-vectors.json"
        ))
        .expect("fixed vectors must parse");
        VerificationBundle {
            schema_version: 1,
            contract: "kfd.verification-bundle/v1".to_owned(),
            kind: "self-conformance-transition".to_owned(),
            primary: canonical_json(registry.pointer("/base/bundle").expect("base bundle"))
                .expect("base bundle must render"),
            artifacts: BTreeMap::new(),
        }
    }

    #[test]
    fn fixed_bootstrap_transition_passes_without_authority_claims() {
        let report = verify(&fixed_bundle());
        assert!(report.valid);
        assert!(!report.qualifying);
        assert!(!report.self_certified);
        assert!(report.offline);
    }

    #[test]
    fn duplicate_json_keys_fail_closed() {
        let mut bundle = fixed_bundle();
        bundle.primary = "{\"schemaVersion\":1,\"schemaVersion\":1}".to_owned();
        let report = verify(&bundle);
        assert!(!report.valid);
        assert_eq!(report.issues[0].code, "scp-contract-invalid");
    }
}
