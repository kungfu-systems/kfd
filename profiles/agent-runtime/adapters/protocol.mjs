// SPDX-License-Identifier: Apache-2.0
import readline from "node:readline";

export function runAdapter(identity, evaluate) {
  const input = readline.createInterface({
    input: process.stdin,
    crlfDelay: Number.POSITIVE_INFINITY,
  });
  input.on("line", (line) => {
    let request;
    try {
      request = JSON.parse(line);
      if (
        request.schemaVersion !== 1 ||
        request.contract !== "kfd.agent-runtime-adapter-request/v1" ||
        typeof request.requestId !== "string"
      ) {
        throw new Error("invalid request envelope");
      }
      const result =
        request.operation === "handshake"
          ? {
              status: "accepted",
              code: "adapter-ready",
              observations: {
                profile: "kfd-agent-runtime@0.1.0-alpha.1",
                protocol: "jsonl-stdio/v1",
                topology: identity.topology,
              },
            }
          : request.operation === "evaluate"
            ? evaluate(request.input)
            : {
                status: "rejected",
                code: "adapter-operation-unsupported",
                observations: { failClosed: true },
              };
      process.stdout.write(
        `${JSON.stringify({
          schemaVersion: 1,
          contract: "kfd.agent-runtime-adapter-response/v1",
          requestId: request.requestId,
          adapter: identity,
          ...result,
        })}\n`,
      );
    } catch (error) {
      process.stdout.write(
        `${JSON.stringify({
          schemaVersion: 1,
          contract: "kfd.agent-runtime-adapter-response/v1",
          requestId: request?.requestId ?? "invalid",
          adapter: identity,
          status: "error",
          code: "adapter-request-invalid",
          observations: { failClosed: true, error: error.message },
        })}\n`,
      );
    }
  });
}

export const rootPattern = /^sha256:[a-f0-9]{64}$/u;
export const isRoot = (value) =>
  typeof value === "string" && rootPattern.test(value);
export const isSubset = (subset, superset) =>
  Array.isArray(subset) &&
  Array.isArray(superset) &&
  subset.every((value) => superset.includes(value));
export const hasDuplicates = (values) =>
  Array.isArray(values) && new Set(values).size !== values.length;
export const isContiguous = (values) =>
  Array.isArray(values) &&
  values.every((value, index) => value === index);

export function result(status, code) {
  return {
    status,
    code,
    observations:
      status === "accepted"
        ? { semanticBoundary: "preserved" }
        : { failClosed: true },
  };
}
