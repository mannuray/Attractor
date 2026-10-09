export const tokens = {
  radius: { sm: "4px", md: "10px", lg: "16px", full: "9999px" },
  font: {
    ui: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', ui-monospace, monospace",
  },
  z: { canvas: 0, toolbar: 20, panel: 30, sheet: 40, modal: 1000 },
  breakpoint: { mobileMax: 1023 },
} as const;
