export interface StatsSample {
  iterations: number;
  rate: number;
  elapsedMs: number;
  t: number;
  startT: number | null;
}

export const initialStats: StatsSample = { iterations: 0, rate: 0, elapsedMs: 0, t: 0, startT: null };

export function nextStatsSample(prev: StatsSample, iterations: number, now: number, running: boolean): StatsSample {
  const reset = iterations < prev.iterations;
  if (!running) {
    return { ...prev, iterations, rate: 0, t: now, startT: reset ? null : prev.startT, elapsedMs: reset ? 0 : prev.elapsedMs };
  }
  if (prev.startT === null || reset) {
    return { iterations, rate: 0, elapsedMs: 0, t: now, startT: now };
  }
  const dt = now - prev.t;
  const rate = dt > 0 ? ((iterations - prev.iterations) / dt) * 1000 : prev.rate;
  return { iterations, rate, elapsedMs: now - prev.startT, t: now, startT: prev.startT };
}
