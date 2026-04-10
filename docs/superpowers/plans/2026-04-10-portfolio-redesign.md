# Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a modern, AI-powered portfolio for Frank Enendu using Astro + Vercel with a Gemini chatbot, particle hero, scroll animations, and case-study project pages.

**Architecture:** Astro static site with React islands for interactive components (chatbot, particles, theme toggle). Vercel hosts static pages + one serverless function (`/api/chat`) that proxies Gemini. Content collections power blog and project case studies in markdown.

**Tech Stack:** Astro 5, React 19, TypeScript, tsParticles (particles), GSAP + ScrollTrigger (animations), Google Gemini API (chatbot), Vercel (hosting), CSS custom properties (theming)

**Design Spec:** `docs/superpowers/specs/2026-04-10-portfolio-redesign-design.md`

---

## File Structure

```
frankenendu.github.io/          # repo root (wipe old files, fresh Astro project)
  astro.config.mjs              # Astro config: Vercel adapter, React, Shiki
  tsconfig.json                 # TypeScript config
  package.json                  # Dependencies
  .env.example                  # GEMINI_API_KEY placeholder
  vercel.json                   # Vercel config (redirects, headers)
  public/
    fonts/                      # Self-hosted Playfair Display + Inter (woff2)
    images/
      projects/                 # Project screenshots
    frank-enendu-cv.pdf         # Downloadable CV
    favicon.svg                 # Favicon
    robots.txt                  # SEO
  src/
    styles/
      global.css                # CSS variables, resets, typography, themes
      animations.css            # GSAP-triggered animation classes
    layouts/
      BaseLayout.astro          # HTML shell, meta, fonts, global CSS, navbar, footer
    components/
      Navbar.astro              # Fixed nav with links + theme toggle
      Footer.astro              # Social links, copyright, attribution
      ThemeToggle.tsx            # React island: dark/light switch
      ParticleHero.tsx          # React island: tsParticles connected node graph
      ProjectCard.astro         # Card for projects grid
      ProjectFilter.tsx         # React island: domain filter buttons
      BlogCard.astro            # Card for blog list
      Timeline.astro            # Career timeline (About page)
      ChatBot.tsx               # React island: chatbot panel
      ScrollAnimations.astro    # GSAP ScrollTrigger init script
      SEO.astro                 # Reusable <head> meta/OG component
    content/
      projects/                 # Markdown case studies (12 files)
        safeai.md
        aigen.md
        fairlens.md
        casereviewer.md
        personal-copilot.md
        multi-modal-content.md
        nova.md
        sharepoint-search.md
        nhs-chatbot.md
        agent2agent.md
        llm-game-recommender.md
        semantic-segmentation.md
      blog/                     # Markdown blog posts
        welcome.md              # Initial post
    content.config.ts           # Collection schemas
    pages/
      index.astro               # Home page
      projects/
        index.astro             # Projects grid
        [...slug].astro         # Dynamic case study pages
      blog/
        index.astro             # Blog list
        [...slug].astro         # Dynamic blog post pages
      about.astro               # About page
    lib/
      chatbot.ts                # Client-side chat logic + types
      constants.ts              # Site metadata, nav links, social links
    pages/api/
      chat.ts                   # Vercel serverless: Gemini proxy
```

---

## Task 1: Project Scaffold

**Goal:** Fresh Astro project with Vercel adapter, React integration, and TypeScript.

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.env.example`, `.gitignore`

**Important:** The old site files (index.html, generic.html, elements.html, assets/, etc.) will remain in the repo during development. We do NOT delete them until the new site is verified working. The Astro project builds into a separate output directory.

- [ ] **Step 1: Initialize Astro project in a clean workspace**

From the repo root `/Users/frank.enendu/Documents/Personal/frankenendu.github.io/`:

```bash
# Create a temporary directory, init Astro there, then copy files back
cd /tmp && npm create astro@latest portfolio-new -- --template minimal --no-install --no-git --typescript strict
cp /tmp/portfolio-new/astro.config.mjs /Users/frank.enendu/Documents/Personal/frankenendu.github.io/
cp /tmp/portfolio-new/tsconfig.json /Users/frank.enendu/Documents/Personal/frankenendu.github.io/
cp /tmp/portfolio-new/package.json /Users/frank.enendu/Documents/Personal/frankenendu.github.io/
cp -r /tmp/portfolio-new/src /Users/frank.enendu/Documents/Personal/frankenendu.github.io/
rm -rf /tmp/portfolio-new
cd /Users/frank.enendu/Documents/Personal/frankenendu.github.io/
```

- [ ] **Step 2: Install dependencies**

```bash
npm install
npx astro add vercel react --yes
npm install @tsparticles/react @tsparticles/slim gsap @google/generative-ai
```

- [ ] **Step 3: Configure astro.config.mjs**

Replace `astro.config.mjs` with:

```js
import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";
import react from "@astrojs/react";

export default defineConfig({
  output: "server",
  adapter: vercel(),
  integrations: [react()],
  markdown: {
    shikiConfig: {
      theme: "github-dark",
      wrap: true,
    },
  },
});
```

- [ ] **Step 4: Create .env.example**

```
GEMINI_API_KEY=your_gemini_api_key_here
```

- [ ] **Step 5: Update .gitignore**

Append to existing `.gitignore` (or create):

```
node_modules/
dist/
.vercel/
.env
.astro/
```

- [ ] **Step 6: Create source directories**

```bash
mkdir -p src/{styles,layouts,components,content/projects,content/blog,lib,pages/projects,pages/blog,pages/api}
mkdir -p public/{fonts,images/projects}
```

- [ ] **Step 7: Verify project builds**

```bash
npx astro build
```

Expected: Build succeeds with no errors (may have warnings about empty dirs — that's fine).

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json .env.example src/ public/
git commit -m "feat: scaffold Astro project with Vercel adapter and React"
```

---

## Task 2: Design System — Global CSS + Fonts

**Goal:** CSS custom properties for both themes, typography, resets, and font loading.

**Files:**
- Create: `src/styles/global.css`
- Create: `public/fonts/` (download font files)

- [ ] **Step 1: Download fonts**

Download Inter and Playfair Display woff2 files from Google Fonts and place in `public/fonts/`. Alternatively, use Google Fonts CDN (simpler for now):

We'll use Google Fonts CDN loaded in the base layout (Task 3). No local font files needed initially.

- [ ] **Step 2: Create global.css**

Create `src/styles/global.css`:

```css
/* ========================================
   Design System — Frank Enendu Portfolio
   ======================================== */

/* --- Reset --- */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

img,
picture,
video,
canvas,
svg {
  display: block;
  max-width: 100%;
}

a {
  color: inherit;
  text-decoration: none;
}

/* --- Theme Variables --- */
:root {
  /* Dark mode (default) */
  --bg-primary: #0a0a0a;
  --bg-secondary: #141414;
  --bg-tertiary: #1e1e1e;
  --text-primary: #ffffff;
  --text-secondary: #a0a0a0;
  --text-muted: #666666;
  --accent: #e94560;
  --accent-hover: #ff5a75;
  --border: #2a2a2a;

  /* Spacing scale */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 2rem;
  --space-xl: 4rem;
  --space-2xl: 8rem;

  /* Typography */
  --font-heading: "Playfair Display", Georgia, serif;
  --font-body: "Inter", system-ui, sans-serif;
  --font-code: "JetBrains Mono", monospace;

  /* Layout */
  --max-width: 1200px;
  --nav-height: 64px;

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 300ms ease;
}

[data-theme="light"] {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --bg-tertiary: #ebebeb;
  --text-primary: #0a0a0a;
  --text-secondary: #4a4a4a;
  --text-muted: #888888;
  --accent: #e94560;
  --accent-hover: #d13350;
  --border: #e0e0e0;
}

/* --- Base Styles --- */
body {
  font-family: var(--font-body);
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-primary);
  background-color: var(--bg-primary);
  transition: background-color var(--transition-normal),
              color var(--transition-normal);
}

h1, h2, h3, h4 {
  font-family: var(--font-heading);
  font-weight: 700;
  line-height: 1.2;
  color: var(--text-primary);
}

h1 { font-size: clamp(2.5rem, 6vw, 4rem); }
h2 { font-size: clamp(1.75rem, 4vw, 2.5rem); }
h3 { font-size: clamp(1.25rem, 3vw, 1.5rem); }

p {
  color: var(--text-secondary);
  max-width: 65ch;
}

code {
  font-family: var(--font-code);
  font-size: 0.875em;
}

/* --- Utilities --- */
.container {
  width: 100%;
  max-width: var(--max-width);
  margin-inline: auto;
  padding-inline: var(--space-lg);
}

.section {
  padding-block: var(--space-2xl);
}

.accent {
  color: var(--accent);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* --- Buttons --- */
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 0.75rem 1.5rem;
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-primary {
  background: var(--accent);
  color: #ffffff;
}

.btn-primary:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
}

.btn-outline {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border);
}

.btn-outline:hover {
  border-color: var(--accent);
  color: var(--accent);
}

/* --- Links --- */
.link {
  color: var(--accent);
  transition: color var(--transition-fast);
}

.link:hover {
  color: var(--accent-hover);
}

/* --- Tags/Pills --- */
.tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 9999px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border: 1px solid var(--border);
}

/* --- Cards --- */
.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: var(--space-lg);
  transition: border-color var(--transition-fast),
              transform var(--transition-fast);
}

.card:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
}

/* --- Reduced motion --- */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 3: Verify CSS renders**

Create a temporary `src/pages/index.astro` that imports the CSS:

```astro
---
import "../styles/global.css";
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Frank Enendu</title>
  </head>
  <body>
    <div class="container section">
      <h1>Frank Enendu</h1>
      <p class="accent">AI Engineer</p>
      <p>Design system test page.</p>
      <button class="btn btn-primary">Primary Button</button>
      <button class="btn btn-outline">Outline Button</button>
      <span class="tag">Python</span>
      <span class="tag">FastAPI</span>
    </div>
  </body>
</html>
```

```bash
npx astro dev
```

Open `http://localhost:4321`. Verify: dark background, white text, coral accent, serif heading, sans body. Ctrl+C to stop.

- [ ] **Step 4: Commit**

```bash
git add src/styles/global.css src/pages/index.astro
git commit -m "feat: add design system with dark/light theme CSS variables"
```

---

## Task 3: Base Layout + SEO Component

**Goal:** Reusable layout with `<head>` (fonts, meta, OG tags), skip-to-content link, and slots for page content.

**Files:**
- Create: `src/components/SEO.astro`
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/lib/constants.ts`

- [ ] **Step 1: Create constants**

Create `src/lib/constants.ts`:

```ts
export const SITE = {
  title: "Frank Enendu",
  description:
    "AI Engineer & Solutions Architect. I design and build production AI systems — from LLM pipelines to enterprise infrastructure.",
  url: "https://frankenendu.github.io",
  author: "Frank Enendu",
  email: "enendufrankc@gmail.com",
};

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
] as const;

export const SOCIAL_LINKS = {
  github: "https://github.com/enendufrankc",
  linkedin: "https://www.linkedin.com/in/enendu-frank-chinedu/",
  medium: "https://medium.com/@enendufrankc",
} as const;

