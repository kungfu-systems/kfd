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
    let prefix = format!(
        r#"{{"schemaVersion":1,"contract":"kfd.agent-hub-adapter-response/v1","requestId":"{request_id}","adapter":{adapter}"#
    );
    if operation == "handshake" {
        Ok(format!(
            r#"{prefix},"status":"accepted","code":"adapter-ready","verdict":"not-applicable","hubs":[{{"hubId":"starter-hub-a","capabilities":{{"schemaVersion":1,"contract":"kfd-agent-hub-capabilities","identity":{{"hubId":"starter-hub-a"}}}},"capabilityRoot":"sha256:{a}"}},{{"hubId":"starter-hub-b","capabilities":{{"schemaVersion":1,"contract":"kfd-agent-hub-capabilities","identity":{{"hubId":"starter-hub-b"}}}},"capabilityRoot":"sha256:{b}"}}],"observations":{{"binding":"jsonl-stdio/v1","scope":"starter-envelope-smoke-only"}}}}"#,
            a = "a".repeat(64),
            b = "b".repeat(64),
        ))
    } else {
        // Replace this fail-closed placeholder with product-owned Hub behavior.
        Ok(format!(
            r#"{prefix},"status":"error","code":"scenario-not-implemented","verdict":"not-applicable","observations":{{"scope":"starter-envelope-smoke-only"}}}}"#
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
