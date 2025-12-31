import { useState, useCallback } from "react";
import { AttractorType, CONFIG } from "../attractors/shared/types";
import { SymmetricIconParams } from "../attractors/symmetricIcon";
import { SymmetricQuiltParams, DEFAULT_SYMMETRIC_QUILT } from "../attractors/symmetricQuilt";
import { CliffordParams, DEFAULT_CLIFFORD } from "../attractors/clifford";
import { DeJongParams, DEFAULT_DEJONG } from "../attractors/deJong";
import { TinkerbellParams, DEFAULT_TINKERBELL } from "../attractors/tinkerbell";
import { HenonParams, DEFAULT_HENON } from "../attractors/henon";
import { BedheadParams, DEFAULT_BEDHEAD } from "../attractors/bedhead";
import { SvenssonParams, DEFAULT_SVENSSON } from "../attractors/svensson";
import { FractalDreamParams, DEFAULT_FRACTAL_DREAM } from "../attractors/fractalDream";
import { HopalongParams, DEFAULT_HOPALONG } from "../attractors/hopalong";
import { MandelbrotParams, DEFAULT_MANDELBROT } from "../attractors/mandelbrot";
import { JuliaParams, DEFAULT_JULIA } from "../attractors/julia";
import { BurningShipParams, DEFAULT_BURNING_SHIP } from "../attractors/burningship";
import { TricornParams, DEFAULT_TRICORN } from "../attractors/tricorn";
import { MultibrotParams, DEFAULT_MULTIBROT } from "../attractors/multibrot";
import { NewtonParams, DEFAULT_NEWTON } from "../attractors/newton";
import { PhoenixParams, DEFAULT_PHOENIX } from "../attractors/phoenix";
import { LyapunovParams, DEFAULT_LYAPUNOV } from "../attractors/lyapunov";
import { GumowskiMiraParams, DEFAULT_GUMOWSKI_MIRA } from "../attractors/gumowskiMira";
import { SprottParams, DEFAULT_SPROTT } from "../attractors/sprott";
import { SymmetricFractalParams, DEFAULT_SYMMETRIC_FRACTAL } from "../attractors/symmetricFractal";
import { DeRhamParams, DEFAULT_DERHAM } from "../attractors/deRham";
import { ConradiParams, DEFAULT_CONRADI } from "../attractors/conradi";
import { MobiusParams, DEFAULT_MOBIUS } from "../attractors/mobius";
import { JasonRampe1Params, DEFAULT_JASON_RAMPE1 } from "../attractors/jasonRampe1";
import { JasonRampe2Params, DEFAULT_JASON_RAMPE2 } from "../attractors/jasonRampe2";
import { JasonRampe3Params, DEFAULT_JASON_RAMPE3 } from "../attractors/jasonRampe3";
import symmetricIconData from "../Parametersets";

// All params union type
export type AllParams =
  | SymmetricIconParams
  | SymmetricQuiltParams
  | CliffordParams
  | DeJongParams
  | TinkerbellParams
  | HenonParams
  | BedheadParams
  | SvenssonParams
  | FractalDreamParams
  | HopalongParams
  | GumowskiMiraParams
  | SprottParams
  | SymmetricFractalParams
  | DeRhamParams
  | ConradiParams
  | MobiusParams
  | JasonRampe1Params
  | JasonRampe2Params
  | JasonRampe3Params
  | MandelbrotParams
  | JuliaParams
  | BurningShipParams
  | TricornParams
  | MultibrotParams
  | NewtonParams
  | PhoenixParams
  | LyapunovParams;

export interface AttractorState {
  // Current type
  attractorType: AttractorType;
  setAttractorType: (type: AttractorType) => void;

  // Symmetric Icon
  iconParams: SymmetricIconParams;
  setIconParams: (params: SymmetricIconParams) => void;
  iconPreset: number;
  setIconPreset: (preset: number) => void;

