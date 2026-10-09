import { registry } from "../registry";
import { mobiusMeta } from "./meta";
import { MobiusControls } from "./Controls";

export * from "./types";
export * from "./config";
export { MobiusControls };

registry.register({ ...mobiusMeta, Controls: MobiusControls });
