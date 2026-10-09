export type BgMode = "void" | "ink" | "paper";
export interface BgColor { r: number; g: number; b: number }

const INK_FALLBACK: BgColor = { r: 10, g: 11, b: 16 };

function hexToRgb(hex: string): BgColor | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
}

export function bgModeOf(c: BgColor): BgMode {
  if (c.r === 0 && c.g === 0 && c.b === 0) return "void";
  if (c.r === 255 && c.g === 255 && c.b === 255) return "paper";
  return "ink";
}

export function bgColorFor(mode: BgMode, inkHex: string): BgColor {
  if (mode === "void") return { r: 0, g: 0, b: 0 };
  if (mode === "paper") return { r: 255, g: 255, b: 255 };
  const ink = hexToRgb(inkHex) ?? INK_FALLBACK;
  // Ink must never collide with void/paper sentinels.
  return bgModeOf(ink) === "ink" ? ink : INK_FALLBACK;
}
