# Portfolio Redesign - Design Specification

**Date:** 2026-04-10
**Author:** Frank Enendu
**Status:** Draft

---

## 1. Vision

A modern, AI-powered portfolio website that unifies Frank Enendu's professional presence across LinkedIn, Medium, GitHub, and social media -- with a conversational interface that lets anyone learn about him through natural language queries.

### Goals

1. **Professional credibility** -- establish Frank as a senior AI Engineer who leads teams, ships production systems, and contributes to open source
2. **Consulting leads** -- create an inbound channel for potential clients who need AI/ML engineering work

### Non-Goals

- E-commerce or payment processing
- Full CMS or admin dashboard
- Social media auto-posting
- Real-time data sync from external platforms (Phase 2)

---

## 2. Professional Profile

### Identity

- **Name:** Frank Enendu, MSc
- **Primary title:** AI Engineer
- **Supporting positioning:** Solutions Architect (woven into copy, not displayed as a second title)
- **Location:** Manchester, England, United Kingdom
- **Email:** enendufrankc@gmail.com

### Career Timeline (for About page)

| Period | Role | Company | Location |
|--------|------|---------|----------|
| Jan 2026 -- Present | AI Engineer R&D | Bally's Interactive | Manchester, UK |
| May 2024 -- Jan 2026 | AI Engineer | BCN Group | Manchester, UK |
| Aug 2023 -- May 2024 | Graduate Engineer | BCN Group | Manchester, UK |
| Jul 2023 -- Sep 2023 | Data Scientist | Studio 14 | Birmingham, UK |
| Dec 2021 -- Dec 2022 | Junior Data Scientist | HubPay | UAE (remote) |
| Apr 2021 -- Sep 2022 | Data & Research Analyst | Enterprise Development Centre | Lagos, Nigeria |
| May 2020 -- Feb 2021 | Business Analyst | Sunnet Systems Ltd | Lagos, Nigeria |
| Apr 2019 -- Apr 2020 | BI & Product Intern | Wakanow | Lagos, Nigeria |

### Education

- **MSc Data Science and Artificial Intelligence** (Distinction) -- University of Liverpool, 2022-2023
- **WorldQuant University** -- Applied Data Science Lab
- **Lagos Business School** -- Young Talent Program, 2019
- **BTech Logistics Management** -- Federal University of Technology Owerri, 2013-2018

### Certification

- Microsoft Certified: Azure AI Engineer Associate

### Key Skills (for About page and chatbot context)

- AI Engineering: Agentic workflows, RAG, prompt engineering, fine-tuning, MCP design
- Frameworks: LangChain, CrewAI, Pydantic, AutoGen, Google ADK, Anthropic SDK
- LLMs: GPT, Claude, Gemini, Llama, BERT, HuggingFace Transformers
- Deep Learning: TensorFlow, PyTorch, Keras, Scikit-learn
- Cloud: Azure (OpenAI, AI Search, Synapse, Fabrics, Functions, DevOps), GCP (Vertex AI, BigQuery), AWS (SageMaker)
- LLMOps/MLOps: LangFlow, Prompt Flow, Docker, CI/CD, MLFlow, Kubeflow
- Software Engineering: Python, React, TypeScript, SQL, FastAPI, Next.js
- Data: PostgreSQL, MongoDB, SQLite, Power BI, Tableau

---

## 3. Architecture

### Framework: Astro

**Why Astro:**
- Purpose-built for content sites; ships zero JS by default
- Islands architecture allows interactive components (chatbot, particles, theme toggle) without bloating the bundle
- Content collections for markdown-based blog posts and project case studies
- Native Vercel adapter with serverless function support

### Hosting: Vercel

**Why Vercel (instead of GitHub Pages):**
- Free tier includes serverless functions (required for chatbot API proxy)
- Native Astro support with zero-config deployment
- Edge network for fast global delivery
- Deploy-on-push from GitHub (same workflow as GitHub Pages)
- Custom domain support

### Deployment Pipeline

```
Push to main on GitHub
  -> Vercel auto-deploys
  -> Astro builds static pages + serverless API routes
  -> Site live at frankenendu.github.io (or custom domain)
```

### Project Structure (Astro)

