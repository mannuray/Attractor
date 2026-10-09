import { registry } from "../registry";
import { gumowskiMiraMeta } from "./meta";
import { GumowskiMiraControls } from "./Controls";

export * from "./types";
export * from "./config";
export { GumowskiMiraControls };

registry.register({ ...gumowskiMiraMeta, Controls: GumowskiMiraControls });
