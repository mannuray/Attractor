import type { SystemMeta } from "../registry";
import { DEFAULT_LYAPUNOV } from "./config";
import type { LyapunovParams } from "./types";

export const lyapunovMeta: SystemMeta = {
  id: "lyapunov",
  label: "Lyapunov",
  category: "Fractals",
  defaultParams: DEFAULT_LYAPUNOV as LyapunovParams,
  workerIteratorName: "lyapunov"
};
