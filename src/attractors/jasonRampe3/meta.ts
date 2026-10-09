import type { SystemMeta } from "../registry";
import { DEFAULT_JASON_RAMPE3 } from "./config";
import type { JasonRampe3Params } from "./types";

export const jasonRampe3Meta: SystemMeta = {
  id: "jason_rampe3",
  label: "Jason Rampe 3",
  category: "Attractors",
  defaultParams: DEFAULT_JASON_RAMPE3 as JasonRampe3Params,
  paramRanges: {
    alpha: { min: -3, max: 3 },
    beta: { min: -3, max: 3 },
    gamma: { min: -1, max: 1 },
    delta: { min: -1, max: 1 },
  },
  workerIteratorName: "jason_rampe3_iterator",
  math: `
const x = p[0], y = p[1];
p[0] = Math.sin(y * params.beta) + params.gamma * Math.cos(x * params.beta);
p[1] = Math.cos(x * params.alpha) + params.delta * Math.sin(y * params.alpha);
`
};
