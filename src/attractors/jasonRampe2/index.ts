import { registry } from "../registry";
import { JasonRampe2Controls } from "./Controls";
import { DEFAULT_JASON_RAMPE2 } from "./config";
import { JasonRampe2Params } from "./types";

export * from "./types";
export * from "./config";
export { JasonRampe2Controls };

registry.register({
  id: "jason_rampe2",
  label: "Jason Rampe 2",
  category: "Attractors",
  defaultParams: DEFAULT_JASON_RAMPE2 as JasonRampe2Params,
  Controls: JasonRampe2Controls,
  workerIteratorName: "jason_rampe2_iterator",
  math: `
const x = p[0], y = p[1];
p[0] = Math.cos(y * params.beta) + params.gamma * Math.cos(x * params.beta);
p[1] = Math.cos(x * params.alpha) + params.delta * Math.cos(y * params.alpha);
`
});
