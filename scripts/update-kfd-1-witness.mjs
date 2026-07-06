import { readFileSync, writeFileSync } from "node:fs";
import crypto from "node:crypto";

const outputPath = ".buildchain/kfd-1/contract-world.witness.json";

const readJson = (filePath) => JSON.parse(readFileSync(filePath, "utf8"));
const sha256File = (filePath) => crypto.createHash("sha256").update(readFileSync(filePath)).digest("hex");

const witness = readJson(outputPath);
const standardsSha = sha256File("standards.json");
const registrySha = sha256File("registry.json");

witness.contractWorld.digest = `sha256:${standardsSha}`;
witness.canonicalPolicy.sha256 = standardsSha;
witness.registry.sha256 = registrySha;

for (const surface of witness.surfaces ?? []) {
  if (!surface.sourcePath || !surface.artifactPath) continue;
  surface.sourceSha256 = sha256File(surface.sourcePath);
  surface.expectedSha256 = sha256File(surface.artifactPath);
}

writeFileSync(outputPath, `${JSON.stringify(witness, null, 2)}\n`);
console.log(`updated ${outputPath}`);