export const PROJECT_DOMAINS = [
  "All",
  "AI Safety",
  "Developer Tools",
  "Multi-Agent Systems",
  "Healthcare",
  "Finance & Legal",
  "Enterprise",
  "Generative AI",
  "Computer Vision",
] as const;
```

- [ ] **Step 2: Create SEO component**

Create `src/components/SEO.astro`:

```astro
---
interface Props {
  title?: string;
  description?: string;
  image?: string;
  type?: "website" | "article";
}

import { SITE } from "../lib/constants";

const {
  title = SITE.title,
  description = SITE.description,
  image = "/images/og-default.png",
  type = "website",
} = Astro.props;

const pageTitle = title === SITE.title ? title : `${title} | ${SITE.title}`;
const canonicalURL = new URL(Astro.url.pathname, SITE.url);
---

<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{pageTitle}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonicalURL} />
<meta name="author" content={SITE.author} />

<!-- Open Graph -->
<meta property="og:type" content={type} />
<meta property="og:url" content={canonicalURL} />
<meta property="og:title" content={pageTitle} />
<meta property="og:description" content={description} />
<meta property="og:image" content={new URL(image, SITE.url)} />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={pageTitle} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={new URL(image, SITE.url)} />

<!-- Favicon -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />

<!-- Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@600;700&family=JetBrains+Mono:wght@400&display=swap"
  rel="stylesheet"
/>
```

- [ ] **Step 3: Create BaseLayout**

Create `src/layouts/BaseLayout.astro`:

```astro
---
import "../styles/global.css";
import SEO from "../components/SEO.astro";

interface Props {
  title?: string;
  description?: string;
  image?: string;
  type?: "website" | "article";
}

const { title, description, image, type } = Astro.props;
---

<html lang="en">
  <head>
    <SEO title={title} description={description} image={image} type={type} />
  </head>
  <body>
    <a href="#main" class="sr-only">Skip to content</a>

    <!-- Navbar slot filled in Task 4 -->
    <slot name="nav" />

    <main id="main">
      <slot />
    </main>

    <!-- Footer slot filled in Task 4 -->
    <slot name="footer" />

    <!-- Theme initialization (no flash) -->
    <script is:inline>
      (function () {
        const saved = localStorage.getItem("theme");
        if (saved === "light") {
          document.documentElement.setAttribute("data-theme", "light");
        }
      })();
    </script>
  </body>
</html>
```

- [ ] **Step 4: Update index.astro to use layout**

Replace `src/pages/index.astro`:

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
---

<BaseLayout>
  <div class="container section">
    <h1>Frank Enendu</h1>
    <p class="accent">AI Engineer</p>
    <p>Layout test — fonts and SEO meta loading.</p>
  </div>
</BaseLayout>
```

- [ ] **Step 5: Verify**

```bash
npx astro dev
```

Open `http://localhost:4321`. Verify: Playfair Display on heading, Inter on body, dark theme, page title in browser tab. View source: confirm OG meta tags are present. Ctrl+C.

- [ ] **Step 6: Commit**

```bash
git add src/components/SEO.astro src/layouts/BaseLayout.astro src/lib/constants.ts src/pages/index.astro
git commit -m "feat: add base layout with SEO component and site constants"
```

---

## Task 4: Navbar + Footer + Theme Toggle

**Goal:** Fixed navbar with nav links, social icons, and a dark/light theme toggle. Footer with attribution.

**Files:**
- Create: `src/components/ThemeToggle.tsx`
- Create: `src/components/Navbar.astro`
- Create: `src/components/Footer.astro`
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Create ThemeToggle React island**

Create `src/components/ThemeToggle.tsx`:

```tsx
import { useState, useEffect } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "dark" | "light" | null;
    if (saved) setTheme(saved);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    if (next === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        fontSize: "1.25rem",
        color: "var(--text-primary)",
        padding: "0.5rem",
        transition: "transform 300ms ease",
        transform: theme === "light" ? "rotate(180deg)" : "rotate(0deg)",
      }}
    >
      {theme === "dark" ? "\u2600\uFE0F" : "\uD83C\uDF19"}
    </button>
  );
}
```

- [ ] **Step 2: Create Navbar**

Create `src/components/Navbar.astro`:

```astro
---
import { NAV_LINKS } from "../lib/constants";
import ThemeToggle from "./ThemeToggle.tsx";

const currentPath = Astro.url.pathname;
---

<nav class="navbar" id="navbar">
  <div class="navbar__inner container">
    <a href="/" class="navbar__logo">FE</a>

    <button class="navbar__hamburger" aria-label="Toggle menu" aria-expanded="false">
      <span></span>
      <span></span>
      <span></span>
    </button>

    <div class="navbar__links">
      {NAV_LINKS.map((link) => (
        <a
          href={link.href}
          class:list={["navbar__link", { active: currentPath === link.href || (link.href !== "/" && currentPath.startsWith(link.href)) }]}
        >
          {link.label}
        </a>
      ))}
      <ThemeToggle client:load />
    </div>
  </div>
</nav>

<style>
  .navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    height: var(--nav-height);
    background: transparent;
    transition: background var(--transition-normal);
  }

  .navbar.scrolled {
    background: var(--bg-primary);
    border-bottom: 1px solid var(--border);
    backdrop-filter: blur(8px);
  }

  .navbar__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
  }

  .navbar__logo {
    font-family: var(--font-heading);
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--accent);
  }

  .navbar__links {
    display: flex;
    align-items: center;
    gap: var(--space-lg);
  }

  .navbar__link {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-secondary);
    transition: color var(--transition-fast);
  }

  .navbar__link:hover,
  .navbar__link.active {
    color: var(--accent);
  }

  .navbar__hamburger {
    display: none;
    flex-direction: column;
    gap: 5px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
  }

  .navbar__hamburger span {
    display: block;
    width: 24px;
    height: 2px;
    background: var(--text-primary);
    transition: all var(--transition-fast);
  }

  @media (max-width: 768px) {
    .navbar__hamburger {
      display: flex;
    }

    .navbar__links {
      display: none;
      position: absolute;
      top: var(--nav-height);
      left: 0;
      right: 0;
      flex-direction: column;
      padding: var(--space-lg);
      background: var(--bg-primary);
      border-bottom: 1px solid var(--border);
    }

    .navbar__links.open {
      display: flex;
    }
  }
</style>

<script>
  // Scroll detection for navbar background
  const navbar = document.getElementById("navbar");
  if (navbar) {
    window.addEventListener("scroll", () => {
      navbar.classList.toggle("scrolled", window.scrollY > 50);
    });
  }

  // Mobile hamburger toggle
  const hamburger = document.querySelector(".navbar__hamburger");
  const links = document.querySelector(".navbar__links");
  if (hamburger && links) {
    hamburger.addEventListener("click", () => {
      const isOpen = links.classList.toggle("open");
      hamburger.setAttribute("aria-expanded", String(isOpen));
    });
  }
</script>
```

- [ ] **Step 3: Create Footer**

Create `src/components/Footer.astro`:

```astro
---
import { SOCIAL_LINKS } from "../lib/constants";
---

<footer class="footer">
  <div class="container footer__inner">
    <div class="footer__social">
      <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
        GitHub
      </a>
      <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
        LinkedIn
      </a>
      <a href={SOCIAL_LINKS.medium} target="_blank" rel="noopener noreferrer" aria-label="Medium">
        Medium
      </a>
    </div>
    <p class="footer__copy">
      &copy; {new Date().getFullYear()} Frank Enendu. Design: <a href="https://html5up.net" class="link" target="_blank" rel="noopener noreferrer">HTML5 UP</a> (original template).
    </p>
  </div>
</footer>

<style>
  .footer {
    padding: var(--space-xl) 0;
    border-top: 1px solid var(--border);
  }

  .footer__inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-md);
    text-align: center;
  }

  .footer__social {
    display: flex;
    gap: var(--space-lg);
  }

  .footer__social a {
    color: var(--text-secondary);
    font-size: 0.875rem;
    transition: color var(--transition-fast);
  }

  .footer__social a:hover {
    color: var(--accent);
  }

  .footer__copy {
    font-size: 0.75rem;
    color: var(--text-muted);
  }
</style>
```

- [ ] **Step 4: Wire navbar and footer into BaseLayout**

Modify `src/layouts/BaseLayout.astro` — replace the nav/footer slot comments:

```astro
---
import "../styles/global.css";
import SEO from "../components/SEO.astro";
import Navbar from "../components/Navbar.astro";
import Footer from "../components/Footer.astro";

interface Props {
  title?: string;
  description?: string;
  image?: string;
  type?: "website" | "article";
}

const { title, description, image, type } = Astro.props;
---

<html lang="en">
  <head>
    <SEO title={title} description={description} image={image} type={type} />
  </head>
  <body>
    <a href="#main" class="sr-only">Skip to content</a>
    <Navbar />

    <main id="main">
      <slot />
    </main>

    <Footer />

    <script is:inline>
      (function () {
        const saved = localStorage.getItem("theme");
        if (saved === "light") {
          document.documentElement.setAttribute("data-theme", "light");
        }
      })();
    </script>
  </body>
</html>
```

- [ ] **Step 5: Verify**

```bash
npx astro dev
```

Open `http://localhost:4321`. Verify: navbar fixed at top (transparent initially, solid after scrolling), "FE" logo in coral, nav links, theme toggle works (click toggles dark/light, persists on refresh), footer at bottom with social links. On mobile viewport (resize to <768px): hamburger appears, links collapse. Ctrl+C.

- [ ] **Step 6: Commit**

```bash
git add src/components/ThemeToggle.tsx src/components/Navbar.astro src/components/Footer.astro src/layouts/BaseLayout.astro
git commit -m "feat: add navbar with theme toggle, footer, and mobile menu"
```

---

## Task 5: Hero Section with Particle Animation

**Goal:** Full-viewport hero with connected node particle network, name, title, tagline, and CTA.

**Files:**
- Create: `src/components/ParticleHero.tsx`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create ParticleHero React island**

Create `src/components/ParticleHero.tsx`:

```tsx
import { useCallback } from "react";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine } from "@tsparticles/engine";

export default function ParticleHero() {
  const init = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <Particles
      id="hero-particles"
      init={init}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
      }}
      options={{
        fullScreen: false,
        fpsLimit: 60,
        interactivity: {
          events: {
            onHover: { enable: true, mode: "grab" },
          },
          modes: {
            grab: {
              distance: 180,
              links: { opacity: 0.8 },
            },
          },
        },
        particles: {
          color: { value: ["#ffffff", "#e94560"] },
          links: {
            color: "#ffffff",
            distance: 130,
            enable: true,
            opacity: 0.15,
            width: 1,
          },
          move: {
            enable: true,
            speed: 1.2,
            outModes: { default: "bounce" },
          },
          number: {
            density: { enable: true, area: 800 },
            value: 80,
          },
          opacity: { value: { min: 0.3, max: 0.8 } },
          shape: { type: "circle" },
          size: { value: { min: 1, max: 3 } },
        },
        responsive: [
          {
            maxWidth: 768,
            options: {
              particles: { number: { value: 30 } },
            },
          },
        ],
        detectRetina: true,
      }}
    />
  );
}
```

- [ ] **Step 2: Build the hero section in index.astro**

Replace `src/pages/index.astro`:

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import ParticleHero from "../components/ParticleHero.tsx";
---

