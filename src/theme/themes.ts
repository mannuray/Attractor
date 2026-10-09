export interface ThemeColors {
  accent: string;
  accentSoft: string;
  accentLight: string;
  accentDim: string;
  accentHover: string;
  accentBorderLight: string;
  accentBorderSoft: string;
  accentBorder: string;
  accentMuted: string;
  accentSubtle: string;
  glassBg: string;
  darkBg: string;
  darkerBg: string;
  darkestBg: string;
  white: string;
  shadow: string;
  success: string;
  danger: string;
  bgPage: string;
  primary: string;
  primaryContainer: string;
  /** "r, g, b" channels for building theme-aware tints: rgba(${primaryRgb}, a) */
  primaryRgb: string;
  primaryContainerRgb: string;
  primarySoft: string;
  primaryBorder: string;
  focusBorder: string;
  onPrimary: string;
  secondary: string;
  secondarySoft: string;
  glowPrimary: string;
  glowSecondary: string;
  canvasBg: string;
  pageBg: string;
  surfaceLowest: string;
  surface: string;
  surfaceLow: string;
  surfaceHigh: string;
  surfaceHighest: string;
  glass1: string;
  glass2: string;
  glassBar: string;
  hairline: string;
  hairlineStrong: string;
  textHigh: string;
  textMid: string;
  textLow: string;
}

type RGB = [number, number, number];
const rgba = (c: RGB, a: number) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;

// Mirrors the Stitch "Chaos Iterator" Material palette. `primary` is the light accent used for
// text, icons and borders; `primaryContainer` is the saturated fill for primary buttons.
function designColors(primary: RGB, primaryContainer: RGB, secondary: RGB) {
  const dark = primaryContainer.map(v => Math.round(v * 0.25)) as RGB;
  return {
    primary: rgba(primary, 1),
    primaryContainer: rgba(primaryContainer, 1),
    primaryRgb: primary.join(", "),
    primaryContainerRgb: primaryContainer.join(", "),
    primarySoft: rgba(primary, 0.12),
    primaryBorder: rgba(primary, 0.45),
    focusBorder: rgba(primary, 0.6),
    onPrimary: rgba(dark, 1),
    secondary: rgba(secondary, 1),
    secondarySoft: rgba(secondary, 0.15),
    glowPrimary: `0 0 16px -2px ${rgba(primaryContainer, 0.35)}`,
    glowSecondary: `0 0 16px -2px ${rgba(secondary, 0.35)}`,
    canvasBg: "#0b0e17",
    pageBg: "#10131c",
    surfaceLowest: "#0b0e17",
    surface: "#1c1f29",
    surfaceLow: "#181b25",
    surfaceHigh: "#272a33",
    surfaceHighest: "#32343f",
    glass1: "rgba(24, 27, 37, 0.85)",
    glass2: "rgba(24, 27, 37, 0.95)",
    glassBar: "rgba(16, 19, 28, 0.8)",
    hairline: "rgba(61, 73, 76, 0.3)",
    hairlineStrong: "rgba(61, 73, 76, 0.45)",
    textHigh: "#e0e2ef",
    textMid: "#bcc9cd",
    textLow: "rgba(188, 201, 205, 0.6)",
  };
}

