import {
  fitScale, fitView, zoomAt, panBy, clampView, zoomPercent, scaleLimits,
  canvasMapBetween, remapComplexView, remapLyapunovView, fractalDepth,
} from "../lib/viewport";

const VP = { width: 1040, height: 640 };   // fit = (640 - 40) / 1200 = 0.5
const SIZE = 1200;

describe("fit", () => {
  it("fits the whole canvas with a margin and centres it", () => {
    expect(fitScale(VP, SIZE)).toBeCloseTo(0.5);
    expect(fitView(VP, SIZE)).toEqual({ scale: 0.5, x: 220, y: 20 });
  });

  it("reports the fitted view as 100%", () => {
    expect(zoomPercent(fitView(VP, SIZE), VP, SIZE)).toBe(100);
    expect(zoomPercent({ scale: 1, x: 0, y: 0 }, VP, SIZE)).toBe(200);
  });

  it("allows 25%..800% of fit, and always actual pixels", () => {
    expect(scaleLimits(VP, SIZE)).toEqual({ min: 0.125, max: 4 });
    expect(scaleLimits({ width: 240, height: 240 }, 4000).max).toBeGreaterThanOrEqual(1);
  });
});

describe("zoomAt", () => {
  it("keeps the point under the cursor fixed", () => {
    const v = fitView(VP, SIZE);
    const z = zoomAt(v, 2, 400, 300);
    // canvas point under (400,300) before and after is the same
    expect((400 - v.x) / v.scale).toBeCloseTo((400 - z.x) / z.scale);
    expect((300 - v.y) / v.scale).toBeCloseTo((300 - z.y) / z.scale);
    expect(z.scale).toBeCloseTo(1);
  });

  it("clamps to the limits without drifting the anchor", () => {
    const v = { scale: 3.5, x: -100, y: -100 };
    const z = zoomAt(v, 10, 500, 300, { min: 0.1, max: 4 });
    expect(z.scale).toBe(4);
    expect((500 - v.x) / v.scale).toBeCloseTo((500 - z.x) / z.scale);
  });
});

describe("pan and clamp", () => {
  it("pans by screen pixels", () => {
    expect(panBy({ scale: 1, x: 10, y: 20 }, 5, -5)).toEqual({ scale: 1, x: 15, y: 15 });
  });

  it("centres an image smaller than the viewport", () => {
    expect(clampView({ scale: 0.25, x: -999, y: 999 }, VP, SIZE)).toEqual({ scale: 0.25, x: 370, y: 170 });
  });

  it("keeps a larger image covering the viewport (no empty gap at the edges)", () => {
    const c = clampView({ scale: 2, x: 500, y: -5000 }, VP, SIZE);
    expect(c.x).toBe(0);
    expect(c.y).toBe(640 - 2400);
  });
});

describe("fractal remapping", () => {
  const base = fitView(VP, SIZE);

  it("is the identity when nothing moved", () => {
    expect(canvasMapBetween(base, base)).toEqual({ k: 1, ox: 0, oy: 0 });
  });

  it("zooming 2× around the canvas centre halves the range and keeps the centre", () => {
    const shown = zoomAt(base, 2, base.x + 600 * base.scale, base.y + 600 * base.scale);
    const m = canvasMapBetween(base, shown);
    const p = remapComplexView({ centerX: -0.5, centerY: 0, zoom: 1, maxIter: 100 }, m, SIZE);
    expect(p.zoom).toBeCloseTo(2);
    expect(p.centerX).toBeCloseTo(-0.5);
    expect(p.centerY).toBeCloseTo(0);
    expect(p.maxIter).toBe(100);
  });

  it("keeps the fractal point under the cursor where it was", () => {
    const params = { centerX: -0.5, centerY: 0, zoom: 1 };
    const px = 300, py = 150;                      // canvas pixel under the cursor
    const sx = base.x + px * base.scale, sy = base.y + py * base.scale;
    const shown = zoomAt(base, 3, sx, sy);
    const p = remapComplexView(params, canvasMapBetween(base, shown), SIZE);
    const at = (q: typeof params, x: number) => q.centerX - 1.5 / q.zoom + (x * 3) / q.zoom / SIZE;
    const atY = (q: typeof params, y: number) => q.centerY - 1.5 / q.zoom + (y * 3) / q.zoom / SIZE;
    expect(at(p, px)).toBeCloseTo(at(params, px));
    expect(atY(p, py)).toBeCloseTo(atY(params, py));
  });

  it("panning shifts the centre by the dragged distance", () => {
    const shown = panBy(base, 100 * base.scale, 0);   // drag right by 100 canvas px
    const p = remapComplexView({ centerX: 0, centerY: 0, zoom: 1 }, canvasMapBetween(base, shown), SIZE);
    expect(p.centerX).toBeCloseTo(-100 * 3 / SIZE);
    expect(p.zoom).toBeCloseTo(1);
  });

  it("remaps Lyapunov's a/b window the same way", () => {
    const shown = zoomAt(base, 2, base.x + 600 * base.scale, base.y + 600 * base.scale);
    const p = remapLyapunovView({ aMin: 2, aMax: 4, bMin: 2, bMax: 4, maxIter: 50, sequence: "AB" } as any, canvasMapBetween(base, shown), SIZE);
    expect(p.aMin).toBeCloseTo(2.5); expect(p.aMax).toBeCloseTo(3.5);
    expect(p.bMin).toBeCloseTo(2.5); expect(p.bMax).toBeCloseTo(3.5);
  });

  it("reports how deep the fractal is relative to its default view", () => {
    expect(fractalDepth({ zoom: 25 }, { zoom: 1 })).toBe(25);
    expect(fractalDepth({ aMin: 3, aMax: 3.5 }, { aMin: 2, aMax: 4 })).toBe(4);
    expect(fractalDepth({}, {})).toBe(1);
  });
});
