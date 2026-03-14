import { registry } from "../registry";
import { MultibrotControls } from "./Controls";
import { DEFAULT_MULTIBROT } from "./config";
import { MultibrotParams } from "./types";

export * from "./types";
export * from "./config";
export { MultibrotControls };

registry.register({
  id: "multibrot",
  label: "Multibrot",
  category: "Fractals",
  defaultParams: DEFAULT_MULTIBROT as MultibrotParams,
  Controls: MultibrotControls,
  workerIteratorName: "multibrot"
});
