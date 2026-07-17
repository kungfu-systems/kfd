// Registry conformance check: the registry, decision documents, and release
// impact ledger must agree, so a release cannot ship evidence that lies about
// its contents or versioning surface.
import { readFileSync, existsSync, readdirSync } from "node:fs";
import crypto from "node:crypto";
import { generatedSiteBundle } from "./update-site-bundle.mjs";

const fail = (msg) => { console.error(`check: ${msg}`); process.exitCode = 1; };
const sha256File = (filePath) => crypto.createHash("sha256").update(readFileSync(filePath)).digest("hex");
const requireFields = (value, required, label) => {
  for (const field of required ?? []) {
    if (value?.[field] === undefined) fail(`${label} missing required field ${field}`);
  }
};
const asSet = (items) => new Set(items ?? []);
const requireSameEnum = (actual, expected, label) => {
  const actualSet = asSet(actual);
  const expectedSet = asSet(expected);
  for (const value of expectedSet) {
    if (!actualSet.has(value)) fail(`${label} missing value ${value}`);
  }
  for (const value of actualSet) {
    if (!expectedSet.has(value)) fail(`${label} has unregistered value ${value}`);
  }
};
const registry = JSON.parse(readFileSync("registry.json", "utf8"));
const standardsMetadata = JSON.parse(readFileSync("standards.json", "utf8"));
const standardsSchema = JSON.parse(readFileSync("schemas/kfd-standards.schema.json", "utf8"));
const releaseImpact = JSON.parse(readFileSync("release-impact.json", "utf8"));
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const siteBundle = JSON.parse(readFileSync("site/kfd-site.json", "utf8"));
const expectedSiteBundle = generatedSiteBundle();
const kfd1WitnessPath = ".buildchain/kfd-1/contract-world.witness.json";
const kfd1Witness = existsSync(kfd1WitnessPath) ? JSON.parse(readFileSync(kfd1WitnessPath, "utf8")) : undefined;
const kfd2ClaimPath = ".buildchain/kfd-2/public-release-trust.claim.json";
const kfd2Claim = existsSync(kfd2ClaimPath) ? JSON.parse(readFileSync(kfd2ClaimPath, "utf8")) : undefined;
const kfd2TrustClaimsPath = ".buildchain/kfd-2/kfd-foundation.trust-claims.json";
const kfd2TrustClaims = existsSync(kfd2TrustClaimsPath) ? JSON.parse(readFileSync(kfd2TrustClaimsPath, "utf8")) : undefined;
const kfd2TrustAssessmentPath = ".buildchain/kfd-2/kfd-foundation.trust-assessment.json";
const kfd2TrustAssessment = existsSync(kfd2TrustAssessmentPath) ? JSON.parse(readFileSync(kfd2TrustAssessmentPath, "utf8")) : undefined;
const kfd3InterfacePath = ".buildchain/kfd-3/collaboration-interface.json";
const kfd3PrebuildWitnessPath = ".buildchain/kfd-3/collaboration-interface.prebuild.json";
const kfd3ArtifactWitnessPath = ".buildchain/kfd-3/collaboration-interface.artifact.json";
const kfd3Interface = existsSync(kfd3InterfacePath) ? JSON.parse(readFileSync(kfd3InterfacePath, "utf8")) : undefined;
const kfd3PrebuildWitness = existsSync(kfd3PrebuildWitnessPath) ? JSON.parse(readFileSync(kfd3PrebuildWitnessPath, "utf8")) : undefined;
const kfd3ArtifactWitness = existsSync(kfd3ArtifactWitnessPath) ? JSON.parse(readFileSync(kfd3ArtifactWitnessPath, "utf8")) : undefined;
const hashablePath = (filePath) => String(filePath || "").split("#", 1)[0];

const markdownPaths = [];
const collectMarkdownPaths = (directory = ".") => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === ".buildchain" || entry.name === ".git" || entry.name === "node_modules") continue;
    const path = directory === "." ? entry.name : `${directory}/${entry.name}`;
    if (entry.isDirectory()) collectMarkdownPaths(path);
    else if (entry.isFile() && entry.name.endsWith(".md")) markdownPaths.push(path);
  }
};
collectMarkdownPaths();
for (const markdownPath of markdownPaths) {
  const markdown = readFileSync(markdownPath, "utf8");
  if (!markdown.startsWith("---\n")) continue;
  const frontmatterEnd = markdown.indexOf("\n---", 4);
  if (frontmatterEnd === -1) continue;
  const frontmatter = markdown.slice(4, frontmatterEnd);
  if (/^ai_provenance\s*:/m.test(frontmatter)) {
    fail(`${markdownPath} public frontmatter must not expose ai_provenance`);
  }
}

const expectedEvidenceUpdate = "node scripts/update-site-bundle.mjs && node scripts/update-kfd-2-claim.mjs && node scripts/update-kfd-1-witness.mjs && node scripts/update-kfd-3-witness.mjs";
if (packageJson.scripts?.["update:evidence"] !== expectedEvidenceUpdate) {
  fail("package.json update:evidence must preserve the site -> KFD-2 -> KFD-1 -> KFD-3 dependency order");
}

