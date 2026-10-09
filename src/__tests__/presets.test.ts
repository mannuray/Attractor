import { PRESETS, presetFor } from "../attractors/presets";
import { SYSTEM_CATALOG } from "../attractors/catalog";
import symmetricIconData, { cliffordData, mandelbrotData } from "../Parametersets";
import { gumowskiMiraPresets } from "../attractors/gumowskiMira/config";

describe("PRESETS", () => {
  it("covers every system whose controls show presets", () => {
    const withPresets = [
      "symmetric_icon", "symmetric_quilt", "clifford", "dejong", "tinkerbell", "henon", "bedhead", "svensson",
      "fractal_dream", "hopalong", "gumowski_mira", "sprott", "symmetric_fractal", "derham", "conradi", "mobius",
      "mandelbrot", "julia",
    ];
    for (const id of withPresets) expect(PRESETS[id as keyof typeof PRESETS]?.length).toBeGreaterThan(0);
    for (const id of Object.keys(PRESETS)) expect(SYSTEM_CATALOG.some(m => m.id === id)).toBe(true);
  });

  it("keeps the presets' order, names and palettes", () => {
    expect(PRESETS.clifford!.map(p => p.name)).toEqual(cliffordData.map(p => p.name));
    expect(PRESETS.symmetric_icon![3].paletteData).toBe(symmetricIconData[3].paletteData);
    expect(PRESETS.mandelbrot![0].name).toBe(mandelbrotData[0].name);
    expect(PRESETS.gumowski_mira!.map(p => p.name)).toEqual(gumowskiMiraPresets.map(p => p.name));
  });

  it("separates the maths from the look", () => {
    const p = presetFor("clifford", 0)!;
    expect(p.params).not.toHaveProperty("name");
    expect(p.params).not.toHaveProperty("paletteData");
    expect(p.params).not.toHaveProperty("palGamma");
    expect(p.params).toHaveProperty("alpha");
    expect(presetFor("gumowski_mira", 0)!.params).toEqual(gumowskiMiraPresets[0].params);
    expect(presetFor("gumowski_mira", 0)!.paletteData).toBeUndefined();
  });

  it("returns undefined for unknown systems or indexes", () => {
    expect(presetFor("clifford", 999)).toBeUndefined();
    expect(presetFor("lyapunov", 0)).toBeUndefined();
  });
});
