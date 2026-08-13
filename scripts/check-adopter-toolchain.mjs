// SPDX-License-Identifier: Apache-2.0
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { semanticRoot } from "./self-conformance-contract.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const packageArtifactRoot = "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const adopterArtifactRoot = "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
const witnessRoot = "sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc";
const verifiedAt = "2026-08-11T00:00:00Z";
const maxAgeSeconds = "86400";

function run(cwd, args, expected, env = process.env) {
  const result = spawnSync("node", ["bin/kfd.mjs", ...args, "--json"], { cwd, encoding: "utf8", env });
  assert.equal(
    result.status,
    expected,
    `node bin/kfd.mjs ${args.join(" ")}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
  );
  return result;
}

function contextFlags() {
  return [
    "--package-root", packageArtifactRoot,
    "--verified-at", verifiedAt,
    "--max-age-seconds", maxAgeSeconds,
  ];
}

function exercise(cwd) {
  const brief = fs.readFileSync(path.join(cwd, "profiles/adopter-conformance/agent-brief.md"), "utf8");
  for (const command of ["init", "witness", "verify", "diff", "bundle"]) {
    assert.match(brief, new RegExp(`kfd adopter ${command}`));
  }
  assert.match(brief, /unknown decision IDs, witness profiles, fields, roots, and package/);
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "kfd-adopter-toolchain-"));
  try {
    const manifestPath = path.join(scratch, "manifest.json");
    const witnessedPath = path.join(scratch, "witnessed.json");
    const reportPath = path.join(scratch, "report.json");
    const diffPath = path.join(scratch, "diff.json");
    const bundlePath = path.join(scratch, "bundle.json");
    const initArgs = [
      "adopter", "init",
      "--manifest-id", "clean-room-fixture",
      "--adopter-id", "example-third-party",
      "--artifact-kind", "git-commit",
      "--artifact-coordinate", "example/repository@0123456789abcdef",
      "--artifact-root", adopterArtifactRoot,
      "--scope", "package-only-test",
      ...contextFlags(),
      "--output", manifestPath,
    ];
    run(cwd, initArgs, 0);
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const registry = JSON.parse(fs.readFileSync(path.join(cwd, "registry.json"), "utf8"));
    assert.deepEqual(manifest.decisions.map(({ id }) => id), registry.entries.map(({ id }) => id));
    assert.equal(manifest.kfdCut.package.artifactRoot, packageArtifactRoot);
    assert.equal(manifest.decisions.every((row) => row.state === "not-used"), true);

    run(cwd, ["adopter", "verify", manifestPath, ...contextFlags(), "--output", reportPath], 0);
    const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
    assert.deepEqual(
      { valid: report.valid, qualifying: report.qualifying, selfCertified: report.selfCertified, offline: report.offline },
      { valid: true, qualifying: false, selfCertified: false, offline: true },
    );

    run(cwd, [
      "adopter", "witness", manifestPath,
      "--decision", "KFD-10",
      "--profile", "kfd-warrant-evidence",
      "--coordinate", "example/repository@0123456789abcdef#warrant",
      "--witness-root", witnessRoot,
      ...contextFlags(),
      "--output", witnessedPath,
    ], 0);
    const witnessed = JSON.parse(fs.readFileSync(witnessedPath, "utf8"));
    const row = witnessed.decisions.find(({ id }) => id === "KFD-10");
    assert.equal(row.registryStatus, "draft");
    assert.equal(row.state, "draft-evidence");
    assert.equal(row.claims.length, 0);
    assert.equal(row.witnessBindings[0].kfdPackageRoot, packageArtifactRoot);

    run(cwd, ["adopter", "diff", manifestPath, witnessedPath, "--output", diffPath], 0);
    const diff = JSON.parse(fs.readFileSync(diffPath, "utf8"));
    assert.deepEqual(diff.added, []);
    assert.deepEqual(diff.removed, []);
    assert.deepEqual(diff.changed.map(({ id }) => id), ["KFD-10"]);
    assert.equal(diff.beforeRoot, semanticRoot(manifest));
    assert.equal(diff.afterRoot, semanticRoot(witnessed));

    run(cwd, ["adopter", "bundle", witnessedPath, ...contextFlags(), "--output", bundlePath], 0);
    const bundle = JSON.parse(fs.readFileSync(bundlePath, "utf8"));
    assert.equal(bundle.contract, "kfd.adopter-conformance-bundle/v1");
    assert.equal(bundle.verificationReport.valid, true);
    assert.equal(bundle.roots.manifestRoot, semanticRoot(witnessed));
    assert.equal(bundle.qualifying, false);
    assert.equal(bundle.selfCertified, false);

    const unknownFieldPath = path.join(scratch, "unknown-field.json");
    fs.writeFileSync(unknownFieldPath, `${JSON.stringify({ ...manifest, inferredConformance: true })}\n`);
    assert.match(run(cwd, ["adopter", "verify", unknownFieldPath, ...contextFlags()], 2).stderr, /Unknown manifest fields fail closed/);

    const unknownValuePath = path.join(scratch, "unknown-value.json");
    const unknownValue = structuredClone(manifest);
    unknownValue.adopter.artifact.kind = "ambient-checkout";
    fs.writeFileSync(unknownValuePath, `${JSON.stringify(unknownValue)}\n`);
    assert.match(run(cwd, ["adopter", "verify", unknownValuePath, ...contextFlags()], 2).stderr, /Unsupported value/);

    const malformedRootPath = path.join(scratch, "malformed-root.json");
    const malformedRoot = structuredClone(manifest);
    malformedRoot.adopter.artifact.root = "sha256:not-a-root";
    fs.writeFileSync(malformedRootPath, `${JSON.stringify(malformedRoot)}\n`);
    assert.match(run(cwd, ["adopter", "verify", malformedRootPath, ...contextFlags()], 2).stderr, /64 lowercase hexadecimal/);

    assert.match(run(cwd, [
      "adopter", "witness", manifestPath,
      "--decision", "KFD-999", "--profile", "kfd-warrant-evidence",
      "--coordinate", "fixture#witness", "--witness-root", witnessRoot,
      ...contextFlags(), "--output", path.join(scratch, "unknown-decision.json"),
    ], 2).stderr, /not admitted for KFD-999/);
    assert.match(run(cwd, [
      "adopter", "witness", manifestPath,
      "--decision", "KFD-10", "--profile", "unknown-profile",
      "--coordinate", "fixture#witness", "--witness-root", witnessRoot,
      ...contextFlags(), "--output", path.join(scratch, "unknown-profile.json"),
    ], 2).stderr, /not admitted for KFD-10/);

    const substituted = run(cwd, [
      "adopter", "verify", manifestPath,
      "--package-root", "sha256:dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd",
      "--verified-at", verifiedAt, "--max-age-seconds", maxAgeSeconds,
    ], 1);
    assert.ok(JSON.parse(substituted.stdout).issues.some(({ code }) => code === "acm-root-substitution"));
    assert.match(run(cwd, initArgs, 2).stderr, /EEXIST|file already exists/);
  } finally {
    fs.rmSync(scratch, { recursive: true, force: true });
  }
}

exercise(root);

if (process.env.KFD_ADOPTER_TOOLCHAIN_SKIP_EXTRACTION !== "1") {
  const extraction = fs.mkdtempSync(path.join(os.tmpdir(), "kfd-adopter-toolchain-package-"));
  try {
    const packed = spawnSync(
      npmCommand,
      ["pack", "--ignore-scripts", "--json", "--pack-destination", extraction],
      { cwd: root, encoding: "utf8", shell: process.platform === "win32" },
    );
    assert.equal(packed.status, 0, `clean package creation failed\n${packed.stderr}`);
    const [{ filename }] = JSON.parse(packed.stdout);
    const unpacked = spawnSync("tar", ["-xzf", path.join(extraction, filename), "-C", extraction], {
      cwd: extraction,
      encoding: "utf8",
    });
    assert.equal(unpacked.status, 0, `clean package extraction failed\n${unpacked.stderr}`);
    const extractedRoot = path.join(extraction, "package");
    const replay = spawnSync("node", ["scripts/check-adopter-toolchain.mjs"], {
      cwd: extractedRoot,
      encoding: "utf8",
      env: {
        PATH: process.env.PATH,
        KFD_ADOPTER_TOOLCHAIN_SKIP_EXTRACTION: "1",
        HOME: path.join(extraction, "absent-home"),
        KFD_ADOPTER_OFFLINE: "1",
      },
    });
    assert.equal(
      replay.status,
      0,
      `clean extracted package replay failed\nstdout:\n${replay.stdout}\nstderr:\n${replay.stderr}`,
    );
  } finally {
    fs.rmSync(extraction, { recursive: true, force: true });
  }
}

console.log("check-adopter-toolchain: package-only init/witness/verify/diff/bundle and fail-closed clean-room replay passed");
