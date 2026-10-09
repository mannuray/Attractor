import React from "react";
import styled from "styled-components";
import { IconButton } from "../ui/IconButton";
import { Icon } from "../ui/Icon";
import { tokens } from "../../theme/tokens";

export interface CanvasToolbarProps {
  iterating: boolean; onToggleIteration: () => void;
  hunting: boolean; onHunt: () => void; onCancelHunt: () => void;
  isFractalType: boolean;
  zoom: number;
  onFitToView: () => void; onZoomIn: () => void; onZoomOut: () => void; onZoomReset: () => void;
  onResetFractalView: () => void;
  variant?: "desktop" | "mobile";
}

const Bar = styled.div<{ $mobile: boolean }>`
  display: flex; align-items: center; gap: ${p => (p.$mobile ? "12px" : "6px")};
  justify-content: ${p => (p.$mobile ? "space-between" : "center")};
  padding: ${p => (p.$mobile ? "0" : "8px")};
  ${p => !p.$mobile && `
    background: ${p.theme.glass1};
    backdrop-filter: blur(16px) saturate(160%);
    -webkit-backdrop-filter: blur(16px) saturate(160%);
    border: 1px solid ${p.theme.hairline};
    border-radius: ${tokens.radius.full};
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
  `}
`;
const Divider = styled.span`width: 1px; height: 24px; background: ${p => p.theme.hairline}; margin: 0 4px;`;
const ZoomText = styled.span`
  min-width: 48px; text-align: center; font: 500 12px ${tokens.font.mono}; color: ${p => p.theme.primary};
`;
const Spinner = styled.span`
  display: inline-block; animation: spin 1s linear infinite;
  @keyframes spin { to { transform: rotate(360deg); } }
`;

export const CanvasToolbar: React.FC<CanvasToolbarProps> = (p) => {
  const mobile = p.variant === "mobile";
  // Fractals render once per trigger, so the action is "Render" rather than Run/Pause (as in the old command bar).
  const runLabel = p.isFractalType ? "Render" : p.iterating ? "Pause" : "Run";
  const run = (
    <IconButton label={runLabel} variant="primary" size="lg" onClick={p.onToggleIteration}>
      <Icon name={p.iterating && !p.isFractalType ? "pause" : "play"} size={20} />
    </IconButton>
  );
  const hunt = !p.isFractalType && (
    p.hunting
      ? <IconButton label="Cancel hunt" variant="soft" active onClick={p.onCancelHunt}><Spinner><Icon name="sparkle" size={16} /></Spinner> Cancel</IconButton>
      : <IconButton label="Hunt" variant="soft" onClick={p.onHunt}><Icon name="sparkle" size={16} /> Hunt</IconButton>
  );
  const fit = <IconButton label="Fit to view" variant={mobile ? "soft" : "ghost"} onClick={p.onFitToView}><Icon name="fit" size={16} />{mobile && " Fit"}</IconButton>;

  if (mobile) {
    return <Bar $mobile>{hunt || <span style={{ width: 88 }} />}{run}{fit}</Bar>;
  }

  return (
    <Bar $mobile={false} role="toolbar" aria-label="Canvas controls">
      {run}
      {hunt}
      <Divider />
      {fit}
      <IconButton label="Zoom out" onClick={p.onZoomOut}><Icon name="minus" size={16} /></IconButton>
      <ZoomText>{Math.round(p.zoom * 100)}%</ZoomText>
      <IconButton label="Zoom in" onClick={p.onZoomIn}><Icon name="plus" size={16} /></IconButton>
      <IconButton label="Actual size" onClick={p.onZoomReset}>1:1</IconButton>
      {p.isFractalType && <IconButton label="Recenter" onClick={p.onResetFractalView}><Icon name="recenter" size={16} /></IconButton>}
    </Bar>
  );
};
