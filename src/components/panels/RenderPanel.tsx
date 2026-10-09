import React from "react";
import styled from "styled-components";
import { Segmented } from "../ui/Segmented";
import { SectionLabel } from "../../attractors/shared/styles";
import { tokens } from "../../theme/tokens";

const SIZES = [800, 1200, 1800, 2400, 3600, 4096];
const QUALITY = [1, 2, 3, 4];

const Row = styled.div`display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 10px;`;
const RowLabel = styled.span`font: 400 13px/1.25rem ${tokens.font.ui}; color: ${p => p.theme.textMid};`;

interface Props {
  canvasSize: number; onCanvasSizeChange: (n: number) => void;
  oversampling: number; onOversamplingChange: (n: number) => void;
}

export const RenderPanel: React.FC<Props> = ({ canvasSize, onCanvasSizeChange, oversampling, onOversamplingChange }) => (
  <div>
    <SectionLabel as="div">Canvas size (px)</SectionLabel>
    <Segmented ariaLabel="Size" columns={3} value={canvasSize} onChange={onCanvasSizeChange}
      options={SIZES.map(s => ({ value: s, label: String(s) }))} />
    <Row>
      <RowLabel>Quality</RowLabel>
      <Segmented ariaLabel="Quality" value={oversampling} onChange={onOversamplingChange}
        options={QUALITY.map(q => ({ value: q, label: `${q}×` }))} />
    </Row>
  </div>
);
