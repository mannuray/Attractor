import { buildSitemap } from "../seo/sitemap";

describe("buildSitemap", () => {
  const xml = buildSitemap(
    [
      { path: "/", images: [] },
      { path: "/systems/clifford-attractor", images: ["/gallery/clifford.png", "/gallery/clifford-swirl.png"] },
    ],
    "2026-10-09"
  );

  it("is a urlset with the image namespace", () => {
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    expect(xml).toContain('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"');
  });

  it("lists every page with absolute URLs and lastmod", () => {
    expect(xml).toContain("<loc>https://chaos-iterator.vercel.app/</loc>");
    expect(xml).toContain("<loc>https://chaos-iterator.vercel.app/systems/clifford-attractor</loc>");
    expect(xml.match(/<lastmod>2026-10-09<\/lastmod>/g)).toHaveLength(2);
  });

  it("lists a page's images", () => {
    expect(xml).toContain("<image:loc>https://chaos-iterator.vercel.app/gallery/clifford-swirl.png</image:loc>");
    expect(xml.match(/<image:image>/g)).toHaveLength(2);
  });

  it("escapes XML special characters", () => {
    expect(buildSitemap([{ path: "/a&b", images: [] }], "2026-10-09")).toContain("/a&amp;b");
  });
});
