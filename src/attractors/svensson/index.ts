import { registry } from "../registry";
import { SvenssonControls } from "./Controls";
import { SvenssonParams } from "./types";
import { DEFAULT_SVENSSON } from "./config";

export * from "./types";
export * from "./config";
export { SvenssonControls };

registry.register({
  id: "svensson",
  label: "Svensson",
  category: "Attractors",
  defaultParams: DEFAULT_SVENSSON as SvenssonParams,
  Controls: SvenssonControls,
  workerIteratorName: "svensson_iterator",
  math: `
const x = p[0], y = p[1];
p[0] = params.delta * Math.sin(params.alpha * x) - Math.sin(params.beta * y);
p[1] = params.gamma * Math.cos(params.alpha * x) + Math.cos(params.beta * y);
`
});
