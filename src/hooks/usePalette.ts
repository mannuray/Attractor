import { useState, useEffect, useRef } from "react";
import { Color, Palette } from "../model-controller/Attractor/palette";
import { CONFIG, DEFAULT_PALETTE } from "../attractors/shared/types";

interface BgColor {
  r: number;
  g: number;
  b: number;
}

interface UsePaletteReturn {
  paletteData: Color[];
  setPaletteData: (data: Color[]) => void;
  palGamma: number;
  setPalGamma: (gamma: number) => void;
  palScale: boolean;
  setPalScale: (scale: boolean) => void;
  palMax: number;
  setPalMax: (max: number) => void;
  bgColor: BgColor;
  setBgColor: (color: BgColor) => void;
  paletteRef: React.MutableRefObject<Palette | null>;
  colorLUTRef: React.MutableRefObject<Uint32Array | null>;
  paletteKey: number;
}

export function usePalette(initialPalette: Color[] = DEFAULT_PALETTE, initialGamma: number = 0.5): UsePaletteReturn {
  const paletteRef = useRef<Palette | null>(null);
  const colorLUTRef = useRef<Uint32Array | null>(null);

  const [paletteData, setPaletteData] = useState<Color[]>(initialPalette);
  const [palGamma, setPalGamma] = useState(initialGamma);
  const [palScale, setPalScale] = useState(true); // true = dynamic, false = fixed
  const [palMax, setPalMax] = useState(10000);
  const [bgColor, setBgColor] = useState<BgColor>({ r: 255, g: 255, b: 255 });
  const [paletteKey, setPaletteKey] = useState(0);

  // Initialize palette and generate color LUT
  useEffect(() => {
    paletteRef.current = new Palette(paletteData, () => {});

    // Generate color lookup table for fast rendering
    const lut = new Uint32Array(CONFIG.COLOR_LUT_SIZE);
    for (let i = 0; i < CONFIG.COLOR_LUT_SIZE; i++) {
      const ratio = i / CONFIG.COLOR_LUT_SIZE;
      const col = paletteRef.current.color(ratio);
      // Pack RGBA into single 32-bit value (ABGR format for ImageData)
      lut[i] = (255 << 24) | (col.blue << 16) | (col.green << 8) | col.red;
    }
    colorLUTRef.current = lut;

    setPaletteKey(prev => prev + 1);
  }, [paletteData]);

  return {
    paletteData,
    setPaletteData,
    palGamma,
    setPalGamma,
    palScale,
    setPalScale,
    palMax,
    setPalMax,
    bgColor,
    setBgColor,
    paletteRef,
    colorLUTRef,
    paletteKey,
  };
}

export default usePalette;
