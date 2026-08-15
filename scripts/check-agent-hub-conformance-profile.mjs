// SPDX-License-Identifier: Apache-2.0
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const sha256 = (bytes) => `sha256:${crypto.createHash("sha256").update(bytes).digest("hex")}`;
const read = (file) => fs.readFileSync(path.join(root, file));
const json = (file) => JSON.parse(read(file));
function run(command, args, expected = 0, cwd = root) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8", shell: process.platform === "win32" && command === npmCommand });
  assert.equal(result.status, expected, `${command} ${args.join(" ")}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
  return result.stdout.trim();
}

const manifest = json("profiles/agent-hub/manifest.json");
const registry = json("profiles/agent-hub/vectors/hub-20.json");
const failures = json("profiles/agent-hub/failure-codes.json");
const cliCapabilities = json("profiles/agent-hub/cli-capabilities.json");
const standards = json("standards.json");
const packageJson = json("package.json");
assert.equal(manifest.contract, "kfd.agent-hub-conformance-manifest/v1");
assert.equal(manifest.profile.id, "kfd-agent-hub-conformance");
assert.equal(manifest.profile.version, "0.1.0-alpha.1");
assert.equal(manifest.profile.status, "experimental");
assert.equal(manifest.protocol.manifestDigest, sha256(read(manifest.protocol.manifest)));
assert.equal(manifest.runtimeDependency.manifestDigest, sha256(read(manifest.runtimeDependency.manifest)));
assert.equal(manifest.suite.vectorRoot, sha256(read("profiles/agent-hub/vectors/hub-20.json")));
assert.equal(manifest.failureInventory.root, sha256(read(manifest.failureInventory.path)));
assert.doesNotMatch(JSON.stringify(manifest), /sha256:0{64}/u, "published manifest must not contain zero digests");
assert.ok(manifest.surfaces.length >= 12);
for (const surface of manifest.surfaces) assert.equal(surface.digest, sha256(read(surface.path)), `${surface.path} digest drifted`);
assert.equal(registry.contract, "kfd.agent-hub-vector-registry/v1");
assert.equal(registry.vectors.length, 20);
assert.equal(new Set(registry.vectors.map(({ id }) => id)).size, 20);
assert.equal(failures.profileCodes.includes("conflict-visible"), true);
assert.equal(failures.positiveCodes.includes("conflict-visible"), false);
assert.equal(registry.vectors.every(({ polarity, expect }) => polarity === (expect.status === "accepted" ? "positive" : "negative")), true);
assert.equal(cliCapabilities.contract, "kfd.agent-hub-cli-capabilities/v1");
assert.deepEqual(cliCapabilities.scaffoldLanguages, ["cpp", "node", "python", "rust"]);
assert.equal(cliCapabilities.reportVerification.backend, "host-node");
assert.deepEqual(cliCapabilities.reportVerification.sharedRustWasmChecks, []);
assert.match(cliCapabilities.reportVerification.parityBoundary, /No Agent Hub report check is duplicated/u);
assert.equal(cliCapabilities.dimensions.behavior.starter, "0/20");
assert.equal(cliCapabilities.dimensions.evidence.starter, true);
assert.deepEqual(cliCapabilities.dimensions.authority.starter, { qualifying: false, certification: false });
assert.deepEqual(cliCapabilities.paths.starter.expected, {
  scaffoldExitCode: 0,
  smokeExitCode: 0,
  testExitCode: 1,
  behavior: "0/20",
  verifyExitCode: 0,
  evidence: "valid",
  qualifying: false,
  certification: false,
});
assert.match(cliCapabilities.claimBoundary, /independent dimensions/u);
assert.equal(packageJson.exports["./agent-hub/*"], "./profiles/agent-hub/*");
assert.equal(packageJson.exports["./agent-hub/scaffolds/*"], "./profiles/agent-hub/scaffolds/*");
const registeredSurfacePaths = new Set(standards.standards["kfd-1"].surfaceRegister.surfaces.map(({ sourcePath }) => sourcePath));
for (const surface of ["profiles/agent-hub/cli-capabilities.json", "scripts/agent-hub-scaffold.mjs"]) {
  assert.equal(registeredSurfacePaths.has(surface), true, `KFD-1 surface register missing ${surface}`);
}
const rootedProfilePaths = new Set(manifest.surfaces.map(({ path: surface }) => surface));
for (const surface of [
  "profiles/agent-hub/cli-capabilities.json",
  "scripts/agent-hub-scaffold.mjs",
  "profiles/agent-hub/scaffolds/cpp/adapter.cpp",
  "profiles/agent-hub/scaffolds/node/adapter.mjs",
  "profiles/agent-hub/scaffolds/python/adapter.py",
  "profiles/agent-hub/scaffolds/rust/src/main.rs",
]) {
  assert.equal(rootedProfilePaths.has(surface), true, `profile manifest missing ${surface}`);
}
for (const schema of ["conformance-manifest", "adapter-request", "adapter-response", "suite", "report"]) {
  assert.equal(json(`schemas/kfd-agent-hub/${schema}.schema.json`).$id, `https://kfd.libkungfu.dev/schemas/kfd-agent-hub/${schema}.schema.json`);
}
run("node", ["scripts/generate-agent-hub-vectors.mjs"]);

