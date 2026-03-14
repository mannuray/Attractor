import { registry } from "../registry";
import { HopalongControls } from "./Controls";
import { DEFAULT_HOPALONG } from "./config";
import { HopalongParams } from "./types";

export * from "./types";
export * from "./config";
export { HopalongControls };

registry.register({
  id: "hopalong",
  label: "Hopalong",
  category: "Attractors",
  defaultParams: DEFAULT_HOPALONG as HopalongParams,
  Controls: HopalongControls,
  workerIteratorName: "hopalong_iterator",
  math: `
const x = p[0], y = p[1];
const sign = x >= 0 ? 1 : -1;
p[0] = y - sign * Math.sqrt(Math.abs(params.beta * x - params.gamma));
p[1] = params.alpha - x;
`
});
