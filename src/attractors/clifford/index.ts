import { registry } from "../registry";
import { cliffordMeta } from "./meta";
import { CliffordControls } from "./Controls";

export * from "./types";
export * from "./config";
export { CliffordControls };

registry.register({ ...cliffordMeta, Controls: CliffordControls });
