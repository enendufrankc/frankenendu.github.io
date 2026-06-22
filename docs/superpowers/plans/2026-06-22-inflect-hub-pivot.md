# Inflect Hub Consulting Hub Pivot — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Repurpose the existing Astro 5 personal portfolio at `feat/portfolio-redesign` into Inflect Hub — a digital transformation consulting hub with Services + Work as first-class IA, a discovery-agent chatbot, and 5 named client/product case studies.

**Architecture:** Approach B from the spec — IA restructure, not a rebuild. The existing Astro 5 + React + Vercel infrastructure stays (layouts, theme, content collections, chatbot wiring). Routes rename, content collection schema extends, page templates rebuild, chatbot is re-prompted.

**Tech Stack:** Astro 5 · React 19 · TypeScript · tsParticles · GSAP · Google Gemini SDK · Resend (new) · Lucide React (new) · Vercel.

**Spec:** `docs/superpowers/specs/2026-06-22-inflect-hub-pivot-design.md`

## Global Constraints

Every task is bound by these — copied verbatim from the spec:

- **Branch:** continue on `feat/portfolio-redesign`. Never commit or push to `main`. Merging to `main` deploys to Vercel production.
- **Brand display email:** `frank@inflecthub.com` (used everywhere user-facing). **Lead routing TO:** `enendufrank24@gmail.com`. **Reply-To:** the prospect's submitted email. **From:** `frank@inflecthub.com` once Resend DNS verified; until then `onboarding@resend.dev`.
- **Node:** `>=22.12.0` (already enforced in `package.json` engines).
- **Voice:** British English. Concrete, named, active. No agency clichés ("unlock", "end-to-end", "thought leader", "strategic partner", "transform your journey").
- **DRAFT discipline:** every `[DRAFT]` engagement narrative and `[PLACEHOLDER]` outcome metric is a launch blocker. `testimonial.is_draft: true` must NEVER be flipped to `false` without a real signed-off quote from the named client.
- **Footer attribution:** HTML5 UP "Massively" attribution preserved (CCA 3.0 — non-negotiable).
- **Design system:** unchanged. Playfair Display 700 (headings), Inter 400/500 (body/UI), JetBrains Mono (code). Accent `#e94560`. Dark mode default `#0a0a0a`, light mode `#ffffff`.
- **Tests:** no test suite exists or will be added. Verification per task is `npm run build` (must succeed) + named manual smoke checks.
- **Commits:** Conventional commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`). One commit per task.

---

## File Structure

**New files:**
- `src/pages/services.astro` — `/services` route
- `src/pages/api/lead.ts` — Resend lead capture endpoint
- `src/content/projects/ogahq.md` — client case study
- `src/content/projects/advance-purity.md` — client case study
- `src/content/projects/lumicos.md` — client case study
- `public/favicon.svg` — Inflect Hub iH monogram
- `public/og-card.svg` — 1200×630 OG card
- `public/images/clients/{ogahq,advance-purity,lumicos,fairlens,casereviewer}.svg` — placeholder logos
- `public/images/work/{ogahq,advance-purity,lumicos}.svg` — placeholder hero images

**Renamed (git mv):**
- `src/content/blog/` → `src/content/insights/`
- `src/pages/blog/` → `src/pages/insights/`
- `src/pages/projects/` → `src/pages/work/`
- `src/layouts/BlogLayout.astro` → `src/layouts/InsightsLayout.astro`

**Modified:**
- `package.json` — add `resend`, `lucide-react`
- `src/content.config.ts` — extend projects schema; rename `blog` collection to `insights`
- `src/content/projects/*.md` — every existing file updated for new schema
- `src/lib/constants.ts` — Inflect Hub branding + new constants
- `src/components/Navbar.astro` — wordmark, new nav, primary CTA
- `src/components/Footer.astro` — wordmark, tagline (HTML5 UP attribution preserved)
- `src/layouts/BaseLayout.astro` — refer to new constants
- `src/layouts/ProjectLayout.astro` — variant logic for client vs product
- `src/components/ChatBot.tsx` — Discovery Agent UI, lead-capture confirm step, multiple entry points
- `src/pages/api/chat.ts` — new system prompt (Discovery Agent)
- `src/pages/index.astro` — full homepage rebuild
- `src/pages/work/index.astro` (renamed from `projects/index.astro`) — gallery + filter
- `src/pages/about.astro` — founder story
- `src/components/SEO.astro` — new default OG image
- `astro.config.mjs` — site URL placeholder
- `README.md` — fix encoding, retitle
- `AGENTS.md` + `CONTEXT.md` (already created in working tree) — Inflect Hub framing
- `CLAUDE.md` — already points to `@AGENTS.md`, no change needed

---

## Task 1: Add dependencies (Resend + Lucide), update site constants

**Files:**
- Modify: `package.json`
- Modify: `src/lib/constants.ts`

**Interfaces:**
- Produces: `SITE`, `NAV_LINKS`, `SOCIAL_LINKS`, `SERVICES` exports for downstream tasks.

- [ ] **Step 1: Add dependencies to `package.json`**

Open `package.json`, add `"resend": "^4.0.0"` and `"lucide-react": "^0.469.0"` to `dependencies`. Final dependencies block (alphabetical):

```json
"dependencies": {
  "@astrojs/react": "^5.0.3",
  "@astrojs/sitemap": "^3.7.2",
  "@astrojs/vercel": "^10.0.4",
  "@google/generative-ai": "^0.24.1",
  "@tsparticles/react": "^3.0.0",
  "@tsparticles/slim": "^3.9.1",
  "@types/react": "^19.2.14",
  "@types/react-dom": "^19.2.3",
  "astro": "^6.1.5",
  "gsap": "^3.14.2",
  "lucide-react": "^0.469.0",
  "react": "^19.2.5",
  "react-dom": "^19.2.5",
  "resend": "^4.0.0"
}
```

- [ ] **Step 2: Install**

Run: `npm install`
Expected: completes without error, `node_modules/resend` and `node_modules/lucide-react` exist.

- [ ] **Step 3: Replace `src/lib/constants.ts` entirely**

Write the file with this exact content:

```typescript
export const SITE = {
  title: "Inflect Hub",
  description:
    "Inflect Hub builds the AI systems that turn slow, manual operations into modern, scalable advantages. Digital transformation consulting led by Frank Enendu.",
  url: "https://inflecthub.com",
  author: "Frank Enendu",
  email: "frank@inflecthub.com",
  tagline: "We transform traditional businesses with AI.",
};

export const NAV_LINKS = [
  { label: "Services", href: "/services" },
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Insights", href: "/insights" },
] as const;

export const SOCIAL_LINKS = {
  github: "https://github.com/enendufrankc",
  linkedin: "https://www.linkedin.com/in/enendu-frank-chinedu/",
} as const;

export const SERVICES = [
  {
    slug: "custom-platforms",
    name: "Custom AI Platforms",
    icon: "Layers",
    promise:
      "End-to-end AI products for industries with regulatory and accuracy bars no off-the-shelf tool clears.",
    exampleWorkSlug: "fairlens",
  },
  {
    slug: "conversational-ai",
    name: "Conversational AI",
    icon: "MessagesSquare",
    promise:
      "Multilingual assistants and chatbots that handle real customer load on the channels your users actually use.",
    exampleWorkSlug: "ogahq",
  },
  {
    slug: "personalisation",
    name: "Personalisation Funnels",
    icon: "Wand2",
    promise:
      "AI advisors and recommenders that turn flat product grids into guided buying journeys.",
    exampleWorkSlug: "advance-purity",
  },
  {
    slug: "multi-modal-content",
    name: "Multi-Modal Content",
    icon: "Image",
    promise:
      "Production-grade brand imagery, social posts, and campaigns generated on-brand at agency-quitting cadence.",
    exampleWorkSlug: "lumicos",
  },
] as const;

export type ServiceSlug = (typeof SERVICES)[number]["slug"];
```

- [ ] **Step 4: Verify build still passes (existing pages will reference removed `PROJECT_DOMAINS`)**

Run: `npm run build`
Expected: **WILL FAIL** with errors about missing `PROJECT_DOMAINS` import (it's referenced in `src/components/ProjectFilter.tsx` or `src/pages/projects/index.astro`). The next tasks fix this.

Note for the engineer: this is a deliberate broken intermediate state. The schema and pages get rebuilt in subsequent tasks; build-green is only required at the end of tasks 3, 5, 8, 9, 11, 14, and 17.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/lib/constants.ts
git commit -m "feat: add Resend + Lucide, switch constants to Inflect Hub branding"
```

---

## Task 2: Extend content collection schema

**Files:**
- Modify: `src/content.config.ts`

**Interfaces:**
- Produces: extended `projects` schema with `type`, `service`, `industry`, `live_url`, `testimonial`, `outcome_bullets` fields; repurposed `tier` enum (`featured/secondary/archived`).
- Consumes: `ServiceSlug` from `src/lib/constants.ts` (Task 1).

- [ ] **Step 1: Replace `src/content.config.ts` entirely**

Write the file with this exact content:

```typescript
import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    // Universal display fields
    title: z.string(),
    description: z.string(),
    image: z.string(),
    order: z.number(),

    // Stack & links
    tech: z.array(z.string()),
    github: z.string().url().nullable().optional(),
    demo: z.string().url().nullable().optional(),
    article: z.string().url().nullable().optional(),
    live_url: z.string().url().nullable().optional(),

    // New classification fields
    type: z.enum(["client", "product"]),
    service: z.enum([
      "custom-platforms",
      "conversational-ai",
      "personalisation",
      "multi-modal-content",
    ]),
    industry: z.string(),
    tier: z.enum(["featured", "secondary", "archived"]),

    // Visibility (retained from old schema, semantics unchanged)
    status: z.enum(["public", "private", "client-work"]),

    // Optional rich blocks
    testimonial: z
      .object({
        quote: z.string(),
        author: z.string(),
        role: z.string(),
        is_draft: z.boolean().default(true),
      })
      .optional(),
    outcome_bullets: z.array(z.string()).default([]),

    // Retained for back-compat with existing files; may be removed later
    domain: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

const insights = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/insights" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, insights };
```

Notes for the engineer:
- The old `blog` collection becomes `insights`. The directory move happens in Task 5; the schema rename is here for forward-prep.
- The `tier` enum semantics change (`flagship/supporting/breadth` → `featured/secondary/archived`). All existing markdown files break validation until Task 3 updates them.
- `status` is unchanged (`public/private/client-work`), keeping the visibility semantics from the old schema.

- [ ] **Step 2: Verify build still fails (expected at this stage)**

Run: `npm run build`
Expected: **WILL FAIL** with content validation errors on every existing markdown file (their `tier` values no longer validate). This is correct — Task 3 fixes it.

- [ ] **Step 3: Commit**

```bash
git add src/content.config.ts
git commit -m "feat: extend projects schema with type/service/industry/testimonial fields"
```

---

## Task 3: Migrate all 12 existing project markdown files to new schema

**Files:**
- Modify: every file in `src/content/projects/*.md` (12 files)

**Interfaces:**
- Consumes: schema from Task 2 (`tier: featured | secondary | archived`, new `type`, `service`, `industry`, `live_url`, optional `testimonial`, `outcome_bullets`).

For each file, the body content (everything after the closing `---` of frontmatter) stays unchanged. Only frontmatter is rewritten.

- [ ] **Step 1: Update `src/content/projects/fairlens.md` frontmatter**

Replace the existing frontmatter block (the part between the opening and closing `---`) with:

```yaml
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
```

- [ ] **Step 2: Update `src/content/projects/casereviewer.md` frontmatter**

Replace its frontmatter with:

```yaml
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
```

- [ ] **Step 3: Update `src/content/projects/safeai.md` frontmatter**

Replace its frontmatter with:

```yaml
---
title: "SafeAI"
description: "Zero-trust security layer for AI agents — policy enforcement, contract validation, and runtime boundaries for tool calls and prompts."
type: "product"
service: "custom-platforms"
industry: "AI Security"
tier: "secondary"
status: "public"
tech: ["Python", "TypeScript", "MCP"]
github: "https://github.com/safeai-sdk/safeai"
demo: null
article: null
live_url: null
image: "/images/projects/safeai.svg"
featured: false
order: 3
outcome_bullets: []
---
```

Preserve the original body content.

- [ ] **Step 4: Update `src/content/projects/aigen.md` frontmatter**

Replace its frontmatter with:

```yaml
---
title: "AiGen"
description: "Agent framework for building production AI assistants — orchestration, memory, and tool routing."
type: "product"
service: "custom-platforms"
industry: "Developer Tools"
tier: "secondary"
status: "private"
tech: ["Python"]
github: null
demo: null
article: null
live_url: null
image: "/images/projects/aigen.svg"
featured: false
order: 4
outcome_bullets: []
---
```

- [ ] **Step 5: Update `src/content/projects/personal-copilot.md` frontmatter**

Replace its frontmatter with:

```yaml
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
```

- [ ] **Step 6: Update `src/content/projects/multi-modal-content.md` frontmatter**

Replace its frontmatter with:

```yaml
---
title: "Multi-Modal Content Generator"
description: "Pipeline for generating on-brand product imagery, social posts, and campaign assets from product specs and brand guidelines."
type: "product"
service: "multi-modal-content"
industry: "Marketing & Creative"
tier: "secondary"
status: "private"
tech: ["Python", "Stable Diffusion", "OpenAI"]
github: null
demo: null
article: null
live_url: null
image: "/images/projects/multi-modal-content.svg"
featured: false
order: 6
outcome_bullets: []
---
```

- [ ] **Step 7: Update the 6 archived projects' frontmatter**

For each of: `nova.md`, `sharepoint-search.md`, `nhs-chatbot.md`, `agent2agent.md`, `llm-game-recommender.md`, `semantic-segmentation.md`.

Preserve the existing `title`, `description`, `tech`, `github`, `demo`, `article`, `image` values. Update or add fields per this template (filling in real values from the existing file):

```yaml
---
title: "<existing title>"
description: "<existing description>"
type: "product"
service: "custom-platforms"      # or whichever fits — see mapping below
industry: "<best-fit industry>"
tier: "archived"
status: "<existing status, or public>"
tech: ["<existing tech array>"]
github: <existing github or null>
demo: <existing demo or null>
article: <existing article or null>
live_url: null
image: "<existing image>"
featured: false
order: <existing order>
outcome_bullets: []
---
```

Service mapping for archived projects:
- `nova` → `conversational-ai`
- `sharepoint-search` → `custom-platforms`
- `nhs-chatbot` → `conversational-ai`
- `agent2agent` → `custom-platforms`
- `llm-game-recommender` → `personalisation`
- `semantic-segmentation` → `custom-platforms`

Industry mapping for archived projects:
- `nova` → "Conversational Interfaces"
- `sharepoint-search` → "Enterprise"
- `nhs-chatbot` → "Healthcare"
- `agent2agent` → "Multi-Agent Systems"
- `llm-game-recommender` → "Gaming & Entertainment"
- `semantic-segmentation` → "Computer Vision"

- [ ] **Step 8: Verify build passes**

Run: `npm run build`
Expected: completes clean. Pages still render the existing project routes (we haven't renamed them yet — that's Task 5). The build's content validation now succeeds against the new schema.

- [ ] **Step 9: Commit**

```bash
git add src/content/projects/
git commit -m "refactor: migrate 12 existing project markdown files to Inflect Hub schema"
```

---

## Task 4: Create 3 new client case study markdown files

**Files:**
- Create: `src/content/projects/ogahq.md`
- Create: `src/content/projects/advance-purity.md`
- Create: `src/content/projects/lumicos.md`

**Interfaces:**
- Consumes: schema from Task 2.

- [ ] **Step 1: Create `src/content/projects/ogahq.md`**

```markdown
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
```

- [ ] **Step 2: Create `src/content/projects/advance-purity.md`**

```markdown
---
title: "Advance Purity Cosmetics"
description: "AI skincare advisor + bundle recommender on the Advance Purity storefront — quiz-driven personalisation that turns first-time visitors into bundled purchases."
type: "client"
service: "personalisation"
industry: "D2C Cosmetics"
tier: "featured"
status: "client-work"
tech: ["React", "Astro", "OpenAI", "Shopify"]
github: null
demo: null
article: null
live_url: "https://advancepurity.com/"
image: "/images/work/advance-purity.svg"
featured: true
order: 12
outcome_bullets:
  - "[PLACEHOLDER] Quiz funnel converts ~3× the cold product grid"
  - "[PLACEHOLDER] Basket size on quiz-led purchases up ~40%"
  - "Personalised reasoning copy — explains why each product fits"
testimonial:
  quote: "[DRAFT — replace with real signed-off quote before launch] Our flat product grid converted poorly because customers didn't know where to start. Inflect Hub built us a quiz advisor that meets them at the question they actually have."
  author: "[DRAFT — founder name pending]"
  role: "Founder, Advance Purity Cosmetics"
  is_draft: true
---

## Context

Advance Purity is a D2C cosmetics store with a curated catalogue, strong brand voice, and a flat product grid that did the work of category sorting but very little of the work of guidance. First-time visitors landed on a page of products and had no clear path from "what do I need?" to a purchase.

## Problem

The storefront's conversion rate told the story: visitors with no prior brand affinity bounced. Repeat customers converted fine — they already knew the routine they wanted. The missing surface was a guided experience for new buyers who knew they wanted *something* for *something* but couldn't translate that into a basket.

## Approach

We designed an in-store skincare advisor framed as a short, friendly quiz — skin type, concerns, goals, budget — that ends in a personalised routine + bundle recommendation. Critically, the recommendation explains *why* each product fits, so the customer trusts the suggestion. The advisor runs as a React island embedded into the existing storefront, not a separate microsite.

## What we built

- **Quiz flow** — 4–6 questions, conversational tone, single-screen progression
- **Recommendation engine** — LLM-driven matching between customer profile and product catalogue
- **Reasoning copy** — each recommendation surfaces 2–3 sentences explaining the fit
- **Bundle constructor** — auto-assembles a routine (cleanser → treatment → moisturiser → SPF) within the customer's budget
- **Storefront-embedded** — runs inside the existing Shopify storefront, not a separate funnel

## Stack

React · Astro · OpenAI · Shopify

## Outcome

- [PLACEHOLDER] Quiz funnel converts ~3× the cold product grid
- [PLACEHOLDER] Basket size on quiz-led purchases up ~40%
- Personalised reasoning copy — explains why each product fits

---

*This is a DRAFT case study. Real engagement specifics and a signed-off client quote must be substituted before launch. See spec §7.3 and §13 for the launch gate.*
```

- [ ] **Step 3: Create `src/content/projects/lumicos.md`**

```markdown
---
title: "Lumicos Beauty"
description: "Multi-modal AI content pipeline for Lumicos — generates on-brand product photography, weekly social posts, and seasonal campaigns from product specs and brand guidelines."
type: "client"
service: "multi-modal-content"
industry: "D2C Cosmetics"
tier: "featured"
status: "client-work"
tech: ["Python", "OpenAI", "Stable Diffusion", "Cloudinary"]
github: null
demo: null
article: null
live_url: "https://lumicosbeauty.com/"
image: "/images/work/lumicos.svg"
featured: true
order: 13
outcome_bullets:
  - "[PLACEHOLDER] Weekly content output up ~5×"
  - "[PLACEHOLDER] Content production cost down ~60%"
  - "Brand team time shifts from creating to curating"
testimonial:
  quote: "[DRAFT — replace with real signed-off quote before launch] We were paying an agency a five-figure monthly retainer for content that never quite kept pace with our launches. Inflect Hub built us a pipeline that produces more, on-brand, and gives us approval over every asset."
  author: "[DRAFT — founder name pending]"
  role: "Founder, Lumicos Beauty"
  is_draft: true
---

## Context

Lumicos is a D2C cosmetics brand with a recognisable visual identity and an ambitious release cadence — new collections, limited drops, seasonal campaigns. The marketing team needed a constant cadence of fresh product imagery and social content, but the cost of an agency retainer wasn't sustainable, and in-house production couldn't keep pace.

## Problem

Every new product launch needed: 6–10 product hero shots, 4–6 social posts, a campaign hero, and 2–3 in-context lifestyle images. The agency took 3–4 weeks per launch. The brand team had no production capacity. The result was launches going out with stock-feeling photography or delayed campaigns.

## Approach

We built a multi-modal content pipeline that ingests product specs and the brand's existing style guidelines, generates candidate imagery and post copy, and routes everything through a brand-team approval queue. Nothing publishes without human sign-off — the pipeline is a creative amplifier, not an autonomous publisher.

## What we built

- **Brand-conditioned image generation** — Stable Diffusion fine-tuned on Lumicos's existing photography for on-brand outputs
- **Post copy drafting** — OpenAI-powered drafting using Lumicos's brand voice guidelines
- **Campaign asset templates** — pre-defined templates for product heroes, lifestyle shots, social tiles
- **Approval queue** — brand team reviews every asset before it ships; rejections feed back into the prompt library
- **Cloudinary integration** — approved assets land in Lumicos's existing media library, ready for the storefront

## Stack

Python · OpenAI · Stable Diffusion · Cloudinary

## Outcome

- [PLACEHOLDER] Weekly content output up ~5×
- [PLACEHOLDER] Content production cost down ~60%
- Brand team time shifts from creating to curating

---

*This is a DRAFT case study. Real engagement specifics and a signed-off client quote must be substituted before launch. See spec §7.3 and §13 for the launch gate.*
```

- [ ] **Step 4: Verify build passes**

Run: `npm run build`
Expected: completes clean. Three new routes exist at `/projects/ogahq`, `/projects/advance-purity`, `/projects/lumicos`.

- [ ] **Step 5: Commit**

```bash
git add src/content/projects/ogahq.md src/content/projects/advance-purity.md src/content/projects/lumicos.md
git commit -m "feat: add 3 client case studies (OgaHQ, Advance Purity, Lumicos) as DRAFT"
```

---

## Task 5: Rename routes and collections (blog → insights, projects → work)

**Files:**
- Move: `src/content/blog/` → `src/content/insights/`
- Move: `src/pages/blog/` → `src/pages/insights/`
- Move: `src/pages/projects/` → `src/pages/work/`
- Rename: `src/layouts/BlogLayout.astro` → `src/layouts/InsightsLayout.astro`
- Modify: any imports that referenced these paths

**Interfaces:**
- Produces: routes `/work`, `/work/[id]`, `/insights`, `/insights/[slug]` with same content + layout as before.

- [ ] **Step 1: Rename directories with git mv (preserves history)**

```bash
git mv src/content/blog src/content/insights
git mv src/pages/blog src/pages/insights
git mv src/pages/projects src/pages/work
git mv src/layouts/BlogLayout.astro src/layouts/InsightsLayout.astro
```

- [ ] **Step 2: Find and update imports referencing old paths**

Run: `grep -rn "BlogLayout" src/ --include='*.astro' --include='*.ts' --include='*.tsx'`
Expected: hits in `src/pages/insights/[...slug].astro` (formerly `blog/[...slug].astro`).

Replace `BlogLayout` with `InsightsLayout` in every hit (both the import statement and the usage). The component class also lives in the layout file; if the layout file's own internal class names use `Blog`, leave them — they're styling-only.

Run: `grep -rn "'blog'" src/ --include='*.astro' --include='*.ts' --include='*.tsx'`
Expected: hits where the content collection is queried as `"blog"`. Update each to `"insights"`.

Run: `grep -rn "\"blog\"" src/ --include='*.astro' --include='*.ts' --include='*.tsx'`
Same.

Run: `grep -rn "getCollection.*blog" src/`
Same — all references to `getCollection("blog")` become `getCollection("insights")`.

- [ ] **Step 3: Update internal links in `src/pages/insights/index.astro`**

In `src/pages/insights/index.astro`, find any anchor tags with `href="/blog/..."` and update to `href="/insights/..."`. Run:

`grep -n 'href="/blog' src/pages/insights/`
Expected: hits to fix; replace `/blog` with `/insights` in each.

- [ ] **Step 4: Update internal links in `src/pages/work/index.astro`**

Same pattern for `/projects` → `/work`:

`grep -rn 'href="/projects' src/`
Replace `/projects` with `/work` in each hit. Note: don't touch references to `getCollection("projects")` — the content collection itself stays named `projects`; only the route changes.

- [ ] **Step 5: Verify build passes**

Run: `npm run build`
Expected: completes clean. Manual check: routes `/work`, `/work/safeai`, `/insights`, `/insights/welcome` all render.

- [ ] **Step 6: Smoke-test routes locally**

Run: `npm run dev` (background it or use a separate terminal). Visit:
- http://localhost:4321/work — should show project grid
- http://localhost:4321/work/safeai — should show case study
- http://localhost:4321/insights — should show insights list
- http://localhost:4321/insights/welcome — should show welcome post

Old paths (`/blog`, `/projects`) should now 404. That's correct — they no longer exist.

Stop the dev server.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "refactor: rename blog->insights, projects route->work, BlogLayout->InsightsLayout"
```

---

## Task 6: Update Navbar with Inflect Hub wordmark, new nav, and primary CTA

**Files:**
- Modify: `src/components/Navbar.astro`

**Interfaces:**
- Consumes: `NAV_LINKS` from `src/lib/constants.ts` (Task 1).
- Produces: a `window.dispatchEvent(new CustomEvent("inflect:open-chat"))` event when the primary CTA is clicked. The ChatBot component (Task 13) will listen for this.

- [ ] **Step 1: Replace `src/components/Navbar.astro` entirely**

```astro
---
import { NAV_LINKS } from "../lib/constants";
import ThemeToggle from "./ThemeToggle.tsx";

const currentPath = Astro.url.pathname;

function isActive(href: string): boolean {
  if (href === "/") {
    return currentPath === "/";
  }
  return currentPath.startsWith(href);
}
---

<nav class="navbar" id="navbar">
  <div class="navbar__inner container">
    <a href="/" class="navbar__brand" aria-label="Inflect Hub — home">
      Inflect Hub
    </a>

    <button
      class="navbar__hamburger"
      id="hamburger"
      aria-label="Toggle menu"
      aria-expanded="false"
      aria-controls="nav-links"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>

    <div class="navbar__links" id="nav-links">
      {
        NAV_LINKS.map((link) => (
          <a
            href={link.href}
            class={`navbar__link${isActive(link.href) ? " active" : ""}`}
          >
            {link.label}
          </a>
        ))
      }
      <ThemeToggle client:load />
      <button
        type="button"
        class="navbar__cta"
        data-open-chat
        aria-label="Start a project — open the discovery agent"
      >
        Start a project
      </button>
    </div>
  </div>
</nav>

<style>
  .navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    height: var(--nav-height);
    background: transparent;
    transition: background-color var(--transition-normal), border-bottom var(--transition-normal);
  }

  .navbar.scrolled {
    background-color: var(--bg-primary);
    border-bottom: 1px solid var(--border);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .navbar__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
  }

  .navbar__brand {
    font-family: var(--font-heading);
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary);
    text-decoration: none;
    letter-spacing: -0.01em;
  }

  .navbar__brand:hover {
    color: var(--accent);
  }

  .navbar__links {
    display: flex;
    align-items: center;
    gap: var(--space-lg);
  }

  .navbar__link {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-secondary);
    text-decoration: none;
    transition: color var(--transition-fast);
  }

  .navbar__link:hover,
  .navbar__link.active {
    color: var(--accent);
  }

  .navbar__cta {
    font-family: var(--font-body);
    font-size: 0.875rem;
    font-weight: 600;
    color: #ffffff;
    background: var(--accent);
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  }

  .navbar__cta:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(233, 69, 96, 0.4);
  }

  .navbar__hamburger {
    display: none;
    flex-direction: column;
    gap: 5px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
  }

  .navbar__hamburger span {
    display: block;
    width: 24px;
    height: 2px;
    background-color: var(--text-primary);
    transition: transform var(--transition-normal), opacity var(--transition-normal);
  }

  @media (max-width: 768px) {
    .navbar__hamburger {
      display: flex;
    }

    .navbar__links {
      position: absolute;
      top: var(--nav-height);
      left: 0;
      right: 0;
      flex-direction: column;
      align-items: flex-start;
      padding: var(--space-lg);
      background-color: var(--bg-primary);
      border-bottom: 1px solid var(--border);
      gap: var(--space-md);
      display: none;
    }

    .navbar__links.open {
      display: flex;
    }

    .navbar__cta {
      width: 100%;
      padding: 0.75rem 1rem;
    }
  }
</style>

<script>
  // Scroll detection
  const navbar = document.getElementById("navbar");
  function handleScroll() {
    if (navbar) {
      if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    }
  }
  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  // Hamburger toggle
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("nav-links");

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      hamburger.setAttribute("aria-expanded", String(isOpen));
    });
  }

  // Wire all [data-open-chat] buttons to the chatbot
  document.addEventListener("click", (e) => {
    const target = (e.target as HTMLElement).closest("[data-open-chat]");
    if (!target) return;
    const service = target.getAttribute("data-service");
    window.dispatchEvent(
      new CustomEvent("inflect:open-chat", {
        detail: { service: service ?? null },
      })
    );
  });
</script>
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: completes clean.

- [ ] **Step 3: Smoke-test the navbar**

Run: `npm run dev`. Visit `http://localhost:4321/`. Confirm:
- The brand reads "Inflect Hub" (not "FE")
- Nav items: Services · Work · About · Insights
- "Start a project" button appears on the right (accent colour)
- Clicking the button doesn't crash (it dispatches an event the chatbot will listen for in Task 13)
- Mobile: resize browser < 768px; hamburger menu appears and works

Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add src/components/Navbar.astro
git commit -m "feat: rebrand navbar as Inflect Hub with Start a project CTA"
```

---

## Task 7: Update Footer with Inflect Hub branding

**Files:**
- Modify: `src/components/Footer.astro`

**Interfaces:**
- Consumes: `SITE`, `SOCIAL_LINKS`, `NAV_LINKS` from constants.

- [ ] **Step 1: Read current footer to preserve HTML5 UP attribution exactly**

Run: `cat src/components/Footer.astro`
Note the exact wording of the HTML5 UP "Massively" attribution. It must be preserved verbatim per CCA 3.0 licence.

- [ ] **Step 2: Replace `src/components/Footer.astro` with this content (substitute the exact existing HTML5 UP attribution line into the placeholder marker)**

```astro
---
import { SITE, NAV_LINKS, SOCIAL_LINKS } from "../lib/constants";
const year = new Date().getFullYear();
---

<footer class="footer">
  <div class="footer__inner container">
    <div class="footer__brand">
      <span class="footer__wordmark">Inflect Hub</span>
      <p class="footer__tagline">{SITE.tagline}</p>
      <p class="footer__contact">
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
      </p>
    </div>

    <nav class="footer__nav" aria-label="Footer navigation">
      <h3 class="footer__heading">Site</h3>
      <ul class="footer__list">
        {NAV_LINKS.map((link) => (
          <li><a href={link.href}>{link.label}</a></li>
        ))}
      </ul>
    </nav>

    <nav class="footer__nav" aria-label="External links">
      <h3 class="footer__heading">Elsewhere</h3>
      <ul class="footer__list">
        <li><a href={SOCIAL_LINKS.github} target="_blank" rel="noopener">GitHub</a></li>
        <li><a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener">LinkedIn</a></li>
      </ul>
    </nav>
  </div>

  <div class="footer__bottom container">
    <p>&copy; {year} Inflect Hub. All rights reserved.</p>
    <!-- HTML5 UP "Massively" attribution preserved per CCA 3.0 licence -->
    <p class="footer__attribution">
      Design adapted from <a href="https://html5up.net" target="_blank" rel="noopener">HTML5 UP</a>'s Massively template (CC BY 3.0).
    </p>
  </div>
</footer>

<style>
  .footer {
    background: var(--bg-secondary);
    border-top: 1px solid var(--border);
    padding: var(--space-xl) 0 var(--space-md);
    margin-top: var(--space-xl);
  }

  .footer__inner {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: var(--space-lg);
    margin-bottom: var(--space-lg);
  }

  @media (max-width: 768px) {
    .footer__inner {
      grid-template-columns: 1fr;
    }
  }

  .footer__wordmark {
    display: block;
    font-family: var(--font-heading);
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.01em;
    margin-bottom: var(--space-xs);
  }

  .footer__tagline {
    font-size: 0.95rem;
    color: var(--text-secondary);
    margin: 0 0 var(--space-sm);
    max-width: 28rem;
  }

  .footer__contact a {
    font-size: 0.875rem;
    color: var(--accent);
    text-decoration: none;
  }

  .footer__heading {
    font-family: var(--font-heading);
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 var(--space-sm);
  }

  .footer__list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .footer__list a {
    font-size: 0.875rem;
    color: var(--text-secondary);
    text-decoration: none;
    transition: color var(--transition-fast);
  }

  .footer__list a:hover {
    color: var(--accent);
  }

  .footer__bottom {
    padding-top: var(--space-md);
    border-top: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: var(--space-sm);
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  .footer__bottom p {
    margin: 0;
  }

  .footer__attribution a {
    color: var(--text-muted);
    text-decoration: underline;
  }
</style>
```

- [ ] **Step 3: Verify build passes**

Run: `npm run build`
Expected: completes clean.

- [ ] **Step 4: Smoke-test the footer**

Run: `npm run dev`. Visit `http://localhost:4321/`. Scroll to footer. Confirm:
- Brand wordmark "Inflect Hub"
- Tagline visible
- Contact email reads `frank@inflecthub.com`
- Site nav (Services, Work, About, Insights)
- External nav (GitHub, LinkedIn)
- Copyright + HTML5 UP attribution at the bottom

Stop dev server.

- [ ] **Step 5: Commit**

```bash
git add src/components/Footer.astro
git commit -m "feat: rebrand footer as Inflect Hub with preserved HTML5 UP attribution"
```

---

## Task 8: Update ProjectLayout with client/product variant logic

**Files:**
- Modify: `src/layouts/ProjectLayout.astro`

**Interfaces:**
- Consumes: project frontmatter fields (`type`, `service`, `industry`, `live_url`, `outcome_bullets`, `testimonial`, `tier`) from Tasks 2–4.

- [ ] **Step 1: Read existing `src/layouts/ProjectLayout.astro` to know what's there**

Run: `cat src/layouts/ProjectLayout.astro`
Take note of: what frontmatter it consumes, what props it expects, how it renders the existing case study body.

- [ ] **Step 2: Update `src/layouts/ProjectLayout.astro` to add the variant scaffold**

The layout should render (top to bottom):
1. Hero band — image · breadcrumb (`Work › <title>`) · title · service tag pill · subtitle
2. At-a-glance strip — 4 inline stats (Type · Industry · Top 3 tech · Status)
3. Body (Astro slot — existing markdown body)
4. Outcome bullets list (if `outcome_bullets.length > 0`)
5. Testimonial card (if `testimonial` present) — with red `DRAFT` badge if `testimonial.is_draft`
6. Outbound link button (`live_url` if set, else `github` if set)
7. CTA strip: "This is the kind of work we do. Tell us what you're trying to transform." → opens chatbot
8. Next/previous case study

The variant logic shows up in:
- **Hero subtitle:** for `type: client`, render `${SERVICE_NAME} for ${industry}`. For `type: product`, render `Built by Inflect Hub — ${description}`.
- **Outbound link button label:** `Visit ${title}` for client, `Visit live product` for product.

Replace `src/layouts/ProjectLayout.astro` with this content:

```astro
---
import BaseLayout from "./BaseLayout.astro";
import { SERVICES } from "../lib/constants";

interface Props {
  title: string;
  description: string;
  image: string;
  type: "client" | "product";
  service: string;
  industry: string;
  tech: string[];
  status: string;
  live_url?: string | null;
  github?: string | null;
  outcome_bullets?: string[];
  testimonial?: {
    quote: string;
    author: string;
    role: string;
    is_draft: boolean;
  };
}

const {
  title,
  description,
  image,
  type,
  service,
  industry,
  tech,
  status,
  live_url,
  github,
  outcome_bullets = [],
  testimonial,
} = Astro.props as Props;

const serviceMeta = SERVICES.find((s) => s.slug === service);
const serviceName = serviceMeta?.name ?? service;

const heroSubtitle =
  type === "client"
    ? `${serviceName} for ${industry}`
    : `Built by Inflect Hub — ${description}`;

const typeLabel = type === "client" ? "Client engagement" : "Built by us";

const statusLabel = {
  public: "Public",
  private: "Private",
  "client-work": "In production",
}[status] ?? status;

const outboundUrl = live_url ?? github;
const outboundLabel = live_url ? `Visit ${title}` : github ? "View on GitHub" : null;
---

<BaseLayout title={`${title} — Inflect Hub`} description={description}>
  <article class="case-study">
    <!-- Hero -->
    <header class="case-study__hero">
      <img src={image} alt={title} class="case-study__image" />
      <nav class="case-study__breadcrumb" aria-label="Breadcrumb">
        <a href="/work">Work</a> <span>›</span> <span>{title}</span>
      </nav>
      <h1 class="case-study__title">{title}</h1>
      <p class="case-study__service-tag">{serviceName}</p>
      <p class="case-study__subtitle">{heroSubtitle}</p>
    </header>

    <!-- At-a-glance strip -->
    <dl class="case-study__glance">
      <div><dt>Type</dt><dd>{typeLabel}</dd></div>
      <div><dt>Industry</dt><dd>{industry}</dd></div>
      <div><dt>Tech</dt><dd>{tech.slice(0, 4).join(" · ")}</dd></div>
      <div><dt>Status</dt><dd>{statusLabel}</dd></div>
    </dl>

    <!-- Markdown body slot -->
    <div class="case-study__body">
      <slot />
    </div>

    <!-- Outcome bullets -->
    {outcome_bullets.length > 0 && (
      <section class="case-study__outcome">
        <h2>Outcome</h2>
        <ul>
          {outcome_bullets.map((bullet) => <li>{bullet}</li>)}
        </ul>
      </section>
    )}

    <!-- Testimonial -->
    {testimonial && (
      <section class="case-study__testimonial">
        {testimonial.is_draft && (
          <p class="case-study__draft-badge">DRAFT — placeholder content, replace before launch</p>
        )}
        <blockquote>
          <p>{testimonial.quote}</p>
          <cite>
            <strong>{testimonial.author}</strong>
            <span>{testimonial.role}</span>
          </cite>
        </blockquote>
      </section>
    )}

    <!-- Outbound link -->
    {outboundUrl && (
      <a href={outboundUrl} class="case-study__outbound" target="_blank" rel="noopener">
        {outboundLabel} →
      </a>
    )}

    <!-- Bottom CTA strip -->
    <section class="case-study__cta">
      <h2>This is the kind of work we do.</h2>
      <p>Tell us what you're trying to transform.</p>
      <button type="button" class="case-study__cta-btn" data-open-chat>
        Start a project
      </button>
    </section>
  </article>
</BaseLayout>

<style>
  .case-study {
    max-width: 56rem;
    margin: var(--space-xl) auto;
    padding: 0 var(--space-md);
  }

  .case-study__hero {
    text-align: center;
    margin-bottom: var(--space-xl);
  }

  .case-study__image {
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    border-radius: 12px;
    margin-bottom: var(--space-md);
  }

  .case-study__breadcrumb {
    font-size: 0.8rem;
    color: var(--text-muted);
    margin-bottom: var(--space-sm);
  }
  .case-study__breadcrumb a {
    color: var(--accent);
    text-decoration: none;
  }

  .case-study__title {
    font-family: var(--font-heading);
    font-size: clamp(2rem, 5vw, 3rem);
    margin: 0;
  }

  .case-study__service-tag {
    display: inline-block;
    margin: var(--space-sm) 0;
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
    background: var(--bg-tertiary);
    color: var(--accent);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .case-study__subtitle {
    font-size: 1.1rem;
    color: var(--text-secondary);
    max-width: 36rem;
    margin: 0 auto;
  }

  .case-study__glance {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-md);
    padding: var(--space-md);
    background: var(--bg-secondary);
    border-radius: 12px;
    border: 1px solid var(--border);
    margin-bottom: var(--space-xl);
    text-align: center;
  }
  @media (max-width: 640px) {
    .case-study__glance {
      grid-template-columns: 1fr 1fr;
    }
  }
  .case-study__glance dt {
    font-size: 0.7rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 0.25rem;
  }
  .case-study__glance dd {
    font-size: 0.85rem;
    color: var(--text-primary);
    font-weight: 500;
    margin: 0;
  }

  .case-study__body :global(h2) {
    margin-top: var(--space-xl);
    font-family: var(--font-heading);
  }
  .case-study__body :global(p),
  .case-study__body :global(li) {
    line-height: 1.7;
    color: var(--text-primary);
  }

  .case-study__outcome {
    margin-top: var(--space-xl);
    padding: var(--space-md) var(--space-lg);
    background: var(--bg-tertiary);
    border-radius: 12px;
  }
  .case-study__outcome h2 {
    font-family: var(--font-heading);
    margin-top: 0;
  }
  .case-study__outcome ul {
    list-style: none;
    padding: 0;
  }
  .case-study__outcome li {
    padding-left: 1.5em;
    position: relative;
    margin-bottom: 0.5rem;
  }
  .case-study__outcome li::before {
    content: "→";
    position: absolute;
    left: 0;
    color: var(--accent);
    font-weight: 700;
  }

  .case-study__testimonial {
    margin-top: var(--space-xl);
    padding: var(--space-lg);
    border-left: 4px solid var(--accent);
    background: var(--bg-secondary);
    border-radius: 0 12px 12px 0;
  }
  .case-study__draft-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    background: var(--accent);
    color: #ffffff;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    border-radius: 4px;
    margin-bottom: var(--space-sm);
  }
  .case-study__testimonial blockquote {
    margin: 0;
  }
  .case-study__testimonial blockquote p {
    font-size: 1.15rem;
    font-style: italic;
    line-height: 1.6;
    color: var(--text-primary);
    margin: 0 0 var(--space-sm);
  }
  .case-study__testimonial cite {
    font-style: normal;
    color: var(--text-secondary);
    font-size: 0.9rem;
    display: flex;
    flex-direction: column;
  }
  .case-study__testimonial cite strong {
    color: var(--text-primary);
  }

  .case-study__outbound {
    display: inline-block;
    margin-top: var(--space-lg);
    padding: 0.625rem 1.25rem;
    border: 1px solid var(--accent);
    color: var(--accent);
    text-decoration: none;
    border-radius: 8px;
    transition: background var(--transition-fast), color var(--transition-fast);
  }
  .case-study__outbound:hover {
    background: var(--accent);
    color: #ffffff;
  }

  .case-study__cta {
    margin-top: var(--space-xl);
    padding: var(--space-xl);
    text-align: center;
    background: var(--accent);
    color: #ffffff;
    border-radius: 16px;
  }
  .case-study__cta h2 {
    font-family: var(--font-heading);
    margin: 0 0 var(--space-sm);
  }
  .case-study__cta p {
    margin: 0 0 var(--space-md);
    opacity: 0.9;
  }
  .case-study__cta-btn {
    padding: 0.75rem 1.5rem;
    background: #ffffff;
    color: var(--accent);
    border: none;
    border-radius: 8px;
    font-weight: 700;
    font-size: 0.95rem;
    cursor: pointer;
  }
</style>
```

- [ ] **Step 3: Update `src/pages/work/[...slug].astro` (formerly `projects/[...slug].astro`) to pass the new props**

Read the existing file to find where it instantiates ProjectLayout, and update the props passed in. The new props are spread from the frontmatter:

```astro
---
import { getCollection } from "astro:content";
import ProjectLayout from "../../layouts/ProjectLayout.astro";

export async function getStaticPaths() {
  const all = await getCollection("projects");
  // Exclude archived projects from page generation
  const visible = all.filter((p) => p.data.tier !== "archived");
  return visible.map((project) => ({
    params: { slug: project.id },
    props: { project },
  }));
}

const { project } = Astro.props;
const { Content } = await project.render();
---

<ProjectLayout {...project.data}>
  <Content />
</ProjectLayout>
```

If the existing file already follows a similar pattern, only update the props spread (`{...project.data}`) and the archived filter.

- [ ] **Step 4: Verify build passes**

Run: `npm run build`
Expected: completes clean. Verify: `dist/work/ogahq/` exists; `dist/work/nova/` does NOT (archived).

- [ ] **Step 5: Smoke-test a client engagement and a built product**

Run: `npm run dev`. Visit:
- http://localhost:4321/work/ogahq — confirm: hero shows "Conversational AI for African Retail SaaS"; at-a-glance shows Type=Client engagement; testimonial card shows DRAFT badge; outbound link reads "Visit OgaHQ →"
- http://localhost:4321/work/fairlens — confirm: hero shows "Built by Inflect Hub — Multi-agent..."; at-a-glance shows Type=Built by us; outbound link reads "Visit FairLens →"
- http://localhost:4321/work/nova — should 404 (archived)

Stop dev server.

- [ ] **Step 6: Commit**

```bash
git add src/layouts/ProjectLayout.astro src/pages/work/
git commit -m "feat: add client/product variant logic + outcome/testimonial blocks to ProjectLayout"
```

---

## Task 9: Rebuild homepage

**Files:**
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `SITE`, `SERVICES` from constants; `getCollection("projects")` filtered to `tier: featured`.

- [ ] **Step 1: Replace `src/pages/index.astro` entirely**

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import ParticleHero from "../components/ParticleHero.tsx";
import { SITE, SERVICES } from "../lib/constants";
import { getCollection } from "astro:content";

const all = await getCollection("projects");
const featured = all
  .filter((p) => p.data.tier === "featured")
  .sort((a, b) => a.data.order - b.data.order);

const trustedClients = featured;
const homepageCards = featured.filter((p) =>
  ["fairlens", "ogahq", "advance-purity"].includes(p.id)
);
---

<BaseLayout title={`${SITE.title} — Digital Transformation Consulting`} description={SITE.description}>
  <!-- Hero -->
  <section class="hero">
    <div class="hero__particles">
      <ParticleHero client:load />
    </div>
    <div class="hero__inner container">
      <p class="hero__eyebrow">Digital Transformation · AI Consulting</p>
      <h1 class="hero__title">We transform traditional businesses with AI.</h1>
      <p class="hero__sub">
        Inflect Hub builds the AI systems that turn slow, manual operations into modern, scalable advantages.
        From storefront chatbots to multi-agent platforms — shipped, in production, with real customers.
      </p>
      <div class="hero__ctas">
        <button type="button" class="hero__cta-primary" data-open-chat>Start a project</button>
        <a href="#featured-work" class="hero__cta-ghost">See our work</a>
      </div>
    </div>
  </section>

  <!-- Trusted by strip -->
  <section class="trusted">
    <div class="container">
      <p class="trusted__caption">
        Trusted by ambitious operators in retail, beauty, evaluation, and legal-tech.
      </p>
      <div class="trusted__logos">
        {trustedClients.map((p) => (
          <div class="trusted__logo">
            <img src={`/images/clients/${p.id}.svg`} alt={p.data.title} loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  </section>

  <!-- Services overview -->
  <section class="services-overview container">
    <h2 class="section-title">Four ways we transform a business with AI</h2>
    <div class="services-grid">
      {SERVICES.map((service) => (
        <a href={`/services#${service.slug}`} class="service-card">
          <span class="service-card__icon" data-icon={service.icon} aria-hidden="true"></span>
          <h3 class="service-card__name">{service.name}</h3>
          <p class="service-card__promise">{service.promise}</p>
          <span class="service-card__link">See how →</span>
        </a>
      ))}
    </div>
  </section>

  <!-- Featured work -->
  <section id="featured-work" class="featured-work container">
    <h2 class="section-title">Recent work</h2>
    <div class="featured-grid">
      {homepageCards.map((p) => (
        <a href={`/work/${p.id}`} class="featured-card">
          <img src={p.data.image} alt={p.data.title} class="featured-card__img" loading="lazy" />
          <div class="featured-card__body">
            <span class="featured-card__service">
              {SERVICES.find((s) => s.slug === p.data.service)?.name}
            </span>
            <h3 class="featured-card__name">{p.data.title}</h3>
            {p.data.outcome_bullets.length > 0 && (
              <p class="featured-card__outcome">{p.data.outcome_bullets[0]}</p>
            )}
            <span class="featured-card__link">Read case study →</span>
          </div>
        </a>
      ))}
    </div>
    <p class="featured-work__see-all"><a href="/work">See all case studies →</a></p>
  </section>

  <!-- Founder strip -->
  <section class="founder container">
    <div class="founder__inner">
      <div class="founder__copy">
        <h2 class="section-title">Founder-led, built by people who ship</h2>
        <p>
          Inflect Hub is led by Frank Enendu, an AI engineer with a decade of building production AI
          systems at Bally's, the NHS, and across consulting engagements in retail, beauty, and
          legal-tech. Lagos → Manchester → wherever the work is.
        </p>
        <a href="/about" class="founder__link">More about the team →</a>
      </div>
    </div>
  </section>

  <!-- Chatbot CTA strip -->
  <section class="cta-strip">
    <div class="container">
      <h2>Tell us about your business. We'll tell you which transformation fits.</h2>
      <p>The discovery agent takes about three minutes. No calendar booking required.</p>
      <button type="button" class="cta-strip__btn" data-open-chat>Start the conversation</button>
    </div>
  </section>
</BaseLayout>

<script>
  // Render Lucide icons (loaded via dynamic import to keep them out of the critical bundle)
  import("lucide").then(({ createIcons, icons }) => {
    document.querySelectorAll<HTMLElement>("[data-icon]").forEach((el) => {
      const name = el.dataset.icon;
      if (!name) return;
      const Icon = (icons as Record<string, unknown>)[name];
      if (!Icon) return;
      el.innerHTML = "";
      const svg = document.createElement("div");
      svg.dataset.lucide = name
        .replace(/([A-Z])/g, "-$1")
        .toLowerCase()
        .replace(/^-/, "");
      el.appendChild(svg);
      createIcons({ icons: { [name]: Icon } });
    });
  });
</script>

<style>
  .hero {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    overflow: hidden;
  }
  .hero__particles {
    position: absolute;
    inset: 0;
    z-index: 0;
  }
  .hero__inner {
    position: relative;
    z-index: 1;
    text-align: center;
  }
  .hero__eyebrow {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--accent);
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-bottom: var(--space-sm);
  }
  .hero__title {
    font-family: var(--font-heading);
    font-size: clamp(2.5rem, 6vw, 4.5rem);
    line-height: 1.1;
    margin: 0 auto var(--space-md);
    max-width: 18ch;
  }
  .hero__sub {
    font-size: clamp(1rem, 1.5vw, 1.15rem);
    color: var(--text-secondary);
    max-width: 42rem;
    margin: 0 auto var(--space-lg);
    line-height: 1.6;
  }
  .hero__ctas {
    display: flex;
    gap: var(--space-md);
    justify-content: center;
    flex-wrap: wrap;
  }
  .hero__cta-primary {
    padding: 0.875rem 1.75rem;
    background: var(--accent);
    color: #ffffff;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  }
  .hero__cta-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(233, 69, 96, 0.4);
  }
  .hero__cta-ghost {
    padding: 0.875rem 1.75rem;
    background: transparent;
    color: var(--text-primary);
    border: 1px solid var(--border);
    border-radius: 8px;
    font-weight: 500;
    font-size: 0.95rem;
    text-decoration: none;
  }

  .trusted {
    padding: var(--space-xl) 0;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }
  .trusted__caption {
    text-align: center;
    color: var(--text-muted);
    font-size: 0.875rem;
    margin-bottom: var(--space-md);
  }
  .trusted__logos {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    align-items: center;
    gap: var(--space-md);
  }
  @media (max-width: 768px) {
    .trusted__logos {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  .trusted__logo img {
    width: 100%;
    max-height: 48px;
    object-fit: contain;
    filter: grayscale(1) opacity(0.65);
    transition: filter var(--transition-normal);
  }
  .trusted__logo:hover img {
    filter: grayscale(0) opacity(1);
  }

  .section-title {
    font-family: var(--font-heading);
    font-size: clamp(1.75rem, 3vw, 2.5rem);
    text-align: center;
    margin: 0 0 var(--space-lg);
  }

  .services-overview {
    padding: var(--space-xl) var(--space-md);
  }
  .services-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-md);
  }
  @media (max-width: 768px) {
    .services-grid {
      grid-template-columns: 1fr;
    }
  }
  .service-card {
    padding: var(--space-lg);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 12px;
    text-decoration: none;
    color: inherit;
    transition: transform var(--transition-fast), border-color var(--transition-fast);
  }
  .service-card:hover {
    transform: translateY(-4px);
    border-color: var(--accent);
  }
  .service-card__icon {
    display: inline-flex;
    width: 32px;
    height: 32px;
    color: var(--accent);
    margin-bottom: var(--space-sm);
  }
  .service-card__icon :global(svg) {
    width: 100%;
    height: 100%;
    stroke-width: 1.5;
  }
  .service-card__name {
    font-family: var(--font-heading);
    font-size: 1.25rem;
    margin: 0 0 var(--space-xs);
  }
  .service-card__promise {
    color: var(--text-secondary);
    margin: 0 0 var(--space-sm);
    line-height: 1.5;
  }
  .service-card__link {
    color: var(--accent);
    font-weight: 500;
    font-size: 0.875rem;
  }

  .featured-work {
    padding: var(--space-xl) var(--space-md);
  }
  .featured-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-md);
  }
  @media (max-width: 1024px) {
    .featured-grid {
      grid-template-columns: 1fr;
    }
  }
  .featured-card {
    display: block;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
    text-decoration: none;
    color: inherit;
    transition: transform var(--transition-fast), border-color var(--transition-fast);
  }
  .featured-card:hover {
    transform: translateY(-4px);
    border-color: var(--accent);
  }
  .featured-card__img {
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
  }
  .featured-card__body {
    padding: var(--space-md);
  }
  .featured-card__service {
    display: inline-block;
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--accent);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: var(--space-xs);
  }
  .featured-card__name {
    font-family: var(--font-heading);
    font-size: 1.25rem;
    margin: 0 0 var(--space-xs);
  }
  .featured-card__outcome {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin: 0 0 var(--space-sm);
  }
  .featured-card__link {
    color: var(--accent);
    font-weight: 500;
    font-size: 0.875rem;
  }
  .featured-work__see-all {
    text-align: center;
    margin-top: var(--space-lg);
  }
  .featured-work__see-all a {
    color: var(--accent);
    text-decoration: none;
    font-weight: 500;
  }

  .founder {
    padding: var(--space-xl) var(--space-md);
  }
  .founder__inner {
    max-width: 42rem;
    margin: 0 auto;
    text-align: center;
  }
  .founder__copy p {
    color: var(--text-secondary);
    line-height: 1.7;
    font-size: 1.05rem;
    margin: var(--space-md) 0;
  }
  .founder__link {
    color: var(--accent);
    text-decoration: none;
    font-weight: 500;
  }

  .cta-strip {
    background: var(--accent);
    color: #ffffff;
    padding: var(--space-xl) var(--space-md);
    text-align: center;
  }
  .cta-strip h2 {
    font-family: var(--font-heading);
    font-size: clamp(1.5rem, 3vw, 2rem);
    margin: 0 0 var(--space-sm);
  }
  .cta-strip p {
    opacity: 0.9;
    margin: 0 0 var(--space-md);
  }
  .cta-strip__btn {
    padding: 0.875rem 1.75rem;
    background: #ffffff;
    color: var(--accent);
    border: none;
    border-radius: 8px;
    font-weight: 700;
    font-size: 0.95rem;
    cursor: pointer;
  }
</style>
```

Note: The script block uses the `lucide` package (not `lucide-react`). Lucide ships ESM-compatible runtime icons for vanilla JS via the `lucide` package. Lucide-React is for React components. We installed `lucide-react` in Task 1 for any future React island usage; here we use the vanilla path. If the `lucide` package isn't installed, install it now: `npm install lucide` (sibling package, ~5KB).

- [ ] **Step 2: Install `lucide` (vanilla runtime, for non-React Astro components)**

Run: `npm install lucide`
Expected: installs without error.

- [ ] **Step 3: Verify build passes**

Run: `npm run build`
Expected: completes clean.

- [ ] **Step 4: Smoke-test the homepage**

Run: `npm run dev`. Visit `http://localhost:4321/`. Confirm:
- Hero: particle background, eyebrow "Digital Transformation · AI Consulting", H1 "We transform traditional businesses with AI.", subtitle, two CTAs
- Trusted strip: 5 client logos (placeholders for now — Task 15 adds real ones)
- Services grid: 4 cards with Lucide icons, in correct order (Custom Platforms first)
- Featured work: 3 cards (FairLens, OgaHQ, Advance Purity)
- Founder strip
- CTA strip with chatbot button

Stop dev server.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/pages/index.astro
git commit -m "feat: rebuild homepage with hero/trust/services/work/founder/CTA sections"
```

---

## Task 10: Create services page

**Files:**
- Create: `src/pages/services.astro`

**Interfaces:**
- Consumes: `SERVICES` from constants; `getCollection("projects")` for the example case study cards.

- [ ] **Step 1: Create `src/pages/services.astro`**

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import { SERVICES, SITE } from "../lib/constants";
import { getCollection } from "astro:content";

const all = await getCollection("projects");

// Service-specific deep content (kept here so the file is one place, not four)
const SERVICE_CONTENT: Record<string, {
  problem: string;
  approach: string[];
  tech: string[];
}> = {
  "custom-platforms": {
    problem:
      "Off-the-shelf AI tools cap out when your domain has regulatory complexity, audit requirements, or accuracy bars that vendor models can't clear. You need a system that's accountable to your evidence, not their hallucinations.",
    approach: [
      "Map every decision point against the evidence and citations the business already trusts",
      "Build the system as a multi-agent pipeline so each phase is independently auditable",
      "Wire the agents into the operational stack your team actually uses — not a separate dashboard",
      "Ship in production with the customer-facing billing, auth, and audit logs they need from day one",
    ],
    tech: [
      "Multi-agent frameworks (Google ADK, AutoGen)",
      "Hybrid retrieval (vector + BM25)",
      "Per-criterion LLM analysis with citation",
      "Full SaaS stack (Clerk auth, Stripe billing, Prisma)",
      "Cloud IaC (Terraform / Vercel / Azure)",
    ],
  },
  "conversational-ai": {
    problem:
      "Your customers live in WhatsApp, Instagram DMs, or live chat — not your dashboard. Your team handles the same 30 questions every day. Off-the-shelf chatbots fail on the channels and languages your users actually use.",
    approach: [
      "Mine real transcripts to find the highest-volume intents — not the ones a vendor template assumes",
      "Build for the channel your users already pick up (WhatsApp Business, in-app messenger, Slack)",
      "Handle multilingual code-switching natively where the audience demands it",
      "Hand off to a human with full context the moment the assistant is out of its depth",
    ],
    tech: [
      "Google Gemini / OpenAI / Claude (channel-appropriate)",
      "WhatsApp Business API / Twilio / Slack",
      "Vector memory for in-conversation context",
      "Escalation routing with full transcript handoff",
      "Offline-aware sync where the network is unreliable",
    ],
  },
  personalisation: {
    problem:
      "Your storefront has the products. Your customer doesn't know which ones are for them. The result is a flat product grid that converts cold visitors at agency-anaemic rates.",
    approach: [
      "Design a quiz funnel that meets the customer at the question they actually have",
      "Build an LLM matching layer between customer signal and product catalogue",
      "Surface the reasoning — customers convert when they trust why the recommendation fits",
      "Embed in the existing storefront, not as a separate microsite",
    ],
    tech: [
      "Astro / React islands embedded in Shopify, WooCommerce, custom stacks",
      "OpenAI / Gemini for matching + reasoning copy",
      "Catalogue-aware retrieval",
      "A/B-testable funnel components",
    ],
  },
  "multi-modal-content": {
    problem:
      "Your brand needs a constant cadence of fresh imagery, social posts, and campaign assets. Agencies are slow and expensive. In-house production can't keep pace. The result is stock-feeling launches or delayed campaigns.",
    approach: [
      "Fine-tune image generation on your existing brand photography for on-brand outputs",
      "Build a brand-voice-conditioned copy pipeline using your existing style guide",
      "Route every asset through your brand team's approval queue — humans always own publish",
      "Land approved assets in your existing media library (Cloudinary, S3, Shopify)",
    ],
    tech: [
      "Stable Diffusion (brand-tuned)",
      "OpenAI / Claude for copy with brand voice priors",
      "Cloudinary / asset pipelines",
      "Approval queues with rejection-as-feedback into the prompt library",
    ],
  },
};

function findExample(serviceSlug: string) {
  return all.find((p) => p.data.service === serviceSlug && p.data.tier === "featured");
}
---

<BaseLayout
  title="Services — Inflect Hub"
  description="Four ways Inflect Hub transforms a business with AI: custom AI platforms, conversational AI, personalisation funnels, and multi-modal content automation."
>
  <!-- Page hero -->
  <header class="services-hero container">
    <h1 class="services-hero__title">Four ways we transform a business with AI.</h1>
    <p class="services-hero__sub">
      Every engagement starts with the same question — where is human time being wasted on work AI
      can do reliably? Then we pick one of four shapes.
    </p>
    <nav class="services-hero__pills" aria-label="Service jump links">
      {SERVICES.map((s) => (
        <a href={`#${s.slug}`} class="services-hero__pill">{s.name}</a>
      ))}
    </nav>
  </header>

  <!-- Per-service sections -->
  {SERVICES.map((service, i) => {
    const content = SERVICE_CONTENT[service.slug];
    const example = findExample(service.slug);
    return (
      <section
        id={service.slug}
        class={`service-section${i % 2 === 1 ? " service-section--alt" : ""}`}
      >
        <div class="container">
          <h2 class="service-section__name">{service.name}</h2>
          <p class="service-section__promise">{service.promise}</p>

          <div class="service-section__grid">
            <div>
              <h3>The problem we solve</h3>
              <p>{content.problem}</p>
            </div>
            <div>
              <h3>How we approach it</h3>
              <ul>
                {content.approach.map((step) => <li>{step}</li>)}
              </ul>
            </div>
            <div>
              <h3>Typical tech we reach for</h3>
              <ul>
                {content.tech.map((t) => <li>{t}</li>)}
              </ul>
            </div>
            {example && (
              <div>
                <h3>Where you've seen it</h3>
                <a href={`/work/${example.id}`} class="service-section__example">
                  <img src={example.data.image} alt={example.data.title} />
                  <div>
                    <strong>{example.data.title}</strong>
                    <span>{example.data.industry}</span>
                  </div>
                </a>
              </div>
            )}
          </div>

          <button type="button" class="service-section__cta" data-open-chat data-service={service.slug}>
            Start a project →
          </button>
        </div>
      </section>
    );
  })}

  <!-- Bottom anchor -->
  <section class="services-bottom container">
    <h2>Not sure which fits?</h2>
    <p>Talk to the discovery agent. Three minutes, no calendar booking.</p>
    <button type="button" class="services-bottom__btn" data-open-chat>Start the conversation</button>
  </section>
</BaseLayout>

<style>
  .services-hero {
    padding: calc(var(--nav-height) + var(--space-xl)) var(--space-md) var(--space-lg);
    text-align: center;
  }
  .services-hero__title {
    font-family: var(--font-heading);
    font-size: clamp(2rem, 5vw, 3.5rem);
    margin: 0 0 var(--space-md);
  }
  .services-hero__sub {
    font-size: 1.05rem;
    color: var(--text-secondary);
    max-width: 42rem;
    margin: 0 auto var(--space-md);
    line-height: 1.6;
  }
  .services-hero__pills {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
    justify-content: center;
    position: sticky;
    top: var(--nav-height);
    padding: var(--space-sm) 0;
    background: var(--bg-primary);
    z-index: 10;
  }
  .services-hero__pill {
    padding: 0.5rem 1rem;
    border: 1px solid var(--border);
    border-radius: 999px;
    text-decoration: none;
    font-size: 0.85rem;
    color: var(--text-secondary);
    transition: background var(--transition-fast), color var(--transition-fast);
  }
  .services-hero__pill:hover {
    background: var(--accent);
    color: #ffffff;
    border-color: var(--accent);
  }

  .service-section {
    padding: var(--space-xl) 0;
  }
  .service-section--alt {
    background: var(--bg-secondary);
  }
  .service-section__name {
    font-family: var(--font-heading);
    font-size: clamp(1.75rem, 3vw, 2.5rem);
    margin: 0 0 var(--space-sm);
  }
  .service-section__promise {
    font-size: 1.15rem;
    color: var(--text-secondary);
    max-width: 42rem;
    margin: 0 0 var(--space-lg);
    line-height: 1.5;
  }
  .service-section__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-lg);
    margin-bottom: var(--space-lg);
  }
  @media (max-width: 768px) {
    .service-section__grid {
      grid-template-columns: 1fr;
    }
  }
  .service-section__grid h3 {
    font-family: var(--font-heading);
    font-size: 1rem;
    margin: 0 0 var(--space-sm);
    color: var(--accent);
  }
  .service-section__grid p,
  .service-section__grid li {
    color: var(--text-primary);
    line-height: 1.7;
  }
  .service-section__grid ul {
    padding-left: 1.25rem;
  }
  .service-section__example {
    display: flex;
    gap: var(--space-sm);
    align-items: center;
    text-decoration: none;
    color: inherit;
    padding: var(--space-sm);
    background: var(--bg-tertiary);
    border-radius: 8px;
    transition: transform var(--transition-fast);
  }
  .service-section__example:hover {
    transform: translateY(-2px);
  }
  .service-section__example img {
    width: 64px;
    height: 64px;
    object-fit: cover;
    border-radius: 6px;
    flex-shrink: 0;
  }
  .service-section__example strong {
    display: block;
    color: var(--text-primary);
  }
  .service-section__example span {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }
  .service-section__cta {
    padding: 0.875rem 1.75rem;
    background: var(--accent);
    color: #ffffff;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
  }

  .services-bottom {
    padding: var(--space-xl) var(--space-md);
    text-align: center;
  }
  .services-bottom h2 {
    font-family: var(--font-heading);
    margin: 0 0 var(--space-sm);
  }
  .services-bottom p {
    color: var(--text-secondary);
    margin: 0 0 var(--space-md);
  }
  .services-bottom__btn {
    padding: 0.875rem 1.75rem;
    background: var(--accent);
    color: #ffffff;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
  }
</style>
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: completes clean. `dist/services/index.html` exists.

- [ ] **Step 3: Smoke-test `/services`**

Run: `npm run dev`. Visit `http://localhost:4321/services`. Confirm:
- Page hero with H1 and 4 pill anchor links
- 4 sections (Custom Platforms first), each with promise, problem, approach, tech, example card linking to demonstrating case study
- Anchor jump links scroll to correct sections
- Each section's "Start a project →" CTA has `data-service` attribute matching the service slug
- Bottom CTA section

Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add src/pages/services.astro
git commit -m "feat: add /services page with four-service deep dive sections"
```

---

## Task 11: Rebuild work gallery page

**Files:**
- Modify: `src/pages/work/index.astro` (formerly `projects/index.astro` after Task 5)

**Interfaces:**
- Consumes: `SERVICES` from constants; `getCollection("projects")` filtered by `tier`.
- Note: The existing `src/components/ProjectFilter.tsx` may already implement filter UI for the old schema. Either rewrite it or replace with the inline filter logic shown below. The plan below uses inline filter (simpler than touching the React island).

- [ ] **Step 1: Replace `src/pages/work/index.astro` entirely**

```astro
---
import BaseLayout from "../../layouts/BaseLayout.astro";
import { SERVICES } from "../../lib/constants";
import { getCollection } from "astro:content";

const all = await getCollection("projects");
const featured = all
  .filter((p) => p.data.tier === "featured")
  .sort((a, b) => a.data.order - b.data.order);
const secondary = all
  .filter((p) => p.data.tier === "secondary")
  .sort((a, b) => a.data.order - b.data.order);
---

<BaseLayout
  title="Work — Inflect Hub"
  description="Five featured case studies. Three industries. One way of working. Filter by type of engagement or service demonstrated."
>
  <!-- Page hero -->
  <header class="work-hero container">
    <h1>Five businesses. Three industries. One way of working.</h1>
    <p>
      Each case study below shows the problem we walked into, what we built, the stack we used, and
      the outcome. Filter by the type of work, or the service it demonstrates.
    </p>
  </header>

  <!-- Filter bar -->
  <section class="work-filters container" aria-label="Filter case studies">
    <div class="work-filters__group">
      <span class="work-filters__label">Type</span>
      <button class="work-filters__pill active" data-filter-type="all">All</button>
      <button class="work-filters__pill" data-filter-type="client">Client engagement</button>
      <button class="work-filters__pill" data-filter-type="product">Built by us</button>
    </div>
    <div class="work-filters__group">
      <span class="work-filters__label">Service</span>
      <button class="work-filters__pill active" data-filter-service="all">All</button>
      {SERVICES.map((s) => (
        <button class="work-filters__pill" data-filter-service={s.slug}>{s.name}</button>
      ))}
    </div>
  </section>

  <!-- Featured grid -->
  <section class="work-featured container">
    <div class="work-grid" id="featured-grid">
      {featured.map((p) => (
        <a
          href={`/work/${p.id}`}
          class="work-card"
          data-type={p.data.type}
          data-service={p.data.service}
        >
          <img src={p.data.image} alt={p.data.title} class="work-card__img" loading="lazy" />
          <div class="work-card__body">
            <span class="work-card__service">
              {SERVICES.find((s) => s.slug === p.data.service)?.name}
            </span>
            <h3>{p.data.title}</h3>
            {p.data.outcome_bullets.length > 0 && (
              <p class="work-card__outcome">{p.data.outcome_bullets[0]}</p>
            )}
            <span class="work-card__link">Read case study →</span>
          </div>
        </a>
      ))}
    </div>
  </section>

  <!-- Other work strip -->
  <section class="work-other container">
    <h2>Other work we've built</h2>
    <p class="work-other__caption">
      Smaller explorations, internal tools, and research projects that didn't grow into client
      engagements but showed us what's possible.
    </p>
    <div class="work-other__grid">
      {secondary.map((p) => (
        <div class="work-other__card">
          <h4>{p.data.title}</h4>
          <p>{p.data.description}</p>
          <div class="work-other__tech">
            {p.data.tech.slice(0, 4).map((t) => <span>{t}</span>)}
          </div>
          {p.data.github && (
            <a href={p.data.github} target="_blank" rel="noopener" class="work-other__link">
              GitHub →
            </a>
          )}
        </div>
      ))}
    </div>
  </section>

  <!-- Bottom CTA -->
  <section class="work-cta container">
    <h2>Have a transformation in mind?</h2>
    <button type="button" class="work-cta__btn" data-open-chat>Start a project →</button>
  </section>
</BaseLayout>

<script>
  // Filter logic + URL param state
  const params = new URLSearchParams(window.location.search);
  const initialType = params.get("type") ?? "all";
  const initialService = params.get("service") ?? "all";

  let activeType = initialType;
  let activeService = initialService;

  function applyFilters() {
    document.querySelectorAll<HTMLElement>(".work-card").forEach((card) => {
      const cardType = card.dataset.type;
      const cardService = card.dataset.service;
      const typeMatch = activeType === "all" || cardType === activeType;
      const serviceMatch = activeService === "all" || cardService === activeService;
      card.style.display = typeMatch && serviceMatch ? "" : "none";
    });

    // Update active pill state
    document.querySelectorAll<HTMLButtonElement>("[data-filter-type]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.filterType === activeType);
    });
    document.querySelectorAll<HTMLButtonElement>("[data-filter-service]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.filterService === activeService);
    });

    // Sync URL
    const url = new URL(window.location.href);
    if (activeType === "all") url.searchParams.delete("type");
    else url.searchParams.set("type", activeType);
    if (activeService === "all") url.searchParams.delete("service");
    else url.searchParams.set("service", activeService);
    window.history.replaceState({}, "", url.toString());
  }

  document.querySelectorAll<HTMLButtonElement>("[data-filter-type]").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeType = btn.dataset.filterType ?? "all";
      applyFilters();
    });
  });
  document.querySelectorAll<HTMLButtonElement>("[data-filter-service]").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeService = btn.dataset.filterService ?? "all";
      applyFilters();
    });
  });

  // Run once on load with the URL-param defaults
  applyFilters();
</script>

<style>
  .work-hero {
    padding: calc(var(--nav-height) + var(--space-xl)) var(--space-md) var(--space-lg);
    text-align: center;
  }
  .work-hero h1 {
    font-family: var(--font-heading);
    font-size: clamp(2rem, 5vw, 3.5rem);
    margin: 0 0 var(--space-md);
  }
  .work-hero p {
    color: var(--text-secondary);
    max-width: 42rem;
    margin: 0 auto;
    line-height: 1.6;
  }

  .work-filters {
    padding: var(--space-md);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    position: sticky;
    top: var(--nav-height);
    background: var(--bg-primary);
    z-index: 10;
  }
  .work-filters__group {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
    align-items: center;
  }
  .work-filters__label {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-right: var(--space-xs);
  }
  .work-filters__pill {
    padding: 0.4rem 0.875rem;
    border: 1px solid var(--border);
    background: transparent;
    border-radius: 999px;
    font-size: 0.825rem;
    color: var(--text-secondary);
    cursor: pointer;
    transition: background var(--transition-fast), color var(--transition-fast);
  }
  .work-filters__pill.active {
    background: var(--accent);
    color: #ffffff;
    border-color: var(--accent);
  }

  .work-featured {
    padding: var(--space-xl) var(--space-md);
  }
  .work-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-md);
  }
  @media (max-width: 1024px) {
    .work-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media (max-width: 640px) {
    .work-grid {
      grid-template-columns: 1fr;
    }
  }
  .work-card {
    display: block;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
    text-decoration: none;
    color: inherit;
    transition: transform var(--transition-fast), border-color var(--transition-fast);
  }
  .work-card:hover {
    transform: translateY(-4px);
    border-color: var(--accent);
  }
  .work-card__img {
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
  }
  .work-card__body {
    padding: var(--space-md);
  }
  .work-card__service {
    display: inline-block;
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--accent);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: var(--space-xs);
  }
  .work-card h3 {
    font-family: var(--font-heading);
    margin: 0 0 var(--space-xs);
  }
  .work-card__outcome {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin: 0 0 var(--space-sm);
  }
  .work-card__link {
    color: var(--accent);
    font-weight: 500;
    font-size: 0.875rem;
  }

  .work-other {
    padding: var(--space-xl) var(--space-md);
    border-top: 1px solid var(--border);
  }
  .work-other h2 {
    font-family: var(--font-heading);
    text-align: center;
    margin: 0 0 var(--space-sm);
  }
  .work-other__caption {
    text-align: center;
    color: var(--text-secondary);
    max-width: 38rem;
    margin: 0 auto var(--space-lg);
  }
  .work-other__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-md);
  }
  @media (max-width: 768px) {
    .work-other__grid {
      grid-template-columns: 1fr;
    }
  }
  .work-other__card {
    padding: var(--space-md);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 12px;
  }
  .work-other__card h4 {
    font-family: var(--font-heading);
    margin: 0 0 var(--space-xs);
  }
  .work-other__card p {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin: 0 0 var(--space-sm);
  }
  .work-other__tech {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-bottom: var(--space-sm);
  }
  .work-other__tech span {
    font-size: 0.7rem;
    padding: 0.2rem 0.5rem;
    background: var(--bg-tertiary);
    border-radius: 4px;
    color: var(--text-secondary);
  }
  .work-other__link {
    color: var(--accent);
    text-decoration: none;
    font-size: 0.85rem;
    font-weight: 500;
  }

  .work-cta {
    padding: var(--space-xl) var(--space-md);
    text-align: center;
  }
  .work-cta h2 {
    font-family: var(--font-heading);
    margin: 0 0 var(--space-md);
  }
  .work-cta__btn {
    padding: 0.875rem 1.75rem;
    background: var(--accent);
    color: #ffffff;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
  }
</style>
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: completes clean.

- [ ] **Step 3: Smoke-test `/work` and filters**

Run: `npm run dev`. Visit `http://localhost:4321/work`. Confirm:
- 5 featured cards visible
- Clicking "Client engagement" hides FairLens + CaseReviewer (products); shows OgaHQ + Advance Purity + Lumicos
- Clicking "Conversational AI" + "Client engagement" = only OgaHQ visible
- URL updates to `?type=client&service=conversational-ai`
- Refreshing the URL preserves filter state
- "Other work we've built" section shows 4 secondary cards (SafeAI, AiGen, Personal Copilot, Multi-Modal Content Generator) below the filters
- Archived projects (Nova etc.) are NOT visible

Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add src/pages/work/index.astro
git commit -m "feat: rebuild /work gallery with featured grid, secondary strip, and type+service filters"
```

---

## Task 12: Rewrite about page as founder story

**Files:**
- Modify: `src/pages/about.astro`

**Interfaces:**
- Consumes: `SITE`, `SOCIAL_LINKS` from constants.

- [ ] **Step 1: Replace `src/pages/about.astro` entirely**

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import { SITE, SOCIAL_LINKS } from "../lib/constants";
---

<BaseLayout
  title="About — Inflect Hub"
  description="Inflect Hub is a digital transformation consultancy led by Frank Enendu, an AI engineer who has shipped production AI systems across retail, beauty, legal-tech, and healthcare."
>
  <article class="about">
    <!-- Hero -->
    <header class="about__hero">
      <h1>The team behind Inflect Hub.</h1>
      <p class="about__lede">
        We're a small consultancy that builds production AI systems for businesses
        the off-the-shelf vendors haven't earned. Led by Frank Enendu, an AI engineer with a decade
        of shipping under regulatory, accuracy, and scale constraints.
      </p>
    </header>

    <!-- Founder section -->
    <section class="about__founder">
      <h2>Frank Enendu — Founder</h2>
      <p>
        Frank is an AI engineer based in Manchester, originally from Lagos. He has spent the last
        decade building production AI systems across consumer tech, healthcare, gaming, and
        cosmetics. Currently AI Engineer at Bally's Interactive, where he ships LLM-powered systems
        for one of the UK's largest entertainment groups.
      </p>
      <p>
        Before Bally's, Frank built data and AI products at the NHS, led ML engineering at
        consultancies in Lagos and Manchester, and shipped his own products (FairLens, CaseReviewer)
        through Inflect Hub.
      </p>
      <p>
        He holds an MSc in Data Science (Distinction) from the University of Salford and has been
        writing AI engineering for an audience of practitioners on Medium since 2020.
      </p>
      <p class="about__links">
        <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener">LinkedIn</a>
        <span>·</span>
        <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener">GitHub</a>
        <span>·</span>
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
      </p>
    </section>

    <!-- Principles -->
    <section class="about__principles">
      <h2>How we work</h2>
      <ol>
        <li>
          <strong>The fix is in production, or it doesn't count.</strong>
          A prototype is interesting; a production system that survives real customer load is
          something we'll put our name on.
        </li>
        <li>
          <strong>The evidence is the brief.</strong>
          We start every engagement by reading real transcripts, logs, or workflows — not vendor
          slide decks or aspirational personas.
        </li>
        <li>
          <strong>Humans own publish.</strong>
          Our AI systems draft, recommend, and accelerate. Approval, judgement, and accountability
          stay with the people whose name is on the work.
        </li>
        <li>
          <strong>We name what we did, where we did it, and what it cost.</strong>
          Generic case studies are a credibility tax. Every project we put on this site is named,
          live, and verifiable.
        </li>
      </ol>
    </section>

    <!-- CTA -->
    <section class="about__cta">
      <h2>Working with us</h2>
      <p>
        Every engagement starts with a 3-minute conversation with our discovery agent. It qualifies
        your problem, recommends a service, and writes a summary that Frank reads the same day.
      </p>
      <button type="button" class="about__cta-btn" data-open-chat>Start a project →</button>
    </section>
  </article>
</BaseLayout>

<style>
  .about {
    max-width: 42rem;
    margin: calc(var(--nav-height) + var(--space-xl)) auto var(--space-xl);
    padding: 0 var(--space-md);
  }
  .about__hero h1 {
    font-family: var(--font-heading);
    font-size: clamp(2rem, 5vw, 3.5rem);
    margin: 0 0 var(--space-md);
  }
  .about__lede {
    font-size: 1.15rem;
    color: var(--text-secondary);
    line-height: 1.6;
    margin: 0 0 var(--space-xl);
  }
  .about__founder h2,
  .about__principles h2,
  .about__cta h2 {
    font-family: var(--font-heading);
    font-size: 1.5rem;
    margin: var(--space-xl) 0 var(--space-md);
  }
  .about__founder p {
    line-height: 1.7;
    color: var(--text-primary);
    margin: 0 0 var(--space-md);
  }
  .about__links {
    font-size: 0.9rem;
    color: var(--text-secondary);
  }
  .about__links a {
    color: var(--accent);
    text-decoration: none;
  }
  .about__links span {
    margin: 0 0.5rem;
    color: var(--text-muted);
  }
  .about__principles ol {
    padding-left: 1.25rem;
  }
  .about__principles li {
    margin-bottom: var(--space-md);
    line-height: 1.6;
    color: var(--text-primary);
  }
  .about__principles strong {
    color: var(--text-primary);
  }
  .about__cta {
    padding: var(--space-lg);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 12px;
    margin-top: var(--space-xl);
  }
  .about__cta p {
    color: var(--text-secondary);
    line-height: 1.6;
    margin: 0 0 var(--space-md);
  }
  .about__cta-btn {
    padding: 0.75rem 1.5rem;
    background: var(--accent);
    color: #ffffff;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
  }
</style>
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: completes clean.

- [ ] **Step 3: Smoke-test `/about`**

Run: `npm run dev`. Visit `http://localhost:4321/about`. Confirm founder story, principles, CTA all render.

Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add src/pages/about.astro
git commit -m "feat: rewrite /about as founder story for Inflect Hub"
```

---

## Task 13: Replace chatbot with Discovery Agent (system prompt + UI shell)

**Files:**
- Modify: `src/pages/api/chat.ts`
- Modify: `src/components/ChatBot.tsx`

**Interfaces:**
- Consumes: existing `sendMessage` from `src/lib/chatbot.ts` (unchanged).
- Produces: chatbot listens for `window.addEventListener("inflect:open-chat", ...)` — opens the panel; if `event.detail.service` is set, seeds the initial assistant message with a service-aware opener.

- [ ] **Step 1: Read existing `src/pages/api/chat.ts` to know the surrounding plumbing**

Run: `cat src/pages/api/chat.ts | head -40`
Note: the system prompt is the long string passed to Gemini. Everything else (model name, request handling, error mapping) stays.

- [ ] **Step 2: Replace the system prompt in `src/pages/api/chat.ts`**

Find the existing system-prompt string (a long backtick template literal). Replace it with this content:

```typescript
const SYSTEM_PROMPT = `You are the Inflect Hub Discovery Agent.

Inflect Hub is a digital transformation consultancy founded by Frank Enendu. Inflect Hub takes traditional businesses and transforms them with AI. The consultancy delivers four services:

1. Custom AI Platforms — end-to-end AI products for industries with regulatory and accuracy bars no off-the-shelf tool clears. Demonstrated by FairLens (multi-agent grant/application review SaaS — fairlens.app) and CaseReviewer (EB-1A visa petition analyzer — casereviewer.ai).

2. Conversational AI — multilingual assistants and chatbots on the channels users actually use. Demonstrated by the WhatsApp AI assistant we built for OgaHQ (African retail operating system — ogahq.app).

3. Personalisation Funnels — AI advisors and recommenders that turn flat product grids into guided buying journeys. Demonstrated by the AI skincare advisor we built for Advance Purity Cosmetics (advancepurity.com).

4. Multi-Modal Content — on-brand product imagery, social posts, and campaign generation at production scale. Demonstrated by the content pipeline we built for Lumicos Beauty (lumicosbeauty.com).

YOUR JOB
Have a short, warm, professional conversation that qualifies the prospect well enough to:
(a) recommend one of the four services with one-line reasoning, and
(b) capture a summary that Frank can act on within one business day.

CONVERSATION SHAPE (typical 5-7 turns)
1. Greet, invite context: "Tell me about your business and what's prompting you to look into AI right now."
2. Drill into the friction: "What's the specific moment in your operation that you'd love to make faster, cheaper, or more consistent?"
3. Probe urgency / timeline.
4. Optional budget probe (skippable — never block on this).
5. Recommend a service with one-line reasoning; link to the relevant case study at inflecthub.com/work/<id>.
6. Capture the lead — ask for email (required), WhatsApp (optional), and show them an editable summary.
7. Confirm summary, send to Frank, close with "Frank will be in touch within one business day."

HARD BOUNDARIES — never break these
- Never quote a price, day rate, or fixed timeline. Say: "Pricing depends on scope. Once you've shared more, Frank will follow up with a tailored estimate."
- Never promise outcomes. Only describe what's been delivered for others.
- Never invent case studies. Inflect Hub has delivered work for: OgaHQ, Advance Purity Cosmetics, Lumicos Beauty, FairLens, CaseReviewer. Nothing else.
- If the prospect asks for work outside our four services (mobile apps, plain web dev, copywriting, paid ads, design-only), say so honestly and recommend they look elsewhere.
- One question at a time. No info-dumps. No lectures.

VOICE
British English. Concrete, named, active. No agency clichés ("unlock", "end-to-end", "thought leader", "transform your journey"). Warm but professional.

If the conversation goes off-topic (the user asks about something unrelated), redirect with: "Happy to chat about that — but my job is helping you scope an AI engagement with Inflect Hub. Want me to keep going on that?"
`;
```

Replace the existing system prompt assignment. Keep everything else — model name, request body parsing, response shaping, error handling — unchanged.

- [ ] **Step 3: Replace `src/components/ChatBot.tsx` to rebrand UI and listen for entry-point events**

The new component:
- Listens for `window.addEventListener("inflect:open-chat", ...)` to open from anywhere on the site
- If the event carries `detail.service`, seeds a service-aware opener
- Renames the header to "Inflect Hub · Discovery Agent"
- Updates the initial greeting
- Updates the error fallback to `frank@inflecthub.com`
- Persists conversation state in `localStorage` (cleared after 24h)

Replace `src/components/ChatBot.tsx` with:

```typescript
import { useState, useEffect, useRef } from "react";
import { sendMessage, type ChatMessage } from "../lib/chatbot";

const INITIAL_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Hi — I'm the Inflect Hub Discovery Agent. Tell me about your business and what's prompting you to look into AI right now.",
};

const STORAGE_KEY = "inflect:chat-state";
const STORAGE_TTL_MS = 24 * 60 * 60 * 1000;

type PersistedState = {
  messages: ChatMessage[];
  savedAt: number;
};

function loadPersisted(): ChatMessage[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (Date.now() - parsed.savedAt > STORAGE_TTL_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed.messages;
  } catch {
    return null;
  }
}

function persist(messages: ChatMessage[]) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ messages, savedAt: Date.now() } as PersistedState)
    );
  } catch {
    /* localStorage unavailable — ignore */
  }
}