<BaseLayout>
  <section class="hero">
    <ParticleHero client:only="react" />
    <div class="hero__content">
      <h1 class="hero__name">Frank Enendu</h1>
      <p class="hero__title">AI Engineer</p>
      <p class="hero__tagline">
        I design and build production AI systems &mdash; from LLM pipelines to enterprise infrastructure.
      </p>
      <a href="#featured" class="btn btn-primary hero__cta">View my work</a>
    </div>
  </section>

  <section id="featured" class="section container">
    <h2>Featured Projects</h2>
    <p>Coming soon — project cards go here.</p>
  </section>
</BaseLayout>

<style>
  .hero {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    overflow: hidden;
  }

  .hero__content {
    position: relative;
    z-index: 1;
    text-align: center;
    padding: var(--space-lg);
    max-width: 700px;
  }

  .hero__name {
    font-size: clamp(3rem, 8vw, 6rem);
    margin-bottom: var(--space-sm);
  }

  .hero__title {
    font-family: var(--font-body);
    font-size: clamp(1.25rem, 3vw, 1.75rem);
    font-weight: 500;
    color: var(--accent);
    margin-bottom: var(--space-md);
  }

  .hero__tagline {
    font-size: clamp(1rem, 2vw, 1.125rem);
    color: var(--text-secondary);
    margin-bottom: var(--space-xl);
    max-width: 100%;
  }
</style>
```

- [ ] **Step 3: Verify**

```bash
npx astro dev
```

Open `http://localhost:4321`. Verify: full-screen hero with particle animation behind text, coral and white nodes drifting and connecting, mouse hover causes nearby particles to connect with brighter lines, "Frank Enendu" in large serif, "AI Engineer" in coral, tagline below, "View my work" button scrolls to featured section. On mobile: fewer particles. Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add src/components/ParticleHero.tsx src/pages/index.astro
git commit -m "feat: add hero section with interactive particle network animation"
```

---

## Task 6: Content Collections — Projects + Blog

**Goal:** Define Astro content collections for projects and blog posts with typed frontmatter. Create all 12 project markdown files and 1 initial blog post.

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/projects/*.md` (12 files)
- Create: `src/content/blog/welcome.md`

- [ ] **Step 1: Define content collection schemas**

Create `src/content.config.ts`:

```ts
import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    domain: z.string(),
    tech: z.array(z.string()),
    github: z.string().url().nullable(),
    demo: z.string().url().nullable(),
    article: z.string().url().nullable(),
    image: z.string(),
    featured: z.boolean().default(false),
    order: z.number(),
    tier: z.enum(["flagship", "supporting", "breadth"]),
    status: z.enum(["public", "private", "client-work"]),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, blog };
```

- [ ] **Step 2: Create flagship project files**

Create `src/content/projects/safeai.md`:

```markdown
---
title: "SafeAI"
description: "Runtime security framework for AI agents — policy engine, encrypted memory, capability tokens, and adapters for every major AI framework."
domain: "AI Safety"
tech: ["Python", "FastAPI", "Pydantic", "Click", "PyYAML", "cryptography"]
github: "https://github.com/safeai-sdk/safeai"
demo: null
article: null
image: "/images/projects/safeai.png"
featured: true
order: 1
tier: "flagship"
status: "public"
---

## The Problem

AI agents are shipping to production with zero runtime security. Model safety training alone cannot prevent API keys leaking in prompts, customer PII exposure in responses, or unauthorized tool calls. There was no framework-agnostic solution that enforces security policies at the exact boundaries where data moves.

## My Approach

I built SafeAI as a runtime security layer that sits between AI agents and the outside world. It enforces policies at three boundaries: input (scanning prompts before they reach the model), action (intercepting tool calls and agent-to-agent messages), and output (guarding responses before they reach users).

The architecture is framework-agnostic with middleware adapters for LangChain, CrewAI, AutoGen, Claude ADK, and Google ADK. It can be deployed as a Python SDK (two lines of code), a sidecar HTTP proxy (zero code changes), or an MCP server for coding agents.

## Key Features

- **Policy engine**: YAML-based priority-ordered rules with default-deny, hot reload, and multi-tenant isolation
- **9 detector categories**: API keys, emails, PII, dangerous commands, prompt injection, toxicity — all local, no external API calls
- **Encrypted memory**: Schema-enforced with field-level Fernet encryption and auto-expiry
- **Capability tokens**: Scoped, time-limited, per-agent, per-tool
- **Intelligence layer**: 5 AI advisory agents for auto-config, policy recommendations, and incident explanation
- **Deployment modes**: SDK, sidecar proxy, gateway proxy, MCP server, CLI hooks

## Results & Impact

Published on PyPI as `safeai-sdk` with 5 releases. 16,800 lines of production Python, 40+ test files, 55+ pages of MkDocs documentation, 11 CI workflows including CodeQL and secret scanning. Apache 2.0 licensed under the `safeai-sdk` GitHub organization.
```

Create `src/content/projects/aigen.md`:

```markdown
---
title: "AiGen"
description: "Local control plane for coding agents — discovers running AI agents, tracks sessions, exposes REST API + CLI + web dashboard + TUI."
domain: "Developer Tools"
tech: ["Python", "FastAPI", "React", "TypeScript", "SQLite", "Click", "Textual"]
github: null
demo: null
article: null
image: "/images/projects/aigen.png"
featured: true
order: 2
tier: "flagship"
status: "private"
---

## The Problem

AI coding agents (Claude Code, Codex, Copilot, Gemini, Goose, OpenCode) run as isolated processes with no visibility into what they're doing. When multiple agents work on the same codebase, there's no coordination, no session history, and no way to detect conflicts.

## My Approach

AiGen is a local control plane that discovers running AI agent processes via process inspection, enriches sessions with git context, stores structured events in SQLite, and exposes multiple interfaces for visibility and control: a REST API, a CLI, a React web dashboard, and a terminal TUI.

## Key Features

- **Agent discovery**: Automatic detection of 6+ coding agent types via process inspection
- **Session tracking**: Git-aware context enrichment, SQLite storage in WAL mode
- **Multi-interface**: REST API (FastAPI), CLI (Click), web dashboard (React + Vite + Tailwind), TUI (Textual)
- **Webhook ingestors**: Hook into agent events
- **Memory and handoff**: Cross-agent session handoff and collision detection
- **LLM abstraction**: Provider layer supporting Anthropic, OpenAI, Google, and Ollama

## Results & Impact

44 Python modules, 39+ test files with CI coverage enforcement (>=75%), Homebrew formula for distribution. Supports Python 3.10/3.11/3.12.
```

Create `src/content/projects/fairlens.md`:

```markdown
---
title: "FairLens"
description: "Multi-agent AI platform for fair opportunity allocation — grants, scholarships, and applications processed by 7 specialized AI agents."
domain: "Multi-Agent Systems"
tech: ["Next.js", "FastAPI", "Google ADK", "LiteLLM", "Prisma", "Stripe", "Clerk", "Playwright"]
github: null
demo: null
article: null
image: "/images/projects/fairlens.png"
featured: true
order: 3
tier: "flagship"
status: "private"
---

## The Problem

Application review processes for grants, scholarships, and funding opportunities are slow, inconsistent, and prone to human bias. Reviewers spend hours on each application, and decisions vary wildly between reviewers.

## My Approach

FairLens is a Turborepo monorepo with a Next.js web app, Node.js API with Prisma ORM, and a Python FastAPI AI service. The AI layer uses Google ADK (Agent Development Kit) with 7 specialized agents: document analysis, text analysis, video analysis, link analysis, synthesis, scoring, and feedback generation. LiteLLM provides multi-provider fallback across Gemini, OpenAI, and Anthropic.

## Key Features

- **7 specialized agents**: Each handles a different aspect of application review
- **Multi-provider LLM**: LiteLLM gateway with automatic fallback
- **Full SaaS stack**: Clerk authentication, Stripe billing, user migration scripts
- **E2E testing**: Playwright test suite for critical user flows
- **Cloud deployment**: Railway with Docker Compose orchestration

## Results & Impact

Complete monorepo architecture with 13 planning documents covering product spec, system architecture, AI agents spec, user flows, data models, and ADRs.
```

Create `src/content/projects/casereviewer.md`:

```markdown
---
title: "CaseReviewer"
description: "AI-powered EB-1A visa petition analyzer — analyzes petitions against 1,500+ precedent USCIS decisions with hybrid vector + BM25 search."
domain: "Finance & Legal"
tech: ["FastAPI", "Azure OpenAI", "Azure AI Search", "PostgreSQL", "Celery", "Redis", "Terraform", "Stripe"]
github: null
demo: null
article: null
image: "/images/projects/casereviewer.png"
featured: false
order: 4
tier: "flagship"
status: "private"
---

## The Problem

EB-1A extraordinary ability visa petitions require evidence that a candidate meets specific USCIS criteria. Attorneys spend days analyzing precedent decisions manually. There was no tool that could automatically compare a petition against the body of precedent law.

## My Approach

Built a full-stack AI platform: PDF upload, text extraction, per-criterion LLM analysis using Azure OpenAI (GPT-4o), and precedent-case similarity search using Azure AI Search with hybrid vector + BM25 retrieval and LLM reranking. A noisy-OR probability model scores the petition's strength.

## Key Features

- **Hybrid search**: Vector + BM25 over 1,500+ USCIS decisions with LLM reranking
- **Per-criterion analysis**: Breaks down petition against each EB-1A criterion
- **Production infrastructure**: Celery + Redis for async processing, PostgreSQL with async SQLAlchemy
- **Multi-currency payments**: Stripe, PayPal, and Paystack integration
- **Infrastructure as Code**: Terraform for Azure Container Apps deployment
- **CI/CD**: Azure DevOps pipelines

## Results & Impact

Production-deployed system with freemium paywall, admin dashboard, JWT + OAuth authentication, and complete IaC deployment pipeline.
```

- [ ] **Step 3: Create supporting project files**

Create `src/content/projects/personal-copilot.md`:

```markdown
---
title: "Personal Copilot"
description: "AI-powered life and finance planner with FastAPI backend and React Native mobile app, powered by Claude."
domain: "Finance & Legal"
tech: ["FastAPI", "React Native", "Expo", "Claude API", "Plaid", "SQLite"]
github: null
demo: null
article: null
image: "/images/projects/personal-copilot.png"
featured: false
order: 5
tier: "supporting"
status: "private"
---

## The Problem

Personal planning tools are either too simple (todo lists) or too complex (enterprise project management). None integrate AI-driven advice with real financial data to help individuals make better life decisions.

## My Approach

Full-stack AI application with a FastAPI backend (17 route modules, 12 services) and React Native (Expo) mobile frontend. Claude powers the AI layer with a custom prompt registry, tone enforcer, and fallback handling. Plaid API provides real financial account integration.

## Key Features

- **17 route modules**: Planning, goals, routines, scheduling, calendar, reminders, budgeting, voice interaction, memory, adaptation, health tracking, reviews, notifications, consent
- **Claude-powered AI**: Custom prompt registry and tone enforcement
- **Financial integration**: Plaid API for real bank account data
- **Mobile-first**: React Native (Expo 52) with TanStack Query and shared API contracts

## Results & Impact

Comprehensive personal AI assistant covering life planning, finance, health, and daily routines with both API and mobile interfaces.
```

