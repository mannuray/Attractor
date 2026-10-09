import { registry } from "../registry";
import { hopalongMeta } from "./meta";
import { HopalongControls } from "./Controls";

export * from "./types";
export * from "./config";
export { HopalongControls };

registry.register({ ...hopalongMeta, Controls: HopalongControls });
