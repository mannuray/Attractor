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
let currentPalette = null; // Store palette for final render interpolation
let canvasSize = 0;
let configAlias = 2;
let colorLUTSize = 2048;

// Palette gamma and max hits scaling
let palGamma = 1.0;       // Gamma correction for color distribution
let palScale = false;     // true = dynamic (use maxHits), false = fixed (use palMax)
let palMax = 10000;       // Fixed max value when palScale is false
let bgColor = { r: 255, g: 255, b: 255 }; // Background color for 0-hit pixels

// ============================================
// COLOR PALETTE MANAGEMENT
// ============================================

// Binary search for palette color index
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

// Interpolate color from palette
function interpolatePaletteColor(palette, position) {
  // Note: position 0 is now handled by the palette itself (first entry)
  // Background pixels (0 hits) are handled separately in getColorRGB
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

// Build color lookup table from palette
function buildColorLUT(palette, lutSize) {
  colorLUT = new Uint32Array(lutSize);
  colorLUTSize = lutSize;

  for (let i = 0; i < lutSize; i++) {
    const ratio = i / lutSize; // Map to palette range 0-1
    const col = interpolatePaletteColor(palette, ratio);
    // Pack RGBA into single 32-bit value (ABGR format for ImageData)
    colorLUT[i] = (255 << 24) | (col.blue << 16) | (col.green << 8) | col.red;
  }
}

// ============================================
// OFFSCREEN CANVAS RENDERING
// ============================================

// Get color for a pixel with anti-aliasing
function getColorRGB(x, y, hits, maxHits, iteratorSize) {
  // Return background color (ABGR format)
  const bgColorPacked = (255 << 24) | (bgColor.b << 16) | (bgColor.g << 8) | bgColor.r;

  if (!colorLUT) {
    return bgColorPacked;
  }

  // Determine the divisor based on scaling mode
  const divisor = palScale ? maxHits : palMax;
  if (divisor === 0) {
    return bgColorPacked;
  }

  let totalR = 0,
    totalG = 0,
    totalB = 0;
  const startX = x * configAlias;
  const startY = y * configAlias;
  const lutSize = colorLUT.length;
  const invDivisor = 1 / divisor;

  for (let dy = 0; dy < configAlias; dy++) {
    const row = startY + dy;
    for (let dx = 0; dx < configAlias; dx++) {
      const col = startX + dx;
      const hitVal = hits[col * iteratorSize + row] || 0;

      // Background (no hits) uses custom background color
      if (hitVal === 0) {
        totalR += bgColor.r;
        totalG += bgColor.g;
        totalB += bgColor.b;
        continue;
      }

      // Normalize hit value and apply gamma correction
      let c = Math.min(1, hitVal * invDivisor);
      if (palGamma !== 1.0) {
        c = Math.pow(c, palGamma);
      }

      const lutIndex = Math.min(lutSize - 1, Math.floor(c * lutSize));
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

// Render to OffscreenCanvas
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

  const imageData = ctx.createImageData(size, size);
  const data32 = new Uint32Array(imageData.data.buffer);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = y * size + x;
      data32[idx] = getColorRGB(x, y, hits, maxHits, iteratorSize);
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

// ============================================
// LEGACY MODE (for browsers without OffscreenCanvas)
// ============================================

function sendHits() {
  if (!iterCanvas) return;

  const hitsCopy = new Uint32Array(iterCanvas.getHits());
  const buffer = hitsCopy.buffer;

  self.postMessage(
    {
      type: "result",
      payload: {
        hits: hitsCopy,
        maxHits: iterCanvas.getMaxHits(),
        iteratorSize: iterCanvas.iterator_size,
      },
    },
    [buffer]
  );
}

// ============================================
// MESSAGE HANDLER
// ============================================

self.onmessage = (event) => {
  const { type, payload } = event.data;

  if (type === "initialize") {
    const { point, size, alias, scale, iterator, palette, colorLUTSize: lutSize } = payload;

    // Initialize palette settings
    if (payload.palGamma !== undefined) palGamma = payload.palGamma;
    if (payload.palScale !== undefined) palScale = payload.palScale;
    if (payload.palMax !== undefined) palMax = payload.palMax;
    if (payload.bgColor !== undefined) bgColor = payload.bgColor;

    // Check if this is a fractal type
    const fractalTypes = ["mandelbrot", "julia", "burningship", "tricorn", "multibrot", "newton", "phoenix", "lyapunov"];
    fractalMode = fractalTypes.includes(iterator.name);

    // Check for OffscreenCanvas mode
    if (payload.mode === "offscreen" && payload.canvas) {
      mode = "offscreen";
      offscreenCanvas = payload.canvas;
      ctx = offscreenCanvas.getContext("2d");
      canvasSize = size;
      configAlias = alias;

      // Build color LUT from palette and store palette for final render
      if (palette && lutSize) {
        currentPalette = palette;
        buildColorLUT(palette, lutSize);
      }
    } else {
      mode = "legacy";
      if (palette) {
        currentPalette = palette;
      }
    }

    if (fractalMode) {
      // Fractal mode: store parameters and render immediately
      fractalParams = {
        type: iterator.name,
        ...iterator.parameters,
      };
      // Handle Lyapunov sequence (string parameter)
      if (iterator.sequence) {
        fractalParams.sequence = iterator.sequence;
      }
      iterCanvas = null; // Not used for fractals

      if (mode === "offscreen") {
        renderFractal();
        self.postMessage({
          type: "stats",
          payload: { maxHits: 0, totalIterations: 0, fractalComplete: true },
        });
      }
    } else {
      // Attractor mode: initialize iterator and canvas
      it = iteratorBuilder(iterator);
      iterCanvas = new IterationCanvas(point, size, alias, scale, it);

      if (mode === "offscreen") {
        render();
        self.postMessage({
          type: "stats",
          payload: { maxHits: iterCanvas.getMaxHits(), totalIterations: iterCanvas.getTotalIterations() },
        });
      } else {
        sendHits();
      }
    }
  } else if (type === "iterate") {
    // Fractals don't iterate - they render once completely
    if (fractalMode) {
      // Just re-render the fractal (in case palette changed)
      if (mode === "offscreen") {
        renderFractal();
        self.postMessage({
          type: "stats",
          payload: { maxHits: 0, totalIterations: 0, fractalComplete: true },
        });
      }
      return;
    }

    if (!iterCanvas) return;

    iterCanvas.iterate();

    if (mode === "offscreen") {
      render();
      self.postMessage({
        type: "stats",
        payload: { maxHits: iterCanvas.getMaxHits(), totalIterations: iterCanvas.getTotalIterations() },
      });
    } else {
      sendHits();
    }
  } else if (type === "updatePalette") {
    // Update color LUT when palette changes
    const { palette, colorLUTSize: lutSize } = payload;
    if (palette && lutSize) {
      currentPalette = palette;
      buildColorLUT(palette, lutSize);

      if (mode === "offscreen") {
        if (fractalMode) {
          renderFractal();
          self.postMessage({
            type: "stats",
            payload: { maxHits: 0, totalIterations: 0, fractalComplete: true },
          });
        } else {
          render();
          self.postMessage({
            type: "stats",
            payload: { maxHits: iterCanvas ? iterCanvas.getMaxHits() : 0, totalIterations: iterCanvas ? iterCanvas.getTotalIterations() : 0 },
          });
        }
      }
    }
  } else if (type === "updatePaletteSettings") {
    // Update palette gamma and scaling settings
    if (payload.palGamma !== undefined) palGamma = payload.palGamma;
    if (payload.palScale !== undefined) palScale = payload.palScale;
    if (payload.palMax !== undefined) palMax = payload.palMax;
    if (payload.bgColor !== undefined) bgColor = payload.bgColor;

    if (mode === "offscreen") {
      if (fractalMode) {
        renderFractal();
        self.postMessage({
          type: "stats",
          payload: { maxHits: 0, totalIterations: 0, fractalComplete: true },
        });
      } else {
        render();
        self.postMessage({
          type: "stats",
          payload: { maxHits: iterCanvas ? iterCanvas.getMaxHits() : 0, totalIterations: iterCanvas ? iterCanvas.getTotalIterations() : 0 },
        });
      }
    }
  } else if (type === "exportImage") {
    // Export image as blob for save functionality
    if (mode === "offscreen" && offscreenCanvas) {
      offscreenCanvas.convertToBlob({ type: "image/png" }).then((blob) => {
        self.postMessage({
          type: "imageExport",
          payload: { blob },
        });
      });
    }
  } else if (type === "finalRender") {
    // High-quality final render using true interpolation (no LUT)
    if (mode === "offscreen" && ctx && iterCanvas && currentPalette) {
      renderFinal();
      self.postMessage({
        type: "finalRenderComplete",
        payload: { maxHits: iterCanvas.getMaxHits(), totalIterations: iterCanvas.getTotalIterations() },
      });
    }
  }
};

// ============================================
// FINAL HIGH-QUALITY RENDER (True Interpolation)
// ============================================

function renderFinal() {
  if (!ctx || !iterCanvas || !currentPalette) return;

  const size = canvasSize;
  const hits = iterCanvas.getHits();
  const maxHits = iterCanvas.getMaxHits();
  const iteratorSize = iterCanvas.iterator_size;

  if (maxHits === 0) {
    ctx.fillStyle = `rgb(${bgColor.r}, ${bgColor.g}, ${bgColor.b})`;
    ctx.fillRect(0, 0, size, size);
    return;
  }

  const imageData = ctx.createImageData(size, size);
  const data32 = new Uint32Array(imageData.data.buffer);

  // Determine the divisor based on scaling mode
  const divisor = palScale ? maxHits : palMax;
  const invDivisor = 1 / divisor;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = y * size + x;
      data32[idx] = getColorRGBInterpolated(x, y, hits, invDivisor, iteratorSize);
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

// Get color using true interpolation (no LUT) for final render
function getColorRGBInterpolated(x, y, hits, invDivisor, iteratorSize) {
  let totalR = 0, totalG = 0, totalB = 0;
  const startX = x * configAlias;
  const startY = y * configAlias;

  for (let dy = 0; dy < configAlias; dy++) {
    const row = startY + dy;
    for (let dx = 0; dx < configAlias; dx++) {
      const col = startX + dx;
      const hitVal = hits[col * iteratorSize + row] || 0;

      // Background (no hits) uses custom background color
      if (hitVal === 0) {
        totalR += bgColor.r;
        totalG += bgColor.g;
        totalB += bgColor.b;
        continue;
      }

      // Normalize and apply gamma - TRUE INTERPOLATION
      let ratio = Math.min(1, hitVal * invDivisor);
      if (palGamma !== 1.0) {
        ratio = Math.pow(ratio, palGamma);
      }

      // Direct palette interpolation (no LUT quantization)
      const color = interpolatePaletteColor(currentPalette, ratio);
      totalR += color.red;
      totalG += color.green;
      totalB += color.blue;
    }
  }

  const aliasSq = configAlias * configAlias;
  const r = Math.round(totalR / aliasSq);
  const g = Math.round(totalG / aliasSq);
  const b = Math.round(totalB / aliasSq);
  return (255 << 24) | (b << 16) | (g << 8) | r;
}

// ============================================
// FRACTAL RENDERING (Escape-Time Algorithm)
// ============================================

// Render Mandelbrot set
function renderMandelbrot() {
  if (!ctx || !colorLUT) return;

  const size = canvasSize;
  const { centerX, centerY, zoom, maxIter } = fractalParams;

  // Calculate view bounds
  const range = 3.0 / zoom; // Default view is about 3 units wide
  const xMin = centerX - range / 2;
  const yMin = centerY - range / 2;
  const pixelSize = range / size;

  const imageData = ctx.createImageData(size, size);
  const data32 = new Uint32Array(imageData.data.buffer);
  const lutSize = colorLUT.length;

  // Background color packed
  const bgColorPacked = (255 << 24) | (bgColor.b << 16) | (bgColor.g << 8) | bgColor.r;

  for (let py = 0; py < size; py++) {
    const y0 = yMin + py * pixelSize;
    for (let px = 0; px < size; px++) {
      const x0 = xMin + px * pixelSize;

      // Mandelbrot iteration: z = z² + c, where c = (x0, y0)
      let x = 0, y = 0;
      let iter = 0;
      let x2 = 0, y2 = 0;

      while (x2 + y2 <= 4 && iter < maxIter) {
        y = 2 * x * y + y0;
        x = x2 - y2 + x0;
        x2 = x * x;
        y2 = y * y;
        iter++;
      }

      const idx = py * size + px;

      if (iter === maxIter) {
        // Point is in the set - use background (typically black for Mandelbrot)
        data32[idx] = bgColorPacked;
      } else {
        // Smooth coloring using escape value
        // Add fractional iteration count for smooth coloring
        const log_zn = Math.log(x2 + y2) / 2;
        const nu = Math.log(log_zn / Math.LN2) / Math.LN2;
        const smoothIter = iter + 1 - nu;

        // Map to palette (normalized to 0-1 range)
        let ratio = smoothIter / maxIter;
        if (palGamma !== 1.0) {
          ratio = Math.pow(ratio, palGamma);
        }
        ratio = Math.min(1, Math.max(0, ratio));

        const lutIndex = Math.min(lutSize - 1, Math.floor(ratio * lutSize));
        data32[idx] = colorLUT[lutIndex];
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

// Render Julia set
function renderJulia() {
  if (!ctx || !colorLUT) return;

  const size = canvasSize;
  const { cReal, cImag, centerX, centerY, zoom, maxIter } = fractalParams;

  // Calculate view bounds
  const range = 3.0 / zoom;
  const xMin = centerX - range / 2;
  const yMin = centerY - range / 2;
  const pixelSize = range / size;

  const imageData = ctx.createImageData(size, size);
  const data32 = new Uint32Array(imageData.data.buffer);
  const lutSize = colorLUT.length;

  // Background color packed
  const bgColorPacked = (255 << 24) | (bgColor.b << 16) | (bgColor.g << 8) | bgColor.r;

  for (let py = 0; py < size; py++) {
    const y0 = yMin + py * pixelSize;
    for (let px = 0; px < size; px++) {
      const x0 = xMin + px * pixelSize;

      // Julia iteration: z = z² + c, where z starts at (x0, y0) and c is constant
      let x = x0, y = y0;
      let iter = 0;
      let x2 = x * x, y2 = y * y;

      while (x2 + y2 <= 4 && iter < maxIter) {
        y = 2 * x * y + cImag;
        x = x2 - y2 + cReal;
        x2 = x * x;
        y2 = y * y;
        iter++;
      }

      const idx = py * size + px;

      if (iter === maxIter) {
        // Point is in the set
        data32[idx] = bgColorPacked;
      } else {
        // Smooth coloring
        const log_zn = Math.log(x2 + y2) / 2;
        const nu = Math.log(log_zn / Math.LN2) / Math.LN2;
        const smoothIter = iter + 1 - nu;

        let ratio = smoothIter / maxIter;
        if (palGamma !== 1.0) {
          ratio = Math.pow(ratio, palGamma);
        }
        ratio = Math.min(1, Math.max(0, ratio));

        const lutIndex = Math.min(lutSize - 1, Math.floor(ratio * lutSize));
        data32[idx] = colorLUT[lutIndex];
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

// Render Burning Ship fractal
function renderBurningShip() {
  if (!ctx || !colorLUT) return;

  const size = canvasSize;
  const { centerX, centerY, zoom, maxIter } = fractalParams;

  const range = 3.0 / zoom;
  const xMin = centerX - range / 2;
  const yMin = centerY - range / 2;
  const pixelSize = range / size;

  const imageData = ctx.createImageData(size, size);
  const data32 = new Uint32Array(imageData.data.buffer);
  const lutSize = colorLUT.length;
  const bgColorPacked = (255 << 24) | (bgColor.b << 16) | (bgColor.g << 8) | bgColor.r;

  for (let py = 0; py < size; py++) {
    const y0 = yMin + py * pixelSize;
    for (let px = 0; px < size; px++) {
      const x0 = xMin + px * pixelSize;

      // Burning Ship: z = (|Re(z)| + i|Im(z)|)² + c
      let x = 0, y = 0;
      let iter = 0;
      let x2 = 0, y2 = 0;

      while (x2 + y2 <= 4 && iter < maxIter) {
        // Take absolute values before squaring
        x = Math.abs(x);
        y = Math.abs(y);
        y = 2 * x * y + y0;
        x = x2 - y2 + x0;
        x2 = x * x;
        y2 = y * y;
        iter++;
      }

      const idx = py * size + px;

      if (iter === maxIter) {
        data32[idx] = bgColorPacked;
      } else {
        const log_zn = Math.log(x2 + y2) / 2;
        const nu = Math.log(log_zn / Math.LN2) / Math.LN2;
        const smoothIter = iter + 1 - nu;

        let ratio = smoothIter / maxIter;
        if (palGamma !== 1.0) ratio = Math.pow(ratio, palGamma);
        ratio = Math.min(1, Math.max(0, ratio));

        const lutIndex = Math.min(lutSize - 1, Math.floor(ratio * lutSize));
        data32[idx] = colorLUT[lutIndex];
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

// Render Tricorn (Mandelbar) fractal
function renderTricorn() {
  if (!ctx || !colorLUT) return;

  const size = canvasSize;
  const { centerX, centerY, zoom, maxIter } = fractalParams;

  const range = 3.0 / zoom;
  const xMin = centerX - range / 2;
  const yMin = centerY - range / 2;
  const pixelSize = range / size;

  const imageData = ctx.createImageData(size, size);
  const data32 = new Uint32Array(imageData.data.buffer);
  const lutSize = colorLUT.length;
  const bgColorPacked = (255 << 24) | (bgColor.b << 16) | (bgColor.g << 8) | bgColor.r;

  for (let py = 0; py < size; py++) {
    const y0 = yMin + py * pixelSize;
    for (let px = 0; px < size; px++) {
      const x0 = xMin + px * pixelSize;

      // Tricorn: z = conj(z)² + c (conjugate before squaring)
      let x = 0, y = 0;
      let iter = 0;
      let x2 = 0, y2 = 0;

      while (x2 + y2 <= 4 && iter < maxIter) {
        // Conjugate: negate imaginary part
        y = -y;
        const newY = 2 * x * y + y0;
        x = x2 - y2 + x0;
        y = newY;
        x2 = x * x;
        y2 = y * y;
        iter++;
      }

      const idx = py * size + px;

      if (iter === maxIter) {
        data32[idx] = bgColorPacked;
      } else {
        const log_zn = Math.log(x2 + y2) / 2;
        const nu = Math.log(log_zn / Math.LN2) / Math.LN2;
        const smoothIter = iter + 1 - nu;

        let ratio = smoothIter / maxIter;
        if (palGamma !== 1.0) ratio = Math.pow(ratio, palGamma);
        ratio = Math.min(1, Math.max(0, ratio));

        const lutIndex = Math.min(lutSize - 1, Math.floor(ratio * lutSize));
        data32[idx] = colorLUT[lutIndex];
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

// Render Multibrot fractal (z^n + c)
function renderMultibrot() {
  if (!ctx || !colorLUT) return;

  const size = canvasSize;
  const { centerX, centerY, zoom, maxIter, power } = fractalParams;

  const range = 3.0 / zoom;
  const xMin = centerX - range / 2;
  const yMin = centerY - range / 2;
  const pixelSize = range / size;

  const imageData = ctx.createImageData(size, size);
  const data32 = new Uint32Array(imageData.data.buffer);
  const lutSize = colorLUT.length;
  const bgColorPacked = (255 << 24) | (bgColor.b << 16) | (bgColor.g << 8) | bgColor.r;

  for (let py = 0; py < size; py++) {
    const y0 = yMin + py * pixelSize;
    for (let px = 0; px < size; px++) {
      const x0 = xMin + px * pixelSize;

      // Multibrot: z = z^n + c (using polar form)
      let x = 0, y = 0;
      let iter = 0;

      while (x * x + y * y <= 4 && iter < maxIter) {
        const r = Math.sqrt(x * x + y * y);
        const theta = Math.atan2(y, x);
        const rn = Math.pow(r, power);
        x = rn * Math.cos(power * theta) + x0;
        y = rn * Math.sin(power * theta) + y0;
        iter++;
      }

      const idx = py * size + px;

      if (iter === maxIter) {
        data32[idx] = bgColorPacked;
      } else {
        const r2 = x * x + y * y;
        const log_zn = Math.log(r2) / 2;
        const nu = Math.log(log_zn / Math.log(power)) / Math.log(power);
        const smoothIter = iter + 1 - nu;

        let ratio = smoothIter / maxIter;
        if (palGamma !== 1.0) ratio = Math.pow(ratio, palGamma);
        ratio = Math.min(1, Math.max(0, ratio));

        const lutIndex = Math.min(lutSize - 1, Math.floor(ratio * lutSize));
        data32[idx] = colorLUT[lutIndex];
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

// Render Newton fractal (z³ - 1 = 0)
function renderNewton() {
  if (!ctx || !colorLUT) return;

  const size = canvasSize;
  const { centerX, centerY, zoom, maxIter } = fractalParams;

  const range = 3.0 / zoom;
  const xMin = centerX - range / 2;
  const yMin = centerY - range / 2;
  const pixelSize = range / size;

  const imageData = ctx.createImageData(size, size);
  const data32 = new Uint32Array(imageData.data.buffer);
  const lutSize = colorLUT.length;

  // Three roots of z³ - 1 = 0
  const roots = [
    { x: 1, y: 0 },
    { x: -0.5, y: Math.sqrt(3) / 2 },
    { x: -0.5, y: -Math.sqrt(3) / 2 }
  ];
  const tolerance = 1e-6;

  for (let py = 0; py < size; py++) {
    const y0 = yMin + py * pixelSize;
    for (let px = 0; px < size; px++) {
      let x = xMin + px * pixelSize;
      let y = y0;

      let iter = 0;
      let rootIndex = -1;

      for (iter = 0; iter < maxIter; iter++) {
        // Newton's method for z³ - 1: z = z - (z³-1)/(3z²) = (2z³ + 1) / (3z²)
        const x2 = x * x, y2 = y * y;
        const r2 = x2 + y2;
        if (r2 < 1e-10) break;

        // z² = (x + iy)² = x² - y² + 2ixy
        const zx2 = x2 - y2;
        const zy2 = 2 * x * y;

        // z³ = z * z² = (x + iy)(zx2 + izy2)
        const zx3 = x * zx2 - y * zy2;
        const zy3 = x * zy2 + y * zx2;

        // 3z²
        const denom_x = 3 * zx2;
        const denom_y = 3 * zy2;
        const denom_r2 = denom_x * denom_x + denom_y * denom_y;
        if (denom_r2 < 1e-10) break;

        // 2z³ + 1
        const num_x = 2 * zx3 + 1;
        const num_y = 2 * zy3;

        // Complex division: (2z³ + 1) / (3z²)
        x = (num_x * denom_x + num_y * denom_y) / denom_r2;
        y = (num_y * denom_x - num_x * denom_y) / denom_r2;

        // Check convergence to roots
        for (let r = 0; r < 3; r++) {
          const dx = x - roots[r].x;
          const dy = y - roots[r].y;
          if (dx * dx + dy * dy < tolerance) {
            rootIndex = r;
            break;
          }
        }
        if (rootIndex >= 0) break;
      }

      const idx = py * size + px;

      if (rootIndex >= 0) {
        // Color based on root and iteration count
        const brightness = 1 - iter / maxIter;
        let ratio = (rootIndex / 3 + brightness * 0.3) % 1;
        if (palGamma !== 1.0) ratio = Math.pow(ratio, palGamma);
        ratio = Math.min(1, Math.max(0, ratio));
        const lutIndex = Math.min(lutSize - 1, Math.floor(ratio * lutSize));
        data32[idx] = colorLUT[lutIndex];
      } else {
        // Didn't converge - use background
        data32[idx] = (255 << 24) | (bgColor.b << 16) | (bgColor.g << 8) | bgColor.r;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

// Render Phoenix fractal
function renderPhoenix() {
  if (!ctx || !colorLUT) return;

  const size = canvasSize;
  const { centerX, centerY, zoom, maxIter, cReal, cImag, p } = fractalParams;

  const range = 3.0 / zoom;
  const xMin = centerX - range / 2;
  const yMin = centerY - range / 2;
  const pixelSize = range / size;

  const imageData = ctx.createImageData(size, size);
  const data32 = new Uint32Array(imageData.data.buffer);
  const lutSize = colorLUT.length;
  const bgColorPacked = (255 << 24) | (bgColor.b << 16) | (bgColor.g << 8) | bgColor.r;

  for (let py = 0; py < size; py++) {
    const y0 = yMin + py * pixelSize;
    for (let px = 0; px < size; px++) {
      const x0 = xMin + px * pixelSize;

      // Phoenix: z_new = z² + c + p * z_prev
      let x = x0, y = y0;
      let prevX = 0, prevY = 0;
      let iter = 0;

      while (x * x + y * y <= 4 && iter < maxIter) {
        const x2 = x * x, y2 = y * y;
        const newX = x2 - y2 + cReal + p * prevX;
        const newY = 2 * x * y + cImag + p * prevY;
        prevX = x;
        prevY = y;
        x = newX;
        y = newY;
        iter++;
      }

      const idx = py * size + px;

      if (iter === maxIter) {
        data32[idx] = bgColorPacked;
      } else {
        const r2 = x * x + y * y;
        const log_zn = Math.log(r2) / 2;
        const nu = Math.log(log_zn / Math.LN2) / Math.LN2;
        const smoothIter = iter + 1 - nu;

        let ratio = smoothIter / maxIter;
        if (palGamma !== 1.0) ratio = Math.pow(ratio, palGamma);
        ratio = Math.min(1, Math.max(0, ratio));

        const lutIndex = Math.min(lutSize - 1, Math.floor(ratio * lutSize));
        data32[idx] = colorLUT[lutIndex];
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

// Render Lyapunov fractal
function renderLyapunov() {
  if (!ctx || !colorLUT) return;

  const size = canvasSize;
  const { aMin, aMax, bMin, bMax, maxIter, sequence } = fractalParams;

  const imageData = ctx.createImageData(size, size);
  const data32 = new Uint32Array(imageData.data.buffer);
  const lutSize = colorLUT.length;
  const bgColorPacked = (255 << 24) | (bgColor.b << 16) | (bgColor.g << 8) | bgColor.r;

  const seqLen = sequence.length;

  for (let py = 0; py < size; py++) {
    const b = bMin + (py / size) * (bMax - bMin);
    for (let px = 0; px < size; px++) {
      const a = aMin + (px / size) * (aMax - aMin);

      // Lyapunov exponent calculation
      let x = 0.5; // Initial condition
      let lyapunov = 0;

      for (let n = 0; n < maxIter; n++) {
        // Get r value based on sequence
        const r = sequence[n % seqLen] === 'A' ? a : b;

        // Logistic map: x = r * x * (1 - x)
        x = r * x * (1 - x);

        // Accumulate Lyapunov exponent
        const deriv = Math.abs(r * (1 - 2 * x));
        if (deriv > 0) {
          lyapunov += Math.log(deriv);
        }
      }

      lyapunov /= maxIter;

      const idx = py * size + px;

      if (isNaN(lyapunov) || !isFinite(lyapunov)) {
        data32[idx] = bgColorPacked;
      } else {
        // Map Lyapunov exponent to color
        // Negative = stable (colored), Positive = chaotic (dark)
        let ratio;
        if (lyapunov < 0) {
          ratio = Math.min(1, -lyapunov / 2); // Scale negative values
        } else {
          ratio = 0; // Chaotic regions get background-like color
        }

        if (palGamma !== 1.0) ratio = Math.pow(ratio, palGamma);
        ratio = Math.min(1, Math.max(0, ratio));

        const lutIndex = Math.min(lutSize - 1, Math.floor(ratio * lutSize));
        data32[idx] = colorLUT[lutIndex];
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

// Render fractal based on type
function renderFractal() {
  if (!fractalParams) return;

  if (fractalParams.type === "mandelbrot") {
    renderMandelbrot();
  } else if (fractalParams.type === "julia") {
    renderJulia();
  } else if (fractalParams.type === "burningship") {
    renderBurningShip();
  } else if (fractalParams.type === "tricorn") {
    renderTricorn();
  } else if (fractalParams.type === "multibrot") {
    renderMultibrot();
  } else if (fractalParams.type === "newton") {
    renderNewton();
  } else if (fractalParams.type === "phoenix") {
    renderPhoenix();
  } else if (fractalParams.type === "lyapunov") {
    renderLyapunov();
  }
}

// ============================================
// ITERATORS
// ============================================

class SymmetricIconIterator {
  constructor(alpha, betha, gamma, delta, omega, lambda, degree, npdegree) {
    this.alpha = alpha;
    this.betha = betha;
    this.gamma = gamma;
    this.delta = delta;
    this.omega = omega;
    this.lambda = lambda;
    this.degree = degree;
    this.npdegree = npdegree;
  }

  iterate(point) {
    let zzbar, zz;
    let zreal, zimag;
    let za, zb, zn, zc, zd;
    let { xpos, ypos } = point;

    zzbar = xpos * xpos + ypos * ypos;

    if (this.delta !== 0) {
      zz = Math.sqrt(zzbar);
      zc = 1;
      zd = 0;
      zreal = xpos / zz;
      zimag = ypos / zz;

      for (let j = 0; j < this.npdegree * this.degree; j++) {
        za = zc * zreal - zd * zimag;
        zb = zd * zreal + zc * zimag;
        zc = za;
        zd = zb;
      }
    } else {
      zc = 0;
      zz = 0;
    }

    zreal = xpos;
    zimag = ypos;

    for (let i = 0; i < this.degree - 2; i++) {
      za = zreal * xpos - zimag * ypos;
      zb = zimag * xpos + zreal * ypos;
      zreal = za;
      zimag = zb;
    }

    zn = xpos * zreal - ypos * zimag;
    const p =
      this.lambda +
      this.alpha * zzbar +
      this.betha * zn +
      this.delta * zz * zc;

    let nxpos = p * xpos + this.gamma * zreal - this.omega * ypos;
    let nypos = p * ypos - this.gamma * zimag + this.omega * xpos;

    return { xpos: nxpos, ypos: nypos };
  }
}

class CliffordIterator {
  constructor(alpha, beta, gamma, delta) {
    this.alpha = alpha;
    this.beta = beta;
    this.gamma = gamma;
    this.delta = delta;
  }
  iterate(point) {
    let { xpos, ypos } = point;
    return {
      xpos: Math.sin(this.alpha * ypos) + this.gamma * Math.cos(this.alpha * xpos),
      ypos: Math.sin(this.beta * xpos) + this.delta * Math.cos(this.beta * ypos),
    };
  }
}

class DeJongIterator {
  constructor(alpha, beta, gamma, delta) {
    this.alpha = alpha;
    this.beta = beta;
    this.gamma = gamma;
    this.delta = delta;
  }
  iterate(point) {
    const { xpos, ypos } = point;
    return {
      xpos: Math.sin(this.alpha * ypos) - Math.cos(this.beta * xpos),
      ypos: Math.sin(this.gamma * xpos) - Math.cos(this.delta * ypos),
    };
  }
}

class JasonRampe1Iterator {
  constructor(alpha, beta, gamma, delta) {
    this.alpha = alpha;
    this.beta = beta;
    this.gamma = gamma;
    this.delta = delta;
  }
  iterate(point) {
    const { xpos, ypos } = point;
    return {
      xpos: Math.cos(ypos * this.beta) + this.gamma * Math.sin(xpos * this.beta),
      ypos: Math.cos(xpos * this.alpha) + this.delta * Math.sin(ypos * this.alpha),
    };
  }
}

class JasonRampe2Iterator {
  constructor(alpha, beta, gamma, delta) {
    this.alpha = alpha;
    this.beta = beta;
    this.gamma = gamma;
    this.delta = delta;
  }
  iterate(point) {
    const { xpos, ypos } = point;
    return {
      xpos: Math.cos(ypos * this.beta) + this.gamma * Math.cos(xpos * this.beta),
      ypos: Math.cos(xpos * this.alpha) + this.delta * Math.cos(ypos * this.alpha),
    };
  }
}

class JasonRampe3Iterator {
  constructor(alpha, beta, gamma, delta) {
    this.alpha = alpha;
    this.beta = beta;
    this.gamma = gamma;
    this.delta = delta;
  }
  iterate(point) {
    const { xpos, ypos } = point;
    return {
      xpos: Math.sin(ypos * this.beta) + this.gamma * Math.cos(xpos * this.beta),
      ypos: Math.cos(xpos * this.alpha) + this.delta * Math.sin(ypos * this.alpha),
    };
  }
}

class TinkerbellIterator {
  constructor(alpha, beta, gamma, delta) {
    this.alpha = alpha;
    this.beta = beta;
    this.gamma = gamma;
    this.delta = delta;
  }
  iterate(point) {
    const { xpos, ypos } = point;
    return {
      xpos: xpos * xpos - ypos * ypos + this.alpha * xpos + this.beta * ypos,
      ypos: 2 * xpos * ypos + this.gamma * xpos + this.delta * ypos,
    };
  }
}

class HenonIterator {
  constructor(alpha, beta) {
    this.alpha = alpha;
    this.beta = beta;
  }
  iterate(point) {
    const { xpos, ypos } = point;
    return {
      xpos: 1 - this.alpha * xpos * xpos + ypos,
      ypos: this.beta * xpos,
    };
  }
}

class BedheadIterator {
  constructor(alpha, beta) {
    this.alpha = alpha;
    this.beta = beta;
  }
  iterate(point) {
    const { xpos, ypos } = point;
    return {
      xpos: Math.sin(xpos * ypos / this.beta) * ypos + Math.cos(this.alpha * xpos - ypos),
      ypos: xpos + Math.sin(ypos) / this.beta,
    };
  }
}

class SvenssonIterator {
  constructor(alpha, beta, gamma, delta) {
    this.alpha = alpha;
    this.beta = beta;
    this.gamma = gamma;
    this.delta = delta;
  }
  iterate(point) {
    const { xpos, ypos } = point;
    return {
      xpos: this.delta * Math.sin(this.alpha * xpos) - Math.sin(this.beta * ypos),
      ypos: this.gamma * Math.cos(this.alpha * xpos) + Math.cos(this.beta * ypos),
    };
  }
}

class FractalDreamIterator {
  constructor(alpha, beta, gamma, delta) {
    this.alpha = alpha;
    this.beta = beta;
    this.gamma = gamma;
    this.delta = delta;
  }
  iterate(point) {
    const { xpos, ypos } = point;
    return {
      xpos: Math.sin(ypos * this.beta) + this.gamma * Math.sin(xpos * this.beta),
      ypos: Math.sin(xpos * this.alpha) + this.delta * Math.sin(ypos * this.alpha),
    };
  }
}

class HopalongIterator {
  constructor(alpha, beta, gamma) {
    this.alpha = alpha;
    this.beta = beta;
    this.gamma = gamma;
  }
  iterate(point) {
    const { xpos, ypos } = point;
    const sign = xpos >= 0 ? 1 : -1;
    return {
      xpos: ypos - sign * Math.sqrt(Math.abs(this.beta * xpos - this.gamma)),
      ypos: this.alpha - xpos,
    };
  }
}

class GumowskiMiraIterator {
  constructor(mu, alpha, sigma) {
    this.mu = mu;
    this.alpha = alpha;
    this.sigma = sigma;
  }
  f(x) {
    return this.mu * x + (2 * (1 - this.mu) * x * x) / (1 + x * x);
  }
  iterate(point) {
    const { xpos, ypos } = point;
    const fx = this.f(xpos);
    const nxpos = ypos + this.alpha * (1 - this.sigma * ypos * ypos) * ypos + fx;
    const nypos = -xpos + this.f(nxpos);
    return { xpos: nxpos, ypos: nypos };
  }
}

class SprottIterator {
  constructor(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) {
    this.a = [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12];
  }
  iterate(point) {
    const { xpos, ypos } = point;
    const a = this.a;
    return {
      xpos: a[0] + a[1]*xpos + a[2]*xpos*xpos + a[3]*xpos*ypos + a[4]*ypos + a[5]*ypos*ypos,
      ypos: a[6] + a[7]*xpos + a[8]*xpos*xpos + a[9]*xpos*ypos + a[10]*ypos + a[11]*ypos*ypos,
    };
  }
}

class SymmetricFractalIterator {
  constructor(a, b, c, d, alpha, beta, p, reflect) {
    this.a = a; this.b = b; this.c = c; this.d = d;
    this.alpha = alpha; this.beta = beta;
    this.p = p; this.reflect = reflect;
    this.angles = [];
    for (let i = 0; i < p; i++) {
      this.angles.push(2 * Math.PI * i / p);
    }
  }
  iterate(point) {
    let { xpos, ypos } = point;
    // Apply affine transform
    let nx = this.a * xpos + this.b * ypos + this.alpha;
    let ny = this.c * xpos + this.d * ypos + this.beta;
    // Apply random rotation from symmetry group
    const angle = this.angles[Math.floor(Math.random() * this.p)];
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    let rx = nx * cos - ny * sin;
    let ry = nx * sin + ny * cos;
    // Optionally reflect for dihedral symmetry
    if (this.reflect && Math.random() < 0.5) {
      rx = -rx;
    }
    return { xpos: rx, ypos: ry };
  }
}

class DeRhamIterator {
  constructor(alpha, beta, curveType) {
    this.alpha = alpha;
    this.beta = beta;
    this.curveType = curveType;
  }
  iterate(point) {
    let { xpos, ypos } = point;
    // Complex number representation: z = xpos + i*ypos
    const a = this.alpha;
    const b = this.beta;
    const choice = Math.random() < 0.5 ? 0 : 1;

    if (this.curveType === "cesaro") {
      // Cesaro curves (orientation preserving)
      if (choice === 0) {
        // d0(z) = a*z where a = alpha + i*beta
        return { xpos: a * xpos - b * ypos, ypos: a * ypos + b * xpos };
      } else {
        // d1(z) = a + (1-a)*z
        const ra = 1 - a, rb = -b;
        return { xpos: a + ra * xpos - rb * ypos, ypos: b + ra * ypos + rb * xpos };
      }
    } else if (this.curveType === "koch") {
      // Koch-Peano curves (orientation reversing)
      if (choice === 0) {
        // d0(z) = a*conj(z)
        return { xpos: a * xpos + b * ypos, ypos: -a * ypos + b * xpos };
      } else {
        // d1(z) = a + (1-a)*conj(z)
        const ra = 1 - a, rb = -b;
        return { xpos: a + ra * xpos + rb * ypos, ypos: b - ra * ypos + rb * xpos };
      }
    } else {
      // General case
      if (choice === 0) {
        return { xpos: a * xpos - b * ypos, ypos: b * xpos + a * ypos };
      } else {
        return { xpos: a + (1-a) * xpos + b * ypos, ypos: b + -b * xpos + (1-a) * ypos };
      }
    }
  }
}

class ConradiIterator {
  constructor(r1, theta1, r2, theta2, a, n, variant) {
    this.r1 = r1; this.theta1 = theta1;
    this.r2 = r2; this.theta2 = theta2;
    this.a = a; this.n = n; this.variant = variant;
    this.angles = [];
    for (let i = 0; i < n; i++) {
      this.angles.push(2 * Math.PI * i / n);
    }
  }
  iterate(point) {
    let { xpos, ypos } = point;
    // Complex multiplication helpers
    const c1r = this.r1 * Math.cos(this.theta1 * Math.PI);
    const c1i = this.r1 * Math.sin(this.theta1 * Math.PI);
    const c2r = this.r2 * Math.cos(this.theta2 * Math.PI);
    const c2i = this.r2 * Math.sin(this.theta2 * Math.PI);

    let zr, zi;
    if (this.variant === 1) {
      // 1/z
      const denom = xpos*xpos + ypos*ypos + 0.0001;
      const invr = xpos / denom, invi = -ypos / denom;
      // c1 * (1/z)
      const t1r = c1r * invr - c1i * invi;
      const t1i = c1r * invi + c1i * invr;
      // c2 * conj(z)
      const t2r = c2r * xpos + c2i * ypos;
      const t2i = c2r * ypos - c2i * xpos;
      zr = t1r + t2r + this.a;
      zi = t1i + t2i;
    } else {
      // 1 / (c1*z + c2*(1/conj(z)) + a)
      const denom = xpos*xpos + ypos*ypos + 0.0001;
      const t1r = c1r * xpos - c1i * ypos;
      const t1i = c1r * ypos + c1i * xpos;
      const t2r = c2r * xpos / denom + c2i * ypos / denom;
      const t2i = c2r * ypos / denom - c2i * xpos / denom;
      const dr = t1r + t2r + this.a;
      const di = t1i + t2i;
      const d2 = dr*dr + di*di + 0.0001;
      zr = dr / d2;
      zi = -di / d2;
    }

    // Apply random rotation
    const angle = this.angles[Math.floor(Math.random() * this.n)];
    const cos = Math.cos(angle), sin = Math.sin(angle);
    return { xpos: zr * cos - zi * sin, ypos: zr * sin + zi * cos };
  }
}

class MobiusIterator {
  constructor(aRe, aIm, bRe, bIm, cRe, cIm, dRe, dIm, n) {
    this.ar = aRe; this.ai = aIm;
    this.br = bRe; this.bi = bIm;
    this.cr = cRe; this.ci = cIm;
    this.dr = dRe; this.di = dIm;
    this.n = n;
    this.angles = [];
    for (let i = 0; i < n; i++) {
      this.angles.push(2 * Math.PI * i / n);
    }
  }
  iterate(point) {
    let { xpos, ypos } = point;
    // f(z) = (az + b) / (cz + d)
    // Numerator: (ar + i*ai)(x + i*y) + (br + i*bi)
    const numr = this.ar * xpos - this.ai * ypos + this.br;
    const numi = this.ar * ypos + this.ai * xpos + this.bi;
    // Denominator: (cr + i*ci)(x + i*y) + (dr + i*di)
    const denr = this.cr * xpos - this.ci * ypos + this.dr;
    const deni = this.cr * ypos + this.ci * xpos + this.di;
    // Division
    const d2 = denr*denr + deni*deni + 0.0001;
    const zr = (numr * denr + numi * deni) / d2;
    const zi = (numi * denr - numr * deni) / d2;
    // Apply random rotation
    const angle = this.angles[Math.floor(Math.random() * this.n)];
    const cos = Math.cos(angle), sin = Math.sin(angle);
    return { xpos: zr * cos - zi * sin, ypos: zr * sin + zi * cos };
  }
}

class SymmetricQuiltIterator {
  constructor(lambda, alpha, beta, gamma, omega, m, shift) {
    this.lambda = lambda;
    this.alpha = alpha;
    this.beta = beta;
    this.gamma = gamma;
    this.omega = omega;
    this.m = m;
    this.shift = shift;
    this.PI2 = Math.PI * 2;
    this.PI4 = Math.PI * 4;
    this.PI6 = Math.PI * 6;
  }
  iterate(point) {
    // Convert from centered coords [-0.5, 0.5] to unit square [0, 1]
    let xpos = point.xpos + 0.5;
    let ypos = point.ypos + 0.5;

    // Wrap to ensure we're in [0, 1] (in case of initial values outside range)
    xpos = xpos - Math.floor(xpos);
    ypos = ypos - Math.floor(ypos);

    const sin2pix = Math.sin(this.PI2 * xpos);
    const sin2piy = Math.sin(this.PI2 * ypos);
    const cos2pix = Math.cos(this.PI2 * xpos);
    const cos2piy = Math.cos(this.PI2 * ypos);

    let nxpos = this.m * xpos + this.shift
      + this.lambda * sin2pix - this.omega * sin2piy
      + this.alpha * sin2pix * cos2piy
      + this.beta * Math.sin(this.PI4 * xpos)
      + this.gamma * Math.sin(this.PI6 * xpos) * Math.cos(this.PI4 * ypos);

    let nypos = this.m * ypos + this.shift
      + this.lambda * sin2piy - this.omega * sin2pix
      + this.alpha * sin2piy * cos2pix
      + this.beta * Math.sin(this.PI4 * ypos)
      + this.gamma * Math.sin(this.PI6 * ypos) * Math.cos(this.PI4 * xpos);

    // Wrap to [0, 1]
    nxpos = nxpos - Math.floor(nxpos);
    nypos = nypos - Math.floor(nypos);

    // Convert back to centered coords [-0.5, 0.5] for canvas mapping
    return { xpos: nxpos - 0.5, ypos: nypos - 0.5 };
  }
}

// ============================================
// ITERATION CANVAS
// ============================================

class IterationCanvas {
  constructor(initial_position, canvas_size, alias, scale, iterator) {
    this.iterator_size = canvas_size * alias;
    this.maxHits = 0;
    this.totalIterations = 0;
    this.iterating = true;
    this.currentPosition = { xpos: 0, ypos: 0 };
    this.iterationPerRun = 2000000;

    this.currentPosition.xpos = initial_position.xpos;
    this.currentPosition.ypos = initial_position.ypos;

    this.scale = scale;

    const totalSize = this.iterator_size * this.iterator_size;
    this.hits = new Uint32Array(totalSize);

    this.iterator = iterator;
  }

  iterate() {
    let it = this.iterationPerRun;
    while (it > 0) {
      this.iterate1();
      it--;
    }
  }

  getHits() {
    return this.hits;
  }

  getMaxHits() {
    return this.maxHits;
  }

  getTotalIterations() {
    return this.totalIterations;
  }

  iterate1() {
    this.totalIterations++;
    this.currentPosition = this.iterator.iterate(this.currentPosition);
    const yp = Math.round(
      this.currentPosition.ypos * this.scale * this.iterator_size +
        this.iterator_size / 2
    );
    const xp = Math.round(
      this.currentPosition.xpos * this.scale * this.iterator_size +
        this.iterator_size / 2
    );

    if (
      xp >= 0 &&
      xp < this.iterator_size &&
      yp >= 0 &&
      yp < this.iterator_size
    ) {
      const idx = xp * this.iterator_size + yp;
      const hi = ++this.hits[idx];
      if (hi > this.maxHits) this.maxHits = hi;
    }
  }
}

// ============================================
// ITERATOR BUILDER
// ============================================

function iteratorBuilder(iterator) {
  const { name, parameters } = iterator;
  switch (name) {
    case "symmetric_icon":
      const { alpha, betha, gamma, delta, omega, lambda, degree, npdegree } =
        parameters;
      return new SymmetricIconIterator(
        alpha,
        betha,
        gamma,
        delta,
        omega,
        lambda,
        degree,
        npdegree
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
        parameters.lambda,
        parameters.alpha,
        parameters.beta,
        parameters.gamma,
        parameters.omega,
        parameters.m,
        parameters.shift
      );
  }
}
