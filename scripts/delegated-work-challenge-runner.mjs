#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import {
  REPORT_CONTRACT,
  adapterRequests,
  attachAdapterAssertions,
  evaluateAdapterResponses,
  evaluateProjection,
  loadChallenge,
  loadProjection,
  rootReport,
  selectPairs,
  semanticRoot,
  sourceClosure,
} from "./delegated-work-challenge-core.mjs";
import { adapterCommand, executeJsonl } from "./jsonl-adapter-runner.mjs";

function parseOptions(args) {
  const selected = { adapterArgs: [], timeoutMs: 20_000, json: false, quiet: false };
  const single = new Set();
  for (let index = 0; index < args.length; index += 1) {
    const flag = args[index];
    const next = args[index + 1];
    if (flag === "--json") selected.json = true;
    else if (flag === "--quiet") selected.quiet = true;
    else if (flag === "--adapter-arg" && next) selected.adapterArgs.push(next), index += 1;
    else if (["--pair", "--projection", "--adapter", "--output", "--timeout-ms"].includes(flag) && next) {
      if (single.has(flag)) throw new Error(`duplicate argument: ${flag}`);
      single.add(flag);
      selected[flag.slice(2).replace(/-([a-z])/g, (_, value) => value.toUpperCase())] = next;
      index += 1;
    } else throw new Error(`unsupported or incomplete argument: ${flag}`);
  }
  selected.timeoutMs = Number(selected.timeoutMs);
  if (!Number.isSafeInteger(selected.timeoutMs) || selected.timeoutMs < 100 || selected.timeoutMs > 120_000) {
    throw new Error("--timeout-ms must be an integer from 100 through 120000");
  }
  return selected;
}

function renderHuman(report) {
  const lines = [
    "KFD Delegated Work Paired-World Lab",
    "",
    `Projection: ${report.projection.document.id} (${report.projection.document.visible.length} visible fields)`,
    "Each pair contains two worlds that look the same through the selected projection but require different decisions.",
  ];
  for (const finding of report.findings) {
    lines.push(
      "",
      `PAIR: ${finding.pairId}`,
      finding.sameSurface,
      "",
      `visibleRoot(A) = ${finding.worlds.A.projectedRoot}`,
      `visibleRoot(B) = ${finding.worlds.B.projectedRoot}`,
      `collision      = ${finding.collision}`,
      "",
      "Required:",
      `  World A -> may advance (${finding.required.A.dispositions.join(" or ")})`,
      `  World B -> must not advance (${finding.required.B.dispositions.join(" or ")})`,
      "",
      `FINDING: ${finding.semanticFinding}`,
    );
    if (finding.collision) {
      lines.push(finding.whyUnsafe, finding.whyNotLive, `Candidate information that separates this fixture: ${finding.discriminatingFields.join(", ")}`);
    } else {
      lines.push("The selected projection contains enough information to distinguish these two fixture worlds.", `Distinguishing candidates in the fixed fixture: ${finding.discriminatingFields.join(", ")}`);
    }
    if (finding.adapterAssertion) {
      lines.push(`Adapter assertion: ${finding.adapterAssertion.safetyAndLivenessSatisfied ? "safety and liveness satisfied" : "not satisfied"}`);
    }
  }
  lines.push(
    "",
    `Summary: ${report.summary.collapsed}/${report.summary.total} collapsed; ${report.summary.informationDistinguishable}/${report.summary.total} information-distinguishable.`,
    `Runner execution: ${report.execution.runnerExecution}; report validity: ${report.execution.reportValidity}.`,
  );
  if (report.adapter) {
    lines.push(`Adapter-declared enforcement: ${report.summary.adapterDeclaredEnforcement}. This is an adopter-owned assertion bound to ${report.adapter.artifactDigest}.`);
  }
  lines.push(
    "This proves only what the selected projection can distinguish inside the fixed experiment.",
    "It does not prove policy correctness, real enforcement, certification, qualification, security, production fitness, or external adoption.",
  );
  return lines.join("\n");
}

