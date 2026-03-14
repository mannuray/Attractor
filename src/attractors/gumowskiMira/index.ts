import { registry } from "../registry";
import { GumowskiMiraControls } from "./Controls";
import { GumowskiMiraParams } from "./types";
import { DEFAULT_GUMOWSKI_MIRA } from "./config";

export * from "./types";
export * from "./config";
export { GumowskiMiraControls };

registry.register({
  id: "gumowski_mira",
  label: "Gumowski-Mira",
  category: "Attractors",
  defaultParams: DEFAULT_GUMOWSKI_MIRA as GumowskiMiraParams,
  Controls: GumowskiMiraControls,
  workerIteratorName: "gumowski_mira_iterator",
  math: `
const f = (x) => params.mu * x + (2 * (1 - params.mu) * x * x) / (1 + x * x);
const x = p[0], y = p[1];
const fx = f(x);
const nx = y + params.alpha * (1 - params.sigma * y * y) * y + fx;
p[0] = nx;
p[1] = -x + f(nx);
`
});
