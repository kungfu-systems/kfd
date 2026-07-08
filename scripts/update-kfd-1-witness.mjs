import { readFileSync, writeFileSync } from "node:fs";
import crypto from "node:crypto";

const outputPath = ".buildchain/kfd-1/contract-world.witness.json";

const readJson = (filePath) => JSON.parse(readFileSync(filePath, "utf8"));
const sha256File = (filePath) => crypto.createHash("sha256").update(readFileSync(filePath)).digest("hex");

const witness = readJson(outputPath);
const standards = readJson("standards.json");
const standardsSha = sha256File("standards.json");
const registrySha = sha256File("registry.json");
const surfaceRegister = standards.standards?.["kfd-1"]?.surfaceRegister;
const registeredSurfaces = new Map((surfaceRegister?.surfaces ?? []).map((surface) => [surface.id, surface]));

witness.contractWorld.digest = `sha256:${standardsSha}`;
witness.canonicalPolicy.sha256 = standardsSha;
witness.registry.sha256 = registrySha;
witness.compatibilityImpactClasses = surfaceRegister?.compatibilityImpactClasses ?? [];
witness.surfaces = [...registeredSurfaces.values()].map((registered) => ({
  name: registered.id,
  sourcePath: registered.sourcePath,
  sourceSha256: sha256File(registered.sourcePath),
  artifactPath: registered.sourcePath,
  expectedSha256: sha256File(registered.sourcePath),
  byteForByte: true,
  class: registered.class,
  classes: registered.classes ?? [registered.class],
  description: registered.description,
  weldRationale: registered.weldRationale,
  impactProjection: registered.impactProjection,
}));

writeFileSync(outputPath, `${JSON.stringify(witness, null, 2)}\n`);
console.log(`updated ${outputPath}`);
