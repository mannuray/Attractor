import type { SystemMeta } from "../registry";
import { DEFAULT_TRICORN } from "./config";
import type { TricornParams } from "./types";

export const tricornMeta: SystemMeta = {
  id: "tricorn",
  label: "Tricorn",
  category: "Fractals",
  defaultParams: DEFAULT_TRICORN as TricornParams,
  workerIteratorName: "tricorn"
};
