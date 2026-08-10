#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function usage() {
  return `usage:
  kfd demo agent-hub --output <report.json>
    [--reference-adapter <state-machine|rule-table>] [--timeout-ms <ms>] [--json]
  kfd scaffold agent-hub --language <cpp|node|python|rust> --output <new-directory> [--json]
  kfd capabilities agent-hub [--json]
  kfd test agent-runtime --adapter <path> --output <report.json>
    [--adapter-arg <arg>] [--adapter-source-commit <sha>] [--timeout-ms <ms>]
  kfd test agent-hub --adapter <path> --output <report.json>
    [--adapter-arg <arg>] [--adapter-source-commit <sha>] [--timeout-ms <ms>]
  kfd verify agent-hub-report <report.json> [--adapter <path>] [--json]
  kfd verify warrant-evidence <bundle.json> [--json]
  kfd verify kfd-10-witness <witness.json> [--json]
  kfd adopter init --manifest-id <id> --adopter-id <id> --artifact-kind <kind>
    --artifact-coordinate <coordinate> --artifact-root <sha256:...> --scope <scope>
    --package-root <sha256:...> --verified-at <date-time> --max-age-seconds <seconds>
    --output <manifest.json> [--json]
  kfd adopter witness <manifest.json> --decision <KFD-N> --profile <profile-id>
    --coordinate <coordinate> --witness-root <sha256:...> --package-root <sha256:...>
    --verified-at <date-time> --max-age-seconds <seconds> --output <manifest.json> [--json]
  kfd adopter verify <manifest.json> --package-root <sha256:...>
    --verified-at <date-time> --max-age-seconds <seconds> [--output <report.json>] [--json]
  kfd adopter diff <before.json> <after.json> [--output <report.json>] [--json]
  kfd adopter bundle <manifest.json> --package-root <sha256:...>
    --verified-at <date-time> --max-age-seconds <seconds> --output <bundle.json> [--json]
  kfd gate self-conformance-lifecycle <request.json> --output <report.json> [--json]
  kfd verify <kfd-record|passport|pack|atlas|episode|agent-runtime-report|self-conformance-transition|bundle> <path> [--schema <path>] [--json]
  kfd bundle <kfd-record|passport|pack|atlas|episode|agent-runtime-report|self-conformance-transition> <path> --output <bundle.json>`;
}

function regularText(filePath) {
  const stat = fs.lstatSync(filePath);
  if (!stat.isFile() || stat.isSymbolicLink()) {
    throw new Error(`${filePath} must be a regular file, not a symlink`);
  }
  return fs.readFileSync(filePath, "utf8");
}

function collect(root, directory, artifacts) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    const stat = fs.lstatSync(absolute);
    if (stat.isSymbolicLink()) throw new Error(`symlink is not admitted: ${absolute}`);
    if (stat.isDirectory()) collect(root, absolute, artifacts);
    else if (stat.isFile()) {
      const relative = path.relative(root, absolute);
      if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
        throw new Error(`path escaped object root: ${absolute}`);
      }
      artifacts[relative.split(path.sep).join("/")] = regularText(absolute);
    }
  }
}

function primaryName(kind) {
  return {
    passport: "buildchain.release.json",
    pack: "pack.json",
    atlas: "atlas.json",
    episode: "manifest.json",
  }[kind];
}

function bundleObject(kind, inputPath, schemaPath) {
  const artifacts = {};
  let primary;
  if (fs.lstatSync(inputPath).isDirectory()) {
    collect(inputPath, inputPath, artifacts);
    const name = primaryName(kind);
    if (!name) throw new Error(`${kind} expects a JSON file`);
    primary = artifacts[name];
    delete artifacts[name];
    if (primary === undefined) throw new Error(`object directory is missing ${name}`);
  } else {
    primary = regularText(inputPath);
  }
  if (schemaPath) artifacts["schema.json"] = regularText(schemaPath);
  if (kind === "episode") {
    const manifest = JSON.parse(primary);
    if (manifest.semanticRoot) artifacts["semantic-root.txt"] = `${manifest.semanticRoot}\n`;
  }
  return {
    schemaVersion: 1,
    contract: "kfd.verification-bundle/v1",
    kind,
    primary,
    artifacts,
  };
}

