import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const README_PATH = "README.md";
const FOUNDATION_PATH = "docs/foundation.md";
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

export const buildSiteBundle = ({
  readmeText,
  foundationText,
  formalText,
  casesText,
  candidateIndexText,
  candidateRegistry,
  registry,
  standards,
  liveCaseRegistry,
  terminology,
  activationContracts,
}) => {
  const readme = parseReadme(readmeText);
  const foundationDocument = parseReadme(foundationText);
  const formalDocument = parseReadme(formalText);
  const casesDocument = parseReadme(casesText);
  const futurePicture = parseFuturePicture(readme.intro);
  const { lead } = introLead(readme.intro);
  const { decisionKinds } = introLead(readme.sections["What KFD is"] || "");
  const foundationTriad = parseFoundationTriad(readme.sections["Foundation triad"] || "");
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
      formalTextSource: FORMAL_PATH,
      casesTextSource: CASES_PATH,
      registry: REGISTRY_PATH,
      standards: STANDARDS_PATH,
      liveCaseRegistry: LIVE_CASE_REGISTRY_PATH,
      candidateRegistry: CANDIDATE_REGISTRY_PATH,
      terminology: TERMINOLOGY_CONTRACT_PATH,
      activationContracts: ACTIVATION_CONTRACTS_PATH,
      decisionsDir: "decisions",
      candidatesDir: "drafts",
    },
    routes: {
      home: "/",
      foundation: "/foundation",
      formal: "/formal",
      terminology: "/terminology",
      cases: "/cases",
      liveCasePattern: "/cases/live/{id}",
      candidates: "/drafts",
      candidatePattern: "/drafts/{id}",
      candidateFormalPattern: "/drafts/{id}/formal",
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
      foundationTriad,
      foundation,
      productWitness,
      practiceGuidelines,
      productProofPath,
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
            "foundation-triad",
            "product-witness.principle",
            "foundation-triad.links",
          ],
          maxPrimarySections: 2,
          note: "The first viewport should ask the system-continuity question, state KFD's engineering answer and claim boundary, and expose the foundation triad before registry, renderer, or implementation detail.",
        },
        primary: ["future-picture", "foundation-triad", "why-this-question-matters", "what-kfd-is", "adoption-boundary", "current-candidates", "product-proof-path"],
        detail: {
          route: "/foundation",
          source: FOUNDATION_PATH,
          sections: ["foundation-structure", "load-bearing-product-witness", "practice-guidelines"],
        },
        readingPath: ["/", "/foundation", "/formal", "/cases", "/drafts", "/{number}"],
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
        "foundation explanation page from docs/foundation.md",
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
  formalText: readFileSync(FORMAL_PATH, "utf8"),
  casesText: readFileSync(CASES_PATH, "utf8"),
  candidateIndexText: readFileSync(CANDIDATE_INDEX_PATH, "utf8"),
  candidateRegistry: JSON.parse(readFileSync(CANDIDATE_REGISTRY_PATH, "utf8")),
  registry: JSON.parse(readFileSync(REGISTRY_PATH, "utf8")),
  standards: JSON.parse(readFileSync(STANDARDS_PATH, "utf8")),
  liveCaseRegistry: JSON.parse(readFileSync(LIVE_CASE_REGISTRY_PATH, "utf8")),
  terminology: JSON.parse(readFileSync(TERMINOLOGY_CONTRACT_PATH, "utf8")),
  activationContracts: JSON.parse(readFileSync(ACTIVATION_CONTRACTS_PATH, "utf8")),
});

export const generatedSiteBundle = () => buildSiteBundle(readInputs());

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const bundle = generatedSiteBundle();
  writeFileSync(SITE_BUNDLE_PATH, `${JSON.stringify(bundle, null, 2)}\n`);
  console.log(`updated ${SITE_BUNDLE_PATH}`);
}
