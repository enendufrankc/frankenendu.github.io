# Inflect Hub — Consulting Hub Pivot (Design Spec)

**Date:** 2026-06-22
**Author:** Frank Enendu (with Claude Code, brainstormed)
**Status:** Approved design; awaiting implementation plan
**Branch:** `feat/portfolio-redesign` (continues; not a new branch)
**Supersedes:** `docs/superpowers/specs/2026-04-10-portfolio-redesign-design.md` (engineer-portfolio framing)

---

## 1. Context

The existing site (Astro 5 + React + Vercel, on `feat/portfolio-redesign`) was built as Frank Enendu's personal AI Engineer portfolio. It is functionally complete and ready to deploy: a particle-network hero, 12 project case studies, a Gemini-powered Q&A chatbot, blog, about page, and dark/light theming.

This spec pivots the site from **AI Engineer personal portfolio** to **Inflect Hub — a digital transformation consulting hub** that takes traditional businesses and transforms them with AI. Frank moves from "the engineer" to "founder of the consultancy." Existing customers and built-by-us products become the credibility spine.

The pivot is "consultancy-first, Frank as the founder" — not a two-track split, not a portfolio with a consulting tab. The personal AI Engineer identity dissolves into the founder story on `/about`.

## 2. Goals

- Reposition the homepage and IA so a prospect lands on a consulting site, not a portfolio.
- Introduce Inflect Hub as a brand: name, wordmark, tagline, voice, footer mark.
- Surface a clear four-service spine demonstrated by named, real customer engagements.
- Convert the existing chatbot from personal Q&A into a discovery agent that qualifies prospects and captures leads.
- Reuse the existing Astro infrastructure (layouts, theme, content collections, chatbot wiring) — don't rebuild what already works.
- Keep all pre-launch fabrication risk explicit: DRAFT engagement narratives and PLACEHOLDER outcome metrics must be replaced before going live.

## 3. Non-goals

- Not a visual redesign. The existing design system (Playfair + Inter, coral accent, dark default, particle hero) carries over unchanged.
- Not a fresh codebase. Approach B (IA restructure) was chosen over Approach C (full rebuild).
- Not building per-vertical landing pages, pricing pages, Calendly integration, CRM integration, multi-language UI, A/B testing, or analytics beyond Vercel built-ins. See §13.
- Not committing fabricated testimonials. Section 9 mechanics ensure DRAFT content can be previewed but cannot be confused for real client speech.

## 4. Brand

| Attribute | Value |
|---|---|
| Name | **Inflect Hub** |
| Domain | **inflecthub.com** (must be registered + DNS configured — pre-launch task) |
| Contact email | **frank@inflecthub.com** (display address; actual email infra to be set up later) |
| Lead routing | All discovery agent leads sent to **enendufrank24@gmail.com** until inflecthub.com mailbox lands |
| Tagline (homepage H1) | "We transform traditional businesses with AI." |
| One-line elevator | "Inflect Hub builds the AI systems that turn slow, manual operations into modern, scalable advantages." |
| Voice | Concrete, named, active. British English. No agency clichés (no "unlock", "end-to-end", "thought leader", "strategic partner"). |

## 5. Information Architecture

**Top nav (left → right):** `Inflect Hub` (brand mark, links home) · `Services` · `Work` · `About` · `Insights` · `Theme toggle` · `Start a project` (primary CTA — opens chatbot)

**Route map:**

| Route | Purpose | Status |
|---|---|---|
| `/` | Hero, services, featured work, founder strip, chatbot CTA | Existing, rebuilt |
| `/services` | Detailed page-per-service (problem → approach → tech → example client → CTA) | **New route** |
| `/services#<service-slug>` | In-page anchors for each of the 4 services | New |
| `/work` | Filterable gallery: client engagements / built products | Repurposes `/projects` |
| `/work/[id]` | Individual case study | Repurposes `/projects/[id]` |
| `/about` | Founder story (Frank → Inflect Hub), credentials, principles | Existing, rewritten |
| `/insights` | Thought-leadership posts | **Renamed** from `/blog` |
| `/insights/[slug]` | Post detail | Renamed from `/blog/[slug]` |
| `/api/chat` | Discovery agent endpoint | Existing, re-prompted |
| `/api/lead` | Resend lead-capture endpoint | **New** |

