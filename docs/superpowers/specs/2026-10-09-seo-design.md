# SEO & Shareable Render Previews

**Date:** 2026-10-09
**Status:** Approved design (in conversation), spec pending review
**Production origin (canonical):** `https://chaos-iterator.vercel.app`

## Goal

Grow organic and social traffic:

1. Search engines and link-preview crawlers receive real HTML content, not an empty `<div id="root">`.
2. Each of the 25 system write-ups is its own indexable page that can rank for its name (e.g. "clifford attractor", "lyapunov fractal").
3. A shared studio link previews **the exact render** in Slack/Discord/X/Facebook cards.

Success = after deploy:
- `curl https://chaos-iterator.vercel.app/systems/clifford-attractor` returns HTML containing the page's H1, intro text, formula, gallery `<img>` tags, a unique `<title>`, description, canonical, OG/Twitter tags and JSON-LD.
- `sitemap.xml` lists every page (and its images); unknown paths return HTTP 404.
- A link like `/?type=clifford&alpha=1.5&…` returns HTML whose `og:image` is `/api/og?…` and that image is a 1200×630 PNG of that render.

## Current state (2026-10-09)

- Create React App SPA; Vercel CRA preset serves `index.html` (HTTP 200) for **every** path, including made-up ones (soft 404s).
- Good static meta in `public/index.html` (title, description, OG/Twitter, canonical), `robots.txt`, a stale 2-URL `sitemap.xml`.
- All write-ups live in one 1,800-line `src/view/pages/Info.tsx`; 25 system cards (the three Jason Rampe variants share one), 34 gallery images.
- Each system's math metadata (`id`, `label`, `category`, `defaultParams`, `paramRanges`, `workerIteratorName`, `math`) is registered in `src/attractors/<system>/index.ts` **together with its React `Controls`**, so non-UI code can't use it without pulling in React/styled-components.

## Approach (approved)

Keep CRA. Add a **build-time prerender step** (Node script bundled with esbuild, React server rendering + styled-components `ServerStyleSheet`) that writes static HTML for every content route. Add a **Vercel Function** that renders share images using the app's real `worker.js` math, and **Vercel Routing Middleware** that injects per-render share meta into shared studio links. Rejected: headless-browser prerender (Chrome in Vercel build is slow/flaky); Next.js migration (rewrite cost ≫ SEO gain).

## Design

### 1. System catalog (pure data, no React)

- New `src/attractors/<system>/meta.ts` per system exporting a plain object: `id, label, category, defaultParams, paramRanges, workerIteratorName, math`.
- `index.ts` becomes `registry.register({ ...cliffordMeta, Controls: CliffordControls })` — behaviour unchanged.
- New `src/attractors/catalog.ts` exports `SYSTEM_CATALOG: SystemMeta[]` (imports all `meta.ts`). No React imports anywhere in this graph.
- Test: every registered module equals its catalog entry (minus `Controls`); catalog has no React dependency (import it in a test that runs without `react` mocked to throw).

### 2. Content split + system pages

- Each system card's JSX moves verbatim from `Info.tsx` to `src/content/systems/<slug>.tsx` (default export `Body`), with a sibling registry `src/content/systemPages.ts`:
  ```ts
  { slug: "clifford-attractor", title: "Clifford Attractors", systemIds: ["clifford"],
    group: "attractors", description: "<≤155 chars>", image: "/gallery/clifford.png", Body }
  ```
  Slugs: lowercase, hyphenated, from the card's own name (e.g. `mandelbrot-set`, `julia-sets`, `jason-rampe-attractors`, `henon-attractor`).
- `Info.tsx` renders the same cards by mapping `systemPages` per group — the page output is unchanged. Guard: existing `InfoContent` inventory test (34 images, 25 names, 12 sections) must stay green; add a test that the concatenated text of all `systemPages` bodies equals the pre-split card text (fixture captured before the move).
- New route `/systems/:slug` → `SystemPage`:
  - Same top bar / visual language as Help & About; breadcrumb `Help › Attractors › Clifford Attractors`.
  - H1 = `title`; the card `Body` (intro, formulas, gallery, parameter notes).
  - **"Open in studio"** primary button → `/?type=<systemIds[0]>` (Jason Rampe page: one button per variant).
  - "Related systems": up to 4 other pages in the same group.
  - Unknown slug → 404 page.
- Help & About rail links each nested system to `/systems/<slug>` (keeps in-page scrolling on `/info` too: the system heading gets a "Open page →" link).
- Studio inspector Parameters tab: system row gets an "About this system" link → `/systems/<slug>`.

### 3. Per-page metadata

- `src/seo/meta.ts`: pure `pageMeta(route) → { title, description, canonical, ogImage, ogType, jsonLd[] }`.
  - `/` — title "Chaos Iterator — Strange Attractor & Fractal Generator", JSON-LD `WebApplication` (free, browser, applicationCategory `DesignApplication`).
  - `/info` — "Help & About — Chaos Iterator", JSON-LD `WebPage` + `BreadcrumbList`.
  - `/systems/<slug>` — "<Title> — Generator & Explanation | Chaos Iterator", description from `systemPages`, `og:image` = the page's gallery image, JSON-LD `TechArticle` (headline, image[], about) + `BreadcrumbList`.
