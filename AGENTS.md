# AGENTS.md

Operational contract for coding agents working in this repo. Read every session.
Deep reference (architecture, design system, content tiers) lives in `CONTEXT.md`.

## Commands
- Install:   `npm install`
- Build:     `npm run build` (this repo's closest thing to a test — catches TS errors and Astro build failures)
- Run local: `npm run dev` (http://localhost:4321)
- Preview:   `npm run preview` (serve the production build locally)

The chatbot needs `GEMINI_API_KEY` in `.env` at the repo root. See `.env.example`. No test suite exists.

## Verify a change
1. Run `npm run build` and watch it finish clean. Catches TS errors, missing imports, broken Astro components.
2. For UI work, open the relevant page under `npm run dev` and use the feature in a browser. Type-check green ≠ feature working.
3. For chatbot changes, confirm `POST /api/chat` returns a real response (requires a working `GEMINI_API_KEY`).

If you cannot verify (e.g. no key locally, no browser access), say so explicitly. Do not claim success.

## Guardrails (do NOT)
- Do NOT commit or push to `main`. **Merging to `main` auto-deploys the Inflect Hub site to Vercel production.** There is no staging/dev environment — merge is release.
- Do NOT bypass the pre-push hook with `--no-verify`. Hook is at `.git/hooks/pre-push` (currently a no-op without pytest; still keep it installed for when tests arrive).
- Do NOT commit `.env` or anything containing `GEMINI_API_KEY` or `RESEND_API_KEY`. Confirm `.gitignore` covers it before `git add`.
- Do NOT inline the chatbot system prompt into any client-side bundle. It lives in `api/chat.ts` and stays server-only.
- Do NOT remove the HTML5 UP "Massively" footer attribution — CCA 3.0 license requires it.
- Do NOT call the live Gemini API from any future test — mock or skip the call.
- Do NOT flip testimonial.is_draft to false on any case study without a real signed-off client quote.

## Conventions
- Branch per task off `main`: `feat/<slug>`, `fix/<slug>`, `chore/<slug>`. Current active feature work: `feat/portfolio-redesign`.
- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`.
- Content is the source of truth in `src/content/` (Astro collections) — add/edit projects and blog posts as markdown there, not in page templates.
- CSS lives in `src/styles/global.css` via CSS custom properties. No SCSS, no CSS-in-JS.
- Images live in `public/images/`, referenced by absolute path.
- Parallel work uses git worktrees named `frankenendu.github.io-p1`, `-p2`, ... Remove on merge.

## Deep reference
- `CONTEXT.md` — architecture, tech stack, design system, content tiers, key-file map, deploy details.
- `docs/superpowers/specs/2026-04-10-portfolio-redesign-design.md` — design spec for the rebuild.
