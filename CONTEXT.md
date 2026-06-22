# CONTEXT.md

Deep reference for humans and agents. `AGENTS.md` is the operational contract; everything that is *not* a command or guardrail lives here.

## Glossary
- **Astro island**: Astro renders mostly static HTML and selectively hydrates specific React components ("islands") in the browser. Used here for the chatbot, theme toggle, and particle hero.
- **Content collection**: Astro's typed markdown collections. Single source of truth for projects and blog posts; queried at build time.
- **Serverless function**: files under `api/*.ts` are deployed by Vercel as standalone HTTP endpoints. Only `api/chat.ts` exists — the Gemini proxy.
- **Tier (project)**: editorial classification for portfolio entries. Tier 1 = full case study; Tier 2 = short case study; Tier 3 = summary card only.

## Architecture
AI-powered personal portfolio. Astro 5 renders most pages statically at build time; React islands hydrate the interactive bits; one serverless function proxies the Gemini chatbot so the API key never leaves the server.

Components:
- `src/pages/`: route entry points — `index`, `projects/[id]`, `blog/[slug]`, `about`.
- `src/layouts/`: shared chrome — `BaseLayout`, `BlogLayout`, `ProjectLayout`.
- `src/components/`: Astro components and React `.tsx` islands (chatbot UI, theme toggle, particle hero).
- `src/content/projects/`: 12 project case studies as markdown with frontmatter.
- `src/content/blog/`: blog posts, initially migrated from Medium.
- `src/lib/chatbot.ts`: client-side chatbot logic — POSTs to `/api/chat`.
- `api/chat.ts`: Vercel serverless function — wraps Gemini, holds the system prompt server-side only.
- `src/styles/global.css`: design tokens (CSS custom properties), theme, typography.
- `public/`: static assets — fonts, images, CV PDF.

## Tech stack
- **Astro 5** (server output, Vercel adapter, sitemap integration).
- **React 19 + TypeScript** for interactive islands.
- **tsParticles** — connected-node hero animation.
- **GSAP + ScrollTrigger** — scroll-driven animations.
- **Google Gemini API** (`@google/generative-ai` SDK) — chatbot LLM via serverless proxy. Model: `gemini-2.0-flash`.
- **CSS custom properties** — no preprocessor, no CSS-in-JS.
- Node ≥ 22.12.

## Design system
- **Colors**: dark mode default; light mode toggle persisted in `localStorage`. Background `#0a0a0a` (dark) / `#ffffff` (light). Accent `#e94560` (coral red) in both modes. Borders and surfaces are a monochrome scale swapped via CSS variables.
- **Typography**: Playfair Display 700 (headings) + Inter 400/500 (body/UI) from Google Fonts. JetBrains Mono for code.
- **Animations**: GSAP scroll-driven sequences, tsParticles hero, Framer Motion inside React islands. All animations respect `prefers-reduced-motion`.

## Auth / integrations model
- **Gemini chatbot** is the only external integration. `GEMINI_API_KEY` is read from `.env` locally and from a Vercel project environment variable in production. The key is **never** sent to the browser — all calls go through `api/chat.ts`.
- The system prompt is a curated ~2000-word professional context document for Frank Enendu; it lives in `api/chat.ts` and is bundled server-side only.

## Content tiers
- **Tier 1** (full case studies, featured on homepage): SafeAI, AiGen, FairLens, CaseReviewer.
- **Tier 2** (shorter case studies): Personal Copilot, Multi-Modal Content Generator, Nova, SharePoint to Azure AI Search.
- **Tier 3** (summary cards only): NHS Performance Chatbot, Agent2Agent, LLM Game Recommender, Semantic Segmentation.
- **Blog**: markdown posts in `src/content/blog/`, initially migrated from Medium.

## Key-file map
- `astro.config.mjs`: Astro config — Vercel adapter, React integration, sitemap, server output.
- `vercel.json`: Vercel build config — framework `astro`, build command, output dir.
- `package.json`: scripts (`dev`, `build`, `preview`), Node engine, deps.
- `api/chat.ts`: Gemini serverless proxy and system prompt.
- `src/styles/global.css`: design tokens and theme.
- `docs/superpowers/specs/2026-04-10-portfolio-redesign-design.md`: source-of-truth design spec for the rebuild.

## CI / deploy
- **Pipeline**: Vercel auto-deploys on push to `main`. No GitLab CI (`.gitlab-ci.yml` is absent — this is a personal GitHub repo, not a Bally's repo).
- **Merging to `main`**: deploys the live portfolio site to Vercel **production** immediately. There is no dev/staging environment.
- **Production promotion**: same as merge to `main`. No separate manual gate. Treat any merge as a live release.
- **Active branch**: `feat/portfolio-redesign`. `main` still holds the old HTML5 UP static site until the rebuild is merged.
