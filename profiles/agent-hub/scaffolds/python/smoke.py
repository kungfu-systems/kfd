#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
import json
import pathlib
import subprocess
import sys

root = pathlib.Path(__file__).resolve().parent
result = subprocess.run(
    [sys.executable, str(root / "adapter.py")],
    input=(root / "fixtures" / "requests.jsonl").read_text(),
    text=True,
    capture_output=True,
    check=False,
)
assert result.returncode == 0, result.stderr
assert result.stderr == ""
responses = [json.loads(line) for line in result.stdout.splitlines()]
assert [(entry["contract"], entry["requestId"]) for entry in responses] == [
    ("kfd.agent-hub-adapter-response/v1", "handshake"),
    ("kfd.agent-hub-adapter-response/v1", "starter-evaluate"),
]
assert len(responses[0]["hubs"]) == 2
assert responses[1]["code"] == "scenario-not-implemented"
print("Python starter smoke passed: jsonl-stdio/v1 envelope only; Hub 20 not executed")
