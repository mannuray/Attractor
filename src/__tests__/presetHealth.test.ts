import { orbitHealth, presetHealth } from "../attractors/orbitHealth";
import { PRESETS } from "../attractors/presets";
import { getSystemMeta } from "../attractors/catalog";

// A preset must draw something: its orbit neither blows up (NaN/∞) nor collapses to a few points.
// Every attractor-style system (fractals have no orbit), from each studio-like start point.
const SYSTEMS = Object.keys(PRESETS).filter(id => getSystemMeta(id)?.math);

describe("preset health", () => {
  it("classifies obvious cases", () => {
    const clifford = getSystemMeta("clifford")!.math!;
    expect(orbitHealth(clifford, { alpha: 1.5, beta: -1.8, gamma: 1.6, delta: 2 }).kind).toBe("attractor");
    expect(orbitHealth("p[0] = p[0] * 3 + 1; p[1] = p[1];", {}).kind).toBe("diverges");
    expect(orbitHealth("p[0] = 0.5; p[1] = 0.5;", {}).kind).toBe("collapses");
  });

  for (const id of SYSTEMS) {
    it(`every ${id} preset and the default draw an attractor`, () => {
      const meta = getSystemMeta(id)!;
      const bad = [{ name: "(default)", params: meta.defaultParams }, ...PRESETS[id]!]
        .map(p => ({ name: p.name, ...presetHealth(meta.math!, p.params) }))
        .filter(h => h.kind !== "attractor");
      expect(bad).toEqual([]);
    });
  }
});