if (registry.schemaVersion !== 1) fail(`unsupported schemaVersion ${registry.schemaVersion}`);
if (registry.contract !== "kfd-registry") fail(`unexpected contract ${registry.contract}`);
if (standardsMetadata.schemaVersion !== 1) fail(`unsupported standards schemaVersion ${standardsMetadata.schemaVersion}`);
if (standardsMetadata.contract !== "kfd-standards-metadata") fail(`unexpected standards contract ${standardsMetadata.contract}`);
if (standardsMetadata.metadataSchema?.id !== "https://kfd.libkungfu.dev/schemas/kfd-standards.schema.json") {
  fail("standards metadataSchema.id must be the canonical KFD standards schema URI");
}
if (standardsMetadata.metadataSchema?.path !== "schemas/kfd-standards.schema.json") {
  fail("standards metadataSchema.path must be schemas/kfd-standards.schema.json");
}
if (standardsSchema.$id !== standardsMetadata.metadataSchema?.id) {
  fail("standards schema $id must match standards metadataSchema.id");
}
if (standardsSchema.properties?.contract?.const !== "kfd-standards-metadata") {
  fail("standards schema must describe the kfd-standards-metadata contract");
}
requireFields(standardsMetadata, standardsSchema.required, "standards metadata");
requireFields(standardsMetadata.metadataSchema, standardsSchema.properties?.metadataSchema?.required, "standards metadataSchema");
requireFields(standardsMetadata.source, standardsSchema.properties?.source?.required, "standards source");
if (siteBundle.schemaVersion !== 1) fail(`unsupported site bundle schemaVersion ${siteBundle.schemaVersion}`);
if (siteBundle.contract !== "kfd-site-bundle") fail(`unexpected site bundle contract ${siteBundle.contract}`);
if (JSON.stringify(siteBundle) !== JSON.stringify(expectedSiteBundle)) {
  fail("site/kfd-site.json must match the generated README.md homepage bundle; run npm run update:site-bundle");
}
if (siteBundle.source?.homepageTextSource !== "README.md") fail("site bundle homepageTextSource must be README.md");
if (siteBundle.source?.foundationTextSource !== "docs/foundation-model.md") {
  fail("site bundle foundationTextSource must be docs/foundation-model.md");
}
if (siteBundle.source?.casesTextSource !== "docs/primitive-discovery-cases.md") {
  fail("site bundle casesTextSource must be docs/primitive-discovery-cases.md");
}
if (siteBundle.source?.registry !== "registry.json") fail("site bundle registry source must be registry.json");
if (siteBundle.source?.decisionsDir !== "decisions") fail("site bundle decisionsDir must be decisions");
if (siteBundle.homepage?.title !== "KFD — Kung Fu Decisions") fail("site bundle homepage title must match README H1 text");
if (!Array.isArray(siteBundle.homepage?.sections) || siteBundle.homepage.sections.length === 0) {
  fail("site bundle homepage.sections must expose generated homepage and foundation sections");
}
if (siteBundle.routes?.foundation !== "/foundation") fail("site bundle routes.foundation must be /foundation");
if (siteBundle.routes?.cases !== "/cases") fail("site bundle routes.cases must be /cases");
if (!siteBundle.homepage?.futurePicture?.pastToFuture || !siteBundle.homepage?.futurePicture?.kungfuPath) {
  fail("site bundle homepage.futurePicture must expose the civilizational shift and Kungfu path");
}
if (!siteBundle.homepage?.displayPlan?.firstScreen?.include?.includes("future-picture.pastToFuture")) {
  fail("site bundle homepage displayPlan firstScreen must include future-picture.pastToFuture");
}
if (!siteBundle.homepage?.displayPlan?.firstScreen?.include?.includes("future-picture.kungfuPath")) {
  fail("site bundle homepage displayPlan firstScreen must include future-picture.kungfuPath");
}
if (!siteBundle.homepage?.displayPlan?.firstScreen?.include?.includes("foundation-triad")) {
  fail("site bundle homepage displayPlan firstScreen must include foundation-triad");
}
if (!siteBundle.homepage?.displayPlan?.firstScreen?.include?.includes("product-witness.principle")) {
  fail("site bundle homepage displayPlan firstScreen must include product-witness.principle");
}
if (!siteBundle.homepage?.displayPlan?.firstScreen?.include?.includes("foundation-triad.links")) {
  fail("site bundle homepage displayPlan firstScreen must include foundation-triad.links");
}
if (!siteBundle.homepage?.foundationTriad?.links?.some((entry) => entry.url === "/foundation")) {
  fail("site bundle homepage foundation triad must expose the /foundation depth choice");
}
if (!siteBundle.homepage?.foundationTriad?.links?.some((entry) => entry.url === "/cases")) {
  fail("site bundle homepage foundation triad must expose the /cases historical depth choice");
}
const requiredHomepageSections = {
  "future-picture": "README.md",
  "foundation-triad": "README.md",
  "what-kfd-is": "README.md",
  "adoption-boundary": "README.md",
  "product-proof-path": "README.md",
  "agent-quickstart": "README.md",
  "decision-metadata": "README.md",
  "foundation-model": "docs/foundation-model.md",
  "load-bearing-product-witness": "docs/foundation-model.md",
  "practice-guidelines": "docs/foundation-model.md",
};
for (const [requiredSection, sourcePath] of Object.entries(requiredHomepageSections)) {
  if (!siteBundle.homepage.sections.some((entry) => entry.id === requiredSection && entry.sourcePath === sourcePath && entry.markdown)) {
    fail(`site bundle homepage.sections must include ${sourcePath} projection ${requiredSection}`);
  }
}
if (
  siteBundle.homepage?.displayPlan?.detail?.route !== "/foundation" ||
  siteBundle.homepage?.displayPlan?.detail?.source !== "docs/foundation-model.md"
) {
  fail("site bundle homepage displayPlan.detail must route foundation detail to docs/foundation-model.md");
}
if (
  siteBundle.foundationPage?.id !== "foundation-model" ||
  siteBundle.foundationPage?.sourcePath !== "docs/foundation-model.md" ||
  siteBundle.foundationPage?.url !== "/foundation" ||
  siteBundle.foundationPage?.normative !== false ||
  !siteBundle.foundationPage?.markdown
) {
  fail("site bundle foundationPage must expose the non-normative /foundation explanation from docs/foundation-model.md");
}
if (
  siteBundle.casesPage?.id !== "primitive-discovery-cases" ||
  siteBundle.casesPage?.sourcePath !== "docs/primitive-discovery-cases.md" ||
  siteBundle.casesPage?.url !== "/cases" ||
  siteBundle.casesPage?.normative !== false ||
  !siteBundle.casesPage?.markdown
) {
  fail("site bundle casesPage must expose the non-normative /cases companion from docs/primitive-discovery-cases.md");
}
if (!siteBundle.casesPage?.markdown?.startsWith("# Primitive Discovery in History")) {
  fail("site bundle casesPage markdown must strip source frontmatter and begin with its H1");
}
if (!siteBundle.homepage?.displayPlan?.readingPath?.includes("/cases")) {
  fail("site bundle homepage displayPlan readingPath must include /cases");
}
if (!existsSync("docs/foundation-model.md")) fail("missing docs/foundation-model.md");
else if (!readFileSync("docs/foundation-model.md", "utf8").startsWith("# KFD Foundation Model")) {
  fail("docs/foundation-model.md must start with the KFD Foundation Model H1");
}
if (!existsSync("docs/primitive-discovery-cases.md")) fail("missing docs/primitive-discovery-cases.md");
else if (!readFileSync("docs/primitive-discovery-cases.md", "utf8").includes("# Primitive Discovery in History")) {
  fail("docs/primitive-discovery-cases.md must contain the Primitive Discovery in History H1");
}
const adoptionBoundary = siteBundle.homepage.sections.find((entry) => entry.id === "adoption-boundary");
if (adoptionBoundary?.includeInFirstScreen !== false || adoptionBoundary?.renderRole !== "primary") {
  fail("site bundle adoption-boundary must be primary content outside the first screen");
}
if (siteBundle.homepage.sections.some((entry) => entry.id === "homepage-content-contract")) {
  fail("site bundle homepage.sections must not render the renderer contract as homepage content");
}
if (
  siteBundle.homepage?.rendererContract?.id !== "homepage-content-contract" ||
  siteBundle.homepage?.rendererContract?.renderAsHomepageContent !== false ||
  !siteBundle.homepage?.rendererContract?.markdown
) {
  fail("site bundle homepage.rendererContract must expose the README renderer contract outside homepage.sections");
}
if (siteBundle.homepage?.currentDecisions?.source !== "registry.json") fail("site bundle currentDecisions source must be registry.json");
if (siteBundle.decisionPages?.source !== "registry.json") fail("site bundle decisionPages source must be registry.json");
if (siteBundle.decisionPages?.bodySource !== "registry.entries[].path") fail("site bundle decision page body source must be registry.entries[].path");
if (siteBundle.routes?.decisionUsagePattern !== "/{number}/usage") fail("site bundle routes.decisionUsagePattern must be /{number}/usage");
if (siteBundle.decisionPages?.usagePages?.relationship !== "usage-child-of-decision") {
  fail("site bundle decisionPages.usagePages.relationship must be usage-child-of-decision");
}
if (siteBundle.decisionPages?.usagePages?.bodySource !== "docs/KFD-{number}-usage.md") {
  fail("site bundle decisionPages.usagePages.bodySource must be docs/KFD-{number}-usage.md");
}
if (siteBundle.decisionPages?.usagePages?.stableUrlPattern !== "/{number}/usage") {
  fail("site bundle decisionPages.usagePages.stableUrlPattern must be /{number}/usage");
}
const usagePagesByDecision = new Map((siteBundle.decisionPages?.usagePages?.pages ?? []).map((entry) => [entry.decisionId, entry]));
for (const e of registry.entries) {
  const usagePage = usagePagesByDecision.get(e.id);
  const expectedPath = `docs/KFD-${e.number}-usage.md`;
  const expectedUrl = `${e.url}/usage`;
  if (!usagePage) fail(`site bundle decisionPages.usagePages missing ${e.id}`);
  else {
    if (usagePage.parentPath !== e.path) fail(`site bundle ${e.id} usage parentPath must be ${e.path}`);
    if (usagePage.parentUrl !== e.url) fail(`site bundle ${e.id} usage parentUrl must be ${e.url}`);
    if (usagePage.path !== expectedPath) fail(`site bundle ${e.id} usage path must be ${expectedPath}`);
    if (usagePage.sourcePath !== expectedPath) fail(`site bundle ${e.id} usage sourcePath must be ${expectedPath}`);
    if (usagePage.url !== expectedUrl) fail(`site bundle ${e.id} usage url must be ${expectedUrl}`);
    if (usagePage.sourceExists !== true) fail(`site bundle ${e.id} usage sourceExists must be true`);
  }
  if (!existsSync(expectedPath)) fail(`missing usage document ${expectedPath} for ${e.id}`);
}
for (const decisionId of usagePagesByDecision.keys()) {
  if (!registry.entries.some((entry) => entry.id === decisionId)) {
    fail(`site bundle decisionPages.usagePages has unknown decision ${decisionId}`);
  }
}
if (siteBundle.decisionPages?.metadata?.licenseBoundary?.license !== "Apache-2.0") {
  fail("site bundle decision metadata licenseBoundary.license must be Apache-2.0");
}
if (siteBundle.decisionPages?.metadata?.licenseBoundary?.licenseFile !== "LICENSE") {
  fail("site bundle decision metadata licenseBoundary.licenseFile must be LICENSE");
}
if (siteBundle.decisionPages?.metadata?.licenseBoundary?.officialStatusAndTrademarks !== "TRADEMARKS.md") {
  fail("site bundle decision metadata licenseBoundary.officialStatusAndTrademarks must be TRADEMARKS.md");
}
const sitePublicFactSource = siteBundle.decisionPages?.metadata?.publicFactSource;
if (sitePublicFactSource?.kind !== "git-repository") fail("site bundle decision metadata publicFactSource.kind must be git-repository");
if (sitePublicFactSource?.host !== "github") fail("site bundle decision metadata publicFactSource.host must be github");
if (sitePublicFactSource?.repository !== "kungfu-systems/kfd") fail("site bundle decision metadata publicFactSource.repository must be kungfu-systems/kfd");
if (sitePublicFactSource?.url !== "https://github.com/kungfu-systems/kfd") fail("site bundle decision metadata publicFactSource.url must be the KFD GitHub repository");
if (sitePublicFactSource?.loadBearingCoordinate !== "commit-addressed repository contents") {
  fail("site bundle decision metadata publicFactSource.loadBearingCoordinate must be commit-addressed repository contents");
}
if (sitePublicFactSource?.stableRenderedIndex !== "https://kfd.libkungfu.dev") {
  fail("site bundle decision metadata publicFactSource.stableRenderedIndex must be https://kfd.libkungfu.dev");
}
for (const requiredPath of ["decisions/KFD-N.md", "registry.json", "standards.json"]) {
  if (!sitePublicFactSource?.canonicalPaths?.includes(requiredPath)) {
    fail(`site bundle decision metadata publicFactSource.canonicalPaths must include ${requiredPath}`);
  }
}
for (const requiredFile of ["README.md", "TRADEMARKS.md", "decisions", "registry.json", "standards.json", "kfd.release.json", "schemas", "site", "buildchain.contract-lock.json", "buildchain.release-propagation.json", "release-impact.json", ".buildchain/kfd-1/contract-world.witness.json", ".buildchain/kfd-2", ".buildchain/kfd-3", "docs"]) {
  if (!Array.isArray(packageJson.files) || !packageJson.files.includes(requiredFile)) {
    fail(`package.json files[] must include ${requiredFile}`);
  }
}
for (const requiredExport of ["./TRADEMARKS.md", "./registry.json", "./standards.json", "./kfd.release.json", "./site/kfd-site.json", "./buildchain.contract-lock.json", "./buildchain.release-propagation.json", "./release-impact.json", "./buildchain/kfd-1/contract-world.witness.json", "./buildchain/kfd-2/public-release-trust.claim.json", "./buildchain/kfd-2/kfd-foundation.trust-claims.json", "./buildchain/kfd-2/kfd-foundation.trust-assessment.json", "./buildchain/kfd-3/collaboration-interface.json", "./buildchain/kfd-3/collaboration-interface.prebuild.json", "./buildchain/kfd-3/collaboration-interface.artifact.json", "./docs/*", "./schemas/*.json", "./schemas/*/*.json"]) {
  if (!packageJson.exports || !packageJson.exports[requiredExport]) {
    fail(`package.json exports must include ${requiredExport}`);
  }
}

