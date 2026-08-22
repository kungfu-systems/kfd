// SPDX-License-Identifier: Apache-2.0
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import { exactByteRoot } from "./self-conformance-contract.mjs";

export function regularBytes(filePath) {
  const absolute = path.resolve(filePath);
  const stat = fs.lstatSync(absolute);
  if (!stat.isFile() || stat.isSymbolicLink()) {
    throw new Error(`${absolute} must be a regular file, not a symlink`);
  }
  return fs.readFileSync(absolute);
}

export function adapterCommand(adapterPath, adapterArgs = []) {
  const absolute = path.resolve(adapterPath);
  const bytes = regularBytes(absolute);
  if ([".js", ".mjs", ".cjs"].includes(path.extname(absolute))) {
    return { command: process.execPath, args: [absolute, ...adapterArgs], artifactDigest: exactByteRoot(bytes) };
  }
  if (path.extname(absolute) === ".py") {
    return { command: process.env.PYTHON || "python3", args: [absolute, ...adapterArgs], artifactDigest: exactByteRoot(bytes) };
  }
  return { command: absolute, args: adapterArgs, artifactDigest: exactByteRoot(bytes) };
}

export function executeJsonl(command, requests, timeoutMs, { offlineEnvironment = {} } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command.command, command.args, {
      cwd: process.cwd(),
      env: { ...process.env, ...offlineEnvironment },
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
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on("close", (code, signal) => {
      clearTimeout(timer);
      if (timedOut) return reject(new Error(`adapter timed out after ${timeoutMs}ms`));
      if (code !== 0) return reject(new Error(`adapter exited with code ${code ?? "null"} signal ${signal ?? "none"}: ${stderr.trim()}`));
      if (stderr.trim()) return reject(new Error(`adapter wrote to stderr: ${stderr.trim()}`));
      try {
        resolve(stdout.split("\n").filter(Boolean).map((line) => JSON.parse(line)));
      } catch (error) {
        reject(new Error(`adapter emitted invalid JSONL: ${error.message}`));
      }
    });
    for (const request of requests) child.stdin.write(`${JSON.stringify(request)}\n`);
    child.stdin.end();
  });
}
