// SPDX-License-Identifier: Apache-2.0
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { canonicalJson } from "./self-conformance-contract.mjs";
import { verifyLifecycleGate } from "./self-conformance-lifecycle-gate.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const evidenceDirectory = path.join(root, "evidence/self-conformance/transitions");

function git(args, expected = 0) {
  const result = spawnSync("git", args, { cwd: root, encoding: "utf8" });
  if (result.status !== expected) throw new Error(result.stderr.trim() || `git ${args.join(" ")} failed`);
  return result.stdout;
}

function registryTransitions(before, after) {
  const result = new Set();
  const prior = new Map((before?.entries ?? []).map((entry) => [entry.id, entry]));
  for (const entry of after?.entries ?? []) {
    const previous = prior.get(entry.id);
    if (!previous && entry.status === "draft") result.add("draft-promotion");
    if (previous?.status === "draft" && entry.status === "active") result.add("activation");
    if (previous?.status === "active" && entry.status === "superseded") result.add("supersession");
  }
  return result;
}

export function classifyChangedPaths(paths, options = {}) {
  const required = new Set();
  if (paths.some((value) => value === "drafts/registry.json" || /^drafts\/[^/]+\.md$/.test(value))) {
    required.add("candidate");
  }
  if (paths.some((value) => value.startsWith("evidence/self-conformance/qualification/"))) {
    required.add("qualification");
  }
  if (paths.includes("registry.json")) {
    for (const value of registryTransitions(options.beforeRegistry, options.afterRegistry)) required.add(value);
  }
  if (paths.some((value) => /^docs\/foundation-revision-[^/]+\.md$/.test(value))) {
    required.add("foundation-revision");
  }
  if (paths.includes("kfd.release.json") || /^(alpha|release)\/v[0-9]+\/v[0-9.]+$/.test(options.baseRef ?? "")) {
    required.add("release");
  }
  return [...required].sort();
}

function discoverChangedPaths() {
  const explicit = process.env.KFD_SELF_CONFORMANCE_CHANGED_PATHS;
  if (explicit !== undefined) {
    return {
      paths: explicit.split("\n").map((value) => value.trim()).filter(Boolean),
    };
  }
  const baseRef = process.env.KFD_SELF_CONFORMANCE_BASE_REF || process.env.GITHUB_BASE_REF || "";
  if (!baseRef) return { paths: [] };
  const reference = `origin/${baseRef}`;
  const resolved = spawnSync("git", ["rev-parse", "--verify", `${reference}^{commit}`], {
    cwd: root,
    encoding: "utf8",
  });
  if (resolved.status !== 0) {
    const sourceSha = process.env.BUILDCHAIN_SOURCE_SHA || "";
    const sourceTree = process.env.BUILDCHAIN_SOURCE_TREE_SHA || "";
    const currentSha = git(["rev-parse", "HEAD"]).trim();
    const currentTree = git(["rev-parse", "HEAD^{tree}"]).trim();
    if (sourceSha !== currentSha || sourceTree !== currentTree) {
      throw new Error(
        `Self-Conformance change gate cannot resolve ${reference}; provide full base history, exact Buildchain source SHA/tree, or KFD_SELF_CONFORMANCE_CHANGED_PATHS`,
      );
    }
    return { mode: "exact-build-replay", paths: [] };
  }
  return {
    mode: "changed-paths",
    paths: git(["diff", "--name-only", `${reference}...HEAD`]).trim().split("\n").filter(Boolean),
  };
}

function readBaseRegistry(baseRef) {
  if (!baseRef) return null;
  const result = spawnSync("git", ["show", `origin/${baseRef}:registry.json`], { cwd: root, encoding: "utf8" });
  return result.status === 0 ? JSON.parse(result.stdout) : null;
}

function retainedRequests() {
  if (!fs.existsSync(evidenceDirectory)) return [];
  return fs.readdirSync(evidenceDirectory)
    .filter((name) => name.endsWith(".request.json"))
    .sort()
    .map((name) => path.join(evidenceDirectory, name));
}

export function checkRetainedLifecycleEvidence(requiredPaths = []) {
  const covered = new Set();
  let count = 0;
  for (const requestPath of retainedRequests()) {
    const request = JSON.parse(fs.readFileSync(requestPath, "utf8"));
    const report = verifyLifecycleGate(request);
    assert.equal(report.valid, true, `${path.relative(root, requestPath)}: ${JSON.stringify(report.issues)}`);
    const reportPath = requestPath.replace(/\.request\.json$/, ".report.json");
    assert.equal(fs.existsSync(reportPath), true, `missing retained lifecycle report: ${path.relative(root, reportPath)}`);
    const retained = JSON.parse(fs.readFileSync(reportPath, "utf8"));
    assert.equal(canonicalJson(retained), canonicalJson(report), `retained lifecycle report drifted: ${path.relative(root, reportPath)}`);
    covered.add(request.lifecyclePath);
    count += 1;
  }
  for (const required of requiredPaths) {
    assert.equal(covered.has(required), true, `official ${required} path changed without a valid retained Self-Conformance request/report pair`);
  }
  return { count, covered: [...covered].sort() };
}

function main() {
  const discovery = discoverChangedPaths();
  const baseRef = process.env.KFD_SELF_CONFORMANCE_BASE_REF || process.env.GITHUB_BASE_REF || "";
  const afterRegistry = JSON.parse(fs.readFileSync(path.join(root, "registry.json"), "utf8"));
  const required = classifyChangedPaths(discovery.paths, {
    baseRef,
    beforeRegistry: readBaseRegistry(baseRef),
    afterRegistry,
  });
  const retained = checkRetainedLifecycleEvidence(required);
  console.log(`Self-Conformance change gate passed: required=${required.join(",") || "none"}; retained=${retained.count}; mode=${discovery.mode || "explicit-paths"}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
