import type { SystemMeta } from "../registry";
import { DEFAULT_JULIA } from "./config";
import type { JuliaParams } from "./types";

export const juliaMeta: SystemMeta = {
  id: "julia",
  label: "Julia",
  category: "Fractals",
  defaultParams: DEFAULT_JULIA as JuliaParams,
  workerIteratorName: "julia"
};
