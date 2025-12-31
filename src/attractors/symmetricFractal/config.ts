import { SymmetricFractalParams } from "./types";

export const DEFAULT_SYMMETRIC_FRACTAL: SymmetricFractalParams = {
  a: 0.5, b: 0.0, c: 0.0, d: 0.5,
  alpha: 0.5, beta: 0.0,
  p: 3,
  reflect: true,
  scale: 0.3,
};

export const symmetricFractalPresets: { name: string; params: SymmetricFractalParams }[] = [
  { name: "Sierpinski Triangle", params: { a: 0.5, b: 0.0, c: 0.0, d: 0.5, alpha: 0.5, beta: 0.0, p: 3, reflect: true, scale: 0.35 } },
  { name: "Sierpinski Square", params: { a: 0.5, b: 0.0, c: 0.0, d: 0.5, alpha: 0.5, beta: 0.0, p: 4, reflect: true, scale: 0.3 } },
  { name: "Sierpinski Pentagon", params: { a: 0.5, b: 0.0, c: 0.0, d: 0.5, alpha: 0.5, beta: 0.0, p: 5, reflect: true, scale: 0.28 } },
  { name: "Sierpinski Hexagon", params: { a: 0.5, b: 0.0, c: 0.0, d: 0.5, alpha: 0.5, beta: 0.0, p: 6, reflect: true, scale: 0.25 } },
  { name: "The Bee", params: { a: 0.45, b: 0.1, c: -0.1, d: 0.45, alpha: 0.5, beta: 0.0, p: 6, reflect: true, scale: 0.25 } },
  { name: "Circular Saw", params: { a: 0.38, b: 0.2, c: -0.2, d: 0.38, alpha: 0.5, beta: 0.0, p: 8, reflect: false, scale: 0.22 } },
  { name: "Astigmatism", params: { a: 0.6, b: 0.0, c: 0.0, d: 0.4, alpha: 0.5, beta: 0.0, p: 5, reflect: true, scale: 0.28 } },
];
