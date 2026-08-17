// SPDX-License-Identifier: Apache-2.0
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { verifyAdopterCategoryEvidenceMatrix } from "./adopter-category-evidence-matrix-contract.mjs";
import { resolveAdopterCategoryProfiles } from "./adopter-category-profile-contract.mjs";
import { semanticRoot } from "./self-conformance-contract.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const profileRoot = path.join(root, "profiles", "adopter-conformance");
const catalog = JSON.parse(fs.readFileSync(path.join(profileRoot, "category-profiles.json"), "utf8"));
const vectors = JSON.parse(fs.readFileSync(path.join(profileRoot, "evidence-matrix-vectors.json"), "utf8"));
const issueCodes = new Set(JSON.parse(fs.readFileSync(path.join(profileRoot, "issue-codes.json"), "utf8")).codes);

function compareUtf8(left, right) {
  return Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
}

function pointerParts(pointer) {
  assert.match(pointer, /^\//, `invalid JSON pointer ${pointer}`);
  return pointer.slice(1).split("/").map((part) => part.replaceAll("~1", "/").replaceAll("~0", "~"));
}

function locate(value, pointer) {
  return pointerParts(pointer).reduce((current, part) => current[part], value);
}

function applyOperations(value, operations) {
  const result = structuredClone(value);
  for (const operation of operations) {
    const parts = pointerParts(operation.path);
    const key = parts.pop();
    const parent = parts.reduce((current, part) => current[part], result);
    if (operation.op === "replace") {
      parent[key] = structuredClone(operation.value);
    } else if (operation.op === "add-copy") {
      assert.equal(Array.isArray(parent) && key === "-", true, "add-copy only appends to arrays");
      parent.push(structuredClone(locate(result, operation.from)));
    } else {
      assert.fail(`unsupported evidence-matrix vector operation ${operation.op}`);
    }
  }
  return result;
}

function materializeTemplate() {
  const matrix = structuredClone(vectors.template);
  matrix.catalogRoot = semanticRoot(catalog);
  matrix.profileMatrix = [...catalog.profiles]
    .sort((left, right) => compareUtf8(left.id, right.id))
    .map((profile) => {
      const profiles = profile.id === catalog.baseProfile.id
        ? []
        : [{ id: profile.id, version: profile.version }];
      const resolution = resolveAdopterCategoryProfiles({
        schemaVersion: 1,
        contract: "kfd.adopter-category-profile-selection/v1",
        profiles,
      }, catalog);
      assert.equal(resolution.valid, true, `${profile.id} must resolve while materializing matrix vectors`);
      return {
        id: profile.id,
        version: profile.version,
        requirementIds: resolution.requirements.map(({ id }) => id),
      };
    });
  return matrix;
}

assert.equal(vectors.contract, "kfd.adopter-category-evidence-matrix-vectors/v1");
assert.equal(vectors.matrixContract, "kfd.adopter-category-evidence-matrix/v1");
const ids = new Set();
for (const testCase of vectors.cases) {
  assert.equal(ids.has(testCase.id), false, `duplicate evidence-matrix vector ID ${testCase.id}`);
  ids.add(testCase.id);
  for (const code of testCase.issueCodes) {
    assert.ok(issueCodes.has(code), `${testCase.id} uses unpublished issue code ${code}`);
  }
  const matrix = applyOperations(materializeTemplate(), testCase.operations);
  const report = verifyAdopterCategoryEvidenceMatrix(matrix, catalog);
  assert.equal(report.valid, testCase.valid, `${testCase.id}: validity drifted\n${JSON.stringify(report, null, 2)}`);
  assert.equal(report.complete, testCase.complete, `${testCase.id}: completeness drifted`);
  assert.equal(report.qualifying, false, `${testCase.id}: the matrix cannot qualify adoption`);
  assert.equal(report.releaseAuthorized, false, `${testCase.id}: the matrix cannot authorize release`);
  assert.equal(report.runtimeAuthorized, false, `${testCase.id}: the matrix cannot authorize runtime action`);
  assert.equal(report.independentlyCertified, false, `${testCase.id}: the matrix cannot self-certify projects`);
  assert.deepEqual(
    [...new Set(report.issues.map(({ code }) => code))],
    testCase.issueCodes,
    `${testCase.id}: issue-code set drifted`,
  );
  assert.deepEqual(
    report.issues,
    [...report.issues].sort((left, right) => compareUtf8(
      [left.code, left.path, left.message].join("\0"),
      [right.code, right.path, right.message].join("\0"),
    )),
    `${testCase.id}: diagnostics must remain stable and UTF-8 sorted`,
  );
  assert.match(report.matrixRoot ?? "", /^sha256:[0-9a-f]{64}$/);
  assert.match(report.reportRoot, /^sha256:[0-9a-f]{64}$/);
}

for (const required of [
  "positive-complete-matrix",
  "positive-pending-project",
  "positive-owned-open-gap",
  "negative-catalog-root-substitution",
  "negative-profile-matrix-substitution",
  "negative-duplicate-project",
  "negative-missing-delivery-role",
  "negative-project-evidence-substitution",
  "negative-terminal-pending-evidence",
  "negative-unowned-project-gap",
  "negative-authority-widening",
]) {
  assert.ok(ids.has(required), `missing required evidence-matrix vector ${required}`);
}

if (process.env.KFD_EVIDENCE_MATRIX_CLEAN_ROOM !== "1") {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "kfd-evidence-matrix-"));
  try {
    const packed = spawnSync(npmCommand, ["pack", "--json", "--ignore-scripts", "--pack-destination", temporaryRoot], {
      cwd: root,
      encoding: "utf8",
      env: { ...process.env, npm_config_cache: path.join(temporaryRoot, "npm-cache") },
      shell: process.platform === "win32",
    });
    assert.equal(packed.status, 0, packed.stderr || packed.stdout);
    const [{ filename }] = JSON.parse(packed.stdout);
    const extractedRoot = path.join(temporaryRoot, "package");
    const extracted = spawnSync("tar", ["-xzf", path.join(temporaryRoot, filename), "-C", temporaryRoot], {
      encoding: "utf8",
    });
    assert.equal(extracted.status, 0, extracted.stderr || extracted.stdout);
    const cleanHome = path.join(temporaryRoot, "home");
    fs.mkdirSync(cleanHome);
    const replay = spawnSync(process.execPath, ["scripts/check-adopter-category-evidence-matrix.mjs"], {
      cwd: extractedRoot,
      encoding: "utf8",
      env: {
        PATH: process.env.PATH,
        HOME: cleanHome,
        KFD_EVIDENCE_MATRIX_CLEAN_ROOM: "1",
      },
    });
    assert.equal(replay.status, 0, replay.stderr || replay.stdout);
    assert.match(replay.stdout, /adopter category evidence matrix: 11 vectors passed/);
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
}

console.log(`adopter category evidence matrix: ${vectors.cases.length} vectors passed`);
