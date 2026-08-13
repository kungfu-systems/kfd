// SPDX-License-Identifier: Apache-2.0
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { withPublishedBuildchainDeliveryAuthority } from "@kungfu-tech/buildchain/published-delivery-authority";

import { semanticRoot } from "./self-conformance-contract.mjs";

export const KFD_SPECIFICATION_AUTHORITY_DELIVERY_CONTRACT =
  "kfd.specification-authority-delivery/v1";
export const KFD_SPECIFICATION_AUTHORITY_RELEASE_JOIN_CONTRACT =
  "kfd.specification-authority-release-join/v1";
export const KFD_SPECIFICATION_AUTHORITY_PROFILE = Object.freeze({
  id: "kfd.adopter-category/specification-authority",
  version: "1.0.0",
});

const KFD_PACKAGE = "@kungfu-tech/kfd";
const ROOT_PATTERN = /^sha256:[0-9a-f]{64}$/;
const CLAIM_BOUNDARY = Object.freeze({
  categoryConformanceIsDeclarationOnly: true,
  evidenceTransfer: false,
  runtimePermission: false,
  releaseAuthorization: false,
  independentCertification: false,
  semanticAuthorityTransfer: false,
});

function requireText(value, label) {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${label} must be non-empty`);
  }
  return value;
}

function requireRoot(value, label) {
  if (!ROOT_PATTERN.test(value ?? "")) {
    throw new TypeError(`${label} must be a sha256 root`);
  }
  return value;
}

function exactCoordinate(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object`);
  }
  const fields = Object.keys(value).sort();
  if (fields.join("\0") !== ["coordinate", "kind", "root"].join("\0")) {
    throw new TypeError(`${label} has an invalid field set`);
  }
  return {
    kind: requireText(value.kind, `${label}.kind`),
    coordinate: requireText(value.coordinate, `${label}.coordinate`),
    root: requireRoot(value.root, `${label}.root`),
  };
}

function exactEvidence(value, index) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`evidence[${index}] must be an object`);
  }
  const fields = Object.keys(value).sort();
  const expected = [
    "coordinate",
    "kind",
    "observedAt",
    "requirementId",
    "root",
  ];
  if (fields.join("\0") !== expected.join("\0")) {
    throw new TypeError(`evidence[${index}] has an invalid field set`);
  }
  const observedAt = requireText(value.observedAt, `evidence[${index}].observedAt`);
  if (!Number.isFinite(Date.parse(observedAt))) {
    throw new TypeError(`evidence[${index}].observedAt must be a date-time`);
  }
  return {
    requirementId: requireText(
      value.requirementId,
      `evidence[${index}].requirementId`,
    ),
    kind: requireText(value.kind, `evidence[${index}].kind`),
    coordinate: requireText(value.coordinate, `evidence[${index}].coordinate`),
    root: requireRoot(value.root, `evidence[${index}].root`),
    observedAt,
  };
}

function exactRecursiveSelfConformance(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError("recursiveSelfConformance must be an object");
  }
  const fields = Object.keys(value).sort();
  if (fields.join("\0") !== ["contract", "root", "status"].join("\0")) {
    throw new TypeError("recursiveSelfConformance has an invalid field set");
  }
  if (value.status !== "passed") {
    throw new TypeError("recursiveSelfConformance must have passed independently");
  }
  return {
    contract: requireText(value.contract, "recursiveSelfConformance.contract"),
    root: requireRoot(value.root, "recursiveSelfConformance.root"),
    status: value.status,
  };
}

async function loadPublishedKfdRuntime(temporaryRoot) {
  const resolve = createRequire(
    path.join(temporaryRoot, "kfd-specification-authority-loader.cjs"),
  ).resolve;
  const packageJsonPath = resolve("@kungfu-tech/kfd/package.json");
  const modulePaths = {
    toolchain: resolve("@kungfu-tech/kfd/adopter-conformance/toolchain"),
    profileResolver: resolve(
      "@kungfu-tech/kfd/adopter-conformance/category-profile-resolver",
    ),
    instanceVerifier: resolve(
      "@kungfu-tech/kfd/adopter-conformance/category-instance-verifier",
    ),
    roots: resolve("@kungfu-tech/kfd/scripts/self-conformance-contract.mjs"),
    catalog: resolve("@kungfu-tech/kfd/adopter-conformance/category-profiles.json"),
  };
  const [toolchain, profileResolver, instanceVerifier, roots, packageJson, catalog] =
    await Promise.all([
      import(pathToFileURL(modulePaths.toolchain).href),
      import(pathToFileURL(modulePaths.profileResolver).href),
      import(pathToFileURL(modulePaths.instanceVerifier).href),
      import(pathToFileURL(modulePaths.roots).href),
      readFile(packageJsonPath, "utf8").then(JSON.parse),
      readFile(modulePaths.catalog, "utf8").then(JSON.parse),
    ]);
  const functions = {
    initAdopterManifest: toolchain.initAdopterManifest,
    verifyAdopterManifestFromPackage:
      toolchain.verifyAdopterManifestFromPackage,
    resolveAdopterCategoryProfiles:
      profileResolver.resolveAdopterCategoryProfiles,
    verifyAdopterCategoryInstanceManifest:
      instanceVerifier.verifyAdopterCategoryInstanceManifest,
    semanticRoot: roots.semanticRoot,
  };
  for (const [name, implementation] of Object.entries(functions)) {
    if (typeof implementation !== "function") {
      throw new Error(`published KFD authority is missing ${name}`);
    }
  }
  return {
    ...functions,
    packageJson,
    packageRoot: path.dirname(packageJsonPath),
    catalog,
  };
}

