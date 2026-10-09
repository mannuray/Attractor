import React, { useCallback, useRef } from "react";
import { distance, midpoint, Pt } from "../lib/gestureMath";
import { DragPoint } from "./useFractalZoom";

interface Options {
  /** Fractals: a one-pointer drag draws a zoom box. */
  selectEnabled: boolean;
  /** True while the pan modifier (Space) is held: drags pan even on fractals. */
  panHeld: () => boolean;
  toCanvasPoint: (clientX: number, clientY: number, clamp: boolean) => DragPoint | null;
  onSelectStart: (pt: DragPoint) => void;
  onSelectMove: (pt: DragPoint) => void;
  onSelectEnd: () => void;
  /** Called instead of onSelectEnd when a pinch interrupts a selection. */
  onSelectCancel?: () => void;
  /** Screen-pixel pan. */
  onPan: (dx: number, dy: number) => void;
  /** Zoom by `factor` keeping the client point still. */
  onZoomAt: (factor: number, clientX: number, clientY: number) => void;
  /** A pan or pinch finished. */
  onGestureEnd: () => void;
}

type Mode = "idle" | "select" | "pan" | "pinch" | "done";

export function useCanvasGestures(o: Options) {
  const pointers = useRef(new Map<number, Pt>());
  const mode = useRef<Mode>("idle");
  const pinch = useRef<{ lastDist: number; lastMid: Pt } | null>(null);
  const moved = useRef(false);   // a pan/pinch happened, so its end must be reported
  const opts = useRef(o);
  opts.current = o;

  const pts = () => Array.from(pointers.current.values());

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const { selectEnabled, panHeld, toCanvasPoint, onSelectStart, onSelectEnd, onSelectCancel } = opts.current;
    if (pointers.current.size >= 2) return; // ignore 3rd+ finger
    if (e.pointerType === "mouse" && e.button !== 0) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    try { (e.currentTarget as any).setPointerCapture?.(e.pointerId); } catch {}

    if (pointers.current.size === 2) {
      if (mode.current === "select") (onSelectCancel ?? onSelectEnd)();
      const [a, b] = pts();
      pinch.current = { lastDist: distance(a, b), lastMid: midpoint(a, b) };
      mode.current = "pinch";
      return;
    }
    if (selectEnabled && !panHeld()) {
      const pt = toCanvasPoint(e.clientX, e.clientY, false);
      if (pt) { mode.current = "select"; onSelectStart(pt); }
    } else {
      mode.current = "pan";
    }
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    const prev = pointers.current.get(e.pointerId)!;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const { toCanvasPoint, onSelectMove, onPan, onZoomAt } = opts.current;

    if (mode.current === "select") {
      const pt = toCanvasPoint(e.clientX, e.clientY, true);
      if (pt) onSelectMove(pt);
    } else if (mode.current === "pan") {
      moved.current = true;
      onPan(e.clientX - prev.x, e.clientY - prev.y);
    } else if (mode.current === "pinch" && pinch.current && pointers.current.size === 2) {
      const [a, b] = pts();
      const dist = distance(a, b);
      const mid = midpoint(a, b);
      // Fingers that land on (almost) the same point give no usable baseline; take the first
      // real spread as the baseline instead.
      if (pinch.current.lastDist >= 10 && dist >= 10) {
        moved.current = true;
        onZoomAt(dist / pinch.current.lastDist, mid.x, mid.y);
        onPan(mid.x - pinch.current.lastMid.x, mid.y - pinch.current.lastMid.y);
      }
      pinch.current = { lastDist: dist, lastMid: mid };
    }
  }, []);

  const release = useCallback((e: React.PointerEvent) => {
    if (!pointers.current.delete(e.pointerId)) return;
    if (mode.current === "select") opts.current.onSelectEnd();
    const wasGesture = mode.current === "pan" || mode.current === "pinch";
    if (mode.current === "pinch") pinch.current = null;
    if (wasGesture && moved.current) { moved.current = false; opts.current.onGestureEnd(); }
    if (pointers.current.size === 0) mode.current = "idle";
    else mode.current = "done";
  }, []);

  return { onPointerDown, onPointerMove, onPointerUp: release, onPointerCancel: release };
}