**Removed:** nothing structural. Only renames (`projects → work` route, `blog → insights` route + content collection rename).

## 6. Homepage (`/`) Structure

Section-by-section, top to bottom:

### 6.1 Hero
- Particle network background (unchanged tsParticles component).
- Eyebrow (small caps): `Digital Transformation · AI Consulting`
- H1 (Playfair Display): **"We transform traditional businesses with AI."**
- Sub (Inter): *"Inflect Hub builds the AI systems that turn slow, manual operations into modern, scalable advantages. From storefront chatbots to multi-agent platforms — shipped, in production, with real customers."*
- CTAs: **Start a project** (primary — opens chatbot) · **See our work** (ghost — anchors to featured work)

### 6.2 Trusted-by strip
- Single row, 5 client logos in monochrome (hover → full colour): OgaHQ, Advance Purity, Lumicos, FairLens, CaseReviewer
- Caption above: `Trusted by ambitious operators in retail, beauty, evaluation, and legal-tech.`

### 6.3 Services overview (4-card grid, 2×2 desktop, stacked mobile)

Cards in this order (by demonstrated depth of proof):

1. **Custom AI Platforms** — *"End-to-end AI products for industries with regulatory and accuracy bars no off-the-shelf tool clears."*
2. **Conversational AI** — *"Multilingual assistants and chatbots that handle real customer load on the channels your users actually use."*
3. **Personalisation Funnels** — *"AI advisors and recommenders that turn flat product grids into guided buying journeys."*
4. **Multi-Modal Content** — *"Production-grade brand imagery, social posts, and campaigns generated on-brand at agency-quitting cadence."*

Each card: Lucide icon · service name · one-sentence promise · "See how →" anchor link to `/services#<slug>`.

### 6.4 Featured work (3 cards)
- Three picks spanning service categories: **FairLens** (Custom Platforms), **OgaHQ** (Conversational AI), **Advance Purity** (Personalisation).
- Card composition: 16:9 image · client/product name · service tag · one-line outcome · `Read case study →`.
- Below: text link `See all 5 case studies → /work`.

### 6.5 Founder strip
- Photo of Frank (reuse existing about-page asset).
- Paragraph: *"Inflect Hub is led by Frank Enendu, an AI engineer with a decade of building production AI systems at Bally's, the NHS, and across consulting engagements in retail, beauty, and legal-tech. Lagos → Manchester → wherever the work is."*
- CTA: `More about the team → /about`.

### 6.6 Chatbot CTA strip
- Full-width band with accent colour.
- Headline: **"Tell us about your business. We'll tell you which transformation fits."**
- Paragraph explaining the discovery agent works in 3 minutes, no calendar booking required.
- Button: **Start the conversation** → opens chatbot.

### 6.7 Footer
- Brand mark · short tagline · column of nav links · social (LinkedIn, GitHub) · HTML5 UP "Massively" attribution (preserved per CCA 3.0 — non-negotiable).

### Deliberately NOT on the homepage
- Long bio (lives on `/about`)
- All 17 project entries (collapsed to 5 featured cards + 4 secondary on `/work`)
- Testimonial quotes (live on individual `/work/[id]` pages with full context)
- Pricing (discovery agent handles qualification)

## 7. Content Model

The existing `src/content/projects/` collection is extended with new fields. **No rename** of the collection (the directory stays `projects/` to avoid migration churn); only the route serving it changes to `/work`.

### 7.1 New / changed frontmatter fields

```yaml
# Universal (existing, retained)
title: "OgaHQ"                    # display name — client name OR product name
description: "..."                # one-line subtitle
tech: ["..."]                     # stack array
image: "/images/work/ogahq.jpg"

# New / repurposed
type: "client" | "product"        # NEW — drives /work filter and ProjectLayout variant
service: "conversational-ai" |    # NEW — the service this demonstrates
         "personalisation" |
         "multi-modal-content" |
         "custom-platforms"
status: "featured" | "secondary" | "archived"   # replaces existing `tier`
testimonial:                      # NEW, optional
  quote: "..."
  author: "..."
  role: "..."
  is_draft: true                  # build-time warning if true
outcome_bullets:                  # NEW — 2-3 short impact statements
  - "70% reduction in first-response time"
industry: "African Retail SaaS"   # NEW — shown in case-study at-a-glance strip
live_url: "https://ogahq.app/"    # NEW — outbound link from case study + work card
```

