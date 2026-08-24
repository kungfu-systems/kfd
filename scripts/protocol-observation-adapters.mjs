// SPDX-License-Identifier: Apache-2.0
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import {
  exactByteRoot,
  semanticRoot,
  verifyProtocolSemanticsDocument,
} from "./protocol-semantics-contract.mjs";

const ADAPTER_VERSION = "0.1.0";
const MODULE_PATH = fileURLToPath(import.meta.url);
const ARTIFACT_ROOT = exactByteRoot(fs.readFileSync(MODULE_PATH));
const CLAIM_BOUNDARY = Object.freeze({
  normalizedObservationOnly: true,
  nativeCoordinatesRequired: true,
  inferenceAllowed: false,
  certification: false,
  runtimeAuthority: false,
  policyCorrectness: false,
});

const CONFIGS = Object.freeze({
  "mcp-tasks": {
    version: "2026.7.28",
    evidencePackRoot: "sha256:c716585840a15bdcb1d6295703a950a927098ac7f67f48fb9c499d75d7588415",
    adapterId: "mcp-tasks-observation-adapter",
    variants: {
      "task.created": ["executorId", "status", "taskId"],
      "task.status": ["executorId", "retryOf", "status", "taskId"],
    },
    objectField: "taskId",
    stateField: "status",
    executorField: "executorId",
    retryField: "retryOf",
    absent: { acceptedCompletion: "extension-required", authority: "not-represented", work: "extension-required" },
  },
  "a2a-task": {
    version: "2026.8.23",
    evidencePackRoot: "sha256:c6e4e9f0dfb92eb182b08681b0698ea43e046814ef09b120cbcb1eb1cab565e0",
    adapterId: "a2a-task-observation-adapter",
    variants: {
      task: ["contextId", "executorId", "retryOf", "status", "taskId"],
    },
    objectField: "taskId",
    stateField: "status",
    executorField: "executorId",
    retryField: "retryOf",
    contextField: "contextId",
    absent: { acceptedCompletion: "extension-required", authority: "not-represented", work: "extension-required" },
  },
  "zed-acp": {
    version: "1.0.0",
    evidencePackRoot: "sha256:39da6ad7b92734a745d4667faccf56f3a4b6ec873b2d586b718848a3bc49152a",
    adapterId: "zed-acp-observation-adapter",
    variants: {
      "session.load": ["executorId", "sessionId"],
      "session.new": ["executorId", "sessionId"],
    },
    objectField: "sessionId",
    executorField: "executorId",
    resumeField: "sessionId",
    absent: { acceptedCompletion: "out-of-scope", authority: "not-represented", work: "out-of-scope" },
  },
  "ag-ui": {
    version: "2026.8.23",
    evidencePackRoot: "sha256:83518d60f55a441feb9d140ea850e49650e6e926544ab6ee919814c45af3cc62",
    adapterId: "ag-ui-observation-adapter",
    variants: {
      RUN_FINISHED: ["executorId", "runId", "threadId"],
      RUN_INTERRUPTED: ["executorId", "runId", "threadId"],
      RUN_RESUMED: ["executorId", "resumeOf", "runId", "threadId"],
      RUN_STARTED: ["executorId", "runId", "threadId"],
    },
    objectField: "runId",
    stateFromVariant: true,
    executorField: "executorId",
    resumeField: "resumeOf",
    contextField: "threadId",
    absent: { acceptedCompletion: "extension-required", authority: "not-represented", work: "out-of-scope" },
  },
});

function compareUtf8(left, right) {
  return Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
}

function problem(code, path, message) {
  return { code, path, message };
}

function exactPayloadIssues(event, index, config) {
  const admitted = config.variants[event.variant];
  if (!admitted) return [problem("psl-event-variant-unsupported", `/events/${index}/variant`, "Event variant is not supported by the selected frozen protocol adapter.")];
  const allowed = new Set(admitted);
  const issues = [];
  for (const key of Object.keys(event.payload ?? {})) {
    if (!allowed.has(key)) issues.push(problem("psl-provenance-mismatch", `/events/${index}/payload/${key}`, "Payload field has no admitted native mapping for this event variant."));
  }
  for (const field of admitted) {
    if (field === "retryOf" || field === "resumeOf") continue;
    if (typeof event.payload?.[field] !== "string" || !event.payload[field]) issues.push(problem("psl-document-invalid", `/events/${index}/payload/${field}`, "Required native payload field is missing."));
  }
  return issues;
}

