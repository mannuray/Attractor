import { SprottParams } from "./types";

export const DEFAULT_SPROTT: SprottParams = {
  a1: 1.0, a2: -0.1, a3: 0.9, a4: -0.5, a5: -0.6, a6: -1.1,
  a7: -0.3, a8: -0.1, a9: -0.3, a10: -0.6, a11: 0.8, a12: -0.5,
  scale: 0.2,
};

// Presets from Sprott's paper (converted from code format)
export const sprottPresets: { name: string; params: SprottParams }[] = [
  { name: "Example A", params: { a1: 1.0, a2: -0.1, a3: 0.9, a4: -0.5, a5: -0.6, a6: -1.1, a7: -0.3, a8: -0.1, a9: -0.3, a10: -0.6, a11: 0.8, a12: -0.5, scale: 0.2 } },
  { name: "Example B", params: { a1: 0.9, a2: -0.7, a3: 0.1, a4: 0.7, a5: -0.9, a6: -0.4, a7: 0.4, a8: 0.2, a9: 0.7, a10: 0.5, a11: -0.3, a12: 0.5, scale: 0.2 } },
  { name: "Example C", params: { a1: 0.4, a2: 0.0, a3: 0.9, a4: 1.0, a5: -1.0, a6: -0.5, a7: 0.1, a8: -0.5, a9: -0.5, a10: 1.0, a11: 1.0, a12: 0.7, scale: 0.25 } },
  { name: "Example G", params: { a1: -0.8, a2: 0.4, a3: -1.1, a4: 0.5, a5: -0.6, a6: -0.1, a7: -0.5, a8: 0.8, a9: 1.0, a10: -0.3, a11: -0.6, a12: -0.3, scale: 0.22 } },
  { name: "Example I", params: { a1: 0.1, a2: -0.1, a3: -0.7, a4: 0.1, a5: 0.2, a6: 0.7, a7: 1.0, a8: 0.3, a9: 0.0, a10: -0.5, a11: -0.4, a12: -1.0, scale: 0.2 } },
  { name: "Example L", params: { a1: 0.5, a2: 0.6, a3: 0.8, a4: -1.0, a5: -0.5, a6: 0.7, a7: 0.7, a8: -0.1, a9: -0.2, a10: 0.6, a11: -0.9, a12: -0.3, scale: 0.18 } },
];
