import { registry } from "../registry";
import { sprottMeta } from "./meta";
import { SprottControls } from "./Controls";

export * from "./types";
export * from "./config";
export { SprottControls };

registry.register({ ...sprottMeta, Controls: SprottControls });
