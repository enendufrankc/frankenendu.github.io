---
title: "SharePoint to Azure AI Search"
description: "Library for indexing SharePoint Online content into Azure AI Search with security trimming."
type: "product"
service: "custom-platforms"
industry: "Enterprise"
tier: "archived"
status: "public"
tech: ["Python", "Microsoft Graph API", "Azure AI Search", "MSAL"]
github: "https://github.com/enendufrankc/SharePoint-Indexing-to-Azure-Cognitive-Search"
demo: null
article: null
live_url: null
image: "/images/projects/sharepoint-search.svg"
featured: false
order: 8
outcome_bullets: []
---

## Problem

Enterprise documents stored in SharePoint Online are not natively searchable through Azure AI Search. Teams need a way to index SharePoint content while respecting the existing SharePoint permission model so users only find documents they're authorised to access.

## Approach

Built a Python library that authenticates to Microsoft Graph API using MSAL, crawls SharePoint document libraries, and indexes content into Azure AI Search with security trimming metadata. The library uses dependency injection for testability and supports incremental indexing.

## Features

- **Security trimming** — indexes SharePoint ACLs alongside content so Azure AI Search can filter results by user identity
- **Microsoft Graph API** — full SharePoint crawl using Graph API with delta query support for incremental updates
- **MSAL authentication** — supports both delegated and application permission flows
- **Dependency injection** — injectable clients for testing and customisation

## Results

Open-source library available on GitHub. Used by enterprise teams needing searchable SharePoint content with permission-aware retrieval.
