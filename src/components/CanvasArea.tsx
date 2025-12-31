import React from "react";
import styled from "styled-components";

const CanvasContainer = styled.div<{ $scrollable: boolean }>`
  flex: 1;
  display: flex;
  align-items: ${props => props.$scrollable ? "flex-start" : "center"};
  justify-content: ${props => props.$scrollable ? "flex-start" : "center"};
  overflow: ${props => props.$scrollable ? "auto" : "hidden"};
  position: relative;
  background: rgba(0, 0, 0, 0.3);
`;

const CanvasWrapper = styled.div<{ $width: number; $height: number; $isFractal: boolean }>`
  position: relative;
  width: ${props => props.$width}px;
  height: ${props => props.$height}px;
  flex-shrink: 0;
  cursor: ${props => props.$isFractal ? "crosshair" : "default"};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
`;

const StyledCanvas = styled.canvas`
  display: block;
  image-rendering: pixelated;
`;

const DragOverlay = styled.div<{ $visible: boolean }>`
  position: absolute;
  border: 2px dashed rgba(255, 180, 120, 0.8);
  background: rgba(255, 180, 120, 0.1);
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
