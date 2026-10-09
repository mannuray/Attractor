// Every system's presets in one place (pure data, no React), in the order the controls list
// them. Used by the studio to apply a preset and by the build to render preset thumbnails.
import type { AttractorType } from "./shared/types";
import type { Color } from "../model-controller/Attractor/palette";
import symmetricIconData, {
  cliffordData, deJongData, tinkerbellData, henonData, bedheadData, svenssonData,
  fractalDreamData, hopalongData, symmetricQuiltData, mandelbrotData, juliaData,
} from "../Parametersets";
import { gumowskiMiraPresets } from "./gumowskiMira/config";
import { sprottPresets } from "./sprott/config";
import { symmetricFractalPresets } from "./symmetricFractal/config";
import { deRhamPresets } from "./deRham/config";
import { conradiPresets } from "./conradi/config";
import { mobiusPresets } from "./mobius/config";

export interface Preset {
  name: string;
  /** The system's parameters only. */
  params: Record<string, any>;
  /** The preset's own look, when it has one (otherwise the current palette is kept). */
  paletteData?: Color[];
  palGamma?: number;
}

/** Data-file presets carry name and palette alongside the maths. */
const fromData = (list: Record<string, any>[]): Preset[] =>
  list.map(({ name, paletteData, palGamma, ...params }) => ({ name, params, paletteData, palGamma }));

const fromConfig = (list: { name: string; params: object }[]): Preset[] =>
  list.map(({ name, params }) => ({ name, params: params as Record<string, any> }));

export const PRESETS: Partial<Record<AttractorType, Preset[]>> = {
  symmetric_icon: fromData(symmetricIconData),
  symmetric_quilt: fromData(symmetricQuiltData),
  clifford: fromData(cliffordData),
  dejong: fromData(deJongData),
  tinkerbell: fromData(tinkerbellData),
  henon: fromData(henonData),
  bedhead: fromData(bedheadData),
  svensson: fromData(svenssonData),
  fractal_dream: fromData(fractalDreamData),
  hopalong: fromData(hopalongData),
  gumowski_mira: fromConfig(gumowskiMiraPresets),
  sprott: fromConfig(sprottPresets),
  symmetric_fractal: fromConfig(symmetricFractalPresets),
  derham: fromConfig(deRhamPresets),
  conradi: fromConfig(conradiPresets),
  mobius: fromConfig(mobiusPresets),
  mandelbrot: fromData(mandelbrotData),
  julia: fromData(juliaData),
};

export const presetFor = (type: string, index: number): Preset | undefined =>
  PRESETS[type as AttractorType]?.[index];

/** Site path of a preset's committed thumbnail (see scripts/build-preset-thumbs.mjs). */
export const presetThumbPath = (system: string, index: number) => `/presets/${system}/${index}.webp`;
