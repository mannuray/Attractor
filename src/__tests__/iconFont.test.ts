import fs from "fs";
import path from "path";
import { ICON_NAMES } from "../components/ui/iconNames";
import { ICON_ALIASES } from "../components/ui/Icon";

// The icon font is self-hosted and subset to ICON_NAMES. Any glyph used in the source must be in
// that list (and the font must be regenerated with scripts/fetch-icon-font.sh), or it renders as text.

const SRC = path.join(__dirname, "..");
function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(d => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) return d.name === "__tests__" ? [] : walk(p);
    return /\.tsx?$/.test(d.name) ? [p] : [];
  });
}

function usedGlyphs(): Set<string> {
  const found = new Set<string>();
  // Quoted words, skipping ones that are compared against (=== "copied") rather than rendered.
  const words = (s: string) => Array.from(s.matchAll(/(?<![=!]==\s*)"([a-zA-Z_]+)"/g)).map(m => m[1]);
  for (const file of walk(SRC)) {
    const src = fs.readFileSync(file, "utf8");
    for (const m of src.matchAll(/<Icon\b[^>]*?\bname=(\{[^}]*\}|"[^"]*")/g)) words(m[1]).forEach(w => found.add(w));
    for (const m of src.matchAll(/\b(?:icon|glyph):\s*"([a-z_]+)"/g)) found.add(m[1]);
    // Icon names chosen through a variable, e.g. const runIcon = a ? "pause" : "play";
    for (const m of src.matchAll(/const \w*Icon\s*=\s*([^;\n]+);/g)) words(m[1]).forEach(w => found.add(w));
    for (const m of src.matchAll(/className="material-symbols-outlined"[^>]*>\s*\{?([a-z_.]+)/g)) {
      if (!m[1].includes(".")) found.add(m[1]);
    }
  }
  // Resolve aliases to the Material glyph they render.
  return new Set(Array.from(found).map(n => (ICON_ALIASES as Record<string, string>)[n] ?? n));
}

describe("self-hosted icon font", () => {
  it("covers every glyph the app uses", () => {
    const missing = Array.from(usedGlyphs()).filter(g => !ICON_NAMES.includes(g)).sort();
    expect(missing).toEqual([]);
  });

  it("subset list is sorted and unique (required by the font subsetting API)", () => {
    expect([...ICON_NAMES].sort()).toEqual(ICON_NAMES);
    expect(new Set(ICON_NAMES).size).toBe(ICON_NAMES.length);
  });

  it("ships the font locally instead of loading it from Google Fonts", () => {
    expect(fs.existsSync(path.join(SRC, "assets", "fonts", "material-symbols-outlined.woff2"))).toBe(true);
    const html = fs.readFileSync(path.join(SRC, "..", "public", "index.html"), "utf8");
    expect(html).not.toMatch(/Material\+Symbols/);
    const css = fs.readFileSync(path.join(SRC, "index.css"), "utf8");
    expect(css).toMatch(/@font-face[\s\S]*Material Symbols Outlined[\s\S]*material-symbols-outlined\.woff2/);
  });
});
