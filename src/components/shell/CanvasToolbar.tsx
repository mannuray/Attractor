import React from "react";
import styled, { keyframes } from "styled-components";
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
  /** 0..1 while a fractal is being refined, null otherwise. */
  renderProgress?: number | null;
}

const spin = keyframes`to { transform: rotate(360deg); }`;

const Bar = styled.div`
  position: relative;
  display: flex; align-items: center; gap: 12px;
  padding: 8px 16px;
  background: rgba(10, 11, 16, 0.9);
  backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: ${tokens.radius.full};
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6), ${p => p.theme.glowPrimary};
`;
const MobileRow = styled.div`
  display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 12px;
  & > button { width: 100%; }
  & > button:nth-child(2) { width: auto; }
`;
const RunButton = styled.button<{ $size: number }>`
  width: ${p => p.$size}px; height: ${p => p.$size}px; border-radius: 50%; border: none; cursor: pointer;
  display: grid; place-items: center; flex-shrink: 0;
  background: ${p => p.theme.primaryContainer}; color: ${p => p.theme.onPrimary};
  box-shadow: ${p => p.theme.glowPrimary};
  transition: background 0.15s ease, transform 0.1s ease;
  &:hover { background: ${p => p.theme.primary}; }
  &:active { transform: scale(0.95); }
`;
const HuntButton = styled.button<{ $active: boolean; $mobile: boolean }>`
  display: inline-flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer; white-space: nowrap;
  height: ${p => (p.$mobile ? "48px" : "32px")};
  padding: 0 14px;
  border-radius: ${p => (p.$mobile ? "12px" : tokens.radius.full)};
  background: ${p => (p.$active ? p.theme.primarySoft : "rgba(39, 42, 51, 0.8)")};
  border: 1px solid ${p => p.theme.primaryBorder};
  color: ${p => p.theme.primary};
  font: 500 13px/1.25rem ${tokens.font.ui}; letter-spacing: -0.01em;
  transition: background 0.15s ease, transform 0.1s ease;
  &:hover { background: ${p => p.theme.surfaceHighest}; }
  &:active { transform: scale(0.95); }
  .spin { display: inline-flex; animation: ${spin} 1s linear infinite; }
`;
const OutlineButton = styled.button<{ $active?: boolean }>`
  display: inline-flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer;
  height: 44px; padding: 0 14px; border-radius: 12px;
  background: ${p => (p.$active ? p.theme.primarySoft : "rgba(39, 42, 51, 0.6)")};
  border: 1px solid ${p => (p.$active ? p.theme.primaryBorder : "rgba(61, 73, 76, 0.5)")};
  color: ${p => p.theme.textHigh}; font: 500 13px/1.25rem ${tokens.font.ui};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  .material-symbols-outlined { color: ${p => p.theme.primary}; }
  &:active { transform: scale(0.95); }
  .spin { display: inline-flex; animation: ${spin} 1s linear infinite; }
`;
const MobileRun = styled(RunButton)`
  background: ${p => p.theme.primary};
  &:hover { filter: brightness(1.1); }
`;
const ProgressWrap = styled.div<{ $mobile: boolean }>`
  position: ${p => (p.$mobile ? "relative" : "absolute")};
  left: ${p => (p.$mobile ? "auto" : "20px")}; right: ${p => (p.$mobile ? "auto" : "20px")};
  bottom: ${p => (p.$mobile ? "auto" : "3px")};
  margin-bottom: ${p => (p.$mobile ? "8px" : "0")};
  display: flex; flex-direction: column; gap: 4px;
  .track { height: 2px; border-radius: 1px; overflow: hidden; background: rgba(255, 255, 255, 0.08); }
  .fill {
    height: 100%; background: ${p => p.theme.primary}; box-shadow: ${p => p.theme.glowPrimary};
    transition: width 0.15s linear;
  }
`;
const ProgressLabel = styled.span<{ $mobile: boolean }>`
  ${p => (p.$mobile ? "" : "position: absolute; left: 50%; bottom: calc(100% + 10px); transform: translateX(-50%);")}
  align-self: center; padding: 2px 10px; border-radius: ${tokens.radius.full}; white-space: nowrap;
  background: rgba(10, 11, 16, 0.85); border: 1px solid ${p => p.theme.hairline};
  font: 400 11px/0.875rem ${tokens.font.mono}; color: ${p => p.theme.primary};
`;
const Divider = styled.span`width: 1px; height: 24px; background: rgba(255, 255, 255, 0.2);`;
const Group = styled.div`display: flex; align-items: center; gap: 4px;`;
const TextBtn = styled.button`
  padding: 4px 10px; border-radius: ${tokens.radius.full}; cursor: pointer; border: none; background: transparent;
  color: ${p => p.theme.textMid}; font: 400 11px/0.875rem ${tokens.font.mono}; letter-spacing: 0.02em;
  &:hover { color: ${p => p.theme.textHigh}; background: ${p => p.theme.surfaceHigh}; }
`;
const RoundBtn = styled.button`
  width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center; cursor: pointer;
  border: none; background: transparent; color: ${p => p.theme.textMid};
  &:hover { color: ${p => p.theme.primary}; background: ${p => p.theme.surfaceHigh}; }
`;
const ZoomText = styled.span`
  padding: 0 4px; min-width: 40px; text-align: center;
  font: 400 11px/0.875rem ${tokens.font.mono}; color: ${p => p.theme.primary};
`;