Create `src/content/projects/multi-modal-content.md`:

```markdown
---
title: "Multi-Modal Content Generator"
description: "AI-powered marketing campaign generator producing text, images, audio, and video content."
domain: "Generative AI"
tech: ["FastAPI", "OpenAI", "DALL-E 3", "MoviePy", "Docker", "Railway"]
github: null
demo: null
article: null
image: "/images/projects/multi-modal.png"
featured: false
order: 6
tier: "supporting"
status: "private"
---

## The Problem

Marketing teams need consistent campaigns across text, image, audio, and video — but creating these assets manually is expensive and slow.

## My Approach

Built an AI agent system with specialized agents (content validation, headline specialist, caption specialist, image generation, audio generation) orchestrated by a FastAPI backend. DALL-E 3 handles image generation, TTS produces audio, and MoviePy assembles video content.

## Key Features

- **Multi-agent pipeline**: Specialized agents for each content type
- **Multi-modal output**: Text, images (DALL-E 3), audio (TTS), and video (MoviePy)
- **Production deployment**: Docker containers on Railway

## Results & Impact

End-to-end content generation from a single campaign brief, producing assets across four modalities.
```

Create `src/content/projects/nova.md`:

```markdown
---
title: "Nova"
description: "Medical document text extraction using Azure GPT-4o vision capabilities."
domain: "Healthcare"
tech: ["Python", "Flask", "Azure OpenAI", "GPT-4o Vision", "Azure Blob Storage", "Docker"]
github: null
demo: null
article: null
image: "/images/projects/nova.png"
featured: false
order: 7
tier: "supporting"
status: "private"
---

## The Problem

Healthcare organizations need to extract structured text from medical documents, scanned PDFs, and clinical images. Traditional OCR struggles with handwritten notes and complex medical layouts.

## My Approach

Built a Flask application that leverages Azure OpenAI's GPT-4o vision capabilities to extract and structure text from medical images and PDFs. Documents are stored in Azure Blob Storage and processed through the vision API.

## Key Features

- **GPT-4o vision**: Leverages multimodal LLM for superior text extraction from complex medical documents
- **Azure integration**: Blob Storage for documents, OpenAI for processing
- **Enterprise-ready**: .NET integration documentation for embedding into existing healthcare systems

## Results & Impact

Deployed for medical document processing with enterprise integration capabilities.
```

Create `src/content/projects/sharepoint-search.md`:

```markdown
---
title: "SharePoint to Azure AI Search"
description: "Library for indexing SharePoint Online content into Azure AI Search with security trimming."
domain: "Enterprise"
tech: ["Python", "Microsoft Graph API", "Azure AI Search", "MSAL"]
github: "https://github.com/enendufrankc/SharePoint-Indexing-to-Azure-Cognitive-Search"
demo: null
article: null
image: "/images/projects/sharepoint-search.png"
featured: false
order: 8
tier: "supporting"
status: "public"
---

## The Problem

Enterprise organizations store documents across SharePoint sites but need them searchable through Azure AI Search — with security trimming that respects SharePoint permissions.

## My Approach

Built a Python library with a `SharePointDataExtractor` class using dependency injection. The library authenticates via MSAL, retrieves content through Microsoft Graph API, processes documents, and indexes them into Azure AI Search with security metadata preserved.

## Key Features

- **Security trimming**: Preserves SharePoint permissions in search results
- **Microsoft Graph API**: Full SharePoint Online content extraction
- **MSAL authentication**: Enterprise-grade auth flow
- **Dependency injection**: Clean, testable architecture

## Results & Impact

Open-source library solving a real enterprise search integration problem.
```

- [ ] **Step 4: Create breadth-tier project files**

Create `src/content/projects/nhs-chatbot.md`:

```markdown
---
title: "NHS Performance Report Chatbot"
description: "Chat application that interacts with PublicView NHS benchmarking database and generates PDF reports using LLMs."
domain: "Healthcare"
tech: ["Python", "Azure OpenAI", "PublicView API"]
github: null
demo: null
article: null
image: "/images/projects/nhs-chatbot.png"
featured: false
order: 9
tier: "breadth"
status: "client-work"
---

## Overview

Built at BCN Group for an NHS client. A chat application that queries the PublicView database (NHS Benchmarking tool) and uses LLMs to generate formatted PDF performance reports from natural language queries.
```

Create `src/content/projects/agent2agent.md`:

```markdown
---
title: "Agent2Agent"
description: "Demos for Google's Agent-to-Agent (A2A) protocol — multi-agent friend scheduling and simple agent implementations."
domain: "Multi-Agent Systems"
tech: ["Python", "Google A2A SDK"]
github: "https://github.com/enendufrankc/Agent2Agent"
demo: null
article: null
image: "/images/projects/agent2agent.png"
featured: false
order: 10
tier: "breadth"
status: "public"
---

## Overview

Exploration of Google's A2A (Agent-to-Agent) protocol with demo implementations: a simple agent and a multi-agent friend scheduling system demonstrating inter-agent communication and task coordination.
```

Create `src/content/projects/llm-game-recommender.md`:

```markdown
---
title: "LLM Game Recommender"
description: "Slot game recommender using OpenAI embeddings and vector similarity with a Streamlit interface."
domain: "Generative AI"
tech: ["Python", "OpenAI Embeddings", "Streamlit", "Vector Similarity"]
github: "https://github.com/enendufrankc/LLM-Powered-Game-Recommender-Prototype"
demo: null
article: null
image: "/images/projects/game-recommender.png"
featured: false
order: 11
tier: "breadth"
status: "public"
---

## Overview

A prototype game recommendation engine that uses OpenAI embeddings to represent game attributes as vectors, then applies similarity search to recommend games based on player preferences. Built with a Streamlit UI for interactive exploration.
```

Create `src/content/projects/semantic-segmentation.md`:

```markdown
---
title: "Semantic Segmentation"
description: "Pixel-level object classification for autonomous driving using the Cambridge Labeled Objects in Video dataset."
domain: "Computer Vision"
tech: ["Python", "TensorFlow", "Keras", "OpenCV"]
github: "https://github.com/enendufrankc/Object-Detection"
demo: null
article: "https://medium.com/@enendufrankc/implementing-semantic-segmentation-12b5394e6b49"
image: "/images/projects/semantic-seg.png"
featured: false
order: 12
tier: "breadth"
status: "public"
---

## Overview

Implemented semantic segmentation on the Cambridge Labeled Objects in Video dataset (101 images, 960x720 pixels). Each pixel classified into one of 32 object classes relevant to autonomous driving scenarios using deep learning architectures.
```

- [ ] **Step 5: Create initial blog post**

Create `src/content/blog/welcome.md`:

```markdown
---
title: "Building My AI-Powered Portfolio"
description: "How I rebuilt my portfolio from scratch using Astro, Vercel, and a Gemini-powered chatbot."
pubDate: 2026-04-10
tags: ["astro", "portfolio", "ai", "gemini"]
draft: false
---

This site is a complete rebuild of my portfolio. I moved from a static HTML5 UP template to a modern Astro site with a conversational AI interface. Here's why and how.

## Why Rebuild?

My old portfolio was built on the Massively template by HTML5 UP — a great starting point, but it didn't reflect who I am as an engineer in 2026. It showed undergraduate projects and a 3-year-old CV. Meanwhile, I'd been building production AI systems, leading an engineering team, and shipping open-source tools.

## The Tech Stack

- **Astro** for the framework — content-first, ships zero JS by default, perfect for a portfolio
- **Vercel** for hosting — free serverless functions power the chatbot
- **tsParticles** for the hero animation — connected node graph that responds to your mouse
- **GSAP** for scroll animations
- **Google Gemini** for the conversational chatbot

More details coming soon.
```

- [ ] **Step 6: Verify content collections load**

```bash
npx astro build
```

Expected: Build succeeds. Check console for "Generated X pages" — should include project and blog routes once pages are wired up (Task 7-8).

- [ ] **Step 7: Commit**

```bash
git add src/content.config.ts src/content/
git commit -m "feat: add content collections with 12 project case studies and initial blog post"
```

---

## Task 7: Projects Grid Page

**Goal:** `/projects` page with a filterable grid of project cards.

**Files:**
- Create: `src/components/ProjectCard.astro`
- Create: `src/components/ProjectFilter.tsx`
- Create: `src/pages/projects/index.astro`

- [ ] **Step 1: Create ProjectCard**

Create `src/components/ProjectCard.astro`:

```astro
---
interface Props {
  title: string;
  description: string;
  domain: string;
  tech: string[];
  image: string;
  slug: string;
  tier: string;
  status: string;
}

const { title, description, domain, tech, image, slug, tier, status } = Astro.props;
---

<a href={`/projects/${slug}`} class="project-card card" data-domain={domain}>
  <div class="project-card__image">
    <img src={image} alt={`${title} screenshot`} loading="lazy" />
  </div>
  <div class="project-card__body">
    <div class="project-card__meta">
      <span class="tag">{domain}</span>
      {status === "public" && <span class="tag" style="border-color: var(--accent); color: var(--accent);">Open Source</span>}
    </div>
    <h3 class="project-card__title">{title}</h3>
    <p class="project-card__desc">{description}</p>
    <div class="project-card__tech">
      {tech.slice(0, 4).map((t) => (
        <span class="project-card__tech-tag">{t}</span>
      ))}
    </div>
  </div>
</a>

<style>
  .project-card {
    display: flex;
    flex-direction: column;
    text-decoration: none;
    overflow: hidden;
    padding: 0;
  }

  .project-card__image {
    aspect-ratio: 16 / 9;
    overflow: hidden;
    background: var(--bg-tertiary);
  }

  .project-card__image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform var(--transition-normal);
  }

  .project-card:hover .project-card__image img {
    transform: scale(1.05);
  }

  .project-card__body {
    padding: var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    flex: 1;
  }

  .project-card__meta {
    display: flex;
    gap: var(--space-sm);
    flex-wrap: wrap;
  }

  .project-card__title {
    font-size: 1.25rem;
  }

  .project-card__desc {
    font-size: 0.875rem;
    line-height: 1.5;
    flex: 1;
  }

  .project-card__tech {
    display: flex;
    gap: var(--space-xs);
    flex-wrap: wrap;
    margin-top: auto;
  }

  .project-card__tech-tag {
    font-size: 0.7rem;
    padding: 0.15rem 0.5rem;
    border-radius: 4px;
    background: var(--bg-tertiary);
    color: var(--text-muted);
  }
</style>
```

- [ ] **Step 2: Create ProjectFilter React island**

Create `src/components/ProjectFilter.tsx`:

```tsx
import { useState } from "react";
import { PROJECT_DOMAINS } from "../lib/constants";

export default function ProjectFilter() {
  const [active, setActive] = useState("All");

  function handleFilter(domain: string) {
    setActive(domain);
    const cards = document.querySelectorAll<HTMLElement>("[data-domain]");
    cards.forEach((card) => {
      if (domain === "All" || card.dataset.domain === domain) {
        card.style.display = "";
      } else {
        card.style.display = "none";
      }
    });
  }

  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "2rem" }}>
      {PROJECT_DOMAINS.map((domain) => (
        <button
          key={domain}
          onClick={() => handleFilter(domain)}
          style={{
            padding: "0.5rem 1rem",
            fontSize: "0.8rem",
            fontWeight: 500,
            borderRadius: "9999px",
            border: "1px solid",
            borderColor: active === domain ? "var(--accent)" : "var(--border)",
            background: active === domain ? "var(--accent)" : "transparent",
            color: active === domain ? "#ffffff" : "var(--text-secondary)",
            cursor: "pointer",
            transition: "all 150ms ease",
            fontFamily: "var(--font-body)",
          }}
        >
          {domain}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create projects index page**

Create `src/pages/projects/index.astro`:

```astro
---
import BaseLayout from "../../layouts/BaseLayout.astro";
import ProjectCard from "../../components/ProjectCard.astro";
import ProjectFilter from "../../components/ProjectFilter.tsx";
import { getCollection } from "astro:content";

