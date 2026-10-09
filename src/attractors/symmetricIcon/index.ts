import { registry } from "../registry";
import { symmetricIconMeta } from "./meta";
import { SymmetricIconControls } from "./Controls";

export * from "./types";
export * from "./config";
export { SymmetricIconControls };

registry.register({ ...symmetricIconMeta, Controls: SymmetricIconControls });
