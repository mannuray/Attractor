const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const THUMBNAIL_SIZE = 200;
const MAX_ITER = 100;

// Color palette
function getColor(iterations, maxIter) {
  if (iterations === maxIter) {
    return { r: 10, g: 10, b: 15 };
  }

  const t = iterations / maxIter;
  const angle = t * Math.PI * 2;

  // Orange-based palette
  const r = Math.floor(255 * (0.5 + 0.5 * Math.sin(angle)));
  const g = Math.floor(255 * (0.3 + 0.3 * Math.sin(angle + 2)));
  const b = Math.floor(255 * (0.1 + 0.1 * Math.sin(angle + 4)));

  return { r: Math.min(255, r + 50), g: Math.min(255, g + 20), b };
}

// Fractal generators
const fractals = {
  mandelbrot: {
    name: 'Mandelbrot',
    centerX: -0.5,
    centerY: 0,
    zoom: 1.2,
    generate: (cx, cy, maxIter) => {
      let x = 0, y = 0;
      let iter = 0;
      while (x * x + y * y <= 4 && iter < maxIter) {
        const xtemp = x * x - y * y + cx;
        y = 2 * x * y + cy;
        x = xtemp;
        iter++;
      }
      return iter;
    }
  },
  julia: {
    name: 'Julia',
    centerX: 0,
    centerY: 0,
    zoom: 1.5,
    cx: -0.7,
    cy: 0.27,
    generate: function(px, py, maxIter) {
      let x = px, y = py;
      let iter = 0;
      while (x * x + y * y <= 4 && iter < maxIter) {
        const xtemp = x * x - y * y + this.cx;
        y = 2 * x * y + this.cy;
        x = xtemp;
        iter++;
      }
      return iter;
    }
  },
  burningShip: {
    name: 'Burning Ship',
    centerX: -0.4,
    centerY: -0.5,
    zoom: 1.2,
    generate: (cx, cy, maxIter) => {
      let x = 0, y = 0;
      let iter = 0;
      while (x * x + y * y <= 4 && iter < maxIter) {
        const xtemp = x * x - y * y + cx;
        y = Math.abs(2 * x * y) + cy;
        x = Math.abs(xtemp);
        iter++;
      }
      return iter;
    }
  },
  tricorn: {
    name: 'Tricorn',
    centerX: -0.3,
    centerY: 0,
    zoom: 1.2,
    generate: (cx, cy, maxIter) => {
      let x = 0, y = 0;
      let iter = 0;
      while (x * x + y * y <= 4 && iter < maxIter) {
        const xtemp = x * x - y * y + cx;
        y = -2 * x * y + cy;
        x = xtemp;
        iter++;
      }
      return iter;
    }
  },
  multibrot: {
    name: 'Multibrot',
    centerX: 0,
    centerY: 0,
    zoom: 1.0,
    power: 3,
    generate: function(cx, cy, maxIter) {
      let x = 0, y = 0;
      let iter = 0;
      const n = this.power;
      while (x * x + y * y <= 4 && iter < maxIter) {
        // z^n using De Moivre's theorem
        const r = Math.sqrt(x * x + y * y);
        const theta = Math.atan2(y, x);
        const rn = Math.pow(r, n);
        const xtemp = rn * Math.cos(n * theta) + cx;
        y = rn * Math.sin(n * theta) + cy;
        x = xtemp;
        iter++;
      }
      return iter;
    }
  },
  newton: {
    name: 'Newton',
    centerX: 0,
    centerY: 0,
    zoom: 1.5,
    generate: (px, py, maxIter) => {
      let x = px, y = py;
      const tolerance = 0.0001;
      // Newton's method for z^3 - 1 = 0
      // Roots at: 1, e^(2πi/3), e^(4πi/3)
      for (let iter = 0; iter < maxIter; iter++) {
        const r2 = x * x + y * y;
        if (r2 < tolerance) return iter;

        // z^3
        const x3 = x * x * x - 3 * x * y * y;
        const y3 = 3 * x * x * y - y * y * y;

        // z^2
        const x2 = x * x - y * y;
        const y2 = 2 * x * y;

        // Newton step: z - (z^3 - 1) / (3 * z^2)
        const denom = 3 * (x2 * x2 + y2 * y2);
        if (denom < tolerance) return iter;

        const numX = x3 - 1;
        const numY = y3;

        const stepX = (numX * x2 + numY * y2) / denom;
        const stepY = (numY * x2 - numX * y2) / denom;

        const newX = x - stepX;
        const newY = y - stepY;

        // Check convergence
        const dx = newX - x;
        const dy = newY - y;
        if (dx * dx + dy * dy < tolerance) return iter;

        x = newX;
        y = newY;
      }
      return maxIter;
    }
  }
};

function generateFractal(config, size, maxIter) {
  const data = Buffer.alloc(size * size * 3);
  const { centerX, centerY, zoom, generate } = config;

  const halfSize = size / 2;
  const scale = zoom / halfSize;

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const x = (px - halfSize) * scale + centerX;
      const y = (py - halfSize) * scale + centerY;

      const iter = generate.call(config, x, y, maxIter);
      const color = getColor(iter, maxIter);

      const idx = (py * size + px) * 3;
      data[idx] = color.r;
      data[idx + 1] = color.g;
      data[idx + 2] = color.b;
    }
  }

  return data;
}

async function main() {
  const outputDir = path.join(__dirname, '../public/thumbnails');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Generating fractal thumbnails...\n');

  for (const [key, config] of Object.entries(fractals)) {
    console.log(`Generating ${config.name}...`);

    try {
      const rawData = generateFractal(config, THUMBNAIL_SIZE, MAX_ITER);

      await sharp(rawData, {
        raw: {
          width: THUMBNAIL_SIZE,
          height: THUMBNAIL_SIZE,
          channels: 3
        }
      })
        .png()
        .toFile(path.join(outputDir, `${key}.png`));

      console.log(`  Saved: ${key}.png`);
    } catch (error) {
      console.error(`  Error: ${error.message}`);
    }
  }

  console.log('\nDone!');
}

main();
