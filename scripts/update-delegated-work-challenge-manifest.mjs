// SPDX-License-Identifier: Apache-2.0
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { exactByteRoot } from "./self-conformance-contract.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(root, "profiles", "delegated-work-challenge", "manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const entries = [
  ["profiles/delegated-work-challenge/README.md", "authority"],
  ["profiles/delegated-work-challenge/cli-capabilities.json", "capabilities"],
  ["profiles/delegated-work-challenge/fixtures/suite.json", "fixture"],
  ["profiles/delegated-work-challenge/projections/execution-only.json", "projection"],
  ["profiles/delegated-work-challenge/projections/full-semantic.json", "projection"],
  ["profiles/delegated-work-challenge/projections/example-projection.json", "projection"],
  ["profiles/delegated-work-challenge/adapters/node-starter.mjs", "starter"],
  ["schemas/kfd-delegated-work-challenge/projection.schema.json", "schema"],
  ["schemas/kfd-delegated-work-challenge/suite.schema.json", "schema"],
  ["schemas/kfd-delegated-work-challenge/adapter-request.schema.json", "schema"],
  ["schemas/kfd-delegated-work-challenge/adapter-response.schema.json", "schema"],
  ["schemas/kfd-delegated-work-challenge/report.schema.json", "schema"],
  ["scripts/jsonl-adapter-runner.mjs", "runner"],
  ["scripts/delegated-work-challenge-core.mjs", "runner"],
  ["scripts/delegated-work-challenge-runner.mjs", "runner"],
  ["scripts/delegated-work-challenge-report-verifier.mjs", "verifier"],
];
manifest.surfaces = entries.map(([relative, role]) => ({
  path: relative,
  role,
  digest: exactByteRoot(fs.readFileSync(path.join(root, relative))),
}));
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
