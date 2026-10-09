import { registry } from "../registry";
import { multibrotMeta } from "./meta";
import { MultibrotControls } from "./Controls";

export * from "./types";
export * from "./config";
export { MultibrotControls };

registry.register({ ...multibrotMeta, Controls: MultibrotControls });
