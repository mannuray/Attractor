#!/usr/bin/env node
// Renders every preset's thumbnail (the studio's own worker, the preset's own palette) into
// public/presets/<system>/<index>.webp. Run after adding or changing presets, then commit:
//   npm run build:thumbs
import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tmp = path.join(root, "node_modules/.cache/preset-thumbs/entry.cjs");
const entry = `
  import { PRESETS } from "./src/attractors/presets";
  import { getSystemMeta } from "./src/attractors/catalog";
  import { renderPresetThumb, presetThumbPath } from "./src/seo/presetThumb";
  export { PRESETS, getSystemMeta, renderPresetThumb, presetThumbPath };
`;
await build({
  stdin: { contents: entry, resolveDir: root, loader: "ts" },
  outfile: tmp, bundle: true, platform: "node", format: "cjs", target: "node20",
  external: ["sharp"], loader: { ".js": "jsx" }, logLevel: "warning",
});
const { PRESETS, getSystemMeta, renderPresetThumb, presetThumbPath } = createRequire(import.meta.url)(tmp);

const outDir = path.join(root, "public/presets");
fs.rmSync(outDir, { recursive: true, force: true });
let count = 0, bytes = 0;
const t0 = Date.now();
for (const [id, presets] of Object.entries(PRESETS)) {
  const meta = getSystemMeta(id);
  for (let i = 0; i < presets.length; i++) {
    const buf = await renderPresetThumb(meta, presets[i]);
    const file = path.join(root, "public", presetThumbPath(id, i));
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, buf);
    count++; bytes += buf.length;
  }
  process.stdout.write(`${id} (${presets.length}) `);
}
console.log(`\nwrote ${count} thumbnails, ${(bytes / 1024).toFixed(0)} KB, in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
