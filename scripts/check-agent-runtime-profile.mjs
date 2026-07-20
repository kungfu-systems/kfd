// SPDX-License-Identifier: Apache-2.0
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const profileRoot = path.join(root, "profiles", "agent-runtime");
const manifestPath = path.join(profileRoot, "manifest.json");
const vectorPath = path.join(profileRoot, "vectors", "runtime-100.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const registry = JSON.parse(fs.readFileSync(vectorPath, "utf8"));
const nativeArgs = [
  "run",
  "--locked",
  "--quiet",
  "--manifest-path",
  path.join(root, "verifier", "Cargo.toml"),
  "-p",
  "kfd-verifier-cli",
  "--",
];

function sha256(bytes) {
  return `sha256:${crypto.createHash("sha256").update(bytes).digest("hex")}`;
}

function run(command, args, expected = 0) {
  const result = spawnSync(command, args, { cwd: root, encoding: "utf8" });
  assert.equal(
    result.status,
    expected,
    `${command} ${args.join(" ")}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
  );
  return result.stdout.trim();
}

assert.equal(manifest.contract, "kfd.agent-runtime-suite-manifest/v1");
assert.equal(manifest.profile.id, "kfd-agent-runtime");
assert.equal(manifest.profile.version, "0.1.0-alpha.1");
assert.equal(manifest.profile.status, "experimental");
assert.equal(manifest.suite.id, "kfd-runtime-100");
assert.equal(manifest.suite.fixedVectorCount, 100);
assert.equal(
  manifest.suite.vectorRoot,
  sha256(fs.readFileSync(vectorPath)),
  "manifest vector root drifted",
);
assert.equal(
  manifest.dependencies.agentHubManifestDigest,
  sha256(fs.readFileSync(path.join(root, "protocols", "agent-hub", "manifest.json"))),
  "Agent Hub dependency root drifted",
);
assert.ok(manifest.surfaces.length >= 12, "profile must root its authority and executable surfaces");
for (const surface of manifest.surfaces) {
  const absolute = path.join(root, surface.path);
  assert.equal(path.relative(root, absolute).startsWith(".."), false, `${surface.path} escaped root`);
  assert.equal(surface.digest, sha256(fs.readFileSync(absolute)), `${surface.path} digest drifted`);
}

assert.equal(registry.contract, "kfd.agent-runtime-vector-registry/v1");
assert.equal(registry.vectors.length, 100);
assert.equal(new Set(registry.vectors.map(({ id }) => id)).size, 100);
const counts = Object.fromEntries(
  ["pursuit", "atlas", "warrant", "action", "episode-fact", "recovery"].map((category) => [
    category,
    registry.vectors.filter((entry) => entry.category === category).length,
  ]),
);
assert.deepEqual(counts, {
  pursuit: 15,
  atlas: 15,
  warrant: 20,
  action: 15,
  "episode-fact": 20,
  recovery: 15,
});
assert.equal(registry.vectors.filter(({ partition }) => partition === "core").length, 35);
assert.equal(registry.vectors.filter(({ partition }) => partition === "experimental").length, 65);
assert.equal(
  registry.vectors.every(
    (entry) =>
      (entry.polarity === "positive" && entry.expect.status === "accepted") ||
      (entry.polarity === "negative" && entry.expect.status === "rejected"),
  ),
  true,
  "vector polarity and expected status drifted",
);
run("node", ["scripts/generate-agent-runtime-vectors.mjs"]);

for (const schema of [
  "manifest.schema.json",
  "adapter-request.schema.json",
  "adapter-response.schema.json",
  "suite.schema.json",
  "report.schema.json",
]) {
  const value = JSON.parse(
    fs.readFileSync(path.join(root, "schemas", "kfd-agent-runtime", schema), "utf8"),
  );
  assert.equal(
    value.$id,
    `https://kfd.libkungfu.dev/schemas/kfd-agent-runtime/${schema}`,
  );
}

const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "kfd-agent-runtime-"));
try {
  const reports = [];
  for (const adapter of [
    "profiles/agent-runtime/adapters/state-machine-adapter.mjs",
    "profiles/agent-runtime/adapters/rule-table-adapter.mjs",
  ]) {
    const reportPath = path.join(
      temporary,
      `${path.basename(adapter, ".mjs")}.report.json`,
    );
    run("node", [
      "bin/kfd.mjs",
      "test",
      "agent-runtime",
      "--adapter",
      adapter,
      "--output",
      reportPath,
    ]);
    const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
    assert.equal(report.valid, true);
    assert.equal(report.qualifying, false);
    assert.equal(report.selfCertified, false);
    assert.equal(report.results.length, 100);
    assert.equal(report.partitions.core.passed, 35);
    assert.equal(report.partitions.experimental.passed, 65);
    const native = run("cargo", [
      ...nativeArgs,
      "verify",
      "agent-runtime-report",
      reportPath,
      "--json",
    ]);
    const wasm = run("node", [
      "bin/kfd.mjs",
      "verify",
      "agent-runtime-report",
      reportPath,
      "--json",
    ]);
    assert.equal(wasm, native, "Agent runtime native/WASM reports differ");
    assert.equal(JSON.parse(native).valid, true);
    reports.push(report);
  }
  assert.notEqual(reports[0].adapter.id, reports[1].adapter.id);
  assert.notEqual(reports[0].adapter.topology, reports[1].adapter.topology);
  assert.notEqual(reports[0].adapter.artifactDigest, reports[1].adapter.artifactDigest);
  assert.deepEqual(
    reports[0].results.map(({ id, status, actual }) => ({ id, status, actual })),
    reports[1].results.map(({ id, status, actual }) => ({ id, status, actual })),
    "structurally different adapters must produce the same fixed outcomes",
  );

  const mutations = [
    ["manifest-root", (report) => {
      report.profile.manifestDigest = `sha256:${"a".repeat(64)}`;
    }],
    ["expectation", (report) => {
      report.results[0].expected.code = "mutated-expectation";
    }],
    ["response-root", (report) => {
      report.results[0].responseRoot = `sha256:${"b".repeat(64)}`;
    }],
    ["partition-widening", (report) => {
      report.results.find(({ partition }) => partition === "experimental").partition = "core";
    }],
    ["scope-widening", (report) => {
      report.qualifying = true;
    }],
    ["missing-vector", (report) => {
      report.results.pop();
    }],
    ["source-placeholder", (report) => {
      report.adapter.sourceCommit = "2".repeat(40);
    }],
  ];
  for (const [name, mutate] of mutations) {
    const report = structuredClone(reports[0]);
    mutate(report);
    const reportPath = path.join(temporary, `invalid-${name}.json`);
    fs.writeFileSync(reportPath, `${JSON.stringify(report)}\n`);
    const native = run(
      "cargo",
      [...nativeArgs, "verify", "agent-runtime-report", reportPath, "--json"],
      1,
    );
    const wasm = run(
      "node",
      ["bin/kfd.mjs", "verify", "agent-runtime-report", reportPath, "--json"],
      1,
    );
    assert.equal(wasm, native, `${name} native/WASM rejection differs`);
    assert.equal(JSON.parse(native).valid, false, `${name} must fail closed`);
  }
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}

const stateAdapter = fs.readFileSync(
  path.join(profileRoot, "adapters", "state-machine-adapter.mjs"),
  "utf8",
);
const ruleAdapter = fs.readFileSync(
  path.join(profileRoot, "adapters", "rule-table-adapter.mjs"),
  "utf8",
);
assert.doesNotMatch(stateAdapter, /rule-table-adapter/u);
assert.doesNotMatch(ruleAdapter, /state-machine-adapter/u);

console.log(
  "Agent runtime profile check passed: KFD Runtime 100, 35 Core / 65 Experimental, 2 reference adapters, 7 adversarial report mutations",
);