const seen = new Set();
const statuses = new Set(["draft", "active", "superseded"]);
const kinds = new Set(["principle", "procedure"]);
const superseded = new Map();
for (const e of registry.entries) {
  if (!Number.isInteger(e.number) || e.number < 1) fail(`bad number ${e.number}`);
  if (seen.has(e.number)) fail(`duplicate number ${e.number}`);
  seen.add(e.number);
  if (e.id !== `KFD-${e.number}`) fail(`id ${e.id} does not match number ${e.number}`);
  if (e.slug !== `kfd-${e.number}`) fail(`${e.id} slug must be kfd-${e.number}, not ${e.slug}`);
  if (e.path !== `decisions/KFD-${e.number}.md`) {
    fail(`${e.id} path must be decisions/KFD-${e.number}.md, not ${e.path}`);
  }
  if (!kinds.has(e.kind)) fail(`bad kind ${e.kind} on ${e.id}`);
  if (!statuses.has(e.status)) fail(`bad status ${e.status} on ${e.id}`);
  if (e.status === "superseded") {
    if (!Array.isArray(e.supersededBy) || e.supersededBy.length === 0) {
      fail(`${e.id} is superseded but does not declare supersededBy`);
    } else {
      superseded.set(e.id, e.supersededBy);
    }
  }
  if (!existsSync(e.path)) fail(`missing document ${e.path} for ${e.id}`);
  else {
    const doc = readFileSync(e.path, "utf8");
    if (!doc.startsWith(`# ${e.id}:`)) fail(`${e.path} heading does not open with "# ${e.id}:"`);
    if (!doc.includes(`Status: ${e.status}`)) fail(`${e.path} status line does not say ${e.status}`);
    if (!doc.includes(`Kind: ${e.kind}`)) fail(`${e.path} kind line does not say ${e.kind}`);
    if (e.status === "superseded") {
      for (const successor of superseded.get(e.id) ?? []) {
        if (!doc.includes(successor)) fail(`${e.path} does not cite successor ${successor}`);
      }
    }
  }
  const standard = standardsMetadata.standards?.[e.slug];
  if (!standard) fail(`standards metadata missing ${e.slug}`);
  else {
    requireFields(standard, standardsSchema.$defs?.standard?.required, `${e.id} standards metadata`);
    if (standard.key !== e.slug) fail(`${e.id} standard key must be ${e.slug}`);
    if (standard.id !== e.id) fail(`${e.id} standard id mismatch in standards metadata`);
    if (standard.number !== e.number) fail(`${e.id} standard number mismatch in standards metadata`);
    if (standard.label !== e.id) fail(`${e.id} standard label must be ${e.id}`);
    if (standard.title !== e.title) fail(`${e.id} standard title must match registry title`);
    if (standard.kind !== e.kind) fail(`${e.id} standard kind must match registry kind`);
    if (standard.status !== e.status) fail(`${e.id} standard status must match registry status`);
    if (standard.document?.path !== e.path) fail(`${e.id} standard document path must match registry path`);
    if (standard.document?.url !== e.url) fail(`${e.id} standard document url must match registry url`);
    if (!/^[0-9a-f]{64}$/.test(standard.document?.sha256 || "")) {
      fail(`${e.id} standard document sha256 is required`);
    } else if (existsSync(e.path) && standard.document.sha256 !== sha256File(e.path)) {
      fail(`${e.id} standard document sha256 does not match ${e.path}`);
    }
    if (standard.metadataSchemaVersion !== standardsMetadata.metadataSchema?.version) {
      fail(`${e.id} standard metadataSchemaVersion must match metadata schema version`);
    }
    if (standard.schemaIds?.metadata !== standardsMetadata.metadataSchema?.id) {
      fail(`${e.id} standard schemaIds.metadata must match metadata schema id`);
    }
    if (standard.schemaPaths?.metadata !== standardsMetadata.metadataSchema?.path) {
      fail(`${e.id} standard schemaPaths.metadata must match metadata schema path`);
    }
    for (const [name, schemaPath] of Object.entries(standard.schemaPaths ?? {})) {
      if (!existsSync(schemaPath)) fail(`${e.id} schemaPaths.${name} points to missing ${schemaPath}`);
      else if (name !== "metadata") {
        const schemaDoc = JSON.parse(readFileSync(schemaPath, "utf8"));
        if (standard.schemaIds?.[name] && schemaDoc.$id !== standard.schemaIds[name]) {
          fail(`${e.id} schemaPaths.${name} $id must match schemaIds.${name}`);
        }
      }
    }
    for (const [name, iface] of Object.entries(standard.interfaces ?? {})) {
      requireFields(
        iface,
        standardsSchema.$defs?.standard?.properties?.interfaces?.additionalProperties?.required,
        `${e.id} interfaces.${name}`
      );
      if (iface.schemaId !== standard.schemaIds?.[name]) fail(`${e.id} interfaces.${name}.schemaId must match schemaIds.${name}`);
      if (iface.schemaPath !== standard.schemaPaths?.[name]) fail(`${e.id} interfaces.${name}.schemaPath must match schemaPaths.${name}`);
      if (!Number.isInteger(iface.schemaVersion) || iface.schemaVersion < 1) {
        fail(`${e.id} interfaces.${name}.schemaVersion must be a positive integer`);
      }
      if (!iface.compatibilityRule) fail(`${e.id} interfaces.${name}.compatibilityRule is required`);
      if (existsSync(iface.schemaPath)) {
        const schemaDoc = JSON.parse(readFileSync(iface.schemaPath, "utf8"));
        if (schemaDoc.properties?.schemaVersion?.const !== iface.schemaVersion) {
          fail(`${e.id} interfaces.${name}.schemaVersion must match schema properties.schemaVersion.const`);
        }
        if (schemaDoc.properties?.contract?.const !== iface.contract) {
          fail(`${e.id} interfaces.${name}.contract must match schema properties.contract.const`);
        }
      }
    }
  }
}
for (const key of Object.keys(standardsMetadata.standards ?? {})) {
  if (!registry.entries.some((e) => e.slug === key)) fail(`standards metadata contains unknown ${key}`);
}
const kfd1 = standardsMetadata.standards?.["kfd-1"];
if (kfd1?.schemaIds?.contractWorld !== "https://kfd.libkungfu.dev/schemas/kfd-1/contract-world.schema.json") {
  fail("KFD-1 standards metadata must expose the canonical contractWorld schema URI");
}
if (kfd1?.schemaIds?.witness !== "https://kfd.libkungfu.dev/schemas/kfd-1/witness.schema.json") {
  fail("KFD-1 standards metadata must expose the canonical witness schema URI");
}
if (kfd1?.schemaIds?.publicationUrlSemantics !== "https://kfd.libkungfu.dev/schemas/kfd-1/publication-url-semantics.schema.json") {
  fail("KFD-1 standards metadata must expose the canonical publicationUrlSemantics schema URI");
}
if (kfd1?.schemaPaths?.publicationUrlSemantics !== "schemas/kfd-1/publication-url-semantics.schema.json") {
  fail("KFD-1 standards metadata must expose the publicationUrlSemantics schema path");
}
for (const concept of ["factSource", "contractWorld", "weldedSurfaceRegister", "witness", "surfaceClass", "compatibilityImpact", "impactProjection", "publicationUrlSemantics", "canonicalUrl", "latestUrl", "immutableVersionUrl", "immutableArtifact", "archivePolicy", "sourceCoordinate"]) {
  if (!kfd1?.concepts?.[concept]) fail(`KFD-1 standards metadata missing concept ${concept}`);
}
for (const iface of ["contractWorld", "witness", "publicationUrlSemantics"]) {
  if (!kfd1?.interfaces?.[iface]) fail(`KFD-1 standards metadata missing interface ${iface}`);
}
const expectedKfd1SurfaceClasses = ["integration-time", "cross-time"];
const expectedKfd1ImpactClasses = ["breaking", "additive", "none", "unclassifiable"];
const kfd1ContractWorldSchema = JSON.parse(readFileSync("schemas/kfd-1/contract-world.schema.json", "utf8"));
const kfd1WitnessSchema = JSON.parse(readFileSync("schemas/kfd-1/witness.schema.json", "utf8"));
const kfd1PublicationUrlSemanticsSchema = JSON.parse(readFileSync("schemas/kfd-1/publication-url-semantics.schema.json", "utf8"));
for (const [schemaName, schemaDoc] of [["contractWorld", kfd1ContractWorldSchema], ["witness", kfd1WitnessSchema]]) {
  requireSameEnum(schemaDoc.$defs?.surfaceClass?.enum, expectedKfd1SurfaceClasses, `KFD-1 ${schemaName} surfaceClass`);
  requireSameEnum(schemaDoc.$defs?.compatibilityImpact?.enum, expectedKfd1ImpactClasses, `KFD-1 ${schemaName} compatibilityImpact`);
  for (const impact of expectedKfd1ImpactClasses) {
    if (!schemaDoc.$defs?.impactProjection?.required?.includes(impact)) {
      fail(`KFD-1 ${schemaName} impactProjection must require ${impact}`);
    }
  }
}
if (kfd1PublicationUrlSemanticsSchema.properties?.contract?.const !== "kfd-1-publication-url-semantics") {
  fail("KFD-1 publicationUrlSemantics schema must describe the kfd-1-publication-url-semantics contract");
}
if (kfd1PublicationUrlSemanticsSchema.properties?.standard?.const !== "kfd-1") {
  fail("KFD-1 publicationUrlSemantics schema must declare standard kfd-1");
}
for (const requiredField of ["canonicalUrl", "immutableVersionBaseUrl"]) {
  if (!kfd1PublicationUrlSemanticsSchema.$defs?.routes?.required?.includes(requiredField)) {
    fail(`KFD-1 publicationUrlSemantics routes must require ${requiredField}`);
  }
}
for (const [field, expectedConst] of [
  ["immutability", "published-version-artifacts-are-append-only"],
  ["sameVersionDigestPolicy", "fail-on-digest-change"],
  ["destructiveSyncPolicy", "must-not-delete-immutable-prefix"],
  ["historyRetention", "site-builds-must-preserve-declared-historical-versions"],
]) {
  if (kfd1PublicationUrlSemanticsSchema.$defs?.archivePolicy?.properties?.[field]?.const !== expectedConst) {
    fail(`KFD-1 publicationUrlSemantics archivePolicy.${field} must be ${expectedConst}`);
  }
}
const kfd1SurfaceRegister = kfd1?.surfaceRegister;
if (kfd1SurfaceRegister?.factSource !== "standards.json#/standards/kfd-1/surfaceRegister") {
  fail("KFD-1 surfaceRegister must declare standards.json as its fact source");
}
requireSameEnum(kfd1SurfaceRegister?.surfaceClasses, expectedKfd1SurfaceClasses, "KFD-1 surfaceRegister surfaceClasses");
requireSameEnum(kfd1SurfaceRegister?.compatibilityImpactClasses, expectedKfd1ImpactClasses, "KFD-1 surfaceRegister compatibilityImpactClasses");
if (!Array.isArray(kfd1SurfaceRegister?.surfaces) || kfd1SurfaceRegister.surfaces.length === 0) {
  fail("KFD-1 surfaceRegister.surfaces[] is required");
} else {
  const surfaceIds = new Set();
  for (const [index, surface] of kfd1SurfaceRegister.surfaces.entries()) {
    if (!surface.id) fail(`KFD-1 surfaceRegister.surfaces[${index}].id is required`);
    else if (surfaceIds.has(surface.id)) fail(`KFD-1 surfaceRegister duplicate surface ${surface.id}`);
    else surfaceIds.add(surface.id);
    if (!expectedKfd1SurfaceClasses.includes(surface.class)) fail(`KFD-1 surfaceRegister ${surface.id} has invalid class`);
    if (!Array.isArray(surface.classes) || !surface.classes.includes(surface.class)) {
      fail(`KFD-1 surfaceRegister ${surface.id} classes[] must include class`);
    }
    if (!surface.description) fail(`KFD-1 surfaceRegister ${surface.id} description is required`);
    if (!surface.sourcePath || !existsSync(surface.sourcePath)) fail(`KFD-1 surfaceRegister ${surface.id} sourcePath is missing`);
    for (const impact of expectedKfd1ImpactClasses) {
      if (!surface.impactProjection?.[impact]) fail(`KFD-1 surfaceRegister ${surface.id} missing impactProjection.${impact}`);
    }
  }
}
const kfd2 = standardsMetadata.standards?.["kfd-2"];
if (kfd2?.schemaIds?.trustTaxonomy !== "https://kfd.libkungfu.dev/schemas/kfd-2/trust-taxonomy.schema.json") {
  fail("KFD-2 standards metadata must expose the canonical trustTaxonomy schema URI");
}
if (kfd2?.schemaIds?.trustClaims !== "https://kfd.libkungfu.dev/schemas/kfd-2/trust-claims.schema.json") {
  fail("KFD-2 standards metadata must expose the canonical trustClaims schema URI");
}
if (kfd2?.schemaIds?.trustAssessment !== "https://kfd.libkungfu.dev/schemas/kfd-2/trust-assessment.schema.json") {
  fail("KFD-2 standards metadata must expose the canonical trustAssessment schema URI");
}
if (kfd2?.schemaIds?.releaseClaims !== "https://kfd.libkungfu.dev/schemas/kfd-2/release-claims.schema.json") {
  fail("KFD-2 standards metadata must expose the canonical releaseClaims schema URI");
}
if (kfd2?.schemaIds?.releaseTrustPassport !== "https://kfd.libkungfu.dev/schemas/kfd-2/release-trust-passport.schema.json") {
  fail("KFD-2 standards metadata must expose the canonical releaseTrustPassport schema URI");
}
if (kfd2?.schemaPaths?.releaseClaims !== "schemas/kfd-2/release-claims.schema.json") {
  fail("KFD-2 standards metadata must expose the releaseClaims schema path");
}
if (kfd2?.schemaPaths?.trustTaxonomy !== "schemas/kfd-2/trust-taxonomy.schema.json") {
  fail("KFD-2 standards metadata must expose the trustTaxonomy schema path");
}
if (kfd2?.schemaPaths?.trustClaims !== "schemas/kfd-2/trust-claims.schema.json") {
  fail("KFD-2 standards metadata must expose the trustClaims schema path");
}
if (kfd2?.schemaPaths?.trustAssessment !== "schemas/kfd-2/trust-assessment.schema.json") {
  fail("KFD-2 standards metadata must expose the trustAssessment schema path");
}
if (kfd2?.schemaPaths?.releaseTrustPassport !== "schemas/kfd-2/release-trust-passport.schema.json") {
  fail("KFD-2 standards metadata must expose the releaseTrustPassport schema path");
}
const kfd2TrustTaxonomySchema = JSON.parse(readFileSync("schemas/kfd-2/trust-taxonomy.schema.json", "utf8"));
const kfd2TrustClaimsSchema = JSON.parse(readFileSync("schemas/kfd-2/trust-claims.schema.json", "utf8"));
const kfd2TrustAssessmentSchema = JSON.parse(readFileSync("schemas/kfd-2/trust-assessment.schema.json", "utf8"));
const kfd2ClaimsSchema = JSON.parse(readFileSync("schemas/kfd-2/release-claims.schema.json", "utf8"));
const kfd2TrustPassportSchema = JSON.parse(readFileSync("schemas/kfd-2/release-trust-passport.schema.json", "utf8"));
if (kfd2TrustTaxonomySchema.properties?.contract?.const !== "kfd-2-trust-taxonomy") {
  fail("KFD-2 trustTaxonomy schema must describe the kfd-2-trust-taxonomy contract");
}
if (kfd2TrustClaimsSchema.properties?.contract?.const !== "kfd-2-trust-claims") {
  fail("KFD-2 trustClaims schema must describe the kfd-2-trust-claims contract");
}
if (kfd2TrustAssessmentSchema.properties?.contract?.const !== "kfd-2-trust-assessment") {
  fail("KFD-2 trustAssessment schema must describe the kfd-2-trust-assessment contract");
}
if (kfd2ClaimsSchema.properties?.contract?.const !== "kfd-2-release-claims") {
  fail("KFD-2 releaseClaims schema must describe the kfd-2-release-claims contract");
}
if (kfd2TrustPassportSchema.properties?.contract?.const !== "kfd-2-release-trust-passport") {
  fail("KFD-2 releaseTrustPassport schema must describe the kfd-2-release-trust-passport contract");
}
const taxonomyMeta = kfd2TrustTaxonomySchema["x-kfd"];
if (taxonomyMeta?.extensionPolicy?.unknownValuePolicy !== "schema-validation-fail") {
  fail("KFD-2 trust taxonomy must fail unknown values");
}
if (taxonomyMeta?.extensionPolicy?.standardAction !== "open-kfd-extension-issue") {
  fail("KFD-2 trust taxonomy must tell agents to open a KFD extension issue for missing values");
}
if (taxonomyMeta?.extensionPolicy?.requestPath?.repository !== "https://github.com/kungfu-systems/kfd") {
  fail("KFD-2 trust taxonomy extension path must target the KFD GitHub repository");
}
if (taxonomyMeta?.extensionPolicy?.requestPath?.kind !== "github-issue") {
  fail("KFD-2 trust taxonomy extension path must be a GitHub issue");
}
for (const enumName of ["riskType", "trustImpact", "machineProvability", "agentAction"]) {
  requireSameEnum(
    kfd2TrustTaxonomySchema.$defs?.[enumName]?.enum,
    taxonomyMeta?.allowedValues?.[enumName],
    `KFD-2 trust taxonomy ${enumName}`
  );
}
const residualRiskRef = "https://kfd.libkungfu.dev/schemas/kfd-2/trust-taxonomy.schema.json#/$defs/residualRisk";
const downgradeReasonRef = "https://kfd.libkungfu.dev/schemas/kfd-2/trust-taxonomy.schema.json#/$defs/downgradeReason";
const checkResidualRisk = (risk, label) => {
  if (risk?.definedBy !== residualRiskRef) fail(`${label}.definedBy must reference the KFD-2 trust taxonomy residualRisk definition`);
  for (const [field, enumName] of [
    ["riskType", "riskType"],
    ["trustImpact", "trustImpact"],
    ["machineProvability", "machineProvability"],
    ["agentAction", "agentAction"],
  ]) {
    if (!kfd2TrustTaxonomySchema.$defs?.[enumName]?.enum?.includes(risk?.[field])) {
      fail(`${label}.${field} must be a KFD-2 trust taxonomy value`);
    }
  }
  if (!risk?.reason) fail(`${label}.reason is required`);
  if (!risk?.owner) fail(`${label}.owner is required`);
};
if (kfd2ClaimsSchema.$defs?.claim?.properties?.residualRisk?.items?.$ref !== residualRiskRef) {
  fail("KFD-2 releaseClaims residualRisk must reference the KFD-2 trust taxonomy residualRisk definition");
}
if (kfd2TrustClaimsSchema.$defs?.claim?.properties?.residualRisk?.items?.$ref !== residualRiskRef) {
  fail("KFD-2 trustClaims residualRisk must reference the KFD-2 trust taxonomy residualRisk definition");
}
if (kfd2TrustAssessmentSchema.$defs?.claimAssessment?.properties?.residualRisk?.items?.$ref !== residualRiskRef) {
  fail("KFD-2 trustAssessment residualRisk must reference the KFD-2 trust taxonomy residualRisk definition");
}
if (kfd2TrustAssessmentSchema.properties?.downgradeReasons?.items?.$ref !== downgradeReasonRef) {
  fail("KFD-2 trustAssessment downgradeReasons must reference the KFD-2 trust taxonomy downgradeReason definition");
}
if (kfd2TrustPassportSchema.$defs?.claimResult?.properties?.residualRisk?.items?.$ref !== residualRiskRef) {
  fail("KFD-2 releaseTrustPassport claim residualRisk must reference the KFD-2 trust taxonomy residualRisk definition");
}
if (kfd2TrustPassportSchema.properties?.downgradeReasons?.items?.$ref !== downgradeReasonRef) {
  fail("KFD-2 releaseTrustPassport downgradeReasons must reference the KFD-2 trust taxonomy downgradeReason definition");
}
for (const concept of ["facts", "trustClaim", "trustClaims", "trustAssessment", "claimSubject", "claimSubjectKind", "projection", "releaseClaim", "releaseClaims", "evidenceBinding", "auditBoundary", "residualRisk", "riskType", "trustImpact", "machineProvability", "agentAction", "extensionRequest", "releaseTrustPassport", "responsibilityState", "trust"]) {
  if (!kfd2?.concepts?.[concept]) fail(`KFD-2 standards metadata missing concept ${concept}`);
}
for (const iface of ["trustTaxonomy", "trustClaims", "trustAssessment", "releaseClaims", "releaseTrustPassport"]) {
  if (!kfd2?.interfaces?.[iface]) fail(`KFD-2 standards metadata missing interface ${iface}`);
}
const kfd3 = standardsMetadata.standards?.["kfd-3"];
if (kfd3?.schemaIds?.collaborationInterface !== "https://kfd.libkungfu.dev/schemas/kfd-3/collaboration-interface.schema.json") {
  fail("KFD-3 standards metadata must expose the canonical collaborationInterface schema URI");
}
if (kfd3?.schemaIds?.witness !== "https://kfd.libkungfu.dev/schemas/kfd-3/witness.schema.json") {
  fail("KFD-3 standards metadata must expose the canonical witness schema URI");
}
if (kfd3?.schemaPaths?.collaborationInterface !== "schemas/kfd-3/collaboration-interface.schema.json") {
  fail("KFD-3 standards metadata must expose the collaborationInterface schema path");
}
if (kfd3?.schemaPaths?.witness !== "schemas/kfd-3/witness.schema.json") {
  fail("KFD-3 standards metadata must expose the witness schema path");
}
const kfd3CollaborationSchema = JSON.parse(readFileSync("schemas/kfd-3/collaboration-interface.schema.json", "utf8"));
const kfd3WitnessSchema = JSON.parse(readFileSync("schemas/kfd-3/witness.schema.json", "utf8"));
if (kfd3CollaborationSchema.properties?.contract?.const !== "kfd-3-collaboration-interface") {
  fail("KFD-3 collaborationInterface schema must describe the kfd-3-collaboration-interface contract");
}
if (kfd3WitnessSchema.properties?.contract?.const !== "kfd-3-witness") {
  fail("KFD-3 witness schema must describe the kfd-3-witness contract");
}
if (kfd3WitnessSchema.properties?.residualRisk?.items?.$ref !== residualRiskRef) {
  fail("KFD-3 witness residualRisk must reference the KFD-2 trust taxonomy residualRisk definition");
}
if (!kfd3CollaborationSchema.properties?.extensionRequests) {
  fail("KFD-3 collaborationInterface schema must expose extensionRequests");
}
if (!kfd3CollaborationSchema.properties?.factSources) {
  fail("KFD-3 collaborationInterface schema must expose factSources");
}
if (!kfd3CollaborationSchema.properties?.valueEvidence) {
  fail("KFD-3 collaborationInterface schema must expose valueEvidence");
}
if (!kfd3CollaborationSchema.required?.includes("valueEvidence")) {
  fail("KFD-3 collaborationInterface schema must require valueEvidence");
}
if (!kfd3CollaborationSchema.$defs?.valueEvidence?.properties?.trustAssessment) {
  fail("KFD-3 collaborationInterface valueEvidence must support trustAssessment");
}
if (!kfd3WitnessSchema.properties?.evidence?.required?.includes("valueEvidence")) {
  fail("KFD-3 witness evidence must require valueEvidence");
}
if (!kfd3WitnessSchema.properties?.evidence?.properties?.valueEvidence) {
  fail("KFD-3 witness evidence must expose valueEvidence");
}
if (!kfd3CollaborationSchema.$defs?.extensionRequest?.properties?.requestPath?.properties?.kind?.enum?.includes("github-issue")) {
  fail("KFD-3 extensionRequest.requestPath.kind must support github-issue");
}
for (const concept of ["trustedValueClaim", "valueEvidence", "trustAssessmentLink", "participant", "collaborationInterface", "minimalEntrypoint", "closure", "choicePath", "extensionRequest", "extensionPath"]) {
  if (!kfd3?.concepts?.[concept]) fail(`KFD-3 standards metadata missing concept ${concept}`);
}
for (const iface of ["collaborationInterface", "witness"]) {
  if (!kfd3?.interfaces?.[iface]) fail(`KFD-3 standards metadata missing interface ${iface}`);
}
const kfd4 = standardsMetadata.standards?.["kfd-4"];
if (kfd4?.schemaIds?.observerPerspective !== "https://kfd.libkungfu.dev/schemas/kfd-4/observer-perspective.schema.json") {
  fail("KFD-4 standards metadata must expose the canonical observerPerspective schema URI");
}
if (kfd4?.schemaPaths?.observerPerspective !== "schemas/kfd-4/observer-perspective.schema.json") {
  fail("KFD-4 standards metadata must expose the observerPerspective schema path");
}
if (kfd4?.schemaIds?.perspectiveReplay !== "https://kfd.libkungfu.dev/schemas/kfd-4/perspective-replay.schema.json") {
  fail("KFD-4 standards metadata must expose the canonical perspectiveReplay schema URI");
}
if (kfd4?.schemaPaths?.perspectiveReplay !== "schemas/kfd-4/perspective-replay.schema.json") {
  fail("KFD-4 standards metadata must expose the perspectiveReplay schema path");
}
const kfd4ObserverPerspectiveSchema = JSON.parse(readFileSync("schemas/kfd-4/observer-perspective.schema.json", "utf8"));
const kfd4PerspectiveReplaySchema = JSON.parse(readFileSync("schemas/kfd-4/perspective-replay.schema.json", "utf8"));
if (kfd4ObserverPerspectiveSchema.properties?.contract?.const !== "kfd-4-observer-perspective") {
  fail("KFD-4 observerPerspective schema must describe the kfd-4-observer-perspective contract");
}
if (kfd4PerspectiveReplaySchema.properties?.contract?.const !== "kfd-4-perspective-replay") {
  fail("KFD-4 perspectiveReplay schema must describe the kfd-4-perspective-replay contract");
}
if (kfd4PerspectiveReplaySchema.properties?.standard?.const !== "kfd-4") {
  fail("KFD-4 perspectiveReplay schema must declare standard kfd-4");
}
for (const mode of ["perspective-preserving", "contrastive"]) {
  if (!kfd4PerspectiveReplaySchema.properties?.mode?.enum?.includes(mode)) fail(`KFD-4 perspectiveReplay mode missing ${mode}`);
}
for (const field of ["observer", "acceptedFactCut", "naturalObjects", "consequences", "knownGaps"]) {
  if (!kfd4PerspectiveReplaySchema.$defs?.sourceView?.required?.includes(field)) fail(`KFD-4 perspectiveReplay sourceView must require ${field}`);
}
if (!kfd4PerspectiveReplaySchema.$defs?.mismatch?.properties?.primitiveSignal?.enum?.includes("candidate")) {
  fail("KFD-4 perspectiveReplay mismatch must expose candidate primitive signal");
}
for (const concept of ["observer", "declaredPerspective", "observerPerspective", "perspectiveTransformation", "realityPreservingTransformation", "perspectiveBoundTimeline", "perspectiveReplay", "contrastiveReplay", "marginalTransformationCost", "situatedView", "localPriority", "visibleHorizon", "viewSubject", "acceptedFacts", "projectionPolicy", "causalDominance", "degradedEvidence", "timeline"]) {
  if (!kfd4?.concepts?.[concept]) fail(`KFD-4 standards metadata missing concept ${concept}`);
}
for (const iface of ["observerPerspective", "perspectiveReplay"]) {
  if (!kfd4?.interfaces?.[iface]) fail(`KFD-4 standards metadata missing interface ${iface}`);
}
const kfd5 = standardsMetadata.standards?.["kfd-5"];
if (kfd5?.schemaIds?.primitiveDiscovery !== "https://kfd.libkungfu.dev/schemas/kfd-5/primitive-discovery.schema.json") {
  fail("KFD-5 standards metadata must expose the canonical primitiveDiscovery schema URI");
}
if (kfd5?.schemaPaths?.primitiveDiscovery !== "schemas/kfd-5/primitive-discovery.schema.json") {
  fail("KFD-5 standards metadata must expose the primitiveDiscovery schema path");
}
const kfd5PrimitiveDiscoverySchema = JSON.parse(readFileSync("schemas/kfd-5/primitive-discovery.schema.json", "utf8"));
if (kfd5PrimitiveDiscoverySchema.properties?.contract?.const !== "kfd-5-primitive-discovery") {
  fail("KFD-5 primitiveDiscovery schema must describe the kfd-5-primitive-discovery contract");
}
if (kfd5PrimitiveDiscoverySchema.properties?.standard?.const !== "kfd-5") {
  fail("KFD-5 primitiveDiscovery schema must declare standard kfd-5");
}
if (kfd5?.interfaces?.primitiveDiscovery?.schemaVersion !== 3 || kfd5PrimitiveDiscoverySchema.properties?.schemaVersion?.const !== 3) {
  fail("KFD-5 primitiveDiscovery method-plural interface must use schemaVersion 3");
}
if (!kfd5PrimitiveDiscoverySchema.required?.includes("genesis")) {
  fail("KFD-5 primitiveDiscovery interface v3 must require genesis");
}
const kfd5Genesis = kfd5PrimitiveDiscoverySchema.properties?.genesis;
for (const field of ["methods", "observationPerspective", "currentOntology", "observation", "candidateObject", "claimBoundary", "methodEvidence"]) {
  if (!kfd5Genesis?.required?.includes(field)) fail(`KFD-5 genesis must require ${field}`);
}
for (const method of ["direct-situated-judgment", "perspective-transformation", "perspective-replay", "contrastive-replay", "anomaly-driven", "reconstruction-pressure", "causal-variable-discovery", "structural-compression"]) {
  if (!kfd5PrimitiveDiscoverySchema.$defs?.genesisMethod?.enum?.includes(method)) fail(`KFD-5 genesisMethod missing ${method}`);
}
if (kfd5Genesis?.properties?.replayBasis?.$ref !== "#/$defs/replayBasis") {
  fail("KFD-5 genesis must expose replayBasis");
}
for (const participantFunction of ["perspective-declaration", "candidate-generation", "scalable-reasoning"]) {
  if (!kfd5PrimitiveDiscoverySchema.properties?.participants?.items?.properties?.functions?.items?.enum?.includes(participantFunction)) {
    fail(`KFD-5 primitiveDiscovery interface v3 must expose ${participantFunction}`);
  }
}
if (kfd5PrimitiveDiscoverySchema.properties?.boundaryPressure?.$ref !== "#/$defs/boundaryPressure") {
  fail("KFD-5 primitiveDiscovery schema must expose the optional boundaryPressure diagnostic");
}
if (kfd5PrimitiveDiscoverySchema.required?.includes("boundaryPressure")) {
  fail("KFD-5 boundaryPressure must remain an optional diagnostic in interface v3");
}
if (!kfd5PrimitiveDiscoverySchema.$defs?.boundaryPressure?.properties?.pressureChanges?.items?.properties?.kind?.enum?.includes("new-participant")) {
  fail("KFD-5 boundaryPressure must classify new-participant pressure");
}
for (const concept of ["primitiveDiscovery", "perspectiveDeclaration", "methodPluralGenesis", "observationPerspective", "currentOntology", "perspectiveTransformation", "genesisMethod", "methodEvidence", "replayBasis", "anomalyDriven", "reconstructionPressure", "causalVariableDiscovery", "structuralCompression", "methodArtifact", "localOptimizationTrap", "situatedObservation", "newlyVisibleNeed", "claimBoundary", "qualification", "scalableReasoning", "realityPressure", "boundaryPressure", "contactSurface", "implicitCoordination", "pressureChange", "internalObjectAlternative", "primitiveCandidate", "minimumClosure", "deletionTest", "fuseTest", "falsifier", "dogfoodEvidence"]) {
  if (!kfd5?.concepts?.[concept]) fail(`KFD-5 standards metadata missing concept ${concept}`);
}
if (!kfd5?.interfaces?.primitiveDiscovery) fail("KFD-5 standards metadata missing interface primitiveDiscovery");

