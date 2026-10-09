#!/usr/bin/env node
// Post-build step: writes static HTML for every content route plus sitemap.xml, so search
// engines and link-preview crawlers get real content. Runs after `react-scripts build`.
import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const buildDir = path.join(root, "build");
const outFile = path.join(buildDir, ".prerender", "entry.cjs");

await build({
  entryPoints: [path.join(root, "src/prerender/entry.tsx")],
  outfile: outFile,
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node18",
  jsx: "automatic",
  loader: { ".js": "jsx", ".png": "empty", ".svg": "empty", ".css": "empty", ".woff2": "empty" },
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "warning",
});

const require = createRequire(import.meta.url);
const { prerenderRoutes, renderPage, buildSitemap } = require(outFile);

const template = fs.readFileSync(path.join(buildDir, "index.html"), "utf8");

// Remove the default SEO tags from the template; each page writes its own.
function stripDefaultHead(html) {
  return html
    .replace(/<title>[\s\S]*?<\/title>/, "")
    .replace(/<meta\s+name="(title|description|keywords|robots|author)"[^>]*>/g, "")
    .replace(/<meta\s+name="twitter:[^"]*"[^>]*>/g, "")
    .replace(/<meta\s+property="og:[^"]*"[^>]*>/g, "")
    .replace(/<link\s+rel="canonical"[^>]*>/g, "")
    .replace(/<!--\s*(Primary Meta Tags|Open Graph \/ Facebook|Twitter|Canonical URL)\s*-->/g, "");
}

const escapeTitle = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const base = stripDefaultHead(template);
if (!base.includes('<div id="root"></div>')) throw new Error("build/index.html has no empty #root");

const fileFor = route =>
  route === "/" ? "index.html" : route === "/404" ? "404.html" : `${route.slice(1)}.html`;

const sitemapEntries = [];
for (const route of prerenderRoutes()) {
  const page = renderPage(route);
  let html = base.replace("</head>", `    <title>${escapeTitle(page.title)}</title>\n    ${page.headHtml}\n    ${page.styleTags}\n  </head>`);
  html = html.replace('<div id="root"></div>', `<div id="root">${page.bodyHtml}</div>`);
  if (page.noscriptHtml) {
    html = html.replace(/<noscript>[\s\S]*?<\/noscript>/, `<noscript>${page.noscriptHtml}</noscript>`);
  }
  const file = path.join(buildDir, fileFor(route));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  if (route !== "/404") sitemapEntries.push({ path: route, images: page.images });
  console.log(`prerendered ${route.padEnd(36)} → ${path.relative(root, file)} (${page.images.length} images)`);
}

const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(buildDir, "sitemap.xml"), buildSitemap(sitemapEntries, today));
fs.rmSync(path.join(buildDir, ".prerender"), { recursive: true, force: true });
console.log(`wrote build/sitemap.xml (${sitemapEntries.length} pages)`);
