// Renders the share image for a studio link: the studio's own public/worker.js runs in a
// vm sandbox with a stub OffscreenCanvas, so the picture uses exactly the studio's math and
// colouring; sharp then lays it out as a 1200×630 card with the system's name beside it.
import fs from "fs";
import path from "path";
import vm from "vm";
import sharp from "sharp";
import type { SystemMeta } from "../attractors/registry";
import symmetricIconData from "../Parametersets";
import { CONFIG } from "../attractors/shared/types";

export const CARD_WIDTH = 1200;
export const CARD_HEIGHT = 630;
const RENDER_SIZE = 630;
const BACKGROUND = { r: 11, g: 13, b: 20 };
/** Iterations used for a fractal card: past this, extra detail is invisible at 630 px. */
const CARD_MAX_ITER = 1000;

export interface RenderOptions {
  /** Attractors: stop iterating after this long (at least one pass always runs). */
  budgetMs?: number;
  /** Attractors: most iterate passes (4M points each). */
  passes?: number;
  /** Fractals: stop the full-resolution sweep after this long; the preview fills the rest. */
  fractalBudgetMs?: number;
}

const root = () => process.cwd();
let workerScript: vm.Script | null = null;
function getWorkerScript() {
  if (!workerScript) {
    const source = fs.readFileSync(path.join(root(), "public/worker.js"), "utf8");
    workerScript = new vm.Script(source, { filename: "worker.js" });
  }
  return workerScript;
}