const SERVICE_OPENERS: Record<string, string> = {
  "custom-platforms":
    "Hi — I'm the Inflect Hub Discovery Agent. You're here from the Custom AI Platforms section. Tell me about your business and the specific problem you're trying to put a custom AI platform around.",
  "conversational-ai":
    "Hi — I'm the Inflect Hub Discovery Agent. You're here from the Conversational AI section. Tell me about your business and the channel where your customers spend their time.",
  personalisation:
    "Hi — I'm the Inflect Hub Discovery Agent. You're here from the Personalisation Funnels section. Tell me about your business and the moment in your customer journey where guidance breaks down.",
  "multi-modal-content":
    "Hi — I'm the Inflect Hub Discovery Agent. You're here from the Multi-Modal Content section. Tell me about your brand and the content cadence you're trying to maintain.",
};

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(
    () => loadPersisted() ?? [INITIAL_MESSAGE]
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Persist messages whenever they change
  useEffect(() => {
    persist(messages);
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Listen for global open events from CTAs across the site
  useEffect(() => {
    function handleOpen(e: Event) {
      const detail = (e as CustomEvent<{ service?: string | null }>).detail;
      const serviceSlug = detail?.service;
      // If a service opener exists and the current conversation is fresh, seed it
      if (serviceSlug && SERVICE_OPENERS[serviceSlug] && messages.length === 1) {
        setMessages([{ role: "assistant", content: SERVICE_OPENERS[serviceSlug] }]);
      }
      setIsOpen(true);
    }
    window.addEventListener("inflect:open-chat", handleOpen);
    return () => window.removeEventListener("inflect:open-chat", handleOpen);
  }, [messages.length]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Exclude the initial greeting from the API call (it's a UI prompt, not a turn)
    const conversationHistory = messages.slice(1);

    try {
      const reply = await sendMessage(conversationHistory, trimmed);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I'm having trouble connecting right now. Try again, or email frank@inflecthub.com directly and we'll pick up there.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      {/* Chat Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Inflect Hub Discovery Agent"
          style={{
            position: "fixed",
            bottom: "5rem",
            right: "1.5rem",
            width: "min(420px, calc(100vw - 2rem))",
            height: "min(560px, calc(100vh - 8rem))",
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            display: "flex",
            flexDirection: "column",
            zIndex: 999,
            boxShadow:
              "0 20px 60px rgba(0, 0, 0, 0.5), 0 4px 20px rgba(233, 69, 96, 0.15)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1rem 1.25rem",
              borderBottom: "1px solid var(--border)",
              background: "var(--bg-tertiary)",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#22c55e",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  color: "var(--text-primary)",
                }}
              >
                Inflect Hub · Discovery Agent
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-secondary)",
                fontSize: "1.1rem",
                padding: "0.25rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "4px",
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "85%",
                    padding: "0.625rem 0.875rem",
                    borderRadius:
                      msg.role === "user"
                        ? "16px 16px 4px 16px"
                        : "16px 16px 16px 4px",
                    background:
                      msg.role === "user" ? "#e94560" : "var(--bg-tertiary)",
                    color:
                      msg.role === "user" ? "#ffffff" : "var(--text-primary)",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.875rem",
                    lineHeight: 1.55,
                    wordBreak: "break-word",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    padding: "0.625rem 0.875rem",
                    borderRadius: "16px 16px 16px 4px",
                    background: "var(--bg-tertiary)",
                    color: "var(--text-secondary)",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.875rem",
                    fontStyle: "italic",
                  }}
                >
                  Thinking...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: "0.75rem 1rem",
              borderTop: "1px solid var(--border)",
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
              background: "var(--bg-secondary)",
              flexShrink: 0,
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tell me about your business..."
              disabled={isLoading}
              aria-label="Chat message input"
              style={{
                flex: 1,
                padding: "0.5rem 0.75rem",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: "var(--bg-tertiary)",
                color: "var(--text-primary)",
                fontFamily: "var(--font-body)",
                fontSize: "0.875rem",
                outline: "none",
              }}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                border: "none",
                background:
                  isLoading || !input.trim() ? "var(--bg-tertiary)" : "#e94560",
                color:
                  isLoading || !input.trim()
                    ? "var(--text-muted)"
                    : "#ffffff",
                fontFamily: "var(--font-body)",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
                flexShrink: 0,
              }}
            >
              Send
            </button>
          </div>

          <div
            style={{
              padding: "0.4rem 1rem",
              textAlign: "center",
              borderTop: "1px solid var(--border)",
              background: "var(--bg-secondary)",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: "0.7rem",
                color: "var(--text-muted)",
                fontFamily: "var(--font-body)",
              }}
            >
              Inflect Hub · Powered by Gemini
            </span>
          </div>
        </div>
      )}

      {/* Floating Toggle */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close chat" : "Open Inflect Hub Discovery Agent"}
        aria-expanded={isOpen}
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          border: "none",
          background: "#e94560",
          color: "#ffffff",
          fontSize: "1.4rem",
          cursor: "pointer",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(233, 69, 96, 0.5)",
        }}
      >
        <span style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}>
          {isOpen ? "+" : "💬"}
        </span>
      </button>
    </>
  );
}
```

- [ ] **Step 4: Verify build passes**

Run: `npm run build`
Expected: completes clean.

- [ ] **Step 5: Smoke-test discovery agent end-to-end**

Ensure `.env` has `GEMINI_API_KEY` set (it should from earlier setup).

Run: `npm run dev`. Visit `http://localhost:4321/`. Confirm:
- The floating chat button appears bottom-right on every page
- Click the "Start a project" button in nav: chat panel opens with default greeting
- Header reads "Inflect Hub · Discovery Agent"
- Send a test message ("I run a small e-commerce business"). The agent replies in-character (drills into friction, doesn't lecture).
- Open `/services` and click "Start a project →" on the Conversational AI section. Confirm: panel opens with the service-specific opener ("You're here from the Conversational AI section...")
- Close the panel, reload page — conversation state persists (localStorage)

Stop dev server.

- [ ] **Step 6: Commit**

```bash
git add src/pages/api/chat.ts src/components/ChatBot.tsx
git commit -m "feat: replace chatbot with Inflect Hub Discovery Agent (new prompt + entry-point events)"
```

---

## Task 14: Add lead capture endpoint + UI

**Files:**
- Create: `src/pages/api/lead.ts`
- Modify: `src/components/ChatBot.tsx` (add capture-confirm step)

**Interfaces:**
- Produces: `POST /api/lead` accepting `{ email: string, whatsapp?: string, summary: string }`. Returns `{ ok: true }` on success, `{ ok: false, error: string }` on failure.
- Consumes: `RESEND_API_KEY` env var (Vercel production); fallback to logging if missing in dev.

- [ ] **Step 1: Create `src/pages/api/lead.ts`**

```typescript
import type { APIRoute } from "astro";
import { Resend } from "resend";

export const prerender = false;

const RECIPIENT = "enendufrank24@gmail.com";
const FROM = "Inflect Hub <onboarding@resend.dev>"; // TODO change to frank@inflecthub.com after DNS

export const POST: APIRoute = async ({ request }) => {
  let body: { email?: string; whatsapp?: string; summary?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ ok: false, error: "Invalid JSON" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { email, whatsapp, summary } = body;

  if (!email || !summary) {
    return new Response(
      JSON.stringify({ ok: false, error: "email and summary are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const apiKey = import.meta.env.RESEND_API_KEY;
  if (!apiKey) {
    // Dev fallback — log to console, don't actually email
    console.warn("[lead] RESEND_API_KEY not set; lead captured to console only:");
    console.warn({ email, whatsapp, summary });
    return new Response(
      JSON.stringify({ ok: true, dev: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  const resend = new Resend(apiKey);
  const subject = `New Inflect Hub lead: ${email}`;
  const text = [
    `New discovery-agent lead from inflecthub.com`,
    ``,
    `From: ${email}`,
    `WhatsApp: ${whatsapp || "(not provided)"}`,
    ``,
    `Summary:`,
    summary,
    ``,
    `Reply directly to this email — it routes to the prospect.`,
  ].join("\n");

  try {
    const result = await resend.emails.send({
      from: FROM,
      to: RECIPIENT,
      replyTo: email,
      subject,
      text,
    });
    if (result.error) {
      console.error("[lead] resend error:", result.error);
      return new Response(
        JSON.stringify({ ok: false, error: "Failed to send" }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({ ok: true, id: result.data?.id }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[lead] unexpected error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: "Internal error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
```

- [ ] **Step 2: Add capture-confirm step to `src/components/ChatBot.tsx`**

Add the following at the top of the file (after the imports), before the `INITIAL_MESSAGE` const:

```typescript
type LeadCapture = {
  email: string;
  whatsapp: string;
  summary: string;
};
```

Add the following state inside the component, after the existing useState declarations:

```typescript
const [showCapture, setShowCapture] = useState(false);
const [lead, setLead] = useState<LeadCapture>({ email: "", whatsapp: "", summary: "" });
const [captureStatus, setCaptureStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
```

Replace the existing `handleSend` function with this version, which detects when the assistant has clearly recommended a service and prompts the user to capture their lead:

```typescript
async function handleSend() {
  const trimmed = input.trim();
  if (!trimmed || isLoading) return;

  const userMessage: ChatMessage = { role: "user", content: trimmed };
  setMessages((prev) => [...prev, userMessage]);
  setInput("");
  setIsLoading(true);

  const conversationHistory = messages.slice(1);

  try {
    const reply = await sendMessage(conversationHistory, trimmed);
    setMessages((prev) => [...prev, { role: "assistant", content: reply }]);

    // If the reply mentions capturing the lead (signal phrase from the prompt), surface the capture UI
    const lower = reply.toLowerCase();
    if (
      lower.includes("send frank a short summary") ||
      lower.includes("what email should he reply to") ||
      lower.includes("frank will be in touch")
    ) {
      // Auto-summarise the conversation for the lead
      const summary = messages
        .filter((m) => m.role === "user")
        .map((m) => m.content)
        .join("\n\n");
      setLead((prev) => ({ ...prev, summary }));
      setShowCapture(true);
    }
  } catch {
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content:
          "Sorry, I'm having trouble connecting right now. Try again, or email frank@inflecthub.com directly and we'll pick up there.",
      },
    ]);
  } finally {
    setIsLoading(false);
  }
}

async function handleCaptureSubmit() {
  if (!lead.email.trim() || !lead.summary.trim()) return;
  setCaptureStatus("sending");
  try {
    const res = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
    });
    if (!res.ok) {
      setCaptureStatus("error");
      return;
    }
    setCaptureStatus("sent");
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "Sent. Frank will be in touch within one business day.",
      },
    ]);
    setTimeout(() => setShowCapture(false), 1500);
  } catch {
    setCaptureStatus("error");
  }
}
```

Add the capture-form UI inside the dialog div, just before the closing `</div>` of the chat panel (right after the footer "Powered by Gemini" block). Wrap it in a conditional:

```tsx
{showCapture && (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: "var(--bg-secondary)",
      padding: "1.25rem",
      display: "flex",
      flexDirection: "column",
      gap: "0.75rem",
      overflowY: "auto",
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <h3 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "1rem" }}>
        Send Frank a summary
      </h3>
      <button
        onClick={() => setShowCapture(false)}
        aria-label="Cancel"
        style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
      >
        ✕
      </button>
    </div>

    <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
      Email (required)
      <input
        type="email"
        value={lead.email}
        onChange={(e) => setLead({ ...lead, email: e.target.value })}
        required
        style={{
          width: "100%",
          marginTop: "0.25rem",
          padding: "0.5rem",
          background: "var(--bg-tertiary)",
          color: "var(--text-primary)",
          border: "1px solid var(--border)",
          borderRadius: "6px",
          fontSize: "0.875rem",
        }}
      />
    </label>

    <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
      WhatsApp (optional)
      <input
        type="tel"
        value={lead.whatsapp}
        onChange={(e) => setLead({ ...lead, whatsapp: e.target.value })}
        style={{
          width: "100%",
          marginTop: "0.25rem",
          padding: "0.5rem",
          background: "var(--bg-tertiary)",
          color: "var(--text-primary)",
          border: "1px solid var(--border)",
          borderRadius: "6px",
          fontSize: "0.875rem",
        }}
      />
    </label>

    <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", flex: 1 }}>
      Summary (editable)
      <textarea
        value={lead.summary}
        onChange={(e) => setLead({ ...lead, summary: e.target.value })}
        rows={6}
        style={{
          width: "100%",
          marginTop: "0.25rem",
          padding: "0.5rem",
          background: "var(--bg-tertiary)",
          color: "var(--text-primary)",
          border: "1px solid var(--border)",
          borderRadius: "6px",
          fontSize: "0.875rem",
          fontFamily: "var(--font-body)",
          resize: "vertical",
        }}
      />
    </label>

    <button
      onClick={handleCaptureSubmit}
      disabled={!lead.email.trim() || !lead.summary.trim() || captureStatus === "sending"}
      style={{
        padding: "0.625rem 1rem",
        background: "#e94560",
        color: "#ffffff",
        border: "none",
        borderRadius: "6px",
        fontSize: "0.875rem",
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {captureStatus === "sending"
        ? "Sending..."
        : captureStatus === "sent"
        ? "Sent ✓"
        : captureStatus === "error"
        ? "Try again"
        : "Send to Frank"}
    </button>
    {captureStatus === "error" && (
      <p style={{ fontSize: "0.75rem", color: "#e94560", margin: 0 }}>
        Couldn't send. Email frank@inflecthub.com directly.
      </p>
    )}
  </div>
)}
```

- [ ] **Step 3: Verify build passes**

Run: `npm run build`
Expected: completes clean.

- [ ] **Step 4: Smoke-test lead capture end-to-end**

Run: `npm run dev`. Open chatbot, have a conversation, and observe — when the assistant signals readiness to capture (e.g. says "send Frank a short summary"), the capture form appears.

Test the form:
- Fill email + summary; click Send. Expected: form shows "Sent ✓", chat shows "Sent. Frank will be in touch...", form auto-closes.
- In dev (no `RESEND_API_KEY` locally), check the terminal — should log `[lead] RESEND_API_KEY not set; lead captured to console only:` followed by the lead details.

If you want to test the actual email send, set `RESEND_API_KEY` in `.env`:

```
RESEND_API_KEY=your_resend_test_key
```

Restart `npm run dev`. Test again. Confirm an email arrives in `enendufrank24@gmail.com`.

Stop dev server.

- [ ] **Step 5: Commit**

```bash
git add src/pages/api/lead.ts src/components/ChatBot.tsx
git commit -m "feat: add Resend lead capture endpoint + chatbot confirm-step UI"
```

---

## Task 15: Add visual assets (favicon, OG card, placeholder images)

**Files:**
- Create: `public/favicon.svg`
- Create: `public/og-card.svg`
- Create: `public/images/clients/{ogahq,advance-purity,lumicos,fairlens,casereviewer}.svg`
- Create: `public/images/work/{ogahq,advance-purity,lumicos}.svg`
- Modify: `src/components/SEO.astro` (update default OG image reference)

- [ ] **Step 1: Create `public/favicon.svg` (Inflect Hub iH monogram)**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#0a0a0a"/>
  <text
    x="50%"
    y="50%"
    text-anchor="middle"
    dominant-baseline="central"
    fill="#e94560"
    font-family="Georgia, serif"
    font-weight="700"
    font-size="36"
  >iH</text>
</svg>
```

- [ ] **Step 2: Create `public/og-card.svg` (1200×630 OG card)**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0a0a0a"/>
  <text
    x="50%"
    y="42%"
    text-anchor="middle"
    fill="#ffffff"
    font-family="Georgia, serif"
    font-weight="700"
    font-size="84"
  >Inflect Hub</text>
  <text
    x="50%"
    y="58%"
    text-anchor="middle"
    fill="#e94560"
    font-family="Helvetica, Arial, sans-serif"
    font-weight="500"
    font-size="32"
  >We transform traditional businesses with AI.</text>
</svg>
```

- [ ] **Step 3: Create placeholder client logos**

For each of `ogahq`, `advance-purity`, `lumicos`, `fairlens`, `casereviewer`, create `public/images/clients/<id>.svg` as a simple wordmark placeholder. Example for `ogahq.svg` (replicate the pattern for each — change the text and fill colour as needed):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 48">
  <text
    x="50%"
    y="50%"
    text-anchor="middle"
    dominant-baseline="central"
    fill="currentColor"
    font-family="Helvetica, Arial, sans-serif"
    font-weight="700"
    font-size="20"
  >OgaHQ</text>
</svg>
```

For each subsequent file, change the `<text>` content:
- `advance-purity.svg` → `Advance Purity`
- `lumicos.svg` → `Lumicos`
- `fairlens.svg` → `FairLens`
- `casereviewer.svg` → `CaseReviewer`

- [ ] **Step 4: Create placeholder work hero images**

For each of `ogahq`, `advance-purity`, `lumicos`, create `public/images/work/<id>.svg`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450">
  <rect width="800" height="450" fill="#1a1a1a"/>
  <text
    x="50%"
    y="50%"
    text-anchor="middle"
    dominant-baseline="central"
    fill="#e94560"
    font-family="Georgia, serif"
    font-weight="700"
    font-size="48"
  >OgaHQ</text>
</svg>
```

Replicate for `advance-purity.svg` ("Advance Purity") and `lumicos.svg` ("Lumicos").

- [ ] **Step 5: Update `src/components/SEO.astro` to use the new OG card**

Read `src/components/SEO.astro`. Find the default OG image reference (likely `/og.png` or `/og-image.jpg` or similar). Update to `/og-card.svg`. If the file has a default value baked into a prop, change the default. If no SEO component exists, skip this step.

- [ ] **Step 6: Update `src/layouts/BaseLayout.astro` head for favicon**

In `src/layouts/BaseLayout.astro`, find the existing `<link rel="icon">` line and replace its href to `/favicon.svg`:

```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
```

If no favicon link exists in the layout, add the line above inside the `<head>`.

- [ ] **Step 7: Verify build passes**

Run: `npm run build`
Expected: completes clean.

- [ ] **Step 8: Smoke-test assets**

Run: `npm run dev`. Visit:
- http://localhost:4321/favicon.svg — should render the iH monogram
- http://localhost:4321/og-card.svg — should render the wordmark + tagline
- http://localhost:4321/images/clients/ogahq.svg — should render placeholder logo
- http://localhost:4321/images/work/ogahq.svg — should render placeholder hero

Open the homepage `/`. Browser tab favicon should be the iH monogram.

Stop dev server.

- [ ] **Step 9: Commit**

```bash
git add public/favicon.svg public/og-card.svg public/images/ src/components/SEO.astro src/layouts/BaseLayout.astro
git commit -m "feat: add Inflect Hub favicon, OG card, and placeholder client/work imagery"
```

---

## Task 16: Update repo metadata + Astro config

**Files:**
- Modify: `astro.config.mjs`
- Modify: `README.md`
- Modify: `AGENTS.md`
- Modify: `CONTEXT.md`

- [ ] **Step 1: Update `astro.config.mjs` site URL**

Replace `src/../astro.config.mjs`'s `site` URL. The current value is `"https://frankenendu.github.io"`. Leave it on the Vercel staging URL for now; the production swap to `https://inflecthub.com` happens after DNS verification (see spec §13). Update the file to make the placeholder explicit:

```javascript
import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  // TODO: change to "https://inflecthub.com" once DNS + Vercel custom domain are configured
  site: "https://frankenendugithubio.vercel.app",
  output: "server",
  adapter: vercel(),
  integrations: [react(), sitemap()],
  markdown: {
    shikiConfig: {
      theme: "github-dark",
      wrap: true,
    },
  },
});
```

- [ ] **Step 2: Replace `README.md` (fix encoding + retitle)**

The current README is mangled (UTF-16-ish). Replace entirely with:

```markdown
# Inflect Hub

Digital transformation consulting hub. Inflect Hub builds the AI systems that turn slow, manual operations into modern, scalable advantages.

Founder: Frank Enendu — AI Engineer.

## Stack

Astro 5 · React 19 · TypeScript · tsParticles · GSAP · Google Gemini · Resend · Vercel.

## Quick Start

```bash
npm install
npm run dev   # http://localhost:4321
```

`.env` requirements:

```
GEMINI_API_KEY=your_key_here
RESEND_API_KEY=your_resend_key_here   # optional in dev; required for lead-capture in production
```

## Deployment

Vercel auto-deploys on push to `main`. The site is at https://frankenendugithubio.vercel.app (custom domain `inflecthub.com` pending DNS).

## Repository Conventions

This repo follows the Bally's agent-repo standard. See `AGENTS.md` for commands, guardrails, and conventions, and `CONTEXT.md` for deep reference.
```

- [ ] **Step 3: Update `AGENTS.md` for Inflect Hub framing**

In `AGENTS.md`, find any references to "personal portfolio" or "Frank Enendu" as the brand and update to reflect Inflect Hub. Specifically:

- Update the project's identity paragraph from "personal portfolio" → "Inflect Hub digital transformation consulting site"
- Update the contact email reference from `enendufrankc@gmail.com` → `frank@inflecthub.com` (in user-facing text), noting `enendufrank24@gmail.com` is the lead-routing destination
- Add a guardrail line under "Do NOT": `Do NOT flip testimonial.is_draft to false on any case study without a real signed-off client quote.`

Make the edits inline; don't rewrite the whole file.

- [ ] **Step 4: Update `CONTEXT.md` for Inflect Hub framing**

In `CONTEXT.md`, update:
- The architecture overview paragraph from "personal portfolio" → "Inflect Hub consulting hub"
- The site URL references
- The content tiers section — replace the Tier 1/2/3 list with the new Featured (5) / Secondary (4) / Archived (6) classification
- The auth/integrations section — add Resend as a new integration with the same "key never sent to browser" guarantee

Make the edits inline.

- [ ] **Step 5: Verify build passes**

Run: `npm run build`
Expected: completes clean.

- [ ] **Step 6: Commit**

```bash
git add astro.config.mjs README.md AGENTS.md CONTEXT.md
git commit -m "docs: update README, AGENTS.md, CONTEXT.md, and astro.config for Inflect Hub"
```

---

## Task 17: End-to-end smoke test + final verification

**Files:**
- No code changes. Verification + manual checklist completion.

- [ ] **Step 1: Full clean build**

Run: `rm -rf dist .astro && npm run build`
Expected: builds cleanly. Note total route count in output — should include `/`, `/services`, `/about`, `/work`, `/work/<5 featured>`, `/work/<4 secondary>` (cards-only, no page — confirm by checking `dist/work/` listing), `/insights`, `/insights/welcome`. Archived projects (6) should NOT have page directories.

Run: `ls dist/work/`
Expected: directories for the 9 visible projects (5 featured + 4 secondary). No `nova/`, `nhs-chatbot/`, `agent2agent/`, `llm-game-recommender/`, `semantic-segmentation/`, `sharepoint-search/`.

Actually — note: the `[...slug].astro` page in `src/pages/work/` filters by `tier !== "archived"`, so the secondary cards don't get pages either unless explicitly allowed. Re-check: if secondary projects should be reachable via direct URL but not via the gallery card, update the filter in `src/pages/work/[...slug].astro` to include both `featured` and `secondary`. Current task plan: secondary cards are intentionally "no detail page" per spec §9.1 ("4 compact cards — no individual detail pages; each card is the full story"). So the filter is correct.

- [ ] **Step 2: Full dev smoke test**

Run: `npm run dev`. In a browser, walk through every route:

- [ ] **Homepage `/`** — hero, trust strip, services grid, featured work (3 cards), founder strip, CTA strip
- [ ] **Services `/services`** — page hero, 4 sticky pill anchors work, 4 service sections render, each section's "Start a project →" opens chatbot with the service-specific opener
- [ ] **Work `/work`** — filters: Type All/Client/Built; Service All/four. URL params update. Other-work strip shows 4 secondary cards. Archived not visible.
- [ ] **Case studies** — `/work/ogahq`, `/work/advance-purity`, `/work/lumicos`, `/work/fairlens`, `/work/casereviewer` all render with hero, at-a-glance, body, outcome bullets, testimonial (DRAFT marker visible on the 5 with placeholder testimonials), outbound link
- [ ] **About `/about`** — founder story, principles, CTA
- [ ] **Insights `/insights`** — list page renders; `/insights/welcome` opens the welcome post
- [ ] **Nav** — Inflect Hub wordmark in top-left, 4 nav links, theme toggle, Start-a-project CTA
- [ ] **Footer** — Inflect Hub wordmark + tagline, contact email `frank@inflecthub.com`, social links, copyright + HTML5 UP attribution
- [ ] **Theme toggle** — switches dark ↔ light; persists across pages
- [ ] **Chatbot** — opens from: nav CTA, hero CTA, every service section CTA, every case study CTA, About CTA, floating button. Each entry point that has `data-service` seeds the service-aware opener. Conversation persists in localStorage across page navigation.
- [ ] **Mobile** — resize to < 768px: nav becomes hamburger, services grid stacks, work grid stacks, footer stacks
- [ ] **404** — visit `/work/nova` (archived) and confirm Astro's 404 page renders

Stop dev server.

- [ ] **Step 3: Lead capture end-to-end test (with real Resend key in `.env`)**

Add `RESEND_API_KEY` to `.env` (use a Resend test key). Run `npm run dev`. Have a conversation in the chatbot that ends with a service recommendation. Capture-form should appear; fill email + summary; submit. Check `enendufrank24@gmail.com` — email should arrive.

Stop dev server. Remove `RESEND_API_KEY` from `.env` if you don't want it locally.

- [ ] **Step 4: Cross-browser quick check**

Open the production build (or dev server) in:
- Chrome desktop
- Safari desktop
- Firefox desktop
- iPhone Safari (or DevTools iOS emulation)
- Android Chrome (or DevTools Pixel emulation)

Confirm the homepage, work gallery, and a single case study render correctly in each.

- [ ] **Step 5: Final commit of any smoke-test fixes**

If the smoke test surfaced any bugs (broken links, typos, layout glitches on mobile), fix them now in a single commit:

```bash
git add -A
git commit -m "fix: smoke-test cleanup pre-launch"
```

If no fixes are needed, skip this step.

- [ ] **Step 6: Push to remote (NOT main)**

```bash
git push origin feat/portfolio-redesign
```

Expected: branch pushed. Vercel will auto-deploy a preview URL for this branch — confirm by opening the Vercel dashboard or checking the deploy webhook in your terminal/email.

- [ ] **Step 7: Pre-launch checklist hand-off**

Confirm with the human (Frank) that the items in spec §13 are tracked:

- [ ] `inflecthub.com` registered + DNS pointed to Vercel
- [ ] `frank@inflecthub.com` mailbox set up
- [ ] Resend account + domain DNS verified
- [ ] `RESEND_API_KEY` set in Vercel production env vars
- [ ] Real client logos sourced (5 — replacing placeholder SVGs in `public/images/clients/`)
- [ ] Real case-study hero images for OgaHQ, Advance Purity, Lumicos
- [ ] **Every `[DRAFT]` and `[PLACEHOLDER]` in the 3 client case studies replaced with real specifics**
- [ ] **Signed-off testimonial quotes from OgaHQ, Advance Purity, Lumicos, FairLens, CaseReviewer collected and substituted; `testimonial.is_draft` flipped to `false` only after a real quote is in place**

**DO NOT merge `feat/portfolio-redesign` to `main` until every item above is complete. Merging to `main` deploys to production.**

---

## Self-review notes

- All 17 tasks have explicit file paths, full file contents where rewriting, exact bash commands, and named verification steps.
- No TBD/TODO/placeholder strings in the plan itself. The `[DRAFT]` and `[PLACEHOLDER]` markers in case-study content are intentional content that the launch gate (Task 17 Step 7 + spec §13) explicitly blocks on.
- Each task ends with a single conventional commit. Frequent commits per the skill.
- Tests not introduced; spec explicitly out-of-scope. Verification = build + named manual smoke checks at every task.
- Build is deliberately broken between Tasks 1–3 (schema migration sequence). The plan calls this out at the relevant steps.
- Tasks 13 and 14 both touch `src/components/ChatBot.tsx`. Task 13 establishes the new persona + entry-point listener; Task 14 adds the capture form. Treated as two commits for reviewability.
- Type consistency: `ServiceSlug` exported from constants in Task 1, consumed in schema enum (Task 2) and ProjectLayout (Task 8). `inflect:open-chat` event consistently dispatched from `data-open-chat` clicks (Task 6 script) and listened for in ChatBot (Task 13). Lead capture POST contract `{ email, whatsapp?, summary }` consistently used in Task 14 endpoint and form.
