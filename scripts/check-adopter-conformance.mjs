// SPDX-License-Identifier: Apache-2.0
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  deriveAdopterCut,
  verifyAdopterManifest,
} from "./adopter-conformance-contract.mjs";
import { exactByteRoot, semanticRoot } from "./self-conformance-contract.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const profileRoot = path.join(root, "profiles", "adopter-conformance");
const vectors = JSON.parse(fs.readFileSync(path.join(profileRoot, "vectors.json"), "utf8"));
const issueCodes = JSON.parse(fs.readFileSync(path.join(profileRoot, "issue-codes.json"), "utf8"));
const publishedCodes = new Set(issueCodes.codes);

function pointerParts(pointer) {
  assert.match(pointer, /^\//, `invalid JSON pointer ${pointer}`);
  return pointer.slice(1).split("/").map((part) => part.replaceAll("~1", "/").replaceAll("~0", "~"));
}

function pointerValue(value, pointer) {
  return pointerParts(pointer).reduce((current, part) => current[part], value);
}

function applyOperations(value, operations) {
  const result = structuredClone(value);
  for (const operation of operations) {
    const parts = pointerParts(operation.path);
    const key = parts.pop();
    const parent = parts.reduce((current, part) => current[part], result);
    if (operation.op === "remove") {
      if (Array.isArray(parent)) parent.splice(Number(key), 1);
      else delete parent[key];
    } else if (operation.op === "add") {
      const added = structuredClone(operation.value);
      if (Array.isArray(parent) && key === "-") parent.push(added);
      else if (Array.isArray(parent)) parent.splice(Number(key), 0, added);
      else parent[key] = added;
    } else if (operation.op === "replace") {
      parent[key] = structuredClone(operation.value);
    } else if (operation.op === "copy") {
      const copied = structuredClone(pointerValue(result, operation.from));
      if (Array.isArray(parent) && key === "-") parent.push(copied);
      else parent[key] = copied;
    } else if (operation.op === "swap") {
      const otherParts = pointerParts(operation.with);
      const otherKey = otherParts.pop();
      const otherParent = otherParts.reduce((current, part) => current[part], result);
      [parent[key], otherParent[otherKey]] = [otherParent[otherKey], parent[key]];
    } else {
      assert.fail(`unsupported vector operation ${operation.op}`);
    }
  }
  return result;
}

assert.equal(vectors.contract, "kfd.adopter-conformance-vectors/v1");
assert.equal(vectors.profile, "kfd.adopter-conformance-manifest/v1");
assert.equal(issueCodes.contract, "kfd.adopter-conformance-issue-codes/v1");
assert.deepEqual(issueCodes.codes, [...issueCodes.codes].sort(), "issue codes must remain sorted");
assert.equal(publishedCodes.size, issueCodes.codes.length, "issue codes must remain unique");

const derived = deriveAdopterCut(vectors.cut);
const manifest = structuredClone(vectors.baseManifestTemplate);
manifest.kfdCut = {
  package: {
    name: "@kungfu-tech/kfd",
    version: "1.0.0-fixture",
    artifactRoot: vectors.cut.expectedPackageRoot,
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
manifest.decisions[0].witnessBindings[0].profileManifestRoot = exactByteRoot(
  Buffer.from(vectors.cut.files["profiles/kfd-1/manifest.json"], "utf8"),
);
manifest.decisions[0].witnessBindings[0].verifierRoot = derived.verifierSet[0].byteRoot;

const ids = new Set();
for (const testCase of vectors.cases) {
  assert.equal(ids.has(testCase.id), false, `duplicate vector ID ${testCase.id}`);
  ids.add(testCase.id);
  for (const code of testCase.issueCodes) {
    assert.ok(publishedCodes.has(code), `${testCase.id} uses unpublished issue code ${code}`);
  }
  const candidate = applyOperations(manifest, testCase.operations);
  const report = verifyAdopterManifest(candidate, vectors.cut);
  assert.equal(report.valid, testCase.valid, `${testCase.id}: validity drifted\n${JSON.stringify(report, null, 2)}`);
  assert.equal(report.qualifying, false, `${testCase.id}: verification cannot qualify adoption`);
  assert.equal(report.selfCertified, false, `${testCase.id}: verification cannot self-certify`);
  assert.equal(report.offline, true, `${testCase.id}: verification must remain offline`);
  assert.deepEqual(
    report.issues,
    [...report.issues].sort((left, right) =>
      [left.code, left.path, left.message].join("\0")
        .localeCompare([right.code, right.path, right.message].join("\0"), "en")),
    `${testCase.id}: diagnostics must remain stable and sorted`,
  );
  assert.deepEqual(
    [...new Set(report.issues.map(({ code }) => code))],
    testCase.issueCodes,
    `${testCase.id}: issue-code set drifted`,
  );
  assert.match(semanticRoot(report), /^sha256:[0-9a-f]{64}$/, `${testCase.id}: report root is not reproducible`);
}

for (const required of [
  "positive-full-cut",
  "negative-missing-row",
  "negative-duplicate-row",
  "negative-row-reorder",
  "negative-registry-mismatch",
  "negative-draft-widening",
  "negative-witness-mismatch",
  "negative-release-mismatch",
  "negative-root-substitution",
  "negative-stale-evidence",
  "negative-undeclared-use",
  "negative-not-used-claim",
]) {
  assert.ok(ids.has(required), `missing required adopter vector ${required}`);
}

const reordered = structuredClone(manifest);
reordered.kfdCut.registry = {
  root: manifest.kfdCut.registry.root,
  contract: manifest.kfdCut.registry.contract,
  schemaVersion: manifest.kfdCut.registry.schemaVersion,
  path: manifest.kfdCut.registry.path,
};
assert.equal(
  verifyAdopterManifest(reordered, vectors.cut).valid,
  true,
  "JSON object member order must not change semantic verification",
);
assert.throws(
  () => deriveAdopterCut({
    ...vectors.cut,
    surfaces: {
      ...vectors.cut.surfaces,
      schemas: [vectors.cut.surfaces.schemas[0], vectors.cut.surfaces.schemas[0]],
    },
  }),
  /duplicate published cut path/,
  "duplicate published surface paths must fail closed",
);
assert.throws(
  () => deriveAdopterCut({
    ...vectors.cut,
    registry: {
      ...vectors.cut.registry,
      entries: [...vectors.cut.registry.entries, vectors.cut.registry.entries[0]],
    },
  }),
  /unique by ID and number/,
  "duplicate registry rows must fail closed before manifest verification",
);

if (process.env.KFD_ADOPTER_SKIP_EXTRACTION !== "1") {
  const extraction = fs.mkdtempSync(path.join(os.tmpdir(), "kfd-adopter-package-"));
  try {
    const packed = spawnSync(
      "npm",
      ["pack", "--ignore-scripts", "--json", "--pack-destination", extraction],
      { cwd: root, encoding: "utf8" },
    );
    assert.equal(packed.status, 0, `clean package creation failed\n${packed.stderr}`);
    const [{ filename }] = JSON.parse(packed.stdout);
    const unpacked = spawnSync("tar", ["-xzf", path.join(extraction, filename), "-C", extraction], {
      cwd: extraction,
      encoding: "utf8",
    });
    assert.equal(unpacked.status, 0, `clean package extraction failed\n${unpacked.stderr}`);
    const packageRoot = path.join(extraction, "package");
    const imported = spawnSync(
      "node",
      [
        "--input-type=module",
        "--eval",
        "import { deriveAdopterCut, verifyAdopterManifest } from '@kungfu-tech/kfd/adopter-conformance/verifier'; if (typeof deriveAdopterCut !== 'function' || typeof verifyAdopterManifest !== 'function') process.exit(1);",
      ],
      { cwd: packageRoot, encoding: "utf8" },
    );
    assert.equal(imported.status, 0, `package export import failed\n${imported.stderr}`);
    const replay = spawnSync("node", ["scripts/check-adopter-conformance.mjs"], {
      cwd: packageRoot,
      encoding: "utf8",
      env: { ...process.env, KFD_ADOPTER_SKIP_EXTRACTION: "1" },
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

console.log(`check-adopter-conformance: ${vectors.cases.length} package-only fixed vectors passed`);
