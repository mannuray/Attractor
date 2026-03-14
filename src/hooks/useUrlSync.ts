import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { AttractorType } from "../attractors/shared/types";
import { registry } from "../attractors/registry";

export function useUrlSync() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Helper to check if a type is valid via registry
  const isValidType = useCallback((type: string): type is AttractorType => {
    return registry.get(type as AttractorType) !== undefined;
  }, []);

  const getInitialState = useCallback(() => {
    const type = searchParams.get("type");
    if (!type || !isValidType(type)) return null;

    const module = registry.get(type);
    if (!module) return null;

    const params: Record<string, any> = { ...module.defaultParams };
    
    // Override defaults with URL values
    Object.keys(params).forEach(key => {
      const val = searchParams.get(key);
      if (val !== null) {
        // Parse numbers, keep strings (like curveType)
        const num = parseFloat(val);
        params[key] = isNaN(num) ? val : num;
      }
    });

    return {
      attractorType: type as AttractorType,
      params: { [type]: params }
    };
  }, [searchParams, isValidType]);

  const syncToUrl = useCallback((type: AttractorType, params: Record<string, any>) => {
    const newParams: Record<string, string> = { type };
    
    // Only sync keys that exist in the default params
    Object.keys(params).forEach(key => {
      newParams[key] = String(params[key]);
    });

    setSearchParams(newParams, { replace: true });
  }, [setSearchParams]);

  return { getInitialState, syncToUrl };
}

export default useUrlSync;
