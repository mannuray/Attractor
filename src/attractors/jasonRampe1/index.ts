import { registry } from "../registry";
import { JasonRampe1Controls } from "./Controls";
import { DEFAULT_JASON_RAMPE1 } from "./config";
import { JasonRampe1Params } from "./types";

export * from "./types";
export * from "./config";
export { JasonRampe1Controls };

registry.register({
  id: "jason_rampe1",
  label: "Jason Rampe 1",
  category: "Attractors",
  defaultParams: DEFAULT_JASON_RAMPE1 as JasonRampe1Params,
  paramRanges: {
    alpha: { min: -3, max: 3 },
    beta: { min: -3, max: 3 },
    gamma: { min: -1, max: 1 },
    delta: { min: -1, max: 1 },
  },
  Controls: JasonRampe1Controls,
  workerIteratorName: "jason_rampe1_iterator",
  math: `
const x = p[0], y = p[1];
p[0] = Math.cos(y * params.beta) + params.gamma * Math.sin(x * params.beta);
p[1] = Math.cos(x * params.alpha) + params.delta * Math.sin(y * params.alpha);
`
});
