# Chaos Iterator

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://chaos-iterator.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A high-performance, real-time strange attractor and fractal visualization engine built with React, TypeScript, and Web Workers. Generate beautiful mathematical art by exploring chaotic dynamical systems through a professional creative suite interface.

**[Launch App](https://chaos-iterator.vercel.app/)** · **[View on GitHub](https://github.com/mannuray/Attractor)**

![Chaos Iterator Screenshot](public/gallery/symmetric-icon.png)

## Features

- **30+ Mathematical Modules**: Strange attractors, IFS systems, and escape-time fractals.
- **Pluggable Architecture**: SOLID-compliant design using a centralized Registry Pattern.
- **Serialized Iterator Logic**: High-performance mathematical kernels compiled dynamically in Web Workers.
- **Dynamic Theme System**: Switch between professional presets like Cyber Cyan, Electric Indigo, and Solar Flare.
- **Real-time Rendering**: Optimized zero-allocation iteration engine with OffscreenCanvas support.
- **Custom Palettes**: Integrated LUT (Color Lookup Table) editor with gamma and scaling controls.
- **High-Resolution Export**: Studio-quality PNG export up to 8K resolution with customizable oversampling.
- **Minimalist HUD**: Floating "Control Bridge" and collapsible sidebars for maximal visual focus.

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/mannuray/Attractor.git
cd Attractor

# Install dependencies
npm install

# Start development engine
npm start
```

## Architecture (SOLID Design)

Chaos Iterator has been refactored to follow professional software engineering patterns, moving away from monolithic files toward a modular, pluggable system.

### 1. The Attractor Registry (Open/Closed Principle)
All mathematical systems are managed by a centralized `AttractorRegistry`. To add a new attractor, you no longer need to modify the main UI or the core engine. You simply register a new module.

### 2. Serialized Iterator Logic
Mathematical formulas are decoupled from the rendering engine. Formulas are stored as **serialized strings** within their respective modules. When a module is selected, the UI sends the formula to the Web Worker, which compiles it on-the-fly using `new Function()`. This ensures the Worker remains a "pure execution shell."

### 3. Performance Optimizations
- **Zero-Allocation Math**: Iterators use `Float64Array` updates in-place to prevent Garbage Collection stutter.
- **32-bit Color Packing**: Colors are pre-computed into 32-bit `ABGR` integers for rapid pixel-buffer lookup.
- **Render Isolation**: High-frequency stats (iterations/density) are isolated from the React render tree via `useRef` and `requestAnimationFrame`.

## Developer Guide: Adding a New Attractor

Adding a new mathematical system is now a simple 4-step process:

### 1. Create the Module Folder
Create a new directory in `src/attractors/your_new_module/`.

### 2. Define the Math and Metadata
In `index.ts`, register your module with the registry:

```typescript
import { registry } from "../registry";
import { YourControls } from "./Controls";

registry.register({
  id: "your_module_id",
  label: "Friendly Name",
  category: "Attractors", // or "IFS" or "Fractals"
  defaultParams: { alpha: 1.5, beta: 2.0, scale: 0.2 },
  Controls: YourControls,
  math: `
    // p[0] is x, p[1] is y. Update them in-place.
    const x = p[0], y = p[1];
    p[0] = Math.sin(params.alpha * y) + ...;
    p[1] = Math.cos(params.beta * x) + ...;
  `
});
```

### 3. Create the UI View
In `Controls.tsx`, define the React sliders for your parameters using the provided `ParameterInput` components.

### 4. Export the Module
Add your module to `src/attractors/index.ts`.

**The UI and Worker will automatically detect your new module, add it to the dropdowns, and handle the rendering.**

## Performance

- **Web Workers**: Offloads heavy math to background threads to keep the UI responsive at 60fps.
- **SharedArrayBuffer**: (Optional) For zero-copy density map transfers between worker and UI.
- **Mandelbrot Optimization**: Uses geometric Cardioid and Period-2 bulb checks for 2x faster fractal rendering.

## Acknowledgments

This project was inspired by **"Symmetry in Chaos"** by Michael Field and Martin Golubitsky.

Additional references:
- [Paul Bourke's Fractal Collection](https://paulbourke.net/fractals/)
- [Softology Blog](https://softologyblog.wordpress.com/2017/03/04/2d-strange-attractors/)
- Research by Clifford Pickover and J.C. Sprott.

## License

MIT
