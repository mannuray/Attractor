import { registry } from "../registry";
import { svenssonMeta } from "./meta";
import { SvenssonControls } from "./Controls";

export * from "./types";
export * from "./config";
export { SvenssonControls };

registry.register({ ...svenssonMeta, Controls: SvenssonControls });
