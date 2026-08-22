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
const transitionEvidenceRoots = Object.freeze({
  declaration: semanticRoot({ transitionEvidence: "declaration" }),
  review: semanticRoot({ transitionEvidence: "independent-review" }),
  verification: semanticRoot({ transitionEvidence: "verification" }),
});

function evidence() {
  return evidenceRequirements.flatMap(([requirementId, kinds]) =>
    kinds.map((kind) => ({
      requirementId,
      kind,
      coordinate: `evidence://kungfu-systems/kfd/${requirementId}/${kind}`,
      root: requirementId === "specification-transition"
        ? transitionEvidenceRoots[kind]
        : semanticRoot({ requirementId, kind }),
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
  const authorityVerifierRoot = fileRoot(
    path.join(kfdPackageRoot, "scripts/adopter-category-instance-contract.mjs"),
  );
  const candidateVerifierRoot = fileRoot(
    path.join(root, "scripts/kfd-specification-authority-transition-contract.mjs"),
  );
  const transitionBootstrapAnchor = {
    packageVersion: kfdPackage.version,
    packageRoot: authorityPackages.kfd.artifactRoot,
    reviewRoot: semanticRoot({ review: "published-alpha62-bootstrap-anchor" }),
  };
  const specificationTransition = {
    $schema: "https://kfd.libkungfu.dev/schemas/kfd-adopter-conformance/specification-authority-transition.schema.json",
    schemaVersion: 1,
    contract: "kfd.specification-authority-transition/v1",
    transitionId: "kfd-alpha62-to-alpha64-delivery-bootstrap",
    mode: "bootstrap",
    authority: {
      packageVersion: kfdPackage.version,
      packageRoot: authorityPackages.kfd.artifactRoot,
      verifierRoot: authorityVerifierRoot,
    },
    candidate: {
      packageVersion: candidate.version,
      packageRoot: candidate.artifact.root,
      verifierRoot: candidateVerifierRoot,
    },
    changedSurfaces: [
      {
        id: "candidate-generation",
        beforeRoot: semanticRoot({ surface: "candidate-generation", cut: "alpha62" }),
        afterRoot: semanticRoot({ surface: "candidate-generation", cut: "alpha64" }),
      },
      {
        id: "profile",
        beforeRoot: semanticRoot({ surface: "profile", cut: "alpha62" }),
        afterRoot: semanticRoot({ surface: "profile", cut: "alpha64" }),
      },
      {
        id: "schema",
        beforeRoot: semanticRoot({ surface: "schema", cut: "alpha62" }),
        afterRoot: semanticRoot({ surface: "schema", cut: "alpha64" }),
      },
      {
        id: "verifier",
        beforeRoot: authorityVerifierRoot,
        afterRoot: candidateVerifierRoot,
      },
    ],
    bootstrapAnchor: structuredClone(transitionBootstrapAnchor),
    evidence: {
      declarationRoot: transitionEvidenceRoots.declaration,
      reviewRoot: transitionEvidenceRoots.review,
      verificationRoot: transitionEvidenceRoots.verification,
    },
    claimBoundary: {
      semanticTruth: false,
      selfCertification: false,
      releaseAuthorization: false,
      authorityTransfer: false,
    },
  };
  const result = await createPublishedKfdSpecificationAuthorityDelivery({
    authorityPackages,
    candidate,
    evidence: evidence(),
    recursiveSelfConformance,
    specificationTransition,
    transitionBootstrapAnchor,
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
  assert.equal(result.specificationTransition.authorityMode, "reviewed-bootstrap-anchor");
  assert.equal(result.specificationTransition.report.bootstrap, true);
  assert.equal(result.specificationTransition.report.circular, false);
  assert.equal(result.specificationTransition.report.valid, true);
  assert.notEqual(result.roots.specificationTransition, result.roots.gateResult);
  assert.notEqual(result.roots.specificationTransitionReport, result.roots.gateResult);
  assert.equal(
    result.deliveryJoin.recursiveSelfConformanceRoot,
    result.roots.recursiveSelfConformance,
  );
  assert.equal(result.deliveryJoin.adopterDeliveryGateRoot, result.roots.gateResult);
  assert.equal(
    result.deliveryJoin.specificationTransitionRoot,
    result.roots.specificationTransition,
  );
  assert.equal(
    result.deliveryJoin.specificationTransitionReportRoot,
    result.roots.specificationTransitionReport,
  );

  const currentPackage = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  const currentManifest = JSON.parse(fs.readFileSync(
    path.join(root, "profiles/adopter-conformance/adopters/kfd/manifest.json"),
    "utf8",
  ));
  const currentArchive = pack(root, scratch);
  const priorCutAuthorityPackages = {
    ...authorityPackages,
    kfd: {
      name: "@kungfu-tech/kfd",
      version: currentPackage.version,
      archivePath: currentArchive.archivePath,
      archiveRoot: currentArchive.archiveRoot,
      artifactRoot: currentManifest.kfdCut.package.artifactRoot,
    },
  };
  const priorCutCandidate = {
    ...candidate,
    instanceId: "kungfu-systems/kfd@1.0.0-alpha.69",
    version: "1.0.0-alpha.69",
    artifact: coordinate(
      "package",
      "@kungfu-tech/kfd@1.0.0-alpha.69",
      "next-candidate-package",
    ),
    release: coordinate(
      "release",
      "https://github.com/kungfu-systems/kfd/releases/tag/v1.0.0-alpha.69",
      "next-candidate-release-passport",
    ),
  };
  const priorCutTransition = {
    ...specificationTransition,
    transitionId: "kfd-alpha68-to-alpha69-delivery-prior-cut",
    mode: "prior-cut",
    authority: {
      packageVersion: currentPackage.version,
      packageRoot: priorCutAuthorityPackages.kfd.artifactRoot,
      verifierRoot: candidateVerifierRoot,
    },
    candidate: {
      packageVersion: priorCutCandidate.version,
      packageRoot: priorCutCandidate.artifact.root,
      verifierRoot: candidateVerifierRoot,
    },
    changedSurfaces: specificationTransition.changedSurfaces
      .filter(({ id }) => id !== "verifier")
      .map((surface) => ({
        ...surface,
        beforeRoot: semanticRoot({ surface: surface.id, cut: "alpha68" }),
        afterRoot: semanticRoot({ surface: surface.id, cut: "alpha69" }),
      })),
    bootstrapAnchor: null,
  };
  const priorCut = await createPublishedKfdSpecificationAuthorityDelivery({
    authorityPackages: priorCutAuthorityPackages,
    candidate: priorCutCandidate,
    evidence: evidence(),
    recursiveSelfConformance,
    specificationTransition: priorCutTransition,
    verifiedAt,
  });
  assert.equal(priorCut.specificationTransition.authorityMode, "published-prior-cut-verifier");
  assert.equal(priorCut.specificationTransition.report.priorCutVerified, true);
  assert.equal(priorCut.specificationTransition.report.circular, false);
  assert.equal(priorCut.specificationTransition.report.valid, true);

  const alternateRecursive = await createPublishedKfdSpecificationAuthorityDelivery({
    authorityPackages,
    candidate,
    evidence: evidence(),
    recursiveSelfConformance: {
      ...recursiveSelfConformance,
      root: semanticRoot({ result: "independent-recursive-replay" }),
    },
    specificationTransition,
    transitionBootstrapAnchor,
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
      specificationTransition: {
        ...specificationTransition,
        candidate: {
          ...specificationTransition.candidate,
          packageVersion: kfdPackage.version,
        },
      },
      transitionBootstrapAnchor,
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
      specificationTransition,
      transitionBootstrapAnchor,
      verifiedAt,
    }),
    /specification-authority instance failed closed/,
  );
} finally {
  fs.rmSync(scratch, { recursive: true, force: true });
}

console.log(
  "check-kfd-specification-authority-delivery: exact Buildchain/KFD authority, rooted bootstrap and published prior-cut transition verification, anti-circular gate, and separate release join passed",
);