function nativeFact(id, value, event, eventIndex, field, fixture) {
  const coordinate = `/events/${eventIndex}/payload/${field}`;
  return {
    id,
    state: "represented",
    source: { status: "native", eventId: event.id, coordinate },
    evidenceRoots: [semanticRoot({ fixtureId: fixture.id, protocol: fixture.protocol, eventId: event.id, coordinate, value })],
    value,
  };
}

function absentFact(id, state, reason = state) {
  return { id, state, source: { status: "absent", reason }, evidenceRoots: [] };
}

function latestField(fixture, field) {
  for (let index = fixture.events.length - 1; index >= 0; index -= 1) {
    const value = fixture.events[index].payload[field];
    if (typeof value === "string" && value) return { event: fixture.events[index], index, value };
  }
  return null;
}

function identityPreservation(fixture, config) {
  const first = fixture.events[0]?.payload?.[config.objectField];
  const last = fixture.events.at(-1)?.payload?.[config.objectField];
  if (fixture.expectation.scenario === "executor-replacement") return first && first === last ? "preserved" : "ambiguous";
  if (fixture.expectation.scenario === "retry") return fixture.events.at(-1)?.payload?.[config.retryField] === first ? "preserved" : "ambiguous";
  if (fixture.expectation.scenario === "resume") {
    const explicit = config.resumeField && fixture.events.at(-1)?.payload?.[config.resumeField];
    return (explicit && explicit === first) || (!explicit && config.resumeField === config.objectField && first === last) ? "preserved" : "ambiguous";
  }
  return "ambiguous";
}

function buildFacts(fixture, config, preservation) {
  const facts = [];
  facts.push(absentFact("accepted-completion", config.absent.acceptedCompletion));
  facts.push(absentFact("authority-id", "unresolved", config.absent.authority));

  const executor = latestField(fixture, config.executorField);
  facts.push(executor ? nativeFact("executor-id", executor.value, executor.event, executor.index, config.executorField, fixture) : absentFact("executor-id", "unresolved", "not-represented"));

  if (config.stateFromVariant) {
    const index = fixture.events.length - 1;
    const event = fixture.events[index];
    const coordinate = `/events/${index}/variant`;
    facts.push({
      id: "operation-state",
      state: "represented",
      source: { status: "native", eventId: event.id, coordinate },
      evidenceRoots: [semanticRoot({ fixtureId: fixture.id, protocol: fixture.protocol, eventId: event.id, coordinate, value: event.variant })],
      value: event.variant,
    });
  } else if (config.stateField) {
    const state = latestField(fixture, config.stateField);
    facts.push(state ? nativeFact("operation-state", state.value, state.event, state.index, config.stateField, fixture) : absentFact("operation-state", "unresolved", "not-represented"));
  } else {
    facts.push(absentFact("operation-state", "out-of-scope"));
  }

  const object = latestField(fixture, config.objectField);
  facts.push(nativeFact("protocol-object-id", object.value, object.event, object.index, config.objectField, fixture));

  const executors = new Set(fixture.events.map((event) => event.payload[config.executorField]).filter(Boolean));
  if (executors.size > 1) facts.push(nativeFact("recovery-drift", "executor-replaced", executor.event, executor.index, config.executorField, fixture));
  else facts.push(absentFact("recovery-drift", "unresolved", "not-represented"));

  if (fixture.expectation.scenario === "resume") {
    const resume = latestField(fixture, config.resumeField);
    facts.push(resume ? nativeFact("resume-identity", resume.value, resume.event, resume.index, config.resumeField, fixture) : absentFact("resume-identity", "unresolved", preservation === "ambiguous" ? "ambiguous" : "not-represented"));
  } else facts.push(absentFact("resume-identity", "unresolved", "not-represented"));

  if (fixture.expectation.scenario === "retry") {
    const retry = latestField(fixture, config.retryField);
    facts.push(retry ? nativeFact("retry-identity", retry.value, retry.event, retry.index, config.retryField, fixture) : absentFact("retry-identity", "unresolved", preservation === "ambiguous" ? "ambiguous" : "not-represented"));
  } else facts.push(absentFact("retry-identity", "unresolved", "not-represented"));

  facts.push(absentFact("work-id", config.absent.work));
  facts.push(absentFact("work-version", config.absent.work));
  return facts.sort((left, right) => compareUtf8(left.id, right.id));
}

