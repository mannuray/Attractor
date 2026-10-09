import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { RGB, fromHex, hsvToRgb, rgbToHsv, toHex } from "../../lib/colorRamp";
import { Icon } from "../ui/Icon";
import { tokens } from "../../theme/tokens";

// theme-leak-ok: quick swatches are palette color data, not theme accents
const SWATCHES = ["#000000", "#0D2B5C", "#1E5A9C", "#68B5F6", "#4CD7F6", "#D0BCFF", "#FFB4AB", "#FFFFFF"]; // theme-leak-ok

const Card = styled.div`
  padding: 14px; border-radius: 12px; display: flex; flex-direction: column; gap: 12px;
  background: rgba(11, 14, 23, 0.8); border: 1px solid ${p => p.theme.hairline};
`;
const Head = styled.div`
  display: flex; align-items: center; justify-content: space-between; padding-bottom: 6px;
  border-bottom: 1px solid rgba(61, 73, 76, 0.15);
  .t { display: flex; align-items: center; gap: 8px; }
  .title { font: 600 12px/1rem ${tokens.font.mono}; text-transform: uppercase; letter-spacing: 0.04em; color: ${p => p.theme.primary}; }
  .pos { font: 400 11px/0.875rem ${tokens.font.mono}; color: ${p => p.theme.textLow}; }
`;
const DeleteButton = styled.button`
  display: inline-flex; align-items: center; gap: 4px; padding: 2px 6px; border-radius: 4px; cursor: pointer;
  background: transparent; border: none; color: #ffb4ab; font: 500 12px/1rem ${tokens.font.ui};
  &:hover:not(:disabled) { background: rgba(147, 0, 10, 0.2); }
  &:disabled { opacity: 0.35; cursor: not-allowed; }
  @media (max-width: ${tokens.breakpoint.mobileMax}px) { min-height: 40px; }
`;
const Grid = styled.div`
  display: flex; gap: 16px;
  @media (max-width: ${tokens.breakpoint.mobileMax}px) { flex-direction: column; gap: 14px; }
`;
const SV = styled.div`
  position: relative; width: 180px; height: 150px; flex-shrink: 0; border-radius: 8px; overflow: hidden;
  cursor: crosshair; touch-action: none; border: 1px solid rgba(255, 255, 255, 0.1);
  .w { position: absolute; inset: 0; background: linear-gradient(to right, #fff, transparent); }
  .b { position: absolute; inset: 0; background: linear-gradient(to top, #000, transparent); }
  .reticle {
    position: absolute; width: 14px; height: 14px; border-radius: 50%; transform: translate(-50%, -50%);
    border: 2px solid #fff; box-shadow: 0 0 4px rgba(0, 0, 0, 0.8); pointer-events: none;
  }
  @media (max-width: ${tokens.breakpoint.mobileMax}px) {
    width: 100%; height: 200px; border-radius: 12px;
    .reticle { width: 26px; height: 26px; border-width: 3px; }
  }
`;
const Hue = styled.div<{ $horizontal: boolean }>`
  position: relative; flex-shrink: 0; border-radius: 8px; cursor: pointer; touch-action: none;
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: ${p => (p.$horizontal ? "100%" : "20px")}; height: ${p => (p.$horizontal ? "28px" : "150px")};
  background: linear-gradient(${p => (p.$horizontal ? "to right" : "to bottom")}, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);
  border-radius: ${p => (p.$horizontal ? tokens.radius.full : "8px")};
  .h {
    position: absolute; pointer-events: none; border: 2px solid #fff; box-shadow: 0 0 3px rgba(0, 0, 0, 0.8);
    ${p => p.$horizontal
      ? "top: 50%; width: 26px; height: 26px; border-radius: 50%; transform: translate(-50%, -50%);"
      : "left: 0; right: 0; height: 8px; border-radius: 4px; transform: translateY(-50%);"}
  }
`;
const Fields = styled.div`flex: 1; display: flex; flex-direction: column; justify-content: space-between; gap: 10px; min-width: 0;`;
const SwatchRow = styled.div`display: flex; align-items: center; gap: 10px;`;
const Current = styled.div`
  width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.15); box-shadow: 0 0 12px -2px rgba(${p => p.theme.primaryContainerRgb}, 0.25);
`;
const FieldLabel = styled.label`
  display: block; margin-bottom: 2px; font: 400 10px/0.875rem ${tokens.font.mono};
  text-transform: uppercase; color: ${p => p.theme.textMid};
`;
const HexBox = styled.div`
  display: flex; align-items: center; padding: 4px 8px; border-radius: 8px;
  background: ${p => p.theme.surface}; border: 1px solid ${p => p.theme.hairlineStrong};
  &:focus-within { border-color: ${p => p.theme.primary}; }
  span { color: ${p => p.theme.textMid}; font: 400 12px ${tokens.font.mono}; margin-right: 2px; }
  input {
    width: 100%; min-width: 0; background: transparent; border: none; outline: none; text-transform: uppercase;
    color: ${p => p.theme.primary}; font: 500 12px/1rem ${tokens.font.mono};
  }
  @media (max-width: ${tokens.breakpoint.mobileMax}px) { min-height: 40px; input { font-size: 16px; } }
`;
const RGBRow = styled.div`display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;`;
const Num = styled.input`
  width: 100%; padding: 4px 6px; border-radius: 8px; text-align: center; outline: none;
  background: ${p => p.theme.surface}; border: 1px solid ${p => p.theme.hairlineStrong};
  color: ${p => p.theme.textHigh}; font: 400 12px/1rem ${tokens.font.mono};
  &:focus { border-color: ${p => p.theme.primary}; }
  -moz-appearance: textfield;
  &::-webkit-outer-spin-button, &::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
  @media (max-width: ${tokens.breakpoint.mobileMax}px) { min-height: 40px; font-size: 16px; }
`;
const Swatches = styled.div`display: grid; grid-template-columns: repeat(8, 1fr); gap: 6px;`;
const Swatch = styled.button<{ $active: boolean }>`
  height: 20px; border-radius: 6px; cursor: pointer; transition: transform 0.1s ease;
  border: 1px solid ${p => (p.$active ? p.theme.primary : "rgba(255, 255, 255, 0.1)")};
  box-shadow: ${p => (p.$active ? `0 0 0 1px rgba(${p.theme.primaryRgb}, 0.5)` : "none")};
  &:hover { transform: scale(1.1); }
  @media (max-width: ${tokens.breakpoint.mobileMax}px) { height: 32px; }
`;