function materializeInstance({
  instanceId,
  adopterManifest,
  source,
  artifact,
  release,
  evidence,
  resolution,
  authorityRuntime,
}) {
  const project = {
    adopterId: "kungfu-systems/kfd",
    source,
    artifact,
    release,
  };
  const projectRoot = authorityRuntime.semanticRoot(project);
  const adopterManifestRoot = authorityRuntime.semanticRoot(adopterManifest);
  const requirementIds = new Set(
    resolution.requirements.map((requirement) => requirement.id),
  );
  for (const [index, entry] of evidence.entries()) {
    if (!requirementIds.has(entry.requirementId)) {
      throw new TypeError(
        `evidence[${index}].requirementId is not selected by the published profile`,
      );
    }
  }
  const selection = {
    schemaVersion: 1,
    contract: "kfd.adopter-category-profile-selection/v1",
    profiles: [structuredClone(KFD_SPECIFICATION_AUTHORITY_PROFILE)],
  };
  return {
    $schema:
      "https://kfd.libkungfu.dev/schemas/kfd-adopter-conformance/category-instance-manifest.schema.json",
    schemaVersion: 1,
    contract: "kfd.adopter-category-instance-manifest/v1",
    instanceId,
    rootAlgorithm: "sha256-kfd-canonical-json-v1",
    project,
    adopterManifest: {
      contract: adopterManifest.contract,
      manifestId: adopterManifest.manifestId,
      root: adopterManifestRoot,
    },
    kfdCut: {
      packageVersion: adopterManifest.kfdCut.package.version,
      packageRoot: adopterManifest.kfdCut.package.artifactRoot,
      categoryCatalogRoot: resolution.catalogRoot,
    },
    selection,
    selectionRoot: resolution.selectionRoot,
    requirements: resolution.requirements.map((requirement) => ({
      id: requirement.id,
      evidence: evidence
        .filter((entry) => entry.requirementId === requirement.id)
        .map(({ requirementId: _requirementId, ...entry }) => ({
          ...entry,
          projectInstanceId: instanceId,
          projectRoot,
          adopterManifestRoot,
          kfdPackageRoot: adopterManifest.kfdCut.package.artifactRoot,
          categorySelectionRoot: resolution.selectionRoot,
        })),
    })),
    claimBoundary: structuredClone(CLAIM_BOUNDARY),
  };
}

