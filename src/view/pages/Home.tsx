import React, { useEffect, useRef, useState, useCallback, useMemo, lazy, Suspense } from "react";
import { Color, Palette } from "../../model-controller/Attractor/palette";
import symmetricIconData, { cliffordData, deJongData, tinkerbellData, henonData, bedheadData, svenssonData, fractalDreamData, hopalongData, symmetricQuiltData, mandelbrotData, juliaData } from "../../Parametersets";

// Lazy load ColorBar - only loads when palette modal opens
const ColorBar = lazy(() => import("../components/colorbar"));

// Configuration constants
const CONFIG = {
  DEFAULT_CANVAS_SIZE: 1800,
  ALIAS: 2,
  INITIAL_ICON_INDEX: 32,
  ITERATION_INTERVAL_MS: 500, // Reduced for faster visual feedback
  COLOR_LUT_SIZE: 2048, // Size of color lookup table (higher = smoother gradients)
};

// Types
type AttractorType = "symmetric_icon" | "clifford" | "dejong" | "tinkerbell" | "henon" | "bedhead" | "svensson" | "fractal_dream" | "hopalong" | "symmetric_quilt" | "mandelbrot" | "julia";

interface HitsData {
  hits: Uint32Array;
  maxHits: number;
  iteratorSize: number;
}

interface WorkerMessage {
  type: string;
  payload: HitsData;
}

interface SymmetricIconParams {
  alpha: number;
  betha: number;
  gamma: number;
  delta: number;
  omega: number;
  lambda: number;
  degree: number;
  npdegree: number;
  scale: number;
}

interface CliffordParams {
  alpha: number;
  beta: number;
  gamma: number;
  delta: number;
  scale: number;
}

interface DeJongParams {
  alpha: number;
  beta: number;
  gamma: number;
  delta: number;
  scale: number;
}

interface TinkerbellParams {
  alpha: number;
  beta: number;
  gamma: number;
  delta: number;
  scale: number;
}

interface HenonParams {
  alpha: number;
  beta: number;
  scale: number;
}

interface BedheadParams {
  alpha: number;
  beta: number;
  scale: number;
}

interface SvenssonParams {
  alpha: number;
  beta: number;
  gamma: number;
  delta: number;
  scale: number;
}

interface FractalDreamParams {
  alpha: number;
  beta: number;
  gamma: number;
  delta: number;
  scale: number;
}

interface HopalongParams {
  alpha: number;
  beta: number;
  gamma: number;
  scale: number;
}

interface SymmetricQuiltParams {
  lambda: number;
  alpha: number;
  beta: number;
  gamma: number;
  omega: number;
  m: number;
  shift: number;
  scale: number;
}

interface MandelbrotParams {
  centerX: number;
  centerY: number;
  zoom: number;
  maxIter: number;
}

interface JuliaParams {
  cReal: number;
  cImag: number;
  centerX: number;
  centerY: number;
  zoom: number;
  maxIter: number;
}

interface BurningShipParams {
  centerX: number;
  centerY: number;
  zoom: number;
  maxIter: number;
}

interface TricornParams {
  centerX: number;
  centerY: number;
  zoom: number;
  maxIter: number;
}

interface MultibrotParams {
  centerX: number;
  centerY: number;
  zoom: number;
  maxIter: number;
  power: number;
}

interface NewtonParams {
  centerX: number;
  centerY: number;
  zoom: number;
  maxIter: number;
}

interface PhoenixParams {
  centerX: number;
  centerY: number;
  zoom: number;
  maxIter: number;
  cReal: number;
  cImag: number;
  p: number;
}

interface LyapunovParams {
  aMin: number;
  aMax: number;
  bMin: number;
  bMax: number;
  maxIter: number;
  sequence: string;
}

interface IconData {
  name: string;
  alpha: number;
  betha: number;
  gamma: number;
  delta: number;
  omega: number;
  lambda: number;
  degree: number;
  npdegree: number;
  scale: number;
  palGamma?: number;
  paletteData: Color[];
}

// Default Clifford parameters
const DEFAULT_CLIFFORD: CliffordParams = {
  alpha: -1.7,
  beta: 1.3,
  gamma: -0.1,
  delta: -1.21,
  scale: 0.25,
};

// Default palette for Clifford
const DEFAULT_PALETTE: Color[] = [
  { position: 0, red: 0, green: 0, blue: 0 },
  { position: 0.2, red: 255, green: 0, blue: 0 },
  { position: 0.4, red: 255, green: 255, blue: 0 },
  { position: 0.6, red: 0, green: 255, blue: 0 },
  { position: 0.8, red: 0, green: 255, blue: 255 },
  { position: 1, red: 255, green: 255, blue: 255 },
];

// Default De Jong parameters
const DEFAULT_DEJONG: DeJongParams = {
  alpha: -2.0,
  beta: -2.0,
  gamma: -1.2,
  delta: 2.0,
  scale: 0.4,
};

// Default Tinkerbell parameters
const DEFAULT_TINKERBELL: TinkerbellParams = {
  alpha: 0.9,
  beta: -0.6013,
  gamma: 2.0,
  delta: 0.5,
  scale: 0.15,
};

// Default Henon parameters
const DEFAULT_HENON: HenonParams = {
  alpha: 1.4,
  beta: 0.3,
  scale: 0.5,
};

// Default Bedhead parameters
const DEFAULT_BEDHEAD: BedheadParams = {
  alpha: -0.81,
  beta: -0.92,
  scale: 0.3,
};

// Default Svensson parameters
const DEFAULT_SVENSSON: SvenssonParams = {
  alpha: 1.4,
  beta: 1.56,
  gamma: 1.4,
  delta: -6.56,
  scale: 0.15,
};

// Default Fractal Dream parameters
const DEFAULT_FRACTAL_DREAM: FractalDreamParams = {
  alpha: -0.966918,
  beta: 2.879879,
  gamma: 0.765145,
  delta: 0.744728,
  scale: 0.35,
};

// Default Hopalong parameters
const DEFAULT_HOPALONG: HopalongParams = {
  alpha: 2.0,
  beta: 1.0,
  gamma: 0.0,
  scale: 0.008,
};

// Default Symmetric Quilt parameters
// Note: m (memory) must be non-zero to avoid fixed points!
const DEFAULT_SYMMETRIC_QUILT: SymmetricQuiltParams = {
  lambda: 0.9,
  alpha: -0.6,
  beta: 0.1,
  gamma: -0.4,
  omega: 0.0,
  m: 0.9,
  shift: 0.0,
  scale: 1.0,
};

// Default Mandelbrot parameters
const DEFAULT_MANDELBROT: MandelbrotParams = {
  centerX: -0.5,
  centerY: 0,
  zoom: 1,
  maxIter: 256,
};

// Default Julia parameters (classic Julia set at c = -0.7 + 0.27i)
const DEFAULT_JULIA: JuliaParams = {
  cReal: -0.7,
  cImag: 0.27015,
  centerX: 0,
  centerY: 0,
  zoom: 1,
  maxIter: 256,
};

// Default Burning Ship parameters
const DEFAULT_BURNING_SHIP: BurningShipParams = {
  centerX: -0.4,
  centerY: -0.6,
  zoom: 1,
  maxIter: 256,
};

// Default Tricorn parameters
const DEFAULT_TRICORN: TricornParams = {
  centerX: 0,
  centerY: 0,
  zoom: 1,
  maxIter: 256,
};

// Default Multibrot parameters (power 3)
const DEFAULT_MULTIBROT: MultibrotParams = {
  centerX: 0,
  centerY: 0,
  zoom: 1,
  maxIter: 256,
  power: 3,
};

// Default Newton parameters (z³ - 1)
const DEFAULT_NEWTON: NewtonParams = {
  centerX: 0,
  centerY: 0,
  zoom: 1,
  maxIter: 64,
};

// Default Phoenix parameters
const DEFAULT_PHOENIX: PhoenixParams = {
  centerX: 0,
  centerY: 0,
  zoom: 1,
  maxIter: 256,
  cReal: 0.5667,
  cImag: 0,
  p: -0.5,
};

// Default Lyapunov parameters
const DEFAULT_LYAPUNOV: LyapunovParams = {
  aMin: 2,
  aMax: 4,
  bMin: 2,
  bMax: 4,
  maxIter: 100,
  sequence: "AB",
};

// Format large numbers compactly (e.g., 1.2K, 64M)
const formatCompact = (num: number): string => {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return num.toString();
};

// Feature detection for OffscreenCanvas
const supportsOffscreenCanvas = (): boolean => {
  if (typeof OffscreenCanvas === 'undefined') return false;
  try {
    const test = document.createElement('canvas');
    const offscreen = test.transferControlToOffscreen();
    const ctx = offscreen.getContext('2d');
    return ctx !== null;
  } catch {
    return false;
  }
};

