import { registry } from "../registry";
import { deRhamMeta } from "./meta";
import { DeRhamControls } from "./Controls";

export * from "./types";
export * from "./config";
export { DeRhamControls };

registry.register({ ...deRhamMeta, Controls: DeRhamControls });
