# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-powered portfolio website for Frank Enendu (AI Engineer), hosted via Vercel. Built on Astro 5 with React islands, featuring a Gemini-powered chatbot that lets visitors ask questions about Frank's experience and projects in natural language.

## Architecture

**Framework:** Astro 5 with React islands for interactive components (chatbot, theme toggle, particle hero).

**Hosting:** Vercel — serverless functions handle the chatbot API proxy; static pages are pre-rendered at build time.

**Content:** Astro content collections in `src/content/` for projects (markdown case studies) and blog posts.

**Project structure:**
```
src/
  components/       # Astro and React (.tsx) components
  layouts/          # BaseLayout, BlogLayout, ProjectLayout
  pages/            # index, projects/[slug], blog/[slug], about
  content/
    projects/       # 12 project case studies (markdown)
    blog/           # Blog posts (markdown)
  styles/
    global.css      # CSS custom properties, theme, typography
  lib/
    chatbot.ts      # Chatbot client logic
api/
  chat.ts           # Vercel serverless function (Gemini proxy)
public/             # Images, fonts, CV PDF
docs/
  superpowers/
    specs/          # Design and product specifications
    plans/          # Implementation plans
```

## Tech Stack

- **Astro 5** — framework with islands architecture
- **React + TypeScript** — interactive islands (chatbot, theme toggle)
- **tsParticles** — connected node graph hero animation
- **GSAP + ScrollTrigger** — scroll-driven animations
- **Google Gemini API** — chatbot LLM (via serverless proxy)
- **CSS custom properties** — theming, no CSS-in-JS or preprocessor

## Design System

**Colors:** Dark mode default with light mode toggle (stored in `localStorage`).
- Background: `#0a0a0a` (dark) / `#ffffff` (light)
- Accent: `#e94560` (coral red, same in both modes)
- Borders/surfaces follow a monochrome scale with CSS variable swapping

**Typography:** Playfair Display (headings, 700) + Inter (body/UI, 400-500), loaded from Google Fonts. JetBrains Mono for code blocks.

**Animations:** GSAP for scroll-driven sequences; tsParticles for the hero; Framer Motion inside React islands. All animations respect `prefers-reduced-motion`.

## Running Locally

```bash
npm install
npm run dev   # starts at http://localhost:4321
```

The chatbot requires a `.env` file at the project root:
```
GEMINI_API_KEY=your_key_here
```

## Deployment

Vercel auto-deploys on push to `main`. Astro builds static pages plus the `api/chat.ts` serverless function. No manual build or upload step needed.

## Active Branch

Feature work is on `feat/portfolio-redesign`. The `main` branch still holds the old static HTML5 UP site until the rebuild is merged.

## Key Conventions

- Content collections are the source of truth for projects and blog — add/edit markdown in `src/content/`, not in page files
- CSS changes go in `src/styles/global.css` (CSS custom properties) — no SCSS compilation step
- The chatbot system prompt lives in `api/chat.ts` — it is a curated ~2000-word professional context document and is never exposed client-side
- HTML5 UP "Massively" template attribution must be preserved in the footer (CCA 3.0 license)
- Images live in `public/images/` and are referenced by absolute path from HTML
- Environment secrets (`.env`) are gitignored; `GEMINI_API_KEY` is set as a Vercel environment variable in production
- Design spec: `docs/superpowers/specs/2026-04-10-portfolio-redesign-design.md`
- No test suite exists

## Content

**Projects (12 total):**
- Tier 1 (full case studies, featured on homepage): SafeAI, AiGen, FairLens, CaseReviewer
- Tier 2 (shorter case studies): Personal Copilot, Multi-Modal Content Generator, Nova, SharePoint to Azure AI Search
- Tier 3 (summary cards only): NHS Performance Chatbot, Agent2Agent, LLM Game Recommender, Semantic Segmentation

**Blog:** Markdown posts in `src/content/blog/`, initially migrated from Medium articles.
