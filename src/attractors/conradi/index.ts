import { registry } from "../registry";
import { ConradiControls } from "./Controls";
import { ConradiParams } from "./types";
import { DEFAULT_CONRADI } from "./config";

export * from "./types";
export * from "./config";
export { ConradiControls };

registry.register({
  id: "conradi",
  label: "Conradi",
  category: "Attractors",
  defaultParams: DEFAULT_CONRADI as ConradiParams,
  Controls: ConradiControls,
  workerIteratorName: "conradi_iterator",
  math: `
const x = p[0], y = p[1];
let zr, zi;
const c1r = params.r1 * Math.cos(params.theta1 * Math.PI);
const c1i = params.r1 * Math.sin(params.theta1 * Math.PI);
const c2r = params.r2 * Math.cos(params.theta2 * Math.PI);
const c2i = params.r2 * Math.sin(params.theta2 * Math.PI);

if (params.variant === 1) {
  const denom = x*x + y*y + 0.0001;
  const invr = x / denom, invi = -y / denom;
  zr = (c1r * invr - c1i * invi) + (c2r * x + c2i * y) + params.a;
  zi = (c1r * invi + c1i * invr) + (c2r * y - c2i * x);
} else {
  const denom = x*x + y*y + 0.0001;
  const dr = (c1r * x - c1i * y) + (c2r * x + c2i * y) / denom + params.a;
  const di = (c1r * y + c1i * x) + (c2r * y - c2i * x) / denom;
  const d2 = dr*dr + di*di + 0.0001;
  zr = dr / d2; zi = -di / d2;
}
const angle = (2 * Math.PI * Math.floor(Math.random() * params.n)) / params.n;
const cos = Math.cos(angle), sin = Math.sin(angle);
p[0] = zr * cos - zi * sin; p[1] = zr * sin + zi * cos;
`
});
