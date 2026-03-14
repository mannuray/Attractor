import React from "react";
import { AttractorType } from "./shared/types";

export type AttractorCategory = "Attractors" | "IFS" | "Fractals";

export interface AttractorModule<P = any> {
  id: AttractorType;
  label: string;
  category: AttractorCategory;
  
  // The Model
  defaultParams: P;
  
  // The View
  Controls: React.FC<{
    params: P;
    onChange: (params: P) => void;
    disabled?: boolean;
    selectedPreset?: number;
    onPresetChange?: (index: number) => void;
  }>;
  
  // The Controller (Worker logic)
  workerIteratorName?: string; // Legacy
  
  // New: Serialized math function
  // (p: Float64Array, params: any) => void
  math?: string; 
}

class AttractorRegistry {
  private modules: Map<AttractorType, AttractorModule> = new Map();

  register(module: AttractorModule) {
    this.modules.set(module.id, module);
  }

  get(id: AttractorType): AttractorModule | undefined {
    return this.modules.get(id);
  }

  getAll(): AttractorModule[] {
    return Array.from(this.modules.values());
  }

  getByCategory(category: AttractorCategory): AttractorModule[] {
    return this.getAll().filter(m => m.category === category);
  }
}

export const registry = new AttractorRegistry();
