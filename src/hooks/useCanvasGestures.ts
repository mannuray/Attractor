import React, { useCallback, useRef } from "react";
import { distance, midpoint, pinchZoom, Pt } from "../lib/gestureMath";
import { DragPoint } from "./useFractalZoom";

interface Options {
  zoom: number;
  onZoomChange: (z: number) => void;
  scrollRef: React.RefObject<HTMLElement>;
  selectEnabled: boolean;
  toCanvasPoint: (clientX: number, clientY: number) => DragPoint | null;
  onSelectStart: (pt: DragPoint) => void;
  onSelectMove: (pt: DragPoint) => void;
  onSelectEnd: () => void;
  /** Called instead of onSelectEnd when a pinch interrupts a selection. */
  onSelectCancel?: () => void;
}

type Mode = "idle" | "select" | "pan" | "pinch" | "done";

export function useCanvasGestures(o: Options) {
  const pointers = useRef(new Map<number, Pt>());
  const mode = useRef<Mode>("idle");
  const pinch = useRef<{ startDist: number; startZoom: number; lastMid: Pt } | null>(null);
  const opts = useRef(o);
  opts.current = o;

  const pts = () => Array.from(pointers.current.values());

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const { selectEnabled, toCanvasPoint, onSelectStart, onSelectEnd, onSelectCancel, zoom } = opts.current;
    if (pointers.current.size >= 2) return; // ignore 3rd+ finger
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    try { (e.currentTarget as any).setPointerCapture?.(e.pointerId); } catch {}

    if (pointers.current.size === 2) {
      if (mode.current === "select") (onSelectCancel ?? onSelectEnd)();
      const [a, b] = pts();
      pinch.current = { startDist: distance(a, b), startZoom: zoom, lastMid: midpoint(a, b) };
      mode.current = "pinch";
      return;
    }
    if (selectEnabled) {
      const pt = toCanvasPoint(e.clientX, e.clientY);
      if (pt) { mode.current = "select"; onSelectStart(pt); }
    } else if (e.pointerType !== "mouse") {
      mode.current = "pan";
    }
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    const prev = pointers.current.get(e.pointerId)!;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const { toCanvasPoint, onSelectMove, onZoomChange, scrollRef } = opts.current;

    if (mode.current === "select") {
      const pt = toCanvasPoint(e.clientX, e.clientY);
      if (pt) onSelectMove(pt);
    } else if (mode.current === "pan") {
      scrollRef.current?.scrollBy(prev.x - e.clientX, prev.y - e.clientY);
    } else if (mode.current === "pinch" && pinch.current && pointers.current.size === 2) {
      const [a, b] = pts();
      onZoomChange(pinchZoom(pinch.current.startZoom, pinch.current.startDist, distance(a, b)));
      const mid = midpoint(a, b);
      scrollRef.current?.scrollBy(pinch.current.lastMid.x - mid.x, pinch.current.lastMid.y - mid.y);
      pinch.current.lastMid = mid;
    }
  }, []);

  const release = useCallback((e: React.PointerEvent) => {
    if (!pointers.current.delete(e.pointerId)) return;
    if (mode.current === "select") opts.current.onSelectEnd();
    if (mode.current === "pinch") { pinch.current = null; mode.current = "done"; }
    if (pointers.current.size === 0) mode.current = "idle";
    else if (mode.current !== "done") mode.current = "done";
  }, []);

  return { onPointerDown, onPointerMove, onPointerUp: release, onPointerCancel: release };
}