```
src/
  components/       # Reusable UI components
    Hero.astro      # Particle animation hero
    Navbar.astro    # Navigation with theme toggle
    ProjectCard.astro
    Timeline.astro  # Career timeline
    ChatBot.tsx     # React island for chatbot
    ThemeToggle.tsx # React island for dark/light
  layouts/
    BaseLayout.astro
    BlogLayout.astro
    ProjectLayout.astro
  pages/
    index.astro     # Home
    projects/
      index.astro   # Projects grid
      [slug].astro  # Individual case study
    blog/
      index.astro   # Blog list
      [slug].astro  # Individual post
    about.astro     # About + timeline + contact
  content/
    projects/       # Markdown case studies
      safeai.md
      aigen.md
      fairlens.md
      ...
    blog/           # Markdown blog posts
  styles/
    global.css      # CSS variables, theme, typography
  lib/
    chatbot.ts      # Chatbot client logic
api/
  chat.ts           # Vercel serverless function (Gemini proxy)
public/
  fonts/            # Playfair Display, Inter
  images/           # Project screenshots, OG images
  frank-enendu-cv.pdf
```

---

## 4. Design System

### Color Palette

**Dark mode (default):**

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#0a0a0a` | Page background |
| `--bg-secondary` | `#141414` | Card backgrounds, elevated surfaces |
| `--bg-tertiary` | `#1e1e1e` | Subtle contrast areas |
| `--text-primary` | `#ffffff` | Headings, primary text |
| `--text-secondary` | `#a0a0a0` | Body text, descriptions |
| `--text-muted` | `#666666` | Captions, metadata |
| `--accent` | `#e94560` | CTAs, links, highlights, hover states |
| `--accent-hover` | `#ff5a75` | Hover state for accent |
| `--border` | `#2a2a2a` | Dividers, card borders |

**Light mode:**

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#ffffff` | Page background |
| `--bg-secondary` | `#f5f5f5` | Card backgrounds |
| `--bg-tertiary` | `#ebebeb` | Subtle contrast areas |
| `--text-primary` | `#0a0a0a` | Headings, primary text |
| `--text-secondary` | `#4a4a4a` | Body text |
| `--text-muted` | `#888888` | Captions, metadata |
| `--accent` | `#e94560` | CTAs, links (same in both modes) |
| `--accent-hover` | `#d13350` | Slightly darker for light bg hover |
| `--border` | `#e0e0e0` | Dividers |

Theme toggle stored in `localStorage` with system preference as initial fallback. Default is dark.

### Typography

| Element | Font | Weight | Size (desktop) |
|---------|------|--------|----------------|
| H1 (hero name) | Playfair Display | 700 | 4rem-6rem |
| H2 (section headings) | Playfair Display | 700 | 2.5rem |
| H3 (card titles) | Playfair Display | 600 | 1.5rem |
| Body | Inter | 400 | 1rem (16px) |
| Small/captions | Inter | 400 | 0.875rem |
| Code | JetBrains Mono | 400 | 0.875rem |
| Nav links | Inter | 500 | 0.875rem |

Fonts loaded via Google Fonts with `font-display: swap`. Subset to Latin for performance.

### Animations

**Libraries:**
- **Three.js** (or tsParticles) -- hero particle network
- **GSAP + ScrollTrigger** -- scroll-driven animations, page transitions
- **Framer Motion** (via React islands) -- chatbot and interactive component animations

**Animation inventory:**

| Element | Animation | Trigger |
|---------|-----------|---------|
| Hero particles | Connected node graph, mouse-interactive | Page load (always running) |
| Hero text | Fade-in + slight upward slide | Page load, staggered |
| Section headings | Slide in from left | Scroll into view |
| Project cards | Fade-in + scale up | Scroll into view, staggered |
| Timeline items | Alternating slide in (left/right) | Scroll into view |
| Blog cards | Fade-in | Scroll into view |
| CTA buttons | Subtle scale on hover, color transition | Hover |
| Page transitions | Fade crossfade | Navigation |
| Chatbot | Slide up from bottom-right | Toggle click |
| Theme toggle | Rotate icon (sun/moon) | Click |

**Performance guardrails:**
- Particles pause when tab is not visible (`visibilitychange` event)
- Particles use reduced count on mobile (< 768px)
- All scroll animations use `will-change` sparingly
- `prefers-reduced-motion` media query disables all non-essential animations
- Three.js loaded as async island, not blocking page render

---

## 5. Site Structure & Pages

### Navigation

