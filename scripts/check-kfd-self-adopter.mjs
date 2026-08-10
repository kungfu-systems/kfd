// SPDX-License-Identifier: Apache-2.0
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { verifyAdopterManifestFromPackage } from "./adopter-toolchain.mjs";
import { exactByteRoot, semanticRoot } from "./self-conformance-contract.mjs";
import {
  expectedKfdAdopterManifestText,
  KFD_SELF_MANIFEST_PATH,
  KFD_SELF_MAX_AGE_SECONDS,
  KFD_SELF_VERIFIED_AT,
} from "./generate-kfd-adopter-manifest.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, KFD_SELF_MANIFEST_PATH), "utf8"));
assert.equal(fs.readFileSync(path.join(root, KFD_SELF_MANIFEST_PATH), "utf8"), expectedKfdAdopterManifestText(), "KFD self-manifest drifted from its exact package cut");

const packageRoot = manifest.kfdCut.package.artifactRoot;
const report = verifyAdopterManifestFromPackage(manifest, {
  packageRoot: root,
  packageArtifactRoot: packageRoot,
  verifiedAt: KFD_SELF_VERIFIED_AT,
  maxAgeSeconds: KFD_SELF_MAX_AGE_SECONDS,
});
assert.equal(report.valid, true, JSON.stringify(report.issues, null, 2));
assert.equal(report.qualifying, false);
assert.equal(report.selfCertified, false);
assert.equal(report.offline, true);
assert.deepEqual(new Set(manifest.decisions.map(({ registryStatus }) => registryStatus)), new Set(["active", "draft"]));
assert.deepEqual(new Set(manifest.decisions.map(({ state }) => state)), new Set(["candidate", "draft-evidence", "unsupported", "not-used"]));

for (const row of manifest.decisions) {
  for (const item of [...row.implementationEvidence, ...row.verificationEvidence]) {
    const [coordinate, relative] = item.coordinate.split("#");
    assert.equal(coordinate, `kfd-package-cut:${packageRoot}`, `${row.id} evidence escaped the declared package cut`);
    assert.ok(relative && !relative.startsWith("/") && !relative.split("/").includes(".."), `${row.id} evidence path must be package-relative`);
    assert.equal(item.root, exactByteRoot(fs.readFileSync(path.join(root, relative))), `${row.id} evidence root drifted`);
    assert.equal(item.kfdPackageRoot, packageRoot, `${row.id} evidence changed package cut`);
  }
}
const kfd10 = manifest.decisions.find(({ id }) => id === "KFD-10");
assert.equal(kfd10.registryStatus, "draft");
assert.equal(kfd10.state, "draft-evidence");
assert.equal(kfd10.claims.length, 0);
assert.equal(kfd10.releaseBindingIds.length, 0);
assert.equal(kfd10.witnessBindings.length, 1);
assert.equal(kfd10.witnessBindings[0].witnessRoot, exactByteRoot(fs.readFileSync(path.join(root, "evidence/primitive-evidence/second-wave-report.json"))));

for (const mutate of [
  (candidate) => candidate.decisions.splice(0, 1),
  (candidate) => { candidate.decisions.find(({ id }) => id === "KFD-10").state = "candidate"; },
  (candidate) => { candidate.kfdCut.package.artifactRoot = "sha256:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"; },
]) {
  const candidate = structuredClone(manifest);
  mutate(candidate);
  assert.equal(verifyAdopterManifestFromPackage(candidate, {
    packageRoot: root,
    packageArtifactRoot: packageRoot,
    verifiedAt: KFD_SELF_VERIFIED_AT,
    maxAgeSeconds: KFD_SELF_MAX_AGE_SECONDS,
  }).valid, false, "KFD self-manifest mutation must fail closed");
}
assert.match(semanticRoot(manifest), /^sha256:[0-9a-f]{64}$/);

if (process.env.KFD_SELF_ADOPTER_SKIP_EXTRACTION !== "1") {
  const extraction = fs.mkdtempSync(path.join(os.tmpdir(), "kfd-self-adopter-package-"));
  try {
    const packed = spawnSync("npm", ["pack", "--ignore-scripts", "--json", "--pack-destination", extraction], { cwd: root, encoding: "utf8" });
    assert.equal(packed.status, 0, packed.stderr);
    const [{ filename }] = JSON.parse(packed.stdout);
    const unpacked = spawnSync("tar", ["-xzf", path.join(extraction, filename), "-C", extraction], { encoding: "utf8" });
    assert.equal(unpacked.status, 0, unpacked.stderr);
    const replay = spawnSync("node", ["scripts/check-kfd-self-adopter.mjs"], {
      cwd: path.join(extraction, "package"),
      encoding: "utf8",
      env: { PATH: process.env.PATH, HOME: path.join(extraction, "absent-home"), KFD_ADOPTER_OFFLINE: "1", KFD_SELF_ADOPTER_SKIP_EXTRACTION: "1" },
    });
    assert.equal(replay.status, 0, `clean package replay failed\nstdout:\n${replay.stdout}\nstderr:\n${replay.stderr}`);
  } finally {
    fs.rmSync(extraction, { recursive: true, force: true });
  }
}

console.log(`check-kfd-self-adopter: ${manifest.decisions.length} exact registry rows and package-only fail-closed replay passed`);
