import { registry } from "../registry";
import { symmetricQuiltMeta } from "./meta";
import { SymmetricQuiltControls } from "./Controls";

export * from "./types";
export * from "./config";
export { SymmetricQuiltControls };

registry.register({ ...symmetricQuiltMeta, Controls: SymmetricQuiltControls });
