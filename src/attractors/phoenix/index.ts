import { registry } from "../registry";
import { phoenixMeta } from "./meta";
import { PhoenixControls } from "./Controls";

export * from "./types";
export * from "./config";
export { PhoenixControls };

registry.register({ ...phoenixMeta, Controls: PhoenixControls });
