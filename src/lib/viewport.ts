// Pure maths for the canvas viewport: the render is drawn at `translate(x, y) scale(scale)`
// inside a fixed-size viewport, so zooming never changes the page layout.
import type { LyapunovParams } from "../attractors/lyapunov/types";

export interface View { scale: number; x: number; y: number }
export interface Size { width: number; height: number }

export const FIT_MARGIN = 40;
/** Zoom range relative to "fit" (fit = 100%). */
export const MIN_RELATIVE = 0.25;
export const MAX_RELATIVE = 8;

export function fitScale(vp: Size, size: number): number {
  const s = Math.min((vp.width - FIT_MARGIN) / size, (vp.height - FIT_MARGIN) / size);
  return Number.isFinite(s) && s > 0 ? s : 1e-3;
}

export function fitView(vp: Size, size: number): View {
  const scale = fitScale(vp, size);
  return { scale, x: (vp.width - size * scale) / 2, y: (vp.height - size * scale) / 2 };
}

/** Scale limits: 25%..800% of fit, and actual pixels (scale 1) is always reachable. */
export function scaleLimits(vp: Size, size: number) {
  const f = fitScale(vp, size);
  return { min: f * MIN_RELATIVE, max: Math.max(f * MAX_RELATIVE, 2) };
}

export const zoomPercent = (view: View, vp: Size, size: number) => Math.round((view.scale / fitScale(vp, size)) * 100);

/** Zoom by `factor`, keeping the viewport point (px, py) over the same canvas point. */
export function zoomAt(view: View, factor: number, px: number, py: number, limits?: { min: number; max: number }): View {
  let scale = view.scale * factor;
  if (limits) scale = Math.min(limits.max, Math.max(limits.min, scale));
  if (!Number.isFinite(scale) || scale <= 0) return view;
  const r = scale / view.scale;
  return { scale, x: px - (px - view.x) * r, y: py - (py - view.y) * r };
}

export const panBy = (view: View, dx: number, dy: number): View => ({ ...view, x: view.x + dx, y: view.y + dy });

/** A smaller-than-viewport image is centred; a larger one always covers the viewport. */
export function clampView(view: View, vp: Size, size: number): View {
  const axis = (pos: number, extent: number, room: number) =>
    extent <= room ? (room - extent) / 2 : Math.min(0, Math.max(room - extent, pos));
  const extent = size * view.scale;
  return { scale: view.scale, x: axis(view.x, extent, vp.width), y: axis(view.y, extent, vp.height) };
}

// --- Fractals: a CSS preview of a zoom/pan becomes new fractal parameters ---

/** Maps canvas pixels of the new render to canvas pixels of the old one: old = new * k + o. */
export interface CanvasMap { k: number; ox: number; oy: number }

/** The canvas mapping that makes the re-render (drawn at `base`) look like what `shown` showed. */
export function canvasMapBetween(base: View, shown: View): CanvasMap {
  return { k: base.scale / shown.scale, ox: (base.x - shown.x) / shown.scale, oy: (base.y - shown.y) / shown.scale };
}

/** Escape-time fractals (see worker.js): the view spans 3/zoom around (centerX, centerY). */
export function remapComplexView<T extends { centerX: number; centerY: number; zoom: number }>(p: T, m: CanvasMap, size: number): T {
  const range = 3 / p.zoom;
  const xMin = p.centerX - range / 2 + (m.ox * range) / size;
  const yMin = p.centerY - range / 2 + (m.oy * range) / size;
  const next = range * m.k;
  return { ...p, centerX: xMin + next / 2, centerY: yMin + next / 2, zoom: 3 / next };
}

export function remapLyapunovView(p: LyapunovParams, m: CanvasMap, size: number): LyapunovParams {
  const aRange = p.aMax - p.aMin;
  const bRange = p.bMax - p.bMin;
  const aMin = p.aMin + (m.ox / size) * aRange;
  const bMin = p.bMin + (m.oy / size) * bRange;
  return { ...p, aMin, aMax: aMin + aRange * m.k, bMin, bMax: bMin + bRange * m.k };
}

/** How far a fractal is zoomed in relative to its default view (1 = default). */
export function fractalDepth(p: Record<string, any>, defaults: Record<string, any>): number {
  if (typeof p.zoom === "number" && typeof defaults.zoom === "number" && defaults.zoom > 0) return p.zoom / defaults.zoom;
  if (typeof p.aMin === "number" && typeof defaults.aMin === "number") {
    const range = p.aMax - p.aMin;
    return range > 0 ? (defaults.aMax - defaults.aMin) / range : 1;
  }
  return 1;
}

/**
 * After a commit made the new render (drawn at `base`) equal the old one shown at `committed`,
 * returns the view of the new render that looks like the old one shown at `shown`.
 */
export function rebaseView(shown: View, committed: View, base: View): View {
  const r = shown.scale / committed.scale;
  return { scale: base.scale * r, x: shown.x + r * (base.x - committed.x), y: shown.y + r * (base.y - committed.y) };
}