```
[ Frank Enendu ]   Home   Projects   Blog   About   [sun/moon toggle]
```

Fixed navbar, transparent on hero, solid on scroll. Mobile: hamburger menu.

### Page 1: Home (`/`)

**Sections in order:**

1. **Hero (full viewport)**
   - Full-screen connected node graph particle animation (coral + white on dark bg)
   - Mouse-interactive: nodes near cursor connect/attract
   - Centered text overlay:
     - "Frank Enendu" (Playfair Display, large)
     - "AI Engineer" (Inter, medium, accent color)
     - One-line tagline: "I design and build production AI systems -- from LLM pipelines to enterprise infrastructure."
     - CTA button: "View my work" (scrolls to featured projects)

2. **Featured Projects (2-3 cards)**
   - SafeAI and AiGen prominently displayed
   - Third slot: CaseReviewer or FairLens (rotatable)
   - Each card: title, one-line description, tech tags, link to case study
   - "See all projects" link to `/projects`

3. **Brief About**
   - 2-3 sentence professional summary
   - Key stats: "3+ years in production AI | 6+ industries | MSc Distinction"
   - "Learn more" link to `/about`

4. **Latest Blog Posts (2-3 cards)**
   - Most recent posts with title, date, excerpt
   - "Read more" link to `/blog`

5. **Contact CTA**
   - "Let's work together" heading
   - Email link + chatbot prompt: "Or ask my AI assistant anything about me"
   - LinkedIn and GitHub icon links

### Page 2: Projects (`/projects`)

**Grid Overview (`/projects`):**
- Filterable by domain: All | AI Safety | Developer Tools | Multi-Agent Systems | Healthcare | Finance & Legal | Enterprise | Generative AI | Computer Vision
- Cards showing: project image/screenshot, title, domain tag, one-line description, tech stack pills
- Click -> individual case study page

**Case Study Pages (`/projects/[slug]`):**

Each project rendered from markdown with this structure:

```markdown
---
title: "SafeAI"
description: "Runtime security framework for AI agents"
domain: "AI Safety"
tech: ["Python", "FastAPI", "Pydantic", "Click"]
github: "https://github.com/safeai-sdk/safeai"
demo: null
article: null
image: "/images/projects/safeai.png"
featured: true
order: 1
status: "public"  # public | private | client-work
---

## The Problem
...

## My Approach
...

## Key Features
...

## Architecture
(diagram or description)

## Results & Impact
...

## Tech Stack
(detailed breakdown)
```

### Page 3: Blog (`/blog`)

**Blog List (`/blog`):**
- Cards with title, date, reading time, excerpt, tags
- Sorted by date descending

**Blog Post (`/blog/[slug]`):**
- Full markdown rendering with syntax highlighting (Shiki)
- Table of contents sidebar (desktop)
- "Share" and "Back to blog" links
- Related posts at bottom

Blog content stored as Astro content collections in `src/content/blog/`.

### Page 4: About (`/about`)

**Sections:**

1. **Professional Bio**
   - 2-3 paragraphs covering career narrative: Lagos origins, transition to AI/ML, MSc at Liverpool, BCN Group leadership, current R&D role, open-source work
   - No photo (per design decision)

