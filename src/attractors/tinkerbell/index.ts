import { registry } from "../registry";
import { TinkerbellControls } from "./Controls";
import { TinkerbellParams } from "./types";
import { DEFAULT_TINKERBELL } from "./config";

export * from "./types";
export * from "./config";
export { TinkerbellControls };

registry.register({
  id: "tinkerbell",
  label: "Tinkerbell",
  category: "Attractors",
  defaultParams: DEFAULT_TINKERBELL as TinkerbellParams,
  Controls: TinkerbellControls,
  workerIteratorName: "tinkerbell_iterator",
  math: `
const x = p[0], y = p[1];
p[0] = x * x - y * y + params.alpha * x + params.beta * y;
p[1] = 2 * x * y + params.gamma * x + params.delta * y;
`
});