export const CanvasToolbar: React.FC<CanvasToolbarProps> = (p) => {
  const mobile = p.variant === "mobile";
  const pct = p.renderProgress == null ? null : Math.round(Math.min(1, Math.max(0, p.renderProgress)) * 100);
  // Desktop: label floats above the pill and the bar runs along its bottom edge.
  // Mobile: label and bar sit above the thumb row.
  const track = pct === null ? null : (
    <div className="track" role="progressbar" aria-label="Refining" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
      <div className="fill" style={{ width: `${pct}%` }} />
    </div>
  );
  const progress = pct === null ? null : mobile ? (
    <ProgressWrap $mobile><ProgressLabel $mobile>Refining {pct}%</ProgressLabel>{track}</ProgressWrap>
  ) : (
    <>
      <ProgressLabel $mobile={false}>Refining {pct}%</ProgressLabel>
      <ProgressWrap $mobile={false}>{track}</ProgressWrap>
    </>
  );
  // Fractals render once per trigger, so the action is "Render" rather than Run/Pause (as in the old command bar).
  const runLabel = p.isFractalType ? "Render" : p.iterating ? "Pause" : "Run";
  const runIcon = p.iterating && !p.isFractalType ? "pause" : p.isFractalType ? "refresh" : "play";

  const run = (
    <RunButton type="button" aria-label={runLabel} title={runLabel} $size={mobile ? 56 : 40} onClick={p.onToggleIteration}>
      <Icon name={runIcon} size={mobile ? 28 : 22} filled />
    </RunButton>
  );
  const hunt = !p.isFractalType && (
    p.hunting
      ? <HuntButton type="button" aria-label="Cancel hunt" title="Cancel hunt" $active $mobile={mobile} onClick={p.onCancelHunt}>
          <span className="spin"><Icon name="sparkle" size={18} /></span> Cancel
        </HuntButton>
      : <HuntButton type="button" aria-label="Hunt" title="Hunt for interesting parameters" $active={false} $mobile={mobile} onClick={p.onHunt}>
          <Icon name="sparkle" size={18} /> Hunt
        </HuntButton>
  );

  if (mobile) {
    const mobileHunt = p.isFractalType
      ? <span />
      : p.hunting
        ? <OutlineButton type="button" aria-label="Cancel hunt" $active onClick={p.onCancelHunt}>
            <span className="spin"><Icon name="sparkle" size={18} /></span> Cancel
          </OutlineButton>
        : <OutlineButton type="button" aria-label="Hunt" onClick={p.onHunt}><Icon name="sparkle" size={18} /> Hunt</OutlineButton>;
    return (
      <>
      {progress}
      <MobileRow>
        {mobileHunt}
        <MobileRun type="button" aria-label={runLabel} title={runLabel} $size={48} onClick={p.onToggleIteration}>
          <Icon name={runIcon} size={24} filled />
        </MobileRun>
        <OutlineButton type="button" aria-label="Fit to view" title="Fit to view" onClick={p.onFitToView}>
          <Icon name="fit" size={18} /> Fit
        </OutlineButton>
      </MobileRow>
      </>
    );
  }

  return (
    <Bar role="toolbar" aria-label="Canvas controls">
      {progress}
      {run}
      {hunt}
      <Divider />
      <Group>
        <TextBtn type="button" aria-label="Fit to view" title="Fit to view" onClick={p.onFitToView}>Fit</TextBtn>
        <RoundBtn type="button" aria-label="Zoom out" title="Zoom out" onClick={p.onZoomOut}><Icon name="minus" size={16} /></RoundBtn>
        <ZoomText>{Math.round(p.zoom * 100)}%</ZoomText>
        <RoundBtn type="button" aria-label="Zoom in" title="Zoom in" onClick={p.onZoomIn}><Icon name="plus" size={16} /></RoundBtn>
        <TextBtn type="button" aria-label="Actual size" title="Actual size" onClick={p.onZoomReset}>1:1</TextBtn>
        {p.isFractalType && (
          <RoundBtn type="button" aria-label="Recenter" title="Reset fractal view" onClick={p.onResetFractalView}>
            <Icon name="recenter" size={16} />
          </RoundBtn>
        )}
      </Group>
    </Bar>
  );
};
