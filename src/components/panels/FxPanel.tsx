import React, { useState } from "react";
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
  .top { display: flex; align-items: center; justify-content: space-between; font: 400 11px/0.875rem ${tokens.font.mono}; }
  .name { color: ${p => p.theme.textMid}; }
  .val { color: ${p => p.theme.primary}; }
`;

// `scale` converts the stored value to the number shown (e.g. 0.65 → 65 for "65%").
const ROWS: { key: keyof FxState; label: string; min: number; max: number; step: number; scale: number; unit: string; digits: number }[] = [
  { key: "vignette", label: "Vignette", min: 0, max: 1, step: 0.01, scale: 100, unit: "%", digits: 0 },
  { key: "grain", label: "Grain", min: 0, max: 0.5, step: 0.01, scale: 200, unit: "%", digits: 0 },
  { key: "bloom", label: "Bloom", min: 0, max: 1, step: 0.01, scale: 100, unit: "%", digits: 0 },
  { key: "exposure", label: "Exposure", min: 0.5, max: 3, step: 0.05, scale: 1, unit: "×", digits: 2 },
];

const ValueField = styled.input`
  width: 64px; height: 22px; padding: 0 6px; border-radius: 4px; text-align: right; outline: none;
  background: transparent; border: 1px solid transparent;
  font: 400 11px/0.875rem ${tokens.font.mono}; color: ${p => p.theme.primary};
  &:hover:not(:disabled) { border-color: ${p => p.theme.hairline}; }
  &:focus { background: ${p => p.theme.surface}; border-color: ${p => p.theme.focusBorder}; }
  &:disabled { cursor: not-allowed; }
  @media (max-width: ${tokens.breakpoint.mobileMax}px) { height: 32px; font-size: 16px; width: 80px; }
`;

const EditableValue: React.FC<{ row: (typeof ROWS)[number]; value: number; disabled: boolean; onCommit: (v: number) => void }> = ({ row, value, disabled, onCommit }) => {
  const shown = `${(value * row.scale).toFixed(row.digits)}${row.unit}`;
  const [text, setText] = useState<string | null>(null);
  const commit = () => {
    if (text === null) return;
    const n = parseFloat(text.replace(/[^0-9.+-]/g, ""));
    if (Number.isFinite(n)) {
      const v = Math.min(row.max, Math.max(row.min, n / row.scale));
      onCommit(Math.round(v * 1000) / 1000);
    }
    setText(null);
  };
  return (
    <ValueField aria-label={`${row.label} value`} disabled={disabled} value={text ?? shown}
      onFocus={() => setText((value * row.scale).toFixed(row.digits))}
      onChange={e => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={e => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") { e.stopPropagation(); setText(null); }
      }} />
  );
};

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
          <div className="top">
            <span className="name">{r.label}</span>
            <EditableValue row={r} value={v} disabled={!fx.enabled} onCommit={n => onChange({ [r.key]: n })} />
          </div>
          <SliderInput aria-label={r.label} min={r.min} max={r.max} step={r.step} value={v} disabled={!fx.enabled}
            onChange={e => onChange({ [r.key]: parseFloat(e.target.value) })}
            style={{ "--val": `${pct}%` } as React.CSSProperties} />
        </Row>
      );
    })}
  </div>
);
