import { registry } from "../registry";
import { mandelbrotMeta } from "./meta";
import { MandelbrotControls } from "./Controls";

export * from "./types";
export * from "./config";
export { MandelbrotControls };

registry.register({ ...mandelbrotMeta, Controls: MandelbrotControls });
