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
  const std::string prefix =
      R"({"schemaVersion":1,"contract":"kfd.agent-hub-adapter-response/v1","requestId":")" +
      *request_id + R"(","adapter":)" + adapter;
  if (*operation == "handshake") {
    return prefix +
        R"(,"status":"accepted","code":"adapter-ready","verdict":"not-applicable","hubs":[{"hubId":"starter-hub-a","capabilities":{"schemaVersion":1,"contract":"kfd-agent-hub-capabilities","identity":{"hubId":"starter-hub-a"}},"capabilityRoot":"sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"},{"hubId":"starter-hub-b","capabilities":{"schemaVersion":1,"contract":"kfd-agent-hub-capabilities","identity":{"hubId":"starter-hub-b"}},"capabilityRoot":"sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"}],"observations":{"binding":"jsonl-stdio/v1","scope":"starter-envelope-smoke-only"}})";
  }
  // Replace this fail-closed placeholder with product-owned Hub behavior.
  return prefix +
      R"(,"status":"error","code":"scenario-not-implemented","verdict":"not-applicable","observations":{"scope":"starter-envelope-smoke-only"}})";
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
