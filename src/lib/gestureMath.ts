export interface Pt { x: number; y: number }

export const distance = (a: Pt, b: Pt) => Math.hypot(b.x - a.x, b.y - a.y);
export const midpoint = (a: Pt, b: Pt): Pt => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

export interface RectLike { left: number; top: number; width: number; height: number }

/**
 * Convert client coordinates to canvas pixels, given the canvas's on-screen rect and scale.
 * Start points outside the canvas return null; with `clamp`, points past the edge are
 * clamped (so a drag overshooting the edge keeps tracking).
 */
export function clientToCanvas(rect: RectLike, scale: number, size: number, clientX: number, clientY: number, clamp: boolean): Pt | null {
  const x = (clientX - rect.left) / scale;
  const y = (clientY - rect.top) / scale;
  if (clamp) return { x: Math.min(size, Math.max(0, x)), y: Math.min(size, Math.max(0, y)) };
  if (x < 0 || y < 0 || x > size || y > size) return null;
  return { x, y };
}

/**
 * Zoom factor for one wheel event. Trackpad pinch arrives as ctrl+wheel with small deltas,
 * so it gets a higher gain; line-mode wheels (Firefox) are converted to pixels.
 */
export function wheelFactor(e: Pick<WheelEvent, "deltaY" | "deltaMode" | "ctrlKey">): number {
  const px = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1);
  const factor = Math.exp(-px * (e.ctrlKey ? 0.01 : 0.002));
  return Math.min(2, Math.max(0.5, factor));
}
