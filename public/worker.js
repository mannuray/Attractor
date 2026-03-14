// Worker state
let iterCanvas = null;
let it = null;

// Rendering mode: "legacy" or "offscreen"
let mode = "legacy";

// Fractal mode: true for Mandelbrot/Julia (escape-time), false for attractors (hit-counting)
let fractalMode = false;
let fractalParams = null;

// OffscreenCanvas rendering state
let offscreenCanvas = null;
let ctx = null;
let colorLUT = null;
let currentPalette = null; 
let canvasSize = 0;
let configAlias = 2;
let colorLUTSize = 2048;

// Palette gamma and max hits scaling
let palGamma = 1.0;       
let palScale = false;     
let palMax = 10000;       
let bgColor = { r: 0, g: 0, b: 0 }; 
let progressiveTimeoutId = null; 

// Pre-computed gamma lookup table
let gammaLUT = null;      

// Cached ImageData to avoid per-frame allocation
let cachedImageData = null;
let cachedData32 = null;
let cachedImageSize = 0;

// SharedArrayBuffer support
let sharedHitsArray = null;

// ============================================
// DYNAMIC ITERATOR ENGINE (SOLID Refactor)
// ============================================

class DynamicIterator {
  constructor(mathString, params) {
    this.params = params;
    try {
      // Simplest signature: just p and params
      this.iterateFn = new Function('p', 'params', mathString);
      console.log("Worker: Compiled iterateFn successfully");
    } catch (e) {
      console.error("Worker: Failed to compile dynamic iterator math:", e);
      this.iterateFn = (p) => { p[0] = 0; p[1] = 0; };
    }
  }

  iterate(p) {
    this.iterateFn(p, this.params);
  }
}

// ============================================
// COLOR PALETTE MANAGEMENT
// ============================================

function findColorIndex(palette, position) {
  let low = 0;
  let high = palette.length - 2;
  while (low < high) {
    const mid = (low + high + 1) >> 1;
    if (palette[mid].position <= position) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }
  return low;
}

function interpolatePaletteColor(palette, position) {
  const normalizedPos = Math.min(1, Math.max(0, position));
  const i = findColorIndex(palette, normalizedPos);
  const c1 = palette[i];
  const c2 = palette[i + 1];
  const range = c2.position - c1.position;
  const t = range === 0 ? 0 : (normalizedPos - c1.position) / range;
  return {
    red: Math.round(t * (c2.red - c1.red) + c1.red),
    green: Math.round(t * (c2.green - c1.green) + c1.green),
    blue: Math.round(t * (c2.blue - c1.blue) + c1.blue),
  };
}

function buildColorLUT(palette, lutSize) {
  colorLUT = new Uint32Array(lutSize);
  colorLUTSize = lutSize;
  for (let i = 0; i < lutSize; i++) {
    const ratio = i / lutSize; 
    const col = interpolatePaletteColor(palette, ratio);
    colorLUT[i] = (255 << 24) | (col.blue << 16) | (col.green << 8) | col.red;
  }
  buildGammaLUT();
}

function buildGammaLUT() {
  gammaLUT = new Uint16Array(colorLUTSize);
  for (let i = 0; i < colorLUTSize; i++) {
    const linear = i / colorLUTSize;
    const corrected = palGamma === 1.0 ? linear : Math.pow(linear, palGamma);
    gammaLUT[i] = Math.min(colorLUTSize - 1, Math.floor(corrected * colorLUTSize));
  }
}

function getImageData(size) {
  if (cachedImageSize !== size || !cachedImageData) {
    cachedImageData = ctx.createImageData(size, size);
    cachedData32 = new Uint32Array(cachedImageData.data.buffer);
    cachedImageSize = size;
  }
  return { imageData: cachedImageData, data32: cachedData32 };
}

// ============================================
// OFFSCREEN CANVAS RENDERING
// ============================================