const kfd6 = standardsMetadata.standards?.["kfd-6"];
if (kfd6?.status !== "draft") fail("KFD-6 must remain draft until activation evidence is committed");
if (kfd6?.schemaIds?.autonomousDiscoveryLoop !== "https://kfd.libkungfu.dev/schemas/kfd-6/autonomous-discovery-loop.schema.json") {
  fail("KFD-6 standards metadata must expose the canonical autonomousDiscoveryLoop schema URI");
}
if (kfd6?.schemaPaths?.autonomousDiscoveryLoop !== "schemas/kfd-6/autonomous-discovery-loop.schema.json") {
  fail("KFD-6 standards metadata must expose the autonomousDiscoveryLoop schema path");
}
const kfd6AutonomousDiscoveryLoopSchema = JSON.parse(readFileSync("schemas/kfd-6/autonomous-discovery-loop.schema.json", "utf8"));
if (kfd6AutonomousDiscoveryLoopSchema.properties?.contract?.const !== "kfd-6-autonomous-discovery-loop") {
  fail("KFD-6 autonomousDiscoveryLoop schema must describe the kfd-6-autonomous-discovery-loop contract");
}
if (kfd6AutonomousDiscoveryLoopSchema.properties?.standard?.const !== "kfd-6") {
  fail("KFD-6 autonomousDiscoveryLoop schema must declare standard kfd-6");
}
if (kfd6?.interfaces?.autonomousDiscoveryLoop?.schemaVersion !== 4 || kfd6AutonomousDiscoveryLoopSchema.properties?.schemaVersion?.const !== 4) {
  fail("KFD-6 autonomousDiscoveryLoop method-comparison interface must use schemaVersion 4");
}
for (const field of ["generationExperiments", "methodComparison"]) {
  if (!kfd6AutonomousDiscoveryLoopSchema.required?.includes(field)) fail(`KFD-6 autonomousDiscoveryLoop interface v4 must require ${field}`);
}
if (kfd6AutonomousDiscoveryLoopSchema.required?.includes("boundaryHypothesis")) {
  fail("KFD-6 boundaryHypothesis must remain conditional in interface v4");
}
const generationExperiment = kfd6AutonomousDiscoveryLoopSchema.$defs?.generationExperiment;
for (const field of ["id", "methods", "observationPerspective", "currentOntology", "causalBasis", "procedure", "evidenceCut", "resourceBudget", "result", "disconfirmingTest"]) {
  if (!generationExperiment?.required?.includes(field)) fail(`KFD-6 generationExperiment must require ${field}`);
}
for (const method of ["perspective-transformation", "anomaly-driven", "reconstruction-pressure", "causal-variable-discovery", "structural-compression"]) {
  if (!kfd6AutonomousDiscoveryLoopSchema.$defs?.genesisMethod?.enum?.includes(method)) fail(`KFD-6 genesisMethod missing ${method}`);
}
const methodComparison = kfd6AutonomousDiscoveryLoopSchema.properties?.methodComparison;
if (methodComparison?.properties?.candidateSchemaVersion?.const !== 3) {
  fail("KFD-6 autonomousDiscoveryLoop interface v4 must hand candidates to KFD-5 schemaVersion 3");
}
for (const baseline of ["fixed-ontology", "no-new-primitive"]) {
  if (!methodComparison?.properties?.baselines?.items?.enum?.includes(baseline)) fail(`KFD-6 methodComparison missing ${baseline} baseline`);
}
if (kfd6AutonomousDiscoveryLoopSchema.properties?.boundaryHypothesis?.$ref !== "#/$defs/boundaryHypothesis") {
  fail("KFD-6 autonomousDiscoveryLoop schema must expose the boundaryHypothesis contract");
}
const boundaryHypothesis = kfd6AutonomousDiscoveryLoopSchema.$defs?.boundaryHypothesis;
for (const field of ["contactSides", "implicitHandling", "pressureChanges", "observedFailures", "mediationClaim", "internalObjectAlternative", "status"]) {
  if (!boundaryHypothesis?.required?.includes(field)) fail(`KFD-6 boundaryHypothesis must require ${field}`);
}
if (!boundaryHypothesis?.properties?.pressureChanges?.items?.properties?.kind?.enum?.includes("new-participant")) {
  fail("KFD-6 boundaryHypothesis must classify new-participant pressure");
}
const antiSelfCertification = kfd6AutonomousDiscoveryLoopSchema.properties?.antiSelfCertification?.properties;
if (antiSelfCertification?.generatorIsSoleVerifier?.const !== false) fail("KFD-6 must prohibit the generator from being the sole verifier");
if (antiSelfCertification?.generatedEvidenceOnly?.const !== false) fail("KFD-6 must prohibit generated-only evidence");
if (antiSelfCertification?.promotionAuthoritySeparated?.const !== true) fail("KFD-6 must separate discovery from promotion authority");
for (const concept of ["autonomousDiscovery", "causalExperience", "episodeCorpus", "experienceCut", "captureBoundary", "generationExperiment", "genesisMethod", "methodComparison", "sharedEvidenceCut", "resourceBudget", "perspectiveTransformation", "perspectiveReplay", "contrastiveReplay", "fixedOntologyBaseline", "noNewPrimitiveBaseline", "falseCandidateRate", "ontologyDistance", "methodArtifact", "projectionArtifact", "boundaryPressure", "boundaryHypothesis", "contactSurface", "implicitCoordination", "pressureChange", "internalObjectAlternative", "heldOutEvaluation", "boundedIntervention", "selfCertification", "promotionAuthority", "candidateAtlas"]) {
  if (!kfd6?.concepts?.[concept]) fail(`KFD-6 standards metadata missing concept ${concept}`);
}
if (!kfd6?.interfaces?.autonomousDiscoveryLoop) fail("KFD-6 standards metadata missing interface autonomousDiscoveryLoop");
for (const [id, successors] of superseded) {
  for (const successor of successors) {
    if (!registry.entries.some((e) => e.id === successor)) fail(`${id} cites missing successor ${successor}`);
  }
}
const siteCommitments = new Map((siteBundle.homepage?.foundationTriad?.commitments ?? []).map((item) => [item.id, item]));
for (const id of ["KFD-1", "KFD-2", "KFD-3"]) {
  if (!siteCommitments.has(id)) fail(`site bundle foundationTriad missing ${id}`);
}
for (const id of siteCommitments.keys()) {
  if (!["KFD-1", "KFD-2", "KFD-3"].includes(id)) fail(`site bundle foundationTriad must not include practice guideline ${id}`);
}
const siteLayers = new Map((siteBundle.homepage?.foundationModel?.layers ?? []).map((item) => [item.decision, item]));
for (const id of ["KFD-1", "KFD-2", "KFD-3"]) {
  if (!siteLayers.has(id)) fail(`site bundle foundationModel missing ${id}`);
}
for (const id of siteLayers.keys()) {
  if (!["KFD-1", "KFD-2", "KFD-3"].includes(id)) fail(`site bundle foundationModel must not include practice guideline ${id}`);
}
const practiceGuidelines = new Map((siteBundle.homepage?.practiceGuidelines?.guidelines ?? []).map((item) => [item.decision, item]));
for (const e of registry.entries.filter((entry) => !["KFD-1", "KFD-2", "KFD-3"].includes(entry.id))) {
  if (!practiceGuidelines.has(e.id)) fail(`site bundle practiceGuidelines missing ${e.id}`);
}
const boundary = siteBundle.renderingBoundary ?? {};
if (!Array.isArray(boundary.ownedByKfd) || !boundary.ownedByKfd.includes("homepage title and text")) {
  fail("site bundle renderingBoundary.ownedByKfd must include homepage title and text");
}
if (!Array.isArray(boundary.ownedByKfd) || !boundary.ownedByKfd.includes("homepage section projection from README.md")) {
  fail("site bundle renderingBoundary.ownedByKfd must include homepage section projection from README.md");
}
if (!Array.isArray(boundary.ownedByKfd) || !boundary.ownedByKfd.includes("historical cases page from docs/primitive-discovery-cases.md")) {
  fail("site bundle renderingBoundary.ownedByKfd must include the historical cases page");
}
if (!Array.isArray(boundary.ownedBySite) || !boundary.ownedBySite.includes("CSS")) {
  fail("site bundle renderingBoundary.ownedBySite must include CSS");
}
if (!kfd1Witness) {
  fail(`missing KFD-1 release witness ${kfd1WitnessPath}`);
} else {
  if (kfd1Witness.standard !== "kfd-1") fail("KFD-1 release witness standard must be kfd-1");
  if (kfd1Witness.contractWorld?.schemaId !== "https://kfd.libkungfu.dev/schemas/kfd-1/contract-world.schema.json") {
    fail("KFD-1 release witness contractWorld.schemaId must be canonical");
  }
  for (const field of ["canonicalPolicy", "registry"]) {
    const entry = kfd1Witness[field];
    if (!entry?.path || !entry?.sha256) fail(`KFD-1 release witness ${field} must include path and sha256`);
    else if (!existsSync(entry.path)) fail(`KFD-1 release witness ${field} points to missing ${entry.path}`);
    else if (entry.sha256 !== sha256File(entry.path)) fail(`KFD-1 release witness ${field}.sha256 does not match ${entry.path}`);
  }
  if (!Array.isArray(kfd1Witness.surfaces) || kfd1Witness.surfaces.length === 0) {
    fail("KFD-1 release witness surfaces[] is required");
  } else {
    requireSameEnum(kfd1Witness.compatibilityImpactClasses, expectedKfd1ImpactClasses, "KFD-1 witness compatibilityImpactClasses");
    const registeredSurfaceById = new Map((kfd1SurfaceRegister?.surfaces ?? []).map((surface) => [surface.id, surface]));
    const witnessedSurfaceNames = new Set(kfd1Witness.surfaces.map((surface) => surface.name));
    for (const requiredSurface of [
      "readme",
      "kfd-1-publication-url-semantics-schema",
      "kfd-2-trust-taxonomy-schema",
      "kfd-2-trust-claims-schema",
      "kfd-2-trust-assessment-schema",
      "kfd-site-bundle",
      "kfd-doc-map",
      "kfd-1-usage-doc",
      "kfd-2-usage-doc",
      "kfd-3-usage-doc",
      "kfd-4-usage-doc",
      "kfd-5-usage-doc",
      "kfd-6-usage-doc",
      "kfd-5-primitive-discovery-schema",
      "kfd-6-autonomous-discovery-loop-schema",
      "kfd-2-foundation-trust-claims",
      "kfd-2-foundation-trust-assessment",
      "release-impact-ledger",
      "kfd-check-gate"
    ]) {
      if (!witnessedSurfaceNames.has(requiredSurface)) {
        fail(`KFD-1 release witness must include self-proof surface ${requiredSurface}`);
      }
    }
    for (const [index, surface] of kfd1Witness.surfaces.entries()) {
      if (!surface.name) fail(`KFD-1 release witness surfaces[${index}].name is required`);
      const registered = registeredSurfaceById.get(surface.name);
      if (!registered) fail(`KFD-1 release witness surface ${surface.name || index} is not in standards surfaceRegister`);
      else {
        if (surface.class !== registered.class) fail(`KFD-1 release witness surface ${surface.name} class must match surfaceRegister`);
        requireSameEnum(surface.classes, registered.classes, `KFD-1 witness ${surface.name} classes`);
        if (surface.description !== registered.description) fail(`KFD-1 release witness surface ${surface.name} description must match surfaceRegister`);
        if (surface.weldRationale !== registered.weldRationale) fail(`KFD-1 release witness surface ${surface.name} weldRationale must match surfaceRegister`);
        for (const impact of expectedKfd1ImpactClasses) {
          if (surface.impactProjection?.[impact] !== registered.impactProjection?.[impact]) {
            fail(`KFD-1 release witness surface ${surface.name} impactProjection.${impact} must match surfaceRegister`);
          }
        }
      }
      if (!surface.artifactPath) fail(`KFD-1 release witness surfaces[${index}].artifactPath is required`);
      else if (!existsSync(surface.artifactPath)) fail(`KFD-1 release witness surface ${surface.name || index} points to missing ${surface.artifactPath}`);
      else {
        const actual = sha256File(surface.artifactPath);
        if (surface.expectedSha256 !== actual) {
          fail(`KFD-1 release witness surface ${surface.name || index} expectedSha256 does not match ${surface.artifactPath}`);
        }
        if (surface.sourceSha256 && surface.sourceSha256 !== actual) {
          fail(`KFD-1 release witness surface ${surface.name || index} sourceSha256 does not match ${surface.artifactPath}`);
        }
      }
    }
  }
}

