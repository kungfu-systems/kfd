// SPDX-License-Identifier: Apache-2.0

use serde::de::{self, DeserializeSeed, MapAccess, SeqAccess, Visitor};
use serde_json::{Map, Number, Value};
use sha2::{Digest, Sha256};
use std::collections::BTreeSet;
use std::fmt;
use unicode_normalization::UnicodeNormalization;

const MAX_SAFE_INTEGER: u64 = 9_007_199_254_740_991;

struct StrictValueSeed;

impl<'de> DeserializeSeed<'de> for StrictValueSeed {
    type Value = Value;

    fn deserialize<D>(self, deserializer: D) -> Result<Self::Value, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        deserializer.deserialize_any(StrictValueVisitor)
    }
}

struct StrictValueVisitor;

impl<'de> Visitor<'de> for StrictValueVisitor {
    type Value = Value;

    fn expecting(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter.write_str("a JSON value")
    }

    fn visit_bool<E>(self, value: bool) -> Result<Self::Value, E> {
        Ok(Value::Bool(value))
    }

    fn visit_i64<E>(self, value: i64) -> Result<Self::Value, E> {
        Ok(Value::Number(Number::from(value)))
    }

    fn visit_u64<E>(self, value: u64) -> Result<Self::Value, E> {
        Ok(Value::Number(Number::from(value)))
    }

    fn visit_f64<E>(self, value: f64) -> Result<Self::Value, E>
    where
        E: de::Error,
    {
        Number::from_f64(value)
            .map(Value::Number)
            .ok_or_else(|| E::custom("non-finite JSON number"))
    }

    fn visit_str<E>(self, value: &str) -> Result<Self::Value, E>
    where
        E: de::Error,
    {
        Ok(Value::String(value.to_owned()))
    }

    fn visit_string<E>(self, value: String) -> Result<Self::Value, E> {
        Ok(Value::String(value))
    }

    fn visit_none<E>(self) -> Result<Self::Value, E> {
        Ok(Value::Null)
    }

    fn visit_unit<E>(self) -> Result<Self::Value, E> {
        Ok(Value::Null)
    }

    fn visit_seq<A>(self, mut sequence: A) -> Result<Self::Value, A::Error>
    where
        A: SeqAccess<'de>,
    {
        let mut values = Vec::new();
        while let Some(value) = sequence.next_element_seed(StrictValueSeed)? {
            values.push(value);
        }
        Ok(Value::Array(values))
    }

    fn visit_map<A>(self, mut access: A) -> Result<Self::Value, A::Error>
    where
        A: MapAccess<'de>,
    {
        let mut keys = BTreeSet::new();
        let mut values = Map::new();
        while let Some(key) = access.next_key::<String>()? {
            if !keys.insert(key.clone()) {
                return Err(de::Error::custom(format!(
                    "duplicate JSON object key: {key}"
                )));
            }
            values.insert(key, access.next_value_seed(StrictValueSeed)?);
        }
        Ok(Value::Object(values))
    }
}

pub fn parse_strict_json(input: &str) -> Result<Value, String> {
    let mut deserializer = serde_json::Deserializer::from_str(input);
    let value = StrictValueSeed
        .deserialize(&mut deserializer)
        .map_err(|error| error.to_string())?;
    deserializer.end().map_err(|error| error.to_string())?;
    Ok(value)
}

fn require_canonical_domain(value: &Value, path: &str) -> Result<(), String> {
    match value {
        Value::Null | Value::Bool(_) => Ok(()),
        Value::Number(number) => match number.as_u64() {
            Some(value) if value <= MAX_SAFE_INTEGER => Ok(()),
            Some(_) => Err(format!("{path} exceeds the maximum safe JSON integer")),
            None => Err(format!(
                "{path} must be a non-negative integer; floating-point values are unsupported"
            )),
        },
        Value::String(value) => {
            let normalized: String = value.nfc().collect();
            if normalized == *value {
                Ok(())
            } else {
                Err(format!("{path} must already be NFC-normalized"))
            }
        }
        Value::Array(values) => {
            for (index, value) in values.iter().enumerate() {
                require_canonical_domain(value, &format!("{path}/{index}"))?;
            }
            Ok(())
        }
        Value::Object(values) => {
            for (key, value) in values {
                let normalized: String = key.nfc().collect();
                if normalized != *key {
                    return Err(format!("{path} object key {key:?} is not NFC-normalized"));
                }
                require_canonical_domain(value, &format!("{path}/{key}"))?;
            }
            Ok(())
        }
    }
}

pub fn canonical_json(value: &Value) -> Result<String, String> {
    require_canonical_domain(value, "")?;
    serde_json::to_string(value).map_err(|error| error.to_string())
}

pub fn sha256_bytes(bytes: &[u8]) -> String {
    format!("sha256:{:x}", Sha256::digest(bytes))
}

pub fn semantic_root(value: &Value) -> Result<String, String> {
    let mut bytes = canonical_json(value)?.into_bytes();
    bytes.push(b'\n');
    Ok(sha256_bytes(&bytes))
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn canonical_json_sorts_keys_and_hashes_with_lf() {
        let value = parse_strict_json("{\"b\":2,\"a\":1}").expect("json");
        assert_eq!(
            canonical_json(&value).expect("canonical"),
            "{\"a\":1,\"b\":2}"
        );
        assert_eq!(
            semantic_root(&value).expect("root"),
            sha256_bytes(b"{\"a\":1,\"b\":2}\n")
        );
    }

    #[test]
    fn duplicate_keys_and_noncanonical_numbers_fail() {
        assert!(parse_strict_json("{\"a\":1,\"a\":2}").is_err());
        assert!(canonical_json(&json!(-1)).is_err());
        assert!(canonical_json(&json!(1.5)).is_err());
        assert!(canonical_json(&json!(9_007_199_254_740_992_u64)).is_err());
    }
}
