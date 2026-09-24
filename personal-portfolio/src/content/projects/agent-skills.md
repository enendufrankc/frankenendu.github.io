---
title: "Agent Skills"
summary: "I initiated an internal library of reusable agent workflows and built discovery, installation and validation tooling, with contributors sharing engineering practices through a maintained catalogue."
category: "ballys"
stage: "Internal platform"
role: "Initiator and platform maintainer · Bally’s Interactive"
tech: ["Python", "Agent workflows", "MCP", "Metadata validation", "GitLab CI"]
order: 2
detail: true
diagram: "library"
---

## Problem

Useful agent instructions often begin as a local solution to a recurring engineering task. Without shared conventions and a way to find them, teams can end up recreating similar workflows and maintaining separate copies.

I initiated an internal library at Bally's Interactive to make that knowledge reusable. The problem included the content itself and the surrounding workflow: how an engineer discovers an artifact, understands where it came from, installs it and contributes improvements.

## My contribution

I built core platform tooling for a catalogue of skills, commands, rules, hooks, subagents and MCP configurations. Python scripts validate metadata, generate the catalogue and support installation and marketplace workflows. I worked with engineering contributors on shared conventions and practical guidance.

I also developed an instruction-improvement pipeline. It proposes rewrites, checks that important requirements survive and compares candidate instructions before recording whether a change was accepted. This brings an explicit review process to a task that can otherwise become an informal exercise in shortening prompts.

## Engineering decisions

A shared artifact registry gives the tooling a consistent description of the different contribution types. Metadata and provenance help users understand an artifact's purpose and origin, while automated validation catches structural problems early.

For instruction improvement, I combined deterministic checks with model-based comparison. Checks cover requirements such as numbered steps, hard gates, metadata and length constraints; model review adds a separate assessment of the candidate. Accepted and rejected attempts are recorded, making the process inspectable.

I paired the scripts with installation guidance, examples and a browsable catalogue. The contribution process matters as much as the underlying format: reusable instructions need a route from an individual engineer's workflow into shared maintenance.

## Outcome

The result is a collaborative internal library with catalogue publication and validation automation. My contribution connects the original idea with the tooling and documentation needed to maintain it, while other engineers contribute their own workflows and expertise.
