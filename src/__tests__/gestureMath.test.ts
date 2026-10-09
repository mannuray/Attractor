import { distance, midpoint, clientToCanvas, wheelFactor } from "../lib/gestureMath";

describe("gestureMath", () => {
  it("distance and midpoint", () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
    expect(midpoint({ x: 0, y: 0 }, { x: 10, y: 20 })).toEqual({ x: 5, y: 10 });
  });

  it("maps client points through the (transformed) canvas rect", () => {
    const rect = { left: 100, top: 50, width: 600, height: 600 };
    expect(clientToCanvas(rect, 0.5, 1200, 400, 350, false)).toEqual({ x: 600, y: 600 });
    expect(clientToCanvas(rect, 0.5, 1200, 50, 350, false)).toBeNull();
    expect(clientToCanvas(rect, 0.5, 1200, 50, 2000, true)).toEqual({ x: 0, y: 1200 });
  });

  describe("wheelFactor", () => {
    const w = (deltaY: number, extra: Partial<WheelEvent> = {}) => wheelFactor({ deltaY, deltaMode: 0, ctrlKey: false, ...extra });

    it("scrolling up zooms in, down zooms out, symmetrically", () => {
      expect(w(-100)).toBeGreaterThan(1);
      expect(w(100)).toBeLessThan(1);
      expect(w(-100) * w(100)).toBeCloseTo(1);
    });

    it("one mouse-wheel notch is a gentle step", () => {
      expect(w(-100)).toBeGreaterThan(1.1);
      expect(w(-100)).toBeLessThan(1.3);
    });

    it("trackpad pinch (ctrl+wheel, small deltas) is more sensitive per pixel", () => {
      expect(w(-10, { ctrlKey: true })).toBeGreaterThan(w(-10));
    });

    it("line-mode wheels are treated like pixel wheels", () => {
      expect(w(-3, { deltaMode: 1 })).toBeCloseTo(w(-48));
    });

    it("caps a single huge event", () => {
      expect(w(-100000)).toBeLessThanOrEqual(2);
      expect(w(100000)).toBeGreaterThanOrEqual(0.5);
    });
  });
});
