// SPDX-License-Identifier: Apache-2.0
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { verifyAdopterCategoryInstanceManifest } from "./adopter-category-instance-contract.mjs";
import { resolveAdopterCategoryProfiles } from "./adopter-category-profile-contract.mjs";
import { deriveAdopterCut } from "./adopter-conformance-contract.mjs";
import { semanticRoot } from "./self-conformance-contract.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const profileRoot = path.join(root, "profiles", "adopter-conformance");
const catalog = JSON.parse(fs.readFileSync(path.join(profileRoot, "category-profiles.json"), "utf8"));
const vectors = JSON.parse(fs.readFileSync(path.join(profileRoot, "category-instance-vectors.json"), "utf8"));
const adopterVectors = JSON.parse(fs.readFileSync(path.join(profileRoot, "vectors.json"), "utf8"));
const issueCodes = new Set(JSON.parse(fs.readFileSync(path.join(profileRoot, "issue-codes.json"), "utf8")).codes);

function pointerParts(pointer) {
  assert.match(pointer, /^\//, `invalid JSON pointer ${pointer}`);
  return pointer.slice(1).split("/").map((part) => part.replaceAll("~1", "/").replaceAll("~0", "~"));
}

function applyOperations(value, operations) {
  const result = structuredClone(value);
  for (const operation of operations) {
    const parts = pointerParts(operation.path);
    const key = parts.pop();
    const parent = parts.reduce((current, part) => current[part], result);
    if (operation.op === "add") {
      const added = structuredClone(operation.value);
      if (Array.isArray(parent) && key === "-") parent.push(added);
      else parent[key] = added;
    } else if (operation.op === "replace") {
      parent[key] = structuredClone(operation.value);
    } else {
      assert.fail(`unsupported category-instance vector operation ${operation.op}`);
    }
  }
  return result;
}

function materializeInstance(selection, candidateCatalog) {
  const instance = structuredClone(vectors.template);
  instance.selection = selection;
  const adopterManifest = structuredClone(adopterVectors.baseManifestTemplate);
  const derived = deriveAdopterCut(adopterVectors.cut);
  adopterManifest.kfdCut = {
    package: {
      name: "@kungfu-tech/kfd",
      version: "1.0.0-fixture",
      artifactRoot: adopterVectors.cut.expectedPackageRoot,
    },
    registry: derived.registry,
    standards: derived.standards,
    schemaSet: derived.schemaSet,
    schemaSetRoot: derived.schemaSetRoot,
    vectorSet: derived.vectorSet,
    vectorSetRoot: derived.vectorSetRoot,
    verifierSet: derived.verifierSet,
    verifierSetRoot: derived.verifierSetRoot,
    decisionSetRoot: derived.decisionSetRoot,
  };
  adopterManifest.adopter.id = instance.project.adopterId;
  adopterManifest.adopter.artifact = structuredClone(instance.project.artifact);
  adopterManifest.releaseBindings[0].artifact = structuredClone(instance.project.artifact);
  adopterManifest.releaseBindings[0].releasePassport = structuredClone(instance.project.release);
  const adopterManifestRoot = semanticRoot(adopterManifest);
  instance.adopterManifest = {
    contract: adopterManifest.contract,
    manifestId: adopterManifest.manifestId,
    root: adopterManifestRoot,
  };
  instance.kfdCut = {
    packageVersion: adopterManifest.kfdCut.package.version,
    packageRoot: adopterManifest.kfdCut.package.artifactRoot,
    categoryCatalogRoot: semanticRoot(candidateCatalog),
  };
  const resolution = resolveAdopterCategoryProfiles(selection, candidateCatalog);
  instance.selectionRoot = resolution.selectionRoot ?? semanticRoot(selection);
  if (resolution.valid) {
    const projectRoot = semanticRoot(instance.project);
    instance.requirements = resolution.requirements.map((requirement) => ({
      id: requirement.id,
      evidence: requirement.evidenceKinds.flatMap((kind) =>
        Array.from({ length: requirement.minimumEvidencePerKind }, (_, index) => ({
          kind,
          coordinate: `https://example.org/evidence/${requirement.id}/${kind}/${index + 1}`,
          root: semanticRoot({ instanceId: instance.instanceId, requirementId: requirement.id, kind, index }),
          observedAt: "2026-08-12T00:00:00Z",
          projectInstanceId: instance.instanceId,
          projectRoot,
          adopterManifestRoot,
          kfdPackageRoot: instance.kfdCut.packageRoot,
          categorySelectionRoot: instance.selectionRoot,
        }))),
    }));
  }
  return { instance, adopterManifest };
}

assert.equal(vectors.contract, "kfd.adopter-category-instance-vectors/v1");
assert.equal(vectors.instanceContract, "kfd.adopter-category-instance-manifest/v1");
const ids = new Set();
for (const testCase of vectors.cases) {
  assert.equal(ids.has(testCase.id), false, `duplicate category-instance vector ID ${testCase.id}`);
  ids.add(testCase.id);
  for (const code of testCase.issueCodes) assert.ok(issueCodes.has(code), `${testCase.id} uses unpublished issue code ${code}`);
  const candidateCatalog = applyOperations(catalog, testCase.catalogOperations);
  const selection = applyOperations(vectors.template.selection, testCase.selectionOperations);
  const materialized = materializeInstance(selection, candidateCatalog);
  const instance = applyOperations(materialized.instance, testCase.instanceOperations);
  const report = verifyAdopterCategoryInstanceManifest(instance, {
    catalog: candidateCatalog,
    adopterManifest: materialized.adopterManifest,
    adopterReport: { profile: "kfd.adopter-conformance-manifest/v1", valid: true },
    verifiedAt: "2026-08-12T12:00:00Z",
    maxAgeSeconds: 86400,
  });
  assert.equal(report.valid, testCase.valid, `${testCase.id}: validity drifted\n${JSON.stringify(report, null, 2)}`);
  assert.equal(report.conforming, testCase.valid, `${testCase.id}: conformance drifted`);
  assert.equal(report.qualifying, false, `${testCase.id}: verification cannot authorize qualification`);
  assert.equal(report.independentlyCertified, false, `${testCase.id}: verification cannot certify a project`);
  assert.equal(report.evidenceInherited, false, `${testCase.id}: project evidence cannot transfer`);
  assert.deepEqual(
    [...new Set(report.issues.map(({ code }) => code))],
    testCase.issueCodes,
    `${testCase.id}: issue-code set drifted`,
  );
  assert.deepEqual(
    report.issues,
    [...report.issues].sort((left, right) => Buffer.compare(
      Buffer.from([left.code, left.path, left.message].join("\0"), "utf8"),
      Buffer.from([right.code, right.path, right.message].join("\0"), "utf8"),
    )),
    `${testCase.id}: diagnostics must remain stable and UTF-8 sorted`,
  );
  assert.match(report.reportRoot, /^sha256:[0-9a-f]{64}$/);
}

for (const required of [
  "positive-project-instance",
  "negative-duplicate-profile",
  "negative-stale-profile-version",
  "negative-missing-evidence",
  "negative-project-evidence-reuse",
  "negative-evidence-stale",
  "negative-adopter-manifest-substitution",
  "negative-artifact-substitution",
  "negative-release-substitution",
  "negative-claim-widening",
]) {
  assert.ok(ids.has(required), `missing required category-instance vector ${required}`);
}

console.log(`adopter category instances: ${vectors.cases.length} vectors passed`);