const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "kfd-agent-hub-"));
try {
  const reports = [];
  for (const adapter of ["profiles/agent-hub/adapters/state-machine-adapter.mjs", "profiles/agent-hub/adapters/rule-table-adapter.mjs"]) {
    const reportPath = path.join(temporary, `${path.basename(adapter, ".mjs")}.report.json`);
    run("node", ["bin/kfd.mjs", "test", "agent-hub", "--adapter", adapter, "--output", reportPath]);
    const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
    assert.equal(report.valid, true); assert.equal(report.qualifying, false); assert.equal(report.certification, false);
    assert.equal(report.results.length, 20); assert.equal(report.coverage.passed, 20); assert.equal(report.capabilities.length, 2);
    const unbound = JSON.parse(run("node", ["bin/kfd.mjs", "verify", "agent-hub-report", reportPath, "--json"]));
    assert.equal(unbound.valid, true); assert.equal(unbound.adapterArtifactChecked, false);
    const bound = JSON.parse(run("node", ["scripts/agent-hub-report-verifier.mjs", reportPath, "--adapter", adapter, "--json"]));
    assert.equal(bound.valid, true); assert.equal(bound.adapterArtifactChecked, true);
    reports.push(report);
  }
  const demoReportPath = path.join(temporary, "demo.report.json");
  const demo = JSON.parse(run("node", ["bin/kfd.mjs", "demo", "agent-hub", "--output", demoReportPath, "--json"]));
  assert.equal(demo.valid, true);
  assert.deepEqual(demo.suite, { id: "kfd-agent-hub-20", passed: 20, total: 20 });
  assert.equal(demo.offlineVerification.valid, true);
  assert.equal(demo.offlineVerification.adapterArtifactChecked, true);
  assert.equal(demo.qualifying, false);
  assert.equal(demo.certification, false);
  assert.equal(JSON.parse(run("node", ["bin/kfd.mjs", "capabilities", "agent-hub", "--json"])).contract, cliCapabilities.contract);

  for (const language of cliCapabilities.scaffoldLanguages) {
    const output = path.join(temporary, `${language}-starter`);
    const scaffold = JSON.parse(run("node", ["bin/kfd.mjs", "scaffold", "agent-hub", "--language", language, "--output", output, "--json"]));
    assert.equal(scaffold.language, language);
    assert.equal(scaffold.binding, "jsonl-stdio/v1");
    assert.equal(scaffold.conformance, "evidence-valid-negative-starter");
    assert.equal(scaffold.qualifying, false);
    assert.equal(scaffold.certification, false);
    assert.equal(scaffold.next.claims.qualifying, false);
    assert.equal(scaffold.next.claims.certification, false);
    assert.ok(scaffold.next.claims.notExecuted.includes("product-owned KFD Agent Hub 20 semantics"));
    assert.deepEqual(scaffold.expected, {
      smoke: { exitCode: 0, valid: true },
      behavior: { exitCode: 1, passed: 0, total: 20, conforming: false },
      evidence: { exitCode: 0, valid: true, adapterArtifactChecked: true },
      authority: { qualifying: false, certification: false },
    });
    if (language === "node") run("node", [path.join(output, "smoke.mjs")]);
    if (language === "python") run("python3", [path.join(output, "smoke.py")]);
    if (language === "rust") {
      run("cargo", ["test", "--quiet", "--manifest-path", path.join(output, "Cargo.toml")]);
      run("cargo", ["build", "--quiet", "--release", "--manifest-path", path.join(output, "Cargo.toml")]);
    }
    if (language === "cpp") run("node", [path.join(output, "smoke.mjs")]);
    let adapterPath;
    if (language === "node") adapterPath = path.join(output, "adapter.mjs");
    if (language === "python") adapterPath = path.join(output, "adapter.py");
    if (language === "rust") adapterPath = path.join(output, "target", "release", `kfd-agent-hub-rust-starter${process.platform === "win32" ? ".exe" : ""}`);
    if (language === "cpp") {
      const compilerCandidates = process.env.CXX
        ? [process.env.CXX]
        : (process.platform === "win32" ? ["cl", "clang++", "g++"] : ["c++"]);
      const compiler = compilerCandidates.find((candidate) => {
        const isMsvc = /(?:^|[\\/])(?:cl|clang-cl)(?:\.exe)?$/iu.test(candidate);
        return !spawnSync(candidate, [isMsvc ? "/?" : "--version"], { stdio: "ignore" }).error;
      });
      assert.ok(compiler, `no C++ compiler found; tried ${compilerCandidates.join(", ")}`);
      const isMsvc = /(?:^|[\\/])(?:cl|clang-cl)(?:\.exe)?$/iu.test(compiler);
      adapterPath = path.join(output, `kfd-agent-hub-cpp-starter${process.platform === "win32" ? ".exe" : ""}`);
      const compileArgs = isMsvc
        ? ["/std:c++17", path.join(output, "adapter.cpp"), `/Fe:${adapterPath}`]
        : ["-std=c++17", path.join(output, "adapter.cpp"), "-o", adapterPath];
      run(compiler, compileArgs);
    }
    const starterReportPath = path.join(temporary, `${language}-starter.report.json`);
    run("node", ["bin/kfd.mjs", "test", "agent-hub", "--adapter", adapterPath, "--output", starterReportPath], 1);
    const starterReport = JSON.parse(fs.readFileSync(starterReportPath, "utf8"));
    assert.equal(starterReport.valid, false);
    assert.deepEqual(starterReport.coverage, {
      total: 20,
      passed: 0,
      failed: 20,
      categories: Object.fromEntries(Object.entries(starterReport.coverage.categories).map(([category, value]) => [category, { ...value, passed: 0, failed: value.total }])),
    });
    assert.equal(starterReport.qualifying, false);
    assert.equal(starterReport.certification, false);
    const starterVerification = JSON.parse(run("node", ["bin/kfd.mjs", "verify", "agent-hub-report", starterReportPath, "--adapter", adapterPath, "--json"]));
    assert.equal(starterVerification.valid, true);
    assert.deepEqual(starterVerification.dimensions, {
      behavior: { passed: 0, total: 20, conforming: false },
      evidence: { valid: true, adapterArtifactChecked: true },
      authority: { qualifying: false, certification: false },
    });
    assert.equal(starterVerification.adapterArtifactChecked, true);
    const starterSummary = run("node", ["bin/kfd.mjs", "verify", "agent-hub-report", starterReportPath, "--adapter", adapterPath]);
    assert.match(starterSummary, /Behavior: 0\/20 \(not conforming\)/u);
    assert.match(starterSummary, /Evidence: valid \(adapter bytes checked\)/u);
    assert.match(starterSummary, /Authority: qualifying=false; certification=false/u);
  }

  const protectedOutput = path.join(temporary, "protected-output");
  fs.mkdirSync(protectedOutput);
  const sentinel = path.join(protectedOutput, "sentinel.txt");
  fs.writeFileSync(sentinel, "adopter-owned\n");
  run("node", ["bin/kfd.mjs", "scaffold", "agent-hub", "--language", "node", "--output", protectedOutput], 2);
  assert.equal(fs.readFileSync(sentinel, "utf8"), "adopter-owned\n");
  run("node", ["bin/kfd.mjs", "scaffold", "agent-hub", "--language", "go", "--output", path.join(temporary, "unsupported")], 2);
  run("node", ["bin/kfd.mjs", "scaffold", "agent-hub", "--language", "node", "--output", path.join(temporary, "missing-parent", "starter")], 2);
  const realParent = path.join(temporary, "real-parent");
  const linkedParent = path.join(temporary, "linked-parent");
  fs.mkdirSync(realParent);
  fs.symlinkSync(realParent, linkedParent, "dir");
  run("node", ["bin/kfd.mjs", "scaffold", "agent-hub", "--language", "node", "--output", path.join(linkedParent, "starter")], 2);
  assert.notEqual(reports[0].adapter.id, reports[1].adapter.id);
  assert.notEqual(reports[0].adapter.topology, reports[1].adapter.topology);
  assert.notEqual(reports[0].adapter.artifactDigest, reports[1].adapter.artifactDigest);
  assert.deepEqual(reports[0].results.map(({ id, status, actual }) => ({ id, status, actual })), reports[1].results.map(({ id, status, actual }) => ({ id, status, actual })));
  const mutations = [
    ["profile-root", (value) => { value.profile.manifestDigest = `sha256:${"1".repeat(64)}`; }],
    ["protocol-root", (value) => { value.protocol.manifestDigest = `sha256:${"2".repeat(64)}`; }],
    ["unsupported-profile-version", (value) => { value.profile.version = "0.2.0"; }],
    ["suite-root", (value) => { value.suite.vectorRoot = `sha256:${"3".repeat(64)}`; }],
    ["expectation", (value) => { value.results[0].expected.code = "mutated"; }],
    ["response-root", (value) => { value.results[0].responseRoot = `sha256:${"4".repeat(64)}`; }],
    ["capability-root", (value) => { value.capabilities[0].root = `sha256:${"5".repeat(64)}`; }],
    ["missing-vector", (value) => { value.results.pop(); }],
    ["duplicate-vector", (value) => { value.results[1] = structuredClone(value.results[0]); }],
    ["scope-widening", (value) => { value.qualifying = true; }],
    ["validity", (value) => { value.valid = false; }],
  ];
  for (const [name, mutate] of mutations) {
    const value = structuredClone(reports[0]); mutate(value);
    const reportPath = path.join(temporary, `invalid-${name}.json`); fs.writeFileSync(reportPath, `${JSON.stringify(value)}\n`);
    const result = JSON.parse(run("node", ["bin/kfd.mjs", "verify", "agent-hub-report", reportPath, "--json"], 1));
    assert.equal(result.valid, false, `${name} must fail closed`); assert.ok(result.issues.length >= 1);
  }

  const packDirectory = path.join(temporary, "pack"); fs.mkdirSync(packDirectory);
  const pack = JSON.parse(run(npmCommand, ["pack", "--json", "--pack-destination", packDirectory]));
  assert.equal(pack.length, 1);
  assert.equal(
    pack[0].files.some(({ path: packedPath }) => /(?:^|\/)(?:target|node_modules|__pycache__|build)(?:\/|$)|\.pyc$/u.test(packedPath)),
    false,
    "npm pack must exclude scaffold build caches",
  );
  const extract = path.join(temporary, "extract"); fs.mkdirSync(extract);
  run("tar", ["-xzf", path.join(packDirectory, pack[0].filename), "-C", extract]);
  const cleanRoot = path.join(extract, "package");
  for (const surface of manifest.surfaces) assert.equal(fs.existsSync(path.join(cleanRoot, surface.path)), true, `npm pack missing ${surface.path}`);
  const cleanReport = path.join(temporary, "clean-install.report.json");
  run("node", ["bin/kfd.mjs", "test", "agent-hub", "--adapter", "profiles/agent-hub/adapters/state-machine-adapter.mjs", "--output", cleanReport], 0, cleanRoot);
  const cleanVerification = JSON.parse(run("node", ["bin/kfd.mjs", "verify", "agent-hub-report", cleanReport, "--adapter", "profiles/agent-hub/adapters/state-machine-adapter.mjs", "--json"], 0, cleanRoot));
  assert.equal(cleanVerification.valid, true); assert.equal(cleanVerification.adapterArtifactChecked, true);
  const cleanDemoReport = path.join(temporary, "clean-demo.report.json");
  const cleanDemo = JSON.parse(run("node", ["bin/kfd.mjs", "demo", "agent-hub", "--output", cleanDemoReport, "--json"], 0, cleanRoot));
  assert.equal(cleanDemo.valid, true);
  assert.equal(cleanDemo.offlineVerification.valid, true);
  const cleanStarter = path.join(temporary, "clean-pack-node-starter");
  run("node", ["bin/kfd.mjs", "scaffold", "agent-hub", "--language", "node", "--output", cleanStarter, "--json"], 0, cleanRoot);
  run("node", [path.join(cleanStarter, "smoke.mjs")], 0, cleanRoot);
  const cleanStarterReport = path.join(temporary, "clean-pack-node-starter.report.json");
  run("node", ["bin/kfd.mjs", "test", "agent-hub", "--adapter", path.join(cleanStarter, "adapter.mjs"), "--output", cleanStarterReport], 1, cleanRoot);
  const cleanStarterVerification = JSON.parse(run("node", ["bin/kfd.mjs", "verify", "agent-hub-report", cleanStarterReport, "--adapter", path.join(cleanStarter, "adapter.mjs"), "--json"], 0, cleanRoot));
  assert.equal(cleanStarterVerification.valid, true);
  assert.deepEqual(cleanStarterVerification.dimensions.behavior, { passed: 0, total: 20, conforming: false });
  assert.equal(cleanStarterVerification.adapterArtifactChecked, true);

  const consumer = path.join(temporary, "consumer"); fs.mkdirSync(consumer);
  fs.writeFileSync(path.join(consumer, "consumer-config.json"), "{}\n");
  const proxy = path.join(consumer, "adapter.mjs");
  fs.writeFileSync(proxy, `import fs from "node:fs";\nimport { spawn } from "node:child_process";\nif (!fs.existsSync("consumer-config.json")) throw new Error("consumer cwd was not preserved");\nconst child = spawn(process.execPath, [${JSON.stringify(path.join(cleanRoot, "profiles/agent-hub/adapters/state-machine-adapter.mjs"))}], { stdio: "inherit" });\nchild.on("close", (code) => { process.exitCode = code ?? 2; });\n`);
  const consumerReport = path.join(consumer, "report.json");
  run("node", [path.join(cleanRoot, "bin/kfd.mjs"), "test", "agent-hub", "--adapter", "./adapter.mjs", "--output", consumerReport], 0, consumer);
  assert.equal(JSON.parse(run("node", [path.join(cleanRoot, "bin/kfd.mjs"), "verify", "agent-hub-report", consumerReport, "--adapter", "./adapter.mjs", "--json"], 0, consumer)).valid, true);
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}

const stateAdapter = fs.readFileSync(path.join(root, "profiles/agent-hub/adapters/state-machine-adapter.mjs"), "utf8");
const ruleAdapter = fs.readFileSync(path.join(root, "profiles/agent-hub/adapters/rule-table-adapter.mjs"), "utf8");
assert.doesNotMatch(stateAdapter, /rule-table-adapter/u); assert.doesNotMatch(ruleAdapter, /state-machine-adapter/u);
console.log("Agent Hub conformance profile check passed: fixed Hub 20, zero-config demo, 4 evidence-valid 0/20 starters, offline verifier, 11 adversarial mutations, path safety, clean npm pack");