const allProjects = await getCollection("projects");
const projects = allProjects.sort((a, b) => a.data.order - b.data.order);

export const prerender = true;
---

<BaseLayout title="Projects" description="AI and ML projects by Frank Enendu — from open-source security frameworks to production enterprise systems.">
  <section class="section container">
    <header class="projects-header">
      <h1>Projects</h1>
      <p>A curated selection of my work across AI safety, developer tools, healthcare, and enterprise systems.</p>
    </header>

    <ProjectFilter client:load />

    <div class="projects-grid">
      {projects.map((project) => (
        <ProjectCard
          title={project.data.title}
          description={project.data.description}
          domain={project.data.domain}
          tech={project.data.tech}
          image={project.data.image}
          slug={project.id}
          tier={project.data.tier}
          status={project.data.status}
        />
      ))}
    </div>
  </section>
</BaseLayout>

<style>
  .projects-header {
    padding-top: calc(var(--nav-height) + var(--space-xl));
    margin-bottom: var(--space-xl);
  }

  .projects-header p {
    margin-top: var(--space-md);
  }

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: var(--space-lg);
  }
</style>
```

- [ ] **Step 4: Verify**

```bash
npx astro dev
```

Open `http://localhost:4321/projects`. Verify: grid of 12 project cards, domain filter buttons at top, clicking a domain filters the grid, clicking "All" shows everything. Cards show placeholder image (gray box — images not yet added), title, description, tech tags. Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git add src/components/ProjectCard.astro src/components/ProjectFilter.tsx src/pages/projects/index.astro
git commit -m "feat: add projects grid page with domain filtering"
```

---

## Task 8: Project Case Study Pages

**Goal:** Dynamic pages for individual project case studies rendered from markdown.

**Files:**
- Create: `src/pages/projects/[...slug].astro`
- Create: `src/layouts/ProjectLayout.astro`

- [ ] **Step 1: Create ProjectLayout**

Create `src/layouts/ProjectLayout.astro`:

```astro
---
interface Props {
  title: string;
  description: string;
  domain: string;
  tech: string[];
  github: string | null;
  demo: string | null;
  article: string | null;
  image: string;
  status: string;
}

import BaseLayout from "./BaseLayout.astro";

const { title, description, domain, tech, github, demo, article, image, status } = Astro.props;
---

<BaseLayout title={title} description={description} image={image} type="article">
  <article class="case-study section container">
    <header class="case-study__header">
      <a href="/projects" class="link">&larr; All Projects</a>
      <div class="case-study__meta">
        <span class="tag">{domain}</span>
        {status === "public" && <span class="tag" style="border-color: var(--accent); color: var(--accent);">Open Source</span>}
      </div>
      <h1>{title}</h1>
      <p class="case-study__desc">{description}</p>
      <div class="case-study__links">
        {github && <a href={github} target="_blank" rel="noopener noreferrer" class="btn btn-outline">GitHub</a>}
        {demo && <a href={demo} target="_blank" rel="noopener noreferrer" class="btn btn-primary">Live Demo</a>}
        {article && <a href={article} target="_blank" rel="noopener noreferrer" class="btn btn-outline">Read Article</a>}
      </div>
      <div class="case-study__tech">
        {tech.map((t) => <span class="tag">{t}</span>)}
      </div>
    </header>

    <div class="case-study__content prose">
      <slot />
    </div>
  </article>
</BaseLayout>

<style>
  .case-study__header {
    padding-top: calc(var(--nav-height) + var(--space-xl));
    margin-bottom: var(--space-xl);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .case-study__meta {
    display: flex;
    gap: var(--space-sm);
  }

  .case-study__desc {
    font-size: 1.125rem;
  }

  .case-study__links {
    display: flex;
    gap: var(--space-md);
    flex-wrap: wrap;
  }

  .case-study__tech {
    display: flex;
    gap: var(--space-sm);
    flex-wrap: wrap;
  }

  /* Prose styles for markdown content */
  .prose {
    max-width: 75ch;
  }

  .prose :global(h2) {
    margin-top: var(--space-xl);
    margin-bottom: var(--space-md);
  }

  .prose :global(h3) {
    margin-top: var(--space-lg);
    margin-bottom: var(--space-sm);
  }

  .prose :global(p) {
    margin-bottom: var(--space-md);
    max-width: 75ch;
  }

  .prose :global(ul),
  .prose :global(ol) {
    margin-bottom: var(--space-md);
    padding-left: var(--space-lg);
    color: var(--text-secondary);
  }

  .prose :global(li) {
    margin-bottom: var(--space-xs);
  }

  .prose :global(strong) {
    color: var(--text-primary);
  }

  .prose :global(code) {
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
    background: var(--bg-tertiary);
    font-size: 0.85em;
  }

  .prose :global(pre) {
    padding: var(--space-lg);
    border-radius: 8px;
    margin-bottom: var(--space-md);
    overflow-x: auto;
  }
</style>
```

- [ ] **Step 2: Create dynamic route**

Create `src/pages/projects/[...slug].astro`:

```astro
---
import { getCollection, render } from "astro:content";
import ProjectLayout from "../../layouts/ProjectLayout.astro";

export async function getStaticPaths() {
  const projects = await getCollection("projects");
  return projects.map((project) => ({
    params: { slug: project.id },
    props: { project },
  }));
}

const { project } = Astro.props;
const { Content } = await render(project);

export const prerender = true;
---

<ProjectLayout
  title={project.data.title}
  description={project.data.description}
  domain={project.data.domain}
  tech={project.data.tech}
  github={project.data.github}
  demo={project.data.demo}
  article={project.data.article}
  image={project.data.image}
  status={project.data.status}
>
  <Content />
</ProjectLayout>
```

- [ ] **Step 3: Verify**

```bash
npx astro dev
```

Open `http://localhost:4321/projects/safeai`. Verify: case study page renders with header (back link, domain tag, title, description, GitHub button, tech tags) and markdown content (The Problem, My Approach, Key Features, Results & Impact). Check `http://localhost:4321/projects/aigen` similarly. Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/ProjectLayout.astro src/pages/projects/\[...slug\].astro
git commit -m "feat: add dynamic project case study pages"
```

---

## Task 9: Blog List + Blog Post Pages

**Goal:** `/blog` page listing all posts, and dynamic individual post pages.

**Files:**
- Create: `src/components/BlogCard.astro`
- Create: `src/pages/blog/index.astro`
- Create: `src/pages/blog/[...slug].astro`
- Create: `src/layouts/BlogLayout.astro`

- [ ] **Step 1: Create BlogCard**

Create `src/components/BlogCard.astro`:

```astro
---
interface Props {
  title: string;
  description: string;
  pubDate: Date;
  tags: string[];
  slug: string;
}

const { title, description, pubDate, tags, slug } = Astro.props;
const formattedDate = new Intl.DateTimeFormat("en-GB", {
  year: "numeric",
  month: "long",
  day: "numeric",
}).format(pubDate);
---

<a href={`/blog/${slug}`} class="blog-card card">
  <time class="blog-card__date" datetime={pubDate.toISOString()}>{formattedDate}</time>
  <h3 class="blog-card__title">{title}</h3>
  <p class="blog-card__desc">{description}</p>
  <div class="blog-card__tags">
    {tags.map((tag) => <span class="tag">{tag}</span>)}
  </div>
</a>

<style>
  .blog-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    text-decoration: none;
  }

  .blog-card__date {
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  .blog-card__title {
    font-size: 1.25rem;
  }

  .blog-card__desc {
    font-size: 0.875rem;
    flex: 1;
  }

  .blog-card__tags {
    display: flex;
    gap: var(--space-xs);
    flex-wrap: wrap;
    margin-top: auto;
  }
</style>
```

- [ ] **Step 2: Create blog index page**

Create `src/pages/blog/index.astro`:

```astro
---
import BaseLayout from "../../layouts/BaseLayout.astro";
import BlogCard from "../../components/BlogCard.astro";
import { getCollection } from "astro:content";

const allPosts = await getCollection("blog", ({ data }) => !data.draft);
const posts = allPosts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

export const prerender = true;
---

<BaseLayout title="Blog" description="Writing about AI engineering, LLMOps, and building production AI systems.">
  <section class="section container">
    <header class="blog-header">
      <h1>Blog</h1>
      <p>Thoughts on AI engineering, open source, and building things that work.</p>
    </header>

    <div class="blog-grid">
      {posts.map((post) => (
        <BlogCard
          title={post.data.title}
          description={post.data.description}
          pubDate={post.data.pubDate}
          tags={post.data.tags}
          slug={post.id}
        />
      ))}
    </div>

    {posts.length === 0 && (
      <p style="color: var(--text-muted); text-align: center; padding: var(--space-2xl) 0;">
        Posts coming soon.
      </p>
    )}
  </section>
</BaseLayout>

<style>
  .blog-header {
    padding-top: calc(var(--nav-height) + var(--space-xl));
    margin-bottom: var(--space-xl);
  }

  .blog-header p {
    margin-top: var(--space-md);
  }

  .blog-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: var(--space-lg);
  }
</style>
```

- [ ] **Step 3: Create BlogLayout**

Create `src/layouts/BlogLayout.astro`:

```astro
---
interface Props {
  title: string;
  description: string;
  pubDate: Date;
  tags: string[];
}

import BaseLayout from "./BaseLayout.astro";

const { title, description, pubDate, tags } = Astro.props;
const formattedDate = new Intl.DateTimeFormat("en-GB", {
  year: "numeric",
  month: "long",
  day: "numeric",
}).format(pubDate);
---

<BaseLayout title={title} description={description} type="article">
  <article class="blog-post section container">
    <header class="blog-post__header">
      <a href="/blog" class="link">&larr; All Posts</a>
      <time datetime={pubDate.toISOString()}>{formattedDate}</time>
      <h1>{title}</h1>
      <div class="blog-post__tags">
        {tags.map((tag) => <span class="tag">{tag}</span>)}
      </div>
    </header>

    <div class="prose">
      <slot />
    </div>
  </article>
</BaseLayout>