  // Symmetric Quilt
  symmetricQuiltParams: SymmetricQuiltParams;
  setSymmetricQuiltParams: (params: SymmetricQuiltParams) => void;
  symmetricQuiltPreset: number;
  setSymmetricQuiltPreset: (preset: number) => void;

  // Clifford
  cliffordParams: CliffordParams;
  setCliffordParams: (params: CliffordParams) => void;
  cliffordPreset: number;
  setCliffordPreset: (preset: number) => void;

  // De Jong
  deJongParams: DeJongParams;
  setDeJongParams: (params: DeJongParams) => void;
  deJongPreset: number;
  setDeJongPreset: (preset: number) => void;

  // Tinkerbell
  tinkerbellParams: TinkerbellParams;
  setTinkerbellParams: (params: TinkerbellParams) => void;
  tinkerbellPreset: number;
  setTinkerbellPreset: (preset: number) => void;

  // Henon
  henonParams: HenonParams;
  setHenonParams: (params: HenonParams) => void;
  henonPreset: number;
  setHenonPreset: (preset: number) => void;

  // Bedhead
  bedheadParams: BedheadParams;
  setBedheadParams: (params: BedheadParams) => void;
  bedheadPreset: number;
  setBedheadPreset: (preset: number) => void;

  // Svensson
  svenssonParams: SvenssonParams;
  setSvenssonParams: (params: SvenssonParams) => void;
  svenssonPreset: number;
  setSvenssonPreset: (preset: number) => void;

  // Fractal Dream
  fractalDreamParams: FractalDreamParams;
  setFractalDreamParams: (params: FractalDreamParams) => void;
  fractalDreamPreset: number;
  setFractalDreamPreset: (preset: number) => void;

  // Hopalong
  hopalongParams: HopalongParams;
  setHopalongParams: (params: HopalongParams) => void;
  hopalongPreset: number;
  setHopalongPreset: (preset: number) => void;

  // Mandelbrot
  mandelbrotParams: MandelbrotParams;
  setMandelbrotParams: (params: MandelbrotParams) => void;
  mandelbrotPreset: number;
  setMandelbrotPreset: (preset: number) => void;

  // Julia
  juliaParams: JuliaParams;
  setJuliaParams: (params: JuliaParams) => void;
  juliaPreset: number;
  setJuliaPreset: (preset: number) => void;

  // Burning Ship
  burningShipParams: BurningShipParams;
  setBurningShipParams: (params: BurningShipParams) => void;

  // Tricorn
  tricornParams: TricornParams;
  setTricornParams: (params: TricornParams) => void;

  // Multibrot
  multibrotParams: MultibrotParams;
  setMultibrotParams: (params: MultibrotParams) => void;

  // Newton
  newtonParams: NewtonParams;
  setNewtonParams: (params: NewtonParams) => void;

  // Phoenix
  phoenixParams: PhoenixParams;
  setPhoenixParams: (params: PhoenixParams) => void;

  // Lyapunov
  lyapunovParams: LyapunovParams;
  setLyapunovParams: (params: LyapunovParams) => void;

  // Gumowski-Mira
  gumowskiMiraParams: GumowskiMiraParams;
  setGumowskiMiraParams: (params: GumowskiMiraParams) => void;
  gumowskiMiraPreset: number;
  setGumowskiMiraPreset: (preset: number) => void;

  // Sprott
  sprottParams: SprottParams;
  setSprottParams: (params: SprottParams) => void;
  sprottPreset: number;
  setSprottPreset: (preset: number) => void;

  // Symmetric Fractal
  symmetricFractalParams: SymmetricFractalParams;
  setSymmetricFractalParams: (params: SymmetricFractalParams) => void;
  symmetricFractalPreset: number;
  setSymmetricFractalPreset: (preset: number) => void;

  // De Rham
  deRhamParams: DeRhamParams;
  setDeRhamParams: (params: DeRhamParams) => void;
  deRhamPreset: number;
  setDeRhamPreset: (preset: number) => void;

