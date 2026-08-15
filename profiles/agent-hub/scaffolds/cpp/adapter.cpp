// SPDX-License-Identifier: Apache-2.0
#include <cstdlib>
#include <iostream>
#include <optional>
#include <string>

std::optional<std::string> string_field(const std::string& line, const std::string& name) {
  const auto key = "\"" + name + "\"";
  auto cursor = line.find(key);
  if (cursor == std::string::npos) return std::nullopt;
  cursor = line.find(':', cursor + key.size());
  cursor = line.find('"', cursor);
  if (cursor == std::string::npos) return std::nullopt;
  const auto start = ++cursor;
  bool escaped = false;
  for (; cursor < line.size(); ++cursor) {
    if (line[cursor] == '"' && !escaped) return line.substr(start, cursor - start);
    escaped = line[cursor] == '\\' && !escaped;
    if (line[cursor] != '\\') escaped = false;
  }
  return std::nullopt;
}

std::optional<std::string> response(const std::string& line) {
  const auto request_id = string_field(line, "requestId");
  const auto operation = string_field(line, "operation");
  if (!request_id || !operation) return std::nullopt;
  const std::string adapter =
      R"({"id":"replace-with-cpp-adapter-id","version":"0.0.0","topology":"replace-with-topology"})";
  const std::string capabilities_a =
      R"({"$schema":"https://kfd.libkungfu.dev/schemas/kfd-agent-hub/capabilities.schema.json","schemaVersion":1,"contract":"kfd-agent-hub-capabilities","identity":{"hubId":"starter-hub-a","nodeId":"starter-hub-a-node","actorId":"starter-hub-a-actor"},"profileVersions":["0.1.0-alpha.1"],"requiredFeatures":["transport-receipts"],"optionalFeatures":[],"operations":["capability-advertisement","responsibility-proposal","fact-admission","supersession","completion-assessment","warrant-revocation"],"topologies":["local-peer"],"disclosureModes":["full","partial","redacted","reference-only","intentionally-withheld"],"failureCodes":["profile-version-unsupported","profile-root-mismatch","required-feature-unsupported","identity-unresolved","authority-unresolved","authority-expired","authority-revoked","authority-amplification","fact-cut-unavailable","causal-gap","payload-digest-mismatch","idempotency-conflict","conflict-visible","disclosure-insufficient","required-field-withheld","completion-unproved","local-policy-rejected"],"bindings":[{"id":"jsonl-stdio","mediaTypes":["application/json"],"authentication":"local-process","transportReceipts":true,"duplicateDelivery":"at-least-once"}],"limits":{"maxInlineBytes":65536,"maxEnvelopeBytes":1048576},"authorityRoots":["sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"],"issuedAt":"2026-08-15T00:00:00.000Z"})";
  const std::string capabilities_b =
      R"({"$schema":"https://kfd.libkungfu.dev/schemas/kfd-agent-hub/capabilities.schema.json","schemaVersion":1,"contract":"kfd-agent-hub-capabilities","identity":{"hubId":"starter-hub-b","nodeId":"starter-hub-b-node","actorId":"starter-hub-b-actor"},"profileVersions":["0.1.0-alpha.1"],"requiredFeatures":["transport-receipts"],"optionalFeatures":[],"operations":["capability-advertisement","responsibility-proposal","fact-admission","supersession","completion-assessment","warrant-revocation"],"topologies":["local-peer"],"disclosureModes":["full","partial","redacted","reference-only","intentionally-withheld"],"failureCodes":["profile-version-unsupported","profile-root-mismatch","required-feature-unsupported","identity-unresolved","authority-unresolved","authority-expired","authority-revoked","authority-amplification","fact-cut-unavailable","causal-gap","payload-digest-mismatch","idempotency-conflict","conflict-visible","disclosure-insufficient","required-field-withheld","completion-unproved","local-policy-rejected"],"bindings":[{"id":"jsonl-stdio","mediaTypes":["application/json"],"authentication":"local-process","transportReceipts":true,"duplicateDelivery":"at-least-once"}],"limits":{"maxInlineBytes":65536,"maxEnvelopeBytes":1048576},"authorityRoots":["sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"],"issuedAt":"2026-08-15T00:00:00.000Z"})";
  const std::string prefix =
      R"({"schemaVersion":1,"contract":"kfd.agent-hub-adapter-response/v1","requestId":")" +
      *request_id + R"(","adapter":)" + adapter;
  if (*operation == "handshake") {
    return prefix +
        R"(,"status":"accepted","code":"adapter-ready","verdict":"not-applicable","hubs":[{"hubId":"starter-hub-a","capabilities":)" + capabilities_a +
        R"(,"capabilityRoot":"sha256:d8c212284e53d8e7dacbca8acdb0d7d8d8ee300e1f55233629a7dd006b6e3bc6"},{"hubId":"starter-hub-b","capabilities":)" + capabilities_b +
        R"(,"capabilityRoot":"sha256:dcea56f3624a752070c3a06f7636a0605996d2cd5ea1b6581f935367e07c268c"}],"observations":{"binding":"jsonl-stdio/v1","scope":"evidence-valid-negative-starter"}})";
  }
  // Replace this fail-closed placeholder with product-owned Hub behavior.
  return prefix +
      R"(,"status":"error","code":"scenario-not-implemented","verdict":"not-applicable","observations":{"scope":"hub-semantics-not-implemented"}})";
}

int main() {
  std::string line;
  while (std::getline(std::cin, line)) {
    const auto value = response(line);
    if (!value) {
      std::cerr << "adapter input error: missing requestId or operation\n";
      return EXIT_FAILURE;
    }
    std::cout << *value << '\n';
  }
  return EXIT_SUCCESS;
}