<style>
  .blog-post__header {
    padding-top: calc(var(--nav-height) + var(--space-xl));
    margin-bottom: var(--space-xl);
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .blog-post__header time {
    font-size: 0.875rem;
    color: var(--text-muted);
  }

  .blog-post__tags {
    display: flex;
    gap: var(--space-sm);
    flex-wrap: wrap;
  }
</style>
```

- [ ] **Step 4: Create dynamic blog route**

Create `src/pages/blog/[...slug].astro`:

```astro
---
import { getCollection, render } from "astro:content";
import BlogLayout from "../../layouts/BlogLayout.astro";

export async function getStaticPaths() {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await render(post);

export const prerender = true;
---

<BlogLayout
  title={post.data.title}
  description={post.data.description}
  pubDate={post.data.pubDate}
  tags={post.data.tags}
>
  <Content />
</BlogLayout>
```

- [ ] **Step 5: Verify**

```bash
npx astro dev
```

Open `http://localhost:4321/blog`. Verify: blog list shows the welcome post. Click through to `http://localhost:4321/blog/welcome` — verify post renders with date, title, tags, and markdown content with syntax highlighting. Ctrl+C.

- [ ] **Step 6: Commit**

```bash
git add src/components/BlogCard.astro src/pages/blog/ src/layouts/BlogLayout.astro
git commit -m "feat: add blog list and dynamic blog post pages"
```

---

## Task 10: About Page

**Goal:** About page with professional bio, career timeline, skills, education, CV download, and contact section.

**Files:**
- Create: `src/components/Timeline.astro`
- Create: `src/pages/about.astro`

- [ ] **Step 1: Create Timeline component**

Create `src/components/Timeline.astro`:

```astro
---
const roles = [
  { period: "Jan 2026 — Present", title: "AI Engineer R&D", company: "Bally's Interactive", location: "Manchester, UK", highlight: "R&D on AI systems for the gaming and entertainment industry." },
  { period: "May 2024 — Jan 2026", title: "AI Engineer", company: "BCN Group", location: "Manchester, UK", highlight: "Led the AI Procode Engineering team. Delivered AI solutions across Healthcare, Finance, Utilities, HR, and Oil & Gas." },
  { period: "Aug 2023 — May 2024", title: "Graduate Engineer", company: "BCN Group", location: "Manchester, UK", highlight: "Built knowledge base chat apps with Azure OpenAI, anomaly detection systems, and email classification pipelines." },
  { period: "Jul — Sep 2023", title: "Data Scientist", company: "Studio 14", location: "Birmingham, UK", highlight: "Short-term data science engagement during MSc completion." },
  { period: "Dec 2021 — Dec 2022", title: "Junior Data Scientist", company: "HubPay", location: "UAE", highlight: "Customer sentiment analysis, market segmentation for 163K+ customers, FX competitive analysis." },
  { period: "Apr 2021 — Sep 2022", title: "Data & Research Analyst", company: "Enterprise Development Centre", location: "Lagos, Nigeria", highlight: "Power BI dashboards, BI system optimization (25% reduction in downtime)." },
  { period: "May 2020 — Feb 2021", title: "Business Analyst", company: "Sunnet Systems Ltd", location: "Lagos, Nigeria", highlight: "CRM implementation, data-driven reporting, vendor management for 35% of annual revenue." },
  { period: "Apr 2019 — Apr 2020", title: "BI & Product Intern", company: "Wakanow", location: "Lagos, Nigeria", highlight: "Interactive dashboards in Power BI and Tableau; 25% reduction in employee turnover, 20% increase in customer satisfaction." },
];
---

<div class="timeline">
  {roles.map((role, i) => (
    <div class:list={["timeline__item", { "timeline__item--right": i % 2 !== 0 }]}>
      <div class="timeline__dot"></div>
      <div class="timeline__card card">
        <span class="timeline__period">{role.period}</span>
        <h3 class="timeline__title">{role.title}</h3>
        <p class="timeline__company">{role.company} &middot; {role.location}</p>
        <p class="timeline__highlight">{role.highlight}</p>
      </div>
    </div>
  ))}
</div>

<style>
  .timeline {
    position: relative;
    max-width: 800px;
    margin: 0 auto;
    padding: var(--space-lg) 0;
  }

  .timeline::before {
    content: "";
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 2px;
    background: var(--border);
    transform: translateX(-50%);
  }

  .timeline__item {
    position: relative;
    width: 50%;
    padding-right: var(--space-xl);
    padding-bottom: var(--space-lg);
  }

  .timeline__item--right {
    margin-left: 50%;
    padding-right: 0;
    padding-left: var(--space-xl);
  }

  .timeline__dot {
    position: absolute;
    right: -6px;
    top: var(--space-lg);
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--accent);
    border: 2px solid var(--bg-primary);
  }

  .timeline__item--right .timeline__dot {
    right: auto;
    left: -6px;
  }

  .timeline__card {
    padding: var(--space-md);
  }

  .timeline__period {
    font-size: 0.8rem;
    color: var(--accent);
    font-weight: 500;
  }

  .timeline__title {
    font-size: 1.1rem;
    margin-top: var(--space-xs);
  }

  .timeline__company {
    font-size: 0.85rem;
    color: var(--text-muted);
    margin-top: var(--space-xs);
  }

  .timeline__highlight {
    font-size: 0.85rem;
    margin-top: var(--space-sm);
  }

  @media (max-width: 768px) {
    .timeline::before {
      left: 0;
    }

    .timeline__item,
    .timeline__item--right {
      width: 100%;
      margin-left: 0;
      padding-left: var(--space-xl);
      padding-right: 0;
    }

    .timeline__dot,
    .timeline__item--right .timeline__dot {
      left: -6px;
      right: auto;
    }
  }
</style>
```

- [ ] **Step 2: Create About page**

Create `src/pages/about.astro`:

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import Timeline from "../components/Timeline.astro";
import { SITE, SOCIAL_LINKS } from "../lib/constants";

export const prerender = true;
---

<BaseLayout title="About" description="Frank Enendu — AI Engineer with 3+ years building production AI systems across healthcare, finance, and enterprise.">
  <section class="section container about">
    <header class="about__header">
      <h1>About Me</h1>
    </header>

    <!-- Bio -->
    <div class="about__bio">
      <p>
        I'm an AI Engineer based in Manchester, currently working in R&D at Bally's Interactive. I design and build production AI systems — from LLM-powered applications and multi-agent architectures to enterprise search and anomaly detection pipelines.
      </p>
      <p>
        My career started in Lagos, Nigeria, where I cut my teeth on data analytics and business intelligence at companies like Wakanow and the Enterprise Development Centre. I moved to the UK to pursue a Master's in Data Science and AI at the University of Liverpool, graduating with Distinction. Since then, I've led the AI Procode Engineering team at BCN Group, delivering solutions across Healthcare (NHS), Finance, Utilities, and Oil & Gas — before moving to my current R&D role.
      </p>
      <p>
        Outside of work, I build open-source tools. <a href="/projects/safeai" class="link">SafeAI</a> is a runtime security framework for AI agents, published on PyPI. <a href="/projects/aigen" class="link">AiGen</a> is a local control plane for coding agents. I believe in building things that solve real problems and sharing them openly.
      </p>
    </div>

    <!-- Career Timeline -->
    <div class="about__section">
      <h2>Experience</h2>
      <Timeline />
    </div>

    <!-- Skills -->
    <div class="about__section">
      <h2>Skills & Expertise</h2>
      <div class="skills-grid">
        <div>
          <h3>AI Engineering</h3>
          <div class="skills-tags">
            <span class="tag">Agentic Workflows</span>
            <span class="tag">RAG</span>
            <span class="tag">Prompt Engineering</span>
            <span class="tag">Fine-Tuning</span>
            <span class="tag">MCP Design</span>
          </div>
        </div>
        <div>
          <h3>Frameworks</h3>
          <div class="skills-tags">
            <span class="tag">LangChain</span>
            <span class="tag">CrewAI</span>
            <span class="tag">Google ADK</span>
            <span class="tag">AutoGen</span>
            <span class="tag">Anthropic SDK</span>
          </div>
        </div>
        <div>
          <h3>Cloud & Infra</h3>
          <div class="skills-tags">
            <span class="tag">Azure AI</span>
            <span class="tag">Azure OpenAI</span>
            <span class="tag">GCP Vertex AI</span>
            <span class="tag">AWS SageMaker</span>
            <span class="tag">Docker</span>
            <span class="tag">Terraform</span>
          </div>
        </div>
        <div>
          <h3>Languages & Tools</h3>
          <div class="skills-tags">
            <span class="tag">Python</span>
            <span class="tag">TypeScript</span>
            <span class="tag">React</span>
            <span class="tag">FastAPI</span>
            <span class="tag">Next.js</span>
            <span class="tag">PostgreSQL</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Education -->
    <div class="about__section">
      <h2>Education & Certification</h2>
      <div class="education">
        <div class="card" style="padding: var(--space-md);">
          <h3>MSc Data Science & AI <span class="accent">(Distinction)</span></h3>
          <p style="color: var(--text-muted); font-size: 0.875rem;">University of Liverpool &middot; 2022 — 2023</p>
        </div>
        <div class="card" style="padding: var(--space-md);">
          <h3>Azure AI Engineer Associate</h3>
          <p style="color: var(--text-muted); font-size: 0.875rem;">Microsoft Certified</p>
        </div>
        <div class="card" style="padding: var(--space-md);">
          <h3>BTech Logistics Management</h3>
          <p style="color: var(--text-muted); font-size: 0.875rem;">Federal University of Technology Owerri &middot; 2013 — 2018</p>
        </div>
      </div>
    </div>

    <!-- CV Download -->
    <div class="about__section" style="text-align: center;">
      <a href="/frank-enendu-cv.pdf" class="btn btn-primary" download>Download my CV</a>
    </div>

    <!-- Contact -->
    <div class="about__section contact-section">
      <h2>Get in Touch</h2>
      <p>Interested in working together? I'm available for consulting on AI/ML engineering, LLMOps, and building production AI systems.</p>
      <div class="contact-links">
        <a href={`mailto:${SITE.email}`} class="btn btn-primary">Email Me</a>
        <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" class="btn btn-outline">LinkedIn</a>
        <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" class="btn btn-outline">GitHub</a>
      </div>
      <p style="color: var(--text-muted); font-size: 0.875rem; margin-top: var(--space-md);">
        Or ask my AI assistant anything about me — look for the chat button in the bottom right.
      </p>
    </div>
  </section>
</BaseLayout>

<style>
  .about__header {
    padding-top: calc(var(--nav-height) + var(--space-xl));
    margin-bottom: var(--space-xl);
  }

  .about__bio {
    max-width: 75ch;
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    margin-bottom: var(--space-2xl);
  }

  .about__section {
    margin-bottom: var(--space-2xl);
  }

  .about__section h2 {
    margin-bottom: var(--space-lg);
  }

  .skills-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: var(--space-lg);
  }

  .skills-grid h3 {
    font-size: 1rem;
    margin-bottom: var(--space-sm);
    color: var(--accent);
    font-family: var(--font-body);
    font-weight: 600;
  }

  .skills-tags {
    display: flex;
    gap: var(--space-xs);
    flex-wrap: wrap;
  }

  .education {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--space-md);
  }

  .contact-section {
    text-align: center;
    padding: var(--space-xl);
    background: var(--bg-secondary);
    border-radius: 16px;
    border: 1px solid var(--border);
  }

  .contact-section p {
    margin-inline: auto;
  }

  .contact-links {
    display: flex;
    gap: var(--space-md);
    justify-content: center;
    margin-top: var(--space-lg);
    flex-wrap: wrap;
  }
