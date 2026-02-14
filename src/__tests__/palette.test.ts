import { Palette, Color } from "../model-controller/Attractor/palette";

const noop = () => {};

describe("Palette", () => {
  describe("default palette (black → white)", () => {
    const palette = new Palette(undefined, noop);

    it("color(0) returns the first color (black)", () => {
      const c = palette.color(0);
      expect(c.red).toBe(0);
      expect(c.green).toBe(0);
      expect(c.blue).toBe(0);
    });

    it("color(1) returns the last color (white)", () => {
      const c = palette.color(1);
      expect(c.red).toBe(255);
      expect(c.green).toBe(255);
      expect(c.blue).toBe(255);
    });

    it("color(0.5) returns mid-gray", () => {
      const c = palette.color(0.5);
      expect(c.red).toBe(128);
      expect(c.green).toBe(128);
      expect(c.blue).toBe(128);
    });

    it("color(0.25) returns quarter-gray", () => {
      const c = palette.color(0.25);
      expect(c.red).toBe(64);
      expect(c.green).toBe(64);
      expect(c.blue).toBe(64);
    });
  });

  describe("out-of-range positions return white fallback", () => {
    const palette = new Palette(undefined, noop);

    it("color(-1) returns white", () => {
      const c = palette.color(-1);
      expect(c.red).toBe(255);
      expect(c.green).toBe(255);
      expect(c.blue).toBe(255);
    });

    it("color(2) returns white", () => {
      const c = palette.color(2);
      expect(c.red).toBe(255);
      expect(c.green).toBe(255);
      expect(c.blue).toBe(255);
    });

    it("color(-0.01) returns white", () => {
      const c = palette.color(-0.01);
      expect(c.red).toBe(255);
      expect(c.green).toBe(255);
      expect(c.blue).toBe(255);
    });

    it("color(1.01) returns white", () => {
      const c = palette.color(1.01);
      expect(c.red).toBe(255);
      expect(c.green).toBe(255);
      expect(c.blue).toBe(255);
    });
  });

  describe("multi-stop palette (3 colors)", () => {
    const colors: Color[] = [
      { position: 0, red: 255, green: 0, blue: 0 },
      { position: 0.5, red: 0, green: 255, blue: 0 },
      { position: 1, red: 0, green: 0, blue: 255 },
    ];
    const palette = new Palette(colors, noop);

    it("color(0) returns first color (red)", () => {
      const c = palette.color(0);
      expect(c.red).toBe(255);
      expect(c.green).toBe(0);
      expect(c.blue).toBe(0);
    });

    it("color(0.5) returns middle color (green)", () => {
      const c = palette.color(0.5);
      expect(c.red).toBe(0);
      expect(c.green).toBe(255);
      expect(c.blue).toBe(0);
    });

    it("color(1) returns last color (blue)", () => {
      const c = palette.color(1);
      expect(c.red).toBe(0);
      expect(c.green).toBe(0);
      expect(c.blue).toBe(255);
    });

    it("color(0.25) interpolates between red and green", () => {
      const c = palette.color(0.25);
      expect(c.red).toBe(128);
      expect(c.green).toBe(128);
      expect(c.blue).toBe(0);
    });

    it("color(0.75) interpolates between green and blue", () => {
      const c = palette.color(0.75);
      expect(c.red).toBe(0);
      expect(c.green).toBe(128);
      expect(c.blue).toBe(128);
    });
  });

  describe("getColorHex", () => {
    const palette = new Palette(undefined, noop);

    it("returns correct hex for black (position 0)", () => {
      expect(palette.getColorHex(0)).toBe("#000000");
    });

    it("returns correct hex for white (position 1)", () => {
      expect(palette.getColorHex(1)).toBe("#ffffff");
    });

    it("returns correct hex for mid-gray (position 0.5)", () => {
      expect(palette.getColorHex(0.5)).toBe("#808080");
    });

    it("returns white hex for out-of-range values", () => {
      expect(palette.getColorHex(-1)).toBe("#ffffff");
      expect(palette.getColorHex(2)).toBe("#ffffff");
    });

    it("returns correct hex for a known RGB color", () => {
      const colors: Color[] = [
        { position: 0, red: 255, green: 128, blue: 0 },
        { position: 1, red: 255, green: 128, blue: 0 },
      ];
      const p = new Palette(colors, noop);
      expect(p.getColorHex(0.5)).toBe("#ff8000");
    });
  });

  describe("binary search correctness", () => {
    it("handles many stops correctly", () => {
      const colors: Color[] = [
        { position: 0, red: 0, green: 0, blue: 0 },
        { position: 0.2, red: 50, green: 50, blue: 50 },
        { position: 0.4, red: 100, green: 100, blue: 100 },
        { position: 0.6, red: 150, green: 150, blue: 150 },
        { position: 0.8, red: 200, green: 200, blue: 200 },
        { position: 1, red: 255, green: 255, blue: 255 },
      ];
      const palette = new Palette(colors, noop);

      // At exact stop positions
      expect(palette.color(0).red).toBe(0);
      expect(palette.color(0.2).red).toBe(50);
      expect(palette.color(0.4).red).toBe(100);
      expect(palette.color(0.6).red).toBe(150);
      expect(palette.color(0.8).red).toBe(200);
      expect(palette.color(1).red).toBe(255);

      // Midpoints between stops
      expect(palette.color(0.1).red).toBe(25);
      expect(palette.color(0.3).red).toBe(75);
      expect(palette.color(0.5).red).toBe(125);
    });
  });
});
