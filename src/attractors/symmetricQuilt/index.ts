import { registry } from "../registry";
import { SymmetricQuiltControls } from "./Controls";
import { SymmetricQuiltParams } from "./types";
import { DEFAULT_SYMMETRIC_QUILT } from "./config";

export * from "./types";
export * from "./config";
export { SymmetricQuiltControls };

registry.register({
  id: "symmetric_quilt",
  label: "Symmetric Quilt",
  category: "Attractors",
  defaultParams: DEFAULT_SYMMETRIC_QUILT as SymmetricQuiltParams,
  paramRanges: {
    lambda: { min: -1, max: 1 },
    alpha: { min: -1, max: 1 },
    beta: { min: -1, max: 1 },
    gamma: { min: -1, max: 1 },
    omega: { min: -1, max: 1 },
    m: { min: 1, max: 3, step: 1 },
  },
  Controls: SymmetricQuiltControls,
  workerIteratorName: "symmetric_quilt",
  math: `
let x = p[0] + 0.5, y = p[1] + 0.5;
x = x - Math.floor(x); y = y - Math.floor(y);
const PI2 = Math.PI * 2;
const PI4 = Math.PI * 4;
const PI6 = Math.PI * 6;
const sin2pix = Math.sin(PI2 * x), sin2piy = Math.sin(PI2 * y);
const cos2pix = Math.cos(PI2 * x), cos2piy = Math.cos(PI2 * y);

let nx = params.m * x + params.shift + params.lambda * sin2pix - params.omega * sin2piy + 
         params.alpha * sin2pix * cos2piy + params.beta * Math.sin(PI4 * x) + 
         params.gamma * Math.sin(PI6 * x) * Math.cos(PI4 * y);
         
let ny = params.m * y + params.shift + params.lambda * sin2piy - params.omega * sin2pix + 
         params.alpha * sin2piy * cos2pix + params.beta * Math.sin(PI4 * y) + 
         params.gamma * Math.sin(PI6 * y) * Math.cos(PI4 * x);

nx = nx - Math.floor(nx); ny = ny - Math.floor(ny);
p[0] = nx - 0.5; p[1] = ny - 0.5;
`
});
