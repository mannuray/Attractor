// Preset thumbnails for the inspector's preset ribbon: each preset rendered with the studio's
// own worker in its own palette, cropped to the tile's 2:1 box. Generated at build time.
import sharp from "sharp";
import type { SystemMeta } from "../attractors/registry";
import type { Preset } from "../attractors/presets";
import { renderSystemPixels } from "./ogRender";

export { presetThumbPath } from "../attractors/presets";

export const THUMB_WIDTH = 160;
export const THUMB_HEIGHT = 80;
const RENDER = 320;   // square render, cover-cropped to the 2:1 tile

export interface Crop { left: number; top: number; width: number; height: number }

/**
 * The box around what an attractor actually drew: the bounding box of lit pixels (ignoring
 * the outer 0.5% of them, so stray points don't count), padded, and never smaller than a
 * tenth of the render (so tiny shapes aren't blown up into blur). The whole canvas when
 * nothing is drawn.
 */
export function contentBox(pixels: Uint8ClampedArray, size: number): Crop {
  const cols = new Float64Array(size), rows = new Float64Array(size);
  let total = 0;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const k = (y * size + x) * 4;
    if (pixels[k] + pixels[k + 1] + pixels[k + 2] > 30) { cols[x]++; rows[y]++; total++; }
  }
  if (total === 0) return { left: 0, top: 0, width: size, height: size };
  const span = (counts: Float64Array) => {
    const cut = total * 0.005;
    let lo = 0, hi = size - 1, acc = 0;
    while (lo < size - 1 && acc + counts[lo] <= cut) acc += counts[lo++];
    acc = 0;
    while (hi > lo && acc + counts[hi] <= cut) acc += counts[hi--];
    return [lo, hi + 1];
  };
  const axis = ([a, b]: number[]) => {
    const len = Math.min(size, Math.max((b - a) * 1.12, size / 10));   // 6% padding each side
    const start = Math.min(size - len, Math.max(0, (a + b) / 2 - len / 2));
    return [Math.round(start), Math.round(len)];
  };
  const [left, width] = axis(span(cols)), [top, height] = axis(span(rows));
  return { left, top, width: Math.min(width, size - left), height: Math.min(height, size - top) };
}

export async function renderPresetThumb(meta: SystemMeta, preset: Preset): Promise<Buffer> {
  const pixels = renderSystemPixels(meta, preset.params, {
    size: RENDER, budgetMs: 250, passes: 8, fractalBudgetMs: 3000,
    palette: preset.paletteData, palGamma: preset.palGamma,
  });
  // Fractal presets are a chosen view that fills the frame: crop to the tile's shape.
  // Attractors are framed to what they draw and shown whole, on black.
  const fractal = meta.category === "Fractals";
  const crop = fractal ? { left: 0, top: RENDER / 4, width: RENDER, height: RENDER / 2 } : contentBox(pixels, RENDER);
  return sharp(Buffer.from(pixels.buffer, pixels.byteOffset, pixels.byteLength), {
    raw: { width: RENDER, height: RENDER, channels: 4 },
  })
    .removeAlpha()
    .extract(crop)
    .resize(THUMB_WIDTH, THUMB_HEIGHT, { fit: fractal ? "fill" : "contain", background: { r: 0, g: 0, b: 0 } })
    .webp({ quality: 72, effort: 4 })
    .toBuffer();
}
