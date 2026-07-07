import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const README_PATH = "README.md";
const REGISTRY_PATH = "registry.json";
const SITE_BUNDLE_PATH = "site/kfd-site.json";

const normalizeLines = (value) => String(value || "").replace(/\r\n/g, "\n").trim();

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
  return {
    heading: "Foundation triad",
    intro: paragraphBlocks(before)[0] || "",
    commitments,
    summary: paragraphBlocks(after)[0] || "",
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

const parseFoundationModel = (markdown) => {
  const chainMatch = markdown.match(/```text\n([\s\S]*?)\n```/);
  if (!chainMatch) throw new Error("Foundation model must include the chain text code block");
  const beforeChain = markdown.slice(0, chainMatch.index).trim();
  const afterChain = markdown.slice((chainMatch.index ?? 0) + chainMatch[0].length).trim();
  return {
    heading: "Foundation model",
    intro: paragraphBlocks(beforeChain)[0] || "",
    layers: parseMarkdownTable(beforeChain),
    chain: chainMatch[1].trim(),
    explanation: paragraphBlocks(afterChain),
  };
};

const parseProductProofPath = (markdown) => ({
  heading: "Product proof path",
  body: paragraphBlocks(markdown)[0] || "",
});

const section = ({ id, sourceHeading, title, markdown, role, priority, presentation, firstScreen = false }) => ({
  id,
  sourcePath: README_PATH,
  sourceHeading,
  title,
  renderRole: role,
  homepagePriority: priority,
  defaultPresentation: presentation,
  includeInFirstScreen: firstScreen,
  markdown: normalizeLines(markdown),
});

export const buildSiteBundle = ({ readmeText, registry }) => {
  const readme = parseReadme(readmeText);
  const { lead, decisionKinds } = introLead(readme.intro);
  const foundationTriad = parseFoundationTriad(readme.sections["Foundation triad"] || "");
  const foundationModel = parseFoundationModel(readme.sections["Foundation model"] || "");
  const productProofPath = parseProductProofPath(readme.sections["Product proof path"] || "");
  const entries = registry.entries || [];

  const homepageSections = [
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
      id: "foundation-model",
      sourceHeading: "Foundation model",
      title: "Foundation model",
      markdown: readme.sections["Foundation model"],
      role: "primary",
      priority: 20,
      presentation: "layered-model",
      firstScreen: true,
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
    schemaVersion: 1,
    contract: "kfd-site-bundle",
    source: {
      package: "@kungfu-tech/kfd",
      homepageTextSource: README_PATH,
      registry: REGISTRY_PATH,
      decisionsDir: "decisions",
    },
    routes: {
      home: "/",
      decisionPattern: "/{number}",
      llms: "/llms.txt",
      manifest: "/manifest.json",
    },
    homepage: {
      title: readme.title,
      lead,
      decisionKinds,
      foundationTriad,
      foundationModel,
      productProofPath,
      currentDecisions: {
        heading: "Current decisions",
        source: REGISTRY_PATH,
      },
      sections: homepageSections,
      displayPlan: {
        firstScreen: {
          include: ["title", "lead", "foundation-triad", "foundation-model.chain"],
          maxPrimarySections: 2,
          note: "The first viewport should establish KFD identity and the three-decision worldview without showing renderer or developer contract text.",
        },
        primary: ["foundation-triad", "foundation-model", "adoption-boundary", "product-proof-path"],
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
    decisionPages: {
      source: REGISTRY_PATH,
      bodySource: "registry.entries[].path",
      stableUrlField: "url",
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
            "decisions/kfd-N.md",
            REGISTRY_PATH,
            "standards.json",
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
    renderingBoundary: {
      ownedByKfd: [
        "homepage title and text",
        "homepage section projection from README.md",
        "foundation triad commitments",
        "foundation model layers and chain",
        "product proof path text",
        "agent quickstart text",
        "decision metadata",
        "decision metadata fact source",
        "license and official-status boundary",
        "decision markdown bodies",
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
  registry: JSON.parse(readFileSync(REGISTRY_PATH, "utf8")),
});

export const generatedSiteBundle = () => buildSiteBundle(readInputs());

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const bundle = generatedSiteBundle();
  writeFileSync(SITE_BUNDLE_PATH, `${JSON.stringify(bundle, null, 2)}\n`);
  console.log(`updated ${SITE_BUNDLE_PATH}`);
}
