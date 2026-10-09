import type { SystemMeta } from "../registry";
import { DEFAULT_MULTIBROT } from "./config";
import type { MultibrotParams } from "./types";

export const multibrotMeta: SystemMeta = {
  id: "multibrot",
  label: "Multibrot",
  category: "Fractals",
  defaultParams: DEFAULT_MULTIBROT as MultibrotParams,
  workerIteratorName: "multibrot"
};