</style>
```

- [ ] **Step 3: Verify**

```bash
npx astro dev
```

Open `http://localhost:4321/about`. Verify: bio text, alternating career timeline with coral dots, skills grouped in grid, education cards, CV download button, contact section with email/LinkedIn/GitHub buttons. Mobile: timeline collapses to single column. Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add src/components/Timeline.astro src/pages/about.astro
git commit -m "feat: add about page with bio, career timeline, skills, and contact"
```

---

## Task 11: Complete Home Page

**Goal:** Wire up the home page with featured projects, brief about, latest blog posts, and contact CTA.

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Build complete home page**

Replace `src/pages/index.astro`:

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import ParticleHero from "../components/ParticleHero.tsx";
import ProjectCard from "../components/ProjectCard.astro";
import BlogCard from "../components/BlogCard.astro";
import { getCollection } from "astro:content";
import { SITE, SOCIAL_LINKS } from "../lib/constants";

const allProjects = await getCollection("projects");
const featuredProjects = allProjects
  .filter((p) => p.data.featured)
  .sort((a, b) => a.data.order - b.data.order)
  .slice(0, 3);

const allPosts = await getCollection("blog", ({ data }) => !data.draft);
const latestPosts = allPosts
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
  .slice(0, 3);

export const prerender = true;
---

<BaseLayout>
  <!-- Hero -->
  <section class="hero">
    <ParticleHero client:only="react" />
    <div class="hero__content">
      <h1 class="hero__name">Frank Enendu</h1>
      <p class="hero__title">AI Engineer</p>
      <p class="hero__tagline">
        I design and build production AI systems &mdash; from LLM pipelines to enterprise infrastructure.
      </p>
      <a href="#featured" class="btn btn-primary hero__cta">View my work</a>
    </div>
  </section>

  <!-- Featured Projects -->
  <section id="featured" class="section container">
    <div class="section-header">
      <h2>Featured Projects</h2>
      <a href="/projects" class="link">See all projects &rarr;</a>
    </div>
    <div class="featured-grid">
      {featuredProjects.map((project) => (
        <ProjectCard
          title={project.data.title}
          description={project.data.description}
          domain={project.data.domain}
          tech={project.data.tech}
          image={project.data.image}
          slug={project.id}
          tier={project.data.tier}
          status={project.data.status}
        />
      ))}
    </div>
  </section>

  <!-- Brief About -->
  <section class="section container about-brief">
    <h2>About Me</h2>
    <p>
      AI Engineer with 3+ years building production systems across 6+ industries. MSc with Distinction from the University of Liverpool. Currently in R&D at Bally's Interactive. Previously led the AI engineering team at BCN Group, delivering solutions for NHS, finance, and energy clients.
    </p>
    <a href="/about" class="link">Learn more &rarr;</a>
  </section>

  <!-- Latest Blog Posts -->
  {latestPosts.length > 0 && (
    <section class="section container">
      <div class="section-header">
        <h2>Latest Writing</h2>
        <a href="/blog" class="link">All posts &rarr;</a>
      </div>
      <div class="blog-grid">
        {latestPosts.map((post) => (
          <BlogCard
            title={post.data.title}
            description={post.data.description}
            pubDate={post.data.pubDate}
            tags={post.data.tags}
            slug={post.id}
          />
        ))}
      </div>
    </section>
  )}

  <!-- Contact CTA -->
  <section class="section container">
    <div class="cta-section">
      <h2>Let's work together</h2>
      <p>I'm available for consulting on AI engineering, LLMOps, multi-agent systems, and production AI infrastructure.</p>
      <div class="cta-links">
        <a href={`mailto:${SITE.email}`} class="btn btn-primary">Get in touch</a>
        <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" class="btn btn-outline">LinkedIn</a>
      </div>
    </div>
  </section>
</BaseLayout>

<style>
  .hero {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    overflow: hidden;
  }

  .hero__content {
    position: relative;
    z-index: 1;
    text-align: center;
    padding: var(--space-lg);
    max-width: 700px;
  }

  .hero__name {
    font-size: clamp(3rem, 8vw, 6rem);
    margin-bottom: var(--space-sm);
  }

  .hero__title {
    font-family: var(--font-body);
    font-size: clamp(1.25rem, 3vw, 1.75rem);
    font-weight: 500;
    color: var(--accent);
    margin-bottom: var(--space-md);
  }

  .hero__tagline {
    font-size: clamp(1rem, 2vw, 1.125rem);
    color: var(--text-secondary);
    margin-bottom: var(--space-xl);
    max-width: 100%;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: var(--space-xl);
    flex-wrap: wrap;
    gap: var(--space-md);
  }

  .featured-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: var(--space-lg);
  }

  .about-brief {
    max-width: 75ch;
  }

  .about-brief p {
    margin-block: var(--space-md);
  }

  .blog-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: var(--space-lg);
  }

  .cta-section {
    text-align: center;
    padding: var(--space-xl);
    background: var(--bg-secondary);
    border-radius: 16px;
    border: 1px solid var(--border);
  }

  .cta-section p {
    margin: var(--space-md) auto;
  }

  .cta-links {
    display: flex;
    gap: var(--space-md);
    justify-content: center;
    margin-top: var(--space-lg);
    flex-wrap: wrap;
  }
</style>
```

- [ ] **Step 2: Verify**

```bash
npx astro dev
```

Open `http://localhost:4321`. Verify: hero with particles, scroll down to featured projects (SafeAI, AiGen, FairLens), brief about section, latest blog post, contact CTA at bottom. Navigate between all pages via navbar. Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: complete home page with featured projects, about, blog, and CTA sections"
```

---

## Task 12: GSAP Scroll Animations

**Goal:** Add fade-in and slide animations to page elements as they scroll into view.

**Files:**
- Create: `src/components/ScrollAnimations.astro`
- Modify: `src/layouts/BaseLayout.astro`
- Create: `src/styles/animations.css`

- [ ] **Step 1: Create animation CSS classes**

Create `src/styles/animations.css`:

```css
/* Initial states for scroll-triggered animations */
.animate-fade-in {
  opacity: 0;
  transform: translateY(20px);
}

.animate-slide-left {
  opacity: 0;
  transform: translateX(-40px);
}

.animate-slide-right {
  opacity: 0;
  transform: translateX(40px);
}

.animate-scale-in {
  opacity: 0;
  transform: scale(0.95);
}

/* Animated state (added by GSAP) */
.animated {
  opacity: 1;
  transform: none;
}
```

- [ ] **Step 2: Create ScrollAnimations component**

Create `src/components/ScrollAnimations.astro`:

```astro
<script>
  import gsap from "gsap";
  import { ScrollTrigger } from "gsap/ScrollTrigger";

  gsap.registerPlugin(ScrollTrigger);

  // Respect reduced motion preference
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!prefersReducedMotion) {
    // Fade in elements
    gsap.utils.toArray<HTMLElement>(".animate-fade-in").forEach((el, i) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: i * 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            once: true,
          },
        }
      );
    });

    // Slide left
    gsap.utils.toArray<HTMLElement>(".animate-slide-left").forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, x: -40 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            once: true,
          },
        }
      );
    });

    // Slide right
    gsap.utils.toArray<HTMLElement>(".animate-slide-right").forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, x: 40 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            once: true,
          },
        }
      );
    });

    // Scale in (for cards)
    gsap.utils.toArray<HTMLElement>(".animate-scale-in").forEach((el, i) => {
      gsap.fromTo(
        el,
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          delay: i * 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            once: true,
          },
        }
      );
    });
  } else {
    // If reduced motion, just show everything immediately
    document
      .querySelectorAll(".animate-fade-in, .animate-slide-left, .animate-slide-right, .animate-scale-in")
      .forEach((el) => {
        (el as HTMLElement).style.opacity = "1";
        (el as HTMLElement).style.transform = "none";
      });
  }
</script>
```

- [ ] **Step 3: Add ScrollAnimations to BaseLayout**

Modify `src/layouts/BaseLayout.astro` — add the import and component before the closing `</body>` tag:

Add at the top of the frontmatter:
```astro
import ScrollAnimations from "../components/ScrollAnimations.astro";
```

Add before the closing `</body>`:
```astro
<ScrollAnimations />
```

Also import the animations CSS:
```astro
import "../styles/animations.css";
```

- [ ] **Step 4: Add animation classes to home page elements**

Modify `src/pages/index.astro` — add CSS classes to key elements:

- Add `class="animate-fade-in"` to the `<h2>` headings in each section
- Add `class="animate-scale-in"` to each `<ProjectCard>` wrapper and `<BlogCard>` wrapper
- Add `class="animate-fade-in"` to the `.cta-section` div
- Add `class="animate-fade-in"` to the `.about-brief` section

This involves adding wrapper `<div>` elements with the animation classes around the cards in the grids.

- [ ] **Step 5: Verify**

```bash
npx astro dev
```

Open `http://localhost:4321`. Scroll down slowly. Verify: sections fade in as they enter viewport, cards scale up slightly, animations are smooth and staggered. Set browser to "prefers-reduced-motion: reduce" in dev tools — verify all elements appear immediately without animation. Ctrl+C.

- [ ] **Step 6: Commit**

```bash
git add src/styles/animations.css src/components/ScrollAnimations.astro src/layouts/BaseLayout.astro src/pages/index.astro
git commit -m "feat: add GSAP scroll-triggered animations"
```

---

## Task 13: Chatbot — React Island + Vercel Serverless

**Goal:** Floating chatbot button that opens a chat panel. Messages go to a Vercel serverless function that calls Gemini.

**Files:**
- Create: `src/lib/chatbot.ts`
- Create: `src/components/ChatBot.tsx`
- Create: `src/pages/api/chat.ts`
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Create chatbot types and client logic**

Create `src/lib/chatbot.ts`:

```ts
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function sendMessage(
  messages: ChatMessage[],
  userMessage: string
): Promise<string> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [...messages, { role: "user", content: userMessage }],
    }),
  });

  if (!response.ok) {
    throw new Error("Chat request failed");
  }

  const data = await response.json();
  return data.reply;
}
```

- [ ] **Step 2: Create the Vercel serverless API route**

Create `src/pages/api/chat.ts`:

