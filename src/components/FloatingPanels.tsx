import React from "react";
import styled from "styled-components";
import { GlassPanel, FlexRow, FloatingButton } from "../attractors/shared/styles";

const ZoomPanelContainer = styled(GlassPanel)`
  position: fixed;
  bottom: 20px;
  left: 360px;  /* 340px sidebar + 20px margin */
  padding: 8px;
  z-index: 100;
`;

const ControlPanelContainer = styled(GlassPanel)`
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 8px;
  z-index: 100;
`;

const IconButton = styled(FloatingButton)`
  font-size: 18px;
`;

const StartButton = styled(IconButton)<{ $iterating: boolean }>`
  background: ${props => props.$iterating
    ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
    : "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"};
  box-shadow: ${props => props.$iterating
    ? "0 2px 10px rgba(239, 68, 68, 0.3)"
    : "0 2px 10px rgba(34, 197, 94, 0.3)"};
  border: none;
`;

interface ZoomPanelProps {
  onFitToView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  isFractalType: boolean;
  onResetFractalView?: () => void;
}

export const ZoomPanel: React.FC<ZoomPanelProps> = ({
  onFitToView,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  isFractalType,
  onResetFractalView,
}) => {
  return (
    <ZoomPanelContainer>
      <FlexRow $gap="4px">
        <FloatingButton onClick={onFitToView} title="Fit to View">⊡</FloatingButton>
        <FloatingButton onClick={onZoomIn} title="Zoom In">+</FloatingButton>
        <FloatingButton onClick={onZoomOut} title="Zoom Out">−</FloatingButton>
        <FloatingButton onClick={onZoomReset} title="Reset Zoom">1:1</FloatingButton>
        {isFractalType && onResetFractalView && (
          <FloatingButton onClick={onResetFractalView} title="Reset View">↺</FloatingButton>
        )}
      </FlexRow>
    </ZoomPanelContainer>
  );
};

interface ControlPanelProps {
  iterating: boolean;
  onToggleIteration: () => void;
  onOpenPalette: () => void;
  onSaveImage: () => void;
  isFractalType: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  iterating,
  onToggleIteration,
  onOpenPalette,
  onSaveImage,
  isFractalType,
}) => {
  return (
    <ControlPanelContainer>
      <FlexRow $gap="4px">
        {isFractalType ? (
          <IconButton onClick={onToggleIteration} title="Render">
            🔄
          </IconButton>
        ) : (
          <StartButton $iterating={iterating} onClick={onToggleIteration} title={iterating ? "Stop" : "Start"}>
            {iterating ? "⏹" : "▶"}
          </StartButton>
        )}
        <IconButton onClick={onOpenPalette} title="Palette">
          🎨
        </IconButton>
        <IconButton onClick={onSaveImage} title="Save">
          💾
        </IconButton>
      </FlexRow>
    </ControlPanelContainer>
  );
};

const FloatingPanels = { ZoomPanel, ControlPanel };
export default FloatingPanels;
