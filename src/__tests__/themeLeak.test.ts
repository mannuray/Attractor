import fs from "fs";
import path from "path";

// Accent colors must come from the theme, so the other four themes don't show Cyber Cyan.
const FORBIDDEN = [/76,\s*215,\s*246/, /6,\s*182,\s*212/, /#2fd9f4/i, /#4cd7f6/i, /#06b6d4/i];
const ALLOWED = new Set(["theme/themes.ts"]);

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(d => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) return d.name === "__tests__" ? [] : walk(p);
    return /\.(tsx?|css)$/.test(d.name) ? [p] : [];
  });
}

it("no component hard-codes the Cyber Cyan accent", () => {
  const root = path.join(__dirname, "..");
  const offenders: string[] = [];
  for (const file of walk(root)) {
    const rel = path.relative(root, file).split(path.sep).join("/");
    if (ALLOWED.has(rel)) continue;
    fs.readFileSync(file, "utf8").split("\n").forEach((line, i) => {
      if (!line.includes("theme-leak-ok") && FORBIDDEN.some(re => re.test(line))) offenders.push(`${rel}:${i + 1}`);
    });
  }
  expect(offenders).toEqual([]);
});
