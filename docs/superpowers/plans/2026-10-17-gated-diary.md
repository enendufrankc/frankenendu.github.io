# Gated Diary Implementation Plan

> For agentic workers: use subagent-driven-development for delegated backend work and independent spec/code review. Keep implementation ownership explicit.

**Goal:** Add Frank's monthly private portfolio diary with individually approved, expiring email access and an owner workspace.

**Architecture:** Preserve static Astro pages, add a Worker gateway with D1 state and private R2 attachments. The database supplies private content only after server authorisation; the public repository contains presentation, schemas and a blank authoring template only.

**Tech Stack:** Existing Astro 7.3.4 and Wrangler 4.137.0; TypeScript, Cloudflare D1/R2, Web Crypto, Resend HTTP API, micromark, local Worker integration tests.

## Task 1 — isolate and establish baseline

- [x] Inspect the existing personal-portfolio branch and Cloudflare deployment configuration.
- [x] Create `feat/gated-diary` in an isolated worktree without changing main.
- [x] Install existing dependencies and run `npm run build:all`; retain the installed versions.
- [x] Add `.dev.vars*`, ignored draft storage, test output, and generated runtime types to app-local ignores; retain trackable safe examples.

## Task 2 — database and access backend

Create `personal-portfolio/worker/{index,auth,content,http,mail}.ts`, `migrations/0001_diary.sql`, and `tests/diary.test.mjs`. Implementation can split additional focused modules if needed. Parent owns package/config edits; backend agent owns Worker, migration and backend tests.

Contract: all paths under `/api/diary`; JSON error shape `{ error: string, code: string }`. All times are ISO UTC strings. Session shape is `{ user: null | { email, role: 'owner' | 'reader', expiresAt }, reason?: string }`.

```text
POST /auth/request {email} -> 202 {challengeId,message}
POST /auth/verify {email,challengeId,code} -> 200 {user}; set session cookie
POST /auth/logout {} -> 200; clear session
GET /session -> 200 session shape
GET /public -> {entries:[{slug,month,title,teaser}]} (only published opt-in teasers)
GET /entries -> {entries:[{slug,month,title,summary,tags,publishedAt,updatedAt,readingMinutes}]}
GET /entries/:slug -> {entry:{...summaryFields,html,attachments:[{id,name,type,size,url}]}}
GET /admin/entries -> {entries:[{...summaryFields,markdown,status,publicTeaser,teaser}]}
POST /admin/entries {slug,month,title,summary,tags,markdown,status,publicTeaser,teaser} -> {entry}
PUT /admin/entries/:slug same mutable fields (slug immutable) -> {entry}
POST /admin/preview {markdown} -> {html}
GET /admin/invitations -> {invitations:[{id,email,name,expiresAt,createdAt,revokedAt}]}
POST /admin/invitations {email,name,expiresAt} -> {invitation,mailSent}
PATCH /admin/invitations/:id {expiresAt} OR {revoke:true} -> {invitation}
POST /admin/entries/:slug/attachments raw bytes, Content-Type and X-File-Name -> {attachment}
GET /attachments/:id -> protected bytes
```

- [x] Write failing integration tests for auth, permissions, revocation, expiry, draft/content isolation, upload access and injection.
- [x] Implement schema with bound SQL, atomic challenge consumption and invitation generation semantics.
- [x] Implement mail transport, request limits, exact-origin mutation checks, safe Markdown, private assets and generic error responses.
- [x] Run real local Worker/D1/R2 tests with mocked mail; no real messages, no test-only production login route.

Bindings: `DIARY_DB`, `DIARY_FILES`, `ASSETS`; runtime config `DIARY_ORIGIN`, `DIARY_OWNER_EMAIL`, `DIARY_FROM_EMAIL`; secret `RESEND_API_KEY`. Types generated from Wrangler config. Expose routing handler for runtime tests without duplicating business logic.

## Task 3 — reader and owner interface

Create `src/pages/diary/{index,entry,admin}.astro`, `src/components/DiaryLogin.astro`, `src/lib/diary-{client,reader,admin}.ts`. Modify only personal app `BaseLayout.astro`, `index.astro`, `global.css`, sitemap and robots routes.

- [x] Build shared accessible email/code form, descriptive error states and pending-button handling.
- [x] Add public introduction, explicit preview list, protected archive, entry reader, expiry notice and logout.
- [x] Add authoring editor with save draft, explicit publish/unpublish, safe preview and private attachments.
- [x] Add invitation table, seven-day default/custom expiry, extension and revocation.
- [x] Preserve existing paper/blue editorial design; verify mobile navigation and form labels/focus.
- [x] Clear rendered private content on expiry, unauthorised API response, pagehide and recheck after visibility changes.
- [x] The GitHub static mirror must route diary links to frankenendu.link and contain no private content.

## Task 4 — configuration and operational workflow

Modify `wrangler.jsonc`, `package.json`, app README and safe `.dev.vars.example`; add `scripts/import-diary.mjs` and a generic authoring template. Private content imports are local or explicit remote operations, never bundled.

- [x] Configure selective Worker-first `/api/diary/*`, `/diary`, `/diary/*`; preserve other public static routes.
- [x] Configure dedicated D1/R2 resources and generated types, exact origin and proposed owner contact.
- [ ] Complete verified mail sender and deploy the runtime secret outside git. Existing Resend domain verification is failing; sender/owner preference was requested. No live deployment made.
- [x] Add local database migration, local dev, auth test, worker typecheck and deployment dry-run commands.
- [x] Provide a private October draft outside version control, using externally suitable material and clear cutoff, for owner review.

## Task 5 — verification and review

- [x] Run auth/integration tests and Worker typecheck.
- [x] Run `npm run build:all`, public-content leakage checks, and `wrangler deploy --dry-run`.
- [x] Browser verified owner/reader sign-in, wrong-code handling, archive/entry, draft/preview/publish, invitation creation/expiry update, automatic expiry content clearing, mobile menu, and clean console using mocked mail.
- [x] Integration tests verify revocation and attachment upload/render/access. Browser file upload was blocked by extension file-URL access settings; that UI path remains unverified.
- [x] Review spec compliance, then code quality/security; fix findings and rerun relevant checks.
- [x] Commit only source and safe documentation on the task branch. Leave main untouched.
- [x] Report deployment/mail limitations accurately; do not describe a local mock email test as real delivery.

## Verification record — 17 October 2026

- `npm run build:all`: primary and GitHub mirror builds pass; five assertions per output.
- `npm run typecheck`: generated Worker bindings, Worker and client TypeScript pass.
- `npm run test:diary`: 24/24 pass using real local D1/R2 and mocked email.
- `npm run check:worker`: deployment dry run passes (no deployment).
- Local migration and October draft import succeed; the draft is in ignored `.private/2026-10-draft.json` and persisted local D1 only. The browser harness has separate disposable test content.
- Independent review found and resolved private-image rendering, inline navigation/CSP, a delayed private-response race, and edits lost during save. Added regression coverage for the response race and image rules.
- Browser QA ran at localhost:8788 because another unrelated app owns port 8787. The harness remains available for review; all mail is simulated.
- Dedicated remote D1 and private R2 resources were created; remote schema, secret and deployment are pending. No public content was published, no real email was sent, and main/Inflect Hub remained untouched.
- Current Wrangler login has zone read access but no DNS edit scope. A verified sender (and DNS setup through an authorised path) remains necessary for live codes.
