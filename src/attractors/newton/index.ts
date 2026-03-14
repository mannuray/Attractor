import { registry } from "../registry";
import { NewtonControls } from "./Controls";
import { DEFAULT_NEWTON } from "./config";
import { NewtonParams } from "./types";

export * from "./types";
export * from "./config";
export { NewtonControls };

registry.register({
  id: "newton",
  label: "Newton",
  category: "Fractals",
  defaultParams: DEFAULT_NEWTON as NewtonParams,
  Controls: NewtonControls,
  workerIteratorName: "newton"
});
