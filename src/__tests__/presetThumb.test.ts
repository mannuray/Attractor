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
    const litFraction = async (buf: Buffer) => {
      const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
      let lit = 0;
      for (let i = 0; i < data.length; i += info.channels) if (data[i] + data[i + 1] + data[i + 2] > 30) lit++;
      return lit / (info.width * info.height);
    };
    // hopalong/0 is a ~20px blob in the middle; bedhead/4 hangs off the bottom edge.
    for (const [id, i] of [["hopalong", 0], ["bedhead", 4]] as const) {
      const buf = await renderPresetThumb(getSystemMeta(id)!, presetFor(id, i)!);
      expect(await litFraction(buf)).toBeGreaterThan(0.15);
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
