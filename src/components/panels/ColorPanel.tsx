import React from "react";
import styled from "styled-components";
import { Color } from "../../model-controller/Attractor/palette";
import { BgColor, BgMode, bgModeOf } from "../../lib/bgMode";
import { Segmented } from "../ui/Segmented";
import { IconButton } from "../ui/IconButton";
import { Icon } from "../ui/Icon";
import { SectionLabel } from "../../attractors/shared/styles";

export function paletteGradient(colors: Color[]): string {
  if (!colors.length) return "none";
  const stops = [...colors]
    .sort((a, b) => a.position - b.position)
    .map(c => `rgb(${c.red}, ${c.green}, ${c.blue}) ${Math.round(c.position * 100)}%`);
  return `linear-gradient(90deg, ${stops.join(", ")})`;
}

const Strip = styled.div<{ $bg: string }>`
  height: 14px; border-radius: 7px; margin-bottom: 10px;
  background: ${p => p.$bg}; border: 1px solid ${p => p.theme.hairline};
`;
const Header = styled.div`display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;`;

interface Props { paletteData: Color[]; bgColor: BgColor; onBgModeChange: (m: BgMode) => void; onOpenPalette: () => void }

export const ColorPanel: React.FC<Props> = ({ paletteData, bgColor, onBgModeChange, onOpenPalette }) => (
  <div>
    <Header>
      <SectionLabel as="div" style={{ margin: 0 }}>Palette</SectionLabel>
      <IconButton label="Edit palette" variant="soft" size="sm" onClick={onOpenPalette}>
        <Icon name="palette" size={16} /> Edit
      </IconButton>
    </Header>
    <Strip $bg={paletteGradient(paletteData)} />
    <SectionLabel as="div">Background</SectionLabel>
    <Segmented<BgMode> ariaLabel="Background" size="sm" value={bgModeOf(bgColor)} onChange={onBgModeChange}
      options={[{ value: "void", label: "Void" }, { value: "ink", label: "Ink" }, { value: "paper", label: "Paper" }]} />
  </div>
);
