---
title: "OgaHQ"
description: "WhatsApp AI assistant subsystem inside OgaHQ — multilingual, command-driven, offline-aware. Built for African retail merchants on the channel they already work in."
type: "client"
service: "conversational-ai"
industry: "African Retail SaaS"
tier: "featured"
status: "client-work"
tech: ["TypeScript", "Google Gemini", "WhatsApp Business API", "Node.js", "PostgreSQL"]
github: null
demo: null
article: null
live_url: "https://ogahq.app/"
image: "/images/work/ogahq.svg"
featured: true
order: 11
outcome_bullets:
  - "[PLACEHOLDER] Adopted by ~X% of OgaHQ merchants in first 90 days"
  - "[PLACEHOLDER] Merchants reclaim ~10 hours/week on admin work"
  - "Multilingual (English + Nigerian Pidgin), offline-aware sync"
testimonial:
  quote: "[DRAFT — replace with real signed-off quote before launch] We needed an AI assistant our merchants would actually use. Inflect Hub built it inside WhatsApp where our customers already live, in the languages they actually speak."
  author: "[DRAFT — founder name pending]"
  role: "Founder, OgaHQ"
  is_draft: true
---

## Context

OgaHQ is an all-in-one operating system for African retail, wholesale, and kiosk merchants — point-of-sale, inventory, accounting, and CRM in one tool. Used by fashion retailers, mini-markets, and wholesale depots across Nigeria, Kenya, and South Africa. The founding team came to Inflect Hub with a clear thesis: merchants on the platform spend most of their day inside WhatsApp, not the OgaHQ dashboard.

## Problem

Merchants were context-switching between OgaHQ (for the business operations) and WhatsApp (for customer conversations) all day. Stock updates, sales checks, invoice sends — every task was a small but constant tax. English-only chatbots would not work; Nigerian Pidgin and code-switching between languages are the norm. And network connectivity is unreliable enough that an "always-on" assistant would fail at the worst moments.

## Approach

We mapped the highest-volume merchant workflows from real OgaHQ transcripts, designed a command vocabulary that maps to those workflows, and built an LLM-powered assistant deployable inside OgaHQ's WhatsApp Business integration. The assistant understands English and Nigerian Pidgin, falls back to cached intents during connection drops, and escalates anything sensitive to the human merchant with full context.

## What we built

- **Multilingual command parsing** — Gemini-powered intent detection in English + Nigerian Pidgin, with code-switching tolerance
- **Workflow library** — pre-built commands for stock updates, sales checks, invoice generation, customer history lookup
- **Offline-aware fallback** — cached intents and queued actions sync when connection returns
- **Human escalation** — sensitive or ambiguous queries route to the merchant with full conversation context
- **OgaHQ dashboard parity** — every command resolves against the same data the merchant sees in the web app

## Stack

TypeScript · Google Gemini · WhatsApp Business API · Node.js · PostgreSQL

## Outcome

- [PLACEHOLDER] Adopted by ~X% of OgaHQ merchants in the first 90 days
- [PLACEHOLDER] Merchants reclaim ~10 hours/week on admin work
- Multilingual (English + Nigerian Pidgin), offline-aware sync

---

*This is a DRAFT case study. Real engagement specifics and a signed-off client quote must be substituted before launch. See spec §7.3 and §13 for the launch gate.*
