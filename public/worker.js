// Worker state
let iterCanvas = null;
let it = null;

// Rendering mode: "legacy" or "offscreen"
let mode = "legacy";

// OffscreenCanvas rendering state
let offscreenCanvas = null;
let ctx = null;
let colorLUT = null;
let canvasSize = 0;
let configAlias = 2;
let colorLUTSize = 1024;

// Palette gamma and max hits scaling
let palGamma = 1.0;       // Gamma correction for color distribution
let palScale = false;     // true = dynamic (use maxHits), false = fixed (use palMax)
let palMax = 10000;       // Fixed max value when palScale is false

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
  if (!colorLUT) {
    return 0xffffffff; // White (ABGR)
  }

  // Determine the divisor based on scaling mode
  const divisor = palScale ? maxHits : palMax;
  if (divisor === 0) {
    return 0xffffffff; // White (ABGR)
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

      // Background (no hits) is white
      if (hitVal === 0) {
        totalR += 255;
        totalG += 255;
        totalB += 255;
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
    ctx.fillStyle = "#ffffff";
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

    // Check for OffscreenCanvas mode
    if (payload.mode === "offscreen" && payload.canvas) {
      mode = "offscreen";
      offscreenCanvas = payload.canvas;
      ctx = offscreenCanvas.getContext("2d");
      canvasSize = size;
      configAlias = alias;

      // Build color LUT from palette
      if (palette && lutSize) {
        buildColorLUT(palette, lutSize);
      }
    } else {
      mode = "legacy";
    }

    // Initialize iterator and canvas
    it = iteratorBuilder(iterator);
    iterCanvas = new IterationCanvas(point, size, alias, scale, it);

    if (mode === "offscreen") {
      render();
      // Send stats only
      self.postMessage({
        type: "stats",
        payload: { maxHits: iterCanvas.getMaxHits(), totalIterations: iterCanvas.getTotalIterations() },
      });
    } else {
      sendHits();
    }
  } else if (type === "iterate") {
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
      buildColorLUT(palette, lutSize);

      if (mode === "offscreen") {
        render();
        self.postMessage({
          type: "stats",
          payload: { maxHits: iterCanvas ? iterCanvas.getMaxHits() : 0, totalIterations: iterCanvas ? iterCanvas.getTotalIterations() : 0 },
        });
      }
    }
  } else if (type === "updatePaletteSettings") {
    // Update palette gamma and scaling settings
    if (payload.palGamma !== undefined) palGamma = payload.palGamma;
    if (payload.palScale !== undefined) palScale = payload.palScale;
    if (payload.palMax !== undefined) palMax = payload.palMax;

    if (mode === "offscreen") {
      render();
      self.postMessage({
        type: "stats",
        payload: { maxHits: iterCanvas ? iterCanvas.getMaxHits() : 0, totalIterations: iterCanvas ? iterCanvas.getTotalIterations() : 0 },
      });
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
  }
};

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
