import { Color } from "../../model-controller/Attractor/palette";

// Configuration constants
export const CONFIG = {
  DEFAULT_CANVAS_SIZE: 1800,
  ALIAS: 2,
  INITIAL_ICON_INDEX: 32,
  ITERATION_INTERVAL_MS: 500,
  COLOR_LUT_SIZE: 2048,
};

// Attractor type union
export type AttractorType =
  | "symmetric_icon"
  | "symmetric_quilt"
  | "clifford"
  | "dejong"
  | "tinkerbell"
  | "henon"
  | "bedhead"
  | "svensson"
  | "fractal_dream"
  | "hopalong"
  | "gumowski_mira"
  | "sprott"
  | "symmetric_fractal"
  | "derham"
  | "conradi"
  | "mobius"
  | "jason_rampe1"
  | "jason_rampe2"
  | "jason_rampe3"
  | "mandelbrot"
  | "julia"
  | "burningship"
  | "tricorn"
  | "multibrot"
  | "newton"
  | "phoenix"
  | "lyapunov";

// Worker message types
export interface HitsData {
  hits: Uint32Array;
  maxHits: number;
  iteratorSize: number;
}

export interface WorkerMessage {
  type: string;
  payload: HitsData;
}

// Base interface for attractors with scale parameter
export interface ScaledAttractorParams {
  scale: number;
}

// Base interface for fractals with zoom/center
export interface FractalParams {
  centerX: number;
  centerY: number;
  zoom: number;
  maxIter: number;
}

// Icon preset data structure
export interface IconData {
  name: string;
  alpha: number;
  betha: number;
  gamma: number;
  delta: number;
  omega: number;
  lambda: number;
  degree: number;
  npdegree: number;
  scale: number;
  palGamma?: number;
  paletteData: Color[];
}

// Default palette
export const DEFAULT_PALETTE: Color[] = [
  { position: 0, red: 0, green: 0, blue: 0 },
  { position: 0.2, red: 255, green: 0, blue: 0 },
  { position: 0.4, red: 255, green: 255, blue: 0 },
  { position: 0.6, red: 0, green: 255, blue: 0 },
  { position: 0.8, red: 0, green: 255, blue: 255 },
  { position: 1, red: 255, green: 255, blue: 255 },
];

// Format large numbers compactly
export const formatCompact = (num: number): string => {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return num.toString();
};

// Feature detection for OffscreenCanvas
export const supportsOffscreenCanvas = (): boolean => {
  if (typeof OffscreenCanvas === 'undefined') return false;
  try {
    const test = document.createElement('canvas');
    const offscreen = test.transferControlToOffscreen();
    const ctx = offscreen.getContext('2d');
    return ctx !== null;
  } catch {
    return false;
  }
};
