# Engineering Roadmap: Advanced Chaos Discovery

This document outlines the proposed high-end features for the next phase of the Attractor Engine development. These features aim to transform the application from a static visualization tool into an evolutionary, cinematic, and interactive art platform.

---

## 1. 🧬 Darwinian Hunt (Genetic Breeding)
**Concept:** Shift from purely random discovery to user-directed evolution using a Genetic Algorithm (GA).

*   **The Workflow:** 
    1.  The Discovery AI generates 4 distinct chaotic seeds.
    2.  User selects one "Parent" seed based on aesthetic preference.
    3.  The AI generates a new generation of 4 "Offspring" by applying Gaussian mutation to the parent's parameters.
*   **Technical Implementation:**
    *   Implement a `mutateParams(params, strength)` helper in the Registry.
    *   Create a "Multi-Viewport" UI component for the 2x2 preview grid.
    *   Use low-resolution "Ghost Renders" in the worker to populate previews instantly.

## 2. 🌊 Temporal Morphing (Chaos in Motion)
**Concept:** Linear and Non-Linear interpolation between chaotic states to visualize the "Butterfly Effect."

*   **The Workflow:**
    *   Set a "Keyframe A" and "Keyframe B."
    *   Execute a `lerp` (Linear Interpolation) or `slerp` across the parameter space over a defined duration.
*   **Technical Implementation:**
    *   Update `useCanvasWorker` to support a `targetParams` and `morphDuration` payload.
    *   The Worker will calculate the delta for every parameter and update the internal `it.params` per frame.
    *   Result: A fluidly dancing attractor that breaths and morphs between structures.

## 3. 🧘 Zen Focus Mode (Adaptive HUD)
**Concept:** A minimalist, "alive" interface that yields to the art during inactivity.

*   **The Workflow:**
    *   A global mouse/keyboard listener resets an "Idle Timer."
    *   After 3 seconds of inactivity, the Sidebar and System Command Bar transition to `opacity: 0` and `pointer-events: none`.
*   **Technical Implementation:**
    *   Create a `useIdle(timeout)` hook.
    *   Apply CSS `transition` and `backdrop-filter` animations to the HUD containers.
    *   Implement a "Wake-up Glitch" effect (CSS `clip-path` or `filter: hue-rotate`) when interaction resumes.

## 4. 🎹 Audio-Reactive Chaos (Cymatics)
**Concept:** Mapping mathematical chaos to digital signal processing (DSP) frequencies.

*   **The Workflow:**
    *   Capture audio via `getUserMedia` or a local file.
    *   Perform a Fast Fourier Transform (FFT) to get frequency bins.
*   **Technical Implementation:**
    *   Map **Low Frequencies (Bass)** to `Scale` and `Bloom Intensity`.
    *   Map **Mid Frequencies** to primary math parameters (e.g., `Alpha`, `Beta`).
    *   Map **High Frequencies (Treble)** to `Grain` and `Palette Shift`.
    *   Requires a high-frequency message bridge to the Worker (`~60fps` updates).

---

## 5. 🧊 Volumetric Chaos (3D Attractors)
**Concept:** Extending the engine into the third dimension.

*   **The Workflow:**
    *   Migrate from 2D Canvas API to **Three.js** or a custom **WebGL/WebGPU** kernel.
    *   Project `[x, y, z]` coordinates into 3D space with orbit controls.
*   **Technical Implementation:**
    *   Replace `Uint32Array` density map with a `Float32Array` vertex buffer.
    *   Implement Point-Cloud rendering with custom shaders for Bloom and Depth-of-Field.
