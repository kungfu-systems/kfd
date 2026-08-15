// SPDX-License-Identifier: Apache-2.0
use std::io::{self, BufRead};

fn string_field<'a>(line: &'a str, name: &str) -> Option<&'a str> {
    let key = format!("\"{name}\"");
    let after_key = &line[line.find(&key)? + key.len()..];
    let after_colon = &after_key[after_key.find(':')? + 1..];
    let start = after_colon.find('"')? + 1;
    let value = &after_colon[start..];
    let mut escaped = false;
    for (index, byte) in value.bytes().enumerate() {
        if byte == b'"' && !escaped {
            return Some(&value[..index]);
        }
        escaped = byte == b'\\' && !escaped;
        if byte != b'\\' {
            escaped = false;
        }
    }
    None
}

fn response(line: &str) -> Result<String, &'static str> {
    let request_id = string_field(line, "requestId").ok_or("missing requestId")?;
    let operation = string_field(line, "operation").ok_or("missing operation")?;
    let adapter = r#"{"id":"replace-with-rust-adapter-id","version":"0.0.0","topology":"replace-with-topology"}"#;
    let capabilities_a = r#"{"$schema":"https://kfd.libkungfu.dev/schemas/kfd-agent-hub/capabilities.schema.json","schemaVersion":1,"contract":"kfd-agent-hub-capabilities","identity":{"hubId":"starter-hub-a","nodeId":"starter-hub-a-node","actorId":"starter-hub-a-actor"},"profileVersions":["0.1.0-alpha.1"],"requiredFeatures":["transport-receipts"],"optionalFeatures":[],"operations":["capability-advertisement","responsibility-proposal","fact-admission","supersession","completion-assessment","warrant-revocation"],"topologies":["local-peer"],"disclosureModes":["full","partial","redacted","reference-only","intentionally-withheld"],"failureCodes":["profile-version-unsupported","profile-root-mismatch","required-feature-unsupported","identity-unresolved","authority-unresolved","authority-expired","authority-revoked","authority-amplification","fact-cut-unavailable","causal-gap","payload-digest-mismatch","idempotency-conflict","conflict-visible","disclosure-insufficient","required-field-withheld","completion-unproved","local-policy-rejected"],"bindings":[{"id":"jsonl-stdio","mediaTypes":["application/json"],"authentication":"local-process","transportReceipts":true,"duplicateDelivery":"at-least-once"}],"limits":{"maxInlineBytes":65536,"maxEnvelopeBytes":1048576},"authorityRoots":["sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"],"issuedAt":"2026-08-15T00:00:00.000Z"}"#;
    let capabilities_b = r#"{"$schema":"https://kfd.libkungfu.dev/schemas/kfd-agent-hub/capabilities.schema.json","schemaVersion":1,"contract":"kfd-agent-hub-capabilities","identity":{"hubId":"starter-hub-b","nodeId":"starter-hub-b-node","actorId":"starter-hub-b-actor"},"profileVersions":["0.1.0-alpha.1"],"requiredFeatures":["transport-receipts"],"optionalFeatures":[],"operations":["capability-advertisement","responsibility-proposal","fact-admission","supersession","completion-assessment","warrant-revocation"],"topologies":["local-peer"],"disclosureModes":["full","partial","redacted","reference-only","intentionally-withheld"],"failureCodes":["profile-version-unsupported","profile-root-mismatch","required-feature-unsupported","identity-unresolved","authority-unresolved","authority-expired","authority-revoked","authority-amplification","fact-cut-unavailable","causal-gap","payload-digest-mismatch","idempotency-conflict","conflict-visible","disclosure-insufficient","required-field-withheld","completion-unproved","local-policy-rejected"],"bindings":[{"id":"jsonl-stdio","mediaTypes":["application/json"],"authentication":"local-process","transportReceipts":true,"duplicateDelivery":"at-least-once"}],"limits":{"maxInlineBytes":65536,"maxEnvelopeBytes":1048576},"authorityRoots":["sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"],"issuedAt":"2026-08-15T00:00:00.000Z"}"#;
    let prefix = format!(
        r#"{{"schemaVersion":1,"contract":"kfd.agent-hub-adapter-response/v1","requestId":"{request_id}","adapter":{adapter}"#
    );
    if operation == "handshake" {
        Ok(format!(
            r#"{prefix},"status":"accepted","code":"adapter-ready","verdict":"not-applicable","hubs":[{{"hubId":"starter-hub-a","capabilities":{capabilities_a},"capabilityRoot":"sha256:d8c212284e53d8e7dacbca8acdb0d7d8d8ee300e1f55233629a7dd006b6e3bc6"}},{{"hubId":"starter-hub-b","capabilities":{capabilities_b},"capabilityRoot":"sha256:dcea56f3624a752070c3a06f7636a0605996d2cd5ea1b6581f935367e07c268c"}}],"observations":{{"binding":"jsonl-stdio/v1","scope":"evidence-valid-negative-starter"}}}}"#,
        ))
    } else {
        // Replace this fail-closed placeholder with product-owned Hub behavior.
        Ok(format!(
            r#"{prefix},"status":"error","code":"scenario-not-implemented","verdict":"not-applicable","observations":{{"scope":"hub-semantics-not-implemented"}}}}"#
        ))
    }
}

fn main() {
    for line in io::stdin().lock().lines() {
        match line.and_then(|value| response(&value).map_err(io::Error::other)) {
            Ok(value) => println!("{value}"),
            Err(error) => {
                eprintln!("adapter input error: {error}");
                std::process::exit(2);
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn fixture_exercises_exact_response_envelope() {
        let responses: Vec<String> = include_str!("../fixtures/requests.jsonl")
            .lines()
            .map(|line| response(line).expect("fixture response"))
            .collect();
        assert_eq!(responses.len(), 2);
        assert!(responses[0].contains(r#""requestId":"handshake""#));
        assert!(responses[0].contains(r#""hubs":["#));
        assert!(responses[1].contains(r#""requestId":"starter-evaluate""#));
        assert!(responses[1].contains(r#""code":"scenario-not-implemented""#));
        for value in responses {
            assert!(value.contains(r#""contract":"kfd.agent-hub-adapter-response/v1""#));
        }
        println!("Rust starter smoke passed: jsonl-stdio/v1 envelope only; Hub 20 not executed");
    }
}
