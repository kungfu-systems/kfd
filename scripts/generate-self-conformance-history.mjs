// SPDX-License-Identifier: Apache-2.0
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { semanticRoot } from "./self-conformance-contract.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPaths = [
  "profiles/self-conformance/history/historical-lineage.report.json",
  "verifier/fixtures/self-conformance-history/historical-lineage.report.json",
];
const repository = "https://github.com/kungfu-systems/kfd";

const gitJson = (commit, file) => JSON.parse(execFileSync(
  "git", ["show", `${commit}:${file}`], { cwd: root, encoding: "utf8" },
));

const prFacts = {
  146: { head: "8ae3946812effb7cc04c26b7ce396d70abf2eae0", merge: "04f839e8e7834c9eda3d46424de2f59f53623e8f", mergedAt: "2026-07-17T00:52:03Z", reviewCommit: "8ae3946812effb7cc04c26b7ce396d70abf2eae0" },
  159: { head: "31a3227e33453883cdcd874b198d8e3443be75e0", merge: "cbffaf8bbe1c5f012b860798fce756de3cebbc80", mergedAt: "2026-07-17T09:10:11Z", reviewCommit: "31a3227e33453883cdcd874b198d8e3443be75e0" },
  176: { head: "72402ac2a035cb9ff8835f3d2f66d6fd4fe827cd", merge: "d9711c64573fba844aeb43780a8323ee6f901155", mergedAt: "2026-07-18T02:03:26Z", reviewCommit: "72402ac2a035cb9ff8835f3d2f66d6fd4fe827cd" },
  180: { head: "bcecac09397d0f105fe2863ef35eb853def244ac", merge: "8fa0000cf3d1c7ce0802a013a6b5103177b3630e", mergedAt: "2026-07-18T08:31:55Z", reviewCommit: "bcecac09397d0f105fe2863ef35eb853def244ac" },
  186: { head: "56e8fd1081bc1616c6e2cbfaa6b047fbec7cbfae", merge: "1b96f1de9d189ad5a2cac90de0ac2322cab1177f", mergedAt: "2026-07-18T09:57:23Z", reviewCommit: "56e8fd1081bc1616c6e2cbfaa6b047fbec7cbfae" },
  190: { head: "a56a3d3bcaa2889a931b3891d2085496d2760db4", merge: "bca202feb823f9c3234753b05dfd4dff460e69f6", mergedAt: "2026-07-18T16:21:44Z", reviewCommit: "a56a3d3bcaa2889a931b3891d2085496d2760db4", qualificationReviewCommit: "bb6f651480efb165fd15798bd9d0c029821a8f06" },
  225: { head: "d66307c4f985d6036b1d0fb440866903f534d770", merge: "9040c33475e1120c588d6bba780d4bdc0f66a521", mergedAt: "2026-07-21T00:28:43Z", reviewCommit: "d66307c4f985d6036b1d0fb440866903f534d770" },
  230: { head: "8d9d6338afd62e01aac4c776313ba40e44f7700a", merge: "903737e47e047c0d3aedce98fdf3751cbc9b7aab", mergedAt: "2026-07-21T03:05:46Z", reviewCommit: "8d9d6338afd62e01aac4c776313ba40e44f7700a" },
};

const sources = [];
const addSource = ({ id, kind, commit = null, sourcePath, payload, sourceRepository = repository }) => {
  sources.push({
    id,
    kind,
    repository: sourceRepository,
    commit,
    path: sourcePath,
    contentRoot: semanticRoot(payload),
    payload,
  });
};

const addPr = (number) => {
  const facts = prFacts[number];
  addSource({
    id: `pr-${number}-authority`,
    kind: "github-pr",
    commit: facts.head,
    sourcePath: `https://github.com/kungfu-systems/kfd/pull/${number}`,
    payload: { number, url: `https://github.com/kungfu-systems/kfd/pull/${number}`, head: facts.head, merge: facts.merge, mergedAt: facts.mergedAt, author: "dongkeren" },
  });
  addSource({
    id: `pr-${number}-review`,
    kind: "github-pr",
    commit: facts.reviewCommit,
    sourcePath: `https://github.com/kungfu-systems/kfd/pull/${number}/reviews`,
    payload: { number, reviewer: "kungfu-origin", state: "APPROVED", reviewedCommit: facts.reviewCommit, independentFrom: "dongkeren" },
  });
};

for (const number of Object.keys(prFacts).map(Number)) addPr(number);

