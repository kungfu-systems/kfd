import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";

const README_PATH = "README.md";
const FOUNDATION_PATH = "docs/foundation.md";
const LOAD_BEARING_PATH = "docs/load-bearing-dogfood.md";
const TERMINOLOGY_PATH = "docs/terminology.md";
const TERMINOLOGY_CONTRACT_PATH = "terminology.json";
const FORMAL_PATH = "docs/formal-model.md";
const CASES_PATH = "docs/primitive-discovery-cases.md";
const REGISTRY_PATH = "registry.json";
const CANDIDATE_INDEX_PATH = "drafts/README.md";
const CANDIDATE_REGISTRY_PATH = "drafts/registry.json";
const STANDARDS_PATH = "standards.json";
const ACTIVATION_CONTRACTS_PATH = "activation-contracts.json";
const LIVE_CASE_REGISTRY_PATH = "cases/registry.json";
const AGENT_HUB_PROFILE_PATH = "profiles/agent-hub/README.md";
const AGENT_HUB_GUIDE_PATH = "profiles/agent-hub/implementer-guide.md";
const AGENT_HUB_CAPABILITIES_PATH = "profiles/agent-hub/cli-capabilities.json";
const AGENT_HUB_MANIFEST_PATH = "profiles/agent-hub/manifest.json";
const INDEPENDENT_VERIFIER_PATH = "docs/independent-verifier.md";
const SEMANTIC_MATRIX_PATH = "evidence/semantic-self-sufficiency/kfd-1-13.json";
const SEMANTIC_MATRIX_SCHEMA_PATH = "schemas/kfd-semantic-self-sufficiency-matrix.schema.json";
const WARRANT_MANIFEST_PATH = "profiles/warrant-evidence/manifest.json";
const FIRST_WAVE_REPORT_PATH = "evidence/primitive-evidence/first-wave-report.json";
const SECOND_WAVE_REPORT_PATH = "evidence/primitive-evidence/second-wave-report.json";
const SELF_CONFORMANCE_PROFILE_PATH = "profiles/self-conformance/README.md";
const SELF_CONFORMANCE_IMPLEMENTER_GUIDE_PATH = "profiles/self-conformance/implementer-guide.md";
const SELF_CONFORMANCE_MANIFEST_PATH = "profiles/self-conformance/manifest.json";
const SELF_CONFORMANCE_LIFECYCLE_GATES_PATH = "profiles/self-conformance/lifecycle-gates.json";
const SELF_CONFORMANCE_VERIFIER_MATRIX_PATH = "profiles/self-conformance/lifecycle-gate-matrix.json";
const SELF_CONFORMANCE_ISSUE_CODES_PATH = "profiles/self-conformance/issue-codes.json";
const SELF_CONFORMANCE_HISTORY_PATH = "profiles/self-conformance/history/historical-lineage.report.json";
const SELF_CONFORMANCE_HISTORY_GUIDE_PATH = "profiles/self-conformance/history/README.md";
const SELF_CONFORMANCE_HISTORY_IMPLEMENTER_PATH = "profiles/self-conformance/history/implementer-guide.md";
const SELF_CONFORMANCE_HISTORY_MANIFEST_PATH = "profiles/self-conformance/history/manifest.json";
const RECURSIVE_SELF_CONFORMANCE_ID = "recursive-normative-self-conformance";
const RECURSIVE_ASSESSMENT_PATH = "evidence/self-conformance/qualification/recursive-normative-self-conformance.assessment.json";
const RECURSIVE_VERIFICATION_PATH = "evidence/self-conformance/qualification/recursive-normative-self-conformance.verification.json";
const RECURSIVE_TERMINAL_REPORT_PATH = "evidence/self-conformance/transitions/recursive-normative-self-conformance-terminal.report.json";
const KFD_RELEASE_PATH = "kfd.release.json";
const SITE_BUNDLE_PATH = "site/kfd-site.json";

const normalizeLines = (value) => String(value || "").replace(/\r\n/g, "\n").trim();

const stripFrontmatter = (value) => normalizeLines(value).replace(/^---\n[\s\S]*?\n---\n+/, "");

const paragraphBlocks = (markdown) => normalizeLines(markdown)
  .split(/\n{2,}/)
  .map((block) => block.replace(/\n/g, " ").trim())
  .filter(Boolean);

