#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const profileRoot = path.join(packageRoot, "profiles", "agent-runtime");
const manifestPath = path.join(profileRoot, "manifest.json");
const vectorsPath = path.join(profileRoot, "vectors", "runtime-100.json");
const rootPattern = /^sha256:[a-f0-9]{64}$/u;

function sha256(bytes) {
  return `sha256:${crypto.createHash("sha256").update(bytes).digest("hex")}`;
}

function canonical(value) {
  if (value === null || typeof value === "boolean" || typeof value === "string") {
    return JSON.stringify(value);
  }
  if (typeof value === "number") {
    assert.equal(Number.isSafeInteger(value) && value >= 0, true, "canonical numbers must be non-negative safe integers");
    return String(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  assert.equal(typeof value, "object", "canonical JSON value");
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`)
    .join(",")}}`;
}

function semanticRoot(value) {
  return sha256(Buffer.from(`${canonical(value)}\n`));
}

function parseOptions(args) {
  const options = { adapterArgs: [] };
  for (let index = 0; index < args.length; index += 1) {
    const flag = args[index];
    const value = args[index + 1];
    if (flag === "--adapter" && value) {
      options.adapter = value;
      index += 1;
    } else if (flag === "--adapter-arg" && value) {
      options.adapterArgs.push(value);
      index += 1;
    } else if (flag === "--adapter-source-commit" && value) {
      options.sourceCommit = value;
      index += 1;
    } else if (flag === "--output" && value) {
      options.output = value;
      index += 1;
    } else if (flag === "--timeout-ms" && value) {
      options.timeoutMs = Number(value);
      index += 1;
    } else {
      throw new Error(`unsupported or incomplete argument: ${flag}`);
    }
  }
  if (!options.adapter) throw new Error("agent-runtime test requires --adapter");
  if (!options.output) throw new Error("agent-runtime test requires --output");
  options.timeoutMs ??= 20_000;
  if (!Number.isSafeInteger(options.timeoutMs) || options.timeoutMs < 100) {
    throw new Error("--timeout-ms must be an integer of at least 100");
  }
  return options;
}

function readRegular(filePath) {
  const stat = fs.lstatSync(filePath);
  if (!stat.isFile() || stat.isSymbolicLink()) {
    throw new Error(`${filePath} must be a regular file, not a symlink`);
  }
  return fs.readFileSync(filePath);
}

function adapterCommand(adapter, adapterArgs) {
  const absolute = path.resolve(adapter);
  const bytes = readRegular(absolute);
  if ([".js", ".mjs", ".cjs"].includes(path.extname(absolute))) {
    return {
      command: process.execPath,
      args: [absolute, ...adapterArgs],
      artifactPath: absolute,
      artifactDigest: sha256(bytes),
    };
  }
  return {
    command: absolute,
    args: adapterArgs,
    artifactPath: absolute,
    artifactDigest: sha256(bytes),
  };
}

function runAdapter(command, requests, timeoutMs) {
  return new Promise((resolve, reject) => {
    const child = spawn(command.command, command.args, {
      cwd: packageRoot,
      env: {
        ...process.env,
        KFD_AGENT_RUNTIME_OFFLINE: "1",
      },
      stdio: ["pipe", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, timeoutMs);
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on("close", (code, signal) => {
      clearTimeout(timer);
      if (timedOut) {
        reject(new Error(`adapter timed out after ${timeoutMs}ms`));
        return;
      }
      if (code !== 0) {
        reject(
          new Error(
            `adapter exited with code ${code ?? "null"} signal ${signal ?? "none"}: ${stderr.trim()}`,
          ),
        );
        return;
      }
      if (stderr.trim()) {
        reject(new Error(`adapter wrote to stderr: ${stderr.trim()}`));
        return;
      }
      try {
        const responses = stdout
          .split("\n")
          .filter(Boolean)
          .map((line) => JSON.parse(line));
        resolve(responses);
      } catch (error) {
        reject(new Error(`adapter emitted invalid JSONL: ${error.message}`));
      }
    });
    for (const request of requests) child.stdin.write(`${JSON.stringify(request)}\n`);
    child.stdin.end();
  });
}

function assertVectorRegistry(manifest, registry, registryBytes) {
  assert.equal(manifest.contract, "kfd.agent-runtime-suite-manifest/v1");
  assert.equal(registry.contract, "kfd.agent-runtime-vector-registry/v1");
  assert.equal(registry.vectors.length, 100);
  assert.equal(new Set(registry.vectors.map(({ id }) => id)).size, 100);
  assert.equal(manifest.suite.fixedVectorCount, 100);
  assert.equal(manifest.suite.vectorRoot, sha256(registryBytes));
  assert.equal(rootPattern.test(manifest.suite.vectorRoot), true);
}

export async function runAgentRuntimeTest(rawArgs) {
  const options = parseOptions(rawArgs);
  const manifestBytes = readRegular(manifestPath);
  const vectorBytes = readRegular(vectorsPath);
  const manifest = JSON.parse(manifestBytes);
  const registry = JSON.parse(vectorBytes);
  assertVectorRegistry(manifest, registry, vectorBytes);
  const adapter = adapterCommand(options.adapter, options.adapterArgs);
  const handshakeRequest = {
    schemaVersion: 1,
    contract: "kfd.agent-runtime-adapter-request/v1",
    requestId: "handshake",
    operation: "handshake",
    input: {
      profile: `${manifest.profile.id}@${manifest.profile.version}`,
      suiteRoot: manifest.suite.vectorRoot,
    },
  };
  const vectorRequests = registry.vectors.map((entry) => ({
    schemaVersion: 1,
    contract: "kfd.agent-runtime-adapter-request/v1",
    requestId: entry.id,
    operation: "evaluate",
    input: {
      category: entry.category,
      operation: entry.request.operation,
      input: entry.request.input,
    },
  }));
  const startedAt = new Date().toISOString();
  const responses = await runAdapter(
    adapter,
    [handshakeRequest, ...vectorRequests],
    options.timeoutMs,
  );
  const finishedAt = new Date().toISOString();
  if (responses.length !== 101) {
    throw new Error(`adapter returned ${responses.length} responses; expected 101`);
  }
  const byRequest = new Map();
  for (const response of responses) {
    if (
      response.schemaVersion !== 1 ||
      response.contract !== "kfd.agent-runtime-adapter-response/v1" ||
      typeof response.requestId !== "string"
    ) {
      throw new Error("adapter response envelope is invalid");
    }
    if (byRequest.has(response.requestId)) {
      throw new Error(`adapter repeated response ${response.requestId}`);
    }
    byRequest.set(response.requestId, response);
  }
  const handshake = byRequest.get("handshake");
  if (!handshake || handshake.status !== "accepted" || handshake.code !== "adapter-ready") {
    throw new Error("adapter handshake failed");
  }
  const results = registry.vectors.map((entry) => {
    const response = byRequest.get(entry.id);
    const actual = response
      ? { status: response.status, code: response.code }
      : { status: "missing", code: "adapter-response-missing" };
    const passed =
      actual.status === entry.expect.status &&
      actual.code === entry.expect.code;
    return {
      id: entry.id,
      partition: entry.partition,
      category: entry.category,
      status: passed ? "pass" : "fail",
      expected: entry.expect,
      actual,
      response: response ?? null,
      responseRoot: response ? semanticRoot(response) : "",
    };
  });
  const summarize = (partition) => {
    const selected = results.filter((entry) => entry.partition === partition);
    const passed = selected.filter((entry) => entry.status === "pass").length;
    return {
      total: selected.length,
      passed,
      failed: selected.length - passed,
      status: passed === selected.length ? "pass" : "fail",
    };
  };
  const transcript = [
    { request: handshakeRequest, response: handshake },
    ...vectorRequests.map((request) => ({
      request,
      response: byRequest.get(request.requestId) ?? null,
    })),
  ];
  const report = {
    schemaVersion: 1,
    contract: "kfd.agent-runtime-report/v1",
    profile: {
      id: manifest.profile.id,
      version: manifest.profile.version,
      manifestDigest: sha256(manifestBytes),
      agentHubManifestDigest: manifest.dependencies.agentHubManifestDigest,
    },
    suite: {
      id: manifest.suite.id,
      version: manifest.suite.version,
      vectorCount: registry.vectors.length,
      vectorRoot: manifest.suite.vectorRoot,
    },
    adapter: {
      id: handshake.adapter.id,
      version: handshake.adapter.version,
      topology: handshake.adapter.topology,
      artifactDigest: adapter.artifactDigest,
      ...(options.sourceCommit ? { sourceCommit: options.sourceCommit } : {}),
      handshake,
      handshakeRoot: semanticRoot(handshake),
    },
    platform: {
      os: os.platform(),
      arch: os.arch(),
      runtime: `node-${process.versions.node}`,
    },
    execution: {
      startedAt,
      finishedAt,
      offline: true,
      requestCount: 101,
      transcriptRoot: semanticRoot(transcript),
      resultRoot: semanticRoot(results),
    },
    partitions: {
      core: summarize("core"),
      experimental: summarize("experimental"),
    },
    valid: results.every((entry) => entry.status === "pass"),
    qualifying: false,
    selfCertified: false,
    results,
    residualRisk: [
      "Fixed vectors are finite and do not prove mathematical completeness.",
      "A passing report is evidence for the named adapter artifact only.",
      "Experimental results do not create a normative KFD claim.",
      "Offline verification detects report drift but does not attest process execution.",
    ],
  };
  const output = path.resolve(options.output);
  const parent = path.dirname(output);
  if (!fs.existsSync(parent)) throw new Error(`output parent does not exist: ${parent}`);
  fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`, { flag: "wx" });
  console.log(
    `KFD Runtime 100: ${report.valid ? "pass" : "fail"} (${results.filter((entry) => entry.status === "pass").length}/100) -> ${output}`,
  );
  return report.valid ? 0 : 1;
}

function usage() {
  return `usage:
  node scripts/agent-runtime-runner.mjs test agent-runtime --adapter <path> --output <report.json>
    [--adapter-arg <arg>] [--adapter-source-commit <sha>] [--timeout-ms <ms>]`;
}

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args[0] !== "test" || args[1] !== "agent-runtime") {
    console.error(usage());
    process.exitCode = 2;
  } else {
    runAgentRuntimeTest(args.slice(2))
      .then((code) => {
        process.exitCode = code;
      })
      .catch((error) => {
        console.error(`kfd agent-runtime runner: ${error.message}`);
        console.error(usage());
        process.exitCode = 2;
      });
  }
}
