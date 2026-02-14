import {
  calculateNewFractalParams,
  calculateNewLyapunovZoomParams,
  DragPoint,
  FractalParams,
} from "../hooks/useFractalZoom";
import { LyapunovParams } from "../attractors/lyapunov/types";

describe("calculateNewFractalParams", () => {
  const defaultParams: FractalParams = {
    centerX: 0,
    centerY: 0,
    zoom: 1,
  };
  const canvasSize = 800;

  it("returns null for tiny drags (< 10px)", () => {
    const start: DragPoint = { x: 100, y: 100 };
    const end: DragPoint = { x: 105, y: 105 };
    const result = calculateNewFractalParams(start, end, defaultParams, canvasSize);
    expect(result).toBeNull();
  });

  it("returns null for zero-size drag", () => {
    const start: DragPoint = { x: 100, y: 100 };
    const end: DragPoint = { x: 100, y: 100 };
    const result = calculateNewFractalParams(start, end, defaultParams, canvasSize);
    expect(result).toBeNull();
  });

  it("full-canvas drag keeps params roughly the same", () => {
    const start: DragPoint = { x: 0, y: 0 };
    const end: DragPoint = { x: canvasSize, y: canvasSize };
    const result = calculateNewFractalParams(start, end, defaultParams, canvasSize);

    expect(result).not.toBeNull();
    expect(result!.centerX).toBeCloseTo(defaultParams.centerX, 5);
    expect(result!.centerY).toBeCloseTo(defaultParams.centerY, 5);
    expect(result!.zoom).toBeCloseTo(defaultParams.zoom, 5);
  });

  it("quarter-canvas drag doubles zoom approximately", () => {
    // Drag the center quarter: from (200,200) to (600,600) on an 800px canvas
    const start: DragPoint = { x: 200, y: 200 };
    const end: DragPoint = { x: 600, y: 600 };
    const result = calculateNewFractalParams(start, end, defaultParams, canvasSize);

    expect(result).not.toBeNull();
    // Center should stay at (0,0) since we dragged the center region
    expect(result!.centerX).toBeCloseTo(0, 5);
    expect(result!.centerY).toBeCloseTo(0, 5);
    // Zoom should double: 400px out of 800px = half range, so zoom = 2x
    expect(result!.zoom).toBeCloseTo(2, 5);
  });

  it("off-center drag shifts the center", () => {
    // Drag top-left quarter: (0,0) to (400,400)
    const start: DragPoint = { x: 0, y: 0 };
    const end: DragPoint = { x: 400, y: 400 };
    const result = calculateNewFractalParams(start, end, defaultParams, canvasSize);

    expect(result).not.toBeNull();
    // With zoom=1, range=3.0, so the canvas spans [-1.5, 1.5]
    // Drag covers [0, 400] out of 800px → fractal coords [-1.5, 0]
    // New center should be at (-0.75, -0.75)
    expect(result!.centerX).toBeCloseTo(-0.75, 5);
    expect(result!.centerY).toBeCloseTo(-0.75, 5);
    expect(result!.zoom).toBeCloseTo(2, 5);
  });

  it("preserves extra params from the input", () => {
    const params = { ...defaultParams, maxIter: 500, extra: "keep" };
    const start: DragPoint = { x: 0, y: 0 };
    const end: DragPoint = { x: 400, y: 400 };
    const result = calculateNewFractalParams(start, end, params, canvasSize);

    expect(result).not.toBeNull();
    expect((result as any).maxIter).toBe(500);
    expect((result as any).extra).toBe("keep");
  });

  it("handles reversed drag direction (end < start)", () => {
    const start: DragPoint = { x: 600, y: 600 };
    const end: DragPoint = { x: 200, y: 200 };
    const result = calculateNewFractalParams(start, end, defaultParams, canvasSize);

    // Should produce same result as (200,200)→(600,600) due to min/max
    const forward = calculateNewFractalParams(
      { x: 200, y: 200 },
      { x: 600, y: 600 },
      defaultParams,
      canvasSize
    );

    expect(result).not.toBeNull();
    expect(result!.centerX).toBeCloseTo(forward!.centerX, 10);
    expect(result!.centerY).toBeCloseTo(forward!.centerY, 10);
    expect(result!.zoom).toBeCloseTo(forward!.zoom, 10);
  });

  it("handles non-unit zoom correctly", () => {
    const params: FractalParams = { centerX: -0.5, centerY: 0.5, zoom: 4 };
    // With zoom=4, range=3/4=0.75, center at (-0.5, 0.5)
    // Canvas spans [-0.875, -0.125] x [0.125, 0.875]
    const start: DragPoint = { x: 200, y: 200 };
    const end: DragPoint = { x: 600, y: 600 };
    const result = calculateNewFractalParams(start, end, params, canvasSize);

    expect(result).not.toBeNull();
    // Center quarter drag → center stays same, zoom doubles
    expect(result!.centerX).toBeCloseTo(-0.5, 5);
    expect(result!.centerY).toBeCloseTo(0.5, 5);
    expect(result!.zoom).toBeCloseTo(8, 5);
  });
});

