import fs from "fs";
import path from "path";

// Link-preview bots (X, LinkedIn) obey robots.txt: the share cards must stay fetchable.
describe("robots.txt", () => {
  const robots = fs.readFileSync(path.join(__dirname, "../../public/robots.txt"), "utf8");

  it("lets crawlers fetch share images", () => {
    const lines = robots.split("\n").map(l => l.trim());
    const allow = lines.indexOf("Allow: /api/og");
    const disallow = lines.indexOf("Disallow: /api/");
    expect(allow).toBeGreaterThanOrEqual(0);
    // Some crawlers apply the first matching rule, so the Allow must come first.
    expect(disallow === -1 || allow < disallow).toBe(true);
  });

  it("points at the sitemap", () => {
    expect(robots).toContain("Sitemap: https://chaos-iterator.vercel.app/sitemap.xml");
  });
});