async function verifyWasm(bundleText) {
  const wasmPath = path.join(packageRoot, "verifier", "dist", "kfd_verifier.wasm");
  const module = await WebAssembly.instantiate(fs.readFileSync(wasmPath), {});
  const { memory, kfd_alloc: alloc, kfd_free: free, kfd_verify: verify } = module.instance.exports;
  const input = new TextEncoder().encode(bundleText);
  const inputPointer = alloc(input.length);
  new Uint8Array(memory.buffer, inputPointer, input.length).set(input);
  let packed;
  try {
    packed = verify(inputPointer, input.length);
  } finally {
    free(inputPointer, input.length);
  }
  const outputPointer = Number(packed >> 32n);
  const outputLength = Number(packed & 0xffffffffn);
  const output = new Uint8Array(memory.buffer, outputPointer, outputLength).slice();
  free(outputPointer, outputLength);
  return new TextDecoder().decode(output);
}

function adopterFlags(args, positionalCount) {
  const positional = args.slice(0, positionalCount);
  if (positional.length !== positionalCount || positional.some((value) => value.startsWith("--"))) {
    throw new Error("adopter command is missing a positional input");
  }
  const flags = {};
  for (let index = positionalCount; index < args.length; index += 1) {
    const flag = args[index];
    if (flag === "--json") continue;
    if (!flag.startsWith("--") || !args[index + 1] || args[index + 1].startsWith("--")) {
      throw new Error(`unsupported or incomplete argument: ${flag}`);
    }
    const name = flag.slice(2);
    if (Object.hasOwn(flags, name)) throw new Error(`duplicate argument: ${flag}`);
    flags[name] = args[++index];
  }
  return { positional, flags };
}

function exactFlags(flags, admitted) {
  for (const name of Object.keys(flags)) {
    if (!admitted.includes(name)) throw new Error(`unsupported argument: --${name}`);
  }
}

function adopterContext(flags) {
  return {
    packageArtifactRoot: flags["package-root"],
    verifiedAt: flags["verified-at"],
    maxAgeSeconds: flags["max-age-seconds"],
  };
}

