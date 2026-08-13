// SPDX-License-Identifier: Apache-2.0
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const targets = {
  "x86_64-unknown-linux-gnu": { os: "linux", arch: "x64", executable: "kfd", extension: ".tar.gz" },
  "aarch64-unknown-linux-gnu": { os: "linux", arch: "arm64", executable: "kfd", extension: ".tar.gz" },
  "x86_64-apple-darwin": { os: "darwin", arch: "x64", executable: "kfd", extension: ".tar.gz" },
  "aarch64-apple-darwin": { os: "darwin", arch: "arm64", executable: "kfd", extension: ".tar.gz" },
  "x86_64-pc-windows-msvc": { os: "win32", arch: "x64", executable: "kfd.exe", extension: ".zip" },
};

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    windowsHide: true,
    ...options,
  });
  const expected = options.expected ?? 0;
  assert.equal(
    result.status,
    expected,
    `${command} ${args.join(" ")}\nstdout:\n${result.stdout ?? ""}\nstderr:\n${result.stderr ?? ""}`,
  );
  return result;
}

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function zipTimestamp(date) {
  const year = Math.max(1980, date.getUTCFullYear());
  return {
    time: (date.getUTCHours() << 11) | (date.getUTCMinutes() << 5) | Math.floor(date.getUTCSeconds() / 2),
    date: ((year - 1980) << 9) | ((date.getUTCMonth() + 1) << 5) | date.getUTCDate(),
  };
}

