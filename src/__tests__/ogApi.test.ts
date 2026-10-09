/**
 * @jest-environment node
 */
import { Request, Response, Headers } from "whatwg-fetch";
import { GET } from "../../api/og";

// Jest 27's node environment has no fetch classes (Vercel's Node runtime does).
Object.assign(globalThis, { Request, Response, Headers });

describe("GET /api/og", () => {
  jest.setTimeout(60000);

  it("returns the share card as a long-cached PNG", async () => {
    const res = await GET(new Request("https://chaos-iterator.vercel.app/api/og?type=mandelbrot&maxIter=48"));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/png");
    expect(res.headers.get("cache-control")).toBe("public, max-age=31536000, s-maxage=31536000, immutable");
    expect((await res.arrayBuffer()).byteLength).toBeGreaterThan(1000);
  });

  it("404s an unknown or missing system", async () => {
    expect((await GET(new Request("https://chaos-iterator.vercel.app/api/og?type=nope"))).status).toBe(404);
    expect((await GET(new Request("https://chaos-iterator.vercel.app/api/og"))).status).toBe(404);
  });
});
