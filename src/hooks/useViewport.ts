// Owns the canvas viewport (pan/zoom). Attractors zoom the picture with a CSS transform.
// Fractals zoom the maths: the transform is only an instant preview, committed as new
// fractal parameters (via onCommit) once the input settles, and dropped when the new
// render's first frame arrives (settle).
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  View, Size, fitView, zoomAt, panBy as pan, clampView, zoomPercent, scaleLimits,
  canvasMapBetween, rebaseView, CanvasMap,
} from "../lib/viewport";

export const ZOOM_STEP = 1.5;
const COMMIT_DELAY_MS = 250;
const SETTLE_TIMEOUT_MS = 2000;

interface Options {
  containerRef: React.RefObject<HTMLElement>;
  canvasSize: number;
  /** The view refits whenever this changes (e.g. the system). */
  refitKey: unknown;
  /** Present for fractals: zoom/pan become new parameters instead of a lasting transform. */
  onCommit?: (map: CanvasMap) => void;
}

const measure = (el: HTMLElement | null): Size => ({ width: el?.clientWidth || 800, height: el?.clientHeight || 600 });
const same = (a: View, b: View) => a.scale === b.scale && a.x === b.x && a.y === b.y;

export function useViewport({ containerRef, canvasSize, refitKey, onCommit }: Options) {
  const mathMode = !!onCommit;
  const vpRef = useRef<Size>(measure(containerRef.current));
  const [base, setBase] = useState<View>(() => fitView(vpRef.current, canvasSize));
  const [preview, setPreview] = useState<View | null>(null);
  const isFit = useRef(true);

  // Fractal commit bookkeeping (refs: read from timers and event handlers).
  const baseRef = useRef(base); baseRef.current = base;
  const previewRef = useRef(preview); previewRef.current = preview;
  const commitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlight = useRef<View | null>(null);   // the preview the pending render will match
  const wantCommit = useRef(false);
  const onCommitRef = useRef(onCommit); onCommitRef.current = onCommit;

  const clearTimers = () => {
    if (commitTimer.current) clearTimeout(commitTimer.current);
    if (settleTimer.current) clearTimeout(settleTimer.current);
    commitTimer.current = settleTimer.current = null;
  };

  const refit = useCallback(() => {
    clearTimers();
    inFlight.current = null; wantCommit.current = false;
    vpRef.current = measure(containerRef.current);
    isFit.current = true;
    setPreview(null);
    setBase(fitView(vpRef.current, canvasSize));
  }, [containerRef, canvasSize]);

  // Refit on a new system / canvas size (layout effect: no frame at the old view).
  useLayoutEffect(() => { refit(); }, [refit, refitKey, mathMode]);

  // Follow viewport resizes: stay fitted if fitted, otherwise keep the image in view.
  useEffect(() => {
    const el = containerRef.current;
    const onResize = () => {
      vpRef.current = measure(containerRef.current);
      if (isFit.current) setBase(fitView(vpRef.current, canvasSize));
      else setBase(b => clampView(b, vpRef.current, canvasSize));
    };
    if (typeof ResizeObserver !== "undefined" && el) {
      const ro = new ResizeObserver(onResize);
      ro.observe(el);
      return () => ro.disconnect();
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [containerRef, canvasSize]);

  useEffect(() => () => clearTimers(), []);

  // --- fractal commits ---
  const settle = useCallback(() => {
    if (!inFlight.current) return;
    if (settleTimer.current) { clearTimeout(settleTimer.current); settleTimer.current = null; }
    const committed = inFlight.current;
    inFlight.current = null;
    const shown = previewRef.current;
    if (shown && !same(shown, committed)) {
      // The user kept going while the render ran: show that input on top of the new render.
      const next = rebaseView(shown, committed, baseRef.current);
      previewRef.current = next;
      setPreview(next);
      if (wantCommit.current) { wantCommit.current = false; commit(); }  // eslint-disable-line @typescript-eslint/no-use-before-define
    } else {
      previewRef.current = null;
      setPreview(null);
    }
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const commit = useCallback(() => {
    if (commitTimer.current) { clearTimeout(commitTimer.current); commitTimer.current = null; }
    const shown = previewRef.current;
    if (!shown) return;
    if (inFlight.current) { wantCommit.current = true; return; }   // one render at a time
    inFlight.current = shown;
    onCommitRef.current?.(canvasMapBetween(baseRef.current, shown));
    settleTimer.current = setTimeout(settle, SETTLE_TIMEOUT_MS);
  }, [settle]);

  const scheduleCommit = useCallback(() => {
    if (commitTimer.current) clearTimeout(commitTimer.current);
    commitTimer.current = setTimeout(commit, COMMIT_DELAY_MS);
  }, [commit]);

  // --- input ---
  const update = useCallback((fn: (v: View) => View, debounce: boolean) => {
    if (mathMode) {
      const next = fn(previewRef.current ?? baseRef.current);
      previewRef.current = next;
      setPreview(next);
      if (debounce) scheduleCommit();
    } else {
      isFit.current = false;
      setBase(b => clampView(fn(b), vpRef.current, canvasSize));
    }
  }, [mathMode, scheduleCommit, canvasSize]);

  const limits = useCallback(() => (mathMode ? undefined : scaleLimits(vpRef.current, canvasSize)), [mathMode, canvasSize]);

  const zoomAtViewport = useCallback((factor: number, vx: number, vy: number) =>
    update(v => zoomAt(v, factor, vx, vy, limits()), true), [update, limits]);

  const zoomAtClient = useCallback((factor: number, clientX: number, clientY: number) => {
    const r = containerRef.current?.getBoundingClientRect();
    zoomAtViewport(factor, clientX - (r?.left ?? 0), clientY - (r?.top ?? 0));
  }, [containerRef, zoomAtViewport]);

  const zoomCentre = useCallback((factor: number) =>
    zoomAtViewport(factor, vpRef.current.width / 2, vpRef.current.height / 2), [zoomAtViewport]);

  const panBy = useCallback((dx: number, dy: number) => update(v => pan(v, dx, dy), false), [update]);
  const gestureEnd = useCallback(() => { if (mathMode) commit(); }, [mathMode, commit]);

  const actualPixels = useCallback(() => {
    if (mathMode) return;
    const vp = vpRef.current, b = baseRef.current;
    zoomAtViewport(1 / b.scale, vp.width / 2, vp.height / 2);
  }, [mathMode, zoomAtViewport]);

  const view = preview ?? base;
  return {
    view,
    percent: zoomPercent(view, vpRef.current, canvasSize),
    fit: refit,
    zoomIn: useCallback(() => zoomCentre(ZOOM_STEP), [zoomCentre]),
    zoomOut: useCallback(() => zoomCentre(1 / ZOOM_STEP), [zoomCentre]),
    zoomAtClient,
    panBy,
    gestureEnd,
    actualPixels,
    settle,
  };
}

export default useViewport;
