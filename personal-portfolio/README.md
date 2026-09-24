# Frank Enendu — personal portfolio

Independent static Astro 7.3.4 application. The repository root remains the Inflect Hub application; this app has its own dependencies, content and build output.

## Develop and verify

Use Node.js 24 (minimum 22.12). From this directory:

```sh
npm ci
npm run dev
npm run build:all
npm run preview
```

Open `http://localhost:4321/` for development. `check` examines the latest production build for required routes, broken local links and assets, base-path errors and accidental private references. Astro build does not replace a full TypeScript diagnostic check. There are no API keys or server endpoints.

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

For Cloudflare, upload the contents of `dist/` (or a ZIP whose root contains `index.html`) through Workers & Pages. Attach `frankenendu.link` to the portfolio application. Publish both outputs from the same successful build and verify home, about, CV, case-study pages and portrait on each public URL.

The earlier manual Actions workflow was removed because it required default-branch integration and could publish the wrong base path. Future automation must retain this separation from Inflect Hub.