const alpha28Commit = "04f839e8e7834c9eda3d46424de2f59f53623e8f";
addSource({ id: "alpha28-registry", kind: "git-registry", commit: alpha28Commit, sourcePath: "registry.json", payload: gitJson(alpha28Commit, "registry.json") });
addSource({
  id: "alpha28-package", kind: "npm-package", sourcePath: "npm:@kungfu-tech/kfd@1.0.0-alpha.28",
  sourceRepository: "https://registry.npmjs.org/@kungfu-tech/kfd/1.0.0-alpha.28",
  payload: {
    name: "@kungfu-tech/kfd", version: "1.0.0-alpha.28",
    tarballSha256: "sha256:279cf2adcfe0c5cd9d31ecf0e6317d5a5f2ff854c49c39f7e135ad4e2cc43ce1",
    shasum: "c783cffa29b361f2a6675ceef9d34f2763b7da7e",
    integrity: "sha512-pTNOaJOgsfMehptEFcqhICzuO/c0ZJwrYlZcgLgIbOu2V2c/MDCKOuPXmD/RH1dpIjQ+SfZROuQqsPH5ERlQ/w==",
  },
});
addSource({ id: "kfd7-candidate-registry", kind: "git-registry", commit: prFacts[159].head, sourcePath: "drafts/registry.json", payload: gitJson(prFacts[159].head, "drafts/registry.json") });
addSource({ id: "kfd7-refined-candidates", kind: "git-registry", commit: prFacts[176].head, sourcePath: "drafts/registry.json", payload: gitJson(prFacts[176].head, "drafts/registry.json") });
addSource({ id: "kfd7-numbered-registry", kind: "git-registry", commit: prFacts[180].head, sourcePath: "registry.json", payload: gitJson(prFacts[180].head, "registry.json") });
addSource({ id: "kfd7-qualified-decision", kind: "git-document", commit: prFacts[186].head, sourcePath: "decisions/KFD-7.md", payload: execFileSync("git", ["show", `${prFacts[186].head}:decisions/KFD-7.md`], { cwd: root, encoding: "utf8" }) });
addSource({ id: "kfd7-activation-record", kind: "git-document", commit: prFacts[190].head, sourcePath: "evidence/kfd-7/activation-record.json", payload: gitJson(prFacts[190].head, "evidence/kfd-7/activation-record.json") });
addSource({ id: "kfd7-active-registry", kind: "git-registry", commit: prFacts[190].head, sourcePath: "registry.json", payload: gitJson(prFacts[190].head, "registry.json") });
addSource({
  id: "alpha36-package", kind: "npm-package", sourcePath: "npm:@kungfu-tech/kfd@1.0.0-alpha.36",
  sourceRepository: "https://registry.npmjs.org/@kungfu-tech/kfd/1.0.0-alpha.36",
  payload: {
    name: "@kungfu-tech/kfd", version: "1.0.0-alpha.36", sourceTag: "v1.0.0-alpha.36",
    sourceCommit: "c80a6b19d93d733e872bae6d53d1555aeed0b162",
    tarballSha256: "sha256:ef8a14fb2f7bbb36c09c434589f6a9eae30d47e8ca928774a04072282c44ee32",
    shasum: "6f7d1148484f69b24492e93a1390fd0788834b86",
    integrity: "sha512-SmIE0qf7kHf2g8lIRhigfqoYsO5eHDvJLE3nogXnjAVEFe/uw0jjsDTOx2nPwaq2yC04tHmNtynHj/UcIEb4SA==",
  },
});
addSource({ id: "numbered-drafts-pr225", kind: "git-registry", commit: prFacts[225].head, sourcePath: "registry.json", payload: gitJson(prFacts[225].head, "registry.json") });
addSource({ id: "foundation-revision-admission", kind: "git-document", commit: prFacts[230].head, sourcePath: "docs/foundation-revision-2026-07-21-decision-admission.json", payload: gitJson(prFacts[230].head, "docs/foundation-revision-2026-07-21-decision-admission.json") });
addSource({ id: "foundation-revision-registry", kind: "git-registry", commit: prFacts[230].head, sourcePath: "registry.json", payload: gitJson(prFacts[230].head, "registry.json") });

const terminalRequest = JSON.parse(fs.readFileSync(path.join(root, "evidence/self-conformance/transitions/recursive-normative-self-conformance-terminal.request.json"), "utf8"));
const terminalEntry = terminalRequest.chain.at(-1);
addSource({ id: "no-new-kfd-authority", kind: "git-document", commit: "5791476b226b0ce26f98538704e71f7e29e04956", sourcePath: "evidence/self-conformance/transitions/recursive-normative-self-conformance-terminal.request.json#authorityReceipt", payload: terminalEntry.authorityReceipt });
addSource({ id: "no-new-kfd-review", kind: "git-document", commit: "5791476b226b0ce26f98538704e71f7e29e04956", sourcePath: "evidence/self-conformance/transitions/recursive-normative-self-conformance-terminal.request.json#reviewReceipt", payload: terminalEntry.reviewReceipt });
addSource({ id: "no-new-kfd-report", kind: "git-document", commit: "5791476b226b0ce26f98538704e71f7e29e04956", sourcePath: "evidence/self-conformance/transitions/recursive-normative-self-conformance-terminal.report.json", payload: JSON.parse(fs.readFileSync(path.join(root, "evidence/self-conformance/transitions/recursive-normative-self-conformance-terminal.report.json"), "utf8")) });
const liveAnchor = JSON.parse(fs.readFileSync(path.join(root, "profiles/self-conformance/bootstrap-anchor.json"), "utf8"));
addSource({ id: "self-conformance-live-alpha55-anchor", kind: "git-document", commit: liveAnchor.coordinate.commit, sourcePath: "profiles/self-conformance/bootstrap-anchor.json", payload: liveAnchor });

