---
title: "AiGen"
summary: "I’m developing a control plane for coding agents that connects process discovery, session telemetry, repository memory and handoffs, with an MCP interface for agent access."
category: "tool"
stage: "In development"
role: "Creator and developer"
tech: ["Python", "SQLite", "MCP", "React", "TypeScript"]
order: 2
detail: true
diagram: "sessions"
---

## Problem

Working across coding agents creates a continuity problem. A developer needs to understand which agents are running, which repositories they are touching, what happened during a session and what the next session should know. That information is spread across processes, tool-specific events and conversation history.

I'm developing AiGen to connect those views. It provides a control plane for observing coding-agent sessions and carrying useful context between them, with repository memory and handoffs as part of the same system.

## My contribution

I built process discovery and adapter interfaces that identify agent sessions and enrich them with repository and branch context. Tool-specific events are normalised and persisted in SQLite, alongside session information, memory and handoff records.

The implementation includes API and command-line access, dashboard interfaces and an MCP server. Handoff generation brings together session state, repository memory, changes and next-step context so a subsequent agent or developer has a concrete starting point.

## Engineering decisions

I used adapters to separate tool-specific discovery and event handling from the shared session model. This lets the control plane accommodate different coding tools without requiring every interface to understand each tool's event format.

SQLite provides persistent storage for the local control plane, with related records for sessions, events and continuity material. Repository memory has a different lifecycle from a single session, so it can remain available as work moves between conversations.

The MCP interface exposes operations such as listing sessions, accessing memory and retrieving handoffs. That gives coding agents a way to use the continuity layer directly. Model-assisted compaction sits alongside a template fallback, supporting handoff generation through more than one path.

## Outcome

AiGen is an MIT-licensed personal project in active development. The current work brings discovery, telemetry and continuity into one implementation, while I continue developing its interfaces and session-analysis features. The focus is making ongoing agent work easier to inspect and resume.
