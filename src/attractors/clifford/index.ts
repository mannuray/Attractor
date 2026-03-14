import { registry } from "../registry";
import { CliffordControls } from "./Controls";
import { CliffordParams } from "./types";

export * from "./types";
export * from "./config";
export { CliffordControls };

registry.register({
  id: "clifford",
  label: "Clifford",
  category: "Attractors",
  defaultParams: { alpha: 1.5, beta: -1.8, gamma: 1.6, delta: 2.0, scale: 0.2 } as CliffordParams,
  Controls: CliffordControls,
  workerIteratorName: "clifford_iterator",
  math: `
    const x = p[0], y = p[1];
    p[0] = Math.sin(params.alpha * y) + params.gamma * Math.cos(params.alpha * x);
    p[1] = Math.sin(params.beta * x) + params.delta * Math.cos(params.beta * y);
  `
});
