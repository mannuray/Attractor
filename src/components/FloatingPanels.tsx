import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { GlassPanel, FlexRow, FloatingButton, colors } from "../attractors/shared/styles";

const ZoomPanelContainer = styled(GlassPanel)<{ $sidebarCollapsed: boolean }>`
  position: fixed;
  bottom: 24px;
  left: ${props => props.$sidebarCollapsed ? "94px" : "364px"};
  padding: 6px;
  z-index: 100;
  border-radius: 8px;
  transition: left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  background: ${colors.darkestBg};
  border: 1px solid ${colors.accentBorder};
`;

const ControlPanelContainer = styled(GlassPanel)`
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 6px;
  z-index: 100;
  border-radius: 8px;
  background: ${colors.darkestBg};
  border: 1px solid ${colors.accentBorder};
`;

const IconButton = styled(FloatingButton)`
  font-size: 14px;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 800;
`;

const StartButton = styled(IconButton)<{ $iterating: boolean }>`
  background: ${props => props.$iterating ? colors.danger : colors.success};
  box-shadow: 0 4px 12px ${props => props.$iterating ? props.theme.danger : props.theme.success}44;
  border: none;
  color: ${colors.bgPage};

  &:hover {
    transform: scale(1.1);
  }
`;

const ShareButtonWrapper = styled.div`
  position: relative;
  display: inline-flex;
`;

const CopiedTooltip = styled.span`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 8px;
  padding: 4px 12px;
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-family: 'JetBrains Mono', monospace;
  color: ${colors.bgPage};
  background: ${colors.accent};
  border-radius: 2px;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 0 15px ${colors.accentSoft};
  animation: fadeInOut 2s ease-in-out forwards;

  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateX(-50%) translateY(5px); }
    15% { opacity: 1; transform: translateX(-50%) translateY(0); }
    85% { opacity: 1; transform: translateX(-50%) translateY(0); }
    100% { opacity: 0; transform: translateX(-50%) translateY(-5px); }
  }
`;

interface ZoomPanelProps {
  onFitToView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  isFractalType: boolean;
  onResetFractalView?: () => void;
  sidebarCollapsed?: boolean;
}

export const ZoomPanel: React.FC<ZoomPanelProps> = ({
  onFitToView,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  isFractalType,
  onResetFractalView,
  sidebarCollapsed = false,
}) => {
  return (
    <ZoomPanelContainer $sidebarCollapsed={sidebarCollapsed}>
      <FlexRow $gap="4px">
        <IconButton onClick={onFitToView} title="FIT">FIT</IconButton>
        <IconButton onClick={onZoomIn} title="ZOOM IN">+</IconButton>
        <IconButton onClick={onZoomOut} title="ZOOM OUT">−</IconButton>
        <IconButton onClick={onZoomReset} title="RESET">1:1</IconButton>
        {isFractalType && onResetFractalView && (
          <IconButton onClick={onResetFractalView} title="RECENTER">↺</IconButton>
        )}
      </FlexRow>
    </ZoomPanelContainer>
  );
};

interface ControlPanelProps {
  iterating: boolean;
  onToggleIteration: () => void;
  onOpenPalette: () => void;
  onOpenExport: () => void;
  onShareLink: () => void;
  isFractalType: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  iterating,
  onToggleIteration,
  onOpenPalette,
  onOpenExport,
  onShareLink,
  isFractalType,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  const handleShare = () => {
    onShareLink();
    setCopied(true);
  };

  return (
    <ControlPanelContainer>
      <FlexRow $gap="4px">
        {isFractalType ? (
          <IconButton onClick={onToggleIteration} title="PROCESS">
            RUN
          </IconButton>
        ) : (
          <StartButton $iterating={iterating} onClick={onToggleIteration} title={iterating ? "STOP" : "START"}>
            {iterating ? "OFF" : "ON"}
          </StartButton>
        )}
        <IconButton onClick={onOpenPalette} title="PALETTE">
          LUT
        </IconButton>
        <IconButton onClick={onOpenExport} title="EXPORT">
          OUT
        </IconButton>
        <ShareButtonWrapper>
          <IconButton onClick={handleShare} title="SHARE">
            LINK
          </IconButton>
          {copied && <CopiedTooltip>SYNC_COMPLETE</CopiedTooltip>}
        </ShareButtonWrapper>
      </FlexRow>
    </ControlPanelContainer>
  );
};

const FloatingPanels = { ZoomPanel, ControlPanel };
export default FloatingPanels;
