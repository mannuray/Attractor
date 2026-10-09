import React from "react";
import styled from "styled-components";
import { ParameterInputCompact } from "../../attractors/shared/ParameterInput";
import { SectionLabel } from "../../attractors/shared/styles";

export interface FxState { enabled: boolean; bloom: number; grain: number; vignette: number; exposure: number }

const Row = styled.div`display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;`;
const Switch = styled.button<{ $on: boolean }>`
  width: 40px; height: 22px; border-radius: 11px; position: relative; cursor: pointer;
  border: 1px solid ${p => (p.$on ? p.theme.primaryBorder : p.theme.hairlineStrong)};
  background: ${p => (p.$on ? p.theme.primarySoft : p.theme.surface)};
  &::after {
    content: ""; position: absolute; top: 2px; left: ${p => (p.$on ? "20px" : "2px")};
    width: 16px; height: 16px; border-radius: 50%;
    background: ${p => (p.$on ? p.theme.primary : p.theme.textMid)};
    box-shadow: ${p => (p.$on ? p.theme.glowPrimary : "none")};
    transition: left 0.15s ease;
  }
`;

export const FxPanel: React.FC<{ fx: FxState; onChange: (patch: Partial<FxState>) => void }> = ({ fx, onChange }) => {
  const set = (k: keyof FxState) => (v: number) => onChange({ [k]: v });
  return (
    <div>
      <Row>
        <SectionLabel as="div" style={{ margin: 0 }}>Effects</SectionLabel>
        <Switch type="button" role="switch" aria-checked={fx.enabled} aria-label="Effects" $on={fx.enabled}
          onClick={() => onChange({ enabled: !fx.enabled })} />
      </Row>
      <ParameterInputCompact label="Vignette" value={fx.vignette} onChange={set("vignette")} min={0} max={1} step={0.01} disabled={!fx.enabled} />
      <ParameterInputCompact label="Grain" value={fx.grain} onChange={set("grain")} min={0} max={0.5} step={0.01} disabled={!fx.enabled} />
      <ParameterInputCompact label="Bloom" value={fx.bloom} onChange={set("bloom")} min={0} max={1} step={0.01} disabled={!fx.enabled} />
      <ParameterInputCompact label="Exposure" value={fx.exposure} onChange={set("exposure")} min={0.5} max={3} step={0.05} disabled={!fx.enabled} />
    </div>
  );
};
