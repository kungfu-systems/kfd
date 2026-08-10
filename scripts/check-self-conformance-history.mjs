// SPDX-License-Identifier: Apache-2.0
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const reportPath = "profiles/self-conformance/history/historical-lineage.report.json";
const report = JSON.parse(fs.readFileSync(path.join(root, reportPath), "utf8"));
const exactRoot = (relative, base = root) => `sha256:${crypto.createHash("sha256").update(fs.readFileSync(path.join(base, relative))).digest("hex")}`;
const run = (command, args, expected = 0, cwd = root, env = {}) => {
  const result = spawnSync(command, args, { cwd, encoding: "utf8", env: { ...process.env, npm_config_offline: "true", ...env } });
  assert.equal(result.status, expected, `${command} ${args.join(" ")}\n${result.stderr}\n${result.stdout}`);
  return result.stdout.trim();
};

run("node", ["scripts/generate-self-conformance-history.mjs"]);
run("node", ["scripts/generate-self-conformance-history.mjs"], 0, root, { KFD_SELF_CONFORMANCE_HISTORY_SOURCE_MODE: "cache" });
assert.equal(report.retrospective, true);
assert.equal(report.profileAvailableAtEvent, false);
assert.deepEqual(report.foundation.active, ["KFD-1", "KFD-2", "KFD-3", "KFD-4", "KFD-5"]);
assert.deepEqual(report.foundation.draft, ["KFD-6"]);
assert.deepEqual(report.foundation.absent, ["KFD-7"]);
assert.equal(report.foundation.gitCommit, "04f839e8e7834c9eda3d46424de2f59f53623e8f");
assert.equal(report.foundation.packageVersion, "1.0.0-alpha.28");
assert.equal(report.foundation.packageRoot, "sha256:279cf2adcfe0c5cd9d31ecf0e6317d5a5f2ff854c49c39f7e135ad4e2cc43ce1");
assert.equal(report.sources.find(({ id }) => id === "pr-146-review").payload.state, "APPROVED");

const kfd7 = report.episodes.filter(({ subjectId }) => subjectId === "KFD-7");
assert.deepEqual(kfd7.map(({ transition }) => transition), ["candidate-genesis", "candidate-refinement", "numbered-draft-promotion", "qualification", "activation", "release-packaging"]);
assert.equal(kfd7.at(-1).after, "active-packaged");
for (const id of ["KFD-8", "KFD-9", "KFD-10"]) {
  assert.equal(report.outcomes.find(({ subjectId }) => subjectId === id).terminalState, "numbered-draft");
}
assert.deepEqual(
  report.episodes.flatMap(({ numberingMappings }) => numberingMappings).filter(({ relation }) => relation === "renumbered"),
  [
    { from: "KFD-11@pre-2026-07-21", to: "KFD-12", relation: "renumbered" },
    { from: "KFD-12@pre-2026-07-21", to: "KFD-13", relation: "renumbered" },
  ],
);
assert.equal(report.outcomes.find(({ subjectId }) => subjectId === "kfd-self-conformance-pressure").terminalState, "no-new-kfd");
assert.equal(report.convergence.liveAnchorId, "kfd-alpha-55-pre-profile");
assert.equal(report.convergence.historicalDoesNotReplaceLive, true);

const nativeArgs = ["run", "--quiet", "--locked", "--manifest-path", "verifier/Cargo.toml", "-p", "kfd-verifier-cli", "--"];
const native = run("cargo", [...nativeArgs, "verify", "self-conformance-history", reportPath, "--json"]);
const wasm = run("node", ["bin/kfd-history.mjs", "verify", reportPath, "--json"]);
assert.equal(wasm, native, "Native and WASM historical reports must be byte-identical");
const verified = JSON.parse(native);
assert.equal(verified.valid, true);
assert.equal(verified.qualifying, false);
assert.equal(verified.selfCertified, false);
assert.equal(verified.offline, true);

const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "kfd-self-conformance-history-"));
try {
  const mutations = [
    { id: "temporal", code: "sch-temporal-boundary-invalid", apply(value) { value.profileAvailableAtEvent = true; } },
    { id: "source-root", code: "sch-source-root-mismatch", apply(value) { value.sources[0].contentRoot = `sha256:${"0".repeat(64)}`; } },
    { id: "review", code: "sch-review-not-independent", apply(value) { value.episodes[0].reviewSourceId = value.episodes[0].authoritySourceId; } },
    { id: "transition", code: "sch-transition-invalid", apply(value) { value.episodes[0].after = "active"; } },
    { id: "convergence", code: "sch-convergence-invalid", apply(value) { value.convergence.historicalDoesNotReplaceLive = false; } },
  ];
  for (const mutation of mutations) {
    const candidate = structuredClone(report);
    mutation.apply(candidate);
    const candidatePath = path.join(temporary, `${mutation.id}.json`);
    fs.writeFileSync(candidatePath, `${JSON.stringify(candidate, null, 2)}\n`);
    const nativeFailure = run("cargo", [...nativeArgs, "verify", "self-conformance-history", candidatePath, "--json"], 1);
    const wasmFailure = run("node", ["bin/kfd-history.mjs", "verify", candidatePath, "--json"], 1);
    assert.equal(wasmFailure, nativeFailure, `${mutation.id}: Native and WASM rejection bytes differ`);
    assert.equal(JSON.parse(nativeFailure).issues.some(({ code }) => code === mutation.code), true, `${mutation.id}: stable issue code missing`);
  }
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}

const manifest = JSON.parse(fs.readFileSync(path.join(root, "profiles/self-conformance/history/manifest.json"), "utf8"));
assert.equal(manifest.compatibility, "additive");
assert.equal(manifest.historicalDoesNotReplaceLive, true);
assert.equal(manifest.liveManifestExactRoot, exactRoot("profiles/self-conformance/manifest.json"));
for (const surface of manifest.surfaces) assert.equal(surface.digest, exactRoot(surface.path), `${surface.path}: history manifest digest drifted`);

const extraction = JSON.parse(fs.readFileSync(path.join(root, "profiles/self-conformance/history/extraction-manifest.json"), "utf8"));
const packedTemporary = fs.mkdtempSync(path.join(os.tmpdir(), "kfd-self-conformance-history-pack-"));
try {
  const packed = JSON.parse(run("npm", ["pack", "--json", "--ignore-scripts", "--pack-destination", packedTemporary]));
  run("tar", ["-xzf", path.join(packedTemporary, packed[0].filename), "-C", packedTemporary]);
  const packageRoot = path.join(packedTemporary, "package");
  for (const relative of extraction.files) assert.equal(fs.existsSync(path.join(packageRoot, relative)), true, `packed history surface missing ${relative}`);
  const cleanRoom = run("node", [
    "bin/kfd-history.mjs",
    "verify",
    "profiles/self-conformance/history/historical-lineage.report.json",
    "--json",
  ], 0, packageRoot);
  assert.equal(JSON.parse(cleanRoom).valid, true);
} finally {
  fs.rmSync(packedTemporary, { recursive: true, force: true });
}

console.log(`Historical Self-Conformance passed: ${report.sources.length} immutable sources, ${report.episodes.length} replay episodes, Native/WASM byte parity, 5 fail-closed mutations`);
