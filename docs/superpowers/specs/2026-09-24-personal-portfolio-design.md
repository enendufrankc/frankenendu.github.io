# Frank Enendu — personal portfolio design

Date: 24 September 2026. Status: approved and implemented locally.

## Purpose and separation

Create a personal engineering portfolio that makes Frank's client-facing delivery, current AI engineering, personal startups and developer tooling easy to assess. Anthropic's Applied AI Engineer role informs project selection, but the public site should read as Frank's professional identity rather than a job-specific application landing page.

Keep Inflect Hub's application, content, domain and deployment intact. Build a separate static Astro application in `personal-portfolio/` within the isolated `feat/personal-portfolio` worktree. Its own package scripts, configuration, content and assets allow it to build independently. Target the existing personal GitHub Pages address, including the `/frankenendu.github.io/` base path. Prepare a manually triggered Pages workflow; do not push, merge, publish, change repository visibility or alter Pages settings during implementation.

Approaches considered:

1. **Separate app in this repository (recommended):** preserves current deployment and reuses the established repository without duplicating the consultancy. Independent output can be published to GitHub Pages later.
2. **New personal-site repository:** clearest long-term ownership separation but requires a new remote and deployment setup; no need to do that before a reviewable site exists.
3. **Replace the current root application:** unsuitable because this root deploys Inflect Hub and the user explicitly wants separation.

## Information architecture

Use a focused homepage with numbered sections and dedicated case-study pages. Main navigation: Work, Ventures, Open source, About, Contact; include a visible CV link. Desktop navigation stays compact; mobile navigation is accessible and does not require a third-party UI framework.

Homepage order:

1. **Introduction / About:** Frank Enendu; AI Engineer R&D at Bally's Interactive; Manchester. Headline communicates building AI with the people who use it. A short introduction connects embedded client engineering, agents and product development. Primary actions: Explore the work; View CV.
2. **Selected client work:** three editorial case-study cards—ELFT, James-Hambro and PublicView—with concise problem, contribution and delivery status. A compact additional-work row covers Nova, Ticketing, PEAK, Email-Extractor and SharePoint knowledge retrieval. BCN pre-sales, consulting and embedded/FDE-style delivery are explained without changing the formal title.
3. **Bally's engineering:** Game DNA, Agent Skills and the interview platform as primary engineering examples, subject to source attribution; Game Ideation and the hackathon platform as concise supporting entries. Use external-safe descriptions; no internal links, operational identifiers, customer data or unsupported impact numbers.
4. **Ventures I’m building:** a prominent full-width section giving FairLens, OgaHQ and Verify equal visibility. Each gets its actual product purpose, audience, Frank's personal-startup involvement and a working external product link. Treat these as current ventures, not anonymous consulting engagements. Do not reuse earlier draft testimonials or marketing metrics as achievements.
5. **Agent tooling:** SafeAI and AiGen receive substantial cards with engineering diagrams or concise flow descriptions. Clearly distinguish SafeAI's released Python package from AiGen's active development. Link SafeAI's public PyPI artifact. Do not offer private GitHub repositories as publicly browsable code.
6. **Further work:** CaseReviewer (initial pre-launch technical cofounder; built the AI engine), the initial LBS MBA process-automation consultation, and selected technically relevant experiments. State the historical/current scope precisely.
7. **Writing:** three or four genuine authored technical articles with external links and topic descriptions. No invented readership or publication dates.
8. **Experience, education and contact:** concise chronology, Liverpool MSc with Distinction, selected modules, GitHub/LinkedIn and email. Put detailed chronology on About/CV pages. Dissertation omitted until a topic is supplied.

Pages: `/`, `/about/`, `/work/elft/`, `/work/james-hambro/`, `/work/publicview/`, `/work/game-dna/`, `/work/agent-skills/`, `/work/interview-engine/`, `/cv/`, plus a useful 404. The ventures and other work link to existing sites where appropriate; avoid inventing deep case studies from marketing copy alone. If a Bally's detail cannot be attributed, retain only an explicitly scoped summary rather than claiming ownership.

## Visual direction

