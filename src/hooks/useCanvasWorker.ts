import { useRef, useState, useCallback, useEffect } from "react";
import { HitsData, CONFIG, AttractorType, supportsOffscreenCanvas } from "../attractors/shared/types";
import { Color } from "../model-controller/Attractor/palette";
import { buildIteratorPayload, getScale } from "./iteratorConfig";
import { registry } from "../attractors/registry";

interface BgColor {
  r: number;
  g: number;
  b: number;
}

interface PaletteOptions {
  paletteData: Color[];
  palGamma: number;
  palScale: boolean;
  palMax: number;
  bgColor: BgColor;
  colorLUTRef: React.MutableRefObject<Uint32Array | null>;
  paletteKey: number;
}

interface UseCanvasWorkerOptions {
  attractorType: AttractorType;
  params: Record<string, any>;
  isFractalType: boolean;
  palette: PaletteOptions;
  getFilename: () => string;
}

interface InitializeOverrides {
  size?: number;
  attractorType?: AttractorType;
  params?: Record<string, any>;
  oversampling?: number;
  paletteData?: Color[];
  palGamma?: number;
}

export interface UseCanvasWorkerReturn {
  // DOM refs (for JSX)
  canvasRef: React.RefObject<HTMLCanvasElement>;
  containerRef: React.RefObject<HTMLDivElement>;

  // Fast-updating stats isolated from React renders
  statsRef: React.MutableRefObject<{ maxHits: number; totalIterations: number }>;

  // Read-only state
  canvasSize: number;
  /** Increments each time a fractal render's first (preview) frame is on the canvas. */
  fractalFrame: number;
  containerSize: { width: number; height: number };
  iterating: boolean;
  canvasKey: number;
  isEditing: boolean;
  oversampling: number;
  rendering: boolean;
  /** 0..1 while a fractal's full-res pass is painting, null otherwise. */
  renderProgress: number | null;
  /** PNG of the current canvas (null if unavailable). */
  requestSnapshot: () => Promise<Blob | null>;

  // Actions
  initialize: (overrides?: InitializeOverrides) => void;
  toggleIteration: () => void;
  hunt: () => void;
  stopHunt: () => void;
  saveImage: () => void;
  setCanvasSize: (size: number) => void;
  setOversampling: (value: number) => void;
  setIsEditing: (editing: boolean) => void;
}

