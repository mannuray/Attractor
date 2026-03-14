import { registry } from "../registry";
import { JasonRampe3Controls } from "./Controls";
import { DEFAULT_JASON_RAMPE3 } from "./config";
import { JasonRampe3Params } from "./types";

export * from "./types";
export * from "./config";
export { JasonRampe3Controls };

registry.register({
  id: "jason_rampe3",
  label: "Jason Rampe 3",
  category: "Attractors",
  defaultParams: DEFAULT_JASON_RAMPE3 as JasonRampe3Params,
  Controls: JasonRampe3Controls,
  workerIteratorName: "jason_rampe3_iterator",
  math: `
const x = p[0], y = p[1];
p[0] = Math.sin(y * params.beta) + params.gamma * Math.cos(x * params.beta);
p[1] = Math.cos(x * params.alpha) + params.delta * Math.sin(y * params.alpha);
`
});
