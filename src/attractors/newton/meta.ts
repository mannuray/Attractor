import type { SystemMeta } from "../registry";
import { DEFAULT_NEWTON } from "./config";
import type { NewtonParams } from "./types";

export const newtonMeta: SystemMeta = {
  id: "newton",
  label: "Newton",
  category: "Fractals",
  defaultParams: DEFAULT_NEWTON as NewtonParams,
  workerIteratorName: "newton"
};
