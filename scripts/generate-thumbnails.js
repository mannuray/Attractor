const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const THUMBNAIL_SIZE = 200;
const ITERATIONS = 500000;

// Color palette (warm orange gradient)
const palette = [
  { position: 0, r: 10, g: 10, b: 15 },
  { position: 0.2, r: 139, g: 69, b: 19 },
  { position: 0.4, r: 255, g: 140, b: 0 },
  { position: 0.6, r: 255, g: 200, b: 100 },
  { position: 0.8, r: 255, g: 220, b: 180 },
  { position: 1.0, r: 255, g: 255, b: 240 }
];

function interpolateColor(ratio) {
  const pos = Math.min(1, Math.max(0, ratio));
  for (let i = 0; i < palette.length - 1; i++) {
    if (pos >= palette[i].position && pos <= palette[i + 1].position) {
      const c1 = palette[i];
      const c2 = palette[i + 1];
      const t = (pos - c1.position) / (c2.position - c1.position);
      return {
        r: Math.round(c1.r + t * (c2.r - c1.r)),
        g: Math.round(c1.g + t * (c2.g - c1.g)),
        b: Math.round(c1.b + t * (c2.b - c1.b))
      };
    }
  }
  return palette[palette.length - 1];
}

// Attractor formulas
const attractors = {
  clifford: {
    name: 'Clifford',
    params: { a: -1.7, b: 1.3, c: -0.1, d: -1.21 },
    iterate: (x, y, p) => ({
      x: Math.sin(p.a * y) + p.c * Math.cos(p.a * x),
      y: Math.sin(p.b * x) + p.d * Math.cos(p.b * y)
    }),
    scale: 0.25
  },
  dejong: {
    name: 'De Jong',
    params: { a: -2.24, b: 0.43, c: -0.65, d: -2.43 },
    iterate: (x, y, p) => ({
      x: Math.sin(p.a * y) - Math.cos(p.b * x),
      y: Math.sin(p.c * x) - Math.cos(p.d * y)
    }),
    scale: 0.25
  },
  svensson: {
    name: 'Svensson',
    params: { a: 1.4, b: -2.3, c: 2.4, d: -2.1 },
    iterate: (x, y, p) => ({
      x: p.d * Math.sin(p.a * x) - Math.sin(p.b * y),
      y: p.c * Math.cos(p.a * x) + Math.cos(p.b * y)
    }),
    scale: 0.18
  },
  bedhead: {
    name: 'Bedhead',
    params: { a: 0.06, b: 0.98 },
    iterate: (x, y, p) => ({
      x: Math.sin(x * y / p.b) + Math.cos(p.a * x - y),
      y: x + Math.sin(y) / p.b
    }),
    scale: 0.12
  },
  fractalDream: {
    name: 'Fractal Dream',
    params: { a: -0.966918, b: 2.879879, c: 0.765145, d: 0.744728 },
    iterate: (x, y, p) => ({
      x: Math.sin(y * p.b) + p.c * Math.sin(x * p.b),
      y: Math.sin(x * p.a) + p.d * Math.sin(y * p.a)
    }),
    scale: 0.22
  },
  hopalong: {
    name: 'Hopalong',
    params: { a: 0.4, b: 1.0, c: 0.0 },
    iterate: (x, y, p) => ({
      x: y - Math.sign(x) * Math.sqrt(Math.abs(p.b * x - p.c)),
      y: p.a - x
    }),
    scale: 0.04
  },
  tinkerbell: {
    name: 'Tinkerbell',
    params: { a: 0.9, b: -0.6, c: 2.0, d: 0.5 },
    iterate: (x, y, p) => ({
      x: x * x - y * y + p.a * x + p.b * y,
      y: 2 * x * y + p.c * x + p.d * y
    }),
    scale: 0.2,
    startX: -0.72,
    startY: -0.64
  },
  henon: {
    name: 'Henon',
    params: { a: 1.4, b: 0.3 },
    iterate: (x, y, p) => ({
      x: 1 - p.a * x * x + y,
      y: p.b * x
    }),
    scale: 0.25
  },
  gumowskiMira: {
    name: 'Gumowski-Mira',
    params: { mu: -0.496, alpha: 0.0, sigma: 0.0 },
    iterate: (x, y, p) => {
      const f = (z) => p.mu * z + 2 * (1 - p.mu) * z * z / (1 + z * z);
      const newX = y + p.alpha * (1 - p.sigma * y * y) * y + f(x);
      return { x: newX, y: -x + f(newX) };
    },
    scale: 0.04,
    startX: 0.1,
    startY: 0.1
  }
};

function generateAttractor(config) {
  const { iterate, params, scale, startX = 0.1, startY = 0.1 } = config;
  const size = THUMBNAIL_SIZE;
  const hits = new Uint32Array(size * size);

  let x = startX;
  let y = startY;
  let maxHits = 0;

  const centerX = size / 2;
  const centerY = size / 2;

  // Skip initial iterations
  for (let i = 0; i < 100; i++) {
    const result = iterate(x, y, params);
    x = result.x;
    y = result.y;
  }

  // Main iteration
  for (let i = 0; i < ITERATIONS; i++) {
    const result = iterate(x, y, params);
    x = result.x;
    y = result.y;

    // Prevent NaN
    if (isNaN(x) || isNaN(y) || !isFinite(x) || !isFinite(y)) {
      x = startX;
      y = startY;
      continue;
    }

    const px = Math.floor(x * size * scale + centerX);
    const py = Math.floor(y * size * scale + centerY);

    if (px >= 0 && px < size && py >= 0 && py < size) {
      const idx = py * size + px;
      hits[idx]++;
      if (hits[idx] > maxHits) maxHits = hits[idx];
    }
  }

  return { hits, maxHits };
}

function renderToCanvas(hits, maxHits, size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;

  const gamma = 0.5;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = y * size + x;
      const hitVal = hits[idx];
      const pixelIdx = idx * 4;

      if (hitVal === 0) {
        // Background color
        data[pixelIdx] = 10;
        data[pixelIdx + 1] = 10;
        data[pixelIdx + 2] = 15;
        data[pixelIdx + 3] = 255;
      } else {
        const ratio = Math.pow(hitVal / maxHits, gamma);
        const color = interpolateColor(ratio);
        data[pixelIdx] = color.r;
        data[pixelIdx + 1] = color.g;
        data[pixelIdx + 2] = color.b;
        data[pixelIdx + 3] = 255;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

async function main() {
  const outputDir = path.join(__dirname, '../public/thumbnails');

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Generating attractor thumbnails...\n');

  for (const [key, config] of Object.entries(attractors)) {
    console.log(`Generating ${config.name}...`);

    try {
      const { hits, maxHits } = generateAttractor(config);
      const canvas = renderToCanvas(hits, maxHits, THUMBNAIL_SIZE);

      const filename = `${key}.png`;
      const filepath = path.join(outputDir, filename);

      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(filepath, buffer);

      console.log(`  Saved: ${filename}`);
    } catch (error) {
      console.error(`  Error: ${error.message}`);
    }
  }

  console.log('\nDone!');
}

main();