export const themes: Record<string, { label: string; colors: ThemeColors }> = {
  cyber_cyan: {
    label: "Cyber Cyan",
    colors: {
      accent: "rgba(34, 211, 238, 1)",
      accentSoft: "rgba(34, 211, 238, 0.85)",
      accentLight: "rgba(125, 211, 252, 0.9)",
      accentDim: "rgba(34, 211, 238, 0.6)",
      accentHover: "rgba(34, 211, 238, 0.4)",
      accentBorderLight: "rgba(34, 211, 238, 0.35)",
      accentBorderSoft: "rgba(34, 211, 238, 0.25)",
      accentBorder: "rgba(34, 211, 238, 0.2)",
      accentMuted: "rgba(34, 211, 238, 0.15)",
      accentSubtle: "rgba(34, 211, 238, 0.1)",
      glassBg: "rgba(5, 7, 10, 0.75)",
      darkBg: "rgba(5, 7, 10, 0.4)",
      darkerBg: "rgba(5, 7, 10, 0.6)",
      darkestBg: "rgba(2, 6, 23, 0.9)",
      white: "#f0f9ff",
      shadow: "rgba(0, 0, 0, 0.6)",
      success: "#2dd4bf",
      danger: "#f43f5e",
      bgPage: "#05070a",
      ...designColors([76, 215, 246], [6, 182, 212], [208, 188, 255]),
    }
  },
  electric_indigo: {
    label: "Electric Indigo",
    colors: {
      accent: "rgba(99, 102, 241, 1)",
      accentSoft: "rgba(99, 102, 241, 0.85)",
      accentLight: "rgba(129, 140, 248, 0.9)",
      accentDim: "rgba(99, 102, 241, 0.6)",
      accentHover: "rgba(99, 102, 241, 0.4)",
      accentBorderLight: "rgba(99, 102, 241, 0.35)",
      accentBorderSoft: "rgba(99, 102, 241, 0.25)",
      accentBorder: "rgba(99, 102, 241, 0.2)",
      accentMuted: "rgba(99, 102, 241, 0.15)",
      accentSubtle: "rgba(99, 102, 241, 0.1)",
      glassBg: "rgba(18, 18, 20, 0.7)",
      darkBg: "rgba(18, 18, 20, 0.4)",
      darkerBg: "rgba(18, 18, 20, 0.6)",
      darkestBg: "rgba(10, 10, 12, 0.8)",
      white: "#f8fafc",
      shadow: "rgba(0, 0, 0, 0.4)",
      success: "#10b981",
      danger: "#ef4444",
      bgPage: "#121214",
      ...designColors([165, 180, 252], [99, 102, 241], [249, 168, 212]),
    }
  },
  emerald_matrix: {
    label: "Emerald Matrix",
    colors: {
      accent: "rgba(52, 211, 153, 1)",
      accentSoft: "rgba(52, 211, 153, 0.85)",
      accentLight: "rgba(110, 231, 183, 0.9)",
      accentDim: "rgba(52, 211, 153, 0.6)",
      accentHover: "rgba(52, 211, 153, 0.4)",
      accentBorderLight: "rgba(52, 211, 153, 0.35)",
      accentBorderSoft: "rgba(52, 211, 153, 0.25)",
      accentBorder: "rgba(52, 211, 153, 0.2)",
      accentMuted: "rgba(52, 211, 153, 0.15)",
      accentSubtle: "rgba(52, 211, 153, 0.1)",
      glassBg: "rgba(2, 10, 5, 0.75)",
      darkBg: "rgba(2, 10, 5, 0.4)",
      darkerBg: "rgba(2, 10, 5, 0.6)",
      darkestBg: "rgba(1, 5, 2, 0.9)",
      white: "#f0fdf4",
      shadow: "rgba(0, 0, 0, 0.6)",
      success: "#34d399",
      danger: "#fb7185",
      bgPage: "#020a05",
      ...designColors([110, 231, 183], [16, 185, 129], [103, 232, 249]),
    }
  },
  solar_flare: {
    label: "Solar Flare",
    colors: {
      accent: "rgba(251, 146, 60, 1)",
      accentSoft: "rgba(251, 146, 60, 0.85)",
      accentLight: "rgba(253, 186, 116, 0.9)",
      accentDim: "rgba(251, 146, 60, 0.6)",
      accentHover: "rgba(251, 146, 60, 0.4)",
      accentBorderLight: "rgba(251, 146, 60, 0.35)",
      accentBorderSoft: "rgba(251, 146, 60, 0.25)",
      accentBorder: "rgba(251, 146, 60, 0.2)",
      accentMuted: "rgba(251, 146, 60, 0.15)",
      accentSubtle: "rgba(251, 146, 60, 0.1)",
      glassBg: "rgba(15, 10, 5, 0.75)",
      darkBg: "rgba(15, 10, 5, 0.4)",
      darkerBg: "rgba(15, 10, 5, 0.6)",
      darkestBg: "rgba(7, 5, 2, 0.9)",
      white: "#fff7ed",
      shadow: "rgba(0, 0, 0, 0.6)",
      success: "#4ade80",
      danger: "#f87171",
      bgPage: "#0f0a05",
      ...designColors([253, 186, 116], [249, 115, 22], [253, 164, 175]),
    }
  },
  crimson_void: {
    label: "Crimson Void",
    colors: {
      accent: "rgba(244, 63, 94, 1)",
      accentSoft: "rgba(244, 63, 94, 0.85)",
      accentLight: "rgba(251, 113, 133, 0.9)",
      accentDim: "rgba(244, 63, 94, 0.6)",
      accentHover: "rgba(244, 63, 94, 0.4)",
      accentBorderLight: "rgba(244, 63, 94, 0.35)",
      accentBorderSoft: "rgba(244, 63, 94, 0.25)",
      accentBorder: "rgba(244, 63, 94, 0.2)",
      accentMuted: "rgba(244, 63, 94, 0.15)",
      accentSubtle: "rgba(244, 63, 94, 0.1)",
      glassBg: "rgba(10, 5, 5, 0.75)",
      darkBg: "rgba(10, 5, 5, 0.4)",
      darkerBg: "rgba(10, 5, 5, 0.6)",
      darkestBg: "rgba(5, 2, 2, 0.9)",
      white: "#fff1f2",
      shadow: "rgba(0, 0, 0, 0.6)",
      success: "#10b981",
      danger: "#e11d48",
      bgPage: "#0a0505",
      ...designColors([253, 164, 175], [244, 63, 94], [253, 186, 116]),
    }
  }
};