function getColorRGB(x, y, hits, maxHits, iteratorSize) {
  const bgColorPacked = (255 << 24) | (bgColor.b << 16) | (bgColor.g << 8) | bgColor.r;
  if (!colorLUT) return bgColorPacked;

  const divisor = palScale ? maxHits : palMax;
  if (divisor === 0) return bgColorPacked;

  let totalR = 0, totalG = 0, totalB = 0;
  const startX = x * configAlias;
  const startY = y * configAlias;
  const lutSize = colorLUT.length;
  const invDivisor = 1 / divisor;

  for (let dy = 0; dy < configAlias; dy++) {
    const row = startY + dy;
    for (let dx = 0; dx < configAlias; dx++) {
      const col = startX + dx;
      const hitVal = hits[col * iteratorSize + row] || 0;

      if (hitVal === 0) {
        totalR += bgColor.r;
        totalG += bgColor.g;
        totalB += bgColor.b;
        continue;
      }

      const linearIndex = Math.min(lutSize - 1, Math.floor(Math.min(1, hitVal * invDivisor) * lutSize));
      const lutIndex = gammaLUT ? gammaLUT[linearIndex] : linearIndex;
      const color = colorLUT[lutIndex];
      totalR += color & 0xff;
      totalG += (color >> 8) & 0xff;
      totalB += (color >> 16) & 0xff;
    }
  }

  const aliasSq = configAlias * configAlias;
  const r = Math.round(totalR / aliasSq);
  const g = Math.round(totalG / aliasSq);
  const b = Math.round(totalB / aliasSq);
  return (255 << 24) | (b << 16) | (g << 8) | r;
}

