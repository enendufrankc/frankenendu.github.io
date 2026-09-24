# Frank Enendu — personal portfolio

Independent static Astro 7.3.4 application. The repository root remains the Inflect Hub application; this app has its own dependencies, content and build output.

## Develop and verify

Use Node.js 24 (minimum 22.12). From this directory:

```sh
npm ci
npm run dev
npm run build
npm run check
npm run preview
```

Open `http://localhost:4321/frankenendu.github.io/` for development. `check` examines the latest production build for required routes, broken local links and assets, base-path errors and accidental private references. Astro build does not replace a full TypeScript diagnostic check. There are no API keys or server endpoints.

## Edit content

- `src/content/projects/*.md`: project metadata and case studies. Set `detail: true` for a dedicated page; use the actual delivery stage.
- `src/content/profile.json`: verified career chronology, education and skills.
- `src/content/writing.json`: published articles.
- `src/styles/global.css`: shared styles and print layout.
- `public/images/`: public assets only. The SVG social-card source has a PNG counterpart for link previews.

The CV at `/cv/` supports Print / Save PDF. Keep prototype use distinct from production adoption. Do not add unverified outcomes, client quotes, internal links, research notes or the original profile export.

## Publishing later

The sibling `.github/workflows/personal-portfolio.yml` runs **only on manual dispatch**. It builds this directory, verifies output and publishes only `personal-portfolio/dist` to GitHub Pages. Site and base are configured for `https://enendufrankc.github.io/frankenendu.github.io/`.

The workflow has not been run remotely. Before publication, confirm repository Pages settings use GitHub Actions and that the `github-pages` environment allows the selected branch. GitHub requires the dispatch workflow to exist on the default branch before it can be run. Coordinate that integration separately: merging to this repository’s `main` also triggers the existing Inflect Hub Vercel release. Do not change Vercel configuration or the root app to publish this portfolio.

See GitHub’s [custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) and [manual workflow requirements](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow).
