const fs = require('fs');
const path = require('path');

const THUMBNAIL_SIZE = 200;
const ITERATIONS = 100000;

// Generate SVG path from attractor points
function generatePath(points, size) {
  if (points.length < 2) return '';

  // Sample points for SVG path (we don't want millions of points in SVG)
  const sampleRate = Math.max(1, Math.floor(points.length / 2000));
  const sampledPoints = [];

  for (let i = 0; i < points.length; i += sampleRate) {
    sampledPoints.push(points[i]);
  }

  if (sampledPoints.length < 2) return '';

  // Create path
  let path = `M ${sampledPoints[0].x.toFixed(2)} ${sampledPoints[0].y.toFixed(2)}`;
  for (let i = 1; i < sampledPoints.length; i++) {
    path += ` L ${sampledPoints[i].x.toFixed(2)} ${sampledPoints[i].y.toFixed(2)}`;
  }

  return path;
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
    scale: 0.22
  },
  dejong: {
    name: 'De Jong',
    params: { a: -2.24, b: 0.43, c: -0.65, d: -2.43 },
    iterate: (x, y, p) => ({
      x: Math.sin(p.a * y) - Math.cos(p.b * x),
      y: Math.sin(p.c * x) - Math.cos(p.d * y)
    }),
    scale: 0.22
  },
  svensson: {
    name: 'Svensson',
    params: { a: 1.4, b: -2.3, c: 2.4, d: -2.1 },
    iterate: (x, y, p) => ({
      x: p.d * Math.sin(p.a * x) - Math.sin(p.b * y),
      y: p.c * Math.cos(p.a * x) + Math.cos(p.b * y)
    }),
    scale: 0.15
  },
  bedhead: {
    name: 'Bedhead',
    params: { a: 0.06, b: 0.98 },
    iterate: (x, y, p) => ({
      x: Math.sin(x * y / p.b) + Math.cos(p.a * x - y),
      y: x + Math.sin(y) / p.b
    }),
    scale: 0.1
  },
  fractalDream: {
    name: 'Fractal Dream',
    params: { a: -0.966918, b: 2.879879, c: 0.765145, d: 0.744728 },
    iterate: (x, y, p) => ({
      x: Math.sin(y * p.b) + p.c * Math.sin(x * p.b),
      y: Math.sin(x * p.a) + p.d * Math.sin(y * p.a)
    }),
    scale: 0.2
  },
  hopalong: {
    name: 'Hopalong',
    params: { a: 0.4, b: 1.0, c: 0.0 },
    iterate: (x, y, p) => ({
      x: y - Math.sign(x) * Math.sqrt(Math.abs(p.b * x - p.c)),
      y: p.a - x
    }),
    scale: 0.035
  },
  tinkerbell: {
    name: 'Tinkerbell',
    params: { a: 0.9, b: -0.6, c: 2.0, d: 0.5 },
    iterate: (x, y, p) => ({
      x: x * x - y * y + p.a * x + p.b * y,
      y: 2 * x * y + p.c * x + p.d * y
    }),
    scale: 0.18,
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
    scale: 0.22
  },
  gumowskiMira: {
    name: 'Gumowski-Mira',
    params: { mu: -0.496, alpha: 0.0, sigma: 0.0 },
    iterate: (x, y, p) => {
      const f = (z) => p.mu * z + 2 * (1 - p.mu) * z * z / (1 + z * z);
      const newX = y + p.alpha * (1 - p.sigma * y * y) * y + f(x);
      return { x: newX, y: -x + f(newX) };
    },
    scale: 0.035,
    startX: 0.1,
    startY: 0.1
  }
};

// Generate points for attractor
function generatePoints(config) {
  const { iterate, params, scale, startX = 0.1, startY = 0.1 } = config;
  const size = THUMBNAIL_SIZE;
  const points = [];

  let x = startX;
  let y = startY;

  const centerX = size / 2;
  const centerY = size / 2;

  // Skip initial iterations for attractor to settle
  for (let i = 0; i < 500; i++) {
    const result = iterate(x, y, params);
    x = result.x;
    y = result.y;
  }

  // Generate points
  for (let i = 0; i < ITERATIONS; i++) {
    const result = iterate(x, y, params);
    x = result.x;
    y = result.y;

    // Prevent NaN/Infinity
    if (isNaN(x) || isNaN(y) || !isFinite(x) || !isFinite(y)) {
      x = startX;
      y = startY;
      continue;
    }

    const px = x * size * scale + centerX;
    const py = y * size * scale + centerY;

    if (px >= 0 && px < size && py >= 0 && py < size) {
      points.push({ x: px, y: py });
    }
  }

  return points;
}

// Create SVG from points
function createSVG(points, name, size) {
  const path = generatePath(points, size);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f59e0b;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ea580c;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="#0a0a0f"/>
  <path d="${path}" fill="none" stroke="url(#grad)" stroke-width="0.3" stroke-opacity="0.8"/>
</svg>`;
}

async function main() {
  const outputDir = path.join(__dirname, '../public/thumbnails');

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Generating attractor SVG thumbnails...\n');

  for (const [key, config] of Object.entries(attractors)) {
    console.log(`Generating ${config.name}...`);

    try {
      const points = generatePoints(config);
      const svg = createSVG(points, config.name, THUMBNAIL_SIZE);

      const filename = `${key}.svg`;
      const filepath = path.join(outputDir, filename);

      fs.writeFileSync(filepath, svg);
      console.log(`  Saved: ${filename} (${points.length} points)`);
    } catch (error) {
      console.error(`  Error: ${error.message}`);
    }
  }

  console.log('\nDone! SVG thumbnails created in public/thumbnails/');
}

main();
