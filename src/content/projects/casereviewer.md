---
title: "CaseReviewer"
description: "AI-powered EB-1A visa petition analyzer — analyzes petitions against 1,500+ precedent USCIS decisions with hybrid vector + BM25 search."
domain: "Finance & Legal"
tech: ["FastAPI", "Azure OpenAI", "Azure AI Search", "PostgreSQL", "Celery", "Redis", "Terraform", "Stripe"]
github: null
demo: null
article: null
image: "/images/projects/casereviewer.png"
featured: false
order: 4
tier: "flagship"
status: "private"
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
