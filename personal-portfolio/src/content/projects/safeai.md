---
title: "SafeAI"
summary: "I’m building a Python SDK for configurable policy controls around agent data and tool use, combining detection, redaction, tool contracts, approvals and audit records."
category: "tool"
stage: "Public beta package"
role: "Creator and maintainer"
tech: ["Python", "Pydantic", "Policy evaluation", "MCP", "Agent integrations"]
order: 1
detail: true
diagram: "shield"
url: "https://pypi.org/project/safeai-sdk/"
---

## Problem

An AI agent can propose an action, but the surrounding application still needs to decide whether that action is permitted. The same applies to data entering a model, leaving it, or being passed to a tool. Those decisions need to reflect the application's own rules.

I'm building SafeAI to make those boundaries explicit in Python applications. The SDK provides configurable controls around inputs, outputs, tool calls and memory, with records of the decisions made along the way.

## My contribution

I developed and maintain the policy runtime, detection and redaction flows, tool-contract controls, approval handling and audit mechanisms. The SDK exposes these through application APIs, integration adapters and an MCP interface.

Policy decisions can allow, redact, block or require approval. Tool contracts describe accepted and emitted data, while interception checks the requested action and filters permitted fields before returning parameters to the calling application. Memory controls include schema-defined fields, retention handling and encrypted handles.

## Engineering decisions

The policy evaluator uses ordered rules and blocks unmatched requests by default. Validated policy models give applications an explicit configuration surface, and the decision record carries context about the policy, agent, tool and session.

I kept detection separate from policy. A detected pattern supplies information that rules can act on; the application decides what that means at a particular boundary. Approval workflows handle cases where a person needs to review an action before it proceeds.

The enforcement point is the integrated application boundary. This makes the integration contract central: applications must route the relevant data and actions through the checks. Pattern-based detectors and policy controls have defined scope, so their behaviour can be tested against concrete expectations.

## Outcome

SafeAI is available as an Apache-licensed beta Python package on PyPI and remains under active development. It brings agent-risk requirements into APIs, configuration and reviewable decisions that developers can incorporate into their own systems.
