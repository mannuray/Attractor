/**
 * @jest-environment node
 */
/* eslint-disable testing-library/render-result-naming-convention -- these render helpers are not Testing Library's render */
import sharp from "sharp";
import { parseShareParams } from "../seo/ogParams";
import { renderShareImage } from "../seo/ogRender";

const q = (s: string) => new URLSearchParams(s);
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

describe("parseShareParams", () => {
  it("fills missing values from the system defaults and parses numbers", () => {
    const share = parseShareParams(q("type=clifford&alpha=1.25"))!;
    expect(share.meta.id).toBe("clifford");
    expect(share.params.alpha).toBe(1.25);
    expect(share.params.beta).toBe(-1.8);
    expect(share.params.scale).toBe(0.2);
  });

  it("clamps values to the system's parameter ranges", () => {
    const share = parseShareParams(q("type=clifford&alpha=99&beta=-99"))!;
    expect(share.params.alpha).toBe(3);
    expect(share.params.beta).toBe(-3);
  });

  it("ignores values that are not numbers and keys the system does not have", () => {
    const share = parseShareParams(q("type=clifford&alpha=abc&evil=1"))!;
    expect(share.params.alpha).toBe(1.5);
    expect(share.params).not.toHaveProperty("evil");
  });

  it("caps fractal iterations so one request cannot run for minutes", () => {
    expect(parseShareParams(q("type=mandelbrot&maxIter=1000000"))!.params.maxIter).toBe(2000);
  });

  it("keeps only valid Lyapunov sequences", () => {
    expect(parseShareParams(q("type=lyapunov&sequence=AABAB"))!.params.sequence).toBe("AABAB");
    const fallback = parseShareParams(q("type=lyapunov"))!.params.sequence;
    expect(parseShareParams(q("type=lyapunov&sequence=<script>"))!.params.sequence).toBe(fallback);
  });

  it("bounds fractal values that have no declared range (cost and precision)", () => {
    const p = (qs: string) => parseShareParams(q(qs))!.params;
    expect(p("type=multibrot&power=1e9").power).toBe(12);
    expect(p("type=mandelbrot&zoom=1e-300").zoom).toBe(0.01);
    expect(p("type=mandelbrot&zoom=1e300").zoom).toBe(1e13);
    expect(p("type=julia&centerX=1e9&cReal=-50").centerX).toBe(4);
    expect(p("type=julia&cReal=-50").cReal).toBe(-4);
    expect(p("type=lyapunov&maxIter=100000").maxIter).toBe(500);
    expect(p("type=lyapunov&aMin=-9&aMax=99").aMin).toBe(0);
  });

  it("rejects unknown or missing types", () => {
    expect(parseShareParams(q("type=nope"))).toBeNull();
    expect(parseShareParams(q("alpha=1"))).toBeNull();
  });
});

describe("renderShareImage", () => {
  jest.setTimeout(60000);

  async function shape(buf: Buffer) {
    const { width, height, format } = await sharp(buf).metadata();
    return { signature: buf.subarray(0, 8).equals(PNG_SIGNATURE), width, height, format };
  }

  it("renders an attractor as a 1200×630 PNG", async () => {
    const share = parseShareParams(q("type=clifford"))!;
    const png = await renderShareImage(share.meta, share.params, { budgetMs: 300 });
    expect(await shape(png)).toEqual({ signature: true, width: 1200, height: 630, format: "png" });
  });

  it("renders a fractal as a 1200×630 PNG", async () => {
    const share = parseShareParams(q("type=mandelbrot&maxIter=64"))!;
    const png = await renderShareImage(share.meta, share.params, { budgetMs: 300 });
    expect(await shape(png)).toEqual({ signature: true, width: 1200, height: 630, format: "png" });
  });

  it("draws the render itself, not a blank panel", async () => {
    const share = parseShareParams(q("type=clifford"))!;
    const png = await renderShareImage(share.meta, share.params, { budgetMs: 300 });
    // The left 630×630 square holds the render; a real attractor has many distinct colours.
    const { data } = await sharp(png).extract({ left: 0, top: 0, width: 630, height: 630 }).raw().toBuffer({ resolveWithObject: true });
    const colours = new Set<number>();
    for (let i = 0; i < data.length; i += 3) colours.add((data[i] << 16) | (data[i + 1] << 8) | data[i + 2]);
    expect(colours.size).toBeGreaterThan(20);
  });

  it("is deterministic for the same link and differs for different parameters", async () => {
    const a = parseShareParams(q("type=clifford&alpha=1.5"))!;
    const b = parseShareParams(q("type=clifford&alpha=-1.4"))!;
    const opts = { budgetMs: 10000, passes: 2 };
    const [a1, a2, b1] = await Promise.all([
      renderShareImage(a.meta, a.params, opts),
      renderShareImage(a.meta, a.params, opts),
      renderShareImage(b.meta, b.params, opts),
    ]);
    expect(a1.equals(a2)).toBe(true);
    expect(a1.equals(b1)).toBe(false);
  });

  it("keeps the heaviest fractal links well inside the function's time limit", async () => {
    for (const qs of ["type=lyapunov&maxIter=100000&sequence=AABAB", "type=multibrot&power=1e9&maxIter=100000"]) {
      const share = parseShareParams(q(qs))!;
      const t0 = Date.now();
      await renderShareImage(share.meta, share.params);
      expect(Date.now() - t0).toBeLessThan(12000);
    }
  });

  it("stops at the time budget and still returns an image", async () => {
    const share = parseShareParams(q("type=symmetric_icon"))!;
    const t0 = Date.now();
    const png = await renderShareImage(share.meta, share.params, { budgetMs: 1 });
    expect(Date.now() - t0).toBeLessThan(5000);
    expect((await shape(png)).width).toBe(1200);
  });
});
