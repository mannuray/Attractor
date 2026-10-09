/**
 * @jest-environment node
 */
/* eslint-disable testing-library/render-result-naming-convention -- these render helpers are not Testing Library's render */
// Runs without window/document, like the build-time prerender step.
import { prerenderRoutes, renderPage } from "../prerender/entry";
import { SYSTEM_PAGES } from "../content/systemPages";

jest.mock("../components/GiscusComments", () => ({ GiscusComments: () => null }));

describe("prerender", () => {
  it("covers studio, help, every system page and the 404 page", () => {
    const routes = prerenderRoutes();
    expect(routes).toContain("/");
    expect(routes).toContain("/info");
    expect(routes).toContain("/404");
    SYSTEM_PAGES.forEach(p => expect(routes).toContain(`/systems/${p.slug}`));
    expect(routes).toHaveLength(SYSTEM_PAGES.length + 3);
  });

  it("renders every route on the server without touching browser APIs", () => {
    for (const path of prerenderRoutes()) expect(() => renderPage(path)).not.toThrow();
  });

  it("system page HTML has its H1, write-up, images, styles and head tags", () => {
    const r = renderPage("/systems/clifford-attractor");
    expect(r.bodyHtml).toMatch(/<h1[^>]*>Clifford Attractors<\/h1>/);
    expect(r.bodyHtml).toContain("Chaos in Wonderland");
    expect(r.images).toContain("/gallery/clifford.png");
    expect(r.styleTags).toContain("<style");
    expect(r.title).toBe("Clifford Attractors — Generator & Explanation | Chaos Iterator");
    expect(r.headHtml).toContain('<link rel="canonical" href="https://chaos-iterator.vercel.app/systems/clifford-attractor"');
    expect(r.headHtml).toContain('"@type":"TechArticle"');
  });

  it("help page HTML contains all write-ups", () => {
    const r = renderPage("/info");
    SYSTEM_PAGES.forEach(p => expect(r.bodyHtml).toContain(p.title.replace("&", "&amp;")));
    expect(r.images.length).toBeGreaterThanOrEqual(34);
  });

  it("studio is not server-rendered; it gets a noscript intro linking every system page", () => {
    const r = renderPage("/");
    expect(r.bodyHtml).toBe("");
    expect(r.noscriptHtml).toContain("<h1>Chaos Iterator");
    SYSTEM_PAGES.forEach(p => expect(r.noscriptHtml).toContain(`href="/systems/${p.slug}"`));
    expect(r.headHtml).toContain('"@type":"WebApplication"');
  });

  it("404 page is noindex", () => {
    const r = renderPage("/404");
    expect(r.bodyHtml).toContain("404");
    expect(r.headHtml).toContain('<meta name="robots" content="noindex, follow"');
  });
});
