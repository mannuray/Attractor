// Classifies what a system's iteration does from a typical start point: a real attractor
// keeps visiting new places; a broken one blows up (NaN/∞) or collapses onto a few points.
export type OrbitKind = "attractor" | "diverges" | "collapses";

export interface OrbitHealth {
  kind: OrbitKind;
  /** Distinct cells visited on a 256×256 grid over the orbit's own bounding box. */
  distinct: number;
}

/** Deterministic PRNG, so IFS systems (which pick random maps) classify the same every run. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function orbitHealth(math: string, params: Record<string, any>, steps = 200000): OrbitHealth {
  const seeded = Object.create(Math) as Math;
  seeded.random = mulberry32(12345);
  // eslint-disable-next-line no-new-func -- runs the system's own math string, exactly as worker.js does
  const fn = new Function("p", "params", "Math", math) as (p: Float64Array, params: object, m: Math) => void;
  const p = new Float64Array([0.05, 0.07]);
  const warmup = 1000;
  const xs = new Float64Array(steps), ys = new Float64Array(steps);
  for (let i = 0; i < warmup + steps; i++) {
    fn(p, params, seeded);
    if (!Number.isFinite(p[0]) || !Number.isFinite(p[1]) || Math.abs(p[0]) > 1e6 || Math.abs(p[1]) > 1e6) {
      return { kind: "diverges", distinct: 0 };
    }
    if (i >= warmup) { xs[i - warmup] = p[0]; ys[i - warmup] = p[1]; }
  }
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < steps; i++) {
    if (xs[i] < minX) minX = xs[i]; if (xs[i] > maxX) maxX = xs[i];
    if (ys[i] < minY) minY = ys[i]; if (ys[i] > maxY) maxY = ys[i];
  }
  const w = maxX - minX || 1e-12, h = maxY - minY || 1e-12;
  const cells = new Set<number>();
  for (let i = 0; i < steps; i++) {
    cells.add(Math.min(255, Math.floor(((xs[i] - minX) / w) * 256)) * 256 + Math.min(255, Math.floor(((ys[i] - minY) / h) * 256)));
  }
  return { kind: cells.size < 200 ? "collapses" : "attractor", distinct: cells.size };
}
