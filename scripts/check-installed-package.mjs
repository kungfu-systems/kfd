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

const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    shell: process.platform === "win32",
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

  const extracted = path.join(temporary, "extracted");
  fs.mkdirSync(extracted);
  run("tar", ["-xzf", path.join(temporary, filename), "-C", extracted]);

  const packageRoot = path.join(extracted, "package");
  const checked = run(process.execPath, ["bin/kfd-self-check.mjs"], { cwd: packageRoot });
  process.stdout.write(checked.stdout);
  console.log("Installed KFD package self-verification passed from a clean npm tarball.");
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
