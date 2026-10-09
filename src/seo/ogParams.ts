// Reads a shared studio link's query the same way the studio does (see useUrlSync), with
// the guard rails a public endpoint needs: values clamped to each system's ranges and
// fractal iteration counts capped.
import type { SystemMeta } from "../attractors/registry";
import { getSystemMeta } from "../attractors/catalog";

export const MAX_FRACTAL_ITER = 2000;
/** Lyapunov does a log per iteration per pixel: it gets a lower cap. */
export const MAX_LYAPUNOV_ITER = 500;
const LYAPUNOV_SEQUENCE = /^[AB]{1,32}$/;

// Fractal systems declare no paramRanges; these keep a public endpoint's work and
// floating-point precision bounded (deeper than 1e13 is numerically meaningless).
const FRACTAL_RANGES: Record<string, { min: number; max: number }> = {
  centerX: { min: -4, max: 4 }, centerY: { min: -4, max: 4 },
  zoom: { min: 0.01, max: 1e13 },
  cReal: { min: -4, max: 4 }, cImag: { min: -4, max: 4 }, p: { min: -4, max: 4 },
  power: { min: 2, max: 12 },
  aMin: { min: 0, max: 4.5 }, aMax: { min: 0, max: 4.5 }, bMin: { min: 0, max: 4.5 }, bMax: { min: 0, max: 4.5 },
};

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
      const range = meta.paramRanges?.[key] ?? (meta.category === "Fractals" ? FRACTAL_RANGES[key] : undefined);
      params[key] = range ? Math.min(range.max, Math.max(range.min, num)) : num;
    } else if (key === "sequence") {
      if (LYAPUNOV_SEQUENCE.test(raw)) params[key] = raw;
    } else if (typeof params[key] === "string") {
      params[key] = raw;
    }
  }

  if (meta.category === "Fractals" && typeof params.maxIter === "number") {
    const cap = meta.id === "lyapunov" ? MAX_LYAPUNOV_ITER : MAX_FRACTAL_ITER;
    params.maxIter = Math.max(1, Math.min(cap, Math.round(params.maxIter)));
  }
  return { meta, params };
}

/** The one query string for a render: type first, then every parameter in catalog order. */
export function shareQuery({ meta, params }: ShareParams): string {
  const q = new URLSearchParams({ type: meta.id });
  for (const [key, value] of Object.entries(params)) q.set(key, String(value));
  return q.toString();
}
