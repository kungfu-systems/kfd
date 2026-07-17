// SPDX-License-Identifier: Apache-2.0
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const verifier = path.join(root, "verifier");
const nativeArgs = [
  "run",
  "--locked",
  "--quiet",
  "--manifest-path",
  path.join(verifier, "Cargo.toml"),
  "-p",
  "kfd-verifier-cli",
  "--",
];

function run(command, args, expected = 0) {
  const result = spawnSync(command, args, { cwd: root, encoding: "utf8" });
  assert.equal(
    result.status,
    expected,
    `${command} ${args.join(" ")}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
  );
  return result.stdout.trim();
}

const cases = [
  [
    "kfd-record",
    "standards.json",
  ],
  [
    "kfd-record",
    ".buildchain/kfd-3/collaboration-interface.artifact.json",
  ],
  [
    "passport",
    "verifier/fixtures/passport",
  ],
  [
    "pack",
    "verifier/fixtures/xinfa/repository-small-atlas/compatibility/context-pack-v1",
  ],
  [
    "atlas",
    "verifier/fixtures/xinfa/repository-small-atlas",
  ],
  [
    "episode",
    "verifier/fixtures/episode/sealed/sha256/aa/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  ],
];

for (const [kind, fixture] of cases) {
  const native = run("cargo", [...nativeArgs, "verify", kind, fixture, "--json"]);
  const wasm = run("node", ["bin/kfd.mjs", "verify", kind, fixture, "--json"]);
  assert.equal(wasm, native, `${kind} native and WASM reports differ`);
  const report = JSON.parse(native);
  assert.equal(report.valid, true, `${kind} fixture must pass`);
  assert.equal(report.offline, true, `${kind} fixture must remain offline`);
  assert.equal(report.qualifying, false, `${kind} verifier must not self-qualify`);
  assert.equal(report.selfCertified, false, `${kind} verifier must not self-certify`);
}

const generatedPack = JSON.parse(
  fs.readFileSync(
    path.join(verifier, "fixtures", "xinfa", "repository-small-atlas", "compatibility", "context-pack-v1", "pack.json"),
    "utf8",
  ),
);
const publishedPackGolden = JSON.parse(
  fs.readFileSync(path.join(verifier, "fixtures", "xinfa", "repository-small-pack-v1.json"), "utf8"),
);
assert.equal(generatedPack.roots.pack, publishedPackGolden.packRoot);
assert.equal(generatedPack.roots.source, publishedPackGolden.sourceRoot);
assert.equal(generatedPack.roots.policy, publishedPackGolden.policyRoot);
assert.equal(generatedPack.roots.authority, publishedPackGolden.authorityRoot);
assert.equal(generatedPack.roots.coverage, publishedPackGolden.coverageRoot);
const generatedAtlas = JSON.parse(
  fs.readFileSync(path.join(verifier, "fixtures", "xinfa", "repository-small-atlas", "atlas.json"), "utf8"),
);
const publishedAtlasGolden = JSON.parse(
  fs.readFileSync(path.join(verifier, "fixtures", "xinfa", "repository-small-atlas-v1.json"), "utf8"),
);
assert.equal(generatedAtlas.atlas_root, publishedAtlasGolden.atlas_root);
assert.equal(generatedAtlas.roots.schema, publishedAtlasGolden.schema_root);
assert.equal(generatedAtlas.roots.context_pack, publishedAtlasGolden.context_pack_root);
const buildchainSelfCheck = JSON.parse(
  fs.readFileSync(path.join(verifier, "fixtures", "passport", "check-report.json"), "utf8"),
);
assert.equal(buildchainSelfCheck.contract, "kungfu-buildchain-release-check-report");
assert.equal(buildchainSelfCheck.ok, true);
assert.deepEqual(buildchainSelfCheck.issues, []);

const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "kfd-verifier-"));
try {
  fs.cpSync(
    path.join(verifier, "fixtures", "episode", "sealed", "sha256", "aa",
      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"),
    temporary,
    { recursive: true },
  );
  fs.appendFileSync(path.join(temporary, "claims.jsonl"), " ");
  const native = run(
    "cargo",
    [...nativeArgs, "verify", "episode", temporary, "--json"],
    1,
  );
  const wasm = run(
    "node",
    ["bin/kfd.mjs", "verify", "episode", temporary, "--json"],
    1,
  );
  assert.equal(wasm, native, "mutated Episode rejection must match byte for byte");
  assert.equal(JSON.parse(native).valid, false);

  const packDirectory = path.join(temporary, "pack");
  fs.cpSync(
    path.join(verifier, "fixtures", "xinfa", "repository-small-atlas", "compatibility", "context-pack-v1"),
    packDirectory,
    { recursive: true },
  );
  const packPath = path.join(packDirectory, "pack.json");
  const pack = JSON.parse(fs.readFileSync(packPath, "utf8"));
  pack.roots.pack = "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
  fs.writeFileSync(packPath, `${JSON.stringify(pack)}\n`);
  const nativePack = run("cargo", [...nativeArgs, "verify", "pack", packDirectory, "--json"], 1);
  const wasmPack = run("node", ["bin/kfd.mjs", "verify", "pack", packDirectory, "--json"], 1);
  assert.equal(wasmPack, nativePack, "mutated Pack rejection must match byte for byte");

  const atlasDirectory = path.join(temporary, "atlas");
  fs.cpSync(
    path.join(verifier, "fixtures", "xinfa", "repository-small-atlas"),
    atlasDirectory,
    { recursive: true },
  );
  const humanPath = path.join(atlasDirectory, "views", "human.json");
  const human = JSON.parse(fs.readFileSync(humanPath, "utf8"));
  human.derived = false;
  fs.writeFileSync(humanPath, `${JSON.stringify(human)}\n`);
  const nativeAtlas = run("cargo", [...nativeArgs, "verify", "atlas", atlasDirectory, "--json"], 1);
  const wasmAtlas = run("node", ["bin/kfd.mjs", "verify", "atlas", atlasDirectory, "--json"], 1);
  assert.equal(wasmAtlas, nativeAtlas, "mutated Atlas rejection must match byte for byte");

  const passportDirectory = path.join(temporary, "passport");
  fs.cpSync(path.join(verifier, "fixtures", "passport"), passportDirectory, { recursive: true });
  const passportPath = path.join(passportDirectory, "buildchain.release.json");
  const passport = JSON.parse(fs.readFileSync(passportPath, "utf8"));
  passport.artifacts[0].digest =
    "sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc";
  fs.writeFileSync(passportPath, `${JSON.stringify(passport)}\n`);
  const nativePassport = run("cargo", [...nativeArgs, "verify", "passport", passportDirectory, "--json"], 1);
  const wasmPassport = run("node", ["bin/kfd.mjs", "verify", "passport", passportDirectory, "--json"], 1);
  assert.equal(wasmPassport, nativePassport, "mutated Passport rejection must match byte for byte");

  const recordPath = path.join(temporary, "record.json");
  const schemaPath = path.join(temporary, "unsupported-schema.json");
  fs.writeFileSync(recordPath, "{\"value\":\"closed\"}\n");
  fs.writeFileSync(
    schemaPath,
    "{\"$id\":\"https://example.invalid/schema\",\"type\":\"object\",\"unevaluatedProperties\":false}\n",
  );
  const nativeSchema = run(
    "cargo",
    [...nativeArgs, "verify", "kfd-record", recordPath, "--schema", schemaPath, "--json"],
    1,
  );
  const wasmSchema = run(
    "node",
    ["bin/kfd.mjs", "verify", "kfd-record", recordPath, "--schema", schemaPath, "--json"],
    1,
  );
  assert.equal(wasmSchema, nativeSchema, "unsupported schema keyword rejection must match byte for byte");
  const symlinkPath = path.join(temporary, "passport-link");
  fs.symlinkSync(passportDirectory, symlinkPath, "dir");
  run("cargo", [...nativeArgs, "verify", "passport", symlinkPath, "--json"], 2);
  run("node", ["bin/kfd.mjs", "verify", "passport", symlinkPath, "--json"], 2);
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}

const rustManifests = [
  "verifier/Cargo.toml",
  "verifier/crates/core/Cargo.toml",
  "verifier/crates/cli/Cargo.toml",
  "verifier/crates/wasm/Cargo.toml",
].map((file) => fs.readFileSync(path.join(root, file), "utf8"));
for (const manifest of rustManifests) {
  assert.doesNotMatch(manifest, /\b(git|registry|path)\s*=\s*["'][^"']*(kungfu|xinfa|buildchain|shifu)/iu);
}
assert.doesNotMatch(
  fs.readFileSync(path.join(root, "bin", "kfd.mjs"), "utf8"),
  /\b(fetch|https?\.request)\s*\(/u,
);
console.log(`check-verifier: ${cases.length} native/WASM parity fixtures and 6 adversarial rejections ok`);
