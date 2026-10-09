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
  { name: "Flower", params: { mu: -0.236, alpha: 0.005, sigma: 0.05, scale: 0.055 } },
  { name: "Galaxy", params: { mu: 0.326, alpha: 0.008, sigma: 0.05, scale: 0.03 } },
  { name: "Hourglass", params: { mu: 0.342, alpha: 0.008, sigma: 0.05, scale: 0.025 } },
  { name: "Dragon", params: { mu: -0.806, alpha: 0.009, sigma: 0.05, scale: 0.017 } },
  { name: "Feather", params: { mu: -0.45, alpha: 0.005, sigma: 0.05, scale: 0.04 } },
  { name: "Star", params: { mu: 0.667, alpha: 0.005, sigma: 0.05, scale: 0.05 } },
  { name: "Spiral Web", params: { mu: 0.163, alpha: 0.009, sigma: 0.05, scale: 0.035 } },
  { name: "Chaos", params: { mu: -0.48, alpha: 0.008, sigma: 0.05, scale: 0.025 } },
];
