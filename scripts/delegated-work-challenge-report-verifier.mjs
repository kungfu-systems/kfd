#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import {
  PAIR_IDS,
  REPORT_CONTRACT,
  adapterRequests,
  attachAdapterAssertions,
  canonicalJson,
  evaluateAdapterResponses,
  evaluateProjection,
  exactByteRoot,
  loadChallenge,
  normalizeProjection,
  rootReport,
  selectPairs,
  semanticRoot,
  sourceClosure,
} from "./delegated-work-challenge-core.mjs";
import { regularBytes } from "./jsonl-adapter-runner.mjs";

const rootPattern = /^sha256:[0-9a-f]{64}$/u;
const same = (left, right) => canonicalJson(left) === canonicalJson(right);

function exactReportKeys(report, adapterMode) {
  const admitted = [
    "schemaVersion", "contract", "sourceCut", "challenge", "suite", "projection",
    "platform", "execution", "findings", "summary", "claimBoundary", "residualRisks",
    "qualifying", "certification", "reportRoot",
  ];
  if (adapterMode) admitted.push("adapter");
  return Object.keys(report).every((key) => admitted.includes(key)) && admitted.every((key) => Object.hasOwn(report, key));
}

function selectedPairIds(report) {
  const findings = Array.isArray(report?.findings) ? report.findings : [];
  const ids = findings.map(({ pairId }) => pairId);
  if (new Set(ids).size !== ids.length || ids.some((id) => !PAIR_IDS.includes(id))) return null;
  if (ids.length === 1) return ids;
  if (ids.length === PAIR_IDS.length && same(ids, PAIR_IDS)) return ids;
  return null;
}

export function verifyDelegatedWorkChallengeReport(report, { adapterPath } = {}) {
  const challenge = loadChallenge();
  const checks = [];
  const issues = [];
  const check = (id, passed, code, detail) => {
    checks.push({ id, passed, code: passed ? "ok" : code });
    if (!passed) issues.push({ code, detail });
  };
  const adapterMode = Object.hasOwn(report ?? {}, "adapter");
  check("report-contract", report?.schemaVersion === 1 && report?.contract === REPORT_CONTRACT && exactReportKeys(report, adapterMode), "report-contract-invalid", "report must use the exact v1 shape");
  const closure = sourceClosure(challenge);
  check("source-cut", same(report?.sourceCut, closure.sourceCut), "source-cut-drift", "source cut does not match the installed package");
  check("challenge-profile", same(report?.challenge, closure.challenge), "challenge-profile-drift", "challenge manifest or verifier artifact drifted");
  const fixtureRoots = challenge.suite.pairs.map((pair) => ({ pairId: pair.id, root: semanticRoot(pair) }));
  const ids = selectedPairIds(report);
  check("pair-closure", ids !== null, "pair-closure-invalid", "report must contain one known pair or all six fixed pairs exactly once in canonical order");
  check(
    "suite-closure",
    report?.suite?.id === challenge.suite.id &&
      report?.suite?.version === challenge.suite.version &&
      report?.suite?.fixedPairCount === challenge.suite.pairs.length &&
      report?.suite?.selectedPairCount === (ids?.length ?? -1) &&
      report?.suite?.suiteRoot === semanticRoot(challenge.suite) &&
      same(report?.suite?.fixtureRoots, fixtureRoots),
    "suite-root-drift",
    "suite, fixture, pair-count, or fixture-root closure drifted",
  );
  let projection;
  try {
    projection = normalizeProjection(report?.projection?.document, challenge.manifest);
  } catch (error) {
    issues.push({ code: "projection-invalid", detail: error.message });
    checks.push({ id: "projection-contract", passed: false, code: "projection-invalid" });
  }
  if (projection) {
    check("projection-contract", same(projection, report.projection.document) && report.projection.projectionRoot === semanticRoot(projection) && ["packaged", "adopter-supplied"].includes(report.projection.source), "projection-root-drift", "projection document, canonical order, or root drifted");
  }
  let expectedFindings = [];
  let transcript = [];
  let adapterEvaluation;
  if (projection && ids) {
    expectedFindings = evaluateProjection(challenge.suite, projection, ids.length === 1 ? ids[0] : undefined);
    if (adapterMode) {
      const pairs = ids.map((id) => selectPairs(challenge.suite, id)[0]);
      const requests = adapterRequests(challenge, pairs);
      transcript = Array.isArray(report?.execution?.transcript) ? report.execution.transcript : [];
      const responses = transcript.map((entry) => entry?.response);
      try {
        check("transcript-requests", transcript.length === requests.length && transcript.every((entry, index) => same(entry?.request, requests[index])), "transcript-request-drift", "adapter transcript requests drifted from the fixed worlds");
        adapterEvaluation = evaluateAdapterResponses(challenge, pairs, requests, responses);
        expectedFindings = attachAdapterAssertions(expectedFindings, adapterEvaluation.assertions);
        check(
          "adapter-identity",
          report?.adapter?.id === adapterEvaluation.adapter.id &&
            report?.adapter?.version === adapterEvaluation.adapter.version &&
            rootPattern.test(report?.adapter?.artifactDigest ?? "") &&
            same(report?.adapter?.handshake, adapterEvaluation.handshake) &&
            report?.adapter?.handshakeRoot === semanticRoot(adapterEvaluation.handshake),
          "adapter-binding-drift",
          "adapter identity, handshake, or declared artifact binding drifted",
        );
      } catch (error) {
        issues.push({ code: "adapter-transcript-invalid", detail: error.message });
        checks.push({ id: "adapter-transcript", passed: false, code: "adapter-transcript-invalid" });
      }
    }
  }
  check("finding-closure", same(report?.findings, expectedFindings), "finding-closure-drift", "projected states, roots, expected outcomes, findings, or adapter assertions drifted");
  const collapsed = expectedFindings.filter(({ collision }) => collision).length;
  const adapterPassed = adapterEvaluation?.assertions.length > 0 && adapterEvaluation.assertions.every(({ semanticPass }) => semanticPass);
  const expectedSummary = {
    total: expectedFindings.length,
    collapsed,
    informationDistinguishable: expectedFindings.length - collapsed,
    semanticFinding: collapsed > 0 ? "COLLAPSED" : "INFORMATION-DISTINGUISHABLE",
    adapterDeclaredEnforcement: adapterMode ? (adapterPassed ? "safety-and-liveness-satisfied" : "not-satisfied") : "not-tested",
  };
  check("summary-closure", same(report?.summary, expectedSummary), "summary-drift", "semantic summary drifted from recomputed findings");
  check(
    "execution-closure",
    report?.execution?.runnerExecution === "success" &&
      report?.execution?.reportValidity === "valid" &&
      report?.execution?.offline === true &&
      report?.execution?.mode === (adapterMode ? "adapter" : "projection") &&
      report?.execution?.requestCount === (adapterMode ? transcript.length : 0) &&
      same(report?.execution?.transcript, adapterMode ? transcript : []) &&
      report?.execution?.transcriptRoot === (adapterMode ? semanticRoot(transcript) : null) &&
      report?.execution?.resultRoot === semanticRoot(expectedFindings),
    "execution-closure-drift",
    "runner, result, or transcript closure drifted",
  );
  check("platform", typeof report?.platform?.os === "string" && typeof report?.platform?.arch === "string" && /^node-/.test(report?.platform?.runtime ?? "") && Object.keys(report?.platform ?? {}).length === 3, "platform-invalid", "platform shape is invalid");
  check("claim-boundary", same(report?.claimBoundary, challenge.manifest.claimBoundary) && same(report?.residualRisks, challenge.manifest.residualRisks), "scope-widening", "claim boundary or residual risks were changed");
  check("authority-boundary", report?.qualifying === false && report?.certification === false, "scope-widening", "qualification or certification scope was widened");
  check("report-root", report?.reportRoot === rootReport(report), "report-root-drift", "report root does not recompute");
  if (adapterPath) {
    check("adapter-artifact", adapterMode && report?.adapter?.artifactDigest === exactByteRoot(regularBytes(path.resolve(adapterPath))), "adapter-artifact-digest-mismatch", "adapter bytes do not match the report");
  }
  const valid = issues.length === 0;
  return {
    schemaVersion: 1,
    contract: "kfd.delegated-work-challenge-report-verifier/v1",
    valid,
    dimensions: {
      runnerExecution: report?.execution?.runnerExecution === "success",
      reportValidity: valid,
      semanticFinding: expectedSummary.semanticFinding,
      informationDistinguishable: expectedSummary.informationDistinguishable,
      adapterDeclaredEnforcement: expectedSummary.adapterDeclaredEnforcement,
      certification: false,
      qualification: false,
    },
    reportDigest: semanticRoot(report),
    adapterArtifactChecked: Boolean(adapterPath),
    checks,
    issues,
  };
}

