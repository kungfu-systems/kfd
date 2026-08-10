// SPDX-License-Identifier: Apache-2.0

use crate::{
    canonical_json, parse_strict_json, semantic_root, VerificationBundle, VerificationReport,
};
use serde_json::{Map, Value};
use std::collections::{BTreeMap, BTreeSet};

const REPORT_PROFILE: &str = "kfd.self-conformance-history/v1";
const CONTRACT: &str = "kfd.self-conformance-historical-replay/v1";
const PROFILE: &str = "kfd-self-conformance@1.0.0-alpha.1";
const TOP_FIELDS: &[&str] = &[
    "schemaVersion",
    "contract",
    "profile",
    "reportId",
    "retrospective",
    "profileAvailableAtEvent",
    "generatedFromImmutableSources",
    "sources",
    "foundation",
    "episodes",
    "outcomes",
    "convergence",
    "claimBoundary",
];
const SOURCE_FIELDS: &[&str] = &[
    "id",
    "kind",
    "repository",
    "commit",
    "path",
    "contentRoot",
    "payload",
];
const EPISODE_FIELDS: &[&str] = &[
    "sequence",
    "id",
    "subjectId",
    "transition",
    "before",
    "after",
    "terminalAtEvent",
    "sourceIds",
    "authoritySourceId",
    "reviewSourceId",
    "retrospective",
    "profileAvailableAtEvent",
    "numberingMappings",
    "claimBoundary",
];
const CHECKS: &[&str] = &[
    "canonical-json",
    "contract",
    "foundation-cut",
    "immutable-source-roots",
    "independent-review",
    "retrospective-boundary",
    "state-transitions",
    "terminal-outcomes",
    "live-convergence",
    "claim-boundary",
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

fn exact_fields(object: &Map<String, Value>, expected: &[&str]) -> bool {
    object.len() == expected.len() && object.keys().all(|key| expected.contains(&key.as_str()))
}

fn root(value: &str) -> bool {
    value.len() == 71
        && value.starts_with("sha256:")
        && value[7..]
            .bytes()
            .all(|byte| byte.is_ascii_digit() || (b'a'..=b'f').contains(&byte))
}

fn commit(value: &str) -> bool {
    value.len() == 40
        && value
            .bytes()
            .all(|byte| byte.is_ascii_hexdigit() && !byte.is_ascii_uppercase())
}

fn sorted_unique_strings(values: &[Value]) -> bool {
    let Some(strings) = values.iter().map(Value::as_str).collect::<Option<Vec<_>>>() else {
        return false;
    };
    strings.windows(2).all(|pair| pair[0] < pair[1])
}

fn transition_allowed(transition: &str, before: &str, after: &str) -> bool {
    matches!(
        (transition, before, after),
        ("candidate-genesis", "absent", "candidate")
            | ("candidate-refinement", "candidate", "candidate")
            | ("numbered-draft-promotion", "candidate", "numbered-draft")
            | ("numbered-draft-observation", "absent", "numbered-draft")
            | (
                "qualification",
                "numbered-draft",
                "qualified-numbered-draft"
            )
            | ("activation", "qualified-numbered-draft", "active")
            | ("release-packaging", "active", "active-packaged")
            | (
                "foundation-revision",
                "numbered-draft",
                "foundation-revised-draft"
            )
            | ("foundation-allocation", "absent", "numbered-draft")
            | ("no-new-kfd", "candidate", "no-new-kfd")
    )
}

fn claim_overreaches(value: &str) -> bool {
    let value = value.to_ascii_lowercase();
    [
        "proves semantic truth",
        "certifies",
        "release is authorized",
        "proves adoption",
    ]
    .iter()
    .any(|phrase| value.contains(phrase))
}

pub fn verify(bundle: &VerificationBundle) -> VerificationReport {
    let value = match parse_strict_json(&bundle.primary) {
        Ok(value) => value,
        Err(error) => return failure("canonical-json", "sch-contract-invalid", "/", error),
    };
    if let Err(error) = canonical_json(&value) {
        return failure("canonical-json", "sch-contract-invalid", "/", error);
    }
    let Some(object) = value.as_object() else {
        return failure(
            "contract",
            "sch-contract-invalid",
            "/",
            "historical replay must be an object",
        );
    };
    if !exact_fields(object, TOP_FIELDS)
        || value.pointer("/schemaVersion").and_then(Value::as_u64) != Some(1)
        || text(&value, "/contract") != Some(CONTRACT)
        || text(&value, "/profile") != Some(PROFILE)
        || text(&value, "/reportId").is_none_or(str::is_empty)
    {
        return failure(
            "contract",
            "sch-contract-invalid",
            "/",
            "historical replay is outside the closed v1 contract",
        );
    }
    if value.pointer("/retrospective").and_then(Value::as_bool) != Some(true)
        || value
            .pointer("/profileAvailableAtEvent")
            .and_then(Value::as_bool)
            != Some(false)
        || value
            .pointer("/generatedFromImmutableSources")
            .and_then(Value::as_bool)
            != Some(true)
    {
        return failure(
            "retrospective-boundary",
            "sch-temporal-boundary-invalid",
            "/",
            "historical replay must declare retrospective=true and profileAvailableAtEvent=false",
        );
    }
    let Some(claim_boundary) =
        text(&value, "/claimBoundary").filter(|entry| !entry.trim().is_empty())
    else {
        return failure(
            "claim-boundary",
            "sch-claim-boundary-missing",
            "/claimBoundary",
            "an explicit claim boundary is required",
        );
    };
    if claim_overreaches(claim_boundary) {
        return failure(
            "claim-boundary",
            "sch-claim-overreach",
            "/claimBoundary",
            "historical structural replay cannot claim semantic or governance authority",
        );
    }

    let Some(sources) = value
        .pointer("/sources")
        .and_then(Value::as_array)
        .filter(|items| !items.is_empty())
    else {
        return failure(
            "immutable-source-roots",
            "sch-source-missing",
            "/sources",
            "at least one immutable source is required",
        );
    };
    let mut source_roots = BTreeMap::new();
    let mut previous_source_id: Option<&str> = None;
    for (index, source) in sources.iter().enumerate() {
        let Some(source_object) = source.as_object() else {
            return failure(
                "immutable-source-roots",
                "sch-source-invalid",
                &format!("/sources/{index}"),
                "source must be an object",
            );
        };
        if !exact_fields(source_object, SOURCE_FIELDS) {
            return failure(
                "immutable-source-roots",
                "sch-source-invalid",
                &format!("/sources/{index}"),
                "source fields must match the closed contract",
            );
        }
        let Some(id) = text(source, "/id").filter(|entry| !entry.is_empty()) else {
            return failure(
                "immutable-source-roots",
                "sch-source-invalid",
                &format!("/sources/{index}/id"),
                "source id is required",
            );
        };
        if previous_source_id.is_some_and(|previous| previous >= id) {
            return failure(
                "immutable-source-roots",
                "sch-set-order-invalid",
                "/sources",
                "sources must be strictly id-sorted and unique",
            );
        }
        previous_source_id = Some(id);
        if !matches!(
            text(source, "/kind"),
            Some("git-document" | "git-registry" | "github-pr" | "npm-package")
        ) || text(source, "/repository").is_none_or(str::is_empty)
            || text(source, "/path").is_none_or(str::is_empty)
            || source
                .pointer("/commit")
                .is_none_or(|entry| !entry.is_null() && !entry.as_str().is_some_and(commit))
        {
            return failure(
                "immutable-source-roots",
                "sch-source-invalid",
                &format!("/sources/{index}"),
                "source coordinate is malformed",
            );
        }
        let Some(payload) = source.get("payload") else {
            return failure(
                "immutable-source-roots",
                "sch-source-invalid",
                &format!("/sources/{index}/payload"),
                "source payload is required for offline replay",
            );
        };
        let computed = match semantic_root(payload) {
            Ok(root) => root,
            Err(error) => {
                return failure(
                    "immutable-source-roots",
                    "sch-source-invalid",
                    &format!("/sources/{index}/payload"),
                    error,
                )
            }
        };
        if text(source, "/contentRoot") != Some(computed.as_str()) {
            return failure(
                "immutable-source-roots",
                "sch-source-root-mismatch",
                &format!("/sources/{index}/contentRoot"),
                "source payload root does not recompute",
            );
        }
        source_roots.insert(id, computed);
    }

    let Some(foundation) = value.pointer("/foundation").and_then(Value::as_object) else {
        return failure(
            "foundation-cut",
            "sch-foundation-invalid",
            "/foundation",
            "foundation cut is required",
        );
    };
    let required_foundation = [
        "id",
        "gitCommit",
        "gitTag",
        "packageName",
        "packageVersion",
        "packageRoot",
        "registrySourceId",
        "authoritySourceId",
        "reviewSourceId",
        "active",
        "draft",
        "absent",
    ];
    if !exact_fields(foundation, &required_foundation)
        || !text(&value, "/foundation/gitCommit").is_some_and(commit)
        || !text(&value, "/foundation/packageRoot").is_some_and(root)
    {
        return failure(
            "foundation-cut",
            "sch-foundation-invalid",
            "/foundation",
            "foundation cut is malformed",
        );
    }
    for field in ["registrySourceId", "authoritySourceId", "reviewSourceId"] {
        if !text(&value, &format!("/foundation/{field}"))
            .is_some_and(|id| source_roots.contains_key(id))
        {
            return failure(
                "foundation-cut",
                "sch-foundation-invalid",
                &format!("/foundation/{field}"),
                "foundation source is not closed by the replay",
            );
        }
    }
    if text(&value, "/foundation/authoritySourceId") == text(&value, "/foundation/reviewSourceId") {
        return failure(
            "independent-review",
            "sch-review-not-independent",
            "/foundation/reviewSourceId",
            "authority and review sources must remain distinct",
        );
    }
    for field in ["active", "draft", "absent"] {
        let Some(entries) = value
            .pointer(&format!("/foundation/{field}"))
            .and_then(Value::as_array)
        else {
            return failure(
                "foundation-cut",
                "sch-foundation-invalid",
                &format!("/foundation/{field}"),
                "foundation state sets are required",
            );
        };
        if entries.len() > 1 && !sorted_unique_strings(entries) {
            return failure(
                "foundation-cut",
                "sch-set-order-invalid",
                &format!("/foundation/{field}"),
                "foundation state sets must be sorted and unique",
            );
        }
    }

    let Some(episodes) = value
        .pointer("/episodes")
        .and_then(Value::as_array)
        .filter(|items| !items.is_empty())
    else {
        return failure(
            "state-transitions",
            "sch-episode-missing",
            "/episodes",
            "at least one historical episode is required",
        );
    };
    let mut terminal = BTreeMap::<&str, &str>::new();
    for (index, episode) in episodes.iter().enumerate() {
        let Some(episode_object) = episode.as_object() else {
            return failure(
                "state-transitions",
                "sch-episode-invalid",
                &format!("/episodes/{index}"),
                "episode must be an object",
            );
        };
        if !exact_fields(episode_object, EPISODE_FIELDS)
            || episode.pointer("/sequence").and_then(Value::as_u64) != Some((index + 1) as u64)
            || text(episode, "/id").is_none_or(str::is_empty)
            || text(episode, "/subjectId").is_none_or(str::is_empty)
            || episode
                .pointer("/terminalAtEvent")
                .and_then(Value::as_bool)
                .is_none()
        {
            return failure(
                "state-transitions",
                "sch-episode-invalid",
                &format!("/episodes/{index}"),
                "episode fields or sequence are invalid",
            );
        }
        if episode.pointer("/retrospective").and_then(Value::as_bool) != Some(true)
            || episode
                .pointer("/profileAvailableAtEvent")
                .and_then(Value::as_bool)
                != Some(false)
        {
            return failure(
                "retrospective-boundary",
                "sch-temporal-boundary-invalid",
                &format!("/episodes/{index}"),
                "every historical episode must preserve the retrospective boundary",
            );
        }
        let transition = text(episode, "/transition").unwrap_or("");
        let before = text(episode, "/before").unwrap_or("");
        let after = text(episode, "/after").unwrap_or("");
        if !transition_allowed(transition, before, after) {
            return failure(
                "state-transitions",
                "sch-transition-invalid",
                &format!("/episodes/{index}"),
                "historical state transition is unsupported",
            );
        }
        let Some(source_ids) = episode
            .pointer("/sourceIds")
            .and_then(Value::as_array)
            .filter(|items| !items.is_empty())
        else {
            return failure(
                "immutable-source-roots",
                "sch-source-missing",
                &format!("/episodes/{index}/sourceIds"),
                "episode source closure is required",
            );
        };
        if source_ids.len() > 1 && !sorted_unique_strings(source_ids) {
            return failure(
                "immutable-source-roots",
                "sch-set-order-invalid",
                &format!("/episodes/{index}/sourceIds"),
                "episode sources must be sorted and unique",
            );
        }
        if source_ids
            .iter()
            .any(|id| !id.as_str().is_some_and(|id| source_roots.contains_key(id)))
        {
            return failure(
                "immutable-source-roots",
                "sch-source-missing",
                &format!("/episodes/{index}/sourceIds"),
                "episode references an unknown source",
            );
        }
        let authority = text(episode, "/authoritySourceId");
        let review = text(episode, "/reviewSourceId");
        if authority == review
            || !authority.is_some_and(|id| source_roots.contains_key(id))
            || !review.is_some_and(|id| source_roots.contains_key(id))
        {
            return failure(
                "independent-review",
                "sch-review-not-independent",
                &format!("/episodes/{index}"),
                "episode authority and independent review sources must be distinct and closed",
            );
        }
        let Some(boundary) =
            text(episode, "/claimBoundary").filter(|entry| !entry.trim().is_empty())
        else {
            return failure(
                "claim-boundary",
                "sch-claim-boundary-missing",
                &format!("/episodes/{index}/claimBoundary"),
                "episode claim boundary is required",
            );
        };
        if claim_overreaches(boundary) {
            return failure(
                "claim-boundary",
                "sch-claim-overreach",
                &format!("/episodes/{index}/claimBoundary"),
                "episode claim boundary overreaches structural replay",
            );
        }
        let Some(mappings) = episode
            .pointer("/numberingMappings")
            .and_then(Value::as_array)
        else {
            return failure(
                "state-transitions",
                "sch-episode-invalid",
                &format!("/episodes/{index}/numberingMappings"),
                "numbering mappings must be explicit, including an empty array",
            );
        };
        for (mapping_index, mapping) in mappings.iter().enumerate() {
            let Some(mapping) = mapping.as_object() else {
                return failure(
                    "state-transitions",
                    "sch-episode-invalid",
                    &format!("/episodes/{index}/numberingMappings/{mapping_index}"),
                    "numbering mapping must be an object",
                );
            };
            if !exact_fields(mapping, &["from", "to", "relation"])
                || mapping.get("from").is_none_or(|entry| {
                    !entry.is_null() && !entry.as_str().is_some_and(|text| !text.is_empty())
                })
                || mapping
                    .get("to")
                    .and_then(Value::as_str)
                    .is_none_or(str::is_empty)
                || mapping
                    .get("relation")
                    .and_then(Value::as_str)
                    .is_none_or(str::is_empty)
            {
                return failure(
                    "state-transitions",
                    "sch-episode-invalid",
                    &format!("/episodes/{index}/numberingMappings/{mapping_index}"),
                    "numbering mapping is malformed",
                );
            }
        }
        terminal.insert(text(episode, "/subjectId").unwrap_or(""), after);
    }

    let Some(outcomes) = value.pointer("/outcomes").and_then(Value::as_array) else {
        return failure(
            "terminal-outcomes",
            "sch-outcome-invalid",
            "/outcomes",
            "terminal outcomes are required",
        );
    };
    let mut seen = BTreeSet::new();
    for (index, outcome) in outcomes.iter().enumerate() {
        let Some(outcome) = outcome.as_object() else {
            return failure(
                "terminal-outcomes",
                "sch-outcome-invalid",
                &format!("/outcomes/{index}"),
                "outcome must be an object",
            );
        };
        if !exact_fields(
            outcome,
            &["subjectId", "terminalState", "normativePromotionClaimed"],
        ) || outcome
            .get("normativePromotionClaimed")
            .and_then(Value::as_bool)
            != Some(false)
        {
            return failure(
                "terminal-outcomes",
                "sch-outcome-invalid",
                &format!("/outcomes/{index}"),
                "outcome must preserve the non-promotional replay boundary",
            );
        }
        let subject = outcome
            .get("subjectId")
            .and_then(Value::as_str)
            .unwrap_or("");
        let state = outcome
            .get("terminalState")
            .and_then(Value::as_str)
            .unwrap_or("");
        if !seen.insert(subject) || terminal.get(subject).copied() != Some(state) {
            return failure(
                "terminal-outcomes",
                "sch-outcome-mismatch",
                &format!("/outcomes/{index}"),
                "declared outcome does not match the final replay episode",
            );
        }
    }
    if seen.len() != terminal.len() {
        return failure(
            "terminal-outcomes",
            "sch-outcome-mismatch",
            "/outcomes",
            "every replayed subject requires one terminal outcome",
        );
    }

    let Some(convergence) = value.pointer("/convergence").and_then(Value::as_object) else {
        return failure(
            "live-convergence",
            "sch-convergence-invalid",
            "/convergence",
            "live convergence is required",
        );
    };
    if !exact_fields(
        convergence,
        &[
            "historicalTerminalSourceId",
            "liveAnchorSourceId",
            "liveAnchorId",
            "liveAnchorRoot",
            "livePackageRoot",
            "compatibility",
            "historicalDoesNotReplaceLive",
        ],
    ) || text(&value, "/convergence/compatibility") != Some("additive")
        || value
            .pointer("/convergence/historicalDoesNotReplaceLive")
            .and_then(Value::as_bool)
            != Some(true)
        || !text(&value, "/convergence/liveAnchorRoot").is_some_and(root)
        || !text(&value, "/convergence/livePackageRoot").is_some_and(root)
        || !text(&value, "/convergence/historicalTerminalSourceId")
            .is_some_and(|id| source_roots.contains_key(id))
    {
        return failure(
            "live-convergence",
            "sch-convergence-invalid",
            "/convergence",
            "historical replay must converge additively without replacing the live anchor",
        );
    }
    let Some(live_source_id) = text(&value, "/convergence/liveAnchorSourceId") else {
        return failure(
            "live-convergence",
            "sch-convergence-invalid",
            "/convergence/liveAnchorSourceId",
            "live anchor source is required",
        );
    };
    if source_roots.get(live_source_id).map(String::as_str)
        != text(&value, "/convergence/liveAnchorRoot")
    {
        return failure(
            "live-convergence",
            "sch-convergence-root-mismatch",
            "/convergence/liveAnchorRoot",
            "live anchor root does not match its immutable source payload",
        );
    }
    success()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn published_history_replays() {
        let bundle = VerificationBundle {
            schema_version: 1,
            contract: "kfd.verification-bundle/v1".to_owned(),
            kind: "self-conformance-history".to_owned(),
            primary: include_str!(
                "../../../../../profiles/self-conformance/history/historical-lineage.report.json"
            )
            .to_owned(),
            artifacts: BTreeMap::new(),
        };
        assert!(verify(&bundle).valid);
    }
}
