import { registry } from "../registry";
import { lyapunovMeta } from "./meta";
import { LyapunovControls } from "./Controls";

export * from "./types";
export * from "./config";
export { LyapunovControls };

registry.register({ ...lyapunovMeta, Controls: LyapunovControls });
