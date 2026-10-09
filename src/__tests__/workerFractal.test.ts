import fs from "fs";
import path from "path";
import vm from "vm";

// Loads the real public/worker.js into a sandbox with a stub OffscreenCanvas, so the fractal
// render pipeline (preview → full-res sweep with progress) can be tested without a browser.

type Msg = { type: string; payload: any };

function loadWorker() {
  const messages: Msg[] = [];
  const puts: { y: number; h: number; w: number }[] = [];
  let clock = 0;

  class Ctx {
    canvas: { width: number; height: number };
    imageSmoothingEnabled = true;
    imageSmoothingQuality = "low";
    constructor(canvas: { width: number; height: number }) { this.canvas = canvas; }
    createImageData(w: number, h: number) { return { data: new Uint8ClampedArray(w * h * 4), width: w, height: h }; }
    putImageData(img: any, _dx: number, _dy: number, x = 0, y = 0, w?: number, h?: number) {
      if (this.canvas.width === full.size) puts.push({ y, h: h ?? img.height, w: w ?? img.width });
    }
    drawImage() {}
    fillRect() {}
  }
  const full = { size: 0 };
  class FakeOffscreenCanvas {
    width: number; height: number;
    private ctx: Ctx;
    constructor(w: number, h: number) { this.width = w; this.height = h; this.ctx = new Ctx(this); }
    getContext() { return this.ctx; }
    convertToBlob() { return Promise.resolve({ fake: "blob" }); }
  }

  const sandbox: any = {
    console,
    Math, Float64Array, Uint32Array, Uint8ClampedArray, Array, Object, Number, isNaN, isFinite, Promise,
    OffscreenCanvas: FakeOffscreenCanvas,
    // Each call advances the clock, so time-budgeted loops yield after a few chunks.
    performance: { now: () => (clock += 4) },
    setTimeout: (fn: () => void, ms?: number) => setTimeout(fn, ms),
    clearTimeout: (id: any) => clearTimeout(id),
    postMessage: (m: Msg) => messages.push(m),
  };
  sandbox.self = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(__dirname, "../../public/worker.js"), "utf8"), sandbox);

  const send = (type: string, payload: any) => sandbox.onmessage({ data: { type, payload } });
  const startMandelbrot = (size: number) => {
    full.size = size;
    send("initialize", {
      mode: "offscreen", canvas: new FakeOffscreenCanvas(size, size), size, alias: 1, scale: 1,
      point: { xpos: 0, ypos: 0 },
      palette: [{ position: 0, red: 0, green: 0, blue: 0 }, { position: 1, red: 255, green: 255, blue: 255 }],
      colorLUTSize: 256, palGamma: 1, palScale: true, palMax: 1000, bgColor: { r: 0, g: 0, b: 0 },
      iterator: { name: "mandelbrot", parameters: { centerX: -0.5, centerY: 0, zoom: 1, maxIter: 32 } },
    });
  };
  return { messages, puts, send, startMandelbrot };
}

const progressOf = (ms: Msg[]) => ms.filter(m => m.type === "fractalProgress").map(m => m.payload.progress);
const completes = (ms: Msg[]) => ms.filter(m => m.type === "stats" && m.payload.fractalComplete);

describe("worker fractal sweep", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("paints the full-res image in strips that cover every row once, reporting rising progress", () => {
    const w = loadWorker();
    w.startMandelbrot(256);
    jest.runAllTimers();

    const rows = new Array(256).fill(0);
    for (const p of w.puts) for (let y = p.y; y < p.y + p.h; y++) rows[y]++;
    expect(rows.every(n => n === 1)).toBe(true);
    expect(w.puts.length).toBeGreaterThan(1);           // painted in strips, not one block
    expect(w.puts.every(p => p.w === 256)).toBe(true);

    const progress = progressOf(w.messages);
    expect(progress.length).toBeGreaterThan(1);
    progress.forEach((p, i) => { if (i) expect(p).toBeGreaterThan(progress[i - 1]); });
    expect(progress.every(p => p > 0 && p < 1)).toBe(true);
    expect(completes(w.messages)).toHaveLength(1);
  });

  it("a new render cancels the sweep in progress", () => {
    const w = loadWorker();
    w.startMandelbrot(256);
    jest.advanceTimersByTime(50);                       // preview delay + the first tick of strips
    expect(completes(w.messages)).toHaveLength(0);
    const before = w.messages.length;
    w.send("updatePalette", {
      palette: [{ position: 0, red: 10, green: 0, blue: 0 }, { position: 1, red: 0, green: 0, blue: 255 }],
      colorLUTSize: 256,
    });
    jest.runAllTimers();
    const after = w.messages.slice(before);
    expect(completes(w.messages)).toHaveLength(1);      // only the newest sweep finishes
    const p = progressOf(after);
    p.forEach((v, i) => { if (i) expect(v).toBeGreaterThan(p[i - 1]); });
  });

  it("the Render button (iterate) re-sweeps with progress instead of blocking", () => {
    const w = loadWorker();
    w.startMandelbrot(64);
    jest.runAllTimers();
    const before = w.messages.length;
    w.send("iterate", {});
    jest.runAllTimers();
    const after = w.messages.slice(before);
    expect(progressOf(after).length).toBeGreaterThan(0);
    expect(completes(after)).toHaveLength(1);
  });

  it("returns a snapshot of the canvas on request", async () => {
    const w = loadWorker();
    w.startMandelbrot(16);
    jest.runAllTimers();
    w.send("snapshot", { id: 7 });
    await Promise.resolve();
    await Promise.resolve();
    expect(w.messages.find(m => m.type === "snapshot")?.payload).toEqual({ id: 7, blob: { fake: "blob" } });
  });
});
