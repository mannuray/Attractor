import { useReducer, useCallback, useMemo } from "react";
import { AttractorType, CONFIG } from "../attractors/shared/types";
import { registry } from "../attractors/registry";

// Reducer state & actions
interface AttractorReducerState {
  attractorType: AttractorType;
  params: Record<AttractorType, any>;
  presets: Record<AttractorType, number>;
}

type AttractorAction =
  | { type: "SET_TYPE"; attractorType: AttractorType }
  | { type: "SET_PARAMS"; attractorType: AttractorType; params: any }
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
    isFractalType: currentModule?.category === "Fractals",
    isIFSType: currentModule?.category === "IFS",
    getCurrentParams,
    getParamsForType,
  };
}

export default useAttractorState;