const checkKfd2Pointer = (entry, label) => {
  if (!entry?.path) {
    fail(`${label} must include path`);
    return;
  }
  if (!entry?.sha256) {
    fail(`${label} must include sha256`);
    return;
  }
  const filePath = hashablePath(entry.path);
  if (!existsSync(filePath)) {
    fail(`${label} points to missing ${filePath}`);
  } else if (entry.sha256 !== sha256File(filePath)) {
    fail(`${label}.sha256 does not match ${filePath}`);
  }
};

if (!kfd2Claim) {
  fail(`missing KFD-2 public release trust claim ${kfd2ClaimPath}`);
} else {
  if (kfd2Claim.id !== "kfd-public-release-trust") fail("KFD-2 release trust claim id must be kfd-public-release-trust");
  if (kfd2Claim.public !== true) fail("KFD-2 release trust claim must be public");
  if (!kfd2Claim.claim) fail("KFD-2 release trust claim must include claim text");
  for (const field of ["sourceBindings", "machineEvidence", "artifacts", "residualRisk"]) {
    if (!Array.isArray(kfd2Claim[field])) fail(`KFD-2 release trust claim ${field} must be an array`);
  }
  if (!Array.isArray(kfd2Claim.sourceBindings) || kfd2Claim.sourceBindings.length === 0) {
    fail("KFD-2 release trust claim sourceBindings[] is required");
  } else {
    kfd2Claim.sourceBindings.forEach((entry, index) => checkKfd2Pointer(entry, `KFD-2 release trust claim sourceBindings[${index}]`));
  }
  if (!Array.isArray(kfd2Claim.machineEvidence) || kfd2Claim.machineEvidence.length === 0) {
    fail("KFD-2 release trust claim machineEvidence[] is required");
  } else {
    kfd2Claim.machineEvidence.forEach((entry, index) => checkKfd2Pointer(entry, `KFD-2 release trust claim machineEvidence[${index}]`));
  }
  if (!kfd2Claim.hashes || Object.keys(kfd2Claim.hashes).length === 0) fail("KFD-2 release trust claim hashes must be non-empty");
  for (const entry of [...(kfd2Claim.sourceBindings ?? []), ...(kfd2Claim.machineEvidence ?? [])]) {
    if (entry?.id && kfd2Claim.hashes?.[entry.id] !== entry.sha256) {
      fail(`KFD-2 release trust claim hashes.${entry.id} must match its bound sha256`);
    }
  }
  if (!Array.isArray(kfd2Claim.artifacts) || kfd2Claim.artifacts.length === 0) {
    fail("KFD-2 release trust claim artifacts[] is required");
  } else {
    kfd2Claim.artifacts.forEach((entry, index) => checkKfd2Pointer(entry, `KFD-2 release trust claim artifacts[${index}]`));
  }
  if (kfd2Claim.verification?.result !== "passed") fail("KFD-2 release trust claim verification.result must be passed");
  if (kfd2Claim.verification?.command !== "node scripts/check.mjs") fail("KFD-2 release trust claim verification.command must be node scripts/check.mjs");
  if (!kfd2Claim.auditBoundary?.scope) fail("KFD-2 release trust claim auditBoundary.scope is required");
  if (kfd2Claim.auditBoundary?.enumerability !== "closed-world") fail("KFD-2 release trust claim auditBoundary.enumerability must be closed-world");
  if (!kfd2Claim.responsibility?.owner) fail("KFD-2 release trust claim responsibility.owner is required");
  if (!Array.isArray(kfd2Claim.residualRisk)) fail("KFD-2 release trust claim residualRisk must be an array");
}

