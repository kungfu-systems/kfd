#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

if (process.argv.length !== 2) {
  console.error("usage: kfd-self-check");
  process.exitCode = 2;
} else {
  const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  process.chdir(packageRoot);
  await import("../scripts/check.mjs");
}
