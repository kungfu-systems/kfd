// SPDX-License-Identifier: Apache-2.0
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { applyOperations } from "./self-conformance-contract.mjs";
import {
  KFD_SPECIFICATION_AUTHORITY_TRANSITION,
  verifyKfdSpecificationAuthorityTransition,
} from "./kfd-specification-authority-transition-contract.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const extracted = process.argv.includes("--extracted");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const run = (command, args, cwd = root) => {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    env: { ...process.env, npm_config_offline: "true" },
    shell: process.platform === "win32" && command === npmCommand,
  });
  assert.equal(result.status, 0, `${command} ${args.join(" ")}\n${result.stdout}\n${result.stderr}`);
  return result.stdout.trim();
};
const vectors = readJson("profiles/adopter-conformance/specification-authority-transition-vectors.json");
const schema = readJson("schemas/kfd-adopter-conformance/specification-authority-transition.schema.json");
const packageJson = readJson("package.json");
const impact = readJson("release-impact.json");

assert.equal(vectors.schemaVersion, 1);
assert.equal(vectors.contract, "kfd.specification-authority-transition-vectors/v1");
assert.equal(vectors.template.contract, KFD_SPECIFICATION_AUTHORITY_TRANSITION);
assert.equal(schema.$id, vectors.template.$schema);
assert.equal(schema.properties.contract.const, KFD_SPECIFICATION_AUTHORITY_TRANSITION);
assert.equal(new Set(vectors.cases.map(({ id }) => id)).size, vectors.cases.length);
assert.equal(vectors.cases.filter(({ expected }) => expected.valid).length, 2);
assert.equal(vectors.cases.filter(({ expected }) => !expected.valid).length, 7);

for (const vector of vectors.cases) {
  const manifest = applyOperations(vectors.template, vector.manifestOperations);
  const context = applyOperations(vectors.context, vector.contextOperations);
  const report = verifyKfdSpecificationAuthorityTransition(manifest, context);
  assert.equal(report.valid, vector.expected.valid, `${vector.id}: ${JSON.stringify(report.issues)}`);
  assert.deepEqual([...new Set(report.issues.map(({ code }) => code))].sort(), vector.expected.issueCodes, vector.id);
  assert.equal(report.bootstrap, vector.expected.bootstrap, vector.id);
  assert.equal(report.priorCutVerified, vector.expected.priorCutVerified, vector.id);
  assert.equal(report.circular, vector.expected.circular, vector.id);
  assert.equal(report.qualifying, false, vector.id);
  assert.equal(report.selfCertified, false, vector.id);
  assert.equal(report.releaseAuthorized, false, vector.id);
  assert.match(report.transitionRoot, /^sha256:[0-9a-f]{64}$/);
  assert.match(report.reportRoot, /^sha256:[0-9a-f]{64}$/);
}

for (const [alias, target] of Object.entries({
  "./adopter-conformance/specification-authority-transition": "./scripts/kfd-specification-authority-transition-contract.mjs",
  "./adopter-conformance/specification-authority-transition.schema.json": "./schemas/kfd-adopter-conformance/specification-authority-transition.schema.json",
  "./adopter-conformance/specification-authority-transition-vectors.json": "./profiles/adopter-conformance/specification-authority-transition-vectors.json",
})) assert.equal(packageJson.exports[alias], target, `missing export ${alias}`);

const classification = impact.surfaceImpacts.find(({ id }) => id === "kfd-specification-authority-transition-contract");
assert.equal(classification?.class, "additive");
assert.equal(classification?.impact, "minor");

if (!extracted) {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "kfd-specification-authority-transition-"));
  try {
    const packed = JSON.parse(run(npmCommand, [
      "pack", "--json", "--ignore-scripts", "--pack-destination", temporary,
    ]));
    run("tar", ["-xzf", path.join(temporary, packed[0].filename), "-C", temporary]);
    const extractedRoot = path.join(temporary, "package");
    const output = run("node", [
      "scripts/check-kfd-specification-authority-transition.mjs", "--extracted",
    ], extractedRoot);
    assert.equal(output.includes("2 positive and 7 fail-closed package-only vectors passed"), true);
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}

console.log("check-kfd-specification-authority-transition: 2 positive and 7 fail-closed package-only vectors passed");
