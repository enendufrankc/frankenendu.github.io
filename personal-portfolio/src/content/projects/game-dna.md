---
title: "Game DNA"
summary: "I engineered a multimodal pipeline combining gameplay video and mathematical data into structured experience profiles, with agent-driven capture, resumable processing, quality gates and semantic retrieval."
category: "ballys"
stage: "Active development"
role: "AI Engineer R&D · Bally’s Interactive"
tech: ["Python", "Gemini", "Playwright", "google-genai", "AWS", "OpenTofu"]
order: 1
detail: true
diagram: "pipeline"
---

## Problem

Genre labels and payout metadata describe only part of a game. Understanding how it feels to play requires evidence from the experience itself, alongside mathematical characteristics. Turning those sources into comparable profiles introduces another challenge: capture can fail, agents can get stuck and the sources can disagree.

At Bally's Interactive, I engineered an evolved game-intelligence pipeline that connects gameplay capture, analysis and retrieval. I built on earlier team work while developing the orchestration, reliability controls and infrastructure around the profiling process.

## My contribution

My work spans agent-driven browser capture, video and mathematical processing, structured synthesis, quality checks and embeddings. I developed the Python workflow orchestration and AWS infrastructure, with particular attention to retaining intermediate results and diagnosing failures.

The capture agent uses Playwright and screenshot-based Gemini decisions to interact with games. Processing then combines recorded gameplay and mathematical information into an experience profile. Accepted profiles can move into semantic retrieval, where their structured descriptions support comparison and discovery.

## Engineering decisions

I used a custom Python dependency graph to coordinate the processing stages. Independent work can run concurrently, intermediate artifacts are persisted, and a resumed run can reuse completed stages. Quality failures can send work back to the responsible stage instead of allowing an unchecked result through.

Capture has action budgets and checks for repeated behaviour. An independent screenshot assessment helps distinguish a failed agent attempt from an unusable game. Synthesis checks cover completeness, consistency and grounding, with separate handling for conflicting evidence.

I also implemented infrastructure definitions for capture and processing workloads, persistent storage and operational alarms. Keeping those workloads separate reflects their different compute requirements.

## Outcome

The work produced an implemented profiling pipeline with recovery paths, evidence checks and retrieval support. I continue to develop its evaluation tooling and reliability, focusing on how to assess the quality of the profiles as well as how to generate them.
