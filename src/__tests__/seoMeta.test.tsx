import { renderHook } from "@testing-library/react";
import { pageMetaFor, metaTags } from "../seo/meta";
import { useDocumentMeta } from "../seo/useDocumentMeta";
import { SITE_ORIGIN } from "../seo/site";

const types = (jsonLd: any[]) => jsonLd.map(j => j["@type"]);

describe("pageMetaFor", () => {
  it("studio home", () => {
    const m = pageMetaFor("/");
    expect(m.title).toBe("Chaos Iterator — Strange Attractor & Fractal Generator");
    expect(m.canonical).toBe(`${SITE_ORIGIN}/`);
    expect(types(m.jsonLd)).toEqual(["WebApplication"]);
    expect(m.jsonLd[0].offers.price).toBe("0");
  });

  it("help page", () => {
    const m = pageMetaFor("/info");
    expect(m.title).toBe("Help & About — Chaos Iterator");
    expect(m.canonical).toBe(`${SITE_ORIGIN}/info`);
    expect(types(m.jsonLd)).toEqual(["WebPage", "BreadcrumbList"]);
  });

  it("system page", () => {
    const m = pageMetaFor("/systems/clifford-attractor");
    expect(m.title).toBe("Clifford Attractors — Generator & Explanation | Chaos Iterator");
    expect(m.description).toMatch(/Clifford attractor/);
    expect(m.canonical).toBe(`${SITE_ORIGIN}/systems/clifford-attractor`);
    expect(m.image).toBe(`${SITE_ORIGIN}/gallery/clifford.png`);
    expect(m.type).toBe("article");
    expect(types(m.jsonLd)).toEqual(["TechArticle", "BreadcrumbList"]);
    expect(m.jsonLd[0].image[0]).toBe(`${SITE_ORIGIN}/gallery/clifford.png`);
    expect(m.jsonLd[1].itemListElement.map((i: any) => i.name)).toEqual(["Chaos Iterator", "Help & About", "Clifford Attractors"]);
  });

  it("system page without its own image falls back to the site image", () => {
    expect(pageMetaFor("/systems/sprott-attractor").image).toBe(`${SITE_ORIGIN}/og-image.png`);
  });

  it("unknown pages are noindex", () => {
    expect(pageMetaFor("/nope").noindex).toBe(true);
    expect(pageMetaFor("/systems/nope").noindex).toBe(true);
  });
});

describe("metaTags", () => {
  it("emits description, canonical, OG, Twitter and JSON-LD", () => {
    const { title, tags } = metaTags(pageMetaFor("/systems/clifford-attractor"));
    expect(title).toBe("Clifford Attractors — Generator & Explanation | Chaos Iterator");
    const find = (k: string, v: string) => tags.find(t => t.attrs[k] === v);
    expect(find("name", "description")?.attrs.content).toMatch(/Clifford/);
    expect(find("rel", "canonical")?.attrs.href).toBe(`${SITE_ORIGIN}/systems/clifford-attractor`);
    expect(find("property", "og:type")?.attrs.content).toBe("article");
    expect(find("property", "og:image")?.attrs.content).toBe(`${SITE_ORIGIN}/gallery/clifford.png`);
    expect(find("name", "twitter:card")?.attrs.content).toBe("summary_large_image");
    expect(tags.filter(t => t.tag === "script")).toHaveLength(2);
    expect(find("name", "robots")).toBeUndefined();
    expect(metaTags(pageMetaFor("/nope")).tags.find(t => t.attrs.name === "robots")?.attrs.content).toBe("noindex, follow");
  });
});

describe("useDocumentMeta", () => {
  it("replaces existing head tags instead of adding duplicates", () => {
    document.head.innerHTML = `
      <title>old</title>
      <meta name="description" content="old">
      <link rel="canonical" href="https://old/">
      <meta property="og:title" content="old">
      <script type="application/ld+json">{}</script>`;
    const { rerender } = renderHook(({ path }) => useDocumentMeta(pageMetaFor(path)), { initialProps: { path: "/info" } });
    expect(document.title).toBe("Help & About — Chaos Iterator");
    rerender({ path: "/systems/clifford-attractor" });
    expect(document.title).toBe("Clifford Attractors — Generator & Explanation | Chaos Iterator");
    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1);
    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(document.head.querySelectorAll('meta[property="og:title"]')).toHaveLength(1);
    expect(document.head.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(2);
    expect(document.head.querySelector('link[rel="canonical"]')!.getAttribute("href")).toBe(`${SITE_ORIGIN}/systems/clifford-attractor`);
  });
});
