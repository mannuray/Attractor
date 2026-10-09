import { registry } from "../registry";
import { bedheadMeta } from "./meta";
import { BedheadControls } from "./Controls";

export * from "./types";
export * from "./config";
export { BedheadControls };

registry.register({ ...bedheadMeta, Controls: BedheadControls });
