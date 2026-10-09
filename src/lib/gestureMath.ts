export interface Pt { x: number; y: number }

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 4;

export const distance = (a: Pt, b: Pt) => Math.hypot(b.x - a.x, b.y - a.y);
export const midpoint = (a: Pt, b: Pt): Pt => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

export function clampZoom(z: number): number {
  if (!Number.isFinite(z)) return 1;
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));
}

export function pinchZoom(startZoom: number, startDist: number, dist: number): number {
  if (startDist <= 0 || !Number.isFinite(dist)) return clampZoom(startZoom);
  return clampZoom(startZoom * (dist / startDist));
}
