import { themes } from "../theme/themes";
import { tokens } from "../theme/tokens";

const NEW_KEYS = [
  "primary", "primaryContainer", "primaryRgb", "primaryContainerRgb", "primarySoft", "primaryBorder", "focusBorder", "onPrimary",
  "secondary", "secondarySoft", "glowPrimary", "glowSecondary",
  "canvasBg", "pageBg", "surfaceLowest", "surface", "surfaceLow", "surfaceHigh", "surfaceHighest",
  "glass1", "glass2", "glassBar",
  "hairline", "hairlineStrong", "textHigh", "textMid", "textLow",
];
const LEGACY_KEYS = ["accent", "accentBorder", "glassBg", "bgPage", "danger"];

describe("themes", () => {
  it("keeps all five themes", () => {
    expect(Object.keys(themes)).toEqual([
      "cyber_cyan", "electric_indigo", "emerald_matrix", "solar_flare", "crimson_void",
    ]);
  });

  it.each(Object.keys(themes))("%s has every design token and legacy key", (id) => {
    const c = themes[id].colors as unknown as Record<string, string>;
    for (const k of [...NEW_KEYS, ...LEGACY_KEYS]) {
      expect(typeof c[k]).toBe("string");
      expect(c[k].length).toBeGreaterThan(0);
    }
  });

  it("cyber cyan matches the Stitch Material palette", () => {
    const c = themes.cyber_cyan.colors;
    expect(c.primary).toBe("rgba(76, 215, 246, 1)");
    expect(c.primaryContainer).toBe("rgba(6, 182, 212, 1)");
    expect(c.secondary).toBe("rgba(208, 188, 255, 1)");
    expect(c.pageBg).toBe("#10131c");
    expect(c.surfaceLow).toBe("#181b25");
    expect(c.surface).toBe("#1c1f29");
    expect(c.textHigh).toBe("#e0e2ef");
    expect(c.textMid).toBe("#bcc9cd");
  });

  it("exposes non-color tokens", () => {
    expect(tokens.font.mono).toMatch(/JetBrains Mono/);
    expect(tokens.breakpoint.mobileMax).toBe(1023);
  });
});