const checkKfd2AssessmentPointer = (entry, label) => {
  if (!entry?.path) fail(`${label}.path is required`);
  else {
    const filePath = hashablePath(entry.path);
    if (!existsSync(filePath)) fail(`${label} points to missing ${filePath}`);
    else if (entry.sha256 && entry.sha256 !== sha256File(filePath)) fail(`${label}.sha256 does not match ${filePath}`);
  }
};

if (!kfd2TrustClaims) {
  fail(`missing KFD-2 generic trust claims ${kfd2TrustClaimsPath}`);
} else {
  if (kfd2TrustClaims.contract !== "kfd-2-trust-claims") fail("KFD-2 generic trust claims contract must be kfd-2-trust-claims");
  if (kfd2TrustClaims.standard !== "kfd-2") fail("KFD-2 generic trust claims standard must be kfd-2");
  if (kfd2TrustClaims.projection?.kind !== "generic") fail("KFD-2 generic trust claims projection.kind must be generic");
  const claimsById = new Map((kfd2TrustClaims.claims ?? []).map((claim) => [claim.id, claim]));
  for (const requiredClaim of ["kfd-1-contract-world-trust", "kfd-3-collaboration-interface-trust", "kfd-4-observer-perspective-trust", "kfd-5-primitive-discovery-trust", "kfd-6-autonomous-discovery-loop-trust"]) {
    if (!claimsById.has(requiredClaim)) fail(`KFD-2 generic trust claims missing ${requiredClaim}`);
  }
  const expectedSubjectKinds = new Map([
    ["kfd-1-contract-world-trust", "contract-world"],
    ["kfd-3-collaboration-interface-trust", "collaboration-interface"],
    ["kfd-4-observer-perspective-trust", "observer-perspective"],
    ["kfd-5-primitive-discovery-trust", "primitive-discovery"],
    ["kfd-6-autonomous-discovery-loop-trust", "autonomous-discovery-loop"],
  ]);
  for (const [claimId, expectedKind] of expectedSubjectKinds.entries()) {
    const claim = claimsById.get(claimId);
    if (claim?.subject?.kind !== expectedKind) fail(`KFD-2 generic trust claim ${claimId} subject.kind must be ${expectedKind}`);
    if (!Array.isArray(claim?.facts) || claim.facts.length === 0) fail(`KFD-2 generic trust claim ${claimId} facts[] is required`);
    else claim.facts.forEach((entry, index) => checkKfd2AssessmentPointer(entry, `KFD-2 generic trust claim ${claimId}.facts[${index}]`));
    if (!Array.isArray(claim?.evidence) || claim.evidence.length === 0) fail(`KFD-2 generic trust claim ${claimId} evidence[] is required`);
    for (const [index, entry] of (claim?.evidence ?? []).entries()) {
      if (!kfd2TrustTaxonomySchema.$defs?.machineProvability?.enum?.includes(entry.machineProvability)) {
        fail(`KFD-2 generic trust claim ${claimId}.evidence[${index}].machineProvability must be a KFD-2 value`);
      }
      if (entry.pointer) checkKfd2AssessmentPointer(entry.pointer, `KFD-2 generic trust claim ${claimId}.evidence[${index}].pointer`);
    }
    for (const [index, risk] of (claim?.residualRisk ?? []).entries()) {
      checkResidualRisk(risk, `KFD-2 generic trust claim ${claimId}.residualRisk[${index}]`);
    }
  }
}

