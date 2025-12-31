import { DeRhamParams } from "./types";

export const DEFAULT_DERHAM: DeRhamParams = {
  alpha: 0.5,
  beta: 0.5,
  curveType: "cesaro",
  scale: 0.4,
};

export const deRhamPresets: { name: string; params: DeRhamParams }[] = [
  { name: "Levy C Curve", params: { alpha: 0.5, beta: 0.5, curveType: "cesaro", scale: 0.35 } },
  { name: "Koch Curve", params: { alpha: 0.333, beta: 0.1925, curveType: "koch", scale: 0.4 } },
  { name: "Osgood Curve", params: { alpha: 0.4, beta: 0.3, curveType: "koch", scale: 0.38 } },
  { name: "Dragon Curve", params: { alpha: 0.5, beta: 0.5, curveType: "general", scale: 0.32 } },
  { name: "Cesaro Square", params: { alpha: 0.5, beta: 0.0, curveType: "cesaro", scale: 0.4 } },
  { name: "Peano Variant", params: { alpha: 0.333, beta: 0.333, curveType: "koch", scale: 0.35 } },
];