async function runAdopter(args) {
  const command = args[0];
  const toolchain = await import("../scripts/adopter-toolchain.mjs");
  if (command === "init") {
    const { flags } = adopterFlags(args.slice(1), 0);
    exactFlags(flags, [
      "manifest-id", "adopter-id", "artifact-kind", "artifact-coordinate", "artifact-root",
      "scope", "package-root", "verified-at", "max-age-seconds", "output",
    ]);
    if (!flags.output) throw new Error("adopter init requires --output");
    const manifest = toolchain.initAdopterManifest({
      ...adopterContext(flags),
      manifestId: flags["manifest-id"],
      adopterId: flags["adopter-id"],
      artifactKind: flags["artifact-kind"],
      artifactCoordinate: flags["artifact-coordinate"],
      artifactRoot: flags["artifact-root"],
      scope: flags.scope,
    });
    toolchain.writeAdopterJson(flags.output, manifest);
    console.log(JSON.stringify({ valid: true, output: path.resolve(flags.output), manifestRoot: (await import("../scripts/self-conformance-contract.mjs")).semanticRoot(manifest) }));
    return 0;
  }
  if (command === "witness") {
    const { positional: [input], flags } = adopterFlags(args.slice(1), 1);
    exactFlags(flags, [
      "decision", "profile", "coordinate", "witness-root", "package-root",
      "verified-at", "max-age-seconds", "output",
    ]);
    if (!flags.output) throw new Error("adopter witness requires --output");
    const manifest = toolchain.addAdopterWitness(toolchain.readAdopterJson(input), {
      ...adopterContext(flags),
      decisionId: flags.decision,
      profileId: flags.profile,
      witnessCoordinate: flags.coordinate,
      witnessRoot: flags["witness-root"],
    });
    toolchain.writeAdopterJson(flags.output, manifest);
    console.log(JSON.stringify({ valid: true, output: path.resolve(flags.output), decision: flags.decision, profile: flags.profile }));
    return 0;
  }
  if (command === "verify") {
    const { positional: [input], flags } = adopterFlags(args.slice(1), 1);
    exactFlags(flags, ["package-root", "verified-at", "max-age-seconds", "output"]);
    const report = toolchain.verifyAdopterManifestFromPackage(toolchain.readAdopterJson(input), adopterContext(flags));
    if (flags.output) toolchain.writeAdopterJson(flags.output, report);
    else console.log(JSON.stringify(report));
    return report.valid ? 0 : 1;
  }
  if (command === "diff") {
    const { positional: [before, after], flags } = adopterFlags(args.slice(1), 2);
    exactFlags(flags, ["output"]);
    const report = toolchain.diffAdopterManifests(
      toolchain.readAdopterJson(before),
      toolchain.readAdopterJson(after),
    );
    if (flags.output) toolchain.writeAdopterJson(flags.output, report);
    else console.log(JSON.stringify(report));
    return 0;
  }
  if (command === "bundle") {
    const { positional: [input], flags } = adopterFlags(args.slice(1), 1);
    exactFlags(flags, ["package-root", "verified-at", "max-age-seconds", "output"]);
    if (!flags.output) throw new Error("adopter bundle requires --output");
    const bundle = toolchain.bundleAdopterManifest(toolchain.readAdopterJson(input), adopterContext(flags));
    toolchain.writeAdopterJson(flags.output, bundle);
    console.log(JSON.stringify({ valid: true, output: path.resolve(flags.output), bundleRoot: bundle.bundleRoot }));
    return 0;
  }
  throw new Error(`unsupported adopter command: ${command ?? "missing"}`);
}