The Zod schema in `src/content/config.ts` is updated to validate these fields. Existing fields (`title`, `description`, `domain`, `tech`, `github`, `demo`, `article`, `image`, `featured`, `order`) are preserved where used. `tier` is retired in favour of `status`; `domain` is retired in favour of `service` + `industry`.

### 7.2 Disposition of all 15 entries (12 existing + 3 new)

**Featured (5)** — full case study pages, appear on homepage + `/work`:
- `ogahq.md` (NEW) — Conversational AI
- `advance-purity.md` (NEW) — Personalisation
- `lumicos.md` (NEW) — Multi-Modal Content
- `fairlens.md` (existing) — Custom Platforms (recategorised `type: product`)
- `casereviewer.md` (existing) — Custom Platforms (recategorised `type: product`)

**Secondary (4)** — listed on `/work` in a quieter "Other work we've built" section; minimal card, no detail page:
- `safeai.md` — Custom Platforms / Security
- `aigen.md` — Custom Platforms / Agents
- `personal-copilot.md` — Conversational AI
- `multi-modal-content.md` — Multi-Modal Content

**Archived (6)** — markdown stays in repo; `status: archived` excludes from build and sitemap:
- `nova.md`, `sharepoint-search.md`, `nhs-chatbot.md`, `agent2agent.md`, `llm-game-recommender.md`, `semantic-segmentation.md`

### 7.3 DRAFT engagement narratives (must be replaced before launch)

These are placeholder narratives for OgaHQ, Advance Purity, and Lumicos. Frank delivered real work for each, but specific outcome metrics and testimonial quotes are not yet collected. **Spec contract: nothing in this section ships to production until Frank substitutes verified engagement details and signed-off testimonial quotes.**

#### OgaHQ — Conversational AI [DRAFT]
- **Context:** All-in-one operating system for African retail / wholesale / kiosk merchants (Nigeria, Kenya, South Africa).
- **What we built:** The WhatsApp AI assistant subsystem inside OgaHQ. Multilingual (English + Nigerian Pidgin), command-driven: merchants ask the bot to update stock, check sales, send invoices, or fetch customer order history — all from WhatsApp, with offline-aware fallback.
- **Outcome [PLACEHOLDER]:** Adopted by [X]% of OgaHQ merchants in the first 90 days; merchants reclaim ~10 hours/week on admin work.
- **Live product link:** https://ogahq.app/

#### Advance Purity Cosmetics — Personalisation [DRAFT]
- **Context:** D2C cosmetics store; flat product grid with no guided buying journey.
- **What we built:** An interactive AI skincare advisor on the storefront. Quiz (skin type, concerns, goals, budget) → personalised routine + bundle recommendation with copy explaining *why* each product fits.
- **Outcome [PLACEHOLDER]:** Quiz funnel converts ~3× the cold product grid; basket size on quiz-led purchases up ~40%.
- **Live product link:** https://advancepurity.com/

#### Lumicos Beauty — Multi-Modal Content [DRAFT]
- **Context:** D2C cosmetics brand needing a constant cadence of fresh product imagery and social content; agency cost was unsustainable.
- **What we built:** A multi-modal AI content pipeline that ingests product specs + brand guidelines and generates on-brand product photography, weekly social posts, and seasonal campaign assets. Brand team reviews and approves before publication.
- **Outcome [PLACEHOLDER]:** Weekly content output up ~5×; content production cost down ~60%; brand team time shifts from creating to curating.
- **Live product link:** https://lumicosbeauty.com/

#### FairLens — Custom Platforms (from existing case study, no change needed)
- AI-powered application review platform for universities, foundations, grant programs. Multi-agent system (Google ADK, 7 specialised agents) evaluates thousands of applications consistently, links every score to evidence, keeps humans accountable for final decisions.
- **Tagline (lifted from live site):** *"Evaluate thousands of applications consistently, link every score to the evidence behind it, and keep humans accountable for every final decision."*
- **Live product link:** https://fairlens.app/

#### CaseReviewer — Custom Platforms (from existing case study, no change needed)
- AI-powered EB-1A visa petition analyzer. Hybrid vector + BM25 search across 1,500+ precedent USCIS decisions, per-criterion analysis with citations, noisy-OR aggregate scoring. Attorneys complete initial petition assessments in minutes vs. days.
- **Live product link:** https://casereviewer.ai/

