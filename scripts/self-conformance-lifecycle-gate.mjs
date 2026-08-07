// SPDX-License-Identifier: Apache-2.0
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  PROFILE,
  ROOT_PATTERN,
  canonicalJson,
  exactByteRoot,
  semanticRoot,
} from "./self-conformance-contract.mjs";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(packageRoot, relative), "utf8"));
const policy = readJson("profiles/self-conformance/lifecycle-gates.json");
const manifest = readJson("profiles/self-conformance/manifest.json");
const bootstrapAnchor = readJson("profiles/self-conformance/bootstrap-anchor.json");
const installedPackageRoot = semanticRoot(manifest);
const installedVerifierRoot = exactByteRoot(fs.readFileSync(path.join(packageRoot, policy.verifier.path)));
const NON_PROMOTION = new Set(policy.nonPromotionTransitions);

function compareUtf8(left, right) {
  return Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
}

function sortedUnique(values) {
  return Array.isArray(values)
    && new Set(values).size === values.length
    && values.every((value, index) => index === 0 || compareUtf8(values[index - 1], value) < 0);
}

function exactFields(value, fields) {
  return value !== null
    && typeof value === "object"
    && !Array.isArray(value)
    && Object.keys(value).length === fields.length
    && Object.keys(value).every((field) => fields.includes(field));
}

function issue(code, issuePath, message) {
  return { code, path: issuePath, message };
}

function issueOrder(left, right) {
  return compareUtf8(
    `${left.code}\0${left.path}\0${left.message}`,
    `${right.code}\0${right.path}\0${right.message}`,
  );
}

function check(id, status) {
  return { id, status: status ? "pass" : "fail" };
}

function receiptMatchesBundle(receipt, bundle) {
  return receipt?.transition === bundle.transition
    && receipt?.previousStateRoot === bundle.previousStateRoot
    && receipt?.proposedStateRoot === bundle.proposedStateRoot;
}

function verifyTransition(bundle, temporary, index) {
  const inputPath = path.join(temporary, `bundle-${String(index).padStart(3, "0")}.json`);
  fs.writeFileSync(inputPath, `${JSON.stringify(bundle, null, 2)}\n`, { flag: "wx" });
  const result = spawnSync(
    process.execPath,
    [path.join(packageRoot, "bin/kfd.mjs"), "verify", "self-conformance-transition", inputPath, "--json"],
    { cwd: packageRoot, encoding: "utf8", env: { ...process.env, npm_config_offline: "true" } },
  );
  let report;
  try {
    report = JSON.parse(result.stdout);
  } catch {
    return {
      report: null,
      issue: issue("scg-verifier-execution-failed", `/chain/${index}/bundle`, result.stderr.trim() || "Independent verifier did not return JSON."),
    };
  }
  if (![0, 1].includes(result.status)) {
    return {
      report,
      issue: issue("scg-verifier-execution-failed", `/chain/${index}/bundle`, result.stderr.trim() || `Independent verifier exited ${result.status}.`),
    };
  }
  return { report, issue: null };
}

function baseReport(request) {
  return {
    schemaVersion: 1,
    contract: "kfd.self-conformance-lifecycle-gate-report/v1",
    profile: PROFILE,
    gateId: typeof request?.gateId === "string" ? request.gateId : "invalid-request",
    lifecyclePath: typeof request?.lifecyclePath === "string" ? request.lifecyclePath : "invalid",
    requestRoot: semanticRoot(request ?? {}),
    fixedPackageRoot: ROOT_PATTERN.test(request?.fixedPackageRoot ?? "")
      ? request.fixedPackageRoot
      : installedPackageRoot,
    terminalBundleRoot: null,
    terminalReportRoot: null,
    valid: false,
    outcome: "blocked",
    transitionAdmissible: false,
    automaticTransition: false,
    verifierNecessary: true,
    verifierSufficient: false,
    humanApproved: false,
    releaseAuthorized: false,
    numberAllocated: false,
    statusChanged: false,
    chain: [],
    counterevidenceRoots: Array.isArray(request?.counterevidenceRoots) ? request.counterevidenceRoots : [],
    checks: [],
    issues: [],
    offline: true,
  };
}

