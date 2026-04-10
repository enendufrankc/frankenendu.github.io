---
title: "Multi-Modal Content Generator"
description: "AI-powered marketing campaign generator producing text, images, audio, and video content."
domain: "Generative AI"
tech: ["FastAPI", "OpenAI", "DALL-E 3", "MoviePy", "Docker", "Railway"]
github: null
demo: null
article: null
image: "/images/projects/multi-modal.png"
featured: false
order: 6
tier: "supporting"
status: "private"
---

## Problem

Marketing teams need consistent multi-modal content — copy, visuals, voiceover, and video — for campaigns. Producing this across tools and vendors is slow, inconsistent in style, and expensive.

## Approach

Built a multi-agent pipeline where specialized agents handle each modality. A brief enters the system, an orchestrator agent plans the campaign, and downstream agents generate text (OpenAI), images (DALL-E 3), audio (TTS), and video (MoviePy) in parallel before assembling a final deliverable package.

## Features

- **Multi-agent pipeline** — orchestrator + 4 specialist agents, each owning a single output modality
- **4 modalities** — text copy, AI-generated images, text-to-speech audio, and assembled video
- **Docker + Railway deployment** — containerized with environment-based configuration, deployed to Railway

## Results

End-to-end content generation from a single campaign brief. A marketing team can go from brief to a full content package — copy, images, audio, and video — in a single pipeline run.