## 8. Services Page (`/services`)

One scrollable page with four anchored sections.

### 8.1 Page hero (compact, ~30vh)
- H1: *"Four ways we transform a business with AI."*
- Paragraph: *"Every engagement starts with the same question — where is human time being wasted on work AI can do reliably? Then we pick one of four shapes."*
- Sticky pill row with service anchor jump links.

### 8.2 Per-service section template (~80vh each, alternating background tint)

Every section follows the same five-block template:

1. Service name (H2, Playfair)
2. One-line promise (large Inter lead)
3. **The problem we solve** (1 paragraph — concrete, named)
4. **How we approach it** (3-4 methodology bullets, not deliverables)
5. **Typical tech we reach for** (compact stack list)
6. **Where you've seen it** (one card linking to the demonstrating case study)
7. CTA strip: "Start a project →" (opens chatbot pre-scoped to this service)

### 8.3 Section order (matches homepage card order)
1. Custom AI Platforms (`#custom-platforms`) — FairLens
2. Conversational AI (`#conversational-ai`) — OgaHQ
3. Personalisation Funnels (`#personalisation`) — Advance Purity
4. Multi-Modal Content (`#multi-modal-content`) — Lumicos

### 8.4 Bottom anchor
- "Not sure which fits? Talk to the discovery agent." — chatbot CTA.

### Deliberately omitted from `/services`
- Pricing
- "Phase 1, 2, 3" process diagrams
- Team headshots (belongs on `/about`)
- Industry-specific landing pages (premature)

## 9. Work Gallery (`/work`) and Case Study Pages (`/work/[id]`)

### 9.1 `/work` gallery

**Page hero (compact):**
- H1: *"Five businesses. Three industries. One way of working."*
- Paragraph: *"Each case study below shows the problem we walked into, what we built, the stack we used, and the outcome. Filter by the type of work, or the service it demonstrates."*

**Filter bar (sticky):**
- **Type:** All · Client engagement · Built by us
- **Service:** All · Custom Platforms · Conversational AI · Personalisation · Multi-Modal Content
- Filters compose. State stored in URL params (`/work?type=client&service=conversational-ai`).

**Featured grid:**
- 5 large cards (the featured case studies).
- Card composition: 16:9 image · client/product name · service tag · 1-line outcome · `Read case study →`.
- Grid: 3-2 on desktop, 1-column on mobile.

**Other work strip (below divider):**
- Header: *"Other work we've built"*
- Caption: *"Smaller explorations, internal tools, and research projects that didn't grow into client engagements but showed us what's possible."*
- 4 compact cards (SafeAI, AiGen, Personal Copilot, Multi-Modal Content Generator) — no detail pages.

**Bottom CTA:** "Have a transformation in mind? Start a project →" (opens chatbot).

### 9.2 `/work/[id]` — case study page

Existing `ProjectLayout.astro` is the base. Variant logic driven by `type` frontmatter.

**Shared scaffold:**

1. **Hero band** — full-width image · breadcrumb (`Work › <name>`) · client/product name · service tag pill · 1-line subtitle
2. **At-a-glance strip** (4 inline stats):
   - **Type:** Client engagement / Built by us
   - **Industry:** e.g. African Retail SaaS
   - **Tech:** top 3-4 from stack array
   - **Status:** In production / Launched / Pilot complete
3. **Body sections** (H2 labelled, this order):
   - **Context** — the business, the moment they came to us
   - **Problem** — the specific friction we were brought in to remove
   - **Approach** — how we scoped, built, and rolled it out
   - **What we built** — features as bullets with bold leads
   - **Stack** — full tech list (badges)
   - **Outcome** — 2–3 outcome bullets (`outcome_bullets` array)
   - **Testimonial** (if present) — pull quote with author + role; if `is_draft: true`, build logs a warning but page still renders (DRAFT visual marker shown)
4. **Next case study** — large card linking to next/previous in collection
5. **CTA strip** — *"This is the kind of work we do. Tell us what you're trying to transform."* → chatbot

**Variant differences:**

| Block | Client engagement | Built by us |
|---|---|---|
| Hero name | Client name (`OgaHQ`) | Product name (`FairLens`) |
| Hero subtitle | "[Service] for [client industry]" | "Built by Inflect Hub — [one-line pitch]" |
| Context section | The client's business; why they came to us | The market problem; why we built it |
| Testimonial | Client quote (DRAFT until real) | Optional — user quote, press quote, or omit |
| Outbound links | Client website link | Live product link + GitHub if public |

