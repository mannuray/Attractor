import { registry } from "../registry";
import { HenonControls } from "./Controls";
import { HenonParams } from "./types";
import { DEFAULT_HENON } from "./config";

export * from "./types";
export * from "./config";
export { HenonControls };

registry.register({
  id: "henon",
  label: "Henon",
  category: "Attractors",
  defaultParams: DEFAULT_HENON as HenonParams,
  paramRanges: {
    alpha: { min: 1.0, max: 1.4 },
    beta: { min: 0.2, max: 0.4 },
  },
  Controls: HenonControls,
  workerIteratorName: "henon_iterator",
  math: `
const x = p[0], y = p[1];
p[0] = 1 - params.alpha * x * x + y;
p[1] = params.beta * x;
`
});
