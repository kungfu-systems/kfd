// SPDX-License-Identifier: Apache-2.0
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  resolveAdopterCategoryProfiles,
  verifyAdopterCategoryProfileCatalog,
} from "./adopter-category-profile-contract.mjs";
import { semanticRoot } from "./self-conformance-contract.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const profileRoot = path.join(root, "profiles", "adopter-conformance");
const catalog = JSON.parse(fs.readFileSync(path.join(profileRoot, "category-profiles.json"), "utf8"));
const vectors = JSON.parse(fs.readFileSync(path.join(profileRoot, "category-profile-vectors.json"), "utf8"));
const issueCodes = JSON.parse(fs.readFileSync(path.join(profileRoot, "issue-codes.json"), "utf8"));
const publishedCodes = new Set(issueCodes.codes);

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
      assert.fail(`unsupported category vector operation ${operation.op}`);
    }
  }
  return result;
}

assert.equal(catalog.contract, "kfd.adopter-category-profile-catalog/v1");
assert.equal(vectors.contract, "kfd.adopter-category-profile-vectors/v1");
assert.equal(vectors.catalogContract, catalog.contract);
assert.equal(verifyAdopterCategoryProfileCatalog(catalog).valid, true);
assert.match(semanticRoot(catalog), /^sha256:[0-9a-f]{64}$/);

const requiredProfiles = [
  "kfd.adopter-category/base",
  "kfd.adopter-category/delivery-infrastructure",
  "kfd.adopter-category/independent-clean-room",
  "kfd.adopter-category/product-runtime",
  "kfd.adopter-category/specification-authority",
];
assert.deepEqual(
  catalog.profiles.map(({ id }) => id).sort(),
  requiredProfiles,
  "the initial project-neutral profile set must stay complete",
);

const ids = new Set();
for (const testCase of vectors.cases) {
  assert.equal(ids.has(testCase.id), false, `duplicate category vector ID ${testCase.id}`);
  ids.add(testCase.id);
  for (const code of testCase.issueCodes) {
    assert.ok(publishedCodes.has(code), `${testCase.id} uses unpublished issue code ${code}`);
  }
  const candidateCatalog = applyOperations(catalog, testCase.catalogOperations);
  const selection = applyOperations(vectors.selectionTemplate, testCase.selectionOperations);
  const report = resolveAdopterCategoryProfiles(selection, candidateCatalog);
  assert.equal(report.valid, testCase.valid, `${testCase.id}: validity drifted\n${JSON.stringify(report, null, 2)}`);
  assert.equal(report.qualifying, false, `${testCase.id}: resolution cannot qualify an adopter`);
  assert.equal(report.evidenceInherited, false, `${testCase.id}: evidence cannot transfer across adopters`);
  assert.equal(report.authorityTransferred, false, `${testCase.id}: category composition cannot transfer authority`);
  assert.match(report.catalogRoot ?? "", /^sha256:[0-9a-f]{64}$/, `${testCase.id}: catalog root is unavailable`);
  assert.match(report.selectionRoot ?? "", /^sha256:[0-9a-f]{64}$/, `${testCase.id}: selection root is unavailable`);
  assert.deepEqual(
    [...new Set(report.issues.map(({ code }) => code))],
    testCase.issueCodes,
    `${testCase.id}: issue-code set drifted`,
  );
  assert.deepEqual(
    report.issues,
    [...report.issues].sort((left, right) =>
      Buffer.compare(
        Buffer.from([left.code, left.path, left.message].join("\0"), "utf8"),
        Buffer.from([right.code, right.path, right.message].join("\0"), "utf8"),
      )),
    `${testCase.id}: diagnostics must remain stable and UTF-8 sorted`,
  );
  assert.match(report.resolutionRoot ?? semanticRoot(report), /^sha256:[0-9a-f]{64}$/);
  if (testCase.valid) {
    assert.deepEqual(report.selectedProfiles.map(({ id }) => id), testCase.selectedProfileIds);
    assert.deepEqual(report.requirements.map(({ id }) => id), testCase.requirementIds);
  }
}

for (const required of [
  "positive-base-only",
  "positive-specification-authority",
  "positive-four-profile-composition",
  "negative-unknown-profile",
  "negative-stale-profile-version",
  "negative-duplicate-selection",
  "negative-inheritance-cycle",
  "negative-requirement-conflict",
  "negative-claim-widening",
]) {
  assert.ok(ids.has(required), `missing required category vector ${required}`);
}

const forward = structuredClone(vectors.selectionTemplate);
forward.profiles = catalog.profiles.slice(1).map(({ id, version }) => ({ id, version }));
const reverse = structuredClone(forward);
reverse.profiles.reverse();
assert.deepEqual(
  resolveAdopterCategoryProfiles(forward, catalog),
  resolveAdopterCategoryProfiles(reverse, catalog),
  "selection order must not change the resolved category contract",
);

console.log(`adopter category profiles: ${vectors.cases.length} vectors passed`);
