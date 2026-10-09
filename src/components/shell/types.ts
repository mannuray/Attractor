import React from "react";
import { AttractorType } from "../../attractors/shared/types";
import { Color } from "../../model-controller/Attractor/palette";
import { BgColor, BgMode } from "../../lib/bgMode";
import { FxState } from "../panels/FxPanel";
import { CanvasToolbarProps } from "./CanvasToolbar";

export interface ShellProps extends Omit<CanvasToolbarProps, "variant"> {
  canvas: React.ReactNode;
  attractorType: AttractorType;
  systemLabel: string;
  onAttractorTypeChange: (t: AttractorType) => void;
  controls: React.ReactNode;
  fx: FxState;
  onFxChange: (patch: Partial<FxState>) => void;
  canvasSize: number; onCanvasSizeChange: (n: number) => void;
  oversampling: number; onOversamplingChange: (n: number) => void;
  paletteData: Color[]; bgColor: BgColor; onBgModeChange: (m: BgMode) => void; onOpenPalette: () => void;
  onOpenExport: () => void;
  rendering: boolean;
  /** 0..1 while a fractal is being refined, null otherwise. */
  renderProgress?: number | null;
  statsRef: React.MutableRefObject<{ maxHits: number; totalIterations: number }>;
  maxIter?: number;
  /** Restore the parameters from before the last Reset. */
  onUndoReset?: () => void;
  /** Open the system picker (desktop: the top-bar popover). */
  onChangeSystem?: () => void;
}
