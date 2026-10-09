import { registry } from "../registry";
import { deJongMeta } from "./meta";
import { DeJongControls } from "./Controls";

export * from "./types";
export * from "./config";
export { DeJongControls };

registry.register({ ...deJongMeta, Controls: DeJongControls });
