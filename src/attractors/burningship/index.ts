import { registry } from "../registry";
import { BurningShipControls } from "./Controls";
import { BurningShipParams } from "./types";
import { DEFAULT_BURNING_SHIP } from "./config";

export * from "./types";
export * from "./config";
export { BurningShipControls };

registry.register({
  id: "burningship",
  label: "Burning Ship",
  category: "Fractals",
  defaultParams: DEFAULT_BURNING_SHIP as BurningShipParams,
  Controls: BurningShipControls,
  workerIteratorName: "burningship"
});
