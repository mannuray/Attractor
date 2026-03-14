import { registry } from "../registry";
import { TricornControls } from "./Controls";
import { TricornParams } from "./types";
import { DEFAULT_TRICORN } from "./config";

export * from "./types";
export * from "./config";
export { TricornControls };

registry.register({
  id: "tricorn",
  label: "Tricorn",
  category: "Fractals",
  defaultParams: DEFAULT_TRICORN as TricornParams,
  Controls: TricornControls,
  workerIteratorName: "tricorn"
});