function writeDeterministicZip(destination, directoryName, entries, timestamp) {
  const localRecords = [];
  const centralRecords = [];
  let offset = 0;
  for (const entry of entries) {
    const name = Buffer.from(`${directoryName}/${entry.name}`, "utf8");
    const bytes = fs.readFileSync(entry.path);
    const checksum = crc32(bytes);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(timestamp.time, 10);
    local.writeUInt16LE(timestamp.date, 12);
    local.writeUInt32LE(checksum, 14);
    local.writeUInt32LE(bytes.length, 18);
    local.writeUInt32LE(bytes.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    localRecords.push(local, name, bytes);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE((3 << 8) | 20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(timestamp.time, 12);
    central.writeUInt16LE(timestamp.date, 14);
    central.writeUInt32LE(checksum, 16);
    central.writeUInt32LE(bytes.length, 20);
    central.writeUInt32LE(bytes.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE((((0o100000 | entry.mode) & 0xffff) << 16) >>> 0, 38);
    central.writeUInt32LE(offset, 42);
    centralRecords.push(central, name);
    offset += local.length + name.length + bytes.length;
  }
  const centralOffset = offset;
  const centralBytes = Buffer.concat(centralRecords);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralBytes.length, 12);
  end.writeUInt32LE(centralOffset, 16);
  end.writeUInt16LE(0, 20);
  fs.writeFileSync(destination, Buffer.concat([...localRecords, centralBytes, end]));
}

function writeOctal(header, offset, length, value) {
  const octal = value.toString(8).padStart(length - 1, "0");
  assert.ok(octal.length < length, `tar field overflow: ${value}`);
  header.write(octal, offset, length - 1, "ascii");
  header[offset + length - 1] = 0;
}

function tarEntry(name, bytes, mode, timestamp, type = "0") {
  const encodedName = Buffer.from(name, "utf8");
  assert.ok(encodedName.length <= 100, `tar path is too long: ${name}`);
  const header = Buffer.alloc(512);
  encodedName.copy(header, 0);
  writeOctal(header, 100, 8, mode);
  writeOctal(header, 108, 8, 0);
  writeOctal(header, 116, 8, 0);
  writeOctal(header, 124, 12, bytes.length);
  writeOctal(header, 136, 12, timestamp);
  header.fill(0x20, 148, 156);
  header.write(type, 156, 1, "ascii");
  header.write("ustar\0", 257, 6, "ascii");
  header.write("00", 263, 2, "ascii");
  header.write("root", 265, 4, "ascii");
  header.write("root", 297, 4, "ascii");
  const checksum = header.reduce((sum, byte) => sum + byte, 0);
  header.write(checksum.toString(8).padStart(6, "0"), 148, 6, "ascii");
  header[154] = 0;
  header[155] = 0x20;
  const padding = Buffer.alloc((512 - (bytes.length % 512)) % 512);
  return Buffer.concat([header, bytes, padding]);
}

function writeDeterministicTarGzip(destination, directoryName, entries, timestamp) {
  const records = [tarEntry(`${directoryName}/`, Buffer.alloc(0), 0o755, timestamp, "5")];
  for (const entry of entries) {
    records.push(tarEntry(`${directoryName}/${entry.name}`, fs.readFileSync(entry.path), entry.mode, timestamp));
  }
  records.push(Buffer.alloc(1024));
  fs.writeFileSync(destination, gzipSync(Buffer.concat(records), { level: 9, mtime: 0 }));
}

function readVersionContract() {
  const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  const release = JSON.parse(fs.readFileSync(path.join(root, "kfd.release.json"), "utf8"));
  const cargo = fs.readFileSync(path.join(root, "verifier/Cargo.toml"), "utf8");
  const cargoVersion = cargo.match(/\[workspace\.package\][\s\S]*?\nversion\s*=\s*"([^"]+)"/u)?.[1];
  assert.equal(release.npmVersion, packageJson.version, "kfd.release.json must match package.json");
  assert.equal(cargoVersion, packageJson.version, "Rust workspace version must match package.json");
  return packageJson.version;
}

const rustcVerbose = run("rustc", ["-vV"]).stdout;
const hostTarget = rustcVerbose.match(/^host:\s*(\S+)$/mu)?.[1];
const target = process.env.BUILDCHAIN_PLATFORM_ID || hostTarget;
const targetConfig = targets[target];
assert.ok(targetConfig, `unsupported native KFD target: ${target ?? "unknown"}`);
assert.equal(hostTarget, target, `runner Rust host ${hostTarget} does not match requested target ${target}`);
assert.equal(process.platform, targetConfig.os, `runner OS ${process.platform} does not match ${target}`);
assert.equal(process.arch, targetConfig.arch, `runner architecture ${process.arch} does not match ${target}`);

const version = readVersionContract();
const trackedChanges = run("git", ["status", "--porcelain=v1", "--untracked-files=no"]).stdout.trim();
const sourceDirty = trackedChanges.length > 0;
if (sourceDirty && process.env.KFD_ALLOW_DIRTY_NATIVE_BUILD !== "1") {
  throw new Error("native release builds require a clean tracked source tree");
}
run("cargo", [
  "build",
  "--locked",
  "--release",
  "--manifest-path",
  "verifier/Cargo.toml",
  "--package",
  "kfd-verifier-cli",
  "--target",
  target,
]);

const executable = path.join(root, "verifier/target", target, "release", targetConfig.executable);
assert.equal(fs.existsSync(executable), true, `native executable is missing: ${executable}`);
const versionResult = run(executable, ["--version"]);
assert.equal(versionResult.stdout.trim(), `kfd ${version}`, "native --version drifted");

const validResult = run(executable, ["verify", "kfd-record", "standards.json", "--json"]);
assert.equal(JSON.parse(validResult.stdout).valid, true, "native positive smoke must pass");
const invalidResult = run(
  executable,
  ["verify", "kfd-record", "verifier/fixtures/kfd-7/invalid-missing-warrant.json", "--json"],
  { expected: 1 },
);
assert.equal(JSON.parse(invalidResult.stdout).valid, false, "native negative smoke must fail closed");

const outputDirectory = path.join(root, "dist/native");
fs.rmSync(outputDirectory, { recursive: true, force: true });
fs.mkdirSync(outputDirectory, { recursive: true });
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "kfd-native-release-"));
const baseName = `kfd-${version}-${target}`;
const bundleDirectory = path.join(temporary, baseName);
fs.mkdirSync(bundleDirectory);
fs.copyFileSync(executable, path.join(bundleDirectory, targetConfig.executable));
fs.copyFileSync(path.join(root, "LICENSE"), path.join(bundleDirectory, "LICENSE"));
fs.copyFileSync(path.join(root, "docs/native-cli.md"), path.join(bundleDirectory, "README.md"));
if (process.platform !== "win32") {
  fs.chmodSync(path.join(bundleDirectory, targetConfig.executable), 0o755);
  fs.chmodSync(path.join(bundleDirectory, "LICENSE"), 0o644);
  fs.chmodSync(path.join(bundleDirectory, "README.md"), 0o644);
}

