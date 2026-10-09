import { registry } from "../registry";
import { juliaMeta } from "./meta";
import { JuliaControls } from "./Controls";

export * from "./types";
export * from "./config";
export { JuliaControls };

registry.register({ ...juliaMeta, Controls: JuliaControls });
