import { absolute } from "./site";

export interface SitemapEntry { path: string; images: string[] }

const xml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

/** sitemap.xml with an image entry for every picture on a page. */
export function buildSitemap(entries: SitemapEntry[], lastmod: string): string {
  const urls = entries.map(e => {
    const images = e.images
      .map(src => `    <image:image>\n      <image:loc>${xml(absolute(src))}</image:loc>\n    </image:image>`)
      .join("\n");
    return `  <url>\n    <loc>${xml(absolute(e.path))}</loc>\n    <lastmod>${lastmod}</lastmod>${images ? "\n" + images : ""}\n  </url>`;
  });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n");
}
