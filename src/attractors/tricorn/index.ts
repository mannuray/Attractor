import { registry } from "../registry";
import { tricornMeta } from "./meta";
import { TricornControls } from "./Controls";

export * from "./types";
export * from "./config";
export { TricornControls };

registry.register({ ...tricornMeta, Controls: TricornControls });
