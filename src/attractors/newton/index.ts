import { registry } from "../registry";
import { newtonMeta } from "./meta";
import { NewtonControls } from "./Controls";

export * from "./types";
export * from "./config";
export { NewtonControls };

registry.register({ ...newtonMeta, Controls: NewtonControls });
