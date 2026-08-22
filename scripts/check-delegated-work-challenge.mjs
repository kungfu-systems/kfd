#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { verifyDelegatedWorkChallengeReport } from "./delegated-work-challenge-report-verifier.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cli = path.join(root, "bin", "kfd.mjs");
const starter = path.join(root, "profiles", "delegated-work-challenge", "adapters", "node-starter.mjs");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

function run(command, args, expected, options = {}) {
  const result = spawnSync(command, args, { cwd: options.cwd ?? root, encoding: "utf8", env: { ...process.env, ...options.env }, input: options.input });
  assert.equal(result.status, expected, `${command} ${args.join(" ")}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
  return result;
}

function cliJson(args, expected = 0, cwd = root) {
  return JSON.parse(run(process.execPath, [cli, ...args, "--json"], expected, { cwd }).stdout);
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function mutated(report, apply) {
  const copy = structuredClone(report);
  apply(copy);
  return copy;
}

const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "kfd-delegated-work-"));
try {
  const first = cliJson(["challenge", "delegated-work"]);
  const second = cliJson(["challenge", "delegated-work"]);
  assert.equal(first.contract, "kfd.delegated-work-challenge-report/v1");
  assert.equal(first.summary.collapsed, 6);
  assert.equal(first.summary.informationDistinguishable, 0);
  assert.deepEqual(first, second, "same inputs must produce a byte-stable machine report");

  const full = cliJson(["challenge", "delegated-work", "--projection", "full-semantic"]);
  assert.equal(full.summary.collapsed, 0);
  assert.equal(full.summary.informationDistinguishable, 6);
  const single = cliJson(["challenge", "delegated-work", "--pair", "retry-identity"]);
  assert.deepEqual(single.findings.map(({ pairId }) => pairId), ["retry-identity"]);

  const customPath = path.join(temporary, "custom-projection.json");
  writeJson(customPath, {
    schemaVersion: 1,
    contract: "kfd.delegated-work-projection/v1",
    id: "authority-only-change",
    visible: ["task.id", "artifact.digest", "tests.status", "run.status", "authority.status"],
  });
  const custom = cliJson(["challenge", "delegated-work", "--projection", customPath]);
  assert.equal(custom.summary.collapsed, 5);
  assert.equal(custom.summary.informationDistinguishable, 1);
  assert.equal(custom.findings.find(({ pairId }) => pairId === "authority-revocation").collision, false);

  for (const [name, visible, pattern] of [
    ["unknown", ["task.id", "vendor.magic"], /unknown or not allowlisted/u],
    ["duplicate", ["task.id", "task.id"], /duplicate/u],
    ["prohibited", ["task.id", "expectedOutcome"], /unknown or not allowlisted|prohibited/u],
  ]) {
    const projectionPath = path.join(temporary, `${name}.json`);
    writeJson(projectionPath, { schemaVersion: 1, contract: "kfd.delegated-work-projection/v1", id: name, visible });
    const failure = run(process.execPath, [cli, "challenge", "delegated-work", "--projection", projectionPath], 2);
    assert.match(failure.stderr, pattern);
  }

  const projectionReportPath = path.join(temporary, "projection-report.json");
  run(process.execPath, [cli, "challenge", "delegated-work", "--output", projectionReportPath], 0);
  const projectionReport = JSON.parse(fs.readFileSync(projectionReportPath, "utf8"));
  assert.equal(verifyDelegatedWorkChallengeReport(projectionReport).valid, true);

  const adapterReportPath = path.join(temporary, "adapter-report.json");
  const adapterRun = cliJson(["challenge", "delegated-work", "--adapter", starter, "--output", adapterReportPath], 1);
  assert.equal(adapterRun.summary.adapterDeclaredEnforcement, "not-satisfied");
  const adapterReport = JSON.parse(fs.readFileSync(adapterReportPath, "utf8"));
  assert.equal(verifyDelegatedWorkChallengeReport(adapterReport, { adapterPath: starter }).valid, true);

  const mutations = [
    ["suite", (value) => { value.suite.suiteRoot = `sha256:${"0".repeat(64)}`; }],
    ["fixture", (value) => { value.suite.fixtureRoots[0].root = `sha256:${"0".repeat(64)}`; }],
    ["projection", (value) => { value.projection.document.visible.pop(); }],
    ["expected", (value) => { value.findings[0].required.A.mayAdvance = false; }],
    ["projected-state", (value) => { value.findings[0].worlds.A.projectedState.task.id = "mutated"; }],
    ["projected-root", (value) => { value.findings[0].worlds.A.projectedRoot = `sha256:${"0".repeat(64)}`; }],
    ["result", (value) => { value.execution.resultRoot = `sha256:${"0".repeat(64)}`; }],
    ["scope", (value) => { value.certification = true; }],
  ];
  for (const [name, apply] of mutations) {
    assert.equal(verifyDelegatedWorkChallengeReport(mutated(projectionReport, apply)).valid, false, `${name} mutation must fail`);
  }
  for (const [name, apply] of [
    ["response", (value) => { value.findings[0].adapterAssertion.worlds.A.response.code = "mutated"; }],
    ["transcript", (value) => { value.execution.transcript[1].response.code = "mutated"; }],
    ["adapter-digest", (value) => { value.adapter.artifactDigest = `sha256:${"0".repeat(64)}`; }],
  ]) {
    assert.equal(verifyDelegatedWorkChallengeReport(mutated(adapterReport, apply), { adapterPath: starter }).valid, false, `${name} mutation must fail`);
  }

  const changedAdapter = path.join(temporary, "changed-adapter.mjs");
  fs.writeFileSync(changedAdapter, `${fs.readFileSync(starter, "utf8")}\n// changed bytes\n`);
  assert.equal(verifyDelegatedWorkChallengeReport(adapterReport, { adapterPath: changedAdapter }).valid, false, "adapter byte mutation must fail");
  if (process.platform !== "win32") {
    const adapterLink = path.join(temporary, "adapter-link.mjs");
    fs.symlinkSync(starter, adapterLink);
    assert.match(run(process.execPath, [cli, "challenge", "delegated-work", "--adapter", adapterLink], 2).stderr, /regular file, not a symlink/u);
  }

  const unknownRequest = JSON.stringify({ schemaVersion: 1, contract: "kfd.delegated-work-adapter-request/v1", requestId: "unknown", operation: "evaluate", input: { pairId: "unknown-pair", scenario: {}, scenarioRoot: `sha256:${"0".repeat(64)}` } });
  const unknownResponse = JSON.parse(run(process.execPath, [starter], 0, { input: `${unknownRequest}\n` }).stdout);
  assert.equal(unknownResponse.decision.mayAdvance, false);
  assert.equal(unknownResponse.code, "unknown-operation-or-pair");

  const packRoot = path.join(temporary, "pack");
  const consumer = path.join(temporary, "consumer");
  fs.mkdirSync(packRoot);
  fs.mkdirSync(consumer);
  writeJson(path.join(consumer, "package.json"), { private: true });
  const packed = JSON.parse(run(npmCommand, ["pack", "--json", "--ignore-scripts", "--pack-destination", packRoot], 0).stdout);
  const tarball = path.join(packRoot, packed[0].filename);
  const packedPaths = new Set(packed[0].files.map(({ path: packedPath }) => packedPath));
  for (const required of [
    "profiles/delegated-work-challenge/fixtures/suite.json",
    "profiles/delegated-work-challenge/projections/execution-only.json",
    "profiles/delegated-work-challenge/adapters/node-starter.mjs",
    "schemas/kfd-delegated-work-challenge/report.schema.json",
    "scripts/delegated-work-challenge-runner.mjs",
    "scripts/delegated-work-challenge-report-verifier.mjs",
  ]) assert.equal(packedPaths.has(required), true, `packed artifact is missing ${required}`);
  run(npmCommand, ["install", "--ignore-scripts", "--no-audit", "--no-fund", tarball], 0, { cwd: consumer });
  const installedCli = path.join(consumer, "node_modules", ".bin", process.platform === "win32" ? "kfd.cmd" : "kfd");
  const installedReport = path.join(consumer, "report.json");
  const installedProjection = run(process.execPath, ["-p", "require.resolve('@kungfu-tech/kfd/delegated-work-challenge/projections/example-projection.json')"], 0, { cwd: consumer }).stdout.trim();
  const installedStarter = run(process.execPath, ["-p", "require.resolve('@kungfu-tech/kfd/delegated-work-challenge/adapters/node-starter.mjs')"], 0, { cwd: consumer }).stdout.trim();
  assert.equal(fs.lstatSync(installedProjection).isFile(), true);
  assert.equal(fs.lstatSync(installedStarter).isFile(), true);
  run(installedCli, ["challenge", "delegated-work", "--output", installedReport], 0, { cwd: consumer, env: { npm_config_offline: "true" } });
  run(installedCli, ["challenge", "delegated-work", "--projection", installedProjection], 0, { cwd: consumer, env: { npm_config_offline: "true" } });
  run(installedCli, ["verify", "delegated-work-challenge-report", installedReport, "--json"], 0, { cwd: consumer, env: { npm_config_offline: "true" } });

  console.log("delegated-work challenge: fixed projections, adapter boundary, mutation closure, and clean packed consumer ok");
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
