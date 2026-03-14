import { registry } from "../registry";
import { DeJongControls } from "./Controls";
import { DeJongParams } from "./types";
import { DEFAULT_DEJONG } from "./config";

export * from "./types";
export * from "./config";
export { DeJongControls };

registry.register({
  id: "dejong",
  label: "De Jong",
  category: "Attractors",
  defaultParams: DEFAULT_DEJONG as DeJongParams,
  paramRanges: {
    alpha: { min: -3, max: 3 },
    beta: { min: -3, max: 3 },
    gamma: { min: -3, max: 3 },
    delta: { min: -3, max: 3 },
  },
  Controls: DeJongControls,
  workerIteratorName: "dejong_iterator",
  math: `
const x = p[0], y = p[1];
p[0] = Math.sin(params.alpha * y) - Math.cos(params.beta * x);
p[1] = Math.sin(params.gamma * x) - Math.cos(params.delta * y);
`
});