describe("calculateNewLyapunovZoomParams", () => {
  const defaultParams: LyapunovParams = {
    aMin: 2.0,
    aMax: 4.0,
    bMin: 2.0,
    bMax: 4.0,
    maxIter: 100,
    sequence: "AB",
  };
  const canvasSize = 800;

  it("returns null for tiny drags (< 10px)", () => {
    const start: DragPoint = { x: 100, y: 100 };
    const end: DragPoint = { x: 105, y: 105 };
    const result = calculateNewLyapunovZoomParams(start, end, defaultParams, canvasSize);
    expect(result).toBeNull();
  });

  it("full-canvas drag keeps params the same", () => {
    const start: DragPoint = { x: 0, y: 0 };
    const end: DragPoint = { x: canvasSize, y: canvasSize };
    const result = calculateNewLyapunovZoomParams(start, end, defaultParams, canvasSize);

    expect(result).not.toBeNull();
    expect(result!.aMin).toBeCloseTo(2.0, 10);
    expect(result!.aMax).toBeCloseTo(4.0, 10);
    expect(result!.bMin).toBeCloseTo(2.0, 10);
    expect(result!.bMax).toBeCloseTo(4.0, 10);
  });

  it("half-canvas drag narrows ranges by half", () => {
    // Drag left half: (0,0) to (400, 800)
    const start: DragPoint = { x: 0, y: 0 };
    const end: DragPoint = { x: 400, y: canvasSize };
    const result = calculateNewLyapunovZoomParams(start, end, defaultParams, canvasSize);

    expect(result).not.toBeNull();
    // a range should narrow to [2, 3], b range stays [2, 4]
    expect(result!.aMin).toBeCloseTo(2.0, 10);
    expect(result!.aMax).toBeCloseTo(3.0, 10);
    expect(result!.bMin).toBeCloseTo(2.0, 10);
    expect(result!.bMax).toBeCloseTo(4.0, 10);
  });

  it("quarter-canvas drag narrows both ranges proportionally", () => {
    // Drag center quarter: (200,200) to (600,600) on 800px canvas
    const start: DragPoint = { x: 200, y: 200 };
    const end: DragPoint = { x: 600, y: 600 };
    const result = calculateNewLyapunovZoomParams(start, end, defaultParams, canvasSize);

    expect(result).not.toBeNull();
    // a: 2.0 + (200/800)*2 = 2.5, 2.0 + (600/800)*2 = 3.5
    expect(result!.aMin).toBeCloseTo(2.5, 10);
    expect(result!.aMax).toBeCloseTo(3.5, 10);
    // b: same
    expect(result!.bMin).toBeCloseTo(2.5, 10);
    expect(result!.bMax).toBeCloseTo(3.5, 10);
  });

  it("preserves non-zoom params", () => {
    const start: DragPoint = { x: 0, y: 0 };
    const end: DragPoint = { x: 400, y: 400 };
    const result = calculateNewLyapunovZoomParams(start, end, defaultParams, canvasSize);

    expect(result).not.toBeNull();
    expect(result!.maxIter).toBe(100);
    expect(result!.sequence).toBe("AB");
  });

  it("handles reversed drag direction", () => {
    const start: DragPoint = { x: 600, y: 600 };
    const end: DragPoint = { x: 200, y: 200 };
    const forward = calculateNewLyapunovZoomParams(
      { x: 200, y: 200 },
      { x: 600, y: 600 },
      defaultParams,
      canvasSize
    );
    const result = calculateNewLyapunovZoomParams(start, end, defaultParams, canvasSize);

    expect(result).not.toBeNull();
    expect(result!.aMin).toBeCloseTo(forward!.aMin, 10);
    expect(result!.aMax).toBeCloseTo(forward!.aMax, 10);
    expect(result!.bMin).toBeCloseTo(forward!.bMin, 10);
    expect(result!.bMax).toBeCloseTo(forward!.bMax, 10);
  });
});
