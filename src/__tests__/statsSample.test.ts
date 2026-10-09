import { nextStatsSample, initialStats } from "../lib/statsSample";

describe("nextStatsSample", () => {
  it("starts the clock on the first running sample", () => {
    const s = nextStatsSample(initialStats, 0, 1000, true);
    expect(s.startT).toBe(1000);
    expect(s.elapsedMs).toBe(0);
  });

  it("derives points/sec from iteration delta", () => {
    const a = nextStatsSample(initialStats, 0, 1000, true);
    const b = nextStatsSample(a, 500_000, 1500, true);
    expect(b.rate).toBe(1_000_000);
    expect(b.elapsedMs).toBe(500);
  });

  it("freezes elapsed and zeroes rate when not running", () => {
    const a = nextStatsSample(initialStats, 0, 1000, true);
    const b = nextStatsSample(a, 100, 2000, true);
    const c = nextStatsSample(b, 100, 5000, false);
    expect(c.rate).toBe(0);
    expect(c.elapsedMs).toBe(1000);
  });

  it("resets the clock when iterations go backwards (new render)", () => {
    const a = nextStatsSample(initialStats, 0, 1000, true);
    const b = nextStatsSample(a, 1000, 2000, true);
    const c = nextStatsSample(b, 10, 3000, true);
    expect(c.startT).toBe(3000);
    expect(c.elapsedMs).toBe(0);
  });

  it("ignores samples with no time delta", () => {
    const a = nextStatsSample(initialStats, 0, 1000, true);
    const b = nextStatsSample(a, 100, 1000, true);
    expect(Number.isFinite(b.rate)).toBe(true);
  });

  it("keeps the last rate between bursty worker updates instead of dropping to 0", () => {
    const a = nextStatsSample(initialStats, 0, 1000, true);
    const b = nextStatsSample(a, 1000, 1250, true);
    expect(b.rate).toBe(4000);
    const c = nextStatsSample(b, 1000, 1500, true);
    expect(c.rate).toBe(4000);
    expect(c.elapsedMs).toBe(500);
    const d = nextStatsSample(c, 2000, 1750, true);
    expect(d.rate).toBe(2000);
  });
});

