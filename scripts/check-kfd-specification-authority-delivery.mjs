// SPDX-License-Identifier: Apache-2.0
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { createPublishedKfdSpecificationAuthorityDelivery } from "./kfd-specification-authority-delivery.mjs";
import { semanticRoot } from "./self-conformance-contract.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const verifiedAt = "2026-08-13T00:00:00Z";

function fileRoot(file) {
  return `sha256:${createHash("sha256").update(fs.readFileSync(file)).digest("hex")}`;
}

function pack(directory, destination) {
  const result = spawnSync(
    npmCommand,
    ["pack", directory, "--ignore-scripts", "--json", "--pack-destination", destination],
    { cwd: root, encoding: "utf8", shell: process.platform === "win32" },
  );
  assert.equal(
    result.status,
    0,
    `npm pack ${directory} failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
  );
  const [{ filename }] = JSON.parse(result.stdout);
  const archivePath = path.join(destination, filename);
  return { archivePath, archiveRoot: fileRoot(archivePath) };
}

function coordinate(kind, coordinateValue, label) {
  return {
    kind,
    coordinate: coordinateValue,
    root: semanticRoot({ label }),
  };
}

const evidenceRequirements = [
  ["adopter-identity", ["declaration"]],
  ["claim-boundary", ["declaration"]],
  ["kfd-cut", ["verification"]],
  ["semantic-authority", ["declaration", "implementation", "review", "verification"]],
  ["source-artifact", ["implementation"]],
  ["specification-transition", ["declaration", "review", "verification"]],
];

function evidence() {
  return evidenceRequirements.flatMap(([requirementId, kinds]) =>
    kinds.map((kind) => ({
      requirementId,
      kind,
      coordinate: `evidence://kungfu-systems/kfd/${requirementId}/${kind}`,
      root: semanticRoot({ requirementId, kind }),
      observedAt: verifiedAt,
    })),
  );
}

const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "kfd-specification-authority-delivery-"));
try {
  const resolve = createRequire(path.join(root, "package.json")).resolve;
  const buildchainPackageJsonPath = resolve("@kungfu-tech/buildchain/package.json");
  const buildchainPackageRoot = path.dirname(buildchainPackageJsonPath);
  const buildchainPackage = JSON.parse(fs.readFileSync(buildchainPackageJsonPath, "utf8"));
  const resolveBuildchainDependency = createRequire(buildchainPackageJsonPath).resolve;
  const kfdPackageJsonPath = resolveBuildchainDependency("@kungfu-tech/kfd/package.json");
  const kfdPackageRoot = path.dirname(kfdPackageJsonPath);
  const kfdPackage = JSON.parse(fs.readFileSync(kfdPackageJsonPath, "utf8"));
  const kfdManifest = JSON.parse(
    fs.readFileSync(
      path.join(kfdPackageRoot, "profiles/adopter-conformance/adopters/kfd/manifest.json"),
      "utf8",
    ),
  );
  assert.equal(buildchainPackage.version, "3.0.9-alpha.11");
  assert.equal(kfdPackage.version, "1.0.0-alpha.62");

  const buildchainArchive = pack(buildchainPackageRoot, scratch);
  const kfdArchive = pack(kfdPackageRoot, scratch);
  const authorityPackages = {
    buildchain: {
      name: "@kungfu-tech/buildchain",
      version: buildchainPackage.version,
      archivePath: buildchainArchive.archivePath,
      archiveRoot: buildchainArchive.archiveRoot,
      artifactRoot: buildchainArchive.archiveRoot,
    },
    kfd: {
      name: "@kungfu-tech/kfd",
      version: kfdPackage.version,
      archivePath: kfdArchive.archivePath,
      archiveRoot: kfdArchive.archiveRoot,
      artifactRoot: kfdManifest.kfdCut.package.artifactRoot,
    },
  };
  const candidate = {
    instanceId: "kungfu-systems/kfd@1.0.0-alpha.64",
    version: "1.0.0-alpha.64",
    source: coordinate(
      "git-commit",
      "kungfu-systems/kfd@1111111111111111111111111111111111111111",
      "candidate-source",
    ),
    artifact: coordinate(
      "package",
      "@kungfu-tech/kfd@1.0.0-alpha.64",
      "candidate-package",
    ),
    release: coordinate(
      "release",
      "https://github.com/kungfu-systems/kfd/releases/tag/v1.0.0-alpha.64",
      "candidate-release-passport",
    ),
  };
  const recursiveSelfConformance = {
    contract: "kfd.recursive-self-conformance-result/v1",
    root: semanticRoot({ result: "recursive-self-conformance-passed" }),
    status: "passed",
  };
  const result = await createPublishedKfdSpecificationAuthorityDelivery({
    authorityPackages,
    candidate,
    evidence: evidence(),
    recursiveSelfConformance,
    verifiedAt,
  });
  assert.equal(result.status, "passed");
  assert.equal(result.authority.buildchain.version, "3.0.9-alpha.11");
  assert.equal(result.authority.kfd.version, "1.0.0-alpha.62");
  assert.equal(result.candidate.version, "1.0.0-alpha.64");
  assert.equal(result.instanceReport.valid, true);
  assert.equal(result.gateResult.status, "passed");
  assert.equal(result.qualifying, false);
  assert.equal(result.selfCertified, false);
  assert.equal(result.releaseAuthorized, false);
  assert.notEqual(result.roots.recursiveSelfConformance, result.roots.gateResult);
  assert.equal(
    result.deliveryJoin.recursiveSelfConformanceRoot,
    result.roots.recursiveSelfConformance,
  );
  assert.equal(result.deliveryJoin.adopterDeliveryGateRoot, result.roots.gateResult);

  const alternateRecursive = await createPublishedKfdSpecificationAuthorityDelivery({
    authorityPackages,
    candidate,
    evidence: evidence(),
    recursiveSelfConformance: {
      ...recursiveSelfConformance,
      root: semanticRoot({ result: "independent-recursive-replay" }),
    },
    verifiedAt,
  });
  assert.equal(alternateRecursive.roots.gateResult, result.roots.gateResult);
  assert.notEqual(alternateRecursive.roots.deliveryJoin, result.roots.deliveryJoin);

  await assert.rejects(
    createPublishedKfdSpecificationAuthorityDelivery({
      authorityPackages,
      candidate: {
        ...candidate,
        instanceId: `kungfu-systems/kfd@${kfdPackage.version}`,
        version: kfdPackage.version,
        artifact: {
          ...candidate.artifact,
          coordinate: `@kungfu-tech/kfd@${kfdPackage.version}`,
        },
      },
      evidence: evidence(),
      recursiveSelfConformance,
      verifiedAt,
    }),
    /independent older KFD semantic cut/,
  );
  await assert.rejects(
    createPublishedKfdSpecificationAuthorityDelivery({
      authorityPackages,
      candidate,
      evidence: evidence().slice(1),
      recursiveSelfConformance,
      verifiedAt,
    }),
    /specification-authority instance failed closed/,
  );
} finally {
  fs.rmSync(scratch, { recursive: true, force: true });
}

console.log(
  "check-kfd-specification-authority-delivery: exact Buildchain/KFD N-1 authority, anti-circular gate, and separate release join passed",
);
