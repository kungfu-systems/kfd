import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "kfd-installed-package-"));
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const commandNeedsShell = (command, platform = process.platform) =>
  platform === "win32" && /\.(?:cmd|bat)$/iu.test(command);

assert.equal(commandNeedsShell("npm.cmd", "win32"), true);
assert.equal(commandNeedsShell("node.exe", "win32"), false);
assert.equal(commandNeedsShell(process.execPath, "win32"), false);

const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    shell: commandNeedsShell(command),
    ...options,
  });
  assert.equal(
    result.status,
    0,
    `${command} ${args.join(" ")} failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
  );
  return result;
};

try {
  const packed = run(npmCommand, [
    "pack",
    "--ignore-scripts",
    "--json",
    "--pack-destination",
    temporary,
  ]);
  const [{ filename }] = JSON.parse(packed.stdout);
  assert.ok(filename, "npm pack did not report a filename");

  const consumer = path.join(temporary, "consumer");
  fs.mkdirSync(consumer);
  fs.writeFileSync(path.join(consumer, "package.json"), `${JSON.stringify({ private: true }, null, 2)}\n`);
  run(npmCommand, [
    "install",
    "--ignore-scripts",
    "--no-audit",
    "--no-fund",
    path.join(temporary, filename),
  ], { cwd: consumer });

  const installedSelfCheck = path.join(
    consumer,
    "node_modules",
    ".bin",
    process.platform === "win32" ? "kfd-self-check.cmd" : "kfd-self-check",
  );
  const checked = run(installedSelfCheck, [], { cwd: consumer });
  process.stdout.write(checked.stdout);
  const installedKfd = path.join(
    consumer,
    "node_modules",
    ".bin",
    process.platform === "win32" ? "kfd.cmd" : "kfd",
  );
  const adapterFixture = {
    schemaVersion: 1,
    contract: "kfd.protocol-trace-fixture/v1",
    id: "installed-mcp-adapter-smoke",
    protocol: {
      protocolId: "mcp-tasks",
      protocolVersion: "2026.7.28",
      evidencePackRoot: "sha256:c716585840a15bdcb1d6295703a950a927098ac7f67f48fb9c499d75d7588415",
    },
    events: [
      {
        id: "event-1",
        variant: "task.created",
        provenance: { protocolId: "mcp-tasks", protocolVersion: "2026.7.28" },
        payload: { taskId: "task-1", status: "working", executorId: "executor-a" },
      },
      {
        id: "event-2",
        variant: "task.status",
        provenance: { protocolId: "mcp-tasks", protocolVersion: "2026.7.28" },
        payload: { taskId: "task-1", status: "completed", executorId: "executor-b" },
      },
    ],
    expectation: { scenario: "executor-replacement", identityPreservation: "preserved" },
  };
  const adapterSmoke = [
    "import { adaptProtocolTrace } from '@kungfu-tech/kfd/protocol-semantics-lab/observation-adapters';",
    `const result = adaptProtocolTrace(${JSON.stringify(adapterFixture)});`,
    "if (!result.outputRoot.startsWith('sha256:') || result.observation.claimBoundary.inferenceAllowed !== false) process.exit(1);",
  ].join("\n");
  run(process.execPath, ["--input-type=module", "--eval", adapterSmoke], {
    cwd: consumer,
    env: { ...process.env, KFD_NETWORK_DISABLED: "1" },
  });
  const offlineEnvironment = { ...process.env, KFD_NETWORK_DISABLED: "1", KFD_DELEGATED_WORK_OFFLINE: "1" };
  const catalog = JSON.parse(run(installedKfd, ["challenge", "delegated-work", "protocol", "list", "--json"], {
    cwd: consumer,
    env: offlineEnvironment,
  }).stdout);
  assert.equal(catalog.protocols.length, 12);
  const protocolReportPath = path.join(consumer, "protocol-report.json");
  const protocolReport = JSON.parse(run(installedKfd, [
    "challenge", "delegated-work", "protocol", "analyze",
    "--fixture", "mcp-executor-replacement-preserved",
    "--output", protocolReportPath,
    "--json",
  ], { cwd: consumer, env: offlineEnvironment }).stdout);
  assert.match(protocolReport.result.resultRoot, /^sha256:[0-9a-f]{64}$/u);
  const preservedRoute = JSON.parse(run(installedKfd, [
    "challenge", "delegated-work", "route", "analyze", "--route", "mcp-to-a2a", "--json",
  ], { cwd: consumer, env: offlineEnvironment }).stdout);
  const collapsedRoute = JSON.parse(run(installedKfd, [
    "challenge", "delegated-work", "route", "analyze", "--route", "durable-runtime-recovery-to-canonical-work", "--json",
  ], { cwd: consumer, env: offlineEnvironment }).stdout);
  assert.equal(preservedRoute.result.state, "preserved");
  assert.equal(collapsedRoute.result.state, "collapsed");
  const verification = JSON.parse(run(installedKfd, [
    "verify", "delegated-work-protocol-report", protocolReportPath, "--json",
  ], { cwd: consumer, env: offlineEnvironment }).stdout);
  assert.equal(verification.valid, true);
  const capabilityPath = path.join(consumer, "capabilities.json");
  const capabilities = JSON.parse(run(installedKfd, [
    "challenge", "delegated-work", "manifest", "derive", protocolReportPath,
    "--output", capabilityPath,
    "--json",
  ], { cwd: consumer, env: offlineEnvironment }).stdout);
  assert.equal(capabilities.capabilities.some(({ state }) => state === "verified"), true);
  console.log("Installed KFD package self-verification passed from a clean npm consumer.");
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
