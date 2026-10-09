import type { SystemMeta } from "../registry";
import { DEFAULT_MANDELBROT } from "./config";
import type { MandelbrotParams } from "./types";

export const mandelbrotMeta: SystemMeta = {
  id: "mandelbrot",
  label: "Mandelbrot",
  category: "Fractals",
  defaultParams: DEFAULT_MANDELBROT as MandelbrotParams,
  workerIteratorName: "mandelbrot"
};