sources.sort((left, right) => left.id.localeCompare(right.id));

const episode = (sequence, fields) => ({
  sequence,
  terminalAtEvent: true,
  retrospective: true,
  profileAvailableAtEvent: false,
  numberingMappings: [],
  claimBoundary: "This episode replays immutable historical structure only. It does not create contemporaneous Profile execution, semantic truth, lifecycle authority, or a new normative transition.",
  ...fields,
  sourceIds: [...fields.sourceIds].sort(),
});

const episodes = [
  episode(1, { id: "kfd7-candidate-pr159", subjectId: "KFD-7", transition: "candidate-genesis", before: "absent", after: "candidate", sourceIds: ["kfd7-candidate-registry", "pr-159-authority", "pr-159-review"], authoritySourceId: "pr-159-authority", reviewSourceId: "pr-159-review" }),
  episode(2, { id: "kfd7-refinement-pr176", subjectId: "KFD-7", transition: "candidate-refinement", before: "candidate", after: "candidate", sourceIds: ["kfd7-refined-candidates", "pr-176-authority", "pr-176-review"], authoritySourceId: "pr-176-authority", reviewSourceId: "pr-176-review" }),
  episode(3, { id: "kfd7-numbered-draft-pr180", subjectId: "KFD-7", transition: "numbered-draft-promotion", before: "candidate", after: "numbered-draft", sourceIds: ["kfd7-numbered-registry", "pr-180-authority", "pr-180-review"], authoritySourceId: "pr-180-authority", reviewSourceId: "pr-180-review" }),
  episode(4, { id: "kfd7-qualification-pr186", subjectId: "KFD-7", transition: "qualification", before: "numbered-draft", after: "qualified-numbered-draft", sourceIds: ["kfd7-qualified-decision", "pr-186-authority", "pr-186-review"], authoritySourceId: "pr-186-authority", reviewSourceId: "pr-186-review" }),
  episode(5, { id: "kfd7-activation-pr190", subjectId: "KFD-7", transition: "activation", before: "qualified-numbered-draft", after: "active", sourceIds: ["kfd7-activation-record", "kfd7-active-registry", "pr-190-authority", "pr-190-review"], authoritySourceId: "pr-190-authority", reviewSourceId: "pr-190-review" }),
  episode(6, { id: "kfd7-alpha36-packaging", subjectId: "KFD-7", transition: "release-packaging", before: "active", after: "active-packaged", sourceIds: ["alpha36-package", "pr-190-authority", "pr-190-review"], authoritySourceId: "pr-190-authority", reviewSourceId: "pr-190-review" }),
  ...["KFD-8", "KFD-9", "KFD-10"].map((subjectId, offset) => episode(7 + offset, { id: `${subjectId.toLowerCase()}-numbered-draft-pr225`, subjectId, transition: "numbered-draft-observation", before: "absent", after: "numbered-draft", sourceIds: ["numbered-drafts-pr225", "pr-225-authority", "pr-225-review"], authoritySourceId: "pr-225-authority", reviewSourceId: "pr-225-review" })),
  episode(10, { id: "software-responsibility-pre-revision", subjectId: "software-responsibility-transition", transition: "numbered-draft-observation", before: "absent", after: "numbered-draft", sourceIds: ["numbered-drafts-pr225", "pr-225-authority", "pr-225-review"], authoritySourceId: "pr-225-authority", reviewSourceId: "pr-225-review", numberingMappings: [{ from: null, to: "KFD-11@pre-2026-07-21", relation: "historical-number" }] }),
  episode(11, { id: "project-settlement-pre-revision", subjectId: "project-settlement", transition: "numbered-draft-observation", before: "absent", after: "numbered-draft", sourceIds: ["numbered-drafts-pr225", "pr-225-authority", "pr-225-review"], authoritySourceId: "pr-225-authority", reviewSourceId: "pr-225-review", numberingMappings: [{ from: null, to: "KFD-12@pre-2026-07-21", relation: "historical-number" }] }),
  episode(12, { id: "consequential-settlement-foundation-allocation", subjectId: "KFD-11", transition: "foundation-allocation", before: "absent", after: "numbered-draft", sourceIds: ["foundation-revision-admission", "foundation-revision-registry", "pr-230-authority", "pr-230-review"], authoritySourceId: "pr-230-authority", reviewSourceId: "pr-230-review", numberingMappings: [{ from: null, to: "KFD-11", relation: "allocated-by-foundation-revision" }] }),
  episode(13, { id: "software-responsibility-foundation-revision", subjectId: "software-responsibility-transition", transition: "foundation-revision", before: "numbered-draft", after: "foundation-revised-draft", sourceIds: ["foundation-revision-admission", "foundation-revision-registry", "pr-230-authority", "pr-230-review"], authoritySourceId: "pr-230-authority", reviewSourceId: "pr-230-review", numberingMappings: [{ from: "KFD-11@pre-2026-07-21", to: "KFD-12", relation: "renumbered" }] }),
  episode(14, { id: "project-settlement-foundation-revision", subjectId: "project-settlement", transition: "foundation-revision", before: "numbered-draft", after: "foundation-revised-draft", sourceIds: ["foundation-revision-admission", "foundation-revision-registry", "pr-230-authority", "pr-230-review"], authoritySourceId: "pr-230-authority", reviewSourceId: "pr-230-review", numberingMappings: [{ from: "KFD-12@pre-2026-07-21", to: "KFD-13", relation: "renumbered" }] }),
  episode(15, { id: "recursive-candidate-no-new-kfd", subjectId: "kfd-self-conformance-pressure", transition: "no-new-kfd", before: "candidate", after: "no-new-kfd", sourceIds: ["no-new-kfd-authority", "no-new-kfd-report", "no-new-kfd-review"], authoritySourceId: "no-new-kfd-authority", reviewSourceId: "no-new-kfd-review" }),
];

