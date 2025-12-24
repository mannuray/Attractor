# Attractor

A real-time strange attractor visualization tool built with React and Web Workers. Generate beautiful mathematical art by exploring chaotic dynamical systems.

## Features

- **Multiple Attractor Types**: Symmetric Icon, Symmetric Quilt, Clifford, De Jong, Tinkerbell, Henon, Bedhead, Svensson, Fractal Dream, and Hopalong
- **Real-time Rendering**: Uses Web Workers and OffscreenCanvas for smooth, non-blocking iteration
- **Custom Palettes**: Built-in palette editor with gamma correction and scaling options
- **Presets**: Each attractor type comes with curated presets to explore
- **High Resolution**: Configurable canvas sizes up to 4096x4096 with anti-aliasing
- **Export**: Save your creations as PNG images

## Attractor Types

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

1. **Select Attractor Type**: Choose from the dropdown menu
2. **Choose a Preset**: Each type has curated presets with interesting parameters
3. **Start Iteration**: Click "Start" to begin generating the attractor
4. **Adjust Parameters**: Click "Edit" to modify parameters, then "Apply" to regenerate
5. **Customize Colors**: Open the Palette editor to create custom color schemes
6. **Export**: Click "Save Image" to download your creation as PNG

### Palette Settings

- **Gamma**: Adjusts color distribution (lower = more contrast)
- **Scale Mode**: Dynamic (based on max hits) or Fixed (manual threshold)
- **Pal Max**: Fixed threshold value for color scaling

## Architecture

```
src/
├── view/pages/Home.tsx      # Main UI component
├── model-controller/
│   └── Attractor/
│       └── palette.ts       # Color palette management
└── Parametersets.ts         # Preset data for all attractors

public/
└── worker.js                # Web Worker with iterator implementations
```

## Performance

- Uses **OffscreenCanvas** for GPU-accelerated rendering in supported browsers
- Falls back to main-thread rendering for compatibility
- **Color LUT** (lookup table) for fast palette interpolation
- **Anti-aliasing** via supersampling

## License

MIT

## Acknowledgments

- Mathematical formulas based on research in chaotic dynamical systems
- Inspired by the work of Clifford Pickover and other chaos mathematicians
