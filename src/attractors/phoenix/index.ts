import { registry } from "../registry";
import { PhoenixControls } from "./Controls";
import { DEFAULT_PHOENIX } from "./config";
import { PhoenixParams } from "./types";

export * from "./types";
export * from "./config";
export { PhoenixControls };

registry.register({
  id: "phoenix",
  label: "Phoenix",
  category: "Fractals",
  defaultParams: DEFAULT_PHOENIX as PhoenixParams,
  Controls: PhoenixControls,
  workerIteratorName: "phoenix"
});
