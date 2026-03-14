import { registry } from "../registry";
import { JuliaControls } from "./Controls";
import { DEFAULT_JULIA } from "./config";
import { JuliaParams } from "./types";

export * from "./types";
export * from "./config";
export { JuliaControls };

registry.register({
  id: "julia",
  label: "Julia",
  category: "Fractals",
  defaultParams: DEFAULT_JULIA as JuliaParams,
  Controls: JuliaControls,
  workerIteratorName: "julia"
});
