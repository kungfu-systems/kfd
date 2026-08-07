// SPDX-License-Identifier: Apache-2.0
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, "verifier", "extraction-manifest.json"), "utf8"),
);
assert.equal(manifest.contract, "kfd.verifier-extraction-manifest/v1");
const extraction = fs.mkdtempSync(path.join(os.tmpdir(), "kfd-verifier-extraction-"));
try {
  for (const relative of manifest.include) {
    const source = path.join(root, relative);
    const destination = path.join(extraction, relative);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.cpSync(source, destination, { recursive: true, errorOnExist: true });
  }
  const result = spawnSync(
    "cargo",
    [
      "test",
      "--locked",
      "--offline",
      "--manifest-path",
      path.join(extraction, "verifier", "Cargo.toml"),
      "--workspace",
    ],
    { cwd: extraction, encoding: "utf8" },
  );
  assert.equal(
    result.status,
    0,
    `clean extraction failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
  );
  const installRoot = path.join(extraction, "install");
  const install = spawnSync(
    "cargo",
    [
      "install",
      "--locked",
      "--offline",
      "--path",
      path.join(extraction, "verifier", "crates", "cli"),
      "--root",
      installRoot,
    ],
    { cwd: extraction, encoding: "utf8" },
  );
  assert.equal(
    install.status,
    0,
    `clean cargo install failed\nstdout:\n${install.stdout}\nstderr:\n${install.stderr}`,
  );
  const installed = spawnSync(
    path.join(installRoot, "bin", "kfd"),
    ["verify", "kfd-record", path.join(extraction, "standards.json"), "--json"],
    { cwd: extraction, encoding: "utf8" },
  );
  assert.equal(installed.status, 0, installed.stderr);
  assert.equal(JSON.parse(installed.stdout).valid, true);
  const selfConformance = spawnSync(
    path.join(installRoot, "bin", "kfd"),
    [
      "verify",
      "self-conformance-transition",
      path.join(
        extraction,
        "verifier",
        "fixtures",
        "self-conformance",
        "valid-report-predecessor.json",
      ),
      "--json",
    ],
    { cwd: extraction, encoding: "utf8" },
  );
  assert.equal(selfConformance.status, 0, selfConformance.stderr);
  const selfConformanceReport = JSON.parse(selfConformance.stdout);
  assert.equal(selfConformanceReport.valid, true);
  assert.equal(selfConformanceReport.qualifying, false);
  assert.equal(selfConformanceReport.selfCertified, false);
  assert.equal(selfConformanceReport.offline, true);
  const metadata = spawnSync(
    "cargo",
    [
      "metadata",
      "--locked",
      "--offline",
      "--no-deps",
      "--format-version",
      "1",
      "--manifest-path",
      path.join(extraction, "verifier", "Cargo.toml"),
    ],
    { cwd: extraction, encoding: "utf8" },
  );
  assert.equal(metadata.status, 0, metadata.stderr);
  for (const packageRecord of JSON.parse(metadata.stdout).packages) {
    assert.ok(
      packageRecord.manifest_path.startsWith(extraction),
      `${packageRecord.name} escaped the extraction root`,
    );
    assert.doesNotMatch(
      packageRecord.name,
      /^(kungfu|xinfa|buildchain|shifu)(-|$)/u,
      "product package entered the verifier dependency graph",
    );
  }
  console.log("check-verifier-extraction: clean offline extraction passed");
} finally {
  fs.rmSync(extraction, { recursive: true, force: true });
}