export async function runDelegatedWorkChallenge(rawArgs, { quiet = false } = {}) {
  const selected = parseOptions(rawArgs);
  quiet ||= selected.quiet;
  const challenge = loadChallenge();
  const projectionEntry = loadProjection(selected.projection, challenge.manifest);
  const pairs = selectPairs(challenge.suite, selected.pair);
  let findings = evaluateProjection(challenge.suite, projectionEntry.value, selected.pair);
  let adapter;
  let transcript = [];
  let assertions = [];
  if (selected.adapter) {
    const command = adapterCommand(selected.adapter, selected.adapterArgs);
    const requests = adapterRequests(challenge, pairs);
    const responses = await executeJsonl(command, requests, selected.timeoutMs, {
      offlineEnvironment: { KFD_DELEGATED_WORK_OFFLINE: "1" },
    });
    const evaluated = evaluateAdapterResponses(challenge, pairs, requests, responses);
    adapter = {
      ...evaluated.adapter,
      artifactDigest: command.artifactDigest,
      handshake: evaluated.handshake,
      handshakeRoot: semanticRoot(evaluated.handshake),
    };
    assertions = evaluated.assertions;
    findings = attachAdapterAssertions(findings, assertions);
    const byId = new Map(responses.map((response) => [response.requestId, response]));
    transcript = requests.map((request) => ({ request, response: byId.get(request.requestId) ?? null }));
  }
  const collapsed = findings.filter(({ collision }) => collision).length;
  const adapterPassed = assertions.length > 0 && assertions.every(({ semanticPass }) => semanticPass);
  const closure = sourceClosure(challenge);
  const report = {
    schemaVersion: 1,
    contract: REPORT_CONTRACT,
    ...closure,
    suite: {
      id: challenge.suite.id,
      version: challenge.suite.version,
      fixedPairCount: challenge.suite.pairs.length,
      selectedPairCount: pairs.length,
      suiteRoot: semanticRoot(challenge.suite),
      fixtureRoots: challenge.suite.pairs.map((pair) => ({ pairId: pair.id, root: semanticRoot(pair) })),
    },
    projection: {
      document: projectionEntry.value,
      projectionRoot: semanticRoot(projectionEntry.value),
      source: projectionEntry.builtIn ? "packaged" : "adopter-supplied",
    },
    ...(adapter ? { adapter } : {}),
    platform: { os: os.platform(), arch: os.arch(), runtime: `node-${process.versions.node}` },
    execution: {
      runnerExecution: "success",
      reportValidity: "valid",
      offline: true,
      mode: adapter ? "adapter" : "projection",
      requestCount: transcript.length,
      transcript,
      transcriptRoot: adapter ? semanticRoot(transcript) : null,
      resultRoot: semanticRoot(findings),
    },
    findings,
    summary: {
      total: findings.length,
      collapsed,
      informationDistinguishable: findings.length - collapsed,
      semanticFinding: collapsed > 0 ? "COLLAPSED" : "INFORMATION-DISTINGUISHABLE",
      adapterDeclaredEnforcement: adapter ? (adapterPassed ? "safety-and-liveness-satisfied" : "not-satisfied") : "not-tested",
    },
    claimBoundary: structuredClone(challenge.manifest.claimBoundary),
    residualRisks: structuredClone(challenge.manifest.residualRisks),
    qualifying: false,
    certification: false,
  };
  report.reportRoot = rootReport(report);
  if (selected.output) {
    const output = path.resolve(selected.output);
    if (!fs.existsSync(path.dirname(output))) throw new Error(`output parent does not exist: ${path.dirname(output)}`);
    fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`, { flag: "wx" });
  }
  if (!quiet) {
    if (selected.json) console.log(JSON.stringify(report));
    else console.log(renderHuman(report));
  }
  return adapter ? (adapterPassed ? 0 : 1) : 0;
}

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args[0] !== "challenge" || args[1] !== "delegated-work") {
    console.error("usage: node scripts/delegated-work-challenge-runner.mjs challenge delegated-work [--pair <pair-id>] [--projection <projection-id|projection.json>] [--adapter <path>] [--output <report.json>] [--json]");
    process.exitCode = 2;
  } else {
    runDelegatedWorkChallenge(args.slice(2)).then((code) => { process.exitCode = code; }).catch((error) => {
      console.error(`kfd delegated-work challenge: ${error.message}`);
      process.exitCode = 2;
    });
  }
}