- Client: a tiny `useDocumentMeta(meta)` hook updates `<title>`, description, canonical and OG tags on route change (no new dependency).
- Prerender writes the same tags into each static file's `<head>`.

### 4. Prerender (build step)

- `npm run build` = `react-scripts build && node scripts/prerender.mjs`.
- `scripts/prerender.mjs` bundles `src/prerender/entry.tsx` with **esbuild** (new devDependency) for Node, then for each route in `prerenderRoutes()` (`/`, `/info`, `/systems/<slug>` ×25):
  - Renders `<StaticRouter location=…><App/></StaticRouter>` to a string with `ServerStyleSheet`.
  - Injects HTML into `build/index.html`'s `#root`, the styles and per-page meta into `<head>`.
  - Writes `build/index.html`, `build/info.html`, `build/systems/<slug>.html`.
- `/` is the studio (canvas + worker, needs a browser): its prerender is **meta + JSON-LD + a `<noscript>` block** with an intro paragraph and links to every system page; the studio itself is not server-rendered. Browser-only code paths (`ResponsiveShell` host node, `Worker`, `matchMedia`, Giscus) are guarded so server rendering of `/info` and system pages never touches them.
- Client keeps `createRoot().render()` (replaces the prerendered DOM; no hydration-mismatch risk).
- Writes `build/sitemap.xml` (all routes, `lastmod` = build date, `<image:image>` entries for gallery images) and `build/404.html` (prerendered NoPage). `public/robots.txt` adds `Sitemap: https://chaos-iterator.vercel.app/sitemap.xml`; the stale `public/sitemap.xml` is removed.

### 5. Hosting config (`vercel.json`)

- `"framework": null`, `"buildCommand": "npm run build"`, `"outputDirectory": "build"`, `"cleanUrls": true` → static files only (`/info` → `info.html`, `/systems/x` → `systems/x.html`), unknown paths get `404.html` with **HTTP 404** (ends soft 404s).
- Long-cache headers for `/static/*` and `/gallery/*`.
- `"proxy": { "entrypoint": "proxy.ts", "matcher": ["/"] }` (see 7).

### 6. Share images — `api/og.ts` (Vercel Function, Node runtime)

- `GET /api/og?type=<id>&<params>` → 1200×630 PNG.
- Parses params exactly like `useUrlSync` (defaults from catalog, numeric parse); unknown `type` → 404; values clamped to `paramRanges`.
- Renders with the **real `public/worker.js`** loaded in a `vm` sandbox with a stub `OffscreenCanvas` (same technique as `src/__tests__/workerFractal.test.ts`): attractors run N iterate passes (time-boxed ~1.5 s), fractals a full synchronous render; square render at 630 px, default palette for the system.
- Composites with **sharp** (already a dependency): dark background, render on the left, system name + "Chaos Iterator" + short tagline on the right (SVG text overlay).
- `Cache-Control: public, max-age=31536000, s-maxage=31536000, immutable` (output is a pure function of the query).
- `vercel.json` `functions["api/og.ts"].includeFiles = "public/worker.js"`; `maxDuration` 30 s.
- Shared logic in `src/seo/ogRender.ts` (pure: params → RGBA buffer) so it is unit-tested in Jest.

### 7. Shared studio links — `proxy.ts` (Routing Middleware, Node runtime)

- Runs only for `/`. If the query has a valid `type`, it fetches the static `index.html`, replaces `og:image`/`twitter:image` with `/api/og?<same query>`, `og:title`/`twitter:title` with "<System label> — Chaos Iterator", `og:url` with the full link, and returns it. Otherwise `next()`.
- Canonical stays `https://chaos-iterator.vercel.app/` (parameter variants must not compete in search).
- Pure helper `src/seo/injectShareMeta.ts` (html, url, catalog) → html, unit-tested.

### 8. Manual steps (owner)

- Add the property in Google Search Console and Bing Webmaster Tools; submit `sitemap.xml`.

## Out of scope

- Custom domain (can be added later with redirects).
- Rewriting write-up text or adding new copy beyond meta descriptions, the `/` noscript intro and page chrome ("Open in studio", "Related systems").
- Server-rendering the studio itself.
- Analytics/attribution changes.

## Error handling

- `api/og`: invalid/unknown type → 404 PNG-less response; render timeout → render what accumulated so far; never > 30 s.
- `proxy.ts`: any failure (fetch/parse) → fall through to `next()` (plain page, default card).
- Prerender: a route that throws fails the build (no silently empty pages).

## Testing

- Catalog parity; content-split text equality; InfoContent inventory unchanged.
- `SystemPage`: H1, Body, Open-in-studio link(s), related links, 404 on unknown slug.
- `pageMeta` per route; `useDocumentMeta` updates head; sitemap builder output (URLs, image entries, well-formed XML).
- Prerender: run `scripts/prerender.mjs` against a fixture build in Jest-free Node test (`node --test`) or a Jest test with a temp dir — asserts files exist and contain H1/title/canonical/JSON-LD.
- `ogRender`: returns 1200×630 PNG for an attractor and a fractal, different params → different bytes, unknown type rejected.
- `injectShareMeta`: replaces tags for valid links, untouched otherwise, canonical never changed.
- Manual after deploy: curl checks from "Success" above; Facebook Sharing Debugger / X card validator; Google Rich Results Test on a system page.
