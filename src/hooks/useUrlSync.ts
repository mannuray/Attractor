import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { AttractorType } from "../attractors/shared/types";
import { ITERATOR_CONFIG } from "./iteratorConfig";
import { DEFAULT_PARAMS, ParamsMap } from "./useAttractorState";

const VALID_TYPES = new Set<string>(Object.keys(ITERATOR_CONFIG));

const BOOLEAN_PARAMS = new Set(["reflect"]);
const STRING_PARAMS = new Set(["curveType", "sequence"]);

export interface UrlInitialState {
  attractorType: AttractorType;
  params: Partial<ParamsMap>;
}

export function useUrlSync() {
  const [searchParams, setSearchParams] = useSearchParams();

  const getInitialState = useCallback((): UrlInitialState | null => {
    const typeParam = searchParams.get("type");
    if (!typeParam || !VALID_TYPES.has(typeParam)) return null;

    const type = typeParam as AttractorType;
    const config = ITERATOR_CONFIG[type];
    const defaults = DEFAULT_PARAMS[type] as Record<string, any>;
    const parsed: Record<string, any> = { ...defaults };

    const allKeys = [...config.paramKeys, ...(config.extraFields || [])];
    if (config.hasScale) allKeys.push("scale");

    for (const key of allKeys) {
      const val = searchParams.get(key);
      if (val === null) continue;

      if (BOOLEAN_PARAMS.has(key)) {
        parsed[key] = val === "true";
      } else if (STRING_PARAMS.has(key)) {
        parsed[key] = val;
      } else {
        const num = parseFloat(val);
        if (!isNaN(num)) parsed[key] = num;
      }
    }

    return {
      attractorType: type,
      params: { [type]: parsed } as Partial<ParamsMap>,
    };
  }, []); // Only read on mount — searchParams captured at call time

  const syncToUrl = useCallback((type: AttractorType, params: Record<string, any>) => {
    const config = ITERATOR_CONFIG[type];
    const allKeys = [...config.paramKeys, ...(config.extraFields || [])];
    if (config.hasScale) allKeys.push("scale");

    const query: Record<string, string> = { type };
    for (const key of allKeys) {
      const val = params[key];
      if (val !== undefined && val !== null) {
        query[key] = String(val);
      }
    }

    setSearchParams(query, { replace: true });
  }, [setSearchParams]);

  return { getInitialState, syncToUrl };
}
