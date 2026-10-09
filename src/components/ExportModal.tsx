import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styled, { keyframes } from "styled-components";
import { Segmented } from "./ui/Segmented";
import { Icon } from "./ui/Icon";
import { useShare } from "../hooks/useShare";
import { paletteGradient } from "./panels/ColorPanel";
import { Color } from "../model-controller/Attractor/palette";
import { tokens } from "../theme/tokens";

type Choice = "current" | 1080 | 1440 | 2160 | 4320;
const CHOICES: { value: Choice; label: string }[] = [
  { value: "current", label: "Current view" },
  { value: 1080, label: "1080 px" },
  { value: 1440, label: "1440 px" },
  { value: 2160, label: "2160 px (4K)" },
  { value: 4320, label: "4320 px (8K)" },
];

const mobile = `@media (max-width: ${tokens.breakpoint.mobileMax}px)`;
const slide = keyframes`from { transform: translateX(-100%); } to { transform: translateX(250%); }`;
const pulse = keyframes`50% { opacity: 0.4; }`;

const Scrim = styled.div`
  position: fixed; inset: 0; z-index: ${tokens.z.modal};
  display: flex; align-items: center; justify-content: center; padding: 24px;
  background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  ${mobile} { align-items: flex-end; padding: 0; }
`;
const Dialog = styled.div`
  width: 100%; max-width: 660px; max-height: 92vh; display: flex; flex-direction: column; overflow: hidden;
  background: rgba(24, 27, 37, 0.95); border: 1px solid rgba(61, 73, 76, 0.4); border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px);
  color: ${p => p.theme.textHigh}; font-family: ${tokens.font.ui};
  ${mobile} { max-width: none; border-radius: 28px 28px 0 0; }
`;
const Header = styled.div`
  display: flex; align-items: center; justify-content: space-between; padding: 16px 24px;
  border-bottom: 1px solid rgba(61, 73, 76, 0.2);
  .id { display: flex; align-items: center; gap: 12px; min-width: 0; }
  .mark {
    width: 32px; height: 32px; border-radius: 8px; display: grid; place-items: center; flex-shrink: 0;
    color: ${p => p.theme.primary}; background: ${p => p.theme.primarySoft}; border: 1px solid ${p => p.theme.primaryBorder};
  }
  h2 { margin: 0; font: 600 16px/1.25rem ${tokens.font.ui}; }
  p { margin: 2px 0 0; font: 400 11px/0.875rem ${tokens.font.mono}; color: ${p => p.theme.textMid};
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
`;
const Close = styled.button`
  width: 32px; height: 32px; border-radius: 8px; display: grid; place-items: center; cursor: pointer;
  background: transparent; border: none; color: ${p => p.theme.textMid};
  &:hover:not(:disabled) { color: ${p => p.theme.textHigh}; background: ${p => p.theme.surfaceHigh}; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
  ${mobile} { width: 44px; height: 44px; }
`;
const Body = styled.div`
  display: grid; grid-template-columns: 5fr 7fr; gap: 20px; padding: 24px; overflow-y: auto;
  ${mobile} { grid-template-columns: 1fr; padding: 16px 20px; }
`;
const Col = styled.div`display: flex; flex-direction: column; gap: 12px; min-width: 0;`;
const Label = styled.span`
  display: flex; align-items: center; gap: 6px;
  font: 600 11px/0.875rem ${tokens.font.mono}; letter-spacing: 0.08em; text-transform: uppercase; color: ${p => p.theme.textMid};
  .dot { width: 6px; height: 6px; border-radius: 50%; background: ${p => p.theme.primary}; animation: ${pulse} 2s infinite; }
`;
const Preview = styled.div`
  position: relative; aspect-ratio: 1 / 1; border-radius: 12px; overflow: hidden;
  background: #090b10; border: 1px solid rgba(61, 73, 76, 0.3); box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.6);
  .glow { position: absolute; inset: 18%; border-radius: 50%; filter: blur(28px); opacity: 0.75; }
  .badge {
    position: absolute; bottom: 8px; padding: 2px 8px; border-radius: 6px;
    background: rgba(11, 14, 23, 0.85); border: 1px solid rgba(255, 255, 255, 0.08);
    font: 400 10px/0.875rem ${tokens.font.mono}; color: ${p => p.theme.textMid};
  }
  ${mobile} { aspect-ratio: 16 / 7; }
`;
const Info = styled.dl`
  margin: 0; padding: 12px; border-radius: 12px; display: grid; grid-template-columns: auto 1fr; gap: 6px 12px;
  background: rgba(11, 14, 23, 0.8); border: 1px solid rgba(61, 73, 76, 0.2);
  font: 400 12px/1rem ${tokens.font.mono};
  dt { color: ${p => p.theme.textMid}; }
  dd { margin: 0; text-align: right; color: ${p => p.theme.textHigh}; }
  dd.hi { color: ${p => p.theme.primary}; }
`;
const Hint = styled.p`margin: 0; font: 400 12px/1.5 ${tokens.font.ui}; color: ${p => p.theme.textMid};`;
const Pipeline = styled.div`
  display: flex; flex-direction: column; gap: 8px; padding-top: 8px;
  .track { height: 6px; border-radius: ${tokens.radius.full}; overflow: hidden; background: ${p => p.theme.surfaceHigh}; }
  .bar { height: 100%; width: 40%; background: ${p => p.theme.primary}; animation: ${slide} 1.2s ease-in-out infinite; }
  .idle { height: 100%; width: 100%; background: linear-gradient(90deg, rgba(${p => p.theme.primaryRgb}, 0.15), rgba(208, 188, 255, 0.15)); }
`;
const Footer = styled.div`
  display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 16px 24px;
  border-top: 1px solid rgba(61, 73, 76, 0.2); background: rgba(11, 14, 23, 0.4);
  .right { display: flex; gap: 8px; }
  ${mobile} { flex-wrap: wrap; padding: 12px 20px calc(12px + env(safe-area-inset-bottom)); .right { flex: 1; } }
`;
const Secondary = styled.button<{ $state?: string }>`
  display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 34px; padding: 0 12px;
  border-radius: 12px; cursor: pointer; background: transparent; font: 500 12px/1rem ${tokens.font.ui};
  border: 1px solid ${p => (p.$state === "failed" ? p.theme.danger : "rgba(61, 73, 76, 0.3)")};
  color: ${p => (p.$state === "copied" ? p.theme.primary : p.$state === "failed" ? p.theme.danger : p.theme.textMid)};
  &:hover:not(:disabled) { color: ${p => p.theme.textHigh}; background: ${p => p.theme.surfaceHigh}; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
  ${mobile} { height: 48px; flex: 1; }
`;
const Primary = styled.button`
  display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 34px; padding: 0 16px;
  border-radius: 12px; cursor: pointer; border: none;
  background: ${p => p.theme.primary}; color: ${p => p.theme.onPrimary}; font: 600 12px/1rem ${tokens.font.ui};
  box-shadow: 0 10px 15px -3px rgba(${p => p.theme.primaryRgb}, 0.25);
  &:hover:not(:disabled) { filter: brightness(1.1); }
  &:active { transform: scale(0.95); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
  ${mobile} { height: 48px; flex: 2; }
`;

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportCurrent: () => void;
  onExportSize: (size: number) => void;
  exporting: boolean;
  subtitle?: string;
  canvasSize?: number;
  oversampling?: number;
  paletteData?: Color[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen, onClose, onExportCurrent, onExportSize, exporting, subtitle, canvasSize, oversampling, paletteData,
}) => {
  const [choice, setChoice] = useState<Choice>(2160);
  const wasExporting = useRef(false);
  const { status: shareStatus, share } = useShare();

  useEffect(() => {
    if (exporting) wasExporting.current = true;
    else if (wasExporting.current) { wasExporting.current = false; onClose(); }
  }, [exporting, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !exporting) onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, exporting, onClose]);

  if (!isOpen) return null;

  const tryClose = () => { if (!exporting) onClose(); };
  const doExport = () => {
    if (exporting) return;
    if (choice === "current") { onExportCurrent(); onClose(); }
    else onExportSize(choice);
  };
  const px = choice === "current" ? canvasSize : choice;
  const sizeText = px ? `${px} × ${px} px` : "Canvas size";
  const glow = paletteData && paletteData.length ? paletteGradient(paletteData).replace("90deg", "135deg") : undefined;
  const shareText = shareStatus === "copied" ? "Link copied" : shareStatus === "failed" ? "Couldn't copy" : "Copy share link";

  return createPortal(
    <Scrim data-testid="modal-backdrop" onClick={tryClose}>
      <Dialog role="dialog" aria-modal="true" aria-labelledby="export-title" onClick={e => e.stopPropagation()}>
        <Header>
          <div className="id">
            <span className="mark"><Icon name="download" size={18} /></span>
            <div style={{ minWidth: 0 }}>
              <h2 id="export-title">Export render</h2>
              {subtitle && <p>{subtitle}</p>}
            </div>
          </div>
          <Close type="button" aria-label="Close" onClick={tryClose} disabled={exporting}><Icon name="close" size={18} /></Close>
        </Header>

        <Body>
          <Col>
            <Label><span className="dot" />Palette preview</Label>
            <Preview aria-hidden="true">
              {glow && <div className="glow" style={{ background: glow }} />}
              <span className="badge" style={{ left: 8 }}>{subtitle ?? "Render"}</span>
              <span className="badge" style={{ right: 8 }}>1:1</span>
            </Preview>
            <Info>
              <dt>Output</dt><dd className="hi">{sizeText}</dd>
              <dt>Format</dt><dd>PNG</dd>
              {oversampling !== undefined && (<><dt>Quality</dt><dd>{oversampling}× sampling</dd></>)}
            </Info>
          </Col>
          <Col>
            <Label>Output resolution</Label>
            <Segmented<Choice> ariaLabel="Resolution" variant="box" columns={1} value={choice} onChange={setChoice} options={CHOICES} />
            <Hint>
              {choice === "current"
                ? "Saves the canvas exactly as it is now."
                : `Re-renders a ${choice} × ${choice} PNG with the current parameters and palette.`}
            </Hint>
            <Pipeline>
              <Label>{exporting ? "Rendering…" : "Ready"}</Label>
              {exporting
                ? <div className="track" role="progressbar" aria-label="Exporting" aria-busy="true"><div className="bar" /></div>
                : <div className="track"><div className="idle" /></div>}
            </Pipeline>
          </Col>
        </Body>

        <Footer>
          <Secondary type="button" aria-label="Copy share link" $state={shareStatus} onClick={share}>
            <Icon name={shareStatus === "copied" ? "check" : shareStatus === "failed" ? "error" : "link"} size={16} />
            <span>{shareText}</span>
          </Secondary>
          <div className="right">
            <Secondary type="button" aria-label="Cancel" onClick={tryClose} disabled={exporting}>Cancel</Secondary>
            <Primary type="button" aria-label="Export PNG" onClick={doExport} disabled={exporting}>
              <Icon name="download" size={16} /> Export PNG
            </Primary>
          </div>
        </Footer>
      </Dialog>
    </Scrim>,
    document.body
  );
};

export default ExportModal;
