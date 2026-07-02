// Registry conformance check: the registry and the decision documents must
// agree, so a release cannot ship a registry that lies about its contents.
import { readFileSync, existsSync } from "node:fs";

const fail = (msg) => { console.error(`check: ${msg}`); process.exitCode = 1; };
const registry = JSON.parse(readFileSync("registry.json", "utf8"));

if (registry.schemaVersion !== 1) fail(`unsupported schemaVersion ${registry.schemaVersion}`);
if (registry.contract !== "kfd-registry") fail(`unexpected contract ${registry.contract}`);

const seen = new Set();
const statuses = new Set(["draft", "active", "superseded"]);
for (const e of registry.entries) {
  if (!Number.isInteger(e.number) || e.number < 1) fail(`bad number ${e.number}`);
  if (seen.has(e.number)) fail(`duplicate number ${e.number}`);
  seen.add(e.number);
  if (e.id !== `KFD-${e.number}`) fail(`id ${e.id} does not match number ${e.number}`);
  if (!statuses.has(e.status)) fail(`bad status ${e.status} on ${e.id}`);
  if (!existsSync(e.path)) fail(`missing document ${e.path} for ${e.id}`);
  else {
    const doc = readFileSync(e.path, "utf8");
    if (!doc.startsWith(`# ${e.id}:`)) fail(`${e.path} heading does not open with "# ${e.id}:"`);
    if (!doc.includes(`Status: ${e.status}`)) fail(`${e.path} status line does not say ${e.status}`);
  }
}
if (process.exitCode) process.exit(process.exitCode);
console.log(`check: ${registry.entries.length} entries ok`);