2. **Career Timeline**
   - Visual vertical timeline with role, company, dates, 1-2 key achievements
   - Alternating left/right layout on desktop, linear on mobile
   - Starts at current role (Bally's Interactive), scrolls down through history

3. **Skills & Expertise**
   - Grouped by category (not an exhaustive list -- curated highlights)
   - Visual skill pills/tags, not a rating system

4. **Education & Certification**
   - MSc (Distinction), BTech, WorldQuant, Azure AI Engineer cert

5. **Downloadable CV**
   - "Download my CV" button linking to PDF

6. **Contact Section**
   - Email link
   - LinkedIn + GitHub links
   - Chatbot prompt: "Have a question? Ask my AI assistant."

**Removed from old site:** Home address, phone number, hobbies, favorite quote, copyright "Untitled"

---

## 6. Project Portfolio (12 Projects)

### Tier 1: Flagship (full case studies, promoted on homepage)

| # | Project | Domain | Repo Visibility | Description |
|---|---------|--------|-----------------|-------------|
| 1 | **SafeAI** | AI Safety | Public (`safeai-sdk/safeai`) | Runtime security framework for AI agents. 16,800 lines of Python, published on PyPI as `safeai-sdk`, 55+ pages of docs, policy engine, encrypted memory, capability tokens, adapters for LangChain/CrewAI/AutoGen/Claude ADK/Google ADK. |
| 2 | **AiGen** | Developer Tools | Private (recommend making public) | Local control plane for coding agents. Discovers running AI agents, tracks sessions in SQLite, REST API + CLI + web dashboard + TUI. 44 Python modules, 39+ test files, React frontend. |
| 3 | **FairLens** | Multi-Agent Systems | Private (case study only) | Multi-agent AI platform for fair opportunity allocation. Turborepo monorepo, Next.js + FastAPI + Google ADK with 7 specialized agents, Stripe billing, Clerk auth, Playwright e2e. |
| 4 | **CaseReviewer** | Finance & Legal | Private (case study only) | AI-powered EB-1A visa petition analyzer. FastAPI, Azure OpenAI, hybrid vector+BM25 search over 1,500+ USCIS decisions, multi-currency payments, Terraform IaC. |

### Tier 2: Strong Supporting (shorter case studies)

| # | Project | Domain | Repo Visibility |
|---|---------|--------|-----------------|
| 5 | **Personal Copilot** | Finance & Legal | Private (case study only) |
| 6 | **Multi-Modal Content Generator** | Generative AI | Private (case study only) |
| 7 | **Nova** | Healthcare | Private (case study only) |
| 8 | **SharePoint to Azure AI Search** | Enterprise | Public |

### Tier 3: Breadth (summary cards, no dedicated case study page)

| # | Project | Domain |
|---|---------|--------|
| 9 | **NHS Performance Chatbot** | Healthcare |
| 10 | **Agent2Agent** | Multi-Agent Systems |
| 11 | **LLM Game Recommender** | Generative AI |
| 12 | **Semantic Segmentation** | Computer Vision |

### Projects Removed (from old site)

All undergraduate/academic exercises: bank account OOP, voting system OOP, cache management, perceptron from scratch, k-means from scratch. All 6 placeholder projects with `href="#"` and empty descriptions. Power BI dashboards (moved to work experience bullets instead). Crypto trend analysis, consumer buying patterns.

---

## 7. Chatbot

### Phase 1 (Launch)

**Model:** Google Gemini (generous free tier for low-traffic portfolio use)

**Architecture:**
```
User (browser) -> ChatBot React island -> /api/chat (Vercel serverless) -> Gemini API
```

The serverless function:
- Accepts user message + conversation history
- Prepends system prompt with Frank's professional context
- Calls Gemini API
- Returns streamed response
- Stores no conversation data (stateless per session, history kept in client memory)

**System Prompt Context:**
A curated ~2000-word document covering:
- Professional bio and career narrative
- Current role and responsibilities
- Key projects and their descriptions
- Technical skills and expertise areas
- Education and certifications
- Availability and consulting interests
- Personality traits (professional but warm, direct, enthusiastic about AI)
- Boundaries: politely decline off-topic, political, or personal questions

**Scope:** Professional Q&A + light personality. The chatbot can:
- Answer questions about Frank's experience, skills, and projects
- Describe project architectures and tech choices
- Discuss consulting availability and areas of expertise
- Have light personal conversation (interests, background, career motivations)
- Provide links to GitHub repos, Medium articles, and LinkedIn

The chatbot cannot:
- Make commitments or quotes on Frank's behalf
- Share contact details beyond email
- Discuss client-specific work details
- Answer unrelated technical questions (it's not a general AI assistant)

**UI:**
- Floating button in bottom-right corner (coral accent)
- Expands to a chat panel (slide-up animation)
- Chat input with send button
- Message bubbles (user right-aligned, assistant left-aligned)
- "Powered by Gemini" footer text
- Close/minimize button
- Responsive: full-width on mobile, fixed-width panel on desktop

### Phase 2 (Future -- separate project)

Knowledge graph retrieval system:
- Ingest data from LinkedIn API (or export), GitHub API, Medium RSS, site content
- Build entity-relationship graph (projects, skills, companies, technologies)
- Graph-based retrieval for chatbot context
- This becomes a portfolio project itself

---

## 8. Performance & SEO

### Performance Targets

- Lighthouse Performance: 90+
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1

### SEO

- Semantic HTML5 throughout
- Open Graph meta tags on every page
- Dynamic OG images for blog posts and project pages
- `sitemap.xml` and `robots.txt` generated by Astro
- Structured data (JSON-LD) for Person and Article schemas
- Canonical URLs on all pages
- Blog posts optimized for search (title tags, meta descriptions, heading hierarchy)

### Accessibility

- WCAG 2.1 AA compliance target
- `prefers-reduced-motion` respected for all animations
- Sufficient color contrast (coral on both dark and light backgrounds passes AA)
- Keyboard navigation for all interactive elements
- ARIA labels on icon-only buttons (theme toggle, social links)
- Skip-to-content link

---

## 9. Content Requirements

The following content must be authored before or during implementation:

| Content | Owner | Format | Notes |
|---------|-------|--------|-------|
| Hero tagline | Frank | 1 sentence | Current draft: "I design and build production AI systems -- from LLM pipelines to enterprise infrastructure." |
| Professional bio | Frank | 2-3 paragraphs | For About page. Career narrative, not a LinkedIn summary. |
| 4 flagship case studies | Frank | Markdown (Problem/Approach/Results) | SafeAI, AiGen, FairLens, CaseReviewer |
| 4 supporting case studies | Frank | Markdown (shorter format) | Personal Copilot, Multi-Modal, Nova, SharePoint Search |
| 4 tier-3 project summaries | Frank | 2-3 sentences each | NHS Chatbot, Agent2Agent, Game Recommender, Semantic Seg |
| Blog posts (initial) | Frank | Markdown | Migrate/adapt existing Medium articles |
| Chatbot system prompt | Frank + Claude | ~2000 words | Professional context document |
| Updated CV PDF | Frank | PDF | Remove address/phone, update to current roles |

---

## 10. Privacy & Security

### Data Removed from Public Site

- Home address (was on old CV page)
- Phone number (was on old CV page)
- Hobbies and personal interests

### Security Concerns in Existing Repos (flagged for Frank)

- `NOVA-PLAYGROUND` repo: Azure DevOps PAT exposed in README clone command
- `PEAK` repo: `.env` file committed to repository

### Chatbot Security

- Gemini API key stored as Vercel environment variable (never exposed client-side)
- Rate limiting on `/api/chat` endpoint (prevent abuse)
- Input sanitization before sending to Gemini
- System prompt not exposed to users
- No persistent storage of conversations

---

## 11. Phasing

### Phase 1: Core Site (this implementation)

- Astro project setup with Vercel deployment
- Design system (colors, typography, theme toggle)
- All 4 pages (Home, Projects, Blog, About)
- Hero particle animation
- Scroll animations (GSAP)
- Project grid with domain filtering
- 4 flagship case study pages (content can be placeholder initially)
- Blog infrastructure (content collection, even if 0 posts at launch)
- Chatbot with system-prompt context
- SEO fundamentals (meta tags, sitemap, structured data)
- Responsive design (mobile-first)
- CV PDF download
- GitHub Actions -> Vercel deployment pipeline

### Phase 2: Content & Polish (post-launch iteration)

- All 12 project case studies fully written
- Blog posts migrated from Medium
- OG image generation
- Performance optimization (lazy loading, image optimization)
- Analytics (Vercel Analytics or Plausible)

### Phase 3: Knowledge Graph Chatbot (separate project)

- Data ingestion from LinkedIn, GitHub, Medium
- Entity extraction and relationship mapping
- Graph-based retrieval for chatbot context
- This becomes a portfolio project and blog post series

---

## 12. Technical Decisions Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Astro | Content-first, zero JS by default, islands for interactivity |
| Hosting | Vercel | Free serverless functions for chatbot, native Astro support |
| CSS approach | CSS variables + vanilla CSS | No build tool overhead, theme toggle via variable swapping |
| Chatbot LLM | Gemini | Generous free tier, good for low-traffic portfolio |
| Particle library | Three.js or tsParticles | Connected node graph aesthetic; evaluate both during implementation |
| Animation | GSAP + ScrollTrigger | Industry standard, performant, works with Astro |
| Blog engine | Astro content collections | Markdown files, type-safe frontmatter, no external CMS |
| Font loading | Google Fonts with swap | Simple, cached by CDN, adequate for portfolio |
| Chatbot framework | React island | Interactive component needs client-side state; Astro islands keep it isolated |