export function useCanvasWorker(options: UseCanvasWorkerOptions): UseCanvasWorkerReturn {
  const { attractorType, params, isFractalType, palette, getFilename } = options;

  // DOM refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef({ maxHits: 0, totalIterations: 0 });

  // Internal refs
  const workerRef = useRef<Worker | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingRenderRef = useRef<HitsData | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const imageDataPoolRef = useRef<{ data: ImageData; size: number } | null>(null);
  const useOffscreenRef = useRef<boolean>(supportsOffscreenCanvas());
  const canvasTransferredRef = useRef<boolean>(false);

  // State
  const [canvasSize, setCanvasSizeState] = useState(CONFIG.DEFAULT_CANVAS_SIZE);
  const [fractalFrame, setFractalFrame] = useState(0);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [iterating, setIterating] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [oversampling, setOversamplingState] = useState(CONFIG.ALIAS);
  const [rendering, setRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState<number | null>(null);
  const snapshotWaiters = useRef(new Map<number, (b: Blob | null) => void>());
  const snapshotId = useRef(0);

  // Stable ref to latest props so callbacks don't need to re-bind
  const latestProps = useRef({
    attractorType, params, palette, oversampling, canvasSize, isFractalType, getFilename,
  });
  useEffect(() => {
    latestProps.current = {
      attractorType, params, palette, oversampling, canvasSize, isFractalType, getFilename,
    };
  });

  // --- Internal drawing helpers (legacy mode only) ---

  const getColorRGB = useCallback((
    x: number,
    y: number,
    hits: Uint32Array,
    maxHitsVal: number,
    iteratorSize: number,
    currentOversampling: number,
    bgColor: BgColor,
    palGamma: number,
    colorLUTRef: React.MutableRefObject<Uint32Array | null>,
  ): number => {
    const lut = colorLUTRef.current;
    if (!lut || maxHitsVal === 0) {
      return (255 << 24) | (bgColor.b << 16) | (bgColor.g << 8) | bgColor.r;
    }

    const alias = currentOversampling;
    let totalR = 0, totalG = 0, totalB = 0;
    const startX = x * alias;
    const startY = y * alias;
    const lutSize = CONFIG.COLOR_LUT_SIZE;
    const invMaxHits = 1 / maxHitsVal;

    for (let dy = 0; dy < alias; dy++) {
      const row = startY + dy;
      for (let dx = 0; dx < alias; dx++) {
        const col = startX + dx;
        const hitVal = hits[col * iteratorSize + row] || 0;

        if (hitVal === 0) {
          totalR += bgColor.r;
          totalG += bgColor.g;
          totalB += bgColor.b;
          continue;
        }

        const ratio = Math.pow(hitVal * invMaxHits, palGamma);
        const lutIndex = Math.min(Math.floor(ratio * lutSize), lutSize - 1);
        const color = lut[lutIndex];
        totalR += color & 0xFF;
        totalG += (color >> 8) & 0xFF;
        totalB += (color >> 16) & 0xFF;
      }
    }

    const aliasSquared = alias * alias;
    const avgR = Math.round(totalR / aliasSquared);
    const avgG = Math.round(totalG / aliasSquared);
    const avgB = Math.round(totalB / aliasSquared);
    return (255 << 24) | (avgB << 16) | (avgG << 8) | avgR;
  }, []);

  const clearCanvas = useCallback((size: number, bgColor: BgColor) => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = `rgb(${bgColor.r}, ${bgColor.g}, ${bgColor.b})`;
    ctx.fillRect(0, 0, size, size);
  }, []);

  const draw = useCallback((
    hits: Uint32Array,
    maxHitsVal: number,
    size: number,
    iteratorSize: number,
    currentOversampling: number,
    pal: PaletteOptions,
  ) => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;

    const effectiveMax = pal.palScale ? maxHitsVal : pal.palMax;
    statsRef.current.maxHits = maxHitsVal;

    let poolEntry = imageDataPoolRef.current;
    if (!poolEntry || poolEntry.size !== size) {
      poolEntry = { data: ctx.createImageData(size, size), size };
      imageDataPoolRef.current = poolEntry;
    }
    const imageData = poolEntry.data;
    const data32 = new Uint32Array(imageData.data.buffer);

    for (let py = 0; py < size; py++) {
      for (let px = 0; px < size; px++) {
        data32[py * size + px] = getColorRGB(
          px, py, hits, effectiveMax, iteratorSize,
          currentOversampling, pal.bgColor, pal.palGamma, pal.colorLUTRef,
        );
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, [getColorRGB]);

  // --- Cleanup ---

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  const stopHunt = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: "stopHunt" });
    }
  }, []);

  const hunt = useCallback(() => {
    const props = latestProps.current;
    const module = registry.get(props.attractorType);
    if (!module || !module.math || !module.paramRanges) return;

    if (workerRef.current) {
      const scale = getScale(props.attractorType, props.params);
      workerRef.current.postMessage({
        type: "hunt",
        payload: {
          math: module.math,
          ranges: module.paramRanges,
          size: props.canvasSize,
          alias: props.oversampling,
          scale
        }
      });
    }
  }, []);

  // --- Core: initialize ---

  const initialize = useCallback((overrides?: InitializeOverrides) => {
    const props = latestProps.current;
    const currentSize = overrides?.size ?? props.canvasSize;
    const currentType = overrides?.attractorType ?? props.attractorType;
    const currentParams = overrides?.params ?? props.params;
    const currentOversampling = overrides?.oversampling ?? props.oversampling;
    const currentPaletteData = overrides?.paletteData ?? props.palette.paletteData;
    const currentPalGamma = overrides?.palGamma ?? props.palette.palGamma;
    const currentPalette = props.palette;

    // Stop running iteration
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIterating(false);

    // Terminate existing worker
    if (workerRef.current) {
      workerRef.current.terminate();
    }

    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    // Handle transferred canvas
    if (canvasTransferredRef.current) {
      canvasTransferredRef.current = false;
      setCanvasKey(k => k + 1);
      return;
    }

    // Create worker
    const worker = new Worker("worker.js");
    workerRef.current = worker;

    // Build payload using config
    const scale = getScale(currentType, currentParams);
    const iteratorPayload = buildIteratorPayload(currentType, currentParams);

    const canUseOffscreen = useOffscreenRef.current && !canvasTransferredRef.current;

    if (canUseOffscreen) {
      canvasEl.width = currentSize;
      canvasEl.height = currentSize;

      try {
        const offscreen = canvasEl.transferControlToOffscreen();
        canvasTransferredRef.current = true;

        const payload = {
          mode: "offscreen",
          canvas: offscreen,
          point: { xpos: 0.001, ypos: 0.002 },
          size: currentSize,
          alias: currentOversampling,
          scale,
          palette: currentPaletteData,
          colorLUTSize: CONFIG.COLOR_LUT_SIZE,
          iterator: iteratorPayload,
          palGamma: currentPalGamma,
          palScale: currentPalette.palScale,
          palMax: currentPalette.palMax,
          bgColor: currentPalette.bgColor,
          useSharedBuffer: typeof SharedArrayBuffer !== 'undefined'
        };

        if (latestProps.current.isFractalType) setRendering(true);
        worker.postMessage({ type: "initialize", payload }, [offscreen]);

        worker.onmessage = (event: MessageEvent<any>) => {
          const { type, payload } = event.data;
          if (type === "stats") {
            statsRef.current.maxHits = payload.maxHits;
            statsRef.current.totalIterations = payload.totalIterations || 0;
            if (payload.fractalPreview) { setRendering(true); setRenderProgress(0); setFractalFrame(f => f + 1); }
            if (payload.fractalComplete) { setRendering(false); setRenderProgress(null); }
          } else if (type === "fractalProgress") {
            setRendering(true);
            setRenderProgress(payload.progress);
          } else if (type === "snapshot") {
            const resolve = snapshotWaiters.current.get(payload.id);
            snapshotWaiters.current.delete(payload.id);
            resolve?.(payload.blob ?? null);
          } else if (type === "imageExport") {
            const blob = payload.blob;
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.download = latestProps.current.getFilename();
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
          } else if (type === "huntResult") {
            if (payload.success) {
              (window as any).dispatchEvent(new CustomEvent("attractorHuntFound", { detail: payload.params }));
            } else if (!payload.interrupted) {
              hunt();
            }
          }
        };
      } catch {
        useOffscreenRef.current = false;
        // Retry without offscreen - call ourselves again
        initialize(overrides);
        return;
      }
    } else {
      canvasEl.width = currentSize;
      canvasEl.height = currentSize;
      clearCanvas(currentSize, currentPalette.bgColor);

      const payload = {
        mode: "legacy",
        point: { xpos: 0.001, ypos: 0.002 },
        size: currentSize,
        alias: currentOversampling,
        scale,
        palette: currentPaletteData,
        iterator: iteratorPayload,
        bgColor: currentPalette.bgColor,
        useSharedBuffer: typeof SharedArrayBuffer !== 'undefined'
      };

      worker.postMessage({ type: "initialize", payload });

      worker.onmessage = (event: MessageEvent<any>) => {
        const { type, payload } = event.data;
        
        if (type === "init_shared") {
           return;
        }

        if (type === "result" || type === "result_shared") {
           const hits = payload.hits; 
           const hitMax = payload.maxHits;
           const iteratorSize = payload.iteratorSize;
           statsRef.current.maxHits = hitMax;
           
           if (hits) {
             pendingRenderRef.current = { hits, maxHits: hitMax, iteratorSize };
           }

           if (rafIdRef.current === null) {
             rafIdRef.current = requestAnimationFrame(() => {
               const pending = pendingRenderRef.current;
               if (pending) {
                 draw(
                   pending.hits, pending.maxHits, currentSize, pending.iteratorSize,
                   currentOversampling, latestProps.current.palette,
                 );
               }
               rafIdRef.current = null;
             });
           }
        } else if (type === "huntResult") {
          if (payload.success) {
            (window as any).dispatchEvent(new CustomEvent("attractorHuntFound", { detail: payload.params }));
          } else if (!payload.interrupted) {
            hunt();
          }
        }
      };
    }

    statsRef.current.maxHits = 0;
    statsRef.current.totalIterations = 0;
  }, [clearCanvas, draw, hunt]);

  // --- Effects ---

  // Initialize on mount
  useEffect(() => {
    initialize();
    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-initialize when canvasKey changes (after offscreen canvas re-mount)
  useEffect(() => {
    if (canvasKey > 0) {
      initialize();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasKey]);

  // Track container size
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const updateSize = () => {
      setContainerSize({ width: container.clientWidth, height: container.clientHeight });
    };
    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // Re-render when palette settings change - skip during iteration
  useEffect(() => {
    if (iterating) return;
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: "updatePaletteSettings",
        payload: {
          palGamma: palette.palGamma,
          palScale: palette.palScale,
          palMax: palette.palMax,
          bgColor: palette.bgColor,
        },
      });
    }
  }, [palette.bgColor, palette.palGamma, palette.palScale, palette.palMax, iterating]);

  // Re-render when palette colors change - skip during iteration
  useEffect(() => {
    if (iterating) return;
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: "updatePalette",
        payload: {
          palette: palette.paletteData,
          colorLUTSize: CONFIG.COLOR_LUT_SIZE,
        },
      });
    }
  }, [palette.paletteKey, palette.paletteData, iterating]);

  // --- Actions ---

  const toggleIteration = useCallback(() => {
    const props = latestProps.current;
    if (props.isFractalType) {
      initialize();
      return;
    }

    if (iterating) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIterating(false);
    } else {
      workerRef.current?.postMessage({ type: "iterate" });
      intervalRef.current = setInterval(() => {
        workerRef.current?.postMessage({ type: "iterate" });
      }, CONFIG.ITERATION_INTERVAL_MS);
      setIterating(true);
    }
  }, [iterating, initialize]);

  const saveImage = useCallback(() => {
    if (useOffscreenRef.current && canvasTransferredRef.current && workerRef.current) {
      workerRef.current.postMessage({ type: "exportImage" });
      return;
    }
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const link = document.createElement("a");
    link.download = latestProps.current.getFilename();
    link.href = canvasEl.toDataURL("image/png");
    link.click();
  }, []);

  const requestSnapshot = useCallback((): Promise<Blob | null> => {
    if (useOffscreenRef.current && canvasTransferredRef.current && workerRef.current) {
      const worker = workerRef.current;
      const id = ++snapshotId.current;
      return new Promise(resolve => {
        snapshotWaiters.current.set(id, resolve);
        worker.postMessage({ type: "snapshot", payload: { id } });
        // Never leave the caller hanging (e.g. the worker was replaced meanwhile).
        setTimeout(() => {
          if (snapshotWaiters.current.delete(id)) resolve(null);
        }, 3000);
      });
    }
    const canvasEl = canvasRef.current;
    if (!canvasEl) return Promise.resolve(null);
    return new Promise(resolve => canvasEl.toBlob(b => resolve(b), "image/png"));
  }, []);

  const setCanvasSize = useCallback((size: number) => {
    setCanvasSizeState(size);
    initialize({ size });
  }, [initialize]);

  const setOversampling = useCallback((value: number) => {
    setOversamplingState(value);
    initialize({ oversampling: value });
  }, [initialize]);

  return {
    canvasRef,
    containerRef,
    canvasSize,
    fractalFrame,
    containerSize,
    statsRef,
    iterating,
    canvasKey,
    isEditing,
    oversampling,
    rendering,
    renderProgress,
    requestSnapshot,
    initialize,
    toggleIteration,
    hunt,
    stopHunt,
    saveImage,
    setCanvasSize,
    setOversampling,
    setIsEditing,
  };
}

export default useCanvasWorker;
