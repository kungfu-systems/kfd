// SPDX-License-Identifier: Apache-2.0
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const profileRoot = path.join(root, "profiles", "perspective-conformance");
const manifest = JSON.parse(fs.readFileSync(path.join(profileRoot, "manifest.json"), "utf8"));
const vectors = JSON.parse(fs.readFileSync(path.join(profileRoot, "vectors.json"), "utf8"));
const publishedCodes = new Set(
  JSON.parse(fs.readFileSync(path.join(profileRoot, "issue-codes.json"), "utf8")).codes,
);

assert.equal(manifest.contract, "kfd.perspective-conformance-manifest/v1");
assert.equal(manifest.profile.id, "kfd-perspective-conformance");
assert.equal(manifest.profile.version, "0.1.0-alpha.1");
assert.deepEqual(manifest.decisionStatus, { "KFD-4": "active", "KFD-8": "draft" });
for (const surface of manifest.surfaces) {
  const absolute = path.resolve(root, surface.path);
  assert.equal(path.relative(root, absolute).startsWith(".."), false, `${surface.path} escaped package root`);
  assert.equal(fs.lstatSync(absolute).isSymbolicLink(), false, `${surface.path} must not be a symlink`);
  assert.equal(
    crypto.createHash("sha256").update(fs.readFileSync(absolute)).digest("hex"),
    surface.sha256,
    `${surface.path} digest drifted`,
  );
}
assert.equal(vectors.contract, "kfd.perspective-conformance-vectors/v1");
assert.equal(vectors.profile, "kfd-perspective-conformance@0.1.0-alpha.1");

const ids = new Set();
for (const testCase of vectors.cases) {
  assert.equal(ids.has(testCase.id), false, `duplicate vector id ${testCase.id}`);
  ids.add(testCase.id);
  assert.ok(["KFD-4", "KFD-8"].includes(testCase.decision));
  assert.ok(fs.existsSync(path.join(root, testCase.fixture)), `missing fixture ${testCase.fixture}`);
  for (const code of testCase.issueCodes) {
    assert.ok(publishedCodes.has(code), `${testCase.id} uses unpublished issue code ${code}`);
  }
}
for (const required of [
  "kfd4-positive-i8-i12",
  "kfd4-negative-absolute-context",
  "kfd4-negative-undeclared-invariants",
  "kfd4-negative-mutated-invariant",
  "kfd4-negative-causal-reversal",
  "kfd4-negative-silent-mutation",
  "kfd8-positive-current",
  "kfd8-positive-degraded-conflicted",
  "kfd8-negative-identity-mismatch",
  "kfd8-negative-current-reference-rewrite",
  "kfd8-negative-semantic-inference",
  "kfd8-negative-unbound-cut",
  "kfd8-negative-state-loss",
  "kfd8-negative-stale-freshness",
  "kfd8-negative-conflict-unknowns",
]) {
  assert.ok(ids.has(required), `missing required fixed vector ${required}`);
}

function run(command, args, expected) {
  const result = spawnSync(command, args, { cwd: root, encoding: "utf8" });
  assert.equal(
    result.status,
    expected,
    `${command} ${args.join(" ")}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
  );
  return result.stdout.trim();
}

for (const testCase of vectors.cases) {
  const expected = testCase.valid ? 0 : 1;
  const native = run("cargo", [
    "run", "--locked", "--offline", "--quiet", "--manifest-path", "verifier/Cargo.toml",
    "-p", "kfd-verifier-cli", "--", "verify", "kfd-record", testCase.fixture, "--json",
  ], expected);
  const wasm = run("node", [
    "bin/kfd-verify-current.mjs", "verify", "kfd-record", testCase.fixture, "--json",
  ], expected);
  assert.equal(wasm, native, `${testCase.id}: native and WASM diagnostics differ`);
  assert.equal(
    crypto.createHash("sha256").update(native).digest("hex"),
    testCase.reportSha256,
    `${testCase.id}: retained diagnostic report drifted`,
  );
  const report = JSON.parse(native);
  assert.equal(report.valid, testCase.valid, `${testCase.id}: validity drifted`);
  assert.equal(report.qualifying, false, `${testCase.id}: verifier must not qualify`);
  assert.equal(report.selfCertified, false, `${testCase.id}: verifier must not self-certify`);
  assert.equal(report.offline, true, `${testCase.id}: verifier must remain offline`);
  assert.deepEqual(
    report.issues,
    [...report.issues].sort((left, right) =>
      [left.path, left.code, left.message].join("\0")
        .localeCompare([right.path, right.code, right.message].join("\0"), "en")),
    `${testCase.id}: issues must remain sorted by path, code, and message`,
  );
  for (const code of testCase.issueCodes) {
    assert.ok(report.issues.some((issue) => issue.code === code), `${testCase.id}: missing ${code}`);
  }
}

if (process.env.KFD_PERSPECTIVE_SKIP_EXTRACTION !== "1") {
  const extraction = fs.mkdtempSync(path.join(os.tmpdir(), "kfd-perspective-package-"));
  try {
    const packed = spawnSync(
      npmCommand,
      ["pack", "--ignore-scripts", "--json", "--pack-destination", extraction],
      { cwd: root, encoding: "utf8" },
    );
    assert.equal(packed.status, 0, `clean package creation failed\n${packed.stderr}`);
    const [{ filename }] = JSON.parse(packed.stdout);
    const archive = path.join(extraction, filename);
    const unpacked = spawnSync("tar", ["-xzf", archive, "-C", extraction], {
      cwd: extraction,
      encoding: "utf8",
    });
    assert.equal(unpacked.status, 0, `clean package extraction failed\n${unpacked.stderr}`);
    const replay = spawnSync(
      "node",
      ["scripts/check-perspective-conformance.mjs"],
      {
        cwd: path.join(extraction, "package"),
        encoding: "utf8",
        env: {
          ...process.env,
          CARGO_NET_OFFLINE: "true",
          KFD_PERSPECTIVE_SKIP_EXTRACTION: "1",
        },
      },
    );
    assert.equal(
      replay.status,
      0,
      `clean extracted package replay failed\nstdout:\n${replay.stdout}\nstderr:\n${replay.stderr}`,
    );
  } finally {
    fs.rmSync(extraction, { recursive: true, force: true });
  }
}

console.log(`check-perspective-conformance: ${vectors.cases.length} fixed native/WASM vectors and clean offline package extraction passed`);
