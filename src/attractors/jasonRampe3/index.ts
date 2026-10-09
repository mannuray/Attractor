import { registry } from "../registry";
import { jasonRampe3Meta } from "./meta";
import { JasonRampe3Controls } from "./Controls";

export * from "./types";
export * from "./config";
export { JasonRampe3Controls };

registry.register({ ...jasonRampe3Meta, Controls: JasonRampe3Controls });
