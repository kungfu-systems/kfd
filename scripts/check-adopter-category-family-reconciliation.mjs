// SPDX-License-Identifier: Apache-2.0
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { verifyAdopterCategoryFamilyReconciliation } from "./adopter-category-family-reconciliation-contract.mjs";
import { semanticRoot } from "./self-conformance-contract.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const profileRoot = path.join(root, "profiles", "adopter-conformance");
const vectors = JSON.parse(fs.readFileSync(path.join(profileRoot, "family-reconciliation-vectors.json"), "utf8"));
const reconciliation = JSON.parse(fs.readFileSync(path.join(profileRoot, "family-reconciliation.json"), "utf8"));
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
      assert.fail(`unsupported family-reconciliation vector operation ${operation.op}`);
    }
  }
  return result;
}

function materializeTemplate() {
  const family = structuredClone(vectors.template);
  for (const child of family.children) {
    for (const delivery of child.deliveryEvidence) {
      const rooted = { ...delivery };
      delete rooted.root;
      delivery.root = semanticRoot(rooted);
    }
  }
  for (const failure of family.failureHistory) {
    const rooted = { ...failure };
    delete rooted.evidenceRoot;
    failure.evidenceRoot = semanticRoot(rooted);
  }
  return family;
}

assert.equal(vectors.contract, "kfd.adopter-category-family-reconciliation-vectors/v1");
assert.equal(vectors.familyContract, "kfd.adopter-category-family-reconciliation/v1");
const ids = new Set();
for (const testCase of vectors.cases) {
  assert.equal(ids.has(testCase.id), false, `duplicate family-reconciliation vector ID ${testCase.id}`);
  ids.add(testCase.id);
  for (const code of testCase.issueCodes) {
    assert.ok(issueCodes.has(code), `${testCase.id} uses unpublished issue code ${code}`);
  }
  const report = verifyAdopterCategoryFamilyReconciliation(applyOperations(materializeTemplate(), testCase.operations));
  assert.equal(report.valid, testCase.valid, `${testCase.id}: validity drifted\n${JSON.stringify(report, null, 2)}`);
  assert.equal(report.complete, testCase.complete, `${testCase.id}: completeness drifted`);
  assert.equal(report.qualifying, false, `${testCase.id}: reconciliation cannot qualify adoption`);
  assert.equal(report.releaseAuthorized, false, `${testCase.id}: reconciliation cannot authorize release`);
  assert.equal(report.runtimeAuthorized, false, `${testCase.id}: reconciliation cannot authorize runtime action`);
  assert.equal(report.independentlyCertified, false, `${testCase.id}: reconciliation cannot self-certify projects`);
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
  assert.match(report.familyRoot ?? "", /^sha256:[0-9a-f]{64}$/);
  assert.match(report.reportRoot, /^sha256:[0-9a-f]{64}$/);
}

for (const required of [
  "positive-complete-family",
  "positive-pending-child",
  "positive-owned-open-gap",
  "negative-child-set-substitution",
  "negative-duplicate-child",
  "negative-missing-protected-merge",
  "negative-terminal-pending-delivery",
  "negative-unowned-child-gap",
  "negative-orphan-global-gap",
  "negative-failure-assignment-substitution",
  "negative-authority-widening",
  "negative-terminal-root-shape",
  "negative-delivery-root-substitution",
  "negative-non-string-child-identity",
]) {
  assert.ok(ids.has(required), `missing required family-reconciliation vector ${required}`);
}

const reconciliationReport = verifyAdopterCategoryFamilyReconciliation(reconciliation);
assert.equal(
  reconciliationReport.valid,
  true,
  `actual family reconciliation is invalid\n${JSON.stringify(reconciliationReport, null, 2)}`,
);
assert.equal(reconciliationReport.complete, true, "actual family reconciliation must close every declared child and gap");
assert.deepEqual(reconciliationReport.pendingAssignmentIds, []);
assert.deepEqual(reconciliationReport.openGapIds, []);
assert.equal(reconciliationReport.qualifying, false, "actual reconciliation cannot qualify adoption");
assert.equal(reconciliationReport.releaseAuthorized, false, "actual reconciliation cannot authorize release");
assert.equal(reconciliationReport.runtimeAuthorized, false, "actual reconciliation cannot authorize runtime action");
assert.equal(reconciliationReport.independentlyCertified, false, "actual reconciliation cannot self-certify projects");
assert.equal(reconciliation.expectedChildAssignmentIds.length, 7, "actual reconciliation must declare the exact seven-child family");
assert.deepEqual(
  [...reconciliation.children.map(({ assignmentId }) => assignmentId)].sort(compareUtf8),
  [...reconciliation.expectedChildAssignmentIds].sort(compareUtf8),
  "actual reconciliation children must conserve the declared family set",
);
for (const child of reconciliation.children) {
  assert.equal(child.terminal.status, "terminal", `${child.assignmentId} must carry native terminal evidence`);
  assert.match(child.terminal.root, /^sha256:[0-9a-f]{64}$/);
  assert.match(child.terminal.queryProofRoot, /^sha256:[0-9a-f]{64}$/);
  const protectedMerge = child.deliveryEvidence.find(({ role }) => role === "protected-merge");
  assert.ok(protectedMerge, `${child.assignmentId} must carry protected-merge evidence`);
  assert.equal(protectedMerge.status, "verified", `${child.assignmentId} protected merge must be verified`);
  assert.match(protectedMerge.sourceHead, /^[0-9a-f]{40}$/);
  assert.match(protectedMerge.integratedHead, /^[0-9a-f]{40}$/);
}

if (process.env.KFD_FAMILY_RECONCILIATION_CLEAN_ROOM !== "1") {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "kfd-family-reconciliation-"));
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
    const extracted = spawnSync("tar", ["-xzf", path.join(temporaryRoot, filename), "-C", temporaryRoot], { encoding: "utf8" });
    assert.equal(extracted.status, 0, extracted.stderr || extracted.stdout);
    const cleanHome = path.join(temporaryRoot, "home");
    fs.mkdirSync(cleanHome);
    const replay = spawnSync(process.execPath, ["scripts/check-adopter-category-family-reconciliation.mjs"], {
      cwd: extractedRoot,
      encoding: "utf8",
      env: {
        PATH: process.env.PATH,
        HOME: cleanHome,
        KFD_FAMILY_RECONCILIATION_CLEAN_ROOM: "1",
      },
    });
    assert.equal(replay.status, 0, replay.stderr || replay.stdout);
    assert.match(replay.stdout, /adopter category family reconciliation: 14 vectors passed/);
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
}

console.log(`adopter category family reconciliation: ${vectors.cases.length} vectors passed`);
