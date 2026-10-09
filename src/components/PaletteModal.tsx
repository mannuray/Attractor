import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styled, { useTheme } from "styled-components";
import { Color } from "../model-controller/Attractor/palette";
import { SliderInput } from "../attractors/shared/styles";
import { ColorRamp } from "./palette/ColorRamp";
import { StopPicker } from "./palette/StopPicker";
import { Segmented } from "./ui/Segmented";
import { Icon } from "./ui/Icon";
import { useIsMobile } from "../hooks/useIsMobile";
import { Stop, isEndStop, removeStop, setStopColor, toHex, fromHex } from "../lib/colorRamp";
import { BgMode, bgColorFor, bgModeOf } from "../lib/bgMode";
import { tokens } from "../theme/tokens";

interface BgColor { r: number; g: number; b: number }

interface PaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtitle?: string;
  paletteData: Color[];
  onPaletteChange: (colors: Color[]) => void;
  palGamma: number;
  onGammaChange: (gamma: number) => void;
  palScale: boolean;
  onScaleModeChange: (isDynamic: boolean) => void;
  palMax: number;
  onPalMaxChange: (max: number) => void;
  bgColor: BgColor;
  onBgColorChange: (color: BgColor) => void;
}

const mobile = `@media (max-width: ${tokens.breakpoint.mobileMax}px)`;

