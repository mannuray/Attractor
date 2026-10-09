import { registry } from "../registry";
import { symmetricFractalMeta } from "./meta";
import { SymmetricFractalControls } from "./Controls";

export * from "./types";
export * from "./config";
export { SymmetricFractalControls };

registry.register({ ...symmetricFractalMeta, Controls: SymmetricFractalControls });
