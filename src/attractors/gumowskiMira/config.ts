import { GumowskiMiraParams } from "./types";

export const DEFAULT_GUMOWSKI_MIRA: GumowskiMiraParams = {
  mu: -0.7,
  alpha: 0.008,
  sigma: 0.05,
  scale: 0.04,
};

export const gumowskiMiraPresets: { name: string; params: GumowskiMiraParams }[] = [
  { name: "Classic", params: { mu: -0.7, alpha: 0.008, sigma: 0.05, scale: 0.04 } },
  { name: "Butterfly", params: { mu: -0.496, alpha: 0.0, sigma: 0.0, scale: 0.06 } },
  { name: "Flower", params: { mu: -0.22, alpha: 0.0, sigma: 0.0, scale: 0.055 } },
  { name: "Galaxy", params: { mu: 0.31, alpha: -0.4, sigma: 0.0, scale: 0.03 } },
  { name: "Hourglass", params: { mu: 0.345703, alpha: 0.792533, sigma: 0.0, scale: 0.025 } },
  { name: "Dragon", params: { mu: -0.820411, alpha: 0.579162, sigma: 0.0, scale: 0.03 } },
  { name: "Feather", params: { mu: -0.436714, alpha: 0.062683, sigma: 0.0, scale: 0.04 } },
  { name: "Star", params: { mu: 0.661234, alpha: 0.900278, sigma: 0.0, scale: 0.025 } },
  { name: "Spiral Web", params: { mu: 0.16, alpha: -0.838, sigma: 0.0, scale: 0.035 } },
  { name: "Chaos", params: { mu: -0.48, alpha: 0.93, sigma: 0.0, scale: 0.025 } },
];