const Scrim = styled.div`
  position: fixed; inset: 0; z-index: ${tokens.z.modal};
  display: flex; align-items: center; justify-content: center; padding: 16px;
  background: rgba(0, 0, 0, 0.65); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  ${mobile} { align-items: flex-end; padding: 0; }
`;
const Dialog = styled.div`
  width: 100%; max-width: 620px; max-height: 92vh; display: flex; flex-direction: column; overflow: hidden;
  background: rgba(20, 23, 34, 0.95); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px;
  box-shadow: 0 24px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(${p => p.theme.primaryContainerRgb}, 0.15);
  backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px);
  color: ${p => p.theme.textHigh}; font-family: ${tokens.font.ui};
  ${mobile} { max-width: none; max-height: 90vh; border-radius: 28px 28px 0 0; border-bottom: none; }
`;
const Grab = styled.div`
  display: none;
  ${mobile} { display: block; width: 48px; height: 6px; margin: 10px auto 0; border-radius: 3px; background: rgba(61, 73, 76, 0.6); }
`;
const Header = styled.div`
  display: flex; align-items: center; justify-content: space-between; padding: 16px 24px;
  background: rgba(14, 17, 26, 0.6); border-bottom: 1px solid rgba(61, 73, 76, 0.25);
  .id { display: flex; align-items: center; gap: 12px; }
  .mark {
    width: 32px; height: 32px; border-radius: 8px; display: grid; place-items: center; color: ${p => p.theme.primary};
    background: ${p => p.theme.primarySoft}; border: 1px solid ${p => p.theme.primaryBorder};
  }
  h2 { margin: 0; font: 600 16px/1 ${tokens.font.ui}; letter-spacing: -0.01em; }
  p { margin: 4px 0 0; font: 400 11px/0.875rem ${tokens.font.mono}; color: rgba(${p => p.theme.primaryRgb}, 0.8); }
  ${mobile} { padding: 12px 20px 14px; background: transparent; }
`;
const Close = styled.button`
  width: 28px; height: 28px; border-radius: 8px; display: grid; place-items: center; cursor: pointer;
  background: transparent; border: none; color: ${p => p.theme.textMid};
  &:hover { color: ${p => p.theme.textHigh}; background: ${p => p.theme.surfaceHigh}; }
  ${mobile} { width: 44px; height: 44px; }
`;
const Body = styled.div`
  flex: 1; min-height: 0; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 20px;
  overscroll-behavior: contain;
  ${mobile} { padding: 16px 20px 20px; }
`;
const Label = styled.span`
  font: 500 11px/0.875rem ${tokens.font.mono}; letter-spacing: 0.06em; text-transform: uppercase; color: ${p => p.theme.textMid};
`;
const Row = styled.div`display: flex; align-items: center; justify-content: space-between; gap: 12px;`;
const Muted = styled.span`font: 400 11px/0.875rem ${tokens.font.mono}; color: ${p => p.theme.textLow};`;
const Section = styled.div`
  display: flex; flex-direction: column; gap: 12px; padding-top: 16px; border-top: 1px solid rgba(61, 73, 76, 0.2);
`;
const ToneCard = styled.div`
  padding: 12px; border-radius: 12px; display: flex; flex-direction: column; gap: 6px;
  background: rgba(11, 14, 23, 0.5); border: 1px solid rgba(61, 73, 76, 0.2);
  .name { font: 500 12px/1rem ${tokens.font.ui}; color: ${p => p.theme.textHigh}; }
  .desc { font: 400 11px/0.875rem ${tokens.font.ui}; color: ${p => p.theme.textMid}; }
  .val {
    padding: 2px 8px; border-radius: 4px; font: 500 12px/1rem ${tokens.font.mono}; color: ${p => p.theme.primary};
    background: ${p => p.theme.surface}; border: 1px solid ${p => p.theme.hairline};
  }
  .marks { display: flex; justify-content: space-between; font: 400 10px/0.875rem ${tokens.font.mono}; color: rgba(188, 201, 205, 0.5); }
`;
const MaxBox = styled.label`
  display: inline-flex; align-items: center; gap: 6px; padding: 4px 8px; border-radius: 8px;
  background: ${p => p.theme.surfaceLowest}; border: 1px solid ${p => p.theme.hairline};
  font: 400 11px ${tokens.font.mono}; color: ${p => p.theme.textMid};
  input {
    width: 72px; padding: 4px 6px; border-radius: 4px; outline: none; text-align: right;
    background: ${p => p.theme.surface}; border: 1px solid ${p => p.theme.hairlineStrong};
    color: ${p => p.theme.primary}; font: 400 12px ${tokens.font.mono};
    ${mobile} { font-size: 16px; }
  }
`;
const BgSwatch = styled.label`
  position: relative; display: inline-flex; align-items: center; gap: 8px; padding: 4px 10px; border-radius: 8px; cursor: pointer;
  background: ${p => p.theme.surfaceLowest}; border: 1px solid ${p => p.theme.hairline};
  font: 400 12px/1rem ${tokens.font.mono}; color: ${p => p.theme.primary};
  .chip { width: 14px; height: 14px; border-radius: 3px; border: 1px solid rgba(255, 255, 255, 0.2); }
  input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
`;
const Footer = styled.div`
  display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 24px;
  border-top: 1px solid rgba(61, 73, 76, 0.25); background: rgba(14, 17, 26, 0.6);
  ${mobile} { padding: 12px 20px calc(12px + env(safe-area-inset-bottom)); }
`;
const ResetButton = styled.button`
  display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 34px; padding: 0 16px;
  border-radius: 8px; cursor: pointer; background: transparent; border: 1px solid ${p => p.theme.hairlineStrong};
  color: ${p => p.theme.textHigh}; font: 400 13px/1.25rem ${tokens.font.ui};
  &:hover { background: ${p => p.theme.surfaceHigh}; }
  ${mobile} { flex: 1; height: 52px; border-radius: 12px; background: ${p => p.theme.surfaceHigh}; }
`;
const DoneButton = styled.button`
  display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 34px; padding: 0 20px;
  border-radius: 8px; cursor: pointer; border: none;
  background: ${p => p.theme.primary}; color: ${p => p.theme.onPrimary};
  font: 600 13px/1.25rem ${tokens.font.ui}; box-shadow: ${p => p.theme.glowPrimary};
  &:hover { filter: brightness(1.1); }
  ${mobile} { flex: 2; height: 52px; border-radius: 12px; font-size: 15px; background: ${p => p.theme.primaryContainer}; }
`;

type Snapshot = { palette: Color[]; gamma: number; scale: boolean; max: number; bg: BgColor };

