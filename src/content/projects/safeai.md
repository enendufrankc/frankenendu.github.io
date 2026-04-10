---
title: "SafeAI"
description: "Runtime security framework for AI agents — policy engine, encrypted memory, capability tokens, and adapters for every major AI framework."
domain: "AI Safety"
tech: ["Python", "FastAPI", "Pydantic", "Click", "PyYAML", "cryptography"]
github: "https://github.com/safeai-sdk/safeai"
demo: null
article: null
image: "/images/projects/safeai.svg"
featured: true
order: 1
tier: "flagship"
status: "public"
---

## Problem

AI agents ship with zero runtime security. There is no standard way to enforce what an agent can read, write, or call at runtime — leaving production deployments open to prompt injection, data exfiltration, and privilege escalation.

## Approach

Built a runtime security layer that operates at three boundaries: input validation, action authorization, and output filtering. The framework is framework-agnostic, with adapters for every major AI framework so teams can drop it into existing agents without rewriting business logic.

## Features

- **Policy engine** — declarative YAML/JSON policies with allow/deny rules per agent role
- **9 detectors** — prompt injection, PII leakage, hallucination indicators, and more
- **Encrypted memory** — agent memory store with AES-256 encryption at rest
- **Capability tokens** — scoped, time-limited tokens granting specific action permissions
- **Intelligence layer** — LLM-assisted policy recommendation from codebase analysis
- **Deployment modes** — middleware, sidecar, and SDK embedding modes

## Results

Published to PyPI as `safeai-sdk`. The project spans 16,800 lines of code, includes 40+ tests, 55+ documentation pages, and is released under Apache 2.0.
