import { useRef, useState, useCallback } from "react";
import { HitsData, CONFIG, supportsOffscreenCanvas } from "../attractors/shared/types";

interface UseCanvasWorkerReturn {
  // Refs
  canvasRef: React.RefObject<HTMLCanvasElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  workerRef: React.MutableRefObject<Worker | null>;
  intervalRef: React.MutableRefObject<NodeJS.Timer | null>;
  pendingRenderRef: React.MutableRefObject<HitsData | null>;
  rafIdRef: React.MutableRefObject<number | null>;
  imageDataPoolRef: React.MutableRefObject<{ data: ImageData; size: number } | null>;
  useOffscreenRef: React.MutableRefObject<boolean>;
  canvasTransferredRef: React.MutableRefObject<boolean>;

  // State
  canvasSize: number;
  setCanvasSize: (size: number) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  containerSize: { width: number; height: number };
  setContainerSize: (size: { width: number; height: number }) => void;
  maxHits: number;
  setMaxHits: (hits: number) => void;
  totalIterations: number;
  setTotalIterations: (iterations: number) => void;
  iterating: boolean;
  setIterating: (iterating: boolean) => void;
  canvasKey: number;
  setCanvasKey: (key: number | ((prev: number) => number)) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  oversampling: number;
  setOversampling: (oversampling: number) => void;

  // Cleanup
  cleanup: () => void;
}

export function useCanvasWorker(): UseCanvasWorkerReturn {
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const intervalRef = useRef<NodeJS.Timer | null>(null);
  const pendingRenderRef = useRef<HitsData | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const imageDataPoolRef = useRef<{ data: ImageData; size: number } | null>(null);
  const useOffscreenRef = useRef<boolean>(supportsOffscreenCanvas());
  const canvasTransferredRef = useRef<boolean>(false);

  // State
  const [canvasSize, setCanvasSize] = useState(CONFIG.DEFAULT_CANVAS_SIZE);
  const [zoom, setZoom] = useState(1);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [maxHits, setMaxHits] = useState(0);
  const [totalIterations, setTotalIterations] = useState(0);
  const [iterating, setIterating] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [oversampling, setOversampling] = useState(CONFIG.ALIAS);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  return {
    canvasRef,
    containerRef,
    workerRef,
    intervalRef,
    pendingRenderRef,
    rafIdRef,
    imageDataPoolRef,
    useOffscreenRef,
    canvasTransferredRef,
    canvasSize,
    setCanvasSize,
    zoom,
    setZoom,
    containerSize,
    setContainerSize,
    maxHits,
    setMaxHits,
    totalIterations,
    setTotalIterations,
    iterating,
    setIterating,
    canvasKey,
    setCanvasKey,
    isEditing,
    setIsEditing,
    oversampling,
    setOversampling,
    cleanup,
  };
}

export default useCanvasWorker;
