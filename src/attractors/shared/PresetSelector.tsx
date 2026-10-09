import React from "react";
import styled from "styled-components";
import { SectionLabel } from "./styles";
import { tokens } from "../../theme/tokens";

interface PresetOption { value: string | number; label: string }
interface PresetSelectorProps {
  label: string;
  value: string | number;
  options: PresetOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

const Wrap = styled.div`margin-bottom: 16px;`;

const Row = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  scroll-snap-type: x proximity;
  &::-webkit-scrollbar { height: 3px; }
  &::-webkit-scrollbar-thumb { background: ${p => p.theme.hairlineStrong}; border-radius: 2px; }
`;

const Card = styled.button<{ $active: boolean }>`
  flex: 0 0 auto;
  scroll-snap-align: start;
  min-width: 96px;
  max-width: 140px;
  min-height: 44px;
  padding: 10px 12px;
  text-align: left;
  border-radius: ${tokens.radius.md};
  border: 1px solid ${p => (p.$active ? p.theme.primaryBorder : p.theme.hairline)};
  background: ${p => (p.$active ? p.theme.primarySoft : p.theme.surfaceLow)};
  box-shadow: ${p => (p.$active ? p.theme.glowPrimary : "none")};
  color: ${p => (p.$active ? p.theme.primary : p.theme.textHigh)};
  font: 500 12px/1.3 ${tokens.font.mono};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  &:disabled { opacity: 0.4; cursor: not-allowed; }
  &:focus-visible { outline: 2px solid ${p => p.theme.focusBorder}; }
`;

export const PresetSelector: React.FC<PresetSelectorProps> = ({ label, value, options, onChange, disabled = false }) => {
  const groupLabel = label === "Preset" ? "Presets" : label;
  return (
    <Wrap>
      <SectionLabel as="div">{groupLabel}</SectionLabel>
      <Row role="radiogroup" aria-label={groupLabel}>
        {options.map(o => {
          const active = String(o.value) === String(value);
          return (
            <Card key={o.value} type="button" role="radio" aria-checked={active} title={o.label}
              $active={active} disabled={disabled} onClick={() => !disabled && onChange(String(o.value))}>
              {o.label}
            </Card>
          );
        })}
      </Row>
    </Wrap>
  );
};

export default PresetSelector;
