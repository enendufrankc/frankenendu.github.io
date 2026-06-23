---
title: "FairLens"
description: "Multi-agent AI platform for fair opportunity allocation — grants, scholarships, and applications processed by 7 specialised AI agents."
type: "product"
service: "custom-platforms"
industry: "Higher Education & Philanthropy"
tier: "featured"
status: "private"
tech: ["Next.js", "FastAPI", "Google ADK", "LiteLLM", "Prisma", "Stripe", "Clerk", "Playwright"]
github: null
demo: null
article: null
live_url: "https://fairlens.app/"
image: "/images/projects/fairlens.svg"
featured: true
order: 1
outcome_bullets:
  - "13 planning documents produced during architecture phase"
  - "Multi-tenant SaaS architecture with role-based access, audit logging, multi-currency billing"
  - "Live at fairlens.app — universities and grant programs onboarded"
testimonial:
  quote: "[DRAFT — replace with real signed-off quote before launch] FairLens lets us evaluate thousands of applications with the consistency our compliance team needs and the empathy our applicants deserve."
  author: "[DRAFT]"
  role: "Director of Grants, [DRAFT institution]"
  is_draft: true
---

## Problem

Grant and scholarship review is slow, inconsistent, and prone to bias. Human reviewers apply different standards across applications, miss relevant criteria, and can't process volume at scale. Applicants receive little actionable feedback.

## Approach

Built a Turborepo monorepo with a Next.js frontend, FastAPI backend, and a Google ADK multi-agent system with 7 specialized agents. Each agent handles a distinct phase of the review pipeline — from intake and eligibility screening through scoring, comparison, and recommendation generation.

## Features

- **7 specialized agents** — intake, eligibility, scoring, comparison, feedback, escalation, and orchestrator agents built on Google ADK
- **Multi-provider LLM routing** — LiteLLM abstraction layer switching between providers based on cost and capability requirements
- **Full SaaS stack** — Clerk authentication, Stripe billing, Prisma ORM with PostgreSQL
- **End-to-end testing** — Playwright test suite covering critical user flows
- **Railway deployment** — containerized deployment with environment-based configuration

## Results

13 planning documents produced during architecture phase. Complete multi-tenant SaaS architecture with role-based access, audit logging, and multi-currency billing.
