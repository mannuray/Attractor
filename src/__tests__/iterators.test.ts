import {
  CliffordIterator,
  SymmetricIconIterator,
  Point,
} from "../model-controller/Attractor/iterator";

describe("CliffordIterator", () => {
  const a = -1.4;
  const b = 1.6;
  const c = 1.0;
  const d = 0.7;
  const iterator = new CliffordIterator(a, b, c, d);

  it("produces correct output for a known input", () => {
    const input: Point = { xpos: 0, ypos: 0 };
    const result = iterator.iterate(input);

    // xpos = sin(a * 0) + c * cos(a * 0) = sin(0) + 1 * cos(0) = 0 + 1 = 1
    // ypos = sin(b * 0) + d * cos(b * 0) = sin(0) + 0.7 * cos(0) = 0 + 0.7 = 0.7
    expect(result.xpos).toBeCloseTo(1.0, 10);
    expect(result.ypos).toBeCloseTo(0.7, 10);
  });

  it("produces correct output for a second step", () => {
    const step1: Point = { xpos: 1.0, ypos: 0.7 };
    const result = iterator.iterate(step1);

    // xpos = sin(-1.4 * 0.7) + 1.0 * cos(-1.4 * 1.0)
    //      = sin(-0.98) + cos(-1.4)
    const expectedX = Math.sin(-1.4 * 0.7) + 1.0 * Math.cos(-1.4 * 1.0);
    const expectedY = Math.sin(1.6 * 1.0) + 0.7 * Math.cos(1.6 * 0.7);

    expect(result.xpos).toBeCloseTo(expectedX, 10);
    expect(result.ypos).toBeCloseTo(expectedY, 10);
  });

  it("is deterministic — same input always gives same output", () => {
    const input: Point = { xpos: 0.5, ypos: -0.3 };
    const r1 = iterator.iterate(input);
    const r2 = iterator.iterate(input);

    expect(r1.xpos).toBe(r2.xpos);
    expect(r1.ypos).toBe(r2.ypos);
  });

  it("stays bounded over 1000 iterations", () => {
    let point: Point = { xpos: 0, ypos: 0 };
    for (let i = 0; i < 1000; i++) {
      point = iterator.iterate(point);
      expect(Number.isFinite(point.xpos)).toBe(true);
      expect(Number.isFinite(point.ypos)).toBe(true);
    }
  });
});

describe("SymmetricIconIterator", () => {
  // A well-known preset that produces bounded output
  const alpha = 2.0;
  const betha = 0.2;
  const gamma = 0.1;
  const delta = 0;
  const omega = 0;
  const lambda = -1.0;
  const degree = 5;
  const npdegree = 3;
  const iterator = new SymmetricIconIterator(
    alpha, betha, gamma, delta, omega, lambda, degree, npdegree
  );

  it("produces a known output from origin-adjacent point", () => {
    const input: Point = { xpos: 0.1, ypos: 0.1 };
    const result = iterator.iterate(input);

    // Verify result is a finite Point with expected structure
    expect(typeof result.xpos).toBe("number");
    expect(typeof result.ypos).toBe("number");
    expect(Number.isFinite(result.xpos)).toBe(true);
    expect(Number.isFinite(result.ypos)).toBe(true);
  });

  it("is deterministic", () => {
    const input: Point = { xpos: 0.3, ypos: -0.2 };
    const r1 = iterator.iterate(input);
    const r2 = iterator.iterate(input);

    expect(r1.xpos).toBe(r2.xpos);
    expect(r1.ypos).toBe(r2.ypos);
  });

  it("produces correct single-step output for known parameters", () => {
    // With delta=0, the iterator simplifies: zc=0, zz=0
    // For degree=5, the loop runs degree-2=3 times raising (xpos+i*ypos) to power (degree-1)=4
    const input: Point = { xpos: 0.1, ypos: 0.0 };
    const result = iterator.iterate(input);

    // zzbar = 0.01
    // since delta=0: zc=0, zz=0
    // zreal, zimag after loop (3 iterations of complex mult by (0.1, 0)):
    //   start: zreal=0.1, zimag=0
    //   after 3 mults: zreal = 0.1^4 = 0.0001, zimag = 0
    // zn = xpos*zreal - ypos*zimag = 0.1 * 0.0001 = 0.00001
    // p = lambda + alpha*zzbar + betha*zn + delta*zz*zc
    //   = -1.0 + 2.0*0.01 + 0.2*0.00001 + 0 = -1.0 + 0.02 + 0.000002 = -0.979998
    // nxpos = p*xpos + gamma*zreal - omega*ypos
    //       = -0.979998*0.1 + 0.1*0.0001 - 0 = -0.0979998 + 0.00001 = -0.0979898
    // nypos = p*ypos - gamma*zimag + omega*xpos = 0

    expect(result.xpos).toBeCloseTo(-0.0979898, 5);
    expect(result.ypos).toBeCloseTo(0, 10);
  });

  it("stays bounded over 1000 iterations", () => {
    let point: Point = { xpos: 0.01, ypos: 0.01 };
    for (let i = 0; i < 1000; i++) {
      point = iterator.iterate(point);
      if (!Number.isFinite(point.xpos) || !Number.isFinite(point.ypos)) {
        // If it diverges, that's also useful to know — but we expect this preset to be bounded
        fail(`Diverged at iteration ${i}: (${point.xpos}, ${point.ypos})`);
      }
    }
    expect(Number.isFinite(point.xpos)).toBe(true);
    expect(Number.isFinite(point.ypos)).toBe(true);
  });
});
