// Reads a shared studio link's query the same way the studio does (see useUrlSync), with
// the guard rails a public endpoint needs: values clamped to each system's ranges and
// fractal iteration counts capped.
import type { SystemMeta } from "../attractors/registry";
import { getSystemMeta } from "../attractors/catalog";

export const MAX_FRACTAL_ITER = 2000;
const LYAPUNOV_SEQUENCE = /^[AB]{1,32}$/;

export interface ShareParams {
  meta: SystemMeta;
  params: Record<string, number | string>;
}

export function parseShareParams(search: URLSearchParams): ShareParams | null {
  const type = search.get("type");
  const meta = type ? getSystemMeta(type) : undefined;
  if (!meta) return null;

  const params: Record<string, number | string> = { ...meta.defaultParams };
  for (const key of Object.keys(params)) {
    const raw = search.get(key);
    if (raw === null) continue;
    if (typeof params[key] === "number") {
      const num = parseFloat(raw);
      if (!Number.isFinite(num)) continue;
      const range = meta.paramRanges?.[key];
      params[key] = range ? Math.min(range.max, Math.max(range.min, num)) : num;
    } else if (key === "sequence") {
      if (LYAPUNOV_SEQUENCE.test(raw)) params[key] = raw;
    } else if (typeof params[key] === "string") {
      params[key] = raw;
    }
  }

  if (meta.category === "Fractals" && typeof params.maxIter === "number") {
    params.maxIter = Math.max(1, Math.min(MAX_FRACTAL_ITER, Math.round(params.maxIter)));
  }
  return { meta, params };
}
