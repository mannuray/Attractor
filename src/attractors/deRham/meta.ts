import type { SystemMeta } from "../registry";
import { DEFAULT_DERHAM } from "./config";
import type { DeRhamParams } from "./types";

export const deRhamMeta: SystemMeta = {
  id: "derham",
  label: "De Rham",
  category: "IFS",
  defaultParams: DEFAULT_DERHAM as DeRhamParams,
  workerIteratorName: "derham_iterator",
  math: `
const x = p[0], y = p[1];
const choice = Math.random() < 0.5 ? 0 : 1;

if (params.curveType === "cesaro") {
  if (choice === 0) {
    p[0] = params.alpha * x - params.beta * y; p[1] = params.alpha * y + params.beta * x;
  } else {
    const ra = 1 - params.alpha, rb = -params.beta;
    p[0] = params.alpha + ra * x - rb * y; p[1] = params.beta + ra * y + rb * x;
  }
} else if (params.curveType === "koch") {
  if (choice === 0) {
    p[0] = params.alpha * x + params.beta * y; p[1] = -params.alpha * y + params.beta * x;
  } else {
    const ra = 1 - params.alpha, rb = -params.beta;
    p[0] = params.alpha + ra * x + rb * y; p[1] = params.beta - ra * y + rb * x;
  }
} else {
  if (choice === 0) {
    p[0] = params.alpha * x - params.beta * y; p[1] = params.beta * x + params.alpha * y;
  } else {
    p[0] = params.alpha + (1-params.alpha) * x + params.beta * y; p[1] = params.beta + -params.beta * x + (1-params.alpha) * y;
  }
}
`
};
