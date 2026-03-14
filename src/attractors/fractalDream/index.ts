import { registry } from "../registry";
import { FractalDreamControls } from "./Controls";
import { FractalDreamParams } from "./types";
import { DEFAULT_FRACTAL_DREAM } from "./config";

export * from "./types";
export * from "./config";
export { FractalDreamControls };

registry.register({
  id: "fractal_dream",
  label: "Fractal Dream",
  category: "Attractors",
  defaultParams: DEFAULT_FRACTAL_DREAM as FractalDreamParams,
  paramRanges: {
    alpha: { min: -3, max: 3 },
    beta: { min: -3, max: 3 },
    gamma: { min: -1, max: 1 },
    delta: { min: -1, max: 1 },
  },
  Controls: FractalDreamControls,
  workerIteratorName: "fractal_dream_iterator",
  math: `
const x = p[0], y = p[1];
p[0] = Math.sin(y * params.beta) + params.gamma * Math.sin(x * params.beta);
p[1] = Math.sin(x * params.alpha) + params.delta * Math.sin(y * params.alpha);
`
});
