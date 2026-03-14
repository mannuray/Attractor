import React from "react";
import styled, { keyframes, css } from "styled-components";

const CanvasContainer = styled.div<{ $scrollable: boolean }>`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: ${props => props.$scrollable ? "flex-start" : "center"};
  justify-content: ${props => props.$scrollable ? "flex-start" : "center"};
  overflow: ${props => props.$scrollable ? "auto" : "hidden"};
  position: relative;
  background-color: ${props => props.theme.bgPage};
  background-image: 
    linear-gradient(${props => props.theme.accentMuted} 1px, transparent 1px),
    linear-gradient(90deg, ${props => props.theme.accentMuted} 1px, transparent 1px);
  background-size: 40px 40px;
  background-position: center center;
  transition: background-color 0.5s ease;
`;

const renderPulse = keyframes`
  0%, 100% { box-shadow: 0 0 15px 4px var(--pulse-color-1), 0 0 40px 8px var(--pulse-color-2); }
  50% { box-shadow: 0 0 30px 8px var(--pulse-color-3), 0 0 60px 16px var(--pulse-color-4); }
`;

const CanvasWrapper = styled.div<{ $width: number; $height: number; $isFractal: boolean; $rendering: boolean }>`
  position: relative;
  width: ${props => props.$width}px;
  height: ${props => props.$height}px;
  flex-shrink: 0;
  cursor: ${props => props.$isFractal ? "crosshair" : "default"};
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.8);
  border: 1px solid ${props => props.theme.accentBorder};
  
  --pulse-color-1: ${props => props.theme.danger}99;
  --pulse-color-2: ${props => props.theme.danger}44;
  --pulse-color-3: ${props => props.theme.danger}E6;
  --pulse-color-4: ${props => props.theme.danger}80;
  
  animation: ${props => props.$rendering ? css`${renderPulse} 1.5s ease-in-out infinite` : "none"};
`;

const StyledCanvas = styled.canvas`
  display: block;
  image-rendering: pixelated;
  background: #000;
`;

const DragOverlay = styled.div<{ $visible: boolean }>`
  position: absolute;
  border: 2px dashed ${props => props.theme.accent};
  background: ${props => props.theme.accentMuted};
  pointer-events: none;
  display: ${props => props.$visible ? "block" : "none"};
`;

interface DragSelection {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface CanvasAreaProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  canvasSize: number;
  zoom: number;
  canvasKey: number;
  isFractalType: boolean;
  isDragging: boolean;
  dragSelection: DragSelection | null;
  rendering?: boolean;
  onMouseDown?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseMove?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseUp?: () => void;
}

export const CanvasArea: React.FC<CanvasAreaProps> = ({
  canvasRef,
  containerRef,
  canvasSize,
  zoom,
  canvasKey,
  isFractalType,
  isDragging,
  dragSelection,
  rendering,
  onMouseDown,
  onMouseMove,
  onMouseUp,
}) => {
  const displaySize = canvasSize * zoom;
  const scrollable = zoom > 0.5;

  return (
    <CanvasContainer ref={containerRef} $scrollable={scrollable}>
      <CanvasWrapper
        $width={displaySize}
        $height={displaySize}
        $isFractal={isFractalType}
        $rendering={rendering ?? false}
        onMouseDown={isFractalType ? onMouseDown : undefined}
        onMouseMove={isFractalType ? onMouseMove : undefined}
        onMouseUp={isFractalType ? onMouseUp : undefined}
        onMouseLeave={isFractalType ? onMouseUp : undefined}
      >
        <StyledCanvas
          key={canvasKey}
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          style={{ width: displaySize, height: displaySize }}
        />
        {dragSelection && (
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