function render() {
  if (!ctx || !iterCanvas || !colorLUT) return;
  const size = canvasSize;
  const hits = iterCanvas.getHits();
  const maxHits = iterCanvas.getMaxHits();
  const iteratorSize = iterCanvas.iterator_size;

  if (maxHits === 0) {
    ctx.fillStyle = `rgb(${bgColor.r}, ${bgColor.g}, ${bgColor.b})`;
    ctx.fillRect(0, 0, size, size);
    return;
  }

  const { imageData, data32 } = getImageData(size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = y * size + x;
      data32[idx] = getColorRGB(x, y, hits, maxHits, iteratorSize);
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

function sendHits() {
  if (!iterCanvas) return;
  
  if (sharedHitsArray && sharedHitsArray === iterCanvas.getHits()) {
     self.postMessage({ 
        type: "result_shared", 
        payload: { maxHits: iterCanvas.getMaxHits(), iteratorSize: iterCanvas.iterator_size } 
     });
     return;
  }

  const hitsCopy = new Uint32Array(iterCanvas.getHits());
  self.postMessage(
    { type: "result", payload: { hits: hitsCopy, maxHits: iterCanvas.getMaxHits(), iteratorSize: iterCanvas.iterator_size } },
    [hitsCopy.buffer]
  );
}

// ============================================
// MESSAGE HANDLER
// ============================================

self.onmessage = (event) => {
  const { type, payload } = event.data;

  if (type === "initialize") {
    const { point, size, alias, scale, iterator, palette, colorLUTSize: lutSize, useSharedBuffer } = payload;
    if (payload.palGamma !== undefined) palGamma = payload.palGamma;
    if (payload.palScale !== undefined) palScale = payload.palScale;
    if (payload.palMax !== undefined) palMax = payload.palMax;
    if (payload.bgColor !== undefined) bgColor = payload.bgColor;

    const fractalTypes = ["mandelbrot", "julia", "burningship", "tricorn", "multibrot", "newton", "phoenix", "lyapunov"];
    fractalMode = fractalTypes.includes(iterator.name);

    if (payload.mode === "offscreen" && payload.canvas) {
      mode = "offscreen";
      offscreenCanvas = payload.canvas;
      ctx = offscreenCanvas.getContext("2d", { alpha: false });
      canvasSize = size;
      configAlias = alias;
      if (palette && lutSize) {
        currentPalette = palette;
        buildColorLUT(palette, lutSize);
      }
    } else {
      mode = "legacy";
      if (palette) currentPalette = palette;
    }

    if (fractalMode) {
      fractalParams = { type: iterator.name, ...iterator.parameters };
      if (iterator.sequence) fractalParams.sequence = iterator.sequence;
      iterCanvas = null;
      console.log("Worker: Initialized Fractal Mode", fractalParams.type);
      if (mode === "offscreen") renderFractalProgressive();
    } else {
      // SOLID REFACTOR: Use dynamic iterator if math string provided
      if (iterator.math) {
        console.log("Worker: Creating DynamicIterator with math length:", iterator.math.length);
        it = new DynamicIterator(iterator.math, iterator.parameters);
      } else {
        console.warn("Worker: No math string provided for attractor!");
      }
      
      iterCanvas = new IterationCanvas(point, size, alias, scale, it, useSharedBuffer);
      console.log("Worker: Initialized Attractor Mode. Iterator size:", iterCanvas.iterator_size);
      
      if (mode === "offscreen") {
        render();
        self.postMessage({ type: "stats", payload: { maxHits: iterCanvas.getMaxHits(), totalIterations: iterCanvas.getTotalIterations() } });
      } else {
        if (iterCanvas.isShared) {
           self.postMessage({ type: "init_shared", payload: { buffer: iterCanvas.getHits().buffer } });
        }
        sendHits();
      }
    }
  } else if (type === "iterate") {
    if (fractalMode) {
      if (mode === "offscreen") {
        renderFractal();
        self.postMessage({ type: "stats", payload: { maxHits: 0, totalIterations: 0, fractalComplete: true } });
      }
      return;
    }
    if (!iterCanvas) return;
    iterCanvas.iterate();
    if (mode === "offscreen") {
      render();
      self.postMessage({ type: "stats", payload: { maxHits: iterCanvas.getMaxHits(), totalIterations: iterCanvas.getTotalIterations() } });
    } else {
      sendHits();
    }
  } else if (type === "updatePalette") {
    const { palette, colorLUTSize: lutSize } = payload;
    if (palette && lutSize) {
      currentPalette = palette;
      buildColorLUT(palette, lutSize);
      if (mode === "offscreen" && progressiveTimeoutId === null) {
        if (fractalMode) {
          renderFractal();
          self.postMessage({ type: "stats", payload: { maxHits: 0, totalIterations: 0, fractalComplete: true } });
        } else {
          render();
          self.postMessage({ type: "stats", payload: { maxHits: iterCanvas ? iterCanvas.getMaxHits() : 0, totalIterations: iterCanvas ? iterCanvas.getTotalIterations() : 0 } });
        }
      }
    }
  } else if (type === "updatePaletteSettings") {
    if (payload.palGamma !== undefined) palGamma = payload.palGamma;
    if (payload.palScale !== undefined) palScale = payload.palScale;
    if (payload.palMax !== undefined) palMax = payload.palMax;
    if (payload.bgColor !== undefined) bgColor = payload.bgColor;
    buildGammaLUT();
    if (mode === "offscreen" && progressiveTimeoutId === null) {
      if (fractalMode) {
        renderFractal();
        self.postMessage({ type: "stats", payload: { maxHits: 0, totalIterations: 0, fractalComplete: true } });
      } else {
        render();
        self.postMessage({ type: "stats", payload: { maxHits: iterCanvas ? iterCanvas.getMaxHits() : 0, totalIterations: iterCanvas ? iterCanvas.getTotalIterations() : 0 } });
      }
    }
  } else if (type === "exportImage") {
    if (mode === "offscreen" && offscreenCanvas) {
      offscreenCanvas.convertToBlob({ type: "image/png" }).then((blob) => {
        self.postMessage({ type: "imageExport", payload: { blob } });
      });
    }
  }
};

// ============================================
// FRACTAL RENDERING (Escape-Time Algorithm)
// ============================================

function renderMandelbrot() {
  if (!ctx || !colorLUT) return;
  const size = canvasSize;
  const { centerX, centerY, zoom, maxIter } = fractalParams;
  const alias = configAlias;
  const range = 3.0 / zoom;
  const xMin = centerX - range / 2;
  const yMin = centerY - range / 2;
  const pixelSize = range / size;
  const { imageData, data32 } = getImageData(size);
  const lutSize = colorLUT.length;
  const aliasSq = alias * alias;

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let totalR = 0, totalG = 0, totalB = 0;
      for (let sy = 0; sy < alias; sy++) {
        for (let sx = 0; sx < alias; sx++) {
          const x0 = xMin + (px + (sx + 0.5) / alias) * pixelSize;
          const y0 = yMin + (py + (sy + 0.5) / alias) * pixelSize;
          const y0sq = y0 * y0;
          const x_minus_quarter = x0 - 0.25;
          const q = x_minus_quarter * x_minus_quarter + y0sq;
          if (q * (q + x_minus_quarter) <= 0.25 * y0sq || (x0 + 1) * (x0 + 1) + y0sq <= 0.0625) {
            totalR += bgColor.r; totalG += bgColor.g; totalB += bgColor.b;
            continue;
          }
          let x = 0, y = 0, iter = 0, x2 = 0, y2 = 0;
          while (x2 + y2 <= 4 && iter < maxIter) {
            y = 2 * x * y + y0;
            x = x2 - y2 + x0;
            x2 = x * x;
            y2 = y * y;
            iter++;
          }
          if (iter === maxIter) {
            totalR += bgColor.r; totalG += bgColor.g; totalB += bgColor.b;
          } else {
            const log_zn = Math.log(x2 + y2) / 2;
            const nu = Math.log(log_zn / Math.LN2) / Math.LN2;
            const smoothIter = iter + 1 - nu;
            let ratio = Math.min(1, Math.max(0, smoothIter / maxIter));
            const color = colorLUT[gammaLUT[Math.min(lutSize - 1, Math.floor(ratio * lutSize))]];
            totalR += color & 0xff; totalG += (color >> 8) & 0xff; totalB += (color >> 16) & 0xff;
          }
        }
      }
      const avgR = Math.round(totalR / aliasSq);
      const avgG = Math.round(totalG / aliasSq);
      const avgB = Math.round(totalB / aliasSq);
      data32[py * size + px] = (255 << 24) | (avgB << 16) | (avgG << 8) | avgR;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

function renderJulia() {
  if (!ctx || !colorLUT) return;
  const size = canvasSize;
  const { cReal, cImag, centerX, centerY, zoom, maxIter } = fractalParams;
  const alias = configAlias;
  const range = 3.0 / zoom;
  const xMin = centerX - range / 2;
  const yMin = centerY - range / 2;
  const pixelSize = range / size;
  const { imageData, data32 } = getImageData(size);
  const lutSize = colorLUT.length;
  const aliasSq = alias * alias;

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let totalR = 0, totalG = 0, totalB = 0;
      for (let sy = 0; sy < alias; sy++) {
        for (let sx = 0; sx < alias; sx++) {
          let x = xMin + (px + (sx + 0.5) / alias) * pixelSize;
          let y = yMin + (py + (sy + 0.5) / alias) * pixelSize;
          let iter = 0, x2 = x * x, y2 = y * y;
          while (x2 + y2 <= 4 && iter < maxIter) {
            y = 2 * x * y + cImag;
            x = x2 - y2 + cReal;
            x2 = x * x; y2 = y * y;
            iter++;
          }
          if (iter === maxIter) {
            totalR += bgColor.r; totalG += bgColor.g; totalB += bgColor.b;
          } else {
            const log_zn = Math.log(x2 + y2) / 2;
            const nu = Math.log(log_zn / Math.LN2) / Math.LN2;
            const smoothIter = iter + 1 - nu;
            let ratio = Math.min(1, Math.max(0, smoothIter / maxIter));
            const color = colorLUT[gammaLUT[Math.min(lutSize - 1, Math.floor(ratio * lutSize))]];
            totalR += color & 0xff; totalG += (color >> 8) & 0xff; totalB += (color >> 16) & 0xff;
          }
        }
      }
      const avgR = Math.round(totalR / aliasSq);
      const avgG = Math.round(totalG / aliasSq);
      const avgB = Math.round(totalB / aliasSq);
      data32[py * size + px] = (255 << 24) | (avgB << 16) | (avgG << 8) | avgR;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

function renderBurningShip() {
  if (!ctx || !colorLUT) return;
  const size = canvasSize;
  const { centerX, centerY, zoom, maxIter } = fractalParams;
  const alias = configAlias;
  const range = 3.0 / zoom;
  const xMin = centerX - range / 2;
  const yMin = centerY - range / 2;
  const pixelSize = range / size;
  const { imageData, data32 } = getImageData(size);
  const lutSize = colorLUT.length;
  const aliasSq = alias * alias;

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let totalR = 0, totalG = 0, totalB = 0;
      for (let sy = 0; sy < alias; sy++) {
        for (let sx = 0; sx < alias; sx++) {
          const x0 = xMin + (px + (sx + 0.5) / alias) * pixelSize;
          const y0 = yMin + (py + (sy + 0.5) / alias) * pixelSize;
          let x = 0, y = 0, iter = 0, x2 = 0, y2 = 0;
          while (x2 + y2 <= 4 && iter < maxIter) {
            x = Math.abs(x); y = Math.abs(y);
            y = 2 * x * y + y0;
            x = x2 - y2 + x0;
            x2 = x * x; y2 = y * y;
            iter++;
          }
          if (iter === maxIter) {
            totalR += bgColor.r; totalG += bgColor.g; totalB += bgColor.b;
          } else {
            const log_zn = Math.log(x2 + y2) / 2;
            const nu = Math.log(log_zn / Math.LN2) / Math.LN2;
            const smoothIter = iter + 1 - nu;
            let ratio = Math.min(1, Math.max(0, smoothIter / maxIter));
            const color = colorLUT[gammaLUT[Math.min(lutSize - 1, Math.floor(ratio * lutSize))]];
            totalR += color & 0xff; totalG += (color >> 8) & 0xff; totalB += (color >> 16) & 0xff;
          }
        }
      }
      const avgR = Math.round(totalR / aliasSq);
      const avgG = Math.round(totalG / aliasSq);
      const avgB = Math.round(totalB / aliasSq);
      data32[py * size + px] = (255 << 24) | (avgB << 16) | (avgG << 8) | avgR;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

function renderTricorn() {
  if (!ctx || !colorLUT) return;
  const size = canvasSize;
  const { centerX, centerY, zoom, maxIter } = fractalParams;
  const alias = configAlias;
  const range = 3.0 / zoom;
  const xMin = centerX - range / 2;
  const yMin = centerY - range / 2;
  const pixelSize = range / size;
  const { imageData, data32 } = getImageData(size);
  const lutSize = colorLUT.length;
  const aliasSq = alias * alias;

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let totalR = 0, totalG = 0, totalB = 0;
      for (let sy = 0; sy < alias; sy++) {
        for (let sx = 0; sx < alias; sx++) {
          const x0 = xMin + (px + (sx + 0.5) / alias) * pixelSize;
          const y0 = yMin + (py + (sy + 0.5) / alias) * pixelSize;
          let x = 0, y = 0, iter = 0, x2 = 0, y2 = 0;
          while (x2 + y2 <= 4 && iter < maxIter) {
            y = -y;
            const newY = 2 * x * y + y0;
            x = x2 - y2 + x0;
            y = newY;
            x2 = x * x; y2 = y * y;
            iter++;
          }
          if (iter === maxIter) {
            totalR += bgColor.r; totalG += bgColor.g; totalB += bgColor.b;
          } else {
            const log_zn = Math.log(x2 + y2) / 2;
            const nu = Math.log(log_zn / Math.LN2) / Math.LN2;
            const smoothIter = iter + 1 - nu;
            let ratio = Math.min(1, Math.max(0, smoothIter / maxIter));
            const color = colorLUT[gammaLUT[Math.min(lutSize - 1, Math.floor(ratio * lutSize))]];
            totalR += color & 0xff; totalG += (color >> 8) & 0xff; totalB += (color >> 16) & 0xff;
          }
        }
      }
      const avgR = Math.round(totalR / aliasSq);
      const avgG = Math.round(totalG / aliasSq);
      const avgB = Math.round(totalB / aliasSq);
      data32[py * size + px] = (255 << 24) | (avgB << 16) | (avgG << 8) | avgR;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

function renderMultibrot() {
  if (!ctx || !colorLUT) return;
  const size = canvasSize;
  const { centerX, centerY, zoom, maxIter, power } = fractalParams;
  const alias = configAlias;
  const range = 3.0 / zoom;
  const xMin = centerX - range / 2;
  const yMin = centerY - range / 2;
  const pixelSize = range / size;
  const { imageData, data32 } = getImageData(size);
  const lutSize = colorLUT.length;
  const aliasSq = alias * alias;

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let totalR = 0, totalG = 0, totalB = 0;
      for (let sy = 0; sy < alias; sy++) {
        for (let sx = 0; sx < alias; sx++) {
          const x0 = xMin + (px + (sx + 0.5) / alias) * pixelSize;
          const y0 = yMin + (py + (sy + 0.5) / alias) * pixelSize;
          let x = 0, y = 0, iter = 0;
          while (x * x + y * y <= 4 && iter < maxIter) {
            const r = Math.sqrt(x * x + y * y);
            const theta = Math.atan2(y, x);
            const rn = Math.pow(r, power);
            x = rn * Math.cos(power * theta) + x0;
            y = rn * Math.sin(power * theta) + y0;
            iter++;
          }
          if (iter === maxIter) {
            totalR += bgColor.r; totalG += bgColor.g; totalB += bgColor.b;
          } else {
            const r2 = x * x + y * y;
            const log_zn = Math.log(r2) / 2;
            const nu = Math.log(log_zn / Math.log(power)) / Math.log(power);
            const smoothIter = iter + 1 - nu;
            let ratio = Math.min(1, Math.max(0, smoothIter / maxIter));
            const color = colorLUT[gammaLUT[Math.min(lutSize - 1, Math.floor(ratio * lutSize))]];
            totalR += color & 0xff; totalG += (color >> 8) & 0xff; totalB += (color >> 16) & 0xff;
          }
        }
      }
      const avgR = Math.round(totalR / aliasSq);
      const avgG = Math.round(totalG / aliasSq);
      const avgB = Math.round(totalB / aliasSq);
      data32[py * size + px] = (255 << 24) | (avgB << 16) | (avgG << 8) | avgR;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

function renderNewton() {
  if (!ctx || !colorLUT) return;
  const size = canvasSize;
  const { centerX, centerY, zoom, maxIter } = fractalParams;
  const alias = configAlias;
  const range = 3.0 / zoom;
  const xMin = centerX - range / 2;
  const yMin = centerY - range / 2;
  const pixelSize = range / size;
  const { imageData, data32 } = getImageData(size);
  const lutSize = colorLUT.length;
  const aliasSq = alias * alias;
  const roots = [{ x: 1, y: 0 }, { x: -0.5, y: 0.8660254 }, { x: -0.5, y: -0.8660254 }];
  const tolerance = 1e-6;

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let totalR = 0, totalG = 0, totalB = 0;
      for (let sy = 0; sy < alias; sy++) {
        for (let sx = 0; sx < alias; sx++) {
          let x = xMin + (px + (sx + 0.5) / alias) * pixelSize;
          let y = yMin + (py + (sy + 0.5) / alias) * pixelSize;
          let iter = 0, rootIndex = -1;
          for (iter = 0; iter < maxIter; iter++) {
            const x2 = x * x, y2 = y * y, r2 = x2 + y2;
            if (r2 < 1e-10) break;
            const zx2 = x2 - y2, zy2 = 2 * x * y;
            const zx3 = x * zx2 - y * zy2, zy3 = x * zy2 + y * zx2;
            const denom_x = 3 * zx2, denom_y = 3 * zy2;
            const denom_r2 = denom_x * denom_x + denom_y * denom_y;
            if (denom_r2 < 1e-10) break;
            const num_x = 2 * zx3 + 1, num_y = 2 * zy3;
            x = (num_x * denom_x + num_y * denom_y) / denom_r2;
            y = (num_y * denom_x - num_x * denom_y) / denom_r2;
            for (let r = 0; r < 3; r++) {
              const dx = x - roots[r].x, dy = y - roots[r].y;
              if (dx * dx + dy * dy < tolerance) { rootIndex = r; break; }
            }
            if (rootIndex >= 0) break;
          }
          if (rootIndex >= 0) {
            const brightness = 1 - iter / maxIter;
            let ratio = Math.min(1, Math.max(0, (rootIndex / 3 + brightness * 0.3) % 1));
            const color = colorLUT[gammaLUT[Math.min(lutSize - 1, Math.floor(ratio * lutSize))]];
            totalR += color & 0xff; totalG += (color >> 8) & 0xff; totalB += (color >> 16) & 0xff;
          } else {
            totalR += bgColor.r; totalG += bgColor.g; totalB += bgColor.b;
          }
        }
      }
      const avgR = Math.round(totalR / aliasSq);
      const avgG = Math.round(totalG / aliasSq);
      const avgB = Math.round(totalB / aliasSq);
      data32[py * size + px] = (255 << 24) | (avgB << 16) | (avgG << 8) | avgR;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

function renderPhoenix() {
  if (!ctx || !colorLUT) return;
  const size = canvasSize;
  const { centerX, centerY, zoom, maxIter, cReal, cImag, p } = fractalParams;
  const alias = configAlias;
  const range = 3.0 / zoom;
  const xMin = centerX - range / 2;
  const yMin = centerY - range / 2;
  const pixelSize = range / size;
  const { imageData, data32 } = getImageData(size);
  const lutSize = colorLUT.length;
  const aliasSq = alias * alias;

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let totalR = 0, totalG = 0, totalB = 0;
      for (let sy = 0; sy < alias; sy++) {
        for (let sx = 0; sx < alias; sx++) {
          const x0 = xMin + (px + (sx + 0.5) / alias) * pixelSize;
          const y0 = yMin + (py + (sy + 0.5) / alias) * pixelSize;
          let x = x0, y = y0, prevX = 0, prevY = 0, iter = 0;
          while (x * x + y * y <= 4 && iter < maxIter) {
            const x2 = x * x, y2 = y * y;
            const newX = x2 - y2 + cReal + p * prevX;
            const newY = 2 * x * y + cImag + p * prevY;
            prevX = x; prevY = y;
            x = newX; y = newY;
            iter++;
          }
          if (iter === maxIter) {
            totalR += bgColor.r; totalG += bgColor.g; totalB += bgColor.b;
          } else {
            const r2 = x * x + y * y;
            const log_zn = Math.log(r2) / 2;
            const nu = Math.log(log_zn / Math.LN2) / Math.LN2;
            const smoothIter = iter + 1 - nu;
            let ratio = Math.min(1, Math.max(0, smoothIter / maxIter));
            const color = colorLUT[gammaLUT[Math.min(lutSize - 1, Math.floor(ratio * lutSize))]];
            totalR += color & 0xff; totalG += (color >> 8) & 0xff; totalB += (color >> 16) & 0xff;
          }
        }
      }
      const avgR = Math.round(totalR / aliasSq);
      const avgG = Math.round(totalG / aliasSq);
      const avgB = Math.round(totalB / aliasSq);
      data32[py * size + px] = (255 << 24) | (avgB << 16) | (avgG << 8) | avgR;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

function renderLyapunov() {
  if (!ctx || !colorLUT) return;
  const size = canvasSize;
  const { aMin, aMax, bMin, bMax, maxIter, sequence } = fractalParams;
  const alias = configAlias;
  const { imageData, data32 } = getImageData(size);
  const lutSize = colorLUT.length;
  const aliasSq = alias * alias;
  const seqLen = sequence.length;
  const aRange = aMax - aMin;
  const bRange = bMax - bMin;

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let totalR = 0, totalG = 0, totalB = 0;
      for (let sy = 0; sy < alias; sy++) {
        for (let sx = 0; sx < alias; sx++) {
          const a = aMin + ((px + (sx + 0.5) / alias) / size) * aRange;
          const b = bMin + ((py + (sy + 0.5) / alias) / size) * bRange;
          let x = 0.5, lyapunov = 0;
          for (let n = 0; n < maxIter; n++) {
            const r = sequence[n % seqLen] === 'A' ? a : b;
            x = r * x * (1 - x);
            const deriv = Math.abs(r * (1 - 2 * x));
            if (deriv > 0) lyapunov += Math.log(deriv);
          }
          lyapunov /= maxIter;
          if (isNaN(lyapunov) || !isFinite(lyapunov)) {
            totalR += bgColor.r; totalG += bgColor.g; totalB += bgColor.b;
          } else {
            let ratio = lyapunov < 0 ? Math.min(1, -lyapunov / 2) : 0;
            const color = colorLUT[gammaLUT[Math.min(lutSize - 1, Math.floor(ratio * lutSize))]];
            totalR += color & 0xff; totalG += (color >> 8) & 0xff; totalB += (color >> 16) & 0xff;
          }
        }
      }
      const avgR = Math.round(totalR / aliasSq);
      const avgG = Math.round(totalG / aliasSq);
      const avgB = Math.round(totalB / aliasSq);
      data32[py * size + px] = (255 << 24) | (avgB << 16) | (avgG << 8) | avgR;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

function renderFractalProgressive() {
  if (!fractalParams || !ctx) return;
  const fullSize = canvasSize;
  const fullAlias = configAlias;
  const previewSize = Math.max(1, Math.floor(fullSize / 4));
  const previewCanvas = new OffscreenCanvas(previewSize, previewSize);
  const previewCtx = previewCanvas.getContext("2d", { alpha: false });
  const savedCtx = ctx;
  canvasSize = previewSize;
  configAlias = 1;
  ctx = previewCtx;
  renderFractal();
  ctx = savedCtx;
  canvasSize = fullSize;
  configAlias = fullAlias;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "low";
  ctx.drawImage(previewCanvas, 0, 0, fullSize, fullSize);
  ctx.imageSmoothingEnabled = false;
  self.postMessage({ type: "stats", payload: { maxHits: 0, totalIterations: 0, fractalPreview: true } });
  progressiveTimeoutId = setTimeout(() => {
    progressiveTimeoutId = null;
    renderFractal();
    self.postMessage({ type: "stats", payload: { maxHits: 0, totalIterations: 0, fractalComplete: true } });
  }, 50);
}

function renderFractal() {
  if (!fractalParams) return;
  switch (fractalParams.type) {
    case "mandelbrot": renderMandelbrot(); break;
    case "julia": renderJulia(); break;
    case "burningship": renderBurningShip(); break;
    case "tricorn": renderTricorn(); break;
    case "multibrot": renderMultibrot(); break;
    case "newton": renderNewton(); break;
    case "phoenix": renderPhoenix(); break;
    case "lyapunov": renderLyapunov(); break;
  }
}

// ============================================
// ITERATION CANVAS
// ============================================

class IterationCanvas {
  constructor(initial_position, canvas_size, alias, scale, iterator, useSharedBuffer) {
    this.iterator_size = canvas_size * alias;
    this.maxHits = 0;
    this.totalIterations = 0;
    this.p = new Float64Array([initial_position.xpos, initial_position.ypos]);
    this.iterationPerRun = 4000000; 
    this.scale = scale;
    const totalSize = this.iterator_size * this.iterator_size;
    if (useSharedBuffer && typeof SharedArrayBuffer !== 'undefined') {
        this.hits = new Uint32Array(new SharedArrayBuffer(totalSize * 4));
        sharedHitsArray = this.hits;
        this.isShared = true;
    } else {
        this.hits = new Uint32Array(totalSize);
        this.isShared = false;
    }
    this.iterator = iterator;
  }

  iterate() {
    let it = this.iterationPerRun;
    const iterFn = this.iterator;
    const p = this.p;
    const scale = this.scale;
    const iSize = this.iterator_size;
    const offset = iSize / 2;
    const hits = this.hits;
    let max = this.maxHits;
    while (it > 0) {
      iterFn.iterate(p);
      const xp = Math.round(p[0] * scale * iSize + offset);
      const yp = Math.round(p[1] * scale * iSize + offset);
      if (xp >= 0 && xp < iSize && yp >= 0 && yp < iSize) {
        const idx = xp * iSize + yp;
        const hi = ++hits[idx];
        if (hi > max) max = hi;
      }
      it--;
    }
    this.maxHits = max;
    this.totalIterations += this.iterationPerRun;
  }

  getHits() { return this.hits; }
  getMaxHits() { return this.maxHits; }
  getTotalIterations() { return this.totalIterations; }
}
