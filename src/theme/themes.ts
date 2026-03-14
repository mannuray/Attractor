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
    }
  }
};
