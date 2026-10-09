import { useState, useCallback } from "react";
import { LyapunovParams } from "../attractors/lyapunov/types";

export interface DragPoint {
  x: number;
  y: number;
}

export interface FractalParams {
  centerX: number;
  centerY: number;
  zoom: number;
}

interface UseFractalZoomReturn {
  dragStart: DragPoint | null;
  dragEnd: DragPoint | null;
  isDragging: boolean;
  beginDrag: (pt: DragPoint) => void;
  moveDrag: (pt: DragPoint) => void;
  endDrag: () => void;
  calculateNewParams: <T extends FractalParams>(
    currentParams: T,
    canvasSize: number
  ) => T | null;
  calculateNewLyapunovParams: (
    currentParams: LyapunovParams,
    canvasSize: number
  ) => LyapunovParams | null;
  clearDrag: () => void;
}

// Pure function: calculate new fractal params from drag selection
export function calculateNewFractalParams<T extends FractalParams>(
  dragStart: DragPoint,
  dragEnd: DragPoint,
  currentParams: T,
  canvasSize: number
): T | null {
  // Ignore tiny drags
  const dragWidth = Math.abs(dragEnd.x - dragStart.x);
  const dragHeight = Math.abs(dragEnd.y - dragStart.y);
  if (dragWidth < 10 && dragHeight < 10) return null;

  // Convert pixel coords to fractal coords
  const range = 3.0 / currentParams.zoom;
  const xMin = currentParams.centerX - range / 2;
  const yMin = currentParams.centerY - range / 2;
  const pixelSize = range / canvasSize;

  const topLeftX = xMin + Math.min(dragStart.x, dragEnd.x) * pixelSize;
  const topLeftY = yMin + Math.min(dragStart.y, dragEnd.y) * pixelSize;
  const bottomRightX = xMin + Math.max(dragStart.x, dragEnd.x) * pixelSize;
  const bottomRightY = yMin + Math.max(dragStart.y, dragEnd.y) * pixelSize;

  const newCenterX = (topLeftX + bottomRightX) / 2;
  const newCenterY = (topLeftY + bottomRightY) / 2;
  const newRange = Math.max(bottomRightX - topLeftX, bottomRightY - topLeftY);
  const newZoom = 3.0 / newRange;

  return {
    ...currentParams,
    centerX: newCenterX,
    centerY: newCenterY,
    zoom: newZoom,
  };
}

// Pure function: calculate new Lyapunov params from drag selection
export function calculateNewLyapunovZoomParams(
  dragStart: DragPoint,
  dragEnd: DragPoint,
  currentParams: LyapunovParams,
  canvasSize: number
): LyapunovParams | null {
  const dragWidth = Math.abs(dragEnd.x - dragStart.x);
  const dragHeight = Math.abs(dragEnd.y - dragStart.y);
  if (dragWidth < 10 && dragHeight < 10) return null;

  const minX = Math.min(dragStart.x, dragEnd.x);
  const maxX = Math.max(dragStart.x, dragEnd.x);
  const minY = Math.min(dragStart.y, dragEnd.y);
  const maxY = Math.max(dragStart.y, dragEnd.y);

  const aRange = currentParams.aMax - currentParams.aMin;
  const bRange = currentParams.bMax - currentParams.bMin;

  return {
    ...currentParams,
    aMin: currentParams.aMin + (minX / canvasSize) * aRange,
    aMax: currentParams.aMin + (maxX / canvasSize) * aRange,
    bMin: currentParams.bMin + (minY / canvasSize) * bRange,
    bMax: currentParams.bMin + (maxY / canvasSize) * bRange,
  };
}

export function useFractalZoom(): UseFractalZoomReturn {
  const [dragStart, setDragStart] = useState<DragPoint | null>(null);
  const [dragEnd, setDragEnd] = useState<DragPoint | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const beginDrag = useCallback((pt: DragPoint) => {
    setDragStart(pt);
    setDragEnd(pt);
    setIsDragging(true);
  }, []);

  const moveDrag = useCallback((pt: DragPoint) => {
    if (!isDragging || !dragStart) return;
    setDragEnd(pt);
  }, [isDragging, dragStart]);

  const endDrag = useCallback(() => {
    setIsDragging(false);
  }, []);

  const clearDrag = useCallback(() => {
    setDragStart(null);
    setDragEnd(null);
    setIsDragging(false);
  }, []);

  const calculateNewParams = useCallback(<T extends FractalParams>(
    currentParams: T,
    canvasSize: number
  ): T | null => {
    if (!dragStart || !dragEnd) return null;
    return calculateNewFractalParams(dragStart, dragEnd, currentParams, canvasSize);
  }, [dragStart, dragEnd]);

  const calculateNewLyapunovParams = useCallback((
    currentParams: LyapunovParams,
    canvasSize: number
  ): LyapunovParams | null => {
    if (!dragStart || !dragEnd) return null;
    return calculateNewLyapunovZoomParams(dragStart, dragEnd, currentParams, canvasSize);
  }, [dragStart, dragEnd]);

  return {
    dragStart,
    dragEnd,
    isDragging,
    beginDrag,
    moveDrag,
    endDrag,
    calculateNewParams,
    calculateNewLyapunovParams,
    clearDrag,
  };
}

export default useFractalZoom;
