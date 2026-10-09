/**
 * @jest-environment node
 */
import fs from "fs";
import path from "path";
import { PRESETS } from "../attractors/presets";
import { presetThumbPath } from "../seo/presetThumb";

// Thumbnails are generated once and committed (npm run build:thumbs); every preset needs one.
describe("committed preset thumbnails", () => {
  it("exist for every preset", () => {
    const missing: string[] = [];
    for (const [id, presets] of Object.entries(PRESETS)) {
      presets!.forEach((_, i) => {
        const file = path.join(__dirname, "../../public", presetThumbPath(id, i));
        if (!fs.existsSync(file)) missing.push(presetThumbPath(id, i));
      });
    }
    expect(missing).toEqual([]);
  });
});
