import { SprottParams } from "./types";

export const DEFAULT_SPROTT: SprottParams = {
  a1: 0.8, a2: -0.7, a3: -0.6, a4: -0.2, a5: -0.8, a6: 0.1,
  a7: -0.2, a8: 0.3, a9: 1.0, a10: -0.4, a11: -0.9, a12: 0.9,
  scale: 0.33,
};

// Chaotic attractors found with Sprott's method: random quadratic maps whose 12 coefficients
// are multiples of 0.1 in [-1.2, 1.2], kept only if the orbit stays bounded and its Lyapunov
// exponent is positive. Each is named by its Sprott code (letter A = -1.2 ... Y = 1.2, in
// coefficient order a1..a12).
export const sprottPresets: { name: string; params: SprottParams }[] = [
  { name: "UFGKENKPWIDV", params: { a1: 0.8, a2: -0.7, a3: -0.6, a4: -0.2, a5: -0.8, a6: 0.1, a7: -0.2, a8: 0.3, a9: 1.0, a10: -0.4, a11: -0.9, a12: 0.9, scale: 0.33 } },
  { name: "RGDMSGSDJWDK", params: { a1: 0.5, a2: -0.6, a3: -0.9, a4: 0.0, a5: 0.6, a6: -0.6, a7: 0.6, a8: -0.9, a9: -0.3, a10: 1.0, a11: -0.9, a12: -0.2, scale: 0.34 } },
  { name: "PDAJOAUNNYID", params: { a1: 0.3, a2: -0.9, a3: -1.2, a4: -0.3, a5: 0.2, a6: -1.2, a7: 0.8, a8: 0.1, a9: 0.1, a10: 1.2, a11: -0.4, a12: -0.9, scale: 0.4 } },
  { name: "UPDAVFSBIWSM", params: { a1: 0.8, a2: 0.3, a3: -0.9, a4: -1.2, a5: 0.9, a6: -0.7, a7: 0.6, a8: -1.1, a9: -0.4, a10: 1.0, a11: 0.6, a12: 0.0, scale: 0.24 } },
  { name: "ONQUMFEBRXNY", params: { a1: 0.2, a2: 0.1, a3: 0.4, a4: 0.8, a5: 0.0, a6: -0.7, a7: -0.8, a8: -1.1, a9: 0.5, a10: 1.1, a11: 0.1, a12: 1.2, scale: 0.41 } },
  { name: "TWITPBHAMIHL", params: { a1: 0.7, a2: 1.0, a3: -0.4, a4: 0.7, a5: 0.3, a6: -1.1, a7: -0.5, a8: -1.2, a9: 0.0, a10: -0.4, a11: -0.5, a12: -0.1, scale: 0.45 } },
];
