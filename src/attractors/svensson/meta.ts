import type { SystemMeta } from "../registry";
import { DEFAULT_SVENSSON } from "./config";
import type { SvenssonParams } from "./types";

export const svenssonMeta: SystemMeta = {
  id: "svensson",
  label: "Svensson",
  category: "Attractors",
  defaultParams: DEFAULT_SVENSSON as SvenssonParams,
  paramRanges: {
    alpha: { min: -2.5, max: 2.5 },
    beta: { min: -2.5, max: 2.5 },
    gamma: { min: -2.5, max: 2.5 },
    delta: { min: -2.5, max: 2.5 },
  },
  workerIteratorName: "svensson_iterator",
  math: `
const x = p[0], y = p[1];
p[0] = params.delta * Math.sin(params.alpha * x) - Math.sin(params.beta * y);
p[1] = params.gamma * Math.cos(params.alpha * x) + Math.cos(params.beta * y);
`
};
