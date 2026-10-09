import React from "react";
import styled from "styled-components";
import { useCanvasGestures } from "../hooks/useCanvasGestures";
import { clientToCanvas, wheelFactor } from "../lib/gestureMath";
import type { View } from "../lib/viewport";
import { DragPoint } from "../hooks/useFractalZoom";

const CanvasContainer = styled.div<{ $cursor: string }>`
  flex: 1;
  min-width: 0;
  min-height: 0;
  /* A fixed viewport: the render is transformed inside it and never resizes the layout. */
  overflow: hidden;
  position: relative;
  cursor: ${props => props.$cursor};
  background-color: ${props => props.theme.canvasBg};
  /* Stitch: faint dotted coordinate field behind the render */
  background-image: radial-gradient(rgba(${p => p.theme.primaryRgb}, 0.2) 1px, transparent 1px);
  background-size: 32px 32px;
  background-position: center center;
  transition: background-color 0.5s ease;
  touch-action: none;
`;

const CanvasWrapper = styled.div<{ $size: number; $scale: number; $fx: any }>`
  position: absolute;
  left: 0;
  top: 0;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  transform-origin: 0 0;
  will-change: transform;
  overflow: hidden;
  box-shadow: 0 0 ${props => 120 / props.$scale}px rgba(0, 0, 0, 0.6);

  /* FX filters, sized in screen pixels (the wrapper itself is scaled) */
  filter: ${props => props.$fx?.enabled ? `
    brightness(${props.$fx.exposure})
    ${props.$fx.bloom > 0 ? `blur(${(props.$fx.bloom * 0.5) / props.$scale}px) brightness(${1 + props.$fx.bloom * 0.5}) contrast(${1 + props.$fx.bloom * 0.2})` : ''}
  ` : 'none'};
`;

const StyledCanvas = styled.canvas<{ $magnified: boolean }>`
  display: block;
  /* Crisp pixels when magnified, smooth when shrunk to fit. */
  image-rendering: ${props => props.$magnified ? "pixelated" : "auto"};
  background: #000;
`;

const VignetteOverlay = styled.div<{ $opacity: number }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  background: radial-gradient(circle, transparent 40%, rgba(0,0,0, ${props => props.$opacity}) 100%);
  z-index: 2;
`;

const GrainOverlay = styled.div<{ $opacity: number }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  opacity: ${props => props.$opacity};
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  z-index: 3;
`;

const DragOverlay = styled.div<{ $visible: boolean; $scale: number }>`
  position: absolute;
  border: ${props => 2 / props.$scale}px dashed ${props => props.theme.accent};
  background: ${props => props.theme.accentMuted};
  pointer-events: none;
  display: ${props => props.$visible ? "block" : "none"};
  z-index: 10;
`;

interface CanvasAreaProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  canvasSize: number;
  view: View;
  canvasKey: number;
  isFractalType: boolean;
  isDragging: boolean;
  dragSelection: { left: number; top: number; width: number; height: number } | null;
  onSelectStart: (pt: DragPoint) => void;
  onSelectMove: (pt: DragPoint) => void;
  onSelectEnd: () => void;
  onSelectCancel?: () => void;
  onPan: (dx: number, dy: number) => void;
  onZoomAt: (factor: number, clientX: number, clientY: number) => void;
  onGestureEnd: () => void;
  fx?: {
    enabled: boolean;
    bloom: number;
    grain: number;
    vignette: number;
    exposure: number;
  };
}

const isTyping = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));

export const CanvasArea: React.FC<CanvasAreaProps> = ({
  canvasRef,
  containerRef,
  canvasSize,
  view,
  canvasKey,
  isFractalType,
  isDragging,
  dragSelection,
  onSelectStart,
  onSelectMove,
  onSelectEnd,
  onSelectCancel,
  onPan,
  onZoomAt,
  onGestureEnd,
  fx
}) => {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const [spaceHeld, setSpaceHeld] = React.useState(false);
  const [grabbing, setGrabbing] = React.useState(false);
  const spaceRef = React.useRef(false);

  // Space + drag pans (needed on fractals, where a plain drag draws a zoom box).
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code !== "Space" || isTyping(e.target)) return;
      if (!spaceRef.current) { spaceRef.current = true; setSpaceHeld(true); }
      e.preventDefault();
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "Space") { spaceRef.current = false; setSpaceHeld(false); }
    };
    const blur = () => { spaceRef.current = false; setSpaceHeld(false); };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); window.removeEventListener("blur", blur); };
  }, []);

  // Wheel / trackpad pinch zooms at the cursor. Native listener: React's is passive and
  // could not stop the page from scrolling.
  const zoomRef = React.useRef(onZoomAt);
  zoomRef.current = onZoomAt;
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomRef.current(wheelFactor(e), e.clientX, e.clientY);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [containerRef]);

  const toCanvasPoint = React.useCallback((clientX: number, clientY: number, clamp: boolean) => {
    const el = wrapperRef.current;
    return el ? clientToCanvas(el.getBoundingClientRect(), view.scale, canvasSize, clientX, clientY, clamp) : null;
  }, [view.scale, canvasSize]);

  const gestures = useCanvasGestures({
    selectEnabled: isFractalType,
    panHeld: () => spaceRef.current,
    toCanvasPoint,
    onSelectStart,
    onSelectMove,
    onSelectEnd,
    onSelectCancel,
    onPan,
    onZoomAt,
    onGestureEnd,
  });

  const panning = !isFractalType || spaceHeld;
  const cursor = panning ? (grabbing ? "grabbing" : "grab") : "crosshair";

  return (
    <CanvasContainer
      ref={containerRef}
      $cursor={cursor}
      onPointerDown={e => { if (panning) setGrabbing(true); gestures.onPointerDown(e); }}
      onPointerMove={gestures.onPointerMove}
      onPointerUp={e => { setGrabbing(false); gestures.onPointerUp(e); }}
      onPointerCancel={e => { setGrabbing(false); gestures.onPointerCancel(e); }}
    >
      <CanvasWrapper
        $size={canvasSize}
        $scale={view.scale}
        $fx={fx}
        ref={wrapperRef}
        style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}
      >
        <StyledCanvas
          key={canvasKey}
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          $magnified={view.scale >= 1}
          style={{ width: canvasSize, height: canvasSize }}
        />

        {fx?.enabled && fx.vignette > 0 && <VignetteOverlay $opacity={fx.vignette} />}
        {fx?.enabled && fx.grain > 0 && <GrainOverlay $opacity={fx.grain} />}

        {isFractalType && dragSelection && (
          <DragOverlay
            $visible={isDragging}
            $scale={view.scale}
            style={{
              left: dragSelection.left,
              top: dragSelection.top,
              width: dragSelection.width,
              height: dragSelection.height,
            }}
          />
        )}
      </CanvasWrapper>
    </CanvasContainer>
  );
};

export default CanvasArea;
