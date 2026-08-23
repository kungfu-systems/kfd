#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { buildContractReference, packageRoot } from "./protocol-semantics-contract.mjs";
import { buildProtocolEvidenceCatalog } from "./protocol-evidence-catalog.mjs";

const outputPath = path.join(packageRoot, "profiles", "protocol-semantics-lab", "generated", "contract-reference.json");
const catalog = buildProtocolEvidenceCatalog();

if (process.argv.slice(2).includes("--write")) {
  for (const [relativePath, bytes] of catalog.files) {
    const target = path.join(packageRoot, relativePath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, bytes);
    console.log(relativePath);
  }
  const output = `${JSON.stringify(buildContractReference(), null, 2)}\n`;
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, output);
  console.log(path.relative(packageRoot, outputPath));
} else {
  process.stdout.write(`${JSON.stringify(catalog.reference, null, 2)}\n`);
}
