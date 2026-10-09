import React from "react";
import styled from "styled-components";
import { Color } from "../../model-controller/Attractor/palette";
import { BgColor, BgMode, bgModeOf } from "../../lib/bgMode";
import { Segmented } from "../ui/Segmented";
import { SectionLabel } from "../../attractors/shared/styles";
import { tokens } from "../../theme/tokens";

export function paletteGradient(colors: Color[]): string {
  if (!colors.length) return "none";
  const stops = [...colors]
    .sort((a, b) => a.position - b.position)
    .map(c => `rgb(${c.red}, ${c.green}, ${c.blue}) ${Math.round(c.position * 100)}%`);
  return `linear-gradient(90deg, ${stops.join(", ")})`;
}

const Head = styled.div`display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;`;
const LinkButton = styled.button`
  background: none; border: none; padding: 0; cursor: pointer;
  font: 400 11px/0.875rem ${tokens.font.mono}; color: ${p => p.theme.primary};
  &:hover { text-decoration: underline; }
  @media (max-width: ${tokens.breakpoint.mobileMax}px) { min-height: 44px; }
`;
const Ribbon = styled.button<{ $bg: string }>`
  display: block; width: 100%; height: 16px; padding: 2px; cursor: pointer;
  border-radius: ${tokens.radius.full}; border: 1px solid rgba(255, 255, 255, 0.1);
  background: ${p => p.theme.surfaceLowest};
  &::after { content: ""; display: block; height: 100%; border-radius: ${tokens.radius.full}; background: ${p => p.$bg}; }
`;
const BgRow = styled.div`display: flex; align-items: center; justify-content: space-between; margin-top: 8px;`;
const BgLabel = styled.span`font: 400 12px/1rem ${tokens.font.ui}; color: ${p => p.theme.textMid};`;

interface Props { paletteData: Color[]; bgColor: BgColor; onBgModeChange: (m: BgMode) => void; onOpenPalette: () => void }

export const ColorPanel: React.FC<Props> = ({ paletteData, bgColor, onBgModeChange, onOpenPalette }) => (
  <div>
    <Head>
      <SectionLabel as="div" style={{ margin: 0 }}>Palette</SectionLabel>
      <LinkButton type="button" aria-label="Edit palette" onClick={onOpenPalette}>Edit palette</LinkButton>
    </Head>
    <Ribbon type="button" aria-label="Palette preview — open editor" $bg={paletteGradient(paletteData)} onClick={onOpenPalette} />
    <BgRow>
      <BgLabel>Background</BgLabel>
      <Segmented<BgMode> ariaLabel="Background" variant="pills" value={bgModeOf(bgColor)} onChange={onBgModeChange}
        options={[{ value: "void", label: "Void" }, { value: "ink", label: "Ink" }, { value: "paper", label: "Paper" }]} />
    </BgRow>
  </div>
);
