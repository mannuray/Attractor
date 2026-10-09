import type { SystemMeta } from "../registry";
import { DEFAULT_TINKERBELL } from "./config";
import type { TinkerbellParams } from "./types";

export const tinkerbellMeta: SystemMeta = {
  id: "tinkerbell",
  label: "Tinkerbell",
  category: "Attractors",
  defaultParams: DEFAULT_TINKERBELL as TinkerbellParams,
  paramRanges: {
    alpha: { min: 0.7, max: 1.1 },
    beta: { min: -0.8, max: -0.4 },
    gamma: { min: 1.8, max: 2.2 },
    delta: { min: 0.3, max: 0.7 },
  },
  workerIteratorName: "tinkerbell_iterator",
  math: `
const x = p[0], y = p[1];
p[0] = x * x - y * y + params.alpha * x + params.beta * y;
p[1] = 2 * x * y + params.gamma * x + params.delta * y;
`
};
