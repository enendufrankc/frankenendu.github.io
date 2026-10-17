# Topic mental models implementation plan

> For agentic workers: use subagent-driven-development with isolated file ownership and review; continue in the established task worktree.

**Goal:** Add a readable, evidence-aware architectural mental model to every private project topic.

**Architecture:** A shared bounded JSON validator feeds the Worker API and private importer. A lightweight DOM renderer presents the data responsively before overview prose. Existing authentication, publication state and lifecycle protect it.

**Tech stack:** Astro, TypeScript, Cloudflare D1/Worker, CSS, Node test runner.

- [x] Backend: add `shared/mental-model.mjs` and type declarations; migration `0003_mental_models.sql`; integrate `mentalModel` in editable/detail payloads, save and private import. Validate null compatibility, bounds and allowlisted properties. Add API/import tests and run them.
- [x] Content: read all 80 private topic records; author `.private/mental-models-a.json` and `-b.json` keyed by slug; ensure no source fact is upgraded to a production claim. Merge into private project records while keeping draft and owner-only visibility. The subsequent user request expands this step: inspect Share product pages and available primary repositories, enrich current workings/contracts/decisions and rebuild steps, remove blanket guide disclaimers, and retain specific dated evidence gaps.
- [x] UI: create `src/lib/mental-model.ts`; render stage/node DOM with textContent only, state labels, caption and feedback. Add section before chapters with anchor and responsive global CSS. Extend owner JSON editor and preview, preserve optional models, clear private DOM on access loss.
- [x] Review: validate every authored record and coverage; review all model captions and representative sensitive pipelines against source notes; independently review code and privacy.
- [x] Verify: `npm run test:diary`, `npm run build:all`, `npm run typecheck`; browser check programme, component, mobile, editor/save/preview and sign-out. Scan generated output for private diagram labels.
- [x] Refresh ignored Second Brain JSON/Markdown backup. Commit implementation only after checks; leave local preview open beyond gate. No push or deployment.


## Verification record — 18 October 2026

- Diary suite: 58 tests passed, including schema bounds, private API round trips, importer no-overwrite behaviour, text-only rendering and access-loss clearing.
- Both Cloudflare and GitHub builds passed, with six output checks for each target; Worker/client type checks and Wrangler dry run passed.
- Browser: owner sign-in, programme diagram, narrow 390px layout, editor preview, invalid JSON rejection, save and sign-out clearing verified. Final reseed reviewed the enriched programme and a detailed implementation guide; no horizontal overflow or console errors observed.
- All 80 private records validate, have mental models and source-backed guides, remain drafts with owner-only guides, and pass authenticated local API comparison. Diagram captions and sampled guide paragraphs are absent from both static outputs.
- Independent review corrected evidence-state inconsistencies, a scripted-demo claim and two planning-system overclaims. Private source audits preserve specific remaining gaps and source revisions.
- Durable ignored Second Brain JSON, Markdown and source-audit backup refreshed; previous snapshot archived. Private authoring files remain excluded from version control.
- Local preview remains on port 8788. Production email verification and deployment are still pending; no push, merge or deployment performed.
