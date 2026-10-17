# Inside the Work — project library

## User direction

Frank asked for each Bally’s project to become a topic with its own page, covering its core idea and everything needed to start/build it from scratch. This extends the approved gated personal diary at frankenendu.link. Monthly entries remain the dated record of change; project pages hold the enduring explanation and rebuilding guide.

The audience question is pending. Implement the narrower default: all imported pages are owner-only drafts, detailed guides default to owner-only, and an owner must explicitly publish an overview and separately allow its guide for invited readers. This supports either answer without exposing internal material. Existing invitation expiry and revocation apply to every project request.

## Coverage and evidence

The private reconciled map accounts for all 43 catalogue entries and 44 repositories in the supplied 17 October package. It resolves aliases and groups supporting repositories, while retaining distinct products, services, experiments and programmes. Seven separately documented workstreams extend the initial set to 71 topics. This is an editorial inventory, not a claim of 71 active production products. Historical, held and unverified work remain visibly labelled.

Frank subsequently asked for two programme narratives: Player Personalisation and AI Transformation. Personalisation has two equally important foundations—player understanding and game understanding (Game DNA)—meeting in matching and experience decisions, with evaluation, experiments and simulation feeding learning back. AI Transformation groups discovery/research, capability-building, delivery infrastructure and adoption. The newly found personalisation handoff and local Communications prototype supply evidence for seven additional component topics. The planned collection is therefore 78 individual topics plus two programme guides. These counts describe editorial coverage, not active-product totals.

Programme guides are ordinary gated records using `area = Programmes`, featured dynamically on the library page. Both parent and component records link through related topics; related published programmes appear above an individual page. Keep specific programme data in private storage, not a hardcoded client catalogue. The current-state text uses dated evidence and marks proposed integrations explicitly.

Keep the map, source material and drafted pages outside git and both static builds. Imported source notes and repository references remain owner-only even when an overview is published. Never infer Frank owns a project from its presence in the portfolio. Attribute documented involvement and state where personal contribution is unconfirmed.

Each page distinguishes:

- **Documented today:** evidence dated 17 October 2026 or an earlier dated source, with current status and limits.
- **A fresh-start build plan:** a proposed implementation route, not a claim that these are the current exact internals.
- **Open questions:** missing requirements, integrations, decisions and evidence needed before claiming a faithful rebuild.

Unverified repository records get a discovery plan, not invented functionality. Programmes get an operating plan appropriate to the work rather than an artificial software stack.

## Reader experience

`/diary/projects/` is a gated, searchable library with area/stage filters, visible counts, topic summaries and clear draft labels for the owner. `/diary/projects/<slug>/` renders a permanent topic page through a static shell and authenticated API. Primary sections are Overview, Build from scratch and Monthly updates. A page outline makes long guides navigable. The existing paper, blue, Newsreader and DM Sans design carries through.

The overview covers core idea, intended users, problem, current evidence, Frank's contribution/team credit, and relationships to other topics. The guide covers requirements, inputs/data contracts, system or programme design, ordered delivery steps with acceptance checks, evaluation, deployment/operation, risks and open questions. Monthly updates link to permitted entries; monthly entries link back to permitted projects.

Project metadata and bodies are absent from static page source, public endpoints, public sitemap, previews and the GitHub mirror. The mirror directs readers to the primary domain.

## Owner experience

Add `/diary/admin/projects/`, linked from the existing author workspace. It lists projects and lets Frank create/edit the title, slug, summary, area, stage, contributors, aliases, evidence date, overview, build guide, source notes, related projects and linked months. Source notes use plain text. Save draft, publish/unpublish overview, preview Markdown and explicitly choose guide visibility. Publishing an overview does not publish its guide by default. No delete feature is required.

## Data and API

Add a second D1 migration; retain the existing diary schema and data. `diary_projects` stores project metadata, Markdown, source notes, related slugs, publication state and guide visibility. `diary_project_entries` links topic pages to monthly entries. Store contributors and aliases as bounded JSON arrays, related slugs as a bounded JSON array. No new attachment system is needed: existing protected monthly files may be linked, with existing parent-entry authorisation unchanged.

Under `/api/diary`:

```text
GET /projects -> {projects:[project summary]}
GET /projects/:slug -> {project:{summary fields,overviewHtml,guideHtml?,guideAvailable,relatedProjects,entries,sourceNotes?}}
GET /admin/projects -> {projects:[full editable project records]}
POST /admin/projects -> {project},201
PUT /admin/projects/:slug -> {project},200
```

Editable fields: slug,title,summary,area,stage,contributors,aliases,evidenceDate,overviewMarkdown,guideMarkdown,sourceNotes,relatedSlugs,months,status,guideVisibility. Slug is immutable after creation. status is draft/published; guideVisibility is owner/readers. Reader responses never include sourceNotes, raw Markdown, draft project metadata, restricted guides, or links to inaccessible drafts. Owner responses can include all fields. Use the existing Markdown renderer, exact-origin mutation checks, bound SQL, bounded bodies, cache policy and live invitation checks.

Summary fields: slug,title,summary,area,stage,contributors,aliases,evidenceDate,updatedAt,readingMinutes; owner additionally receives status and guideVisibility. Detail entries use existing month metadata. Admin records include months and relatedSlugs. Existing entry detail adds `projects:[summary]`, filtered by project publication for readers. Validate linked months and related project identifiers; imports create topics first, then relationships to avoid ordering dependencies.

## Delivery and checks

Implement backend against local D1/R2 tests before adding real content. Keep mock email local. Add browser shells/editor and validate primary/mirror output. An ignored local seed populates the QA harness with the October draft and project drafts; imports must never publish or overwrite existing records silently. Persisted local import is explicit and uses the same validation. No production release or real reader invitations are part of this extension.

Check owner/reader isolation, hidden guides/source notes, draft and relationship filtering, expiry/revocation, unsafe Markdown, invalid identifiers, atomic relationship writes, static leakage, browser search/navigation/editor and stale-response clearing. Review content coverage against every source record and flag thin evidence. Do not claim exact reconstruction completeness without repository/owner validation.
