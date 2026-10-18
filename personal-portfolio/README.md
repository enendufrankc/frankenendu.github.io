# Frank Enendu — personal portfolio

Independent Astro 7.3.4 application with static portfolio pages and a private diary Worker. The repository root remains the Inflect Hub application; this app has its own dependencies, content and build output.

## Develop and verify

Use Node.js 24 (minimum 22.12). From this directory:

```sh
npm ci
npm run dev
npm run build:all
npm run preview
```

Open `http://localhost:4321/` for development. `check` examines the latest production build for required routes, broken local links and assets, base-path errors and accidental private references. Astro build does not replace a full TypeScript diagnostic check. The diary has a separate Worker API and private data stores. Public pages remain static.

## Edit content

- `src/content/projects/*.md`: project metadata and case studies. Set `detail: true` for a dedicated page; use the actual delivery stage.
- `src/content/profile.json`: verified career chronology, education and skills.
- `src/content/writing.json`: published articles.
- `src/styles/global.css`: shared styles and print layout.
- `public/images/`: public assets only. The SVG social-card source has a PNG counterpart for link previews.

The CV at `/cv/` supports Print / Save PDF. Keep prototype use distinct from production adoption. Do not add unverified outcomes, client quotes, internal links, research notes or the original profile export.

## Publish the same content to both sites

Run `npm run build:all` before each release. It builds and checks two outputs from the same content:

- `dist/`: Cloudflare static assets for `https://frankenendu.link/`.
- `dist-github/`: GitHub Pages assets with the `/frankenendu.github.io/` base path.

Both use the primary domain for canonical and social URLs. Keep GitHub's custom-domain setting empty and never add `CNAME`; the original GitHub URL must continue serving the portfolio directly.

GitHub Pages publishes the root of the independent `gh-pages` branch. Publish **only the contents of `dist-github/`** there, retaining `.nojekyll`. Use a separate checkout, replace its static assets, commit and push normally with the pre-push hook installed. Never force-push or publish research/source history. `main` belongs to Inflect Hub and must remain unchanged.

For Cloudflare, run `npm run deploy:cloudflare` using your authenticated Wrangler session. `wrangler.jsonc` targets only `frank-enendu-portfolio` in the personal Cloudflare account and binds `frankenendu.link` as a custom domain. It uploads `dist/` and the diary Worker. Configure the diary bindings and verified email sender below before deploying. Publish both outputs from the same successful build and verify home, about, CV, case-study pages and portrait on each public URL.

The earlier manual Actions workflow was removed because it required default-branch integration and could publish the wrong base path. Future automation must retain this separation from Inflect Hub.

## Inside the Work — private monthly diary

The public entrance is `https://frankenendu.link/diary/`. The owner workspace is `/diary/admin/`. The GitHub Pages mirror links readers to the primary domain; it never contains entry bodies, reader details or private attachments.

Released to `frankenendu.link` on 18 October 2026. Owner sign-in is configured for `enendufrankc@gmail.com`; the Resend sender `diary@frankenendu.link` is verified. The initial October entry and 80 topics, each with a mental model, were imported as owner-only drafts. Live email delivery, owner sign-in, the library, and anonymous API denial were verified. Code is on `feat/gated-diary`; this release did not merge to `main` or update the GitHub Pages mirror. Keep publication and reader invitations as separate editorial actions in the owner workspace.

**Write each month:** sign in with the configured owner email, start a new month, fill the title/private summary/topics and Markdown, save the draft, then preview it. Attach images or PDFs after saving. Publish when ready for invited external readers. Unpublish returns the entry to owner-only access. The [monthly template](docs/diary-entry-template.md) explains the editorial structure. The optional public preview exposes only the title, month and explicitly written teaser of a published entry.

**Invite a reader:** open Readers, enter their email and choose an expiry (seven days by default). This action sends an invitation email. Readers verify that same address with an eight-digit code, valid for ten minutes and five attempts. Update an expiry or revoke access from the reader list. Revocation applies to the next protected request; open pages recheck at least every minute and on returning to the tab. A saved/downloaded copy cannot be recalled.

