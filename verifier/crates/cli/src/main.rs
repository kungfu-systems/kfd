// SPDX-License-Identifier: Apache-2.0

use kfd_verifier_core::{report_json, verify_bundle, VerificationBundle};
use std::collections::BTreeMap;
use std::env;
use std::fs;
use std::fs::OpenOptions;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::process::ExitCode;

fn usage() -> &'static str {
    "usage:
  kfd verify <kfd-record|passport|pack|atlas|episode|agent-runtime-report|bundle> <path> [--schema <path>] [--json]
  kfd bundle <kfd-record|passport|pack|atlas|episode|agent-runtime-report> <path> --output <bundle.json>"
}

fn read_regular(path: &Path) -> Result<String, String> {
    let metadata = fs::symlink_metadata(path)
        .map_err(|error| format!("cannot inspect {}: {error}", path.display()))?;
    if metadata.file_type().is_symlink() || !metadata.is_file() {
        return Err(format!(
            "{} must be a regular file, not a symlink",
            path.display()
        ));
    }
    fs::read_to_string(path)
        .map_err(|error| format!("cannot read UTF-8 file {}: {error}", path.display()))
}

fn walk(
    root: &Path,
    directory: &Path,
    artifacts: &mut BTreeMap<String, String>,
) -> Result<(), String> {
    for entry in fs::read_dir(directory)
        .map_err(|error| format!("cannot read directory {}: {error}", directory.display()))?
    {
        let entry = entry.map_err(|error| error.to_string())?;
        let path = entry.path();
        let metadata = fs::symlink_metadata(&path).map_err(|error| error.to_string())?;
        if metadata.file_type().is_symlink() {
            return Err(format!("symlink is not admitted: {}", path.display()));
        }
        if metadata.is_dir() {
            walk(root, &path, artifacts)?;
        } else if metadata.is_file() {
            let relative = path
                .strip_prefix(root)
                .map_err(|_| format!("path escaped object root: {}", path.display()))?;
            let key = relative
                .components()
                .map(|component| {
                    component
                        .as_os_str()
                        .to_str()
                        .ok_or_else(|| format!("path is not valid UTF-8: {}", path.display()))
                })
                .collect::<Result<Vec<_>, _>>()?
                .join("/");
            artifacts.insert(key, read_regular(&path)?);
        }
    }
    Ok(())
}

fn primary_name(kind: &str) -> Result<&'static str, String> {
    match kind {
        "passport" => Ok("buildchain.release.json"),
        "pack" => Ok("pack.json"),
        "atlas" => Ok("atlas.json"),
        "episode" => Ok("manifest.json"),
        "agent-runtime-report" => Err("agent-runtime-report expects a JSON file".to_owned()),
        "kfd-record" => Err("kfd-record expects a JSON file".to_owned()),
        other => Err(format!("unsupported verification kind: {other}")),
    }
}

fn build_bundle(
    kind: &str,
    input: &Path,
    schema: Option<&Path>,
) -> Result<VerificationBundle, String> {
    let input_metadata = fs::symlink_metadata(input)
        .map_err(|error| format!("cannot inspect {}: {error}", input.display()))?;
    if input_metadata.file_type().is_symlink() {
        return Err(format!("symlink is not admitted: {}", input.display()));
    }
    let mut artifacts = BTreeMap::new();
    let primary = if input_metadata.is_dir() {
        walk(input, input, &mut artifacts)?;
        let name = primary_name(kind)?;
        artifacts
            .remove(name)
            .ok_or_else(|| format!("object directory is missing {name}"))?
    } else {
        read_regular(input)?
    };
    if let Some(schema_path) = schema {
        artifacts.insert("schema.json".to_owned(), read_regular(schema_path)?);
    }
    if kind == "episode" {
        if let Ok(manifest) = serde_json::from_str::<serde_json::Value>(&primary) {
            if let Some(value) = manifest
                .get("semanticRoot")
                .and_then(serde_json::Value::as_str)
            {
                artifacts.insert("semantic-root.txt".to_owned(), format!("{value}\n"));
            }
        }
    }
    Ok(VerificationBundle {
        schema_version: 1,
        contract: "kfd.verification-bundle/v1".to_owned(),
        kind: kind.to_owned(),
        primary,
        artifacts,
    })
}

fn main() -> ExitCode {
    match run(env::args().skip(1).collect()) {
        Ok(code) => code,
        Err(error) => {
            eprintln!("kfd: {error}");
            eprintln!("{}", usage());
            ExitCode::from(2)
        }
    }
}

fn run(args: Vec<String>) -> Result<ExitCode, String> {
    if args.len() < 3 {
        return Err("missing command, kind, or path".to_owned());
    }
    let command = args[0].as_str();
    let kind = args[1].as_str();
    let input = PathBuf::from(&args[2]);
    let mut schema = None;
    let mut output = None;
    let mut index = 3;
    while index < args.len() {
        match args[index].as_str() {
            "--json" => index += 1,
            "--schema" if index + 1 < args.len() => {
                schema = Some(PathBuf::from(&args[index + 1]));
                index += 2;
            }
            "--output" if index + 1 < args.len() => {
                output = Some(PathBuf::from(&args[index + 1]));
                index += 2;
            }
            flag => return Err(format!("unsupported argument: {flag}")),
        }
    }
    if command == "verify" && kind == "bundle" {
        let source = read_regular(&input)?;
        let report = kfd_verifier_core::verify_bundle_json(&source);
        println!("{report}");
        let valid = serde_json::from_str::<serde_json::Value>(&report)
            .ok()
            .and_then(|value| value.get("valid").and_then(serde_json::Value::as_bool))
            .unwrap_or(false);
        return Ok(if valid {
            ExitCode::SUCCESS
        } else {
            ExitCode::from(1)
        });
    }
    let bundle = build_bundle(kind, &input, schema.as_deref())?;
    match command {
        "verify" => {
            let report = verify_bundle(&bundle);
            println!("{}", report_json(&report));
            Ok(if report.valid {
                ExitCode::SUCCESS
            } else {
                ExitCode::from(1)
            })
        }
        "bundle" => {
            let output = output.ok_or_else(|| "bundle requires --output".to_owned())?;
            let parent = output.parent().unwrap_or_else(|| Path::new("."));
            if !parent.exists() {
                return Err(format!(
                    "output parent does not exist: {}",
                    parent.display()
                ));
            }
            let rendered = serde_json::to_string(&bundle).map_err(|error| error.to_string())?;
            let mut file = OpenOptions::new()
                .write(true)
                .create_new(true)
                .open(&output)
                .map_err(|error| format!("cannot create {}: {error}", output.display()))?;
            file.write_all(format!("{rendered}\n").as_bytes())
                .map_err(|error| format!("cannot write {}: {error}", output.display()))?;
            Ok(ExitCode::SUCCESS)
        }
        other => Err(format!("unsupported command: {other}")),
    }
}