const finalStates = new Map();
for (const entry of episodes) finalStates.set(entry.subjectId, entry.after);
const outcomes = [...finalStates].map(([subjectId, terminalState]) => ({ subjectId, terminalState, normativePromotionClaimed: false }))
  .sort((left, right) => left.subjectId.localeCompare(right.subjectId));
const liveAnchorSource = sources.find(({ id }) => id === "self-conformance-live-alpha55-anchor");

const report = {
  schemaVersion: 1,
  contract: "kfd.self-conformance-historical-replay/v1",
  profile: "kfd-self-conformance@1.0.0-alpha.1",
  reportId: "kfd-history-alpha28-to-live-alpha55",
  retrospective: true,
  profileAvailableAtEvent: false,
  generatedFromImmutableSources: true,
  sources,
  foundation: {
    id: "kfd-alpha28-foundation-cut",
    gitCommit: alpha28Commit,
    gitTag: "v1.0.0-alpha.28",
    packageName: "@kungfu-tech/kfd",
    packageVersion: "1.0.0-alpha.28",
    packageRoot: "sha256:279cf2adcfe0c5cd9d31ecf0e6317d5a5f2ff854c49c39f7e135ad4e2cc43ce1",
    registrySourceId: "alpha28-registry",
    authoritySourceId: "pr-146-authority",
    reviewSourceId: "pr-146-review",
    active: ["KFD-1", "KFD-2", "KFD-3", "KFD-4", "KFD-5"],
    draft: ["KFD-6"],
    absent: ["KFD-7"],
  },
  episodes,
  outcomes,
  convergence: {
    historicalTerminalSourceId: "no-new-kfd-report",
    liveAnchorSourceId: "self-conformance-live-alpha55-anchor",
    liveAnchorId: liveAnchor.anchorId,
    liveAnchorRoot: liveAnchorSource.contentRoot,
    livePackageRoot: liveAnchor.packageRoot,
    compatibility: "additive",
    historicalDoesNotReplaceLive: true,
  },
  claimBoundary: "This report is a later, structural replay over immutable public coordinates. It does not assert that the Profile existed or ran at an event, prove semantic truth, activate a draft, certify an implementation, authorize a release, or replace the alpha.55 live anchor.",
};

const rendered = `${JSON.stringify(report, null, 2)}\n`;
if (process.argv.includes("--write")) {
  for (const relative of outputPaths) {
    const target = path.join(root, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, rendered);
  }
  console.log(`generated ${outputPaths.join(", ")}`);
} else {
  for (const relative of outputPaths) {
    const target = path.join(root, relative);
    if (!fs.existsSync(target) || fs.readFileSync(target, "utf8") !== rendered) {
      throw new Error(`${relative} is stale; run node scripts/generate-self-conformance-history.mjs --write`);
    }
  }
  console.log(`historical Self-Conformance lineage is deterministic (${sources.length} immutable sources, ${episodes.length} episodes)`);
}
