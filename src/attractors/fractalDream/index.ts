import { registry } from "../registry";
import { fractalDreamMeta } from "./meta";
import { FractalDreamControls } from "./Controls";

export * from "./types";
export * from "./config";
export { FractalDreamControls };

registry.register({ ...fractalDreamMeta, Controls: FractalDreamControls });