### Deliberately omitted
- Per-case-study image galleries (one hero image is enough)
- Embedded video walkthroughs (none exist; premature)
- Reading-time indicators

## 10. Chatbot — Inflect Hub Discovery Agent

The biggest behavioural change in this pivot. The Astro/Gemini wiring (`api/chat.ts`, `src/lib/chatbot.ts`, React island component) stays; the system prompt, conversation pattern, and lead-capture pipeline change.

### 10.1 Persona & boundaries (encoded in the new system prompt)

- **Persona:** Inflect Hub Discovery Agent. Warm, professional, one question at a time, doesn't lecture, doesn't info-dump, doesn't try to sell.
- **One job:** qualify the prospect well enough to recommend one of the four services, and capture a summary Frank can act on within one business day.
- **Hard boundaries:**
  - Never quote a price, day rate, or fixed timeline.
  - Never promise outcomes — only describe what's been delivered for others.
  - Never invent case studies or claim engagements that aren't in `src/content/projects/`.
  - If a prospect asks for work outside Inflect Hub's services, recommend they look elsewhere.

### 10.2 Conversation shape (typical 5-7 turn flow)

1. Greet → invite context.
2. Drill into the specific friction.
3. Probe urgency and timeline.
4. Optional budget probe (skippable, never block).
5. Recommend a service with one-line reasoning + link to demonstrating case study.
6. Capture the lead: email (required), WhatsApp (optional), and a summary the prospect can edit before send.
7. Confirm summary → send → close with "Frank will be in touch within one business day."

### 10.3 Lead capture pipeline

**Choice: Option A — Resend email.**

