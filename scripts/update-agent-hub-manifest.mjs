// SPDX-License-Identifier: Apache-2.0
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const digest = (file) => `sha256:${crypto.createHash("sha256").update(fs.readFileSync(path.join(root, file))).digest("hex")}`;
const manifestPath = path.join(root, "profiles", "agent-hub", "manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
manifest.protocol.manifestDigest = digest(manifest.protocol.manifest);
manifest.suite.vectorRoot = digest("profiles/agent-hub/vectors/hub-20.json");
manifest.runtimeDependency.manifestDigest = digest(manifest.runtimeDependency.manifest);
manifest.failureInventory.root = digest(manifest.failureInventory.path);
const entries = [
  ["profiles/agent-hub/README.md", "authority"],
  ["profiles/agent-hub/implementer-guide.md", "guide"],
  ["profiles/agent-hub/failure-codes.json", "reference"],
  ["profiles/agent-hub/vectors/hub-20.json", "vectors"],
  ["schemas/kfd-agent-hub/conformance-manifest.schema.json", "schema"],
  ["schemas/kfd-agent-hub/adapter-request.schema.json", "schema"],
  ["schemas/kfd-agent-hub/adapter-response.schema.json", "schema"],
  ["schemas/kfd-agent-hub/suite.schema.json", "schema"],
  ["schemas/kfd-agent-hub/report.schema.json", "schema"],
  ["scripts/agent-hub-runner.mjs", "runner"],
  ["scripts/jsonl-adapter-runner.mjs", "runner"],
  ["scripts/agent-hub-report-verifier.mjs", "verifier"],
  ["scripts/agent-hub-scaffold.mjs", "scaffold"],
  ["scripts/generate-agent-hub-vectors.mjs", "reference"],
  ["profiles/agent-hub/cli-capabilities.json", "capabilities"],
  ["profiles/agent-hub/adapters/protocol.mjs", "reference"],
  ["profiles/agent-hub/adapters/state-machine-adapter.mjs", "reference"],
  ["profiles/agent-hub/adapters/rule-table-adapter.mjs", "reference"],
  ["profiles/agent-hub/scaffolds/node/kfd-scaffold.json", "scaffold"],
  ["profiles/agent-hub/scaffolds/node/README.md", "guide"],
  ["profiles/agent-hub/scaffolds/node/package.json", "scaffold"],
  ["profiles/agent-hub/scaffolds/node/adapter.mjs", "scaffold"],
  ["profiles/agent-hub/scaffolds/node/smoke.mjs", "test"],
  ["profiles/agent-hub/scaffolds/node/fixtures/requests.jsonl", "fixture"],
  ["profiles/agent-hub/scaffolds/python/kfd-scaffold.json", "scaffold"],
  ["profiles/agent-hub/scaffolds/python/README.md", "guide"],
  ["profiles/agent-hub/scaffolds/python/adapter.py", "scaffold"],
  ["profiles/agent-hub/scaffolds/python/smoke.py", "test"],
  ["profiles/agent-hub/scaffolds/python/fixtures/requests.jsonl", "fixture"],
  ["profiles/agent-hub/scaffolds/rust/kfd-scaffold.json", "scaffold"],
  ["profiles/agent-hub/scaffolds/rust/README.md", "guide"],
  ["profiles/agent-hub/scaffolds/rust/Cargo.toml", "scaffold"],
  ["profiles/agent-hub/scaffolds/rust/Cargo.lock", "scaffold"],
  ["profiles/agent-hub/scaffolds/rust/src/main.rs", "scaffold"],
  ["profiles/agent-hub/scaffolds/rust/fixtures/requests.jsonl", "fixture"],
  ["profiles/agent-hub/scaffolds/cpp/kfd-scaffold.json", "scaffold"],
  ["profiles/agent-hub/scaffolds/cpp/README.md", "guide"],
  ["profiles/agent-hub/scaffolds/cpp/CMakeLists.txt", "scaffold"],
  ["profiles/agent-hub/scaffolds/cpp/adapter.cpp", "scaffold"],
  ["profiles/agent-hub/scaffolds/cpp/smoke.mjs", "test"],
  ["profiles/agent-hub/scaffolds/cpp/fixtures/requests.jsonl", "fixture"],
];
manifest.surfaces = entries.map(([file, role]) => ({ path: file, role, digest: digest(file) }));
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
