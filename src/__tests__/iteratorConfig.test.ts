import { buildIteratorPayload, getScale, ITERATOR_CONFIG } from "../hooks/iteratorConfig";

describe("buildIteratorPayload", () => {
  it("clifford: returns correct workerName and extracts only param keys", () => {
    const params = {
      alpha: -1.4,
      beta: 1.6,
      gamma: 1.0,
      delta: 0.7,
      scale: 3.5,
      extraStuff: "should not appear",
    };
    const result = buildIteratorPayload("clifford", params);

    expect(result.name).toBe("clifford_iterator");
    expect(result.parameters).toEqual({
      alpha: -1.4,
      beta: 1.6,
      gamma: 1.0,
      delta: 0.7,
    });
    expect(result.parameters).not.toHaveProperty("scale");
    expect(result.parameters).not.toHaveProperty("extraStuff");
  });

  it("symmetric_icon: returns correct workerName and all 8 param keys", () => {
    const params = {
      alpha: 2.0,
      betha: 0.2,
      gamma: 0.1,
      delta: 0.0,
      omega: 0.0,
      lambda: -1.0,
      degree: 5,
      npdegree: 3,
      scale: 4.0,
    };
    const result = buildIteratorPayload("symmetric_icon", params);

    expect(result.name).toBe("symmetric_icon");
    expect(Object.keys(result.parameters)).toHaveLength(8);
    expect(result.parameters.alpha).toBe(2.0);
    expect(result.parameters.degree).toBe(5);
  });

  it("lyapunov: includes sequence as extra field", () => {
    const params = {
      aMin: 2.0,
      aMax: 4.0,
      bMin: 2.0,
      bMax: 4.0,
      maxIter: 100,
      sequence: "AB",
    };
    const result = buildIteratorPayload("lyapunov", params);

    expect(result.name).toBe("lyapunov");
    expect(result.parameters).toEqual({
      aMin: 2.0,
      aMax: 4.0,
      bMin: 2.0,
      bMax: 4.0,
      maxIter: 100,
    });
    expect(result.sequence).toBe("AB");
  });

  it("mandelbrot: fractal type has no extra fields", () => {
    const params = {
      centerX: 0,
      centerY: 0,
      zoom: 1,
      maxIter: 200,
    };
    const result = buildIteratorPayload("mandelbrot", params);

    expect(result.name).toBe("mandelbrot");
    expect(result.parameters).toEqual({
      centerX: 0,
      centerY: 0,
      zoom: 1,
      maxIter: 200,
    });
    expect(result.sequence).toBeUndefined();
  });

  it("henon: only extracts alpha and beta", () => {
    const params = {
      alpha: 1.4,
      beta: 0.3,
      scale: 5.0,
      gamma: 999,
    };
    const result = buildIteratorPayload("henon", params);

    expect(result.name).toBe("henon_iterator");
    expect(result.parameters).toEqual({
      alpha: 1.4,
      beta: 0.3,
    });
  });
});

describe("getScale", () => {
  it("returns params.scale for attractor types (hasScale=true)", () => {
    expect(getScale("clifford", { scale: 3.5 })).toBe(3.5);
    expect(getScale("symmetric_icon", { scale: 4.0 })).toBe(4.0);
    expect(getScale("henon", { scale: 5.0 })).toBe(5.0);
  });

  it("returns 1 for fractal types (hasScale=false)", () => {
    expect(getScale("mandelbrot", { scale: 999 })).toBe(1);
    expect(getScale("julia", { scale: 123 })).toBe(1);
    expect(getScale("lyapunov", { scale: 456 })).toBe(1);
  });

  it("returns 1 for fractal types even without scale param", () => {
    expect(getScale("mandelbrot", {})).toBe(1);
    expect(getScale("burningship", {})).toBe(1);
  });
});

describe("ITERATOR_CONFIG completeness", () => {
  it("every entry has a workerName and paramKeys array", () => {
    for (const [type, config] of Object.entries(ITERATOR_CONFIG)) {
      expect(config.workerName).toBeTruthy();
      expect(Array.isArray(config.paramKeys)).toBe(true);
      expect(config.paramKeys.length).toBeGreaterThan(0);
      expect(typeof config.hasScale).toBe("boolean");
    }
  });
});
