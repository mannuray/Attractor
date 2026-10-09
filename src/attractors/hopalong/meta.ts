import type { SystemMeta } from "../registry";
import { DEFAULT_HOPALONG } from "./config";
import type { HopalongParams } from "./types";

export const hopalongMeta: SystemMeta = {
  id: "hopalong",
  label: "Hopalong",
  category: "Attractors",
  defaultParams: DEFAULT_HOPALONG as HopalongParams,
  paramRanges: {
    alpha: { min: -10, max: 10 },
    beta: { min: -10, max: 10 },
    gamma: { min: -10, max: 10 },
  },
  workerIteratorName: "hopalong_iterator",
  math: `
const x = p[0], y = p[1];
const sign = x >= 0 ? 1 : -1;
p[0] = y - sign * Math.sqrt(Math.abs(params.beta * x - params.gamma));
p[1] = params.alpha - x;
`
};