  // Conradi
  conradiParams: ConradiParams;
  setConradiParams: (params: ConradiParams) => void;
  conradiPreset: number;
  setConradiPreset: (preset: number) => void;

  // Mobius
  mobiusParams: MobiusParams;
  setMobiusParams: (params: MobiusParams) => void;
  mobiusPreset: number;
  setMobiusPreset: (preset: number) => void;

  // Jason Rampe 1
  jasonRampe1Params: JasonRampe1Params;
  setJasonRampe1Params: (params: JasonRampe1Params) => void;
  jasonRampe1Preset: number;
  setJasonRampe1Preset: (preset: number) => void;

  // Jason Rampe 2
  jasonRampe2Params: JasonRampe2Params;
  setJasonRampe2Params: (params: JasonRampe2Params) => void;
  jasonRampe2Preset: number;
  setJasonRampe2Preset: (preset: number) => void;

  // Jason Rampe 3
  jasonRampe3Params: JasonRampe3Params;
  setJasonRampe3Params: (params: JasonRampe3Params) => void;
  jasonRampe3Preset: number;
  setJasonRampe3Preset: (preset: number) => void;

  // Helpers
  isFractalType: boolean;
  isIFSType: boolean;
  getCurrentParams: () => AllParams;
}

export function useAttractorState(): AttractorState {
  // Current type
  const [attractorType, setAttractorType] = useState<AttractorType>("symmetric_icon");

  // Get initial icon params from preset
  const initialIcon = symmetricIconData[CONFIG.INITIAL_ICON_INDEX];
  const initialIconParams: SymmetricIconParams = {
    alpha: initialIcon.alpha,
    betha: initialIcon.betha,
    gamma: initialIcon.gamma,
    delta: initialIcon.delta,
    omega: initialIcon.omega,
    lambda: initialIcon.lambda,
    degree: initialIcon.degree,
    npdegree: initialIcon.npdegree,
    scale: initialIcon.scale,
  };

  // All attractor states
  const [iconParams, setIconParams] = useState<SymmetricIconParams>(initialIconParams);
  const [iconPreset, setIconPreset] = useState(CONFIG.INITIAL_ICON_INDEX);

  const [symmetricQuiltParams, setSymmetricQuiltParams] = useState<SymmetricQuiltParams>(DEFAULT_SYMMETRIC_QUILT);
  const [symmetricQuiltPreset, setSymmetricQuiltPreset] = useState(0);

  const [cliffordParams, setCliffordParams] = useState<CliffordParams>(DEFAULT_CLIFFORD);
  const [cliffordPreset, setCliffordPreset] = useState(0);

  const [deJongParams, setDeJongParams] = useState<DeJongParams>(DEFAULT_DEJONG);
  const [deJongPreset, setDeJongPreset] = useState(0);

  const [tinkerbellParams, setTinkerbellParams] = useState<TinkerbellParams>(DEFAULT_TINKERBELL);
  const [tinkerbellPreset, setTinkerbellPreset] = useState(0);

  const [henonParams, setHenonParams] = useState<HenonParams>(DEFAULT_HENON);
  const [henonPreset, setHenonPreset] = useState(0);

  const [bedheadParams, setBedheadParams] = useState<BedheadParams>(DEFAULT_BEDHEAD);
  const [bedheadPreset, setBedheadPreset] = useState(0);

  const [svenssonParams, setSvenssonParams] = useState<SvenssonParams>(DEFAULT_SVENSSON);
  const [svenssonPreset, setSvenssonPreset] = useState(0);

  const [fractalDreamParams, setFractalDreamParams] = useState<FractalDreamParams>(DEFAULT_FRACTAL_DREAM);
  const [fractalDreamPreset, setFractalDreamPreset] = useState(0);

  const [hopalongParams, setHopalongParams] = useState<HopalongParams>(DEFAULT_HOPALONG);
  const [hopalongPreset, setHopalongPreset] = useState(0);

  const [mandelbrotParams, setMandelbrotParams] = useState<MandelbrotParams>(DEFAULT_MANDELBROT);
  const [mandelbrotPreset, setMandelbrotPreset] = useState(0);

  const [juliaParams, setJuliaParams] = useState<JuliaParams>(DEFAULT_JULIA);
  const [juliaPreset, setJuliaPreset] = useState(0);

  const [burningShipParams, setBurningShipParams] = useState<BurningShipParams>(DEFAULT_BURNING_SHIP);
  const [tricornParams, setTricornParams] = useState<TricornParams>(DEFAULT_TRICORN);
  const [multibrotParams, setMultibrotParams] = useState<MultibrotParams>(DEFAULT_MULTIBROT);
  const [newtonParams, setNewtonParams] = useState<NewtonParams>(DEFAULT_NEWTON);
  const [phoenixParams, setPhoenixParams] = useState<PhoenixParams>(DEFAULT_PHOENIX);
  const [lyapunovParams, setLyapunovParams] = useState<LyapunovParams>(DEFAULT_LYAPUNOV);

  const [gumowskiMiraParams, setGumowskiMiraParams] = useState<GumowskiMiraParams>(DEFAULT_GUMOWSKI_MIRA);
  const [gumowskiMiraPreset, setGumowskiMiraPreset] = useState(0);

  const [sprottParams, setSprottParams] = useState<SprottParams>(DEFAULT_SPROTT);
  const [sprottPreset, setSprottPreset] = useState(0);

  const [symmetricFractalParams, setSymmetricFractalParams] = useState<SymmetricFractalParams>(DEFAULT_SYMMETRIC_FRACTAL);
  const [symmetricFractalPreset, setSymmetricFractalPreset] = useState(0);

  const [deRhamParams, setDeRhamParams] = useState<DeRhamParams>(DEFAULT_DERHAM);
  const [deRhamPreset, setDeRhamPreset] = useState(0);

  const [conradiParams, setConradiParams] = useState<ConradiParams>(DEFAULT_CONRADI);
  const [conradiPreset, setConradiPreset] = useState(0);

  const [mobiusParams, setMobiusParams] = useState<MobiusParams>(DEFAULT_MOBIUS);
  const [mobiusPreset, setMobiusPreset] = useState(0);

  const [jasonRampe1Params, setJasonRampe1Params] = useState<JasonRampe1Params>(DEFAULT_JASON_RAMPE1);
  const [jasonRampe1Preset, setJasonRampe1Preset] = useState(0);

  const [jasonRampe2Params, setJasonRampe2Params] = useState<JasonRampe2Params>(DEFAULT_JASON_RAMPE2);
  const [jasonRampe2Preset, setJasonRampe2Preset] = useState(0);

  const [jasonRampe3Params, setJasonRampe3Params] = useState<JasonRampe3Params>(DEFAULT_JASON_RAMPE3);
  const [jasonRampe3Preset, setJasonRampe3Preset] = useState(0);

  // Computed properties
  const isFractalType = [
    "mandelbrot", "julia", "burningship", "tricorn",
    "multibrot", "newton", "phoenix", "lyapunov"
  ].includes(attractorType);

  const isIFSType = [
    "symmetric_fractal", "derham", "conradi", "mobius"
  ].includes(attractorType);

  const getCurrentParams = useCallback((): AllParams => {
    switch (attractorType) {
      case "symmetric_icon": return iconParams;
      case "symmetric_quilt": return symmetricQuiltParams;
      case "clifford": return cliffordParams;
      case "dejong": return deJongParams;
      case "tinkerbell": return tinkerbellParams;
      case "henon": return henonParams;
      case "bedhead": return bedheadParams;
      case "svensson": return svenssonParams;
      case "fractal_dream": return fractalDreamParams;
      case "hopalong": return hopalongParams;
      case "gumowski_mira": return gumowskiMiraParams;
      case "sprott": return sprottParams;
      case "symmetric_fractal": return symmetricFractalParams;
      case "derham": return deRhamParams;
      case "conradi": return conradiParams;
      case "mobius": return mobiusParams;
      case "jason_rampe1": return jasonRampe1Params;
      case "jason_rampe2": return jasonRampe2Params;
      case "jason_rampe3": return jasonRampe3Params;
      case "mandelbrot": return mandelbrotParams;
      case "julia": return juliaParams;
      case "burningship": return burningShipParams;
      case "tricorn": return tricornParams;
      case "multibrot": return multibrotParams;
      case "newton": return newtonParams;
      case "phoenix": return phoenixParams;
      case "lyapunov": return lyapunovParams;
      default: return iconParams;
    }
  }, [
    attractorType, iconParams, symmetricQuiltParams, cliffordParams, deJongParams,
    tinkerbellParams, henonParams, bedheadParams, svenssonParams, fractalDreamParams,
    hopalongParams, gumowskiMiraParams, sprottParams, symmetricFractalParams, deRhamParams,
    conradiParams, mobiusParams, jasonRampe1Params, jasonRampe2Params, jasonRampe3Params, mandelbrotParams, juliaParams, burningShipParams, tricornParams,
    multibrotParams, newtonParams, phoenixParams, lyapunovParams
  ]);

  return {
    attractorType,
    setAttractorType,
    iconParams,
    setIconParams,
    iconPreset,
    setIconPreset,
    symmetricQuiltParams,
    setSymmetricQuiltParams,
    symmetricQuiltPreset,
    setSymmetricQuiltPreset,
    cliffordParams,
    setCliffordParams,
    cliffordPreset,
    setCliffordPreset,
    deJongParams,
    setDeJongParams,
    deJongPreset,
    setDeJongPreset,
    tinkerbellParams,
    setTinkerbellParams,
    tinkerbellPreset,
    setTinkerbellPreset,
    henonParams,
    setHenonParams,
    henonPreset,
    setHenonPreset,
    bedheadParams,
    setBedheadParams,
    bedheadPreset,
    setBedheadPreset,
    svenssonParams,
    setSvenssonParams,
    svenssonPreset,
    setSvenssonPreset,
    fractalDreamParams,
    setFractalDreamParams,
    fractalDreamPreset,
    setFractalDreamPreset,
    hopalongParams,
    setHopalongParams,
    hopalongPreset,
    setHopalongPreset,
    mandelbrotParams,
    setMandelbrotParams,
    mandelbrotPreset,
    setMandelbrotPreset,
    juliaParams,
    setJuliaParams,
    juliaPreset,
    setJuliaPreset,
    burningShipParams,
    setBurningShipParams,
    tricornParams,
    setTricornParams,
    multibrotParams,
    setMultibrotParams,
    newtonParams,
    setNewtonParams,
    phoenixParams,
    setPhoenixParams,
    lyapunovParams,
    setLyapunovParams,
    gumowskiMiraParams,
    setGumowskiMiraParams,
    gumowskiMiraPreset,
    setGumowskiMiraPreset,
    sprottParams,
    setSprottParams,
    sprottPreset,
    setSprottPreset,
    symmetricFractalParams,
    setSymmetricFractalParams,
    symmetricFractalPreset,
    setSymmetricFractalPreset,
    deRhamParams,
    setDeRhamParams,
    deRhamPreset,
    setDeRhamPreset,
    conradiParams,
    setConradiParams,
    conradiPreset,
    setConradiPreset,
    mobiusParams,
    setMobiusParams,
    mobiusPreset,
    setMobiusPreset,
    jasonRampe1Params,
    setJasonRampe1Params,
    jasonRampe1Preset,
    setJasonRampe1Preset,
    jasonRampe2Params,
    setJasonRampe2Params,
    jasonRampe2Preset,
    setJasonRampe2Preset,
    jasonRampe3Params,
    setJasonRampe3Params,
    jasonRampe3Preset,
    setJasonRampe3Preset,
    isFractalType,
    isIFSType,
    getCurrentParams,
  };
}

export default useAttractorState;
