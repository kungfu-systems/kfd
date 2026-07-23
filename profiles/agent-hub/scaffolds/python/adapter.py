#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
import json
import sys

ADAPTER = {"id": "replace-with-python-adapter-id", "version": "0.0.0", "topology": "replace-with-topology"}


def envelope(request_id, status, code, verdict, observations):
    return {
        "schemaVersion": 1,
        "contract": "kfd.agent-hub-adapter-response/v1",
        "requestId": request_id,
        "adapter": ADAPTER,
        "status": status,
        "code": code,
        "verdict": verdict,
        "observations": observations,
    }


def handshake(request_id):
    value = envelope(request_id, "accepted", "adapter-ready", "not-applicable", {
        "binding": "jsonl-stdio/v1", "scope": "starter-envelope-smoke-only"
    })
    value["hubs"] = [
        {
            "hubId": hub_id,
            "capabilities": {"schemaVersion": 1, "contract": "kfd-agent-hub-capabilities", "identity": {"hubId": hub_id}},
            "capabilityRoot": f"sha256:{letter * 64}",
        }
        for hub_id, letter in (("starter-hub-a", "a"), ("starter-hub-b", "b"))
    ]
    return value


def evaluate(request):
    # Replace this fail-closed placeholder with product-owned Hub behavior.
    return envelope(request["requestId"], "error", "scenario-not-implemented", "not-applicable", {
        "scenario": request.get("input", {}).get("scenario", "unknown"),
        "scope": "starter-envelope-smoke-only",
    })


for line in sys.stdin:
    request = json.loads(line)
    response = handshake(request["requestId"]) if request["operation"] == "handshake" else evaluate(request)
    sys.stdout.write(json.dumps(response, separators=(",", ":")) + "\n")
    sys.stdout.flush()
