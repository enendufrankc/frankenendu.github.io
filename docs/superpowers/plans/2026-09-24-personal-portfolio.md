# Personal Portfolio Implementation Plan

> For agentic workers: use subagent-driven-development for isolated content work and independent reviews. Integrate in the approved feature worktree.

**Goal:** Build the approved standalone portfolio while preserving Inflect Hub.
**Architecture:** Independent static Astro app in personal-portfolio/; Markdown projects and profile JSON feed shared layout and routes. Minimal navigation/print JavaScript. Local fonts and global CSS.
**Tech Stack:** Astro 7.3.4, TypeScript, CSS, Node built-in tests.

## Tasks
- [x] Write scripts/verify-build.mjs contract before application code: required pages, base-aware links/assets/anchors, accurate identity and private-content exclusions. Run node --test scripts/verify-build.mjs; expect missing-build assertion.
- [x] Build unchanged root app as baseline using existing dependencies.
- [x] Scaffold independent package/config, Astro glob collection and strict TS. Use site https://enendufrankc.github.io and base /frankenendu.github.io.
- [x] Populate source-backed project Markdown, profile JSON and writing links. Six primary case studies plus two tool stories; three prominent ventures. Stage and personal attribution explicit.
- [x] Implement BaseLayout, ProjectCard, SectionHeading and FlowDiagram, one global stylesheet; local serif/sans fonts, semantic layout, skip/focus/reduced-motion support.
- [x] Implement index, about, cv, work/[id], 404, sitemap.xml and robots.txt. Shared base-aware links; CV print control; accessible mobile menu.
- [x] Build then run contract; inspect desktop/mobile browser navigation, all case-study pages, ventures, CV/print, keyboard and overflow.
- [x] Obtain independent spec review followed by code-quality review; fix material findings and rerun affected checks.
- [x] Integrate only independent app files and docs into feat/personal-portfolio. Add manual-only Pages workflow and runbook. Never push/merge/publish.
- [x] Verify no root app changes or private artifacts. Final build/check/browser summary; commit verified work on feature branch.
