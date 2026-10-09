// Build-time server rendering of the content pages (bundled by scripts/prerender.mjs).
// The studio ("/") needs a browser, so it only gets head tags and a <noscript> intro.
import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { Routes, Route } from "react-router-dom";
import { ServerStyleSheet } from "styled-components";
import { ThemeProvider } from "../theme/ThemeContext";
import Info from "../view/pages/Info";
import SystemPage from "../view/pages/SystemPage";
import NoPage from "../view/pages/NoPage";
import { SYSTEM_PAGES, GROUP_LABELS, SystemGroup } from "../content/systemPages";
import { pageMetaFor, metaTags, HeadTag } from "../seo/meta";
import { SITE_NAME, HOME_DESCRIPTION } from "../seo/site";

export { buildSitemap } from "../seo/sitemap";

export interface RenderedPage {
  title: string;
  headHtml: string;
  styleTags: string;
  bodyHtml: string;
  noscriptHtml: string;
  images: string[];
}

export function prerenderRoutes(): string[] {
  return ["/", "/info", ...SYSTEM_PAGES.map(p => `/systems/${p.slug}`), "/404"];
}

const attr = (v: string) => v.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const text = (v: string) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function tagHtml(t: HeadTag): string {
  const attrs = Object.entries(t.attrs).map(([k, v]) => ` ${k}="${attr(v)}"`).join("");
  // JSON-LD: escape "<" so a value can never close the script element.
  if (t.tag === "script") return `<script${attrs}>${(t.text ?? "").replace(/</g, "\\u003c")}</script>`;
  return `<${t.tag}${attrs} />`;
}

function homeNoscript(): string {
  const groups = (Object.keys(GROUP_LABELS) as SystemGroup[]).map(g => {
    const items = SYSTEM_PAGES.filter(p => p.group === g)
      .map(p => `<li><a href="/systems/${p.slug}">${text(p.title)}</a></li>`).join("");
    return `<h2>${text(GROUP_LABELS[g])}</h2><ul>${items}</ul>`;
  }).join("");
  return `<h1>${SITE_NAME} — Strange Attractor &amp; Fractal Generator</h1><p>${text(HOME_DESCRIPTION)}</p>` +
    `<p>The studio needs JavaScript. Learn about each system:</p>${groups}<p><a href="/info">Help &amp; About</a></p>`;
}

const imagesIn = (html: string) =>
  Array.from(new Set(Array.from(html.matchAll(/<img[^>]+src="(\/[^"]+)"/g)).map(m => m[1])));

export function renderPage(path: string): RenderedPage {
  const { title, tags } = metaTags(pageMetaFor(path));
  const headHtml = tags.map(tagHtml).join("\n    ");
  if (path === "/") {
    return { title, headHtml, styleTags: "", bodyHtml: "", noscriptHtml: homeNoscript(), images: [] };
  }
  const sheet = new ServerStyleSheet();
  try {
    const bodyHtml = renderToString(
      sheet.collectStyles(
        <StaticRouter location={path}>
          <ThemeProvider>
            <Routes>
              <Route path="/info" element={<Info />} />
              <Route path="/systems/:slug" element={<SystemPage />} />
              <Route path="*" element={<NoPage />} />
            </Routes>
          </ThemeProvider>
        </StaticRouter>
      )
    );
    return { title, headHtml, styleTags: sheet.getStyleTags(), bodyHtml, noscriptHtml: "", images: imagesIn(bodyHtml) };
  } finally {
    sheet.seal();
  }
}