A restrained editorial engineering portfolio: warm off-white canvas, near-black text, cobalt-blue links and selective accents, generous spacing, and strong typography. Use a distinctive serif for major headlines and a readable sans-serif for body/UI; keep font delivery local where practical. Avoid generic glowing AI imagery, particle backgrounds, skill-percentage bars and unsubstantiated impact counters.

Use asymmetric but orderly layouts: a large introduction with a compact current-role panel; wide case-study rows; three venture cards with typographic wordmarks; and paired developer-tool cards. Case studies foreground the problem and engineering decisions. Status chips use plain words such as Productionised, Staff-used prototype, In development and Initial consultation.

Use small original SVG process diagrams where useful: document-to-letter, report discovery, multimodal profiling, input/action/output controls. These are explanatory abstractions, not replicas of internal architecture. No logos or stock imagery are needed to establish credibility. Retain required HTML5 UP attribution in the footer.

Mobile: readable single-column cards, wrapping technology lists, large tap targets, no horizontal overflow. Motion is limited to brief entrances/hover affordances and respects reduced-motion preferences. Strong focus states, semantic headings, skip link and contrast are required.

## Content and evidence rules

Content lives in the new app's `src/content/` Markdown collections; the current Inflect collections remain unchanged. Use fields for title, domain, relationship, role, stage, summary, technologies, public links and featured order. Do not ship private evidence notes or internal filesystem paths in built output.

Case-study template: problem → my contribution → approach/decisions → delivery/outcome → stack. Prototype use is a valid outcome and must not become production adoption. ELFT was productionised according to Frank; no user-count or efficiency claims are available. Earlier boilerplate claims about a decade of production AI, Salford, generic production readiness and draft client outcomes are excluded.

Preferred chronology from supplied profile PDF:

- Bally's Interactive — AI Engineer R&D, January 2026–present.
- BCN — AI Engineer, May 2024–January 2026; Graduate Engineer, August 2023–May 2024.
- Studio 14 — Data Scientist, July–September 2023.
- Hubpay — Junior Data Scientist, December 2021–December 2022.
- Earlier BI/analytics roles condensed on the homepage; full factual timeline on About/CV.
- University of Liverpool — MSc Data Science and Artificial Intelligence, Distinction, 2022–2023. Year precision avoids guessing the award date from differing course-end dates.

Public ownership/role clarifications: FairLens, OgaHQ and Verify are Frank's personal startups. CaseReviewer is an initial pre-launch technical-cofounder role focused on its AI engine, not a claim to be the current sole founder. LBS is initial AI transformation consultation for MBA programme operations, not delivered efficiency gains.

The CV route is a print-friendly résumé page using the verified timeline and selected achievements. Do not link the existing outdated CV as the new résumé or publish the supplied LinkedIn export unchanged. A downloadable PDF can be generated from the approved résumé content separately.

## Technical and interaction design

Astro static output with base-aware links/assets and pre-rendered content pages. Minimal browser JavaScript for mobile navigation and optional project-category filtering. No chatbot, forms requiring secrets, external model calls, accounts or server-only endpoints are necessary. Contact uses email/LinkedIn links.

Use one global stylesheet with CSS custom properties in the independent app. Project data remains separate from templates. Shared layout owns metadata, navigation, footer and accessibility; cards and article layouts stay small. Social metadata, canonical URLs, robots, sitemap and favicon use the personal portfolio identity and base path.

Keep new public assets in the independent app's `public/images/`. GitHub Pages publishes only the independent static build output. The raw research pack, internal code snapshots and source profile PDF are never copied into that output.

## Validation and delivery

Before reporting implementation complete:

- Build the independent app successfully; run the existing root build to confirm separation.
- Inspect the local site in a real browser on desktop and mobile; use navigation, case-study links, venture links, CV/print controls and any filter.
- Verify base-path assets and internal links in production output, status/role wording, correct chronology, keyboard focus and reduced-motion behavior.
- Inspect rendered pages for overflow, clipped text, missing assets and console errors.
- Check generated output for private/internal URLs, source paths, draft placeholders, unsupported claims and accidental contact data.

Deliver the isolated source changes, working local preview and verification summary. Publishing remains a later explicit action, with the existing Inflect site preserved.