export const PaletteModal: React.FC<PaletteModalProps> = ({
  isOpen, onClose, subtitle, paletteData, onPaletteChange, palGamma, onGammaChange,
  palScale, onScaleModeChange, palMax, onPalMaxChange, bgColor, onBgColorChange,
}) => {
  const isMobile = useIsMobile();
  const theme = useTheme();
  const [selected, setSelected] = useState(1);
  const [draft, setDraft] = useState<Stop[] | null>(null);
  const initial = useRef<Snapshot | null>(null);

  // Snapshot the settings when the editor opens, for Reset.
  if (isOpen && !initial.current) {
    initial.current = { palette: paletteData, gamma: palGamma, scale: palScale, max: palMax, bg: bgColor };
  }
  if (!isOpen && initial.current) initial.current = null;

  useEffect(() => {
    if (!isOpen) { setDraft(null); setSelected(1); }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const stops: Stop[] = draft ?? (paletteData as Stop[]);
  const sel = Math.max(0, Math.min(selected, stops.length - 1));
  const commit = (next: Stop[], nextSelected?: number) => {
    setDraft(null);
    onPaletteChange(next as Color[]);
    if (nextSelected !== undefined) setSelected(nextSelected);
  };

  const reset = () => {
    const s = initial.current;
    if (!s) return;
    commit(s.palette as Stop[]);
    onGammaChange(s.gamma);
    onScaleModeChange(s.scale);
    onPalMaxChange(s.max);
    onBgColorChange(s.bg);
  };

  const bgHex = toHex({ red: bgColor.r, green: bgColor.g, blue: bgColor.b });
  const gammaPct = ((palGamma - 0.1) / 2.4) * 100;

  return createPortal(
    <Scrim onClick={onClose}>
      <Dialog role="dialog" aria-modal="true" aria-labelledby="palette-title" onClick={e => e.stopPropagation()}>
        <Grab />
        <Header>
          <div className="id">
            <span className="mark"><Icon name="palette" size={19} /></span>
            <div>
              <h2 id="palette-title">Palette</h2>
              {subtitle && <p>{subtitle}</p>}
            </div>
          </div>
          <Close type="button" aria-label="Close" onClick={onClose}><Icon name="close" size={18} /></Close>
        </Header>

        <Body>
          <div>
            <Row style={{ marginBottom: 8 }}>
              <Label>Color ramp</Label>
              <Muted>{stops.length} stops</Muted>
            </Row>
            <ColorRamp stops={stops} selected={sel} onSelect={setSelected} onDraft={setDraft} onCommit={commit} touch={isMobile} />
          </div>

          <StopPicker
            color={stops[sel]} position={stops[sel].position} canDelete={!isEndStop(stops, sel) && stops.length > 2}
            horizontalHue={isMobile}
            onDraft={c => setDraft(setStopColor(stops, sel, c))}
            onCommit={c => commit(setStopColor(stops, sel, c))}
            onDelete={() => commit(removeStop(stops, sel), Math.max(0, sel - 1))}
          />

          <Section>
            <Label>Tone controls</Label>
            <ToneCard>
              <Row><span className="name">Gamma</span><span className="val">{palGamma.toFixed(2)}</span></Row>
              <SliderInput aria-label="Gamma" min={0.1} max={2.5} step={0.01} value={palGamma}
                onChange={e => onGammaChange(parseFloat(e.target.value))}
                style={{ "--val": `${gammaPct}%` } as React.CSSProperties} />
              <div className="marks"><span>0.10 (Darker)</span><span>1.00 (Linear)</span><span>2.50 (Brighter)</span></div>
            </ToneCard>
            <ToneCard>
              <Row style={{ flexWrap: "wrap" }}>
                <div>
                  <div className="name">Normalize</div>
                  <div className="desc">How brightness is scaled to the densest point</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Segmented ariaLabel="Normalize" variant="box" value={palScale ? "auto" : "manual"}
                    onChange={v => onScaleModeChange(v === "auto")}
                    options={[{ value: "auto", label: "Auto" }, { value: "manual", label: "Manual" }]} />
                  {!palScale && (
                    <MaxBox>Max
                      <input type="number" aria-label="Max" min={100} step={100} value={palMax}
                        onChange={e => onPalMaxChange(parseInt(e.target.value, 10) || 1000)} />
                    </MaxBox>
                  )}
                </div>
              </Row>
            </ToneCard>
          </Section>

          <Row style={{ borderTop: "1px solid rgba(61, 73, 76, 0.2)", paddingTop: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ font: `500 13px ${tokens.font.ui}` }}>Background</span>
              <BgSwatch title="Pick a custom background color">
                <span className="chip" style={{ background: bgHex }} />{bgHex}
                <input type="color" aria-label="Custom background color" value={bgHex.toLowerCase()}
                  onChange={e => { const c = fromHex(e.target.value); if (c) onBgColorChange({ r: c.red, g: c.green, b: c.blue }); }} />
              </BgSwatch>
            </div>
            <Segmented<BgMode> ariaLabel="Background preset" variant="pills" value={bgModeOf(bgColor)}
              onChange={m => onBgColorChange(bgColorFor(m, theme.bgPage))}
              options={[{ value: "void", label: "Void" }, { value: "ink", label: "Ink" }, { value: "paper", label: "Paper" }]} />
          </Row>
        </Body>

        <Footer>
          <ResetButton type="button" aria-label="Reset" onClick={reset}><Icon name="restart_alt" size={16} /> Reset</ResetButton>
          <DoneButton type="button" aria-label="Done" onClick={onClose}><Icon name="check" size={16} /> Done</DoneButton>
        </Footer>
      </Dialog>
    </Scrim>,
    document.body
  );
};

export default PaletteModal;
