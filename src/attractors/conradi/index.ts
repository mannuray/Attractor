import { registry } from "../registry";
import { conradiMeta } from "./meta";
import { ConradiControls } from "./Controls";

export * from "./types";
export * from "./config";
export { ConradiControls };

registry.register({ ...conradiMeta, Controls: ConradiControls });
