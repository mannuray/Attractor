import React from "react";
import { ShellProps } from "../components/shell/types";

export function makeShellProps(over: Partial<ShellProps> = {}): ShellProps {
  return {
    canvas: <div data-testid="canvas" />,
    attractorType: "clifford", systemLabel: "Clifford", onAttractorTypeChange: jest.fn(),
    controls: <div data-testid="controls">controls</div>,
    fx: { enabled: false, bloom: 0, grain: 0, vignette: 0, exposure: 1 }, onFxChange: jest.fn(),
    canvasSize: 1200, onCanvasSizeChange: jest.fn(), oversampling: 2, onOversamplingChange: jest.fn(),
    paletteData: [], bgColor: { r: 0, g: 0, b: 0 }, onBgModeChange: jest.fn(), onOpenPalette: jest.fn(),
    onOpenExport: jest.fn(), rendering: false,
    statsRef: { current: { maxHits: 0, totalIterations: 0 } }, maxIter: undefined,
    iterating: false, onToggleIteration: jest.fn(), hunting: false, onHunt: jest.fn(), onCancelHunt: jest.fn(),
    isFractalType: false, zoomLabel: "100%", onFitToView: jest.fn(), onZoomIn: jest.fn(), onZoomOut: jest.fn(),
    onZoomReset: jest.fn(), onResetFractalView: jest.fn(),
    ...over,
  };
}
