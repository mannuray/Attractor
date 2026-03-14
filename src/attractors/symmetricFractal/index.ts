import { registry } from "../registry";
import { SymmetricFractalControls } from "./Controls";
import { SymmetricFractalParams } from "./types";
import { DEFAULT_SYMMETRIC_FRACTAL } from "./config";

export * from "./types";
export * from "./config";
export { SymmetricFractalControls };

registry.register({
  id: "symmetric_fractal",
  label: "Symmetric Fractal",
  category: "IFS",
  defaultParams: DEFAULT_SYMMETRIC_FRACTAL as SymmetricFractalParams,
  Controls: SymmetricFractalControls,
  workerIteratorName: "symmetric_fractal_iterator",
  math: `
const x = p[0], y = p[1];
let nx = params.a * x + params.b * y + params.alpha;
let ny = params.c * x + params.d * y + params.beta;
const angle = (2 * Math.PI * Math.floor(Math.random() * params.p)) / params.p;
const cos = Math.cos(angle), sin = Math.sin(angle);
let rx = nx * cos - ny * sin;
let ry = nx * sin + ny * cos;
if (params.reflect && Math.random() < 0.5) rx = -rx;
p[0] = rx; p[1] = ry;
`
});