// Static styles - Warm Glassmorphism theme
const STYLES = {
  // Glass panel base
  glassPanel: {
    background: "rgba(255, 180, 120, 0.06)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 180, 120, 0.15)",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
  },
  selectStyle: {
    width: "100%",
    padding: "12px 14px",
    fontSize: "13px",
    borderRadius: "10px",
    border: "1px solid rgba(255, 180, 120, 0.2)",
    boxSizing: "border-box" as const,
    background: "rgba(0, 0, 0, 0.3)",
    color: "#ffffff",
    fontWeight: 500,
    cursor: "pointer",
    outline: "none",
    transition: "all 0.2s ease",
  },
  labelStyle: {
    display: "block",
    marginBottom: "8px",
    fontSize: "11px",
    fontWeight: 600,
    color: "rgba(255, 180, 120, 0.7)",
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
  },
  fieldStyle: {
    marginBottom: "16px",
  },
  cardStyle: {
    background: "rgba(0, 0, 0, 0.25)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    border: "1px solid rgba(255, 180, 120, 0.15)",
    padding: "16px",
    borderRadius: "16px",
    marginBottom: "16px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
  },
  buttonPrimary: {
    padding: "8px 16px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    background: "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(245, 158, 11, 0.3)",
    transition: "all 0.2s ease",
  },
  buttonSuccess: {
    padding: "14px 24px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(34, 197, 94, 0.4)",
    transition: "all 0.2s ease",
  },
  buttonDanger: {
    padding: "14px 24px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(239, 68, 68, 0.4)",
    transition: "all 0.2s ease",
  },
  buttonSecondary: {
    padding: "10px 16px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    background: "rgba(0, 0, 0, 0.3)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    color: "#ffffff",
    border: "1px solid rgba(255, 180, 120, 0.2)",
    borderRadius: "10px",
    transition: "all 0.2s ease",
  },
  buttonSmall: {
    padding: "8px 12px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    background: "rgba(0, 0, 0, 0.3)",
    color: "#ffffff",
    border: "1px solid rgba(255, 180, 120, 0.2)",
    borderRadius: "8px",
    minWidth: "36px",
    transition: "all 0.2s ease",
  },
  buttonGlass: {
    padding: "10px 16px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    background: "rgba(0, 0, 0, 0.3)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    color: "#ffffff",
    border: "1px solid rgba(255, 180, 120, 0.2)",
    borderRadius: "10px",
    transition: "all 0.2s ease",
  },
  floatingButton: {
    width: "44px",
    height: "44px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    background: "rgba(255, 180, 120, 0.15)",
    border: "1px solid rgba(255, 180, 120, 0.3)",
    borderRadius: "10px",
    color: "#ffffff",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
};

function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const intervalRef = useRef<NodeJS.Timer | null>(null);
  const paletteRef = useRef<Palette | null>(null);
  const colorLUTRef = useRef<Uint32Array | null>(null);
  const pendingRenderRef = useRef<HitsData | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const imageDataPoolRef = useRef<{ data: ImageData; size: number } | null>(null);
  const useOffscreenRef = useRef<boolean>(supportsOffscreenCanvas());
  const canvasTransferredRef = useRef<boolean>(false);

  // Canvas size and zoom state
  const [canvasSize, setCanvasSize] = useState(CONFIG.DEFAULT_CANVAS_SIZE);
  const [zoom, setZoom] = useState(1);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Attractor type state
  const [attractorType, setAttractorType] = useState<AttractorType>("symmetric_icon");

  // Preset selection
  const [selectedPreset, setSelectedPreset] = useState(CONFIG.INITIAL_ICON_INDEX);

  // Symmetric Icon parameters
  const [iconParams, setIconParams] = useState<SymmetricIconParams>(() => {
    const icon = symmetricIconData[CONFIG.INITIAL_ICON_INDEX];
    return {
      alpha: icon.alpha,
      betha: icon.betha,
      gamma: icon.gamma,
      delta: icon.delta,
      omega: icon.omega,
      lambda: icon.lambda,
      degree: icon.degree,
      npdegree: icon.npdegree,
      scale: icon.scale,
    };
  });

  // Clifford parameters
  const [cliffordParams, setCliffordParams] = useState<CliffordParams>(DEFAULT_CLIFFORD);
  const [cliffordPreset, setCliffordPreset] = useState(0);

  // De Jong parameters
  const [deJongParams, setDeJongParams] = useState<DeJongParams>(DEFAULT_DEJONG);
  const [deJongPreset, setDeJongPreset] = useState(0);

  // Tinkerbell parameters
  const [tinkerbellParams, setTinkerbellParams] = useState<TinkerbellParams>(DEFAULT_TINKERBELL);
  const [tinkerbellPreset, setTinkerbellPreset] = useState(0);

  // Henon parameters
  const [henonParams, setHenonParams] = useState<HenonParams>(DEFAULT_HENON);
  const [henonPreset, setHenonPreset] = useState(0);

  // Bedhead parameters
  const [bedheadParams, setBedheadParams] = useState<BedheadParams>(DEFAULT_BEDHEAD);
  const [bedheadPreset, setBedheadPreset] = useState(0);

  // Svensson parameters
  const [svenssonParams, setSvenssonParams] = useState<SvenssonParams>(DEFAULT_SVENSSON);
  const [svenssonPreset, setSvenssonPreset] = useState(0);

  // Fractal Dream parameters
  const [fractalDreamParams, setFractalDreamParams] = useState<FractalDreamParams>(DEFAULT_FRACTAL_DREAM);
  const [fractalDreamPreset, setFractalDreamPreset] = useState(0);

  // Hopalong parameters
  const [hopalongParams, setHopalongParams] = useState<HopalongParams>(DEFAULT_HOPALONG);
  const [hopalongPreset, setHopalongPreset] = useState(0);

  // Symmetric Quilt parameters
  const [symmetricQuiltParams, setSymmetricQuiltParams] = useState<SymmetricQuiltParams>(DEFAULT_SYMMETRIC_QUILT);
  const [symmetricQuiltPreset, setSymmetricQuiltPreset] = useState(0);

  // Mandelbrot parameters
  const [mandelbrotParams, setMandelbrotParams] = useState<MandelbrotParams>(DEFAULT_MANDELBROT);
  const [mandelbrotPreset, setMandelbrotPreset] = useState(0);

  // Julia parameters
  const [juliaParams, setJuliaParams] = useState<JuliaParams>(DEFAULT_JULIA);
  const [juliaPreset, setJuliaPreset] = useState(0);

  // New fractal parameters
  const [burningShipParams, setBurningShipParams] = useState<BurningShipParams>(DEFAULT_BURNING_SHIP);
  const [tricornParams, setTricornParams] = useState<TricornParams>(DEFAULT_TRICORN);
  const [multibrotParams, setMultibrotParams] = useState<MultibrotParams>(DEFAULT_MULTIBROT);
  const [newtonParams, setNewtonParams] = useState<NewtonParams>(DEFAULT_NEWTON);
  const [phoenixParams, setPhoenixParams] = useState<PhoenixParams>(DEFAULT_PHOENIX);
  const [lyapunovParams, setLyapunovParams] = useState<LyapunovParams>(DEFAULT_LYAPUNOV);

  // Current palette data
  const [paletteData, setPaletteData] = useState<Color[]>(
    symmetricIconData[CONFIG.INITIAL_ICON_INDEX].paletteData
  );

  const [maxHits, setMaxHits] = useState(0);
  const [totalIterations, setTotalIterations] = useState(0);
  const [iterating, setIterating] = useState(false);

  // Palette gamma and scaling settings - initialize from preset
  const [palGamma, setPalGamma] = useState(() => symmetricIconData[CONFIG.INITIAL_ICON_INDEX].palGamma ?? 0.5);
  const [palScale, setPalScale] = useState(true); // true = dynamic (maxHits), false = fixed (palMax)
  const [palMax, setPalMax] = useState(10000);
  const [bgColor, setBgColor] = useState({ r: 255, g: 255, b: 255 }); // Background color for 0-hit pixels
  const [paletteKey, setPaletteKey] = useState(0);
  const [canvasKey, setCanvasKey] = useState(0); // Force new canvas element when incremented
  const [isEditing, setIsEditing] = useState(false); // Enable/disable parameter editing
  const [paletteModalOpen, setPaletteModalOpen] = useState(false); // Palette editor modal

  // Fractal drag-to-zoom state
  const [dragStart, setDragStart] = useState<{x: number, y: number} | null>(null);
  const [dragEnd, setDragEnd] = useState<{x: number, y: number} | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Collapsed state for attractor settings
  const [attractorCollapsed, setAttractorCollapsed] = useState(false);

  // Initialize palette and generate color LUT
  useEffect(() => {
    paletteRef.current = new Palette(paletteData, () => {});

    // Generate color lookup table for fast rendering
    const lut = new Uint32Array(CONFIG.COLOR_LUT_SIZE);
    for (let i = 0; i < CONFIG.COLOR_LUT_SIZE; i++) {
      const ratio = i / CONFIG.COLOR_LUT_SIZE; // Map to palette range 0-1
      const col = paletteRef.current.color(ratio);
      // Pack RGBA into single 32-bit value (ABGR format for ImageData)
      lut[i] = (255 << 24) | (col.blue << 16) | (col.green << 8) | col.red;
    }
    colorLUTRef.current = lut;

    setPaletteKey(prev => prev + 1);
  }, [paletteData]);

  // Track container size for proper scrolling behavior
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      setContainerSize({
        width: container.clientWidth,
        height: container.clientHeight,
      });
    };

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  // Get color from LUT with anti-aliasing (optimized for flat TypedArray)
  const getColorRGB = useCallback((
    x: number,
    y: number,
    hits: Uint32Array,
    maxHitsVal: number,
    iteratorSize: number
  ): number => {
    const lut = colorLUTRef.current;
    if (!lut || maxHitsVal === 0) {
      // Return background color (ABGR format)
      return (255 << 24) | (bgColor.b << 16) | (bgColor.g << 8) | bgColor.r;
    }

    let totalR = 0, totalG = 0, totalB = 0;
    const startX = x * CONFIG.ALIAS;
    const startY = y * CONFIG.ALIAS;
    const lutSize = CONFIG.COLOR_LUT_SIZE;
    const invMaxHits = 1 / maxHitsVal;

    for (let dy = 0; dy < CONFIG.ALIAS; dy++) {
      const row = (startY + dy);
      for (let dx = 0; dx < CONFIG.ALIAS; dx++) {
        const col = startX + dx;
        // Flat array access: x * height + y
        const hitVal = hits[col * iteratorSize + row] || 0;

        // Background (no hits) uses custom background color
        if (hitVal === 0) {
          totalR += bgColor.r;
          totalG += bgColor.g;
          totalB += bgColor.b;
          continue;
        }

        const lutIndex = Math.min(lutSize - 1, Math.floor(hitVal * invMaxHits * lutSize));
        const color = lut[lutIndex];
        totalR += color & 0xFF;
        totalG += (color >> 8) & 0xFF;
        totalB += (color >> 16) & 0xFF;
      }
    }

    const aliasSq = CONFIG.ALIAS * CONFIG.ALIAS;
    const r = Math.round(totalR / aliasSq);
    const g = Math.round(totalG / aliasSq);
    const b = Math.round(totalB / aliasSq);
    return (255 << 24) | (b << 16) | (g << 8) | r;
  }, [bgColor]);

  // Clear canvas to white
  const clearCanvas = useCallback((size: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
    }
  }, []);

  // Optimized draw using ImageData and Uint32Array
  const draw = useCallback((hits: Uint32Array, hitMaxVal: number, size: number, iteratorSize: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    setMaxHits(hitMaxVal);

    // If no hits yet, just show white
    if (hitMaxVal === 0) {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, size, size);
      return;
    }

    // Reuse ImageData if same size (pooling to reduce GC)
    let imageData: ImageData;
    const pool = imageDataPoolRef.current;
    if (pool && pool.size === size) {
      imageData = pool.data;
    } else {
      imageData = context.createImageData(size, size);
      imageDataPoolRef.current = { data: imageData, size };
    }

    // Use Uint32Array view for faster pixel writes
    const data32 = new Uint32Array(imageData.data.buffer);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = y * size + x;
        data32[idx] = getColorRGB(x, y, hits, hitMaxVal, iteratorSize);
      }
    }

    context.putImageData(imageData, 0, 0);
  }, [getColorRGB]);

  // Initialize worker - accepts optional overrides for parameters (needed because state updates are async)
  const initializeWorker = useCallback((
    size: number = canvasSize,
    options?: {
      iconOverride?: SymmetricIconParams;
      cliffordOverride?: CliffordParams;
      deJongOverride?: DeJongParams;
      tinkerbellOverride?: TinkerbellParams;
      henonOverride?: HenonParams;
      bedheadOverride?: BedheadParams;
      svenssonOverride?: SvenssonParams;
      fractalDreamOverride?: FractalDreamParams;
      hopalongOverride?: HopalongParams;
      symmetricQuiltOverride?: SymmetricQuiltParams;
      mandelbrotOverride?: MandelbrotParams;
      juliaOverride?: JuliaParams;
      burningShipOverride?: BurningShipParams;
      tricornOverride?: TricornParams;
      multibrotOverride?: MultibrotParams;
      newtonOverride?: NewtonParams;
      phoenixOverride?: PhoenixParams;
      lyapunovOverride?: LyapunovParams;
      paletteOverride?: Color[];
      typeOverride?: AttractorType;
      palGammaOverride?: number;
    }
  ) => {
    // Use overrides if provided, otherwise use current state
    const currentType = options?.typeOverride ?? attractorType;
    const currentIcon = options?.iconOverride ?? iconParams;
    const currentClifford = options?.cliffordOverride ?? cliffordParams;
    const currentDeJong = options?.deJongOverride ?? deJongParams;
    const currentTinkerbell = options?.tinkerbellOverride ?? tinkerbellParams;
    const currentHenon = options?.henonOverride ?? henonParams;
    const currentBedhead = options?.bedheadOverride ?? bedheadParams;
    const currentSvensson = options?.svenssonOverride ?? svenssonParams;
    const currentFractalDream = options?.fractalDreamOverride ?? fractalDreamParams;
    const currentHopalong = options?.hopalongOverride ?? hopalongParams;
    const currentSymmetricQuilt = options?.symmetricQuiltOverride ?? symmetricQuiltParams;
    const currentMandelbrot = options?.mandelbrotOverride ?? mandelbrotParams;
    const currentJulia = options?.juliaOverride ?? juliaParams;
    const currentBurningShip = options?.burningShipOverride ?? burningShipParams;
    const currentTricorn = options?.tricornOverride ?? tricornParams;
    const currentMultibrot = options?.multibrotOverride ?? multibrotParams;
    const currentNewton = options?.newtonOverride ?? newtonParams;
    const currentPhoenix = options?.phoenixOverride ?? phoenixParams;
    const currentLyapunov = options?.lyapunovOverride ?? lyapunovParams;
    const currentPalette = options?.paletteOverride ?? paletteData;
    const currentPalGamma = options?.palGammaOverride ?? palGamma;

    // Stop any running iteration
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIterating(false);

    // Terminate existing worker
    if (workerRef.current) {
      workerRef.current.terminate();
    }

    // Get canvas element
    const canvas = canvasRef.current;
    if (!canvas) return;

    // If canvas was already transferred, we need a fresh canvas
    // Increment canvasKey to trigger React to create a new canvas element
    if (canvasTransferredRef.current) {
      canvasTransferredRef.current = false;
      setCanvasKey(k => k + 1);
      return; // Will re-run after React creates new canvas
    }

    // Create new worker
    const worker = new Worker("worker.js");
    workerRef.current = worker;

    // Determine scale based on attractor type
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
      case "mandelbrot": scale = 1; break; // Fractals use zoom instead of scale
      case "julia": scale = 1; break;
      case "burningship": scale = 1; break;
      case "tricorn": scale = 1; break;
      case "multibrot": scale = 1; break;
      case "newton": scale = 1; break;
      case "phoenix": scale = 1; break;
      case "lyapunov": scale = 1; break;
      default: scale = 0.25;
    }

    // Build iterator payload based on attractor type
    let iteratorPayload: { name: string; parameters: Record<string, number> };
    switch (currentType) {
      case "symmetric_icon":
        iteratorPayload = {
          name: "symmetric_icon",
          parameters: {
            alpha: currentIcon.alpha,
            betha: currentIcon.betha,
            gamma: currentIcon.gamma,
            delta: currentIcon.delta,
            lambda: currentIcon.lambda,
            omega: currentIcon.omega,
            degree: currentIcon.degree,
            npdegree: currentIcon.npdegree,
          },
        };
        break;
      case "clifford":
        iteratorPayload = {
          name: "clifford_iterator",
          parameters: {
            alpha: currentClifford.alpha,
            beta: currentClifford.beta,
            gamma: currentClifford.gamma,
            delta: currentClifford.delta,
          },
        };
        break;
      case "dejong":
        iteratorPayload = {
          name: "dejong_iterator",
          parameters: {
            alpha: currentDeJong.alpha,
            beta: currentDeJong.beta,
            gamma: currentDeJong.gamma,
            delta: currentDeJong.delta,
          },
        };
        break;
      case "tinkerbell":
        iteratorPayload = {
          name: "tinkerbell_iterator",
          parameters: {
            alpha: currentTinkerbell.alpha,
            beta: currentTinkerbell.beta,
            gamma: currentTinkerbell.gamma,
            delta: currentTinkerbell.delta,
          },
        };
        break;
      case "henon":
        iteratorPayload = {
          name: "henon_iterator",
          parameters: {
            alpha: currentHenon.alpha,
            beta: currentHenon.beta,
          },
        };
        break;
      case "bedhead":
        iteratorPayload = {
          name: "bedhead_iterator",
          parameters: {
            alpha: currentBedhead.alpha,
            beta: currentBedhead.beta,
          },
        };
        break;
      case "svensson":
        iteratorPayload = {
          name: "svensson_iterator",
          parameters: {
            alpha: currentSvensson.alpha,
            beta: currentSvensson.beta,
            gamma: currentSvensson.gamma,
            delta: currentSvensson.delta,
          },
        };
        break;
      case "fractal_dream":
        iteratorPayload = {
          name: "fractal_dream_iterator",
          parameters: {
            alpha: currentFractalDream.alpha,
            beta: currentFractalDream.beta,
            gamma: currentFractalDream.gamma,
            delta: currentFractalDream.delta,
          },
        };
        break;
      case "hopalong":
        iteratorPayload = {
          name: "hopalong_iterator",
          parameters: {
            alpha: currentHopalong.alpha,
            beta: currentHopalong.beta,
            gamma: currentHopalong.gamma,
          },
        };
        break;
      case "symmetric_quilt":
        iteratorPayload = {
          name: "symmetric_quilt",
          parameters: {
            lambda: currentSymmetricQuilt.lambda,
            alpha: currentSymmetricQuilt.alpha,
            beta: currentSymmetricQuilt.beta,
            gamma: currentSymmetricQuilt.gamma,
            omega: currentSymmetricQuilt.omega,
            m: currentSymmetricQuilt.m,
            shift: currentSymmetricQuilt.shift,
          },
        };
        break;
      case "mandelbrot":
        iteratorPayload = {
          name: "mandelbrot",
          parameters: {
            centerX: currentMandelbrot.centerX,
            centerY: currentMandelbrot.centerY,
            zoom: currentMandelbrot.zoom,
            maxIter: currentMandelbrot.maxIter,
          },
        };
        break;
      case "julia":
        iteratorPayload = {
          name: "julia",
          parameters: {
            cReal: currentJulia.cReal,
            cImag: currentJulia.cImag,
            centerX: currentJulia.centerX,
            centerY: currentJulia.centerY,
            zoom: currentJulia.zoom,
            maxIter: currentJulia.maxIter,
          },
        };
        break;
      case "burningship":
        iteratorPayload = {
          name: "burningship",
          parameters: {
            centerX: currentBurningShip.centerX,
            centerY: currentBurningShip.centerY,
            zoom: currentBurningShip.zoom,
            maxIter: currentBurningShip.maxIter,
          },
        };
        break;
      case "tricorn":
        iteratorPayload = {
          name: "tricorn",
          parameters: {
            centerX: currentTricorn.centerX,
            centerY: currentTricorn.centerY,
            zoom: currentTricorn.zoom,
            maxIter: currentTricorn.maxIter,
          },
        };
        break;
      case "multibrot":
        iteratorPayload = {
          name: "multibrot",
          parameters: {
            centerX: currentMultibrot.centerX,
            centerY: currentMultibrot.centerY,
            zoom: currentMultibrot.zoom,
            maxIter: currentMultibrot.maxIter,
            power: currentMultibrot.power,
          },
        };
        break;
      case "newton":
        iteratorPayload = {
          name: "newton",
          parameters: {
            centerX: currentNewton.centerX,
            centerY: currentNewton.centerY,
            zoom: currentNewton.zoom,
            maxIter: currentNewton.maxIter,
          },
        };
        break;
      case "phoenix":
        iteratorPayload = {
          name: "phoenix",
          parameters: {
            centerX: currentPhoenix.centerX,
            centerY: currentPhoenix.centerY,
            zoom: currentPhoenix.zoom,
            maxIter: currentPhoenix.maxIter,
            cReal: currentPhoenix.cReal,
            cImag: currentPhoenix.cImag,
            p: currentPhoenix.p,
          },
        };
        break;
      case "lyapunov":
        iteratorPayload = {
          name: "lyapunov",
          parameters: {
            aMin: currentLyapunov.aMin,
            aMax: currentLyapunov.aMax,
            bMin: currentLyapunov.bMin,
            bMax: currentLyapunov.bMax,
            maxIter: currentLyapunov.maxIter,
          },
        };
        // Add sequence as a separate property since it's a string
        (iteratorPayload as { name: string; parameters: Record<string, number>; sequence?: string }).sequence = currentLyapunov.sequence;
        break;
      default:
        iteratorPayload = { name: "clifford_iterator", parameters: { alpha: -1.7, beta: 1.3, gamma: -0.1, delta: -1.21 } };
    }

    // Check if we can use OffscreenCanvas (canvas is fresh, not yet transferred)
    const canUseOffscreen = useOffscreenRef.current && !canvasTransferredRef.current;

    if (canUseOffscreen) {
      // OffscreenCanvas mode - transfer canvas to worker
      canvas.width = size;
      canvas.height = size;

      try {
        const offscreen = canvas.transferControlToOffscreen();
        canvasTransferredRef.current = true;

        const payload = {
          mode: "offscreen",
          canvas: offscreen,
          point: { xpos: 0.001, ypos: 0.002 },
          size: size,
          alias: CONFIG.ALIAS,
          scale,
          palette: currentPalette,
          colorLUTSize: CONFIG.COLOR_LUT_SIZE,
          iterator: iteratorPayload,
          palGamma: currentPalGamma,
          palScale,
          palMax,
          bgColor,
        };

        worker.postMessage({ type: "initialize", payload }, [offscreen]);

        // Simplified message handler for offscreen mode
        worker.onmessage = (event: MessageEvent<any>) => {
          const { type, payload } = event.data;
          if (type === "stats") {
            setMaxHits(payload.maxHits);
            setTotalIterations(payload.totalIterations || 0);
          } else if (type === "imageExport") {
            // Handle image export response
            const blob = payload.blob;
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.download = `attractor-${Date.now()}.png`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
          }
        };
      } catch (e) {
        // Fallback to legacy mode if transfer fails
        useOffscreenRef.current = false;
        initializeWorker(size, options);
        return;
      }
    } else {
      // Legacy mode - render on main thread
      canvas.width = size;
      canvas.height = size;
      clearCanvas(size);

      const payload = {
        mode: "legacy",
        point: { xpos: 0.001, ypos: 0.002 },
        size: size,
        alias: CONFIG.ALIAS,
        scale,
        palette: currentPalette,
        iterator: iteratorPayload,
        bgColor,
      };

      worker.postMessage({ type: "initialize", payload });

      worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
        const { hits, maxHits: hitMax, iteratorSize } = event.data.payload;

        // Store pending render data
        pendingRenderRef.current = { hits, maxHits: hitMax, iteratorSize };

        // Use requestAnimationFrame to throttle rendering to screen refresh rate
        if (rafIdRef.current === null) {
          rafIdRef.current = requestAnimationFrame(() => {
            const pending = pendingRenderRef.current;
            if (pending) {
              draw(pending.hits, pending.maxHits, size, pending.iteratorSize);
            }
            rafIdRef.current = null;
          });
        }
      };
    }

    // Auto-fit to view after a short delay to ensure container is ready
    setTimeout(() => {
      const container = containerRef.current;
      if (container) {
        const { width, height } = container.getBoundingClientRect();
        const fitZoom = Math.min(
          (width - 40) / size,
          (height - 40) / size
        );
        setZoom(Math.max(0.1, Math.min(fitZoom, 1)));
      }
    }, 100);

    setMaxHits(0);
    setTotalIterations(0);
  }, [attractorType, iconParams, cliffordParams, deJongParams, tinkerbellParams, henonParams, bedheadParams, svenssonParams, fractalDreamParams, hopalongParams, symmetricQuiltParams, mandelbrotParams, juliaParams, burningShipParams, tricornParams, multibrotParams, newtonParams, phoenixParams, lyapunovParams, paletteData, palGamma, palScale, palMax, bgColor, draw, canvasSize, clearCanvas]);

  // Initialize canvas on mount only
  useEffect(() => {
    initializeWorker(canvasSize);

    return () => {
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
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-initialize when canvasKey changes (after React creates a new canvas element)
  useEffect(() => {
    if (canvasKey > 0) {
      initializeWorker(canvasSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasKey]);

  // Handle preset selection - reinitialize worker with new preset
  const handlePresetChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(e.target.value, 10);
    setSelectedPreset(index);
    const icon: IconData = symmetricIconData[index];
    const newParams = {
      alpha: icon.alpha,
      betha: icon.betha,
      gamma: icon.gamma,
      delta: icon.delta,
      omega: icon.omega,
      lambda: icon.lambda,
      degree: icon.degree,
      npdegree: icon.npdegree,
      scale: icon.scale,
    };
    setIconParams(newParams);
    setPaletteData(icon.paletteData);
    // Load palGamma from preset (default to 0.5 if not specified)
    const presetPalGamma = icon.palGamma ?? 0.5;
    setPalGamma(presetPalGamma);

    // Reinitialize worker with new preset - pass params directly since state updates are async
    initializeWorker(canvasSize, {
      iconOverride: newParams,
      paletteOverride: icon.paletteData,
      palGammaOverride: presetPalGamma,
    });
  }, [canvasSize, initializeWorker]);

  // Handle attractor type change - reinitialize worker with new type
  const handleAttractorTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as AttractorType;
    setAttractorType(newType);

    let newPalette: Color[];
    switch (newType) {
      case "symmetric_icon":
        newPalette = symmetricIconData[selectedPreset].paletteData;
        break;
      case "clifford":
        newPalette = cliffordData[cliffordPreset].paletteData;
        break;
      case "dejong":
        newPalette = deJongData[deJongPreset].paletteData;
        break;
      case "tinkerbell":
        newPalette = tinkerbellData[tinkerbellPreset].paletteData;
        break;
      case "henon":
        newPalette = henonData[henonPreset].paletteData;
        break;
      case "bedhead":
        newPalette = bedheadData[bedheadPreset].paletteData;
        break;
      case "svensson":
        newPalette = svenssonData[svenssonPreset].paletteData;
        break;
      case "fractal_dream":
        newPalette = fractalDreamData[fractalDreamPreset].paletteData;
        break;
      case "hopalong":
        newPalette = hopalongData[hopalongPreset].paletteData;
        break;
      case "symmetric_quilt":
        newPalette = symmetricQuiltData[symmetricQuiltPreset].paletteData;
        break;
      default:
        newPalette = DEFAULT_PALETTE;
    }
    setPaletteData(newPalette);

    // Reinitialize worker with new attractor type - pass params directly since state updates are async
    initializeWorker(canvasSize, {
      typeOverride: newType,
      paletteOverride: newPalette,
    });
  }, [selectedPreset, cliffordPreset, deJongPreset, tinkerbellPreset, henonPreset, bedheadPreset, svenssonPreset, fractalDreamPreset, hopalongPreset, symmetricQuiltPreset, canvasSize, initializeWorker]);

  // Handle parameter changes
  const handleIconParamChange = useCallback((param: keyof SymmetricIconParams, value: string) => {
    const numValue = parseFloat(value) || 0;
    setIconParams(prev => ({ ...prev, [param]: numValue }));
  }, []);

  const handleCliffordParamChange = useCallback((param: keyof CliffordParams, value: string) => {
    const numValue = parseFloat(value) || 0;
    setCliffordParams(prev => ({ ...prev, [param]: numValue }));
  }, []);

  const handleCliffordPresetChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(e.target.value, 10);
    setCliffordPreset(index);
    const preset = cliffordData[index] as { alpha: number; beta: number; gamma: number; delta: number; scale: number; palGamma?: number; paletteData: Color[] };
    const newParams = { alpha: preset.alpha, beta: preset.beta, gamma: preset.gamma, delta: preset.delta, scale: preset.scale };
    setCliffordParams(newParams);
    setPaletteData(preset.paletteData);
    const presetPalGamma = preset.palGamma ?? 0.5;
    setPalGamma(presetPalGamma);
    initializeWorker(canvasSize, { cliffordOverride: newParams, paletteOverride: preset.paletteData, palGammaOverride: presetPalGamma });
  }, [canvasSize, initializeWorker]);

  const handleDeJongParamChange = useCallback((param: keyof DeJongParams, value: string) => {
    const numValue = parseFloat(value) || 0;
    setDeJongParams(prev => ({ ...prev, [param]: numValue }));
  }, []);

  const handleTinkerbellParamChange = useCallback((param: keyof TinkerbellParams, value: string) => {
    const numValue = parseFloat(value) || 0;
    setTinkerbellParams(prev => ({ ...prev, [param]: numValue }));
  }, []);

  const handleHenonParamChange = useCallback((param: keyof HenonParams, value: string) => {
    const numValue = parseFloat(value) || 0;
    setHenonParams(prev => ({ ...prev, [param]: numValue }));
  }, []);

  const handleBedheadParamChange = useCallback((param: keyof BedheadParams, value: string) => {
    const numValue = parseFloat(value) || 0;
    setBedheadParams(prev => ({ ...prev, [param]: numValue }));
  }, []);

  const handleSvenssonParamChange = useCallback((param: keyof SvenssonParams, value: string) => {
    const numValue = parseFloat(value) || 0;
    setSvenssonParams(prev => ({ ...prev, [param]: numValue }));
  }, []);

  const handleFractalDreamParamChange = useCallback((param: keyof FractalDreamParams, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFractalDreamParams(prev => ({ ...prev, [param]: numValue }));
  }, []);

  const handleHopalongParamChange = useCallback((param: keyof HopalongParams, value: string) => {
    const numValue = parseFloat(value) || 0;
    setHopalongParams(prev => ({ ...prev, [param]: numValue }));
  }, []);

  const handleSymmetricQuiltParamChange = useCallback((param: keyof SymmetricQuiltParams, value: string) => {
    const numValue = parseFloat(value) || 0;
    setSymmetricQuiltParams(prev => ({ ...prev, [param]: numValue }));
  }, []);

  // Handle preset changes for new attractors
  const handleDeJongPresetChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(e.target.value, 10);
    setDeJongPreset(index);
    const preset = deJongData[index] as { alpha: number; beta: number; gamma: number; delta: number; scale: number; palGamma?: number; paletteData: Color[] };
    const newParams = { alpha: preset.alpha, beta: preset.beta, gamma: preset.gamma, delta: preset.delta, scale: preset.scale };
    setDeJongParams(newParams);
    setPaletteData(preset.paletteData);
    const presetPalGamma = preset.palGamma ?? 0.5;
    setPalGamma(presetPalGamma);
    initializeWorker(canvasSize, { deJongOverride: newParams, paletteOverride: preset.paletteData, palGammaOverride: presetPalGamma });
  }, [canvasSize, initializeWorker]);

  const handleTinkerbellPresetChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(e.target.value, 10);
    setTinkerbellPreset(index);
    const preset = tinkerbellData[index] as { alpha: number; beta: number; gamma: number; delta: number; scale: number; palGamma?: number; paletteData: Color[] };
    const newParams = { alpha: preset.alpha, beta: preset.beta, gamma: preset.gamma, delta: preset.delta, scale: preset.scale };
    setTinkerbellParams(newParams);
    setPaletteData(preset.paletteData);
    const presetPalGamma = preset.palGamma ?? 0.5;
    setPalGamma(presetPalGamma);
    initializeWorker(canvasSize, { tinkerbellOverride: newParams, paletteOverride: preset.paletteData, palGammaOverride: presetPalGamma });
  }, [canvasSize, initializeWorker]);

  const handleHenonPresetChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(e.target.value, 10);
    setHenonPreset(index);
    const preset = henonData[index] as { alpha: number; beta: number; scale: number; palGamma?: number; paletteData: Color[] };
    const newParams = { alpha: preset.alpha, beta: preset.beta, scale: preset.scale };
    setHenonParams(newParams);
    setPaletteData(preset.paletteData);
    const presetPalGamma = preset.palGamma ?? 0.5;
    setPalGamma(presetPalGamma);
    initializeWorker(canvasSize, { henonOverride: newParams, paletteOverride: preset.paletteData, palGammaOverride: presetPalGamma });
  }, [canvasSize, initializeWorker]);

  const handleBedheadPresetChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(e.target.value, 10);
    setBedheadPreset(index);
    const preset = bedheadData[index] as { alpha: number; beta: number; scale: number; palGamma?: number; paletteData: Color[] };
    const newParams = { alpha: preset.alpha, beta: preset.beta, scale: preset.scale };
    setBedheadParams(newParams);
    setPaletteData(preset.paletteData);
    const presetPalGamma = preset.palGamma ?? 0.5;
    setPalGamma(presetPalGamma);
    initializeWorker(canvasSize, { bedheadOverride: newParams, paletteOverride: preset.paletteData, palGammaOverride: presetPalGamma });
  }, [canvasSize, initializeWorker]);

  const handleSvenssonPresetChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(e.target.value, 10);
    setSvenssonPreset(index);
    const preset = svenssonData[index] as { alpha: number; beta: number; gamma: number; delta: number; scale: number; palGamma?: number; paletteData: Color[] };
    const newParams = { alpha: preset.alpha, beta: preset.beta, gamma: preset.gamma, delta: preset.delta, scale: preset.scale };
    setSvenssonParams(newParams);
    setPaletteData(preset.paletteData);
    const presetPalGamma = preset.palGamma ?? 0.5;
    setPalGamma(presetPalGamma);
    initializeWorker(canvasSize, { svenssonOverride: newParams, paletteOverride: preset.paletteData, palGammaOverride: presetPalGamma });
  }, [canvasSize, initializeWorker]);

  const handleFractalDreamPresetChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(e.target.value, 10);
    setFractalDreamPreset(index);
    const preset = fractalDreamData[index] as { alpha: number; beta: number; gamma: number; delta: number; scale: number; palGamma?: number; paletteData: Color[] };
    const newParams = { alpha: preset.alpha, beta: preset.beta, gamma: preset.gamma, delta: preset.delta, scale: preset.scale };
    setFractalDreamParams(newParams);
    setPaletteData(preset.paletteData);
    const presetPalGamma = preset.palGamma ?? 0.5;
    setPalGamma(presetPalGamma);
    initializeWorker(canvasSize, { fractalDreamOverride: newParams, paletteOverride: preset.paletteData, palGammaOverride: presetPalGamma });
  }, [canvasSize, initializeWorker]);

  const handleHopalongPresetChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(e.target.value, 10);
    setHopalongPreset(index);
    const preset = hopalongData[index] as { alpha: number; beta: number; gamma: number; scale: number; palGamma?: number; paletteData: Color[] };
    const newParams = { alpha: preset.alpha, beta: preset.beta, gamma: preset.gamma, scale: preset.scale };
    setHopalongParams(newParams);
    setPaletteData(preset.paletteData);
    const presetPalGamma = preset.palGamma ?? 0.5;
    setPalGamma(presetPalGamma);
    initializeWorker(canvasSize, { hopalongOverride: newParams, paletteOverride: preset.paletteData, palGammaOverride: presetPalGamma });
  }, [canvasSize, initializeWorker]);

  const handleSymmetricQuiltPresetChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(e.target.value, 10);
    setSymmetricQuiltPreset(index);
    const preset = symmetricQuiltData[index] as { lambda: number; alpha: number; beta: number; gamma: number; omega: number; m: number; shift: number; scale: number; palGamma?: number; paletteData: Color[] };
    const newParams = { lambda: preset.lambda, alpha: preset.alpha, beta: preset.beta, gamma: preset.gamma, omega: preset.omega, m: preset.m, shift: preset.shift, scale: preset.scale };
    setSymmetricQuiltParams(newParams);
    setPaletteData(preset.paletteData);
    const presetPalGamma = preset.palGamma ?? 0.5;
    setPalGamma(presetPalGamma);
    initializeWorker(canvasSize, { symmetricQuiltOverride: newParams, paletteOverride: preset.paletteData, palGammaOverride: presetPalGamma });
  }, [canvasSize, initializeWorker]);

  const handleMandelbrotPresetChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(e.target.value, 10);
    setMandelbrotPreset(index);
    const preset = mandelbrotData[index] as { centerX: number; centerY: number; zoom: number; maxIter: number; palGamma?: number; paletteData: Color[] };
    const newParams = { centerX: preset.centerX, centerY: preset.centerY, zoom: preset.zoom, maxIter: preset.maxIter };
    setMandelbrotParams(newParams);
    setPaletteData(preset.paletteData);
    const presetPalGamma = preset.palGamma ?? 0.5;
    setPalGamma(presetPalGamma);
    initializeWorker(canvasSize, { mandelbrotOverride: newParams, paletteOverride: preset.paletteData, palGammaOverride: presetPalGamma });
  }, [canvasSize, initializeWorker]);

  const handleJuliaPresetChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(e.target.value, 10);
    setJuliaPreset(index);
    const preset = juliaData[index] as { cReal: number; cImag: number; centerX: number; centerY: number; zoom: number; maxIter: number; palGamma?: number; paletteData: Color[] };
    const newParams = { cReal: preset.cReal, cImag: preset.cImag, centerX: preset.centerX, centerY: preset.centerY, zoom: preset.zoom, maxIter: preset.maxIter };
    setJuliaParams(newParams);
    setPaletteData(preset.paletteData);
    const presetPalGamma = preset.palGamma ?? 0.5;
    setPalGamma(presetPalGamma);
    initializeWorker(canvasSize, { juliaOverride: newParams, paletteOverride: preset.paletteData, palGammaOverride: presetPalGamma });
  }, [canvasSize, initializeWorker]);

  // Apply parameters and restart
  const handleApply = useCallback(() => {
    initializeWorker();
  }, [initializeWorker]);

  // Update palette settings (gamma, scale mode, max)
  const updatePaletteSettings = useCallback((newGamma?: number, newScale?: boolean, newMax?: number, newBgColor?: { r: number; g: number; b: number }) => {
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: "updatePaletteSettings",
        payload: {
          palGamma: newGamma ?? palGamma,
          palScale: newScale ?? palScale,
          palMax: newMax ?? palMax,
          bgColor: newBgColor ?? bgColor,
        },
      });
    }
  }, [palGamma, palScale, palMax, bgColor]);

  const handleGammaChange = useCallback((value: number) => {
    setPalGamma(value);
    updatePaletteSettings(value, undefined, undefined, undefined);
  }, [updatePaletteSettings]);

  const handleScaleModeChange = useCallback((useDynamic: boolean) => {
    setPalScale(useDynamic);
    updatePaletteSettings(undefined, useDynamic, undefined, undefined);
  }, [updatePaletteSettings]);

  const handlePalMaxChange = useCallback((value: number) => {
    setPalMax(value);
    updatePaletteSettings(undefined, undefined, value, undefined);
  }, [updatePaletteSettings]);

  const handleBgColorChange = useCallback((newColor: { r: number; g: number; b: number }) => {
    setBgColor(newColor);
    updatePaletteSettings(undefined, undefined, undefined, newColor);
  }, [updatePaletteSettings]);

  // Check if current type is a fractal (renders instantly, no iteration needed)
  const isFractalType = ["mandelbrot", "julia", "burningship", "tricorn", "multibrot", "newton", "phoenix", "lyapunov"].includes(attractorType);

  // Handle start/stop iteration
  const handleIterating = useCallback(() => {
    // Fractals don't iterate - they render instantly
    if (isFractalType) {
      return;
    }

    if (iterating) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Request high-quality final render with true interpolation (no LUT)
      if (useOffscreenRef.current && canvasTransferredRef.current && workerRef.current) {
        workerRef.current.postMessage({ type: "finalRender" });
      }
    } else {
      const id = setInterval(() => {
        if (workerRef.current) {
          workerRef.current.postMessage({ type: "iterate" });
        }
      }, CONFIG.ITERATION_INTERVAL_MS);
      intervalRef.current = id;
    }

    setIterating(!iterating);
  }, [iterating, isFractalType]);

  // Handle palette changes
  const handlePaletteChange = useCallback((p: Color[]) => {
    if (paletteRef.current) {
      paletteRef.current.setPalette(p);
    }
    // Notify worker of palette change (for offscreen mode)
    if (useOffscreenRef.current && canvasTransferredRef.current && workerRef.current) {
      workerRef.current.postMessage({
        type: "updatePalette",
        payload: {
          palette: p,
          colorLUTSize: CONFIG.COLOR_LUT_SIZE,
        },
      });
    }
  }, []);

  // Handle canvas size change
  const handleCanvasSizeChange = useCallback((newSize: number) => {
    setCanvasSize(newSize);
    // initializeWorker handles canvas replacement if it was transferred
    initializeWorker(newSize);
  }, [initializeWorker]);

  // Handle fit to view
  const handleFitToView = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const { width, height } = container.getBoundingClientRect();
    const fitZoom = Math.min(
      (width - 40) / canvasSize,
      (height - 40) / canvasSize
    );
    setZoom(Math.max(0.1, Math.min(fitZoom, 1)));
  }, [canvasSize]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoom(z => Math.min(2, z + 0.1));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(z => Math.max(0.1, z - 0.1));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoom(1);
  }, []);

  // Fractal coordinate conversion helper
  const pixelToFractal = useCallback((pixelX: number, pixelY: number, params: MandelbrotParams | JuliaParams) => {
    const range = 3.0 / params.zoom;
    const xMin = params.centerX - range / 2;
    const yMin = params.centerY - range / 2;
    const pixelSize = range / canvasSize;
    return {
      x: xMin + pixelX * pixelSize,
      y: yMin + pixelY * pixelSize,
    };
  }, [canvasSize]);

  // Reset fractal view to default
  const handleResetFractalView = useCallback(() => {
    if (attractorType === "mandelbrot") {
      setMandelbrotParams(DEFAULT_MANDELBROT);
      initializeWorker(canvasSize, { mandelbrotOverride: DEFAULT_MANDELBROT });
    } else if (attractorType === "julia") {
      setJuliaParams(DEFAULT_JULIA);
      initializeWorker(canvasSize, { juliaOverride: DEFAULT_JULIA });
    } else if (attractorType === "burningship") {
      setBurningShipParams(DEFAULT_BURNING_SHIP);
      initializeWorker(canvasSize, { burningShipOverride: DEFAULT_BURNING_SHIP });
    } else if (attractorType === "tricorn") {
      setTricornParams(DEFAULT_TRICORN);
      initializeWorker(canvasSize, { tricornOverride: DEFAULT_TRICORN });
    } else if (attractorType === "multibrot") {
      setMultibrotParams(DEFAULT_MULTIBROT);
      initializeWorker(canvasSize, { multibrotOverride: DEFAULT_MULTIBROT });
    } else if (attractorType === "newton") {
      setNewtonParams(DEFAULT_NEWTON);
      initializeWorker(canvasSize, { newtonOverride: DEFAULT_NEWTON });
    } else if (attractorType === "phoenix") {
      setPhoenixParams(DEFAULT_PHOENIX);
      initializeWorker(canvasSize, { phoenixOverride: DEFAULT_PHOENIX });
    } else if (attractorType === "lyapunov") {
      setLyapunovParams(DEFAULT_LYAPUNOV);
      initializeWorker(canvasSize, { lyapunovOverride: DEFAULT_LYAPUNOV });
    }
  }, [attractorType, initializeWorker, canvasSize]);

  // Fractal drag-to-zoom handlers
  const handleFractalMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isFractalType) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    setDragStart({ x, y });
    setDragEnd({ x, y });
    setIsDragging(true);
  }, [isFractalType, zoom]);

  const handleFractalMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStart) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    setDragEnd({ x, y });
  }, [isDragging, dragStart, zoom]);

  const handleFractalMouseUp = useCallback(() => {
    if (!isDragging || !dragStart || !dragEnd) {
      setIsDragging(false);
      return;
    }

    // Ignore tiny drags (just clicks)
    const dragWidth = Math.abs(dragEnd.x - dragStart.x);
    const dragHeight = Math.abs(dragEnd.y - dragStart.y);
    if (dragWidth < 10 && dragHeight < 10) {
      setIsDragging(false);
      setDragStart(null);
      setDragEnd(null);
      return;
    }

    // Handle Lyapunov separately (uses aMin/aMax/bMin/bMax instead of center/zoom)
    if (attractorType === "lyapunov") {
      const minX = Math.min(dragStart.x, dragEnd.x);
      const maxX = Math.max(dragStart.x, dragEnd.x);
      const minY = Math.min(dragStart.y, dragEnd.y);
      const maxY = Math.max(dragStart.y, dragEnd.y);

      // Convert pixel coords to a/b space
      const aRange = lyapunovParams.aMax - lyapunovParams.aMin;
      const bRange = lyapunovParams.bMax - lyapunovParams.bMin;
      const newAMin = lyapunovParams.aMin + (minX / canvasSize) * aRange;
      const newAMax = lyapunovParams.aMin + (maxX / canvasSize) * aRange;
      const newBMin = lyapunovParams.bMin + (minY / canvasSize) * bRange;
      const newBMax = lyapunovParams.bMin + (maxY / canvasSize) * bRange;

      const newParams = { ...lyapunovParams, aMin: newAMin, aMax: newAMax, bMin: newBMin, bMax: newBMax };
      setLyapunovParams(newParams);
      initializeWorker(canvasSize, { lyapunovOverride: newParams });

      setIsDragging(false);
      setDragStart(null);
      setDragEnd(null);
      return;
    }

    // Get current params based on attractor type (all use centerX/centerY/zoom)
    let params: { centerX: number; centerY: number; zoom: number };
    if (attractorType === "mandelbrot") params = mandelbrotParams;
    else if (attractorType === "julia") params = juliaParams;
    else if (attractorType === "burningship") params = burningShipParams;
    else if (attractorType === "tricorn") params = tricornParams;
    else if (attractorType === "multibrot") params = multibrotParams;
    else if (attractorType === "newton") params = newtonParams;
    else if (attractorType === "phoenix") params = phoenixParams;
    else params = mandelbrotParams; // fallback

    const topLeft = pixelToFractal(Math.min(dragStart.x, dragEnd.x), Math.min(dragStart.y, dragEnd.y), params);
    const bottomRight = pixelToFractal(Math.max(dragStart.x, dragEnd.x), Math.max(dragStart.y, dragEnd.y), params);

    const newCenterX = (topLeft.x + bottomRight.x) / 2;
    const newCenterY = (topLeft.y + bottomRight.y) / 2;
    const newRange = Math.max(bottomRight.x - topLeft.x, bottomRight.y - topLeft.y);
    const newZoom = 3.0 / newRange;

    // Update params and re-render based on type
    if (attractorType === "mandelbrot") {
      const newParams = { ...mandelbrotParams, centerX: newCenterX, centerY: newCenterY, zoom: newZoom };
      setMandelbrotParams(newParams);
      initializeWorker(canvasSize, { mandelbrotOverride: newParams });
    } else if (attractorType === "julia") {
      const newParams = { ...juliaParams, centerX: newCenterX, centerY: newCenterY, zoom: newZoom };
      setJuliaParams(newParams);
      initializeWorker(canvasSize, { juliaOverride: newParams });
    } else if (attractorType === "burningship") {
      const newParams = { ...burningShipParams, centerX: newCenterX, centerY: newCenterY, zoom: newZoom };
      setBurningShipParams(newParams);
      initializeWorker(canvasSize, { burningShipOverride: newParams });
    } else if (attractorType === "tricorn") {
      const newParams = { ...tricornParams, centerX: newCenterX, centerY: newCenterY, zoom: newZoom };
      setTricornParams(newParams);
      initializeWorker(canvasSize, { tricornOverride: newParams });
    } else if (attractorType === "multibrot") {
      const newParams = { ...multibrotParams, centerX: newCenterX, centerY: newCenterY, zoom: newZoom };
      setMultibrotParams(newParams);
      initializeWorker(canvasSize, { multibrotOverride: newParams });
    } else if (attractorType === "newton") {
      const newParams = { ...newtonParams, centerX: newCenterX, centerY: newCenterY, zoom: newZoom };
      setNewtonParams(newParams);
      initializeWorker(canvasSize, { newtonOverride: newParams });
    } else if (attractorType === "phoenix") {
      const newParams = { ...phoenixParams, centerX: newCenterX, centerY: newCenterY, zoom: newZoom };
      setPhoenixParams(newParams);
      initializeWorker(canvasSize, { phoenixOverride: newParams });
    }

    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  }, [isDragging, dragStart, dragEnd, attractorType, mandelbrotParams, juliaParams, burningShipParams, tricornParams, multibrotParams, newtonParams, phoenixParams, lyapunovParams, pixelToFractal, initializeWorker, canvasSize]);

  // Save image handler
  const handleSaveImage = useCallback(() => {
    // In offscreen mode, request export from worker
    if (useOffscreenRef.current && canvasTransferredRef.current && workerRef.current) {
      workerRef.current.postMessage({ type: "exportImage" });
      return;
    }

    // Legacy mode - export directly from canvas
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `attractor-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, []);

  // Memoize dynamic input style (depends on isEditing)
  const inputStyle = useMemo<React.CSSProperties>(() => ({
    width: "100%",
    padding: "12px 14px",
    fontSize: "13px",
    borderRadius: "10px",
    border: "1px solid rgba(255, 180, 120, 0.2)",
    boxSizing: "border-box",
    background: isEditing ? "rgba(0, 0, 0, 0.4)" : "rgba(0, 0, 0, 0.25)",
    color: isEditing ? "#ffffff" : "rgba(255, 255, 255, 0.5)",
    fontWeight: 500,
    outline: "none",
    transition: "all 0.2s ease",
  }), [isEditing]);

  // Destructure static styles for convenience
  const { selectStyle, labelStyle, fieldStyle, cardStyle, buttonPrimary, buttonSuccess, buttonSecondary, floatingButton } = STYLES;

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg-gradient)" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "300px",
          background: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid rgba(255, 180, 120, 0.12)",
        }}
      >
        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px", paddingBottom: "10px" }}>
        {/* Sticky Controls Section */}
        <div style={{
          position: "sticky",
          top: 0,
          background: "rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          zIndex: 10,
          paddingBottom: "12px",
          borderBottom: "1px solid rgba(255, 180, 120, 0.12)",
          marginBottom: "12px",
        }}>
          <h3 style={{ margin: 0, fontSize: "22px", fontWeight: 700 }}>
            <span style={{
              background: "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Attractor
            </span>
          </h3>
        </div>

        {/* Attractor Settings Group */}
        <div style={{ marginBottom: "12px" }}>
          <button
            onClick={() => setAttractorCollapsed(!attractorCollapsed)}
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 18px",
              background: "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)",
              color: "white",
              border: "none",
              borderRadius: attractorCollapsed ? "12px" : "12px 12px 0 0",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
              boxShadow: "0 4px 15px rgba(245, 158, 11, 0.3)",
            }}
          >
            <span>Attractor Settings</span>
            <span style={{ transform: attractorCollapsed ? "rotate(-90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▼</span>
          </button>
          {!attractorCollapsed && (
            <div style={{
              background: "rgba(0, 0, 0, 0.3)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              padding: "16px",
              borderRadius: "0 0 12px 12px",
              border: "1px solid rgba(255, 180, 120, 0.12)",
              borderTop: "none",
            }}>
              {/* Canvas Size */}
              <div style={fieldStyle}>
                <label style={labelStyle}>Canvas Size</label>
                <select
                  value={canvasSize}
                  onChange={(e) => handleCanvasSizeChange(parseInt(e.target.value))}
                  style={selectStyle}
                >
                  <option value={800}>800 × 800 (Fast)</option>
                  <option value={1200}>1200 × 1200</option>
                  <option value={1800}>1800 × 1800</option>
                  <option value={2400}>2400 × 2400</option>
                  <option value={3600}>3600 × 3600 (High Detail)</option>
                </select>
              </div>

              {/* Attractor Type Selector */}
              <div style={fieldStyle}>
                <label style={labelStyle}>Attractor Type</label>
                <select
                  value={attractorType}
                  onChange={handleAttractorTypeChange}
                  style={selectStyle}
                >
                  <optgroup label="Attractors">
                    <option value="symmetric_icon">Symmetric Icon</option>
                    <option value="symmetric_quilt">Symmetric Quilt</option>
                    <option value="clifford">Clifford Attractor</option>
                    <option value="dejong">De Jong Attractor</option>
                    <option value="tinkerbell">Tinkerbell Attractor</option>
                    <option value="henon">Henon Attractor</option>
                    <option value="bedhead">Bedhead Attractor</option>
                    <option value="svensson">Svensson Attractor</option>
                    <option value="fractal_dream">Fractal Dream</option>
                    <option value="hopalong">Hopalong Attractor</option>
                  </optgroup>
                  <optgroup label="Fractals">
                    <option value="mandelbrot">Mandelbrot Set</option>
                    <option value="julia">Julia Set</option>
                    <option value="burningship">Burning Ship</option>
                    <option value="tricorn">Tricorn (Mandelbar)</option>
                    <option value="multibrot">Multibrot</option>
                    <option value="newton">Newton Fractal</option>
                    <option value="phoenix">Phoenix Fractal</option>
                    <option value="lyapunov">Lyapunov Fractal</option>
                  </optgroup>
                </select>
              </div>

        {/* Symmetric Icon Controls */}
        {attractorType === "symmetric_icon" && (
          <>
            {/* Preset Selector */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Preset</label>
              <select
                value={selectedPreset}
                onChange={handlePresetChange}
                disabled={isEditing}
                style={{ ...selectStyle, opacity: isEditing ? 0.5 : 1 }}
              >
                {symmetricIconData.map((icon: IconData, index: number) => (
                  <option key={index} value={index}>
                    {icon.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Parameters - Always visible */}
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h4 style={{ margin: 0, fontSize: "14px", color: "#ffffff", fontWeight: 600 }}>Parameters</h4>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} style={buttonPrimary}>
                    Edit
                  </button>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Alpha (α)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={iconParams.alpha}
                    onChange={(e) => handleIconParamChange("alpha", e.target.value)}
                    disabled={!isEditing}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Beta (β)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={iconParams.betha}
                    onChange={(e) => handleIconParamChange("betha", e.target.value)}
                    disabled={!isEditing}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Gamma (γ)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={iconParams.gamma}
                    onChange={(e) => handleIconParamChange("gamma", e.target.value)}
                    disabled={!isEditing}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Delta (δ)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={iconParams.delta}
                    onChange={(e) => handleIconParamChange("delta", e.target.value)}
                    disabled={!isEditing}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Omega (ω)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={iconParams.omega}
                    onChange={(e) => handleIconParamChange("omega", e.target.value)}
                    disabled={!isEditing}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Lambda (λ)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={iconParams.lambda}
                    onChange={(e) => handleIconParamChange("lambda", e.target.value)}
                    disabled={!isEditing}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Degree</label>
                  <input
                    type="number"
                    step="1"
                    min="2"
                    value={iconParams.degree}
                    onChange={(e) => handleIconParamChange("degree", e.target.value)}
                    disabled={!isEditing}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>NP Degree</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={iconParams.npdegree}
                    onChange={(e) => handleIconParamChange("npdegree", e.target.value)}
                    disabled={!isEditing}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div style={{ marginTop: "12px" }}>
                <label style={labelStyle}>Scale</label>
                <input
                  type="number"
                  step="0.05"
                  value={iconParams.scale}
                  onChange={(e) => handleIconParamChange("scale", e.target.value)}
                  disabled={!isEditing}
                  style={inputStyle}
                />
              </div>

              {/* Apply/Cancel Buttons - Only show when editing */}
              {isEditing && (
                <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                  <button
                    onClick={() => { handleApply(); setIsEditing(false); }}
                    style={{ ...buttonSuccess, flex: 1 }}
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => {
                      const icon = symmetricIconData[selectedPreset];
                      setIconParams({
                        alpha: icon.alpha,
                        betha: icon.betha,
                        gamma: icon.gamma,
                        delta: icon.delta,
                        omega: icon.omega,
                        lambda: icon.lambda,
                        degree: icon.degree,
                        npdegree: icon.npdegree,
                        scale: icon.scale,
                      });
                      setIsEditing(false);
                    }}
                    style={{ ...buttonSecondary, flex: 1 }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Symmetric Quilt Controls */}
        {attractorType === "symmetric_quilt" && (
          <>
            <div style={fieldStyle}>
              <label style={labelStyle}>Preset</label>
              <select
                value={symmetricQuiltPreset}
                onChange={handleSymmetricQuiltPresetChange}
                disabled={isEditing}
                style={{ ...selectStyle, opacity: isEditing ? 0.5 : 1 }}
              >
                {symmetricQuiltData.map((preset, index) => (
                  <option key={index} value={index}>{preset.name}</option>
                ))}
              </select>
            </div>
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h4 style={{ margin: 0, fontSize: "14px", color: "#ffffff", fontWeight: 600 }}>Parameters</h4>
                {!isEditing && <button onClick={() => setIsEditing(true)} style={buttonPrimary}>Edit</button>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {(["lambda", "alpha", "beta", "gamma", "omega", "m", "shift"] as const).map(param => (
                  <div key={param}>
                    <label style={labelStyle}>{param === "lambda" ? "Lambda (λ)" : param === "alpha" ? "Alpha (α)" : param === "beta" ? "Beta (β)" : param === "gamma" ? "Gamma (γ)" : param === "omega" ? "Omega (ω)" : param === "m" ? "M" : "Shift"}</label>
                    <input type="number" step="0.1" value={symmetricQuiltParams[param]} onChange={(e) => handleSymmetricQuiltParamChange(param, e.target.value)} disabled={!isEditing} style={inputStyle} />
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "12px" }}>
                <label style={labelStyle}>Scale</label>
                <input type="number" step="0.1" value={symmetricQuiltParams.scale} onChange={(e) => handleSymmetricQuiltParamChange("scale", e.target.value)} disabled={!isEditing} style={inputStyle} />
              </div>
              {isEditing && (
                <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                  <button onClick={() => { handleApply(); setIsEditing(false); }} style={{ ...buttonSuccess, flex: 1 }}>Apply</button>
                  <button onClick={() => { setSymmetricQuiltParams(DEFAULT_SYMMETRIC_QUILT); setIsEditing(false); }} style={{ ...buttonSecondary, flex: 1 }}>Cancel</button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Clifford Controls */}
        {attractorType === "clifford" && (
          <>
            <div style={fieldStyle}>
              <label style={labelStyle}>Preset</label>
              <select
                value={cliffordPreset}
                onChange={handleCliffordPresetChange}
                disabled={isEditing}
                style={{ ...selectStyle, opacity: isEditing ? 0.5 : 1 }}
              >
                {cliffordData.map((preset, index) => (
                  <option key={index} value={index}>{preset.name}</option>
                ))}
              </select>
            </div>
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h4 style={{ margin: 0, fontSize: "14px", color: "#ffffff", fontWeight: 600 }}>Parameters</h4>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} style={buttonPrimary}>
                    Edit
                  </button>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Alpha (α)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={cliffordParams.alpha}
                    onChange={(e) => handleCliffordParamChange("alpha", e.target.value)}
                    disabled={!isEditing}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Beta (β)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={cliffordParams.beta}
                    onChange={(e) => handleCliffordParamChange("beta", e.target.value)}
                    disabled={!isEditing}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Gamma (γ)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={cliffordParams.gamma}
                    onChange={(e) => handleCliffordParamChange("gamma", e.target.value)}
                    disabled={!isEditing}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Delta (δ)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={cliffordParams.delta}
                    onChange={(e) => handleCliffordParamChange("delta", e.target.value)}
                    disabled={!isEditing}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div style={{ marginTop: "12px" }}>
                <label style={labelStyle}>Scale</label>
                <input
                  type="number"
                  step="0.05"
                  value={cliffordParams.scale}
                  onChange={(e) => handleCliffordParamChange("scale", e.target.value)}
                  disabled={!isEditing}
                  style={inputStyle}
                />
              </div>

              {/* Apply/Cancel Buttons - Only show when editing */}
              {isEditing && (
                <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                  <button
                    onClick={() => { handleApply(); setIsEditing(false); }}
                    style={{ ...buttonSuccess, flex: 1 }}
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => {
                      setCliffordParams(DEFAULT_CLIFFORD);
                      setIsEditing(false);
                    }}
                    style={{ ...buttonSecondary, flex: 1 }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* De Jong Controls */}
        {attractorType === "dejong" && (
          <>
            <div style={fieldStyle}>
              <label style={labelStyle}>Preset</label>
              <select
                value={deJongPreset}
                onChange={handleDeJongPresetChange}
                disabled={isEditing}
                style={{ ...selectStyle, opacity: isEditing ? 0.5 : 1 }}
              >
                {deJongData.map((preset, index) => (
                  <option key={index} value={index}>{preset.name}</option>
                ))}
              </select>
            </div>
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h4 style={{ margin: 0, fontSize: "14px", color: "#ffffff", fontWeight: 600 }}>Parameters</h4>
                {!isEditing && <button onClick={() => setIsEditing(true)} style={buttonPrimary}>Edit</button>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {(["alpha", "beta", "gamma", "delta"] as const).map(param => (
                  <div key={param}>
                    <label style={labelStyle}>{param === "alpha" ? "Alpha (α)" : param === "beta" ? "Beta (β)" : param === "gamma" ? "Gamma (γ)" : "Delta (δ)"}</label>
                    <input type="number" step="0.1" value={deJongParams[param]} onChange={(e) => handleDeJongParamChange(param, e.target.value)} disabled={!isEditing} style={inputStyle} />
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "12px" }}>
                <label style={labelStyle}>Scale</label>
                <input type="number" step="0.05" value={deJongParams.scale} onChange={(e) => handleDeJongParamChange("scale", e.target.value)} disabled={!isEditing} style={inputStyle} />
              </div>
              {isEditing && (
                <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                  <button onClick={() => { handleApply(); setIsEditing(false); }} style={{ ...buttonSuccess, flex: 1 }}>Apply</button>
                  <button onClick={() => { setDeJongParams(DEFAULT_DEJONG); setIsEditing(false); }} style={{ ...buttonSecondary, flex: 1 }}>Cancel</button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Tinkerbell Controls */}
        {attractorType === "tinkerbell" && (
          <>
            <div style={fieldStyle}>
              <label style={labelStyle}>Preset</label>
              <select
                value={tinkerbellPreset}
                onChange={handleTinkerbellPresetChange}
                disabled={isEditing}
                style={{ ...selectStyle, opacity: isEditing ? 0.5 : 1 }}
              >
                {tinkerbellData.map((preset, index) => (
                  <option key={index} value={index}>{preset.name}</option>
                ))}
              </select>
            </div>
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h4 style={{ margin: 0, fontSize: "14px", color: "#ffffff", fontWeight: 600 }}>Parameters</h4>
                {!isEditing && <button onClick={() => setIsEditing(true)} style={buttonPrimary}>Edit</button>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {(["alpha", "beta", "gamma", "delta"] as const).map(param => (
                  <div key={param}>
                    <label style={labelStyle}>{param === "alpha" ? "Alpha (α)" : param === "beta" ? "Beta (β)" : param === "gamma" ? "Gamma (γ)" : "Delta (δ)"}</label>
                    <input type="number" step="0.1" value={tinkerbellParams[param]} onChange={(e) => handleTinkerbellParamChange(param, e.target.value)} disabled={!isEditing} style={inputStyle} />
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "12px" }}>
                <label style={labelStyle}>Scale</label>
                <input type="number" step="0.05" value={tinkerbellParams.scale} onChange={(e) => handleTinkerbellParamChange("scale", e.target.value)} disabled={!isEditing} style={inputStyle} />
              </div>
              {isEditing && (
                <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                  <button onClick={() => { handleApply(); setIsEditing(false); }} style={{ ...buttonSuccess, flex: 1 }}>Apply</button>
                  <button onClick={() => { setTinkerbellParams(DEFAULT_TINKERBELL); setIsEditing(false); }} style={{ ...buttonSecondary, flex: 1 }}>Cancel</button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Henon Controls */}
        {attractorType === "henon" && (
          <>
            <div style={fieldStyle}>
              <label style={labelStyle}>Preset</label>
              <select
                value={henonPreset}
                onChange={handleHenonPresetChange}
                disabled={isEditing}
                style={{ ...selectStyle, opacity: isEditing ? 0.5 : 1 }}
              >
                {henonData.map((preset, index) => (
                  <option key={index} value={index}>{preset.name}</option>
                ))}
              </select>
            </div>
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h4 style={{ margin: 0, fontSize: "14px", color: "#ffffff", fontWeight: 600 }}>Parameters</h4>
                {!isEditing && <button onClick={() => setIsEditing(true)} style={buttonPrimary}>Edit</button>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {(["alpha", "beta"] as const).map(param => (
                  <div key={param}>
                    <label style={labelStyle}>{param === "alpha" ? "Alpha (α)" : "Beta (β)"}</label>
                    <input type="number" step="0.1" value={henonParams[param]} onChange={(e) => handleHenonParamChange(param, e.target.value)} disabled={!isEditing} style={inputStyle} />
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "12px" }}>
                <label style={labelStyle}>Scale</label>
                <input type="number" step="0.05" value={henonParams.scale} onChange={(e) => handleHenonParamChange("scale", e.target.value)} disabled={!isEditing} style={inputStyle} />
              </div>
              {isEditing && (
                <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                  <button onClick={() => { handleApply(); setIsEditing(false); }} style={{ ...buttonSuccess, flex: 1 }}>Apply</button>
                  <button onClick={() => { setHenonParams(DEFAULT_HENON); setIsEditing(false); }} style={{ ...buttonSecondary, flex: 1 }}>Cancel</button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Bedhead Controls */}
        {attractorType === "bedhead" && (
          <>
            <div style={fieldStyle}>
              <label style={labelStyle}>Preset</label>
              <select
                value={bedheadPreset}
                onChange={handleBedheadPresetChange}
                disabled={isEditing}
                style={{ ...selectStyle, opacity: isEditing ? 0.5 : 1 }}
              >
                {bedheadData.map((preset, index) => (
                  <option key={index} value={index}>{preset.name}</option>
                ))}
              </select>
            </div>
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h4 style={{ margin: 0, fontSize: "14px", color: "#ffffff", fontWeight: 600 }}>Parameters</h4>
                {!isEditing && <button onClick={() => setIsEditing(true)} style={buttonPrimary}>Edit</button>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {(["alpha", "beta"] as const).map(param => (
                  <div key={param}>
                    <label style={labelStyle}>{param === "alpha" ? "Alpha (α)" : "Beta (β)"}</label>
                    <input type="number" step="0.1" value={bedheadParams[param]} onChange={(e) => handleBedheadParamChange(param, e.target.value)} disabled={!isEditing} style={inputStyle} />
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "12px" }}>
                <label style={labelStyle}>Scale</label>
                <input type="number" step="0.05" value={bedheadParams.scale} onChange={(e) => handleBedheadParamChange("scale", e.target.value)} disabled={!isEditing} style={inputStyle} />
              </div>
              {isEditing && (
                <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                  <button onClick={() => { handleApply(); setIsEditing(false); }} style={{ ...buttonSuccess, flex: 1 }}>Apply</button>
                  <button onClick={() => { setBedheadParams(DEFAULT_BEDHEAD); setIsEditing(false); }} style={{ ...buttonSecondary, flex: 1 }}>Cancel</button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Svensson Controls */}
        {attractorType === "svensson" && (
          <>
            <div style={fieldStyle}>
              <label style={labelStyle}>Preset</label>
              <select
                value={svenssonPreset}
                onChange={handleSvenssonPresetChange}
                disabled={isEditing}
                style={{ ...selectStyle, opacity: isEditing ? 0.5 : 1 }}
              >
                {svenssonData.map((preset, index) => (
                  <option key={index} value={index}>{preset.name}</option>
                ))}
              </select>
            </div>
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h4 style={{ margin: 0, fontSize: "14px", color: "#ffffff", fontWeight: 600 }}>Parameters</h4>
                {!isEditing && <button onClick={() => setIsEditing(true)} style={buttonPrimary}>Edit</button>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {(["alpha", "beta", "gamma", "delta"] as const).map(param => (
                  <div key={param}>
                    <label style={labelStyle}>{param === "alpha" ? "Alpha (α)" : param === "beta" ? "Beta (β)" : param === "gamma" ? "Gamma (γ)" : "Delta (δ)"}</label>
                    <input type="number" step="0.1" value={svenssonParams[param]} onChange={(e) => handleSvenssonParamChange(param, e.target.value)} disabled={!isEditing} style={inputStyle} />
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "12px" }}>
                <label style={labelStyle}>Scale</label>
                <input type="number" step="0.01" value={svenssonParams.scale} onChange={(e) => handleSvenssonParamChange("scale", e.target.value)} disabled={!isEditing} style={inputStyle} />
              </div>
              {isEditing && (
                <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                  <button onClick={() => { handleApply(); setIsEditing(false); }} style={{ ...buttonSuccess, flex: 1 }}>Apply</button>
                  <button onClick={() => { setSvenssonParams(DEFAULT_SVENSSON); setIsEditing(false); }} style={{ ...buttonSecondary, flex: 1 }}>Cancel</button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Fractal Dream Controls */}
        {attractorType === "fractal_dream" && (
          <>
            <div style={fieldStyle}>
              <label style={labelStyle}>Preset</label>
              <select
                value={fractalDreamPreset}
                onChange={handleFractalDreamPresetChange}
                disabled={isEditing}
                style={{ ...selectStyle, opacity: isEditing ? 0.5 : 1 }}
              >
                {fractalDreamData.map((preset, index) => (
                  <option key={index} value={index}>{preset.name}</option>
                ))}
              </select>
            </div>
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h4 style={{ margin: 0, fontSize: "14px", color: "#ffffff", fontWeight: 600 }}>Parameters</h4>
                {!isEditing && <button onClick={() => setIsEditing(true)} style={buttonPrimary}>Edit</button>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {(["alpha", "beta", "gamma", "delta"] as const).map(param => (
                  <div key={param}>
                    <label style={labelStyle}>{param === "alpha" ? "Alpha (α)" : param === "beta" ? "Beta (β)" : param === "gamma" ? "Gamma (γ)" : "Delta (δ)"}</label>
                    <input type="number" step="0.1" value={fractalDreamParams[param]} onChange={(e) => handleFractalDreamParamChange(param, e.target.value)} disabled={!isEditing} style={inputStyle} />
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "12px" }}>
                <label style={labelStyle}>Scale</label>
                <input type="number" step="0.01" value={fractalDreamParams.scale} onChange={(e) => handleFractalDreamParamChange("scale", e.target.value)} disabled={!isEditing} style={inputStyle} />
              </div>
              {isEditing && (
                <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                  <button onClick={() => { handleApply(); setIsEditing(false); }} style={{ ...buttonSuccess, flex: 1 }}>Apply</button>
                  <button onClick={() => { setFractalDreamParams(DEFAULT_FRACTAL_DREAM); setIsEditing(false); }} style={{ ...buttonSecondary, flex: 1 }}>Cancel</button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Hopalong Controls */}
        {attractorType === "hopalong" && (
          <>
            <div style={fieldStyle}>
              <label style={labelStyle}>Preset</label>
              <select
                value={hopalongPreset}
                onChange={handleHopalongPresetChange}
                disabled={isEditing}
                style={{ ...selectStyle, opacity: isEditing ? 0.5 : 1 }}
              >
                {hopalongData.map((preset, index) => (
                  <option key={index} value={index}>{preset.name}</option>
                ))}
              </select>
            </div>
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h4 style={{ margin: 0, fontSize: "14px", color: "#ffffff", fontWeight: 600 }}>Parameters</h4>
                {!isEditing && <button onClick={() => setIsEditing(true)} style={buttonPrimary}>Edit</button>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {(["alpha", "beta", "gamma"] as const).map(param => (
                  <div key={param}>
                    <label style={labelStyle}>{param === "alpha" ? "Alpha (α)" : param === "beta" ? "Beta (β)" : "Gamma (γ)"}</label>
                    <input type="number" step="0.1" value={hopalongParams[param]} onChange={(e) => handleHopalongParamChange(param, e.target.value)} disabled={!isEditing} style={inputStyle} />
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "12px" }}>
                <label style={labelStyle}>Scale</label>
                <input type="number" step="0.001" value={hopalongParams.scale} onChange={(e) => handleHopalongParamChange("scale", e.target.value)} disabled={!isEditing} style={inputStyle} />
              </div>
              {isEditing && (
                <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                  <button onClick={() => { handleApply(); setIsEditing(false); }} style={{ ...buttonSuccess, flex: 1 }}>Apply</button>
                  <button onClick={() => { setHopalongParams(DEFAULT_HOPALONG); setIsEditing(false); }} style={{ ...buttonSecondary, flex: 1 }}>Cancel</button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Mandelbrot Controls */}
        {attractorType === "mandelbrot" && (
          <>
            <div style={fieldStyle}>
              <label style={labelStyle}>Preset</label>
              <select
                value={mandelbrotPreset}
                onChange={handleMandelbrotPresetChange}
                disabled={isEditing}
                style={{ ...selectStyle, opacity: isEditing ? 0.5 : 1 }}
              >
                {mandelbrotData.map((preset, index) => (
                  <option key={index} value={index}>{preset.name}</option>
                ))}
              </select>
            </div>
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h4 style={{ margin: 0, fontSize: "14px", color: "#ffffff", fontWeight: 600 }}>Mandelbrot Parameters</h4>
                {!isEditing && <button onClick={() => setIsEditing(true)} style={buttonPrimary}>Edit</button>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Center X</label>
                  <input type="number" step="0.01" value={mandelbrotParams.centerX} onChange={(e) => setMandelbrotParams(p => ({ ...p, centerX: parseFloat(e.target.value) || 0 }))} disabled={!isEditing} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Center Y</label>
                  <input type="number" step="0.01" value={mandelbrotParams.centerY} onChange={(e) => setMandelbrotParams(p => ({ ...p, centerY: parseFloat(e.target.value) || 0 }))} disabled={!isEditing} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Zoom</label>
                  <input type="number" step="0.1" min="0.1" value={mandelbrotParams.zoom} onChange={(e) => setMandelbrotParams(p => ({ ...p, zoom: parseFloat(e.target.value) || 1 }))} disabled={!isEditing} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Max Iterations</label>
                  <input type="number" step="50" min="50" max="2000" value={mandelbrotParams.maxIter} onChange={(e) => setMandelbrotParams(p => ({ ...p, maxIter: parseInt(e.target.value) || 256 }))} disabled={!isEditing} style={inputStyle} />
                </div>
              </div>
              {isEditing && (
                <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                  <button onClick={() => { handleApply(); setIsEditing(false); }} style={{ ...buttonSuccess, flex: 1 }}>Apply</button>
                  <button onClick={() => { setMandelbrotParams(DEFAULT_MANDELBROT); setIsEditing(false); }} style={{ ...buttonSecondary, flex: 1 }}>Cancel</button>
                </div>
              )}
            </div>
            <div style={{ ...cardStyle, padding: "12px", marginTop: "8px" }}>
              <p style={{ margin: 0, fontSize: "11px", color: "rgba(255, 180, 120, 0.6)", lineHeight: "1.5" }}>
                Fractals render instantly. Use Edit to adjust parameters, then Apply to re-render. Increase Max Iterations for more detail at higher zoom levels.
              </p>
            </div>
          </>
        )}

        {/* Julia Controls */}
        {attractorType === "julia" && (
          <>
            <div style={fieldStyle}>
              <label style={labelStyle}>Preset</label>
              <select
                value={juliaPreset}
                onChange={handleJuliaPresetChange}
                disabled={isEditing}
                style={{ ...selectStyle, opacity: isEditing ? 0.5 : 1 }}
              >
                {juliaData.map((preset, index) => (
                  <option key={index} value={index}>{preset.name}</option>
                ))}
              </select>
            </div>
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h4 style={{ margin: 0, fontSize: "14px", color: "#ffffff", fontWeight: 600 }}>Julia Set Parameters</h4>
                {!isEditing && <button onClick={() => setIsEditing(true)} style={buttonPrimary}>Edit</button>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>C Real</label>
                  <input type="number" step="0.01" value={juliaParams.cReal} onChange={(e) => setJuliaParams(p => ({ ...p, cReal: parseFloat(e.target.value) || 0 }))} disabled={!isEditing} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>C Imaginary</label>
                  <input type="number" step="0.01" value={juliaParams.cImag} onChange={(e) => setJuliaParams(p => ({ ...p, cImag: parseFloat(e.target.value) || 0 }))} disabled={!isEditing} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Center X</label>
                  <input type="number" step="0.01" value={juliaParams.centerX} onChange={(e) => setJuliaParams(p => ({ ...p, centerX: parseFloat(e.target.value) || 0 }))} disabled={!isEditing} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Center Y</label>
                  <input type="number" step="0.01" value={juliaParams.centerY} onChange={(e) => setJuliaParams(p => ({ ...p, centerY: parseFloat(e.target.value) || 0 }))} disabled={!isEditing} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Zoom</label>
                  <input type="number" step="0.1" min="0.1" value={juliaParams.zoom} onChange={(e) => setJuliaParams(p => ({ ...p, zoom: parseFloat(e.target.value) || 1 }))} disabled={!isEditing} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Max Iterations</label>
                  <input type="number" step="50" min="50" max="2000" value={juliaParams.maxIter} onChange={(e) => setJuliaParams(p => ({ ...p, maxIter: parseInt(e.target.value) || 256 }))} disabled={!isEditing} style={inputStyle} />
                </div>
              </div>
              {isEditing && (
                <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                  <button onClick={() => { handleApply(); setIsEditing(false); }} style={{ ...buttonSuccess, flex: 1 }}>Apply</button>
                  <button onClick={() => { setJuliaParams(DEFAULT_JULIA); setIsEditing(false); }} style={{ ...buttonSecondary, flex: 1 }}>Cancel</button>
                </div>
              )}
            </div>
            <div style={{ ...cardStyle, padding: "12px", marginTop: "8px" }}>
              <p style={{ margin: 0, fontSize: "11px", color: "rgba(255, 180, 120, 0.6)", lineHeight: "1.5" }}>
                Julia sets are defined by the constant c = (C Real) + (C Imaginary)i. Try values like c = -0.7 + 0.27i or c = -0.4 + 0.6i for interesting patterns.
              </p>
            </div>
          </>
        )}

        {/* Burning Ship Controls */}
        {attractorType === "burningship" && (
          <>
            <div style={fieldStyle}>
              {!isEditing && <button onClick={() => setIsEditing(true)} style={buttonPrimary}>Edit</button>}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: isEditing ? 0 : "12px" }}>
                <div><label style={labelStyle}>Center X</label><input type="number" step="0.01" value={burningShipParams.centerX} onChange={(e) => setBurningShipParams(p => ({ ...p, centerX: parseFloat(e.target.value) || 0 }))} disabled={!isEditing} style={inputStyle} /></div>
                <div><label style={labelStyle}>Center Y</label><input type="number" step="0.01" value={burningShipParams.centerY} onChange={(e) => setBurningShipParams(p => ({ ...p, centerY: parseFloat(e.target.value) || 0 }))} disabled={!isEditing} style={inputStyle} /></div>
                <div><label style={labelStyle}>Zoom</label><input type="number" step="0.1" min="0.1" value={burningShipParams.zoom} onChange={(e) => setBurningShipParams(p => ({ ...p, zoom: parseFloat(e.target.value) || 1 }))} disabled={!isEditing} style={inputStyle} /></div>
                <div><label style={labelStyle}>Max Iter</label><input type="number" step="50" min="50" max="2000" value={burningShipParams.maxIter} onChange={(e) => setBurningShipParams(p => ({ ...p, maxIter: parseInt(e.target.value) || 256 }))} disabled={!isEditing} style={inputStyle} /></div>
              </div>
              {isEditing && (
                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                  <button onClick={() => { handleApply(); setIsEditing(false); }} style={{ ...buttonSuccess, flex: 1 }}>Apply</button>
                  <button onClick={() => { setBurningShipParams(DEFAULT_BURNING_SHIP); setIsEditing(false); }} style={{ ...buttonSecondary, flex: 1 }}>Cancel</button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Tricorn Controls */}
        {attractorType === "tricorn" && (
          <>
            <div style={fieldStyle}>
              {!isEditing && <button onClick={() => setIsEditing(true)} style={buttonPrimary}>Edit</button>}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: isEditing ? 0 : "12px" }}>
                <div><label style={labelStyle}>Center X</label><input type="number" step="0.01" value={tricornParams.centerX} onChange={(e) => setTricornParams(p => ({ ...p, centerX: parseFloat(e.target.value) || 0 }))} disabled={!isEditing} style={inputStyle} /></div>
                <div><label style={labelStyle}>Center Y</label><input type="number" step="0.01" value={tricornParams.centerY} onChange={(e) => setTricornParams(p => ({ ...p, centerY: parseFloat(e.target.value) || 0 }))} disabled={!isEditing} style={inputStyle} /></div>
                <div><label style={labelStyle}>Zoom</label><input type="number" step="0.1" min="0.1" value={tricornParams.zoom} onChange={(e) => setTricornParams(p => ({ ...p, zoom: parseFloat(e.target.value) || 1 }))} disabled={!isEditing} style={inputStyle} /></div>
                <div><label style={labelStyle}>Max Iter</label><input type="number" step="50" min="50" max="2000" value={tricornParams.maxIter} onChange={(e) => setTricornParams(p => ({ ...p, maxIter: parseInt(e.target.value) || 256 }))} disabled={!isEditing} style={inputStyle} /></div>
              </div>
              {isEditing && (
                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                  <button onClick={() => { handleApply(); setIsEditing(false); }} style={{ ...buttonSuccess, flex: 1 }}>Apply</button>
                  <button onClick={() => { setTricornParams(DEFAULT_TRICORN); setIsEditing(false); }} style={{ ...buttonSecondary, flex: 1 }}>Cancel</button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Multibrot Controls */}
        {attractorType === "multibrot" && (
          <>
            <div style={fieldStyle}>
              {!isEditing && <button onClick={() => setIsEditing(true)} style={buttonPrimary}>Edit</button>}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: isEditing ? 0 : "12px" }}>
                <div><label style={labelStyle}>Center X</label><input type="number" step="0.01" value={multibrotParams.centerX} onChange={(e) => setMultibrotParams(p => ({ ...p, centerX: parseFloat(e.target.value) || 0 }))} disabled={!isEditing} style={inputStyle} /></div>
                <div><label style={labelStyle}>Center Y</label><input type="number" step="0.01" value={multibrotParams.centerY} onChange={(e) => setMultibrotParams(p => ({ ...p, centerY: parseFloat(e.target.value) || 0 }))} disabled={!isEditing} style={inputStyle} /></div>
                <div><label style={labelStyle}>Zoom</label><input type="number" step="0.1" min="0.1" value={multibrotParams.zoom} onChange={(e) => setMultibrotParams(p => ({ ...p, zoom: parseFloat(e.target.value) || 1 }))} disabled={!isEditing} style={inputStyle} /></div>
                <div><label style={labelStyle}>Power</label><input type="number" step="1" min="2" max="10" value={multibrotParams.power} onChange={(e) => setMultibrotParams(p => ({ ...p, power: parseInt(e.target.value) || 3 }))} disabled={!isEditing} style={inputStyle} /></div>
                <div style={{ gridColumn: "span 2" }}><label style={labelStyle}>Max Iter</label><input type="number" step="50" min="50" max="2000" value={multibrotParams.maxIter} onChange={(e) => setMultibrotParams(p => ({ ...p, maxIter: parseInt(e.target.value) || 256 }))} disabled={!isEditing} style={inputStyle} /></div>
              </div>
              {isEditing && (
                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                  <button onClick={() => { handleApply(); setIsEditing(false); }} style={{ ...buttonSuccess, flex: 1 }}>Apply</button>
                  <button onClick={() => { setMultibrotParams(DEFAULT_MULTIBROT); setIsEditing(false); }} style={{ ...buttonSecondary, flex: 1 }}>Cancel</button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Newton Controls */}
        {attractorType === "newton" && (
          <>
            <div style={fieldStyle}>
              {!isEditing && <button onClick={() => setIsEditing(true)} style={buttonPrimary}>Edit</button>}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: isEditing ? 0 : "12px" }}>
                <div><label style={labelStyle}>Center X</label><input type="number" step="0.01" value={newtonParams.centerX} onChange={(e) => setNewtonParams(p => ({ ...p, centerX: parseFloat(e.target.value) || 0 }))} disabled={!isEditing} style={inputStyle} /></div>
                <div><label style={labelStyle}>Center Y</label><input type="number" step="0.01" value={newtonParams.centerY} onChange={(e) => setNewtonParams(p => ({ ...p, centerY: parseFloat(e.target.value) || 0 }))} disabled={!isEditing} style={inputStyle} /></div>
                <div><label style={labelStyle}>Zoom</label><input type="number" step="0.1" min="0.1" value={newtonParams.zoom} onChange={(e) => setNewtonParams(p => ({ ...p, zoom: parseFloat(e.target.value) || 1 }))} disabled={!isEditing} style={inputStyle} /></div>
                <div><label style={labelStyle}>Max Iter</label><input type="number" step="10" min="10" max="500" value={newtonParams.maxIter} onChange={(e) => setNewtonParams(p => ({ ...p, maxIter: parseInt(e.target.value) || 64 }))} disabled={!isEditing} style={inputStyle} /></div>
              </div>
              {isEditing && (
                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                  <button onClick={() => { handleApply(); setIsEditing(false); }} style={{ ...buttonSuccess, flex: 1 }}>Apply</button>
                  <button onClick={() => { setNewtonParams(DEFAULT_NEWTON); setIsEditing(false); }} style={{ ...buttonSecondary, flex: 1 }}>Cancel</button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Phoenix Controls */}
        {attractorType === "phoenix" && (
          <>
            <div style={fieldStyle}>
              {!isEditing && <button onClick={() => setIsEditing(true)} style={buttonPrimary}>Edit</button>}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: isEditing ? 0 : "12px" }}>
                <div><label style={labelStyle}>C Real</label><input type="number" step="0.01" value={phoenixParams.cReal} onChange={(e) => setPhoenixParams(p => ({ ...p, cReal: parseFloat(e.target.value) || 0 }))} disabled={!isEditing} style={inputStyle} /></div>
                <div><label style={labelStyle}>C Imag</label><input type="number" step="0.01" value={phoenixParams.cImag} onChange={(e) => setPhoenixParams(p => ({ ...p, cImag: parseFloat(e.target.value) || 0 }))} disabled={!isEditing} style={inputStyle} /></div>
                <div><label style={labelStyle}>P (Memory)</label><input type="number" step="0.05" value={phoenixParams.p} onChange={(e) => setPhoenixParams(p => ({ ...p, p: parseFloat(e.target.value) || 0 }))} disabled={!isEditing} style={inputStyle} /></div>
                <div><label style={labelStyle}>Zoom</label><input type="number" step="0.1" min="0.1" value={phoenixParams.zoom} onChange={(e) => setPhoenixParams(p => ({ ...p, zoom: parseFloat(e.target.value) || 1 }))} disabled={!isEditing} style={inputStyle} /></div>
                <div><label style={labelStyle}>Center X</label><input type="number" step="0.01" value={phoenixParams.centerX} onChange={(e) => setPhoenixParams(p => ({ ...p, centerX: parseFloat(e.target.value) || 0 }))} disabled={!isEditing} style={inputStyle} /></div>
                <div><label style={labelStyle}>Center Y</label><input type="number" step="0.01" value={phoenixParams.centerY} onChange={(e) => setPhoenixParams(p => ({ ...p, centerY: parseFloat(e.target.value) || 0 }))} disabled={!isEditing} style={inputStyle} /></div>
                <div style={{ gridColumn: "span 2" }}><label style={labelStyle}>Max Iter</label><input type="number" step="50" min="50" max="2000" value={phoenixParams.maxIter} onChange={(e) => setPhoenixParams(p => ({ ...p, maxIter: parseInt(e.target.value) || 256 }))} disabled={!isEditing} style={inputStyle} /></div>
              </div>
              {isEditing && (
                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                  <button onClick={() => { handleApply(); setIsEditing(false); }} style={{ ...buttonSuccess, flex: 1 }}>Apply</button>
                  <button onClick={() => { setPhoenixParams(DEFAULT_PHOENIX); setIsEditing(false); }} style={{ ...buttonSecondary, flex: 1 }}>Cancel</button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Lyapunov Controls */}
        {attractorType === "lyapunov" && (
          <>
            <div style={fieldStyle}>
              {!isEditing && <button onClick={() => setIsEditing(true)} style={buttonPrimary}>Edit</button>}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: isEditing ? 0 : "12px" }}>
                <div><label style={labelStyle}>A Min</label><input type="number" step="0.1" value={lyapunovParams.aMin} onChange={(e) => setLyapunovParams(p => ({ ...p, aMin: parseFloat(e.target.value) || 2 }))} disabled={!isEditing} style={inputStyle} /></div>
                <div><label style={labelStyle}>A Max</label><input type="number" step="0.1" value={lyapunovParams.aMax} onChange={(e) => setLyapunovParams(p => ({ ...p, aMax: parseFloat(e.target.value) || 4 }))} disabled={!isEditing} style={inputStyle} /></div>
                <div><label style={labelStyle}>B Min</label><input type="number" step="0.1" value={lyapunovParams.bMin} onChange={(e) => setLyapunovParams(p => ({ ...p, bMin: parseFloat(e.target.value) || 2 }))} disabled={!isEditing} style={inputStyle} /></div>
                <div><label style={labelStyle}>B Max</label><input type="number" step="0.1" value={lyapunovParams.bMax} onChange={(e) => setLyapunovParams(p => ({ ...p, bMax: parseFloat(e.target.value) || 4 }))} disabled={!isEditing} style={inputStyle} /></div>
                <div><label style={labelStyle}>Sequence</label><input type="text" value={lyapunovParams.sequence} onChange={(e) => setLyapunovParams(p => ({ ...p, sequence: e.target.value || "AB" }))} disabled={!isEditing} style={inputStyle} /></div>
                <div><label style={labelStyle}>Max Iter</label><input type="number" step="10" min="10" max="500" value={lyapunovParams.maxIter} onChange={(e) => setLyapunovParams(p => ({ ...p, maxIter: parseInt(e.target.value) || 100 }))} disabled={!isEditing} style={inputStyle} /></div>
              </div>
              {isEditing && (
                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                  <button onClick={() => { handleApply(); setIsEditing(false); }} style={{ ...buttonSuccess, flex: 1 }}>Apply</button>
                  <button onClick={() => { setLyapunovParams(DEFAULT_LYAPUNOV); setIsEditing(false); }} style={{ ...buttonSecondary, flex: 1 }}>Cancel</button>
                </div>
              )}
            </div>
            <div style={{ ...cardStyle, padding: "12px", marginTop: "8px" }}>
              <p style={{ margin: 0, fontSize: "11px", color: "rgba(255, 180, 120, 0.6)", lineHeight: "1.5" }}>
                Lyapunov fractals use a sequence like "AB" or "AABB". A and B represent the two parameter values that alternate during iteration.
              </p>
            </div>
          </>
        )}

            </div>
          )}
        </div>
        </div>

        {/* Stats Footer */}
        <div style={{
          padding: "12px 20px",
          borderTop: "1px solid rgba(255, 180, 120, 0.12)",
          background: "rgba(0, 0, 0, 0.3)",
        }}>
          {isFractalType ? (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "rgba(255, 180, 120, 0.7)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Max Iter</span>
              <span style={{
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: 700,
              }}>{
                attractorType === "mandelbrot" ? mandelbrotParams.maxIter :
                attractorType === "julia" ? juliaParams.maxIter :
                attractorType === "burningship" ? burningShipParams.maxIter :
                attractorType === "tricorn" ? tricornParams.maxIter :
                attractorType === "multibrot" ? multibrotParams.maxIter :
                attractorType === "newton" ? newtonParams.maxIter :
                attractorType === "phoenix" ? phoenixParams.maxIter :
                attractorType === "lyapunov" ? lyapunovParams.maxIter : 0
              }</span>
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "rgba(255, 180, 120, 0.7)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Hits / Iter</span>
              <span style={{
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: 700,
              }}>{formatCompact(maxHits)} / {formatCompact(totalIterations)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      {(() => {
        const scaledSize = canvasSize * zoom;
        const needsScroll = scaledSize > containerSize.width || scaledSize > containerSize.height;
        return (
          <div
            ref={containerRef}
            style={{
              flex: 1,
              overflow: needsScroll ? "auto" : "hidden",
              background: "linear-gradient(135deg, #0f0a08 0%, #1a1210 100%)",
              display: needsScroll ? "block" : "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            {needsScroll ? (
              <div
                style={{
                  width: scaledSize,
                  height: scaledSize,
                  margin: "20px",
                  position: "relative",
                  cursor: isFractalType ? "crosshair" : "default",
                }}
                onMouseDown={handleFractalMouseDown}
                onMouseMove={handleFractalMouseMove}
                onMouseUp={handleFractalMouseUp}
                onMouseLeave={handleFractalMouseUp}
              >
                <canvas
                  key={canvasKey}
                  ref={canvasRef}
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: "top left",
                    borderRadius: "16px",
                    boxShadow: "0 0 80px rgba(245, 158, 11, 0.12), 0 20px 60px rgba(0, 0, 0, 0.5)",
                  }}
                />
                {/* Drag selection rectangle */}
                {isFractalType && isDragging && dragStart && dragEnd && (
                  <div style={{
                    position: "absolute",
                    left: Math.min(dragStart.x, dragEnd.x) * zoom,
                    top: Math.min(dragStart.y, dragEnd.y) * zoom,
                    width: Math.abs(dragEnd.x - dragStart.x) * zoom,
                    height: Math.abs(dragEnd.y - dragStart.y) * zoom,
                    border: "2px dashed rgba(255, 180, 120, 0.9)",
                    background: "rgba(255, 180, 120, 0.15)",
                    pointerEvents: "none",
                    borderRadius: "4px",
                  }} />
                )}
              </div>
            ) : (
              <div
                style={{
                  width: scaledSize,
                  height: scaledSize,
                  position: "relative",
                  cursor: isFractalType ? "crosshair" : "default",
                }}
                onMouseDown={handleFractalMouseDown}
                onMouseMove={handleFractalMouseMove}
                onMouseUp={handleFractalMouseUp}
                onMouseLeave={handleFractalMouseUp}
              >
                <canvas
                  key={canvasKey}
                  ref={canvasRef}
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: "top left",
                    borderRadius: "16px",
                    boxShadow: "0 0 80px rgba(245, 158, 11, 0.12), 0 20px 60px rgba(0, 0, 0, 0.5)",
                  }}
                />
                {/* Drag selection rectangle */}
                {isFractalType && isDragging && dragStart && dragEnd && (
                  <div style={{
                    position: "absolute",
                    left: Math.min(dragStart.x, dragEnd.x) * zoom,
                    top: Math.min(dragStart.y, dragEnd.y) * zoom,
                    width: Math.abs(dragEnd.x - dragStart.x) * zoom,
                    height: Math.abs(dragEnd.y - dragStart.y) * zoom,
                    border: "2px dashed rgba(255, 180, 120, 0.9)",
                    background: "rgba(255, 180, 120, 0.15)",
                    pointerEvents: "none",
                    borderRadius: "4px",
                  }} />
                )}
              </div>
            )}

            {/* Floating Zoom Panel */}
            <div style={{
              position: "absolute",
              bottom: 20,
              left: 20,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 12px",
              background: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              borderRadius: "14px",
              border: "1px solid rgba(255, 180, 120, 0.2)",
              boxShadow: "0 4px 24px rgba(0, 0, 0, 0.5)",
              zIndex: 100,
            }}>
              <button onClick={handleZoomOut} style={floatingButton} title="Zoom Out">−</button>
              <button onClick={handleZoomIn} style={floatingButton} title="Zoom In">+</button>
              <span style={{
                color: "#fff",
                fontSize: "13px",
                fontWeight: 600,
                minWidth: "42px",
                textAlign: "center",
                opacity: 0.9,
              }}>
                {Math.round(zoom * 100)}%
              </span>
              <button onClick={handleZoomReset} style={floatingButton} title="Reset to 100%">1:1</button>
              <button onClick={handleFitToView} style={floatingButton} title="Fit to View">⊡</button>
            </div>

            {/* Floating Control Panel */}
            <div style={{
              position: "absolute",
              bottom: 20,
              right: 20,
              display: "flex",
              gap: "8px",
              padding: "10px",
              background: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              borderRadius: "14px",
              border: "1px solid rgba(255, 180, 120, 0.2)",
              boxShadow: "0 4px 24px rgba(0, 0, 0, 0.5)",
              zIndex: 100,
            }}>
              {/* Start/Stop - hidden for fractals */}
              {!isFractalType && (
                <button
                  onClick={handleIterating}
                  style={{
                    ...floatingButton,
                    background: iterating ? "rgba(239, 68, 68, 0.3)" : "rgba(34, 197, 94, 0.3)",
                    borderColor: iterating ? "rgba(239, 68, 68, 0.5)" : "rgba(34, 197, 94, 0.5)",
                  }}
                  title={iterating ? "Stop" : "Start"}
                >
                  {iterating ? "■" : "▶"}
                </button>
              )}

              {/* Reset View - only for fractals */}
              {isFractalType && (
                <button
                  onClick={handleResetFractalView}
                  style={floatingButton}
                  title="Reset View"
                >
                  ↺
                </button>
              )}

              {/* Palette */}
              <button
                onClick={() => setPaletteModalOpen(true)}
                style={floatingButton}
                title="Palette"
              >
                🎨
              </button>

              {/* Save */}
              <button
                onClick={handleSaveImage}
                disabled={(!isFractalType && maxHits === 0) || iterating}
                style={{
                  ...floatingButton,
                  opacity: ((!isFractalType && maxHits === 0) || iterating) ? 0.4 : 1,
                  cursor: ((!isFractalType && maxHits === 0) || iterating) ? "not-allowed" : "pointer",
                }}
                title="Save Image"
              >
                💾
              </button>
            </div>
          </div>
        );
      })()}

      {/* Palette Editor Modal */}
      {paletteModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setPaletteModalOpen(false)}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)",
              borderRadius: "20px",
              padding: "2px",
              width: "90%",
              maxWidth: "800px",
              maxHeight: "90vh",
              boxShadow: "0 25px 80px rgba(0, 0, 0, 0.6), 0 0 40px rgba(245, 158, 11, 0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              background: "linear-gradient(135deg, #1a1214 0%, #2d1f1f 100%)",
              borderRadius: "18px",
              padding: "24px",
              overflow: "auto",
              maxHeight: "calc(90vh - 4px)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ margin: 0, fontSize: "20px", color: "#ffffff", fontWeight: 700 }}>Palette Editor</h2>
                <button onClick={() => setPaletteModalOpen(false)} style={buttonPrimary}>
                  Done
                </button>
              </div>
              {paletteRef.current && (
                <Suspense fallback={<div style={{ padding: "20px", textAlign: "center", color: "rgba(255, 180, 120, 0.6)" }}>Loading palette editor...</div>}>
                  <ColorBar
                    key={paletteKey}
                    palletteArg={paletteRef.current.getPalette()}
                    changePalletCallback={handlePaletteChange}
                  />
                </Suspense>
              )}

              {/* Color Settings */}
              <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid rgba(255, 180, 120, 0.15)" }}>
                <h4 style={{ margin: "0 0 16px 0", fontSize: "14px", color: "#ffffff", fontWeight: 600 }}>Color Settings</h4>

                {/* Gamma */}
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255, 180, 120, 0.7)", textTransform: "uppercase", letterSpacing: "1px" }}>Gamma (γ)</label>
                    <span style={{ color: "#ffffff", fontSize: "14px", fontWeight: 600 }}>{palGamma.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.05"
                    value={palGamma}
                    onChange={(e) => handleGammaChange(parseFloat(e.target.value))}
                    style={{
                      width: "100%",
                      accentColor: "#f59e0b",
                    }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "rgba(255, 180, 120, 0.5)" }}>
                    <span>Bright</span>
                    <span>Dark</span>
                  </div>
                </div>

                {/* Scale Mode Toggle */}
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "12px", fontWeight: 600, color: "rgba(255, 180, 120, 0.7)", textTransform: "uppercase", letterSpacing: "1px" }}>Hit Scaling</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => handleScaleModeChange(true)}
                      style={{
                        flex: 1,
                        padding: "10px 16px",
                        fontSize: "13px",
                        fontWeight: 600,
                        border: palScale ? "2px solid #f59e0b" : "1px solid rgba(255, 180, 120, 0.2)",
                        borderRadius: "10px",
                        background: palScale ? "rgba(245, 158, 11, 0.2)" : "rgba(0, 0, 0, 0.3)",
                        color: palScale ? "#f59e0b" : "#ffffff",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      Dynamic
                    </button>
                    <button
                      onClick={() => handleScaleModeChange(false)}
                      style={{
                        flex: 1,
                        padding: "10px 16px",
                        fontSize: "13px",
                        fontWeight: 600,
                        border: !palScale ? "2px solid #f59e0b" : "1px solid rgba(255, 180, 120, 0.2)",
                        borderRadius: "10px",
                        background: !palScale ? "rgba(245, 158, 11, 0.2)" : "rgba(0, 0, 0, 0.3)",
                        color: !palScale ? "#f59e0b" : "#ffffff",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      Fixed
                    </button>
                  </div>
                </div>

                {/* Fixed Max Hits - only show when not using dynamic scaling */}
                {!palScale && (
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontSize: "12px", fontWeight: 600, color: "rgba(255, 180, 120, 0.7)", textTransform: "uppercase", letterSpacing: "1px" }}>Fixed Max Hits</label>
                    <input
                      type="number"
                      min="100"
                      step="1000"
                      value={palMax}
                      onChange={(e) => handlePalMaxChange(parseInt(e.target.value) || 1000)}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        fontSize: "14px",
                        borderRadius: "10px",
                        border: "1px solid rgba(255, 180, 120, 0.2)",
                        boxSizing: "border-box",
                        background: "rgba(0, 0, 0, 0.3)",
                        color: "#ffffff",
                        fontWeight: 500,
                        outline: "none",
                      }}
                    />
                  </div>
                )}

                {/* Background Color */}
                <div style={{ marginTop: "16px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "12px", fontWeight: 600, color: "rgba(255, 180, 120, 0.7)", textTransform: "uppercase", letterSpacing: "1px" }}>Background Color</label>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <input
                      type="color"
                      value={`#${bgColor.r.toString(16).padStart(2, '0')}${bgColor.g.toString(16).padStart(2, '0')}${bgColor.b.toString(16).padStart(2, '0')}`}
                      onChange={(e) => {
                        const hex = e.target.value;
                        const r = parseInt(hex.slice(1, 3), 16);
                        const g = parseInt(hex.slice(3, 5), 16);
                        const b = parseInt(hex.slice(5, 7), 16);
                        handleBgColorChange({ r, g, b });
                      }}
                      style={{
                        width: "60px",
                        height: "40px",
                        padding: "2px",
                        borderRadius: "8px",
                        border: "2px solid rgba(255, 180, 120, 0.3)",
                        background: "transparent",
                        cursor: "pointer",
                      }}
                    />
                    <div style={{ display: "flex", gap: "8px", flex: 1 }}>
                      <button
                        onClick={() => handleBgColorChange({ r: 255, g: 255, b: 255 })}
                        style={{
                          flex: 1,
                          padding: "8px",
                          fontSize: "12px",
                          fontWeight: 600,
                          border: bgColor.r === 255 && bgColor.g === 255 && bgColor.b === 255 ? "2px solid #f59e0b" : "1px solid rgba(255, 180, 120, 0.2)",
                          borderRadius: "8px",
                          background: "#ffffff",
                          color: "#000000",
                          cursor: "pointer",
                        }}
                      >
                        White
                      </button>
                      <button
                        onClick={() => handleBgColorChange({ r: 0, g: 0, b: 0 })}
                        style={{
                          flex: 1,
                          padding: "8px",
                          fontSize: "12px",
                          fontWeight: 600,
                          border: bgColor.r === 0 && bgColor.g === 0 && bgColor.b === 0 ? "2px solid #f59e0b" : "1px solid rgba(255, 180, 120, 0.2)",
                          borderRadius: "8px",
                          background: "#000000",
                          color: "#ffffff",
                          cursor: "pointer",
                        }}
                      >
                        Black
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
