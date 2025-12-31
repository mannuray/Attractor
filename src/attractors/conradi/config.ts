import { ConradiParams } from "./types";

export const DEFAULT_CONRADI: ConradiParams = {
  r1: 0.5,
  theta1: 0.3,
  r2: 0.5,
  theta2: 0.7,
  a: 0.1,
  n: 5,
  variant: 1,
  scale: 0.25,
};

export const conradiPresets: { name: string; params: ConradiParams }[] = [
  { name: "Flower 1", params: { r1: 0.5, theta1: 0.3, r2: 0.5, theta2: 0.7, a: 0.1, n: 5, variant: 1, scale: 0.25 } },
  { name: "Flower 2", params: { r1: 0.6, theta1: 0.5, r2: 0.4, theta2: 0.3, a: 0.2, n: 6, variant: 2, scale: 0.22 } },
  { name: "Star", params: { r1: 0.4, theta1: 0.2, r2: 0.6, theta2: 0.8, a: 0.0, n: 7, variant: 1, scale: 0.28 } },
  { name: "Spiral", params: { r1: 0.55, theta1: 0.4, r2: 0.45, theta2: 0.6, a: 0.15, n: 8, variant: 2, scale: 0.2 } },
  { name: "Pentagon Web", params: { r1: 0.5, theta1: 0.25, r2: 0.5, theta2: 0.75, a: 0.05, n: 5, variant: 1, scale: 0.3 } },
];
