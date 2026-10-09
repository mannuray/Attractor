import { registry } from "../registry";
import { jasonRampe2Meta } from "./meta";
import { JasonRampe2Controls } from "./Controls";

export * from "./types";
export * from "./config";
export { JasonRampe2Controls };

registry.register({ ...jasonRampe2Meta, Controls: JasonRampe2Controls });
