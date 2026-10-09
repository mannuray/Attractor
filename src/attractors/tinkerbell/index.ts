import { registry } from "../registry";
import { tinkerbellMeta } from "./meta";
import { TinkerbellControls } from "./Controls";

export * from "./types";
export * from "./config";
export { TinkerbellControls };

registry.register({ ...tinkerbellMeta, Controls: TinkerbellControls });
