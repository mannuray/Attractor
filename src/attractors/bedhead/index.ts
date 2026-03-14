import { registry } from "../registry";
import { BedheadControls } from "./Controls";
import { BedheadParams } from "./types";
import { DEFAULT_BEDHEAD } from "./config";

export * from "./types";
export * from "./config";
export { BedheadControls };

registry.register({
  id: "bedhead",
  label: "Bedhead",
  category: "Attractors",
  defaultParams: DEFAULT_BEDHEAD as BedheadParams,
  Controls: BedheadControls,
  workerIteratorName: "bedhead_iterator",
  math: `
const x = p[0], y = p[1];
p[0] = Math.sin((x * y) / params.beta) * y + Math.cos(params.alpha * x - y);
p[1] = x + Math.sin(y) / params.beta;
`
});