export function runDelegatedWorkChallengeReportVerifier(args) {
  let reportPath;
  let adapterPath;
  let outputPath;
  let json = false;
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === "--json") json = true;
    else if (args[index] === "--adapter" && args[index + 1]) adapterPath = args[++index];
    else if (args[index] === "--output" && args[index + 1]) outputPath = args[++index];
    else if (!reportPath && !args[index].startsWith("--")) reportPath = args[index];
    else throw new Error(`unsupported or incomplete argument: ${args[index]}`);
  }
  if (!reportPath) throw new Error("delegated-work challenge report verification requires a report path");
  const report = JSON.parse(regularBytes(path.resolve(reportPath)).toString("utf8"));
  const result = verifyDelegatedWorkChallengeReport(report, { adapterPath });
  if (outputPath) fs.writeFileSync(path.resolve(outputPath), `${JSON.stringify(result, null, 2)}\n`, { flag: "wx" });
  if (json) console.log(JSON.stringify(result));
  else console.log([
    `Runner execution: ${result.dimensions.runnerExecution ? "success" : "invalid"}`,
    `Report validity: ${result.valid ? "valid" : "invalid"}`,
    `Semantic finding: ${result.dimensions.semanticFinding}`,
    `Information distinguishability: ${result.dimensions.informationDistinguishable}`,
    `Adapter-declared enforcement: ${result.dimensions.adapterDeclaredEnforcement}`,
    "Authority: qualifying=false; certification=false",
  ].join("\n"));
  return result.valid ? 0 : 1;
}

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args[0] !== "verify" || args[1] !== "delegated-work-challenge-report") {
    console.error("usage: node scripts/delegated-work-challenge-report-verifier.mjs verify delegated-work-challenge-report <report.json> [--adapter <path>] [--json]");
    process.exitCode = 2;
  } else {
    try {
      process.exitCode = runDelegatedWorkChallengeReportVerifier(args.slice(2));
    } catch (error) {
      console.error(`kfd delegated-work verifier: ${error.message}`);
      process.exitCode = 2;
    }
  }
}
