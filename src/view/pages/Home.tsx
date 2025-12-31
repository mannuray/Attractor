import React, { useEffect, useCallback, useMemo } from "react";
import styled from "styled-components";

// Hooks
import { useAttractorState, usePalette, useCanvasWorker, useFractalZoom } from "../../hooks";

// Components
import { CanvasArea, ZoomPanel, ControlPanel, PaletteModal, Sidebar } from "../../components";

// Attractor Controls
import { SymmetricIconControls } from "../../attractors/symmetricIcon";
import { SymmetricQuiltControls } from "../../attractors/symmetricQuilt";
import { CliffordControls } from "../../attractors/clifford";
import { DeJongControls } from "../../attractors/deJong";
import { TinkerbellControls } from "../../attractors/tinkerbell";
import { HenonControls } from "../../attractors/henon";
import { BedheadControls } from "../../attractors/bedhead";
import { SvenssonControls } from "../../attractors/svensson";
import { FractalDreamControls } from "../../attractors/fractalDream";
import { HopalongControls } from "../../attractors/hopalong";
import { MandelbrotControls } from "../../attractors/mandelbrot";
import { JuliaControls } from "../../attractors/julia";
import { BurningShipControls } from "../../attractors/burningship";
import { TricornControls } from "../../attractors/tricorn";
import { MultibrotControls } from "../../attractors/multibrot";
import { NewtonControls } from "../../attractors/newton";
import { PhoenixControls } from "../../attractors/phoenix";
import { LyapunovControls } from "../../attractors/lyapunov";
import { GumowskiMiraControls } from "../../attractors/gumowskiMira";
import { SprottControls } from "../../attractors/sprott";
import { SymmetricFractalControls } from "../../attractors/symmetricFractal";
import { DeRhamControls } from "../../attractors/deRham";
import { ConradiControls } from "../../attractors/conradi";
import { MobiusControls } from "../../attractors/mobius";
import { JasonRampe1Controls } from "../../attractors/jasonRampe1";
import { JasonRampe2Controls } from "../../attractors/jasonRampe2";
import { JasonRampe3Controls } from "../../attractors/jasonRampe3";

// Data
import symmetricIconData, {
  cliffordData, deJongData, tinkerbellData, henonData,
  bedheadData, svenssonData, fractalDreamData, hopalongData,
  symmetricQuiltData, mandelbrotData, juliaData, jasonRampe1Data, jasonRampe2Data, jasonRampe3Data
} from "../../Parametersets";

// Types
import { CONFIG, AttractorType } from "../../attractors/shared/types";

// Styled components
const PageContainer = styled.div`
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #0a0a0f;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
`;