```ts
import type { APIRoute } from "astro";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are Frank Enendu's AI assistant on his portfolio website. You know everything about Frank and can answer questions about his professional background, skills, projects, and availability.

## About Frank
Frank Enendu is an AI Engineer based in Manchester, UK. He currently works as AI Engineer R&D at Bally's Interactive (since January 2026). Previously, he was Senior AI/ML Engineer at BCN Group (2023-2026) where he led the AI Procode Engineering team.

He holds an MSc in Data Science and Artificial Intelligence (Distinction) from the University of Liverpool, and a Microsoft Azure AI Engineer Associate certification.

## Career Arc
- Started in Lagos, Nigeria with data analytics and BI roles (Wakanow, Enterprise Development Centre, Sunnet Systems)
- Moved to HubPay as Junior Data Scientist (Dec 2021 - Dec 2022)
- MSc at University of Liverpool (2022-2023, Distinction)
- BCN Group: Graduate Engineer -> AI Engineer -> led the AI Procode Engineering team
- Currently: AI Engineer R&D at Bally's Interactive

## Key Skills
AI Engineering, Agentic Workflows, RAG, Prompt Engineering, LLMOps, MLOps, LangChain, CrewAI, Google ADK, AutoGen, Azure AI (OpenAI, AI Search, Synapse, Fabrics), Python, TypeScript, FastAPI, React, Next.js, Docker, Terraform.

## Flagship Projects
1. SafeAI - Runtime security framework for AI agents. Published on PyPI as safeai-sdk. 16,800 lines of Python. Policy engine, encrypted memory, capability tokens. Open source under Apache 2.0.
2. AiGen - Local control plane for coding agents. Discovers running AI agents, tracks sessions, REST API + CLI + web dashboard + TUI.
3. FairLens - Multi-agent AI platform for fair opportunity allocation with 7 specialized agents.
4. CaseReviewer - AI-powered EB-1A visa petition analyzer with hybrid vector+BM25 search.

## Industries
Healthcare (NHS), Finance, Utilities, HR, Oil & Gas, Gaming/Entertainment.

## Personality
Frank is professional but warm, direct, and enthusiastic about AI. He enjoys building things, contributing to open source, and exploring new technologies.

## Contact
Email: enendufrankc@gmail.com
LinkedIn: linkedin.com/in/enendu-frank-chinedu/
GitHub: github.com/enendufrankc

## Boundaries
- Answer professional questions about Frank's work, skills, and projects
- Have light personal conversation (interests, career motivations)
- Do NOT make commitments, quotes, or promises on Frank's behalf
- Do NOT share his phone number or home address
- Politely redirect off-topic questions back to Frank's professional context
- You are NOT a general-purpose AI assistant — focus on Frank`;

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.GEMINI_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Chat is not configured" }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { messages } = await request.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Rate limit: reject if too many messages in one session
    if (messages.length > 50) {
      return new Response(
        JSON.stringify({ error: "Conversation too long. Please refresh to start a new chat." }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Build conversation history for Gemini
    const history = messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history,
      systemInstruction: SYSTEM_PROMPT,
    });

    const lastMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastMessage);
    const reply = result.response.text();

    return new Response(
      JSON.stringify({ reply }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
```

- [ ] **Step 3: Create ChatBot React island**

Create `src/components/ChatBot.tsx`:

```tsx
import { useState, useRef, useEffect } from "react";
import type { ChatMessage } from "../lib/chatbot";
import { sendMessage } from "../lib/chatbot";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm Frank's AI assistant. Ask me anything about his experience, projects, or skills.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  async function handleSend() {
    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");
    const userMsg: ChatMessage = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setIsLoading(true);

    try {
      const reply = await sendMessage(
        messages.filter((m) => m !== messages[0]),
        text
      );
      setMessages([...updated, { role: "assistant", content: reply }]);
    } catch {
      setMessages([
        ...updated,
        { role: "assistant", content: "Sorry, I couldn't process that. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close chat" : "Chat with AI assistant"}
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "#e94560",
          color: "#ffffff",
          border: "none",
          cursor: "pointer",
          fontSize: "1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          boxShadow: "0 4px 16px rgba(233, 69, 96, 0.3)",
          transition: "transform 300ms ease, box-shadow 300ms ease",
          transform: isOpen ? "rotate(45deg)" : "rotate(0)",
        }}
      >
        {isOpen ? "+" : "\u{1F4AC}"}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "5rem",
            right: "1.5rem",
            width: "min(400px, calc(100vw - 2rem))",
            height: "min(500px, calc(100vh - 8rem))",
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            display: "flex",
            flexDirection: "column",
            zIndex: 999,
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "1rem",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)" }}>
              Ask me about Frank
            </span>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                fontSize: "1.25rem",
              }}
              aria-label="Close chat"
            >
              &times;
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "80%",
                  padding: "0.75rem 1rem",
                  borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  background: msg.role === "user" ? "#e94560" : "var(--bg-tertiary)",
                  color: msg.role === "user" ? "#ffffff" : "var(--text-primary)",
                  fontSize: "0.875rem",
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                }}
              >
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div
                style={{
                  alignSelf: "flex-start",
                  padding: "0.75rem 1rem",
                  borderRadius: "16px 16px 16px 4px",
                  background: "var(--bg-tertiary)",
                  color: "var(--text-muted)",
                  fontSize: "0.875rem",
                }}
              >
                Thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: "0.75rem",
              borderTop: "1px solid var(--border)",
              display: "flex",
              gap: "0.5rem",
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about Frank's work..."
              style={{
                flex: 1,
                padding: "0.625rem 1rem",
                background: "var(--bg-primary)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                color: "var(--text-primary)",
                fontSize: "0.875rem",
                fontFamily: "var(--font-body)",
                outline: "none",
              }}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              style={{
                padding: "0.625rem 1rem",
                background: isLoading || !input.trim() ? "var(--bg-tertiary)" : "#e94560",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
                fontFamily: "var(--font-body)",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              Send
            </button>
          </div>

          {/* Footer */}
          <div
            style={{
              textAlign: "center",
              padding: "0.5rem",
              fontSize: "0.7rem",
              color: "var(--text-muted)",
            }}
          >
            Powered by Gemini
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 4: Add ChatBot to BaseLayout**

Modify `src/layouts/BaseLayout.astro` — add the import and component:

Add to frontmatter:
```astro
import ChatBot from "../components/ChatBot.tsx";
```

Add before `<ScrollAnimations />`:
```astro
<ChatBot client:idle />
```

- [ ] **Step 5: Create .env for local testing**

```bash
echo "GEMINI_API_KEY=your_key_here" > .env
```

Replace `your_key_here` with an actual Gemini API key from Google AI Studio for local testing.

- [ ] **Step 6: Verify**

```bash
npx astro dev
```

Open `http://localhost:4321`. Verify: coral chat button in bottom-right corner. Click it — panel slides open. Type "What does Frank do?" and send. If API key is configured, get a response about Frank's work. If not, get a graceful error. Close button works. Panel is responsive. Ctrl+C.

- [ ] **Step 7: Commit**

```bash
git add src/lib/chatbot.ts src/components/ChatBot.tsx src/pages/api/chat.ts src/layouts/BaseLayout.astro .env.example
git commit -m "feat: add Gemini-powered chatbot with serverless API route"
```

---

## Task 14: SEO — Sitemap, Robots, Structured Data

**Goal:** Add sitemap generation, robots.txt, and JSON-LD structured data.

**Files:**
- Create: `public/robots.txt`
- Create: `public/favicon.svg`
- Modify: `astro.config.mjs` (add sitemap integration)
- Modify: `src/components/SEO.astro` (add JSON-LD)

- [ ] **Step 1: Install sitemap integration**

```bash
npx astro add sitemap --yes
```

- [ ] **Step 2: Update astro.config.mjs**

Add sitemap to the config:

```js
import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://frankenendu.github.io",
  output: "server",
  adapter: vercel(),
  integrations: [react(), sitemap()],
  markdown: {
    shikiConfig: {
      theme: "github-dark",
      wrap: true,
    },
  },
});
```

- [ ] **Step 3: Create robots.txt**

Create `public/robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://frankenendu.github.io/sitemap-index.xml
```

- [ ] **Step 4: Create favicon**

Create `public/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="12" fill="#0a0a0a"/>
  <text x="50" y="68" font-family="Georgia, serif" font-size="54" font-weight="700" fill="#e94560" text-anchor="middle">FE</text>
</svg>
```

- [ ] **Step 5: Add JSON-LD to SEO component**

Modify `src/components/SEO.astro` — add before the closing of the component:

```astro
<!-- Structured Data -->
<script type="application/ld+json" set:html={JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Frank Enendu",
  url: SITE.url,
  jobTitle: "AI Engineer",
  worksFor: {
    "@type": "Organization",
    name: "Bally's Interactive",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "University of Liverpool",
  },
  sameAs: [
    "https://www.linkedin.com/in/enendu-frank-chinedu/",
    "https://github.com/enendufrankc",
    "https://medium.com/@enendufrankc",
  ],
})} />
```

- [ ] **Step 6: Verify**

```bash
npx astro build
```

Expected: Build succeeds, sitemap-index.xml generated in dist/. Check `dist/robots.txt` exists.

- [ ] **Step 7: Commit**

```bash
git add public/robots.txt public/favicon.svg astro.config.mjs src/components/SEO.astro
git commit -m "feat: add sitemap, robots.txt, favicon, and JSON-LD structured data"
```

---

## Task 15: Vercel Deployment Configuration

**Goal:** Configure Vercel deployment, clean up old site files, and deploy.

**Files:**
- Create: `vercel.json`
- Modify: `.github/workflows/static.yml` (remove or update)

- [ ] **Step 1: Create vercel.json**

Create `vercel.json`:

```json
{
  "framework": "astro",
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

- [ ] **Step 2: Remove old GitHub Pages workflow**

The old `.github/workflows/static.yml` deployed to GitHub Pages. Since we're now on Vercel, either delete it or update it:

```bash
rm .github/workflows/static.yml
```

If the directory is now empty:
```bash
rmdir .github/workflows .github 2>/dev/null || true
```

- [ ] **Step 3: Archive old site files**

Move old HTML files out of the way (don't delete until Vercel deploy is confirmed working):

```bash
mkdir -p _archive
mv index.html generic.html elements.html contact.html _archive/ 2>/dev/null || true
mv assets _archive/ 2>/dev/null || true
mv images _archive/ 2>/dev/null || true
mv app.py requirement.txt _archive/ 2>/dev/null || true
```

Add `_archive/` to `.gitignore`.

- [ ] **Step 4: Verify build**

```bash
npx astro build
```

Expected: Clean build with all pages generated, API route configured for serverless.

- [ ] **Step 5: Commit**

```bash
git add vercel.json .gitignore
git rm .github/workflows/static.yml 2>/dev/null || true
git rm index.html generic.html elements.html contact.html 2>/dev/null || true
git rm -r assets/ images/ 2>/dev/null || true
git rm app.py requirement.txt 2>/dev/null || true
git commit -m "feat: configure Vercel deployment and archive old site files"
```

- [ ] **Step 6: Deploy to Vercel**

```bash
# If Vercel CLI not installed:
npm i -g vercel

# Link project and deploy
vercel --yes

# Set environment variable
vercel env add GEMINI_API_KEY
```

Follow the prompts to link the project to a Vercel account and deploy. After deploy, verify the site is live at the Vercel URL.

- [ ] **Step 7: Configure custom domain (optional)**

In the Vercel dashboard, add `frankenendu.github.io` as a custom domain, or use the provided `.vercel.app` URL.

- [ ] **Step 8: Verify production**

Open the deployed URL. Test:
- All 4 pages load correctly
- Particle hero animates
- Theme toggle works
- Project filtering works
- Blog post renders with syntax highlighting
- Chatbot responds (requires GEMINI_API_KEY set in Vercel)
- Mobile responsive on phone or dev tools

- [ ] **Step 9: Final commit**

```bash
git add -A
git commit -m "chore: finalize deployment configuration"
```

---

## Post-Launch Checklist

After all 15 tasks are complete:

- [ ] Add project screenshots to `public/images/projects/` (placeholder images currently show gray)
- [ ] Replace placeholder OG image at `public/images/og-default.png`
- [ ] Copy updated CV PDF to `public/frank-enendu-cv.pdf`
- [ ] Test all links (GitHub, Medium, LinkedIn)
- [ ] Run Lighthouse audit — target 90+ Performance
- [ ] Test chatbot with various questions
- [ ] Verify all 12 project case study pages render correctly
- [ ] Test on actual mobile device
