import { registry } from "../registry";
import { MandelbrotControls } from "./Controls";
import { DEFAULT_MANDELBROT } from "./config";
import { MandelbrotParams } from "./types";

export * from "./types";
export * from "./config";
export { MandelbrotControls };

registry.register({
  id: "mandelbrot",
  label: "Mandelbrot",
  category: "Fractals",
  defaultParams: DEFAULT_MANDELBROT as MandelbrotParams,
  Controls: MandelbrotControls,
  workerIteratorName: "mandelbrot"
});
