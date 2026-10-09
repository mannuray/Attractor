import { themes } from "../theme/themes";
import { tokens } from "../theme/tokens";

const NEW_KEYS = [
  "primary", "primarySoft", "primaryBorder", "focusBorder", "onPrimary",
  "secondary", "secondarySoft", "glowPrimary", "glowSecondary",
  "canvasBg", "surface", "surfaceLow", "surfaceHigh", "glass1", "glass2",
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

  it("cyber cyan matches the Stitch palette", () => {
    expect(themes.cyber_cyan.colors.primary).toBe("rgba(6, 182, 212, 1)");
    expect(themes.cyber_cyan.colors.secondary).toBe("rgba(139, 92, 246, 1)");
  });

  it("exposes non-color tokens", () => {
    expect(tokens.font.mono).toMatch(/JetBrains Mono/);
    expect(tokens.breakpoint.mobileMax).toBe(1023);
  });
});