if (!kfd2TrustAssessment) {
  fail(`missing KFD-2 generic trust assessment ${kfd2TrustAssessmentPath}`);
} else {
  if (kfd2TrustAssessment.contract !== "kfd-2-trust-assessment") fail("KFD-2 generic trust assessment contract must be kfd-2-trust-assessment");
  if (kfd2TrustAssessment.standard !== "kfd-2") fail("KFD-2 generic trust assessment standard must be kfd-2");
  if (kfd2TrustAssessment.assessedClaims?.schemaId !== "https://kfd.libkungfu.dev/schemas/kfd-2/trust-claims.schema.json") {
    fail("KFD-2 generic trust assessment assessedClaims.schemaId must be canonical");
  }
  if (kfd2TrustAssessment.assessedClaims?.path !== kfd2TrustClaimsPath) {
    fail("KFD-2 generic trust assessment assessedClaims.path must point to generic trust claims");
  }
  if (kfd2TrustAssessment.assessedClaims?.digest !== `sha256:${sha256File(kfd2TrustClaimsPath)}`) {
    fail("KFD-2 generic trust assessment assessedClaims.digest must match generic trust claims");
  }
  if (kfd2TrustAssessment.result !== "warning") fail("KFD-2 generic trust assessment result must be warning because KFD-3 declares semantic residual risk");
  const assessmentsByClaim = new Map((kfd2TrustAssessment.assessments ?? []).map((entry) => [entry.claimId, entry]));
  for (const requiredClaim of ["kfd-1-contract-world-trust", "kfd-3-collaboration-interface-trust", "kfd-4-observer-perspective-trust", "kfd-5-primitive-discovery-trust", "kfd-6-autonomous-discovery-loop-trust"]) {
    if (!assessmentsByClaim.has(requiredClaim)) fail(`KFD-2 generic trust assessment missing claim ${requiredClaim}`);
  }
  if (assessmentsByClaim.get("kfd-3-collaboration-interface-trust")?.result !== "warning") {
    fail("KFD-2 generic trust assessment must downgrade KFD-3 to warning");
  }
  if (assessmentsByClaim.get("kfd-6-autonomous-discovery-loop-trust")?.result !== "warning") {
    fail("KFD-2 generic trust assessment must downgrade draft KFD-6 to warning");
  }
  for (const [index, reason] of (kfd2TrustAssessment.downgradeReasons ?? []).entries()) {
    if (!kfd2TrustTaxonomySchema.$defs?.riskType?.enum?.includes(reason.riskType)) fail(`KFD-2 generic trust assessment downgradeReasons[${index}].riskType must be a KFD-2 value`);
    if (!kfd2TrustTaxonomySchema.$defs?.trustImpact?.enum?.includes(reason.trustImpact)) fail(`KFD-2 generic trust assessment downgradeReasons[${index}].trustImpact must be a KFD-2 value`);
    if (reason.agentAction && !kfd2TrustTaxonomySchema.$defs?.agentAction?.enum?.includes(reason.agentAction)) fail(`KFD-2 generic trust assessment downgradeReasons[${index}].agentAction must be a KFD-2 value`);
  }
  for (const [index, entry] of (kfd2TrustAssessment.assessments ?? []).entries()) {
    if (!["pass", "warning", "fail", "unverifiable"].includes(entry.result)) fail(`KFD-2 generic trust assessment assessments[${index}].result is invalid`);
    for (const [riskIndex, risk] of (entry.residualRisk ?? []).entries()) {
      checkResidualRisk(risk, `KFD-2 generic trust assessment assessments[${index}].residualRisk[${riskIndex}]`);
    }
  }
}

const kfd3SurfaceGroups = ["docs", "schemas", "standardsMetadata", "packageExports", "siteConsumptionContracts"];
const kfd3SurfaceIds = (witness) => {
  const ids = new Set();
  for (const surface of witness?.surfaces ?? []) {
    if (surface?.id) ids.add(surface.id);
  }
  for (const group of kfd3SurfaceGroups) {
    for (const surface of witness?.[group] ?? []) {
      if (surface?.id) ids.add(surface.id);
    }
  }
  return ids;
};
const checkPointer = (entry, label, field = "path") => {
  if (!entry?.[field]) {
    fail(`${label} must include ${field}`);
    return;
  }
  const filePath = hashablePath(entry[field]);
  if (filePath.includes("*")) {
    return;
  }
  if (!existsSync(filePath)) {
    fail(`${label} points to missing ${filePath}`);
  } else if (entry.sha256 && entry.sha256 !== sha256File(filePath)) {
    fail(`${label}.sha256 does not match ${filePath}`);
  }
};
const checkGroupedSurfaces = (witness, label) => {
  for (const group of kfd3SurfaceGroups) {
    if (!Array.isArray(witness?.[group]) || witness[group].length === 0) {
      fail(`${label}.${group} must include at least one surface`);
      continue;
    }
    for (const [index, surface] of witness[group].entries()) {
      if (!surface?.id) fail(`${label}.${group}[${index}].id is required`);
      checkPointer(surface, `${label}.${group}[${index}]`, "sourcePath");
    }
  }
};

