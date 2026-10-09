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
 * The 2:1 crop that frames what an attractor actually drew: the bounding box of lit pixels
 * (ignoring the outer 0.5% of them, so stray points don't count), padded and widened to the
 * tile's shape. Falls back to a centre crop when nothing is drawn.
 */
export function contentCrop(pixels: Uint8ClampedArray, size: number): Crop {
  const cols = new Float64Array(size), rows = new Float64Array(size);
  let total = 0;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const k = (y * size + x) * 4;
    if (pixels[k] + pixels[k + 1] + pixels[k + 2] > 30) { cols[x]++; rows[y]++; total++; }
  }
  const centre: Crop = { left: 0, top: Math.round(size / 4), width: size, height: Math.round(size / 2) };
  if (total === 0) return centre;
  const span = (counts: Float64Array) => {
    const cut = total * 0.005;
    let lo = 0, hi = size - 1, acc = 0;
    while (lo < size - 1 && acc + counts[lo] <= cut) acc += counts[lo++];
    acc = 0;
    while (hi > lo && acc + counts[hi] <= cut) acc += counts[hi--];
    return [lo, hi + 1];
  };
  const [x0, x1] = span(cols), [y0, y1] = span(rows);
  let w = (x1 - x0) * 1.16, h = (y1 - y0) * 1.16;        // 8% padding each side
  h = Math.max(h, w / 2, size / 20);                      // tile shape; never zoom past ~3×
  w = h * 2;
  if (w > size) { w = size; h = size / 2; }
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const left = Math.round(Math.min(size - w, Math.max(0, cx - w / 2)));
  const top = Math.round(Math.min(size - h, Math.max(0, cy - h / 2)));
  return { left, top, width: Math.round(w), height: Math.round(h) };
}

export async function renderPresetThumb(meta: SystemMeta, preset: Preset): Promise<Buffer> {
  const pixels = renderSystemPixels(meta, preset.params, {
    size: RENDER, budgetMs: 250, passes: 8, fractalBudgetMs: 3000,
    palette: preset.paletteData, palGamma: preset.palGamma,
  });
  // Fractal presets are a chosen view: keep it. Attractors are framed to what they draw.
  const crop = meta.category === "Fractals"
    ? { left: 0, top: RENDER / 4, width: RENDER, height: RENDER / 2 }
    : contentCrop(pixels, RENDER);
  return sharp(Buffer.from(pixels.buffer, pixels.byteOffset, pixels.byteLength), {
    raw: { width: RENDER, height: RENDER, channels: 4 },
  })
    .removeAlpha()
    .extract(crop)
    .resize(THUMB_WIDTH, THUMB_HEIGHT, { fit: "fill" })
    .webp({ quality: 72, effort: 4 })
    .toBuffer();
}
