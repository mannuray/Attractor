import type { SystemMeta } from "../registry";
import { DEFAULT_PHOENIX } from "./config";
import type { PhoenixParams } from "./types";

export const phoenixMeta: SystemMeta = {
  id: "phoenix",
  label: "Phoenix",
  category: "Fractals",
  defaultParams: DEFAULT_PHOENIX as PhoenixParams,
  workerIteratorName: "phoenix"
};
