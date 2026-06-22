---
title: "CaseReviewer"
description: "AI-powered EB-1A visa petition analyzer — analyzes petitions against 1,500+ precedent USCIS decisions with hybrid vector + BM25 search."
type: "product"
service: "custom-platforms"
industry: "Immigration Law"
tier: "featured"
status: "private"
tech: ["FastAPI", "Azure OpenAI", "Azure AI Search", "PostgreSQL", "Celery", "Redis", "Terraform", "Stripe"]
github: null
demo: null
article: null
live_url: "https://casereviewer.ai/"
image: "/images/projects/casereviewer.svg"
featured: true
order: 2
outcome_bullets:
  - "1,500+ precedent USCIS decisions indexed with hybrid vector + BM25 search"
  - "Attorneys complete initial petition assessments in minutes vs. days"
  - "Production with freemium paywall and Stripe per-report billing"
testimonial:
  quote: "[DRAFT — replace with real signed-off quote before launch] CaseReviewer compressed our first-draft EB-1A assessment from three days to under an hour without losing the precedent grounding we rely on."
  author: "[DRAFT]"
  role: "Managing Partner, [DRAFT immigration law firm]"
  is_draft: true
---

## Problem

EB-1A extraordinary ability visa petitions require attorneys to manually analyze each petition against hundreds of precedent USCIS decisions. This process takes days, costs thousands of dollars, and produces inconsistent results depending on the reviewing attorney's familiarity with recent decisions.

## Approach

Built a petition analysis pipeline: PDF upload triggers text extraction, an LLM analyzes each EB-1A criterion independently, hybrid vector + BM25 search retrieves the most relevant precedent decisions from a corpus of 1,500+, and a noisy-OR scoring model aggregates criterion-level assessments into an overall petition strength score.

## Features

- **Hybrid search** — Azure AI Search combining dense vector similarity and BM25 keyword matching for precedent retrieval
- **Per-criterion analysis** — separate LLM passes for each of the 10 EB-1A criteria with citation to specific precedents
- **Async processing** — Celery + Redis task queue handling PDF parsing and LLM calls asynchronously
- **Multi-currency payments** — Stripe integration with freemium tier and per-report billing
- **Terraform IaC** — full infrastructure-as-code for Azure resource provisioning
- **Azure DevOps CI/CD** — automated pipeline from commit to production deployment

## Results

Production deployed with a freemium paywall. Attorneys can run initial petition assessments in minutes rather than days.
