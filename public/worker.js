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

// SharedArrayBuffer for zero-copy transfers (if supported)
let sharedHitsBuffer = null;
let sharedHitsArray = null;

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
  
  // If we are using SharedArrayBuffer, we don't need to copy, just notify
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
      ctx = offscreenCanvas.getContext("2d", { alpha: false }); // Optimize 2D context
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
      if (mode === "offscreen") renderFractalProgressive();
    } else {
      it = iteratorBuilder(iterator);
      iterCanvas = new IterationCanvas(point, size, alias, scale, it, useSharedBuffer);
      if (mode === "offscreen") {
        render();
        self.postMessage({ type: "stats", payload: { maxHits: iterCanvas.getMaxHits(), totalIterations: iterCanvas.getTotalIterations() } });
      } else {
        // Send initial buffer if shared
        if (iterCanvas.isShared) {
           self.postMessage({
              type: "init_shared",
              payload: { buffer: iterCanvas.getHits().buffer }
           });
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
  const bgColorPacked = (255 << 24) | (bgColor.b << 16) | (bgColor.g << 8) | bgColor.r;

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let totalR = 0, totalG = 0, totalB = 0;

      for (let sy = 0; sy < alias; sy++) {
        for (let sx = 0; sx < alias; sx++) {
          const x0 = xMin + (px + (sx + 0.5) / alias) * pixelSize;
          const y0 = yMin + (py + (sy + 0.5) / alias) * pixelSize;

          // OPTIMIZATION: Cardioid and Period-2 Bulb checking
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
            const linearIndex = Math.min(lutSize - 1, Math.floor(ratio * lutSize));
            const lutIndex = gammaLUT ? gammaLUT[linearIndex] : linearIndex;
            const color = colorLUT[lutIndex];
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
          let iter = 0;
          let x2 = x * x, y2 = y * y;

          while (x2 + y2 <= 4 && iter < maxIter) {
            y = 2 * x * y + cImag;
            x = x2 - y2 + cReal;
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
            const linearIndex = Math.min(lutSize - 1, Math.floor(ratio * lutSize));
            const lutIndex = gammaLUT ? gammaLUT[linearIndex] : linearIndex;
            const color = colorLUT[lutIndex];
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
            x = Math.abs(x);
            y = Math.abs(y);
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
            const linearIndex = Math.min(lutSize - 1, Math.floor(ratio * lutSize));
            const lutIndex = gammaLUT ? gammaLUT[linearIndex] : linearIndex;
            const color = colorLUT[lutIndex];
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
            const linearIndex = Math.min(lutSize - 1, Math.floor(ratio * lutSize));
            const lutIndex = gammaLUT ? gammaLUT[linearIndex] : linearIndex;
            const color = colorLUT[lutIndex];
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
            const linearIndex = Math.min(lutSize - 1, Math.floor(ratio * lutSize));
            const lutIndex = gammaLUT ? gammaLUT[linearIndex] : linearIndex;
            const color = colorLUT[lutIndex];
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

  const roots = [
    { x: 1, y: 0 },
    { x: -0.5, y: Math.sqrt(3) / 2 },
    { x: -0.5, y: -Math.sqrt(3) / 2 }
  ];
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
            const x2 = x * x, y2 = y * y;
            const r2 = x2 + y2;
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
              if (dx * dx + dy * dy < tolerance) {
                rootIndex = r;
                break;
              }
            }
            if (rootIndex >= 0) break;
          }

          if (rootIndex >= 0) {
            const brightness = 1 - iter / maxIter;
            let ratio = Math.min(1, Math.max(0, (rootIndex / 3 + brightness * 0.3) % 1));
            const linearIndex = Math.min(lutSize - 1, Math.floor(ratio * lutSize));
            const lutIndex = gammaLUT ? gammaLUT[linearIndex] : linearIndex;
            const color = colorLUT[lutIndex];
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
            const linearIndex = Math.min(lutSize - 1, Math.floor(ratio * lutSize));
            const lutIndex = gammaLUT ? gammaLUT[linearIndex] : linearIndex;
            const color = colorLUT[lutIndex];
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
            ratio = Math.min(1, Math.max(0, ratio));
            const linearIndex = Math.min(lutSize - 1, Math.floor(ratio * lutSize));
            const lutIndex = gammaLUT ? gammaLUT[linearIndex] : linearIndex;
            const color = colorLUT[lutIndex];
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
// ZERO-ALLOCATION ITERATORS (Highly Optimized)
// ============================================
// These iterators update a Float64Array in place instead of creating objects

class SymmetricIconIterator {
  constructor(alpha, betha, gamma, delta, omega, lambda, degree, npdegree) {
    this.alpha = alpha; this.betha = betha; this.gamma = gamma; this.delta = delta;
    this.omega = omega; this.lambda = lambda; this.degree = degree; this.npdegree = npdegree;
  }
  iterate(p) {
    const xpos = p[0], ypos = p[1];
    const zzbar = xpos * xpos + ypos * ypos;
    let zz, zc = 0, zd = 0, zreal, zimag, za, zb, zn;

    if (this.delta !== 0) {
      zz = Math.sqrt(zzbar);
      zc = 1; zd = 0;
      zreal = xpos / zz; zimag = ypos / zz;
      for (let j = 0; j < this.npdegree * this.degree; j++) {
        za = zc * zreal - zd * zimag;
        zb = zd * zreal + zc * zimag;
        zc = za; zd = zb;
      }
    } else {
      zz = 0;
    }

    zreal = xpos; zimag = ypos;
    for (let i = 0; i < this.degree - 2; i++) {
      za = zreal * xpos - zimag * ypos;
      zb = zimag * xpos + zreal * ypos;
      zreal = za; zimag = zb;
    }

    zn = xpos * zreal - ypos * zimag;
    const factor = this.lambda + this.alpha * zzbar + this.betha * zn + this.delta * zz * zc;
    
    p[0] = factor * xpos + this.gamma * zreal - this.omega * ypos;
    p[1] = factor * ypos - this.gamma * zimag + this.omega * xpos;
  }
}

class CliffordIterator {
  constructor(alpha, beta, gamma, delta) {
    this.alpha = alpha; this.beta = beta; this.gamma = gamma; this.delta = delta;
  }
  iterate(p) {
    const x = p[0], y = p[1];
    p[0] = Math.sin(this.alpha * y) + this.gamma * Math.cos(this.alpha * x);
    p[1] = Math.sin(this.beta * x) + this.delta * Math.cos(this.beta * y);
  }
}

class DeJongIterator {
  constructor(alpha, beta, gamma, delta) {
    this.alpha = alpha; this.beta = beta; this.gamma = gamma; this.delta = delta;
  }
  iterate(p) {
    const x = p[0], y = p[1];
    p[0] = Math.sin(this.alpha * y) - Math.cos(this.beta * x);
    p[1] = Math.sin(this.gamma * x) - Math.cos(this.delta * y);
  }
}

class JasonRampe1Iterator {
  constructor(alpha, beta, gamma, delta) {
    this.alpha = alpha; this.beta = beta; this.gamma = gamma; this.delta = delta;
  }
  iterate(p) {
    const x = p[0], y = p[1];
    p[0] = Math.cos(y * this.beta) + this.gamma * Math.sin(x * this.beta);
    p[1] = Math.cos(x * this.alpha) + this.delta * Math.sin(y * this.alpha);
  }
}

class JasonRampe2Iterator {
  constructor(alpha, beta, gamma, delta) {
    this.alpha = alpha; this.beta = beta; this.gamma = gamma; this.delta = delta;
  }
  iterate(p) {
    const x = p[0], y = p[1];
    p[0] = Math.cos(y * this.beta) + this.gamma * Math.cos(x * this.beta);
    p[1] = Math.cos(x * this.alpha) + this.delta * Math.cos(y * this.alpha);
  }
}

class JasonRampe3Iterator {
  constructor(alpha, beta, gamma, delta) {
    this.alpha = alpha; this.beta = beta; this.gamma = gamma; this.delta = delta;
  }
  iterate(p) {
    const x = p[0], y = p[1];
    p[0] = Math.sin(y * this.beta) + this.gamma * Math.cos(x * this.beta);
    p[1] = Math.cos(x * this.alpha) + this.delta * Math.sin(y * this.alpha);
  }
}

class TinkerbellIterator {
  constructor(alpha, beta, gamma, delta) {
    this.alpha = alpha; this.beta = beta; this.gamma = gamma; this.delta = delta;
  }
  iterate(p) {
    const x = p[0], y = p[1];
    p[0] = x * x - y * y + this.alpha * x + this.beta * y;
    p[1] = 2 * x * y + this.gamma * x + this.delta * y;
  }
}

class HenonIterator {
  constructor(alpha, beta) {
    this.alpha = alpha; this.beta = beta;
  }
  iterate(p) {
    const x = p[0], y = p[1];
    p[0] = 1 - this.alpha * x * x + y;
    p[1] = this.beta * x;
  }
}

class BedheadIterator {
  constructor(alpha, beta) {
    this.alpha = alpha; this.beta = beta;
  }
  iterate(p) {
    const x = p[0], y = p[1];
    p[0] = Math.sin(x * y / this.beta) * y + Math.cos(this.alpha * x - y);
    p[1] = x + Math.sin(y) / this.beta;
  }
}

class SvenssonIterator {
  constructor(alpha, beta, gamma, delta) {
    this.alpha = alpha; this.beta = beta; this.gamma = gamma; this.delta = delta;
  }
  iterate(p) {
    const x = p[0], y = p[1];
    p[0] = this.delta * Math.sin(this.alpha * x) - Math.sin(this.beta * y);
    p[1] = this.gamma * Math.cos(this.alpha * x) + Math.cos(this.beta * y);
  }
}

class FractalDreamIterator {
  constructor(alpha, beta, gamma, delta) {
    this.alpha = alpha; this.beta = beta; this.gamma = gamma; this.delta = delta;
  }
  iterate(p) {
    const x = p[0], y = p[1];
    p[0] = Math.sin(y * this.beta) + this.gamma * Math.sin(x * this.beta);
    p[1] = Math.sin(x * this.alpha) + this.delta * Math.sin(y * this.alpha);
  }
}

class HopalongIterator {
  constructor(alpha, beta, gamma) {
    this.alpha = alpha; this.beta = beta; this.gamma = gamma;
  }
  iterate(p) {
    const x = p[0], y = p[1];
    const sign = x >= 0 ? 1 : -1;
    p[0] = y - sign * Math.sqrt(Math.abs(this.beta * x - this.gamma));
    p[1] = this.alpha - x;
  }
}

class GumowskiMiraIterator {
  constructor(mu, alpha, sigma) {
    this.mu = mu; this.alpha = alpha; this.sigma = sigma;
  }
  f(x) {
    return this.mu * x + (2 * (1 - this.mu) * x * x) / (1 + x * x);
  }
  iterate(p) {
    const x = p[0], y = p[1];
    const fx = this.f(x);
    const nx = y + this.alpha * (1 - this.sigma * y * y) * y + fx;
    p[0] = nx;
    p[1] = -x + this.f(nx);
  }
}

class SprottIterator {
  constructor(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) {
    this.a = new Float64Array([a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12]);
  }
  iterate(p) {
    const x = p[0], y = p[1], a = this.a;
    p[0] = a[0] + a[1]*x + a[2]*x*x + a[3]*x*y + a[4]*y + a[5]*y*y;
    p[1] = a[6] + a[7]*x + a[8]*x*x + a[9]*x*y + a[10]*y + a[11]*y*y;
  }
}

class SymmetricFractalIterator {
  constructor(a, b, c, d, alpha, beta, p, reflect) {
    this.a = a; this.b = b; this.c = c; this.d = d;
    this.alpha = alpha; this.beta = beta;
    this.p = p; this.reflect = reflect;
    this.angles = new Float64Array(p);
    for (let i = 0; i < p; i++) this.angles[i] = 2 * Math.PI * i / p;
  }
  iterate(p) {
    const x = p[0], y = p[1];
    let nx = this.a * x + this.b * y + this.alpha;
    let ny = this.c * x + this.d * y + this.beta;
    const angle = this.angles[Math.floor(Math.random() * this.p)];
    const cos = Math.cos(angle), sin = Math.sin(angle);
    let rx = nx * cos - ny * sin;
    let ry = nx * sin + ny * cos;
    if (this.reflect && Math.random() < 0.5) rx = -rx;
    p[0] = rx; p[1] = ry;
  }
}

class DeRhamIterator {
  constructor(alpha, beta, curveType) {
    this.a = alpha; this.b = beta; this.curveType = curveType;
  }
  iterate(p) {
    const x = p[0], y = p[1], a = this.a, b = this.b;
    const choice = Math.random() < 0.5 ? 0 : 1;

    if (this.curveType === "cesaro") {
      if (choice === 0) {
        p[0] = a * x - b * y; p[1] = a * y + b * x;
      } else {
        const ra = 1 - a, rb = -b;
        p[0] = a + ra * x - rb * y; p[1] = b + ra * y + rb * x;
      }
    } else if (this.curveType === "koch") {
      if (choice === 0) {
        p[0] = a * x + b * y; p[1] = -a * y + b * x;
      } else {
        const ra = 1 - a, rb = -b;
        p[0] = a + ra * x + rb * y; p[1] = b - ra * y + rb * x;
      }
    } else {
      if (choice === 0) {
        p[0] = a * x - b * y; p[1] = b * x + a * y;
      } else {
        p[0] = a + (1-a) * x + b * y; p[1] = b + -b * x + (1-a) * y;
      }
    }
  }
}

class ConradiIterator {
  constructor(r1, theta1, r2, theta2, a, n, variant) {
    this.a = a; this.n = n; this.variant = variant;
    this.c1r = r1 * Math.cos(theta1 * Math.PI);
    this.c1i = r1 * Math.sin(theta1 * Math.PI);
    this.c2r = r2 * Math.cos(theta2 * Math.PI);
    this.c2i = r2 * Math.sin(theta2 * Math.PI);
    this.angles = new Float64Array(n);
    for (let i = 0; i < n; i++) this.angles[i] = 2 * Math.PI * i / n;
  }
  iterate(p) {
    const x = p[0], y = p[1];
    let zr, zi;
    if (this.variant === 1) {
      const denom = x*x + y*y + 0.0001;
      const invr = x / denom, invi = -y / denom;
      zr = (this.c1r * invr - this.c1i * invi) + (this.c2r * x + this.c2i * y) + this.a;
      zi = (this.c1r * invi + this.c1i * invr) + (this.c2r * y - this.c2i * x);
    } else {
      const denom = x*x + y*y + 0.0001;
      const dr = (this.c1r * x - this.c1i * y) + (this.c2r * x + this.c2i * y) / denom + this.a;
      const di = (this.c1r * y + this.c1i * x) + (this.c2r * y - this.c2i * x) / denom;
      const d2 = dr*dr + di*di + 0.0001;
      zr = dr / d2; zi = -di / d2;
    }
    const angle = this.angles[Math.floor(Math.random() * this.n)];
    const cos = Math.cos(angle), sin = Math.sin(angle);
    p[0] = zr * cos - zi * sin; p[1] = zr * sin + zi * cos;
  }
}

class MobiusIterator {
  constructor(aRe, aIm, bRe, bIm, cRe, cIm, dRe, dIm, n) {
    this.ar = aRe; this.ai = aIm; this.br = bRe; this.bi = bIm;
    this.cr = cRe; this.ci = cIm; this.dr = dRe; this.di = dIm;
    this.n = n;
    this.angles = new Float64Array(n);
    for (let i = 0; i < n; i++) this.angles[i] = 2 * Math.PI * i / n;
  }
  iterate(p) {
    const x = p[0], y = p[1];
    const numr = this.ar * x - this.ai * y + this.br;
    const numi = this.ar * y + this.ai * x + this.bi;
    const denr = this.cr * x - this.ci * y + this.dr;
    const deni = this.cr * y + this.ci * x + this.di;
    const d2 = denr*denr + deni*deni + 0.0001;
    const zr = (numr * denr + numi * deni) / d2;
    const zi = (numi * denr - numr * deni) / d2;
    const angle = this.angles[Math.floor(Math.random() * this.n)];
    const cos = Math.cos(angle), sin = Math.sin(angle);
    p[0] = zr * cos - zi * sin; p[1] = zr * sin + zi * cos;
  }
}

class SymmetricQuiltIterator {
  constructor(lambda, alpha, beta, gamma, omega, m, shift) {
    this.lambda = lambda; this.alpha = alpha; this.beta = beta;
    this.gamma = gamma; this.omega = omega; this.m = m; this.shift = shift;
    this.PI2 = Math.PI * 2; this.PI4 = Math.PI * 4; this.PI6 = Math.PI * 6;
  }
  iterate(p) {
    let x = p[0] + 0.5, y = p[1] + 0.5;
    x = x - Math.floor(x); y = y - Math.floor(y);
    const sin2pix = Math.sin(this.PI2 * x), sin2piy = Math.sin(this.PI2 * y);
    const cos2pix = Math.cos(this.PI2 * x), cos2piy = Math.cos(this.PI2 * y);
    
    let nx = this.m * x + this.shift + this.lambda * sin2pix - this.omega * sin2piy + 
             this.alpha * sin2pix * cos2piy + this.beta * Math.sin(this.PI4 * x) + 
             this.gamma * Math.sin(this.PI6 * x) * Math.cos(this.PI4 * y);
             
    let ny = this.m * y + this.shift + this.lambda * sin2piy - this.omega * sin2pix + 
             this.alpha * sin2piy * cos2pix + this.beta * Math.sin(this.PI4 * y) + 
             this.gamma * Math.sin(this.PI6 * y) * Math.cos(this.PI4 * x);

    nx = nx - Math.floor(nx); ny = ny - Math.floor(ny);
    p[0] = nx - 0.5; p[1] = ny - 0.5;
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
    
    // Use highly optimized Float64Array for coordinates to avoid GC pressure
    this.p = new Float64Array([initial_position.xpos, initial_position.ypos]);
    this.iterationPerRun = 4000000; // Increased chunk size since it's faster now
    this.scale = scale;

    const totalSize = this.iterator_size * this.iterator_size;
    
    // Use SharedArrayBuffer if supported and requested, otherwise standard buffer
    if (useSharedBuffer && typeof SharedArrayBuffer !== 'undefined') {
        sharedHitsBuffer = new SharedArrayBuffer(totalSize * 4); // Uint32 requires 4 bytes per element
        this.hits = new Uint32Array(sharedHitsBuffer);
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

    // The ultra-hot loop
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

// ============================================
// ITERATOR BUILDER
// ============================================

function iteratorBuilder(iterator) {
  const { name, parameters } = iterator;
  switch (name) {
    case "symmetric_icon":
      return new SymmetricIconIterator(
        parameters.alpha, parameters.betha, parameters.gamma, parameters.delta,
        parameters.omega, parameters.lambda, parameters.degree, parameters.npdegree
      );
    case "clifford_iterator":
      return new CliffordIterator(parameters.alpha, parameters.beta, parameters.gamma, parameters.delta);
    case "dejong_iterator":
      return new DeJongIterator(parameters.alpha, parameters.beta, parameters.gamma, parameters.delta);
    case "jason_rampe1_iterator":
      return new JasonRampe1Iterator(parameters.alpha, parameters.beta, parameters.gamma, parameters.delta);
    case "jason_rampe2_iterator":
      return new JasonRampe2Iterator(parameters.alpha, parameters.beta, parameters.gamma, parameters.delta);
    case "jason_rampe3_iterator":
      return new JasonRampe3Iterator(parameters.alpha, parameters.beta, parameters.gamma, parameters.delta);
    case "tinkerbell_iterator":
      return new TinkerbellIterator(parameters.alpha, parameters.beta, parameters.gamma, parameters.delta);
    case "henon_iterator":
      return new HenonIterator(parameters.alpha, parameters.beta);
    case "bedhead_iterator":
      return new BedheadIterator(parameters.alpha, parameters.beta);
    case "svensson_iterator":
      return new SvenssonIterator(parameters.alpha, parameters.beta, parameters.gamma, parameters.delta);
    case "fractal_dream_iterator":
      return new FractalDreamIterator(parameters.alpha, parameters.beta, parameters.gamma, parameters.delta);
    case "hopalong_iterator":
      return new HopalongIterator(parameters.alpha, parameters.beta, parameters.gamma);
    case "gumowski_mira_iterator":
      return new GumowskiMiraIterator(parameters.mu, parameters.alpha, parameters.sigma);
    case "sprott_iterator":
      return new SprottIterator(
        parameters.a1, parameters.a2, parameters.a3, parameters.a4,
        parameters.a5, parameters.a6, parameters.a7, parameters.a8,
        parameters.a9, parameters.a10, parameters.a11, parameters.a12
      );
    case "symmetric_fractal_iterator":
      return new SymmetricFractalIterator(
        parameters.a, parameters.b, parameters.c, parameters.d,
        parameters.alpha, parameters.beta, parameters.p, parameters.reflect
      );
    case "derham_iterator":
      return new DeRhamIterator(parameters.alpha, parameters.beta, parameters.curveType);
    case "conradi_iterator":
      return new ConradiIterator(
        parameters.r1, parameters.theta1, parameters.r2, parameters.theta2,
        parameters.a, parameters.n, parameters.variant
      );
    case "mobius_iterator":
      return new MobiusIterator(
        parameters.aRe, parameters.aIm, parameters.bRe, parameters.bIm,
        parameters.cRe, parameters.cIm, parameters.dRe, parameters.dIm, parameters.n
      );
    case "symmetric_quilt":
      return new SymmetricQuiltIterator(
        parameters.lambda, parameters.alpha, parameters.beta, parameters.gamma,
        parameters.omega, parameters.m, parameters.shift
      );
  }
}