if (!kfd3Interface) {
  fail(`missing KFD-3 collaboration interface ${kfd3InterfacePath}`);
} else {
  if (kfd3Interface.contract !== "kfd-3-collaboration-interface") fail("KFD-3 collaboration interface contract must be kfd-3-collaboration-interface");
  if (kfd3Interface.standard !== "kfd-3") fail("KFD-3 collaboration interface standard must be kfd-3");
  if (!Array.isArray(kfd3Interface.factSources) || kfd3Interface.factSources.length === 0) fail("KFD-3 collaboration interface factSources[] is required");
  if (!kfd3Interface.factSources.some((entry) =>
    entry.id === "public-kfd-fact-source" &&
    entry.kind === "git-repository" &&
    entry.host === "github" &&
    entry.repository === "kungfu-systems/kfd" &&
    entry.url === "https://github.com/kungfu-systems/kfd" &&
    entry.loadBearingCoordinate === "commit-addressed repository contents" &&
    entry.stableRenderedIndex === "https://kfd.libkungfu.dev" &&
    entry.canonicalPaths?.includes("decisions/KFD-N.md") &&
    entry.canonicalPaths?.includes("registry.json") &&
    entry.canonicalPaths?.includes("standards.json")
  )) {
    fail("KFD-3 collaboration interface must declare the public KFD GitHub fact source");
  }
  if (!Array.isArray(kfd3Interface.participants) || kfd3Interface.participants.length === 0) fail("KFD-3 collaboration interface participants[] is required");
  if (!Array.isArray(kfd3Interface.minimalEntrypoints) || kfd3Interface.minimalEntrypoints.length === 0) fail("KFD-3 collaboration interface minimalEntrypoints[] is required");
  if (!kfd3Interface.minimalEntrypoints.some((entry) => entry.id === "foundation-model" && entry.surface === "docs/foundation-model.md")) {
    fail("KFD-3 collaboration interface must expose docs/foundation-model.md as a minimal entrypoint");
  }
  if (!kfd3Interface.minimalEntrypoints.some((entry) => entry.id === "official-status-and-trademarks" && entry.surface === "TRADEMARKS.md")) {
    fail("KFD-3 collaboration interface must expose TRADEMARKS.md as an official-status-and-trademarks entrypoint");
  }
  if (!Array.isArray(kfd3Interface.surfaces) || kfd3Interface.surfaces.length === 0) fail("KFD-3 collaboration interface surfaces[] is required");
  if (!kfd3Interface.surfaces.some((entry) => entry.id === "foundation-model" && entry.discoverability?.path === "docs/foundation-model.md")) {
    fail("KFD-3 collaboration interface must classify docs/foundation-model.md as a participant-facing surface");
  }
  if (!kfd3Interface.surfaces.some((entry) => entry.id === "official-status-and-trademarks" && entry.discoverability?.path === "TRADEMARKS.md")) {
    fail("KFD-3 collaboration interface must expose TRADEMARKS.md as a participant-facing surface");
  }
  if (!Array.isArray(kfd3Interface.valueEvidence) || kfd3Interface.valueEvidence.length === 0) {
    fail("KFD-3 collaboration interface valueEvidence[] is required");
  } else {
    for (const [index, entry] of kfd3Interface.valueEvidence.entries()) {
      if (!entry.id) fail(`KFD-3 collaboration interface valueEvidence[${index}].id is required`);
      if (!entry.claim) fail(`KFD-3 collaboration interface valueEvidence[${index}].claim is required`);
      if (!Array.isArray(entry.participants) || entry.participants.length === 0) fail(`KFD-3 collaboration interface valueEvidence[${index}].participants[] is required`);
      if (!Array.isArray(entry.facts) || entry.facts.length === 0) fail(`KFD-3 collaboration interface valueEvidence[${index}].facts[] is required`);
      if (!Array.isArray(entry.evidence) || entry.evidence.length === 0) fail(`KFD-3 collaboration interface valueEvidence[${index}].evidence[] is required`);
      for (const [factIndex, fact] of (entry.facts ?? []).entries()) {
        checkPointer(fact, `KFD-3 collaboration interface valueEvidence[${index}].facts[${factIndex}]`);
      }
      for (const [evidenceIndex, evidenceEntry] of (entry.evidence ?? []).entries()) {
        checkPointer(evidenceEntry, `KFD-3 collaboration interface valueEvidence[${index}].evidence[${evidenceIndex}]`);
      }
      if (entry.trustAssessment) {
        checkPointer(entry.trustAssessment, `KFD-3 collaboration interface valueEvidence[${index}].trustAssessment`);
      }
      for (const [riskIndex, risk] of (entry.residualRisk ?? []).entries()) {
        checkResidualRisk(risk, `KFD-3 collaboration interface valueEvidence[${index}].residualRisk[${riskIndex}]`);
      }
    }
    if (!kfd3Interface.valueEvidence.some((entry) => entry.trustAssessment?.path === kfd2TrustAssessmentPath)) {
      fail("KFD-3 collaboration interface valueEvidence must link to the KFD-2 generic trust assessment");
    }
    if (!kfd3Interface.valueEvidence.some((entry) => entry.id === "kfd-foundation-model" && entry.facts?.some((fact) => fact.path === "docs/foundation-model.md"))) {
      fail("KFD-3 foundation value evidence must bind docs/foundation-model.md");
    }
  }
  if (!Array.isArray(kfd3Interface.extensionRequests) || kfd3Interface.extensionRequests.length === 0) fail("KFD-3 collaboration interface extensionRequests[] is required");
  if (!kfd3Interface.extensionRequests.some((entry) => entry.id === "kfd-2-trust-taxonomy-extension" && entry.requestPath?.kind === "github-issue" && String(entry.requestPath?.target || "").startsWith("https://github.com/kungfu-systems/kfd/issues/new"))) {
    fail("KFD-3 collaboration interface must declare the KFD-2 trust taxonomy GitHub issue extension path");
  }
  if (kfd3Interface.closure?.classificationMode !== "closed-world") fail("KFD-3 collaboration interface closure must be closed-world");
  if (kfd3Interface.closure?.unclassifiedEntrypointsPolicy !== "fail") fail("KFD-3 collaboration interface unclassified entrypoint policy must fail");
}

const kfd3InterfaceDigest = existsSync(kfd3InterfacePath) ? `sha256:${sha256File(kfd3InterfacePath)}` : "";
if (!kfd3PrebuildWitness) {
  fail(`missing KFD-3 pre-build witness ${kfd3PrebuildWitnessPath}`);
} else {
  if (kfd3PrebuildWitness.contract !== "kungfu-buildchain-kfd-3-collaboration-interface-prebuild-witness") {
    fail("KFD-3 pre-build witness contract must match Buildchain KFD-3 prebuild witness");
  }
  if (kfd3PrebuildWitness.standard !== "kfd-3") fail("KFD-3 pre-build witness standard must be kfd-3");
  if (kfd3PrebuildWitness.sourceRegistry?.path !== kfd3InterfacePath) fail("KFD-3 pre-build witness sourceRegistry.path must point to the collaboration interface");
  if (kfd3PrebuildWitness.sourceRegistry?.sha256 !== sha256File(kfd3InterfacePath)) fail("KFD-3 pre-build witness sourceRegistry.sha256 does not match the collaboration interface");
  if (kfd3PrebuildWitness.collaborationInterfaceDigest !== kfd3InterfaceDigest) fail("KFD-3 pre-build witness collaborationInterfaceDigest does not match the collaboration interface");
  for (const [index, risk] of (kfd3PrebuildWitness.residualRisk ?? []).entries()) {
    checkResidualRisk(risk, `KFD-3 pre-build witness residualRisk[${index}]`);
  }
  for (const [index, risk] of (kfd3PrebuildWitness.auditBoundary?.nonExhaustivelyEnumerableSurfaces ?? []).entries()) {
    checkResidualRisk(risk, `KFD-3 pre-build witness auditBoundary.nonExhaustivelyEnumerableSurfaces[${index}]`);
  }
  checkGroupedSurfaces(kfd3PrebuildWitness, "KFD-3 pre-build witness");
}
if (!kfd3ArtifactWitness) {
  fail(`missing KFD-3 artifact witness ${kfd3ArtifactWitnessPath}`);
} else {
  if (kfd3ArtifactWitness.contract !== "kfd-3-witness") fail("KFD-3 artifact witness must also satisfy the KFD-3 witness contract");
  if (kfd3ArtifactWitness.standard !== "kfd-3") fail("KFD-3 artifact witness standard must be kfd-3");
  if (kfd3ArtifactWitness.collaborationInterface?.schemaId !== "https://kfd.libkungfu.dev/schemas/kfd-3/collaboration-interface.schema.json") {
    fail("KFD-3 artifact witness collaborationInterface.schemaId must be canonical");
  }
  if (kfd3ArtifactWitness.collaborationInterface?.digest !== kfd3InterfaceDigest) {
    fail("KFD-3 artifact witness collaborationInterface.digest does not match the collaboration interface");
  }
  if (kfd3ArtifactWitness.sourceRegistry?.path !== kfd3InterfacePath) fail("KFD-3 artifact witness sourceRegistry.path must point to the collaboration interface");
  if (kfd3ArtifactWitness.sourceRegistry?.sha256 !== sha256File(kfd3InterfacePath)) fail("KFD-3 artifact witness sourceRegistry.sha256 does not match the collaboration interface");
  for (const [index, risk] of (kfd3ArtifactWitness.residualRisk ?? []).entries()) {
    checkResidualRisk(risk, `KFD-3 artifact witness residualRisk[${index}]`);
  }
  if (!Array.isArray(kfd3ArtifactWitness.evidence?.valueEvidence) || kfd3ArtifactWitness.evidence.valueEvidence.length === 0) {
    fail("KFD-3 artifact witness evidence.valueEvidence[] is required");
  }
  if (kfd3ArtifactWitness.closure?.classificationMode !== "closed-world") fail("KFD-3 artifact witness closure must be closed-world");
  if (!Array.isArray(kfd3ArtifactWitness.closure?.unclassifiedEntrypoints) || kfd3ArtifactWitness.closure.unclassifiedEntrypoints.length !== 0) {
    fail("KFD-3 artifact witness must have zero unclassifiedEntrypoints");
  }
  for (const [section, entries] of Object.entries(kfd3ArtifactWitness.evidence ?? {})) {
    if (Array.isArray(entries)) {
      for (const [index, entry] of entries.entries()) {
        checkPointer(entry, `KFD-3 artifact witness evidence.${section}[${index}]`);
      }
    }
  }
  checkGroupedSurfaces(kfd3ArtifactWitness, "KFD-3 artifact witness");
}
if (kfd3PrebuildWitness && kfd3ArtifactWitness) {
  const declared = kfd3SurfaceIds(kfd3PrebuildWitness);
  const exposed = kfd3SurfaceIds(kfd3ArtifactWitness);
  for (const id of declared) {
    if (!exposed.has(id)) fail(`KFD-3 artifact witness missing declared surface ${id}`);
  }
  for (const id of exposed) {
    if (!declared.has(id)) fail(`KFD-3 artifact witness exposes undeclared surface ${id}`);
  }
}

const impactLevels = new Set(["patch", "minor", "major"]);
const requiredSurfaces = new Set(["kfd-content", "kfd-registry-schema", "kfd-standards-metadata", "kfd-package-structure", "kfd-2-public-release-trust-claim", "kfd-3-trusted-value-evidence", "kfd-site-decision-usage-pages"]);

if (releaseImpact.schemaVersion !== 1) fail(`unsupported release-impact schemaVersion ${releaseImpact.schemaVersion}`);
if (releaseImpact.contract !== "kungfu-buildchain-impact") fail(`unexpected release-impact contract ${releaseImpact.contract}`);
if (!releaseImpact.versionImpact || !impactLevels.has(releaseImpact.versionImpact.final)) {
  fail("release-impact versionImpact.final must be patch, minor, or major");
}
if (!releaseImpact.versionImpact?.rationale) {
  fail("release-impact versionImpact.rationale is required");
}
if (!Array.isArray(releaseImpact.surfaceImpacts) || releaseImpact.surfaceImpacts.length === 0) {
  fail("release-impact surfaceImpacts[] is required");
} else {
  const seenSurfaces = new Set();
  for (const [index, surface] of releaseImpact.surfaceImpacts.entries()) {
    if (!surface.id) fail(`release-impact surfaceImpacts[${index}].id is required`);
    else seenSurfaces.add(surface.id);
    if (!impactLevels.has(surface.impact)) {
      fail(`release-impact surfaceImpacts[${index}].impact must be patch, minor, or major`);
    }
    if (!surface.rationale) fail(`release-impact surfaceImpacts[${index}].rationale is required`);
  }
  for (const surfaceId of requiredSurfaces) {
    if (!seenSurfaces.has(surfaceId)) fail(`release-impact missing surface ${surfaceId}`);
  }
}

if (process.exitCode) process.exit(process.exitCode);
console.log(`check: ${registry.entries.length} entries ok; release impact ok`);
