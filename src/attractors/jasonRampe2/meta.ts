import type { SystemMeta } from "../registry";
import { DEFAULT_JASON_RAMPE2 } from "./config";
import type { JasonRampe2Params } from "./types";

export const jasonRampe2Meta: SystemMeta = {
  id: "jason_rampe2",
  label: "Jason Rampe 2",
  category: "Attractors",
  defaultParams: DEFAULT_JASON_RAMPE2 as JasonRampe2Params,
  paramRanges: {
    alpha: { min: -3, max: 3 },
    beta: { min: -3, max: 3 },
    gamma: { min: -1, max: 1 },
    delta: { min: -1, max: 1 },
  },
  workerIteratorName: "jason_rampe2_iterator",
  math: `
const x = p[0], y = p[1];
p[0] = Math.cos(y * params.beta) + params.gamma * Math.cos(x * params.beta);
p[1] = Math.cos(x * params.alpha) + params.delta * Math.cos(y * params.alpha);
`
};
