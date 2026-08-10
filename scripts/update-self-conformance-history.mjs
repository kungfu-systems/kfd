// SPDX-License-Identifier: Apache-2.0
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { semanticRoot } from "./self-conformance-contract.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const exactRoot = (relative) => `sha256:${crypto.createHash("sha256").update(fs.readFileSync(path.join(root, relative))).digest("hex")}`;
const surfaces = [
  ["bin/kfd-history.mjs", "cli"],
  ["profiles/self-conformance/history/README.md", "authority"],
  ["profiles/self-conformance/history/extraction-manifest.json", "extraction"],
  ["profiles/self-conformance/history/historical-lineage.report.json", "evidence"],
  ["profiles/self-conformance/history/implementer-guide.md", "guide"],
  ["profiles/self-conformance/history/issue-codes.json", "diagnostics"],
  ["schemas/kfd-self-conformance-history/historical-replay.schema.json", "schema"],
  ["verifier/dist/kfd_verifier_current.wasm", "verifier"],
];
const liveManifestPath = "profiles/self-conformance/manifest.json";
const reportPath = "profiles/self-conformance/history/historical-lineage.report.json";
const manifest = {
  schemaVersion: 1,
  contract: "kfd.self-conformance-history-package-manifest/v1",
  profile: { id: "kfd-self-conformance-history", version: "1.0.0-alpha.1", status: "experimental" },
  baseProfile: "kfd-self-conformance@1.0.0-alpha.1",
  compatibility: "additive",
  historicalDoesNotReplaceLive: true,
  liveManifestExactRoot: exactRoot(liveManifestPath),
  reportRoot: semanticRoot(readJson(reportPath)),
  issueSetRoot: semanticRoot(readJson("profiles/self-conformance/history/issue-codes.json")),
  surfaces: surfaces.map(([surfacePath, role]) => ({ path: surfacePath, role, digest: exactRoot(surfacePath) })),
  runtimeDependencies: [],
  claimBoundary: "The history package closes a later structural replay only. It does not modify the byte-identical live Profile closure, claim contemporaneous execution, or supply semantic or governance authority.",
};
fs.writeFileSync(path.join(root, "profiles/self-conformance/history/manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`updated historical Self-Conformance manifest ${manifest.reportRoot}`);