async function main(args) {
  if (args[0] === "adopter") {
    process.exitCode = await runAdopter(args.slice(1));
    return;
  }
  if (args[0] === "demo" && args[1] === "agent-hub") {
    let output;
    let referenceAdapter = "state-machine";
    let timeoutMs;
    let json = false;
    for (let index = 2; index < args.length; index += 1) {
      if (args[index] === "--json") json = true;
      else if (args[index] === "--output" && args[index + 1]) output = args[++index];
      else if (args[index] === "--reference-adapter" && args[index + 1]) referenceAdapter = args[++index];
      else if (args[index] === "--timeout-ms" && args[index + 1]) timeoutMs = args[++index];
      else throw new Error(`unsupported or incomplete argument: ${args[index]}`);
    }
    if (!output) throw new Error("agent-hub demo requires --output");
    const adapters = {
      "state-machine": "state-machine-adapter.mjs",
      "rule-table": "rule-table-adapter.mjs",
    };
    if (!adapters[referenceAdapter]) {
      throw new Error("--reference-adapter must be state-machine or rule-table");
    }
    const adapter = path.join(packageRoot, "profiles", "agent-hub", "adapters", adapters[referenceAdapter]);
    const runnerArgs = ["--adapter", adapter, "--output", output];
    if (timeoutMs) runnerArgs.push("--timeout-ms", timeoutMs);
    const { runAgentHubTest } = await import("../scripts/agent-hub-runner.mjs");
    const runCode = await runAgentHubTest(runnerArgs, { quiet: true });
    const { verifyAgentHubReport } = await import("../scripts/agent-hub-report-verifier.mjs");
    const report = JSON.parse(regularText(path.resolve(output)));
    const verification = verifyAgentHubReport(report, { adapterPath: adapter });
    const result = {
      schemaVersion: 1,
      contract: "kfd.agent-hub-demo-result/v1",
      valid: runCode === 0 && verification.valid,
      suite: { id: report.suite.id, passed: report.coverage.passed, total: report.coverage.total },
      report: path.resolve(output),
      adapter: { id: report.adapter.id, packagedReference: referenceAdapter },
      offlineVerification: {
        valid: verification.valid,
        adapterArtifactChecked: verification.adapterArtifactChecked,
        reportDigest: verification.reportDigest,
      },
      qualifying: false,
      certification: false,
    };
    if (json) console.log(JSON.stringify(result));
    else console.log(`KFD Agent Hub demo: ${result.valid ? "pass" : "fail"} (${report.coverage.passed}/20); offline verification: ${verification.valid ? "pass" : "fail"} -> ${result.report}`);
    process.exitCode = result.valid ? 0 : 1;
    return;
  }
  if (args[0] === "scaffold" && args[1] === "agent-hub") {
    const { runAgentHubScaffold } = await import("../scripts/agent-hub-scaffold.mjs");
    process.exitCode = runAgentHubScaffold(args.slice(2));
    return;
  }
  if (args[0] === "capabilities" && args[1] === "agent-hub") {
    if (args.length > 3 || (args[2] && args[2] !== "--json")) {
      throw new Error(`unsupported argument: ${args[2]}`);
    }
    console.log(regularText(path.join(packageRoot, "profiles", "agent-hub", "cli-capabilities.json")).trim());
    return;
  }
  if (args[0] === "test" && args[1] === "agent-runtime") {
    const { runAgentRuntimeTest } = await import(
      "../scripts/agent-runtime-runner.mjs"
    );
    process.exitCode = await runAgentRuntimeTest(args.slice(2));
    return;
  }
  if (args[0] === "test" && args[1] === "agent-hub") {
    const { runAgentHubTest } = await import("../scripts/agent-hub-runner.mjs");
    process.exitCode = await runAgentHubTest(args.slice(2));
    return;
  }
  if (args[0] === "verify" && args[1] === "agent-hub-report") {
    const { runAgentHubReportVerifier } = await import("../scripts/agent-hub-report-verifier.mjs");
    process.exitCode = runAgentHubReportVerifier(args.slice(2));
    return;
  }
  if (args[0] === "verify" && args[1] === "warrant-evidence") {
    const { runPrimitiveEvidenceVerifier } = await import(
      "../scripts/warrant-evidence-verifier.mjs"
    );
    process.exitCode = runPrimitiveEvidenceVerifier(args.slice(2));
    return;
  }
  if (args[0] === "verify" && args[1] === "kfd-10-witness") {
    const { runWarrantWitnessVerifier } = await import(
      "../scripts/warrant-evidence-verifier.mjs"
    );
    process.exitCode = runWarrantWitnessVerifier(args.slice(2));
    return;
  }
  if (args[0] === "gate" && args[1] === "self-conformance-lifecycle") {
    const { runSelfConformanceLifecycleGate } = await import(
      "../scripts/self-conformance-lifecycle-gate.mjs"
    );
    process.exitCode = runSelfConformanceLifecycleGate(args.slice(2));
    return;
  }
  if (args.length < 3) throw new Error("missing command, kind, or path");
  const [command, kind, input] = args;
  let schema;
  let output;
  for (let index = 3; index < args.length; index += 1) {
    if (args[index] === "--json") continue;
    if (args[index] === "--schema" && args[index + 1]) schema = args[++index];
    else if (args[index] === "--output" && args[index + 1]) output = args[++index];
    else throw new Error(`unsupported argument: ${args[index]}`);
  }
  if (command === "verify" && kind === "bundle") {
    const report = await verifyWasm(regularText(input));
    console.log(report);
    process.exitCode = JSON.parse(report).valid ? 0 : 1;
    return;
  }
  const bundle = bundleObject(kind, input, schema);
  const rendered = JSON.stringify(bundle);
  if (command === "bundle") {
    if (!output) throw new Error("bundle requires --output");
    fs.writeFileSync(output, `${rendered}\n`, { flag: "wx" });
    return;
  }
  if (command !== "verify") throw new Error(`unsupported command: ${command}`);
  const report = await verifyWasm(rendered);
  console.log(report);
  process.exitCode = JSON.parse(report).valid ? 0 : 1;
}

main(process.argv.slice(2)).catch((error) => {
  console.error(`kfd: ${error.message}`);
  console.error(usage());
  process.exitCode = 2;
});
