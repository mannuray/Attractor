import { registry } from "../registry";
import { jasonRampe1Meta } from "./meta";
import { JasonRampe1Controls } from "./Controls";

export * from "./types";
export * from "./config";
export { JasonRampe1Controls };

registry.register({ ...jasonRampe1Meta, Controls: JasonRampe1Controls });
