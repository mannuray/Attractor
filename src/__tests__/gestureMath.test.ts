import { distance, midpoint, clampZoom, pinchZoom } from "../lib/gestureMath";

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
});