export function inspectProtocolTraceFixture(fixture) {
  const documentReport = verifyProtocolSemanticsDocument(fixture);
  const issues = [...documentReport.issues];
  const config = CONFIGS[fixture?.protocol?.protocolId];
  if (!config) issues.push(problem("psl-protocol-unsupported", "/protocol/protocolId", "No offline observation adapter is registered for this protocol."));
  else {
    if (fixture.protocol.protocolVersion !== config.version) issues.push(problem("psl-protocol-version-unsupported", "/protocol/protocolVersion", "The fixture version does not match the frozen adapter version."));
    if (fixture.protocol.evidencePackRoot !== config.evidencePackRoot) issues.push(problem("psl-provenance-mismatch", "/protocol/evidencePackRoot", "The fixture does not bind the adapter's frozen Protocol Evidence Pack root."));
  }
  if (config && Array.isArray(fixture?.events)) fixture.events.forEach((event, index) => issues.push(...exactPayloadIssues(event, index, config)));
  issues.sort((left, right) => compareUtf8(`${left.code}\0${left.path}\0${left.message}`, `${right.code}\0${right.path}\0${right.message}`));
  return { valid: issues.length === 0, issues };
}

export function adaptProtocolTrace(fixture) {
  const inspection = inspectProtocolTraceFixture(fixture);
  if (!inspection.valid) {
    const error = new Error(`protocol trace fixture failed closed: ${inspection.issues.map(({ code }) => code).join(", ")}`);
    error.issues = inspection.issues;
    throw error;
  }
  const config = CONFIGS[fixture.protocol.protocolId];
  const preservation = identityPreservation(fixture, config);
  if (preservation !== fixture.expectation.identityPreservation) {
    const error = new Error("protocol trace fixture expectation does not match native identity evidence");
    error.issues = [problem("psl-identity-expectation-mismatch", "/expectation/identityPreservation", "Expected preservation disagrees with native trace coordinates.")];
    throw error;
  }
  const inputRoot = semanticRoot(fixture);
  const facts = buildFacts(fixture, config, preservation);
  const transcriptRoot = semanticRoot({ inputRoot, events: fixture.events, facts });
  const observation = {
    schemaVersion: 1,
    contract: "kfd.protocol-observation/v2",
    id: fixture.id,
    protocol: structuredClone(fixture.protocol),
    fixture: { id: fixture.id, inputRoot },
    adapter: { id: config.adapterId, version: ADAPTER_VERSION, artifactRoot: ARTIFACT_ROOT },
    scenario: { kind: fixture.expectation.scenario, identityPreservation: preservation },
    facts,
    transcriptRoot,
    claimBoundary: structuredClone(CLAIM_BOUNDARY),
  };
  const report = verifyProtocolSemanticsDocument(observation);
  if (!report.valid) throw new Error(`adapter produced an invalid observation: ${report.issues.map(({ code }) => code).join(", ")}`);
  return { observation, outputRoot: semanticRoot(observation), transcriptRoot };
}

export function adapterInventory() {
  return Object.entries(CONFIGS).map(([protocolId, config]) => ({ protocolId, protocolVersion: config.version, evidencePackRoot: config.evidencePackRoot, adapterId: config.adapterId, adapterVersion: ADAPTER_VERSION, artifactRoot: ARTIFACT_ROOT }));
}
