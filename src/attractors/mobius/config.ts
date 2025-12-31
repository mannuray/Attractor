import { MobiusParams } from "./types";

export const DEFAULT_MOBIUS: MobiusParams = {
  aRe: 0.5, aIm: 0.5,
  bRe: 0.3, bIm: 0.2,
  cRe: 0.1, cIm: 0.1,
  dRe: 0.6, dIm: 0.3,
  n: 5,
  scale: 0.3,
};

export const mobiusPresets: { name: string; params: MobiusParams }[] = [
  { name: "Flower 1", params: { aRe: 0.5, aIm: 0.5, bRe: 0.3, bIm: 0.2, cRe: 0.1, cIm: 0.1, dRe: 0.6, dIm: 0.3, n: 5, scale: 0.3 } },
  { name: "Flower 2", params: { aRe: 0.6, aIm: 0.3, bRe: 0.2, bIm: 0.4, cRe: 0.15, cIm: 0.05, dRe: 0.5, dIm: 0.4, n: 6, scale: 0.28 } },
  { name: "Spiral Web", params: { aRe: 0.4, aIm: 0.6, bRe: 0.25, bIm: 0.15, cRe: 0.1, cIm: 0.2, dRe: 0.55, dIm: 0.25, n: 7, scale: 0.25 } },
  { name: "Star", params: { aRe: 0.45, aIm: 0.55, bRe: 0.35, bIm: 0.1, cRe: 0.05, cIm: 0.15, dRe: 0.65, dIm: 0.2, n: 8, scale: 0.22 } },
  { name: "Pentagon", params: { aRe: 0.5, aIm: 0.4, bRe: 0.3, bIm: 0.3, cRe: 0.1, cIm: 0.1, dRe: 0.6, dIm: 0.35, n: 5, scale: 0.32 } },
];
