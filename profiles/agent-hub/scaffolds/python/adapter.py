#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
import json
import sys

ADAPTER = {"id": "replace-with-python-adapter-id", "version": "0.0.0", "topology": "replace-with-topology"}
FAILURE_CODES = [
    "profile-version-unsupported", "profile-root-mismatch", "required-feature-unsupported",
    "identity-unresolved", "authority-unresolved", "authority-expired", "authority-revoked",
    "authority-amplification", "fact-cut-unavailable", "causal-gap", "payload-digest-mismatch",
    "idempotency-conflict", "conflict-visible", "disclosure-insufficient", "required-field-withheld",
    "completion-unproved", "local-policy-rejected",
]
ROOTS = [
    "sha256:d8c212284e53d8e7dacbca8acdb0d7d8d8ee300e1f55233629a7dd006b6e3bc6",
    "sha256:dcea56f3624a752070c3a06f7636a0605996d2cd5ea1b6581f935367e07c268c",
]


def capabilities(hub_id, authority_letter):
    return {
        "$schema": "https://kfd.libkungfu.dev/schemas/kfd-agent-hub/capabilities.schema.json",
        "schemaVersion": 1,
        "contract": "kfd-agent-hub-capabilities",
        "identity": {"hubId": hub_id, "nodeId": f"{hub_id}-node", "actorId": f"{hub_id}-actor"},
        "profileVersions": ["0.1.0-alpha.1"],
        "requiredFeatures": ["transport-receipts"],
        "optionalFeatures": [],
        "operations": ["capability-advertisement", "responsibility-proposal", "fact-admission", "supersession", "completion-assessment", "warrant-revocation"],
        "topologies": ["local-peer"],
        "disclosureModes": ["full", "partial", "redacted", "reference-only", "intentionally-withheld"],
        "failureCodes": FAILURE_CODES,
        "bindings": [{"id": "jsonl-stdio", "mediaTypes": ["application/json"], "authentication": "local-process", "transportReceipts": True, "duplicateDelivery": "at-least-once"}],
        "limits": {"maxInlineBytes": 65536, "maxEnvelopeBytes": 1048576},
        "authorityRoots": [f"sha256:{authority_letter * 64}"],
        "issuedAt": "2026-08-15T00:00:00.000Z",
    }


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
        "binding": "jsonl-stdio/v1", "scope": "evidence-valid-negative-starter"
    })
    value["hubs"] = [
        {
            "hubId": hub_id,
            "capabilities": capabilities(hub_id, letter),
            "capabilityRoot": ROOTS[index],
        }
        for index, (hub_id, letter) in enumerate((("starter-hub-a", "a"), ("starter-hub-b", "b")))
    ]
    return value


def evaluate(request):
    # Replace this fail-closed placeholder with product-owned Hub behavior.
    return envelope(request["requestId"], "error", "scenario-not-implemented", "not-applicable", {
        "scenario": request.get("input", {}).get("scenario", "unknown"),
        "scope": "hub-semantics-not-implemented",
    })


for line in sys.stdin:
    request = json.loads(line)
    response = handshake(request["requestId"]) if request["operation"] == "handshake" else evaluate(request)
    sys.stdout.write(json.dumps(response, separators=(",", ":")) + "\n")
    sys.stdout.flush()
