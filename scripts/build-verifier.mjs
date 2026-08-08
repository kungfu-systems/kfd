// SPDX-License-Identifier: Apache-2.0
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = path.join(root, "verifier", "Cargo.toml");
const rustupCargo = spawnSync(
  "rustup",
  ["which", "--toolchain", "stable", "cargo"],
  { encoding: "utf8" },
);
const rustupRustc = spawnSync(
  "rustup",
  ["which", "--toolchain", "stable", "rustc"],
  { encoding: "utf8" },
);
if (rustupCargo.status !== 0 || rustupRustc.status !== 0) {
  console.error("build-verifier: rustup stable toolchain is required");
  process.exit(1);
}
const result = spawnSync(
  rustupCargo.stdout.trim(),
  [
    "build",
    "--locked",
    "--manifest-path",
    manifest,
    "-p",
    "kfd-verifier-wasm",
    "--target",
    "wasm32-unknown-unknown",
    "--release",
  ],
  {
    cwd: root,
    encoding: "utf8",
    stdio: "inherit",
    env: { ...process.env, RUSTC: rustupRustc.stdout.trim() },
  },
);
if (result.status !== 0) process.exit(result.status ?? 1);

const source = path.join(
  root,
  "verifier",
  "target",
  "wasm32-unknown-unknown",
  "release",
  "kfd_verifier_wasm.wasm",
);
const outputDirectory = path.join(root, "verifier", "dist");
const output = path.join(outputDirectory, "kfd_verifier_current.wasm");
fs.mkdirSync(outputDirectory, { recursive: true });
fs.copyFileSync(source, output);
const bytes = fs.readFileSync(output);
const digest = crypto.createHash("sha256").update(bytes).digest("hex");
fs.writeFileSync(
  path.join(outputDirectory, "kfd_verifier_current.wasm.sha256"),
  `${digest}  kfd_verifier_current.wasm\n`,
);
console.log(`build-verifier: ${path.relative(root, output)} sha256:${digest}`);
