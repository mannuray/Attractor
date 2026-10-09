import {
  toHex, fromHex, rgbToHsv, hsvToRgb, interpolateAt, addStop, removeStop, moveStop, setStopColor, isEndStop, Stop,
} from "../lib/colorRamp";

const ramp: Stop[] = [
  { position: 0, red: 0, green: 0, blue: 0 },
  { position: 0.5, red: 30, green: 90, blue: 156 },
  { position: 1, red: 255, green: 255, blue: 255 },
];

describe("hex", () => {
  it("formats and parses, with or without #, 3 or 6 digits", () => {
    expect(toHex({ red: 30, green: 90, blue: 156 })).toBe("#1E5A9C");
    expect(fromHex("#1e5a9c")).toEqual({ red: 30, green: 90, blue: 156 });
    expect(fromHex("1E5A9C")).toEqual({ red: 30, green: 90, blue: 156 });
    expect(fromHex("#fff")).toEqual({ red: 255, green: 255, blue: 255 });
  });

  it("rejects invalid hex", () => {
    expect(fromHex("#12")).toBeNull();
    expect(fromHex("zzzzzz")).toBeNull();
  });
});

describe("hsv", () => {
  it("round-trips through hsv", () => {
    for (const c of [{ red: 30, green: 90, blue: 156 }, { red: 255, green: 0, blue: 0 }, { red: 0, green: 0, blue: 0 }]) {
      const { h, s, v } = rgbToHsv(c);
      expect(hsvToRgb(h, s, v)).toEqual(c);
    }
  });
});

describe("ramp operations", () => {
  it("interpolates between stops", () => {
    expect(interpolateAt(ramp, 0.25)).toEqual({ red: 15, green: 45, blue: 78 });
    expect(interpolateAt(ramp, 0)).toEqual({ red: 0, green: 0, blue: 0 });
    expect(interpolateAt(ramp, 1)).toEqual({ red: 255, green: 255, blue: 255 });
  });

  it("adds a stop with the interpolated color and returns its index", () => {
    const { stops, index } = addStop(ramp, 0.25);
    expect(stops).toHaveLength(4);
    expect(index).toBe(1);
    expect(stops[1]).toEqual({ position: 0.25, red: 15, green: 45, blue: 78 });
  });

  it("never removes the end stops or goes below two stops", () => {
    expect(removeStop(ramp, 0)).toBe(ramp);
    expect(removeStop(ramp, 2)).toBe(ramp);
    expect(removeStop(ramp, 1)).toHaveLength(2);
    expect(isEndStop(ramp, 0)).toBe(true);
    expect(isEndStop(ramp, 1)).toBe(false);
  });

  it("moves a middle stop, clamped between its neighbours; end stops stay put", () => {
    expect(moveStop(ramp, 1, 0.7)[1].position).toBe(0.7);
    expect(moveStop(ramp, 1, 1.5)[1].position).toBeCloseTo(0.99);
    expect(moveStop(ramp, 1, -1)[1].position).toBeCloseTo(0.01);
    expect(moveStop(ramp, 0, 0.4)).toBe(ramp);
  });

  it("sets a stop color without mutating the input", () => {
    const next = setStopColor(ramp, 1, { red: 1, green: 2, blue: 3 });
    expect(next[1]).toEqual({ position: 0.5, red: 1, green: 2, blue: 3 });
    expect(ramp[1].red).toBe(30);
  });
});