const stripInlineCode = (value) => String(value || "").replace(/`([^`]+)`/g, "$1");

const parseReadme = (markdown) => {
  const content = normalizeLines(markdown);
  const titleMatch = content.match(/^#\s+(.+)$/m);
  if (!titleMatch) throw new Error("README.md must start with an H1 title");

  const sections = {};
  const headingPattern = /^##\s+(.+)$/gm;
  const headings = [];
  let match;
  while ((match = headingPattern.exec(content))) {
    headings.push({ title: match[1], index: match.index, bodyStart: headingPattern.lastIndex });
  }
  for (let index = 0; index < headings.length; index += 1) {
    const current = headings[index];
    const next = headings[index + 1];
    sections[current.title] = content.slice(current.bodyStart, next ? next.index : content.length).trim();
  }

  const intro = content.slice(titleMatch[0].length, headings[0]?.index ?? content.length).trim();
  return {
    title: titleMatch[1].trim(),
    intro,
    sections,
  };
};

const introLead = (intro) => {
  const blocks = paragraphBlocks(intro);
  return {
    lead: blocks[0] || "",
    decisionKinds: blocks.find((block) => block.startsWith("KFDs can be ")) || "",
  };
};

const parseFuturePicture = (intro) => {
  const blocks = paragraphBlocks(intro);
  return {
    heading: "Core question",
    question: blocks[0] || "",
    engineeringAnswer: blocks[1] || "",
    claimBoundary: blocks[2] || "",
    // Compatibility aliases for schemaVersion 2 renderers.
    pastToFuture: blocks[0] || "",
    kungfuPath: blocks[1] || "",
  };
};

const parseFoundationTriad = (markdown) => {
  const code = markdown.match(/```text\n([\s\S]*?)\n```/);
  if (!code) throw new Error("Foundation triad must include a text code block");
  const before = markdown.slice(0, code.index).trim();
  const after = markdown.slice((code.index ?? 0) + code[0].length).trim();
  const commitments = code[1].split("\n").map((line) => {
    const item = line.match(/^(KFD-[0-9]+):\s+(.+)$/);
    if (!item) throw new Error(`invalid foundation triad line: ${line}`);
    return { id: item[1], text: item[2] };
  });
  const links = [...after.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)].map((link) => ({
    label: link[1],
    sourceTarget: link[2],
    url: link[2] === FOUNDATION_PATH
      ? "/foundation"
      : link[2] === LOAD_BEARING_PATH
        ? "/under-load"
      : link[2] === FORMAL_PATH
        ? "/formal"
      : link[2] === CASES_PATH
        ? "/cases"
        : link[2],
  }));
  return {
    heading: "Foundation triad",
    intro: paragraphBlocks(before)[0] || "",
    commitments,
    summary: paragraphBlocks(after)[0] || "",
    links,
  };
};

const parseIndependentImplementation = (markdown, capabilities, releaseAnchor) => {
  const promise = markdown.match(/\*\*(Implement KFD without Kungfu —[\s\S]*?verify it offline\.)\*\*/)?.[1]
    .replace(/\n/g, " ");
  if (!promise) throw new Error("independent implementation section must expose the exact bold promise");
  const commandBlock = markdown.match(/```bash\n([\s\S]*?)\n```/);
  if (!commandBlock) throw new Error("independent implementation section must include a bash command block");
  const commands = commandBlock[1].split("\n").map((line) => line.trim()).filter(Boolean);
  if (commands.length !== 3) throw new Error("independent implementation section must expose exactly three commands");
  const version = releaseAnchor.npmVersion;
  if (!commands.every((command) => command.includes(`@kungfu-tech/kfd@${version}`))) {
    throw new Error("independent implementation commands must pin the exact release anchor version");
  }
  const blocks = paragraphBlocks(markdown);
  const boundary = (needle, message) => {
    const value = blocks.find((block) => block.includes(needle));
    if (!value) throw new Error(message);
    return value;
  };
  const links = [...markdown.matchAll(/\[([^\]]+)\]\((\/(?:agent-hub|verify)\/)\)/g)]
    .map((match) => ({
      id: match[2] === "/agent-hub/" ? "agent-hub" : "verify",
      label: match[1],
      url: match[2],
    }));
  if (links.length !== 2) throw new Error("independent implementation section must link /agent-hub/ and /verify/");
  return {
    label: "Implement and verify KFD independently",
    promise,
    release: {
      package: releaseAnchor.npmPackage,
      version,
      anchor: KFD_RELEASE_PATH,
      immutable: true,
    },
    supportedLanguages: [
      { id: "python", label: "Python", starter: "adapter.py" },
      { id: "rust", label: "Rust", starter: "target/release/kfd-agent-hub-rust-starter" },
      { id: "node", label: "Node.js", starter: "adapter.mjs" },
      { id: "cpp", label: "C++", starter: "build/kfd-agent-hub-cpp-starter" },
    ],
    steps: [
      { id: "scaffold", label: "Scaffold", command: commands[0], capability: capabilities.commands.scaffold },
      { id: "test", label: "Test Hub 20", command: commands[1], capability: capabilities.commands.test },
      { id: "verify", label: "Verify offline", command: commands[2], capability: capabilities.commands.verify },
    ],
    links,
    starterBoundary: boundary("deterministic, fail-closed starter", "independent implementation section must preserve the starter boundary"),
    offlineBoundary: boundary("Package acquisition is separate", "independent implementation section must preserve the offline boundary"),
    claimBoundary: boundary("do not certify", "independent implementation section must preserve the non-certifying boundary"),
  };
};

const parseMarkdownTable = (markdown) => {
  const rows = markdown.split("\n").filter((line) => line.trim().startsWith("|"));
  if (rows.length < 3) return [];
  return rows.slice(2).map((row) => row.trim().replace(/^\||\|$/g, "").split("|").map((cell) => stripInlineCode(cell.trim())))
    .filter((cells) => cells.length >= 4)
    .map(([layer, decision, readerQuestion, commitment]) => ({
      layer,
      decision,
      readerQuestion,
      commitment,
    }));
};

const parseFoundation = (markdown) => {
  const chainMatch = markdown.match(/```text\n([\s\S]*?)\n```/);
  if (!chainMatch) throw new Error("KFD Foundation must include the chain text code block");
  const beforeChain = markdown.slice(0, chainMatch.index).trim();
  const afterChain = markdown.slice((chainMatch.index ?? 0) + chainMatch[0].length).trim();
  return {
    heading: "Foundation structure",
    intro: paragraphBlocks(beforeChain)[0] || "",
    layers: parseMarkdownTable(beforeChain),
    chain: chainMatch[1].trim(),
    explanation: paragraphBlocks(afterChain),
  };
};

const parseProductWitness = (markdown) => {
  const blocks = paragraphBlocks(markdown);
  return {
    heading: "Load-bearing product witness",
    principle: blocks[0] || "",
    explanation: blocks.slice(1),
  };
};

const parsePracticeGuidelines = (markdown) => ({
  heading: "Practice guidelines",
  intro: paragraphBlocks(markdown)[0] || "",
  guidelines: parseMarkdownTable(markdown),
  explanation: paragraphBlocks(markdown).slice(1),
});

const parseProductProofPath = (markdown) => ({
  heading: "Product proof path",
  body: paragraphBlocks(markdown)[0] || "",
  independentVerification: {
    label: "Implement and verify KFD independently",
    sourcePath: INDEPENDENT_VERIFIER_PATH,
    url: "/verify",
    note: "Start from an immutable package cut; inspect the coverage matrix, package-only verifier, fixed vectors, outcomes, and explicit gaps.",
  },
});

const usagePathForEntry = (entry) => `docs/KFD-${entry.number}-usage.md`;
const usageUrlForEntry = (entry) => `${entry.url}/usage`;

const buildUsagePages = (entries) => entries.map((entry) => {
  const usagePath = usagePathForEntry(entry);
  return {
    id: `${entry.id}-usage`,
    decisionId: entry.id,
    decisionNumber: entry.number,
    parentPath: entry.path,
    parentUrl: entry.url,
    path: usagePath,
    url: usageUrlForEntry(entry),
    sourcePath: usagePath,
    sourceExists: existsSync(usagePath),
    relationship: "usage-child-of-decision",
    title: `${entry.id} usage`,
  };
});

const buildFormalPages = (entries, standards) => entries.map((entry) => {
  const formalModel = standards.standards?.[entry.slug]?.formalModel;
  const formalPath = formalModel?.path || "";
  return {
    id: `${entry.id}-formal`,
    decisionId: entry.id,
    decisionNumber: entry.number,
    parentPath: entry.path,
    parentUrl: entry.url,
    path: formalPath,
    url: formalModel?.url || "",
    sourcePath: formalPath,
    sourceExists: existsSync(formalPath),
    relationship: "formal-reference-child-of-decision",
    normative: formalModel?.normative,
    formalModelVersion: formalModel?.version,
    formalModelStatus: formalModel?.status,
    authorityPath: formalModel?.authorityPath,
    sha256: formalModel?.sha256,
    title: `${entry.id} formal reference`,
  };
});

const buildLiveCasePages = (liveCaseRegistry) => (liveCaseRegistry.cases ?? []).map((entry) => ({
  id: entry.id,
  title: entry.title,
  kind: entry.kind,
  status: entry.status,
  standard: entry.standard,
  url: `/cases/live/${entry.id}`,
  relationship: "provisional-live-case",
  claimBoundary: entry.claimBoundary,
  humanEntry: {
    path: entry.humanEntry,
    markdown: stripFrontmatter(readFileSync(entry.humanEntry, "utf8")),
  },
  genesis: {
    path: entry.genesis,
    markdown: stripFrontmatter(readFileSync(entry.genesis, "utf8")),
  },
  ...(entry.developmentLineage ? {
    developmentLineage: {
      path: entry.developmentLineage,
      markdown: stripFrontmatter(readFileSync(entry.developmentLineage, "utf8")),
    },
  } : {}),
  methodTrace: {
    path: entry.methodTrace,
    markdown: stripFrontmatter(readFileSync(entry.methodTrace, "utf8")),
  },
  propagationHypothesis: {
    path: entry.propagationHypothesis,
    markdown: stripFrontmatter(readFileSync(entry.propagationHypothesis, "utf8")),
  },
  reviewIndex: {
    path: entry.reviewIndex,
    markdown: stripFrontmatter(readFileSync(entry.reviewIndex, "utf8")),
  },
  ontologySplit: {
    path: entry.ontologySplit,
    markdown: stripFrontmatter(readFileSync(entry.ontologySplit, "utf8")),
  },
  distinguishabilityArgument: {
    path: entry.distinguishabilityArgument,
    markdown: stripFrontmatter(readFileSync(entry.distinguishabilityArgument, "utf8")),
  },
  candidateTracks: entry.candidateTracks.map((track) => ({
    ...track,
    currentCut: {
      ...track.currentCut,
      record: JSON.parse(readFileSync(track.currentCut.path, "utf8")),
    },
  })),
}));

const buildCandidatePages = (candidateRegistry) => (candidateRegistry.candidates ?? []).map((entry) => ({
  ...entry,
  url: `/drafts/${entry.id}`,
  sourcePath: entry.path,
  relationship: "pre-number-non-normative-candidate",
  normative: false,
  markdown: stripFrontmatter(readFileSync(entry.path, "utf8")),
}));

const buildCandidateFormalPages = (candidateRegistry) => (candidateRegistry.candidates ?? [])
  .filter((entry) => entry.formalReference)
  .map((entry) => ({
    id: `${entry.id}-formal`,
    candidateId: entry.id,
    parentPath: entry.path,
    parentUrl: `/drafts/${entry.id}/`,
    sourcePath: entry.formalReference.path,
    url: `/drafts/${entry.id}/formal/`,
    relationship: "formal-candidate-child-of-candidate",
    normative: false,
    formalCandidateVersion: entry.formalReference.version,
    formalCandidateStatus: entry.formalReference.status,
    authorityPath: entry.formalReference.authorityPath,
    markdown: stripFrontmatter(readFileSync(entry.formalReference.path, "utf8")),
  }));

const section = ({ id, sourceHeading, title, markdown, role, priority, presentation, firstScreen = false, sourcePath = README_PATH }) => ({
  id,
  sourcePath,
  sourceHeading,
  title,
  renderRole: role,
  homepagePriority: priority,
  defaultPresentation: presentation,
  includeInFirstScreen: firstScreen,
  markdown: normalizeLines(markdown),
});

const buildAgentHubPage = ({ profileText, guideText, capabilities, manifest }) => {
  const profile = parseReadme(profileText);
  const guide = parseReadme(guideText);
  const pageSection = ({ id, title, sourcePath, markdown, presentation }) => ({
    id,
    title,
    sourcePath,
    sourceHeading: title,
    defaultPresentation: presentation,
    markdown: normalizeLines(markdown),
  });

  return {
    id: "agent-hub",
    title: profile.title,
    url: "/agent-hub",
    relationship: "experimental-adopter-conformance-profile",
    normative: false,
    status: manifest.profile.status,
    authorityPath: AGENT_HUB_PROFILE_PATH,
    guidePath: AGENT_HUB_GUIDE_PATH,
    capabilitiesPath: AGENT_HUB_CAPABILITIES_PATH,
    manifestPath: AGENT_HUB_MANIFEST_PATH,
    lead: paragraphBlocks(profile.intro)[0] || "",
    profile: capabilities.profile,
    protocol: manifest.protocol.id,
    binding: capabilities.binding,
    suite: {
      id: manifest.suite.id,
      version: manifest.suite.version,
      fixedVectorCount: manifest.suite.fixedVectorCount,
    },
    commands: capabilities.commands,
    scaffoldLanguages: capabilities.scaffoldLanguages,
    exitCodes: capabilities.exitCodes,
    reportVerification: capabilities.reportVerification,
    claimBoundary: capabilities.claimBoundary,
    firstPartyProductProjection: capabilities.firstPartyProductProjection,
    recovery: capabilities.recovery,
    sections: [
      pageSection({
        id: "five-minute-packaged-quickstart",
        title: "Five-minute packaged quickstart",
        sourcePath: AGENT_HUB_PROFILE_PATH,
        markdown: profile.sections["Five-minute packaged quickstart"],
        presentation: "command-quickstart",
      }),
      pageSection({
        id: "verify-the-first-party-kungfu-product",
        title: "Verify the first-party Kungfu product",
        sourcePath: AGENT_HUB_PROFILE_PATH,
        markdown: profile.sections["Verify the first-party Kungfu product"],
        presentation: "product-qualification",
      }),
      pageSection({
        id: "scaffold-an-adopter-adapter",
        title: "Scaffold an adopter adapter",
        sourcePath: AGENT_HUB_PROFILE_PATH,
        markdown: profile.sections["Scaffold an adopter adapter"],
        presentation: "language-scaffolds",
      }),
      pageSection({
        id: "run-the-fixed-suite-against-an-adopter",
        title: "Run the fixed suite against an adopter",
        sourcePath: AGENT_HUB_PROFILE_PATH,
        markdown: profile.sections["Run the fixed suite against an adopter"],
        presentation: "command-workflow",
      }),
      pageSection({
        id: "fixed-boundaries",
        title: "Fixed boundaries",
        sourcePath: AGENT_HUB_PROFILE_PATH,
        markdown: profile.sections["Fixed boundaries"],
        presentation: "contract-boundary",
      }),
      pageSection({
        id: "claim-boundary",
        title: "Claim boundary",
        sourcePath: AGENT_HUB_PROFILE_PATH,
        markdown: profile.sections["Claim boundary"],
        presentation: "claim-boundary",
      }),
      pageSection({
        id: "executable-onboarding-surfaces",
        title: "Executable onboarding surfaces",
        sourcePath: AGENT_HUB_GUIDE_PATH,
        markdown: guide.sections["Executable onboarding surfaces"],
        presentation: "capability-list",
      }),
      pageSection({
        id: "adapter-binding",
        title: "Adapter binding",
        sourcePath: AGENT_HUB_GUIDE_PATH,
        markdown: guide.sections["Adapter binding"],
        presentation: "protocol-contract",
      }),
      pageSection({
        id: "reports-and-roots",
        title: "Reports and roots",
        sourcePath: AGENT_HUB_GUIDE_PATH,
        markdown: guide.sections["Reports and roots"],
        presentation: "evidence-roots",
      }),
      pageSection({
        id: "fail-closed-verification",
        title: "Fail-closed verification",
        sourcePath: AGENT_HUB_GUIDE_PATH,
        markdown: guide.sections["Fail-closed verification"],
        presentation: "verification-boundary",
      }),
      pageSection({
        id: "starter-claim-and-recovery",
        title: "Starter claim and recovery",
        sourcePath: AGENT_HUB_GUIDE_PATH,
        markdown: guide.sections["Starter claim and recovery"],
        presentation: "recovery-boundary",
      }),
      pageSection({
        id: "reference-adapters",
        title: "Reference adapters",
        sourcePath: AGENT_HUB_GUIDE_PATH,
        markdown: guide.sections["Reference adapters"],
        presentation: "reference-list",
      }),
    ],
    rendererContract: {
      primary: [
        "five-minute-packaged-quickstart",
        "scaffold-an-adopter-adapter",
        "run-the-fixed-suite-against-an-adopter",
      ],
      detail: [
        "executable-onboarding-surfaces",
        "adapter-binding",
        "reports-and-roots",
        "fail-closed-verification",
        "starter-claim-and-recovery",
        "reference-adapters",
      ],
      boundary: ["fixed-boundaries", "claim-boundary"],
      note: "Render commands and machine-readable boundaries from this page object. Do not infer certification, production fitness, or language-runtime parity from scaffold availability.",
    },
  };
};

const buildIndependentVerificationPage = ({
  guideText,
  semanticMatrix,
  warrantManifest,
  firstWaveReport,
  secondWaveReport,
}) => {
  const guide = parseReadme(guideText);
  const digestFor = (sourcePath) => warrantManifest.surfaces
    .find((surface) => surface.path === sourcePath)?.digest;
  const machineAsset = (sourcePath, url, role) => ({
    sourcePath,
    url,
    mediaType: "application/json",
    role,
    digest: digestFor(sourcePath) || `sha256:${createHash("sha256").update(readFileSync(sourcePath)).digest("hex")}`,
  });
  const lifecycleCounts = semanticMatrix.entries.reduce((counts, entry) => ({
    ...counts,
    [entry.lifecycleStatus]: (counts[entry.lifecycleStatus] || 0) + 1,
  }), {});
  const coverageCounts = semanticMatrix.entries.reduce((counts, entry) => ({
    ...counts,
    [entry.coverage]: (counts[entry.coverage] || 0) + 1,
  }), {});

  return {
    id: "independent-verification",
    title: guide.title,
    sourcePath: INDEPENDENT_VERIFIER_PATH,
    url: "/verify",
    relationship: "implementation-and-independent-verification-guide",
    normative: false,
    status: "experimental",
    authorityNote: "Numbered decisions remain authoritative. This page projects packaged implementation and verification evidence without activating drafts or certifying adopters.",
    releaseIdentity: {
      package: "@kungfu-tech/kfd",
      packageAnchor: "kfd.release.json",
      publicReleasePassport: "Buildchain release Passport for the exact immutable package",
      releaseEvidenceOwner: "Buildchain",
      consumingSiteManifest: "/manifest.json",
      rule: "Verify one immutable package version, integrity, source coordinate, and rendered-site consumption cut; never infer conformance from a mutable alias.",
    },
    commands: {
      verifyWarrantBundle: "node bin/kfd.mjs verify warrant-evidence profiles/warrant-evidence/fixtures/buildchain-dev-delivery-warrant.json --json",
      checkWarrantProfile: "node scripts/check-warrant-evidence.mjs",
    },
    semanticSelfSufficiency: {
      contract: semanticMatrix.contract,
      sourcePath: SEMANTIC_MATRIX_PATH,
      schemaPath: SEMANTIC_MATRIX_SCHEMA_PATH,
      entryCount: semanticMatrix.entries.length,
      lifecycleCounts,
      coverageCounts,
      entries: semanticMatrix.entries.map((entry) => ({
        id: entry.id,
        lifecycleStatus: entry.lifecycleStatus,
        coverage: entry.coverage,
        normativeSources: entry.normativeSources,
        schemas: entry.schemas,
        fixtures: entry.fixtures,
        failureTests: entry.failureTests,
        verifiers: entry.verifiers,
        gaps: entry.gaps,
      })),
      claimBoundary: semanticMatrix.claimBoundary,
    },
    warrantEvidence: {
      profile: `${warrantManifest.profile.id}@${warrantManifest.profile.version}`,
      status: warrantManifest.profile.status,
      manifestPath: WARRANT_MANIFEST_PATH,
      fixedVectorCount: warrantManifest.warrantConformance.fixedVectorCount,
      decision: warrantManifest.warrantConformance.decision,
      decisionStatus: warrantManifest.warrantConformance.decisionStatus,
      extraction: warrantManifest.extraction,
      runtimeDependencies: warrantManifest.runtimeDependencies,
      forbiddenDependencies: warrantManifest.forbiddenDependencies,
      report: warrantManifest.report,
      claimBoundary: warrantManifest.claimBoundary,
    },
    firstWaveEvidence: {
      sourcePath: FIRST_WAVE_REPORT_PATH,
      cut: firstWaveReport.cut,
      outcomes: firstWaveReport.outcomes,
      kfd10Status: firstWaveReport.kfd10Status,
      qualifying: firstWaveReport.qualifying,
      selfCertified: firstWaveReport.selfCertified,
      nextEvidence: firstWaveReport.nextEvidence,
    },
    secondWaveEvidence: {
      sourcePath: SECOND_WAVE_REPORT_PATH,
      cut: secondWaveReport.cut,
      sources: secondWaveReport.sources,
      matrix: secondWaveReport.matrix,
      competingModels: secondWaveReport.competingModels,
      outcomes: secondWaveReport.outcomes,
      kfd10Status: secondWaveReport.kfd10Status,
      activationCriteriaProved: secondWaveReport.activationCriteriaProved,
      qualifying: secondWaveReport.qualifying,
      selfCertified: secondWaveReport.selfCertified,
      claimBoundary: secondWaveReport.claimBoundary,
    },
    machineAssets: [
      machineAsset(SEMANTIC_MATRIX_PATH, "/evidence/semantic-self-sufficiency/kfd-1-13.json", "implementation-map"),
      machineAsset(WARRANT_MANIFEST_PATH, "/profiles/warrant-evidence/manifest.json", "verification-profile"),
      machineAsset(FIRST_WAVE_REPORT_PATH, "/evidence/primitive-evidence/first-wave-report.json", "evidence-report"),
      machineAsset(SECOND_WAVE_REPORT_PATH, "/evidence/primitive-evidence/second-wave-report.json", "evidence-report"),
      machineAsset(SEMANTIC_MATRIX_SCHEMA_PATH, "/schemas/kfd-semantic-self-sufficiency-matrix.schema.json", "schema"),
    ],
    rendering: {
      kind: "markdown-document",
      tocDepth: 3,
      navigationLabel: "Verify KFD",
      navigationGroup: "foundation",
      navigationOrder: 25,
    },
    markdown: stripFrontmatter(guideText),
    rendererContract: {
      showReleaseIdentity: true,
      showCommands: true,
      showCoverageSummary: true,
      showMachineAssets: true,
      showClaimBoundaries: true,
      note: "Render the declared facts and links without converting package verification into certification, draft activation, independent adoption, or production fitness.",
    },
  };
};

const buildSelfConformancePage = ({
  profileText,
  implementerGuideText,
  manifest,
  lifecycleGates,
  verifierMatrix,
  issueCodes,
  assessment,
  verification,
  terminalReport,
  history,
  historyGuideText,
  historyImplementerText,
  candidate,
  liveCase,
}) => {
  const machineAsset = (sourcePath, url, role) => ({
    sourcePath,
    url,
    mediaType: "application/json",
    role,
    digest: `sha256:${createHash("sha256").update(readFileSync(sourcePath)).digest("hex")}`,
  });

  if (!candidate || !liveCase) throw new Error("recursive self-conformance Candidate and live case must exist");
  if (terminalReport.outcome !== "non-promotion" || terminalReport.numberAllocated !== false) {
    throw new Error("recursive self-conformance terminal evidence must remain a non-promotion without number allocation");
  }

  return {
    id: "self-conformance",
    title: "How KFD changes itself",
    sourcePath: SELF_CONFORMANCE_PROFILE_PATH,
    url: "/verify/self-conformance",
    relationship: "package-owned-governed-self-change-projection",
    normative: false,
    status: manifest.profile.status,
    authorityNote: "This page projects the fixed KFD package. Numbered decisions, Profile contracts, exact evidence roots, and accountable human authority remain authoritative.",
    profile: manifest.profile,
    governedObjects: [
      "Candidate genesis and qualification",
      "numbered-draft promotion",
      "activation and supersession",
      "foundation revision",
      "release packaging",
    ],
    lifecycle: {
      paths: lifecycleGates.paths,
      nonPromotionTransitions: lifecycleGates.nonPromotionTransitions,
      claimBoundary: lifecycleGates.claimBoundary,
    },
    verifierBoundary: {
      requirement: manifest.verifierRequirement,
      matrix: verifierMatrix,
      issueCodes,
      claimBoundary: manifest.claimBoundary,
    },
    commands: [
      {
        id: "gate-lifecycle",
        label: "Evaluate a lifecycle gate",
        command: "kfd gate self-conformance-lifecycle <request> --output <report> --json",
      },
      {
        id: "verify-transition",
        label: "Verify a transition report",
        command: "kfd verify self-conformance-transition <report> --json",
      },
      {
        id: "verify-history",
        label: "Replay immutable historical lineage",
        command: "node bin/kfd-history.mjs verify profiles/self-conformance/history/historical-lineage.report.json --json",
      },
    ],
    historicalLineage: {
      reportId: history.reportId,
      retrospective: history.retrospective,
      profileAvailableAtEvent: history.profileAvailableAtEvent,
      bootstrapBoundary: {
        id: history.foundation.id,
        gitCommit: history.foundation.gitCommit,
        gitTag: history.foundation.gitTag,
        packageName: history.foundation.packageName,
        packageVersion: history.foundation.packageVersion,
        packageRoot: history.foundation.packageRoot,
        active: history.foundation.active,
        draft: history.foundation.draft,
        absent: history.foundation.absent,
        note: "This alpha.28 cut is a retrospective foundation. It is not the live Profile bootstrap and does not claim contemporaneous Profile execution.",
      },
      kfd7Walkthrough: history.episodes
        .filter(({ subjectId }) => subjectId === "KFD-7")
        .map(({ sequence, id, transition, before, after, sourceIds }) => ({ sequence, id, transition, before, after, sourceIds })),
      transitionRecipes: [
        { transition: "candidate-genesis", before: "absent", after: "candidate" },
        { transition: "candidate-refinement", before: "candidate", after: "candidate" },
        { transition: "numbered-draft-promotion", before: "candidate", after: "numbered-draft" },
        { transition: "qualification", before: "numbered-draft", after: "qualified-numbered-draft" },
        { transition: "activation", before: "qualified-numbered-draft", after: "active" },
        { transition: "release-packaging", before: "active", after: "active-packaged" },
        { transition: "no-new-kfd", before: "candidate", after: "no-new-kfd" },
      ],
      coverage: history.outcomes,
      numberingMappings: history.episodes.flatMap(({ numberingMappings }) => numberingMappings),
      convergence: history.convergence,
      nextAction: "Choose a current lifecycle action from the actual terminal state; preserve partial, draft, revised, rejected, provisional, or no-new-kfd outcomes instead of manufacturing promotion.",
      limits: history.claimBoundary,
      markdown: stripFrontmatter(historyGuideText),
      implementerGuideMarkdown: stripFrontmatter(historyImplementerText),
    },
    releaseSeparation: {
      verifierNecessary: true,
      verifierSufficient: false,
      humanApprovalRequired: true,
      releaseAuthoritySeparate: true,
      note: "A valid verifier report is necessary structural evidence. It cannot approve, merge, publish, certify, allocate a number, change status, or authorize a release.",
    },
    recursiveCase: {
      id: RECURSIVE_SELF_CONFORMANCE_ID,
      candidate: {
        url: candidate.url,
        status: candidate.status,
        normative: candidate.normative,
        claimBoundary: candidate.claimBoundary,
      },
      liveCase: {
        url: liveCase.url,
        status: liveCase.status,
        outcome: liveCase.candidateTracks[0]?.status,
        claimBoundary: liveCase.claimBoundary,
      },
      terminal: {
        outcome: terminalReport.outcome,
        valid: terminalReport.valid,
        verifierNecessary: terminalReport.verifierNecessary,
        verifierSufficient: terminalReport.verifierSufficient,
        humanApproved: terminalReport.humanApproved,
        releaseAuthorized: terminalReport.releaseAuthorized,
        numberAllocated: terminalReport.numberAllocated,
        statusChanged: terminalReport.statusChanged,
        requestRoot: terminalReport.requestRoot,
        fixedPackageRoot: terminalReport.fixedPackageRoot,
        terminalBundleRoot: terminalReport.terminalBundleRoot,
        terminalReportRoot: terminalReport.terminalReportRoot,
      },
      assessment,
      verification,
    },
    machineAssets: [
      machineAsset(SELF_CONFORMANCE_MANIFEST_PATH, "/profiles/self-conformance/manifest.json", "profile-manifest"),
      machineAsset(SELF_CONFORMANCE_LIFECYCLE_GATES_PATH, "/profiles/self-conformance/lifecycle-gates.json", "lifecycle-gates"),
      machineAsset(SELF_CONFORMANCE_VERIFIER_MATRIX_PATH, "/profiles/self-conformance/lifecycle-gate-matrix.json", "verifier-matrix"),
      machineAsset(SELF_CONFORMANCE_ISSUE_CODES_PATH, "/profiles/self-conformance/issue-codes.json", "issue-codes"),
      machineAsset(RECURSIVE_ASSESSMENT_PATH, `/${RECURSIVE_ASSESSMENT_PATH}`, "qualification-assessment"),
      machineAsset(RECURSIVE_VERIFICATION_PATH, `/${RECURSIVE_VERIFICATION_PATH}`, "independent-verification"),
      machineAsset(RECURSIVE_TERMINAL_REPORT_PATH, `/${RECURSIVE_TERMINAL_REPORT_PATH}`, "terminal-transition-report"),
      machineAsset(SELF_CONFORMANCE_HISTORY_PATH, `/${SELF_CONFORMANCE_HISTORY_PATH}`, "historical-lineage"),
      machineAsset(SELF_CONFORMANCE_HISTORY_MANIFEST_PATH, `/${SELF_CONFORMANCE_HISTORY_MANIFEST_PATH}`, "historical-manifest"),
    ],
    rendering: {
      kind: "self-conformance-guide",
      navigationLabel: "Self-Conformance",
      navigationGroup: "verify",
      navigationOrder: 26,
    },
    markdown: stripFrontmatter(profileText),
    implementerGuideMarkdown: stripFrontmatter(implementerGuideText),
    rendererContract: {
      showGovernedObjects: true,
      showLifecycle: true,
      showVerifierBoundary: true,
      showCommands: true,
      showReleaseSeparation: true,
      showRecursiveCase: true,
      showHistoricalLineage: true,
      showMachineAssets: true,
      note: "Render package-declared facts and boundaries without inferring self-certification, promotion, number allocation, approval, release authorization, or production fitness.",
    },
  };
};

export const buildSiteBundle = ({
  readmeText,
  foundationText,
  loadBearingText,
  formalText,
  casesText,
  candidateIndexText,
  candidateRegistry,
  registry,
  standards,
  liveCaseRegistry,
  terminology,
  activationContracts,
  agentHubProfileText,
  agentHubGuideText,
  agentHubCapabilities,
  agentHubManifest,
  independentVerifierText,
  semanticMatrix,
  warrantManifest,
  firstWaveReport,
  secondWaveReport,
  selfConformanceProfileText,
  selfConformanceImplementerGuideText,
  selfConformanceManifest,
  selfConformanceLifecycleGates,
  selfConformanceVerifierMatrix,
  selfConformanceIssueCodes,
  selfConformanceHistory,
  selfConformanceHistoryGuideText,
  selfConformanceHistoryImplementerText,
  recursiveAssessment,
  recursiveVerification,
  recursiveTerminalReport,
  releaseAnchor,
}) => {
  const readme = parseReadme(readmeText);
  const foundationDocument = parseReadme(foundationText);
  const loadBearingDocument = parseReadme(loadBearingText);
  const formalDocument = parseReadme(formalText);
  const casesDocument = parseReadme(casesText);
  const futurePicture = parseFuturePicture(readme.intro);
  const { lead } = introLead(readme.intro);
  const { decisionKinds } = introLead(readme.sections["What KFD is"] || "");
  const foundationTriad = parseFoundationTriad(readme.sections["Foundation triad"] || "");
  const independentImplementation = parseIndependentImplementation(
    readme.sections["Implement and verify KFD independently"] || "",
    agentHubCapabilities,
    releaseAnchor,
  );
  const foundation = parseFoundation(foundationDocument.sections["Foundation structure"] || "");
  const productWitness = parseProductWitness(foundationDocument.sections["Load-bearing product witness"] || "");
  const practiceGuidelines = parsePracticeGuidelines(foundationDocument.sections["Practice guidelines"] || "");
  const productProofPath = parseProductProofPath(readme.sections["Product proof path"] || "");
  const entries = registry.entries || [];
  const liveCasePages = buildLiveCasePages(liveCaseRegistry);
  const candidatePages = buildCandidatePages(candidateRegistry);
  const candidateFormalPages = buildCandidateFormalPages(candidateRegistry);
  const candidatePageDeclarations = candidatePages.map((entry) => ({
    id: entry.id,
    title: entry.title,
    status: entry.status,
    sourcePath: entry.sourcePath,
    url: `${entry.url}/`,
    slotHint: entry.slotHint,
    claimBoundary: entry.claimBoundary,
    markdown: entry.markdown,
  }));
  const agentHubPage = buildAgentHubPage({
    profileText: agentHubProfileText,
    guideText: agentHubGuideText,
    capabilities: agentHubCapabilities,
    manifest: agentHubManifest,
  });
  const independentVerificationPage = buildIndependentVerificationPage({
    guideText: independentVerifierText,
    semanticMatrix,
    warrantManifest,
    firstWaveReport,
    secondWaveReport,
  });
  const selfConformancePage = buildSelfConformancePage({
    profileText: selfConformanceProfileText,
    implementerGuideText: selfConformanceImplementerGuideText,
    manifest: selfConformanceManifest,
    lifecycleGates: selfConformanceLifecycleGates,
    verifierMatrix: selfConformanceVerifierMatrix,
    issueCodes: selfConformanceIssueCodes,
    history: selfConformanceHistory,
    historyGuideText: selfConformanceHistoryGuideText,
    historyImplementerText: selfConformanceHistoryImplementerText,
    assessment: recursiveAssessment,
    verification: recursiveVerification,
    terminalReport: recursiveTerminalReport,
    candidate: candidatePages.find((entry) => entry.id === RECURSIVE_SELF_CONFORMANCE_ID),
    liveCase: liveCasePages.find((entry) => entry.id === RECURSIVE_SELF_CONFORMANCE_ID),
  });
  const verificationLanes = [
    {
      id: "independent-implementation",
      title: "Implement and verify KFD independently",
      url: independentVerificationPage.url,
      relationship: independentVerificationPage.relationship,
      claimBoundary: independentVerificationPage.rendererContract.note,
    },
    {
      id: "governed-self-change",
      title: selfConformancePage.title,
      url: selfConformancePage.url,
      relationship: selfConformancePage.relationship,
      claimBoundary: selfConformancePage.authorityNote,
    },
  ];
  independentVerificationPage.lanes = verificationLanes;
  const loadBearingPage = {
    id: "load-bearing-dogfood",
    title: loadBearingDocument.title,
    sourcePath: LOAD_BEARING_PATH,
    url: "/under-load",
    relationship: "pre-release-founding-adopter-evidence-baseline",
    normative: false,
    authorityNote: "This page is a dated evidence synthesis. Numbered KFD decisions and accepted live-case cuts remain authoritative.",
    rendering: {
      kind: "markdown-document",
      tocDepth: 3,
      navigationLabel: "Under load",
      navigationGroup: "foundation",
      navigationOrder: 30,
    },
    markdown: stripFrontmatter(loadBearingText),
  };

  const homepageSections = [
    section({
      id: "future-picture",
      sourceHeading: "KFD — Kung Fu Decisions",
      title: "Core question",
      markdown: readme.intro,
      role: "first-screen",
      priority: 5,
      presentation: "future-picture",
      firstScreen: true,
    }),
    section({
      id: "independent-implementation",
      sourceHeading: "Implement and verify KFD independently",
      title: "Implement and verify KFD independently",
      markdown: readme.sections["Implement and verify KFD independently"],
      role: "first-screen",
      priority: 8,
      presentation: "independent-implementation-steps",
      firstScreen: true,
    }),
    section({
      id: "foundation-triad",
      sourceHeading: "Foundation triad",
      title: "Foundation triad",
      markdown: readme.sections["Foundation triad"],
      role: "first-screen",
      priority: 10,
      presentation: "triad-cards",
      firstScreen: true,
    }),
    section({
      id: "why-this-question-matters",
      sourceHeading: "Why this question matters",
      title: "Why this question matters",
      markdown: readme.sections["Why this question matters"],
      role: "primary",
      priority: 15,
      presentation: "historical-context",
    }),
    section({
      id: "foundation-structure",
      sourceHeading: "Foundation structure",
      title: "Foundation structure",
      markdown: foundationDocument.sections["Foundation structure"],
      role: "detail",
      priority: 70,
      presentation: "layered-model",
      sourcePath: FOUNDATION_PATH,
    }),
    section({
      id: "load-bearing-product-witness",
      sourceHeading: "Load-bearing product witness",
      title: "Load-bearing product witness",
      markdown: foundationDocument.sections["Load-bearing product witness"],
      role: "detail",
      priority: 71,
      presentation: "product-witness",
      sourcePath: FOUNDATION_PATH,
    }),
    section({
      id: "what-kfd-is",
      sourceHeading: "What KFD is",
      title: "What KFD is",
      markdown: readme.sections["What KFD is"],
      role: "primary",
      priority: 20,
      presentation: "registry-introduction",
    }),
    section({
      id: "adoption-boundary",
      sourceHeading: "Adoption boundary",
      title: "Adoption boundary",
      markdown: readme.sections["Adoption boundary"],
      role: "primary",
      priority: 25,
      presentation: "boundary-note",
    }),
    section({
      id: "current-candidates",
      sourceHeading: "Candidate lineage",
      title: "Candidate lineage",
      markdown: readme.sections["Candidate lineage"],
      role: "primary",
      priority: 27,
      presentation: "candidate-summary",
    }),
    section({
      id: "practice-guidelines",
      sourceHeading: "Practice guidelines",
      title: "Practice guidelines",
      markdown: foundationDocument.sections["Practice guidelines"],
      role: "detail",
      priority: 72,
      presentation: "practice-table",
      sourcePath: FOUNDATION_PATH,
    }),
    section({
      id: "product-proof-path",
      sourceHeading: "Product proof path",
      title: "Product proof path",
      markdown: readme.sections["Product proof path"],
      role: "primary",
      priority: 30,
      presentation: "proof-path",
    }),
    section({
      id: "agent-quickstart",
      sourceHeading: "Agent Quickstart",
      title: "Agent Quickstart",
      markdown: readme.sections["Agent Quickstart"],
      role: "support",
      priority: 40,
      presentation: "ordered-steps",
    }),
    section({
      id: "decision-metadata",
      sourceHeading: "Decision metadata",
      title: "Decision metadata",
      markdown: readme.sections["Decision metadata"],
      role: "support",
      priority: 50,
      presentation: "fact-source",
    }),
  ];

  return {
    schemaVersion: 2,
    contract: "kfd-site-bundle",
    source: {
      package: "@kungfu-tech/kfd",
      homepageTextSource: README_PATH,
      foundationTextSource: FOUNDATION_PATH,
      loadBearingTextSource: LOAD_BEARING_PATH,
      formalTextSource: FORMAL_PATH,
      casesTextSource: CASES_PATH,
      registry: REGISTRY_PATH,
      standards: STANDARDS_PATH,
      liveCaseRegistry: LIVE_CASE_REGISTRY_PATH,
      candidateRegistry: CANDIDATE_REGISTRY_PATH,
      terminology: TERMINOLOGY_CONTRACT_PATH,
      activationContracts: ACTIVATION_CONTRACTS_PATH,
      agentHubProfile: AGENT_HUB_PROFILE_PATH,
      agentHubGuide: AGENT_HUB_GUIDE_PATH,
      agentHubCapabilities: AGENT_HUB_CAPABILITIES_PATH,
      agentHubManifest: AGENT_HUB_MANIFEST_PATH,
      independentVerifier: INDEPENDENT_VERIFIER_PATH,
      semanticSelfSufficiencyMatrix: SEMANTIC_MATRIX_PATH,
      semanticSelfSufficiencySchema: SEMANTIC_MATRIX_SCHEMA_PATH,
      warrantEvidenceManifest: WARRANT_MANIFEST_PATH,
      primitiveEvidenceFirstWaveReport: FIRST_WAVE_REPORT_PATH,
      selfConformanceProfile: SELF_CONFORMANCE_PROFILE_PATH,
      selfConformanceImplementerGuide: SELF_CONFORMANCE_IMPLEMENTER_GUIDE_PATH,
      selfConformanceManifest: SELF_CONFORMANCE_MANIFEST_PATH,
      selfConformanceLifecycleGates: SELF_CONFORMANCE_LIFECYCLE_GATES_PATH,
      selfConformanceVerifierMatrix: SELF_CONFORMANCE_VERIFIER_MATRIX_PATH,
      selfConformanceIssueCodes: SELF_CONFORMANCE_ISSUE_CODES_PATH,
      selfConformanceHistory: SELF_CONFORMANCE_HISTORY_PATH,
      selfConformanceHistoryGuide: SELF_CONFORMANCE_HISTORY_GUIDE_PATH,
      selfConformanceHistoryImplementer: SELF_CONFORMANCE_HISTORY_IMPLEMENTER_PATH,
      selfConformanceHistoryManifest: SELF_CONFORMANCE_HISTORY_MANIFEST_PATH,
      recursiveSelfConformanceAssessment: RECURSIVE_ASSESSMENT_PATH,
      recursiveSelfConformanceVerification: RECURSIVE_VERIFICATION_PATH,
      recursiveSelfConformanceTerminalReport: RECURSIVE_TERMINAL_REPORT_PATH,
      decisionsDir: "decisions",
      candidatesDir: "drafts",
    },
    routes: {
      home: "/",
      foundation: "/foundation",
      underLoad: "/under-load",
      formal: "/formal",
      terminology: "/terminology",
      cases: "/cases",
      liveCasePattern: "/cases/live/{id}",
      candidates: "/drafts",
      candidatePattern: "/drafts/{id}",
      candidateFormalPattern: "/drafts/{id}/formal",
      agentHub: "/agent-hub",
      independentVerification: "/verify",
      selfConformance: "/verify/self-conformance",
      decisionPattern: "/{number}",
      decisionUsagePattern: "/{number}/usage",
      decisionFormalPattern: "/{number}/formal",
      llms: "/llms.txt",
      manifest: "/manifest.json",
    },
    homepage: {
      title: readme.title,
      lead,
      decisionKinds,
      futurePicture,
      independentImplementation,
      foundationTriad,
      foundation,
      productWitness,
      practiceGuidelines,
      productProofPath,
      selfConformance: {
        label: "How KFD changes itself",
        url: "/verify/self-conformance",
        status: selfConformanceManifest.profile.status,
        claimBoundary: selfConformanceManifest.claimBoundary,
      },
      currentDecisions: {
        heading: "Current decisions",
        source: REGISTRY_PATH,
      },
      sections: homepageSections,
      displayPlan: {
        firstScreen: {
          include: [
            "title",
            "future-picture.question",
            "future-picture.engineeringAnswer",
            "future-picture.claimBoundary",
            "future-picture.pastToFuture",
            "future-picture.kungfuPath",
            "independent-implementation.promise",
            "independent-implementation.supportedLanguages",
            "independent-implementation.steps",
            "independent-implementation.links",
            "independent-implementation.offlineBoundary",
            "independent-implementation.claimBoundary",
            "foundation-triad",
            "product-witness.principle",
            "foundation-triad.links",
          ],
          maxPrimarySections: 3,
          note: "The first viewport should ask the system-continuity question, make independent implementation and offline verification directly actionable, and begin the package-owned three-step path before installed-product, registry, or renderer detail.",
        },
        primary: ["future-picture", "independent-implementation", "foundation-triad", "why-this-question-matters", "what-kfd-is", "adoption-boundary", "current-candidates", "product-proof-path"],
        detail: {
          route: "/foundation",
          source: FOUNDATION_PATH,
          sections: ["foundation-structure", "load-bearing-product-witness", "practice-guidelines"],
        },
        readingPath: ["/", "/foundation", "/verify", "/verify/self-conformance", "/under-load", "/formal", "/cases", "/drafts", "/{number}"],
        support: ["agent-quickstart", "decision-metadata"],
        currentDecisions: {
          source: REGISTRY_PATH,
          placement: "after-primary",
          ids: entries.map((entry) => entry.id),
        },
      },
      rendererContract: {
        ...section({
          id: "homepage-content-contract",
          sourceHeading: "Homepage content contract",
          title: "Homepage content contract",
          markdown: readme.sections["Homepage content contract"],
          role: "renderer-contract",
          priority: 90,
          presentation: "developer-note",
        }),
        renderAsHomepageContent: false,
        note: "This is a machine/renderer contract for site implementers. It should not be rendered as ordinary homepage content.",
      },
    },
    foundationPage: {
      id: "foundation",
      title: foundationDocument.title,
      sourcePath: FOUNDATION_PATH,
      url: "/foundation",
      relationship: "explanation-of-numbered-decisions",
      normative: false,
      authorityNote: "The numbered texts in decisions/KFD-N.md remain authoritative.",
      markdown: normalizeLines(foundationText),
    },
    loadBearingPage,
    independentVerificationPage,
    selfConformancePage,
    verificationLanes,
    standalonePages: [loadBearingPage, independentVerificationPage, selfConformancePage],
    formalPage: {
      id: "formal-model",
      title: formalDocument.title,
      sourcePath: FORMAL_PATH,
      url: "/formal",
      relationship: "non-normative-reference-semantics-for-numbered-decisions",
      normative: false,
      formalModelVersion: 1,
      authorityNote: "The numbered texts in decisions/KFD-N.md remain authoritative.",
      markdown: normalizeLines(formalText),
    },
    casesPage: {
      id: "primitive-discovery-cases",
      title: casesDocument.title,
      sourcePath: CASES_PATH,
      url: "/cases",
      relationship: "historical-companion-to-kfd-foundation",
      normative: false,
      authorityNote: "Historical facts are source-bound; KFD replay is explanatory. Numbered KFD decisions remain authoritative.",
      markdown: stripFrontmatter(casesText),
    },
    terminologyPage: {
      id: "terminology",
      title: "KFD Terminology Contract",
      sourcePath: TERMINOLOGY_PATH,
      url: "/terminology",
      relationship: "canonical-vocabulary-for-all-kfd-surfaces",
      normative: false,
      authorityNote: "Numbered decisions remain normative; this contract governs naming and type distinctions across their projections.",
      contract: terminology,
      markdown: normalizeLines(readFileSync(TERMINOLOGY_PATH, "utf8")),
    },
    agentHubPage,
    liveCases: {
      source: LIVE_CASE_REGISTRY_PATH,
      stableUrlPattern: "/cases/live/{id}",
      relationship: "provisional-live-cases-of-kfd-5",
      normative: false,
      authorityNote: "Live cases preserve candidate genesis and qualification state. They are not numbered KFD decisions or accepted Primitive claims.",
      cases: liveCasePages,
    },
    kfdCandidates: {
      source: CANDIDATE_REGISTRY_PATH,
      indexSource: CANDIDATE_INDEX_PATH,
      indexUrl: "/drafts",
      stableUrlPattern: "/drafts/{id}",
      relationship: "pre-number-non-normative-candidates",
      normative: false,
      authorityNote: "Candidates preserve hypotheses before number allocation. Only explicit promotion into decisions/ and registry.json creates numbered KFD authority.",
      numberingPolicy: candidateRegistry.numberingPolicy,
      indexMarkdown: stripFrontmatter(candidateIndexText),
      candidates: candidatePages,
    },
    candidatePages: {
      source: CANDIDATE_REGISTRY_PATH,
      indexUrl: "/drafts/",
      stableUrlPattern: "/drafts/{id}/",
      relationship: "candidate-before-promotion",
      normative: false,
      pages: candidatePageDeclarations,
      formalPages: {
        source: "drafts/registry.json + drafts/formal/*.md",
        stableUrlPattern: "/drafts/{id}/formal/",
        relationship: "formal-candidate-child-of-candidate",
        normative: false,
        pages: candidateFormalPages,
      },
    },
    decisionPages: {
      source: REGISTRY_PATH,
      bodySource: "registry.entries[].path",
      stableUrlField: "url",
      usagePages: {
        source: "registry.entries[] + docs/KFD-N-usage.md",
        bodySource: "docs/KFD-{number}-usage.md",
        stableUrlPattern: "/{number}/usage",
        relationship: "usage-child-of-decision",
        pages: buildUsagePages(entries),
      },
      formalPages: {
        source: "registry.entries[] + standards.json + docs/KFD-N-formal.md",
        bodySource: "docs/KFD-{number}-formal.md",
        stableUrlPattern: "/{number}/formal",
        relationship: "formal-reference-child-of-decision",
        normative: false,
        pages: buildFormalPages(entries, standards),
      },
      metadata: {
        licenseBoundary: {
          license: "Apache-2.0",
          licenseFile: "LICENSE",
          officialStatusAndTrademarks: "TRADEMARKS.md",
          summary: "Apache-2.0 covers repository contents; it does not grant KFD/Kungfu trademarks, official status, certification status, or endorsement.",
        },
        publicFactSource: {
          kind: "git-repository",
          host: "github",
          repository: "kungfu-systems/kfd",
          url: "https://github.com/kungfu-systems/kfd",
          loadBearingCoordinate: "commit-addressed repository contents",
          stableRenderedIndex: "https://kfd.libkungfu.dev",
          canonicalPaths: [
            "decisions/KFD-N.md",
            REGISTRY_PATH,
            "standards.json",
            LIVE_CASE_REGISTRY_PATH,
            CANDIDATE_REGISTRY_PATH,
          ],
          projectionSurfaces: [
            "https://kfd.libkungfu.dev/N",
            "npm:@kungfu-tech/kfd",
            "Buildchain release passports",
          ],
          extensionRequestNote: "GitHub issues are extension request paths; KFD facts are created only by committed repository contents.",
        },
      },
    },
    activationContracts: {
      source: ACTIVATION_CONTRACTS_PATH,
      relationship: "draft-qualification-and-activation-interfaces",
      normative: false,
      authorityNote: "The numbered KFD-11 through KFD-13 decisions remain authoritative and remain draft until a later explicit activation decision.",
      contract: activationContracts,
    },
    renderingBoundary: {
      ownedByKfd: [
        "homepage title and text",
        "homepage section projection from README.md",
        "first-screen independent implementation promise, languages, commands, links, and boundaries",
        "foundation explanation page from docs/foundation.md",
        "load-bearing dogfood evidence page from docs/load-bearing-dogfood.md",
        "formal reference overview from docs/formal-model.md",
        "historical cases page from docs/primitive-discovery-cases.md",
        "live Primitive case registry and case bodies from cases/",
        "pre-number KFD candidate registry, index, and bodies from drafts/",
        "non-normative formal candidate pages from drafts/formal/",
        "foundation triad commitments",
        "foundation structure layers and chain",
        "product proof path text",
        "agent quickstart text",
        "decision metadata",
        "decision metadata fact source",
        "canonical terminology contract and explanatory subtitles from terminology.json",
        "license and official-status boundary",
        "decision markdown bodies",
        "decision usage page mapping",
        "decision usage markdown bodies",
        "decision formal reference mapping",
        "decision formal reference markdown bodies",
        "KFD-11 through KFD-13 activation contract discovery manifest",
        "Agent Hub executable onboarding page, command surface, protocol boundary, and recovery guidance",
        "independent implementation and verification page from docs/independent-verifier.md",
        "semantic self-sufficiency matrix, Warrant profile, machine evidence routes, and claim boundaries",
      ],
      ownedBySite: [
        "HTML structure",
        "CSS",
        "responsive layout",
        "navigation layout",
        "visual assets",
        "decorative images",
        "markdown-to-HTML renderer",
        "section presentation and progressive disclosure within KFD displayPlan constraints",
      ],
    },
  };
};

export const readInputs = () => ({
  readmeText: readFileSync(README_PATH, "utf8"),
  foundationText: readFileSync(FOUNDATION_PATH, "utf8"),
  loadBearingText: readFileSync(LOAD_BEARING_PATH, "utf8"),
  formalText: readFileSync(FORMAL_PATH, "utf8"),
  casesText: readFileSync(CASES_PATH, "utf8"),
  candidateIndexText: readFileSync(CANDIDATE_INDEX_PATH, "utf8"),
  candidateRegistry: JSON.parse(readFileSync(CANDIDATE_REGISTRY_PATH, "utf8")),
  registry: JSON.parse(readFileSync(REGISTRY_PATH, "utf8")),
  standards: JSON.parse(readFileSync(STANDARDS_PATH, "utf8")),
  liveCaseRegistry: JSON.parse(readFileSync(LIVE_CASE_REGISTRY_PATH, "utf8")),
  terminology: JSON.parse(readFileSync(TERMINOLOGY_CONTRACT_PATH, "utf8")),
  activationContracts: JSON.parse(readFileSync(ACTIVATION_CONTRACTS_PATH, "utf8")),
  agentHubProfileText: readFileSync(AGENT_HUB_PROFILE_PATH, "utf8"),
  agentHubGuideText: readFileSync(AGENT_HUB_GUIDE_PATH, "utf8"),
  agentHubCapabilities: JSON.parse(readFileSync(AGENT_HUB_CAPABILITIES_PATH, "utf8")),
  agentHubManifest: JSON.parse(readFileSync(AGENT_HUB_MANIFEST_PATH, "utf8")),
  independentVerifierText: readFileSync(INDEPENDENT_VERIFIER_PATH, "utf8"),
  semanticMatrix: JSON.parse(readFileSync(SEMANTIC_MATRIX_PATH, "utf8")),
  warrantManifest: JSON.parse(readFileSync(WARRANT_MANIFEST_PATH, "utf8")),
  firstWaveReport: JSON.parse(readFileSync(FIRST_WAVE_REPORT_PATH, "utf8")),
  secondWaveReport: JSON.parse(readFileSync(SECOND_WAVE_REPORT_PATH, "utf8")),
  selfConformanceProfileText: readFileSync(SELF_CONFORMANCE_PROFILE_PATH, "utf8"),
  selfConformanceImplementerGuideText: readFileSync(SELF_CONFORMANCE_IMPLEMENTER_GUIDE_PATH, "utf8"),
  selfConformanceManifest: JSON.parse(readFileSync(SELF_CONFORMANCE_MANIFEST_PATH, "utf8")),
  selfConformanceLifecycleGates: JSON.parse(readFileSync(SELF_CONFORMANCE_LIFECYCLE_GATES_PATH, "utf8")),
  selfConformanceVerifierMatrix: JSON.parse(readFileSync(SELF_CONFORMANCE_VERIFIER_MATRIX_PATH, "utf8")),
  selfConformanceIssueCodes: JSON.parse(readFileSync(SELF_CONFORMANCE_ISSUE_CODES_PATH, "utf8")),
  selfConformanceHistory: JSON.parse(readFileSync(SELF_CONFORMANCE_HISTORY_PATH, "utf8")),
  selfConformanceHistoryGuideText: readFileSync(SELF_CONFORMANCE_HISTORY_GUIDE_PATH, "utf8"),
  selfConformanceHistoryImplementerText: readFileSync(SELF_CONFORMANCE_HISTORY_IMPLEMENTER_PATH, "utf8"),
  recursiveAssessment: JSON.parse(readFileSync(RECURSIVE_ASSESSMENT_PATH, "utf8")),
  recursiveVerification: JSON.parse(readFileSync(RECURSIVE_VERIFICATION_PATH, "utf8")),
  recursiveTerminalReport: JSON.parse(readFileSync(RECURSIVE_TERMINAL_REPORT_PATH, "utf8")),
  releaseAnchor: JSON.parse(readFileSync(KFD_RELEASE_PATH, "utf8")),
});

export const generatedSiteBundle = () => buildSiteBundle(readInputs());

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const bundle = generatedSiteBundle();
  writeFileSync(SITE_BUNDLE_PATH, `${JSON.stringify(bundle, null, 2)}\n`);
  console.log(`updated ${SITE_BUNDLE_PATH}`);
}
