/**
 * @jest-environment node
 */
/* eslint-disable testing-library/render-result-naming-convention -- renderPresetThumb is not Testing Library's render */
import sharp from "sharp";
import { renderPresetThumb, THUMB_WIDTH, THUMB_HEIGHT } from "../seo/presetThumb";
import { getSystemMeta } from "../attractors/catalog";
import { presetFor } from "../attractors/presets";

const distinctColours = async (buf: Buffer) => {
  const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
  const set = new Set<number>();
  for (let i = 0; i < data.length; i += info.channels) set.add((data[i] << 16) | (data[i + 1] << 8) | data[i + 2]);
  return set.size;
};

describe("renderPresetThumb", () => {
  jest.setTimeout(60000);

  it("renders a small WebP of the preset", async () => {
    const buf = await renderPresetThumb(getSystemMeta("clifford")!, presetFor("clifford", 0)!);
    const meta = await sharp(buf).metadata();
    expect(meta).toMatchObject({ format: "webp", width: THUMB_WIDTH, height: THUMB_HEIGHT });
    expect(THUMB_WIDTH / THUMB_HEIGHT).toBe(2);
    expect(buf.length).toBeLessThan(15000);
    expect(await distinctColours(buf)).toBeGreaterThan(20);
  });

  it("frames small or off-centre attractors to what they draw", async () => {
    // The drawing should fill the tile: its lit rows span most of the thumbnail's height.
    const litHeight = async (buf: Buffer) => {
      const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
      let top = -1, bottom = -1;
      for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
        const k = (y * info.width + x) * info.channels;
        if (data[k] + data[k + 1] + data[k + 2] > 30) { if (top < 0) top = y; bottom = y; }
      }
      return top < 0 ? 0 : (bottom - top + 1) / info.height;
    };
    // hopalong/0 is a ~20px blob in the middle; bedhead/4 hangs off the bottom edge.
    for (const [id, i] of [["hopalong", 0], ["bedhead", 4]] as const) {
      const buf = await renderPresetThumb(getSystemMeta(id)!, presetFor(id, i)!);
      expect(await litHeight(buf)).toBeGreaterThan(0.6);
    }
  });

  it("shows the whole drawing: nothing is cut at the edges", async () => {
    // Round symmetric icons used to lose their top and bottom to the 2:1 crop.
    for (const [id, i] of [["symmetric_icon", 0], ["symmetric_icon", 1], ["clifford", 0]] as const) {
      const buf = await renderPresetThumb(getSystemMeta(id)!, presetFor(id, i)!);
      const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
      const litInRow = (y: number) => {
        let n = 0;
        for (let x = 0; x < info.width; x++) { const k = (y * info.width + x) * info.channels; if (data[k] + data[k + 1] + data[k + 2] > 60) n++; }
        return n;
      };
      expect(litInRow(0)).toBeLessThan(info.width * 0.1);
      expect(litInRow(info.height - 1)).toBeLessThan(info.width * 0.1);
    }
  });

  it("uses the preset's own palette", async () => {
    const meta = getSystemMeta("symmetric_icon")!;
    const p = presetFor("symmetric_icon", 0)!;
    const own = await renderPresetThumb(meta, p);
    const grey = await renderPresetThumb(meta, { ...p, paletteData: [
      { position: 0, red: 0, green: 0, blue: 0 }, { position: 1, red: 255, green: 255, blue: 255 },
    ] as any });
    expect(own.equals(grey)).toBe(false);
  });

  it("is deterministic and renders fractal presets too", async () => {
    const meta = getSystemMeta("mandelbrot")!;
    const a = await renderPresetThumb(meta, presetFor("mandelbrot", 1)!);
    const b = await renderPresetThumb(meta, presetFor("mandelbrot", 1)!);
    expect(a.equals(b)).toBe(true);
    expect(await distinctColours(a)).toBeGreaterThan(20);
  });
});
