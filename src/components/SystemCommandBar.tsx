import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { GlassPanel, FlexRow, FloatingButton, colors } from "../attractors/shared/styles";

const CommandBarContainer = styled(GlassPanel)`
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px;
  z-index: 100;
  border-radius: 12px;
  background: ${colors.darkestBg};
  border: 1px solid ${colors.accentBorder};
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.8), 0 0 20px ${colors.accentSubtle};
  white-space: nowrap;
`;

const Divider = styled.div`
  width: 1px;
  height: 24px;
  background: ${colors.accentMuted};
  margin: 0 4px;
`;

const IconButton = styled(FloatingButton)`
  font-size: 13px;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 800;
  border: 1px solid transparent;

  &:hover {
    border-color: ${colors.accentBorder};
  }
`;

const pulse = keyframes`
  0% { opacity: 0.4; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1.1); filter: drop-shadow(0 0 8px ${props => props.theme.accent}); }
  100% { opacity: 0.4; transform: scale(0.9); }
`;

const ScanningIcon = styled.span`
  display: inline-block;
  animation: ${pulse} 1s infinite ease-in-out;
  color: ${colors.accent};
`;

const HuntButton = styled(IconButton)<{ $hunting: boolean }>`
  background: ${props => props.$hunting ? colors.accentSubtle : "transparent"};
  border-color: ${props => props.$hunting ? colors.accent : "transparent"};
  width: ${props => props.$hunting ? "auto" : "32px"};
  padding: ${props => props.$hunting ? "0 12px" : "0"};
  gap: 8px;
  display: flex;
  align-items: center;
`;

const ButtonLabel = styled.span`
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 1px;
`;

const MasterButton = styled.button<{ $iterating: boolean; $isFractal: boolean }>`
  height: 32px;
  padding: 0 16px;
  border-radius: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 900;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  background: ${props => props.$iterating 
    ? colors.danger 
    : (props.$isFractal ? colors.accent : colors.success)};
  color: ${colors.bgPage};
  border: none;
  box-shadow: 0 0 15px ${props => props.$iterating ? props.theme.danger : (props.$isFractal ? props.theme.accent : props.theme.success)}44;

  &:hover {
    transform: translateY(-1px) scale(1.02);
    filter: brightness(1.1);
    box-shadow: 0 0 20px ${props => props.$iterating ? props.theme.danger : (props.$isFractal ? props.theme.accent : props.theme.success)}66;
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }
`;

const TooltipWrapper = styled.div`
  position: relative;
  display: inline-flex;
`;

const CopiedTooltip = styled.span`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 12px;
  padding: 4px 12px;
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-family: 'JetBrains Mono', monospace;
  color: ${colors.bgPage};
  background: ${colors.accent};
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 0 15px ${colors.accentSoft};
  animation: fadeInOut 2s ease-in-out forwards;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 5px;
    border-style: solid;
    border-color: ${colors.accent} transparent transparent transparent;
  }

  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateX(-50%) translateY(5px); }
    15% { opacity: 1; transform: translateX(-50%) translateY(0); }
    85% { opacity: 1; transform: translateX(-50%) translateY(0); }
    100% { opacity: 0; transform: translateX(-50%) translateY(-5px); }
  }
`;

interface SystemCommandBarProps {
  // Master Controls
  iterating: boolean;
  onToggleIteration: () => void;
  isFractalType: boolean;
  onHunt: () => void;
  onCancelHunt: () => void;
  hunting: boolean;
  
  // Zoom Controls
  onFitToView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onResetFractalView?: () => void;
  
  // System Tools
  onOpenPalette: () => void;
  onOpenExport: () => void;
  onShareLink: () => void;
  onCycleBg: () => void;
}

export const SystemCommandBar: React.FC<SystemCommandBarProps> = ({
  iterating,
  onToggleIteration,
  isFractalType,
  onHunt,
  onCancelHunt,
  hunting,
  onFitToView,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onResetFractalView,
  onOpenPalette,
  onOpenExport,
  onShareLink,
  onCycleBg,
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
    <CommandBarContainer>
      {/* Zoom Section */}
      <FlexRow $gap="2px">
        <IconButton onClick={onFitToView} title="FIT VIEWPORT">FIT</IconButton>
        <IconButton onClick={onZoomIn} title="INCREASE MAGNIFICATION">+</IconButton>
        <IconButton onClick={onZoomOut} title="DECREASE MAGNIFICATION">−</IconButton>
        <IconButton onClick={onZoomReset} title="RESET SCALE">1:1</IconButton>
        {isFractalType && onResetFractalView && (
          <IconButton onClick={onResetFractalView} title="RECENTER COORDINATES">↺</IconButton>
        )}
      </FlexRow>

      <Divider />

      {/* Master Control */}
      <FlexRow $gap="4px">
        {!isFractalType && (
          <HuntButton $hunting={hunting} onClick={hunting ? onCancelHunt : onHunt} title={hunting ? "CANCEL SCAN" : "HUNT FOR CHAOS (SMART SHUFFLE)"}>
            {hunting ? (
              <>
                <ScanningIcon>◈</ScanningIcon>
                <ButtonLabel>SCANNING...</ButtonLabel>
              </>
            ) : (
              <ButtonLabel>◈</ButtonLabel>
            )}
          </HuntButton>
        )}
        <MasterButton 
          $iterating={iterating} 
          $isFractal={isFractalType} 
          onClick={onToggleIteration}
          title={iterating ? "HALT PROCESS" : "EXECUTE KERNEL"}
        >
          {isFractalType ? (
            <><span>🔄</span> RENDER</>
          ) : (
            <>{iterating ? '⏹ STOP' : '▶ START'}</>
          )}
        </MasterButton>
      </FlexRow>

      <Divider />

      {/* Tools Section */}
      <FlexRow $gap="2px">
        <IconButton onClick={onCycleBg} title="CYCLE BACKGROUND (VOID/INK/PAPER)">BKG</IconButton>
        <IconButton onClick={onOpenPalette} title="COLOR LOOKUP TABLE">LUT</IconButton>
        <IconButton onClick={onOpenExport} title="EXPORT RENDER">OUT</IconButton>
        <TooltipWrapper>
          <IconButton onClick={handleShare} title="GENERATE SYNC LINK">LINK</IconButton>
          {copied && <CopiedTooltip>SYNC_COMPLETE</CopiedTooltip>}
        </TooltipWrapper>
      </FlexRow>
    </CommandBarContainer>
  );
};

export default SystemCommandBar;
