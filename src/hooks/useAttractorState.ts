import { useReducer, useCallback } from "react";
import { AttractorType, CONFIG } from "../attractors/shared/types";
import { SymmetricIconParams, DEFAULT_SYMMETRIC_ICON } from "../attractors/symmetricIcon";
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

// Typed per-key params map
export interface ParamsMap {
  symmetric_icon: SymmetricIconParams;
  symmetric_quilt: SymmetricQuiltParams;
  clifford: CliffordParams;
  dejong: DeJongParams;
  tinkerbell: TinkerbellParams;
  henon: HenonParams;
  bedhead: BedheadParams;
  svensson: SvenssonParams;
  fractal_dream: FractalDreamParams;
  hopalong: HopalongParams;
  gumowski_mira: GumowskiMiraParams;
  sprott: SprottParams;
  symmetric_fractal: SymmetricFractalParams;
  derham: DeRhamParams;
  conradi: ConradiParams;
  mobius: MobiusParams;
  jason_rampe1: JasonRampe1Params;
  jason_rampe2: JasonRampe2Params;
  jason_rampe3: JasonRampe3Params;
  mandelbrot: MandelbrotParams;
  julia: JuliaParams;
  burningship: BurningShipParams;
  tricorn: TricornParams;
  multibrot: MultibrotParams;
  newton: NewtonParams;
  phoenix: PhoenixParams;
  lyapunov: LyapunovParams;
}

export const DEFAULT_PARAMS: ParamsMap = {
  symmetric_icon: DEFAULT_SYMMETRIC_ICON,
  symmetric_quilt: DEFAULT_SYMMETRIC_QUILT,
  clifford: DEFAULT_CLIFFORD,
  dejong: DEFAULT_DEJONG,
  tinkerbell: DEFAULT_TINKERBELL,
  henon: DEFAULT_HENON,
  bedhead: DEFAULT_BEDHEAD,
  svensson: DEFAULT_SVENSSON,
  fractal_dream: DEFAULT_FRACTAL_DREAM,
  hopalong: DEFAULT_HOPALONG,
  gumowski_mira: DEFAULT_GUMOWSKI_MIRA,
  sprott: DEFAULT_SPROTT,
  symmetric_fractal: DEFAULT_SYMMETRIC_FRACTAL,
  derham: DEFAULT_DERHAM,
  conradi: DEFAULT_CONRADI,
  mobius: DEFAULT_MOBIUS,
  jason_rampe1: DEFAULT_JASON_RAMPE1,
  jason_rampe2: DEFAULT_JASON_RAMPE2,
  jason_rampe3: DEFAULT_JASON_RAMPE3,
  mandelbrot: DEFAULT_MANDELBROT,
  julia: DEFAULT_JULIA,
  burningship: DEFAULT_BURNING_SHIP,
  tricorn: DEFAULT_TRICORN,
  multibrot: DEFAULT_MULTIBROT,
  newton: DEFAULT_NEWTON,
  phoenix: DEFAULT_PHOENIX,
  lyapunov: DEFAULT_LYAPUNOV,
};

const DEFAULT_PRESETS: Record<AttractorType, number> = {
  symmetric_icon: CONFIG.INITIAL_ICON_INDEX,
  symmetric_quilt: 0,
  clifford: 0,
  dejong: 0,
  tinkerbell: 0,
  henon: 0,
  bedhead: 0,
  svensson: 0,
  fractal_dream: 0,
  hopalong: 0,
  gumowski_mira: 0,
  sprott: 0,
  symmetric_fractal: 0,
  derham: 0,
  conradi: 0,
  mobius: 0,
  jason_rampe1: 0,
  jason_rampe2: 0,
  jason_rampe3: 0,
  mandelbrot: 0,
  julia: 0,
  burningship: 0,
  tricorn: 0,
  multibrot: 0,
  newton: 0,
  phoenix: 0,
  lyapunov: 0,
};

// Reducer state & actions
interface AttractorReducerState {
  attractorType: AttractorType;
  params: ParamsMap;
  presets: Record<AttractorType, number>;
}

type AttractorAction =
  | { type: "SET_TYPE"; attractorType: AttractorType }
  | { type: "SET_PARAMS"; attractorType: AttractorType; params: AllParams }
  | { type: "SET_PRESET"; attractorType: AttractorType; preset: number };

function attractorReducer(state: AttractorReducerState, action: AttractorAction): AttractorReducerState {
  switch (action.type) {
    case "SET_TYPE":
      return { ...state, attractorType: action.attractorType };
    case "SET_PARAMS":
      return { ...state, params: { ...state.params, [action.attractorType]: action.params } };
    case "SET_PRESET":
      return { ...state, presets: { ...state.presets, [action.attractorType]: action.preset } };
  }
}

const FRACTAL_TYPES: ReadonlySet<AttractorType> = new Set([
  "mandelbrot", "julia", "burningship", "tricorn",
  "multibrot", "newton", "phoenix", "lyapunov",
]);

const IFS_TYPES: ReadonlySet<AttractorType> = new Set([
  "symmetric_fractal", "derham", "conradi", "mobius",
]);

export interface AttractorState {
  attractorType: AttractorType;
  setAttractorType: (type: AttractorType) => void;
  params: ParamsMap;
  setParams: <K extends AttractorType>(type: K, params: ParamsMap[K]) => void;
  presets: Record<AttractorType, number>;
  setPreset: (type: AttractorType, preset: number) => void;
  isFractalType: boolean;
  isIFSType: boolean;
  getCurrentParams: () => AllParams;
  getParamsForType: (type: AttractorType) => AllParams;
}

export function useAttractorState(initial?: {
  attractorType?: AttractorType;
  params?: Partial<ParamsMap>;
}): AttractorState {
  const [state, dispatch] = useReducer(attractorReducer, {
    attractorType: initial?.attractorType ?? ("symmetric_icon" as AttractorType),
    params: initial?.params
      ? { ...DEFAULT_PARAMS, ...initial.params }
      : DEFAULT_PARAMS,
    presets: { ...DEFAULT_PRESETS },
  });

  const setAttractorType = useCallback((type: AttractorType) => {
    dispatch({ type: "SET_TYPE", attractorType: type });
  }, []);

  const setParams = useCallback(<K extends AttractorType>(type: K, params: ParamsMap[K]) => {
    dispatch({ type: "SET_PARAMS", attractorType: type, params });
  }, []);

  const setPreset = useCallback((type: AttractorType, preset: number) => {
    dispatch({ type: "SET_PRESET", attractorType: type, preset });
  }, []);

  const getCurrentParams = useCallback((): AllParams => {
    return state.params[state.attractorType];
  }, [state.params, state.attractorType]);

  const getParamsForType = useCallback((type: AttractorType): AllParams => {
    return state.params[type];
  }, [state.params]);

  return {
    attractorType: state.attractorType,
    setAttractorType,
    params: state.params,
    setParams,
    presets: state.presets,
    setPreset,
    isFractalType: FRACTAL_TYPES.has(state.attractorType),
    isIFSType: IFS_TYPES.has(state.attractorType),
    getCurrentParams,
    getParamsForType,
  };
}

export default useAttractorState;
