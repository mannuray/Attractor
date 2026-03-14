import { AttractorType } from "../attractors/shared/types";
import { registry } from "../attractors/registry";

export function buildIteratorPayload(
  type: AttractorType,
  params: Record<string, any>
): { name: string; parameters: Record<string, any>; math?: string; sequence?: string } {
  const module = registry.get(type);
  if (!module) {
    throw new Error(`Unknown attractor type: ${type}`);
  }

  // Collect parameters for this module
  const parameters: Record<string, any> = { ...params };

  const result: { name: string; parameters: Record<string, any>; math?: string; sequence?: string } = {
    name: module.workerIteratorName || type,
    parameters,
    math: module.math
  };

  // Special case for Lyapunov sequence
  if (type === "lyapunov" && params.sequence) {
    result.sequence = params.sequence;
  }

  return result;
}

export function getScale(type: AttractorType, params: Record<string, any>): number {
  const module = registry.get(type);
  const hasScale = module && module.category !== "Fractals";
  return hasScale ? (params.scale ?? 1.0) : 1;
}
