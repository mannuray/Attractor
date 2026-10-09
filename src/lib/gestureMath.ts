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

export interface RectLike { left: number; top: number; width: number; height: number }

/**
 * Convert client coordinates to canvas pixels. Start points outside the canvas return null;
 * with `clamp`, points past the edge are clamped (so a drag overshooting the edge keeps tracking).
 */
export function clientToCanvas(rect: RectLike, zoom: number, size: number, clientX: number, clientY: number, clamp: boolean): Pt | null {
  const x = (clientX - rect.left) / zoom;
  const y = (clientY - rect.top) / zoom;
  if (clamp) return { x: Math.min(size, Math.max(0, x)), y: Math.min(size, Math.max(0, y)) };
  if (x < 0 || y < 0 || x > size || y > size) return null;
  return { x, y };
}
