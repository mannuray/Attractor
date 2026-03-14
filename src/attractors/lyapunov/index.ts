import { registry } from "../registry";
import { LyapunovControls } from "./Controls";
import { DEFAULT_LYAPUNOV } from "./config";
import { LyapunovParams } from "./types";

export * from "./types";
export * from "./config";
export { LyapunovControls };

registry.register({
  id: "lyapunov",
  label: "Lyapunov",
  category: "Fractals",
  defaultParams: DEFAULT_LYAPUNOV as LyapunovParams,
  Controls: LyapunovControls,
  workerIteratorName: "lyapunov"
});