Owner sessions last eight hours. Reader sessions last at most seven days and never outlive the current invitation. A reader whose invitation has been extended may need to sign in again when their session expires. Re-inviting replaces the invitation identity, so old codes and sessions cannot regain access.

### Local checks and browser testing

```sh
npm run build:all
npm run typecheck
npm run test:diary
npm run check:worker
npm run dev:diary
```

`dev:diary` serves `http://localhost:8787/diary/` with the real Worker, built pages, ephemeral D1/R2, and mocked email only. Sign in as `owner@example.com`; find the local code in the ignored `.private/test-mail.json`. Use `DIARY_LOCAL_PORT=8788 npm run dev:diary` if the default port is occupied. Test data is lost when the process stops. The harness reads no real credentials and blocks unexpected outbound traffic. Integration tests use the same isolation. `npm run dev` remains useful for public layout work but does not run diary APIs.

For Wrangler development against persisted local stores, copy `.dev.vars.example` to `.dev.vars`, configure a dedicated development mail key/sender, then run `npm run db:local` and `npx wrangler dev`. This mode sends actual mail; do not use it for automated tests.

### Cloudflare setup and release

`wrangler.jsonc` binds the existing personal portfolio Worker to its dedicated `frank-enendu-diary` D1 database and private `frank-enendu-diary-files` R2 bucket. Keep the bucket private: no public development URL or custom domain. `run_worker_first` ensures diary/API paths go through the Worker. Other portfolio pages keep static-asset delivery.

1. Verify the sending domain with Resend, then set `DIARY_FROM_EMAIL` in Wrangler config. The configured sender is `Frank Enendu <diary@frankenendu.link>`; recheck verification if changing it. Set `DIARY_OWNER_EMAIL` to the actual owner mailbox and keep `DIARY_ORIGIN` exactly `https://frankenendu.link`.
2. Set the key with `npx wrangler secret put RESEND_API_KEY`. Never put it in source, frontend bundles or a tracked file.
3. Apply the schema with `npm run db:remote`. D1 migrations are additive; review future destructive schema changes separately.
4. Run the checks above, then `npm run deploy:cloudflare`. Verify the public diary entrance, anonymous API denial, owner code delivery, reader invitation and expiry on the primary domain. A local mock test does not prove live email delivery.
5. Publish the separately checked `dist-github/` output to `gh-pages` when updating the mirror. Never merge this work to `main` to deploy: that branch releases Inflect Hub.

Private entry bodies, invitations, challenges and sessions live in D1; uploaded images/PDFs live in R2. API responses and diary shells are private/no-store with noindex headers. Entry Markdown escapes raw HTML, rejects dangerous URL protocols and suppresses remote images. Supported attachments are PNG/JPEG/WebP/PDF, up to 10 MiB, served after a fresh session/invitation and publication check. Authentication values are hashed at rest. Logs do not contain codes, session tokens or email bodies.

### Import an initial private draft