/** Small seeded PRNG so the same link always renders the same image (and caches well). */
function seededRandom(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

class StubCanvas {
  readonly pixels: Uint8ClampedArray;
  private readonly ctx: StubContext;
  constructor(public width: number, public height: number) {
    this.pixels = new Uint8ClampedArray(width * height * 4);
    this.ctx = new StubContext(this);
  }
  getContext() { return this.ctx; }
  convertToBlob() { return Promise.resolve(null); }
}

class StubContext {
  fillStyle = "rgb(0, 0, 0)";
  imageSmoothingEnabled = true;
  imageSmoothingQuality = "low";
  constructor(readonly canvas: StubCanvas) {}

  createImageData(w: number, h: number) {
    return { data: new Uint8ClampedArray(w * h * 4), width: w, height: h };
  }

  putImageData(img: { data: Uint8ClampedArray; width: number; height: number }, dx: number, dy: number,
    x = 0, y = 0, w = img.width, h = img.height) {
    const { pixels, width, height } = this.canvas;
    for (let row = y; row < y + h; row++) {
      const ty = dy + row;
      if (ty < 0 || ty >= height) continue;
      const cols = Math.min(w, width - (dx + x));
      const src = (row * img.width + x) * 4;
      pixels.set(img.data.subarray(src, src + cols * 4), (ty * width + dx + x) * 4);
    }
  }

  fillRect(x: number, y: number, w: number, h: number) {
    const m = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/.exec(this.fillStyle);
    const [r, g, b] = m ? [+m[1], +m[2], +m[3]] : [0, 0, 0];
    const { pixels, width, height } = this.canvas;
    for (let py = Math.max(0, y); py < Math.min(height, y + h); py++) {
      for (let px = Math.max(0, x); px < Math.min(width, x + w); px++) {
        const i = (py * width + px) * 4;
        pixels[i] = r; pixels[i + 1] = g; pixels[i + 2] = b; pixels[i + 3] = 255;
      }
    }
  }

  /** Only used to upscale the fractal preview to the full canvas (nearest neighbour). */
  drawImage(src: StubCanvas, dx: number, dy: number, dw = src.width, dh = src.height) {
    const { pixels, width } = this.canvas;
    for (let py = 0; py < dh; py++) {
      const sy = Math.min(src.height - 1, Math.floor((py * src.height) / dh));
      for (let px = 0; px < dw; px++) {
        const sx = Math.min(src.width - 1, Math.floor((px * src.width) / dw));
        const s = (sy * src.width + sx) * 4;
        const d = ((dy + py) * width + dx + px) * 4;
        pixels[d] = src.pixels[s]; pixels[d + 1] = src.pixels[s + 1]; pixels[d + 2] = src.pixels[s + 2]; pixels[d + 3] = 255;
      }
    }
  }
}

/** Runs the studio worker for one system and returns the square render as RGBA. */
export function renderSystemPixels(meta: SystemMeta, params: Record<string, number | string>, opts: RenderOptions = {}) {
  const { budgetMs = 1500, passes = 40, fractalBudgetMs = 8000 } = opts;
  const timers: (() => void)[] = [];
  const sandboxMath = Object.create(Math) as Math;
  sandboxMath.random = seededRandom(0x5eed);

  const sandbox: Record<string, unknown> = {
    console, Math: sandboxMath, Float64Array, Uint32Array, Uint16Array, Uint8ClampedArray, Array, Object, Number,
    isNaN, isFinite, Promise,
    OffscreenCanvas: StubCanvas,
    performance: { now: () => performance.now() },
    // Timers run synchronously (in order) from the drain loop below.
    setTimeout: (fn: () => void) => { timers.push(fn); return timers.length; },
    clearTimeout: () => {},
    postMessage: () => {},
  };
  sandbox.self = sandbox;
  vm.createContext(sandbox);
  getWorkerScript().runInContext(sandbox);
  const send = (type: string, payload: unknown) =>
    (sandbox.onmessage as (e: unknown) => void)({ data: { type, payload } });

  const canvas = new StubCanvas(RENDER_SIZE, RENDER_SIZE);
  const isFractal = meta.category === "Fractals";
  // The studio opens a shared link with its start-up palette, so the card uses it too.
  const startup = symmetricIconData[CONFIG.INITIAL_ICON_INDEX];
  const iterator: Record<string, unknown> = {
    name: meta.workerIteratorName || meta.id,
    parameters: meta.category === "Fractals" && typeof params.maxIter === "number"
      ? { ...params, maxIter: Math.min(CARD_MAX_ITER, params.maxIter) }
      : { ...params },
    math: meta.math,
  };
  if (meta.id === "lyapunov" && params.sequence) iterator.sequence = params.sequence;

  const started = performance.now();
  send("initialize", {
    // Fractals skip supersampling: at card size it is invisible and costs 4× the time.
    mode: "offscreen", canvas, size: RENDER_SIZE, alias: isFractal ? 1 : CONFIG.ALIAS,
    scale: isFractal ? 1 : Number(params.scale ?? 1),
    palette: startup.paletteData, colorLUTSize: CONFIG.COLOR_LUT_SIZE,
    palGamma: startup.palGamma ?? 0.5, palScale: true, palMax: 10000, bgColor: { r: 0, g: 0, b: 0 },
    iterator,
  });

  if (isFractal) {
    while (timers.length && performance.now() - started < fractalBudgetMs) timers.shift()!();
  } else {
    for (let pass = 0; pass < passes; pass++) {
      if (pass > 0 && performance.now() - started >= budgetMs) break;
      send("iterate", {});
    }
  }
  return canvas.pixels;
}

const escapeMarkup = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const fontFile = (weight: "Bold" | "Regular") =>
  path.join(root(), `node_modules/katex/dist/fonts/KaTeX_SansSerif-${weight}.ttf`);

function textLayer(markup: string, weight: "Bold" | "Regular", width: number) {
  return sharp({
    text: { text: markup, font: `KaTeX_SansSerif ${weight}`, fontfile: fontFile(weight), rgba: true, width, dpi: 72, wrap: "word" },
  }).png().toBuffer();
}

/** The full 1200×630 share card as PNG. */
export async function renderShareImage(meta: SystemMeta, params: Record<string, number | string>, opts: RenderOptions = {}) {
  const pixels = renderSystemPixels(meta, params, opts);
  const render = await sharp(Buffer.from(pixels.buffer, pixels.byteOffset, pixels.byteLength), {
    raw: { width: RENDER_SIZE, height: RENDER_SIZE, channels: 4 },
  }).removeAlpha().png().toBuffer();

  const textWidth = CARD_WIDTH - RENDER_SIZE - 120;
  const [brand, label, tagline, url] = await Promise.all([
    textLayer(`<span foreground="#a5b4fc" size="22pt" letter_spacing="2048">CHAOS ITERATOR</span>`, "Bold", textWidth),
    textLayer(`<span foreground="#ffffff" size="54pt">${escapeMarkup(meta.label)}</span>`, "Bold", textWidth),
    textLayer(`<span foreground="#c7cad6" size="24pt">${escapeMarkup(meta.category === "Fractals" ? "Fractal" : meta.category === "IFS" ? "Iterated function system" : "Strange attractor")} · rendered from this exact link</span>`, "Regular", textWidth),
    textLayer(`<span foreground="#8b90a3" size="20pt">chaos-iterator.vercel.app — make your own, free</span>`, "Regular", textWidth),
  ]);

  const left = RENDER_SIZE + 60;
  return sharp({ create: { width: CARD_WIDTH, height: CARD_HEIGHT, channels: 3, background: BACKGROUND } })
    .composite([
      { input: render, left: 0, top: 0 },
      { input: brand, left, top: 150 },
      { input: label, left, top: 200 },
      { input: tagline, left, top: 300 },
      { input: url, left, top: CARD_HEIGHT - 90 },
    ])
    .png()
    .toBuffer();
}
