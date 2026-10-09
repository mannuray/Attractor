import { registry } from "../registry";
import { burningshipMeta } from "./meta";
import { BurningShipControls } from "./Controls";

export * from "./types";
export * from "./config";
export { BurningShipControls };

registry.register({ ...burningshipMeta, Controls: BurningShipControls });