export async function createPublishedKfdSpecificationAuthorityDelivery({
  authorityPackages,
  candidate,
  evidence = [],
  recursiveSelfConformance,
  verifiedAt,
  maxAgeSeconds = 86400,
} = {}) {
  const instanceId = requireText(candidate?.instanceId, "candidate.instanceId");
  const version = requireText(candidate?.version, "candidate.version");
  const source = exactCoordinate(candidate?.source, "candidate.source");
  const artifact = exactCoordinate(candidate?.artifact, "candidate.artifact");
  const release = exactCoordinate(candidate?.release, "candidate.release");
  if (
    artifact.kind !== "package" ||
    artifact.coordinate !== `${KFD_PACKAGE}@${version}`
  ) {
    throw new TypeError("candidate artifact must bind the exact KFD package version");
  }
  const recursive = exactRecursiveSelfConformance(recursiveSelfConformance);
  const suppliedEvidence = evidence.map(exactEvidence);
  const verificationTime = requireText(verifiedAt, "verifiedAt");
  if (!Number.isFinite(Date.parse(verificationTime))) {
    throw new TypeError("verifiedAt must be a date-time");
  }
  if (!Number.isSafeInteger(maxAgeSeconds) || maxAgeSeconds < 0) {
    throw new TypeError("maxAgeSeconds must be a non-negative safe integer");
  }

  return withPublishedBuildchainDeliveryAuthority(
    authorityPackages,
    async ({ packages, authorityRuntime, authorityRoot, temporaryRoot }) => {
      const kfdRuntime = await loadPublishedKfdRuntime(temporaryRoot);
      if (
        packages.kfd.version !== kfdRuntime.packageJson.version ||
        version === packages.kfd.version
      ) {
        throw new Error(
          "KFD specification authority delivery requires an independent older KFD semantic cut",
        );
      }
      const adopterManifest = kfdRuntime.initAdopterManifest({
        packageRoot: kfdRuntime.packageRoot,
        packageArtifactRoot: packages.kfd.artifactRoot,
        verifiedAt: verificationTime,
        maxAgeSeconds,
        manifestId: `kfd-specification-authority-${version}`,
        adopterId: "kungfu-systems/kfd",
        artifactKind: artifact.kind,
        artifactCoordinate: artifact.coordinate,
        artifactRoot: artifact.root,
        scope:
          "KFD specification authority package delivery through an independent released Buildchain and prior KFD semantic cut",
      });
      adopterManifest.releaseBindings.push({
        id: `kfd-${version}`,
        artifact: structuredClone(artifact),
        releasePassport: structuredClone(release),
        kfdPackageRoot: packages.kfd.artifactRoot,
      });
      const adopterReport = kfdRuntime.verifyAdopterManifestFromPackage(
        adopterManifest,
        {
          packageRoot: kfdRuntime.packageRoot,
          packageArtifactRoot: packages.kfd.artifactRoot,
          verifiedAt: verificationTime,
          maxAgeSeconds,
        },
      );
      if (adopterReport.valid !== true) {
        throw new Error(
          `published KFD adopter manifest failed closed: ${JSON.stringify(adopterReport.issues)}`,
        );
      }
      const selection = {
        schemaVersion: 1,
        contract: "kfd.adopter-category-profile-selection/v1",
        profiles: [structuredClone(KFD_SPECIFICATION_AUTHORITY_PROFILE)],
      };
      const resolution = kfdRuntime.resolveAdopterCategoryProfiles(
        selection,
        kfdRuntime.catalog,
      );
      if (!resolution.valid) {
        throw new Error(
          `published specification-authority profile failed closed: ${JSON.stringify(resolution.issues)}`,
        );
      }
      const instanceManifest = materializeInstance({
        instanceId,
        adopterManifest,
        source,
        artifact,
        release,
        evidence: suppliedEvidence,
        resolution,
        authorityRuntime: kfdRuntime,
      });
      const instanceReport =
        kfdRuntime.verifyAdopterCategoryInstanceManifest(instanceManifest, {
          catalog: kfdRuntime.catalog,
          adopterManifest,
          adopterReport,
          verifiedAt: verificationTime,
          maxAgeSeconds,
        });
      if (instanceReport.valid !== true) {
        throw new Error(
          `specification-authority instance failed closed: ${JSON.stringify(instanceReport.issues)}`,
        );
      }
      const gateResult = authorityRuntime
        .createAdopterDeliveryGate({
          drivers: [authorityRuntime.createKfdAdopterCategoryProtocolDriver()],
          artifactProfiles: [authorityRuntime.createPackageArtifactProfile()],
        })
        .evaluate(
          {
            schemaVersion: 1,
            contract: "kungfu-buildchain-adopter-delivery-request",
            protocol: {
              id: "kfd.adopter-category/instance-manifest",
              version: "1.0.0",
            },
            artifactProfile: {
              id: "buildchain.artifact/package",
              version: "1.0.0",
            },
            project: {
              instanceId,
              adopterId: "kungfu-systems/kfd",
            },
            artifact,
            declaration: instanceManifest,
          },
          { adopterManifest, verifiedAt: verificationTime, maxAgeSeconds },
        );
      if (gateResult.status !== "passed") {
        throw new Error(
          `released Buildchain adopter gate failed closed: ${JSON.stringify(gateResult.issues)}`,
        );
      }
      const deliveryJoin = {
        schemaVersion: 1,
        contract: KFD_SPECIFICATION_AUTHORITY_RELEASE_JOIN_CONTRACT,
        candidate: { package: artifact, release },
        recursiveSelfConformanceRoot: recursive.root,
        adopterDeliveryGateRoot: gateResult.gateRoot,
        authorityRoot,
      };
      deliveryJoin.joinRoot = semanticRoot(deliveryJoin);
      const result = {
        schemaVersion: 1,
        contract: KFD_SPECIFICATION_AUTHORITY_DELIVERY_CONTRACT,
        status: "passed",
        authority: {
          buildchain: packages.buildchain,
          kfd: packages.kfd,
          authorityRoot,
        },
        candidate: { instanceId, version, source, artifact, release },
        recursiveSelfConformance: recursive,
        adopterManifest,
        adopterReport,
        instanceManifest,
        instanceReport,
        gateResult,
        deliveryJoin,
        roots: {
          recursiveSelfConformance: recursive.root,
          adopterManifest: kfdRuntime.semanticRoot(adopterManifest),
          instanceManifest: kfdRuntime.semanticRoot(instanceManifest),
          instanceReport: instanceReport.reportRoot,
          gateResult: gateResult.gateRoot,
          deliveryJoin: deliveryJoin.joinRoot,
        },
        qualifying: false,
        selfCertified: false,
        releaseAuthorized: false,
        finalAuthority:
          "protected-release-plus-independent-review-warrant-and-public-readback",
      };
      result.deliveryRoot = semanticRoot(result);
      return result;
    },
  );
}
