---
title: "Personal Copilot"
description: "Personal AI copilot for context-aware task routing across calendar, email, and notes."
type: "product"
service: "conversational-ai"
industry: "Productivity"
tier: "secondary"
status: "private"
tech: ["TypeScript", "OpenAI"]
github: null
demo: null
article: null
live_url: null
image: "/images/projects/personal-copilot.svg"
featured: false
order: 5
outcome_bullets: []
---

## Problem

Personal planning tools are either too simple (basic to-do apps) or too complex (enterprise project management tools). There's a gap for an intelligent assistant that understands your finances, goals, and schedule and can reason across all three.

## Approach

Built a FastAPI backend with 17 route modules and a React Native mobile app using Expo. Claude serves as the AI backbone through a structured prompt registry that routes user intent to the appropriate planning module — financial analysis, goal tracking, or schedule optimization.

## Features

- **17 route modules** — dedicated FastAPI routes for finance, goals, tasks, calendar, habits, and more
- **Claude prompt registry** — structured prompts mapped to planning domains, enabling context-aware responses
- **Plaid integration** — read-only bank account and transaction data for financial context
- **Mobile-first** — React Native + Expo for iOS and Android with offline-capable local SQLite storage

## Results

Comprehensive personal AI assistant combining financial data, goal tracking, and conversational planning in a single mobile interface.
