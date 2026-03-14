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
  paramRanges: {
    a1: { min: -1.2, max: 1.2 },
    a2: { min: -1.2, max: 1.2 },
    a3: { min: -1.2, max: 1.2 },
    a4: { min: -1.2, max: 1.2 },
    a5: { min: -1.2, max: 1.2 },
    a6: { min: -1.2, max: 1.2 },
    a7: { min: -1.2, max: 1.2 },
    a8: { min: -1.2, max: 1.2 },
    a9: { min: -1.2, max: 1.2 },
    a10: { min: -1.2, max: 1.2 },
    a11: { min: -1.2, max: 1.2 },
    a12: { min: -1.2, max: 1.2 },
  },
  Controls: SprottControls,
  workerIteratorName: "sprott_iterator",
  math: `
const x = p[0], y = p[1];
p[0] = params.a1 + params.a2*x + params.a3*x*x + params.a4*x*y + params.a5*y + params.a6*y*y;
p[1] = params.a7 + params.a8*x + params.a9*x*x + params.a10*x*y + params.a11*y + params.a12*y*y;
`
});
