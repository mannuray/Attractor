import React from "react";
import styled, { keyframes, css } from "styled-components";
import { useCanvasGestures } from "../hooks/useCanvasGestures";
import { DragPoint } from "../hooks/useFractalZoom";

const CanvasContainer = styled.div<{ $scrollable: boolean }>`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: ${props => props.$scrollable ? "flex-start" : "center"};
  justify-content: ${props => props.$scrollable ? "flex-start" : "center"};
  overflow: ${props => props.$scrollable ? "auto" : "hidden"};
  position: relative;
  background-color: ${props => props.theme.canvasBg};
  /* Stitch: faint dotted coordinate field behind the render */
  background-image: radial-gradient(rgba(${p => p.theme.primaryRgb}, 0.2) 1px, transparent 1px);
  background-size: 32px 32px;
  background-position: center center;
  transition: background-color 0.5s ease;
  touch-action: none;
`;

const renderPulse = keyframes`
  0%, 100% { box-shadow: 0 0 15px 4px var(--pulse-color-1), 0 0 40px 8px var(--pulse-color-2); }
  50% { box-shadow: 0 0 30px 8px var(--pulse-color-3), 0 0 60px 16px var(--pulse-color-4); }
`;

const CanvasWrapper = styled.div<{ 
  $width: number; 
  $height: number; 
  $isFractal: boolean; 
  $rendering: boolean;
  $fx: any;
}>`
  position: relative;
  width: ${props => props.$width}px;
  height: ${props => props.$height}px;
  flex-shrink: 0;
  cursor: ${props => props.$isFractal ? "crosshair" : "default"};
  overflow: hidden;
  box-shadow: 0 0 120px rgba(0, 0, 0, 0.6);
  
  --pulse-color-1: ${props => props.theme.danger}99;
  --pulse-color-2: ${props => props.theme.danger}44;
  --pulse-color-3: ${props => props.theme.danger}E6;
  --pulse-color-4: ${props => props.theme.danger}80;
  
  animation: ${props => props.$rendering ? css`${renderPulse} 1.5s ease-in-out infinite` : "none"};

  /* Apply CSS Filters for FX */
  filter: ${props => props.$fx?.enabled ? `
    brightness(${props.$fx.exposure})
    ${props.$fx.bloom > 0 ? `blur(${props.$fx.bloom * 0.5}px) brightness(${1 + props.$fx.bloom * 0.5}) contrast(${1 + props.$fx.bloom * 0.2})` : ''}
  ` : 'none'};
`;

const StyledCanvas = styled.canvas`
  display: block;
  image-rendering: pixelated;
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

const DragOverlay = styled.div<{ $visible: boolean }>`
  position: absolute;
  border: 2px dashed ${props => props.theme.accent};
  background: ${props => props.theme.accentMuted};
  pointer-events: none;
  display: ${props => props.$visible ? "block" : "none"};
  z-index: 10;
`;

interface CanvasAreaProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  canvasSize: number;
  zoom: number;
  canvasKey: number;
  isFractalType: boolean;
  rendering: boolean;
  isDragging: boolean;
  dragSelection: { left: number; top: number; width: number; height: number } | null;
  onSelectStart: (pt: DragPoint) => void;
  onSelectMove: (pt: DragPoint) => void;
  onSelectEnd: () => void;
  onSelectCancel: () => void;
  onZoomChange: (z: number) => void;
  fx?: {
    enabled: boolean;
    bloom: number;
    grain: number;
    vignette: number;
    exposure: number;
  };
}

export const CanvasArea: React.FC<CanvasAreaProps> = ({
  canvasRef,
  containerRef,
  canvasSize,
  zoom,
  canvasKey,
  isFractalType,
  rendering,
  isDragging,
  dragSelection,
  onSelectStart,
  onSelectMove,
  onSelectEnd,
  onSelectCancel,
  onZoomChange,
  fx
}) => {
  const scaledSize = canvasSize * zoom;
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  const toCanvasPoint = React.useCallback((clientX: number, clientY: number) => {
    const el = wrapperRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const x = (clientX - r.left) / zoom;
    const y = (clientY - r.top) / zoom;
    if (x < 0 || y < 0 || x > canvasSize || y > canvasSize) return null;
    return { x, y };
  }, [zoom, canvasSize]);

  const gestures = useCanvasGestures({
    zoom,
    onZoomChange,
    scrollRef: containerRef,
    selectEnabled: isFractalType,
    toCanvasPoint,
    onSelectStart,
    onSelectMove,
    onSelectEnd,
    onSelectCancel,
  });

  return (
    <CanvasContainer ref={containerRef} $scrollable={zoom > 1} {...gestures}>
      <CanvasWrapper
        $width={scaledSize}
        $height={scaledSize}
        $isFractal={isFractalType}
        $rendering={rendering}
        $fx={fx}
        ref={wrapperRef}
      >
        <StyledCanvas
          key={canvasKey}
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          style={{
            width: scaledSize,
            height: scaledSize,
          }}
        />
        
        {fx?.enabled && fx.vignette > 0 && <VignetteOverlay $opacity={fx.vignette} />}
        {fx?.enabled && fx.grain > 0 && <GrainOverlay $opacity={fx.grain} />}

        {isFractalType && dragSelection && (
          <DragOverlay
            $visible={isDragging}
            style={{
              left: dragSelection.left * zoom,
              top: dragSelection.top * zoom,
              width: dragSelection.width * zoom,
              height: dragSelection.height * zoom,
            }}
          />
        )}
      </CanvasWrapper>
    </CanvasContainer>
  );
};

export default CanvasArea;