function Home() {
  // Attractor state hook
  const attractor = useAttractorState();

  // Canvas worker hook
  const canvas = useCanvasWorker();

  // Palette hook - initialize with icon preset
  const initialIcon = symmetricIconData[CONFIG.INITIAL_ICON_INDEX];
  const palette = usePalette(initialIcon.paletteData, initialIcon.palGamma ?? 0.5);

  // Fractal zoom hook
  const fractalZoom = useFractalZoom();

  // Palette modal state
  const [paletteModalOpen, setPaletteModalOpen] = React.useState(false);

  // Get color from LUT with anti-aliasing
  const getColorRGB = useCallback((
    x: number,
    y: number,
    hits: Uint32Array,
    maxHitsVal: number,
    iteratorSize: number
  ): number => {
    const lut = palette.colorLUTRef.current;
    if (!lut || maxHitsVal === 0) {
      return (255 << 24) | (palette.bgColor.b << 16) | (palette.bgColor.g << 8) | palette.bgColor.r;
    }

    let totalR = 0, totalG = 0, totalB = 0;
    const startX = x * CONFIG.ALIAS;
    const startY = y * CONFIG.ALIAS;
    const lutSize = CONFIG.COLOR_LUT_SIZE;
    const invMaxHits = 1 / maxHitsVal;

    for (let dy = 0; dy < CONFIG.ALIAS; dy++) {
      const row = startY + dy;
      for (let dx = 0; dx < CONFIG.ALIAS; dx++) {
        const col = startX + dx;
        const hitVal = hits[col * iteratorSize + row] || 0;

        if (hitVal === 0) {
          totalR += palette.bgColor.r;
          totalG += palette.bgColor.g;
          totalB += palette.bgColor.b;
          continue;
        }

        const ratio = Math.pow(hitVal * invMaxHits, palette.palGamma);
        const lutIndex = Math.min(Math.floor(ratio * lutSize), lutSize - 1);
        const color = lut[lutIndex];
        totalR += color & 0xFF;
        totalG += (color >> 8) & 0xFF;
        totalB += (color >> 16) & 0xFF;
      }
    }

    const aliasSquared = CONFIG.ALIAS * CONFIG.ALIAS;
    const avgR = Math.round(totalR / aliasSquared);
    const avgG = Math.round(totalG / aliasSquared);
    const avgB = Math.round(totalB / aliasSquared);
    return (255 << 24) | (avgB << 16) | (avgG << 8) | avgR;
  }, [palette.bgColor, palette.palGamma, palette.colorLUTRef]);

  // Clear canvas
  const clearCanvas = useCallback((size: number) => {
    const canvasEl = canvas.canvasRef.current;
    if (!canvasEl) return;
    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = `rgb(${palette.bgColor.r}, ${palette.bgColor.g}, ${palette.bgColor.b})`;
    ctx.fillRect(0, 0, size, size);
  }, [canvas.canvasRef, palette.bgColor]);

  // Draw hits to canvas
  const draw = useCallback((
    hits: Uint32Array,
    maxHitsVal: number,
    size: number,
    iteratorSize: number
  ) => {
    const canvasEl = canvas.canvasRef.current;
    if (!canvasEl) return;
    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;

    const effectiveMax = palette.palScale ? maxHitsVal : palette.palMax;
    canvas.setMaxHits(maxHitsVal);

    let poolEntry = canvas.imageDataPoolRef.current;
    if (!poolEntry || poolEntry.size !== size) {
      poolEntry = { data: ctx.createImageData(size, size), size };
      canvas.imageDataPoolRef.current = poolEntry;
    }
    const imageData = poolEntry.data;
    const data32 = new Uint32Array(imageData.data.buffer);

    for (let py = 0; py < size; py++) {
      for (let px = 0; px < size; px++) {
        data32[py * size + px] = getColorRGB(px, py, hits, effectiveMax, iteratorSize);
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, [canvas, palette.palScale, palette.palMax, getColorRGB]);

  // Initialize worker
  const initializeWorker = useCallback((size: number = canvas.canvasSize, options?: any) => {
    // Use overrides if provided
    const currentType = options?.typeOverride ?? attractor.attractorType;
    const currentIcon = options?.iconOverride ?? attractor.iconParams;
    const currentClifford = options?.cliffordOverride ?? attractor.cliffordParams;
    const currentDeJong = options?.deJongOverride ?? attractor.deJongParams;
    const currentTinkerbell = options?.tinkerbellOverride ?? attractor.tinkerbellParams;
    const currentHenon = options?.henonOverride ?? attractor.henonParams;
    const currentBedhead = options?.bedheadOverride ?? attractor.bedheadParams;
    const currentSvensson = options?.svenssonOverride ?? attractor.svenssonParams;
    const currentFractalDream = options?.fractalDreamOverride ?? attractor.fractalDreamParams;
    const currentHopalong = options?.hopalongOverride ?? attractor.hopalongParams;
    const currentSymmetricQuilt = options?.symmetricQuiltOverride ?? attractor.symmetricQuiltParams;
    const currentMandelbrot = options?.mandelbrotOverride ?? attractor.mandelbrotParams;
    const currentJulia = options?.juliaOverride ?? attractor.juliaParams;
    const currentBurningShip = options?.burningShipOverride ?? attractor.burningShipParams;
    const currentTricorn = options?.tricornOverride ?? attractor.tricornParams;
    const currentMultibrot = options?.multibrotOverride ?? attractor.multibrotParams;
    const currentNewton = options?.newtonOverride ?? attractor.newtonParams;
    const currentPhoenix = options?.phoenixOverride ?? attractor.phoenixParams;
    const currentLyapunov = options?.lyapunovOverride ?? attractor.lyapunovParams;
    const currentGumowskiMira = options?.gumowskiMiraOverride ?? attractor.gumowskiMiraParams;
    const currentSprott = options?.sprottOverride ?? attractor.sprottParams;
    const currentSymmetricFractal = options?.symmetricFractalOverride ?? attractor.symmetricFractalParams;
    const currentDeRham = options?.deRhamOverride ?? attractor.deRhamParams;
    const currentConradi = options?.conradiOverride ?? attractor.conradiParams;
    const currentMobius = options?.mobiusOverride ?? attractor.mobiusParams;
    const currentJasonRampe1 = options?.jasonRampe1Override ?? attractor.jasonRampe1Params;
    const currentJasonRampe2 = options?.jasonRampe2Override ?? attractor.jasonRampe2Params;
    const currentJasonRampe3 = options?.jasonRampe3Override ?? attractor.jasonRampe3Params;
    const currentPalette = options?.paletteOverride ?? palette.paletteData;
    const currentPalGamma = options?.palGammaOverride ?? palette.palGamma;

    // Stop running iteration
    if (canvas.intervalRef.current) {
      clearInterval(canvas.intervalRef.current);
      canvas.intervalRef.current = null;
    }
    canvas.setIterating(false);

    // Terminate existing worker
    if (canvas.workerRef.current) {
      canvas.workerRef.current.terminate();
    }

    const canvasEl = canvas.canvasRef.current;
    if (!canvasEl) return;

    // Handle transferred canvas
    if (canvas.canvasTransferredRef.current) {
      canvas.canvasTransferredRef.current = false;
      canvas.setCanvasKey(k => k + 1);
      return;
    }

    // Create worker
    const worker = new Worker("worker.js");
    canvas.workerRef.current = worker;

    // Get scale
    let scale: number;
    switch (currentType) {
      case "symmetric_icon": scale = currentIcon.scale; break;
      case "clifford": scale = currentClifford.scale; break;
      case "dejong": scale = currentDeJong.scale; break;
      case "tinkerbell": scale = currentTinkerbell.scale; break;
      case "henon": scale = currentHenon.scale; break;
      case "bedhead": scale = currentBedhead.scale; break;
      case "svensson": scale = currentSvensson.scale; break;
      case "fractal_dream": scale = currentFractalDream.scale; break;
      case "hopalong": scale = currentHopalong.scale; break;
      case "symmetric_quilt": scale = currentSymmetricQuilt.scale; break;
      case "gumowski_mira": scale = currentGumowskiMira.scale; break;
      case "sprott": scale = currentSprott.scale; break;
      case "symmetric_fractal": scale = currentSymmetricFractal.scale; break;
      case "derham": scale = currentDeRham.scale; break;
      case "conradi": scale = currentConradi.scale; break;
      case "mobius": scale = currentMobius.scale; break;
      case "jason_rampe1": scale = currentJasonRampe1.scale; break;
      case "jason_rampe2": scale = currentJasonRampe2.scale; break;
      case "jason_rampe3": scale = currentJasonRampe3.scale; break;
      default: scale = 1;
    }

    // Build iterator payload
    let iteratorPayload: { name: string; parameters: Record<string, number>; sequence?: string };
    switch (currentType) {
      case "symmetric_icon":
        iteratorPayload = { name: "symmetric_icon", parameters: { alpha: currentIcon.alpha, betha: currentIcon.betha, gamma: currentIcon.gamma, delta: currentIcon.delta, lambda: currentIcon.lambda, omega: currentIcon.omega, degree: currentIcon.degree, npdegree: currentIcon.npdegree } };
        break;
      case "clifford":
        iteratorPayload = { name: "clifford_iterator", parameters: { alpha: currentClifford.alpha, beta: currentClifford.beta, gamma: currentClifford.gamma, delta: currentClifford.delta } };
        break;
      case "dejong":
        iteratorPayload = { name: "dejong_iterator", parameters: { alpha: currentDeJong.alpha, beta: currentDeJong.beta, gamma: currentDeJong.gamma, delta: currentDeJong.delta } };
        break;
      case "tinkerbell":
        iteratorPayload = { name: "tinkerbell_iterator", parameters: { alpha: currentTinkerbell.alpha, beta: currentTinkerbell.beta, gamma: currentTinkerbell.gamma, delta: currentTinkerbell.delta } };
        break;
      case "henon":
        iteratorPayload = { name: "henon_iterator", parameters: { alpha: currentHenon.alpha, beta: currentHenon.beta } };
        break;
      case "bedhead":
        iteratorPayload = { name: "bedhead_iterator", parameters: { alpha: currentBedhead.alpha, beta: currentBedhead.beta } };
        break;
      case "svensson":
        iteratorPayload = { name: "svensson_iterator", parameters: { alpha: currentSvensson.alpha, beta: currentSvensson.beta, gamma: currentSvensson.gamma, delta: currentSvensson.delta } };
        break;
      case "fractal_dream":
        iteratorPayload = { name: "fractal_dream_iterator", parameters: { alpha: currentFractalDream.alpha, beta: currentFractalDream.beta, gamma: currentFractalDream.gamma, delta: currentFractalDream.delta } };
        break;
      case "hopalong":
        iteratorPayload = { name: "hopalong_iterator", parameters: { alpha: currentHopalong.alpha, beta: currentHopalong.beta, gamma: currentHopalong.gamma } };
        break;
      case "symmetric_quilt":
        iteratorPayload = { name: "symmetric_quilt", parameters: { lambda: currentSymmetricQuilt.lambda, alpha: currentSymmetricQuilt.alpha, beta: currentSymmetricQuilt.beta, gamma: currentSymmetricQuilt.gamma, omega: currentSymmetricQuilt.omega, m: currentSymmetricQuilt.m, shift: currentSymmetricQuilt.shift } };
        break;
      case "mandelbrot":
        iteratorPayload = { name: "mandelbrot", parameters: { centerX: currentMandelbrot.centerX, centerY: currentMandelbrot.centerY, zoom: currentMandelbrot.zoom, maxIter: currentMandelbrot.maxIter } };
        break;
      case "julia":
        iteratorPayload = { name: "julia", parameters: { cReal: currentJulia.cReal, cImag: currentJulia.cImag, centerX: currentJulia.centerX, centerY: currentJulia.centerY, zoom: currentJulia.zoom, maxIter: currentJulia.maxIter } };
        break;
      case "burningship":
        iteratorPayload = { name: "burningship", parameters: { centerX: currentBurningShip.centerX, centerY: currentBurningShip.centerY, zoom: currentBurningShip.zoom, maxIter: currentBurningShip.maxIter } };
        break;
      case "tricorn":
        iteratorPayload = { name: "tricorn", parameters: { centerX: currentTricorn.centerX, centerY: currentTricorn.centerY, zoom: currentTricorn.zoom, maxIter: currentTricorn.maxIter } };
        break;
      case "multibrot":
        iteratorPayload = { name: "multibrot", parameters: { centerX: currentMultibrot.centerX, centerY: currentMultibrot.centerY, zoom: currentMultibrot.zoom, maxIter: currentMultibrot.maxIter, power: currentMultibrot.power } };
        break;
      case "newton":
        iteratorPayload = { name: "newton", parameters: { centerX: currentNewton.centerX, centerY: currentNewton.centerY, zoom: currentNewton.zoom, maxIter: currentNewton.maxIter } };
        break;
      case "phoenix":
        iteratorPayload = { name: "phoenix", parameters: { centerX: currentPhoenix.centerX, centerY: currentPhoenix.centerY, zoom: currentPhoenix.zoom, maxIter: currentPhoenix.maxIter, cReal: currentPhoenix.cReal, cImag: currentPhoenix.cImag, p: currentPhoenix.p } };
        break;
      case "lyapunov":
        iteratorPayload = { name: "lyapunov", parameters: { aMin: currentLyapunov.aMin, aMax: currentLyapunov.aMax, bMin: currentLyapunov.bMin, bMax: currentLyapunov.bMax, maxIter: currentLyapunov.maxIter }, sequence: currentLyapunov.sequence };
        break;
      case "gumowski_mira":
        iteratorPayload = { name: "gumowski_mira_iterator", parameters: { mu: currentGumowskiMira.mu, alpha: currentGumowskiMira.alpha, sigma: currentGumowskiMira.sigma } };
        break;
      case "sprott":
        iteratorPayload = { name: "sprott_iterator", parameters: { a1: currentSprott.a1, a2: currentSprott.a2, a3: currentSprott.a3, a4: currentSprott.a4, a5: currentSprott.a5, a6: currentSprott.a6, a7: currentSprott.a7, a8: currentSprott.a8, a9: currentSprott.a9, a10: currentSprott.a10, a11: currentSprott.a11, a12: currentSprott.a12 } };
        break;
      case "symmetric_fractal":
        iteratorPayload = { name: "symmetric_fractal_iterator", parameters: { a: currentSymmetricFractal.a, b: currentSymmetricFractal.b, c: currentSymmetricFractal.c, d: currentSymmetricFractal.d, alpha: currentSymmetricFractal.alpha, beta: currentSymmetricFractal.beta, p: currentSymmetricFractal.p, reflect: currentSymmetricFractal.reflect } };
        break;
      case "derham":
        iteratorPayload = { name: "derham_iterator", parameters: { alpha: currentDeRham.alpha, beta: currentDeRham.beta, curveType: currentDeRham.curveType } };
        break;
      case "conradi":
        iteratorPayload = { name: "conradi_iterator", parameters: { r1: currentConradi.r1, theta1: currentConradi.theta1, r2: currentConradi.r2, theta2: currentConradi.theta2, a: currentConradi.a, n: currentConradi.n, variant: currentConradi.variant } };
        break;
      case "mobius":
        iteratorPayload = { name: "mobius_iterator", parameters: { aRe: currentMobius.aRe, aIm: currentMobius.aIm, bRe: currentMobius.bRe, bIm: currentMobius.bIm, cRe: currentMobius.cRe, cIm: currentMobius.cIm, dRe: currentMobius.dRe, dIm: currentMobius.dIm, n: currentMobius.n } };
        break;
      case "jason_rampe1":
        iteratorPayload = { name: "jason_rampe1_iterator", parameters: { alpha: currentJasonRampe1.alpha, beta: currentJasonRampe1.beta, gamma: currentJasonRampe1.gamma, delta: currentJasonRampe1.delta } };
        break;
      case "jason_rampe2":
        iteratorPayload = { name: "jason_rampe2_iterator", parameters: { alpha: currentJasonRampe2.alpha, beta: currentJasonRampe2.beta, gamma: currentJasonRampe2.gamma, delta: currentJasonRampe2.delta } };
        break;
      case "jason_rampe3":
        iteratorPayload = { name: "jason_rampe3_iterator", parameters: { alpha: currentJasonRampe3.alpha, beta: currentJasonRampe3.beta, gamma: currentJasonRampe3.gamma, delta: currentJasonRampe3.delta } };
        break;
      default:
        iteratorPayload = { name: "clifford_iterator", parameters: { alpha: -1.7, beta: 1.3, gamma: -0.1, delta: -1.21 } };
    }

    const canUseOffscreen = canvas.useOffscreenRef.current && !canvas.canvasTransferredRef.current;

    if (canUseOffscreen) {
      canvasEl.width = size;
      canvasEl.height = size;

      try {
        const offscreen = canvasEl.transferControlToOffscreen();
        canvas.canvasTransferredRef.current = true;

        const payload = {
          mode: "offscreen",
          canvas: offscreen,
          point: { xpos: 0.001, ypos: 0.002 },
          size,
          alias: CONFIG.ALIAS,
          scale,
          palette: currentPalette,
          colorLUTSize: CONFIG.COLOR_LUT_SIZE,
          iterator: iteratorPayload,
          palGamma: currentPalGamma,
          palScale: palette.palScale,
          palMax: palette.palMax,
          bgColor: palette.bgColor,
        };

        worker.postMessage({ type: "initialize", payload }, [offscreen]);

        worker.onmessage = (event: MessageEvent<any>) => {
          const { type, payload } = event.data;
          if (type === "stats") {
            canvas.setMaxHits(payload.maxHits);
            canvas.setTotalIterations(payload.totalIterations || 0);
          } else if (type === "imageExport") {
            const blob = payload.blob;
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.download = `attractor-${Date.now()}.png`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
          }
        };
      } catch {
        canvas.useOffscreenRef.current = false;
        initializeWorker(size, options);
        return;
      }
    } else {
      canvasEl.width = size;
      canvasEl.height = size;
      clearCanvas(size);

      const payload = {
        mode: "legacy",
        point: { xpos: 0.001, ypos: 0.002 },
        size,
        alias: CONFIG.ALIAS,
        scale,
        palette: currentPalette,
        iterator: iteratorPayload,
        bgColor: palette.bgColor,
      };

      worker.postMessage({ type: "initialize", payload });

      worker.onmessage = (event: MessageEvent<any>) => {
        const { hits, maxHits: hitMax, iteratorSize } = event.data.payload;
        canvas.pendingRenderRef.current = { hits, maxHits: hitMax, iteratorSize };

        if (canvas.rafIdRef.current === null) {
          canvas.rafIdRef.current = requestAnimationFrame(() => {
            const pending = canvas.pendingRenderRef.current;
            if (pending) {
              draw(pending.hits, pending.maxHits, size, pending.iteratorSize);
            }
            canvas.rafIdRef.current = null;
          });
        }
      };
    }

    setTimeout(() => {
      const container = canvas.containerRef.current;
      if (container) {
        const { width, height } = container.getBoundingClientRect();
        const fitZoom = Math.min((width - 40) / size, (height - 40) / size);
        canvas.setZoom(Math.max(0.1, Math.min(fitZoom, 1)));
      }
    }, 100);

    canvas.setMaxHits(0);
    canvas.setTotalIterations(0);
  }, [attractor, palette, canvas, draw, clearCanvas]);

  // Initialize on mount
  useEffect(() => {
    initializeWorker(canvas.canvasSize);
    return () => canvas.cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-initialize when canvasKey changes
  useEffect(() => {
    if (canvas.canvasKey > 0) {
      initializeWorker(canvas.canvasSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas.canvasKey]);

  // Track container size
  useEffect(() => {
    const container = canvas.containerRef.current;
    if (!container) return;
    const updateSize = () => {
      canvas.setContainerSize({ width: container.clientWidth, height: container.clientHeight });
    };
    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [canvas]);

  // Re-render when palette settings (bgColor, gamma, scale) change - skip during iteration
  useEffect(() => {
    // Skip if currently iterating to avoid interfering with iteration loop
    if (canvas.iterating) return;

    // Send update to worker if available
    if (canvas.workerRef.current) {
      canvas.workerRef.current.postMessage({
        type: "updatePaletteSettings",
        payload: {
          palGamma: palette.palGamma,
          palScale: palette.palScale,
          palMax: palette.palMax,
          bgColor: palette.bgColor,
        },
      });
    }
  }, [palette.bgColor, palette.palGamma, palette.palScale, palette.palMax, canvas.iterating, canvas.workerRef]);

  // Re-render when palette colors change - skip during iteration
  useEffect(() => {
    // Skip if currently iterating to avoid interfering with iteration loop
    if (canvas.iterating) return;

    // Send update to worker if available
    if (canvas.workerRef.current) {
      canvas.workerRef.current.postMessage({
        type: "updatePalette",
        payload: {
          palette: palette.paletteData,
          colorLUTSize: CONFIG.COLOR_LUT_SIZE,
        },
      });
    }
  }, [palette.paletteKey, palette.paletteData, canvas.iterating, canvas.workerRef]);

  // Handlers
  const handleIterating = useCallback(() => {
    // For fractals, just re-render instead of continuous iteration
    if (attractor.isFractalType) {
      initializeWorker(canvas.canvasSize);
      return;
    }

    // For attractors, toggle continuous iteration
    if (canvas.iterating) {
      if (canvas.intervalRef.current) {
        clearInterval(canvas.intervalRef.current);
        canvas.intervalRef.current = null;
      }
      canvas.setIterating(false);
    } else {
      canvas.workerRef.current?.postMessage({ type: "iterate" });
      canvas.intervalRef.current = setInterval(() => {
        canvas.workerRef.current?.postMessage({ type: "iterate" });
      }, CONFIG.ITERATION_INTERVAL_MS);
      canvas.setIterating(true);
    }
  }, [canvas, attractor.isFractalType, initializeWorker]);

  const handleSaveImage = useCallback(() => {
    if (canvas.useOffscreenRef.current && canvas.canvasTransferredRef.current && canvas.workerRef.current) {
      canvas.workerRef.current.postMessage({ type: "exportImage" });
      return;
    }
    const canvasEl = canvas.canvasRef.current;
    if (!canvasEl) return;
    const link = document.createElement("a");
    link.download = `attractor-${Date.now()}.png`;
    link.href = canvasEl.toDataURL("image/png");
    link.click();
  }, [canvas]);

  const handleCanvasSizeChange = useCallback((size: number) => {
    canvas.setCanvasSize(size);
    initializeWorker(size);
  }, [canvas, initializeWorker]);

  const handleAttractorTypeChange = useCallback((type: AttractorType) => {
    attractor.setAttractorType(type);
    initializeWorker(canvas.canvasSize, { typeOverride: type });
  }, [attractor, canvas.canvasSize, initializeWorker]);

  const handleFitToView = useCallback(() => {
    const container = canvas.containerRef.current;
    if (!container) return;
    const { width, height } = container.getBoundingClientRect();
    const fitZoom = Math.min((width - 40) / canvas.canvasSize, (height - 40) / canvas.canvasSize);
    canvas.setZoom(Math.max(0.1, Math.min(fitZoom, 1)));
  }, [canvas]);

  const handleZoomIn = useCallback(() => canvas.setZoom(Math.min(canvas.zoom * 1.5, 4)), [canvas]);
  const handleZoomOut = useCallback(() => canvas.setZoom(Math.max(canvas.zoom / 1.5, 0.1)), [canvas]);
  const handleZoomReset = useCallback(() => canvas.setZoom(1), [canvas]);

  // Fractal mouse handlers
  const handleFractalMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!attractor.isFractalType) return;
    fractalZoom.handleMouseDown(e, canvas.zoom);
  }, [attractor.isFractalType, fractalZoom, canvas.zoom]);

  const handleFractalMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    fractalZoom.handleMouseMove(e, canvas.zoom);
  }, [fractalZoom, canvas.zoom]);

  const handleFractalMouseUp = useCallback(() => {
    if (!fractalZoom.isDragging) {
      fractalZoom.handleMouseUp();
      return;
    }

    if (attractor.attractorType === "lyapunov") {
      const newParams = fractalZoom.calculateNewLyapunovParams(attractor.lyapunovParams, canvas.canvasSize);
      if (newParams) {
        attractor.setLyapunovParams(newParams);
        initializeWorker(canvas.canvasSize, { lyapunovOverride: newParams });
      }
    } else {
      // Handle standard fractals
      let params: any;
      let setter: (p: any) => void;
      let overrideKey: string;

      switch (attractor.attractorType) {
        case "mandelbrot": params = attractor.mandelbrotParams; setter = attractor.setMandelbrotParams; overrideKey = "mandelbrotOverride"; break;
        case "julia": params = attractor.juliaParams; setter = attractor.setJuliaParams; overrideKey = "juliaOverride"; break;
        case "burningship": params = attractor.burningShipParams; setter = attractor.setBurningShipParams; overrideKey = "burningShipOverride"; break;
        case "tricorn": params = attractor.tricornParams; setter = attractor.setTricornParams; overrideKey = "tricornOverride"; break;
        case "multibrot": params = attractor.multibrotParams; setter = attractor.setMultibrotParams; overrideKey = "multibrotOverride"; break;
        case "newton": params = attractor.newtonParams; setter = attractor.setNewtonParams; overrideKey = "newtonOverride"; break;
        case "phoenix": params = attractor.phoenixParams; setter = attractor.setPhoenixParams; overrideKey = "phoenixOverride"; break;
        default: fractalZoom.clearDrag(); return;
      }

      const newParams = fractalZoom.calculateNewParams(params, canvas.canvasSize);
      if (newParams) {
        setter(newParams);
        initializeWorker(canvas.canvasSize, { [overrideKey]: newParams });
      }
    }

    fractalZoom.clearDrag();
  }, [attractor, fractalZoom, canvas.canvasSize, initializeWorker]);

  const handleResetFractalView = useCallback(() => {
    const { DEFAULT_MANDELBROT } = require("../../attractors/mandelbrot");
    const { DEFAULT_JULIA } = require("../../attractors/julia");
    const { DEFAULT_BURNING_SHIP } = require("../../attractors/burningship");
    const { DEFAULT_TRICORN } = require("../../attractors/tricorn");
    const { DEFAULT_MULTIBROT } = require("../../attractors/multibrot");
    const { DEFAULT_NEWTON } = require("../../attractors/newton");
    const { DEFAULT_PHOENIX } = require("../../attractors/phoenix");
    const { DEFAULT_LYAPUNOV } = require("../../attractors/lyapunov");

    switch (attractor.attractorType) {
      case "mandelbrot": attractor.setMandelbrotParams(DEFAULT_MANDELBROT); initializeWorker(canvas.canvasSize, { mandelbrotOverride: DEFAULT_MANDELBROT }); break;
      case "julia": attractor.setJuliaParams(DEFAULT_JULIA); initializeWorker(canvas.canvasSize, { juliaOverride: DEFAULT_JULIA }); break;
      case "burningship": attractor.setBurningShipParams(DEFAULT_BURNING_SHIP); initializeWorker(canvas.canvasSize, { burningShipOverride: DEFAULT_BURNING_SHIP }); break;
      case "tricorn": attractor.setTricornParams(DEFAULT_TRICORN); initializeWorker(canvas.canvasSize, { tricornOverride: DEFAULT_TRICORN }); break;
      case "multibrot": attractor.setMultibrotParams(DEFAULT_MULTIBROT); initializeWorker(canvas.canvasSize, { multibrotOverride: DEFAULT_MULTIBROT }); break;
      case "newton": attractor.setNewtonParams(DEFAULT_NEWTON); initializeWorker(canvas.canvasSize, { newtonOverride: DEFAULT_NEWTON }); break;
      case "phoenix": attractor.setPhoenixParams(DEFAULT_PHOENIX); initializeWorker(canvas.canvasSize, { phoenixOverride: DEFAULT_PHOENIX }); break;
      case "lyapunov": attractor.setLyapunovParams(DEFAULT_LYAPUNOV); initializeWorker(canvas.canvasSize, { lyapunovOverride: DEFAULT_LYAPUNOV }); break;
    }
  }, [attractor, canvas.canvasSize, initializeWorker]);

  // Drag selection rect
  const dragSelection = useMemo(() => {
    if (!fractalZoom.dragStart || !fractalZoom.dragEnd) return null;
    return {
      left: Math.min(fractalZoom.dragStart.x, fractalZoom.dragEnd.x),
      top: Math.min(fractalZoom.dragStart.y, fractalZoom.dragEnd.y),
      width: Math.abs(fractalZoom.dragEnd.x - fractalZoom.dragStart.x),
      height: Math.abs(fractalZoom.dragEnd.y - fractalZoom.dragStart.y),
    };
  }, [fractalZoom.dragStart, fractalZoom.dragEnd]);

  // Get current maxIter for stats
  const currentMaxIter = useMemo(() => {
    switch (attractor.attractorType) {
      case "mandelbrot": return attractor.mandelbrotParams.maxIter;
      case "julia": return attractor.juliaParams.maxIter;
      case "burningship": return attractor.burningShipParams.maxIter;
      case "tricorn": return attractor.tricornParams.maxIter;
      case "multibrot": return attractor.multibrotParams.maxIter;
      case "newton": return attractor.newtonParams.maxIter;
      case "phoenix": return attractor.phoenixParams.maxIter;
      case "lyapunov": return attractor.lyapunovParams.maxIter;
      default: return undefined;
    }
  }, [attractor]);

  // Render attractor controls
  const renderControls = () => {
    const disabled = !canvas.isEditing;

    switch (attractor.attractorType) {
      case "symmetric_icon":
        return (
          <SymmetricIconControls
            params={attractor.iconParams}
            onChange={attractor.setIconParams}
            disabled={disabled}
            selectedPreset={attractor.iconPreset}
            onPresetChange={(i) => {
              attractor.setIconPreset(i);
              const icon = symmetricIconData[i];
              const newParams = { alpha: icon.alpha, betha: icon.betha, gamma: icon.gamma, delta: icon.delta, omega: icon.omega, lambda: icon.lambda, degree: icon.degree, npdegree: icon.npdegree, scale: icon.scale };
              attractor.setIconParams(newParams);
              palette.setPaletteData(icon.paletteData);
              palette.setPalGamma(icon.palGamma ?? 0.5);
              initializeWorker(canvas.canvasSize, { iconOverride: newParams, paletteOverride: icon.paletteData, palGammaOverride: icon.palGamma ?? 0.5 });
            }}
          />
        );
      case "symmetric_quilt":
        return (
          <SymmetricQuiltControls
            params={attractor.symmetricQuiltParams}
            onChange={attractor.setSymmetricQuiltParams}
            disabled={disabled}
            selectedPreset={attractor.symmetricQuiltPreset}
            onPresetChange={(i) => {
              attractor.setSymmetricQuiltPreset(i);
              const p = symmetricQuiltData[i];
              const newParams = { lambda: p.lambda, alpha: p.alpha, beta: p.beta, gamma: p.gamma, omega: p.omega, m: p.m, shift: p.shift, scale: p.scale };
              attractor.setSymmetricQuiltParams(newParams);
              initializeWorker(canvas.canvasSize, { symmetricQuiltOverride: newParams });
            }}
          />
        );
      case "clifford":
        return (
          <CliffordControls
            params={attractor.cliffordParams}
            onChange={attractor.setCliffordParams}
            disabled={disabled}
            selectedPreset={attractor.cliffordPreset}
            onPresetChange={(i) => {
              attractor.setCliffordPreset(i);
              const p = cliffordData[i];
              const newParams = { alpha: p.alpha, beta: p.beta, gamma: p.gamma, delta: p.delta, scale: p.scale };
              attractor.setCliffordParams(newParams);
              initializeWorker(canvas.canvasSize, { cliffordOverride: newParams });
            }}
          />
        );
      case "dejong":
        return (
          <DeJongControls
            params={attractor.deJongParams}
            onChange={attractor.setDeJongParams}
            disabled={disabled}
            selectedPreset={attractor.deJongPreset}
            onPresetChange={(i) => {
              attractor.setDeJongPreset(i);
              const p = deJongData[i];
              const newParams = { alpha: p.alpha, beta: p.beta, gamma: p.gamma, delta: p.delta, scale: p.scale };
              attractor.setDeJongParams(newParams);
              initializeWorker(canvas.canvasSize, { deJongOverride: newParams });
            }}
          />
        );
      case "tinkerbell":
        return (
          <TinkerbellControls
            params={attractor.tinkerbellParams}
            onChange={attractor.setTinkerbellParams}
            disabled={disabled}
            selectedPreset={attractor.tinkerbellPreset}
            onPresetChange={(i) => {
              attractor.setTinkerbellPreset(i);
              const p = tinkerbellData[i];
              const newParams = { alpha: p.alpha, beta: p.beta, gamma: p.gamma, delta: p.delta, scale: p.scale };
              attractor.setTinkerbellParams(newParams);
              initializeWorker(canvas.canvasSize, { tinkerbellOverride: newParams });
            }}
          />
        );
      case "henon":
        return (
          <HenonControls
            params={attractor.henonParams}
            onChange={attractor.setHenonParams}
            disabled={disabled}
            selectedPreset={attractor.henonPreset}
            onPresetChange={(i) => {
              attractor.setHenonPreset(i);
              const p = henonData[i];
              const newParams = { alpha: p.alpha, beta: p.beta, scale: p.scale };
              attractor.setHenonParams(newParams);
              initializeWorker(canvas.canvasSize, { henonOverride: newParams });
            }}
          />
        );
      case "bedhead":
        return (
          <BedheadControls
            params={attractor.bedheadParams}
            onChange={attractor.setBedheadParams}
            disabled={disabled}
            selectedPreset={attractor.bedheadPreset}
            onPresetChange={(i) => {
              attractor.setBedheadPreset(i);
              const p = bedheadData[i];
              const newParams = { alpha: p.alpha, beta: p.beta, scale: p.scale };
              attractor.setBedheadParams(newParams);
              initializeWorker(canvas.canvasSize, { bedheadOverride: newParams });
            }}
          />
        );
      case "svensson":
        return (
          <SvenssonControls
            params={attractor.svenssonParams}
            onChange={attractor.setSvenssonParams}
            disabled={disabled}
            selectedPreset={attractor.svenssonPreset}
            onPresetChange={(i) => {
              attractor.setSvenssonPreset(i);
              const p = svenssonData[i];
              const newParams = { alpha: p.alpha, beta: p.beta, gamma: p.gamma, delta: p.delta, scale: p.scale };
              attractor.setSvenssonParams(newParams);
              initializeWorker(canvas.canvasSize, { svenssonOverride: newParams });
            }}
          />
        );
      case "fractal_dream":
        return (
          <FractalDreamControls
            params={attractor.fractalDreamParams}
            onChange={attractor.setFractalDreamParams}
            disabled={disabled}
            selectedPreset={attractor.fractalDreamPreset}
            onPresetChange={(i) => {
              attractor.setFractalDreamPreset(i);
              const p = fractalDreamData[i];
              const newParams = { alpha: p.alpha, beta: p.beta, gamma: p.gamma, delta: p.delta, scale: p.scale };
              attractor.setFractalDreamParams(newParams);
              initializeWorker(canvas.canvasSize, { fractalDreamOverride: newParams });
            }}
          />
        );
      case "hopalong":
        return (
          <HopalongControls
            params={attractor.hopalongParams}
            onChange={attractor.setHopalongParams}
            disabled={disabled}
            selectedPreset={attractor.hopalongPreset}
            onPresetChange={(i) => {
              attractor.setHopalongPreset(i);
              const p = hopalongData[i];
              const newParams = { alpha: p.alpha, beta: p.beta, gamma: p.gamma, scale: p.scale };
              attractor.setHopalongParams(newParams);
              initializeWorker(canvas.canvasSize, { hopalongOverride: newParams });
            }}
          />
        );
      case "mandelbrot":
        return (
          <MandelbrotControls
            params={attractor.mandelbrotParams}
            onChange={attractor.setMandelbrotParams}
            disabled={disabled}
            selectedPreset={attractor.mandelbrotPreset}
            onPresetChange={(i) => {
              attractor.setMandelbrotPreset(i);
              const p = mandelbrotData[i];
              const newParams = { centerX: p.centerX, centerY: p.centerY, zoom: p.zoom, maxIter: p.maxIter };
              attractor.setMandelbrotParams(newParams);
              if (p.paletteData) palette.setPaletteData(p.paletteData);
              palette.setPalGamma(p.palGamma ?? 0.5);
              initializeWorker(canvas.canvasSize, { mandelbrotOverride: newParams, paletteOverride: p.paletteData, palGammaOverride: p.palGamma ?? 0.5 });
            }}
          />
        );
      case "julia":
        return (
          <JuliaControls
            params={attractor.juliaParams}
            onChange={attractor.setJuliaParams}
            disabled={disabled}
            selectedPreset={attractor.juliaPreset}
            onPresetChange={(i) => {
              attractor.setJuliaPreset(i);
              const p = juliaData[i];
              const newParams = { cReal: p.cReal, cImag: p.cImag, centerX: p.centerX, centerY: p.centerY, zoom: p.zoom, maxIter: p.maxIter };
              attractor.setJuliaParams(newParams);
              if (p.paletteData) palette.setPaletteData(p.paletteData);
              palette.setPalGamma(p.palGamma ?? 0.5);
              initializeWorker(canvas.canvasSize, { juliaOverride: newParams, paletteOverride: p.paletteData, palGammaOverride: p.palGamma ?? 0.5 });
            }}
          />
        );
      case "burningship":
        return <BurningShipControls params={attractor.burningShipParams} onChange={attractor.setBurningShipParams} disabled={disabled} />;
      case "tricorn":
        return <TricornControls params={attractor.tricornParams} onChange={attractor.setTricornParams} disabled={disabled} />;
      case "multibrot":
        return <MultibrotControls params={attractor.multibrotParams} onChange={attractor.setMultibrotParams} disabled={disabled} />;
      case "newton":
        return <NewtonControls params={attractor.newtonParams} onChange={attractor.setNewtonParams} disabled={disabled} />;
      case "phoenix":
        return <PhoenixControls params={attractor.phoenixParams} onChange={attractor.setPhoenixParams} disabled={disabled} />;
      case "lyapunov":
        return <LyapunovControls params={attractor.lyapunovParams} onChange={attractor.setLyapunovParams} disabled={disabled} />;
      case "gumowski_mira":
        return (
          <GumowskiMiraControls
            params={attractor.gumowskiMiraParams}
            onChange={attractor.setGumowskiMiraParams}
            disabled={disabled}
            selectedPreset={attractor.gumowskiMiraPreset}
            onPresetChange={(i) => {
              attractor.setGumowskiMiraPreset(i);
              const { gumowskiMiraPresets } = require("../../attractors/gumowskiMira/config");
              const p = gumowskiMiraPresets[i].params;
              attractor.setGumowskiMiraParams(p);
              initializeWorker(canvas.canvasSize, { gumowskiMiraOverride: p });
            }}
          />
        );
      case "sprott":
        return (
          <SprottControls
            params={attractor.sprottParams}
            onChange={attractor.setSprottParams}
            disabled={disabled}
            selectedPreset={attractor.sprottPreset}
            onPresetChange={(i) => {
              attractor.setSprottPreset(i);
              const { sprottPresets } = require("../../attractors/sprott/config");
              const p = sprottPresets[i].params;
              attractor.setSprottParams(p);
              initializeWorker(canvas.canvasSize, { sprottOverride: p });
            }}
          />
        );
      case "symmetric_fractal":
        return (
          <SymmetricFractalControls
            params={attractor.symmetricFractalParams}
            onChange={attractor.setSymmetricFractalParams}
            disabled={disabled}
            selectedPreset={attractor.symmetricFractalPreset}
            onPresetChange={(i) => {
              attractor.setSymmetricFractalPreset(i);
              const { symmetricFractalPresets } = require("../../attractors/symmetricFractal/config");
              const p = symmetricFractalPresets[i].params;
              attractor.setSymmetricFractalParams(p);
              initializeWorker(canvas.canvasSize, { symmetricFractalOverride: p });
            }}
          />
        );
      case "derham":
        return (
          <DeRhamControls
            params={attractor.deRhamParams}
            onChange={attractor.setDeRhamParams}
            disabled={disabled}
            selectedPreset={attractor.deRhamPreset}
            onPresetChange={(i) => {
              attractor.setDeRhamPreset(i);
              const { deRhamPresets } = require("../../attractors/deRham/config");
              const p = deRhamPresets[i].params;
              attractor.setDeRhamParams(p);
              initializeWorker(canvas.canvasSize, { deRhamOverride: p });
            }}
          />
        );
      case "conradi":
        return (
          <ConradiControls
            params={attractor.conradiParams}
            onChange={attractor.setConradiParams}
            disabled={disabled}
            selectedPreset={attractor.conradiPreset}
            onPresetChange={(i) => {
              attractor.setConradiPreset(i);
              const { conradiPresets } = require("../../attractors/conradi/config");
              const p = conradiPresets[i].params;
              attractor.setConradiParams(p);
              initializeWorker(canvas.canvasSize, { conradiOverride: p });
            }}
          />
        );
      case "mobius":
        return (
          <MobiusControls
            params={attractor.mobiusParams}
            onChange={attractor.setMobiusParams}
            disabled={disabled}
            selectedPreset={attractor.mobiusPreset}
            onPresetChange={(i) => {
              attractor.setMobiusPreset(i);
              const { mobiusPresets } = require("../../attractors/mobius/config");
              const p = mobiusPresets[i].params;
              attractor.setMobiusParams(p);
              initializeWorker(canvas.canvasSize, { mobiusOverride: p });
            }}
          />
        );
      case "jason_rampe1":
        return (
          <JasonRampe1Controls
            params={attractor.jasonRampe1Params}
            onChange={attractor.setJasonRampe1Params}
            disabled={disabled}
            selectedPreset={attractor.jasonRampe1Preset}
            onPresetChange={(i) => {
              attractor.setJasonRampe1Preset(i);
              const preset = jasonRampe1Data[i];
              const p = { alpha: preset.alpha, beta: preset.beta, gamma: preset.gamma, delta: preset.delta, scale: preset.scale };
              attractor.setJasonRampe1Params(p);
              initializeWorker(canvas.canvasSize, { jasonRampe1Override: p });
            }}
          />
        );
      case "jason_rampe2":
        return (
          <JasonRampe2Controls
            params={attractor.jasonRampe2Params}
            onChange={attractor.setJasonRampe2Params}
            disabled={disabled}
            selectedPreset={attractor.jasonRampe2Preset}
            onPresetChange={(i) => {
              attractor.setJasonRampe2Preset(i);
              const preset = jasonRampe2Data[i];
              const p = { alpha: preset.alpha, beta: preset.beta, gamma: preset.gamma, delta: preset.delta, scale: preset.scale };
              attractor.setJasonRampe2Params(p);
              initializeWorker(canvas.canvasSize, { jasonRampe2Override: p });
            }}
          />
        );
      case "jason_rampe3":
        return (
          <JasonRampe3Controls
            params={attractor.jasonRampe3Params}
            onChange={attractor.setJasonRampe3Params}
            disabled={disabled}
            selectedPreset={attractor.jasonRampe3Preset}
            onPresetChange={(i) => {
              attractor.setJasonRampe3Preset(i);
              const preset = jasonRampe3Data[i];
              const p = { alpha: preset.alpha, beta: preset.beta, gamma: preset.gamma, delta: preset.delta, scale: preset.scale };
              attractor.setJasonRampe3Params(p);
              initializeWorker(canvas.canvasSize, { jasonRampe3Override: p });
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <PageContainer>
      <Sidebar
        attractorType={attractor.attractorType}
        onAttractorTypeChange={handleAttractorTypeChange}
        canvasSize={canvas.canvasSize}
        onCanvasSizeChange={handleCanvasSizeChange}
        maxHits={canvas.maxHits}
        totalIterations={canvas.totalIterations}
        maxIter={currentMaxIter}
        isEditing={canvas.isEditing}
        onToggleEdit={() => {
          const wasEditing = canvas.isEditing;
          canvas.setIsEditing(!wasEditing);
          // Re-render fractal when locking parameters
          if (wasEditing && attractor.isFractalType) {
            initializeWorker(canvas.canvasSize);
          }
        }}
      >
        {renderControls()}
      </Sidebar>

      <MainContent>
        <CanvasArea
          canvasRef={canvas.canvasRef}
          containerRef={canvas.containerRef}
          canvasSize={canvas.canvasSize}
          zoom={canvas.zoom}
          canvasKey={canvas.canvasKey}
          isFractalType={attractor.isFractalType}
          isDragging={fractalZoom.isDragging}
          dragSelection={dragSelection}
          onMouseDown={handleFractalMouseDown}
          onMouseMove={handleFractalMouseMove}
          onMouseUp={handleFractalMouseUp}
        />

        <ZoomPanel
          onFitToView={handleFitToView}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onZoomReset={handleZoomReset}
          isFractalType={attractor.isFractalType}
          onResetFractalView={handleResetFractalView}
        />

        <ControlPanel
          iterating={canvas.iterating}
          onToggleIteration={handleIterating}
          onOpenPalette={() => setPaletteModalOpen(true)}
          onSaveImage={handleSaveImage}
          isFractalType={attractor.isFractalType}
        />
      </MainContent>

      <PaletteModal
        isOpen={paletteModalOpen}
        onClose={() => setPaletteModalOpen(false)}
        paletteData={palette.paletteData}
        onPaletteChange={palette.setPaletteData}
        palGamma={palette.palGamma}
        onGammaChange={palette.setPalGamma}
        palScale={palette.palScale}
        onScaleModeChange={palette.setPalScale}
        palMax={palette.palMax}
        onPalMaxChange={palette.setPalMax}
        bgColor={palette.bgColor}
        onBgColorChange={palette.setBgColor}
      />
    </PageContainer>
  );
}

export default Home;
