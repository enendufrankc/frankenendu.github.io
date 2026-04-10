---
title: "Nova"
description: "Medical document text extraction using Azure GPT-4o vision capabilities."
domain: "Healthcare"
tech: ["Python", "Flask", "Azure OpenAI", "GPT-4o Vision", "Azure Blob Storage", "Docker"]
github: null
demo: null
article: null
image: "/images/projects/nova.svg"
featured: false
order: 7
tier: "supporting"
status: "private"
---

## Problem

Healthcare organisations handle large volumes of medical documents — discharge summaries, lab reports, referral letters — in PDF and image formats. Extracting structured text from these documents for downstream processing is slow, error-prone with traditional OCR, and difficult to maintain.

## Approach

Built a Flask application that accepts document uploads, stores originals in Azure Blob Storage, and runs GPT-4o vision inference to extract structured text. The extracted output is returned as JSON and includes integration documentation for .NET downstream consumers.

## Features

- **GPT-4o vision** — multimodal LLM inference for document understanding beyond traditional OCR
- **Azure Blob Storage** — document ingestion and storage pipeline on Azure
- **.NET integration docs** — documented integration contract for enterprise .NET consumers

## Results

Deployed for medical document processing, enabling healthcare organisations to extract structured data from unstructured clinical documents at scale.
