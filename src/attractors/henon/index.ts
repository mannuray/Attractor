import { registry } from "../registry";
import { henonMeta } from "./meta";
import { HenonControls } from "./Controls";

export * from "./types";
export * from "./config";
export { HenonControls };

registry.register({ ...henonMeta, Controls: HenonControls });
