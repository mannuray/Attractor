import type { SystemMeta } from "../registry";
import { DEFAULT_BEDHEAD } from "./config";
import type { BedheadParams } from "./types";

export const bedheadMeta: SystemMeta = {
  id: "bedhead",
  label: "Bedhead",
  category: "Attractors",
  defaultParams: DEFAULT_BEDHEAD as BedheadParams,
  paramRanges: {
    alpha: { min: -2, max: 2 },
    beta: { min: -2, max: 2 },
  },
  workerIteratorName: "bedhead_iterator",
  math: `
const x = p[0], y = p[1];
p[0] = Math.sin((x * y) / params.beta) * y + Math.cos(params.alpha * x - y);
p[1] = x + Math.sin(y) / params.beta;
`
};
