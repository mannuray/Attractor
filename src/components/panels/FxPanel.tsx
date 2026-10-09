import React from "react";
import styled from "styled-components";
import { SectionLabel, SliderInput } from "../../attractors/shared/styles";
import { tokens } from "../../theme/tokens";

export interface FxState { enabled: boolean; bloom: number; grain: number; vignette: number; exposure: number }

const Head = styled.div`display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;`;
const Switch = styled.button<{ $on: boolean }>`
  width: 36px; height: 20px; border-radius: 10px; position: relative; cursor: pointer; flex-shrink: 0;
  border: 1px solid ${p => (p.$on ? p.theme.primaryBorder : p.theme.hairlineStrong)};
  background: ${p => (p.$on ? p.theme.primarySoft : p.theme.surfaceLowest)};
  &::after {
    content: ""; position: absolute; top: 2px; left: ${p => (p.$on ? "18px" : "2px")};
    width: 14px; height: 14px; border-radius: 50%;
    background: ${p => (p.$on ? p.theme.primary : p.theme.textLow)};
    box-shadow: ${p => (p.$on ? p.theme.glowPrimary : "none")};
    transition: left 0.15s ease;
  }
`;
const Row = styled.div<{ $disabled: boolean }>`
  display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px; opacity: ${p => (p.$disabled ? 0.45 : 1)};
  .top { display: flex; justify-content: space-between; font: 400 11px/0.875rem ${tokens.font.mono}; }
  .name { color: ${p => p.theme.textMid}; }
  .val { color: ${p => p.theme.primary}; }
`;

const ROWS: { key: keyof FxState; label: string; min: number; max: number; step: number; format: (v: number) => string }[] = [
  { key: "vignette", label: "Vignette", min: 0, max: 1, step: 0.01, format: v => `${Math.round(v * 100)}%` },
  { key: "grain", label: "Grain", min: 0, max: 0.5, step: 0.01, format: v => `${Math.round(v * 200)}%` },
  { key: "bloom", label: "Bloom", min: 0, max: 1, step: 0.01, format: v => `${Math.round(v * 100)}%` },
  { key: "exposure", label: "Exposure", min: 0.5, max: 3, step: 0.05, format: v => `${v.toFixed(2)}×` },
];

export const FxPanel: React.FC<{ fx: FxState; onChange: (patch: Partial<FxState>) => void }> = ({ fx, onChange }) => (
  <div>
    <Head>
      <SectionLabel as="div" style={{ margin: 0 }}>Effects</SectionLabel>
      <Switch type="button" role="switch" aria-checked={fx.enabled} aria-label="Effects" $on={fx.enabled}
        onClick={() => onChange({ enabled: !fx.enabled })} />
    </Head>
    {ROWS.map(r => {
      const v = fx[r.key] as number;
      const pct = ((v - r.min) / (r.max - r.min)) * 100;
      return (
        <Row key={r.key} $disabled={!fx.enabled}>
          <div className="top"><span className="name">{r.label}</span><span className="val">{r.format(v)}</span></div>
          <SliderInput aria-label={r.label} min={r.min} max={r.max} step={r.step} value={v} disabled={!fx.enabled}
            onChange={e => onChange({ [r.key]: parseFloat(e.target.value) })}
            style={{ "--val": `${pct}%` } as React.CSSProperties} />
        </Row>
      );
    })}
  </div>
);