- New serverless endpoint `api/lead.ts` calls Resend's API.
- **Send TO:** `enendufrank24@gmail.com` (Frank's real Gmail).
- **Reply-To:** the prospect's submitted email.
- **From:** `frank@inflecthub.com` once DNS is verified. Until then: Resend's default sender (`onboarding@resend.dev`) or a verified alternative domain. Spec acknowledges this as a pre-launch constraint.
- **Env var:** `RESEND_API_KEY` (added to Vercel production).
- **Display in site copy:** `frank@inflecthub.com` everywhere (footer, chatbot fallback, contact references).

### 10.4 UI / surface

- **Existing React island** kept; UI shell rebranded.
- **Entry points** (all open same drawer/modal):
  - `Start a project` nav button (primary CTA, accent colour)
  - Homepage hero `Start a project` button
  - Each `/services` section CTA, pre-scoped to that service (sends initial system message: "Prospect is interested in <service>")
  - Each `/work/[id]` ending CTA
  - Persistent floating button bottom-right (small, dismissable per-session)
- **Conversation persistence:** stored in `localStorage` for 24h; cleared after.
- **Mobile:** full-screen overlay (not drawer).

### 10.5 Error & edge behaviour

- **Gemini timeout** → one retry, then fallback: "I'm having trouble connecting. Email frank@inflecthub.com directly."
- **Rate limit** → same fallback.
- **Mid-conversation abandonment** → no lead sent (only sent on explicit confirm). Conversation resumable from localStorage.
- **Prospect refuses email** → fine. Recommend a service, no nag, no lead captured.
- **`GEMINI_API_KEY` missing in prod** → endpoint returns clear error; UI shows "Discovery agent is offline. Email frank@inflecthub.com." (guardrail; should never ship missing).

### Deliberately NOT in v1
- No Calendly / scheduling integration
- No CRM (leads land in Gmail; triage there)
- No conversation transcripts stored server-side (privacy + simplicity)
- No multi-language site shell (chatbot understands English; site is English-only)
- No auto-generated proposals or quotes (humans only, for trust)

## 11. Visual Identity

The existing design system carries; only brand-specific surfaces change.

### 11.1 Keep unchanged
- Colour palette: dark `#0a0a0a` / light `#ffffff` / accent `#e94560`
- Typography: Playfair Display 700 (headings) + Inter 400/500 (body) + JetBrains Mono (code)
- Particle network hero (tsParticles)
- Theme toggle, GSAP scroll animations, `prefers-reduced-motion` respect

### 11.2 Brand mark (`Inflect Hub` wordmark only for v1)
- Wordmark set in Playfair Display, lowercase or sentence case, in `--text` colour.
- No custom icon. Wordmark scales; ships today; doesn't need a designer.
- Variants needed: header, footer, favicon (`iH` monogram SVG → ICO + PNG 16/32/192/512), single static OG card (1200×630).

### 11.3 Service icons
- Lucide React icons (MIT, single-line stroke, consistent with the typographic feel).
- Custom AI Platforms → `Layers` (or `Boxes`)
- Conversational AI → `MessagesSquare`
- Personalisation Funnels → `Wand2` (or `Sparkles`)
- Multi-Modal Content → `Image` (or `Palette`)
- Render: accent colour, 32px, ghost stroke.

### 11.4 Client logos
- Five logos in a row, monochrome (`--text-muted`) by default, full colour on hover.
- Sourced from each client's public site (OgaHQ, Advance Purity, Lumicos, FairLens, CaseReviewer); SVG preferred, PNG with transparency otherwise.
- Saved to `public/images/clients/`.
- **Pre-launch task:** collect or recreate as plain wordmarks if no usable asset.

### 11.5 Case study hero imagery
- One 16:9 image per featured case study (5), in `public/images/work/`.
- Client engagements: live-product screenshot showing the Inflect Hub-built feature, lightly annotated if useful.
- Built products: existing project SVGs in repo (FairLens, CaseReviewer).
- Secondary cards: reuse existing SVG placeholders; no new imagery required.

### 11.6 Voice & copy style (applied everywhere)
- Concrete over abstract.
- Active over passive.
- Named over general (always name the client, channel, metric).
- No agency clichés (no "unlock", "end-to-end", "thought leader", "strategic partner", "transform your journey").
- British English.

### Deliberately NOT in v1
- Commissioned logo, custom illustrations, per-service brand colours, alternate logo files, dynamic per-page OG cards.

## 12. Migration Plan (file-level changes)

### 12.1 New files
- `src/pages/services.astro`
- `src/content/projects/ogahq.md`
- `src/content/projects/advance-purity.md`
- `src/content/projects/lumicos.md`
- `src/pages/api/lead.ts` (Resend lead capture)
- `public/images/clients/{ogahq,advance-purity,lumicos,fairlens,casereviewer}.{svg,png}`
- `public/images/work/{ogahq,advance-purity,lumicos}.jpg`
- `public/og-card.png` (1200×630)
- `public/favicon.svg` + size variants

### 12.2 Renamed
- `src/content/blog/` → `src/content/insights/`
- `src/pages/blog/` → `src/pages/insights/`
- `src/pages/projects/` → `src/pages/work/`
- `src/layouts/BlogLayout.astro` → `src/layouts/InsightsLayout.astro`

### 12.3 Modified
- `src/content/config.ts` — extend `projects` schema with `type`, `service`, `testimonial`, `outcome_bullets`, `status`
- `src/content/projects/fairlens.md`, `casereviewer.md` — recategorise as `type: product`, add DRAFT testimonial blocks
- `src/content/projects/{safeai,aigen,personal-copilot,multi-modal-content}.md` — set `status: secondary`
- `src/content/projects/{nova,sharepoint-search,nhs-chatbot,agent2agent,llm-game-recommender,semantic-segmentation}.md` — set `status: archived`
- `src/pages/index.astro` — rebuild per §6
- `src/pages/about.astro` — rewrite as founder story
- `src/layouts/BaseLayout.astro` — new nav, brand mark, primary CTA, footer
- `src/layouts/ProjectLayout.astro` — variant logic per §9.2
- `src/lib/constants.ts` — site title, description, social handles, contact email
- `src/components/Chatbot.tsx` (or equivalent) — rebrand UI, new system prompt wiring, lead-capture confirm step
- `api/chat.ts` — replace system prompt with the Inflect Hub Discovery Agent prompt
- `astro.config.mjs` — `site` URL → `https://inflecthub.com` once DNS lands (staging stays Vercel-app URL until cutover)
- `README.md` — repair encoding + retitle as Inflect Hub
- `AGENTS.md`, `CONTEXT.md` — update repo context to reflect Inflect Hub framing
- `package.json` — add `resend` dependency

### 12.4 Deleted
- None. Archived markdown stays; old HTML5 UP assets were already removed in commit `cdbdfb0`.

## 13. Pre-Launch Checklist (human-only tasks, not code)

- [ ] Register `inflecthub.com` (availability not yet verified by the AI)
- [ ] Set up DNS + Vercel custom domain pointing inflecthub.com → existing Vercel project
- [ ] Set up `frank@inflecthub.com` mailbox (Google Workspace, Fastmail, or equivalent)
- [ ] Create Resend account, add domain inflecthub.com, verify DNS (SPF, DKIM)
- [ ] Add `RESEND_API_KEY` to Vercel project env vars (production scope)
- [ ] Until inflecthub.com DNS lands: configure Resend `from` as `onboarding@resend.dev` or a verified personal domain
- [ ] Collect real client logos (5; see §11.4)
- [ ] Take/source case study hero images for OgaHQ, Advance Purity, Lumicos
- [ ] **Replace every `[DRAFT]` engagement narrative and `[PLACEHOLDER]` outcome metric with real specifics** — spec lists every location
- [ ] Get signed-off testimonial quotes from OgaHQ, Advance Purity, Lumicos before flipping `is_draft: false`
- [ ] Update LinkedIn, GitHub bio links if any change with the rebrand

## 14. Verification (manual — no test suite exists)

- `npm run build` completes clean
- Manual smoke test in `npm run dev`:
  - Every route renders: `/`, `/services`, `/work`, `/work/[id]` (5 featured + 4 secondary cards), `/about`, `/insights`, `/insights/[slug]`
  - Nav works on desktop + mobile
  - Theme toggle persists across pages
  - Chatbot opens from every entry point; completes a full discovery flow end-to-end on staging
  - Lead capture lands a test email in `enendufrank24@gmail.com`
  - All 5 featured case studies have hero image, outcome bullets, testimonial block (DRAFT marker visible while placeholder)
  - All 4 secondary cards link out to GitHub / live where applicable
  - 404 page still works
  - Sitemap rebuilds with new routes; archived projects excluded
- Cross-device: iPhone, Android, desktop Chrome / Safari / Firefox

## 15. Out of Scope (YAGNI guard)

- Per-vertical landing pages (`/cosmetics`, `/african-retail`)
- Pricing page or "starts at $X" disclosure
- Calendly / scheduling integration
- CRM integration (HubSpot, Pipedrive, Notion DB)
- Multi-language site shell
- Per-page dynamic OG cards
- Custom-illustrated service icons
- Commissioned logo / brand mark
- Per-service contact forms or sub-funnels
- Newsletter signup form
- Comments on `/insights` posts (never)
- Auto-quote / proposal generation in chatbot
- Analytics beyond Vercel built-ins (Plausible / PostHog is v2)
- A/B testing infrastructure

## 16. Risks & Open Questions

### 16.1 Risks
- **Fabricated outcome metrics shipping live.** Spec mitigates with explicit `[PLACEHOLDER]` markers and a build-time warning when `is_draft: true`. **Hard rule:** no merge to `main` until every placeholder is substituted with real specifics from Frank.
- **Resend sender-domain delay.** If inflecthub.com DNS isn't ready when we ship, `from` falls back to `onboarding@resend.dev` which looks unprofessional. Mitigation: ship to a private Vercel preview URL first; only flip the production domain after DNS + Resend verification are done.
- **inflecthub.com availability.** Frank named the domain; the AI did not check. Pre-launch task #1.
- **Client consent for naming + logo.** Listing OgaHQ, Advance Purity, Lumicos by name (with logo) on a public consulting site is a credibility play, but each client should ideally sign off on the case study text and logo use. Mitigation: include this in the pre-launch checklist; if any client objects, downgrade to "[Industry] D2C cosmetics brand" framing.

### 16.2 Open questions for implementation
- Where exactly does the existing chatbot React island live in the codebase? (Answer during writing-plans by reading `src/components/`.)
- Does the existing content collection schema use Zod via `src/content/config.ts`, or is it inferred? (Confirm during writing-plans.)
- Does Vercel's domain configuration support previewing inflecthub.com on a sub-domain before flipping? (Vercel preview URLs handle this; no action needed.)

## 17. Approval

Design sections 1–8 approved by Frank Enendu during brainstorming session on 2026-06-22. Spec to be reviewed by Frank before transition to implementation plan (writing-plans skill).