export function verifyLifecycleGate(request) {
  const output = baseReport(request);
  const issues = [];
  const checks = new Map();
  const mark = (id, ok) => checks.set(id, (checks.get(id) ?? true) && ok);

  const requestContract = exactFields(request, [
    "schemaVersion",
    "contract",
    "profile",
    "gateId",
    "lifecyclePath",
    "fixedPackageRoot",
    "expectedTerminalBundleRoot",
    "chain",
    "counterevidenceRoots",
  ]) && request?.schemaVersion === 1
    && request?.contract === "kfd.self-conformance-lifecycle-gate-request/v1"
    && request?.profile === PROFILE;
  mark("request-contract", requestContract);
  if (!requestContract) issues.push(issue("scg-request-invalid", "", "Unsupported lifecycle gate request contract or profile."));

  const pathPolicy = policy.paths.find(({ id }) => id === request?.lifecyclePath);
  mark("lifecycle-path", Boolean(pathPolicy));
  if (!pathPolicy) issues.push(issue("scg-path-unsupported", "/lifecyclePath", "The lifecycle path is not published by this profile."));

  const packageMatch = request?.fixedPackageRoot === installedPackageRoot;
  mark("fixed-package-root", packageMatch);
  if (!packageMatch) {
    issues.push(issue(
      "scg-verifier-package-substitution",
      "/fixedPackageRoot",
      "The request does not bind the exact installed Self-Conformance package manifest root.",
    ));
  }

  const counterevidenceValid = sortedUnique(request?.counterevidenceRoots ?? []);
  mark("counterevidence-roots", counterevidenceValid);
  if (!counterevidenceValid) {
    issues.push(issue("scg-counterevidence-order-invalid", "/counterevidenceRoots", "Counterevidence roots must be UTF-8 sorted and unique."));
  }

  if (!Array.isArray(request?.chain) || request.chain.length === 0) {
    mark("transition-chain", false);
    issues.push(issue("scg-transition-evidence-absent", "/chain", "At least one complete transition entry is required."));
  } else {
    mark("transition-chain", true);
    const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "kfd-self-conformance-lifecycle-"));
    try {
      let previous = null;
      for (const [index, entry] of request.chain.entries()) {
        const bundle = entry?.bundle;
        const entryShape = exactFields(entry, [
          "bundle",
          "authorityReceipt",
          "reviewReceipt",
          "packageRoot",
          "expectedBundleRoot",
          "expectedReportRoot",
        ]);
        mark("chain-entry-contract", entryShape);
        if (!entryShape) {
          issues.push(issue("scg-request-invalid", `/chain/${index}`, "A chain entry has missing or unknown fields."));
        }
        let bundleRoot = null;
        let reportRoot = null;
        let verifierReport = null;
        try {
          bundleRoot = semanticRoot(bundle);
        } catch (error) {
          issues.push(issue("scg-request-invalid", `/chain/${index}/bundle`, error.message));
        }
        const bundleRootMatches = bundleRoot !== null && entry.expectedBundleRoot === bundleRoot;
        mark("exact-bundle-roots", bundleRootMatches);
        if (!bundleRootMatches) {
          issues.push(issue("scg-entry-root-mismatch", `/chain/${index}/expectedBundleRoot`, "The retained bundle root does not recompute."));
        }

        if (bundle) {
          const verified = verifyTransition(bundle, temporary, index);
          verifierReport = verified.report;
          if (verified.issue) issues.push(verified.issue);
          if (verifierReport) {
            reportRoot = semanticRoot(verifierReport);
            const reportMatches = entry.expectedReportRoot === reportRoot;
            mark("exact-report-roots", reportMatches);
            if (!reportMatches) {
              issues.push(issue("scg-entry-report-root-mismatch", `/chain/${index}/expectedReportRoot`, "The retained verifier report root does not recompute."));
            }
            mark("independent-transition-verifier", verifierReport.valid === true);
            if (!verifierReport.valid) issues.push(...verifierReport.issues);
          } else mark("independent-transition-verifier", false);
        }

        const verifierRootMatches = bundle?.verifierRoot === installedVerifierRoot;
        mark("exact-verifier-root", verifierRootMatches);
        if (!verifierRootMatches) {
          issues.push(issue("scg-verifier-root-mismatch", `/chain/${index}/bundle/verifierRoot`, "The bundle does not bind the installed independent verifier bytes."));
        }

        const authorityRoot = entry?.authorityReceipt ? semanticRoot(entry.authorityReceipt) : null;
        const authorityShape = exactFields(entry?.authorityReceipt, [
          "schemaVersion",
          "contract",
          "receiptId",
          "lifecyclePath",
          "transition",
          "previousStateRoot",
          "proposedStateRoot",
          "role",
          "decision",
          "actor",
          "claimBoundary",
        ])
          && entry.authorityReceipt.schemaVersion === 1
          && entry.authorityReceipt.contract === "kfd.self-conformance-lifecycle-authority-receipt/v1";
        mark("authority-receipt-contract", authorityShape);
        if (!authorityShape) {
          issues.push(issue("scg-request-invalid", `/chain/${index}/authorityReceipt`, "Authority receipt contract is missing, unsupported, or open."));
        }
        const authorityRootMatches = authorityRoot !== null && authorityRoot === bundle?.authorityReceiptRoot;
        mark("authority-receipt-root", authorityRootMatches);
        if (!authorityRootMatches) {
          issues.push(issue("scg-authority-root-mismatch", `/chain/${index}/authorityReceipt`, "The supplied authority receipt does not match the bundle root role."));
        }
        const authorityCoordinates = receiptMatchesBundle(entry?.authorityReceipt, bundle);
        mark("authority-receipt-coordinates", authorityCoordinates);
        if (!authorityCoordinates) {
          issues.push(issue("scg-authority-coordinate-mismatch", `/chain/${index}/authorityReceipt`, "Authority receipt transition and state roots must match the bundle."));
        }
        const entryPathPolicy = policy.paths.find(({ id }) => id === entry?.authorityReceipt?.lifecyclePath);
        const entryAuthorityAllowed = Boolean(
          entryPathPolicy?.transitions.includes(bundle?.transition)
          && entryPathPolicy.authorityRoles.includes(entry?.authorityReceipt?.role)
          && entryPathPolicy.decisions.includes(entry?.authorityReceipt?.decision),
        );
        mark("authority-role", entryAuthorityAllowed);
        if (!entryAuthorityAllowed) {
          issues.push(issue("scg-authority-role-invalid", `/chain/${index}/authorityReceipt`, "The authority role or decision is outside the published policy for this entry."));
        }

        if (!entry?.reviewReceipt) {
          mark("independent-review-receipt", false);
          issues.push(issue("scg-review-receipt-missing", `/chain/${index}/reviewReceipt`, "An independent review receipt is required."));
        } else {
          const reviewShape = exactFields(entry.reviewReceipt, [
            "schemaVersion",
            "contract",
            "receiptId",
            "transition",
            "previousStateRoot",
            "proposedStateRoot",
            "author",
            "reviewer",
            "independent",
            "verdict",
            "claimBoundary",
          ])
            && entry.reviewReceipt.schemaVersion === 1
            && entry.reviewReceipt.contract === "kfd.self-conformance-lifecycle-review-receipt/v1";
          const reviewRootMatches = semanticRoot(entry.reviewReceipt) === bundle?.reviewReceiptRoot;
          const reviewCoordinates = receiptMatchesBundle(entry.reviewReceipt, bundle);
          const reviewIndependent = entry.reviewReceipt.independent === true
            && entry.reviewReceipt.author !== entry.reviewReceipt.reviewer;
          mark("review-receipt-root", reviewRootMatches);
          mark("review-receipt-contract", reviewShape);
          mark("review-receipt-coordinates", reviewCoordinates);
          mark("independent-review-receipt", reviewIndependent);
          if (!reviewRootMatches) issues.push(issue("scg-review-root-mismatch", `/chain/${index}/reviewReceipt`, "The supplied review receipt does not match the bundle root role."));
          if (!reviewShape) issues.push(issue("scg-request-invalid", `/chain/${index}/reviewReceipt`, "Review receipt contract is missing, unsupported, or open."));
          if (!reviewCoordinates) issues.push(issue("scg-review-coordinate-mismatch", `/chain/${index}/reviewReceipt`, "Review receipt transition and state roots must match the bundle."));
          if (!reviewIndependent) issues.push(issue("scg-review-not-independent", `/chain/${index}/reviewReceipt`, "Reviewer and author must be distinct and independence must be explicit."));
        }

        const packageRootValid = ROOT_PATTERN.test(entry?.packageRoot ?? "");
        mark("entry-package-root", packageRootValid);
        if (!packageRootValid) {
          issues.push(issue("scg-request-invalid", `/chain/${index}/packageRoot`, "Every chain entry requires one exact package root."));
        }

        if (index === 0) {
          const bootstrapValid = bundle?.predecessor?.kind === "bootstrap"
            && bundle.predecessor.bootstrapAnchorRoot === semanticRoot(bootstrapAnchor)
            && bundle.predecessor.packageRoot === bootstrapAnchor.packageRoot
            && bundle.previousStateRoot === bootstrapAnchor.stateRoot;
          mark("bootstrap-anchor", bootstrapValid);
          if (!bootstrapValid) {
            issues.push(issue("scg-predecessor-chain-invalid", `/chain/${index}/bundle/predecessor`, "The first entry must begin at the published bootstrap anchor."));
          }
        } else {
          const predecessorRoots = bundle?.predecessor?.kind === "report"
            && bundle.predecessor.reportRoot === previous.reportRoot
            && bundle.predecessor.packageRoot === previous.packageRoot;
          mark("predecessor-roots", predecessorRoots);
          if (!predecessorRoots) {
            issues.push(issue("scg-predecessor-stale", `/chain/${index}/bundle/predecessor`, "Predecessor report or package root does not match the preceding chain entry."));
          }
          const stateContinuity = bundle?.previousStateRoot === previous.proposedStateRoot
            && canonicalJson(bundle?.previousState) === canonicalJson(previous.proposedState);
          mark("predecessor-state", stateContinuity);
          if (!stateContinuity) {
            issues.push(issue("scg-predecessor-chain-invalid", `/chain/${index}/bundle/previousState`, "The predecessor state is not the exact prior proposed state."));
          }
        }

        output.chain.push({
          index,
          transition: bundle?.transition ?? null,
          bundleRoot,
          reportRoot,
          packageRoot: entry?.packageRoot ?? null,
          authorityReceiptRoot: authorityRoot,
          reviewReceiptRoot: entry?.reviewReceipt ? semanticRoot(entry.reviewReceipt) : null,
          verifierValid: verifierReport?.valid === true,
        });
        previous = {
          reportRoot,
          packageRoot: entry?.packageRoot,
          proposedState: bundle?.proposedState,
          proposedStateRoot: bundle?.proposedStateRoot,
        };
      }
    } finally {
      fs.rmSync(temporary, { recursive: true, force: true });
    }

    const terminalEntry = request.chain.at(-1);
    const terminal = output.chain.at(-1);
    output.terminalBundleRoot = terminal?.bundleRoot ?? null;
    output.terminalReportRoot = terminal?.reportRoot ?? null;
    const terminalRootMatches = output.terminalBundleRoot === request.expectedTerminalBundleRoot;
    mark("terminal-bundle-root", terminalRootMatches);
    if (!terminalRootMatches) {
      issues.push(issue("scg-terminal-root-mismatch", "/expectedTerminalBundleRoot", "The requested terminal bundle root does not recompute."));
    }

    const transitionAllowed = Boolean(pathPolicy?.transitions.includes(terminalEntry?.bundle?.transition));
    mark("path-transition", transitionAllowed);
    if (!transitionAllowed) {
      issues.push(issue("scg-path-transition-mismatch", "/lifecyclePath", "The terminal transition is not allowed for this lifecycle path."));
    }
  }

  output.issues = issues.sort(issueOrder);
  output.checks = [...checks.entries()].map(([id, ok]) => check(id, ok)).sort((left, right) => compareUtf8(left.id, right.id));
  output.valid = output.issues.length === 0 && output.checks.every(({ status }) => status === "pass");
  const terminalTransition = request?.chain?.at(-1)?.bundle?.transition;
  output.outcome = output.valid
    ? (NON_PROMOTION.has(terminalTransition) ? "non-promotion" : "proceed")
    : "blocked";
  output.transitionAdmissible = output.valid && output.outcome === "proceed";
  return output;
}

export function runSelfConformanceLifecycleGate(args) {
  let input;
  let outputPath;
  let json = false;
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === "--json") json = true;
    else if (args[index] === "--output" && args[index + 1]) outputPath = args[++index];
    else if (!input) input = args[index];
    else throw new Error(`unsupported or incomplete argument: ${args[index]}`);
  }
  if (!input) throw new Error("self-conformance lifecycle gate requires a request JSON path");
  const request = JSON.parse(fs.readFileSync(path.resolve(input), "utf8"));
  const report = verifyLifecycleGate(request);
  const rendered = `${JSON.stringify(report, null, 2)}\n`;
  if (outputPath) fs.writeFileSync(path.resolve(outputPath), rendered, { flag: "wx" });
  if (json || !outputPath) process.stdout.write(rendered);
  else console.log(`KFD Self-Conformance lifecycle gate: ${report.outcome} -> ${path.resolve(outputPath)}`);
  return report.valid ? 0 : 1;
}

export const lifecycleGateEnvironment = {
  installedPackageRoot,
  installedVerifierRoot,
  policy,
};
