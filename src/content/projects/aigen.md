---
title: "AiGen"
description: "Local control plane for coding agents — discovers running AI agents, tracks sessions, exposes REST API + CLI + web dashboard + TUI."
domain: "Developer Tools"
tech: ["Python", "FastAPI", "React", "TypeScript", "SQLite", "Click", "Textual"]
github: null
demo: null
article: null
image: "/images/projects/aigen.svg"
featured: true
order: 2
tier: "flagship"
status: "private"
---

## Problem

AI coding agents run as isolated processes with no shared state or visibility. When multiple agents are running simultaneously — Claude Code, Copilot, Cursor — there is no way to see what they're doing, what context they have, or what decisions they've made. Sessions are ephemeral and untracked.

## Approach

Built a local control plane that acts as a persistent layer beneath all running agents. It uses process discovery to find active agent sessions, enriches them with git context, stores everything in SQLite, and exposes four interfaces for interaction: REST API, CLI, web dashboard, and terminal UI.

## Features

- **6+ agent type discovery** — detects Claude Code, GitHub Copilot, Cursor, Aider, Continue, and custom agents via process inspection
- **Session tracking** — persistent session history with full context snapshots stored in SQLite
- **REST API** — FastAPI backend with OpenAPI docs for programmatic access
- **CLI** — Click-based command-line interface for quick status checks and session management
- **Web dashboard** — React + TypeScript UI for visual session browsing
- **TUI** — Textual-based terminal UI for keyboard-driven workflows
- **Webhook ingestors** — ingest events from external agent systems
- **Memory and handoff** — shared memory store and session handoff between agents
- **LLM abstraction** — pluggable LLM layer for agent intelligence features

## Results

44 modules across the codebase. 39+ tests with CI enforcing coverage at 75% or above.
