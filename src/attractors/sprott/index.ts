import { registry } from "../registry";
import { SprottControls } from "./Controls";
import { SprottParams } from "./types";
import { DEFAULT_SPROTT } from "./config";

export * from "./types";
export * from "./config";
export { SprottControls };

registry.register({
  id: "sprott",
  label: "Sprott",
  category: "Attractors",
  defaultParams: DEFAULT_SPROTT as SprottParams,
  Controls: SprottControls,
  workerIteratorName: "sprott_iterator",
  math: `
const x = p[0], y = p[1];
p[0] = params.a1 + params.a2*x + params.a3*x*x + params.a4*x*y + params.a5*y + params.a6*y*y;
p[1] = params.a7 + params.a8*x + params.a9*x*x + params.a10*x*y + params.a11*y + params.a12*y*y;
`
});
