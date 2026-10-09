import { distance, midpoint, clampZoom, pinchZoom, clientToCanvas } from "../lib/gestureMath";

describe("gestureMath", () => {
  it("computes distance and midpoint", () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
    expect(midpoint({ x: 0, y: 0 }, { x: 4, y: 2 })).toEqual({ x: 2, y: 1 });
  });

  it("scales zoom by finger spread", () => {
    expect(pinchZoom(1, 100, 200)).toBe(2);
    expect(pinchZoom(2, 200, 100)).toBe(1);
  });

  it("clamps to [0.1, 4]", () => {
    expect(pinchZoom(1, 10, 1000)).toBe(4);
    expect(pinchZoom(1, 1000, 1)).toBe(0.1);
  });

  it("keeps zoom finite when fingers start at the same point", () => {
    expect(pinchZoom(1.5, 0, 50)).toBe(1.5);
    expect(clampZoom(NaN)).toBe(1);
    expect(clampZoom(Infinity)).toBe(1);
  });

  describe("clientToCanvas", () => {
    const rect = { left: 100, top: 50, width: 400, height: 400 };
    it("maps client coords to canvas pixels using the display zoom", () => {
      expect(clientToCanvas(rect, 0.5, 800, 300, 250, false)).toEqual({ x: 400, y: 400 });
    });
    it("rejects a start point outside the canvas", () => {
      expect(clientToCanvas(rect, 0.5, 800, 50, 250, false)).toBeNull();
    });
    it("clamps moves that overshoot the edge instead of freezing", () => {
      expect(clientToCanvas(rect, 0.5, 800, 900, -20, true)).toEqual({ x: 800, y: 0 });
    });
  });
});

