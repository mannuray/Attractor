import { MobiusParams } from "./types";

export const DEFAULT_MOBIUS: MobiusParams = {
  aRe: 0.18, aIm: -0.01, bRe: -0.17, bIm: -0.06, cRe: -0.94, cIm: 0.22, dRe: -0.14, dIm: 0.99, n: 8, scale: 1.76,
};

// Found by searching for maps whose orbit stays bounded and settles on a fractal (dimension
// between 1.15 and 1.8): the earlier values never contracted and only drew noise.
export const mobiusPresets: { name: string; params: MobiusParams }[] = [
  { name: "Rosette Ring", params: { aRe: 0.18, aIm: -0.01, bRe: -0.17, bIm: -0.06, cRe: -0.94, cIm: 0.22, dRe: -0.14, dIm: 0.99, n: 8, scale: 1.76 } },
  { name: "Pentaflake", params: { aRe: -0.42, aIm: 0.22, bRe: -0.01, bIm: 0.09, cRe: -0.38, cIm: 0.03, dRe: -0.66, dIm: 0.93, n: 5, scale: 3.66 } },
  { name: "Triangles", params: { aRe: 0.53, aIm: -0.38, bRe: 0.74, bIm: -0.35, cRe: -0.19, cIm: 0.04, dRe: -0.86, dIm: -0.68, n: 3, scale: 0.34 } },
  { name: "Dendrite", params: { aRe: -0.46, aIm: -0.18, bRe: 0.37, bIm: 0.22, cRe: -0.37, cIm: -0.39, dRe: -0.56, dIm: 0.72, n: 3, scale: 0.39 } },
  { name: "Star", params: { aRe: 0.35, aIm: -0.37, bRe: -0.45, bIm: -0.23, cRe: 0.62, cIm: -0.12, dRe: 0.2, dIm: -0.98, n: 6, scale: 0.49 } },
];