const headSha = run("git", ["rev-parse", "HEAD"]).stdout.trim();
const sourceSha = process.env.BUILDCHAIN_SOURCE_SHA || headSha;
assert.match(sourceSha, /^[0-9a-f]{40}$/u, "source SHA must be a full Git SHA");
assert.equal(sourceSha, headSha, "declared source SHA must match the checked-out commit");
const sourceTree = run("git", ["rev-parse", "HEAD^{tree}"]).stdout.trim();
const sourceEpoch = Number(process.env.SOURCE_DATE_EPOCH || run("git", ["show", "-s", "--format=%ct", "HEAD"]).stdout.trim());
assert.equal(Number.isSafeInteger(sourceEpoch), true, "SOURCE_DATE_EPOCH must be an integer");
const sourceDate = new Date(sourceEpoch * 1000);
for (const entry of [
  bundleDirectory,
  path.join(bundleDirectory, targetConfig.executable),
  path.join(bundleDirectory, "LICENSE"),
  path.join(bundleDirectory, "README.md"),
]) {
  fs.utimesSync(entry, sourceDate, sourceDate);
}

const archiveName = `${baseName}${targetConfig.extension}`;
const archivePath = path.join(outputDirectory, archiveName);
const archiveEntries = [
  { name: targetConfig.executable, path: path.join(bundleDirectory, targetConfig.executable), mode: 0o755 },
  { name: "LICENSE", path: path.join(bundleDirectory, "LICENSE"), mode: 0o644 },
  { name: "README.md", path: path.join(bundleDirectory, "README.md"), mode: 0o644 },
];
if (targetConfig.extension === ".zip") {
  writeDeterministicZip(archivePath, baseName, archiveEntries, zipTimestamp(sourceDate));
} else {
  writeDeterministicTarGzip(archivePath, baseName, archiveEntries, sourceEpoch);
}
const archivedPaths = new Set(run("tar", ["-tf", archivePath]).stdout.trim().split(/\r?\n/u));
for (const entry of archiveEntries) {
  assert.equal(archivedPaths.has(`${baseName}/${entry.name}`), true, `archive is missing ${entry.name}`);
}

const executableDigest = sha256(executable);
const archiveDigest = sha256(archivePath);
const provenanceName = `${baseName}.provenance.json`;
const provenancePath = path.join(outputDirectory, provenanceName);
const provenance = {
  schema: "kfd.native-release-provenance/v1",
  identity: {
    name: "kfd",
    version,
    target,
    sourceSha,
    sourceTree,
  },
  build: {
    implementation: "rust",
    toolchain: rustcVerbose.trim().split("\n"),
    command: `cargo build --locked --release --manifest-path verifier/Cargo.toml --package kfd-verifier-cli --target ${target}`,
    sourceDateEpoch: sourceEpoch,
    sourceDirty,
  },
  artifacts: {
    executable: { name: targetConfig.executable, sha256: executableDigest },
    archive: { name: archiveName, sha256: archiveDigest },
  },
  verification: {
    version: `kfd ${version}`,
    positiveSmoke: "standards.json",
    negativeSmoke: "verifier/fixtures/kfd-7/invalid-missing-warrant.json",
    capabilityBoundary: ["verify", "bundle"],
    wasmParity: "npm run check:verifier",
  },
};
fs.writeFileSync(provenancePath, `${JSON.stringify(provenance, null, 2)}\n`);

const checksumName = `${baseName}.sha256`;
const checksumPath = path.join(outputDirectory, checksumName);
fs.writeFileSync(
  checksumPath,
  `${archiveDigest}  ${archiveName}\n${sha256(provenancePath)}  ${provenanceName}\n`,
);

const manifest = {
  schema: "kfd.native-release-build/v1",
  name: "kfd",
  version,
  target,
  sourceSha,
  sourceTree,
  files: [archiveName, provenanceName, checksumName].map((name) => ({ name, sha256: sha256(path.join(outputDirectory, name)) })),
};
fs.writeFileSync(path.join(outputDirectory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
fs.rmSync(temporary, { recursive: true, force: true });

console.log(`Native KFD release assets built: ${baseName}`);
