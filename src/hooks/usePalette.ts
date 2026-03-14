import { useState, useEffect, useRef, useCallback } from "react";
import { Color, Palette } from "../model-controller/Attractor/palette";
import { CONFIG, DEFAULT_PALETTE } from "../attractors/shared/types";
import { useTheme } from "../theme/ThemeContext";

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
  cycleBgColor: () => void;
  paletteRef: React.MutableRefObject<Palette | null>;
  colorLUTRef: React.MutableRefObject<Uint32Array | null>;
  paletteKey: number;
}

// Helper to parse hex to RGB
const hexToRgb = (hex: string): BgColor => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

export function usePalette(initialPalette: Color[] = DEFAULT_PALETTE, initialGamma: number = 0.5): UsePaletteReturn {
  const paletteRef = useRef<Palette | null>(null);
  const colorLUTRef = useRef<Uint32Array | null>(null);
  const { colors } = useTheme();

  const [paletteData, setPaletteData] = useState<Color[]>(initialPalette);
  const [palGamma, setPalGamma] = useState(initialGamma);
  const [palScale, setPalScale] = useState(true); // true = dynamic, false = fixed
  const [palMax, setPalMax] = useState(10000);
  const [bgColor, setBgColor] = useState<BgColor>({ r: 0, g: 0, b: 0 }); // Default to Black
  const [paletteKey, setPaletteKey] = useState(0);

  // Cycle through background modes: Black -> Theme -> White
  const cycleBgColor = useCallback(() => {
    setBgColor(prev => {
      // If currently black, go to Theme Gray
      if (prev.r === 0 && prev.g === 0 && prev.b === 0) {
        return hexToRgb(colors.bgPage);
      }
      // If currently White, go to Black
      if (prev.r === 255 && prev.g === 255 && prev.b === 255) {
        return { r: 0, g: 0, b: 0 };
      }
      // Otherwise (Theme Gray), go to White
      return { r: 255, g: 255, b: 255 };
    });
  }, [colors.bgPage]);

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
    cycleBgColor,
    paletteRef,
    colorLUTRef,
    paletteKey,
  };
}

export default usePalette;
