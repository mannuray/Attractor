/**
 * @jest-environment node
 */
import fs from "fs";
import path from "path";
import { injectShareMeta } from "../seo/injectShareMeta";
import { metaTags, pageMetaFor } from "../seo/meta";

// A home page head exactly as the prerender step writes it.
function homeHtml() {
  const { title, tags } = metaTags(pageMetaFor("/"));
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  const head = tags
    .filter(t => t.tag !== "script")
    .map(t => `<${t.tag} ${Object.entries(t.attrs).map(([k, v]) => `${k}="${esc(v)}"`).join(" ")} />`)
    .join("\n");
  return `<!doctype html><html><head><title>${esc(title)}</title>\n${head}\n</head><body><div id="root"></div></body></html>`;
}

const attr = (html: string, key: string, name: string, a = "content") =>
  new RegExp(`<[^>]*${key}="${name}"[^>]*${a}="([^"]*)"`).exec(html)?.[1];

const ORIGIN = "https://chaos-iterator.vercel.app";

describe("injectShareMeta", () => {
  it("points the preview image at the render of this link", () => {
    const out = injectShareMeta(homeHtml(), new URL(`${ORIGIN}/?type=clifford&alpha=1.2`))!;
    const image = attr(out, "property", "og:image")!.replace(/&amp;/g, "&");
    expect(image.startsWith(`${ORIGIN}/api/og?`)).toBe(true);
    const q = new URL(image).searchParams;
    expect(q.get("type")).toBe("clifford");
    expect(q.get("alpha")).toBe("1.2");
    expect(q.get("beta")).toBe("-1.8");                 // defaults filled in: one cache key per render
    expect(attr(out, "name", "twitter:image")).toBe(attr(out, "property", "og:image"));
  });

  it("normalises the image query so junk params and out-of-range values share a cache entry", () => {
    const a = injectShareMeta(homeHtml(), new URL(`${ORIGIN}/?type=clifford&alpha=99&utm_source=x`))!;
    const b = injectShareMeta(homeHtml(), new URL(`${ORIGIN}/?alpha=3&type=clifford`))!;
    expect(attr(a, "property", "og:image")).toBe(attr(b, "property", "og:image"));
  });

  it("titles the card after the system and links it to the full shared URL", () => {
    const link = `${ORIGIN}/?type=mandelbrot&zoom=4`;
    const out = injectShareMeta(homeHtml(), new URL(link))!;
    expect(attr(out, "property", "og:title")).toBe("Mandelbrot — Chaos Iterator");
    expect(attr(out, "name", "twitter:title")).toBe("Mandelbrot — Chaos Iterator");
    expect(attr(out, "property", "og:url")!.replace(/&amp;/g, "&")).toBe(link);
  });

  it("never changes the canonical URL", () => {
    const out = injectShareMeta(homeHtml(), new URL(`${ORIGIN}/?type=clifford`))!;
    expect(attr(out, "rel", "canonical", "href")).toBe(`${ORIGIN}/`);
  });

  it("escapes the shared URL inside attributes", () => {
    const out = injectShareMeta(homeHtml(), new URL(`${ORIGIN}/?type=clifford&x="><script>alert(1)</script>`))!;
    expect(out).not.toContain("<script>alert(1)");
    expect(out).not.toMatch(/content="[^"]*"><script/);
  });

  it("returns null when the link is not a valid studio share", () => {
    expect(injectShareMeta(homeHtml(), new URL(`${ORIGIN}/`))).toBeNull();
    expect(injectShareMeta(homeHtml(), new URL(`${ORIGIN}/?type=nope`))).toBeNull();
  });

  it("works on the real built home page when one exists", () => {
    const built = path.join(process.cwd(), "build/index.html");
    if (!fs.existsSync(built)) return;
    const out = injectShareMeta(fs.readFileSync(built, "utf8"), new URL(`${ORIGIN}/?type=julia`))!;
    expect(attr(out, "property", "og:image")).toMatch(/\/api\/og\?type=julia/);
    expect(attr(out, "property", "og:title")).toBe("Julia — Chaos Iterator");
  });
});
