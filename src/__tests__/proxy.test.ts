/**
 * @jest-environment node
 */
import { Request, Response, Headers } from "whatwg-fetch";

// Jest 27's node environment has no fetch classes (Vercel's runtime does).
Object.assign(globalThis, { Request, Response, Headers });

const HOME = `<html><head>
<link rel="canonical" href="https://chaos-iterator.vercel.app/" />
<meta property="og:url" content="https://chaos-iterator.vercel.app/" />
<meta property="og:title" content="Chaos Iterator" />
<meta property="og:image" content="https://chaos-iterator.vercel.app/og-image.png" />
<meta name="twitter:title" content="Chaos Iterator" />
<meta name="twitter:image" content="https://chaos-iterator.vercel.app/og-image.png" />
</head><body></body></html>`;

// eslint-disable-next-line import/first
import proxy from "../../proxy";

const passesThrough = (res: globalThis.Response) => res.headers.get("x-middleware-next") === "1";

describe("proxy (shared studio links)", () => {
  let fetchMock: jest.Mock;
  beforeEach(() => {
    fetchMock = jest.fn(async () => new Response(HOME, { status: 200, headers: { "Content-Type": "text/html" } }));
    (globalThis as any).fetch = fetchMock;
  });

  it("serves the home page with this render's preview", async () => {
    const res = await proxy(new Request("https://chaos-iterator.vercel.app/?type=clifford&alpha=1.2"));
    expect(passesThrough(res)).toBe(false);
    expect(res.headers.get("content-type")).toBe("text/html; charset=utf-8");
    expect(res.headers.get("cache-control")).toBe("public, max-age=0, s-maxage=3600");
    const html = await res.text();
    expect(html).toContain("/api/og?type=clifford&amp;alpha=1.2");
    expect(html).toContain('content="Clifford — Chaos Iterator"');
    // The static page is fetched without the query, so the proxy never calls itself.
    expect(String(fetchMock.mock.calls[0][0])).toBe("https://chaos-iterator.vercel.app/");
  });

  it("passes plain visits straight through without fetching", async () => {
    expect(passesThrough(await proxy(new Request("https://chaos-iterator.vercel.app/")))).toBe(true);
    expect(passesThrough(await proxy(new Request("https://chaos-iterator.vercel.app/?type=nope")))).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("falls back to the plain page when the fetch fails", async () => {
    fetchMock.mockImplementation(async () => { throw new Error("network"); });
    expect(passesThrough(await proxy(new Request("https://chaos-iterator.vercel.app/?type=clifford")))).toBe(true);
    fetchMock.mockImplementation(async () => new Response("nope", { status: 500 }));
    expect(passesThrough(await proxy(new Request("https://chaos-iterator.vercel.app/?type=clifford")))).toBe(true);
  });
});