interface Props {
  color: RGB;
  position: number;
  canDelete: boolean;
  horizontalHue?: boolean;
  /** Live preview while dragging (local only) */
  onDraft: (c: RGB) => void;
  /** Commit a finished edit */
  onCommit: (c: RGB) => void;
  onDelete: () => void;
}

export const StopPicker: React.FC<Props> = ({ color, position, canDelete, horizontalHue = false, onDraft, onCommit, onDelete }) => {
  const [hsv, setHsv] = useState(() => rgbToHsv(color));
  const [hexText, setHexText] = useState(toHex(color).slice(1));
  const svRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const drag = useRef<"sv" | "hue" | null>(null);
  const draftColor = useRef<RGB | null>(null);

  // Follow external color changes (another stop selected, swatch, typed value).
  useEffect(() => {
    if (drag.current) return;
    const cur = hsvToRgb(hsv.h, hsv.s, hsv.v);
    if (cur.red !== color.red || cur.green !== color.green || cur.blue !== color.blue) {
      const next = rgbToHsv(color);
      // keep hue when the color is grey (hue undefined)
      setHsv(next.s === 0 ? { ...next, h: hsv.h } : next);
    }
    setHexText(toHex(color).slice(1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color.red, color.green, color.blue]);

  // Current hsv lives in a ref too, so pointer handlers compute the next color outside of a
  // state updater (no side effects during render, and the committed color is never stale).
  const hsvRef = useRef(hsv);
  hsvRef.current = hsv;
  const apply = (next: { h: number; s: number; v: number }) => {
    hsvRef.current = next;
    setHsv(next);
    draftColor.current = hsvToRgb(next.h, next.s, next.v);
    onDraft(draftColor.current);
  };

  const fromPointer = (e: React.PointerEvent) => {
    if (drag.current === "sv" && svRef.current) {
      const r = svRef.current.getBoundingClientRect();
      const s = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      const v = 1 - Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
      apply({ ...hsvRef.current, s, v });
    } else if (drag.current === "hue" && hueRef.current) {
      const r = hueRef.current.getBoundingClientRect();
      const t = horizontalHue ? (e.clientX - r.left) / r.width : (e.clientY - r.top) / r.height;
      apply({ ...hsvRef.current, h: Math.min(359.9, Math.max(0, t * 360)) });
    }
  };
  const start = (kind: "sv" | "hue") => (e: React.PointerEvent) => {
    drag.current = kind;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
    fromPointer(e);
  };
  const end = () => {
    if (!drag.current) return;
    drag.current = null;
    if (draftColor.current) onCommit(draftColor.current);
    draftColor.current = null;
  };

  const commitHex = () => {
    const c = fromHex(hexText);
    if (c) onCommit(c);
    else setHexText(toHex(color).slice(1));
  };
  const setChannel = (k: keyof RGB) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = Math.max(0, Math.min(255, parseInt(e.target.value, 10) || 0));
    onCommit({ ...color, [k]: n });
  };

  const hueColor = toHex(hsvToRgb(hsv.h, 1, 1));
  const hex = toHex(color);

  return (
    <Card>
      <Head>
        <div className="t"><span className="title">Selected stop</span><span className="pos">Position {Math.round(position * 100)}%</span></div>
        <DeleteButton type="button" aria-label="Delete stop" disabled={!canDelete} onClick={onDelete}
          title={canDelete ? "Delete this stop" : "End stops can't be deleted"}>
          <Icon name="delete" size={14} /> Delete stop
        </DeleteButton>
      </Head>
      <Grid>
        <SV ref={svRef} style={{ backgroundColor: hueColor }} aria-label="Saturation and brightness"
          onPointerDown={start("sv")} onPointerMove={e => drag.current === "sv" && fromPointer(e)}
          onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end}>
          <div className="w" /><div className="b" />
          <div className="reticle" style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%` }} />
        </SV>
        <Hue ref={hueRef} $horizontal={horizontalHue} aria-label="Hue"
          onPointerDown={start("hue")} onPointerMove={e => drag.current === "hue" && fromPointer(e)}
          onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end}>
          <div className="h" style={horizontalHue ? { left: `${(hsv.h / 360) * 100}%`, background: hueColor } : { top: `${(hsv.h / 360) * 100}%` }} />
        </Hue>
        <Fields>
          <SwatchRow>
            <Current style={{ background: hex }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <FieldLabel htmlFor="stop-hex">HEX</FieldLabel>
              <HexBox>
                <span>#</span>
                <input id="stop-hex" aria-label="HEX" value={hexText} maxLength={7}
                  onChange={e => setHexText(e.target.value.replace(/^#/, ""))}
                  onBlur={commitHex} onKeyDown={e => { if (e.key === "Enter") commitHex(); }} />
              </HexBox>
            </div>
          </SwatchRow>
          <RGBRow>
            {(["red", "green", "blue"] as const).map(k => (
              <div key={k}>
                <FieldLabel htmlFor={`stop-${k}`}>{k[0].toUpperCase()}</FieldLabel>
                <Num id={`stop-${k}`} type="number" min={0} max={255} value={color[k]} onChange={setChannel(k)} />
              </div>
            ))}
          </RGBRow>
          <div>
            <FieldLabel as="span" style={{ textTransform: "none" }}>Quick swatches</FieldLabel>
            <Swatches>
              {SWATCHES.map(s => (
                <Swatch key={s} type="button" aria-label={`Use ${s}`} title={s} $active={s === hex}
                  style={{ background: s }} onClick={() => onCommit(fromHex(s)!)} />
              ))}
            </Swatches>
          </div>
        </Fields>
      </Grid>
    </Card>
  );
};
