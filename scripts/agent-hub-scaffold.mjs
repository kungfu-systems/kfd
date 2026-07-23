#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const languages = new Set(["cpp", "node", "python", "rust"]);

function parseOptions(args) {
  const options = { json: false };
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === "--json") options.json = true;
    else if (args[index] === "--language" && args[index + 1]) options.language = args[++index];
    else if ((args[index] === "--output" || args[index] === "--output-dir") && args[index + 1]) options.output = args[++index];
    else throw new Error(`unsupported or incomplete argument: ${args[index]}`);
  }
  if (!languages.has(options.language)) throw new Error("--language must be cpp, node, python, or rust");
  if (!options.output) throw new Error("agent-hub scaffold requires --output");
  return options;
}

function copyTree(sourceRoot, source, target) {
  for (const entry of fs.readdirSync(source, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
    if (entry.name === ".gitignore" || entry.name === ".npmignore") continue;
    const from = path.join(source, entry.name);
    const relative = path.relative(sourceRoot, from);
    if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) throw new Error(`template path escaped root: ${from}`);
    const stat = fs.lstatSync(from);
    if (stat.isSymbolicLink()) throw new Error(`template symlink is not admitted: ${relative}`);
    const to = path.join(target, relative);
    if (entry.isDirectory()) fs.mkdirSync(to);
    else if (entry.isFile()) fs.writeFileSync(to, fs.readFileSync(from), { flag: "wx", mode: stat.mode & 0o777 });
    else throw new Error(`unsupported template entry: ${relative}`);
    if (entry.isDirectory()) copyTree(sourceRoot, from, target);
  }
}

export function runAgentHubScaffold(rawArgs) {
  const options = parseOptions(rawArgs);
  const source = path.join(packageRoot, "profiles", "agent-hub", "scaffolds", options.language);
  const output = path.resolve(options.output);
  const parent = path.dirname(output);
  const parentStat = fs.lstatSync(parent);
  if (!parentStat.isDirectory() || parentStat.isSymbolicLink()) throw new Error(`output parent must be a real directory: ${parent}`);
  if (fs.existsSync(output)) throw new Error(`refusing to overwrite existing path: ${output}`);
  fs.mkdirSync(output);
  try {
    copyTree(source, source, output);
  } catch (error) {
    fs.rmSync(output, { recursive: true, force: true });
    throw error;
  }
  const result = {
    schemaVersion: 1,
    contract: "kfd.agent-hub-scaffold-result/v1",
    language: options.language,
    output,
    binding: "jsonl-stdio/v1",
    conformance: "starter-envelope-smoke-only",
    qualifying: false,
    certification: false,
    next: JSON.parse(fs.readFileSync(path.join(output, "kfd-scaffold.json"), "utf8")),
  };
  if (options.json) console.log(JSON.stringify(result));
  else console.log(`KFD Agent Hub ${options.language} starter -> ${output}\nScope: envelope smoke only; implement Hub semantics before running Hub 20.`);
  return 0;
}

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  try { process.exitCode = runAgentHubScaffold(process.argv.slice(2)); }
  catch (error) { console.error(`kfd agent-hub scaffold: ${error.message}`); process.exitCode = 2; }
}
