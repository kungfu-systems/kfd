#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { exactByteRoot, semanticRoot } from "./protocol-semantics-contract.mjs";
import {
  buildProtocolSemanticsReport,
  buildRouteSemanticsReport,
} from "./protocol-semantics-report.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const exampleRoot = path.join(root, "profiles", "protocol-semantics-lab", "examples");

const definitions = Object.freeze([
  {
    id: "a2a-retry",
    kind: "protocol",
    value: "a2a-retry-preserved",
    path: "a2a-retry.report.json",
    command: "kfd challenge delegated-work protocol analyze --fixture a2a-retry-preserved",
  },
  {
    id: "commerce-authorization-route",
    kind: "route",
    value: "commerce-authorization-to-accepted-completion",
    path: "commerce-authorization-route.report.json",
    command: "kfd challenge delegated-work route analyze --route commerce-authorization-to-accepted-completion",
  },
  {
    id: "mcp-executor-replacement",
    kind: "protocol",
    value: "mcp-executor-replacement-preserved",
    path: "mcp-executor-replacement.report.json",
    command: "kfd challenge delegated-work protocol analyze --fixture mcp-executor-replacement-preserved",
  },
  {
    id: "zed-acp-resume",
    kind: "protocol",
    value: "zed-acp-resume-preserved",
    path: "zed-acp-resume.report.json",
    command: "kfd challenge delegated-work protocol analyze --fixture zed-acp-resume-preserved",
  },
]);

function jsonBytes(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function generateProtocolSemanticsCommercializationExamples() {
  const files = new Map();
  const entries = definitions.map((definition) => {
    const report = definition.kind === "protocol"
      ? buildProtocolSemanticsReport({ fixtureId: definition.value })
      : buildRouteSemanticsReport({ routeId: definition.value });
    const bytes = jsonBytes(report);
    files.set(definition.path, bytes);
    return {
      id: definition.id,
      kind: definition.kind,
      command: definition.command,
      path: `profiles/protocol-semantics-lab/examples/${definition.path}`,
      resultState: report.result.state,
      resultRoot: report.result.resultRoot,
      reportRoot: report.reportRoot,
      byteRoot: exactByteRoot(Buffer.from(bytes, "utf8")),
    };
  });
  const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  const manifest = {
    schemaVersion: 1,
    contract: "kfd.protocol-semantics-commercial-examples/v1",
    package: { name: packageJson.name, version: packageJson.version },
    entries,
    claim: "reproducible-packaged-evidence-only",
  };
  manifest.manifestRoot = semanticRoot(manifest);
  files.set("manifest.json", jsonBytes(manifest));
  return files;
}

function writeExamples() {
  fs.mkdirSync(exampleRoot, { recursive: true });
  for (const [name, bytes] of generateProtocolSemanticsCommercializationExamples()) {
    fs.writeFileSync(path.join(exampleRoot, name), bytes);
  }
}

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  if (process.argv.length !== 3 || process.argv[2] !== "--write") {
    console.error("usage: node scripts/generate-protocol-semantics-commercialization.mjs --write");
    process.exitCode = 2;
  } else {
    writeExamples();
    console.log(`wrote ${definitions.length} rooted protocol semantics examples and manifest`);
  }
}
