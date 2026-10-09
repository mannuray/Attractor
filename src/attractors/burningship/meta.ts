import type { SystemMeta } from "../registry";
import { DEFAULT_BURNING_SHIP } from "./config";
import type { BurningShipParams } from "./types";

export const burningshipMeta: SystemMeta = {
  id: "burningship",
  label: "Burning Ship",
  category: "Fractals",
  defaultParams: DEFAULT_BURNING_SHIP as BurningShipParams,
  workerIteratorName: "burningship"
};
