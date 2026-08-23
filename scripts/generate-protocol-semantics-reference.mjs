#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { buildContractReference, packageRoot } from "./protocol-semantics-contract.mjs";

const outputPath = path.join(packageRoot, "profiles", "protocol-semantics-lab", "generated", "contract-reference.json");
const output = `${JSON.stringify(buildContractReference(), null, 2)}\n`;

if (process.argv.slice(2).includes("--write")) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, output);
  console.log(path.relative(packageRoot, outputPath));
} else {
  process.stdout.write(output);
}
