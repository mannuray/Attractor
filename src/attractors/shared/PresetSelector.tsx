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

// Decorative thumbnail tiles (Stitch preset ribbon); cycles by index.
const TILES = [
  { bg: "linear-gradient(135deg, #164e63, rgba(var(--accent-rgb), 0.3), #4c1d95)", glyph: "stream", color: "rgb(var(--accent-rgb))" },
  { bg: "linear-gradient(45deg, #3b0764, rgba(208, 188, 255, 0.3), #701a75)", glyph: "grain", color: "#d0bcff" },
  { bg: "linear-gradient(225deg, #451a03, rgba(202, 138, 4, 0.3), #4c0519)", glyph: "flare", color: "#fcd34d" },
  { bg: "linear-gradient(315deg, #020617, rgba(var(--accent-rgb), 0.2), #042f2e)", glyph: "cyclone", color: "rgb(var(--accent-rgb))" },
];

const Head = styled.div`display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;`;
const Count = styled.span`font: 400 11px/0.875rem ${tokens.font.mono}; color: ${p => p.theme.primary};`;
const Row = styled.div`
  --accent-rgb: ${p => p.theme.primaryRgb};
  display: flex; gap: 8px; overflow-x: auto; padding: 2px 0 6px;
  scroll-snap-type: x proximity; scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;
const Card = styled.button<{ $active: boolean }>`
  flex: 0 0 auto; width: 80px; padding: 6px; scroll-snap-align: start;
  display: flex; flex-direction: column; gap: 4px; text-align: left; cursor: pointer;
  border-radius: 8px;
  background: ${p => (p.$active ? "rgba(50, 52, 63, 0.9)" : "rgba(28, 31, 41, 0.6)")};
  border: 1px solid ${p => (p.$active ? p.theme.primaryBorder : p.theme.hairline)};
  box-shadow: ${p => (p.$active ? p.theme.glowPrimary : "none")};
  transition: background 0.15s ease;
  &:hover { background: ${p => p.theme.surfaceHigh}; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
  &:focus-visible { outline: 2px solid ${p => p.theme.focusBorder}; }
  .thumb { height: 40px; border-radius: 4px; display: grid; place-items: center; }
  .name {
    font: ${p => (p.$active ? 500 : 400)} 10px/0.875rem ${tokens.font.mono};
    color: ${p => (p.$active ? p.theme.primary : p.theme.textMid)};
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  @media (max-width: ${tokens.breakpoint.mobileMax}px) { width: 104px; .thumb { height: 48px; } .name { font-size: 12px; } }
`;

export const PresetSelector: React.FC<PresetSelectorProps> = ({ label, value, options, onChange, disabled = false }) => {
  const groupLabel = label === "Preset" ? "Presets" : label;
  return (
    <div style={{ marginBottom: 14 }}>
      <Head>
        <SectionLabel as="div" style={{ margin: 0 }}>{groupLabel}</SectionLabel>
        <Count>{options.length}</Count>
      </Head>
      <Row role="radiogroup" aria-label={groupLabel}>
        {options.map((o, i) => {
          const active = String(o.value) === String(value);
          const tile = TILES[i % TILES.length];
          return (
            <Card key={o.value} type="button" role="radio" aria-checked={active} aria-label={o.label} title={o.label}
              $active={active} disabled={disabled} onClick={() => !disabled && onChange(String(o.value))}>
              <span className="thumb" style={{ background: tile.bg }} aria-hidden="true">
                <span className="material-symbols-outlined" style={{ fontSize: 14, color: tile.color }}>{tile.glyph}</span>
              </span>
              <span className="name">{o.label}</span>
            </Card>
          );
        })}
      </Row>
    </div>
  );
};

export default PresetSelector;
