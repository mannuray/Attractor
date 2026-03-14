import { useReducer, useCallback, useMemo } from "react";
import { AttractorType, CONFIG } from "../attractors/shared/types";
import { registry } from "../attractors/registry";

// Reducer state & actions
interface AttractorReducerState {
  attractorType: AttractorType;
  params: Record<AttractorType, any>;
  presets: Record<AttractorType, number>;
  fx: {
    enabled: boolean;
    bloom: number;
    grain: number;
    vignette: number;
    exposure: number;
  };
}

type AttractorAction =
  | { type: "SET_TYPE"; attractorType: AttractorType }
  | { type: "SET_PARAMS"; attractorType: AttractorType; params: any }
  | { type: "SET_PRESET"; attractorType: AttractorType; preset: number }
  | { type: "SET_FX"; fx: Partial<AttractorReducerState["fx"]> };

function attractorReducer(state: AttractorReducerState, action: AttractorAction): AttractorReducerState {
  switch (action.type) {
    case "SET_TYPE":
      return { ...state, attractorType: action.attractorType };
    case "SET_PARAMS":
      return { ...state, params: { ...state.params, [action.attractorType]: action.params } };
    case "SET_PRESET":
      return { ...state, presets: { ...state.presets, [action.attractorType]: action.preset } };
    case "SET_FX":
      return { ...state, fx: { ...state.fx, ...action.fx } };
  }
}

// Helper to build initial state from registry
const getInitialParams = () => {
  const params: any = {};
  registry.getAll().forEach(m => {
    params[m.id] = m.defaultParams;
  });
  return params;
};

const getInitialPresets = () => {
  const presets: any = {};
  registry.getAll().forEach(m => {
    presets[m.id] = m.id === "symmetric_icon" ? CONFIG.INITIAL_ICON_INDEX : 0;
  });
  return presets;
};

export interface AttractorState {
  attractorType: AttractorType;
  setAttractorType: (type: AttractorType) => void;
  params: Record<AttractorType, any>;
  setParams: (type: AttractorType, params: any) => void;
  presets: Record<AttractorType, number>;
  setPreset: (type: AttractorType, preset: number) => void;
  shuffleParams: () => void;
  fx: AttractorReducerState["fx"];
  setFx: (fx: Partial<AttractorReducerState["fx"]>) => void;
  isFractalType: boolean;
  isIFSType: boolean;
  getCurrentParams: () => any;
  getParamsForType: (type: AttractorType) => any;
}

export function useAttractorState(initial?: {
  attractorType?: AttractorType;
  params?: Partial<Record<AttractorType, any>>;
}): AttractorState {
  const initialParams = useMemo(() => getInitialParams(), []);
  const initialPresets = useMemo(() => getInitialPresets(), []);

  const [state, dispatch] = useReducer(attractorReducer, {
    attractorType: initial?.attractorType ?? ("symmetric_icon" as AttractorType),
    params: initial?.params
      ? { ...initialParams, ...initial.params }
      : initialParams,
    presets: initialPresets,
    fx: {
      enabled: false,
      bloom: 0.4,
      grain: 0.15,
      vignette: 0.3,
      exposure: 1.0,
    },
  });

  const setAttractorType = useCallback((type: AttractorType) => {
    dispatch({ type: "SET_TYPE", attractorType: type });
  }, []);

  const setParams = useCallback((type: AttractorType, params: any) => {
    dispatch({ type: "SET_PARAMS", attractorType: type, params });
  }, []);

  const setPreset = useCallback((type: AttractorType, preset: number) => {
    dispatch({ type: "SET_PRESET", attractorType: type, preset });
  }, []);

  const setFx = useCallback((fx: Partial<AttractorReducerState["fx"]>) => {
    dispatch({ type: "SET_FX", fx });
  }, []);

  const shuffleParams = useCallback(() => {
    const currentModule = registry.get(state.attractorType);
    if (!currentModule || !currentModule.paramRanges) return;

    const newParams = { ...state.params[state.attractorType] };
    Object.entries(currentModule.paramRanges).forEach(([key, range]) => {
      const randomVal = Math.random() * (range.max - range.min) + range.min;
      newParams[key] = parseFloat(randomVal.toFixed(3));
    });

    dispatch({ type: "SET_PARAMS", attractorType: state.attractorType, params: newParams });
  }, [state.attractorType, state.params]);

  const getCurrentParams = useCallback((): any => {
    return state.params[state.attractorType];
  }, [state.params, state.attractorType]);

  const getParamsForType = useCallback((type: AttractorType): any => {
    return state.params[type];
  }, [state.params]);

  const currentModule = useMemo(() => registry.get(state.attractorType), [state.attractorType]);

  return {
    attractorType: state.attractorType,
    setAttractorType,
    params: state.params,
    setParams,
    presets: state.presets,
    setPreset,
    shuffleParams,
    fx: state.fx,
    setFx,
    isFractalType: currentModule?.category === "Fractals",
    isIFSType: currentModule?.category === "IFS",
    getCurrentParams,
    getParamsForType,
  };
}

export default useAttractorState;