Keep the source JSON outside version control (the app's `.private/` directory is ignored). Fields are `month`, `title`, `summary`, `tags` and `markdown`. The import always creates an owner-only draft with public previews off and refuses to overwrite an existing month:

```sh
npm run db:local
node scripts/import-diary.mjs /absolute/path/to/draft.json
# Explicitly target the live database only when intended:
node scripts/import-diary.mjs /absolute/path/to/draft.json --remote
```

The browser QA harness is ephemeral and separate from Wrangler's persisted local database. Use the workspace editor or the explicit private seed below to put content into that harness.

For backups, use `wrangler d1 export DIARY_DB --remote --output /private/path/diary-backup.sql` and keep the result outside git. Back up private R2 attachments separately if required. D1 recovery/exports do not include R2 object contents. Before a Worker rollback, check schema compatibility; rolling back code does not roll back database changes or republish drafts.

## Permanent project and programme library

`/diary/projects/` is the gated library. Each topic has a permanent `/diary/projects/<slug>/` reading page with its overview, evidence date, team context, build guide, related topics and linked monthly entries. Search by title, description, other names or contributors; filter by area or stage. Programme guides use the area `Programmes` and appear prominently above the collection. Connect a project to its programme through Related topics so the reading page shows the programme link.

Use `/diary/admin/projects/` to create or edit a topic. Save first, preview the overview and guide, and open its reading page. The slug becomes fixed after creation. Publishing shares the overview with authorised readers; the guide retains its independent **Only me** setting until explicitly changed. Source notes always remain owner-only. Unpublishing hides the whole page from readers. All project requests use the same invitation expiry/revocation rules as monthly entries.

Keep the documented implementation, proposed rebuild and unresolved questions distinct. Evidence dates are editorial review dates, not release dates. A programme can link delivered products, experiments, historical work and proposals without implying all of them are live or integrated. Build guides preserve inspected architecture, data contracts, operational lessons and decisions, followed by steps for rebuilding or adapting the project. Record specific evidence gaps where they occur. Every month, update the changed project pages and link them to the dated diary entry. This preserves enduring explanations alongside the chronology.

### Import private project drafts

Keep the JSON array outside git. Supported fields are `slug`, `title`, `summary`, `area`, `stage`, `contributors`, `aliases`, `evidenceDate`, `overviewMarkdown`, `guideMarkdown`, `sourceNotes`, `mentalModel`, `relatedSlugs`, and `months`. Arrays hold contributors, aliases, related slugs and `YYYY-MM` month identifiers. All referenced projects must exist in the database or the same import, and all linked months must already exist. Apply all migrations before import:

```sh
npm run db:local
node scripts/import-projects.mjs /absolute/private/path/projects.json --local
# Explicitly target the live database only when intended:
node scripts/import-projects.mjs /absolute/private/path/projects.json --remote
```

The importer always creates new records as drafts with owner-only guides, even if the file requests publication. Existing projects and their month links are preserved. Import does not update existing editorial work: make revisions through the owner workspace. SQL and diagnostic logs are held in a private temporary directory and removed after the command. No source bodies enter the static build.

For a seeded local browser preview, put `projects.json` and `2026-10-draft.json` in the ignored `.private/` directory, then run:

```sh
npm run build
DIARY_SEED_PRIVATE=1 DIARY_LOCAL_PORT=8788 node scripts/diary-local.mjs
```

The local seed loads the monthly draft and project drafts atomically. It remains a fake-email, ephemeral preview; edits made there disappear when the server stops. Keep the source drafts in durable private storage and use D1 backups for deployed editorial data. Never commit the private source, seed data, exported database or mock mailbox.

### Mental models and source-backed build guides

Every imported topic can have a `mentalModel` object shown before its overview. It is private D1 content, not a generated public image. Migration `0003_mental_models.sql` adds this nullable field; older topics continue to work without a diagram. Apply every migration before deploying the updated Worker.

In the topic editor, expand **At a glance diagram** to edit and preview its JSON. Use three to five stages, one to three nodes per stage, and at most twelve nodes. Each node contains a title, detail and `documented`, `proposed` or `unverified` state. The caption identifies whether this is a documented flow, a conceptual model or mixed current work and next steps. Optional feedback explains a learning loop. The diagram follows the overview's publication setting; it is not controlled by the separate build-guide setting. Empty JSON removes the diagram.

Keep rebuild guides grounded in inspected product pages, design records and implementation files. Start with how the existing system works, then preserve useful decisions, interfaces, failure modes and operational lessons before describing adaptation to a new company. Identify proposals and evidence gaps beside the relevant detail; do not use a blanket disclaimer in place of collecting available knowledge. When sources disagree, keep their dates and explain which implementation or experiment they describe. A product page, implemented prototype and production rollout are different evidence.

Private source audits and authoring exports belong in `.private/` and the ignored Second Brain backup. Neither should be committed or bundled. Reading a newer source does not automatically publish a draft, change guide access, or prove a proposed capability has shipped.
