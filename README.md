# Chaos Iterator

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://mannuray.github.io/Attractor/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A real-time strange attractor and fractal visualization tool built with React and Web Workers. Generate beautiful mathematical art by exploring chaotic dynamical systems.

**[Launch App](https://mannuray.github.io/Attractor/)** · **[View on GitHub](https://github.com/mannuray/Attractor)**

![Chaos Iterator Screenshot](public/gallery/symmetric-icon.png)

## Features

- **25+ Attractor Types**: Strange attractors including Clifford, De Jong, Gumowski-Mira, Sprott, and more
- **IFS Fractals**: Symmetric Fractals, De Rham curves, Conradi, and Mobius transformations
- **Escape-Time Fractals**: Mandelbrot, Julia, Burning Ship, Tricorn, Multibrot, Newton, Phoenix, and Lyapunov
- **Real-time Rendering**: Uses Web Workers and OffscreenCanvas for smooth, non-blocking iteration
- **Custom Palettes**: Built-in palette editor with gamma correction and scaling options
- **Curated Presets**: Each type comes with beautiful presets to explore
- **High Resolution**: Canvas sizes up to 4096×4096 with customizable oversampling (1×–4×)
- **Fractal Zoom**: Click and drag to zoom into escape-time fractals
- **Export**: Save your creations as high-quality PNG images

## Attractor Types

### Strange Attractors

| Type | Formula | Parameters |
|------|---------|------------|
| **Symmetric Icon** | Complex polynomial with rotational symmetry | alpha, beta, gamma, delta, omega, lambda, degree |
| **Symmetric Quilt** | Tiled patterns using sin/cos functions | lambda, alpha, beta, gamma, omega, m, shift |
| **Clifford** | `x' = sin(a*y) + c*cos(a*x)` | a, b, c, d |
| **De Jong** | `x' = sin(a*y) - cos(b*x)` | a, b, c, d |
| **Svensson** | `x' = d*sin(a*x) - sin(b*y)` | a, b, c, d |
| **Fractal Dream** | `x' = sin(y*b) + c*sin(x*b)` | a, b, c, d |
| **Tinkerbell** | `x' = x² - y² + a*x + b*y` | a, b, c, d |
| **Henon** | `x' = 1 - a*x² + y` | a, b |
| **Bedhead** | `x' = sin(x*y/b)*y + cos(a*x - y)` | a, b |
| **Hopalong** | `x' = y - sign(x)*sqrt(abs(b*x - c))` | a, b, c |
| **Gumowski-Mira** | `x' = y + a*(1 - σ*y²)*y + f(x)` | mu, alpha, sigma |
| **Sprott** | 12-parameter quadratic map | a1-a12 |

### IFS (Iterated Function Systems)

| Type | Description | Parameters |
|------|-------------|------------|
| **Symmetric Fractal** | Affine transforms with rotational symmetry | a, b, c, d, alpha, beta, p, reflect |
| **De Rham** | Cesaro and Koch-Peano curves | alpha, beta, curve type |
| **Conradi** | Complex IFS with rotational symmetry | r1, theta1, r2, theta2, a, n, variant |
| **Mobius** | Mobius transformation IFS | a, b, c, d (complex), n |

### Escape-Time Fractals

| Type | Formula | Parameters |
|------|---------|------------|
| **Mandelbrot** | `z' = z² + c` | center, zoom, max iterations |
| **Julia** | `z' = z² + c` (fixed c) | c (real/imag), center, zoom |
| **Burning Ship** | `z' = (|Re(z)| + i|Im(z)|)² + c` | center, zoom |
| **Tricorn** | `z' = conj(z)² + c` | center, zoom |
| **Multibrot** | `z' = z^n + c` | power, center, zoom |
| **Newton** | Newton's method for z³ - 1 = 0 | center, zoom |
| **Phoenix** | `z' = z² + c + p*z_prev` | c, p, center, zoom |
| **Lyapunov** | Lyapunov exponent visualization | a/b range, sequence |

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/mannuray/Attractor.git
cd Attractor

# Install dependencies
npm install

# Start development server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build for Production

```bash
npm run build
```

## Usage

1. **Select Type**: Choose from Attractors, IFS, or Fractals in the dropdown menu
2. **Choose a Preset**: Each type has curated presets with interesting parameters
3. **Start Iteration**: Click "Start" to begin generating (attractors iterate continuously)
4. **Adjust Parameters**: Click "Edit Parameters" to modify values
5. **Zoom (Fractals)**: Click and drag on the canvas to zoom into a region
6. **Customize Colors**: Open the Palette editor to create custom color schemes
7. **Export**: Click "Save Image" to download your creation as PNG

### Palette Settings

- **Gamma**: Adjusts color distribution (lower = more contrast)
- **Scale Mode**: Dynamic (based on max hits) or Fixed (manual threshold)
- **Pal Max**: Fixed threshold value for color scaling
- **Background**: Custom background color for zero-hit pixels

## Architecture

```
src/
├── view/pages/Home.tsx      # Main UI component
├── hooks/
│   ├── useAttractorState.ts # State management for all attractor types
│   ├── usePalette.ts        # Color palette state
│   ├── useCanvasWorker.ts   # Web Worker communication
│   └── useFractalZoom.ts    # Fractal zoom/pan controls
├── attractors/
│   ├── shared/              # Shared components and types
│   ├── symmetricIcon/       # Each attractor has its own module
│   ├── clifford/
│   ├── gumowskiMira/
│   ├── sprott/
│   ├── symmetricFractal/
│   ├── deRham/
│   ├── conradi/
│   ├── mobius/
│   └── ...
└── components/
    ├── Sidebar.tsx          # Main controls panel
    ├── CanvasArea.tsx       # Canvas display
    └── PaletteModal.tsx     # Palette editor

public/
└── worker.js                # Web Worker with all iterator implementations
```

## Performance

- Uses **OffscreenCanvas** for GPU-accelerated rendering in supported browsers
- Falls back to main-thread rendering for compatibility
- **Color LUT** (lookup table) for fast palette interpolation
- **Customizable oversampling** (1×, 2×, 3×, 4×) for anti-aliasing quality vs speed tradeoff
- Fractals render once; attractors iterate continuously for progressive detail

## License

MIT

## Acknowledgments

- Mathematical formulas based on research in chaotic dynamical systems
- Inspired by the work of Clifford Pickover, Julien C. Sprott, and other chaos mathematicians
- IFS algorithms based on "Symmetry in Chaos" by Field and Golubitsky
