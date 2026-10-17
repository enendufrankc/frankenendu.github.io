# Project library implementation plan

Work in the existing isolated `feat/gated-diary` worktree. User requested the project-page structure; use owner-only draft defaults while the audience preference is pending. Root Inflect Hub and main remain untouched.

- [x] Read current diary, handoffs and both source inventories; reconcile every record in ignored `.private/project-map.json`.
- [x] Record page structure, publication rules, API and evidence boundaries in the project-library design.
- [x] Backend task: create migration0002, project handlers/types/routes, monthly reverse links and meaningful Worker tests. One code implementer owns worker/migrations/tests only.
- [x] Content task A: research and draft map topics1–36 into `.private/projects-a.json`; no source code edits. Distinguish source evidence from proposed build plan, use the shared page contract.
- [x] Content task B: research and draft map topics37–71 into `.private/projects-b.json`; no source code edits. Preserve sparse/unverified records with discovery requirements instead of invented architecture.
- [x] Parent: build library index, reader page/outline and owner editor. Add navigation from monthly diary and reverse project links.
- [x] Parent: validate/merge private drafts, add local-only seed/import paths, update README and build checks. Keep real content out of git/builds.
- [x] Verify source coverage and all content sections; correct ownership/status claims and flag evidence gaps.
- [x] Run integration/type/build checks, desktop/mobile browser walkthrough and independent spec/security review.
- [x] Commit source/safe docs on task branch; leave the signed-in local library open for Frank and report remaining content/deployment limitations.

Parallel work uses disjoint domains: one backend code implementer and two editorial research tasks writing ignored data files. The parent owns UI, config and integration. No agents modify shared files or operate the browser concurrently.

Verification record (18 October): both static targets build and each passes six output checks; Worker/client TypeScript checks pass; 44 diary tests pass, including project authorisation, relationship atomicity, private import and delayed-response clearing; Wrangler deployment dry-run passes. Independent security and parent-programme evidence reviews found no unresolved important issues. Browser checks cover the populated library, search/stage filters/reset, private reading, guide navigation, owner create/save/preview/publish/unpublish, generated slugs, direct topic editing, sign-out clearing, and 390px responsive reading. Native reset timing and generated-slug timing were corrected during browser verification. Private content is kept out of both static bundles and backed up in a git-ignored folder in the user's Second Brain.

The final private collection is 78 individual topics plus two programme guides. Player Personalisation has two equal foundations: player understanding and games/Game DNA. Programme pages distinguish dated current evidence, proposed integrations and a portable fresh-start design. No production deployment, real invitation or email occurred; verified sending-domain configuration remains a deployment dependency.
