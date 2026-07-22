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
  ["scripts/agent-hub-report-verifier.mjs", "verifier"],
  ["scripts/generate-agent-hub-vectors.mjs", "reference"],
  ["profiles/agent-hub/adapters/protocol.mjs", "reference"],
  ["profiles/agent-hub/adapters/state-machine-adapter.mjs", "reference"],
  ["profiles/agent-hub/adapters/rule-table-adapter.mjs", "reference"],
];
manifest.surfaces = entries.map(([file, role]) => ({ path: file, role, digest: digest(file) }));
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
